/** Shrink large photos before upload so Vercel/proxy 4.5MB body limits aren't hit. */
export async function compressImageFile(
  file: File,
  options?: { maxEdge?: number; quality?: number; maxBytes?: number }
): Promise<File> {
  const maxEdge = options?.maxEdge ?? 1800
  const quality = options?.quality ?? 0.82
  const maxBytes = options?.maxBytes ?? 1.8 * 1024 * 1024

  // Already small enough — keep original (PNG cutouts stay sharp)
  if (file.size <= maxBytes && !/^image\/(heic|heif)$/i.test(file.type)) {
    if (file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/gif') {
      return file
    }
    if (file.size <= 900 * 1024) return file
  }

  if (typeof window === 'undefined' || typeof createImageBitmap === 'undefined') {
    return file
  }

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return file
    }
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
    )
    if (!blob || blob.size >= file.size) return file

    const base = file.name.replace(/\.[^.]+$/, '') || 'image'
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
  } catch {
    return file
  }
}

export async function compressImageFiles(files: File[]): Promise<File[]> {
  const out: File[] = []
  for (const file of files) {
    out.push(await compressImageFile(file))
  }
  return out
}
