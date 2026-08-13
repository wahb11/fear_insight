'use client'

/**
 * Load background removal from a CDN so Next/webpack never compiles
 * onnxruntime-web (Microsoft/Google license headers + Node ESM).
 */
export async function removeImageBackground(
  file: File | Blob,
  onProgress?: (message: string) => void
): Promise<Blob> {
  const load = new Function('u', 'return import(u)') as (u: string) => Promise<any>
  const mod = await load('https://esm.sh/@imgly/background-removal@1.7.0')
  const removeBackground = mod.removeBackground as (
    input: File | Blob,
    options?: Record<string, unknown>
  ) => Promise<Blob>

  return removeBackground(file, {
    model: 'isnet_fp16',
    output: {
      format: 'image/png',
      quality: 0.92,
    },
    progress: (key: string, current: number, total: number) => {
      if (!onProgress || !total) return
      const pct = Math.round((current / total) * 100)
      onProgress(`${key}: ${pct}%`)
    },
  })
}
