'use client'

import { Suspense } from 'react'
import CollectionCatalog from '@/components/product/CollectionCatalog'

function CatalogFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-neutral-500">
      Loading…
    </div>
  )
}

export default function OversizedPage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CollectionCatalog collection="oversized" />
    </Suspense>
  )
}
