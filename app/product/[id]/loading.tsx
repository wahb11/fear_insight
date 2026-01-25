export default function ProductLoading() {
  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="pt-24 px-4 bg-stone-950">
        <div className="container mx-auto flex items-center gap-2">
          <div className="h-4 w-12 bg-stone-800 rounded" />
          <span className="text-stone-700">/</span>
          <div className="h-4 w-16 bg-stone-800 rounded" />
          <span className="text-stone-700">/</span>
          <div className="h-4 w-32 bg-stone-800 rounded" />
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
            {/* Image Section Skeleton */}
            <div className="space-y-4">
              <div className="h-96 sm:h-[500px] bg-stone-900 rounded-lg border border-stone-800" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-900 rounded-lg border border-stone-800" />
                ))}
              </div>
            </div>

            {/* Product Details Skeleton */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex gap-3">
                <div className="h-6 w-20 bg-stone-800 rounded-full" />
                <div className="h-6 w-24 bg-stone-800 rounded-full" />
              </div>

              {/* Title */}
              <div className="space-y-3">
                <div className="h-10 w-3/4 bg-stone-800 rounded" />
                <div className="h-5 w-full bg-stone-900 rounded" />
                <div className="h-5 w-2/3 bg-stone-900 rounded" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 pb-4 border-b border-stone-800">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-5 h-5 bg-stone-800 rounded" />
                  ))}
                </div>
                <div className="h-5 w-8 bg-stone-800 rounded" />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-24 bg-stone-800 rounded" />
                  <div className="h-6 w-16 bg-stone-900 rounded" />
                  <div className="h-6 w-12 bg-red-900/30 rounded-full" />
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-3">
                <div className="h-4 w-16 bg-stone-800 rounded" />
                <div className="flex gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 w-24 bg-stone-800 rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-3">
                <div className="h-4 w-12 bg-stone-800 rounded" />
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-stone-800 rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-3">
                <div className="h-4 w-20 bg-stone-800 rounded" />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-800 rounded-lg" />
                  <div className="w-8 h-8 bg-stone-800 rounded" />
                  <div className="w-12 h-12 bg-stone-800 rounded-lg" />
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="flex gap-4 pt-4">
                <div className="flex-1 h-14 bg-stone-800 rounded-lg" />
                <div className="w-14 h-14 bg-stone-800 rounded-lg" />
              </div>

              {/* Product Details */}
              <div className="space-y-3 pt-4 border-t border-stone-800">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-stone-800 rounded mt-1" />
                    <div className="space-y-1 flex-1">
                      <div className="h-5 w-28 bg-stone-800 rounded" />
                      <div className="h-4 w-40 bg-stone-900 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}