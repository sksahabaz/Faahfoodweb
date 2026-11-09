import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { authApi } from '@/api/endpoints'
import { AuthLogo, ErrorAlert, Field, SocialButtons, Spark } from '@/sections/auth/AuthParts'
import '@fontsource/kaushan-script/400.css' // FAah!! logo
import '@/sections/auth/auth.css'
import '@/sections/auth/signup.css'

const FIELDS = ['name', 'email', 'phone', 'address', 'password', 'confirm-password']
const EMPTY = Object.fromEntries(FIELDS.map((field) => [field, '']))
const phoneDigits = (value) => value.replace(/[\s\-().]/g, '')

// Same rules and messages as the approved signup page. The required-field messages match the
// backend's; the other checks stop values the backend refuses too (AuthApi): a bad email,
// a phone that doesn't fit the 15-character column, a password over BCrypt's 72-byte limit.
// Confirm Password is checked here only; the backend takes one password.
const RULES = {
  name: (v) => (v ? '' : 'Please enter your full name.'),
  email: (v) => (!v ? 'Please enter your email.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address, like name@example.com.'),
  phone: (v) => (!v ? 'Please enter your phone number.' : /^\+?\d{10,14}$/.test(phoneDigits(v)) ? '' : 'Please enter a valid phone number (10 to 14 digits).'),
  address: (v) => (v ? '' : 'Please enter your address.'),
  password: (v) => (!v ? 'Please enter a password.' : new TextEncoder().encode(v).length > 72 ? 'Please use a password of at most 72 characters.' : ''),
  'confirm-password': (v, values) => (!v ? 'Please confirm your password.' : v === values.password.trim() ? '' : 'Passwords do not match.'),
}

/** Which field a backend message is about (to highlight it). Email first: its message mentions "name@example.com". */
function fieldFor(message) {
  const text = String(message || '').toLowerCase()
  return ['email', 'phone', 'address', 'password', 'name'].find((field) => text.includes(field)) || null
}

/**
 * Signup (/signup; SignupController serves this page). Same design as the approved JSP page.
 *
 *   POST /api/auth/signup {name, email, phone, address, password} → AuthService creates the
 *   account (BCrypt-hashed password); duplicate emails are refused (409). Signing up does not
 *   log in: the login page opens with the email filled in. The delivery address isn't in the
 *   design but the backend requires it, so it is asked for here.
 */
export default function SignupPage() {
  const navigate = useNavigate()
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null) // { message, field }
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { document.title = 'Create Account - FAah!! FOOD' }, [])

  const messageFor = (field, next) => RULES[field](next[field].trim(), next)
  const check = (field, next = values) => {
    const message = messageFor(field, next)
    setErrors((current) => ({ ...current, [field]: message }))
    return !message
  }

  // Check a field when leaving it (if something was typed); re-check as the user types once
  // it has been flagged (and the confirmation when the password changes).
  const change = (field) => (event) => {
    const next = { ...values, [field]: event.target.value }
    setValues(next)
    if (errors[field]) check(field, next)
    if (field === 'password' && next['confirm-password']) check('confirm-password', next)
  }
  const blur = (field) => () => { if (values[field].trim() || errors[field]) check(field) }

  const submit = async (event) => {
    event.preventDefault()
    if (submitting) return
    const found = Object.fromEntries(FIELDS.map((field) => [field, messageFor(field, values)]))
    setErrors(found)
    const first = FIELDS.find((field) => found[field])
    if (first) {
      document.getElementById(first)?.focus()
      return
    }
    setServerError(null)
    setSubmitting(true)
    const email = values.email.trim()
    try {
      await authApi.signup({
        name: values.name.trim(),
        email,
        phone: phoneDigits(values.phone.trim()), // fits the 15-character column
        address: values.address.trim(),
        password: values.password,
      })
      navigate('/login', { state: { signupEmail: email } })
    } catch (failure) {
      setSubmitting(false)
      const field = fieldFor(failure.message)
      setServerError({ message: failure.message, field })
      document.getElementById(field || 'name')?.focus({ preventScroll: true })
    }
  }

  const fieldProps = (field) => ({
    id: field,
    value: values[field],
    onChange: change(field),
    onBlur: blur(field),
    error: errors[field] || null,
    disabled: submitting,
    required: true,
    ...(serverError?.field === field && !errors[field] ? { 'aria-invalid': true, describedBy: 'signup-error' } : {}),
  })

  return (
    <div className="auth-page signup-page" data-testid="signup-page">
      <SignupBackground />

      <div className="signup-shell">
        <section className="auth-card signup-card" aria-labelledby="signup-title">
          <AuthLogo compact />
          <h1 id="signup-title" className="auth-title">
            Create an Account
            <Spark className="auth-spark--title" />
          </h1>
          <p className="auth-subtitle">Join FAah!! FOOD and start ordering your favorite meals.</p>

          {serverError && <ErrorAlert id="signup-error">{serverError.message}</ErrorAlert>}

          <form className="auth-form signup-form" id="signup-form" noValidate onSubmit={submit} aria-busy={submitting || undefined}>
            <Field {...fieldProps('name')} label="Full Name" icon="name" type="text" name="name" placeholder="Full Name" autoComplete="name" maxLength={100} />
            <Field {...fieldProps('email')} label="Email Address" icon="email" type="email" name="email" placeholder="Email Address" autoComplete="email" maxLength={100} />
            <Field {...fieldProps('phone')} label="Phone Number" icon="phone" type="tel" name="phone" placeholder="Phone Number" autoComplete="tel" inputMode="tel" maxLength={20} />
            {/* Not in the design, but required by the backend (the delivery address). */}
            <Field {...fieldProps('address')} label="Delivery Address" icon="address" textarea name="address" rows={2} placeholder="Delivery Address" autoComplete="street-address" maxLength={255} />
            <Field {...fieldProps('password')} label="Password" icon="password" password name="password" placeholder="Password" autoComplete="new-password" maxLength={72} />
            <Field {...fieldProps('confirm-password')} label="Confirm Password" icon="password" password placeholder="Confirm Password" autoComplete="new-password" maxLength={72} />

            <button type="submit" className={`auth-submit signup-submit${submitting ? ' is-loading' : ''}`} id="signup-submit" disabled={submitting} aria-busy={submitting || undefined}>
              <span className="signup-submit-label">{submitting ? 'Creating account…' : 'Sign Up'}</span>
              <svg className="signup-submit-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
              <span className="signup-spinner" aria-hidden="true" />
            </button>
          </form>

          <SocialButtons />

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </section>
      </div>
    </div>
  )
}

/** Orange ribbons and two line drawings at the edges (decoration only). */
function SignupBackground() {
  return (
    <div className="auth-bg" aria-hidden="true">
      <svg className="signup-ribbon signup-ribbon--top" viewBox="0 0 600 420">
        <defs>
          <linearGradient id="ribbon-top" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#f06f1e" /><stop offset="0.55" stopColor="#f68d36" /><stop offset="1" stopColor="#fab06a" /></linearGradient>
        </defs>
        <path d="M-30 300 C 130 300, 260 210, 380 110 S 540 -20, 640 -40" fill="none" stroke="#fbd0ab" strokeOpacity="0.65" strokeWidth="64" />
        <path d="M-30 175 C 110 195, 220 125, 320 50 S 430 -25, 480 -40" fill="none" stroke="url(#ribbon-top)" strokeWidth="82" />
        <path d="M-30 222 C 120 236, 236 160, 336 84 S 456 -6, 520 -26" fill="none" stroke="#ffd9b8" strokeOpacity="0.75" strokeWidth="7" strokeLinecap="round" />
      </svg>
      <svg className="signup-ribbon signup-ribbon--bottom" viewBox="0 0 860 520">
        <defs>
          <linearGradient id="ribbon-bottom" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#fbb170" /><stop offset="0.45" stopColor="#f68a34" /><stop offset="1" stopColor="#f06f1e" /></linearGradient>
        </defs>
        <path d="M60 560 C 300 500, 470 330, 620 220 S 820 90, 900 70" fill="none" stroke="#fbd0ab" strokeOpacity="0.6" strokeWidth="70" />
        <path d="M250 560 C 430 500, 560 380, 690 290 S 840 200, 900 185" fill="none" stroke="url(#ribbon-bottom)" strokeWidth="84" />
        <path d="M520 560 C 640 520, 740 450, 820 400 S 880 370, 900 362" fill="none" stroke="#f06a1b" strokeOpacity="0.9" strokeWidth="64" />
        <path d="M185 560 C 370 490, 510 365, 650 262 S 820 148, 900 128" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="6" strokeLinecap="round" />
      </svg>

      {/* Delivery scooter on a hill, with a map pin and route */}
      <svg className="signup-sketch signup-sketch--scooter" viewBox="0 0 260 190">
        <path className="hill" d="M-10 170 C 60 150, 150 140, 270 150" />
        <path className="route" d="M200 70 C 170 90, 175 110, 200 120" />
        <path className="pin" d="M207 52c0 12-12 24-12 24s-12-12-12-24a12 12 0 0 1 24 0z" />
        <circle className="pin" cx="195" cy="51" r="4" />
        <path d="M6 128h22M2 140h18M10 152h14" />
        <circle cx="54" cy="148" r="14" /><circle cx="54" cy="148" r="5" />
        <circle cx="150" cy="148" r="14" /><circle cx="150" cy="148" r="5" />
        <path className="fill" d="M40 134c6-14 26-18 46-14l18 2c10 0 14 6 14 14l-2 12H68" />
        <path d="M118 136l10-36h12" /><path d="M128 100l18 0" /><path d="M118 136c10-6 26-6 32 12" />
        <rect className="fill" x="34" y="86" width="40" height="34" rx="3" />
        <path d="M34 98h40M54 86v12" />
        <circle cx="104" cy="52" r="11" />
        <path d="M93 49c2-10 20-12 23 0" /><path d="M100 64c-10 4-14 16-12 30l4 18h22l8 22" /><path d="M104 72l14 14 14 2" />
      </svg>

      {/* Restaurant storefront with a fork-and-knife sign */}
      <svg className="signup-sketch signup-sketch--store" viewBox="0 0 260 230">
        <path className="hill" d="M-10 214 C 70 196, 170 190, 270 200" />
        <circle className="fill" cx="140" cy="36" r="30" />
        <path d="M130 22v14a4 4 0 0 0 8 0V22M134 36v18" /><path d="M150 22c-6 4-6 14 0 18v14" /><path d="M140 66v12" />
        <path className="fill" d="M48 86h190l14 30H34z" />
        <path d="M34 116c0 10 20 10 20 0 0 10 21 10 21 0 0 10 21 10 21 0 0 10 21 10 21 0 0 10 21 10 21 0 0 10 21 10 21 0 0 10 21 10 21 0 0 10 21 10 21 0" />
        <path d="M75 86l-8 30M110 86l-4 30M145 86v30M180 86l4 30M215 86l8 30" />
        <path className="fill-soft" d="M46 128v74h196v-74" />
        <rect x="64" y="148" width="40" height="54" /><rect x="136" y="144" width="84" height="34" rx="2" />
        <path d="M20 202v-40" /><path d="M20 168c-14-4-16-30 0-34 16 4 14 30 0 34z" />
      </svg>
    </div>
  )
}
