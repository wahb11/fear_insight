import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow access to login page
  if (pathname === "/admin/login") {
    return NextResponse.next()
  }
  
  // Protect admin routes (except login)
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("admin_session")
    
    // If not authenticated, redirect to login
    if (session?.value !== "authenticated") {
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
