export interface Category {
  id: string
  name: string
  description?: string
  /** DB column is `images` (legacy type used `imgs`) */
  images: string[]
  imgs?: string[]
  show: boolean
  parent_id?: string | null
  slug?: string | null
  sort_order?: number
  tag?: string | null
  children?: Category[]
}

export type CategoryTree = Category[]
