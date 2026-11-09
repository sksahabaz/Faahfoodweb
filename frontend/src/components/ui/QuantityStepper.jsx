/** − quantity + control. Buttons are disabled while a cart request is in flight. */
export default function QuantityStepper({ quantity, onDecrease, onIncrease, busy = false, size = 'md', label }) {
  const small = size === 'sm'
  const button = `grid place-items-center rounded-full transition disabled:cursor-wait disabled:opacity-60 ${small ? 'h-7 w-7' : 'h-9 w-9'}`
  return (
    <div className={`inline-flex items-center rounded-full bg-[#fde7d6] ${small ? 'gap-1.5 p-0.5' : 'gap-3 p-1'}`}
      role="group" aria-label={label ? `Quantity of ${label}` : 'Quantity'} data-testid="quantity-stepper">
      <button type="button" onClick={onDecrease} disabled={busy} className={`${button} text-orange-deep hover:bg-white/80`}
        aria-label={quantity === 1 ? `Remove ${label || 'item'}` : `One less ${label || ''}`.trim()}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path d="M6 12h12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
      </button>
      <span className={`min-w-5 text-center font-bold text-espresso ${small ? 'text-sm' : 'text-base'}`} aria-live="polite" data-testid="quantity">{quantity}</span>
      <button type="button" onClick={onIncrease} disabled={busy}
        className={`${button} bg-gradient-to-b from-[#ec6a2e] to-[#d4501a] text-white shadow-[0_6px_12px_-6px_rgb(207_78_24/0.8)] hover:brightness-105`}
        aria-label={`One more ${label || ''}`.trim()}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
      </button>
    </div>
  )
}
