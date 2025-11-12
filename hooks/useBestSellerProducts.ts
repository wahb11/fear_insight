// hook
import { getBestSellerProducts } from '@/functions/getBestSellerProducts'
import { useQuery } from '@tanstack/react-query'


export function useBestSellerProducts() {
  return useQuery({
    queryKey: ['bestSellerProducts'],
    queryFn: getBestSellerProducts,
  })
}
