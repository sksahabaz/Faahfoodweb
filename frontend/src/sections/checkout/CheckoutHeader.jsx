import { Link } from 'react-router'
import { AccountMenu, CartLink } from '@/components/layout/SiteNav'
import { useAuth, useLogout } from '@/hooks/useSession'
import { appUrl } from '@/lib/paths'

const STEPS = [
  { id: 'cart', label: 'Cart', href: 'cart' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'payment', label: 'Payment' },
]

const Check = () => <path d="M6.5 12.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
const ICONS = {
  cart: <><path d="M3 4h2.5l2.2 10.2a1.6 1.6 0 0 0 1.6 1.3h7.6a1.6 1.6 0 0 0 1.6-1.2L20.5 8H6.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9.5" cy="19.5" r="1.4" fill="currentColor" /><circle cx="16.5" cy="19.5" r="1.4" fill="currentColor" /></>,
  checkout: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="10" r="2.4" fill="currentColor" /></>,
  payment: <><rect x="3" y="6" width="18" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M3 10h18" stroke="currentColor" strokeWidth="2" /></>,
}

/**
 * Checkout header: the site logo, the Cart → Checkout → Payment progress, and the live cart
 * icon and account menu from the site navigation. `current` is the step the user is really
 * on: 'checkout' while the cart has dishes, 'cart' when it is empty. Earlier steps show as done, later ones as upcoming;
 * Payment is never shown as done here (paying happens after the order is placed).
 */
export default function CheckoutHeader({ current }) {
  const auth = useAuth()
  const logout = useLogout()
  const user = auth.data?.authenticated ? auth.data.user : null
  const currentIndex = STEPS.findIndex((step) => step.id === current)

  return (
    <header className="nav nav-solid checkout-nav">
      <a className="logo" href={appUrl('')} aria-label="FAah!! FOOD home">
        <span className="logo-script">FAah!!</span>
        <span className="logo-food">FOOD</span>
      </a>

      <nav aria-label="Checkout progress" className="checkout-steps">
        <ol>
          {STEPS.map((step, index) => {
            const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming'
            const content = (
              <>
                <span className="step-dot" aria-hidden="true">
                  <svg viewBox="0 0 24 24">{state === 'done' ? <Check /> : ICONS[step.id]}</svg>
                </span>
                <span className="step-label">{step.label}</span>
                <span className="sr-only">{state === 'done' ? ' (completed)' : state === 'current' ? ' (current step)' : ' (next)'}</span>
              </>
            )
            return (
              <li key={step.id} className={`step step-${state}`} aria-current={state === 'current' ? 'step' : undefined} data-testid={`step-${step.id}`} data-state={state}>
                {step.href && state === 'done' ? <Link to={`/${step.href}`}>{content}</Link> : <span className="step-body">{content}</span>}
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="nav-actions">
        <CartLink />
        {user
          ? <AccountMenu user={user} onLogout={() => logout.mutate()} busy={logout.isPending} />
          : <a className="login" href={appUrl('login')}>Login</a>}
      </div>
    </header>
  )
}
