import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("admin_session")

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}


