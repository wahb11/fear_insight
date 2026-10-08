/** Normalize color names for URL matching (e.g. "Light Grey" → "lightgrey"). */
export function normalizeColorKey(color: string): string {
  return color.toLowerCase().replace(/\s+/g, '').trim()
}

/** Read assigned color from an image URL (`?color=`). */
export function getImageColor(imageUrl: string): string | null {
  if (!imageUrl) return null
  try {
    const url = new URL(imageUrl, 'https://placeholder.local')
    const raw = url.searchParams.get('color')
    return raw?.trim() || null
  } catch {
    const match = imageUrl.match(/[?&]color=([^&]+)/i)
    return match ? decodeURIComponent(match[1]).trim() : null
  }
}

/** Attach or clear a color assignment on an image URL (keeps the file path intact). */
export function setImageColor(imageUrl: string, color: string | null): string {
  if (!imageUrl) return imageUrl
  try {
    const url = new URL(imageUrl, 'https://placeholder.local')
    if (!color || !color.trim()) {
      url.searchParams.delete('color')
    } else {
      url.searchParams.set('color', color.trim())
    }
    // Preserve absolute vs relative
    if (/^https?:\/\//i.test(imageUrl)) {
      return url.toString()
    }
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    const base = imageUrl.split('?')[0]
    if (!color || !color.trim()) return base
    return `${base}?color=${encodeURIComponent(color.trim())}`
  }
}

/** Apply `?color=` to public URLs from a parallel color list (same order as files). */
export function applyColorsToImageUrls(
  urls: string[],
  colors: Array<string | null | undefined>
): string[] {
  return urls.map((url, i) => {
    const color = colors[i]
    if (!color || !String(color).trim()) return url
    return setImageColor(url, String(color).trim())
  })
}
