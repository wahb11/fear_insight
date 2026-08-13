import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET_NAME = 'products'

function extractStoragePath(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl)
    const marker = `/storage/v1/object/public/${BUCKET_NAME}/`
    const idx = url.pathname.indexOf(marker)
    if (idx === -1) {
      // Fallback: bare filename
      const parts = imageUrl.split('/')
      const name = parts[parts.length - 1]?.split('?')[0]
      return name || null
    }
    return decodeURIComponent(url.pathname.slice(idx + marker.length))
  } catch {
    return null
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const body = await req.json()
    const imageUrl: string | undefined = body.imageUrl || body.url
    const filename: string | undefined = body.filename

    if (!imageUrl && !filename) {
      return NextResponse.json(
        { error: 'imageUrl (or filename) is required' },
        { status: 400 }
      )
    }

    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, images')
      .eq('id', id)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const currentImages: string[] = Array.isArray(product.images) ? product.images : []
    const nextImages = imageUrl
      ? currentImages.filter((img) => img !== imageUrl)
      : currentImages.filter((img) => !img.endsWith(`/${filename}`) && !img.includes(`/${filename}?`))

    const { error: updateError } = await supabase
      .from('products')
      .update({ images: nextImages })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    const path = imageUrl ? extractStoragePath(imageUrl) : filename || null
    if (path) {
      await supabase.storage.from(BUCKET_NAME).remove([path])
    }

    const { invalidateAdminProductList } = await import("@/lib/admin-products-cache")
    invalidateAdminProductList()
    return NextResponse.json({ success: true, images: nextImages })
  } catch (error: any) {
    console.error('Delete image error:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    )
  }
}
