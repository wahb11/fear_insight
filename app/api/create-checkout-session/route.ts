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

    const { orderId, items, customer, tax = 0, shipping = 0, discount = 0 } = body
    
    // Get base URL from environment or request origin
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
      || process.env.NEXT_PUBLIC_URL 
      || req.headers.get('origin') 
      || `https://${req.headers.get('host')}`
    
    console.log('[DEBUG] Using base URL:', baseUrl)

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('[ERROR] No items provided in the request')
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // Calculate total product value to determine discount ratio
    let totalProductValue = 0
    const productDetails: Array<{
      product: any
      quantity: number
      selectedColor: string
      selectedSize: string
      discountedPrice: number
    }> = []

    for (let i = 0; i < items.length; i++) {
      const { product, quantity = 1, selectedColor, selectedSize } = items[i]

      if (!product) {
        console.error(`[ERROR] Missing product data for item #${i}`)
        return NextResponse.json({ error: 'Invalid product data' }, { status: 400 })
      }

      const price = Number(product.price)
      const productDiscount = Number(product.discount || 0)

      if (isNaN(price) || price <= 0) {
        console.error(`[ERROR] Invalid price for product: ${product.name}`)
        return NextResponse.json({ error: `Invalid price for product: ${product.name}` }, { status: 400 })
      }

      const discountedPrice = price * (1 - productDiscount / 100)
      totalProductValue += discountedPrice * quantity

      productDetails.push({
        product,
        quantity,
        selectedColor: selectedColor || '',
        selectedSize: selectedSize || '',
        discountedPrice,
      })
    }

    // Calculate the discount ratio (promo code discount as a percentage of product total)
    const promoDiscountAmount = Number(discount) || 0
    const discountRatio = promoDiscountAmount > 0 && totalProductValue > 0 
      ? promoDiscountAmount / totalProductValue 
      : 0

    console.log('[DEBUG] Total product value:', totalProductValue, 'Promo discount:', promoDiscountAmount, 'Discount ratio:', discountRatio)

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    // Add products with promo discount applied proportionally
    for (const detail of productDetails) {
      const { product, quantity, selectedColor, selectedSize, discountedPrice } = detail
      const productDiscount = Number(product.discount || 0)
      
      // Apply promo code discount proportionally to each product
      const finalPrice = discountedPrice * (1 - discountRatio)
      const unitAmount = Math.round(finalPrice * 100) // Stripe requires cents

      console.log(`[DEBUG] Product: ${product.name}, Original: $${discountedPrice.toFixed(2)}, After promo: $${finalPrice.toFixed(2)}, quantity: ${quantity}`)

      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: promoDiscountAmount > 0 ? `${product.name} (20% promo applied)` : product.name,
            description: product.description || '',
            images: product.images || [],
            metadata: {
              product_id: product.id,
              category_id: product.category_id,
              selectedColor,
              selectedSize,
              discount: productDiscount.toString(),
              featured: (product.featured || false).toString(),
              best_seller: (product.best_seller || false).toString(),
            },
          },
          unit_amount: unitAmount,
        },
        quantity,
      })
    }

    // Add tax
    if (Number(tax) > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Tax' },
          unit_amount: Math.round(Number(tax) * 100),
        },
        quantity: 1,
      })
    }

    // Add shipping
    if (Number(shipping) > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Shipping' },
          unit_amount: Math.round(Number(shipping) * 100),
        },
        quantity: 1,
      })
    }

    console.log('[DEBUG] Final line_items:', JSON.stringify(line_items, null, 2))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: customer.email,
      success_url: `${baseUrl}/checkout-success?order_id=${orderId}`,
      cancel_url: `${baseUrl}/checkout-cancel?order_id=${orderId}`,
      metadata: { orderId },
    })

    console.log('[DEBUG] Stripe session created successfully:', session.id)
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[ERROR] Failed to create Stripe checkout session:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
