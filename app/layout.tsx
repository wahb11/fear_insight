import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from './context/CartContext'
import './globals.css'
import QueryProvider from '@/providers/query-provider'
import VisitorTracker from '@/components/VisitorTracker'
import ConditionalLayout from '@/components/ConditionalLayout'
import { NavigationLoaderProvider } from '@/components/NavigationLoader'
import Script from 'next/script'
import { generateOrganizationSchema, generateWebSiteSchema, schemaToJsonLd } from '@/lib/seo/structured-data'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Fear Insight',
    template: '%s | Fear Insight',
  },
  description: 'Fear Insight is a premium streetwear brand that creates pieces that embody spiritual strength, divine inspiration, and fearless self-expression. Each design is carefully crafted to remind you that you are guided by a higher purpose.',
  keywords: ['Fear Insight', 'Fear Insight Clothing', 'Fear Insight Hoodies', 'Fear Insight T-Shirts', 'Fear Insight Accessories', 'Fear Insight Merchandise', 'streetwear', 'premium clothing', 'spiritual fashion'],
  authors: [{ name: 'Fear Insight', url: siteUrl }],
  creator: 'Fear Insight',
  publisher: 'Fear Insight',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/download.png', sizes: 'any' },
      { url: '/download.png', sizes: '32x32', type: 'image/png' },
      { url: '/download.png', sizes: '192x192', type: 'image/png' },
      { url: '/download.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/download.png',
    apple: [
      { url: '/download.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Fear Insight',
    title: 'Fear Insight - Premium Streetwear with Spiritual Strength',
    description: 'Fear Insight is a premium streetwear brand that creates pieces that embody spiritual strength, divine inspiration, and fearless self-expression. Each design is carefully crafted to remind you that you are guided by a higher purpose.',
    images: [
      {
        url: '/download.png',
        width: 1200,
        height: 630,
        alt: 'Fear Insight - Premium Streetwear Brand',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fear Insight - Premium Streetwear with Spiritual Strength',
    description: 'Fear Insight is a premium streetwear brand that creates pieces that embody spiritual strength, divine inspiration, and fearless self-expression.',
    images: ['/download.png'],
    creator: '@fearinsight',
  },
  alternates: {
    canonical: siteUrl,
  },
  other: {
    'theme-color': '#1a1a1a',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${montserrat.className}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <QueryProvider>
        <Script
          id="organization-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: schemaToJsonLd(generateOrganizationSchema()),
          }}
        />
        <Script
          id="website-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: schemaToJsonLd(generateWebSiteSchema()),
          }}
        />
        <VisitorTracker />
        <CartProvider>
          <NavigationLoaderProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </NavigationLoaderProvider>
        </CartProvider>
        <Analytics />
        </QueryProvider>
      </body>
    </html>
  )
}
