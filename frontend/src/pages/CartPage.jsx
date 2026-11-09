import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import CornerRibbons from '@/components/decor/CornerRibbons'
import SiteNav from '@/components/layout/SiteNav'
import { useMenu, useRestaurant } from '@/hooks/useRestaurant'
import { useCart, useCartActions } from '@/hooks/useSession'
import { pickRecommendations } from '@/lib/cart'
import { cartIssues } from '@/lib/checkout'
import { formatPrice } from '@/lib/format'
import { appUrl } from '@/lib/paths'
import CartItems from '@/sections/cart/CartItems'
import CartSummary, { CheckoutLink } from '@/sections/cart/CartSummary'
import Recommendations from '@/sections/cart/Recommendations'
import '@/sections/home/story/story.css' // navigation styles (shared with the homepage)
import '@/sections/cart/cart.css'

/**
 * Cart (/cart; CartController serves this page).
 * Everything comes from the existing backend; there is no second, browser-only cart:
 *   cart          GET /api/cart (the Tomcat session cart, shared with every other page)
 *   changes       POST/PUT/DELETE /api/cart... through useCartActions; each answer is the
 *                 updated cart and replaces the shared cart query, which the navbar badge,
 *                 this page and the summary all read
 *   restaurant    GET /api/restaurants/{id} (image, name, address, delivery time)
 *   suggestions   GET /api/restaurants/{id}/menu (same restaurant: one restaurant per cart)
 */
export default function CartPage() {
  const navigate = useNavigate()
  const cart = useCart()
  const actions = useCartActions()
  const restaurantId = cart.data?.restaurantId ?? null
  const restaurant = useRestaurant(restaurantId)
  const menu = useMenu(restaurantId)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => { document.title = 'Your Cart | FAah!! FOOD' }, [])

  const onNavigate = useCallback((target) => navigate(target === 'top' ? '/' : `/#${target}`), [navigate])
  const closeClear = useCallback(() => setConfirmClear(false), [])
  const clearCart = async () => {
    setConfirmClear(false)
    await actions.clear()
  }

  const issues = useMemo(() => cartIssues(cart.data, menu.data), [cart.data, menu.data])
  const dishes = useMemo(() => pickRecommendations(menu.data, cart.data), [menu.data, cart.data])

  const items = cart.data?.items || []
  const notice = actions.error || (actions.conflict && 'That dish is from a different restaurant than your cart.')

  let content
  if (cart.isPending) {
    content = <Skeleton />
  } else if (cart.isError) {
    content = (
      <Message testId="cart-error" title="We couldn't load your cart." text={cart.error?.message}
        action={<button type="button" className="pill-button" onClick={() => cart.refetch()}>Try again</button>} />
    )
  } else if (!items.length) {
    content = <EmptyCart />
  } else {
    content = (
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_370px] lg:grid-rows-[auto_1fr] xl:grid-cols-[minmax(0,900fr)_minmax(400px,490fr)] xl:gap-x-9">
        <CartItems cart={cart.data} restaurant={restaurant.data} issues={issues} actions={actions} onClear={() => setConfirmClear(true)} />

        {/* the summary stays in view while the list scrolls; the rider sits under it */}
        <aside className="flex flex-col lg:row-span-2 lg:self-stretch" aria-label="Order summary">
          <div className="flex-1">
            <CartSummary cart={cart.data} busy={actions.busy} className="lg:sticky lg:top-[104px]" />
          </div>
          <RiderArt />
        </aside>

        <Recommendations dishes={dishes} restaurantId={restaurantId} actions={actions} />
      </div>
    )
  }

  return (
    <div className="faah-home cart-page">
      <div className="home-bg" aria-hidden="true" />
      <CornerRibbons />
      <SiteNav solid onNavigate={onNavigate} onSearch={() => navigate('/#restaurants')} />

      <div className={`relative z-[1] mx-auto max-w-[1440px] px-4 pt-[92px] sm:px-8 sm:pt-[104px] ${items.length ? 'pb-32 lg:pb-16' : 'pb-16'}`}>
        <Heading />
        {content}
      </div>

      {/* Phones and tablets: total and checkout always in reach. */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#f0d8c6] bg-[#fdf3ea]/95 px-4 py-3 shadow-[0_-12px_30px_-20px_rgb(110_52_16/0.5)] backdrop-blur lg:hidden" data-testid="mobile-checkout-bar">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-espresso-soft">{cart.data.itemCount} item{cart.data.itemCount === 1 ? '' : 's'} · Total payable</p>
              <p className="text-[20px] font-bold text-orange-deep">{formatPrice(cart.data.total)}</p>
            </div>
            <CheckoutLink busy={actions.busy} label="Checkout" className="h-12 text-[16px]" />
          </div>
        </div>
      )}

      {confirmClear && <ClearDialog onCancel={closeClear} onConfirm={clearCart} />}
      {notice && (
        <div role="alert" className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-espresso px-5 py-3 text-sm text-white shadow-xl lg:bottom-6" data-testid="cart-notice">
          <span>{notice}</span>
          <button type="button" onClick={() => { actions.dismissError(); actions.dismissConflict() }} className="font-semibold text-[#ffc59a]">Dismiss</button>
        </div>
      )}
    </div>
  )
}

function Heading() {
  return (
    <div className="flex items-center gap-4 px-1">
      <svg viewBox="0 0 24 24" className="h-[clamp(44px,3.6vw,60px)] w-[clamp(44px,3.6vw,60px)] shrink-0 self-start text-orange" aria-hidden="true">
        <path d="M2 3.5h2.8l2.5 11.4a1.7 1.7 0 0 0 1.7 1.3h8.6a1.7 1.7 0 0 0 1.6-1.2L21.4 7.5H6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9.5" cy="20" r="1.7" fill="currentColor" /><circle cx="17.3" cy="20" r="1.7" fill="currentColor" />
      </svg>
      <div>
        <h1 className="relative inline-block text-[clamp(32px,3.2vw,46px)] font-extrabold leading-tight tracking-tight text-espresso">
          Your Cart
          <svg viewBox="0 0 60 60" className="absolute -right-11 -top-3 h-10 w-10" fill="none" stroke="#f07a22" strokeWidth="6" strokeLinecap="round" aria-hidden="true">
            <path d="M14 4 L 8 22 M 36 10 L 20 30 M 52 34 L 30 40" />
          </svg>
        </h1>
        <p className="text-[clamp(15px,1.3vw,19px)] text-espresso-soft">Review your items and proceed to checkout.</p>
      </div>
    </div>
  )
}

/** Delivery rider (the illustration from the order confirmation page) with a route and pin. */
function RiderArt() {
  return (
    <div className="cart-rider" aria-hidden="true">
      <svg className="cart-rider-route" viewBox="0 0 160 170" fill="none">
        <ellipse cx="80" cy="120" rx="62" ry="34" stroke="#f08a3a" strokeWidth="3.5" strokeDasharray="9 9" strokeLinecap="round" />
        <path d="M80 92c-12-16-24-28-24-44a24 24 0 0 1 48 0c0 16-12 28-24 44z" fill="#f4892b" />
        <circle cx="80" cy="48" r="9" fill="#fff4ea" />
      </svg>
      <img src={appUrl('confirmation/scooter.webp')} alt="" className="cart-rider-scooter" />
    </div>
  )
}

function EmptyCart() {
  return (
    <section className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-3 rounded-[32px] bg-white/75 px-6 pb-12 pt-10 text-center shadow-[0_24px_50px_-34px_rgb(110_52_16/0.5)] ring-1 ring-[#f3dccb]" data-testid="cart-empty">
      <svg viewBox="0 0 200 160" className="w-[200px] max-w-[60%]" aria-hidden="true">
        <ellipse cx="100" cy="140" rx="70" ry="10" fill="#f6d7bf" />
        <circle cx="100" cy="74" r="64" fill="#fde7d6" />
        <path d="M44 42h16l14 62a8 8 0 0 0 8 6h50a8 8 0 0 0 7.8-6.2L150 62H64" fill="none" stroke="#e8622a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="86" cy="128" r="8" fill="#e8622a" /><circle cx="128" cy="128" r="8" fill="#e8622a" />
        <path d="M96 78q11-9 22 0" fill="none" stroke="#f4a372" strokeWidth="5" strokeLinecap="round" />
        <path d="M154 26l-6 14M170 36l-13 9M176 56l-15 1" stroke="#f07a22" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <h2 className="mt-2 text-[clamp(24px,2.2vw,32px)] font-bold text-espresso">Your cart is empty</h2>
      <p className="max-w-md text-[16px] text-espresso-soft">Pick a restaurant and add a few dishes. They'll show up here.</p>
      <Link to="/#restaurants" data-testid="browse-restaurants"
        className="mt-4 inline-flex h-[56px] items-center gap-3 rounded-full bg-gradient-to-b from-[#ff7f22] to-[#f2560f] px-8 text-[18px] font-semibold text-white shadow-[0_16px_30px_-14px_rgb(232_84_20/0.75)] transition hover:-translate-y-0.5 hover:brightness-105">
        Browse Restaurants
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Link>
    </section>
  )
}

/** Asks before emptying the cart (it can't be undone). */
function ClearDialog({ onCancel, onConfirm }) {
  const cancelRef = useRef()
  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (event) => { if (event.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="clear-title" data-testid="clear-dialog">
      <button type="button" className="absolute inset-0 bg-espresso/40 backdrop-blur-[2px]" onClick={onCancel} aria-label="Keep my cart" tabIndex={-1} />
      <div className="relative w-full max-w-md rounded-[26px] bg-[#fffaf4] p-6 shadow-2xl">
        <h2 id="clear-title" className="text-xl font-bold text-espresso">Clear your cart?</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-espresso-soft">All dishes will be removed from your cart.</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button ref={cancelRef} type="button" onClick={onCancel} className="rounded-full px-5 py-2.5 font-semibold text-espresso ring-1 ring-espresso/15 hover:bg-espresso/5">Keep my cart</button>
          <button type="button" onClick={onConfirm} className="pill-button" data-testid="clear-confirm">Clear cart</button>
        </div>
      </div>
    </div>
  )
}

function Message({ title, text, action, testId }) {
  return (
    <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-3 rounded-[28px] bg-white/75 px-6 py-14 text-center shadow-[0_24px_50px_-34px_rgb(110_52_16/0.5)] ring-1 ring-[#f3dccb]" data-testid={testId}>
      <p className="text-xl font-semibold text-espresso">{title}</p>
      {text && <p className="text-sm text-espresso-soft">{text}</p>}
      {action}
    </div>
  )
}

function Skeleton() {
  const block = 'animate-pulse rounded-[28px] bg-white/55'
  return (
    <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_370px] xl:grid-cols-[minmax(0,900fr)_minmax(400px,490fr)]" aria-busy="true" aria-label="Loading your cart" data-testid="cart-loading">
      <div className={`${block} h-[440px]`} />
      <div className={`${block} h-[380px]`} />
    </div>
  )
}
