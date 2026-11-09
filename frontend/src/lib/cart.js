// Helpers for the cart page. Everything here works on data returned by the backend
// (GET /api/cart and GET /api/restaurants/{id}/menu); nothing is made up.

const category = (item) => String(item.category || '').trim().toLowerCase()

/**
 * "You May Also Like": dishes from the same restaurant's real menu that are available and not
 * already in the cart (the backend allows one restaurant per cart, so these can always be
 * added). Dishes from categories the cart doesn't have yet come first (a drink or a side next
 * to a main), one per category, then the rest; otherwise the menu's own order is kept.
 */
export function pickRecommendations(menu, cart, limit = 3) {
  if (!Array.isArray(menu) || !cart?.items?.length) return []
  const inCart = new Set(cart.items.map((item) => item.menuId))
  const cartCategories = new Set(cart.items.map(category))
  const candidates = menu.filter((item) => item.available !== false && !inCart.has(item.menuId))

  const picked = []
  const seen = new Set()
  for (const item of candidates) {
    const name = category(item)
    if (cartCategories.has(name) || seen.has(name)) continue
    seen.add(name)
    picked.push(item)
  }
  for (const item of candidates) {
    if (!picked.includes(item)) picked.push(item)
  }
  return picked.slice(0, limit)
}
