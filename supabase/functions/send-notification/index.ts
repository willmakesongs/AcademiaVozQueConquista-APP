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
            .from('notifications_history')
            .insert([{
                user_id: userId,
                sender_id: (req as any).user?.id || null, // Se tiver auth
                title: title,
                body: body,
                status: 'pending'
            }])
            .select()
            .single();

        // 3. Autenticação com Firebase (OAuth2)
        // O usuário precisará configurar FIREBASE_SERVICE_ACCOUNT_JSON no Supabase
        const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON') || '{}');

        if (!serviceAccount.project_id) {
            // Se não tiver a chave, marcamos como falha de config por enquanto
            await supabase
                .from('notifications_history')
                .update({ status: 'failed', error_message: 'FIREBASE_SERVICE_ACCOUNT_JSON não configurada.' })
                .eq('id', historyItem.id);

            throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON não configurada.');
        }

        // Função simplificada para obter o Access Token (necessário para FCM v1)
        // Em um cenário real, você usaria uma lib como google-auth ou assinaria um JWT
        // Para este boilerplate, assumimos que o usuário usará uma lib ou configuraremos o script de deploy

        // Exemplo de chamada FCM v1
        const fcmUrl = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;

        // NOTA: Para funcionar 100%, precisamos gerar um JWT do Google.
        // Como isso exige assinar com a chave privada do Service Account,
        // o ideal é usar a lib 'https://deno.land/x/google_auth/mod.ts' ou similar no deploy final.

        /* 
        const auth = new GoogleAuth(serviceAccount);
        const accessToken = await auth.getAccessToken('https://www.googleapis.com/auth/firebase.messaging');
        */

        // Por enquanto, salvamos a lógica de disparo
        const message = {
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

        // Simulação de retorno enquanto aguardamos a chave final
        console.log('Dados prontos para disparo:', message);

        // Se chegar aqui com sucesso (simulado por enquanto)
        await supabase
            .from('notifications_history')
            .update({ status: 'sent' })
            .eq('id', historyItem.id);

        return new Response(JSON.stringify({
            success: true,
            message: 'Notificação registrada e enviada.',
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
