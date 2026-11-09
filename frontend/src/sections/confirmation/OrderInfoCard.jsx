import FoodImage from '@/components/ui/FoodImage'
import { formatPrice } from '@/lib/format'
import { paymentInfo } from '@/lib/orders'

const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" className="h-9 w-9 shrink-0 text-orange" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)

/**
 * Restaurant, order id, amount and payment, from the order (GET /api/orders/{id}) and its
 * restaurant (GET /api/restaurants/{id}). Fields the backend leaves empty are not shown.
 */
export default function OrderInfoCard({ order, restaurant }) {
  const payment = paymentInfo(order)
  const name = restaurant?.name || order.restaurantName

  return (
    <section className="rounded-[28px] bg-white/75 px-5 py-4 shadow-[0_24px_50px_-34px_rgb(110_52_16/0.5)] ring-1 ring-[#f3dccb] sm:px-8" aria-label="Order details" data-testid="order-info">
      <dl className="grid gap-5 sm:grid-cols-2 lg:flex lg:items-center lg:gap-0">
        <div className="flex min-w-0 items-center gap-4 sm:col-span-2 lg:flex-[1.6] lg:pr-8">
          <FoodImage src={restaurant?.imageUrl} alt={name || 'Restaurant'} label={name} quiet={!restaurant}
            className="h-[84px] w-[96px] shrink-0 rounded-2xl" />
          <div className="min-w-0">
            <dt className="sr-only">Restaurant</dt>
            <dd className="line-clamp-2 text-[clamp(19px,1.5vw,24px)] font-bold leading-tight text-espresso" data-testid="info-restaurant">{name || 'Restaurant'}</dd>
            {restaurant?.address && (
              <dd className="mt-1 flex items-center gap-1.5 text-[15px] text-espresso-soft" data-testid="info-address">
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-orange" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></svg>
                <span className="line-clamp-2">{restaurant.address}</span>
              </dd>
            )}
          </div>
        </div>

        <Cell icon={<><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z" /><path d="M9 10.5V6.5a3 3 0 0 1 6 0v4" /><path d="M9.5 14.5l2 2 3.5-3.5" /></>}
          label="Order ID" value={<span className="text-orange-deep">#{order.orderId}</span>} testId="info-order-id" />
        <Cell icon={<><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h13a2 2 0 0 1 2 2v1.5a2 2 0 0 1-2 2H3" /><circle cx="15.5" cy="12.8" r="0.9" fill="currentColor" /></>}
          label={payment.paid ? 'Total Paid' : 'Total Payable'} value={formatPrice(order.totalAmount)} testId="info-total" />
        <Cell icon={<><rect x="2.5" y="5.5" width="19" height="13" rx="2.2" /><path d="M2.5 9.5h19M6 15h4" /></>}
          label={payment.method ? 'Payment Method' : 'Payment'}
          value={payment.method || payment.status || '—'}
          note={payment.method && payment.status ? `Payment ${payment.status.toLowerCase()}` : null} testId="info-payment" />
      </dl>
    </section>
  )
}

function Cell({ icon, label, value, note, testId }) {
  return (
    <div className="flex items-center gap-3.5 lg:flex-1 lg:justify-center lg:border-l lg:border-[#f0dccd] lg:px-6" data-testid={testId}>
      <Icon>{icon}</Icon>
      <div>
        <dt className="text-[15px] font-medium text-espresso-soft">{label}</dt>
        <dd className="text-[clamp(20px,1.7vw,28px)] font-bold leading-tight text-espresso">{value}</dd>
        {note && <dd className="text-[13px] text-espresso-soft">{note}</dd>}
      </div>
    </div>
  )
}
