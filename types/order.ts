export type Order = {
  id: string
  order_number: string | null
  first_name: string
  last_name: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string | null
  payment: boolean | null
  tax: number | null
  shipping: number | null
  grand_total: number
  created_at: string
  products: {
    product_id: string
    size: string
    color: string
    quantity: number
  }[]
}
