"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, Mail, MapPin, Calendar, DollarSign, User, ShoppingBag, Tag } from "lucide-react"
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
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-stone-400" />
        <p className="text-stone-500 text-sm mt-3">Loading orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-stone-900 border-stone-800">
        <CardContent className="pt-6 text-center">
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Package className="w-5 h-5" />
          All Orders ({orders.length})
        </h2>
      </div>

      {orders.length === 0 ? (
        <Card className="bg-stone-900 border-stone-800">
          <CardContent className="pt-12 pb-12 text-center">
            <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto mb-4" />
            <p className="text-stone-400 text-lg">No orders yet</p>
            <p className="text-stone-500 text-sm mt-1">Orders will appear here when customers make purchases</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="bg-stone-900 border-stone-800 overflow-hidden">
              <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 bg-stone-800/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />
                    Order #{order.order_number || order.id.slice(0, 8)}
                  </CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant={order.payment ? "default" : "secondary"}
                      className={`text-xs ${
                        order.payment
                          ? "bg-green-600/20 text-green-400 border border-green-600/30"
                          : "bg-amber-600/20 text-amber-400 border border-amber-600/30"
                      }`}
                    >
                      {order.payment ? "✓ Paid" : "⏳ Pending"}
                    </Badge>
                    {order.promo_code && (
                      <Badge className="text-xs bg-purple-600/20 text-purple-400 border border-purple-600/30">
                        <Tag className="w-3 h-3 mr-1" />
                        {order.promo_code}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 py-4 space-y-4">
                {/* Customer Info Grid - Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-stone-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-stone-500 text-xs">Customer</p>
                      <p className="text-stone-100 font-medium">
                        {order.first_name} {order.last_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-stone-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-stone-500 text-xs">Email</p>
                      <p className="text-stone-100 font-medium truncate">{order.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-stone-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-stone-500 text-xs">Total</p>
                      <p className="text-stone-100 font-bold text-base">
                        ${order.grand_total.toFixed(2)}
                      </p>
                      {order.discount && order.discount > 0 && (
                        <p className="text-green-400 text-xs">
                          -${order.discount.toFixed(2)} discount
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-stone-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-stone-500 text-xs">Date</p>
                      <p className="text-stone-100 font-medium">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                {order.address && (
                  <div className="flex items-start gap-2 text-sm bg-stone-800/30 p-3 rounded-lg">
                    <MapPin className="w-4 h-4 text-stone-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-stone-500 text-xs mb-1">Shipping Address</p>
                      <p className="text-stone-200">
                        {order.address}, {order.city}, {order.state} {order.zip_code}
                      </p>
                    </div>
                  </div>
                )}

                {/* Products */}
                <div className="text-sm">
                  <p className="text-stone-500 text-xs mb-2 flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3" />
                    Products Ordered
                  </p>
                  <div className="space-y-1.5 bg-stone-800/30 p-3 rounded-lg">
                    {order.products?.map((product, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-stone-300">
                        <span className="w-6 h-6 bg-stone-700 rounded flex items-center justify-center text-xs font-bold">
                          {product.quantity}
                        </span>
                        <span className="flex-1">
                          {product.color} - Size {product.size}
                        </span>
                      </div>
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
