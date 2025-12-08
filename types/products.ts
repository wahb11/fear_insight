export interface Product {
  id: string
  category_id: string
  name: string
  description?: string
  colors: string[] // e.g. ["Black", "PINK", "Navy"]
  sizes: string[]  // e.g. ["S", "M", "L", "ONE SIZE"]
  images: string[]
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
