const COOKIE_NAME = 'admin_session'
const TOKEN_PAYLOAD = 'fear-insight-admin-v1'

function getAdminSecret(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim()
  if (!password) return null
  return password
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return out === 0
}

/** HMAC session token derived from ADMIN_PASSWORD — not a forgeable literal. */
export async function createAdminSessionToken(): Promise<string | null> {
  const secret = getAdminSecret()
  if (!secret) return null
  return hmacSha256Hex(secret, TOKEN_PAYLOAD)
}

export async function isValidAdminToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  const expected = await createAdminSessionToken()
  if (!expected) return false
  return timingSafeEqualHex(token, expected)
}

export async function requireAdmin(): Promise<
  { ok: true } | { ok: false; response: Response }
> {
  const { cookies } = await import('next/headers')
  const { NextResponse } = await import('next/server')
  const cookieStore = await cookies()
  const session = cookieStore.get(COOKIE_NAME)
  if (!(await isValidAdminToken(session?.value))) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  return { ok: true }
}

export function adminCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 12,
  }
}

export { COOKIE_NAME, getAdminSecret }
