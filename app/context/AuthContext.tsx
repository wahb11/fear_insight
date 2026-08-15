'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getBrowserSupabase } from '@/lib/supabase-browser'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirm: boolean }>
  continueWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: string | null; mode?: 'signin' | 'signup' }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getBrowserSupabase()

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await getBrowserSupabase().auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUp = async (email: string, password: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      return { error: data.error || 'Could not create account', needsConfirm: false }
    }
    return { error: null, needsConfirm: true }
  }

  const continueWithEmail = async (email: string, password: string) => {
    const existing = await signIn(email, password)
    if (!existing.error) {
      return { error: null, mode: 'signin' as const }
    }

    const created = await signUp(email, password)
    if (!created.error) {
      return { error: null, mode: 'signup' as const }
    }

    if (/already|registered|exists/i.test(created.error)) {
      return { error: 'Incorrect password for this email.' }
    }

    return { error: created.error }
  }

  const signOut = async () => {
    await getBrowserSupabase().auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, continueWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
