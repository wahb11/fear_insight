import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getAdminSupabase } from '@/lib/admin-supabase'
import { invalidateAdminProductList } from '@/lib/admin-products-cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Compare storage paths, ignoring ?color= (and other) query params. */
function imageBase(url: string) {
  try {
    const u = new URL(url, 'https://placeholder.local')
    return `${u.origin}${u.pathname}`
  } catch {
    return url.split('?')[0]
  }
}

function sameImageSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const sortedA = a.map(imageBase).sort()
  const sortedB = b.map(imageBase).sort()
  return sortedA.every((url, i) => url === sortedB[i])
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { id } = await Promise.resolve(params)
    if (!id) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const body = await req.json()
    const nextImages = body?.images

    if (!Array.isArray(nextImages) || nextImages.length === 0) {
      return NextResponse.json(
        { error: 'images must be a non-empty array of image URLs' },
        { status: 400 }
      )
    }

    if (!nextImages.every((u: unknown) => typeof u === 'string' && u.trim())) {
      return NextResponse.json({ error: 'Each image must be a URL string' }, { status: 400 })
    }

    const supabase = getAdminSupabase()
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, images')
      .eq('id', id)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const currentImages: string[] = Array.isArray(product.images) ? product.images : []

    if (!sameImageSet(currentImages, nextImages)) {
      return NextResponse.json(
        {
          error:
            'Reorder only — the image list must contain the same files. Use Add Images or Delete to change files.',
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('products')
      .update({ images: nextImages })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    invalidateAdminProductList()
    return NextResponse.json({ success: true, images: data.images, product: data })
  } catch (error: any) {
    console.error('Reorder images error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to reorder images' },
      { status: 500 }
    )
  }
}
