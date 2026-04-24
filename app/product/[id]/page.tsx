import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getProductById } from '@/functions/getProductById'
import { getAllProducts } from '@/functions/getAllProducts'
import ProductPageClient from '@/components/product/ProductPageClient'
import Script from 'next/script'
import { generateProductSchema, generateBreadcrumbSchema, schemaToJsonLd } from '@/lib/seo/structured-data'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com').replace(/\/$/, '')

interface PageProps {
  params: Promise<{ id: string }>
}

// Pre-render all product pages at build time for faster loading
export async function generateStaticParams() {
  try {
    const products = await getAllProducts()
    return products.map((product) => ({
      id: product.id,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Revalidate every hour for ISR — keeps pages cached longer to avoid cold starts
export const revalidate = 3600

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  // Use a short timeout for metadata generation to avoid blocking navigation
  let product = null
  try {
    product = await Promise.race([
      getProductById(id),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
    ])
  } catch {
    // Metadata generation failure shouldn't block the page
  }

  if (!product) {
    return {
      title: 'Fear Insight | Premium Streetwear',
      description: 'Premium streetwear designed with purpose. Each piece tells a story of faith, courage, and divine inspiration.',
    }
  }

  const finalPrice = Number(product.price) * (1 - Number(product.discount || 0) / 100)
  const productUrl = `${siteUrl}/product/${id}`
  const productImages = Array.isArray(product.images) ? product.images : [product.images || '/download.png']
  const primaryImage = productImages[0] || '/download.png'
  const productDescription = product.fullDescription || product.description || `${product.name} - Premium streetwear by Fear Insight`

  return {
    title: product.name,
    description: productDescription,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.name} | Fear Insight`,
      description: productDescription,
      url: productUrl,
      type: 'website',
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Fear Insight`,
      description: productDescription,
      images: [primaryImage],
    },
    other: {
      'product:price:amount': finalPrice.toFixed(2),
      'product:price:currency': 'USD',
      'product:availability': 'in stock',
      'product:brand': 'Fear Insight',
    },
  }
}

// Async component that loads structured data without blocking page render
async function StructuredData({ id }: { id: string }) {
  let product = null
  try {
    product = await getProductById(id)
  } catch {
    return null
  }

  if (!product) return null

  const productSchema = generateProductSchema(product, id)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: product.name, url: `/product/${id}` },
  ])

  return (
    <>
      <Script
        id="product-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: schemaToJsonLd(productSchema),
        }}
      />
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: schemaToJsonLd(breadcrumbSchema),
        }}
      />
    </>
  )
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params

  return (
    <>
      {/* Structured data loads async without blocking the page */}
      <Suspense fallback={null}>
        <StructuredData id={id} />
      </Suspense>
      {/* Client component renders immediately using cached data */}
      <ProductPageClient />
    </>
  )
}