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
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startLoading = useCallback(() => {
    // Small delay to avoid flash on fast navigations
    timeoutRef.current = setTimeout(() => {
      setIsLoading(true)
    }, 80)

    // Safety timeout: auto-hide after 3 seconds to prevent stuck overlays on mobile
    safetyTimeoutRef.current = setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }, [])

  const stopLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current)
      safetyTimeoutRef.current = null
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
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current)
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
      {/* Fixed overlay - touch-action none prevents scroll on mobile while loading */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          backgroundColor: "rgba(12, 10, 9, 0.88)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div className="flex flex-col items-center gap-4 sm:gap-5 px-4">
          {/* Spinner - smaller on mobile */}
          <div className="relative w-12 h-12 sm:w-16 sm:h-16">
            {/* Outer ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: "3px solid transparent",
                borderTopColor: "#d6d3d1",
                borderRightColor: "#78716c",
                animation: "navSpin 1s linear infinite",
              }}
            />
            {/* Inner ring */}
            <div
              className="absolute inset-1.5 sm:inset-2 rounded-full"
              style={{
                border: "2px solid transparent",
                borderBottomColor: "#a8a29e",
                borderLeftColor: "#57534e",
                animation: "navSpin 0.8s linear infinite reverse",
              }}
            />
            {/* Center dot */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: "#d6d3d1" }}
            />
          </div>

          {/* Text - smaller on mobile */}
          <p
            className="text-xs sm:text-sm font-medium tracking-wider animate-pulse"
            style={{ color: "#a8a29e" }}
          >
            LOADING
          </p>
        </div>
      </div>

      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[10000] h-[2px] sm:h-[3px] overflow-hidden">
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
        @keyframes navSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
