-- Maskulino schema v1: single-owner COD store. No customer logins.
-- All money/stock rules live here. Admin writes go through service-role
-- Server Actions; anon gets public reads + the create_order / tracking RPCs only.

-- ============ enums ============
create type order_status as enum (
  'a_confirmer','confirmee','en_preparation','expediee',
  'en_livraison','livree','annulee','retournee'
);
create type payment_status as enum ('en_attente','encaisse','reverse');
create type delivery_type as enum ('domicile','stopdesk');
create type source_type as enum ('facebook','instagram','tiktok','whatsapp','direct','autre');

-- ============ tables ============
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  sort int not null default 0
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  category_id uuid references categories(id) on delete set null,
  price int not null check (price >= 0),
  old_price int null check (old_price is null or old_price >= 0),
  status text not null default 'brouillon' check (status in ('brouillon','en_ligne','rupture')),
  principal_image_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  path text not null,
  color text not null default '',
  position int not null default 0
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null,
  color text not null,
  stock int not null default 0 check (stock >= 0),
  alert_threshold int not null default 5,
  unique (product_id, size, color)
);

create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants(id) on delete cascade,
  delta int not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table wilayas (
  code int primary key,
  name text not null,
  parent_code int null references wilayas(code)
);

create table carriers (
  id text primary key,
  name text not null,
  active boolean not null default true,
  custom boolean not null default false
);

create table carrier_prices (
  carrier_id text not null references carriers(id) on delete cascade,
  wilaya_code int not null references wilayas(code),
  home int not null check (home >= 0),
  stopdesk int null check (stopdesk is null or stopdesk >= 0),
  covered boolean not null default true,
  primary key (carrier_id, wilaya_code)
);

create table customers (
  phone text primary key,
  name text not null default '',
  wilaya_code int null references wilayas(code),
  commune text not null default '',
  address text not null default '',
  note text not null default '',
  orders_count int not null default 0,
  delivered_count int not null default 0,
  cancelled_count int not null default 0,
  returns_count int not null default 0,
  total_spent int not null default 0
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null default 'direct',
  product_slug text not null default '',
  spend int not null default 0,
  visits int not null default 0,
  starts_at date null,
  ends_at date null,
  created_at timestamptz not null default now()
);

create table promotions (
  id uuid primary key default gen_random_uuid(),
  code text unique null,
  name text not null,
  type text not null check (type in ('pourcentage','montant')),
  value int not null default 0,
  scope text not null default 'tous',
  starts_at date null,
  ends_at date null,
  active boolean not null default true
);

create sequence order_number_seq start 1050;

create table orders (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,
  customer_phone text not null references customers(phone),
  customer_name text not null default '',
  wilaya_code int null references wilayas(code),
  commune text not null default '',
  address text not null default '',
  landmark text not null default '',
  subtotal int not null default 0,
  discount int not null default 0,
  delivery_fee int not null default 0,
  total int not null default 0,
  payment_method text not null default 'cod',
  delivery_type delivery_type not null default 'domicile',
  carrier_id text null references carriers(id),
  tracking text not null default '',
  source source_type not null default 'direct',
  campaign_id uuid null references campaigns(id) on delete set null,
  status order_status not null default 'a_confirmer',
  payment_status payment_status not null default 'en_attente',
  stock_reserved boolean not null default false,
  note text not null default '',
  idempotency_key text unique null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid null references products(id) on delete set null,
  variant_id uuid null references product_variants(id) on delete set null,
  name text not null,
  size text not null default '',
  color text not null default '',
  qty int not null check (qty > 0),
  unit_price int not null check (unit_price >= 0)
);

create table order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  from_status order_status null,
  to_status order_status not null,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table shop_settings (
  id int primary key check (id = 1),
  name text not null default 'Maskulino',
  phone text not null default '',
  whatsapp text not null default '',
  domain text not null default '',
  facebook text not null default '',
  instagram text not null default '',
  tiktok text not null default '',
  address text not null default '',
  hours text not null default ''
);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  label text not null default '',
  created_at timestamptz not null default now()
);

create table telegram_chats (
  id uuid primary key default gen_random_uuid(),
  chat_id text unique not null,
  username text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table admin_actions (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table order_attempts (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  created_at timestamptz not null default now()
);
create index order_attempts_ip_time on order_attempts (ip, created_at);

-- ============ indexes ============
create index products_status on products (status);
create index product_images_product on product_images (product_id, position);
create index product_variants_product on product_variants (product_id);
create index orders_customer on orders (customer_phone);
create index orders_status on orders (status);
create index orders_created on orders (created_at desc);
create index order_events_order on order_events (order_id, created_at);
create index stock_movements_variant on stock_movements (variant_id, created_at desc);

-- ============ RLS: deny by default everywhere ============
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table stock_movements enable row level security;
alter table wilayas enable row level security;
alter table carriers enable row level security;
alter table carrier_prices enable row level security;
alter table customers enable row level security;
alter table campaigns enable row level security;
alter table promotions enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_events enable row level security;
alter table shop_settings enable row level security;
alter table push_subscriptions enable row level security;
alter table telegram_chats enable row level security;
alter table admin_actions enable row level security;
alter table order_attempts enable row level security;

revoke all on all tables in schema public from anon, authenticated;

-- ============ anon grants: public reads only ============
grant select on categories to anon;
grant select on wilayas to anon;
grant select on shop_settings to anon;
grant select on products to anon;
grant select on product_images to anon;
grant select on product_variants to anon;
grant select on carriers to anon;
grant select on carrier_prices to anon;
grant select on promotions to anon;

create policy "public categories" on categories for select to anon using (true);
create policy "public wilayas" on wilayas for select to anon using (true);
create policy "public settings" on shop_settings for select to anon using (true);
create policy "sellable products" on products for select to anon using (status = 'en_ligne');
create policy "images of sellable" on product_images for select to anon using (
  exists (select 1 from products p where p.id = product_id and p.status = 'en_ligne')
);
create policy "variants of sellable" on product_variants for select to anon using (
  exists (select 1 from products p where p.id = product_id and p.status = 'en_ligne')
);
create policy "active carriers" on carriers for select to anon using (active = true);
create policy "covered prices" on carrier_prices for select to anon using (
  covered = true and exists (select 1 from carriers c where c.id = carrier_id and c.active = true)
);
create policy "active promos" on promotions for select to anon using (active = true);

-- ============ helpers ============
create or replace function public.norm_phone(p text)
returns text language sql immutable as $$
  select case
    when length(regexp_replace(p, '\D', '', 'g')) = 12 and regexp_replace(p, '\D', '', 'g') like '213%'
      then '0' || substr(regexp_replace(p, '\D', '', 'g'), 4)
    else regexp_replace(p, '\D', '', 'g')
  end;
$$;

-- ============ create_order: the money path ============
create or replace function public.create_order(
  p_name text, p_phone text, p_wilaya int, p_commune text,
  p_address text, p_landmark text, p_delivery delivery_type,
  p_carrier text, p_items jsonb, p_source source_type,
  p_campaign text default null, p_promo text default null,
  p_idempotency text default null, p_ip text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_phone text := norm_phone(p_phone);
  v_subtotal int := 0;
  v_discount int := 0;
  v_fee int := 0;
  v_total int := 0;
  v_number text;
  v_order_id uuid;
  v_item jsonb;
  v_var product_variants%rowtype;
  v_prod products%rowtype;
  v_price carrier_prices%rowtype;
  v_promo promotions%rowtype;
  v_campaign_id uuid := null;
begin
  if p_ip is not null then
    insert into order_attempts (ip) values (p_ip);
    if (select count(*) from order_attempts
        where ip = p_ip and created_at > now() - interval '1 hour') > 30 then
      raise exception 'RATE_LIMITED';
    end if;
  end if;

  if p_idempotency is not null then
    select number, total into v_number, v_total from orders where idempotency_key = p_idempotency;
    if found then
      return jsonb_build_object('number', v_number, 'total', v_total, 'duplicate', true);
    end if;
  end if;

  if v_phone !~ '^0(5|6|7)[0-9]{8}$' then raise exception 'BAD_PHONE'; end if;
  if length(trim(p_name)) < 3 then raise exception 'BAD_NAME'; end if;
  if jsonb_array_length(p_items) < 1 then raise exception 'EMPTY_CART'; end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_var from product_variants where id = (v_item->>'variant_id')::uuid;
    if not found then raise exception 'BAD_VARIANT'; end if;
    select * into v_prod from products where id = v_var.product_id;
    if v_prod.status <> 'en_ligne' then raise exception 'NOT_SELLABLE'; end if;
    if (v_item->>'qty')::int < 1 then raise exception 'BAD_QTY'; end if;
    if v_var.stock < (v_item->>'qty')::int then
      raise exception 'RUPTURE:%:%', v_var.size, v_var.color;
    end if;
    v_subtotal := v_subtotal + v_prod.price * (v_item->>'qty')::int;
  end loop;

  select * into v_price from carrier_prices
    where carrier_id = p_carrier and wilaya_code = p_wilaya and covered = true;
  if not found then raise exception 'NON_COUVERT'; end if;
  v_fee := case when p_delivery = 'stopdesk' and v_price.stopdesk is not null
    then v_price.stopdesk else v_price.home end;

  if p_promo is not null and length(trim(p_promo)) > 0 then
    select * into v_promo from promotions
      where active = true and upper(code) = upper(trim(p_promo))
        and (starts_at is null or starts_at <= current_date)
        and (ends_at is null or ends_at >= current_date);
    if found then
      v_discount := case when v_promo.type = 'pourcentage'
        then round(v_subtotal * v_promo.value / 100.0)
        else least(v_promo.value, v_subtotal) end;
    end if;
  end if;

  if p_campaign is not null and length(trim(p_campaign)) > 0 then
    select id into v_campaign_id from campaigns where name = trim(p_campaign);
  end if;

  v_total := v_subtotal - v_discount + v_fee;
  v_number := 'MSK-' || nextval('order_number_seq')::text;

  insert into customers (phone, name, wilaya_code, commune, address)
    values (v_phone, trim(p_name), p_wilaya, trim(p_commune), trim(coalesce(p_address,'')))
    on conflict (phone) do update set
      name = excluded.name, wilaya_code = excluded.wilaya_code,
      commune = excluded.commune, address = excluded.address,
      orders_count = customers.orders_count + 1;

  insert into orders (number, customer_phone, customer_name, wilaya_code, commune,
      address, landmark, subtotal, discount, delivery_fee, total, delivery_type,
      carrier_id, source, campaign_id, idempotency_key)
    values (v_number, v_phone, trim(p_name), p_wilaya, trim(p_commune),
      trim(coalesce(p_address,'')), trim(coalesce(p_landmark,'')), v_subtotal, v_discount,
      v_fee, v_total, p_delivery, p_carrier, p_source, v_campaign_id, p_idempotency)
    returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_var from product_variants where id = (v_item->>'variant_id')::uuid;
    select * into v_prod from products where id = v_var.product_id;
    insert into order_items (order_id, product_id, variant_id, name, size, color, qty, unit_price)
      values (v_order_id, v_prod.id, v_var.id, v_prod.name, v_var.size, v_var.color,
        (v_item->>'qty')::int, v_prod.price);
  end loop;

  insert into order_events (order_id, from_status, to_status)
    values (v_order_id, null, 'a_confirmer');

  return jsonb_build_object('number', v_number, 'total', v_total, 'duplicate', false);
end $$;

-- ============ tracking lookup (number + phone, no enumeration) ============
create or replace function public.get_order_tracking(p_number text, p_phone text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_o orders%rowtype;
begin
  select * into v_o from orders
    where upper(number) = upper(trim(p_number))
      and customer_phone = norm_phone(p_phone);
  if not found then return null; end if;
  return jsonb_build_object(
    'number', v_o.number, 'status', v_o.status, 'total', v_o.total,
    'wilaya', v_o.wilaya_code, 'carrier', v_o.carrier_id, 'tracking', v_o.tracking,
    'created_at', v_o.created_at,
    'items', (select coalesce(jsonb_agg(jsonb_build_object(
        'name', name, 'size', size, 'color', color, 'qty', qty, 'unit_price', unit_price)
        order by name), '[]')
      from order_items where order_id = v_o.id),
    'events', (select coalesce(jsonb_agg(jsonb_build_object(
        'from', from_status, 'to', to_status, 'meta', meta, 'at', created_at)
        order by created_at), '[]')
      from order_events where order_id = v_o.id)
  );
end $$;

-- ============ transition_order: stock rules live here ============
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

  if p_to = 'livree' then
    update customers set delivered_count = delivered_count + 1,
      total_spent = total_spent + v_o.total where phone = v_o.customer_phone;
  elsif p_to = 'annulee' then
    update customers set cancelled_count = cancelled_count + 1 where phone = v_o.customer_phone;
  elsif p_to = 'retournee' then
    update customers set returns_count = returns_count + 1 where phone = v_o.customer_phone;
  end if;

  update orders set status = p_to,
    carrier_id = coalesce((p_meta->>'carrier_id'), carrier_id),
    tracking = coalesce(nullif(p_meta->>'tracking',''), tracking),
    note = case when coalesce(p_meta->>'note','') <> '' then p_meta->>'note' else note end
    where id = p_order_id;

  insert into order_events (order_id, from_status, to_status, meta)
    values (p_order_id, v_o.status, p_to, coalesce(p_meta,'{}'));
end $$;

-- ============ adjust_stock: manual edits with audit ============
create or replace function public.adjust_stock(
  p_variant_id uuid, p_new_stock int, p_reason text
) returns void
language plpgsql security definer set search_path = public as $$
declare v_cur int;
begin
  if p_new_stock < 0 then raise exception 'BAD_STOCK'; end if;
  select stock into v_cur from product_variants where id = p_variant_id for update;
  if not found then raise exception 'NO_VARIANT'; end if;
  update product_variants set stock = p_new_stock where id = p_variant_id;
  insert into stock_movements (variant_id, delta, reason)
    values (p_variant_id, p_new_stock - v_cur, p_reason);
end $$;
