import FoodImage from '@/components/ui/FoodImage'
import QuantityStepper from '@/components/ui/QuantityStepper'
import { formatPrice } from '@/lib/format'

/**
 * One menu item from GET /api/restaurants/{id}/menu. The image is the item's own image URL
 * from the database. The badge shows its menu category (the API has no "bestseller" flag).
 */
export default function DishCard({ item, quantity, busy, onAdd, onIncrease, onDecrease }) {
  const unavailable = item.available === false
  const price = formatPrice(item.price)

  return (
    <article data-testid="dish-card" data-menu-id={item.menuId}
      className={`flex gap-4 rounded-[24px] bg-white/85 p-2.5 pr-4 shadow-[0_18px_40px_-28px_rgb(110_52_16/0.55)] ring-1 ring-espresso/5 transition duration-300 sm:gap-5 ${
        unavailable ? 'opacity-70 grayscale-[35%]' : 'hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-26px_rgb(110_52_16/0.6)]'
      }`}>
      <div className="relative shrink-0">
        <FoodImage src={item.imageUrl} alt={item.itemName} label={item.itemName}
          className="h-[112px] w-[128px] rounded-[18px] sm:h-[136px] sm:w-[200px]" />
        {item.category && (
          <span className="absolute left-2 top-2 max-w-[calc(100%-16px)] truncate rounded-full bg-gradient-to-b from-[#ec6a2e] to-[#d4501a] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-[0_4px_10px_-4px_rgb(207_78_24/0.8)] sm:text-xs">
            {item.category}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-1 sm:py-1.5">
        <h3 className="text-[17px] font-bold leading-snug text-espresso sm:text-[19px]">{item.itemName}</h3>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-espresso-soft sm:text-sm">{item.description}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <span className="text-xl font-bold text-[#7a1d0c] sm:text-[22px]" data-testid="dish-price">{price}</span>
          {unavailable ? (
            <span className="rounded-full bg-espresso/10 px-3 py-1.5 text-xs font-semibold text-espresso-soft">Currently unavailable</span>
          ) : quantity > 0 ? (
            <QuantityStepper quantity={quantity} busy={busy} label={item.itemName} onIncrease={onIncrease} onDecrease={onDecrease} />
          ) : (
            <button type="button" onClick={onAdd} disabled={busy} data-testid="dish-add"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#ec6a2e] to-[#d4501a] px-5 py-2 text-[15px] font-semibold text-white shadow-[0_10px_20px_-10px_rgb(207_78_24/0.8)] transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso disabled:cursor-wait disabled:opacity-70"
              aria-label={`Add ${item.itemName} to your order`}>
              Add
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export function DishCardSkeleton() {
  return (
    <div className="flex animate-pulse gap-5 rounded-[24px] bg-white/60 p-2.5 ring-1 ring-espresso/5" aria-hidden="true">
      <div className="h-[112px] w-[128px] rounded-[18px] bg-cream-deep sm:h-[136px] sm:w-[200px]" />
      <div className="flex flex-1 flex-col gap-2.5 py-2">
        <div className="h-4 w-1/2 rounded-full bg-cream-deep" />
        <div className="h-3 w-full rounded-full bg-cream-deep/80" />
        <div className="h-3 w-3/4 rounded-full bg-cream-deep/80" />
        <div className="mt-auto h-8 w-24 self-end rounded-full bg-cream-deep" />
      </div>
    </div>
  )
}
