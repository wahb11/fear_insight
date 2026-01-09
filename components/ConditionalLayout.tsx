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
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}


