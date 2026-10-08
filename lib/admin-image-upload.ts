import { randomBytes } from 'crypto'
import {
  getAdminSupabase,
  MAX_PRODUCT_IMAGE_BYTES,
  PRODUCTS_BUCKET,
} from '@/lib/admin-supabase'

const EXT_FROM_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/pjpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

export type UploadedProductImage = {
  path: string
  publicUrl: string
}

function normalizeExt(file: File): string | null {
  const rawName = (file.name || '').trim()
  const fromName = rawName.includes('.')
    ? `.${rawName.split('.').pop()!.toLowerCase()}`
    : ''

  if (fromName === '.jpeg' || fromName === '.jfif' || fromName === '.jpe') {
    return '.jpg'
  }
  if (ALLOWED_EXT.has(fromName)) {
    return fromName === '.jpeg' ? '.jpg' : fromName
  }

  const fromMime = EXT_FROM_MIME[(file.type || '').toLowerCase()]
  return fromMime || null
}

function contentTypeFor(ext: string, fileType?: string): string {
  if (fileType && fileType.startsWith('image/')) return fileType
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  return 'application/octet-stream'
}

/** Unique storage object name — avoids brittle f001 counters + collisions. */
function buildObjectName(ext: string, prefix = ''): string {
  const stamp = Date.now().toString(36)
  const rand = randomBytes(4).toString('hex')
  return `${prefix}${stamp}-${rand}${ext}`
}

export async function uploadProductImages(
  files: File[],
  options?: { prefix?: string }
): Promise<{ urls: string[]; paths: string[]; skipped: string[] }> {
  const supabase = getAdminSupabase()
  const urls: string[] = []
  const paths: string[] = []
  const skipped: string[] = []

  for (const file of files) {
    if (!file || typeof file.arrayBuffer !== 'function') {
      skipped.push('(invalid file entry)')
      continue
    }
    if (!file.size || file.size <= 0) {
      skipped.push(file.name || '(empty file)')
      continue
    }
    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      // Roll back anything already uploaded in this batch
      if (paths.length > 0) {
        await supabase.storage.from(PRODUCTS_BUCKET).remove(paths)
      }
      throw new Error(
        `File ${file.name || 'image'} exceeds the ${Math.round(MAX_PRODUCT_IMAGE_BYTES / (1024 * 1024))}MB limit`
      )
    }

    const ext = normalizeExt(file)
    if (!ext) {
      skipped.push(
        `${file.name || 'file'} (unsupported type — use JPG, PNG, WEBP, or GIF; not HEIC)`
      )
      continue
    }

    const objectPath = buildObjectName(ext, options?.prefix || '')
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from(PRODUCTS_BUCKET)
      .upload(objectPath, buffer, {
        contentType: contentTypeFor(ext, file.type),
        upsert: false,
        cacheControl: '3600',
      })

    if (uploadError) {
      if (paths.length > 0) {
        await supabase.storage.from(PRODUCTS_BUCKET).remove(paths)
      }
      const hint =
        /row-level security|policy|unauthorized|not allowed/i.test(uploadError.message)
          ? ' Storage blocked — confirm SUPABASE_SERVICE_ROLE_KEY is set and the products bucket exists.'
          : ''
      throw new Error(`Failed to upload ${file.name || objectPath}: ${uploadError.message}.${hint}`)
    }

    const { data: urlData } = supabase.storage
      .from(PRODUCTS_BUCKET)
      .getPublicUrl(objectPath)

    if (!urlData?.publicUrl) {
      await supabase.storage.from(PRODUCTS_BUCKET).remove([objectPath, ...paths])
      throw new Error(`Failed to generate public URL for ${file.name || objectPath}`)
    }

    paths.push(objectPath)
    urls.push(urlData.publicUrl)
  }

  return { urls, paths, skipped }
}

export async function removeUploadedPaths(paths: string[]) {
  if (!paths.length) return
  const supabase = getAdminSupabase()
  await supabase.storage.from(PRODUCTS_BUCKET).remove(paths)
}
