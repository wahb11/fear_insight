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

export async function POST(req: NextRequest) {
  let uploadedPaths: string[] = []

  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

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

    const productDataStr = formData.get('productData')
    if (typeof productDataStr !== 'string' || !productDataStr.trim()) {
      return NextResponse.json({ error: 'Product data is required' }, { status: 400 })
    }

    let productData: any
    try {
      productData = JSON.parse(productDataStr)
    } catch {
      return NextResponse.json({ error: 'Invalid product data format' }, { status: 400 })
    }

    const files = formData
      .getAll('images')
      .filter((entry): entry is File => typeof File !== 'undefined' && entry instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 })
    }

    if (!productData.name || !String(productData.name).trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }

    if (!productData.category_id) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    const price = parseFloat(productData.price)
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 })
    }

    const { urls: imageUrls, paths, skipped } = await uploadProductImages(files)
    uploadedPaths = paths

    if (imageUrls.length === 0) {
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

    const supabase = getAdminSupabase()
    const imageColorList = Array.isArray(productData.imageColors)
      ? productData.imageColors
      : []
    const taggedImageUrls = applyColorsToImageUrls(imageUrls, imageColorList)

    const productToInsert = {
      category_id: productData.category_id,
      name: String(productData.name).trim(),
      description: String(productData.description || '').trim(),
      colors: Array.isArray(productData.colors) && productData.colors.length
        ? productData.colors
        : ['Black'],
      sizes: Array.isArray(productData.sizes) && productData.sizes.length
        ? productData.sizes
        : ['S', 'M', 'L', 'XL'],
      images: taggedImageUrls,
      ratings: parseFloat(productData.ratings) || 0,
      price,
      discount: Number.isFinite(parseFloat(productData.discount))
        ? parseFloat(productData.discount)
        : 0,
      featured: productData.featured === true || productData.featured === 'true',
      best_seller:
        productData.best_seller === true || productData.best_seller === 'true',
    }

    const { data, error } = await supabase
      .from('products')
      .insert([productToInsert])
      .select()

    if (error) {
      await removeUploadedPaths(uploadedPaths)
      uploadedPaths = []
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    invalidateAdminProductList()
    return NextResponse.json({
      success: true,
      product: data?.[0],
      imageUrls: taggedImageUrls,
      skipped: skipped.length ? skipped : undefined,
    })
  } catch (error: any) {
    if (uploadedPaths.length > 0) {
      try {
        await removeUploadedPaths(uploadedPaths)
      } catch {
        /* ignore cleanup errors */
      }
    }
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error?.message || 'An error occurred while uploading product' },
      { status: 500 }
    )
  }
}
