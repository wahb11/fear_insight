"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Package, Mail, MapPin, Calendar, DollarSign, User, ShoppingBag, Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Order } from "@/types/order"

const FULFILLMENT_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
] as const

export default function OrdersTab() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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
        setError("")
      } else {
        setError("Failed to fetch orders")
      }
    } catch {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const patchOrder = async (
    id: string,
    patch: { payment?: boolean; fulfillment_status?: string }
  ) => {
    setUpdatingId(id)
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Update failed")

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...data.order } : o))
      )
      toast({ title: "Updated", description: "Order status saved" })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update order",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-500" />
        <p className="text-neutral-500 text-sm mt-3">Loading orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-white border-neutral-200">
        <CardContent className="pt-6 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Package className="w-5 h-5" />
          All Orders ({orders.length})
        </h2>
      </div>

      {orders.length === 0 ? (
        <Card className="bg-white border-neutral-200">
          <CardContent className="pt-12 pb-12 text-center">
            <ShoppingBag className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-500 text-lg">No orders yet</p>
            <p className="text-neutral-500 text-sm mt-1">
              Orders will appear here when customers make purchases
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order) => {
            const busy = updatingId === order.id
            const fulfillment = order.fulfillment_status || "pending"
            return (
              <Card key={order.id} className="bg-white border-neutral-200 overflow-hidden">
                <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500" />
                      Order #{order.order_number || order.id.slice(0, 8)}
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap items-center">
                      <Badge
                        variant={order.payment ? "default" : "secondary"}
                        className={`text-xs ${
                          order.payment
                            ? "bg-green-600/20 text-green-700 border border-green-600/30"
                            : "bg-amber-600/20 text-amber-700 border border-amber-600/30"
                        }`}
                      >
                        {order.payment ? "✓ Paid" : "⏳ Pending"}
                      </Badge>
                      <Badge className="text-xs bg-neutral-100 text-neutral-700 border border-neutral-300/40 capitalize">
                        {fulfillment}
                      </Badge>
                      {order.promo_code && (
                        <Badge className="text-xs bg-neutral-100 text-neutral-700 border border-neutral-300">
                          <Tag className="w-3 h-3 mr-1" />
                          {order.promo_code}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 py-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-neutral-500 text-xs">Customer</p>
                        <p className="text-neutral-900 font-medium">
                          {order.first_name} {order.last_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-neutral-500 text-xs">Email</p>
                        <p className="text-neutral-900 font-medium truncate">{order.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-neutral-500 text-xs">Total</p>
                        <p className="text-neutral-900 font-bold text-base">
                          ${order.grand_total.toFixed(2)}
                        </p>
                        {order.discount && order.discount > 0 && (
                          <p className="text-green-700 text-xs">
                            -${order.discount.toFixed(2)} discount
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-neutral-500 text-xs">Date</p>
                        <p className="text-neutral-900 font-medium">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {order.address && (
                    <div className="flex items-start gap-2 text-sm bg-neutral-50 p-3 rounded-lg">
                      <MapPin className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-neutral-500 text-xs mb-1">Shipping Address</p>
                        <p className="text-neutral-800">
                          {order.address}, {order.city}, {order.state} {order.zip_code}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-sm">
                    <p className="text-neutral-500 text-xs mb-2 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" />
                      Products Ordered
                    </p>
                    <div className="space-y-1.5 bg-neutral-50 p-3 rounded-lg">
                      {order.products?.map((product, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-neutral-700">
                          <span className="w-6 h-6 bg-neutral-200 rounded flex items-center justify-center text-xs font-bold">
                            {product.quantity}
                          </span>
                          <span className="flex-1">
                            <span className="text-neutral-900 font-medium">
                              {product.name || "Unknown Product"}
                            </span>
                            <span className="text-neutral-500 text-xs ml-2">
                              {product.color} • Size {product.size}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-end border-t border-neutral-200 pt-4">
                    <div className="space-y-1.5 flex-1">
                      <p className="text-neutral-500 text-xs">Fulfillment</p>
                      <Select
                        value={fulfillment}
                        disabled={busy}
                        onValueChange={(value) =>
                          patchOrder(order.id, { fulfillment_status: value })
                        }
                      >
                        <SelectTrigger className="bg-neutral-100 border-neutral-200 text-neutral-900 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-100 border-neutral-200">
                          {FULFILLMENT_OPTIONS.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                              className="text-neutral-900"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        patchOrder(order.id, { payment: !order.payment })
                      }
                      className={`h-9 ${
                        order.payment
                          ? "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                          : "bg-green-50 text-green-800 hover:bg-green-100 border border-green-200"
                      }`}
                    >
                      {busy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : order.payment ? (
                        "Mark unpaid"
                      ) : (
                        "Mark paid"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
