import type { Metadata } from 'next'
import Script from 'next/script'
import { getAllProducts } from '@/functions/getAllProducts'
import { generateItemListSchema, schemaToJsonLd } from '@/lib/seo/structured-data'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com'

export const metadata: Metadata = {
  title: 'Fear',
  description: 'Shop the full Fear Insight drop — every piece, every mood.',
  alternates: {
    canonical: `${siteUrl}/fear`,
  },
  openGraph: {
    title: 'Fear | Fear Insight',
    description: 'Shop the full Fear Insight drop — every piece, every mood.',
    url: `${siteUrl}/fear`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fear | Fear Insight',
    description: 'Shop the full Fear Insight drop.',
  },
}

export default async function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch products for structured data
  let products = []
  try {
    products = await getAllProducts()
  } catch (error) {
    console.error('Error fetching products for structured data:', error)
  }

  const itemListSchema = generateItemListSchema(products, `${siteUrl}/products`)

  return (
    <>
      <Script
        id="products-itemlist-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: schemaToJsonLd(itemListSchema),
        }}
      />
      {children}
    </>
  )
}