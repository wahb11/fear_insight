import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { COOKIE_NAME, isValidAdminToken } from '@/lib/admin-auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get(COOKIE_NAME)
    if (await isValidAdminToken(session?.value)) {
      return NextResponse.json({ authenticated: true })
    }
    return NextResponse.json({ authenticated: false }, { status: 401 })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
