import { createClient } from '@supabase/supabase-js'
import { cache } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// React cache() deduplicates requests within a single render
export const getProductById = cache(async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  if (!data) return null

  // Inject default values for missing fields
  return {
    ...data,
    material: data.material || "100% Premium Cotton, 465gsm French Terry",
    care: data.care || "Machine wash cold inside out. Do not bleach. Tumble dry low or hang dry.",
    fullDescription: data.fullDescription || "Experience the perfect blend of faith and fashion with our premium collection. Each piece is crafted with meticulous attention to detail, designed to embody spiritual strength and divine inspiration.",
    shipping: data.shipping || "Free shipping on orders over $75. International shipping available. All orders are processed within 1-2 business days."
  }
})