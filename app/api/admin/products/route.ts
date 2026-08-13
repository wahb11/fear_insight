import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-auth'
import {
  getCachedAdminProductList,
  setCachedAdminProductList,
} from '@/lib/admin-products-cache'

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

    const cached = getCachedAdminProductList()
    if (cached) {
      return NextResponse.json({ products: cached })
    }

    // List view only: skip featured_image (often a large cutout) and extra columns.
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, discount, featured, best_seller, category_id, images')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: error.message, details: error.details || undefined },
        { status: 500 }
      )
    }

    const products = (data ?? []).map((row) => ({
      ...row,
      description:
        typeof row.description === 'string' && row.description.length > 160
          ? `${row.description.slice(0, 160)}…`
          : row.description,
      images: Array.isArray(row.images) && row.images[0] ? [row.images[0]] : [],
    }))

    setCachedAdminProductList(products)
    return NextResponse.json({ products })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred', type: error.name || 'UnknownError' },
      { status: 500 }
    )
  }
}
