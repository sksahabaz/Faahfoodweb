import { useEffect, useRef } from 'react'
import { setScrollLock } from '@/animations/scroll'
import FoodImage from '@/components/ui/FoodImage'
import QuantityStepper from '@/components/ui/QuantityStepper'
import { formatPrice } from '@/lib/format'
import { appUrl } from '@/lib/paths'

const CartIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path d="M2.5 3.5h2.6l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.2L21 7.5H6.2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9.5" cy="20" r="1.6" fill="currentColor" /><circle cx="17" cy="20" r="1.6" fill="currentColor" /></svg>
)

/**
 * "Your Order": the session cart exactly as GET/POST/PUT/DELETE /api/cart return it
 * (the one session cart). Subtotal and total are the backend's cart total; the backend
 * has no delivery fee, so none is shown. Checkout is the existing /checkout page (it sends
 * guests to /login first and back to checkout afterwards).
 */
export default function CartPanel({ cart, cartRestaurantName, foreign, actions, className = '', headingId = 'order-title' }) {
  const items = cart?.items || []
  const total = formatPrice(cart?.total ?? 0)

  return (
    <section className={`rounded-[28px] bg-white/85 p-5 shadow-[0_24px_50px_-30px_rgb(110_52_16/0.55)] ring-1 ring-espresso/5 sm:p-6 ${className}`}
      aria-labelledby={headingId} data-testid="cart-panel">
      <h2 id={headingId} className="flex items-center gap-3 text-[22px] font-bold text-espresso">
        <CartIcon className="h-7 w-7 text-orange" />
        <span>Your Order <span data-testid="cart-panel-count">({cart?.itemCount ?? 0})</span></span>
      </h2>
      {foreign && items.length > 0 && (
        <p className="mt-2 rounded-xl bg-[#fde7d6] px-3 py-2 text-xs font-medium text-espresso-soft">
          These items are from {cartRestaurantName || 'another restaurant'}.
        </p>
      )}

      {items.length === 0 ? (
        <div className="py-9 text-center" data-testid="cart-empty">
          <p className="font-semibold text-espresso">Your cart is empty</p>
          <p className="mt-1 text-sm text-espresso-soft">Add a dish to start your order.</p>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-4" aria-label="Items in your order">
          {items.map((item) => (
            <li key={item.menuId} className="flex items-center gap-2.5" data-testid="cart-item" data-menu-id={item.menuId}>
              <FoodImage src={item.imageUrl} alt={item.itemName} label={item.itemName} className="h-[52px] w-[64px] shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-espresso" title={item.itemName}>{item.itemName}</p>
                <p className="text-[15px] font-bold text-espresso">
                  {formatPrice(item.price)}
                  {item.quantity > 1 && <span className="ml-1.5 text-xs font-medium text-espresso-soft">× {item.quantity} = {formatPrice(item.subtotal)}</span>}
                </p>
              </div>
              <QuantityStepper size="sm" quantity={item.quantity} label={item.itemName} busy={actions.isPending(item.menuId)}
                onIncrease={() => actions.setQuantity(item.menuId, item.quantity + 1)}
                onDecrease={() => actions.setQuantity(item.menuId, item.quantity - 1)} />
              <button type="button" onClick={() => actions.remove(item.menuId)} disabled={actions.isPending(item.menuId)}
                className="-mr-1.5 grid h-7 w-6 shrink-0 place-items-center rounded-full text-espresso-soft transition hover:bg-espresso/10 hover:text-orange-deep disabled:opacity-50"
                aria-label={`Remove ${item.itemName}`} data-testid="cart-remove">
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-5 space-y-2 border-t border-espresso/10 pt-4 text-[15px]">
        <div className="flex justify-between text-espresso-soft"><dt>Subtotal</dt><dd data-testid="cart-subtotal">{total}</dd></div>
        <div className="flex items-baseline justify-between border-t border-espresso/10 pt-3">
          <dt className="text-xl font-bold text-espresso">Total</dt>
          <dd className="text-2xl font-bold text-orange-deep" data-testid="cart-total">{total}</dd>
        </div>
      </dl>

      {items.length > 0 ? (
        <a href={appUrl('checkout')} data-testid="checkout-link"
          className="mt-5 flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#ec6a2e] to-[#d4501a] px-6 py-3.5 text-[17px] font-semibold text-white shadow-[0_14px_26px_-12px_rgb(207_78_24/0.8)] transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso">
          Proceed to Checkout
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
      ) : (
        <span className="mt-5 flex cursor-not-allowed items-center justify-center rounded-full bg-espresso/10 px-6 py-3.5 text-[17px] font-semibold text-espresso-soft" aria-disabled="true">
          Proceed to Checkout
        </span>
      )}
    </section>
  )
}

/** Phones/tablets: a bar with the live count and total that opens the cart as a bottom drawer. */
export function MobileCart({ open, onOpen, onClose, ...panel }) {
  const closeRef = useRef()
  const count = panel.cart?.itemCount ?? 0

  useEffect(() => {
    if (!open) return undefined
    setScrollLock(true)
    closeRef.current?.focus()
    const onKey = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      setScrollLock(false)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <div className="lg:hidden">
      {count > 0 && !open && (
        <button type="button" onClick={onOpen} data-testid="mobile-cart-bar"
          className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full bg-gradient-to-b from-[#ec6a2e] to-[#d4501a] px-5 py-3.5 text-white shadow-[0_18px_34px_-14px_rgb(160_60_15/0.9)]">
          <span className="flex items-center gap-2.5 font-semibold"><CartIcon className="h-6 w-6" />{count} item{count === 1 ? '' : 's'}</span>
          <span className="flex items-center gap-2 font-bold">{formatPrice(panel.cart?.total)} <span className="font-semibold">View order →</span></span>
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your order">
          <button type="button" className="absolute inset-0 bg-espresso/40 backdrop-blur-[2px]" onClick={onClose} aria-label="Close your order" tabIndex={-1} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto overscroll-contain rounded-t-[30px] bg-[#fdf3ea] p-3 pb-6 shadow-[0_-20px_50px_-20px_rgb(0_0_0/0.4)]"
            data-lenis-prevent data-testid="mobile-cart-drawer">
            <div className="mx-auto mb-2 flex max-w-xl justify-end">
              <button ref={closeRef} type="button" onClick={onClose} className="rounded-full px-4 py-1.5 text-sm font-semibold text-espresso-soft hover:bg-espresso/10">Close</button>
            </div>
            <CartPanel {...panel} headingId="order-title-mobile" className="mx-auto max-w-xl" />
          </div>
        </div>
      )}
    </div>
  )
}
