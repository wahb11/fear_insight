"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users, ShoppingBag, DollarSign, TrendingUp, BarChart3, Eye, Calendar } from "lucide-react"

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
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-stone-400" />
        <p className="text-stone-500 text-sm mt-3">Loading analytics...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="bg-stone-900 border-stone-800">
        <CardContent className="pt-6 text-center">
          <BarChart3 className="w-12 h-12 text-stone-600 mx-auto mb-4" />
          <p className="text-red-400">{error || "No data available"}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Visitors */}
        <Card className="bg-gradient-to-br from-stone-900 to-stone-800 border-stone-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-stone-400">
              Visitors
            </CardTitle>
            <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold text-stone-100">
              {data.totalVisitors.toLocaleString()}
            </div>
            <p className="text-xs text-stone-500 mt-0.5 sm:mt-1 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Today: {data.todayVisitors}
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="bg-gradient-to-br from-stone-900 to-stone-800 border-stone-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-stone-400">
              Orders
            </CardTitle>
            <div className="p-1.5 sm:p-2 bg-purple-500/10 rounded-lg">
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold text-stone-100">
              {data.totalOrders}
            </div>
            <p className="text-xs text-stone-500 mt-0.5 sm:mt-1 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Paid: {data.paidOrders}
            </p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="bg-gradient-to-br from-stone-900 to-stone-800 border-stone-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-stone-400">
              Revenue
            </CardTitle>
            <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold text-stone-100">
              ${data.totalRevenue.toFixed(0)}
            </div>
            <p className="text-xs text-stone-500 mt-0.5 sm:mt-1">From paid orders</p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="bg-gradient-to-br from-stone-900 to-stone-800 border-stone-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-stone-400">
              Conversion
            </CardTitle>
            <div className="p-1.5 sm:p-2 bg-amber-500/10 rounded-lg">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold text-stone-100">
              {data.totalVisitors > 0
                ? ((data.totalOrders / data.totalVisitors) * 100).toFixed(1)
                : "0.0"}%
            </div>
            <p className="text-xs text-stone-500 mt-0.5 sm:mt-1">Orders / Visitors</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Stats Table */}
      <Card className="bg-stone-900 border-stone-800">
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            Daily Statistics
          </CardTitle>
          <p className="text-xs text-stone-500 mt-1">Last 30 days</p>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-4">
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full text-sm min-w-[300px]">
              <thead>
                <tr className="border-b border-stone-800">
                  <th className="text-left py-2 px-3 sm:px-4 text-stone-400 text-xs sm:text-sm font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Date
                    </span>
                  </th>
                  <th className="text-right py-2 px-3 sm:px-4 text-stone-400 text-xs sm:text-sm font-medium">
                    <span className="flex items-center gap-1 justify-end">
                      <Users className="w-3 h-3" />
                      Visitors
                    </span>
                  </th>
                  <th className="text-right py-2 px-3 sm:px-4 text-stone-400 text-xs sm:text-sm font-medium">
                    <span className="flex items-center gap-1 justify-end">
                      <Eye className="w-3 h-3" />
                      Views
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.dailyStats.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-stone-500">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 text-stone-600" />
                      No data available yet
                    </td>
                  </tr>
                ) : (
                  data.dailyStats.map((day, index) => (
                    <tr 
                      key={day.date} 
                      className={`border-b border-stone-800/50 ${
                        index === 0 ? 'bg-stone-800/30' : ''
                      }`}
                    >
                      <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-stone-300 text-xs sm:text-sm">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: window.innerWidth > 640 ? 'numeric' : undefined
                        })}
                      </td>
                      <td className="text-right py-2.5 sm:py-3 px-3 sm:px-4 text-stone-100 font-medium text-xs sm:text-sm">
                        {day.visitors.toLocaleString()}
                      </td>
                      <td className="text-right py-2.5 sm:py-3 px-3 sm:px-4 text-stone-100 font-medium text-xs sm:text-sm">
                        {day.page_views.toLocaleString()}
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
