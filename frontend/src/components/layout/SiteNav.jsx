import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import UserAvatar from '@/components/ui/UserAvatar'
import { useAuth, useCart, useLogout } from '@/hooks/useSession'
import { appUrl } from '@/lib/paths'

/**
 * Site navigation (the reference design), wired to the real session:
 *   cart badge    CartLink: GET /api/cart → itemCount; links to the cart page (/cart)
 *   account       GET /api/auth/me; Login goes to the existing /login page,
 *                 Logout calls POST /api/auth/logout and stays on the homepage
 * In-page links (Home, Cuisines, Restaurants) call onNavigate(id) to scroll. `current="orders"`
 * marks My Orders as the page being shown.
 */
export default function SiteNav({ solid = false, current, onNavigate, onSearch }) {
  const auth = useAuth()
  const logout = useLogout()
  const user = auth.data?.authenticated ? auth.data.user : null

  const go = (id) => (event) => {
    event.preventDefault()
    onNavigate(id)
  }

  return (
    <header className={`nav${solid ? ' nav-solid' : ''}`}>
      <a className="logo" href={appUrl('')} onClick={go('top')} aria-label="FAah!! FOOD home">
        <span className="logo-script">FAah!!</span>
        <span className="logo-food">FOOD</span>
      </a>

      <nav className="nav-links" aria-label="Main">
        <a href={appUrl('')} onClick={go('top')}>Home</a>
        <a href="#cuisines" onClick={go('cuisines')}>Cuisines</a>
        <a href="#restaurants" onClick={go('restaurants')}>Restaurants</a>
        <Link to="/my-orders" aria-current={current === 'orders' ? 'page' : undefined}>My Orders</Link>
      </nav>

      <div className="nav-actions">
        <button type="button" className="icon-button nav-search" aria-label="Search restaurants" onClick={onSearch}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
        </button>
        <CartLink />
        {user
          ? <AccountMenu user={user} onLogout={() => logout.mutate()} busy={logout.isPending} />
          : <a className="login" href={appUrl('login')} aria-busy={auth.isPending || undefined}>Login</a>}
      </div>
    </header>
  )
}

/**
 * Cart icon with the number of dishes in the session cart (the sum of the quantities, as the
 * backend's itemCount counts them). It reads the shared cart query, which every cart change
 * replaces with the server's answer, so it changes the moment the server confirms an add,
 * quantity change, removal, clear or order. Hidden at 0; "pops" when the number changes.
 */
export function CartLink() {
  const cart = useCart()
  const count = cart.data?.itemCount ?? 0
  return (
    <Link className="icon-button cart" to="/cart" data-testid="nav-cart"
      aria-label={count > 0 ? `Cart, ${count} item${count === 1 ? '' : 's'}` : 'Cart, empty'}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 3.5h2.6l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.2L21 7.5H6.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9.5" cy="20" r="1.5" fill="currentColor" /><circle cx="17" cy="20" r="1.5" fill="currentColor" /></svg>
      {count > 0 && <span key={count} className="badge badge-pop" data-testid="cart-count">{count > 99 ? '99+' : count}</span>}
    </Link>
  )
}

/**
 * Signed-in user's menu (My Profile, My Orders, Cart, Logout); also used by the checkout
 * header. The avatar is the profile picture from the shared user query (initial otherwise),
 * so a new picture shows here as soon as the upload succeeds.
 */
export function AccountMenu({ user, onLogout, busy }) {
  const [open, setOpen] = useState(false)
  const root = useRef()

  useEffect(() => {
    if (!open) return undefined
    const close = (event) => { if (!root.current?.contains(event.target)) setOpen(false) }
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="account" ref={root}>
      <button type="button" className="account-pill" aria-haspopup="menu" aria-expanded={open}
        onClick={() => setOpen((value) => !value)} title={user.name}>
        <span className="account-avatar" aria-hidden="true" data-testid="nav-avatar"><UserAvatar user={user} letters={1} /></span>
        <span className="account-name">{user.name}</span>
      </button>
      {open && (
        <div className="account-menu" role="menu">
          <p className="account-email">{user.email}</p>
          <Link role="menuitem" to="/profile" onClick={() => setOpen(false)}>My Profile</Link>
          <Link role="menuitem" to="/my-orders" onClick={() => setOpen(false)}>My Orders</Link>
          <Link role="menuitem" to="/cart" onClick={() => setOpen(false)}>Cart</Link>
          <button type="button" role="menuitem" onClick={onLogout} disabled={busy}>
            {busy ? 'Logging out…' : 'Logout'}
          </button>
        </div>
      )}
    </div>
  )
}
