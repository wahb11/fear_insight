import type { Metadata } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Oversized',
  description: 'Volume and drape — streetwear scale with structure.',
  alternates: { canonical: `${siteUrl}/oversized` },
}

export default function OversizedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
