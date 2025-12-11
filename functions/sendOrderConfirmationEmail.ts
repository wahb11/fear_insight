
import { Order } from '@/types/order'
import nodemailer from 'nodemailer'

const currency = (value: number | null | undefined) =>
  typeof value === 'number' ? `$${value.toFixed(2)}` : '$0.00'

const buildItemsTable = (order: Order) => {
  if (!order.products?.length) {
    return '<p style="margin:0 0 12px 0; color:#e5e7eb;">No items found for this order.</p>'
  }

  const rows = order.products
    .map(
      (item, idx) => `
        <tr style="background:${idx % 2 === 0 ? '#0f172a' : '#111827'};color:#e5e7eb;">
          <td style="padding:12px 16px;">Item ${idx + 1}</td>
          <td style="padding:12px 16px; text-transform:capitalize;">${item.color || '-'}</td>
          <td style="padding:12px 16px;">${item.size || '-'}</td>
          <td style="padding:12px 16px; text-align:center;">${item.quantity}</td>
        </tr>
      `
    )
    .join('')

  return `
    <table style="width:100%; border-collapse:collapse; margin-top:12px; border:1px solid #1f2937; min-width:280px;">
      <thead>
        <tr style="background:#111827; color:#e5e7eb;">
          <th style="padding:12px 16px; text-align:left;">Item</th>
          <th style="padding:12px 16px; text-align:left;">Color</th>
          <th style="padding:12px 16px; text-align:left;">Size</th>
          <th style="padding:12px 16px; text-align:center;">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `
}

export async function sendOrderConfirmationEmail(order: Order) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NEXT_PUBLIC_GMAIL_USER,
      pass: process.env.NEXT_PUBLIC_GMAIL_PASS
    }
  })

  const orderNumber = order.order_number || order.id

  const totals = `
    <div style="margin-top:12px; padding:12px 16px; background:#0f172a; border:1px solid #1f2937; border-radius:10px; color:#e5e7eb;">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span>Subtotal</span><span>${currency((order.grand_total || 0) - (order.tax || 0) - (order.shipping || 0))}</span></div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span>Tax</span><span>${currency(order.tax)}</span></div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span>Shipping</span><span>${currency(order.shipping)}</span></div>
      <div style="border-top:1px solid #1f2937; margin-top:8px; padding-top:8px; display:flex; justify-content:space-between; font-weight:700;"><span>Total</span><span>${currency(order.grand_total)}</span></div>
    </div>
  `

  const addressBlock = `
    <div style="padding:12px 16px; background:#0f172a; border:1px solid #1f2937; border-radius:10px; color:#e5e7eb;">
      <div style="font-weight:700; margin-bottom:6px;">Shipping Address</div>
      <div>${order.first_name} ${order.last_name}</div>
      <div>${order.address || ''}</div>
      <div>${order.city || ''}${order.state ? ', ' + order.state : ''} ${order.zip_code || ''}</div>
      <div>${order.country || ''}</div>
      ${order.phone ? `<div style="margin-top:6px;">Phone: ${order.phone}</div>` : ''}
    </div>
  `

  const html = `
    <div style="background:#0b0f19; color:#e5e7eb; padding:16px; font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="max-width:640px; margin:0 auto; background:#0f172a; border:1px solid #1f2937; border-radius:16px; overflow:hidden;">
        <div style="padding:16px 18px; background:linear-gradient(90deg, #111827, #0f172a); border-bottom:1px solid #1f2937;">
          <div style="font-size:12px; letter-spacing:1.5px; text-transform:uppercase; color:#9ca3af;">Fear Insight</div>
          <div style="font-size:20px; font-weight:800; color:#f9fafb;">Order Confirmation</div>
          <div style="margin-top:6px; color:#d1d5db;">Order #${orderNumber}</div>
        </div>

        <div style="padding:18px">
          <p style="margin:0 0 12px 0; color:#e5e7eb; font-size:15px; line-height:1.5;">Hi ${order.first_name || 'there'},</p>
          <p style="margin:0 0 14px 0; color:#cbd5e1; font-size:14px; line-height:1.6;">
            Thank you for your purchase! Your order is confirmed and we’ll notify you once it ships.
          </p>

          <div style="overflow-x:auto; -webkit-overflow-scrolling:touch;">
            ${buildItemsTable(order)}
          </div>
          ${totals}

          <div style="margin-top:14px;">
            ${addressBlock}
          </div>

          <p style="margin:14px 0 0 0; color:#94a3b8; font-size:13px; line-height:1.5;">
            If you have questions, just reply to this email and we’ll help out.
          </p>
        </div>
      </div>
    </div>
  `

  const mailOptions = {
    from: `Fear Insight <${process.env.NEXT_PUBLIC_GMAIL_USER}>`,
    to: order.email,
    subject: `Order confirmed — #${orderNumber}`,
    html,
  }

  await transporter.sendMail(mailOptions)
  return true
}
