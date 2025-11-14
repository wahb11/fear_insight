import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // server key

export const supabase = createClient(supabaseUrl, supabaseKey)


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { orderId, items, customer, tax = 0, shipping = 0 } = await req.json()

    const line_items = items.map((item: any & { quantity: number }) => {
      const discountedPrice = item.price * (1 - (item.discount || 0) / 100)
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description || '',
            images: item.images || [],
            metadata: {
              colors: JSON.stringify(item.colors),
              sizes: JSON.stringify(item.sizes),
              discount: item.discount?.toString() || '0',
            },
          },
          unit_amount: Math.round(discountedPrice * 100),
        },
        quantity: item.quantity,
      }
    })

    // Include tax and shipping as separate line items (optional)
    if (tax > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Tax' },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      })
    }

    if (shipping > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Shipping' },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: customer.email,
      success_url: `${process.env.NEXT_PUBLIC_URL}/checkout-success?order_id=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout-cancel?order_id=${orderId}`,
      metadata: { orderId },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create Stripe session' }, { status: 500 })
  }
}
