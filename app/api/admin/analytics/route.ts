import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use service role key for admin operations to bypass RLS if needed
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const session = cookieStore.get("admin_session")

    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get visitor stats from analytics table (we'll create this)
    const { data: analytics, error: analyticsError } = await supabase
      .from("analytics")
      .select("*")
      .order("date", { ascending: false })
      .limit(30) // Last 30 days

    // Get total orders
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })

    // Get paid orders
    const { count: paidOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("payment", true)

    // Get total revenue
    const { data: revenueData } = await supabase
      .from("orders")
      .select("grand_total")
      .eq("payment", true)

    const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.grand_total || 0), 0) || 0

    // Get total visitors (sum of all visitors from analytics)
    const totalVisitors = analytics?.reduce((sum, day) => sum + (day.visitors || 0), 0) || 0

    // Get today's visitors
    const today = new Date().toISOString().split("T")[0]
    const todayData = analytics?.find((a) => a.date === today)
    const todayVisitors = todayData?.visitors || 0

    return NextResponse.json({
      totalVisitors,
      todayVisitors,
      totalOrders: totalOrders || 0,
      paidOrders: paidOrders || 0,
      totalRevenue,
      dailyStats: analytics || [],
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    )
  }
}

