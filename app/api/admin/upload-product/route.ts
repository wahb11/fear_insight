import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET_NAME = "products"

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const session = cookieStore.get("admin_session")

    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const productData = JSON.parse(formData.get("productData") as string)
    const files = formData.getAll("images") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 })
    }

    // Get existing files from Supabase Storage to find the highest number
    const { data: existingFiles } = await supabase.storage
      .from(BUCKET_NAME)
      .list("", {
        limit: 1000,
        sortBy: { column: "name", order: "asc" },
      })

    // Find highest fXXX number
    let maxNum = 0
    if (existingFiles) {
      const patternFiles = existingFiles.filter((file) => /^f\d{3}\./.test(file.name))
      for (const file of patternFiles) {
        const num = parseInt(file.name.substring(1, 4))
        if (num > maxNum) maxNum = num
      }
    }

    // Process and upload images to Supabase Storage
    const validExt = [".jpg", ".jpeg", ".png", ".webp"]
    const imageUrls: string[] = []

    for (const file of files) {
      const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "jpg")
      if (!validExt.includes(ext)) continue

      maxNum++
      const newName = `f${String(maxNum).padStart(3, "0")}${ext}`

      // Convert file to array buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(newName, buffer, {
          contentType: file.type || `image/${ext.replace(".", "")}`,
          upsert: false,
        })

      if (uploadError) {
        console.error("Upload error for", newName, ":", uploadError)
        return NextResponse.json(
          { error: `Failed to upload ${file.name}: ${uploadError.message}` },
          { status: 500 }
        )
      }

      // Get public URL from Supabase Storage
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(newName)

      imageUrls.push(urlData.publicUrl)
    }

    // Validate category_id
    if (!productData.category_id) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      )
    }

    // Prepare product data for Supabase
    const productToInsert = {
      category_id: productData.category_id,
      name: productData.name,
      description: productData.description || "",
      colors: productData.colors || [],
      sizes: productData.sizes || [],
      images: imageUrls,
      ratings: productData.ratings || 0,
      price: parseFloat(productData.price),
      discount: parseFloat(productData.discount || 0),
      featured: productData.featured === true || productData.featured === "true",
      best_seller: productData.best_seller === true || productData.best_seller === "true",
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from("products")
      .insert([productToInsert])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      product: data?.[0],
      imageUrls,
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    )
  }
}
