-- Public tracking by order number only (single input UI).
-- Returns no PII: no phone, no name, no address.
create or replace function public.get_public_tracking(p_number text, p_ip text default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_o orders%rowtype;
begin
  if p_ip is not null then
    insert into order_attempts (ip) values ('track:' || p_ip);
    if (select count(*) from order_attempts
        where ip = 'track:' || p_ip and created_at > now() - interval '1 hour') > 60 then
      raise exception 'RATE_LIMITED';
    end if;
  end if;
  select * into v_o from orders where upper(number) = upper(trim(p_number));
  if not found then return null; end if;
  return jsonb_build_object(
    'number', v_o.number, 'status', v_o.status, 'total', v_o.total,
    'wilaya', (select name from wilayas where code = v_o.wilaya_code),
    'carrier', (select name from carriers where id = v_o.carrier_id),
    'tracking', v_o.tracking, 'created_at', v_o.created_at,
    'items', (select coalesce(jsonb_agg(jsonb_build_object(
        'name', name, 'size', size, 'color', color, 'qty', qty)
        order by name), '[]')
      from order_items where order_id = v_o.id),
    'events', (select coalesce(jsonb_agg(jsonb_build_object(
        'from', from_status, 'to', to_status, 'at', created_at)
        order by created_at), '[]')
      from order_events where order_id = v_o.id)
  );
end $$;
