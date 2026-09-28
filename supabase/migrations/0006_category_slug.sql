-- Category slugs for boutique routing (?cat=). Backfills known names.
alter table categories add column if not exists slug text unique;
update categories set slug = case name
  when 'T-shirts' then 'tshirts'
  when 'Chemises' then 'chemises'
  when 'Pantalons' then 'pantalons'
  when 'Jeans' then 'jeans'
  when 'Hoodies & Sweats' then 'hoodies'
  when 'Vestes & Manteaux' then 'vestes'
  when 'Ensembles' then 'ensembles'
  when 'Chaussures' then 'chaussures'
  when 'Accessoires' then 'accessoires'
  else lower(regexp_replace(name, '[^a-z0-9]+', '-', 'g'))
end where slug is null;
