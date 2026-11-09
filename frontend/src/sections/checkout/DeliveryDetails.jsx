const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-[#4b2214]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)

const ICONS = {
  customerName: <Icon><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" /></Icon>,
  phone: <Icon><path d="M6.6 3.5h2.6l1.6 4.2-2.1 1.5a11.5 11.5 0 0 0 6.1 6.1l1.5-2.1 4.2 1.6v2.6a2.1 2.1 0 0 1-2.3 2.1A16.5 16.5 0 0 1 4.5 5.8a2.1 2.1 0 0 1 2.1-2.3z" /></Icon>,
  address: <Icon><path d="M4 11.5 12 4.5l8 7" /><path d="M6 10v9.5h12V10" /><path d="M10 19.5v-5h4v5" /></Icon>,
  city: <Icon><rect x="4" y="3.5" width="9" height="17" rx="1" /><path d="M13 9.5h7v11h-7M7 7.5h3M7 11h3M7 14.5h3M16 13h1.5M16 16.5h1.5" /></Icon>,
  pincode: <Icon><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></Icon>,
}

const FIELD_PROPS = {
  customerName: { label: 'Full Name', autoComplete: 'name', maxLength: 100, placeholder: 'Enter your full name' },
  phone: { label: 'Phone Number', autoComplete: 'tel', inputMode: 'tel', type: 'tel', maxLength: 20, placeholder: 'Enter your phone number' },
  address: { label: 'Delivery Address', autoComplete: 'street-address', maxLength: 230, placeholder: 'House No., Street, Area, Landmark', multiline: true },
  city: { label: 'City', autoComplete: 'address-level2', maxLength: 60, placeholder: 'Enter city' },
  pincode: { label: 'Pincode', autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 6, placeholder: 'Enter pincode' },
}

/**
 * Delivery details. Name and phone start from the user's account (or what they entered
 * earlier in this session, via GET /api/checkout); the page owns the values and errors.
 */
export default function DeliveryDetails({ values, errors, onChange, onBlur, disabled, loading }) {
  return (
    <section className="rounded-[28px] bg-white/70 p-5 shadow-[0_24px_50px_-34px_rgb(110_52_16/0.5)] ring-1 ring-[#f3dccb] sm:px-7 sm:py-6" aria-labelledby="delivery-title">
      <h2 id="delivery-title" className="flex items-center gap-3 text-[clamp(22px,2vw,27px)] font-bold text-espresso">
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-orange" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.6" /></svg>
        Delivery Details
      </h2>
      <div className="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2" aria-busy={loading || undefined}>
        <Field name="customerName" {...{ values, errors, onChange, onBlur, disabled }} />
        <Field name="phone" {...{ values, errors, onChange, onBlur, disabled }} />
        <Field name="address" className="sm:col-span-2" {...{ values, errors, onChange, onBlur, disabled }} />
        <Field name="city" {...{ values, errors, onChange, onBlur, disabled }} />
        <Field name="pincode" {...{ values, errors, onChange, onBlur, disabled }} />
      </div>
    </section>
  )
}

function Field({ name, values, errors, onChange, onBlur, disabled, className = '' }) {
  const { label, multiline, ...props } = FIELD_PROPS[name]
  const error = errors[name]
  const id = `checkout-${name}`
  const shared = {
    id,
    name,
    value: values[name],
    onChange: (event) => onChange(name, name === 'pincode' ? event.target.value.replace(/\D/g, '') : event.target.value),
    onBlur: () => onBlur(name),
    disabled,
    required: true,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
    className: 'w-full bg-transparent text-[18px] text-espresso placeholder:text-[#9b877b] focus:outline-none disabled:opacity-60',
    ...props,
  }
  return (
    <div className={className}>
      <label htmlFor={id}
        className={`flex cursor-text gap-3.5 rounded-[18px] border-[1.5px] bg-white/90 px-4 py-2.5 transition focus-within:border-orange focus-within:shadow-[0_0_0_4px_rgb(230_107_50/0.15)] ${multiline ? 'items-start' : 'items-center'} ${error ? 'border-[#e0573a] bg-[#fffaf8]' : 'border-[#f0d8c6] hover:border-[#ebc3a6]'}`}>
        <span className={multiline ? 'pt-3' : ''}>{ICONS[name]}</span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[14px] font-medium text-espresso-soft">{label}</span>
          {multiline
            ? <textarea rows={2} {...shared} className={`${shared.className} min-h-[52px] resize-y leading-snug`} />
            : <input type="text" {...shared} />}
        </span>
      </label>
      {error && (
        <p id={`${id}-error`} className="ml-2 mt-1.5 flex items-center gap-1.5 text-[13.5px] font-medium text-[#b3261e]" data-testid="field-error">
          <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#d8432a] text-[11px] font-bold text-white" aria-hidden="true">!</span>
          {error}
        </p>
      )}
    </div>
  )
}
