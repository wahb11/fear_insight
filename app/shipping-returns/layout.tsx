import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com'

export const metadata: Metadata = {
  title: 'Shipping & Returns',
  description: 'Learn about our shipping policies, delivery times, return process, and exchange options. Free shipping on orders over $75.',
  alternates: {
    canonical: `${siteUrl}/shipping-returns`,
  },
  openGraph: {
    title: 'Shipping & Returns | Fear Insight',
    description: 'Learn about our shipping policies, delivery times, return process, and exchange options.',
    url: `${siteUrl}/shipping-returns`,
    type: 'website',
  },
}