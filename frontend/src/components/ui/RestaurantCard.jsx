import { useState } from 'react'
import { Link } from 'react-router'
import { resolveImage } from '@/lib/paths'

/** Rating and delivery time exactly as stored; nothing is shown when a value is missing. */
const formatRating = (rating) => (rating == null || Number.isNaN(Number(rating)) ? null : Number(rating).toFixed(1))
const formatMinutes = (minutes) => (minutes > 0 ? `${minutes} min` : null)

/** One restaurant from GET /api/restaurants; opens its React menu page (/restaurants/:id). */
export default function RestaurantCard({ restaurant, featured = false }) {
  const [imageFailed, setImageFailed] = useState(false)
  const image = resolveImage(restaurant.imageUrl)
  const rating = formatRating(restaurant.rating)
  const minutes = formatMinutes(restaurant.deliveryTime)

  return (
    <Link
      to={`/restaurants/${encodeURIComponent(restaurant.restaurantId)}`}
      className="group flex h-full flex-col overflow-hidden rounded-[26px] bg-white/75 shadow-[0_22px_44px_-28px_rgb(110_52_16/0.55)] ring-1 ring-espresso/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-26px_rgb(110_52_16/0.6)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-espresso"
      data-testid="restaurant-card"
    >
      <div className={`relative overflow-hidden bg-cream-deep ${featured ? 'aspect-[16/11]' : 'aspect-[4/3]'}`}>
        {image && !imageFailed ? (
          <img src={image} alt={restaurant.name} loading="lazy" decoding="async" onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="grid h-full place-items-center font-display text-4xl text-orange/40" aria-hidden="true">
            {restaurant.name?.charAt(0)}
          </div>
        )}
        {rating && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[13px] font-semibold text-espresso shadow-sm">
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-orange" aria-hidden="true"><path d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8z" /></svg>
            {rating}
            <span className="sr-only"> out of 5</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <h3 className="text-lg font-bold leading-snug text-espresso">{restaurant.name}</h3>
        {restaurant.description && <p className="line-clamp-2 text-sm leading-relaxed text-espresso-soft">{restaurant.description}</p>}
        {restaurant.address && <p className="truncate text-xs text-espresso-soft/80">{restaurant.address}</p>}
        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          {minutes ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-espresso-soft">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              {minutes}
            </span>
          ) : <span />}
          <span className="font-semibold text-orange transition group-hover:translate-x-0.5">View menu →</span>
        </div>
      </div>
    </Link>
  )
}

export function RestaurantCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-[26px] bg-white/55 ring-1 ring-espresso/5" aria-hidden="true">
      <div className="aspect-[4/3] bg-cream-deep/80" />
      <div className="flex flex-col gap-2.5 p-5">
        <div className="h-4 w-2/3 rounded-full bg-cream-deep" />
        <div className="h-3 w-full rounded-full bg-cream-deep/80" />
        <div className="h-3 w-4/5 rounded-full bg-cream-deep/80" />
      </div>
    </div>
  )
}
