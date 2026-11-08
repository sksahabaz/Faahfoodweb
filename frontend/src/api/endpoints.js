import { api } from './client'

// One function per backend endpoint. See src/main/java/com/food/api/.

export const restaurantsApi = {
  list: () => api('/restaurants'),
  get: (restaurantId) => api(`/restaurants/${restaurantId}`),
  menu: (restaurantId) => api(`/restaurants/${restaurantId}/menu`),
}

export const authApi = {
  me: () => api('/auth/me'),
  checkEmail: (email) => api('/auth/check-email', { method: 'POST', body: { email } }),
  login: (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }),
  signup: (details) => api('/auth/signup', { method: 'POST', body: details }),
  logout: () => api('/auth/logout', { method: 'POST' }),
}

export const cartApi = {
  get: () => api('/cart'),
  add: (menuId) => api('/cart/items', { method: 'POST', body: { menuId } }),
  setQuantity: (menuId, quantity) =>
    api(`/cart/items/${menuId}`, { method: 'PUT', body: { quantity } }),
  remove: (menuId) => api(`/cart/items/${menuId}`, { method: 'DELETE' }),
  clear: () => api('/cart', { method: 'DELETE' }),
}

export const checkoutApi = {
  get: () => api('/checkout'),
  save: (details) => api('/checkout', { method: 'POST', body: details }),
}

export const ordersApi = {
  list: () => api('/orders'),
  get: (orderId) => api(`/orders/${orderId}`),
  place: (paymentMethod) => api('/orders', { method: 'POST', body: { paymentMethod } }),
}
