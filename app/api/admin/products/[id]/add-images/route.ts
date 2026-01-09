import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { writeFile, readdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET_NAME = "products"
const IS_VERCEL = process.env.VERCEL === "1"

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

    // Replicate renameAndGenerate.js logic
    let maxNum = 0
    const validExt = [".jpg", ".jpeg", ".png", ".webp"]
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fearinsight.com"
    const newImageUrls: string[] = []

    if (IS_VERCEL) {
      // On Vercel: Use Supabase Storage
      const { data: existingFiles } = await supabase.storage
        .from(BUCKET_NAME)
        .list("", {
          limit: 1000,
          sortBy: { column: "name", order: "asc" },
        })

      // Find highest fXXX number
      if (existingFiles) {
        const patternFiles = existingFiles.filter((file) => /^f\d{3}\./.test(file.name))
        for (const file of patternFiles) {
          const num = parseInt(file.name.substring(1, 4))
          if (num > maxNum) maxNum = num
        }
      }

      // Upload to Supabase Storage
      for (const file of files) {
        maxNum++
        const ext = path.extname(file.name).toLowerCase() || ".jpg"
        if (!validExt.includes(ext)) continue

        const newName = `f${String(maxNum).padStart(3, "0")}${ext}`
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

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

        // Generate URL in same format as renameAndGenerate.js
        // Format: https://fearinsight.com/product/f001.jpg?color=
        // Next.js rewrite will proxy to Supabase Storage
        const imageUrl = `${baseUrl}/product/${newName}?color=`
        newImageUrls.push(imageUrl)
      }
    } else {
      // Local: Use filesystem (like renameAndGenerate.js)
      const productFolder = path.join(process.cwd(), "public", "product")
      
      if (!existsSync(productFolder)) {
        return NextResponse.json(
          { error: "Product folder not found" },
          { status: 500 }
        )
      }

      const existingFiles = (await readdir(productFolder)).filter((f: string) => /^f\d{3}\./.test(f))
      
      for (const file of existingFiles) {
        const num = parseInt(file.substring(1, 4))
        if (num > maxNum) maxNum = num
      }

      // Save to public/product/
      for (const file of files) {
        if (file.name.startsWith(".__tmp_rename")) continue

        const ext = path.extname(file.name).toLowerCase()
        if (!validExt.includes(ext)) continue

        if (/^f\d{3}\./.test(file.name)) {
          newImageUrls.push(`${baseUrl}/product/${file.name}?color=`)
          continue
        }

        maxNum++
        const newName = `f${String(maxNum).padStart(3, "0")}${ext}`
        const filePath = path.join(productFolder, newName)

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        newImageUrls.push(`${baseUrl}/product/${newName}?color=`)
      }
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
