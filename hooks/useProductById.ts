import { getProductById } from '@/functions/getProductById'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Product } from '@/types/products'

export function useProductById(id: string) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
    // Check the allProducts cache first — if the user came from
    // the products/collections page, all product data is already loaded.
    // This makes the product page render INSTANTLY with no server call.
    initialData: () => {
      const allProducts = queryClient.getQueryData<Product[]>(['allProducts'])
      if (allProducts) {
        const cached = allProducts.find((p) => p.id === id)
        if (cached) return cached
      }
      return undefined
    },
    // If we used cached data, still refetch in background to ensure freshness
    // but don't block the render
    staleTime: 2 * 60 * 1000, // 2 minutes before considering stale
  })
}
