import { createClient } from '@supabase/supabase-js'

const STATUS_PATH = 'admin/order-fulfillment.json'
const CACHE_TTL_MS = 20_000
const DOWNLOAD_TIMEOUT_MS = 2000

export type FulfillmentStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

let cachedMap: { value: Record<string, FulfillmentStatus>; at: number } | null = null

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin env missing')
  return createClient(url, key)
}

async function downloadFulfillmentMap(): Promise<Record<string, FulfillmentStatus>> {
  const supabase = getAdminClient()
  const { data, error } = await supabase.storage.from('products').download(STATUS_PATH)
  if (error || !data) return {}
  try {
    const text = await data.text()
    const parsed = JSON.parse(text)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export async function readFulfillmentMap(): Promise<Record<string, FulfillmentStatus>> {
  if (cachedMap && Date.now() - cachedMap.at < CACHE_TTL_MS) {
    return cachedMap.value
  }

  const map = await Promise.race([
    downloadFulfillmentMap(),
    new Promise<Record<string, FulfillmentStatus>>((resolve) =>
      setTimeout(() => resolve(cachedMap?.value || {}), DOWNLOAD_TIMEOUT_MS)
    ),
  ])

  cachedMap = { value: map, at: Date.now() }
  return map
}

export async function writeFulfillmentMap(map: Record<string, FulfillmentStatus>) {
  const supabase = getAdminClient()
  const blob = new Blob([JSON.stringify(map)], { type: 'application/json' })
  const { error } = await supabase.storage.from('products').upload(STATUS_PATH, blob, {
    upsert: true,
    contentType: 'application/json',
  })
  if (error) throw new Error(error.message)
  cachedMap = { value: map, at: Date.now() }
}

export async function setOrderFulfillment(orderId: string, status: FulfillmentStatus) {
  const map = await readFulfillmentMap()
  map[orderId] = status
  await writeFulfillmentMap(map)
  return status
}
