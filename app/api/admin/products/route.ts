import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      )
    }

    // Select only the columns needed for the list view — avoids fetching large
    // image arrays and base64 cutouts for every product on every load.
    // The edit dialog fetches the full product via GET /api/admin/products/[id].
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, discount, featured, best_seller, category_id, images, featured_image')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: error.message, details: error.details || undefined },
        { status: 500 }
      )
    }

    return NextResponse.json({ products: data ?? [] })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred', type: error.name || 'UnknownError' },
      { status: 500 }
    )
  }
}
