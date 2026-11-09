import { useQuery } from '@tanstack/react-query'
import { restaurantsApi } from '@/api/endpoints'
import { categorySet } from '@/lib/cuisines'

const PARALLEL = 4 // the backend opens one database connection per request: keep it gentle

/**
 * restaurantId → Set of menu categories, from the real menus (GET /api/restaurants/{id}/menu).
 * A restaurant whose menu fails to load is simply left out of the cuisine filters.
 */
export function useCuisineIndex(restaurants) {
  const ids = (restaurants || []).map((r) => r.restaurantId)
  return useQuery({
    queryKey: ['cuisine-index', ids],
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const index = new Map()
      for (let i = 0; i < ids.length; i += PARALLEL) {
        const batch = ids.slice(i, i + PARALLEL)
        const menus = await Promise.allSettled(batch.map((id) => restaurantsApi.menu(id)))
        menus.forEach((result, k) => {
          if (result.status === 'fulfilled') index.set(batch[k], categorySet(result.value))
        })
      }
      return index
    },
  })
}
