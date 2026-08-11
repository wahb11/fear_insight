-- Add dedicated transparent cutout URL for the landing featured carousel.
-- Run once in the Supabase SQL Editor.

ALTER TABLE products
ADD COLUMN IF NOT EXISTS featured_image text;
