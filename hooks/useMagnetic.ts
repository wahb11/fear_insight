'use client'

import { useRef, useEffect, useCallback } from 'react'

/**
 * Subtle cursor-follow magnetic hover for nav/utility links.
 * Strength is intentionally low (~0.25) for a refined, not extreme, feel.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.28, disabled = false) {
  const ref = useRef<T>(null)

  const handleMove = useCallback(
    (e: MouseEvent) => {
      const el = ref.current
      if (!el || disabled) return
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`
    },
    [strength, disabled]
  )

  const handleLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translate(0px, 0px)'
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return

    el.style.transition = 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)

    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
      el.style.transform = ''
    }
  }, [handleMove, handleLeave, disabled])

  return ref
}
