
import { Order } from '@/types/order'
import nodemailer from 'nodemailer'



export async function sendOrderConfirmationEmail(order: Order) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NEXT_PUBLIC_GMAIL_USER,
      pass: process.env.NEXT_PUBLIC_GMAIL_PASS
    }
  })

  const mailOptions = {
    from: "Fear Insight <" + process.env.NEXT_PUBLIC_GMAIL_USER + ">",
    to: order.email,
    subject: 'Order Confirmed',
    html: `<p>Your order #${order.order_number} is confirmed. We'll notify you when it ships more order details: \n ${JSON.stringify(order)}.</p>`
  }

  await transporter.sendMail(mailOptions)
  return true
}
