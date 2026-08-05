import { Product } from '@/types/products'

export type CollectionKey = 'fear' | 'oversize' | 'signature'

export const COLLECTION_META: Record<
  CollectionKey,
  { title: string; subtitle: string; href: string }
> = {
  fear: {
    title: 'Fear',
    subtitle: 'The full Fear Insight drop — every piece, every mood.',
    href: '/fear',
  },
  oversize: {
    title: 'Oversize',
    subtitle: 'One-size volume. Relaxed cut. Built to drape.',
    href: '/oversize',
  },
  signature: {
    title: 'Signature',
    subtitle: 'Core essentials in standard sizing — everyday weight, clean fit.',
    href: '/signature',
  },
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

/** True when a product is one-size / ONESIZE (Oversize line). */
export function isOnesizeProduct(product: Product): boolean {
  const labels = extractSizeLabels(product.sizes).map((s) =>
    s.toLowerCase().replace(/[\s_-]+/g, '')
  )
  if (labels.length === 0) return false

  const onesizeTokens = new Set(['onesize', 'os', 'o/s'])
  const hasOnesize = labels.some((l) => onesizeTokens.has(l))
  if (!hasOnesize) return false

  // Pure onesize (only onesize listed) OR mixed listing that includes onesize
  // User asked: hoodies that were onesize → include any product that has onesize
  return true
}

/**
 * Collection rules (from live catalog):
 * - Fear → full catalog (renamed Collection)
 * - Oversize → products with onesize / ONESIZE / one size
 * - Signature → standard S/M/L line (everything that is NOT onesize)
 */
export function filterByCollection(products: Product[], collection: CollectionKey): Product[] {
  switch (collection) {
    case 'fear':
      return products
    case 'oversize':
      return products.filter(isOnesizeProduct)
    case 'signature':
      return products.filter((p) => !isOnesizeProduct(p))
    default:
      return products
  }
}
