export default function ProductLoading() {
  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen">
      {/* Breadcrumb skeleton */}
      <div className="pt-24 px-4 bg-stone-950">
        <div className="container mx-auto flex items-center gap-2">
          <div className="h-3 sm:h-4 w-10 sm:w-12 bg-stone-800 rounded animate-pulse" />
          <span className="text-stone-700">/</span>
          <div className="h-3 sm:h-4 w-14 sm:w-16 bg-stone-800 rounded animate-pulse" />
          <span className="text-stone-700">/</span>
          <div className="h-3 sm:h-4 w-24 sm:w-32 bg-stone-800 rounded animate-pulse" />
        </div>
      </div>

      {/* Main Content */}
      <section className="py-6 sm:py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
            {/* Image Section Skeleton */}
            <div className="space-y-3 sm:space-y-4">
              {/* Main Image */}
              <div className="relative h-72 sm:h-96 lg:h-[500px] bg-stone-900 rounded-lg border border-stone-800 overflow-hidden">
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-stone-800/50 via-stone-900 to-stone-800/50" />
                {/* Shimmer effect */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
                    animation: "shimmer 2s infinite",
                  }}
                />
              </div>
              {/* Thumbnails */}
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-stone-900 rounded-lg border border-stone-800 animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>

            {/* Product Details Skeleton */}
            <div className="space-y-4 sm:space-y-6">
              {/* Badges */}
              <div className="flex gap-2 sm:gap-3">
                <div className="h-5 sm:h-6 w-16 sm:w-20 bg-stone-800 rounded-full animate-pulse" />
                <div className="h-5 sm:h-6 w-20 sm:w-24 bg-stone-800 rounded-full animate-pulse" style={{ animationDelay: "100ms" }} />
              </div>

              {/* Title */}
              <div className="space-y-2 sm:space-y-3">
                <div className="h-7 sm:h-10 w-3/4 bg-stone-800 rounded animate-pulse" />
                <div className="h-4 sm:h-5 w-full bg-stone-900 rounded animate-pulse" style={{ animationDelay: "100ms" }} />
                <div className="h-4 sm:h-5 w-2/3 bg-stone-900 rounded animate-pulse" style={{ animationDelay: "200ms" }} />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-stone-800">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 bg-stone-800 rounded animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
                  ))}
                </div>
                <div className="h-4 sm:h-5 w-8 bg-stone-800 rounded animate-pulse" />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-8 sm:h-10 w-20 sm:w-24 bg-stone-800 rounded animate-pulse" />
                  <div className="h-5 sm:h-6 w-14 sm:w-16 bg-stone-900 rounded animate-pulse" />
                  <div className="h-5 sm:h-6 w-10 sm:w-12 bg-red-900/30 rounded-full animate-pulse" />
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-2 sm:space-y-3">
                <div className="h-3.5 sm:h-4 w-14 sm:w-16 bg-stone-800 rounded animate-pulse" />
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-9 sm:h-10 w-20 sm:w-24 bg-stone-800 rounded-lg animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-2 sm:space-y-3">
                <div className="h-3.5 sm:h-4 w-10 sm:w-12 bg-stone-800 rounded animate-pulse" />
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 sm:h-12 bg-stone-800 rounded-lg animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2 sm:space-y-3">
                <div className="h-3.5 sm:h-4 w-16 sm:w-20 bg-stone-800 rounded animate-pulse" />
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-stone-800 rounded-lg animate-pulse" />
                  <div className="w-6 sm:w-8 h-6 sm:h-8 bg-stone-800 rounded animate-pulse" />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-stone-800 rounded-lg animate-pulse" />
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="flex gap-3 sm:gap-4 pt-3 sm:pt-4">
                <div className="flex-1 h-12 sm:h-14 bg-stone-800 rounded-lg animate-pulse" />
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-stone-800 rounded-lg animate-pulse" />
              </div>

              {/* Product Details */}
              <div className="space-y-2.5 sm:space-y-3 pt-3 sm:pt-4 border-t border-stone-800">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-2.5 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-stone-800 rounded mt-0.5 sm:mt-1 flex-shrink-0 animate-pulse" />
                    <div className="space-y-1 flex-1">
                      <div className="h-4 sm:h-5 w-24 sm:w-28 bg-stone-800 rounded animate-pulse" />
                      <div className="h-3.5 sm:h-4 w-32 sm:w-40 bg-stone-900 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}