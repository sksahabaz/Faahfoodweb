import { appUrl } from '@/lib/paths'

const YEAR = new Date().getFullYear()

export default function SiteFooter({ onNavigate }) {
  const go = (id) => (event) => {
    event.preventDefault()
    onNavigate(id)
  }
  return (
    <footer className="relative z-[1] border-t border-espresso/10 bg-cream/70 px-5 py-12 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <a href={appUrl('')} onClick={go('top')} className="flex flex-col items-center leading-none" aria-label="FAah!! FOOD home">
          <span className="-rotate-6 font-script text-4xl text-orange-deep">FAah!!</span>
          <span className="mt-0.5 text-lg font-extrabold tracking-[0.08em] text-orange">FOOD</span>
        </a>
        <nav className="flex flex-wrap justify-center gap-x-7 gap-y-2 text-sm font-semibold text-espresso" aria-label="Footer">
          <a href="#cuisines" onClick={go('cuisines')} className="hover:text-orange">Cuisines</a>
          <a href="#restaurants" onClick={go('restaurants')} className="hover:text-orange">Restaurants</a>
          <a href={appUrl('my-orders')} className="hover:text-orange">My Orders</a>
          <a href={appUrl('cart')} className="hover:text-orange">Cart</a>
        </nav>
        <p className="text-xs text-espresso-soft">© {YEAR} FAah!! FOOD</p>
      </div>
    </footer>
  )
}
