-- Optional: allow authenticated service uploads to the public "products" bucket.
-- Admin product uploads in this app use SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
-- Run this only if you want additional Storage policies for other clients.

-- Public read (bucket is already public; this is belt-and-suspenders)
create policy if not exists "Public read products"
on storage.objects for select
using (bucket_id = 'products');

-- NOTE: Do NOT grant anon INSERT on this bucket in production.
-- Product image uploads must go through the admin API with the service role key.
