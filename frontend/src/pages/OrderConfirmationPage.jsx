import { useCallback, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import CornerRibbons from '@/components/decor/CornerRibbons'
import SiteNav from '@/components/layout/SiteNav'
import { useOrder } from '@/hooks/useOrders'
import { useRestaurant } from '@/hooks/useRestaurant'
import { useAuth } from '@/hooks/useSession'
import { formatOrderTime, heroMessage, orderState } from '@/lib/orders'
import { appUrl } from '@/lib/paths'
import ConfirmationHero, { DeliveryBag } from '@/sections/confirmation/ConfirmationHero'
import OrderInfoCard from '@/sections/confirmation/OrderInfoCard'
import OrderTracker from '@/sections/confirmation/OrderTracker'
import '@/sections/home/story/story.css' // navigation styles (shared with the homepage)
import '@/sections/confirmation/confirmation.css'

/**
 * Order confirmation (/order-confirmation/:orderId). OrderConfirmationController serves this
 * page to logged-in users; checkout comes here with the id returned by POST /api/orders.
 * Everything shown is read from the backend on every visit (so a refresh works):
 *   order        GET /api/orders/{id}   (only the user's own orders; 404 otherwise)
 *   restaurant   GET /api/restaurants/{restaurantId}
 *   name         GET /api/auth/me
 * The green success state appears only after the order has been returned by the backend.
 */
export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const id = /^\d{1,9}$/.test(orderId || '') ? Number(orderId) : null
  const navigate = useNavigate()
  const auth = useAuth()
  const order = useOrder(id)
  const restaurant = useRestaurant(order.data?.restaurantId)

  const onNavigate = useCallback((target) => navigate(target === 'top' ? '/' : `/#${target}`), [navigate])

  useEffect(() => {
    document.title = order.data ? `Order #${order.data.orderId} | FAah!! FOOD` : 'Your order | FAah!! FOOD'
  }, [order.data])

  const status = order.error?.status
  const state = order.data ? orderState(order.data) : null
  const placedAt = order.data ? formatOrderTime(order.data.orderDate) : null
  const name = auth.data?.authenticated ? auth.data.user?.name : null

  let content
  if (id === null || status === 404 || status === 403) {
    content = (
      <Notice tone="neutral" testId="order-not-found" title="We couldn't find this order."
        text="Check the link, or find your order in My Orders. Orders are only visible to the account that placed them."
        actions={<><Link className="pill-button" to="/my-orders">My Orders</Link><HomeLink /></>} />
    )
  } else if (status === 401) {
    content = (
      <Notice tone="neutral" testId="order-login" title="Please log in to see this order."
        text="After logging in you'll come straight back to it."
        actions={<a className="pill-button" href={appUrl(`order-confirmation/${id}`)}>Log in</a>} />
    )
  } else if (order.isError) {
    content = (
      <Notice tone="neutral" testId="order-error" title="We couldn't load your order."
        text={`${order.error?.message || 'Please try again.'} Your order itself is not affected.`}
        actions={<button type="button" className="pill-button" onClick={() => order.refetch()}>Try again</button>} />
    )
  } else if (order.isPending) {
    content = <Skeleton />
  } else if (state.kind === 'cancelled') {
    content = (
      <>
        <Notice tone="warning" testId="order-cancelled" title={`Order #${order.data.orderId} was cancelled.`}
          text="This order won't be delivered." />
        <OrderInfoCard order={order.data} restaurant={restaurant.data} />
      </>
    )
  } else if (state.kind === 'payment-failed') {
    content = (
      <>
        <Notice tone="warning" testId="order-payment-failed" title="Your payment didn't go through."
          text={`Order #${order.data.orderId} isn't confirmed because its payment failed.`} />
        <OrderInfoCard order={order.data} restaurant={restaurant.data} />
      </>
    )
  } else {
    content = (
      <>
        <ConfirmationHero name={name} message={heroMessage(state.stage)} delivered={state.stage === 3} />
        <OrderInfoCard order={order.data} restaurant={restaurant.data} />
        <OrderTracker stage={state.stage} placedAt={placedAt} statusText={state.known ? null : order.data.status} />
      </>
    )
  }

  return (
    <div className="faah-home confirmation-page">
      <div className="home-bg" aria-hidden="true" />
      <CornerRibbons />
      <SiteNav solid onNavigate={onNavigate} onSearch={() => navigate('/#restaurants')} />

      <div className="relative z-[1] mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-4 pt-[92px] sm:px-8 sm:pt-[100px]">
        {content}
      </div>

      {/* Buttons, with the city, rider and storefront drawings around them (wide screens only). */}
      <div className="confirmation-band relative z-[1]">
        <Skyline />
        <img src={appUrl('confirmation/scooter.webp')} alt="" aria-hidden="true" className="confirmation-scooter" />
        <img src={appUrl('confirmation/store.webp')} alt="" aria-hidden="true" className="confirmation-store" />
        <div className="relative mx-auto flex w-full max-w-[760px] flex-col gap-3 px-4 sm:flex-row sm:gap-6">
          {/* There is no live tracking yet: My Orders opens this order with its current status. */}
          <Link to={id ? `/my-orders?order=${id}` : '/my-orders'} data-testid="track-order"
            className="flex h-[60px] w-full shrink-0 items-center sm:w-auto sm:flex-1 justify-center gap-3 rounded-full bg-gradient-to-b from-[#ff7f22] to-[#e9520f] text-[19px] font-semibold text-white shadow-[0_16px_30px_-14px_rgb(232_84_20/0.75)] transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-espresso">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" fill="currentColor" fillOpacity="0.25" /><circle cx="12" cy="10" r="2.4" fill="currentColor" /></svg>
            Track Order
          </Link>
          <HomeLink big />
        </div>
      </div>
    </div>
  )
}

function HomeLink({ big = false }) {
  return (
    <Link to="/" data-testid="back-home"
      className={big
        ? 'flex h-[60px] w-full shrink-0 items-center sm:w-auto sm:flex-1 justify-center gap-3 rounded-full border-2 border-[#e9a37a] bg-white/70 text-[19px] font-semibold text-espresso transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-espresso'
        : 'rounded-full px-5 py-2.5 font-semibold text-espresso ring-1 ring-espresso/15 hover:bg-espresso/5'}>
      {big && <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M4 11.5 12 4.5l8 7" /><path d="M6 10v9.5h12V10" /><path d="M10 19.5v-5h4v5" /></svg>}
      Back to Home
    </Link>
  )
}

/** Non-success states: no green check, no "confirmed" wording. */
function Notice({ tone, title, text, actions, testId }) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-[28px] bg-white/75 px-6 py-10 text-center shadow-[0_24px_50px_-34px_rgb(110_52_16/0.5)] ring-1 ring-[#f3dccb] md:flex-row md:gap-8 md:px-10 md:text-left" data-testid={testId} role={tone === 'warning' ? 'alert' : undefined}>
      {tone === 'warning'
        ? <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#fde3d6] text-3xl font-black text-[#c8401c]" aria-hidden="true">!</span>
        : <DeliveryBag className="w-[120px] shrink-0 opacity-90" />}
      <div className="flex-1">
        <h1 className="text-[clamp(22px,2.2vw,32px)] font-bold text-espresso">{title}</h1>
        {text && <p className="mt-1.5 text-[16px] text-espresso-soft">{text}</p>}
        {actions && <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">{actions}</div>}
      </div>
    </section>
  )
}

function Skeleton() {
  const block = 'animate-pulse rounded-[28px] bg-white/55'
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading your order" data-testid="order-loading">
      <div className={`${block} mx-auto h-[220px] w-full max-w-[900px] bg-white/35`} />
      <div className={`${block} h-[128px]`} />
      <div className={`${block} h-[240px]`} />
    </div>
  )
}

/** Soft peach building silhouettes along the bottom (decoration only). */
function Skyline() {
  return (
    <svg className="confirmation-skyline" viewBox="0 0 1600 160" preserveAspectRatio="none" aria-hidden="true">
      <path fill="#f4d3b9" fillOpacity="0.55" d="M0 160V96h40V70h36v26h30V50h44v46h26V84h40v76zM260 160V60h50v-20h40v20h30v100zM1180 160V74h46V48h40v26h28V90h42v70zM1380 160V58h38V36h44v22h34v102z" />
      <path fill="#f1c6a4" fillOpacity="0.4" d="M120 160V110h60V92h50v68zM330 160v-46h70v46zM1260 160v-56h60v-20h50v76zM1500 160V96h60v64z" />
    </svg>
  )
}
