import './corner-ribbons.css'

/**
 * Flowing orange ribbons in the top-left and bottom-right corners of the page (decoration
 * only; fixed behind the content). Used by the checkout and order-confirmation pages.
 */
export default function CornerRibbons() {
  return (
    <div className="corner-ribbons" aria-hidden="true">
      <svg className="corner-ribbon-top" viewBox="0 0 520 300">
        <defs>
          <linearGradient id="co-ribbon-a" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#f06f1e" /><stop offset="1" stopColor="#fab06a" /></linearGradient>
        </defs>
        <path d="M-30 210 C 90 220, 190 150, 280 80 S 420 -10, 540 -30" fill="none" stroke="#fbd0ab" strokeOpacity="0.6" strokeWidth="56" />
        <path d="M-30 120 C 80 140, 170 90, 250 40 S 350 -20, 400 -30" fill="none" stroke="url(#co-ribbon-a)" strokeWidth="64" />
      </svg>
      <svg className="corner-ribbon-bottom" viewBox="0 0 760 420">
        <defs>
          <linearGradient id="co-ribbon-b" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#fbb170" /><stop offset="0.5" stopColor="#f68a34" /><stop offset="1" stopColor="#f06f1e" /></linearGradient>
        </defs>
        <path d="M80 450 C 300 400, 460 260, 600 180 S 740 90, 800 80" fill="none" stroke="#fbd0ab" strokeOpacity="0.6" strokeWidth="60" />
        <path d="M260 450 C 420 400, 540 320, 650 250 S 760 190, 800 180" fill="none" stroke="url(#co-ribbon-b)" strokeWidth="70" />
        <path d="M500 450 C 610 420, 700 370, 800 320" fill="none" stroke="#f06a1b" strokeOpacity="0.85" strokeWidth="54" />
      </svg>
    </div>
  )
}
