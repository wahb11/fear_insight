import type { Metadata } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Insignia',
  description: 'Marks of origin — manifesto energy in clean, lasting silhouettes.',
  alternates: { canonical: `${siteUrl}/insignia` },
}

export default function InsigniaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
