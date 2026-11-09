import { useState } from 'react'
import { Link } from 'react-router'

// Pieces shared by the login and signup pages, with the same markup and class names as the
// approved JSP pages (styles in auth.css), so the design is unchanged.

export function Spark({ className }) {
  return (
    <svg className={`auth-spark ${className}`} viewBox="0 0 60 60" aria-hidden="true">
      <path d="M14 4 L 8 22 M 36 10 L 20 30 M 52 34 L 30 40" />
    </svg>
  )
}

/** The site logo (text in the logo font), linking home. */
export function AuthLogo({ compact = false }) {
  return (
    <Link className={`auth-logo${compact ? ' auth-logo--compact' : ''}`} to="/" aria-label="FAah!! FOOD home">
      <span className="auth-logo-script">FAah!!</span>
      <span className="auth-logo-food">FOOD</span>
    </Link>
  )
}

export function ErrorAlert({ id, children }) {
  return (
    <div className="auth-error" role="alert" id={id}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" /><path d="M12 7.5v5.5M12 16.4v.1" /></svg>
      <span>{children}</span>
    </div>
  )
}

export function Notice({ id, children }) {
  return (
    <div className="auth-notice" role="status" id={id}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" /><path d="M7.8 12.3l2.8 2.8 5.6-6" /></svg>
      <span>{children}</span>
    </div>
  )
}

export const ICONS = {
  name: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" /></>,
  email: <><rect x="3" y="5.5" width="18" height="13" rx="2.2" /><path d="M4 7.5l8 6 8-6" /></>,
  phone: <path d="M6.6 3.5h2.6l1.6 4.2-2.1 1.5a11.5 11.5 0 0 0 6.1 6.1l1.5-2.1 4.2 1.6v2.6a2.1 2.1 0 0 1-2.3 2.1A16.5 16.5 0 0 1 4.5 5.8a2.1 2.1 0 0 1 2.1-2.3z" />,
  address: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></>,
  password: <><rect x="4.5" y="10.5" width="15" height="10.5" rx="2.2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /><path d="M12 14.5v2.5" /></>,
}

/**
 * One input with its icon (and, for passwords, the show/hide button). `error` is shown
 * under the field and tied to it for screen readers. Values stay in React state only.
 */
export function Field({ id, label, icon, error, describedBy, textarea = false, password = false, className = '', ...input }) {
  const [shown, setShown] = useState(false)
  const errorId = `${id}-error`
  const props = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : describedBy,
    ...input,
  }
  return (
    <>
      <div className={`auth-field${textarea ? ' auth-field--area' : ''} ${className}`}>
        <label className="auth-sr-only" htmlFor={id}>{label}</label>
        <svg className="auth-field-icon" viewBox="0 0 24 24" aria-hidden="true">{ICONS[icon]}</svg>
        {textarea ? <textarea {...props} /> : <input {...props} type={password ? (shown ? 'text' : 'password') : props.type} />}
        {password && (
          <button type="button" className="auth-reveal" aria-controls={id} aria-pressed={shown} aria-label={shown ? 'Hide password' : 'Show password'}
            onClick={() => { setShown((value) => !value); document.getElementById(id)?.focus() }}>
            <svg className="icon-hidden" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 12s3-6 8.5-6c1.6 0 3 .5 4.2 1.2M20.5 12s-3 6-8.5 6c-1.6 0-3-.5-4.2-1.2" /><path d="M9.9 14.1a3 3 0 0 1 4.2-4.2" /><path d="M4 20L20 4" />
            </svg>
            <svg className="icon-shown" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2.8 12s3.3-6.2 9.2-6.2 9.2 6.2 9.2 6.2-3.3 6.2-9.2 6.2S2.8 12 2.8 12z" /><circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </div>
      {error && <p className="auth-field-error" id={errorId} aria-live="polite" data-testid="field-error">{error}</p>}
    </>
  )
}

/** Google / GitHub buttons: visual only (no social sign-in exists), with a "Coming soon" hint. */
export function SocialButtons() {
  const ignore = (event) => event.preventDefault()
  return (
    <>
      <div className="auth-divider"><span>or continue with</span></div>
      <div className="auth-social">
        <button type="button" className="auth-social-btn auth-soon" aria-disabled="true" aria-describedby="soon-note" data-soon="Coming soon" onClick={ignore}>
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          <span>Google</span>
        </button>
        <button type="button" className="auth-social-btn auth-soon" aria-disabled="true" aria-describedby="soon-note" data-soon="Coming soon" onClick={ignore}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path fill="#1f1d1b" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span>GitHub</span>
        </button>
      </div>
      <p className="auth-sr-only" id="soon-note">Not available yet.</p>
    </>
  )
}
