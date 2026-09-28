-- DEMO ONLY. Do NOT apply on prod. Wipe with: delete from orders where is_demo = true; + matching customers.
insert into campaigns (name, channel, product_slug, spend, visits) values
('Rentree-Sep','facebook','',45000,8400),('Pack-Automne','whatsapp','',0,900),
('Hoodie-Video3','tiktok','',28000,12000),('Cargo-Reel','instagram','',18000,5200),
('Bomber-Test','tiktok','',0,800) on conflict do nothing;

insert into customers (phone, name, wilaya_code, commune, orders_count) values
('0550123456','Yasmine B.',16,'Bab Ezzouar',1)
on conflict (phone) do nothing;
insert into orders (number, customer_phone, customer_name, wilaya_code, commune, subtotal, discount, delivery_fee, total, delivery_type, carrier_id, tracking, source, campaign_id, status, is_demo, created_at)
values ('MSK-1048','0550123456','Yasmine B.',16,'Bab Ezzouar',5800,0,400,6200,'domicile',null,'','instagram',
(select id from campaigns where name = 'Rentree-Sep'),'a_confirmer',true,'2026-09-27 10:24')
on conflict (number) do nothing;
insert into order_items (order_id, name, size, color, qty, unit_price)
select id, 'T-Shirt Oversize Noir','L','Noir',2,2900 from orders where number = 'MSK-1048'
on conflict do nothing;
insert into order_events (order_id, from_status, to_status)
select id, null, 'a_confirmer' from orders where number = 'MSK-1048' on conflict do nothing;

insert into customers (phone, name, wilaya_code, commune, orders_count) values
('0661457890','Mohamed L.',31,'Bir El Djir',1)
on conflict (phone) do nothing;
insert into orders (number, customer_phone, customer_name, wilaya_code, commune, subtotal, discount, delivery_fee, total, delivery_type, carrier_id, tracking, source, campaign_id, status, is_demo, created_at)
values ('MSK-1047','0661457890','Mohamed L.',31,'Bir El Djir',4490,0,500,4990,'domicile',null,'','facebook',
(select id from campaigns where name = 'Pack-Automne'),'a_confirmer',true,'2026-09-27 09:12')
on conflict (number) do nothing;
insert into order_items (order_id, name, size, color, qty, unit_price)
select id, 'Ensemble survêtement 2 pièces','XL','Noir',1,4490 from orders where number = 'MSK-1047'
on conflict do nothing;
insert into order_events (order_id, from_status, to_status)
select id, null, 'a_confirmer' from orders where number = 'MSK-1047' on conflict do nothing;

insert into customers (phone, name, wilaya_code, commune, orders_count) values
('0770221144','Amine K.',19,'El Eulma',1)
on conflict (phone) do nothing;
insert into orders (number, customer_phone, customer_name, wilaya_code, commune, subtotal, discount, delivery_fee, total, delivery_type, carrier_id, tracking, source, campaign_id, status, is_demo, created_at)
values ('MSK-1046','0770221144','Amine K.',19,'El Eulma',3490,0,300,3790,'domicile',null,'','tiktok',
(select id from campaigns where name = 'Hoodie-Video3'),'confirmee',true,'2026-09-27 08:40')
on conflict (number) do nothing;
insert into order_items (order_id, name, size, color, qty, unit_price)
select id, 'Hoodie Oversize Noir','M','Gris',1,3490 from orders where number = 'MSK-1046'
on conflict do nothing;
insert into order_events (order_id, from_status, to_status)
select id, null, 'confirmee' from orders where number = 'MSK-1046' on conflict do nothing;

insert into customers (phone, name, wilaya_code, commune, orders_count) values
('0555990011','Riyad M.',30,'Centre',1)
on conflict (phone) do nothing;
insert into orders (number, customer_phone, customer_name, wilaya_code, commune, subtotal, discount, delivery_fee, total, delivery_type, carrier_id, tracking, source, campaign_id, status, is_demo, created_at)
values ('MSK-1044','0555990011','Riyad M.',30,'Centre',3290,0,800,4090,'domicile',null,'','whatsapp',
null,'en_preparation',true,'2026-09-26 16:40')
on conflict (number) do nothing;
insert into order_items (order_id, name, size, color, qty, unit_price)
select id, 'Jean slim stretch brut','32','Brut',1,3290 from orders where number = 'MSK-1044'
on conflict do nothing;
insert into order_events (order_id, from_status, to_status)
select id, null, 'en_preparation' from orders where number = 'MSK-1044' on conflict do nothing;

insert into customers (phone, name, wilaya_code, commune, orders_count) values
('0662334455','Walid S.',25,'Ali Mendjeli',1)
on conflict (phone) do nothing;
insert into orders (number, customer_phone, customer_name, wilaya_code, commune, subtotal, discount, delivery_fee, total, delivery_type, carrier_id, tracking, source, campaign_id, status, is_demo, created_at)
values ('MSK-1041','0662334455','Walid S.',25,'Ali Mendjeli',2790,0,350,3140,'domicile','yalidine','YD123456789','facebook',
(select id from campaigns where name = 'Rentree-Sep'),'expediee',true,'2026-09-26 11:02')
on conflict (number) do nothing;
insert into order_items (order_id, name, size, color, qty, unit_price)
select id, 'Chemise Oxford bleu','L','Bleu',1,2790 from orders where number = 'MSK-1041'
on conflict do nothing;
insert into order_events (order_id, from_status, to_status)
select id, null, 'expediee' from orders where number = 'MSK-1041' on conflict do nothing;

insert into customers (phone, name, wilaya_code, commune, orders_count) values
('0551887766','Sofiane T.',9,'Centre',1)
on conflict (phone) do nothing;
insert into orders (number, customer_phone, customer_name, wilaya_code, commune, subtotal, discount, delivery_fee, total, delivery_type, carrier_id, tracking, source, campaign_id, status, is_demo, created_at)
values ('MSK-1039','0551887766','Sofiane T.',9,'Centre',2990,0,250,3240,'domicile','zr','ZR987654','instagram',
(select id from campaigns where name = 'Cargo-Reel'),'en_livraison',true,'2026-09-25 15:20')
on conflict (number) do nothing;
insert into order_items (order_id, name, size, color, qty, unit_price)
select id, 'Pantalon cargo kaki','32','Kaki',1,2990 from orders where number = 'MSK-1039'
on conflict do nothing;
insert into order_events (order_id, from_status, to_status)
select id, null, 'en_livraison' from orders where number = 'MSK-1039' on conflict do nothing;

insert into customers (phone, name, wilaya_code, commune, orders_count) values
('0771112233','Karim D.',16,'Draria',1)
on conflict (phone) do nothing;
insert into orders (number, customer_phone, customer_name, wilaya_code, commune, subtotal, discount, delivery_fee, total, delivery_type, carrier_id, tracking, source, campaign_id, status, is_demo, created_at)
values ('MSK-1035','0771112233','Karim D.',16,'Draria',1890,0,400,2290,'domicile','yalidine','YD111222333','direct',
null,'livree',true,'2026-09-24 12:00')
on conflict (number) do nothing;
insert into order_items (order_id, name, size, color, qty, unit_price)
select id, 'Lot 2 t-shirts blancs','XL','Blanc',1,1890 from orders where number = 'MSK-1035'
on conflict do nothing;
insert into order_events (order_id, from_status, to_status)
select id, null, 'livree' from orders where number = 'MSK-1035' on conflict do nothing;

insert into customers (phone, name, wilaya_code, commune, orders_count) values
('0550000001','Nassim H.',11,'Centre',1)
on conflict (phone) do nothing;
insert into orders (number, customer_phone, customer_name, wilaya_code, commune, subtotal, discount, delivery_fee, total, delivery_type, carrier_id, tracking, source, campaign_id, status, is_demo, created_at)
values ('MSK-1031','0550000001','Nassim H.',11,'Centre',5990,0,900,6890,'domicile','yalidine','YD555666','tiktok',
(select id from campaigns where name = 'Bomber-Test'),'retournee',true,'2026-09-24 09:00')
on conflict (number) do nothing;
insert into order_items (order_id, name, size, color, qty, unit_price)
select id, 'Veste bomber matelassée','L','Noir',1,5990 from orders where number = 'MSK-1031'
on conflict do nothing;
insert into order_events (order_id, from_status, to_status)
select id, null, 'retournee' from orders where number = 'MSK-1031' on conflict do nothing;

insert into customers (phone, name, wilaya_code, commune, orders_count) values
('0662001122','Bilal F.',23,'Centre',1)
on conflict (phone) do nothing;
insert into orders (number, customer_phone, customer_name, wilaya_code, commune, subtotal, discount, delivery_fee, total, delivery_type, carrier_id, tracking, source, campaign_id, status, is_demo, created_at)
values ('MSK-1028','0662001122','Bilal F.',23,'Centre',2890,0,600,3490,'domicile',null,'','facebook',
(select id from campaigns where name = 'Rentree-Sep'),'annulee',true,'2026-09-23 17:00')
on conflict (number) do nothing;
insert into order_items (order_id, name, size, color, qty, unit_price)
select id, 'Pull col rond beige','M','Beige',1,2890 from orders where number = 'MSK-1028'
on conflict do nothing;
insert into order_events (order_id, from_status, to_status)
select id, null, 'annulee' from orders where number = 'MSK-1028' on conflict do nothing;

select setval('order_number_seq', 1050);
