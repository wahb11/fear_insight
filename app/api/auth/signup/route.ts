import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendVerificationEmail } from '@/functions/sendVerificationEmail'

function getAdminAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin env missing')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, '')
    const redirectTo = `${siteUrl}/auth/callback`

    const supabase = getAdminAuthClient()
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: { redirectTo },
    })

    if (error) {
      const message = error.message || 'Could not create account'
      const status = /already|registered|exists/i.test(message) ? 409 : 400
      return NextResponse.json({ error: message }, { status })
    }

    const confirmUrl = data.properties?.action_link
    if (!confirmUrl) {
      return NextResponse.json({ error: 'Could not create verification link' }, { status: 500 })
    }

    await sendVerificationEmail(email, confirmUrl)
    return NextResponse.json({ ok: true, needsConfirm: true })
  } catch (error: any) {
    console.error('Signup email error:', error?.message || error)
    return NextResponse.json(
      { error: error?.message || 'Could not send verification email' },
      { status: 500 }
    )
  }
}
