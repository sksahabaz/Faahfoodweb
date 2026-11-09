import FoodImage from '@/components/ui/FoodImage'
import QuantityStepper from '@/components/ui/QuantityStepper'
import { formatPrice } from '@/lib/format'

const ISSUE_TEXT = {
  missing: 'No longer on the menu. Please remove it.',
  unavailable: 'Currently unavailable. Please remove it.',
}

/**
 * Order Summary: the session cart exactly as /api/cart returns it (names, images, quantities,
 * prices, subtotals and total all come from the server). Quantity changes and removals go
 * through the same cart endpoints as the menu page. The backend has no delivery fee or taxes,
 * so the total payable is the cart total.
 */
export default function OrderSummary({ cart, restaurant, issues, actions, placing, blocked, formId, className = '' }) {
  const items = cart?.items || []

  return (
    <section className={`@container rounded-[28px] bg-white/75 p-5 shadow-[0_28px_60px_-34px_rgb(110_52_16/0.55)] ring-1 ring-[#f3dccb] sm:p-6 ${className}`}
      aria-labelledby="summary-title" data-testid="order-summary">
      <h2 id="summary-title" className="flex items-center gap-3 text-[clamp(22px,2vw,28px)] font-bold text-espresso">
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-orange" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z" /><path d="M9 10.5V6.5a3 3 0 0 1 6 0v4" strokeLinecap="round" /></svg>
        Order Summary
      </h2>

      {restaurant ? (
        <div className="mt-5 flex items-center gap-4 rounded-[20px] bg-[#fdeee2] p-3" data-testid="summary-restaurant">
          <FoodImage src={restaurant.imageUrl} alt={restaurant.name} label={restaurant.name} className="h-[64px] w-[72px] shrink-0 rounded-2xl" />
          <div className="min-w-0">
            <p className="truncate text-[19px] font-bold text-espresso">{restaurant.name}</p>
            {restaurant.address && <p className="truncate text-[15px] text-espresso-soft">{restaurant.address}</p>}
          </div>
        </div>
      ) : (
        <div className="mt-5 h-[88px] animate-pulse rounded-[20px] bg-[#fdeee2]" aria-hidden="true" />
      )}

      <ul className="mt-4 flex flex-col divide-y divide-[#f3e3d6]" aria-label="Items in your order">
        {items.map((item) => {
          const issue = issues.get(item.menuId)
          const busy = actions.isPending(item.menuId)
          return (
            <li key={item.menuId} className="py-3" data-testid="summary-item" data-menu-id={item.menuId} data-issue={issue?.type}>
              <div className="flex items-center gap-3">
                <FoodImage src={item.imageUrl} alt={item.itemName} label={item.itemName}
                  className={`h-[52px] w-[52px] shrink-0 rounded-xl ${issue && issue.type !== 'price' ? 'opacity-50 grayscale' : ''}`} />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[15.5px] font-semibold leading-snug text-espresso" title={item.itemName}>{item.itemName}</p>
                  <p className="text-[13px] text-espresso-soft">{formatPrice(item.price)} each</p>
                </div>
                {/* narrow summary: price above the stepper, so the dish name keeps its room */}
                <div className="flex shrink-0 flex-col-reverse items-end gap-1.5 @md:flex-row @md:items-center @md:gap-3">
                  <QuantityStepper size="sm" quantity={item.quantity} label={item.itemName} busy={busy || placing}
                    onIncrease={() => actions.setQuantity(item.menuId, item.quantity + 1)}
                    onDecrease={() => actions.setQuantity(item.menuId, item.quantity - 1)} />
                  <p className="text-right text-[16px] font-bold text-espresso @md:w-[68px]" data-testid="summary-item-subtotal">{formatPrice(item.subtotal)}</p>
                </div>
              </div>
              {issue && (
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-[#fff0ea] px-3 py-2 text-[13px] font-medium text-[#b3261e]" role="alert" data-testid="summary-issue">
                  {issue.type === 'price' ? (
                    <>
                      <span>Price changed to {formatPrice(issue.price)}.</span>
                      <button type="button" onClick={() => actions.refreshPrice(item)} disabled={busy || placing}
                        className="font-semibold text-orange-deep underline underline-offset-2 disabled:opacity-50">Update price</button>
                    </>
                  ) : (
                    <>
                      <span>{ISSUE_TEXT[issue.type]}</span>
                      <button type="button" onClick={() => actions.remove(item.menuId)} disabled={busy || placing}
                        className="font-semibold text-orange-deep underline underline-offset-2 disabled:opacity-50">Remove</button>
                    </>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <dl className="mt-2 space-y-2 border-t border-[#f0dccd] pt-4 text-[16px]">
        <div className="flex justify-between text-espresso-soft">
          <dt>Item Total</dt>
          <dd data-testid="summary-item-total">{formatPrice(cart?.total ?? 0)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between rounded-[18px] bg-[#fde3cf] px-5 py-4">
        <span className="text-[19px] font-bold text-espresso">Total Payable</span>
        <span className="text-[26px] font-bold text-orange-deep" data-testid="summary-total">{formatPrice(cart?.total ?? 0)}</span>
      </div>

      {blocked && (
        <p className="mt-3 text-center text-[13.5px] font-medium text-[#b3261e]" data-testid="summary-blocked">{blocked}</p>
      )}

      <PlaceOrderButton formId={formId} placing={placing} disabled={Boolean(blocked)} className="mt-4 w-full" />
    </section>
  )
}

/** Submits the checkout form (it lives outside the form, so it uses the `form` attribute). */
export function PlaceOrderButton({ formId, placing, disabled, className = '', compact = false }) {
  return (
    <button type="submit" form={formId} disabled={placing || disabled} aria-busy={placing || undefined} data-testid="place-order"
      className={`flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-[#ff7f22] to-[#f2560f] font-semibold text-white shadow-[0_16px_30px_-14px_rgb(232_84_20/0.75)] transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-espresso disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${compact ? 'h-12 px-6 text-[16px]' : 'h-[60px] px-6 text-[20px]'} ${className}`}>
      {placing ? (
        <>
          <span className="h-5 w-5 animate-spin rounded-full border-[2.5px] border-white/40 border-t-white" aria-hidden="true" />
          Placing order…
        </>
      ) : (
        <>
          Place Order
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </>
      )}
    </button>
  )
}
