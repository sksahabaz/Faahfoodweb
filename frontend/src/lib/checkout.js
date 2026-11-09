// Checkout rules shared by the checkout page. The backend (POST /api/checkout, same rules as
// CheckoutController) only requires name, phone and address to be filled in; the extra
// checks here stop values the order could not store or deliver to.

/**
 * Payment methods. The backend records the chosen method on the order (PaymentController /
 * POST /api/orders) but has no payment gateway: nothing collects money online. So only cash
 * on delivery is offered; UPI and cards are shown as "coming soon" until a gateway exists.
 * `id` is the value the backend stores in orders.payment_method.
 */
export const PAYMENT_METHODS = [
  { id: 'COD', label: 'Cash on Delivery (COD)', note: 'Pay in cash when your order arrives.', available: true },
  { id: 'UPI', label: 'UPI (PhonePe / Google Pay / Paytm)', note: 'Coming soon', available: false },
  { id: 'CARD', label: 'Credit / Debit Card', note: 'Coming soon', available: false },
]

export const DEFAULT_PAYMENT = PAYMENT_METHODS.find((method) => method.available)?.id ?? null

/** orders.delivery_address is VARCHAR(255). */
export const MAX_ADDRESS = 255

export const FIELDS = ['customerName', 'phone', 'address', 'city', 'pincode']

export const EMPTY_DETAILS = { customerName: '', phone: '', address: '', city: '', pincode: '' }

/** Phone without spaces, dashes, dots or brackets (what the order is saved with). */
export function phoneDigits(value) {
  return String(value || '').replace(/[\s\-().]/g, '')
}

/** The single address line the backend stores: "street, City - 560001". */
export function composeAddress({ address, city, pincode }) {
  const street = String(address || '').trim().replace(/\s*\n+\s*/g, ', ')
  return `${street}, ${String(city || '').trim()} - ${String(pincode || '').trim()}`
}

/** Splits an address written by composeAddress back into its parts; anything else stays as the street. */
export function splitAddress(saved) {
  const text = String(saved || '').trim()
  const match = text.match(/^([\s\S]*\S),\s*([^,]+?)\s+-\s+([1-9]\d{5})$/)
  return match
    ? { address: match[1], city: match[2], pincode: match[3] }
    : { address: text, city: '', pincode: '' }
}

const RULES = {
  customerName: (v) => (v ? '' : 'Please enter your full name.'),
  phone: (v) => {
    if (!v) return 'Please enter your phone number.'
    return /^\+?\d{10,14}$/.test(phoneDigits(v)) ? '' : 'Please enter a valid phone number (10 to 14 digits).'
  },
  address: (v) => (v ? '' : 'Please enter your delivery address.'),
  city: (v) => {
    if (!v) return 'Please enter your city.'
    return /^[\p{L}][\p{L} .'-]{1,59}$/u.test(v) ? '' : 'Please enter a valid city name.'
  },
  pincode: (v) => {
    if (!v) return 'Please enter your pincode.'
    return /^[1-9]\d{5}$/.test(v) ? '' : 'Please enter a valid 6-digit pincode.'
  },
}

/** Returns { field: message } for every invalid field (empty object when all are fine). */
export function validateDetails(details) {
  const errors = {}
  for (const field of FIELDS) {
    const message = RULES[field](String(details[field] || '').trim())
    if (message) errors[field] = message
  }
  if (!errors.address && !errors.city && !errors.pincode && composeAddress(details).length > MAX_ADDRESS) {
    errors.address = `Please shorten the address (at most ${MAX_ADDRESS} characters including city and pincode).`
  }
  return errors
}

/** Which field a backend message from /api/checkout is about (its messages name the field). */
export function fieldForMessage(message) {
  const text = String(message || '').toLowerCase()
  if (text.includes('name')) return 'customerName'
  if (text.includes('phone')) return 'phone'
  if (text.includes('address')) return 'address'
  return null
}

/**
 * Compares the session cart with the restaurant's current menu (fresh from the database).
 * The order is priced from the cart on the server, so a dish that was switched off or
 * repriced after it was added is flagged here and must be dealt with before ordering.
 *   'missing'      no longer on the menu
 *   'unavailable'  marked unavailable
 *   'price'        price changed (the cart still holds the old one)
 */
export function cartIssues(cart, menu) {
  const issues = new Map()
  if (!cart?.items?.length || !Array.isArray(menu)) return issues
  const byId = new Map(menu.map((item) => [item.menuId, item]))
  for (const item of cart.items) {
    const current = byId.get(item.menuId)
    if (!current) issues.set(item.menuId, { type: 'missing' })
    else if (current.available === false) issues.set(item.menuId, { type: 'unavailable' })
    else if (Number(current.price) !== Number(item.price)) issues.set(item.menuId, { type: 'price', price: current.price })
  }
  return issues
}
