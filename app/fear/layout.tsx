import type { Metadata } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Fear',
  description: 'Shop the full Fear Insight drop — every piece, every mood.',
  alternates: { canonical: `${siteUrl}/fear` },
  openGraph: {
    title: 'Fear | Fear Insight',
    description: 'Shop the full Fear Insight drop — every piece, every mood.',
    url: `${siteUrl}/fear`,
    type: 'website',
  },
}

export default function FearLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
