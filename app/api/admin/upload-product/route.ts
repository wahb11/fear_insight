import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { writeFile, mkdir, readdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use service role key for admin operations to bypass RLS if needed
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

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

    // Get the product folder path
    const productFolder = path.join(process.cwd(), "public", "product")
    
    // Ensure the folder exists
    if (!existsSync(productFolder)) {
      await mkdir(productFolder, { recursive: true })
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

    // Process and save images
    const imageUrls: string[] = []
    
    for (const file of files) {
      maxNum++
      const ext = path.extname(file.name).toLowerCase() || ".jpg"
      const newName = `f${String(maxNum).padStart(3, "0")}${ext}`
      const filePath = path.join(productFolder, newName)

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Generate URL (adjust domain as needed)
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fearinsight.com"
      const imageUrl = `${baseUrl}/product/${newName}`
      imageUrls.push(imageUrl)
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
      category_id: productData.category_id, // UUID string from categories table
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
      // Note: material, care, fullDescription, shipping are not in your schema
      // If you need these, you'll need to add them to the products table
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

