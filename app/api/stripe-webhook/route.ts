import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // server key

export const supabase = createClient(supabaseUrl, supabaseKey)


export const config = { api: { bodyParser: false } }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const buf = Buffer.from(await req.arrayBuffer())
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId

    // Idempotent update: only update if payment is still false
    await supabase
      .from('orders')
      .update({ payment: true })
      .eq('id', orderId)
      .eq('payment', false)
  }

  return NextResponse.json({ received: true })
}
