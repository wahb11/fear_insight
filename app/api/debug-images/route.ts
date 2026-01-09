import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { readdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(req: NextRequest) {
  try {
    // Get products from database
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, images")
      .limit(3)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check what files exist in public/product/
    const productFolder = path.join(process.cwd(), "public", "product")
    let filesInFolder: string[] = []
    
    if (existsSync(productFolder)) {
      filesInFolder = await readdir(productFolder)
    }

    // Analyze each product
    const analysis = products?.map(p => {
      const dbUrls = p.images || []
      const firstUrl = dbUrls[0] || null
      
      // Extract filename from URL
      let filenameFromUrl = null
      if (firstUrl) {
        try {
          const url = new URL(firstUrl)
          filenameFromUrl = url.pathname.split('/').pop()?.split('?')[0] || null
        } catch {
          // If not a full URL, try to extract filename
          filenameFromUrl = firstUrl.split('/').pop()?.split('?')[0] || null
        }
      }

      // Check if file exists
      const fileExists = filenameFromUrl ? filesInFolder.includes(filenameFromUrl) : false

      return {
        productId: p.id,
        productName: p.name,
        imageCount: dbUrls.length,
        firstImageUrl: firstUrl,
        extractedFilename: filenameFromUrl,
        fileExistsInFolder: fileExists,
        allUrls: dbUrls
      }
    }) || []

    return NextResponse.json({
      filesInPublicProduct: filesInFolder.slice(0, 10), // First 10 files
      totalFilesInFolder: filesInFolder.length,
      products: analysis,
      folderPath: productFolder,
      folderExists: existsSync(productFolder)
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    )
  }
}

