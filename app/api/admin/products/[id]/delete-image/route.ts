import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET_NAME = "products"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const session = cookieStore.get("admin_session")

    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await params in Next.js 14+
    const { id } = await params
    const { filename } = await req.json()

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 })
    }

    console.log(`Deleting image ${filename} for product ${id}`)

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filename])

    if (error) {
      console.error("Delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete image error:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    )
  }
}
