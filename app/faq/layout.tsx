import type { Metadata } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Fear Insight products, orders, shipping, returns, and more. Find answers to common questions here.',
  alternates: {
    canonical: `${siteUrl}/faq`,
  },
  openGraph: {
    title: 'FAQ | Fear Insight',
    description: 'Frequently asked questions about Fear Insight products, orders, shipping, returns, and more.',
    url: `${siteUrl}/faq`,
    type: 'website',
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}