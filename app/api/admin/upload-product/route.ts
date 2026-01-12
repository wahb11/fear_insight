import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET_NAME = "products"
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const validExt = [".jpg", ".jpeg", ".png", ".webp"]

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const session = cookieStore.get("admin_session")

    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const productDataStr = formData.get("productData") as string
    
    if (!productDataStr) {
      return NextResponse.json({ error: "Product data is required" }, { status: 400 })
    }

    let productData
    try {
      productData = JSON.parse(productDataStr)
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid product data format" }, { status: 400 })
    }

    const files = formData.getAll("images") as File[]

    // Validate files exist
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 })
    }

    // Validate required product fields
    if (!productData.name || !productData.name.trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 })
    }

    if (!productData.category_id) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 })
    }

    if (!productData.price || isNaN(parseFloat(productData.price)) || parseFloat(productData.price) <= 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 })
    }

    // Get existing files from Supabase Storage to find the highest number
    const { data: existingFiles, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list("", {
        limit: 1000,
        sortBy: { column: "name", order: "asc" },
      })

    if (listError) {
      console.error("Error listing files:", listError)
      return NextResponse.json({ error: "Failed to access storage" }, { status: 500 })
    }

    // Find highest fXXX number
    let maxNum = 0
    if (existingFiles) {
      const patternFiles = existingFiles.filter((file) => /^f\d{3}\./.test(file.name))
      for (const file of patternFiles) {
        const num = parseInt(file.name.substring(1, 4))
        if (!isNaN(num) && num > maxNum) maxNum = num
      }
    }

    // Process and upload images to Supabase Storage
    const imageUrls: string[] = []
    const uploadedFileNames: string[] = []

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        // Cleanup uploaded files on error
        if (uploadedFileNames.length > 0) {
          await supabase.storage.from(BUCKET_NAME).remove(uploadedFileNames)
        }
        return NextResponse.json(
          { error: `File ${file.name} exceeds maximum size of 10MB` },
          { status: 400 }
        )
      }

      const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "jpg")
      if (!validExt.includes(ext)) {
        console.log(`Skipping invalid file extension: ${ext} for file: ${file.name}`)
        continue
      }

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
        // Cleanup uploaded files on error
        if (uploadedFileNames.length > 0) {
          await supabase.storage.from(BUCKET_NAME).remove(uploadedFileNames)
        }
        return NextResponse.json(
          { error: `Failed to upload ${file.name}: ${uploadError.message}` },
          { status: 500 }
        )
      }

      uploadedFileNames.push(newName)

      // Get public URL from Supabase Storage
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(newName)

      if (!urlData?.publicUrl) {
        console.error("Failed to get public URL for", newName)
        // Cleanup uploaded files on error
        if (uploadedFileNames.length > 0) {
          await supabase.storage.from(BUCKET_NAME).remove(uploadedFileNames)
        }
        return NextResponse.json(
          { error: `Failed to generate URL for ${file.name}` },
          { status: 500 }
        )
      }

      imageUrls.push(urlData.publicUrl)
    }

    // Validate at least one image was successfully uploaded
    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: "No valid images were uploaded. Supported formats: JPG, JPEG, PNG, WEBP" },
        { status: 400 }
      )
    }

    // Prepare product data for Supabase
    const productToInsert = {
      category_id: productData.category_id,
      name: productData.name.trim(),
      description: (productData.description || "").trim(),
      colors: productData.colors || [],
      sizes: productData.sizes || [],
      images: imageUrls,
      ratings: parseFloat(productData.ratings) || 0,
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
      // Cleanup uploaded files if database insert fails
      if (uploadedFileNames.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(uploadedFileNames)
      }
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
      { error: error.message || "An error occurred while uploading product" },
      { status: 500 }
    )
  }
}
