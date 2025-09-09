import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {

  title: 'Fear Insight',
  description: 'Fear Insight is a premium streetwear brand that creates pieces that embody spiritual strength, divine inspiration, and fearless self-expression. Each design is carefully crafted to remind you that you are guided by a higher purpose.',
  keywords: ['Fear Insight', 'Fear Insight Clothing', 'Fear Insight Hoodies', 'Fear Insight T-Shirts', 'Fear Insight Accessories', 'Fear Insight Merchandise'],
  authors: [{ name: 'Fear Insight', url: 'https://fearinsight.com' }],
  creator: 'Fear Insight',
  publisher: 'Fear Insight',
  openGraph: {
    title: 'Fear Insight',
    description: 'Fear Insight is a premium streetwear brand that creates pieces that embody spiritual strength, divine inspiration, and fearless self-expression. Each design is carefully crafted to remind you that you are guided by a higher purpose.',
    url: 'https://fearinsight.com',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
