import { getFeaturedProducts } from '@/functions/getFeaturedProducts'
import { useQuery } from '@tanstack/react-query'


export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['featuredProducts'],
    queryFn: getFeaturedProducts,
    staleTime: 60_000,
    // Don't leave the carousel hanging on a cold Supabase round-trip
    placeholderData: [],
  })
}
