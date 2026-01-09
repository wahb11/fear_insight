import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123" // Change this in production!

    if (password === adminPassword) {
      // Set a secure cookie for admin session
      const cookieStore = await cookies()
      cookieStore.set("admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}


