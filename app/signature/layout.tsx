import type { Metadata } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Signature',
  description: 'Fear Insight Signature essentials — standard sizing, everyday weight, clean fit.',
  alternates: { canonical: `${siteUrl}/signature` },
  openGraph: {
    title: 'Signature | Fear Insight',
    description: 'Fear Insight Signature essentials — standard sizing, everyday weight, clean fit.',
    url: `${siteUrl}/signature`,
    type: 'website',
  },
}

export default function SignatureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
