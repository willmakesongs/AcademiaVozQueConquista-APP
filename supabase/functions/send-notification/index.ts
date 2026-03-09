import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { userId, title, body } = await req.json()

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Buscar o push_token do aluno
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('push_token')
            .eq('id', userId)
            .single();

        if (profileError || !profile?.push_token) {
            throw new Error('Push token não encontrado para este usuário.');
        }

        // 2. Registrar no Histórico (Início)
        const { data: historyItem, error: historyError } = await supabase
            .from('notification_history')
            .insert([{
                user_id: userId,
                title: title,
                body: body,
                status: 'sent', // Assumindo sucesso por padrão ou pending se for async real
                metadata: {
                    sender_id: (req as any).user?.id || null
                }
            }])
            .select()
            .single();

        // 3. Autenticação com Firebase (OAuth2)
        // O usuário precisará configurar FIREBASE_SERVICE_ACCOUNT_JSON no Supabase
        const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON') || '{}');

        if (!serviceAccount.project_id) {
            // Se não tiver a chave, marcamos como falha de config por enquanto
            await supabase
                .from('notification_history')
                .update({ status: 'failed', metadata: { error: 'FIREBASE_SERVICE_ACCOUNT_JSON não configurada.' } })
                .eq('id', historyItem.id);

            throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON não configurada.');
        }

        // Generate Access Token using google-auth-library
        const { JWT } = await import('npm:google-auth-library@9');

        const jwtClient = new JWT({
            email: serviceAccount.client_email,
            key: serviceAccount.private_key,
            scopes: ['https://www.googleapis.com/auth/firebase.messaging']
        });

        const tokens = await jwtClient.getAccessToken();
        const accessToken = tokens.token;

        if (!accessToken) {
            throw new Error('Falha ao obter access token do Google Firebase');
        }

        const fcmUrl = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;

        const messagePayload = {
            message: {
                token: profile.push_token,
                notification: {
                    title: title,
                    body: body,
                },
                webpush: {
                    fcm_options: {
                        link: "https://academia-vqc.firebaseapp.com"
                    }
                }
            }
        };

        const fcmResponse = await fetch(fcmUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messagePayload)
        });

        const fcmData = await fcmResponse.json();

        if (!fcmResponse.ok) {
            console.error("Erro do FCM:", fcmData);

            // Check if error is related to an invalid, stale, or unfound token
            const errorMessage = fcmData.error?.message || '';
            const isInvalidToken = errorMessage.includes('Requested entity was not found') ||
                errorMessage.includes('Invalid argument') ||
                errorMessage.includes('registration token');

            if (isInvalidToken) {
                console.log(`Token inválido detectado para usuário ${userId}. Removendo do perfil.`);
                // Clean up the invalid token from the profile
                await supabase
                    .from('profiles')
                    .update({ push_token: null })
                    .eq('id', userId);

                await supabase
                    .from('notification_history')
                    .update({ status: 'failed', metadata: { error: 'Token de notificação inválido ou expirado. O usuário precisa abrir o app novamente para registrar um novo token.' } })
                    .eq('id', historyItem.id);

                throw new Error('O dispositivo do aluno não está mais registrado para receber notificações. Peça para ele abrir o aplicativo novamente.');
            } else {
                await supabase
                    .from('notification_history')
                    .update({ status: 'failed', metadata: { error: fcmData } })
                    .eq('id', historyItem.id);

                throw new Error(`FCM Error: ${errorMessage || 'Erro desconhecido'}`);
            }
        }

        console.log('Notificação enviada com sucesso:', fcmData);

        await supabase
            .from('notification_history')
            .update({ status: 'sent', metadata: { fcm_response: fcmData } })
            .eq('id', historyItem.id);

        return new Response(JSON.stringify({
            success: true,
            message: 'Notificação enviada com sucesso.',
            history_id: historyItem.id
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })

    } catch (error: any) {
        console.error("Erro no envio:", error.message);
        return new Response(JSON.stringify({
            error: error.message
        }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
    }
})
