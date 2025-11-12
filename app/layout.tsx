import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from './context/CartContext'
import './globals.css'
import QueryProvider from '@/providers/query-provider'
import Footer from '@/components/layouts/Footer'
import Header from '@/components/layouts/Header'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] })

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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${montserrat.className}`} suppressHydrationWarning>
     <QueryProvider>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
    
        <CartProvider>
              <Header/>
          {children}
        </CartProvider>
        <Analytics />
        <Footer/>
      </body>
      </QueryProvider>
    </html>
  )
}
