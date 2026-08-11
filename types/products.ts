export interface Product {
  id: string
  category_id: string
  name: string
  description?: string
  colors: (string | Record<string, number>)[] // e.g. ["Black", "Navy"] or [{"Black": 5}]
  sizes: (string | Record<string, number>)[]  // e.g. ["S", "M", "L"] or [{"S": 10}]
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
