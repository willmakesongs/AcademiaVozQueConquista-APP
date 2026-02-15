-- EXECUTAR NO SUPABASE SQL EDITOR
-- Substitua 'YOUR_SERVICE_ROLE_KEY' pela sua chave real (Project Settings > API > Service Role Secret)

SELECT cron.schedule(
  'process-notifications-every-minute', -- name of the cron job
  '* * * * *', -- every minute
  $$
  select
    net.http_post(
        url:='https://sedjnyryixudxmmkeoam.supabase.co/functions/v1/process-schedule',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
