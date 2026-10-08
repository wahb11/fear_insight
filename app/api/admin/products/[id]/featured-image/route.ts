import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getAdminSupabase, PRODUCTS_BUCKET } from '@/lib/admin-supabase'

const BUCKET_NAME = PRODUCTS_BUCKET
const MAX_FILE_SIZE = 12 * 1024 * 1024
const validExt = ['.png', '.webp', '.jpg', '.jpeg']

function extractStoragePath(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl)
    const marker = `/storage/v1/object/public/${BUCKET_NAME}/`
    const idx = url.pathname.indexOf(marker)
    if (idx === -1) return null
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
    const supabase = getAdminSupabase()
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const { data: existing, error: fetchError } = await supabase
      .from('products')
      .select('id, featured_image')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      // PGRST204 = column missing from schema
      if (fetchError?.code === 'PGRST204') {
        return NextResponse.json(
          {
            error:
              'Database missing featured_image column. Run scripts/add_featured_image.sql in Supabase SQL Editor.',
          },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: fetchError?.message || 'Product not found' },
        { status: 404 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('image') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Image exceeds 12MB limit' }, { status: 400 })
    }

    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || 'png')
    const safeExt = validExt.includes(ext) ? ext : '.png'
    const fileName = `featured/${id}-${Date.now()}${safeExt}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, buffer, {
      contentType: file.type || `image/${safeExt.replace('.', '')}`,
      upsert: false,
    })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)
    const publicUrl = urlData.publicUrl

    const { data: updated, error: updateError } = await supabase
      .from('products')
      .update({
        featured: true,
        featured_image: publicUrl,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      await supabase.storage.from(BUCKET_NAME).remove([fileName])
      if (updateError.code === 'PGRST204') {
        return NextResponse.json(
          {
            error:
              'Database missing featured_image column. Run scripts/add_featured_image.sql in Supabase SQL Editor.',
          },
          { status: 500 }
        )
      }
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Remove previous cutout from storage if it lived in our bucket
    const oldPath = existing.featured_image
      ? extractStoragePath(existing.featured_image)
      : null
    if (oldPath && oldPath !== fileName) {
      await supabase.storage.from(BUCKET_NAME).remove([oldPath])
    }

    return NextResponse.json({ success: true, product: updated, featured_image: publicUrl })
  } catch (error: any) {
    console.error('Featured image upload error:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const supabase = getAdminSupabase()
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const { data: existing, error: fetchError } = await supabase
      .from('products')
      .select('id, featured_image')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      if (fetchError?.code === 'PGRST204') {
        return NextResponse.json(
          {
            error:
              'Database missing featured_image column. Run scripts/add_featured_image.sql in Supabase SQL Editor.',
          },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: fetchError?.message || 'Product not found' },
        { status: 404 }
      )
    }

    const { data: updated, error: updateError } = await supabase
      .from('products')
      .update({ featured_image: null })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    const path = existing.featured_image ? extractStoragePath(existing.featured_image) : null
    if (path) {
      await supabase.storage.from(BUCKET_NAME).remove([path])
    }

    return NextResponse.json({ success: true, product: updated })
  } catch (error: any) {
    console.error('Featured image delete error:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    )
  }
}
