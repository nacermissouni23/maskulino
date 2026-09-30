-- Meta Pixel dataset ID, editable from admin Paramètres.
-- Run once in Supabase SQL editor (or: node scripts/db.mjs run <env> 0010_pixel.sql).
alter table shop_settings
  add column if not exists pixel_id text not null default '';
