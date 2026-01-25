import type { Metadata } from 'next'
import Script from 'next/script'
import { getAllProducts } from '@/functions/getAllProducts'
import { generateItemListSchema, schemaToJsonLd } from '@/lib/seo/structured-data'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com'

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse our complete collection of premium streetwear. Find hoodies, t-shirts, and accessories that embody spiritual strength and fearless self-expression.',
  alternates: {
    canonical: `${siteUrl}/products`,
  },
  openGraph: {
    title: 'All Products | Fear Insight',
    description: 'Browse our complete collection of premium streetwear. Find hoodies, t-shirts, and accessories that embody spiritual strength and fearless self-expression.',
    url: `${siteUrl}/products`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Products | Fear Insight',
    description: 'Browse our complete collection of premium streetwear.',
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