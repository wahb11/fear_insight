-- Customer wishlist (run once in the Supabase SQL Editor)
-- Requires Email auth enabled: Authentication → Providers → Email

CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS wishlist_user_id_idx ON public.wishlist (user_id);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wishlist_select_own ON public.wishlist;
CREATE POLICY wishlist_select_own
  ON public.wishlist FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS wishlist_insert_own ON public.wishlist;
CREATE POLICY wishlist_insert_own
  ON public.wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS wishlist_delete_own ON public.wishlist;
CREATE POLICY wishlist_delete_own
  ON public.wishlist FOR DELETE
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON public.wishlist TO authenticated;
