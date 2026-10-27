// Must match Next's default deviceSizes ∪ imageSizes or /_next/image rejects the request.
const ALLOWED_WIDTHS = [64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920]

function snapWidth(width: number): number {
  return ALLOWED_WIDTHS.find((w) => w >= width) ?? ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1]
}

function isOptimizable(src: string): boolean {
  if (!src) return false
  if (src.startsWith('data:') || src.startsWith('blob:')) return false
  if (/\.svg(\?|$)/i.test(src)) return false
  return src.startsWith('/') || /^https:\/\/[^/]+\.supabase\.co\//i.test(src)
}

/** Resized, WebP-encoded URL served by Next's image optimizer. */
export function optimizedImage(src: string, width: number, quality = 75): string {
  if (!isOptimizable(src)) return src
  return `/_next/image?url=${encodeURIComponent(src)}&w=${snapWidth(width)}&q=${quality}`
}

export function optimizedSrcSet(src: string, widths: number[], quality = 75): string | undefined {
  if (!isOptimizable(src)) return undefined
  return widths.map((w) => `${optimizedImage(src, w, quality)} ${snapWidth(w)}w`).join(', ')
}
