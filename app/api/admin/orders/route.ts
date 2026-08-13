import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-auth'
import {
  FulfillmentStatus,
  readFulfillmentMap,
  setOrderFulfillment,
} from '@/lib/order-status'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const VALID_FULFILLMENT: FulfillmentStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const [ordersResult, fulfillmentMap] = await Promise.all([
      supabase
        .from('orders')
        .select(
          'id, order_number, first_name, last_name, email, phone, address, city, state, zip_code, country, payment, tax, shipping, discount, promo_code, grand_total, created_at, products'
        )
        .order('created_at', { ascending: false })
        .limit(150),
      readFulfillmentMap().catch(() => ({} as Record<string, FulfillmentStatus>)),
    ])

    if (ordersResult.error) {
      return NextResponse.json({ error: ordersResult.error.message }, { status: 500 })
    }

    const orders = (ordersResult.data || []).map((order) => ({
      ...order,
      fulfillment_status: fulfillmentMap[order.id] || 'pending',
    }))

    return NextResponse.json({ orders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const { id, payment, fulfillment_status } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (typeof payment === 'boolean') {
      updates.payment = payment
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('orders').update(updates).eq('id', id)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    let fulfillment: FulfillmentStatus | undefined
    if (fulfillment_status !== undefined) {
      if (!VALID_FULFILLMENT.includes(fulfillment_status)) {
        return NextResponse.json({ error: 'Invalid fulfillment status' }, { status: 400 })
      }
      fulfillment = await setOrderFulfillment(id, fulfillment_status)
    }

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const map = await readFulfillmentMap().catch(() => ({} as Record<string, FulfillmentStatus>))

    return NextResponse.json({
      order: {
        ...order,
        fulfillment_status: fulfillment || map[id] || 'pending',
      },
    })
  } catch (error: any) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 })
  }
}
