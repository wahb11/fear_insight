"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users, ShoppingBag, DollarSign, TrendingUp } from "lucide-react"

interface AnalyticsData {
  totalVisitors: number
  todayVisitors: number
  totalOrders: number
  paidOrders: number
  totalRevenue: number
  dailyStats: Array<{
    date: string
    visitors: number
    page_views: number
  }>
}

export default function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAnalytics()
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics")
      if (res.ok) {
        const analyticsData = await res.json()
        setData(analyticsData)
      } else {
        setError("Failed to fetch analytics")
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

  if (error || !data) {
    return (
      <Card className="bg-stone-900 border-stone-800">
        <CardContent className="pt-6">
          <p className="text-red-400">{error || "No data available"}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-stone-900 border-stone-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-400">
              Total Visitors
            </CardTitle>
            <Users className="h-4 w-4 text-stone-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-100">
              {data.totalVisitors.toLocaleString()}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Today: {data.todayVisitors}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-stone-900 border-stone-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-400">
              Total Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-stone-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-100">
              {data.totalOrders}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Paid: {data.paidOrders}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-stone-900 border-stone-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-400">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-stone-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-100">
              ${data.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-stone-500 mt-1">From paid orders</p>
          </CardContent>
        </Card>

        <Card className="bg-stone-900 border-stone-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-400">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-stone-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-100">
              {data.totalVisitors > 0
                ? ((data.totalOrders / data.totalVisitors) * 100).toFixed(2)
                : "0.00"}
              %
            </div>
            <p className="text-xs text-stone-500 mt-1">Orders / Visitors</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Stats Table */}
      <Card className="bg-stone-900 border-stone-800">
        <CardHeader>
          <CardTitle>Daily Statistics (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800">
                  <th className="text-left py-2 px-4 text-stone-400">Date</th>
                  <th className="text-right py-2 px-4 text-stone-400">Visitors</th>
                  <th className="text-right py-2 px-4 text-stone-400">Page Views</th>
                </tr>
              </thead>
              <tbody>
                {data.dailyStats.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-stone-400">
                      No data available
                    </td>
                  </tr>
                ) : (
                  data.dailyStats.map((day) => (
                    <tr key={day.date} className="border-b border-stone-800/50">
                      <td className="py-2 px-4 text-stone-300">
                        {new Date(day.date).toLocaleDateString()}
                      </td>
                      <td className="text-right py-2 px-4 text-stone-300">
                        {day.visitors}
                      </td>
                      <td className="text-right py-2 px-4 text-stone-300">
                        {day.page_views}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


