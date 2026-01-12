import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(
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

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    // Fetch product by ID
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product: data })
  } catch (error: any) {
    console.error("Get product error:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const body = await req.json()

    // IMPORTANT: Prevent accidental image overwrite
    // Images should only be updated via the add-images endpoint
    if (body.hasOwnProperty("images")) {
      return NextResponse.json(
        { error: "Images cannot be updated via this endpoint. Use /add-images endpoint instead." },
        { status: 400 }
      )
    }

    // Validate required fields if provided
    if (body.name !== undefined && (!body.name || !body.name.trim())) {
      return NextResponse.json({ error: "Product name cannot be empty" }, { status: 400 })
    }

    if (body.price !== undefined && (isNaN(parseFloat(body.price)) || parseFloat(body.price) <= 0)) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 })
    }

    // Check if product exists
    const { data: existingProduct, error: checkError } = await supabase
      .from("products")
      .select("id")
      .eq("id", id)
      .single()

    if (checkError || !existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Prepare update data (sanitize)
    const updateData: any = {}
    
    // Allowed fields for update (excluding images)
    const allowedFields = [
      "name", "description", "price", "discount", "category_id",
      "colors", "sizes", "ratings", "featured", "best_seller"
    ]

    for (const field of allowedFields) {
      if (body.hasOwnProperty(field)) {
        if (field === "name" && body[field]) {
          updateData[field] = body[field].trim()
        } else {
          updateData[field] = body[field]
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    // Update product
    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product: data[0] })
  } catch (error: any) {
    console.error("Update product error:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    )
  }
}
