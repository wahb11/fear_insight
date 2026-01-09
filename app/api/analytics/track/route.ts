import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: NextRequest) {
  try {
    const { path: pagePath } = await req.json()
    const today = new Date().toISOString().split("T")[0]

    // Check if analytics table exists, if not, we'll handle gracefully
    // First, try to get today's record
    const { data: existing } = await supabase
      .from("analytics")
      .select("*")
      .eq("date", today)
      .single()

    if (existing) {
      // Update existing record
      await supabase
        .from("analytics")
        .update({
          visitors: (existing.visitors || 0) + 1,
          page_views: (existing.page_views || 0) + 1,
        })
        .eq("date", today)
    } else {
      // Create new record
      await supabase.from("analytics").insert([
        {
          date: today,
          visitors: 1,
          page_views: 1,
        },
      ])
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    // Silently fail - analytics shouldn't break the site
    console.error("Analytics error:", error)
    return NextResponse.json({ success: false }, { status: 200 })
  }
}


