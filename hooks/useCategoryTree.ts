import { useQuery } from '@tanstack/react-query'
import { CategoryTree } from '@/types/categories'
import { FALLBACK_CATEGORY_TREE } from '@/lib/categories'

async function fetchCategoryTree(): Promise<CategoryTree> {
  const res = await fetch('/api/categories')
  if (!res.ok) return FALLBACK_CATEGORY_TREE
  const data = await res.json()
  return Array.isArray(data) && data.length > 0 ? data : FALLBACK_CATEGORY_TREE
}

export function useCategoryTree() {
  return useQuery({
    queryKey: ['categoryTree'],
    queryFn: fetchCategoryTree,
    staleTime: 60_000,
  })
}
