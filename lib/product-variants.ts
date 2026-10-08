export type ColorSizeMap = { color: string; sizes: string[] }

export function isColorSizeMap(value: unknown): value is ColorSizeMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const v = value as Record<string, unknown>
  return typeof v.color === 'string' && Array.isArray(v.sizes)
}

export function parseColorNames(colors: unknown[] | undefined | null): string[] {
  if (!Array.isArray(colors)) return []
  return colors.flatMap((color) => {
    if (typeof color === 'string' && color.trim()) return [color.trim()]
    if (typeof color === 'object' && color !== null) {
      return Object.keys(color)
        .filter((key) => key.trim().length > 0)
        .map((key) => key.trim())
    }
    return []
  })
}

export function parseFlatSizes(sizes: unknown[] | undefined | null): string[] {
  if (!Array.isArray(sizes)) return []
  if (sizes.some(isColorSizeMap)) {
    const set = new Set<string>()
    for (const entry of sizes) {
      if (!isColorSizeMap(entry)) continue
      for (const s of entry.sizes) {
        if (typeof s === 'string' && s.trim()) set.add(s.trim().toUpperCase())
      }
    }
    return Array.from(set)
  }
  return sizes.flatMap((size) => {
    if (typeof size === 'string' && size.trim()) return [size.trim().toUpperCase()]
    if (typeof size === 'object' && size !== null) {
      return Object.keys(size)
        .filter((key) => key.trim().length > 0)
        .map((key) => key.trim().toUpperCase())
    }
    return []
  })
}

/** Sizes available for a selected color. Falls back to all sizes if not per-color. */
export function sizesForColor(
  sizes: unknown[] | undefined | null,
  color: string
): string[] {
  if (!Array.isArray(sizes) || !sizes.length) return []

  const maps = sizes.filter(isColorSizeMap)
  if (maps.length > 0) {
    const normalized = color.toLowerCase().trim()
    const entry = maps.find((m) => m.color.toLowerCase().trim() === normalized)
    if (!entry) return []
    return entry.sizes
      .filter((s): s is string => typeof s === 'string' && !!s.trim())
      .map((s) => s.trim().toUpperCase())
  }

  return parseFlatSizes(sizes)
}

export function hasPerColorSizes(sizes: unknown[] | undefined | null): boolean {
  return Array.isArray(sizes) && sizes.some(isColorSizeMap)
}

export function buildPerColorSizes(
  colorToSizes: Record<string, string[]>
): ColorSizeMap[] {
  return Object.entries(colorToSizes)
    .filter(([color, list]) => color.trim() && list.length > 0)
    .map(([color, list]) => ({
      color: color.trim(),
      sizes: list.map((s) => s.trim().toUpperCase()).filter(Boolean),
    }))
}

export function colorSizeMapFromProduct(
  sizes: unknown[] | undefined | null,
  colors: string[]
): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const c of colors) result[c] = []

  if (Array.isArray(sizes) && sizes.some(isColorSizeMap)) {
    for (const entry of sizes) {
      if (!isColorSizeMap(entry)) continue
      result[entry.color] = entry.sizes
        .filter((s): s is string => typeof s === 'string' && !!s.trim())
        .map((s) => s.trim().toUpperCase())
    }
    return result
  }

  const flat = parseFlatSizes(sizes)
  for (const c of colors) result[c] = [...flat]
  return result
}

export function isSizeAvailableForColor(
  sizes: unknown[] | undefined | null,
  color: string,
  size: string
): boolean {
  const list = sizesForColor(sizes, color)
  const normalized = size.toUpperCase().trim()
  return list.some((s) => s === normalized)
}
