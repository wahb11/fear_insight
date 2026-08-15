'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabase-browser'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = getBrowserSupabase()

    const go = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.replace('/wishlist')
        return
      }

      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setError(exchangeError.message)
          return
        }
        router.replace('/wishlist')
        return
      }

      setTimeout(async () => {
        const again = await supabase.auth.getSession()
        if (again.data.session) router.replace('/wishlist')
        else setError('Could not confirm this link. Try signing in, or request a new email.')
      }, 800)
    }

    go()
  }, [router])

  return (
    <div className="min-h-screen bg-white text-neutral-900 pt-28 px-4">
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-nike-display text-3xl uppercase tracking-[0.06em]">
          Confirming…
        </h1>
        {error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">Verifying your email.</p>
        )}
      </div>
    </div>
  )
}
