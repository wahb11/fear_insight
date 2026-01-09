/**
 * Normalize image URLs to work in both local and production environments
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return "/download.png" // Fallback image

  // If it's already a relative path, return as is
  if (url.startsWith("/")) {
    return url
  }

  // If it's a full URL with domain, extract the path
  try {
    const urlObj = new URL(url)
    // If it's the same domain or localhost, use relative path
    const isLocalhost = urlObj.hostname === "localhost" || urlObj.hostname === "127.0.0.1"
    const isSameDomain = urlObj.hostname.includes("fearinsight.com") || isLocalhost
    
    if (isSameDomain) {
      // Extract path and query
      return urlObj.pathname + urlObj.search
    }
    
    // If it's a Supabase Storage URL, return as is
    if (urlObj.hostname.includes("supabase.co")) {
      return url
    }
  } catch {
    // If URL parsing fails, try to extract path manually
    const match = url.match(/\/product\/[^?]+(\?.*)?/)
    if (match) {
      return match[0]
    }
  }

  // Return original URL if we can't normalize it
  return url
}

