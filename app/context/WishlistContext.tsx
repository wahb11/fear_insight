'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getBrowserSupabase } from '@/lib/supabase-browser'
import { useAuth } from '@/app/context/AuthContext'

const STORAGE_KEY = 'fear-insight-wishlist'

interface WishlistContextType {
  ids: string[]
  count: number
  has: (productId: string) => boolean
  toggle: (productId: string) => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

function readLocal(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

function writeLocal(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [ids, setIds] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setIds(readLocal())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    writeLocal(ids)
  }, [ids, ready])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    const sync = async () => {
      const supabase = getBrowserSupabase()
      const { data, error } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id)

      if (cancelled || error) return

      const remote = (data || []).map((row) => row.product_id as string)
      const local = readLocal()
      const merged = Array.from(new Set([...remote, ...local]))

      const missing = local.filter((id) => !remote.includes(id))
      if (missing.length > 0) {
        await supabase.from('wishlist').insert(
          missing.map((product_id) => ({ user_id: user.id, product_id }))
        )
      }

      if (!cancelled) setIds(merged)
    }

    sync()
    return () => {
      cancelled = true
    }
  }, [user])

  const has = useCallback((productId: string) => ids.includes(productId), [ids])

  const toggle = useCallback(
    async (productId: string) => {
      const exists = ids.includes(productId)
      const next = exists ? ids.filter((id) => id !== productId) : [...ids, productId]
      setIds(next)

      if (!user) return

      try {
        const supabase = getBrowserSupabase()
        if (exists) {
          await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId)
        } else {
          await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId })
        }
      } catch {
        // Heart still works locally if the wishlist table is not migrated yet
      }
    },
    [ids, user]
  )

  const value = useMemo(
    () => ({ ids, count: ids.length, has, toggle }),
    [ids, has, toggle]
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
