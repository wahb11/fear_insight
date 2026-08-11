import { Category, CategoryTree } from '@/types/categories'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getClient() {
  return createClient(supabaseUrl, supabaseKey)
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildCategoryTree(flat: Category[]): CategoryTree {
  const byId = new Map<string, Category>()
  for (const row of flat) {
    byId.set(row.id, { ...row, images: row.images || row.imgs || [], children: [] })
  }

  const roots: Category[] = []
  for (const cat of byId.values()) {
    if (cat.parent_id && byId.has(cat.parent_id)) {
      byId.get(cat.parent_id)!.children!.push(cat)
    } else if (!cat.parent_id) {
      roots.push(cat)
    }
  }

  const sortFn = (a: Category, b: Category) =>
    (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name)

  for (const cat of byId.values()) {
    cat.children?.sort(sortFn)
  }
  roots.sort(sortFn)
  return roots
}

export async function fetchAllCategories(opts?: {
  includeHidden?: boolean
}): Promise<Category[]> {
  const supabase = getClient()
  // Order by name first so legacy DBs (no sort_order) still work
  let query = supabase.from('categories').select('*').order('name', { ascending: true })
  if (!opts?.includeHidden) {
    query = query.eq('show', true)
  }
  const { data, error } = await query
  if (error) throw error
  const rows = (data || []) as Category[]
  return [...rows].sort(
    (a, b) =>
      (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
      a.name.localeCompare(b.name)
  )
}

export async function getCategoryTree(opts?: {
  includeHidden?: boolean
}): Promise<CategoryTree> {
  const flat = await fetchAllCategories(opts)
  return buildCategoryTree(flat)
}

export function findCategoryBySlug(flat: Category[], slug: string): Category | undefined {
  return flat.find((c) => c.slug === slug)
}

/** Parent + all descendant ids for product filtering */
export function collectCategoryIds(parent: Category): string[] {
  const ids = [parent.id]
  for (const child of parent.children || []) {
    ids.push(...collectCategoryIds(child))
  }
  return ids
}

export function getParentCategories(tree: CategoryTree): Category[] {
  return tree.filter((c) => !c.parent_id)
}

/** Hardcoded fallback when DB columns / seed not applied yet */
export const FALLBACK_CATEGORY_TREE: CategoryTree = [
  {
    id: 'fallback-fear',
    name: 'FEAR',
    slug: 'fear',
    tag: 'STATEMENT // BOLD',
    description:
      'High-impact designs that speak first — fearless graphics and presence you can feel.',
    images: ['/images/carousel-fear.jpg'],
    show: true,
    sort_order: 1,
    parent_id: null,
    children: [
      { id: 'fb-imp', name: 'IMPERMANENCE', slug: 'impermanence', images: [], show: true, parent_id: 'fallback-fear', sort_order: 1 },
      { id: 'fb-ref', name: 'REFLECTION', slug: 'reflection', images: [], show: true, parent_id: 'fallback-fear', sort_order: 2 },
      { id: 'fb-per', name: 'PERSPECTIVE', slug: 'perspective', images: [], show: true, parent_id: 'fallback-fear', sort_order: 3 },
      { id: 'fb-mar', name: 'MARGINALIA', slug: 'marginalia', images: [], show: true, parent_id: 'fallback-fear', sort_order: 4 },
    ],
  },
  {
    id: 'fallback-insignia',
    name: 'INSIGNIA',
    slug: 'insignia',
    tag: 'MARK // IDENTITY',
    description:
      'Marks of origin and identity — manifesto energy in clean, lasting silhouettes.',
    images: ['/images/carousel-signature.jpg'],
    show: true,
    sort_order: 2,
    parent_id: null,
    children: [
      { id: 'fb-ori', name: 'ORIGIN', slug: 'origin', images: [], show: true, parent_id: 'fallback-insignia', sort_order: 1 },
      { id: 'fb-man', name: 'MANIFESTO', slug: 'manifesto', images: [], show: true, parent_id: 'fallback-insignia', sort_order: 2 },
      { id: 'fb-sig', name: 'SIGNATURE', slug: 'signature', images: [], show: true, parent_id: 'fallback-insignia', sort_order: 3 },
      { id: 'fb-ext', name: 'EXTENDED', slug: 'extended', images: [], show: true, parent_id: 'fallback-insignia', sort_order: 4 },
    ],
  },
  {
    id: 'fallback-chronicles',
    name: 'CHRONICLES',
    slug: 'chronicles',
    tag: 'STORY // JOURNEY',
    description: 'Stories worn daily — faith, purpose, and growth woven into every piece.',
    images: ['/images/carousel-oversize.jpg'],
    show: true,
    sort_order: 3,
    parent_id: null,
    children: [
      { id: 'fb-ide', name: 'IDENTITY', slug: 'identity', images: [], show: true, parent_id: 'fallback-chronicles', sort_order: 1 },
      { id: 'fb-fai', name: 'FAITH', slug: 'faith', images: [], show: true, parent_id: 'fallback-chronicles', sort_order: 2 },
      { id: 'fb-pur', name: 'PURPOSE', slug: 'purpose', images: [], show: true, parent_id: 'fallback-chronicles', sort_order: 3 },
      { id: 'fb-gro', name: 'GROWTH', slug: 'growth', images: [], show: true, parent_id: 'fallback-chronicles', sort_order: 4 },
    ],
  },
  {
    id: 'fallback-oversized',
    name: 'OVERSIZED',
    slug: 'oversized',
    tag: 'VOLUME // RELAXED',
    description:
      'Roomier cuts and heavier drape — streetwear scale without sacrificing structure.',
    images: ['/images/carousel-oversize.jpg'],
    show: true,
    sort_order: 4,
    parent_id: null,
    children: [
      { id: 'fb-pre', name: 'PRESENCE', slug: 'presence', images: [], show: true, parent_id: 'fallback-oversized', sort_order: 1 },
      { id: 'fb-exp', name: 'EXPRESSION', slug: 'expression', images: [], show: true, parent_id: 'fallback-oversized', sort_order: 2 },
      { id: 'fb-rel', name: 'RELICS', slug: 'relics', images: [], show: true, parent_id: 'fallback-oversized', sort_order: 3 },
      { id: 'fb-ins', name: 'INSCRIPTIONS', slug: 'inscriptions', images: [], show: true, parent_id: 'fallback-oversized', sort_order: 4 },
    ],
  },
]
