import { MetadataRoute } from 'next'

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com'
console.log('🔍 Raw Site URL:', rawSiteUrl) // ← Add this
console.log('🔍 Has trailing slash?', rawSiteUrl.endsWith('/')) // ← And this

const siteUrl = rawSiteUrl.replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}