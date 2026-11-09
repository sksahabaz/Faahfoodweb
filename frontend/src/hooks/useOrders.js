import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { cartApi, ordersApi, restaurantsApi } from '@/api/endpoints'
import { useCartActions } from '@/hooks/useSession'

/**
 * GET /api/orders → the logged-in user's orders (no items): { orderId, restaurantId,
 * restaurantName, orderDate, totalAmount, status, paymentMethod, paymentStatus,
 * deliveryAddress }. 401 when logged out. Newest first.
 */
export function useOrderList() {
  return useQuery({
    queryKey: ['session', 'orders'],
    queryFn: ordersApi.list,
    staleTime: 0,
    refetchOnWindowFocus: true,
    select: (orders) => [...orders].sort((a, b) => String(b.orderDate).localeCompare(String(a.orderDate)) || b.orderId - a.orderId),
    retry: (count, error) => ![401, 403].includes(error?.status) && count < 2,
  })
}

/**
 * GET /api/orders/{id} → { orderId, restaurantId, restaurantName, orderDate, totalAmount,
 * status, paymentMethod, paymentStatus, deliveryAddress, items }. The backend only returns
 * the logged-in user's own orders (404 otherwise, 401 when logged out).
 * Re-checked every 30 s and on tab focus, so the tracker follows real status changes.
 */
export function useOrder(orderId) {
  return useQuery({
    queryKey: ['session', 'order', orderId],
    queryFn: () => ordersApi.get(orderId),
    enabled: Boolean(orderId),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => (query.state.data && !['DELIVERED', 'CANCELLED'].includes(String(query.state.data.status).toUpperCase()) ? 30_000 : false),
    retry: (count, error) => ![401, 403, 404].includes(error?.status) && count < 2,
  })
}

/**
 * Reorder: puts a past order's dishes back into the session cart.
 *   1. Reads the restaurant's menu now (GET /api/restaurants/{id}/menu): dishes that are gone
 *      or switched off are skipped and listed; the rest are added at today's price (the cart
 *      always takes the price from the menu table, never from the old order).
 *   2. If the cart holds another restaurant's dishes (one restaurant per cart), it stops at
 *      'confirm' so the page can ask before they are replaced.
 *   3. Adds them through the shared cart actions, so the navbar badge and the cart page get
 *      the server's updated cart at once.
 * state.status: idle | checking | confirm | adding | done | error
 */
export function useReorder() {
  const queryClient = useQueryClient()
  const actions = useCartActions()
  const [state, setState] = useState({ status: 'idle' })

  const add = useCallback(async (plan, replace) => {
    setState({ ...plan, status: 'adding' })
    const ok = await actions.addLines(plan.lines, { replace })
    setState(ok ? { ...plan, status: 'done' } : { status: 'error', message: "We couldn't add these dishes to your cart. Please try again." })
  }, [actions])

  const start = useCallback(async (order) => {
    setState({ status: 'checking' })
    try {
      const [menu, cart] = await Promise.all([
        queryClient.fetchQuery({ queryKey: ['menu', order.restaurantId], queryFn: () => restaurantsApi.menu(order.restaurantId), staleTime: 0 }),
        queryClient.fetchQuery({ queryKey: ['session', 'cart'], queryFn: cartApi.get, staleTime: 0 }),
      ])
      const wanted = new Map() // menuId → { quantity, item } (a dish could appear on two lines)
      for (const item of order.items || []) {
        const entry = wanted.get(item.menuId)
        wanted.set(item.menuId, { item, quantity: (entry?.quantity || 0) + item.quantity })
      }
      const lines = []
      const unavailable = []
      const priceChanges = []
      for (const [menuId, { item, quantity }] of wanted) {
        const current = menu.find((dish) => dish.menuId === menuId)
        if (!current || current.available === false) {
          unavailable.push(current?.itemName || item.itemName)
          continue
        }
        lines.push({ menuId, quantity, itemName: current.itemName })
        if (Number(current.price) !== Number(item.price)) priceChanges.push({ itemName: current.itemName, was: item.price, now: current.price })
      }
      const plan = { orderId: order.orderId, lines, unavailable, priceChanges, units: lines.reduce((sum, line) => sum + line.quantity, 0) }
      if (!lines.length) return setState({ ...plan, status: 'done' })
      const foreign = cart.items.length > 0 && cart.restaurantId !== order.restaurantId
      if (foreign) return setState({ ...plan, status: 'confirm' })
      await add(plan, false)
    } catch (failure) {
      setState({ status: 'error', message: failure.message || "We couldn't check this restaurant's menu. Please try again." })
    }
  }, [queryClient, add])

  return {
    state,
    start,
    confirm: () => add(state, true),
    cancel: () => setState({ status: 'idle' }),
    reset: () => setState({ status: 'idle' }),
  }
}
