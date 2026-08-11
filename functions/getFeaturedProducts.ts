import { Product } from '@/types/products'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .not('featured_image', 'is', null)
    .order('name', { ascending: true })

  if (error) throw error

  return (data || []).filter(
    (p) => typeof p.featured_image === 'string' && p.featured_image.length > 0
  ) as Product[]
}
