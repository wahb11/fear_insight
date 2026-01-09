import { NextRequest, NextResponse } from "next/server"
import { existsSync } from "fs"
import path from "path"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filename = searchParams.get("file") || "f001.jpg"
    
    const filePath = path.join(process.cwd(), "public", "product", filename)
    const exists = existsSync(filePath)
    
    return NextResponse.json({
      filename,
      filePath,
      exists,
      publicUrl: `/product/${filename}`,
      message: exists 
        ? "File exists - should be accessible at /product/" + filename
        : "File NOT found - check if it exists in public/product/ folder"
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

