"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import ProductLoading from "@/app/product/[id]/loading"

interface NavigationLoaderContextType {
  startLoading: () => void
  stopLoading: () => void
  isLoading: boolean
}

const NavigationLoaderContext = createContext<NavigationLoaderContextType>({
  startLoading: () => {},
  stopLoading: () => {},
  isLoading: false,
})

export function useNavigationLoader() {
  return useContext(NavigationLoaderContext)
}

export function NavigationLoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startLoading = useCallback(() => {
    // Small delay to avoid flash on fast navigations
    timeoutRef.current = setTimeout(() => {
      setIsLoading(true)
    }, 80)
    // No safety timeout — loading persists until pathname changes
    // (i.e. navigation actually completes)
  }, [])

  const stopLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsLoading(false)
  }, [])

  // Auto-stop loading when pathname changes (navigation completed)
  useEffect(() => {
    stopLoading()
  }, [pathname, stopLoading])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <NavigationLoaderContext.Provider value={{ startLoading, stopLoading, isLoading }}>
      {children}
      {isLoading && <NavigationOverlay />}
    </NavigationLoaderContext.Provider>
  )
}

function NavigationOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] bg-stone-950 overflow-y-auto">
      <ProductLoading />
    </div>
  )
}
