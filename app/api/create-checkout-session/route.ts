import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // server key

export const supabase = createClient(supabaseUrl, supabaseKey)


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const dynamic = 'force-dynamic'  // disable static optimization
export const runtime = 'nodejs'         // Node runtime

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[DEBUG] Incoming request body:', JSON.stringify(body, null, 2))

    const { orderId, items, customer, tax = 0, shipping = 0 } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('[ERROR] No items provided in the request')
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // Build Stripe line items safely
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      const price = Number(item.price)
      const discount = Number(item.discount || 0)
      const quantity = Number(item.quantity || 1)

      console.log(`[DEBUG] Product #${i} price:`, price, 'discount:', discount, 'quantity:', quantity)

      if (isNaN(price) || price <= 0) {
        console.error(`[ERROR] Invalid price for product: ${item.name}`)
        return NextResponse.json({ error: `Invalid price for product: ${item.name}` }, { status: 400 })
      }

      const discountedPrice = price * (1 - discount / 100)
      const unitAmount = Math.round(discountedPrice * 100) // Stripe requires cents

      console.log(`[DEBUG] Product #${i} discounted price:`, discountedPrice, 'unitAmount (cents):', unitAmount)

      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description || '',
            images: item.images || [],
            metadata: {
              category_id: item.category_id,
              colors: JSON.stringify(item.colors),
              sizes: JSON.stringify(item.sizes),
              discount: discount.toString(),
              featured: (item.featured || false).toString(),
              best_seller: (item.best_seller || false).toString(),
            },
          },
          unit_amount: unitAmount,
        },
        quantity,
      })
    }

    // Add tax and shipping as separate line items
    if (Number(tax) > 0) {
      const taxAmount = Math.round(Number(tax) * 100)
      console.log('[DEBUG] Adding tax line item:', taxAmount)
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Tax' },
          unit_amount: taxAmount,
        },
        quantity: 1,
      })
    }

    if (Number(shipping) > 0) {
      const shippingAmount = Math.round(Number(shipping) * 100)
      console.log('[DEBUG] Adding shipping line item:', shippingAmount)
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Shipping' },
          unit_amount: shippingAmount,
        },
        quantity: 1,
      })
    }

    console.log('[DEBUG] Final line_items to send to Stripe:', JSON.stringify(line_items, null, 2))

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: customer.email,
      success_url: `${process.env.NEXT_PUBLIC_URL}/checkout-success?order_id=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout-cancel?order_id=${orderId}`,
      metadata: { orderId },
    })

    console.log('[DEBUG] Stripe session created successfully:', session.id)

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[ERROR] Failed to create Stripe checkout session:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
