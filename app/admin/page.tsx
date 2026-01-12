"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut, Package, BarChart3, Plus, Loader2, Menu, X } from "lucide-react"
import OrdersTab from "@/components/admin/OrdersTab"
import AnalyticsTab from "@/components/admin/AnalyticsTab"
import ProductsTab from "@/components/admin/ProductsTab"

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-stone-400" />
          <p className="text-stone-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Header */}
      <div className="border-b border-stone-800 bg-stone-900 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent">
              Admin Portal
            </h1>
          </div>
          
          {/* Desktop Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="hidden sm:flex border-stone-700 text-stone-200 hover:bg-stone-800 hover:text-stone-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>

          {/* Mobile Menu Button */}
          <Button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            variant="ghost"
            size="sm"
            className="sm:hidden text-stone-200 hover:bg-stone-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-stone-800 bg-stone-900 px-4 py-3">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-stone-700 text-stone-200 hover:bg-stone-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Tabs defaultValue="orders" className="w-full">
          {/* Responsive Tab List */}
          <TabsList className="grid w-full grid-cols-3 bg-stone-900 border border-stone-800 rounded-lg p-1 mb-4 sm:mb-6">
            <TabsTrigger 
              value="orders" 
              className="data-[state=active]:bg-stone-800 data-[state=active]:text-stone-100 text-stone-400 text-xs sm:text-sm py-2 sm:py-2.5 rounded-md transition-all"
            >
              <Package className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Orders</span>
              <span className="xs:hidden">Orders</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-stone-800 data-[state=active]:text-stone-100 text-stone-400 text-xs sm:text-sm py-2 sm:py-2.5 rounded-md transition-all"
            >
              <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Analytics</span>
              <span className="xs:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="data-[state=active]:bg-stone-800 data-[state=active]:text-stone-100 text-stone-400 text-xs sm:text-sm py-2 sm:py-2.5 rounded-md transition-all"
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Products</span>
              <span className="xs:hidden">Items</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4 sm:mt-6">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="analytics" className="mt-4 sm:mt-6">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="products" className="mt-4 sm:mt-6">
            <ProductsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
