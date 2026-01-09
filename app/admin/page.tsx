"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut, Package, BarChart3, Plus, Loader2 } from "lucide-react"
import OrdersTab from "@/components/admin/OrdersTab"
import AnalyticsTab from "@/components/admin/AnalyticsTab"
import ProductsTab from "@/components/admin/ProductsTab"

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/check-auth")
      if (res.ok) {
        setAuthenticated(true)
      } else {
        setAuthenticated(false)
        router.push("/admin/login")
      }
    } catch (error) {
      setAuthenticated(false)
      router.push("/admin/login")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  if (loading || authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Header */}
      <div className="border-b border-stone-800 bg-stone-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-stone-700 text-stone-200 hover:bg-stone-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-stone-900 border-stone-800">
            <TabsTrigger value="orders" className="data-[state=active]:bg-stone-800">
              <Package className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-stone-800">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-stone-800">
              <Plus className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <ProductsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


