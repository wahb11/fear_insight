'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'

export default function LoginPage() {
  const { continueWithEmail, user, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace('/wishlist')
  }, [loading, user, router])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setBusy(true)
    const result = await continueWithEmail(email.trim(), password)
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.mode === 'signup') {
      setMessage('Check your email to confirm your account, then come back here to sign in.')
      return
    }
    router.push('/wishlist')
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 pt-28 pb-16 px-4">
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-nike-display text-4xl uppercase tracking-[0.06em]">Account</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Sign in if you already have an account. If you don&apos;t, we&apos;ll create one.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-neutral-500">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-neutral-500">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-neutral-900 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {busy ? 'Please wait…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
