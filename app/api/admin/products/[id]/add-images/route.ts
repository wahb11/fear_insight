import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET_NAME = "products"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const session = cookieStore.get("admin_session")

    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const formData = await req.formData()
    const files = formData.getAll("images") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 })
    }

    // Get existing product to merge images
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("images")
      .eq("id", id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
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
    const newImageUrls: string[] = []

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
        return NextResponse.json(
          { error: `Failed to upload ${file.name}: ${uploadError.message}` },
          { status: 500 }
        )
      }

      // Get public URL from Supabase Storage
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(newName)

      newImageUrls.push(urlData.publicUrl)
    }

    // Merge with existing images
    const existingImages = (existingProduct?.images || []) as string[]
    const updatedImages = [...existingImages, ...newImageUrls]

    // Update product with new images
    const { data, error } = await supabase
      .from("products")
      .update({ images: updatedImages })
      .eq("id", id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      product: data?.[0],
      newImages: newImageUrls,
    })
  } catch (error: any) {
    console.error("Add images error:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    )
  }
}
