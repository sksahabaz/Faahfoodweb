import { formatPrice } from '@/lib/format'
import { appUrl } from '@/lib/paths'

const ArrowIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

/**
 * Order Summary from the session cart: the item count (units, the backend's itemCount) and
 * the cart total. The backend charges no delivery fee or taxes (an order's total is the cart
 * total, set on the server when the order is placed), so no such rows are shown.
 * Proceed to Checkout is a normal link to /checkout: CheckoutController sends guests to the
 * login page first and brings them back to checkout afterwards.
 */
export default function CartSummary({ cart, busy, className = '' }) {
  const count = cart.itemCount
  return (
    <section className={`rounded-[28px] bg-white/75 p-6 shadow-[0_28px_60px_-34px_rgb(110_52_16/0.55)] ring-1 ring-[#f3dccb] sm:p-7 ${className}`}
      aria-labelledby="cart-summary-title" data-testid="cart-summary">
      <h2 id="cart-summary-title" className="flex items-center gap-4 border-b border-[#f0dccd] pb-4 text-[clamp(22px,1.8vw,28px)] font-bold text-espresso">
        <svg viewBox="0 0 24 24" className="h-9 w-9 text-orange" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h12v17.5l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z" /><path d="M9 8h6M9 11.5h6M9 15h4" /></svg>
        Order Summary
      </h2>

      <dl className="mt-4 text-[17px]">
        <div className="flex justify-between text-espresso-soft">
          <dt>Items (<span data-testid="summary-count">{count}</span>)</dt>
          <dd className="font-semibold text-espresso" data-testid="summary-subtotal">{formatPrice(cart.total)}</dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between rounded-[18px] bg-[#fde9da] px-5 py-4">
        <span className="text-[19px] font-bold text-espresso">Total Payable</span>
        <span className="text-[clamp(24px,2vw,30px)] font-bold text-orange-deep" data-testid="summary-total">{formatPrice(cart.total)}</span>
      </div>

      <CheckoutLink busy={busy} className="mt-6 h-[60px] w-full text-[20px]" />

      <p className="mt-4 flex items-center justify-center gap-2 text-[15px] text-espresso-soft">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path d="M12 2.8 4.5 5.6v5.6c0 4.7 3.2 8.6 7.5 10 4.3-1.4 7.5-5.3 7.5-10V5.6z" fill="#f08a3a" /><path d="M8.6 12.2l2.4 2.4 4.4-4.6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Secure checkout
      </p>
    </section>
  )
}

/** Link to /checkout; held back while a cart change is still on its way to the server. */
export function CheckoutLink({ busy, className = '', label = 'Proceed to Checkout' }) {
  return (
    <a href={appUrl('checkout')} data-testid="proceed-checkout" aria-disabled={busy || undefined}
      onClick={(event) => { if (busy) event.preventDefault() }}
      className={`flex items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#ff7f22] to-[#f2560f] px-6 font-semibold text-white shadow-[0_16px_30px_-14px_rgb(232_84_20/0.75)] transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-espresso aria-disabled:cursor-wait aria-disabled:opacity-70 ${className}`}>
      {label}
      <ArrowIcon className="h-6 w-6" />
    </a>
  )
}
