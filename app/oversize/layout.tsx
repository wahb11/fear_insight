import type { Metadata } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Oversize',
  description: 'One-size Fear Insight hoodies — relaxed cut, built to drape.',
  alternates: { canonical: `${siteUrl}/oversize` },
  openGraph: {
    title: 'Oversize | Fear Insight',
    description: 'One-size Fear Insight hoodies — relaxed cut, built to drape.',
    url: `${siteUrl}/oversize`,
    type: 'website',
  },
}

export default function OversizeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
