"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { Order } from "@/types/order"

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      } else {
        setError("Failed to fetch orders")
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-stone-900 border-stone-800">
        <CardContent className="pt-6">
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">All Orders ({orders.length})</h2>
      </div>

      {orders.length === 0 ? (
        <Card className="bg-stone-900 border-stone-800">
          <CardContent className="pt-6">
            <p className="text-stone-400 text-center">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="bg-stone-900 border-stone-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Order #{order.order_number || order.id.slice(0, 8)}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge
                      variant={order.payment ? "default" : "secondary"}
                      className={
                        order.payment
                          ? "bg-green-600 text-white"
                          : "bg-yellow-600 text-white"
                      }
                    >
                      {order.payment ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-stone-400">Customer</p>
                    <p className="text-stone-100 font-medium">
                      {order.first_name} {order.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-400">Email</p>
                    <p className="text-stone-100 font-medium">{order.email}</p>
                  </div>
                  <div>
                    <p className="text-stone-400">Total</p>
                    <p className="text-stone-100 font-medium">
                      ${order.grand_total.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-400">Date</p>
                    <p className="text-stone-100 font-medium">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {order.address && (
                  <div className="text-sm">
                    <p className="text-stone-400">Address</p>
                    <p className="text-stone-100">
                      {order.address}, {order.city}, {order.state} {order.zip_code}
                    </p>
                  </div>
                )}

                <div className="text-sm">
                  <p className="text-stone-400 mb-2">Products</p>
                  <div className="space-y-1">
                    {order.products?.map((product, idx) => (
                      <p key={idx} className="text-stone-300">
                        • {product.quantity}x {product.color} - {product.size}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


