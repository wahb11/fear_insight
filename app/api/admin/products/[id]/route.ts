import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-auth'
import { invalidateAdminProductList } from '@/lib/admin-products-cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

function extractStoragePath(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl)
    const marker = '/storage/v1/object/public/products/'
    const idx = url.pathname.indexOf(marker)
    if (idx === -1) return null
    return decodeURIComponent(url.pathname.slice(idx + marker.length))
  } catch {
    return null
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const { data, error } = await supabase.from('products').select('*').eq('id', id).single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product: data })
  } catch (error: any) {
    console.error('Get product error:', error)
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const body = await req.json()

    // Images only via add-images / delete-image endpoints
    if (Object.prototype.hasOwnProperty.call(body, 'images')) {
      return NextResponse.json(
        {
          error:
            'Images cannot be updated via this endpoint. Use /add-images or /delete-image instead.',
        },
        { status: 400 }
      )
    }

    if (body.name !== undefined && (!body.name || !String(body.name).trim())) {
      return NextResponse.json({ error: 'Product name cannot be empty' }, { status: 400 })
    }

    if (
      body.price !== undefined &&
      (isNaN(parseFloat(body.price)) || parseFloat(body.price) <= 0)
    ) {
      return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 })
    }

    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'name',
      'description',
      'price',
      'discount',
      'category_id',
      'colors',
      'sizes',
      'ratings',
      'featured',
      'best_seller',
      'featured_image',
    ]

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        if (field === 'name' && body[field]) {
          updateData[field] = String(body[field]).trim()
        } else {
          updateData[field] = body[field]
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    invalidateAdminProductList()
    return NextResponse.json({ product: data[0] })
  } catch (error: any) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, images')
      .eq('id', id)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const images: string[] = Array.isArray(product.images) ? product.images : []
    const paths = images.map(extractStoragePath).filter(Boolean) as string[]
    if (paths.length > 0) {
      await supabase.storage.from('products').remove(paths)
    }

    const { error: deleteError } = await supabase.from('products').delete().eq('id', id)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    invalidateAdminProductList()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 })
  }
}
