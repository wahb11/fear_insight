"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function VisitorTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Don't track admin pages
    if (pathname?.startsWith("/admin")) {
      return
    }

    // Track page view
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {
      // Silently fail - analytics shouldn't break the site
    })
  }, [pathname])

  return null
}


