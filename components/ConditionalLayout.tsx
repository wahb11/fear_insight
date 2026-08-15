"use client"

import { usePathname } from "next/navigation"
import { ReactNode } from "react"
import Header from "@/components/layouts/Header"
import Footer from "@/components/layouts/Footer"

export default function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith("/admin")

  if (isAdminPage) {
    return <>{children}</>
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <Header />
      {children}
      <Footer />
    </div>
  )
}


