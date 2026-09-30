-- Hero section texts, editable from admin Paramètres → Accueil.
-- Run once in Supabase SQL editor (or: node scripts/db.mjs run <env> 0009_hero_settings.sql).
alter table shop_settings
  add column if not exists hero_title text not null default 'Votre style, notre univers';
alter table shop_settings
  add column if not exists hero_subtitle text not null default 'Des vêtements pour homme confortables et modernes, pour un look soigné au quotidien. Explorez nos collections et trouvez les pièces qui vous ressemblent.';
