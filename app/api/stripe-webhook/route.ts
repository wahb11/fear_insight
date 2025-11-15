import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getOrderById } from '@/functions/getOrderById'
import { sendOrderConfirmationEmail } from '@/functions/sendOrderConfirmationEmail'
import { notifyNewOrderPayment } from '@/functions/notifyNewOrderPayment'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // server key

export const supabase = createClient(supabaseUrl, supabaseKey)



// New recommended config
export const dynamic = 'force-dynamic'  // prevents static optimization
export const runtime = 'nodejs'         // ensures Node runtime

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const buf = Buffer.from(await req.arrayBuffer())
    const sig = req.headers.get('stripe-signature')!
    const event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      // Idempotent update
      await supabase
        .from('orders')
        .update({ payment: true })
        .eq('id', orderId)
        .eq('payment', false)

      // Fetch order to get email
      const order = await getOrderById(orderId!)
      await sendOrderConfirmationEmail(order)
      await notifyNewOrderPayment(order)

    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}






