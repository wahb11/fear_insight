import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET_NAME = "products"
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const validExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"]

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

    // Validate product ID
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const formData = await req.formData()
    const files = formData.getAll("images") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 })
    }

    // Fetch existing product to preserve existing images
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("images, id")
      .eq("id", id)
      .single()

    if (fetchError || !existingProduct) {
      console.error("Fetch error:", fetchError)
      return NextResponse.json(
        { error: fetchError?.message || "Product not found" },
        { status: 404 }
      )
    }

    // Get existing images exactly as they are - NO VALIDATION, NO CHANGES
    const existingImages = Array.isArray(existingProduct.images)
      ? (existingProduct.images as string[])
      : []

    // Get existing files from Supabase Storage to find the highest number
    const { data: existingFiles, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list("", {
        limit: 1000,
        sortBy: { column: "name", order: "asc" },
      })

    if (listError) {
      console.error("List error:", listError)
      // Continue anyway, start from 0
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

    // Process and upload NEW images to Supabase Storage
    const newImageUrls: string[] = []
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

      console.log(`Uploading ${newName} to bucket ${BUCKET_NAME}...`)

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

      console.log(`Uploaded successfully. URL: ${urlData.publicUrl}`)
      newImageUrls.push(urlData.publicUrl)
    }

    if (newImageUrls.length === 0) {
      return NextResponse.json(
        { error: "No valid images were uploaded. Supported formats: JPG, JPEG, PNG, WEBP, GIF" },
        { status: 400 }
      )
    }

    // Simple merge: existing images first, then new images
    // NO VALIDATION, NO FILTERING, NO CHANGES to existing URLs
    const updatedImages = [...existingImages, ...newImageUrls]

    console.log(`Updating product ${id} with ${updatedImages.length} images (${existingImages.length} existing + ${newImageUrls.length} new)`)

    // Update product with merged images
    const { data, error } = await supabase
      .from("products")
      .update({ images: updatedImages })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Update error:", error)
      // Cleanup uploaded files if database update fails
      if (uploadedFileNames.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(uploadedFileNames)
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      // Cleanup uploaded files if product not found
      if (uploadedFileNames.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(uploadedFileNames)
      }
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    console.log("Product updated successfully")

    return NextResponse.json({
      success: true,
      product: data[0],
      newImages: newImageUrls,
      totalImages: updatedImages.length,
    })
  } catch (error: any) {
    console.error("Add images error:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while adding images" },
      { status: 500 }
    )
  }
}
