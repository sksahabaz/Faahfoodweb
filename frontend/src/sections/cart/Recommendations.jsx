import { Link } from 'react-router'
import FoodImage from '@/components/ui/FoodImage'
import { formatPrice } from '@/lib/format'

/**
 * "You May Also Like": real dishes from the cart's restaurant (lib/cart pickRecommendations).
 * Add uses the same cart action as the menu page (POST /api/cart/items), so the cart list,
 * the totals and the navbar badge all update from the server's answer. Not rendered when the
 * menu has nothing else to offer.
 */
export default function Recommendations({ dishes, restaurantId, actions }) {
  if (!dishes.length) return null
  return (
    <section className="rounded-[28px] bg-white/75 px-5 py-5 shadow-[0_24px_50px_-34px_rgb(110_52_16/0.5)] ring-1 ring-[#f3dccb] sm:px-6"
      aria-labelledby="also-like-title" data-testid="recommendations">
      <div className="flex items-center justify-between gap-3">
        <h2 id="also-like-title" className="flex min-w-0 items-center gap-2.5 text-[clamp(19px,1.7vw,26px)] font-bold text-espresso sm:gap-3">
          <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" aria-hidden="true"><path d="M3 8.5l4.5 3.5L12 5l4.5 7L21 8.5 19 18H5z" fill="#f59a2c" stroke="#e8701e" strokeWidth="1.4" strokeLinejoin="round" /><path d="M5 18h14v2H5z" fill="#e8701e" /></svg>
          You May Also Like
        </h2>
        <Link to={`/restaurants/${restaurantId}`} className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[15px] font-semibold text-[#d4501a] hover:text-orange-deep sm:gap-1.5 sm:text-[16px]" data-testid="view-more">
          View More
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Dishes you may also like">
        {dishes.map((dish) => {
          const busy = actions.isPending(dish.menuId)
          return (
            <li key={dish.menuId} className="flex items-center gap-3 rounded-[20px] bg-white/80 p-3 ring-1 ring-[#f3e3d6]" data-testid="recommendation" data-menu-id={dish.menuId}>
              <FoodImage src={dish.imageUrl} alt={dish.itemName} label={dish.itemName} className="h-[72px] w-[78px] shrink-0 rounded-2xl" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p className="line-clamp-2 text-[16px] font-semibold leading-snug text-espresso" title={dish.itemName}>{dish.itemName}</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[16px] font-bold text-espresso">{formatPrice(dish.price)}</p>
                  <button type="button" onClick={() => actions.add(dish)} disabled={busy} aria-label={`Add ${dish.itemName} to cart`}
                    className="inline-flex items-center gap-1 rounded-full px-3.5 py-1 text-[15px] font-semibold text-[#d4501a] ring-[1.5px] ring-[#ee8a55] transition hover:bg-[#fff0e6] disabled:cursor-wait disabled:opacity-60"
                    data-testid="recommendation-add">
                    {busy
                      ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f2b08a] border-t-[#d4501a]" aria-hidden="true" />
                      : <span aria-hidden="true" className="text-[18px] leading-none">+</span>}
                    Add
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
