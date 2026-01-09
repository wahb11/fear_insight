import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { writeFile, mkdir, readdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET_NAME = "products"
const IS_VERCEL = process.env.VERCEL === "1" // Vercel sets this automatically

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

    // Replicate renameAndGenerate.js logic to find highest fXXX number
    let maxNum = 0
    const validExt = [".jpg", ".jpeg", ".png", ".webp"]
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fearinsight.com"
    const imageUrls: string[] = []

    if (IS_VERCEL) {
      // On Vercel: Use Supabase Storage (filesystem is read-only)
      const { data: existingFiles, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list("", {
          limit: 1000,
          sortBy: { column: "name", order: "asc" },
        })

      if (listError && listError.message !== "Bucket not found") {
        console.error("Error listing files:", listError)
      }

      // Find highest fXXX number (same logic as renameAndGenerate.js)
      if (existingFiles) {
        const patternFiles = existingFiles.filter((file) => /^f\d{3}\./.test(file.name))
        for (const file of patternFiles) {
          const num = parseInt(file.name.substring(1, 4))
          if (num > maxNum) maxNum = num
        }
      }

      // Process and upload images to Supabase Storage
      for (const file of files) {
        maxNum++
        const ext = path.extname(file.name).toLowerCase() || ".jpg"
        if (!validExt.includes(ext)) continue

        const newName = `f${String(maxNum).padStart(3, "0")}${ext}`

        // Convert file to array buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
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

        // Use Supabase Storage URL for new uploads on Vercel
        // Existing images in public/product/ will continue to work
        const imageUrl = urlData.publicUrl
        imageUrls.push(imageUrl)
      }
    } else {
      // Local development: Use filesystem (like renameAndGenerate.js)
      const productFolder = path.join(process.cwd(), "public", "product")
      
      // Ensure folder exists
      if (!existsSync(productFolder)) {
        await mkdir(productFolder, { recursive: true })
      }

      // Get existing files (same logic as renameAndGenerate.js)
      const existingFiles = existsSync(productFolder)
        ? (await readdir(productFolder)).filter((f: string) => /^f\d{3}\./.test(f))
        : []

      // Find highest fXXX number
      for (const file of existingFiles) {
        const num = parseInt(file.substring(1, 4))
        if (num > maxNum) maxNum = num
      }

      // Process and save images to public/product/ (like renameAndGenerate.js)
      // imageUrls already declared above
      for (const file of files) {
        if (file.name.startsWith(".__tmp_rename")) continue

        const ext = path.extname(file.name).toLowerCase()
        if (!validExt.includes(ext)) continue

        // Skip if already matches pattern
        if (/^f\d{3}\./.test(file.name)) {
          const imageUrl = `${baseUrl}/product/${file.name}?color=`
          imageUrls.push(imageUrl)
          continue
        }

        // Rename file (same logic as renameAndGenerate.js)
        maxNum++
        const newName = `f${String(maxNum).padStart(3, "0")}${ext}`
        const filePath = path.join(productFolder, newName)

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // Generate URL (same format as renameAndGenerate.js)
        const imageUrl = `${baseUrl}/product/${newName}?color=`
        imageUrls.push(imageUrl)
      }
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
