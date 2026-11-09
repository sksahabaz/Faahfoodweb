import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { authApi, cartApi } from '@/api/endpoints'

// Login and cart live in the Tomcat session (cookie-based, server-side), so React
// never keeps its own copy: it always asks the server and re-asks whenever the
// user comes back to the page (tab focus, or Back from the login page).
const SESSION = ['session']

/** GET /api/auth/me → { authenticated, user } */
export function useAuth() {
  return useQuery({
    queryKey: [...SESSION, 'me'],
    queryFn: authApi.me,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
}

/** GET /api/cart → { restaurantId, items, itemCount, total } */
export function useCart() {
  return useQuery({
    queryKey: [...SESSION, 'cart'],
    queryFn: cartApi.get,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
}

/** POST /api/auth/logout: ends the shared session; the page stays on the homepage. */
export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => queryClient.invalidateQueries({ queryKey: SESSION }),
  })
}

/**
 * Refreshes login and cart when the page is shown again: Back/Forward restores it from
 * the browser cache (pageshow.persisted) without re-running React, and a hidden tab may
 * have changed the cart meanwhile.
 */
export function useSessionRefresh() {
  const queryClient = useQueryClient()
  useEffect(() => {
    const refresh = () => queryClient.invalidateQueries({ queryKey: SESSION })
    const onPageShow = (event) => { if (event.persisted) refresh() }
    const onVisible = () => { if (document.visibilityState === 'visible') refresh() }
    window.addEventListener('pageshow', onPageShow)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('pageshow', onPageShow)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [queryClient])
}

const CART = [...SESSION, 'cart']

// Every cart change on the page (navbar, menu, cart page, checkout) goes through this one
// queue: requests reach the server one after another and each response, the full updated
// cart, is stored in that same order. A slow earlier response can therefore never overwrite
// a newer one, so the badge and every cart view always show the latest server cart.
let cartQueue = Promise.resolve()

function queueCartChange(queryClient, request) {
  const change = cartQueue.then(async () => {
    const cart = await request()
    // A cart read already in flight may have been answered before this change: drop it.
    await queryClient.cancelQueries({ queryKey: CART })
    queryClient.setQueryData(CART, cart)
    return cart
  })
  cartQueue = change.catch(() => {})
  return change
}

/**
 * Cart changes through the existing /api/cart endpoints (the one session cart). Every call returns the updated cart, which becomes the cached cart directly, so
 * the navbar badge and every cart view update together; nothing is kept only in the browser.
 *
 *   add(item)            POST   /api/cart/items {menuId}       (+1)
 *   setQuantity(id, n)   PUT    /api/cart/items/{id} {quantity} (0 removes)
 *   remove(id)           DELETE /api/cart/items/{id}
 *   clear()              DELETE /api/cart
 *   addLines(lines)      several dishes with quantities in one change (Reorder)
 *   replaceWith(item)    DELETE /api/cart, then add(item)      (after the user confirms)
 *   refreshPrice(item)   remove + add + set quantity, so the cart picks up the dish's
 *                        current price from the database (the cart keeps the price it
 *                        had when added)
 *
 * isPending(menuId) is true while a change to that dish is on its way (isPending(ALL) for
 * clear). The backend allows one restaurant per cart: adding from another answers 409,
 * exposed as `conflict` (the item) so the page can ask before clearing anything.
 */
export const ALL = 'all'

export function useCartActions() {
  const queryClient = useQueryClient()
  const [pendingIds, setPendingIds] = useState(() => new Set())
  const [conflict, setConflict] = useState(null)
  const [error, setError] = useState(null)

  const run = useCallback(async (menuId, request, item) => {
    setPendingIds((ids) => new Set(ids).add(menuId))
    setError(null)
    try {
      await queueCartChange(queryClient, request)
      return true
    } catch (failure) {
      if (failure.status === 409 && item) setConflict(item)
      else setError(failure.message)
      queryClient.invalidateQueries({ queryKey: CART })
      return false
    } finally {
      setPendingIds((ids) => {
        const next = new Set(ids)
        next.delete(menuId)
        return next
      })
    }
  }, [queryClient])

  const add = useCallback((item) => run(item.menuId, () => cartApi.add(item.menuId), item), [run])
  const setQuantity = useCallback((menuId, quantity) => run(menuId, () => cartApi.setQuantity(menuId, quantity)), [run])
  const remove = useCallback((menuId) => run(menuId, () => cartApi.remove(menuId)), [run])
  const clear = useCallback(() => run(ALL, () => cartApi.clear()), [run])
  // Several dishes at once (Reorder): POST adds one of each at today's menu price, then PUT
  // raises it by the rest of the wanted quantity. `replace` empties the cart first (after
  // the user agreed to drop another restaurant's dishes). One queued change, one cart update.
  const addLines = useCallback((lines, { replace = false } = {}) => run(ALL, async () => {
    let cart = replace ? await cartApi.clear() : null
    for (const { menuId, quantity } of lines) {
      cart = await cartApi.add(menuId)
      if (quantity > 1) {
        const now = cart.items.find((item) => item.menuId === menuId)?.quantity ?? 1
        cart = await cartApi.setQuantity(menuId, now - 1 + quantity)
      }
    }
    return cart
  }), [run])
  const replaceWith = useCallback(async (item) => {
    setConflict(null)
    if (await run(item.menuId, () => cartApi.clear())) await add(item)
  }, [run, add])

  const refreshPrice = useCallback((item) => run(item.menuId, async () => {
    await cartApi.remove(item.menuId)
    const cart = await cartApi.add(item.menuId)
    return item.quantity > 1 ? cartApi.setQuantity(item.menuId, item.quantity) : cart
  }), [run])

  const isPending = useCallback((menuId) => pendingIds.has(menuId) || pendingIds.has(ALL), [pendingIds])

  return { add, setQuantity, remove, clear, addLines, replaceWith, refreshPrice, isPending, busy: pendingIds.size > 0, conflict, dismissConflict: () => setConflict(null), error, dismissError: () => setError(null) }
}
