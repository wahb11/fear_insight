"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

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
    <>
      {/* Non-blocking top progress bar - does not cover the page */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] sm:h-[3px] overflow-hidden">
        <div
          className="h-full rounded-r-full"
          style={{
            background: "linear-gradient(90deg, #78716c, #d6d3d1, #78716c)",
            animation: "navProgressBar 1.5s ease-in-out infinite",
          }}
        />
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes navProgressBar {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 70%;
            margin-left: 15%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}</style>
    </>
  )
}
