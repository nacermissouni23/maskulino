-- Money = products only (delivery fees go to the transporter).
-- Delivered = cash in: payment_status becomes 'encaisse' on livree.
-- Run once in Supabase SQL editor (or: node scripts/db.mjs run <env> 0011_money.sql).

create or replace function public.transition_order(
  p_order_id uuid, p_to order_status, p_meta jsonb default '{}'
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_o orders%rowtype;
  v_it order_items%rowtype;
  v_stock int;
begin
  select * into v_o from orders where id = p_order_id for update;
  if not found then raise exception 'NO_ORDER'; end if;
  if v_o.status = p_to then return; end if;

  if p_to = 'confirmee' and not v_o.stock_reserved then
    for v_it in select * from order_items where order_id = p_order_id loop
      if v_it.variant_id is not null then
        select stock into v_stock from product_variants
          where id = v_it.variant_id for update;
        if v_stock < v_it.qty then
          raise exception 'RUPTURE:%:%',
            (select size from product_variants where id = v_it.variant_id),
            (select color from product_variants where id = v_it.variant_id);
        end if;
        update product_variants set stock = stock - v_it.qty where id = v_it.variant_id;
        insert into stock_movements (variant_id, delta, reason)
          values (v_it.variant_id, -v_it.qty, 'vente');
      end if;
    end loop;
    update orders set stock_reserved = true where id = p_order_id;
  end if;

  if p_to in ('annulee','retournee') and v_o.stock_reserved then
    for v_it in select * from order_items where order_id = p_order_id loop
      if v_it.variant_id is not null then
        update product_variants set stock = stock + v_it.qty where id = v_it.variant_id;
        insert into stock_movements (variant_id, delta, reason)
          values (v_it.variant_id, v_it.qty, 'retour');
      end if;
    end loop;
    update orders set stock_reserved = false where id = p_order_id;
  end if;

  -- Customer counters + money: real orders only, products only (hors livraison).
  if not v_o.is_demo then
    if p_to = 'livree' then
      update customers set delivered_count = delivered_count + 1,
        total_spent = total_spent + (v_o.subtotal - v_o.discount) where phone = v_o.customer_phone;
    elsif p_to = 'annulee' then
      update customers set cancelled_count = cancelled_count + 1 where phone = v_o.customer_phone;
    elsif p_to = 'retournee' then
      update customers set returns_count = returns_count + 1 where phone = v_o.customer_phone;
    end if;
  end if;

  update orders set status = p_to,
    payment_status = case when p_to = 'livree' then 'encaisse' else payment_status end,
    carrier_id = coalesce((p_meta->>'carrier_id'), carrier_id),
    tracking = coalesce(nullif(p_meta->>'tracking',''), tracking),
    note = case when coalesce(p_meta->>'note','') <> '' then p_meta->>'note' else note end
    where id = p_order_id;

  insert into order_events (order_id, from_status, to_status, meta)
    values (p_order_id, v_o.status, p_to, coalesce(p_meta,'{}'));
end $$;

-- Backfill: delivered orders = cash collected.
update orders set payment_status = 'encaisse'
  where status = 'livree' and payment_status = 'en_attente';

-- Backfill: customer money counters, real delivered orders, products only.
update customers c set
  delivered_count = coalesce((select count(*) from orders o
    where o.customer_phone = c.phone and o.status = 'livree' and o.is_demo = false), 0),
  total_spent = coalesce((select sum(o.subtotal - o.discount) from orders o
    where o.customer_phone = c.phone and o.status = 'livree' and o.is_demo = false), 0);
