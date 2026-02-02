import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123" // Change this in production!

    if (password === adminPassword) {
      // Set a session-only cookie - expires when browser closes, requires password every time
      const cookieStore = await cookies()
      cookieStore.set("admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        // No maxAge = session cookie that expires when browser closes
        // This requires password entry every time the browser is opened
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


