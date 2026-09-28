-- Public product-images bucket. Reads are public by bucket setting;
-- writes are default-deny (no anon/authenticated insert policy) and go
-- through the service-role Server Actions only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
  array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880;
