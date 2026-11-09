import { PAYMENT_METHODS } from '@/lib/checkout'

const ICONS = {
  COD: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M5.5 9v6M18.5 9v6" /></>,
  UPI: <><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M10 18.5h4" /><path d="M10 8l2 4 2-4" /></>,
  CARD: <><rect x="2.5" y="5.5" width="19" height="13" rx="2.2" /><path d="M2.5 9.5h19M6 15h4" /></>,
}

/**
 * Payment method choice. Only methods marked `available` in lib/checkout.js can be chosen;
 * the others are listed as "Coming soon" (there is no payment gateway in the backend yet).
 */
export default function PaymentMethods({ value, onChange, disabled }) {
  return (
    <section className="rounded-[28px] bg-white/70 p-5 shadow-[0_24px_50px_-34px_rgb(110_52_16/0.5)] ring-1 ring-[#f3dccb] sm:px-7 sm:py-6" aria-labelledby="payment-title">
      <h2 id="payment-title" className="flex items-center gap-3 text-[clamp(22px,2vw,27px)] font-bold text-espresso">
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-orange" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19M6 15h4" strokeLinecap="round" /></svg>
        Payment Method
      </h2>

      <fieldset className="mt-4" disabled={disabled}>
        <legend className="sr-only">Choose how to pay</legend>
        <div className="flex flex-col gap-2.5">
          {PAYMENT_METHODS.map((method) => {
            const checked = value === method.id
            return (
              <label key={method.id} data-testid={`payment-${method.id}`}
                className={`flex items-center gap-4 rounded-[18px] border-[1.5px] px-4 py-2.5 transition sm:px-5 ${
                  !method.available ? 'cursor-not-allowed border-[#f1e2d6] bg-white/40'
                    : checked ? 'cursor-pointer border-orange bg-[#fff1e6] shadow-[0_10px_24px_-18px_rgb(207_78_24/0.7)]'
                      : 'cursor-pointer border-[#f0d8c6] bg-white/80 hover:border-[#ebc3a6]'}`}>
                <input type="radio" name="paymentMethod" value={method.id} checked={checked} disabled={!method.available}
                  onChange={() => onChange(method.id)} className="peer sr-only" aria-describedby={`payment-${method.id}-note`} />
                <span aria-hidden="true"
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-orange ${checked ? 'border-orange' : 'border-[#b9a596]'}`}>
                  {checked && <span className="h-3 w-3 rounded-full bg-orange" />}
                </span>
                <svg viewBox="0 0 24 24" className={`h-7 w-7 shrink-0 ${method.available ? 'text-[#4b2214]' : 'text-[#b9a596]'}`} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[method.id]}</svg>
                {/* the "Coming soon" badge sits on the right, or under the label when space is short */}
                <span className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="flex min-w-[11rem] flex-1 flex-col">
                    <span className={`text-[16px] font-semibold sm:text-[17px] ${method.available ? 'text-espresso' : 'text-[#a8968a]'}`}>{method.label}</span>
                    {method.available && <span id={`payment-${method.id}-note`} className="text-[13px] leading-tight text-espresso-soft">{method.note}</span>}
                  </span>
                  {!method.available && (
                    <span id={`payment-${method.id}-note`} className="shrink-0 rounded-full bg-[#f3e6da] px-3 py-1 text-xs font-semibold text-[#9a8475]">{method.note}</span>
                  )}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
    </section>
  )
}
