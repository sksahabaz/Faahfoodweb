import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { authApi } from '@/api/endpoints'
import { useAuth, useLogout } from '@/hooks/useSession'
import { appUrl } from '@/lib/paths'
import { AuthLogo, ErrorAlert, Field, Notice, SocialButtons, Spark } from '@/sections/auth/AuthParts'
import '@fontsource/kaushan-script/400.css' // FAah!! logo
import '@/sections/auth/auth.css'
import '@/sections/auth/login.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Login (/login; LoginController serves this page). Same design as the approved JSP page.
 *
 *   POST /api/auth/login {email, password} → AuthService checks the BCrypt hash, the session
 *   gets a new id and the user, and the answer says where to go next: the page that sent the
 *   guest here (LoginController.REDIRECT_AFTER_LOGIN, e.g. /checkout) or the homepage.
 *
 * The password lives only in this component's state and the request body; nothing is
 * stored in the browser. Coming from signup, the new email is passed in the navigation
 * state and shown once with a confirmation.
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const auth = useAuth()
  const logout = useLogout()
  const [signupEmail] = useState(() => location.state?.signupEmail || null)
  const [email, setEmail] = useState(signupEmail || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [focusTarget, setFocusTarget] = useState(null) // field to focus once the form is enabled again
  const emailRef = useRef()

  useEffect(() => { document.title = 'Login - FAah!! FOOD' }, [])
  // The signup confirmation is shown once: drop it from the history entry (a refresh won't repeat it).
  useEffect(() => { if (location.state?.signupEmail) navigate('.', { replace: true, state: null }) }, [location.state, navigate])
  useEffect(() => { if (signupEmail) document.getElementById('password')?.focus({ preventScroll: true }) }, [signupEmail])
  useEffect(() => {
    if (!focusTarget || submitting) return
    document.getElementById(focusTarget.id)?.focus()
  }, [focusTarget, submitting])

  const user = auth.data?.authenticated ? auth.data.user : null
  const toCheckout = auth.data?.next === '/checkout'

  const submit = async (event) => {
    event.preventDefault()
    if (submitting) return
    const typed = email.trim()
    if (!typed || !password.trim()) {
      setError('Please enter your email and password.')
      document.getElementById(typed ? 'password' : 'email')?.focus()
      return
    }
    if (!EMAIL_PATTERN.test(typed)) {
      setError('Please enter a valid email address, like name@example.com.')
      emailRef.current?.focus()
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const { user: signedIn, redirectTo } = await authApi.login(typed, password)
      queryClient.setQueryData(['session', 'me'], { authenticated: true, user: signedIn, next: null })
      // A full page load: the server-side pages (checkout, order confirmation...) and the
      // whole app start from the new session.
      window.location.replace(appUrl(String(redirectTo || '/').replace(/^\//, '')))
    } catch (failure) {
      setSubmitting(false)
      setPassword('')
      setError(failure.status === 401 ? 'Invalid email or password.' : failure.message)
      setFocusTarget({ id: failure.status === 401 ? 'password' : 'email' }) // new object: refocus every time
    }
  }

  return (
    <div className="auth-page login-page" data-testid="login-page">
      <LoginBackground />

      <div className="auth-shell">
        <section className="auth-intro" aria-label="About FAah!! FOOD">
          <AuthLogo />
          <div className="auth-intro-copy">
            <h2 className="auth-headline">
              Good Food<br />Closer to You
              <Spark className="auth-spark--headline" />
            </h2>
            <p className="auth-lead">Order from your favourite restaurants and enjoy delicious meals delivered to your doorstep.</p>
            <ul className="auth-perks">
              <li>
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M30 13h6l4 13" /><path d="M6 31v-9h14l4 7h10" /><circle cx="12" cy="35" r="5" /><circle cx="38" cy="35" r="5" />
                  <path className="fill" d="M5 21h16v-8H8a3 3 0 0 0-3 3z" /><path className="fill" d="M17 34a8 8 0 0 1 8-8h11a8 8 0 0 1 8 8z" />
                </svg>
                <span>Fast<br />Delivery</span>
              </li>
              <li>
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <path className="fill" d="M7 33a17 17 0 0 1 34 0z" /><path d="M4 37h40" /><circle className="fill" cx="24" cy="13" r="3" />
                </svg>
                <span>Wide<br />Variety</span>
              </li>
              <li>
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <path className="fill" d="M24 5h14a5 5 0 0 1 5 5v14L24 43a4 4 0 0 1-6 0L5 30a4 4 0 0 1 0-6z" transform="rotate(8 24 24)" />
                  <circle className="cut" cx="35" cy="13" r="3" /><path className="cut-line" d="M17 31l12-12" />
                  <circle className="cut" cx="18" cy="21" r="2.4" /><circle className="cut" cx="28" cy="30" r="2.4" />
                </svg>
                <span>Exclusive<br />Offers</span>
              </li>
            </ul>
          </div>
          <div className="auth-meal">
            <img src={appUrl('auth/meal.webp')} alt="A burger with fries and a cold drink" width="510" height="337" />
            <Spark className="auth-spark--meal" />
          </div>
        </section>

        <section className="auth-card" aria-labelledby="login-title">
          <AuthLogo compact />
          <h1 id="login-title" className="auth-title">
            Welcome Back!
            <Spark className="auth-spark--title" />
          </h1>
          {/* Blank (same height) until the session says whether the user is on the way to checkout, so the text doesn't change after loading. */}
          <p className="auth-subtitle" data-testid="login-subtitle">{auth.isPending ? '\u00a0' : toCheckout ? 'Log in to continue to checkout' : 'Login to your FAah!! FOOD account'}</p>

          {user ? (
            // Already logged in (e.g. opened /login again): no second login.
            <div data-testid="login-already">
              <Notice id="login-already-note">You're logged in as {user.name}.</Notice>
              <a className="auth-submit" href={appUrl(String(auth.data.next || '/').replace(/^\//, ''))} style={{ display: 'grid', placeItems: 'center', textDecoration: 'none' }}>Continue</a>
              <p className="auth-switch">
                Not you?{' '}
                <button type="button" className="auth-link" onClick={() => logout.mutate()} disabled={logout.isPending}>{logout.isPending ? 'Logging out…' : 'Log out'}</button>
              </p>
            </div>
          ) : (
            <>
              {signupEmail && !error && <Notice id="signup-notice">Your account has been created. Log in with your new password.</Notice>}
              {error && <ErrorAlert id="login-error">{error}</ErrorAlert>}

              <form className="auth-form" id="login-form" noValidate onSubmit={submit} aria-busy={submitting || undefined}>
                <Field id="email" label="Email address" icon="email" ref={emailRef} type="email" name="email" value={email}
                  onChange={(event) => setEmail(event.target.value)} placeholder="Email address" autoComplete="email"
                  maxLength={100} required describedBy={error ? 'login-error' : undefined} disabled={submitting} />
                <Field id="password" label="Password" icon="password" password name="password" value={password}
                  onChange={(event) => setPassword(event.target.value)} placeholder="Password" autoComplete="current-password"
                  maxLength={72} required disabled={submitting} />

                {/* No "Remember me": the backend has no persistent login (sessions end after 30
                    minutes of inactivity or when the browser closes). */}
                <div className="auth-row" style={{ justifyContent: 'flex-end' }}>
                  {/* Visual only: password recovery is not implemented. */}
                  <button type="button" className="auth-link auth-soon" aria-disabled="true" aria-describedby="soon-note" data-soon="Coming soon"
                    onClick={(event) => event.preventDefault()}>
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" className="auth-submit" id="login-submit" disabled={submitting}>
                  {submitting ? 'Logging in…' : 'Login'}
                </button>
              </form>
            </>
          )}

          <SocialButtons />

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </section>
      </div>
    </div>
  )
}

/** Soft orange waves and a few ingredients (decoration only). */
function LoginBackground() {
  const hide = (event) => { event.currentTarget.style.display = 'none' } // decor not deployed
  return (
    <div className="auth-bg" aria-hidden="true">
      <svg className="auth-waves" viewBox="0 0 1672 941" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wave-peach" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f6c39c" stopOpacity="0.55" /><stop offset="1" stopColor="#f9d8bd" stopOpacity="0.15" /></linearGradient>
          <linearGradient id="wave-orange" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#f7a466" stopOpacity="0.95" /><stop offset="1" stopColor="#fbc69a" stopOpacity="0.55" /></linearGradient>
          <linearGradient id="wave-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity="0.55" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></linearGradient>
        </defs>
        <path d="M380 0 C 520 70, 700 110, 880 70 S 1160 -10, 1280 0 Z" fill="url(#wave-peach)" />
        <path d="M0 120 C 150 60, 280 20, 420 0 L 0 0 Z" fill="url(#wave-peach)" opacity="0.6" />
        <path d="M0 330 C 120 360, 230 470, 300 600 C 200 520, 110 500, 0 520 Z" fill="url(#wave-peach)" />
        <path d="M0 470 C 140 470, 260 560, 330 700 C 230 620, 120 600, 0 640 Z" fill="url(#wave-orange)" opacity="0.35" />
        <path d="M0 860 C 260 760, 560 720, 860 790 S 1180 900, 1300 941 L 0 941 Z" fill="url(#wave-peach)" />
        <path d="M1672 240 C 1600 330, 1580 470, 1620 600 C 1640 660, 1672 700, 1672 700 Z" fill="url(#wave-peach)" />
        <path d="M1050 941 C 1250 900, 1420 820, 1540 700 C 1600 640, 1640 600, 1672 590 L 1672 941 Z" fill="url(#wave-orange)" />
        <path d="M1180 941 C 1360 900, 1500 830, 1600 740 C 1630 715, 1655 700, 1672 694 L 1672 941 Z" fill="#f28c4f" opacity="0.6" />
        <path d="M1320 941 C 1460 905, 1570 850, 1672 780 L 1672 941 Z" fill="#ef7a38" opacity="0.45" />
        <path d="M1090 941 C 1260 880, 1430 790, 1560 660" fill="none" stroke="url(#wave-light)" strokeWidth="10" strokeLinecap="round" />
      </svg>
      <img className="auth-decor auth-decor--leaf-left" src={appUrl('decor/basil-leaf-soft.webp')} alt="" onError={hide} />
      <img className="auth-decor auth-decor--leaf-right" src={appUrl('decor/basil-leaf-soft.webp')} alt="" onError={hide} />
      <img className="auth-decor auth-decor--tomato-slice" src={appUrl('decor/tomato-slice-soft.webp')} alt="" onError={hide} />
      <img className="auth-decor auth-decor--tomato" src={appUrl('decor/tomato-whole.webp')} alt="" onError={hide} />
    </div>
  )
}
