import { Product } from '@/types/products'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com'

export interface OrganizationSchema {
  '@context': string
  '@type': string
  name: string
  url: string
  logo: string
  description: string
  contactPoint: {
    '@type': string
    email: string
    contactType: string
  }
  sameAs: string[]
}

export interface ProductSchema {
  '@context': string
  '@type': string
  name: string
  description: string
  image: string[]
  brand: {
    '@type': string
    name: string
  }
  offers: {
    '@type': string
    url: string
    priceCurrency: string
    price: string
    availability: string
    seller: {
      '@type': string
      name: string
    }
  }
  aggregateRating?: {
    '@type': string
    ratingValue: string
    reviewCount: string
  }
  sku?: string
}

export interface BreadcrumbListSchema {
  '@context': string
  '@type': string
  itemListElement: Array<{
    '@type': string
    position: number
    name: string
    item: string
  }>
}

export interface WebSiteSchema {
  '@context': string
  '@type': string
  name: string
  url: string
  potentialAction: {
    '@type': string
    target: {
      '@type': string
      urlTemplate: string
    }
    'query-input': string
  }
}

export interface ItemListSchema {
  '@context': string
  '@type': string
  name: string
  description: string
  url: string
  numberOfItems: number
  itemListElement: Array<{
    '@type': string
    position: number
    name: string
    description: string
    image: string[]
    url: string
    offers: {
      '@type': string
      priceCurrency: string
      price: string
      availability: string
    }
  }>
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fear Insight',
    url: siteUrl,
    logo: `${siteUrl}/download.png`,
    description:
      'Fear Insight is a premium streetwear brand that creates pieces that embody spiritual strength, divine inspiration, and fearless self-expression.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@fearinsight.com',
      contactType: 'Customer Service',
    },
    sameAs: [
      'https://www.instagram.com/fearinsight',
      'https://twitter.com/fearinsight',
    ],
  }
}

/**
 * Generate Product structured data
 */
export function generateProductSchema(product: Product, productId: string): ProductSchema {
  const finalPrice = Number(product.price) * (1 - Number(product.discount || 0) / 100)
  const productUrl = `${siteUrl}/product/${productId}`
  const productImages = Array.isArray(product.images) ? product.images : [product.images || '']
  const productDescription = product.fullDescription || product.description || `${product.name} - Premium streetwear by Fear Insight`

  // Determine availability based on sizes and colors
  const hasStock = 
    (Array.isArray(product.sizes) && product.sizes.length > 0) ||
    (Array.isArray(product.colors) && product.colors.length > 0)

  const schema: ProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: productDescription,
    image: productImages.filter(Boolean),
    brand: {
      '@type': 'Brand',
      name: 'Fear Insight',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'USD',
      price: finalPrice.toFixed(2),
      availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Fear Insight',
      },
    },
    sku: productId,
  }

  // Add aggregate rating if available
  if (product.ratings && product.ratings > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.ratings.toString(),
      reviewCount: '1', // Default to 1 if no review count is available
    }
  }

  return schema
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
    })),
  }
}

/**
 * Generate WebSite structured data with search functionality
 */
export function generateWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Fear Insight',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate ItemList structured data for product listing pages
 */
export function generateItemListSchema(products: Product[], pageUrl: string): ItemListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Fear Insight Products',
    description: 'Browse our collection of premium streetwear products',
    url: pageUrl.startsWith('http') ? pageUrl : `${siteUrl}${pageUrl}`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 10).map((product, index) => {
      const finalPrice = Number(product.price) * (1 - Number(product.discount || 0) / 100)
      const productImages = Array.isArray(product.images) ? product.images : [product.images || '']
      const hasStock =
        (Array.isArray(product.sizes) && product.sizes.length > 0) ||
        (Array.isArray(product.colors) && product.colors.length > 0)

      return {
        '@type': 'Product',
        position: index + 1,
        name: product.name,
        description: product.description || product.name,
        image: productImages.filter(Boolean),
        url: `${siteUrl}/product/${product.id}`,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: finalPrice.toFixed(2),
          availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
      }
    }),
  }
}

/**
 * Convert schema object to JSON-LD script tag string
 */
export function schemaToJsonLd(schema: object): string {
  return JSON.stringify(schema, null, 2)
}