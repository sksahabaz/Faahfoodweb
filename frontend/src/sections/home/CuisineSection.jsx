import { forwardRef, useMemo, useState } from 'react'
import { ALL, CUISINE_DISC_SHARE, CUISINES, servesCuisine } from '@/lib/cuisines'

// Ring geometry (matches the approved sheet): the food disc fills 90 % of the white ring,
// so the illustration (disc = CUISINE_DISC_SHARE of the image) is drawn at 0.9 / share of it.
const DISC_IN_RING = 0.9
const IMAGE_SCALE = `${((DISC_IN_RING / CUISINE_DISC_SHARE) * 100).toFixed(1)}%`

/**
 * "Explore by cuisine". The burger from the scroll story lands in the "All" tile: its ring
 * (tileDiscRef) forms around the arriving 3D burger, then the illustration (tileRef) takes over.
 * Counts come from the real menus; a cuisine no restaurant serves says so instead of a number.
 */
const CuisineSection = forwardRef(function CuisineSection({ tileRef, tileDiscRef, selected, onSelect, restaurants, index }, ref) {
  const tiles = useMemo(() => {
    const list = restaurants || []
    return CUISINES.map((cuisine) => {
      if (cuisine.id === ALL) return { ...cuisine, count: restaurants ? list.length : null }
      if (!index.data) return { ...cuisine, count: null } // menus not known (yet): no number shown
      return { ...cuisine, count: list.filter((r) => servesCuisine(cuisine, index.data.get(r.restaurantId))).length }
    })
  }, [restaurants, index.data])

  return (
    <section ref={ref} id="cuisines" className="relative z-[1] scroll-mt-24 px-5 pb-8 pt-28 sm:px-10 md:pt-32" aria-labelledby="cuisines-title">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.42em] text-orange">What are you craving?</p>
        <h2 id="cuisines-title" className="mt-3 text-center font-display text-[clamp(40px,6vw,72px)] uppercase leading-none tracking-wide text-espresso">
          Explore by cuisine
        </h2>

        {/* One row: scrolls sideways below 1280 px, fits the content width from xl up. */}
        <div className="-mx-5 mt-8 flex snap-x gap-4 overflow-x-auto px-5 pb-4 pt-5 [scrollbar-width:none] sm:-mx-10 sm:px-10 xl:mx-0 xl:justify-between xl:gap-0 xl:overflow-visible xl:px-3"
          role="group" aria-label="Filter restaurants by cuisine">
          {tiles.map((tile) => (
            <CuisineTile key={tile.id} tile={tile} active={tile.id === selected} onSelect={onSelect}
              imageRef={tile.id === ALL ? tileRef : undefined} ringRef={tile.id === ALL ? tileDiscRef : undefined} />
          ))}
        </div>
      </div>
    </section>
  )
})

function CuisineTile({ tile, active, onSelect, imageRef, ringRef }) {
  const [failed, setFailed] = useState(false)
  const count = tile.count == null ? '' : tile.count === 0 ? 'None yet' : `${tile.count} place${tile.count === 1 ? '' : 's'}`

  return (
    <button type="button" aria-pressed={active} onClick={() => onSelect(tile.id)}
      className="group flex w-[104px] shrink-0 snap-start flex-col items-center gap-2.5 rounded-2xl pb-1 text-center outline-none focus-visible:ring-2 focus-visible:ring-espresso xl:w-[112px]"
      data-testid={`cuisine-${tile.id}`}>
      <span className="relative block aspect-square w-full transition-transform duration-300 ease-out group-hover:-translate-y-1">
        {/* White ring with a soft warm shadow; orange when selected. Its own layer so it can form around the landing burger. */}
        <span ref={ringRef} aria-hidden="true"
          className={`absolute inset-0 rounded-full bg-white transition-[box-shadow] duration-300 ${
            active
              ? 'shadow-[0_0_0_3px_#e66b32,0_16px_30px_-12px_rgb(230_107_50/0.6)]'
              : 'shadow-[0_0_0_1px_rgb(230_107_50/0.16),0_14px_26px_-16px_rgb(190_90_30/0.55)] group-hover:shadow-[0_0_0_2px_rgb(230_107_50/0.55),0_18px_30px_-14px_rgb(190_90_30/0.6)]'
          }`} />
        {/* Fallback disc (shown if the illustration is missing). */}
        <span aria-hidden="true"
          className="absolute inset-[5%] grid place-items-center rounded-full bg-[radial-gradient(circle_at_40%_35%,#f7b27a,#e8722f)] font-display text-3xl text-white/90">
          {failed ? tile.label.charAt(0) : ''}
        </span>
        {!failed && (
          <img ref={imageRef} src={tile.image} alt={tile.alt} draggable="false" decoding="async"
            loading={tile.id === ALL ? 'eager' : 'lazy'} onError={() => setFailed(true)}
            style={{ width: IMAGE_SCALE }}
            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 select-none" />
        )}
      </span>
      <span className={`whitespace-nowrap rounded-full px-4 py-0.5 text-base font-bold transition-colors duration-300 ${
        active ? 'bg-gradient-to-b from-[#ec6a2e] to-[#d4501a] text-white shadow-[0_8px_16px_-8px_rgb(207_78_24/0.8)]' : 'text-espresso group-hover:text-orange'
      }`}>
        {tile.label}
      </span>
      <span className="-mt-1.5 h-4 text-xs text-espresso-soft">{count}</span>
    </button>
  )
}

export default CuisineSection
