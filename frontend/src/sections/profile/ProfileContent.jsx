import { useState } from 'react'
import { fieldOf, phoneDigits, validateProfile } from '@/lib/profile'
import { formatOrderTime } from '@/lib/orders'

const ICONS = {
  name: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6" /></>,
  email: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3.5 7l8.5 6 8.5-6" /></>,
  phone: <path d="M6.5 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z" />,
  since: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" /></>,
  address: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></>,
}

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></svg>
)

const card = 'rounded-[30px] bg-white/75 px-5 py-6 shadow-[0_28px_60px_-36px_rgb(110_52_16/0.55)] ring-1 ring-[#f3dccb] sm:px-8 sm:py-8'
const outlineButton = 'inline-flex items-center gap-2 rounded-full border-2 border-[#ec8a52] px-5 py-2.5 text-[16px] font-semibold text-[#d4501a] transition hover:bg-[#fff1e6] disabled:opacity-60'

/** Shared edit flow: local draft, browser checks, then the backend's answer (or its error). */
function useEditor(user, fields, update) {
  const [draft, setDraft] = useState(null)
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState(null)
  const [saved, setSaved] = useState(false)

  const start = () => {
    setDraft(Object.fromEntries(fields.map((field) => [field, user[field] || ''])))
    setErrors({}); setFailure(null); setSaved(false)
  }
  const cancel = () => { setDraft(null); setErrors({}); setFailure(null) }
  const change = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: validateProfile({ [field]: value })[field] }))
  }
  const save = (event) => {
    event.preventDefault()
    const found = validateProfile(draft)
    setErrors(found)
    const first = fields.find((field) => found[field])
    if (first) return document.getElementById(`profile-${first}`)?.focus()
    const body = { ...draft }
    if ('name' in body) body.name = body.name.trim().replace(/\s+/g, ' ')
    if ('phone' in body) body.phone = phoneDigits(body.phone)
    if ('address' in body) body.address = body.address.trim()
    setFailure(null)
    update.mutate(body, {
      onSuccess: () => { setDraft(null); setSaved(true) },
      onError: (error) => {
        const field = error.status === 400 ? fieldOf(error.message) : null
        if (field && fields.includes(field)) setErrors((current) => ({ ...current, [field]: error.message }))
        else setFailure(error.message)
      },
    })
  }
  return { draft, errors, failure, saved, start, cancel, change, save, saving: update.isPending }
}

/** My Profile: the account's real details; name and phone can be edited. */
export function ProfileDetails({ user, update }) {
  const editor = useEditor(user, ['name', 'phone'], update)
  const since = formatOrderTime(user.memberSince)?.date

  return (
    <section className={card} aria-labelledby="profile-details-title" data-testid="profile-details">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="profile-details-title" className="text-[19px] font-bold text-espresso">Personal information</h2>
        {!editor.draft && (
          <button type="button" onClick={editor.start} className={outlineButton} data-testid="edit-profile"><PencilIcon /> Edit Profile</button>
        )}
      </div>
      {editor.saved && !editor.draft && <Saved>Your profile has been updated.</Saved>}

      {editor.draft ? (
        <form noValidate onSubmit={editor.save} className="mt-4" data-testid="profile-form">
          <Field icon="name" label="Full Name">
            <Input id="profile-name" value={editor.draft.name} error={editor.errors.name} onChange={(v) => editor.change('name', v)} autoComplete="name" maxLength={100} disabled={editor.saving} />
          </Field>
          <Field icon="email" label="Email Address">
            <p className="break-all text-[18px] font-semibold text-espresso" data-testid="profile-email-readonly">{user.email}</p>
            <p className="text-[13px] text-espresso-soft">Your email is your login, so it can't be changed here.</p>
          </Field>
          <Field icon="phone" label="Phone Number">
            <Input id="profile-phone" type="tel" value={editor.draft.phone} error={editor.errors.phone} onChange={(v) => editor.change('phone', v)} autoComplete="tel" maxLength={20} disabled={editor.saving} />
          </Field>
          <Actions editor={editor} />
        </form>
      ) : (
        <dl className="mt-2">
          <Row icon="name" label="Full Name" value={user.name} testId="profile-name" />
          <Row icon="email" label="Email Address" value={user.email} testId="profile-email" />
          <Row icon="phone" label="Phone Number" value={user.phone} testId="profile-phone" />
          {since && <Row icon="since" label="Member Since" value={since} testId="profile-since" />}
        </dl>
      )}
    </section>
  )
}

/** Saved Addresses: the one delivery address the account keeps (users.address). */
export function SavedAddress({ user, update }) {
  const editor = useEditor(user, ['address'], update)
  return (
    <section className={card} aria-labelledby="address-title" data-testid="saved-address">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="address-title" className="text-[19px] font-bold text-espresso">Delivery address</h2>
        {!editor.draft && (
          <button type="button" onClick={editor.start} className={outlineButton} data-testid="edit-address">
            <PencilIcon /> {user.address ? 'Edit Address' : 'Add Address'}
          </button>
        )}
      </div>
      <p className="mt-1 text-[14px] text-espresso-soft">Checkout fills in this address for you. Your account keeps one address.</p>
      {editor.saved && !editor.draft && <Saved>Your address has been updated.</Saved>}

      {editor.draft ? (
        <form noValidate onSubmit={editor.save} className="mt-4" data-testid="address-form">
          <Field icon="address" label="Address">
            <textarea id="profile-address" value={editor.draft.address} onChange={(event) => editor.change('address', event.target.value)} rows={3} maxLength={255} disabled={editor.saving}
              aria-invalid={Boolean(editor.errors.address)} aria-describedby={editor.errors.address ? 'profile-address-error' : undefined}
              className={`w-full resize-y rounded-2xl border bg-white px-4 py-3 text-[16px] text-espresso focus:outline-none focus:ring-2 focus:ring-orange ${editor.errors.address ? 'border-[#d93a1f]' : 'border-[#ead7c8]'}`} />
            {editor.errors.address && <p id="profile-address-error" className="mt-1 text-[13px] font-medium text-[#b3261e]" data-testid="field-error">{editor.errors.address}</p>}
          </Field>
          <Actions editor={editor} />
        </form>
      ) : user.address ? (
        <dl className="mt-2"><Row icon="address" label="Saved address" value={user.address} testId="profile-address" /></dl>
      ) : (
        <p className="mt-5 rounded-2xl bg-[#fdf1e7] px-5 py-4 text-[15px] text-espresso-soft" data-testid="no-address">No address saved yet.</p>
      )}
    </section>
  )
}

function Row({ icon, label, value, testId }) {
  return (
    <div className="flex items-center gap-4 border-b border-[#f0e0d3] py-4 last:border-b-0 sm:gap-6">
      <span className="grid h-[58px] w-[64px] shrink-0 place-items-center rounded-2xl bg-[#fdeee2] text-orange" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{ICONS[icon]}</svg>
      </span>
      <div className="min-w-0">
        <dt className="text-[15px] font-medium text-espresso-soft">{label}</dt>
        <dd className={`text-[clamp(17px,1.4vw,21px)] font-semibold text-espresso ${icon === 'email' ? 'break-all' : 'break-words'}`} data-testid={testId}>{value || '—'}</dd>
      </div>
    </div>
  )
}

function Field({ icon, label, children }) {
  return (
    <div className="flex items-start gap-4 border-b border-[#f0e0d3] py-4 sm:gap-6">
      <span className="grid h-[58px] w-[64px] shrink-0 place-items-center rounded-2xl bg-[#fdeee2] text-orange" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{ICONS[icon]}</svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="mb-1.5 text-[15px] font-medium text-espresso-soft">{label}</p>
        {children}
      </div>
    </div>
  )
}

function Input({ id, value, error, onChange, ...rest }) {
  return (
    <>
      <input id={id} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-[17px] text-espresso focus:outline-none focus:ring-2 focus:ring-orange ${error ? 'border-[#d93a1f]' : 'border-[#ead7c8]'}`} {...rest} />
      {error && <p id={`${id}-error`} className="mt-1 text-[13px] font-medium text-[#b3261e]" data-testid="field-error">{error}</p>}
    </>
  )
}

function Actions({ editor }) {
  return (
    <>
      {editor.failure && <p role="alert" className="mt-4 rounded-2xl bg-[#fff0ea] px-4 py-3 text-[14px] font-medium text-[#b3261e]" data-testid="profile-error">{editor.failure}</p>}
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={editor.cancel} disabled={editor.saving} className="rounded-full px-6 py-3 font-semibold text-espresso ring-1 ring-espresso/15 hover:bg-espresso/5 disabled:opacity-60" data-testid="profile-cancel">Cancel</button>
        <button type="submit" disabled={editor.saving} aria-busy={editor.saving || undefined} className="pill-button" data-testid="profile-save">
          {editor.saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </>
  )
}

function Saved({ children }) {
  return <p role="status" className="mt-3 rounded-2xl bg-[#eef8ea] px-4 py-2.5 text-[14px] font-medium text-[#2f6b2a]" data-testid="profile-saved">{children}</p>
}
