import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your purchase securely. We accept all major credit cards and offer free shipping on orders over $75.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/checkout`,
  },
}