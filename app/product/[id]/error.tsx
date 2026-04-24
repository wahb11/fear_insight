"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error("Product page error:", error)
  }, [error])

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 mx-auto bg-stone-900 rounded-full flex items-center justify-center border border-stone-800">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-stone-100">Something went wrong</h2>
        <p className="text-stone-400">
          We couldn&apos;t load this product. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-stone-800 hover:bg-stone-700 rounded-lg text-stone-200 font-medium transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/products")}
            className="px-6 py-3 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-lg text-stone-300 font-medium transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    </div>
  )
}
