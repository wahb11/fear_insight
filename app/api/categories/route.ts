import { NextRequest, NextResponse } from 'next/server'
import {
  buildCategoryTree,
  FALLBACK_CATEGORY_TREE,
  fetchAllCategories,
} from '@/lib/categories'

/** Public category tree for landing + shop (visible only). */
export async function GET(req: NextRequest) {
  try {
    const flatOnly = req.nextUrl.searchParams.get('flat') === '1'
    const flat = await fetchAllCategories({ includeHidden: false })

    // If hierarchy columns missing or seed not run, fall back
    const hasParents = flat.some((c) => !c.parent_id && c.slug && c.show !== false)
    if (!hasParents || flat.length === 0) {
      return NextResponse.json(
        flatOnly ? flattenFallback() : FALLBACK_CATEGORY_TREE
      )
    }

    // Prefer marketing parents (have slug, not legacy HOODIES)
    const marketing = flat.filter(
      (c) => c.slug && !['hoodies', 'oodies'].includes((c.slug || '').toLowerCase())
    )
    const tree = buildCategoryTree(marketing.length ? marketing : flat)
    const parents = tree.filter((c) => !c.parent_id)

    if (parents.length === 0) {
      return NextResponse.json(
        flatOnly ? flattenFallback() : FALLBACK_CATEGORY_TREE
      )
    }

    return NextResponse.json(flatOnly ? marketing : parents)
  } catch (error: any) {
    console.error('Public categories error:', error)
    return NextResponse.json(
      req.nextUrl.searchParams.get('flat') === '1'
        ? flattenFallback()
        : FALLBACK_CATEGORY_TREE
    )
  }
}

function flattenFallback() {
  const out: any[] = []
  for (const p of FALLBACK_CATEGORY_TREE) {
    out.push({ ...p, children: undefined })
    for (const c of p.children || []) out.push(c)
  }
  return out
}
