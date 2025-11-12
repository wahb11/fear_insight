// hook
import { getAllProducts } from '@/functions/getAllProducts'
import { useQuery } from '@tanstack/react-query'

export function useAllProducts() {
  return useQuery({
    queryKey: ['allProducts'],
    queryFn: getAllProducts,
  })
}
