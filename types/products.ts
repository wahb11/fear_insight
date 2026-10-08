export interface Product {
  id: string
  category_id: string
  name: string
  description?: string
  colors: (string | Record<string, number>)[] // e.g. ["Black", "Navy"] or [{"Black": 5}]
  /** Flat sizes, stock maps, or per-color maps: [{ color: "Black", sizes: ["S","M"] }, ...] */
  sizes: (string | Record<string, number> | { color: string; sizes: string[] })[]
  images: string[]
  /** Transparent PNG cutout used by the landing featured carousel */
  featured_image?: string | null
  ratings: number
  price: number
  discount: number
  featured: boolean
  best_seller: boolean
  material?: string
  care?: string
  fullDescription?: string
  shipping?: string
}
