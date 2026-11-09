import { useQuery } from '@tanstack/react-query'
import { restaurantsApi } from '@/api/endpoints'

/** GET /api/restaurants/{id} → { restaurantId, name, description, address, phone, rating, deliveryTime, imageUrl } */
export function useRestaurant(restaurantId) {
  return useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => restaurantsApi.get(restaurantId),
    enabled: Boolean(restaurantId),
    staleTime: 5 * 60 * 1000,
    retry: (count, error) => error?.status !== 404 && count < 1,
  })
}

/** GET /api/restaurants/{id}/menu → [{ menuId, itemName, description, price, category, imageUrl, available }] */
export function useMenu(restaurantId) {
  return useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: () => restaurantsApi.menu(restaurantId),
    enabled: Boolean(restaurantId),
    staleTime: 60 * 1000,
  })
}
