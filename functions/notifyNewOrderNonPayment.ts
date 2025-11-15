import { Order } from "@/types/order"

export async function notifyNewOrderNonPayment(orderData:Order) {
  await fetch(process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `New order received payment yet to confirm:\nName: ${orderData.first_name} ${orderData.last_name}\nEmail: ${orderData.email}\nTotal: $${orderData.grand_total}`
    })
  })
  return true
}
