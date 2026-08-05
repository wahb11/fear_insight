import type { Metadata } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Fear Insight collects, uses, and protects your personal information when you shop with us.',
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy | Fear Insight',
    description:
      'How Fear Insight collects, uses, and protects your personal information when you shop with us.',
    url: `${siteUrl}/privacy`,
    type: 'website',
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
