-- Order push trigger via pg_net (bypasses Dashboard > Webhooks entirely).
-- Fires on every orders INSERT and POSTs to the Vercel fan-out route,
-- which sends the Telegram alert. Safe to re-run.
-- To rotate the secret: change it here AND in the Vercel PUSH_WEBHOOK_SECRET env.

create extension if not exists pg_net;

create or replace function public.notify_new_order()
returns trigger
language plpgsql
security definer
set search_path = public, net, pg_temp
as $$
begin
  perform net.http_post(
    url := 'https://maskulino.vercel.app/api/push/new-order',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', '22dc6822ea55b9a927b4016b22797e5306f29a8cf57568bb'
    ),
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  return new;
end $$;

drop trigger if exists order_push on orders;
create trigger order_push
  after insert on orders
  for each row execute function public.notify_new_order();
