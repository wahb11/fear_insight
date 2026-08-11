import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-auth'
import { buildCategoryTree, slugify } from '@/lib/categories'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const includeHidden = req.nextUrl.searchParams.get('all') === '1'
    const asTree = req.nextUrl.searchParams.get('tree') === '1'

    // Prefer hierarchy sort; fall back if columns not migrated yet
    let query = supabase.from('categories').select('*').order('name', { ascending: true })
    if (!includeHidden) {
      query = query.eq('show', true)
    }

    let { data, error } = await query

    // Retry without show filter quirks / sort_order if schema is legacy
    if (error && (error.message?.includes('sort_order') || error.code === '42703')) {
      const retry = await supabase.from('categories').select('*').order('name', { ascending: true })
      data = retry.data
      error = retry.error
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = (data || []) as any[]
    // Soft-sort by sort_order when present
    rows.sort(
      (a, b) =>
        (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
        String(a.name || '').localeCompare(String(b.name || ''))
    )

    if (asTree) {
      return NextResponse.json(buildCategoryTree(rows))
    }
    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const slug =
      typeof body.slug === 'string' && body.slug.trim()
        ? slugify(body.slug)
        : slugify(name)

    const insert: Record<string, unknown> = {
      name,
      description: typeof body.description === 'string' ? body.description.trim() : '',
      images: Array.isArray(body.images) ? body.images : [],
      show: body.show !== false,
      slug,
      sort_order: typeof body.sort_order === 'number' ? body.sort_order : 0,
      tag: typeof body.tag === 'string' ? body.tag.trim() : '',
      parent_id: body.parent_id || null,
    }

    const { data, error } = await supabase.from('categories').insert([insert]).select().single()

    if (error) {
      if (error.code === 'PGRST204') {
        return NextResponse.json(
          {
            error:
              'Database missing hierarchy columns. Run scripts/add_category_hierarchy.sql in Supabase.',
          },
          { status: 500 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ category: data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const id = typeof body.id === 'string' ? body.id : ''
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (typeof body.name === 'string') {
      const name = body.name.trim()
      if (!name) {
        return NextResponse.json({ error: 'Category name cannot be empty' }, { status: 400 })
      }
      updateData.name = name
    }
    if (typeof body.description === 'string') {
      updateData.description = body.description.trim()
    }
    if (Array.isArray(body.images)) {
      updateData.images = body.images
    }
    if (typeof body.show === 'boolean') {
      updateData.show = body.show
    }
    if (typeof body.slug === 'string') {
      updateData.slug = slugify(body.slug)
    }
    if (typeof body.sort_order === 'number') {
      updateData.sort_order = body.sort_order
    }
    if (typeof body.tag === 'string') {
      updateData.tag = body.tag.trim()
    }
    if (body.parent_id === null) {
      updateData.parent_id = null
    } else if (typeof body.parent_id === 'string') {
      if (body.parent_id === id) {
        return NextResponse.json({ error: 'Category cannot be its own parent' }, { status: 400 })
      }
      updateData.parent_id = body.parent_id
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ category: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    const { count: childCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', id)

    if ((childCount || 0) > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${childCount} subcategory(ies) still exist` },
        { status: 400 }
      )
    }

    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if ((count || 0) > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${count} product(s) still use this category` },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 })
  }
}
