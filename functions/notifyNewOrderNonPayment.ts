import { Order } from "@/types/order"

export async function notifyNewOrderNonPayment(orderData: Order) {
  const orderNumber = orderData.order_number || orderData.id.slice(0, 8).toUpperCase()
  const itemCount = orderData.products?.reduce((sum, item) => sum + item.quantity, 0) || 0
  
  const embed = {
    title: "🔄 New Order - Payment Pending",
    color: 0xf59e0b, // Amber color
    fields: [
      {
        name: "Order Number",
        value: `#${orderNumber}`,
        inline: true
      },
      {
        name: "Customer",
        value: `${orderData.first_name} ${orderData.last_name}`,
        inline: true
      },
      {
        name: "Email",
        value: orderData.email || "N/A",
        inline: true
      },
      {
        name: "Phone",
        value: orderData.phone || "N/A",
        inline: true
      },
      {
        name: "Items",
        value: `${itemCount} item${itemCount > 1 ? 's' : ''}`,
        inline: true
      },
      {
        name: "Total",
        value: `$${orderData.grand_total.toFixed(2)}`,
        inline: true
      },
      {
        name: "Shipping Address",
        value: `${orderData.address || 'N/A'}\n${orderData.city || ''}${orderData.state ? ', ' + orderData.state : ''} ${orderData.zip_code || ''}\n${orderData.country || ''}`,
        inline: false
      },
      {
        name: "Order Details",
        value: orderData.products?.map((item, idx) => 
          `**Item ${idx + 1}:** ${item.color || 'N/A'} | ${item.size || 'N/A'} | Qty: ${item.quantity}`
        ).join('\n') || 'No items',
        inline: false
      },
      {
        name: "⚠️ Status",
        value: "Awaiting payment confirmation",
        inline: false
      }
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "Fear Insight - Order Management"
    }
  }

  await fetch(process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [embed]
    })
  })
  return true
}
