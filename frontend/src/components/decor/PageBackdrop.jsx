import { memo, useLayoutEffect, useRef, useState } from 'react'
import { decorUrl } from '@/lib/models'
import { ribbonPaths, TONES } from '@/lib/ribbons'
import './page-backdrop.css'

/**
 * FAah!! FOOD page background (the approved restaurant-listing reference): a light
 * cream → peach wash with warm orange glow, soft silk ribbons flowing in from the edges,
 * and realistic floating ingredients that stay in the side margins.
 *
 * Put it as the first child of a `position: relative` content wrapper; it fills the
 * wrapper, sits behind the content, never takes pointer events and never causes
 * horizontal scrolling. The decoration is laid out in screen-height "bands" down the
 * page: band A is the reference composition, the following bands are variations of it.
 */

// ---- Ribbons: band coordinates (viewBox 1672 × 941, the reference frame), stretched to the band ----
const RIBBONS = {
  A: [
    { id: 'tr', pts: [[1760, 150], [1520, 190], [1330, 55], [1040, 100]], width: [175, 6], twist: 1.1, tone: 'soft' },
    { id: 'tr2', pts: [[1760, 235], [1560, 250], [1420, 150], [1230, 165]], width: [60, 4], twist: 1.4, tone: 'mist' },
    { id: 'ml', pts: [[-80, 250], [80, 285], [130, 400], [280, 450]], width: [200, 8], twist: 1.0, tone: 'soft' },
    { id: 'ml2', pts: [[-80, 380], [40, 400], [110, 470], [200, 500]], width: [70, 5], twist: 1.3, tone: 'mist' },
    { id: 'br', pts: [[1760, 860], [1560, 835], [1400, 935], [1150, 960]], width: [170, 8], twist: 1.0, tone: 'soft' },
    { id: 'bl', pts: [[-80, 905], [120, 860], [270, 915], [430, 975]], width: [90, 6], twist: 1.2, tone: 'mist' },
  ],
  B: [
    { id: 'tl', pts: [[-80, 120], [180, 160], [300, 40], [560, 80]], width: [150, 6], twist: 1.1, tone: 'soft' },
    { id: 'mr', pts: [[1760, 420], [1600, 450], [1560, 560], [1400, 605]], width: [190, 8], twist: 1.0, tone: 'soft' },
    { id: 'mr2', pts: [[1760, 540], [1640, 560], [1580, 630], [1490, 660]], width: [70, 5], twist: 1.3, tone: 'mist' },
    { id: 'bl', pts: [[-80, 820], [110, 790], [250, 880], [470, 900]], width: [110, 7], twist: 1.1, tone: 'soft' },
  ],
  C: [
    { id: 'tr', pts: [[1760, 210], [1560, 240], [1430, 140], [1230, 160]], width: [100, 6], twist: 1.2, tone: 'mist' },
    { id: 'ml', pts: [[-80, 470], [80, 500], [140, 600], [300, 640]], width: [185, 8], twist: 1.0, tone: 'soft' },
    { id: 'br', pts: [[1760, 800], [1580, 770], [1450, 870], [1220, 890]], width: [165, 8], twist: 1.0, tone: 'soft' },
  ],
}

// Softer than the scroll story's ribbons: the listing reference uses gentle peach-orange silk.
const SOFT_TONES = {
  soft: { body: [[0, '#f2924a', 0.9], [0.4, '#f6aa68', 0.7], [0.75, '#facb9c', 0.36], [1, '#fde3cc', 0]],
    sheen: '#fff0dc', fold: '#ec8a4a', edge: '#fff7ee' },
  mist: { body: [[0, '#f7b47c', 0.62], [0.55, '#fac9a0', 0.38], [1, '#fde5d0', 0]],
    sheen: '#fff4e6', fold: '#f2a26a', edge: '#fffaf3' },
}
// Same geometry helpers as the story ribbons (TONES kept for the stroke/fold structure).
const tone = (name) => SOFT_TONES[name] || TONES.light

// ---- Ingredients: x in vw from the left (l) or right (r) edge, y in % of the band ----
//   w width (vw), rot (deg), blur (px), o opacity, flip (mirror), float [px, deg, seconds], depth = shadow strength
const INGREDIENTS = {
  A: [
    { src: 'basil-leaf-soft', l: -1.2, y: 13, w: 6.8, rot: -18, float: [9, 4, 7.5] },
    { src: 'seed-10', l: 1.4, y: 24, w: 1.15, rot: 25, float: [6, 14, 5.2] },
    { src: 'seed-9', l: 3.2, y: 28.5, w: 0.95, rot: -30, float: [5, -12, 6.1] },
    { src: 'tomato-slice-wet', r: -2.6, y: 18, w: 7.2, rot: -24, float: [10, -3, 8.2] },
    { src: 'seed-8', r: 0.8, y: 33, w: 1.05, rot: 40, float: [6, 16, 5.6] },
    { src: 'seed-2', r: 0.3, y: 38, w: 0.9, rot: -10, blur: 0.8, float: [5, -10, 6.4] },
    { src: 'crumb', l: 6.5, y: 47, w: 0.6, float: [4, 20, 5] },
    { src: 'lettuce-leaf', r: -2.4, y: 82, w: 9, rot: -20, flip: true, blur: 0.6, float: [8, -3, 8.8] },
    { src: 'tomato-whole', l: -1.8, y: 84, w: 8.6, rot: 3, blur: 2.2, float: [6, 1.5, 9.4], fg: true },
    { src: 'seed-6', r: 4.5, y: 72, w: 1.1, rot: 15, blur: 1.2, float: [5, 18, 5.9] },
  ],
  B: [
    { src: 'cheese-slice', l: -5.5, y: 12, w: 12.5, rot: 14, float: [10, 2.5, 9.6] },
    { src: 'cheese-drop-1', l: 4.2, y: 30, w: 1.7, rot: -20, float: [6, 8, 6.3] },
    { src: 'onion-ring', r: -3.2, y: 24, w: 8.5, rot: 28, float: [9, 4, 8.4] },
    { src: 'onion-petal-1', r: 2.4, y: 44, w: 4.2, rot: -14, blur: 0.8, float: [7, -6, 7.2] },
    { src: 'seed-7', l: 2.2, y: 52, w: 1.2, rot: 30, float: [5, 14, 5.5] },
    { src: 'seed-4', r: 1.2, y: 61, w: 1.0, rot: -20, blur: 1, float: [5, -12, 6.6] },
    { src: 'crumb', r: 6, y: 66, w: 0.55, float: [4, 15, 4.8] },
    { src: 'tomato-slice-soft', l: -3.4, y: 74, w: 8.2, rot: 18, blur: 1.6, o: 0.95, float: [9, -2.5, 8.9] },
    { src: 'basil-leaf-soft', r: -1.4, y: 86, w: 5.4, rot: 150, blur: 0.5, float: [8, 5, 7.7] },
  ],
  C: [
    { src: 'lettuce-leaf', l: -3.6, y: 10, w: 10, rot: 24, float: [9, 3, 8.6] },
    { src: 'seed-1', l: 3.8, y: 27, w: 1.1, rot: -15, float: [5, 12, 5.8] },
    { src: 'tomato-slice', r: -2.8, y: 35, w: 7.6, rot: -30, float: [9, -3, 8.1] },
    { src: 'cheese-drop-2', r: 3.4, y: 52, w: 1.5, rot: 10, float: [6, -9, 6.9] },
    { src: 'onion-petal-2', l: 1.2, y: 58, w: 4.4, rot: 12, float: [7, 6, 7.4] },
    { src: 'seed-5', l: 5.4, y: 71, w: 1.0, rot: 25, blur: 1, float: [5, 16, 6.2] },
    { src: 'crumb', l: 2.6, y: 76, w: 0.5, float: [4, 18, 5.1] },
    { src: 'onion-ring', r: -2.6, y: 80, w: 7, rot: -22, blur: 1.4, o: 0.92, float: [8, -4, 9.1] },
  ],
}
const SEQUENCE = ['A', 'B', 'C']

const Ribbon = memo(function Ribbon({ ribbon, uid }) {
  const t = tone(ribbon.tone)
  const paths = ribbonPaths(ribbon, 1, 0.9)
  const axis = { gradientUnits: 'userSpaceOnUse', x1: ribbon.pts[0][0], y1: ribbon.pts[0][1], x2: ribbon.pts[3][0], y2: ribbon.pts[3][1] }
  const id = (part) => `pb-${uid}-${ribbon.id}-${part}`
  return (
    <g className={`pb-ribbon pb-ribbon-${ribbon.tone}`}>
      <defs>
        <linearGradient id={id('body')} {...axis}>
          {t.body.map(([o, c, a]) => <stop key={o} offset={o} stopColor={c} stopOpacity={a} />)}
        </linearGradient>
        <linearGradient id={id('sheen')} {...axis}>
          <stop offset="0" stopColor={t.sheen} stopOpacity="0.75" /><stop offset="1" stopColor={t.sheen} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('fold')} {...axis}>
          <stop offset="0" stopColor={t.fold} stopOpacity="0.22" /><stop offset="0.8" stopColor={t.fold} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('edge')} {...axis}>
          <stop offset="0" stopColor={t.edge} stopOpacity="0.95" /><stop offset="1" stopColor={t.edge} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={paths.body} fill={`url(#${id('body')})`} />
      <path d={paths.fold} fill={`url(#${id('fold')})`} />
      <path d={paths.sheen} fill={`url(#${id('sheen')})`} />
      <path d={paths.edge} fill="none" stroke={`url(#${id('edge')})`} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </g>
  )
})

const Ingredient = memo(function Ingredient({ item, index }) {
  const style = {
    top: `${item.y}%`,
    '--w': `${item.w}vw`, // scaled per breakpoint in CSS
    [item.r !== undefined ? 'right' : 'left']: `${item.r ?? item.l}vw`,
    '--rot': `${item.rot || 0}deg`,
    '--flip': item.flip ? -1 : 1,
    '--blur': `${item.blur || 0}px`,
    '--o': item.o ?? 1,
    '--fy': `${item.float[0]}px`,
    '--fr': `${item.float[1]}deg`,
    '--fs': `${item.float[2]}s`,
    '--fd': `${-((index * 1.7) % item.float[2])}s`,
  }
  const kind = item.src === 'crumb' ? 'pb-crumb' : item.src.startsWith('seed') ? 'pb-seed' : 'pb-food'
  const edge = (item.r ?? item.l) < 0 ? ' pb-edge' : '' // cut by the screen edge (the only ones kept on phones)
  return (
    <div className={`pb-item ${kind}${edge}${item.fg ? ' pb-fg' : ''}`} style={style}>
      <div className="pb-float">
        {item.src === 'crumb'
          ? <span className="pb-crumb-dot" />
          : <img src={decorUrl(item.src)} alt="" draggable="false" loading="lazy" decoding="async" />}
      </div>
    </div>
  )
})

function Band({ kind, index }) {
  return (
    <div className={`pb-band pb-band-${kind}`} style={{ top: `calc(${index} * var(--pb-band))` }}>
      <div className="pb-glow" />
      <svg className="pb-ribbons" viewBox="0 0 1672 941" preserveAspectRatio="none" aria-hidden="true">
        {RIBBONS[kind].map((ribbon) => <Ribbon key={ribbon.id} ribbon={ribbon} uid={index} />)}
      </svg>
      {INGREDIENTS[kind].map((item, i) => <Ingredient key={`${item.src}-${i}`} item={item} index={i + index * 7} />)}
    </div>
  )
}

export default function PageBackdrop() {
  const root = useRef()
  const [layout, setLayout] = useState({ bands: 1, band: 900 })

  // One band per screen of content (the page grows when restaurants load or filters change).
  useLayoutEffect(() => {
    const el = root.current
    const measure = () => {
      const band = Math.max(window.innerHeight, 680)
      const bands = Math.max(1, Math.ceil(el.offsetHeight / band))
      setLayout((old) => (old.bands === bands && old.band === band ? old : { bands, band }))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <div className="page-backdrop" ref={root} style={{ '--pb-band': `${layout.band}px` }} aria-hidden="true">
      <div className="pb-wash" />
      {Array.from({ length: layout.bands }, (_, i) => <Band key={i} kind={SEQUENCE[i % SEQUENCE.length]} index={i} />)}
    </div>
  )
}
