// How order data from GET /api/orders/{id} is shown. Only values the backend actually returns
// are displayed; anything unknown or missing is hidden rather than guessed.

/** The four stages of the tracker, in order. */
export const STAGES = [
  { id: 'placed', label: 'Order Placed', description: 'We have your order' },
  { id: 'preparing', label: 'Preparing', description: 'The restaurant prepares your food' },
  { id: 'out', label: 'Out for Delivery', description: 'Your rider brings it to you' },
  { id: 'delivered', label: 'Delivered', description: 'Enjoy your meal!' },
]

/**
 * orders.status → tracker stage. Today the backend only ever writes PLACED (OrderService /
 * PaymentController) and nothing changes it later; the other names are ready for when a
 * restaurant or admin tool starts updating orders.
 */
const STAGE_OF_STATUS = {
  PLACED: 0,
  CONFIRMED: 0,
  ACCEPTED: 1,
  PREPARING: 1,
  READY: 1,
  OUT_FOR_DELIVERY: 2,
  DISPATCHED: 2,
  DELIVERED: 3,
  COMPLETED: 3,
}
const CANCELLED = new Set(['CANCELLED', 'CANCELED', 'REJECTED', 'FAILED'])

const normalise = (value) => String(value || '').trim().toUpperCase().replace(/[\s-]+/g, '_')

/**
 * What kind of page to show for this order:
 *   'confirmed'       the order exists and is active or delivered (green success state)
 *   'cancelled'       cancelled / rejected by the backend
 *   'payment-failed'  the backend marked the payment as failed
 * plus the tracker stage (0-3) when the status is a known one.
 */
export function orderState(order) {
  const status = normalise(order?.status)
  const payment = normalise(order?.paymentStatus)
  if (CANCELLED.has(status)) return { kind: 'cancelled', stage: null, status }
  if (payment === 'FAILED') return { kind: 'payment-failed', stage: null, status }
  const stage = STAGE_OF_STATUS[status]
  return { kind: 'confirmed', stage: stage ?? 0, known: stage !== undefined, status }
}

/** Short line under the heading, true for the current stage. */
export function heroMessage(stage) {
  return [
    "We've received your order and passed it to the restaurant.",
    "We've received your order and it's being prepared by the restaurant.",
    'Your order is on its way to you.',
    'Your order has been delivered. Enjoy your meal!',
  ][stage] ?? "We've received your order."
}

const METHOD_LABELS = { COD: 'Cash on Delivery', CASH: 'Cash on Delivery', UPI: 'UPI', CARD: 'Card' }
const PAYMENT_STATUS_LABELS = { PENDING: 'Pending', PAID: 'Paid', SUCCESS: 'Paid', COMPLETED: 'Paid', FAILED: 'Failed', REFUNDED: 'Refunded' }

/** Payment details exactly as stored (orders.payment_method may be empty). */
export function paymentInfo(order) {
  const method = normalise(order?.paymentMethod)
  const status = normalise(order?.paymentStatus)
  return {
    method: method ? METHOD_LABELS[method] ?? order.paymentMethod : null,
    status: status ? PAYMENT_STATUS_LABELS[status] ?? order.paymentStatus : null,
    paid: PAYMENT_STATUS_LABELS[status] === 'Paid',
  }
}

/**
 * The backend sends dates as "yyyy-MM-dd'T'HH:mm:ss" in the server's own clock time (no time
 * zone). They are shown as written, without converting through the browser's time zone.
 */
export function formatOrderTime(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!match) return null
  const [, year, month, day, hour, minute] = match.map(Number)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const h12 = hour % 12 || 12
  return {
    time: `${h12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`,
    date: `${day} ${months[month - 1]} ${year}`,
  }
}

/**
 * My Orders filter an order belongs to, from its real status (orderState):
 *   'active'     placed, preparing or out for delivery (stages 0-2)
 *   'delivered'  delivered / completed
 *   'cancelled'  cancelled / rejected
 *   null         payment failed, or a status this page doesn't know: listed under All only
 */
export function orderGroup(order) {
  const state = orderState(order)
  if (state.kind === 'cancelled') return 'cancelled'
  if (state.kind !== 'confirmed' || !state.known) return null
  return state.stage === 3 ? 'delivered' : 'active'
}

const STAGE_CHIPS = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered']

/** Status chip text and tone for an order card. Unknown statuses are shown as stored. */
export function statusChip(order) {
  const state = orderState(order)
  if (state.kind === 'cancelled') return { label: 'Cancelled', tone: 'cancelled' }
  if (state.kind === 'payment-failed') return { label: 'Payment failed', tone: 'cancelled' }
  if (!state.known) {
    const raw = String(order?.status || '').trim()
    return { label: raw ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase().replace(/_/g, ' ') : 'Unknown', tone: 'neutral' }
  }
  return { label: STAGE_CHIPS[state.stage], tone: state.stage === 3 ? 'delivered' : 'active', stage: state.stage }
}
