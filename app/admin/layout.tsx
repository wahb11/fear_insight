"use client"

import { ReactNode } from "react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Admin pages don't need header/footer - they have their own layout
  return <div className="admin-layout">{children}</div>
}

