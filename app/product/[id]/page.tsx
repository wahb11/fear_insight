import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllProducts } from '@/functions/getAllProducts'
import ProductDetailClient from '@/components/product/ProductDetailClient'
import Script from 'next/script'
import { generateProductSchema, generateBreadcrumbSchema, schemaToJsonLd } from '@/lib/seo/structured-data'
import { Product } from '@/types/products'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const products = await getAllProducts()
  const product = products.find((p: Product) => p.id === id)

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
      type: 'product',
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
  const products = await getAllProducts()
  const product = products.find((p: Product) => p.id === id)

  if (!product) {
    notFound()
  }

  // Generate structured data
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
      <ProductDetailClient product={product} />
    </>
  )
}