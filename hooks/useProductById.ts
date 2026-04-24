import { getProductById } from '@/functions/getProductById'
import { useQuery } from '@tanstack/react-query'

export function useProductById(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  })
}
