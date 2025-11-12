// supabase function
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) throw error
  return data
}
