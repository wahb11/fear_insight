export interface Product {
  id: string
  category_id: string
  name: string
  description?: string
  colors: Record<string, number>[] // e.g. [{ blue: 10, red: 2 }]
  sizes: Record<string, number>[]  // e.g. [{ s: 5, m: 3, l: 2 }]
  images: string[]
  ratings: number
  price: number
  discount:number
  featured: boolean
  best_seller: boolean

}
