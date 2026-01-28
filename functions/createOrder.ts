// supabase function
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)


export async function createOrder(orderData: {
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  products: { product_id: string; name: string; size: string; color: string; quantity: number }[]
  payment?: boolean
  tax?: number
  shipping?: number
  discount?: number
  promo_code?: string | null
  grand_total: number
}) {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select('*')

  if (error) throw error
  return data?.[0]
}
