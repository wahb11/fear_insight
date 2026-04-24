import type { Metadata } from 'next'
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

// Revalidate every 60 seconds for ISR (Incremental Static Regeneration)
export const revalidate = 60

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return {
      title: 'Product Not Found',
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

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params

  // Try to fetch product server-side for SEO and fast initial render
  // If this fails, ProductPageClient will fetch client-side as fallback
  let product = null
  let productSchema = null
  let breadcrumbSchema = null

  try {
    product = await getProductById(id)
    if (product) {
      productSchema = generateProductSchema(product, id)
      breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
        { name: product.name, url: `/product/${id}` },
      ])
    }
  } catch (error) {
    console.error('Server-side product fetch failed, will fallback to client-side:', error)
  }

  return (
    <>
      {productSchema && (
        <Script
          id="product-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: schemaToJsonLd(productSchema),
          }}
        />
      )}
      {breadcrumbSchema && (
        <Script
          id="breadcrumb-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: schemaToJsonLd(breadcrumbSchema),
          }}
        />
      )}
      <ProductPageClient serverProduct={product} />
    </>
  )
}