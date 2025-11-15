import { Order } from "@/types/order"

export async function notifyNewOrderPayment(orderData:Order) {
  await fetch(process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `New order received payment  confirmed:\nName: ${orderData.first_name} ${orderData.last_name}\nEmail: ${orderData.email}\nTotal: $${orderData.grand_total}`
    })
  })
  return true
}
