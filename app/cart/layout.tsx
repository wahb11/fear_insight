import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com'

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'Review your cart items and proceed to checkout. Free shipping on orders over $75.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/cart`,
  },
}