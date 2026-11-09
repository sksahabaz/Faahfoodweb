import { appUrl } from '@/lib/paths'

const Spark = ({ className }) => (
  <svg viewBox="0 0 60 60" className={className} fill="none" stroke="#f07a22" strokeWidth="6" strokeLinecap="round" aria-hidden="true">
    <path d="M14 4 L 8 22 M 36 10 L 20 30 M 52 34 L 30 40" />
  </svg>
)

/** Green scalloped badge with a check mark. */
function SuccessBadge({ className }) {
  const points = Array.from({ length: 24 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 24
    const r = i % 2 ? 44 : 50
    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`
  }).join(' ')
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="badge-green" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5fd35d" /><stop offset="1" stopColor="#23a334" /></linearGradient>
      </defs>
      <polygon points={points} fill="url(#badge-green)" strokeLinejoin="round" stroke="#2fae3e" strokeWidth="3" />
      <path d="M31 51 L44 64 L70 37" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * The delivery bag illustration (a static asset cut from the approved design; the bag's own
 * lettering was removed and the site's real logo is placed on it as text).
 */
export function DeliveryBag({ className = '' }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <img src={appUrl('confirmation/bag.webp')} alt="" className="block h-auto w-full drop-shadow-[0_24px_30px_rgb(170_70_20/0.25)]" />
      <span className="absolute left-[64%] top-[69%] flex -translate-x-1/2 -translate-y-1/2 -rotate-6 flex-col items-center leading-none text-white [text-shadow:1px_2px_0_rgb(150_50_10/0.45)]">
        <span className="font-script text-[clamp(20px,2.4vw,40px)]">FAah!!</span>
        <span className="mt-0.5 text-[clamp(10px,1.15vw,19px)] font-extrabold tracking-[0.08em]">FOOD</span>
      </span>
      <Spark className="absolute -right-[10%] -top-[4%] h-[26%] w-[26%]" />
    </div>
  )
}

/** "Order Confirmed!" — rendered only once GET /api/orders/{id} has returned the order. */
export default function ConfirmationHero({ name, message, delivered }) {
  return (
    <section className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-center md:gap-[clamp(24px,4vw,72px)] md:text-left" aria-labelledby="confirm-title" data-testid="confirmation-hero">
      <DeliveryBag className="w-[clamp(140px,13vw,230px)] shrink-0" />
      <div className="min-w-0">
        <h1 id="confirm-title" className="relative inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[clamp(34px,4vw,66px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-espresso md:justify-start">
          <SuccessBadge className="h-[1.25em] w-[1.25em] shrink-0 drop-shadow-[0_8px_14px_rgb(35_150_50/0.35)]" />
          <span>
            Order{' '}
            <span className="bg-gradient-to-b from-[#ff8a2a] to-[#e9520f] bg-clip-text text-transparent">{delivered ? 'Delivered!' : 'Confirmed!'}</span>
          </span>
          <Spark className="absolute -right-[0.75em] -top-[0.45em] h-[0.8em] w-[0.8em]" />
        </h1>
        <p className="mt-2 text-[clamp(18px,1.6vw,27px)] font-medium text-espresso" data-testid="confirmation-thanks">
          Thank you for your order{name ? <>, <strong className="font-bold">{name}</strong></> : ''}!
        </p>
        <p className="mt-1 text-[clamp(15px,1.3vw,22px)] text-espresso-soft" data-testid="confirmation-message">{message}</p>
      </div>
    </section>
  )
}
