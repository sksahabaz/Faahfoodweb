import { useState } from 'react'
import { resolveImage } from '@/lib/paths'

/**
 * An image URL from the database (restaurant or menu item), shown as returned by the API.
 * Missing or broken URLs get a branded placeholder (warm gradient + initial) instead.
 */
export default function FoodImage({ src, alt, label, quiet = false, className = '', imgClassName = '', loading = 'lazy', ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const url = resolveImage(src)
  const failed = !url || failedSrc === url

  return (
    <div className={`overflow-hidden bg-cream-deep ${className}`} data-image-state={failed ? 'fallback' : 'image'} {...rest}>
      {failed && quiet ? (
        // e.g. a banner background: just the warm gradient, no lettering
        <div className="h-full w-full bg-[radial-gradient(circle_at_70%_40%,#c8794a,#7a3a1a_70%)]" />
      ) : failed ? (
        <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_35%_30%,#fbd7b3,#f0a96d_55%,#e07a3a)]" role="img" aria-label={alt}>
          <span className="font-display text-[clamp(22px,30%,56px)] uppercase text-white/85" aria-hidden="true">
            {(label || alt || '?').trim().charAt(0)}
          </span>
        </div>
      ) : (
        <img src={url} alt={alt} loading={loading} decoding="async" onError={() => setFailedSrc(url)}
          className={`h-full w-full object-cover ${imgClassName}`} />
      )}
    </div>
  )
}
