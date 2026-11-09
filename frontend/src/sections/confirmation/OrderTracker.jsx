import { STAGES } from '@/lib/orders'

const ICONS = {
  placed: <><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z" /><path d="M9 10.5V6.5a3 3 0 0 1 6 0v4" /></>,
  preparing: <><path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" /><path d="M2.5 12h19M9 4.5c0 1.5 1 1.5 1 3M14 4.5c0 1.5 1 1.5 1 3" /></>,
  out: <><circle cx="6.5" cy="17" r="2.5" /><circle cx="17.5" cy="17" r="2.5" /><path d="M9 17h6M4 13.5l1.5-4h5l2 5M14 7h3l2.5 7.5" /><rect x="3" y="6" width="5" height="4" rx="1" /></>,
  delivered: <><path d="M4 11.5 12 4.5l8 7" /><path d="M6 10v9.5h12V10" /><path d="M10 19.5v-5h4v5" /></>,
}
const Check = () => <path d="M6.5 12.5l3.5 3.5 7.5-8" strokeWidth="2.8" />

/**
 * Order progress from the order's real status (lib/orders.js). Stages before the current one
 * are done, later ones are upcoming; nothing advances on its own. The only time the backend
 * records is when the order was placed, so only that stage shows a time. Lays out by its own
 * width (vertical when narrow), so it also fits the My Orders detail panel; `bare` drops the
 * card frame and heading for use inside another card.
 */
export default function OrderTracker({ stage, placedAt, statusText, bare = false }) {
  return (
    <section className={`@container ${bare ? '' : 'rounded-[28px] bg-white/75 px-5 py-5 shadow-[0_24px_50px_-34px_rgb(110_52_16/0.5)] ring-1 ring-[#f3dccb] sm:px-8'}`}
      aria-labelledby={bare ? undefined : 'status-title'} aria-label={bare ? 'Order status' : undefined} data-testid="order-tracker">
      {bare ? (statusText && <p className="mb-3 inline-block rounded-full bg-[#fdeee2] px-4 py-1.5 text-sm font-semibold text-espresso-soft">Status: {statusText}</p>) : (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="status-title" className="flex items-center gap-3 text-[clamp(22px,1.9vw,30px)] font-bold text-espresso">
          <svg viewBox="0 0 32 24" className="h-9 w-11 text-orange" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 5h17v12H2zM19 9h6l4 4v4h-10" /><circle cx="8" cy="18.5" r="2.5" fill="#fff" /><circle cx="24" cy="18.5" r="2.5" fill="#fff" /><path d="M0 9h5M1 13h4" /></svg>
          Order Status
        </h2>
        {statusText && <p className="rounded-full bg-[#fdeee2] px-4 py-1.5 text-sm font-semibold text-espresso-soft">Status: {statusText}</p>}
      </div>
      )}

      <ol className={`${bare ? '' : 'mt-5'} flex flex-col gap-0 @lg:flex-row`} aria-label="Order progress">
        {STAGES.map((item, index) => {
          const state = index < stage || (index === stage && index === STAGES.length - 1) ? 'done'
            : index === stage ? 'current' : 'upcoming'
          const reached = index <= stage
          const time = index === 0 && placedAt ? placedAt.time : null
          return (
            <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0 @lg:flex-1 @lg:flex-col @lg:items-center @lg:gap-3 @lg:pb-0 @lg:text-center"
              aria-current={state === 'current' ? 'step' : undefined} data-testid={`stage-${item.id}`} data-state={state}>
              {/* connector to the next stage: vertical when narrow, horizontal when wide */}
              {index < STAGES.length - 1 && (
                <span aria-hidden="true" className={`absolute left-[27px] top-[56px] h-[calc(100%-56px)] w-[3px] rounded @lg:left-[calc(50%+34px)] @lg:top-[27px] @lg:h-[3px] @lg:w-[calc(100%-68px)] ${index < stage ? 'bg-gradient-to-b from-[#e8622a] to-[#f08a4a] @lg:bg-gradient-to-r' : 'bg-[#ead9cc]'}`} />
              )}
              <span aria-hidden="true" className={`relative z-[1] grid h-[56px] w-[56px] shrink-0 place-items-center rounded-full ${
                reached ? 'bg-gradient-to-b from-[#f47a2f] to-[#dc531c] text-white shadow-[0_10px_20px_-10px_rgb(207_78_24/0.9)]' : 'border-2 border-[#d9c8bb] bg-white text-[#9b877b]'
              } ${state === 'current' ? 'ring-[6px] ring-[#e8622a]/20' : ''}`}>
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {state === 'done' || (state === 'current' && index === 0) ? <Check /> : ICONS[item.id]}
                </svg>
              </span>
              <div className="pt-1 @lg:pt-0">
                <p className={`${bare ? 'text-[16px]' : 'text-[clamp(16px,1.35vw,21px)]'} font-bold ${state === 'current' ? 'text-orange-deep' : reached ? 'text-espresso' : 'text-espresso/70'}`}>
                  {item.label}
                  <span className="sr-only">{state === 'done' ? ' (done)' : state === 'current' ? ' (current)' : ' (not yet)'}</span>
                </p>
                {time
                  ? <p className="text-[15px] text-espresso-soft" data-testid="stage-time">{time}<span className="sr-only">, {placedAt.date}</span></p>
                  : <p className={`${bare ? 'text-[13px] leading-snug' : 'text-[14px]'} ${reached ? 'text-espresso-soft' : 'text-espresso-soft/70'}`}>{item.description}</p>}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
