import { Link } from 'react-router'
import FoodImage from '@/components/ui/FoodImage'
import QuantityStepper from '@/components/ui/QuantityStepper'
import { ALL } from '@/hooks/useSession'
import { formatMinutes, formatPrice } from '@/lib/format'

const ISSUE_TEXT = {
  missing: 'No longer on the menu. Remove it to check out.',
  unavailable: 'Currently unavailable. Remove it to check out.',
}

const TrashIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h16M9.5 7V4.8h5V7M6.5 7l.9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3L17.5 7M10.2 11v6M13.8 11v6" />
  </svg>
)

/**
 * The cart card: the restaurant the cart belongs to and every line of the session cart
 * exactly as GET /api/cart returns it (name, description, image, unit price, quantity).
 * Quantity, remove and clear go through the shared cart actions (useCartActions), whose
 * answers replace the cached cart, so the navbar badge and the summary change with them.
 * `issues` (lib/checkout cartIssues) flags dishes switched off or repriced since they were
 * added; checkout refuses those until they are fixed.
 */
export default function CartItems({ cart, restaurant, issues, actions, onClear }) {
  const minutes = formatMinutes(restaurant?.deliveryTime)
  const menuLink = cart.restaurantId ? `/restaurants/${cart.restaurantId}` : '/#restaurants'

  return (
    <section className="@container overflow-hidden rounded-[28px] bg-white/75 shadow-[0_24px_50px_-34px_rgb(110_52_16/0.5)] ring-1 ring-[#f3dccb]"
      aria-labelledby="cart-restaurant" data-testid="cart-card">
      {/* restaurant */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 bg-white/60 px-5 py-4 sm:px-7" data-testid="cart-restaurant">
        {restaurant ? (
          <>
            <FoodImage src={restaurant.imageUrl} alt={restaurant.name} label={restaurant.name} className="h-[68px] w-[78px] shrink-0 rounded-2xl sm:h-[76px] sm:w-[88px]" />
            <div className="min-w-0 flex-1">
              <h2 id="cart-restaurant" className="line-clamp-2 text-[clamp(20px,1.6vw,25px)] font-bold leading-tight text-espresso">
                <Link to={`/restaurants/${restaurant.restaurantId}`} className="hover:text-orange-deep">{restaurant.name}</Link>
              </h2>
              {restaurant.address && (
                <p className="mt-1 flex items-center gap-1.5 text-[15px] text-espresso-soft" data-testid="cart-restaurant-address">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-orange" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></svg>
                  <span className="line-clamp-1">{restaurant.address}</span>
                </p>
              )}
            </div>
            {minutes && (
              // the restaurant's own delivery time, as listed on its card and menu page
              <p className="flex items-center gap-2 rounded-full bg-[#fff4ec] px-4 py-2 text-[14px] font-medium text-espresso ring-1 ring-[#f6c9a8]" data-testid="cart-delivery-time">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-orange" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
                Estimated Delivery: <strong className="text-[17px] font-bold text-orange-deep">{minutes}</strong>
              </p>
            )}
          </>
        ) : (
          <div className="flex w-full items-center gap-5" aria-hidden="true">
            <div className="h-[76px] w-[88px] animate-pulse rounded-2xl bg-[#fdeee2]" />
            <div className="flex-1 space-y-2"><div className="h-6 w-1/2 animate-pulse rounded-full bg-[#fdeee2]" /><div className="h-4 w-1/3 animate-pulse rounded-full bg-[#fdeee2]" /></div>
          </div>
        )}
      </div>

      {/* items */}
      <ul className="mx-5 divide-y divide-[#f3e3d6] sm:mx-7" aria-label="Items in your cart">
        {cart.items.map((item) => {
          const issue = issues.get(item.menuId)
          const busy = actions.isPending(item.menuId)
          const blocked = issue && issue.type !== 'price'
          return (
            <li key={item.menuId} className="py-4" data-testid="cart-line" data-menu-id={item.menuId} data-issue={issue?.type}>
              <div className="flex items-center gap-4 @xl:gap-5">
                <FoodImage src={item.imageUrl} alt={item.itemName} label={item.itemName}
                  className={`h-[72px] w-[80px] shrink-0 self-start rounded-2xl @xl:h-[76px] @xl:w-[100px] @xl:self-center ${blocked ? 'opacity-50 grayscale' : ''}`} />
                <div className="flex min-w-0 flex-1 flex-col gap-2 @xl:flex-row @xl:items-center @xl:gap-5">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[17px] font-bold leading-snug text-espresso @xl:text-[19px]" data-testid="cart-line-name">{item.itemName}</p>
                    {item.description && <p className="mt-0.5 line-clamp-2 text-[14px] leading-snug text-espresso-soft">{item.description}</p>}
                  </div>
                  <div className="flex items-center justify-between gap-4 @xl:contents">
                    <div className="@xl:w-[92px] @xl:text-right">
                      <p className="text-[18px] font-bold text-espresso @xl:text-[20px]" data-testid="cart-line-price">{formatPrice(item.price)}</p>
                      {item.quantity > 1 && <p className="text-[12.5px] text-espresso-soft" data-testid="cart-line-subtotal">{formatPrice(item.subtotal)} for {item.quantity}</p>}
                    </div>
                    <QuantityStepper quantity={item.quantity} label={item.itemName} busy={busy}
                      onIncrease={() => actions.setQuantity(item.menuId, item.quantity + 1)}
                      onDecrease={() => actions.setQuantity(item.menuId, item.quantity - 1)} />
                  </div>
                </div>
                <button type="button" onClick={() => actions.remove(item.menuId)} disabled={busy}
                  className="grid h-10 w-10 shrink-0 self-start place-items-center rounded-full text-[#e0491b] transition hover:bg-[#fde3d6] disabled:cursor-wait disabled:opacity-50 @xl:self-center"
                  aria-label={`Remove ${item.itemName}`} data-testid="cart-line-remove">
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
              {issue && (
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-[#fff0ea] px-3 py-2 text-[13.5px] font-medium text-[#b3261e]" role="alert" data-testid="cart-line-issue">
                  {issue.type === 'price' ? (
                    <>
                      <span>The price is now {formatPrice(issue.price)}.</span>
                      <button type="button" onClick={() => actions.refreshPrice(item)} disabled={busy}
                        className="font-semibold text-orange-deep underline underline-offset-2 disabled:opacity-50">Update price</button>
                    </>
                  ) : (
                    <span>{ISSUE_TEXT[issue.type]}</span>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-[#f3e3d6] px-4 py-3 sm:px-7 sm:py-4">
        <Link to={menuLink} className="inline-flex items-center gap-2 whitespace-nowrap rounded-full py-1.5 text-[15px] font-semibold text-[#d4501a] hover:text-orange-deep sm:gap-2.5 sm:text-[17px]" data-testid="continue-ordering">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H6M11 6l-6 6 6 6" /></svg>
          Continue Ordering
        </Link>
        <button type="button" onClick={onClear} disabled={actions.isPending(ALL)}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1.5 text-[15px] font-semibold text-[#d4501a] transition hover:bg-[#fde3d6] disabled:cursor-wait disabled:opacity-60 sm:gap-2 sm:text-[17px]" data-testid="clear-cart">
          <TrashIcon className="h-6 w-6" />
          Clear Cart
        </button>
      </div>
    </section>
  )
}
