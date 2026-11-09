import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageBackdrop from '@/components/decor/PageBackdrop'
import SiteNav from '@/components/layout/SiteNav'
import { useRestaurant, useMenu } from '@/hooks/useRestaurant'
import { useRestaurants } from '@/hooks/useRestaurants'
import { useCart, useCartActions } from '@/hooks/useSession'
import CartPanel, { MobileCart } from '@/sections/menu/CartPanel'
import DishCard, { DishCardSkeleton } from '@/sections/menu/DishCard'
import RestaurantBanner, { RestaurantBannerSkeleton } from '@/sections/menu/RestaurantBanner'
import '@/sections/home/story/story.css' // navigation styles (shared with the homepage)

// Menu categories that describe a course rather than a cuisine (left out of the banner line).
const COURSES = new Set(['beverages', 'desserts', 'breads', 'sides', 'starters', 'combos', 'meals', 'rice', 'specials', 'breakfast'])

/** Cuisine line for the banner: the restaurant's most common real menu categories. */
function cuisinesFrom(menu) {
  const counts = new Map()
  for (const item of menu || []) {
    const name = String(item.category || '').trim()
    if (name) counts.set(name, (counts.get(name) || 0) + 1)
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name)
  const cuisines = ranked.filter((name) => !COURSES.has(name.toLowerCase()))
  return (cuisines.length ? cuisines : ranked).slice(0, 3)
}

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
    <path d="M12.6 2.5c.4 3-1.6 4.6-3 6.3-1.3 1.6-2.4 3.2-2.4 5.6a5.8 5.8 0 0 0 11.6.2c0-2.7-1.4-4.2-2.3-5.6-.3 1.4-1 2.3-2 2.8.6-3.6-.3-6.9-1.9-9.3z" fill="#e8622a" />
    <path d="M12.3 12.2c-1.3 1.3-2.4 2.4-2.4 4.1a2.6 2.6 0 0 0 5.2.1c0-1.4-.8-2.3-1.4-3.1-.2.6-.6 1-1 1.2.1-.9-.1-1.6-.4-2.3z" fill="#ffc35a" />
  </svg>
)

/**
 * Restaurant menu page (/restaurants/:restaurantId). Restaurant, menu and cart all come from
 * the existing Java API; images are the URLs stored in the database.
 */
export default function MenuPage() {
  const { restaurantId } = useParams()
  const id = /^\d+$/.test(restaurantId || '') ? Number(restaurantId) : null
  const navigate = useNavigate()
  const searchRef = useRef()
  const [query, setQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [drawer, setDrawer] = useState(false)

  const restaurant = useRestaurant(id)
  const menu = useMenu(id)
  const cart = useCart()
  const restaurants = useRestaurants()
  const actions = useCartActions()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.title = restaurant.data ? `${restaurant.data.name} | FAah!! FOOD` : 'Menu | FAah!! FOOD'
  }, [restaurant.data])

  // Navbar section links (Home / Cuisines / Restaurants) live on the homepage.
  const onNavigate = useCallback((target) => navigate(target === 'top' ? '/' : `/#${target}`), [navigate])
  const goBack = useCallback(() => {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/#restaurants')
  }, [navigate])
  const closeDrawer = useCallback(() => setDrawer(false), [])

  const cartData = cart.data
  const cartFromHere = cartData?.restaurantId === id
  const quantities = useMemo(() => {
    const map = new Map()
    if (cartFromHere) for (const item of cartData.items) map.set(item.menuId, item.quantity)
    return map
  }, [cartData, cartFromHere])
  const cartRestaurantName = (restaurants.data || []).find((r) => r.restaurantId === cartData?.restaurantId)?.name

  const dishes = useMemo(() => {
    const text = query.trim().toLowerCase()
    return (menu.data || [])
      .filter((item) => !text || [item.itemName, item.description, item.category].some((v) => String(v || '').toLowerCase().includes(text)))
      .sort((a, b) => Number(b.available !== false) - Number(a.available !== false)) // unavailable last
  }, [menu.data, query])
  const cuisines = useMemo(() => cuisinesFrom(menu.data), [menu.data])

  const panelProps = { cart: cartData, cartRestaurantName, foreign: Boolean(cartData?.items?.length) && !cartFromHere, actions }
  const notFound = id === null || restaurant.error?.status === 404

  return (
    <div className="faah-home">
      <div className="home-bg" aria-hidden="true" />
      <SiteNav solid={scrolled} onNavigate={onNavigate} onSearch={() => searchRef.current?.focus()} />

      <div className="relative z-[1]">
        <PageBackdrop />
        <div className="relative mx-auto max-w-[1540px] px-4 pb-28 pt-[92px] sm:px-8 sm:pt-[104px] lg:pb-16">
          {notFound ? (
            <PageMessage title="We couldn't find that restaurant." text="It may have been removed, or the link is incorrect."
              action={<Link to="/#restaurants" className="pill-button">Browse restaurants</Link>} />
          ) : restaurant.isError ? (
            <PageMessage title="We couldn't load this restaurant." text={restaurant.error?.message}
              action={<button type="button" className="pill-button" onClick={() => restaurant.refetch()}>Try again</button>} />
          ) : (
            <>
              {restaurant.data
                ? <RestaurantBanner restaurant={restaurant.data} cuisines={cuisines} onBack={goBack} />
                : <RestaurantBannerSkeleton />}

              <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_350px] xl:grid-cols-[minmax(0,1fr)_370px] xl:gap-10">
                <section aria-labelledby="dishes-title">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 id="dishes-title" className="flex items-center gap-2.5 whitespace-nowrap text-[clamp(24px,2.2vw,30px)] font-bold text-espresso">
                      Recommended for You <FlameIcon />
                    </h2>
                    <label className="relative block w-full sm:w-[260px] xl:w-[290px]">
                      <span className="sr-only">Search dishes</span>
                      <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-espresso-soft" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                      <input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dishes..."
                        data-testid="dish-search"
                        className="w-full rounded-full border-0 bg-white/85 py-3 pl-12 pr-5 text-[15px] text-espresso shadow-[0_12px_28px_-22px_rgb(110_52_16/0.6)] ring-1 ring-espresso/10 placeholder:text-espresso-soft/70 focus:outline-none focus:ring-2 focus:ring-orange" />
                    </label>
                  </div>

                  <div className="mt-6" aria-live="polite" aria-busy={menu.isPending}>
                    {menu.isError ? (
                      <InlineMessage title="We couldn't load the menu." text={menu.error?.message}
                        action={<button type="button" className="pill-button" onClick={() => menu.refetch()}>Try again</button>} />
                    ) : menu.isPending ? (
                      <div className="grid gap-5 min-[1360px]:grid-cols-2" data-testid="menu-loading">
                        {Array.from({ length: 6 }, (_, i) => <DishCardSkeleton key={i} />)}
                      </div>
                    ) : !menu.data.length ? (
                      <InlineMessage title="This restaurant has no dishes on its menu yet." text="Please check back soon." />
                    ) : !dishes.length ? (
                      <InlineMessage title={`No dishes match “${query}”.`}
                        action={<button type="button" className="pill-button" onClick={() => setQuery('')}>Show all dishes</button>} />
                    ) : (
                      // one wide column until there is room for two cards beside the order panel
                      <div className="grid gap-5 min-[1360px]:grid-cols-2" data-testid="dish-grid">
                        {dishes.map((item) => {
                          const quantity = quantities.get(item.menuId) || 0
                          return (
                            <DishCard key={item.menuId} item={item} quantity={quantity} busy={actions.isPending(item.menuId)}
                              onAdd={() => actions.add(item)}
                              onIncrease={() => actions.setQuantity(item.menuId, quantity + 1)}
                              onDecrease={() => actions.setQuantity(item.menuId, quantity - 1)} />
                          )
                        })}
                      </div>
                    )}
                  </div>
                </section>

                <div className="hidden lg:sticky lg:top-[96px] lg:block">
                  <CartPanel {...panelProps} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <MobileCart open={drawer} onOpen={() => setDrawer(true)} onClose={closeDrawer} {...panelProps} />

      {actions.conflict && (
        <ConflictDialog dish={actions.conflict} from={cartRestaurantName}
          onKeep={actions.dismissConflict} onReplace={() => actions.replaceWith(actions.conflict)} />
      )}
      {actions.error && (
        <div role="alert" className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-espresso px-5 py-3 text-sm text-white shadow-xl lg:bottom-6">
          <span>{actions.error}</span>
          <button type="button" onClick={actions.dismissError} className="font-semibold text-[#ffc59a]">Dismiss</button>
        </div>
      )}
    </div>
  )
}

/** The backend keeps one restaurant per cart: ask before clearing the other order. */
function ConflictDialog({ dish, from, onKeep, onReplace }) {
  const keepRef = useRef()
  useEffect(() => {
    keepRef.current?.focus()
    const onKey = (event) => { if (event.key === 'Escape') onKeep() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onKeep])
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="conflict-title" data-testid="cart-conflict">
      <button type="button" className="absolute inset-0 bg-espresso/40 backdrop-blur-[2px]" onClick={onKeep} aria-label="Keep my current order" tabIndex={-1} />
      <div className="relative w-full max-w-md rounded-[26px] bg-[#fffaf4] p-6 shadow-2xl">
        <h2 id="conflict-title" className="text-xl font-bold text-espresso">Start a new order?</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-espresso-soft">
          Your cart has dishes from {from || 'another restaurant'}. You can order from one restaurant at a time.
          Clear your cart and add {dish.itemName}?
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button ref={keepRef} type="button" onClick={onKeep} className="rounded-full px-5 py-2.5 font-semibold text-espresso ring-1 ring-espresso/15 hover:bg-espresso/5">Keep my cart</button>
          <button type="button" onClick={onReplace} className="pill-button" data-testid="conflict-replace">Clear cart & add</button>
        </div>
      </div>
    </div>
  )
}

function PageMessage({ title, text, action }) {
  return (
    <div className="mx-auto mt-16 flex max-w-xl flex-col items-center gap-3 rounded-[28px] bg-white/70 px-6 py-14 text-center ring-1 ring-espresso/5" data-testid="menu-page-message">
      <p className="text-xl font-semibold text-espresso">{title}</p>
      {text && <p className="text-sm text-espresso-soft">{text}</p>}
      {action}
    </div>
  )
}

function InlineMessage({ title, text, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[26px] bg-white/65 px-6 py-12 text-center ring-1 ring-espresso/5" data-testid="menu-message">
      <p className="text-lg font-semibold text-espresso">{title}</p>
      {text && <p className="text-sm text-espresso-soft">{text}</p>}
      {action}
    </div>
  )
}
