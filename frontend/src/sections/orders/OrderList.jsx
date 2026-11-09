import FoodImage from '@/components/ui/FoodImage'
import { formatPrice } from '@/lib/format'
import { formatOrderTime, statusChip } from '@/lib/orders'

export const FILTERS = [
  { id: 'all', label: 'All Orders' },
  { id: 'active', label: 'Active' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
]

const FILTER_ICONS = {
  active: <><circle cx="6" cy="17" r="2.6" /><circle cx="18" cy="17" r="2.6" /><path d="M8.6 17h6.8M4 13.5l1.8-4.5h5l2.2 5.5M14 7h3l3 7.5" /></>,
  delivered: <><circle cx="12" cy="12" r="9" /><path d="M8 12.3l2.7 2.7L16 9.6" /></>,
  cancelled: <><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></>,
}

/** Filter tabs; counts are the user's real orders in each group. */
export function OrderFilters({ value, counts, onChange }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" data-lenis-prevent>
      <div role="tablist" aria-label="Filter orders" className="flex w-max min-w-full gap-1 rounded-full bg-white/70 p-1.5 shadow-[0_18px_40px_-30px_rgb(110_52_16/0.5)] ring-1 ring-[#f3dccb]">
        {FILTERS.map((filter) => {
          const selected = value === filter.id
          return (
            <button key={filter.id} type="button" role="tab" aria-selected={selected} onClick={() => onChange(filter.id)} data-testid={`filter-${filter.id}`}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-[15px] font-semibold transition sm:px-5 sm:text-[16px] ${
                selected ? 'bg-gradient-to-b from-[#ff7f22] to-[#ec5a14] text-white shadow-[0_12px_22px_-12px_rgb(232_84_20/0.85)]' : 'text-espresso hover:bg-[#fdeee2]'}`}>
              {FILTER_ICONS[filter.id] && (
                <svg viewBox="0 0 24 24" className={`h-5 w-5 ${selected ? 'text-white' : 'text-[#d4501a]'}`} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{FILTER_ICONS[filter.id]}</svg>
              )}
              {filter.label}
              <span className={`text-[14px] ${selected ? 'text-white/85' : 'text-espresso-soft'}`} data-testid="filter-count">({counts[filter.id] ?? 0})</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const CHIP_TONES = {
  active: 'bg-[#fff1e3] text-[#c4500f] ring-[#f7c9a0]',
  delivered: 'bg-[#eaf6e6] text-[#2f7d2a] ring-[#bfe0b5]',
  cancelled: 'bg-[#f3eeea] text-[#6d5d52] ring-[#ddd2c8]',
  neutral: 'bg-[#f3eeea] text-[#6d5d52] ring-[#ddd2c8]',
}

/** The order's real status as a chip. */
export function StatusChip({ order, className = '' }) {
  const chip = statusChip(order)
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[14px] font-semibold ring-1 ${CHIP_TONES[chip.tone]} ${className}`} data-testid="status-chip">
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {chip.tone === 'delivered' ? FILTER_ICONS.delivered : chip.tone === 'cancelled' ? FILTER_ICONS.cancelled
          : chip.tone === 'active' && chip.stage === 2 ? FILTER_ICONS.active
          : <><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></>}
      </svg>
      {chip.label}
    </span>
  )
}

/**
 * One order in the history: restaurant (image and location from GET /api/restaurants), the
 * real order id, date and time as stored, status and total. Selecting it shows its details.
 */
export function OrderCard({ order, restaurant, selected, onSelect }) {
  const placed = formatOrderTime(order.orderDate)
  const name = restaurant?.name || order.restaurantName || 'Restaurant'
  return (
    <li>
      <button type="button" onClick={onSelect} aria-pressed={selected} data-testid="order-card" data-order-id={order.orderId}
        className={`group flex w-full items-center gap-4 rounded-[24px] p-3.5 text-left transition sm:p-4 ${
          selected ? 'bg-[#fff3e8] shadow-[0_22px_44px_-30px_rgb(207_78_24/0.7)] ring-2 ring-[#f08a4a]' : 'bg-white/75 shadow-[0_20px_40px_-34px_rgb(110_52_16/0.5)] ring-1 ring-[#f3dccb] hover:bg-white hover:ring-[#f3c4a0]'}`}>
        <FoodImage src={restaurant?.imageUrl} alt="" label={name} className="h-[76px] w-[76px] shrink-0 self-start rounded-2xl sm:h-[84px] sm:w-[88px] sm:self-center" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-[clamp(17px,1.4vw,21px)] font-bold text-espresso" data-testid="order-card-restaurant">{name}</p>
          {restaurant?.address && (
            <p className="mt-0.5 flex items-center gap-1.5 text-[14px] text-espresso-soft">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-orange" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></svg>
              <span className="line-clamp-1">{restaurant.address}</span>
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-espresso-soft">
            <span>Order ID: <strong className="font-semibold text-orange-deep" data-testid="order-card-id">#{order.orderId}</strong></span>
            {placed && <span className="sm:border-l sm:border-[#ead7c8] sm:pl-3" data-testid="order-card-date">{placed.date}, {placed.time}</span>}
          </div>
          <div className="mt-2 sm:hidden"><StatusChip order={order} /></div>
        </div>
        <div className="hidden shrink-0 sm:block"><StatusChip order={order} /></div>
        <p className="shrink-0 self-start text-[clamp(18px,1.5vw,22px)] font-bold text-espresso sm:self-center" data-testid="order-card-total">{formatPrice(order.totalAmount)}</p>
        <svg viewBox="0 0 24 24" className={`hidden h-6 w-6 shrink-0 transition sm:block ${selected ? 'text-orange-deep' : 'text-espresso-soft group-hover:translate-x-0.5'}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </button>
    </li>
  )
}
