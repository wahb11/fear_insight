import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getAdminSupabase } from '@/lib/admin-supabase'
import {
  removeUploadedPaths,
  uploadProductImages,
} from '@/lib/admin-image-upload'
import { invalidateAdminProductList } from '@/lib/admin-products-cache'
import { applyColorsToImageUrls } from '@/lib/product-image-color'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  let uploadedPaths: string[] = []

  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { id } = await Promise.resolve(params)
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    let formData: FormData
    try {
      formData = await req.formData()
    } catch {
      return NextResponse.json(
        {
          error:
            'Could not read upload body. Try fewer/smaller images (under 10MB each) and use JPG or PNG.',
        },
        { status: 400 }
      )
    }

    const files = formData
      .getAll('images')
      .filter((entry): entry is File => typeof File !== 'undefined' && entry instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    const supabase = getAdminSupabase()
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('images, id')
      .eq('id', id)
      .single()

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: fetchError?.message || 'Product not found' },
        { status: 404 }
      )
    }

    const existingImages = Array.isArray(existingProduct.images)
      ? (existingProduct.images as string[])
      : []

    const { urls: newImageUrls, paths, skipped } = await uploadProductImages(files)
    uploadedPaths = paths

    if (newImageUrls.length === 0) {
      return NextResponse.json(
        {
          error:
            skipped.length > 0
              ? `No valid images uploaded. ${skipped.join('; ')}`
              : 'No valid images were uploaded. Supported formats: JPG, JPEG, PNG, WEBP, GIF',
        },
        { status: 400 }
      )
    }

    let imageColors: Array<string | null> = []
    const colorsRaw = formData.get('imageColors')
    if (typeof colorsRaw === 'string' && colorsRaw.trim()) {
      try {
        const parsed = JSON.parse(colorsRaw)
        if (Array.isArray(parsed)) imageColors = parsed
      } catch {
        /* ignore bad JSON */
      }
    }

    const taggedNewUrls = applyColorsToImageUrls(newImageUrls, imageColors)
    const updatedImages = [...existingImages, ...taggedNewUrls]

    const { data, error } = await supabase
      .from('products')
      .update({ images: updatedImages })
      .eq('id', id)
      .select()

    if (error) {
      await removeUploadedPaths(uploadedPaths)
      uploadedPaths = []
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      await removeUploadedPaths(uploadedPaths)
      uploadedPaths = []
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    invalidateAdminProductList()
    return NextResponse.json({
      success: true,
      product: data[0],
      newImages: taggedNewUrls,
      totalImages: updatedImages.length,
      skipped: skipped.length ? skipped : undefined,
    })
  } catch (error: any) {
    if (uploadedPaths.length > 0) {
      try {
        await removeUploadedPaths(uploadedPaths)
      } catch {
        /* ignore */
      }
    }
    console.error('Add images error:', error)
    return NextResponse.json(
      { error: error?.message || 'An error occurred while adding images' },
      { status: 500 }
    )
  }
}
