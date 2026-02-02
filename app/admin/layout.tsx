import { ReactNode } from "react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Admin pages don't need header/footer - they have their own layout
  // Authentication is handled by middleware.ts
  return <div className="admin-layout">{children}</div>
}

