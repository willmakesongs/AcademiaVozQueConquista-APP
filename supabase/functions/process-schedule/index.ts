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
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Buscar notificações agendadas pendentes
        const now = new Date().toISOString();
        const { data: schedules, error: fetchError } = await supabase
            .from('scheduled_notifications')
            .select('*')
            .eq('is_active', true)
            .lte('next_run_at', now);

        if (fetchError) throw fetchError;

        const results = [];

        for (const schedule of schedules || []) {
            // 2. Disparar a notificação (invocando a outra função)
            // Usamos a função send-notification para reaproveitar lógica e logging
            const { data: invokeData, error: invokeError } = await supabase.functions.invoke('send-notification', {
                body: {
                    userId: schedule.user_id,
                    title: schedule.title,
                    body: schedule.body,
                }
            });

            if (invokeError) {
                console.error(`Falha ao disparar agendamento ${schedule.id}:`, invokeError);
                results.push({ id: schedule.id, status: 'failed', error: invokeError });
                continue;
            }

            // 3. Calcular próxima execução ou finalizar
            let updates: any = {};
            const currentRun = new Date(schedule.next_run_at);
            let nextRun = new Date(currentRun);

            switch (schedule.recurrence) {
                case 'daily':
                    nextRun.setDate(currentRun.getDate() + 1);
                    break;
                case 'weekly':
                    nextRun.setDate(currentRun.getDate() + 7);
                    break;
                case 'biweekly':
                    nextRun.setDate(currentRun.getDate() + 14);
                    break;
                case 'monthly':
                    nextRun.setMonth(currentRun.getMonth() + 1);
                    break;
                case 'once':
                default:
                    updates.is_active = false;
                    break;
            }

            if (schedule.recurrence !== 'once') {
                updates.next_run_at = nextRun.toISOString();
            }

            // 4. Atualizar o agendamento
            const { error: updateError } = await supabase
                .from('scheduled_notifications')
                .update(updates)
                .eq('id', schedule.id);

            if (updateError) {
                console.error(`Erro ao atualizar agendamento ${schedule.id}:`, updateError);
                results.push({ id: schedule.id, status: 'update_failed', error: updateError });
            } else {
                results.push({ id: schedule.id, status: 'processed', next_run: updates.next_run_at || 'completed' });
            }
        }

        return new Response(JSON.stringify({
            success: true,
            processed: results.length,
            details: results
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })

    } catch (error: any) {
        console.error("Erro no processamento:", error.message);
        return new Response(JSON.stringify({
            error: error.message
        }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
    }
})
