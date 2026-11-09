import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import CornerRibbons from '@/components/decor/CornerRibbons'
import SiteNav from '@/components/layout/SiteNav'
import { useOrderList } from '@/hooks/useOrders'
import { useRestaurants } from '@/hooks/useRestaurants'
import { orderGroup } from '@/lib/orders'
import { appUrl } from '@/lib/paths'
import OrderDetails from '@/sections/orders/OrderDetails'
import { FILTERS, OrderCard, OrderFilters } from '@/sections/orders/OrderList'
import '@/sections/home/story/story.css' // navigation styles (shared with the homepage)

const FILTER_IDS = new Set(FILTERS.map((filter) => filter.id))
const EMPTY_FILTER_TEXT = { active: 'No active orders right now.', delivered: 'No delivered orders yet.', cancelled: 'No cancelled orders.' }

/**
 * My Orders (/my-orders; MyOrdersController serves this page to logged-in users and sends
 * guests to /login first). Everything is the user's own data from the existing API:
 *   history       GET /api/orders (only the session user's orders)
 *   details       GET /api/orders/{id} (owner only: 404 for anyone else)
 *   restaurants   GET /api/restaurants (image and location for each order)
 *   reorder       the shared cart actions (/api/cart)
 * The selected order and filter are kept in the URL (?order=…&filter=…), so a refresh or a
 * link from another page opens the same order.
 */
export default function MyOrdersPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const list = useOrderList()
  const restaurants = useRestaurants()
  const detailsRef = useRef()

  useEffect(() => { document.title = 'My Orders | FAah!! FOOD' }, [])
  const onNavigate = useCallback((target) => navigate(target === 'top' ? '/' : `/#${target}`), [navigate])

  const filter = FILTER_IDS.has(params.get('filter')) ? params.get('filter') : 'all'
  const requested = /^\d{1,9}$/.test(params.get('order') || '') ? Number(params.get('order')) : null
  const orders = useMemo(() => list.data || [], [list.data])
  const visible = useMemo(() => (filter === 'all' ? orders : orders.filter((order) => orderGroup(order) === filter)), [orders, filter])
  const counts = useMemo(() => {
    const result = { all: orders.length, active: 0, delivered: 0, cancelled: 0 }
    for (const order of orders) { const group = orderGroup(order); if (group) result[group] += 1 }
    return result
  }, [orders])
  const selectedId = requested ?? visible[0]?.orderId ?? null
  const restaurantById = useMemo(() => new Map((restaurants.data || []).map((r) => [r.restaurantId, r])), [restaurants.data])
  const selectedRestaurantId = orders.find((order) => order.orderId === selectedId)?.restaurantId

  const update = (next) => {
    const search = new URLSearchParams()
    if (next.filter && next.filter !== 'all') search.set('filter', next.filter)
    if (next.order) search.set('order', String(next.order))
    setParams(search, { replace: true, preventScrollReset: true }) // stay where the user is
  }
  const selectOrder = (orderId) => {
    update({ filter, order: orderId })
    // phones and tablets: the details are under the list
    if (window.matchMedia('(max-width: 1023px)').matches) {
      requestAnimationFrame(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }
  const changeFilter = (next) => {
    const first = next === 'all' ? orders[0] : orders.find((order) => orderGroup(order) === next)
    update({ filter: next, order: first?.orderId })
  }

  let content
  if (list.isPending) {
    content = <Skeleton />
  } else if (list.error?.status === 401) {
    content = (
      <Message testId="orders-login" title="Please log in to see your orders." text="After logging in you'll come straight back here."
        action={<a className="pill-button" href={appUrl('my-orders')}>Log in</a>} />
    )
  } else if (list.isError) {
    content = (
      <Message testId="orders-error" title="We couldn't load your orders." text={list.error?.message}
        action={<button type="button" className="pill-button" onClick={() => list.refetch()}>Try again</button>} />
    )
  } else if (!orders.length) {
    content = (
      <Message testId="orders-empty" title="You haven't placed any orders yet." text="When you order, it will show up here with its status and details."
        action={<Link to="/#restaurants" className="pill-button" data-testid="orders-browse">Browse Restaurants</Link>} />
    )
  } else {
    content = (
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,860fr)_minmax(0,700fr)] xl:gap-8">
        <div className="flex min-w-0 flex-col gap-5">
          <OrderFilters value={filter} counts={counts} onChange={changeFilter} />
          {visible.length ? (
            <ul className="flex flex-col gap-4" aria-label="Your orders" data-testid="order-list">
              {visible.map((order) => (
                <OrderCard key={order.orderId} order={order} restaurant={restaurantById.get(order.restaurantId)}
                  selected={order.orderId === selectedId} onSelect={() => selectOrder(order.orderId)} />
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-[26px] bg-white/70 px-6 py-12 text-center ring-1 ring-[#f3dccb]" data-testid="orders-filter-empty">
              <p className="text-lg font-semibold text-espresso">{EMPTY_FILTER_TEXT[filter]}</p>
              <button type="button" className="pill-button" onClick={() => changeFilter('all')}>Show all orders</button>
            </div>
          )}
        </div>

        {selectedId && (
          <div ref={detailsRef} className="scroll-mt-[96px] lg:sticky lg:top-[100px] lg:max-h-[calc(100vh-116px)] lg:overflow-y-auto lg:overscroll-contain lg:rounded-[28px]">
            <OrderDetails key={selectedId} orderId={selectedId} restaurant={restaurantById.get(selectedRestaurantId)} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="faah-home min-h-screen overflow-x-clip">
      <div className="home-bg" aria-hidden="true" />
      <CornerRibbons />
      <SiteNav solid current="orders" onNavigate={onNavigate} onSearch={() => navigate('/#restaurants')} />

      <div className="relative z-[1] mx-auto max-w-[1600px] px-4 pb-16 pt-[92px] sm:px-8 sm:pt-[104px]">
        <Heading />
        {content}
      </div>
    </div>
  )
}

function Heading() {
  return (
    <div className="flex items-center gap-4 px-1">
      <svg viewBox="0 0 24 24" className="h-[clamp(44px,3.6vw,58px)] w-[clamp(44px,3.6vw,58px)] shrink-0 self-start text-orange" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="5" width="16" height="16" rx="3" /><path d="M9 3.5h6v3H9zM8 11h8M8 15h5" />
      </svg>
      <div>
        <h1 className="relative inline-block text-[clamp(32px,3.2vw,46px)] font-extrabold leading-tight tracking-tight text-espresso">
          My Orders
          <svg viewBox="0 0 60 60" className="absolute -right-11 -top-3 h-10 w-10" fill="none" stroke="#f07a22" strokeWidth="6" strokeLinecap="round" aria-hidden="true">
            <path d="M14 4 L 8 22 M 36 10 L 20 30 M 52 34 L 30 40" />
          </svg>
        </h1>
        <p className="text-[clamp(15px,1.3vw,19px)] text-espresso-soft">Track your orders, view details, and reorder your favorite meals.</p>
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
  const block = 'animate-pulse rounded-[24px] bg-white/55'
  return (
    <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,860fr)_minmax(0,700fr)]" aria-busy="true" aria-label="Loading your orders" data-testid="orders-loading">
      <div className="flex flex-col gap-4"><div className={`${block} h-[64px] rounded-full`} />{[0, 1, 2].map((i) => <div key={i} className={`${block} h-[116px]`} />)}</div>
      <div className={`${block} h-[560px] rounded-[28px]`} />
    </div>
  )
}
