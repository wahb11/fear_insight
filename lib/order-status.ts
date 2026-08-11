import { createClient } from '@supabase/supabase-js'

const STATUS_PATH = 'admin/order-fulfillment.json'

export type FulfillmentStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin env missing')
  return createClient(url, key)
}

export async function readFulfillmentMap(): Promise<Record<string, FulfillmentStatus>> {
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

export async function writeFulfillmentMap(map: Record<string, FulfillmentStatus>) {
  const supabase = getAdminClient()
  const blob = new Blob([JSON.stringify(map, null, 2)], { type: 'application/json' })
  const { error } = await supabase.storage.from('products').upload(STATUS_PATH, blob, {
    upsert: true,
    contentType: 'application/json',
  })
  if (error) throw new Error(error.message)
}

export async function setOrderFulfillment(orderId: string, status: FulfillmentStatus) {
  const map = await readFulfillmentMap()
  map[orderId] = status
  await writeFulfillmentMap(map)
  return status
}
