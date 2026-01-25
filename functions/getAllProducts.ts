// supabase function
import { createClient } from '@supabase/supabase-js'
import { cache } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// React cache() deduplicates requests within a single render
export const getAllProducts = cache(async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) throw error

  // Inject default values for missing fields
  return data.map((product: any) => ({
    ...product,
    material: product.material || "100% Premium Cotton, 465gsm French Terry",
    care: product.care || "Machine wash cold inside out. Do not bleach. Tumble dry low or hang dry.",
    fullDescription: product.fullDescription || "Experience the perfect blend of faith and fashion with our premium collection. Each piece is crafted with meticulous attention to detail, designed to embody spiritual strength and divine inspiration.",
    shipping: product.shipping || "Free shipping on orders over $75. International shipping available. All orders are processed within 1-2 business days."
  }))
})
