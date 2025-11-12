import { getFeaturedProducts } from '@/functions/getFeaturedProducts'
import { useQuery } from '@tanstack/react-query'


export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['featuredProducts'],
    queryFn: getFeaturedProducts,
  })
}
