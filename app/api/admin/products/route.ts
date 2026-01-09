import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
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

    // Verify Supabase connection
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials")
      return NextResponse.json(
        { error: "Server configuration error: Missing Supabase credentials" },
        { status: 500 }
      )
    }

    // Fetch all products
    const { data, error } = await supabase
      .from("products")
      .select("*")

    if (error) {
      console.error("Supabase query error:", error)
      return NextResponse.json(
        { 
          error: error.message,
          details: error.details || "Check server logs for more information"
        },
        { status: 500 }
      )
    }

    // Sort by name if no created_at column exists
    const sortedData = data ? [...data].sort((a, b) => a.name.localeCompare(b.name)) : []

    return NextResponse.json({ products: sortedData })
  } catch (error: any) {
    console.error("Unexpected error in products API:", error)
    return NextResponse.json(
      { 
        error: error.message || "An error occurred",
        type: error.name || "UnknownError"
      },
      { status: 500 }
    )
  }
}

