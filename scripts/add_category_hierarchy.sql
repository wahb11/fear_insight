-- Category hierarchy: parents + subcategories
-- Run once in the Supabase SQL Editor

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tag text DEFAULT '';

-- Unique slug (allow nulls for legacy rows until backfilled)
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_unique ON categories (slug)
  WHERE slug IS NOT NULL;

-- Hide legacy product buckets from marketing surfaces (keep for product FKs)
UPDATE categories
SET show = false,
    slug = COALESCE(slug, lower(replace(name, ' ', '-')))
WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);

-- ========== PARENTS ==========
INSERT INTO categories (id, name, description, images, show, parent_id, slug, sort_order, tag)
VALUES
(
  'a1000000-0000-4000-8000-000000000001',
  'FEAR',
  'High-impact designs that speak first — fearless graphics and presence you can feel.',
  ARRAY['/images/carousel-fear.jpg']::text[],
  true,
  NULL,
  'fear',
  1,
  'STATEMENT // BOLD'
),
(
  'a1000000-0000-4000-8000-000000000002',
  'INSIGNIA',
  'Marks of origin and identity — manifesto energy in clean, lasting silhouettes.',
  ARRAY['/images/carousel-signature.jpg']::text[],
  true,
  NULL,
  'insignia',
  2,
  'MARK // IDENTITY'
),
(
  'a1000000-0000-4000-8000-000000000003',
  'CHRONICLES',
  'Stories worn daily — faith, purpose, and growth woven into every piece.',
  ARRAY['/images/carousel-oversize.jpg']::text[],
  true,
  NULL,
  'chronicles',
  3,
  'STORY // JOURNEY'
),
(
  'a1000000-0000-4000-8000-000000000004',
  'OVERSIZED',
  'Roomier cuts and heavier drape — streetwear scale without sacrificing structure.',
  ARRAY['/images/carousel-oversize.jpg']::text[],
  true,
  NULL,
  'oversized',
  4,
  'VOLUME // RELAXED'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  show = EXCLUDED.show,
  parent_id = EXCLUDED.parent_id,
  slug = EXCLUDED.slug,
  sort_order = EXCLUDED.sort_order,
  tag = EXCLUDED.tag;

-- ========== FEAR SUBS ==========
INSERT INTO categories (id, name, description, images, show, parent_id, slug, sort_order, tag)
VALUES
('a2000000-0000-4000-8000-000000000001', 'IMPERMANENCE', 'Nothing lasts — wear the moment.', ARRAY[]::text[], true, 'a1000000-0000-4000-8000-000000000001', 'impermanence', 1, ''),
('a2000000-0000-4000-8000-000000000002', 'REFLECTION', 'Look inward. Move outward.', ARRAY[]::text[], true, 'a1000000-0000-4000-8000-000000000001', 'reflection', 2, ''),
('a2000000-0000-4000-8000-000000000003', 'PERSPECTIVE', 'Shift the frame. Change the view.', ARRAY[]::text[], true, 'a1000000-0000-4000-8000-000000000001', 'perspective', 3, ''),
('a2000000-0000-4000-8000-000000000004', 'MARGINALIA', 'Notes in the margins of the drop.', ARRAY[]::text[], true, 'a1000000-0000-4000-8000-000000000001', 'marginalia', 4, '')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, show = EXCLUDED.show,
  parent_id = EXCLUDED.parent_id, slug = EXCLUDED.slug, sort_order = EXCLUDED.sort_order;

-- ========== INSIGNIA SUBS ==========
INSERT INTO categories (id, name, description, images, show, parent_id, slug, sort_order, tag)
VALUES
('a2000000-0000-4000-8000-000000000011', 'ORIGIN', 'Where the mark begins.', ARRAY[]::text[], true, 'a1000000-0000-4000-8000-000000000002', 'origin', 1, ''),
('a2000000-0000-4000-8000-000000000012', 'MANIFESTO', 'Words made wearable.', ARRAY[]::text[], true, 'a1000000-0000-4000-8000-000000000002', 'manifesto', 2, ''),
('a2000000-0000-4000-8000-000000000013', 'SIGNATURE', 'The core insignia line.', ARRAY[]::text[], true, 'a1000000-0000-4000-8000-000000000002', 'signature', 3, ''),
('a2000000-0000-4000-8000-000000000014', 'EXTENDED', 'The mark, taken further.', ARRAY[]::text[], true, 'a1000000-0000-4000-8000-000000000002', 'extended', 4, '')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, show = EXCLUDED.show,
  parent_id = EXCLUDED.parent_id, slug = EXCLUDED.slug, sort_order = EXCLUDED.sort_order;

-- ========== CHRONICLES SUBS ==========
INSERT INTO categories (id, name, description, images, show, parent_id, slug, sort_order, tag)
VALUES
('a2000000-0000-4000-8000-000000000021', 'IDENTITY', 'Who you are in the cloth.', ARRAY[]::text[], true, 'a1000000-0000-4000-8000-000000000003', 'identity', 1, ''),
('a2000000-0000-4000-8000-000000000022', 'FAITH', 'Belief stitched in.', ARRAY[]::text[], true, 'a1000000-0000-4000-8000-000000000003', 'faith', 2, ''),
('a2000000-0000-4000-8000-000000000023', 'PURPOSE', 'Worn with intention.', ARRAY[]::text[], true, 'a1000000-0000-4000-8000-000000000003', 'purpose', 3, ''),
('a2000000-0000-4000-8000-000000000024', 'GROWTH', 'The next chapter.', ARRAY[]::text[], true, 'a1000000-0000-4000-8000-000000000003', 'growth', 4, '')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, show = EXCLUDED.show,
  parent_id = EXCLUDED.parent_id, slug = EXCLUDED.slug, sort_order = EXCLUDED.sort_order;

-- ========== OVERSIZED SUBS ==========
INSERT INTO categories (id, name, description, images, show, parent_id, slug, sort_order, tag)
VALUES
('a2000000-0000-4000-8000-000000000031', 'PRESENCE', 'Fill the space.', ARRAY[]::text[], true, 'a1000000-0000-4000-8000-000000000004', 'presence', 1, ''),
('a2000000-0000-4000-8000-000000000032', 'EXPRESSION', 'Volume with a voice.', ARRAY[]::text[], true, 'a1000000-0000-4000-8000-000000000004', 'expression', 2, ''),
('a2000000-0000-4000-8000-000000000033', 'RELICS', 'Heavy pieces, lasting form.', ARRAY[]::text[], true, 'a1000000-0000-4000-8000-000000000004', 'relics', 3, ''),
('a2000000-0000-4000-8000-000000000034', 'INSCRIPTIONS', 'Words at oversized scale.', ARRAY[]::text[], true, 'a1000000-0000-4000-8000-000000000004', 'inscriptions', 4, '')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, show = EXCLUDED.show,
  parent_id = EXCLUDED.parent_id, slug = EXCLUDED.slug, sort_order = EXCLUDED.sort_order;
