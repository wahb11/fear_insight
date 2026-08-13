"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut, Package, BarChart3, Plus, Loader2, Menu, X, FolderOpen } from "lucide-react"
import OrdersTab from "@/components/admin/OrdersTab"
import AnalyticsTab from "@/components/admin/AnalyticsTab"
import ProductsTab from "@/components/admin/ProductsTab"
import CategoriesTab from "@/components/admin/CategoriesTab"

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("orders")
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
    } catch {
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
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-neutral-400" />
          <p className="font-nike text-sm text-neutral-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900">
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4">
          <h1 className="font-nike-display text-xl uppercase tracking-[0.06em] text-black sm:text-2xl">
            Admin
          </h1>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="hidden border-neutral-900 bg-transparent font-nike text-neutral-900 hover:bg-neutral-900 hover:text-white sm:flex"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>

          <Button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            variant="ghost"
            size="sm"
            className="text-neutral-900 hover:bg-neutral-100 sm:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-neutral-200 bg-white px-4 py-3 sm:hidden">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-neutral-900 font-nike text-neutral-900 hover:bg-neutral-900 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>

      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-4 rounded-none border border-neutral-200 bg-white p-1 sm:mb-6">
            <TabsTrigger
              value="orders"
              className="rounded-none font-nike text-xs text-neutral-500 transition-all data-[state=active]:bg-neutral-900 data-[state=active]:text-white sm:text-sm"
            >
              <Package className="mr-1 h-4 w-4 sm:mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-none font-nike text-xs text-neutral-500 transition-all data-[state=active]:bg-neutral-900 data-[state=active]:text-white sm:text-sm"
            >
              <BarChart3 className="mr-1 h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="rounded-none font-nike text-xs text-neutral-500 transition-all data-[state=active]:bg-neutral-900 data-[state=active]:text-white sm:text-sm"
            >
              <Plus className="mr-1 h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Products</span>
              <span className="sm:hidden">Items</span>
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="rounded-none font-nike text-xs text-neutral-500 transition-all data-[state=active]:bg-neutral-900 data-[state=active]:text-white sm:text-sm"
            >
              <FolderOpen className="mr-1 h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Categories</span>
              <span className="sm:hidden">Cats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4 sm:mt-6">
            {activeTab === "orders" && <OrdersTab />}
          </TabsContent>
          <TabsContent value="analytics" className="mt-4 sm:mt-6">
            {activeTab === "analytics" && <AnalyticsTab />}
          </TabsContent>
          <TabsContent value="products" className="mt-4 sm:mt-6">
            {activeTab === "products" && <ProductsTab />}
          </TabsContent>
          <TabsContent value="categories" className="mt-4 sm:mt-6">
            {activeTab === "categories" && <CategoriesTab />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
