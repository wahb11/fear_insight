import type { Metadata } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Chronicles',
  description: 'Stories worn daily — faith, purpose, and growth.',
  alternates: { canonical: `${siteUrl}/chronicles` },
}

export default function ChroniclesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
