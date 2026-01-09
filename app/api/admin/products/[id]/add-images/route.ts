import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { writeFile, readdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

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

    // Get the product folder path
    const productFolder = path.join(process.cwd(), "public", "product")
    
    // Ensure the folder exists
    if (!existsSync(productFolder)) {
      return NextResponse.json(
        { error: "Product folder not found" },
        { status: 500 }
      )
    }

    // Get existing files to find the highest number
    const existingFiles = existsSync(productFolder)
      ? (await readdir(productFolder)).filter((f: string) => /^f\d{3}\./.test(f))
      : []

    let maxNum = 0
    for (const file of existingFiles) {
      const num = parseInt(file.substring(1, 4))
      if (num > maxNum) maxNum = num
    }

    // Process and save new images
    const newImageUrls: string[] = []
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fearinsight.com"
    
    for (const file of files) {
      maxNum++
      const ext = path.extname(file.name).toLowerCase() || ".jpg"
      const newName = `f${String(maxNum).padStart(3, "0")}${ext}`
      const filePath = path.join(productFolder, newName)

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Generate URL
      const imageUrl = `${baseUrl}/product/${newName}`
      newImageUrls.push(imageUrl)
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


