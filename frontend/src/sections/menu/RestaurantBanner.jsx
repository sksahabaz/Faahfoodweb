import FoodImage from '@/components/ui/FoodImage'
import { formatMinutes, formatRating } from '@/lib/format'

/**
 * Restaurant banner. Everything shown comes from GET /api/restaurants/{id}; cuisines are
 * derived from the restaurant's real menu categories. The API has no logo, review count
 * or favourites, so those are not shown (the logo tile shows a monogram of the name).
 */
export default function RestaurantBanner({ restaurant, cuisines, onBack }) {
  const rating = formatRating(restaurant.rating)
  const minutes = formatMinutes(restaurant.deliveryTime)

  return (
    <section className="relative isolate overflow-hidden rounded-[30px] bg-[#5f2c13] shadow-[0_32px_60px_-36px_rgb(80_30_10/0.85)]"
      aria-labelledby="restaurant-name" data-testid="restaurant-banner">
      {/* Cover: the restaurant's own image URL from the database. */}
      <FoodImage src={restaurant.imageUrl} alt="" quiet loading="eager"
        className="absolute inset-0 -z-10 md:left-auto md:w-[58%] md:[mask-image:linear-gradient(90deg,transparent,#000_38%)]" imgClassName="scale-[1.02]" data-testid="restaurant-cover" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#5a2711_0%,#62301a_34%,rgb(98_48_26/0.9)_46%,rgb(98_48_26/0.45)_66%,rgb(98_48_26/0.05)_88%)] max-md:bg-[linear-gradient(180deg,rgb(70_32_14/0.55),rgb(70_32_14/0.92))]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_18%_50%,rgb(255_170_100/0.14),transparent_70%)]" />

      <button type="button" onClick={onBack} aria-label="Back to restaurants"
        className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-espresso shadow-[0_8px_18px_-8px_rgb(0_0_0/0.5)] transition hover:-translate-x-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-5 sm:top-5 sm:h-12 sm:w-12">
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true"><path d="M19 12H6M11 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      <div className="flex min-h-[230px] items-end gap-7 px-5 pb-6 pt-20 sm:px-8 md:min-h-[218px] md:items-center md:py-8 md:pl-[88px]">
        <div className="hidden h-[150px] w-[150px] shrink-0 place-items-center rounded-[28px] bg-white shadow-[0_18px_34px_-18px_rgb(0_0_0/0.55)] md:grid" aria-hidden="true">
          <span className="font-display text-[64px] leading-none text-orange">{restaurant.name?.trim().charAt(0)}</span>
        </div>
        <div className="min-w-0 text-white">
          <h1 id="restaurant-name" className="text-[clamp(28px,3.1vw,46px)] font-bold leading-tight tracking-tight [text-shadow:0_2px_12px_rgb(0_0_0/0.25)]">
            {restaurant.name}
          </h1>
          {cuisines.length > 0 && (
            <p className="mt-1.5 text-[clamp(15px,1.25vw,19px)] font-medium text-white/90" data-testid="restaurant-cuisines">{cuisines.join('  •  ')}</p>
          )}
          <ul className="mt-5 flex flex-wrap gap-2.5 text-[15px] font-medium text-espresso" aria-label="Restaurant details">
            {rating && (
              <li className="inline-flex items-center gap-2 rounded-full bg-[#fff6ee] px-4 py-2 shadow-sm">
                <svg viewBox="0 0 20 20" className="h-5 w-5 fill-[#f5a524]" aria-hidden="true"><path d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8z" /></svg>
                <span><strong className="font-bold">{rating}</strong><span className="sr-only"> out of 5 rating</span></span>
              </li>
            )}
            {minutes && (
              <li className="inline-flex items-center gap-2 rounded-full bg-[#fff6ee] px-4 py-2 shadow-sm">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                <span><span className="sr-only">Delivery in </span>{minutes}</span>
              </li>
            )}
            {restaurant.address && (
              <li className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#fff6ee] px-4 py-2 shadow-sm">
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="10" r="2.4" fill="currentColor" /></svg>
                <span className="truncate">{restaurant.address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function RestaurantBannerSkeleton() {
  return (
    <div className="h-[230px] animate-pulse rounded-[30px] bg-[linear-gradient(90deg,#c98f6a,#e9c3a4)] md:h-[218px]" aria-hidden="true" data-testid="banner-loading" />
  )
}
