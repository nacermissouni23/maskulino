-- Seed: catalog (idempotent by slug). Re-run safe.
insert into products (slug, name, description, category_id, price, old_price, status, principal_image_url)
select 'hoodie-oversize-noir','Sweat à capuche oversize noir premium','Sweat épais 400 g, coton dense, coupe oversize.',c.id,3490,4490,'en_ligne','https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'
from categories c where c.name = 'Hoodies & Sweats'
on conflict (slug) do update set name = excluded.name, description = excluded.description,
  price = excluded.price, old_price = excluded.old_price, principal_image_url = excluded.principal_image_url;
insert into product_images (product_id, path, color, position)
select id, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', '', 0 from products where slug = 'hoodie-oversize-noir'
on conflict do nothing;
insert into product_images (product_id, path, color, position)
select id, 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800&q=80', '', 1 from products where slug = 'hoodie-oversize-noir'
on conflict do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'M', 'Noir', 3 from products where slug = 'hoodie-oversize-noir'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'M', 'Gris', 3 from products where slug = 'hoodie-oversize-noir'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'M', 'Beige', 3 from products where slug = 'hoodie-oversize-noir'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'L', 'Noir', 3 from products where slug = 'hoodie-oversize-noir'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'L', 'Gris', 3 from products where slug = 'hoodie-oversize-noir'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'L', 'Beige', 3 from products where slug = 'hoodie-oversize-noir'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XL', 'Noir', 3 from products where slug = 'hoodie-oversize-noir'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XL', 'Gris', 3 from products where slug = 'hoodie-oversize-noir'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XL', 'Beige', 3 from products where slug = 'hoodie-oversize-noir'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XXL', 'Noir', 3 from products where slug = 'hoodie-oversize-noir'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XXL', 'Gris', 2 from products where slug = 'hoodie-oversize-noir'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XXL', 'Beige', 2 from products where slug = 'hoodie-oversize-noir'
on conflict (product_id, size, color) do nothing;

insert into products (slug, name, description, category_id, price, old_price, status, principal_image_url)
select 'tshirt-essentiel-blanc','Lot de 2 t-shirts essentiels blancs','Lot de 2 t-shirts 100 % coton.',c.id,1890,2490,'en_ligne','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'
from categories c where c.name = 'T-shirts'
on conflict (slug) do update set name = excluded.name, description = excluded.description,
  price = excluded.price, old_price = excluded.old_price, principal_image_url = excluded.principal_image_url;
insert into product_images (product_id, path, color, position)
select id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', '', 0 from products where slug = 'tshirt-essentiel-blanc'
on conflict do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'S', 'Blanc', 12 from products where slug = 'tshirt-essentiel-blanc'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'S', 'Noir', 12 from products where slug = 'tshirt-essentiel-blanc'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'M', 'Blanc', 12 from products where slug = 'tshirt-essentiel-blanc'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'M', 'Noir', 12 from products where slug = 'tshirt-essentiel-blanc'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'L', 'Blanc', 12 from products where slug = 'tshirt-essentiel-blanc'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'L', 'Noir', 12 from products where slug = 'tshirt-essentiel-blanc'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XL', 'Blanc', 12 from products where slug = 'tshirt-essentiel-blanc'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XL', 'Noir', 12 from products where slug = 'tshirt-essentiel-blanc'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XXL', 'Blanc', 12 from products where slug = 'tshirt-essentiel-blanc'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XXL', 'Noir', 12 from products where slug = 'tshirt-essentiel-blanc'
on conflict (product_id, size, color) do nothing;

insert into products (slug, name, description, category_id, price, old_price, status, principal_image_url)
select 'chemise-oxford-bleu','Chemise Oxford bleu ciel','Chemise Oxford élégante.',c.id,2790,null,'en_ligne','https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80'
from categories c where c.name = 'Chemises'
on conflict (slug) do update set name = excluded.name, description = excluded.description,
  price = excluded.price, old_price = excluded.old_price, principal_image_url = excluded.principal_image_url;
insert into product_images (product_id, path, color, position)
select id, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', '', 0 from products where slug = 'chemise-oxford-bleu'
on conflict do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'M', 'Bleu', 8 from products where slug = 'chemise-oxford-bleu'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'M', 'Blanc', 8 from products where slug = 'chemise-oxford-bleu'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'L', 'Bleu', 8 from products where slug = 'chemise-oxford-bleu'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'L', 'Blanc', 7 from products where slug = 'chemise-oxford-bleu'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XL', 'Bleu', 7 from products where slug = 'chemise-oxford-bleu'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XL', 'Blanc', 7 from products where slug = 'chemise-oxford-bleu'
on conflict (product_id, size, color) do nothing;

insert into products (slug, name, description, category_id, price, old_price, status, principal_image_url)
select 'jean-slim-stretch','Jean slim stretch brut','Denim stretch confortable.',c.id,3290,3990,'en_ligne','https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80'
from categories c where c.name = 'Jeans'
on conflict (slug) do update set name = excluded.name, description = excluded.description,
  price = excluded.price, old_price = excluded.old_price, principal_image_url = excluded.principal_image_url;
insert into product_images (product_id, path, color, position)
select id, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80', '', 0 from products where slug = 'jean-slim-stretch'
on conflict do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '30', 'Brut', 5 from products where slug = 'jean-slim-stretch'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '30', 'Noir', 5 from products where slug = 'jean-slim-stretch'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '31', 'Brut', 5 from products where slug = 'jean-slim-stretch'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '31', 'Noir', 5 from products where slug = 'jean-slim-stretch'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '32', 'Brut', 5 from products where slug = 'jean-slim-stretch'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '32', 'Noir', 5 from products where slug = 'jean-slim-stretch'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '33', 'Brut', 5 from products where slug = 'jean-slim-stretch'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '33', 'Noir', 5 from products where slug = 'jean-slim-stretch'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '34', 'Brut', 5 from products where slug = 'jean-slim-stretch'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '34', 'Noir', 5 from products where slug = 'jean-slim-stretch'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '36', 'Brut', 5 from products where slug = 'jean-slim-stretch'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '36', 'Noir', 5 from products where slug = 'jean-slim-stretch'
on conflict (product_id, size, color) do nothing;

insert into products (slug, name, description, category_id, price, old_price, status, principal_image_url)
select 'ensemble-survetement','Ensemble de survêtement 2 pièces','Veste zippée + pantalon cargo.',c.id,4490,5990,'en_ligne','https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800&q=80'
from categories c where c.name = 'Ensembles'
on conflict (slug) do update set name = excluded.name, description = excluded.description,
  price = excluded.price, old_price = excluded.old_price, principal_image_url = excluded.principal_image_url;
insert into product_images (product_id, path, color, position)
select id, 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800&q=80', '', 0 from products where slug = 'ensemble-survetement'
on conflict do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'M', 'Noir', 3 from products where slug = 'ensemble-survetement'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'M', 'Gris', 3 from products where slug = 'ensemble-survetement'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'M', 'Vert', 3 from products where slug = 'ensemble-survetement'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'L', 'Noir', 3 from products where slug = 'ensemble-survetement'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'L', 'Gris', 2 from products where slug = 'ensemble-survetement'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'L', 'Vert', 2 from products where slug = 'ensemble-survetement'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XL', 'Noir', 2 from products where slug = 'ensemble-survetement'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XL', 'Gris', 2 from products where slug = 'ensemble-survetement'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XL', 'Vert', 2 from products where slug = 'ensemble-survetement'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XXL', 'Noir', 2 from products where slug = 'ensemble-survetement'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XXL', 'Gris', 2 from products where slug = 'ensemble-survetement'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XXL', 'Vert', 2 from products where slug = 'ensemble-survetement'
on conflict (product_id, size, color) do nothing;

insert into products (slug, name, description, category_id, price, old_price, status, principal_image_url)
select 'veste-bomber','Veste bomber matelassée','Bomber chaud et doublé.',c.id,5990,7990,'en_ligne','https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'
from categories c where c.name = 'Vestes & Manteaux'
on conflict (slug) do update set name = excluded.name, description = excluded.description,
  price = excluded.price, old_price = excluded.old_price, principal_image_url = excluded.principal_image_url;
insert into product_images (product_id, path, color, position)
select id, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', '', 0 from products where slug = 'veste-bomber'
on conflict do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'M', 'Noir', 2 from products where slug = 'veste-bomber'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'M', 'Kaki', 2 from products where slug = 'veste-bomber'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'L', 'Noir', 2 from products where slug = 'veste-bomber'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'L', 'Kaki', 2 from products where slug = 'veste-bomber'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XL', 'Noir', 2 from products where slug = 'veste-bomber'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XL', 'Kaki', 2 from products where slug = 'veste-bomber'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XXL', 'Noir', 2 from products where slug = 'veste-bomber'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XXL', 'Kaki', 1 from products where slug = 'veste-bomber'
on conflict (product_id, size, color) do nothing;

insert into products (slug, name, description, category_id, price, old_price, status, principal_image_url)
select 'pull-col-ronde','Pull à col rond beige','Pull doux en maille fine.',c.id,2890,null,'en_ligne','https://images.unsplash.com/photo-1610384104075-e05c8cf200c3?w=800&q=80'
from categories c where c.name = 'Hoodies & Sweats'
on conflict (slug) do update set name = excluded.name, description = excluded.description,
  price = excluded.price, old_price = excluded.old_price, principal_image_url = excluded.principal_image_url;
insert into product_images (product_id, path, color, position)
select id, 'https://images.unsplash.com/photo-1610384104075-e05c8cf200c3?w=800&q=80', '', 0 from products where slug = 'pull-col-ronde'
on conflict do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'M', 'Beige', 9 from products where slug = 'pull-col-ronde'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'M', 'Marron', 9 from products where slug = 'pull-col-ronde'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'L', 'Beige', 8 from products where slug = 'pull-col-ronde'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'L', 'Marron', 8 from products where slug = 'pull-col-ronde'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XL', 'Beige', 8 from products where slug = 'pull-col-ronde'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, 'XL', 'Marron', 8 from products where slug = 'pull-col-ronde'
on conflict (product_id, size, color) do nothing;

insert into products (slug, name, description, category_id, price, old_price, status, principal_image_url)
select 'pantalon-cargo','Pantalon cargo kaki','Cargo 6 poches.',c.id,2990,null,'en_ligne','https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80'
from categories c where c.name = 'Jeans'
on conflict (slug) do update set name = excluded.name, description = excluded.description,
  price = excluded.price, old_price = excluded.old_price, principal_image_url = excluded.principal_image_url;
insert into product_images (product_id, path, color, position)
select id, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80', '', 0 from products where slug = 'pantalon-cargo'
on conflict do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '30', 'Kaki', 9 from products where slug = 'pantalon-cargo'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '30', 'Noir', 9 from products where slug = 'pantalon-cargo'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '32', 'Kaki', 9 from products where slug = 'pantalon-cargo'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '32', 'Noir', 9 from products where slug = 'pantalon-cargo'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '34', 'Kaki', 9 from products where slug = 'pantalon-cargo'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '34', 'Noir', 9 from products where slug = 'pantalon-cargo'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '36', 'Kaki', 8 from products where slug = 'pantalon-cargo'
on conflict (product_id, size, color) do nothing;
insert into product_variants (product_id, size, color, stock)
select id, '36', 'Noir', 8 from products where slug = 'pantalon-cargo'
on conflict (product_id, size, color) do nothing;

