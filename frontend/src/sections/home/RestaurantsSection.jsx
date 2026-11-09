import { useMemo } from 'react'
import RestaurantCard, { RestaurantCardSkeleton } from '@/components/ui/RestaurantCard'
import { ALL, CUISINES, servesCuisine } from '@/lib/cuisines'

const byRating = (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0) || (a.deliveryTime || 999) - (b.deliveryTime || 999)

/** "Top rated": the best-rated restaurants from GET /api/restaurants (hidden while loading / on error). */
export function TopRestaurants({ restaurants }) {
  const top = useMemo(() => [...(restaurants.data || [])].filter((r) => r.rating != null).sort(byRating).slice(0, 4), [restaurants.data])
  if (!top.length) return null
  return (
    <section id="top-restaurants" className="relative z-[1] scroll-mt-24 px-5 py-12 sm:px-10" aria-labelledby="top-title">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Loved by our customers" title="Top restaurants" id="top-title" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {top.map((restaurant) => <RestaurantCard key={restaurant.restaurantId} restaurant={restaurant} featured />)}
        </div>
      </div>
    </section>
  )
}

/** All restaurants, filtered by the selected cuisine and the search box. */
export function RestaurantsSection({ restaurants, index, cuisine, onCuisine, query, onQuery, searchRef }) {
  const selected = CUISINES.find((c) => c.id === cuisine) || CUISINES[0]
  const needsMenus = selected.id !== ALL
  const list = useMemo(() => {
    const text = query.trim().toLowerCase()
    return (restaurants.data || [])
      .filter((r) => !needsMenus || servesCuisine(selected, index.data?.get(r.restaurantId)))
      .filter((r) => !text || [r.name, r.description, r.address].some((v) => String(v || '').toLowerCase().includes(text)))
  }, [restaurants.data, index.data, needsMenus, selected, query])

  const loading = restaurants.isPending || (needsMenus && index.isPending)
  const title = selected.id === ALL ? 'All restaurants' : `${selected.label} restaurants`

  return (
    <section id="restaurants" className="relative z-[1] scroll-mt-24 px-5 pb-24 pt-12 sm:px-10" aria-labelledby="restaurants-title">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="Order now" title={title} id="restaurants-title"
            note={restaurants.data && !loading ? `${list.length} of ${restaurants.data.length} restaurants` : null} />
          <label className="relative block w-full sm:w-80">
            <span className="sr-only">Search restaurants</span>
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-espresso-soft" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
            <input ref={searchRef} type="search" value={query} onChange={(event) => onQuery(event.target.value)}
              placeholder="Search restaurants" data-testid="restaurant-search"
              className="w-full rounded-full border-0 bg-white/80 py-3 pl-12 pr-5 text-[15px] text-espresso shadow-[0_12px_28px_-22px_rgb(110_52_16/0.6)] ring-1 ring-espresso/10 placeholder:text-espresso-soft/70 focus:outline-none focus:ring-2 focus:ring-orange" />
          </label>
        </div>

        <div className="mt-8" aria-live="polite" aria-busy={loading}>
          {restaurants.isError ? (
            <Message title="We couldn't load the restaurants." text={restaurants.error?.message}
              action={<button type="button" onClick={() => restaurants.refetch()} className="pill-button">Try again</button>} />
          ) : loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="restaurants-loading">
              {Array.from({ length: 6 }, (_, i) => <RestaurantCardSkeleton key={i} />)}
            </div>
          ) : !restaurants.data.length ? (
            <Message title="No restaurants are open yet." text="Please check back soon." />
          ) : !list.length ? (
            <Message
              title={query ? `No ${selected.id === ALL ? '' : `${selected.label} `}restaurants match “${query}”.` : `No ${selected.label} restaurants yet.`}
              action={<button type="button" className="pill-button" onClick={() => { onQuery(''); onCuisine(ALL) }}>Show all restaurants</button>} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="restaurant-grid">
              {list.map((restaurant) => <RestaurantCard key={restaurant.restaurantId} restaurant={restaurant} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function SectionHeading({ eyebrow, title, id, note }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.42em] text-orange">{eyebrow}</p>
      <h2 id={id} className="mt-2 font-display text-[clamp(34px,4.4vw,56px)] uppercase leading-none tracking-wide text-espresso">{title}</h2>
      {note && <p className="mt-2 text-sm text-espresso-soft">{note}</p>}
    </div>
  )
}

function Message({ title, text, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[28px] bg-white/60 px-6 py-14 text-center ring-1 ring-espresso/5" data-testid="restaurants-message">
      <p className="text-lg font-semibold text-espresso">{title}</p>
      {text && <p className="text-sm text-espresso-soft">{text}</p>}
      {action}
    </div>
  )
}
