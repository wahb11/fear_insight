"use client"

import { useParams } from "next/navigation"
import { useProductById } from "@/hooks/useProductById"
import ProductDetailClient from "@/components/product/ProductDetailClient"
import ProductLoading from "@/app/product/[id]/loading"

export default function ProductPageClient() {
  const params = useParams()
  const id = params?.id as string

  // Fetches product data — uses cached allProducts data if available
  // (instant render when coming from products page), otherwise fetches from API
  const { data: product, isLoading, error } = useProductById(id)

  if (isLoading && !product) {
    return <ProductLoading />
  }

  if (error && !product) {
    return (
      <div className="bg-white text-neutral-900 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-neutral-600 text-lg">Unable to load product</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-black hover:bg-neutral-800 rounded-lg text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-white text-neutral-900 min-h-screen flex items-center justify-center">
        <p className="text-neutral-600 text-lg">Product not found</p>
      </div>
    )
  }

  return <ProductDetailClient product={product} />
}
