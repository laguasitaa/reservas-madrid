-- Programa el recordatorio de llegadas para correr todos los días a las
-- 07:00 UTC (~08:00-09:00 hora de Madrid según horario de verano/invierno).
-- Guarda la service role key en Vault (no queda en texto plano en el
-- historial de esta migración) y la usa para autenticar la llamada a la
-- Edge Function.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select
  cron.schedule(
    'arrival-reminders-daily',
    '0 7 * * *',
    $$
    select net.http_post(
      url := 'https://nxrvawxmeqxhmfqwvrej.supabase.co/functions/v1/arrival-reminders',
      headers := jsonb_build_object(
        'Authorization',
        'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
    $$
  );
