import { Product } from '@/types/products'
import { Category, CategoryTree } from '@/types/categories'
import { collectCategoryIds, FALLBACK_CATEGORY_TREE } from '@/lib/categories'

export type CollectionKey = 'fear' | 'insignia' | 'chronicles' | 'oversized'

export const COLLECTION_META: Record<
  CollectionKey,
  { title: string; subtitle: string; href: string }
> = {
  fear: {
    title: 'Fear',
    subtitle: 'Statement pieces — bold graphics and presence.',
    href: '/fear',
  },
  insignia: {
    title: 'Insignia',
    subtitle: 'Marks of origin — manifesto energy, lasting silhouettes.',
    href: '/insignia',
  },
  chronicles: {
    title: 'Chronicles',
    subtitle: 'Stories worn daily — faith, purpose, and growth.',
    href: '/chronicles',
  },
  oversized: {
    title: 'Oversized',
    subtitle: 'Volume and drape — streetwear scale with structure.',
    href: '/oversized',
  },
}

export function isCollectionKey(value: string): value is CollectionKey {
  return value in COLLECTION_META
}

/** Normalize size labels from product data (string or stock-map objects). */
export function extractSizeLabels(sizes: Product['sizes'] | undefined): string[] {
  if (!sizes || !Array.isArray(sizes)) return []
  return sizes.flatMap((item) => {
    if (typeof item === 'string' && item.trim()) return [item.trim()]
    if (typeof item === 'object' && item !== null) {
      return Object.keys(item).filter((k) => k.trim().length > 0)
    }
    return []
  })
}

/** True when a product is one-size / ONESIZE (used on PDP sizing UI). */
export function isOnesizeProduct(product: Product): boolean {
  const labels = extractSizeLabels(product.sizes).map((s) =>
    s.toLowerCase().replace(/[\s_-]+/g, '')
  )
  if (labels.length === 0) return false
  const onesizeTokens = new Set(['onesize', 'os', 'o/s'])
  return labels.some((l) => onesizeTokens.has(l))
}

function findParentInTree(tree: CategoryTree, slug: string): Category | undefined {
  return tree.find((c) => c.slug === slug && !c.parent_id)
}

/**
 * Filter products belonging to a parent category (or one of its subcategories).
 * Optional `line` slug narrows to a single subcategory.
 */
export function filterByCategoryTree(
  products: Product[],
  tree: CategoryTree,
  parentSlug: CollectionKey,
  lineSlug?: string | null
): Product[] {
  const parent = findParentInTree(tree, parentSlug) || findParentInTree(FALLBACK_CATEGORY_TREE, parentSlug)
  if (!parent) return products

  if (lineSlug) {
    const line = (parent.children || []).find((c) => c.slug === lineSlug)
    if (line) {
      const matched = products.filter((p) => p.category_id === line.id)
      // If nothing assigned yet, don't empty the shop entirely for that line
      return matched
    }
  }

  const ids = new Set(collectCategoryIds(parent))
  const matched = products.filter((p) => ids.has(p.category_id))

  // Until products are reassigned from HOODIES/OODIES, keep Fear as full catalog
  // so the storefront is not empty after hierarchy seed.
  if (matched.length === 0 && parentSlug === 'fear') {
    return products
  }

  return matched
}

/** @deprecated use filterByCategoryTree — kept for temporary compat */
export function filterByCollection(products: Product[], collection: CollectionKey): Product[] {
  return filterByCategoryTree(products, FALLBACK_CATEGORY_TREE, collection)
}
