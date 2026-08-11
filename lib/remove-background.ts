/**
 * Client-only background removal via @imgly/background-removal (WASM).
 * Dynamically imported so the model bundle is not loaded on the storefront.
 */
export async function removeImageBackground(
  file: File | Blob,
  onProgress?: (message: string) => void
): Promise<Blob> {
  const { removeBackground } = await import('@imgly/background-removal')
  const blob = await removeBackground(file, {
    model: 'isnet_fp16',
    output: {
      format: 'image/png',
      quality: 0.92,
    },
    progress: (key, current, total) => {
      if (!onProgress || !total) return
      const pct = Math.round((current / total) * 100)
      onProgress(`${key}: ${pct}%`)
    },
  })
  return blob
}
