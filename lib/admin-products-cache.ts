type CachedList = { at: number; products: unknown[] }

let cache: CachedList | null = null
const TTL_MS = 15_000

export function getCachedAdminProductList(): unknown[] | null {
  if (!cache) return null
  if (Date.now() - cache.at > TTL_MS) {
    cache = null
    return null
  }
  return cache.products
}

export function setCachedAdminProductList(products: unknown[]) {
  cache = { at: Date.now(), products }
}

export function invalidateAdminProductList() {
  cache = null
}
