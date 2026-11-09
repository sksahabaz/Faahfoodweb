import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import FoodImage from '@/components/ui/FoodImage'
import { useOrder, useReorder } from '@/hooks/useOrders'
import { formatPrice } from '@/lib/format'
import { formatOrderTime, orderState, paymentInfo } from '@/lib/orders'
import { appUrl } from '@/lib/paths'
import OrderTracker from '@/sections/confirmation/OrderTracker'

const card = 'rounded-[28px] bg-white/80 shadow-[0_28px_60px_-34px_rgb(110_52_16/0.55)] ring-1 ring-[#f3dccb]'

/**
 * The selected order, read from GET /api/orders/{id} (the backend only answers for the
 * logged-in user's own orders: 404 otherwise). Restaurant image and address come from
 * GET /api/restaurants. Items, quantities, prices and the total are the stored order values;
 * the backend has no delivery fee, taxes or invoices, so none are shown.
 */
export default function OrderDetails({ orderId, restaurant, className = '' }) {
  const order = useOrder(orderId)
  const reorder = useReorder()
  const status = order.error?.status

  if (status === 404 || status === 403) {
    return (
      <Panel className={className} testId="details-not-found">
        <p className="text-xl font-bold text-espresso">We couldn't find this order.</p>
        <p className="mt-1.5 text-[15px] text-espresso-soft">It may belong to another account, or the link is incorrect. Choose one of your orders from the list.</p>
      </Panel>
    )
  }
  if (status === 401) {
    return (
      <Panel className={className} testId="details-login">
        <p className="text-xl font-bold text-espresso">Please log in to see this order.</p>
        <a className="pill-button mt-4 inline-flex" href={appUrl('my-orders')}>Log in</a>
      </Panel>
    )
  }
  if (order.isError) {
    return (
      <Panel className={className} testId="details-error">
        <p className="text-xl font-bold text-espresso">We couldn't load this order.</p>
        <p className="mt-1.5 text-[15px] text-espresso-soft">{order.error?.message}</p>
        <button type="button" className="pill-button mt-4" onClick={() => order.refetch()}>Try again</button>
      </Panel>
    )
  }
  if (order.isPending) {
    return (
      <div className={`${card} p-6 ${className}`} aria-busy="true" aria-label="Loading order details" data-testid="details-loading">
        <div className="flex items-center gap-4"><div className="h-[76px] w-[86px] animate-pulse rounded-2xl bg-[#fdeee2]" /><div className="flex-1 space-y-2"><div className="h-6 w-1/2 animate-pulse rounded-full bg-[#fdeee2]" /><div className="h-4 w-1/3 animate-pulse rounded-full bg-[#fdeee2]" /></div></div>
        <div className="mt-6 h-[110px] animate-pulse rounded-2xl bg-[#fdf1e7]" />
        <div className="mt-5 h-[160px] animate-pulse rounded-2xl bg-[#fdf1e7]" />
      </div>
    )
  }

  const data = order.data
  const state = orderState(data)
  const placed = formatOrderTime(data.orderDate)
  const payment = paymentInfo(data)
  const items = data.items || []
  const units = items.reduce((sum, item) => sum + item.quantity, 0)
  const itemTotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0)
  const name = restaurant?.name || data.restaurantName || 'Restaurant'

  return (
    <section className={`${card} p-5 sm:p-6 ${className}`} aria-labelledby="details-title" data-testid="order-details" data-order-id={data.orderId}>
      {/* restaurant + order id */}
      <div className="flex flex-wrap items-center gap-4">
        <FoodImage src={restaurant?.imageUrl} alt={name} label={name} className="h-[72px] w-[82px] shrink-0 rounded-2xl sm:h-[78px] sm:w-[90px]" />
        <div className="min-w-0 flex-1">
          <h2 id="details-title" className="line-clamp-2 text-[clamp(20px,1.7vw,26px)] font-bold leading-tight text-espresso">
            <Link to={`/restaurants/${data.restaurantId}`} className="hover:text-orange-deep" data-testid="details-restaurant">{name}</Link>
          </h2>
          {restaurant?.address && (
            <p className="mt-1 flex items-center gap-1.5 text-[15px] text-espresso-soft">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-orange" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></svg>
              <span className="line-clamp-1">{restaurant.address}</span>
            </p>
          )}
        </div>
        <div className="rounded-[18px] bg-[#fdeee2] px-4 py-2 text-center">
          <p className="text-[13px] font-medium text-espresso-soft">Order ID</p>
          <p className="text-[clamp(19px,1.6vw,24px)] font-bold text-orange-deep" data-testid="details-order-id">#{data.orderId}</p>
        </div>
      </div>

      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-espresso-soft" data-testid="details-meta">
        {placed && <span>Placed on <strong className="font-semibold text-espresso">{placed.date}, {placed.time}</strong></span>}
        <span>{payment.method ? `${payment.method}${payment.status ? ` · ${payment.status}` : ''}` : `Payment: ${payment.status || 'not recorded'}`}</span>
      </p>

      {/* status */}
      <div className="mt-5 border-y border-[#f0dccd] py-5" data-testid="details-status" data-kind={state.kind}>
        {state.kind === 'cancelled' ? (
          <StatusNotice title="This order was cancelled." text="It won't be delivered." testId="details-cancelled" />
        ) : state.kind === 'payment-failed' ? (
          <StatusNotice title="The payment for this order failed." text="This order isn't confirmed." testId="details-payment-failed" />
        ) : (
          <OrderTracker bare stage={state.stage} placedAt={placed} statusText={state.known ? null : data.status} />
        )}
      </div>

      {/* items */}
      <h3 className="mt-5 flex items-center gap-2.5 text-[19px] font-bold text-espresso">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-orange" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z" /><path d="M9 10.5V6.5a3 3 0 0 1 6 0v4" /></svg>
        <span>Order Items (<span data-testid="details-units">{units}</span>)</span>
      </h3>
      {items.length ? (
        <ul className="mt-3 flex flex-col gap-1" aria-label="Items in this order">
          {items.map((item) => (
            <li key={`${item.menuId}-${item.price}`} className="flex items-center gap-3 rounded-2xl px-1 py-1.5" data-testid="details-item" data-menu-id={item.menuId}>
              <FoodImage src={item.imageUrl} alt={item.itemName} label={item.itemName} className="h-[46px] w-[50px] shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[16px] font-medium leading-snug text-espresso">{item.itemName}</p>
                {item.quantity > 1 && <p className="text-[13px] text-espresso-soft">{formatPrice(item.price)} each</p>}
              </div>
              <span className="w-10 shrink-0 text-right text-[15px] font-semibold text-orange-deep" data-testid="details-item-qty">×{item.quantity}</span>
              <span className="w-[72px] shrink-0 text-right text-[16px] font-semibold text-espresso" data-testid="details-item-total">{formatPrice(item.subtotal)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[15px] text-espresso-soft">No items were recorded for this order.</p>
      )}

      {/* amounts */}
      <dl className="mt-4 space-y-1.5 border-t border-[#f0dccd] pt-4 text-[16px]">
        <div className="flex justify-between text-espresso-soft"><dt>Item Total</dt><dd data-testid="details-item-sum">{formatPrice(itemTotal)}</dd></div>
      </dl>
      <div className="mt-3 flex items-center justify-between rounded-[18px] bg-[#fde9da] px-5 py-3.5">
        <span className="text-[18px] font-bold text-espresso">{payment.paid ? 'Total Paid' : 'Total Payable'}</span>
        <span className="text-[clamp(22px,1.8vw,27px)] font-bold text-orange-deep" data-testid="details-total">{formatPrice(data.totalAmount)}</span>
      </div>
      {data.deliveryAddress && (
        <p className="mt-3 flex items-start gap-2 text-[14px] text-espresso-soft" data-testid="details-address">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-orange" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M4 11.5 12 4.5l8 7" /><path d="M6 10v9.5h12V10" /></svg>
          <span>Delivery address: <span className="text-espresso">{data.deliveryAddress}</span></span>
        </p>
      )}

      {/* actions: only what the app supports (no live tracking or invoices yet) */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => reorder.start(data)} disabled={!items.length || ['checking', 'adding'].includes(reorder.state.status)}
          className="flex h-[56px] w-full shrink-0 items-center justify-center gap-2.5 rounded-full bg-gradient-to-b sm:w-auto sm:flex-1 from-[#ff7f22] to-[#ec5a14] text-[18px] font-semibold text-white shadow-[0_16px_30px_-14px_rgb(232_84_20/0.75)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70"
          data-testid="reorder">
          {['checking', 'adding'].includes(reorder.state.status)
            ? <span className="h-5 w-5 animate-spin rounded-full border-[2.5px] border-white/40 border-t-white" aria-hidden="true" />
            : <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4v5h-5" /></svg>}
          {reorder.state.status === 'checking' ? 'Checking menu…' : reorder.state.status === 'adding' ? 'Adding to cart…' : 'Reorder'}
        </button>
        <Link to={`/restaurants/${data.restaurantId}`} data-testid="visit-restaurant"
          className="flex h-[56px] w-full shrink-0 items-center justify-center gap-2.5 rounded-full border-2 sm:w-auto sm:flex-1 border-[#ec9a6c] bg-white/70 text-[17px] font-semibold text-espresso transition hover:-translate-y-0.5 hover:bg-white">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#d4501a]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 10h16l-1.5-5h-13zM5 10v9.5h14V10M10 19.5v-5h4v5" /></svg>
          View Restaurant
        </Link>
      </div>

      <ReorderResult reorder={reorder} restaurantName={name} />
    </section>
  )
}

function ReorderResult({ reorder, restaurantName }) {
  const { state } = reorder
  const ref = useRef()
  useEffect(() => { if (['done', 'error', 'confirm'].includes(state.status)) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [state.status])

  if (state.status === 'confirm') {
    return (
      <div ref={ref} role="alertdialog" aria-labelledby="reorder-confirm-title" className="mt-4 rounded-[20px] bg-[#fff4ec] p-4 ring-1 ring-[#f6c9a8]" data-testid="reorder-confirm">
        <p id="reorder-confirm-title" className="font-semibold text-espresso">Your cart has dishes from another restaurant.</p>
        <p className="mt-1 text-[14px] text-espresso-soft">You can order from one restaurant at a time. Replace them with this order from {restaurantName}?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={reorder.confirm} className="pill-button" data-testid="reorder-replace">Replace cart</button>
          <button type="button" onClick={reorder.cancel} className="rounded-full px-5 py-2.5 font-semibold text-espresso ring-1 ring-espresso/15 hover:bg-espresso/5" data-testid="reorder-keep">Keep my cart</button>
        </div>
      </div>
    )
  }
  if (state.status === 'error') {
    return <p ref={ref} role="alert" className="mt-4 rounded-[18px] bg-[#fff0ea] px-4 py-3 text-[14.5px] font-medium text-[#b3261e]" data-testid="reorder-error">{state.message}</p>
  }
  if (state.status !== 'done') return null

  const added = state.lines.length > 0
  return (
    <div ref={ref} role="status" className={`mt-4 rounded-[20px] p-4 text-[14.5px] ring-1 ${added ? 'bg-[#eef8ea] ring-[#c6e4bc]' : 'bg-[#fff0ea] ring-[#f4c3b2]'}`} data-testid="reorder-result">
      {added ? (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold text-[#2f6b2a]">
          Added {state.units} item{state.units === 1 ? '' : 's'} to your cart.
          <Link to="/cart" className="text-orange-deep underline underline-offset-2" data-testid="reorder-view-cart">View cart</Link>
        </p>
      ) : (
        <p className="font-semibold text-[#b3261e]">None of these dishes are available right now, so nothing was added.</p>
      )}
      {state.unavailable.length > 0 && (
        <p className="mt-1.5 text-espresso-soft" data-testid="reorder-unavailable">Not available any more: {state.unavailable.join(', ')}.</p>
      )}
      {state.priceChanges.length > 0 && (
        <p className="mt-1.5 text-espresso-soft" data-testid="reorder-prices">
          New prices: {state.priceChanges.map((change) => `${change.itemName} ${formatPrice(change.now)} (was ${formatPrice(change.was)})`).join(', ')}.
        </p>
      )}
      <button type="button" onClick={reorder.reset} className="mt-2 text-[13px] font-semibold text-espresso-soft underline underline-offset-2">Dismiss</button>
    </div>
  )
}

function StatusNotice({ title, text, testId }) {
  return (
    <div className="flex items-center gap-4 rounded-[20px] bg-[#f6efea] px-4 py-4" role="status" data-testid={testId}>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#ece0d6] text-[#7a5a48]" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M7 7l10 10M17 7 7 17" /></svg>
      </span>
      <div>
        <p className="font-bold text-espresso">{title}</p>
        <p className="text-[14px] text-espresso-soft">{text}</p>
      </div>
    </div>
  )
}

function Panel({ children, className, testId }) {
  return <div className={`${card} px-6 py-10 text-center ${className}`} data-testid={testId}>{children}</div>
}
