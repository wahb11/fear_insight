import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  adminCookieOptions,
  COOKIE_NAME,
  createAdminSessionToken,
  getAdminSecret,
} from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    const adminPassword = getAdminSecret()

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin password is not configured' },
        { status: 500 }
      )
    }

    if (typeof password !== 'string' || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const token = await createAdminSessionToken()
    if (!token) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, adminCookieOptions())

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
