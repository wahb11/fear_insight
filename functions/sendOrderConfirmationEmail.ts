import { Order } from '@/types/order'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const currency = (value: number | null | undefined) =>
  typeof value === 'number' ? `$${value.toFixed(2)}` : '$0.00'

// Calculate estimated delivery date (5-7 business days from now)
const getEstimatedDelivery = () => {
  const date = new Date()
  date.setDate(date.getDate() + 6) // Add 6 days for standard shipping
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

export async function sendOrderConfirmationEmail(order: Order) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  // Fetch product names
  const productIds = order.products?.map(p => p.product_id) || []
  let productMap: Record<string, string> = {}
  
  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds)
    
    if (products) {
      products.forEach(p => {
        productMap[p.id] = p.name
      })
    }
  }

  const orderNumber = order.order_number || order.id.slice(0, 8).toUpperCase()
  const subtotal = (order.grand_total || 0) - (order.tax || 0) - (order.shipping || 0)
  const itemCount = order.products?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const estimatedDelivery = getEstimatedDelivery()

  // Build order items list
  const orderItems = order.products?.map(item => {
    const productName = productMap[item.product_id] || 'Product'
    return {
      name: productName,
      color: item.color,
      size: item.size,
      quantity: item.quantity
    }
  }) || []

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Fear Insight</title>
  <style>
    @media only screen and (max-width: 600px) {
      .two-column { width: 100% !important; padding: 0 !important; display: block !important; }
      .two-column table { width: 100% !important; }
      .two-column td { width: 100% !important; display: block !important; padding: 0 0 16px 0 !important; }
      .main-table { width: 100% !important; padding: 24px 16px !important; }
      .header-table { padding: 20px 20px !important; }
      .header-table td { font-size: 22px !important; }
      .checkmark-wrapper { padding-top: 8px !important; padding-bottom: 20px !important; }
      .checkmark-circle { width: 64px !important; height: 64px !important; }
      .checkmark-inner { width: 32px !important; height: 32px !important; }
      .checkmark-inner span { font-size: 18px !important; }
      h1 { font-size: 24px !important; margin: 0 !important; }
      .thank-you-text { padding-bottom: 24px !important; }
      .thank-you-text p { font-size: 14px !important; padding: 0 8px !important; }
      .order-items-table { font-size: 12px !important; }
      .order-items-table th, .order-items-table td { padding: 10px 12px !important; }
      .delivery-card { padding: 16px !important; margin-bottom: 16px !important; }
      .footer-content { padding: 24px 16px !important; }
      .order-summary { margin-bottom: 24px !important; }
      .order-summary td { padding: 14px 0 !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f5f5f4; font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4; padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; max-width:600px; width:100%; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td class="header-table" style="background:linear-gradient(135deg, #1c1917 0%, #0c0a09 100%); padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#fafaf9; font-size:28px; font-weight:800; letter-spacing:1px;">FEAR INSIGHT</td>
                  <td align="right" style="color:#fafaf9; font-size:14px; font-weight:600;">
                    <a href="https://fearinsight.com" style="color:#fafaf9; text-decoration:none;">Shop →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="main-table" style="padding:48px 32px; background-color:#ffffff;">
              
              <!-- Checkmark Circle -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" class="checkmark-wrapper" style="padding-top:0; padding-bottom:28px;">
                    <div class="checkmark-circle" style="width:80px; height:80px; background-color:#e7e5e4; border-radius:50%; display:inline-flex; align-items:center; justify-content:center;">
                      <div class="checkmark-inner" style="width:40px; height:40px; background-color:#16a34a; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                        <span style="color:#ffffff; font-size:24px; font-weight:bold;">✓</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Thank You Message -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <h1 style="margin:0; color:#1c1917; font-size:32px; font-weight:700; line-height:1.2;">Thank You For Your Order!</h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" class="thank-you-text" style="padding-bottom:40px;">
                    <p style="margin:0; color:#57534e; font-size:15px; line-height:1.6; max-width:500px;">
                      Your order has been confirmed and will be processed shortly. We'll notify you once it ships.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Order Summary Table -->
              <table width="100%" cellpadding="0" cellspacing="0" class="order-summary" style="border-collapse:collapse; margin-bottom:36px;">
                <tr>
                  <td style="padding:18px 0; border-bottom:1px solid #e7e5e4;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#57534e; font-size:14px;">Order Confirmation #</td>
                        <td align="right" style="color:#1c1917; font-size:14px; font-weight:700;">${orderNumber}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 0; border-bottom:1px solid #e7e5e4;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#57534e; font-size:14px;">Purchased Item${itemCount > 1 ? 's' : ''} (${itemCount})</td>
                        <td align="right" style="color:#1c1917; font-size:14px; font-weight:600;">${currency(subtotal)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${order.shipping ? `
                <tr>
                  <td style="padding:18px 0; border-bottom:1px solid #e7e5e4;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#57534e; font-size:14px;">Shipping + Handling</td>
                        <td align="right" style="color:#1c1917; font-size:14px; font-weight:600;">${currency(order.shipping)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}
                ${order.tax ? `
                <tr>
                  <td style="padding:18px 0; border-bottom:1px solid #e7e5e4;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#57534e; font-size:14px;">Sales Tax</td>
                        <td align="right" style="color:#1c1917; font-size:14px; font-weight:600;">${currency(order.tax)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding:24px 0 0 0; border-top:2px solid #d6d3d1;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#1c1917; font-size:18px; font-weight:700;">TOTAL</td>
                        <td align="right" style="color:#1c1917; font-size:20px; font-weight:800;">${currency(order.grand_total)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Order Items Details -->
              ${orderItems.length > 0 ? `
              <table width="100%" cellpadding="0" cellspacing="0" class="order-items-table" style="margin-bottom:36px; border:1px solid #e7e5e4; border-radius:8px; overflow:hidden;">
                <thead>
                  <tr style="background-color:#fafaf9;">
                    <th style="padding:14px 16px; text-align:left; color:#1c1917; font-size:13px; font-weight:600; border-bottom:1px solid #e7e5e4;">Item</th>
                    <th style="padding:14px 16px; text-align:left; color:#1c1917; font-size:13px; font-weight:600; border-bottom:1px solid #e7e5e4;">Color</th>
                    <th style="padding:14px 16px; text-align:left; color:#1c1917; font-size:13px; font-weight:600; border-bottom:1px solid #e7e5e4;">Size</th>
                    <th style="padding:14px 16px; text-align:center; color:#1c1917; font-size:13px; font-weight:600; border-bottom:1px solid #e7e5e4;">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItems.map((item, idx) => `
                  <tr style="background-color:${idx % 2 === 0 ? '#ffffff' : '#fafaf9'};">
                    <td style="padding:14px 16px; color:#1c1917; font-size:14px;">${item.name}</td>
                    <td style="padding:14px 16px; color:#57534e; font-size:14px; text-transform:capitalize;">${item.color || '-'}</td>
                    <td style="padding:14px 16px; color:#57534e; font-size:14px;">${item.size || '-'}</td>
                    <td style="padding:14px 16px; text-align:center; color:#57534e; font-size:14px;">${item.quantity}</td>
                  </tr>
                  `).join('')}
                </tbody>
              </table>
              ` : ''}

              <!-- Delivery Information - Two Columns -->
              <table width="100%" cellpadding="0" cellspacing="0" class="two-column" style="margin-bottom:0;">
                <tr>
                  <td width="48%" valign="top" style="padding-right:2%; padding-bottom:16px;" class="two-column">
                    <div class="delivery-card" style="background-color:#fafaf9; padding:24px; border-radius:8px; border:1px solid #e7e5e4;">
                      <h3 style="margin:0 0 14px 0; color:#1c1917; font-size:16px; font-weight:700;">Delivery Address</h3>
                      <p style="margin:4px 0; color:#57534e; font-size:14px; line-height:1.6;">
                        ${order.first_name} ${order.last_name}<br>
                        ${order.address || ''}<br>
                        ${order.city || ''}${order.state ? ', ' + order.state : ''} ${order.zip_code || ''}<br>
                        ${order.country || ''}
                      </p>
                    </div>
                  </td>
                  <td width="48%" valign="top" style="padding-left:2%;" class="two-column">
                    <div class="delivery-card" style="background-color:#fafaf9; padding:24px; border-radius:8px; border:1px solid #e7e5e4;">
                      <h3 style="margin:0 0 14px 0; color:#1c1917; font-size:16px; font-weight:700;">Estimated Delivery Date</h3>
                      <p style="margin:0; color:#57534e; font-size:14px; line-height:1.6;">
                        ${estimatedDelivery}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-content" style="background-color:#1c1917; padding:40px 32px; text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <p style="margin:0; color:#fafaf9; font-size:16px; font-weight:700; letter-spacing:0.5px;">Fear Insight</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <p style="margin:0; color:#a8a29e; font-size:12px; font-weight:500; letter-spacing:1px; text-transform:uppercase;">DIRECTED BY GOD</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:20px; border-top:1px solid #292524;">
                    <p style="margin:0; color:#78716c; font-size:11px; line-height:1.5;">
                      If you didn't create an account using this email address, please ignore this email or 
                      <a href="https://fearinsight.com" style="color:#a8a29e; text-decoration:underline;">unsubscribe</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  const mailOptions = {
    from: `"Fear Insight" <${process.env.SMTP_USER}>`,
    replyTo: 'info@fearinsight.com',
    to: order.email,
    subject: `Order Confirmation #${orderNumber} - Fear Insight`,
    html,
  }

  await transporter.sendMail(mailOptions)
  return true
}
