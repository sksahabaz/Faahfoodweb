import gsap from 'gsap'
import { forwardRef, useLayoutEffect, useRef } from 'react'
import { decorUrl } from '@/lib/models'
import { ribbonPaths, TONES } from '@/lib/ribbons'

/*
 * Backdrop for the exploded-burger part of the story (approved reference):
 *   wash      soft warm light where the ribbons flow (CSS gradients)
 *   ribbons   glossy orange silk ribbons sweeping in from the sides (SVG, rebuilt as they ripple)
 *   doodles   hand-drawn ingredient line art (SVG, drawn in as the burger opens)
 *   sprites   real floating ingredients (transparent WebP), some blurred in the foreground
 * The centre stays clear for the 3D burger. Entrance / exit are added to the main scroll
 * timeline by addBackdropTimeline() (backdropTimeline.js); the ripple, float and cursor parallax run on their own.
 */

// ---- Ribbons --------------------------------------------------------------------------
// Each ribbon follows a cubic Bézier centreline (viewBox units), starting off-screen.
//   width [start, end], twist = width ripples along the length, tone = colour set
const LANDSCAPE = {
  viewBox: [1672, 941],
  ribbons: [
    { id: 'tl-back', pts: [[-60, 375], [170, 360], [370, 450], [600, 492]], width: [84, 6], twist: 1.5, tone: 'light' },
    { id: 'tl', pts: [[-60, 250], [240, 240], [410, 390], [660, 482]], width: [215, 10], twist: 1.1, tone: 'deep' },
    { id: 'bl-back', pts: [[-60, 790], [170, 730], [340, 790], [600, 818]], width: [62, 6], twist: 1.7, tone: 'light' },
    { id: 'bl', pts: [[-60, 705], [160, 620], [345, 705], [660, 772]], width: [115, 8], twist: 1.2, tone: 'deep' },
    { id: 'r-back', pts: [[1740, 680], [1500, 630], [1330, 728], [1110, 735]], width: [86, 6], twist: 1.6, tone: 'light' },
    { id: 'r', pts: [[1740, 545], [1470, 470], [1280, 640], [1010, 668]], width: [235, 10], twist: 1.1, tone: 'deep' },
  ],
}
// Phones: shorter ribbons hugging the edges, the burger column needs the width.
const PORTRAIT = {
  viewBox: [390, 844],
  ribbons: [
    { id: 'tl', pts: [[-30, 150], [60, 150], [110, 215], [190, 250]], width: [64, 4], twist: 1.1, tone: 'deep' },
    { id: 'bl', pts: [[-30, 650], [50, 610], [110, 670], [200, 700]], width: [40, 4], twist: 1.3, tone: 'deep' },
    { id: 'r-back', pts: [[420, 560], [350, 545], [300, 600], [220, 615]], width: [34, 3], twist: 1.6, tone: 'light' },
    { id: 'r', pts: [[420, 470], [340, 440], [290, 530], [200, 560]], width: [70, 4], twist: 1.1, tone: 'deep' },
  ],
}
function Ribbons({ layout, name }) {
  const [w, h] = layout.viewBox
  return (
    <svg className={`xb-ribbons xb-ribbons-${name}`} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        {layout.ribbons.map((r) => {
          const tone = TONES[r.tone]
          const axis = { gradientUnits: 'userSpaceOnUse', x1: r.pts[0][0], y1: r.pts[0][1], x2: r.pts[3][0], y2: r.pts[3][1] }
          return [
            <linearGradient key="b" id={`xb-${name}-${r.id}-body`} {...axis}>
              {tone.body.map(([o, c, a]) => <stop key={o} offset={o} stopColor={c} stopOpacity={a} />)}
            </linearGradient>,
            <linearGradient key="s" id={`xb-${name}-${r.id}-sheen`} {...axis}>
              <stop offset="0" stopColor={tone.sheen} stopOpacity="0.85" /><stop offset="0.75" stopColor={tone.sheen} stopOpacity="0.35" />
              <stop offset="1" stopColor={tone.sheen} stopOpacity="0" />
            </linearGradient>,
            <linearGradient key="f" id={`xb-${name}-${r.id}-fold`} {...axis}>
              <stop offset="0" stopColor={tone.fold} stopOpacity="0.5" /><stop offset="0.85" stopColor={tone.fold} stopOpacity="0" />
            </linearGradient>,
            <linearGradient key="e" id={`xb-${name}-${r.id}-edge`} {...axis}>
              <stop offset="0" stopColor={tone.edge} stopOpacity="1" /><stop offset="0.7" stopColor={tone.edge} stopOpacity="0.55" />
              <stop offset="1" stopColor={tone.edge} stopOpacity="0" />
            </linearGradient>,
          ]
        })}
      </defs>
      {layout.ribbons.map((r) => (
        <g key={r.id} data-ribbon={r.id} data-set={name} className={`xb-ribbon tone-${r.tone}`}>
          <path data-part="body" fill={`url(#xb-${name}-${r.id}-body)`} />
          <path data-part="fold" fill={`url(#xb-${name}-${r.id}-fold)`} />
          <path data-part="sheen" fill={`url(#xb-${name}-${r.id}-sheen)`} />
          <path data-part="edge" fill="none" stroke={`url(#xb-${name}-${r.id}-edge)`} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </g>
      ))}
    </svg>
  )
}

// ---- Doodles: hand-drawn line art (each path draws itself in: pathLength = 1) --------------
const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round', pathLength: 1 }

// Scalloped outline: little bumps between points, bulging away from the centre.
function scallop(points, [cx, cy], bulge = 0.45) {
  let d = `M${points[0].join(' ')}`
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1]
    const [bx, by] = points[i]
    const mx = (ax + bx) / 2
    const my = (ay + by) / 2
    const ox = mx - cx
    const oy = my - cy
    const ol = Math.hypot(ox, oy) || 1
    const seg = Math.hypot(bx - ax, by - ay)
    d += ` Q${(mx + (ox / ol) * seg * bulge).toFixed(1)} ${(my + (oy / ol) * seg * bulge).toFixed(1)} ${bx} ${by}`
  }
  return d
}
const LEAF = scallop([[18, 112], [22, 90], [33, 72], [40, 54], [57, 45], [66, 31], [86, 28], [98, 17], [119, 20], [134, 11],
  [154, 18], [172, 14], [186, 27], [190, 42], [181, 53], [186, 67], [168, 73], [160, 88], [140, 90], [128, 102],
  [107, 100], [92, 111], [72, 107], [56, 118], [38, 113], [18, 112]], [104, 66])

const DOODLES = {
  lettuce: (
    <svg viewBox="0 0 200 130">
      <path {...line} d={LEAF} />
      <path {...line} d="M18 112 C60 86 110 56 182 32 M18 112 L7 124" />
      <path {...line} strokeWidth="2" d="M58 87 Q60 70 52 58 M58 87 Q74 93 80 104 M94 67 Q96 50 90 38 M94 67 Q111 74 117 90 M130 51 Q134 38 130 26 M130 51 Q146 58 151 73 M160 41 Q168 32 166 23" />
    </svg>
  ),
  tomato: (
    <svg viewBox="0 0 140 140">
      <path {...line} d="M60 41 C30 44 14 74 22 100 C31 128 96 136 118 106 C134 82 126 48 84 40" />
      <path {...line} d="M70 42 Q58 30 45 35 Q58 41 70 42 Q63 27 71 15 Q78 30 70 42 Q83 29 97 33 Q86 42 70 42 Q76 48 82 56 Q72 52 70 42 Q64 50 56 54 Q63 46 70 42" />
      <path {...line} d="M71 17 Q73 9 81 5 M101 62 Q110 73 108 88" />
    </svg>
  ),
  onion: (
    <svg viewBox="0 0 180 150">
      <g transform="rotate(-24 110 56)">
        <ellipse {...line} cx="110" cy="56" rx="62" ry="38" /><ellipse {...line} cx="110" cy="56" rx="48" ry="28" />
        <ellipse {...line} cx="110" cy="56" rx="34" ry="19" />
      </g>
      <g transform="rotate(-24 72 98)">
        <path {...line} d="M10 98 A62 38 0 0 0 134 98 M18 80 A62 38 0 0 1 64 60" />
        <ellipse {...line} cx="72" cy="98" rx="47" ry="27" /><ellipse {...line} cx="72" cy="98" rx="33" ry="18" />
      </g>
    </svg>
  ),
  cheese: (
    <svg viewBox="0 0 160 110">
      <path {...line} d="M8 46 L112 11 Q140 18 152 40 L152 93 L10 101 Z M8 46 L152 40" />
      <path {...line} d="M48 44 A9 7 0 0 0 66 43" />
      <circle {...line} cx="40" cy="72" r="7" /><circle {...line} cx="80" cy="64" r="9" /><circle {...line} cx="122" cy="74" r="6" />
      <circle {...line} cx="100" cy="88" r="4.5" /><circle {...line} cx="62" cy="88" r="3.5" />
    </svg>
  ),
  burst: (
    <svg viewBox="0 0 100 80">
      <path {...line} strokeWidth="4" d="M10 22 Q30 30 46 42 M6 60 Q26 58 46 56 M58 6 Q65 22 68 36" />
    </svg>
  ),
}
const DOODLE_ITEMS = [
  { id: 'lettuce', art: 'lettuce', depth: 0.3, float: [6, 2, 4, 6.4] },
  { id: 'tomato', art: 'tomato', depth: 0.35, float: [7, -3, -3, 5.6] },
  { id: 'onion', art: 'onion', depth: 0.3, float: [6, 3, -4, 6.8] },
  { id: 'cheese', art: 'cheese', depth: 0.35, float: [5, -2, 3, 5.9] },
  { id: 'burst-l', art: 'burst', depth: 0.45, float: [4, 4, 2, 3.2] },
  { id: 'burst-r', art: 'burst', depth: 0.45, float: [4, -4, -2, 3.6] },
]

// ---- Real ingredients ------------------------------------------------------------------------
const SPRITES_BACK = [
  { id: 'lettuce-a', src: 'lettuce-leaf', depth: 0.6, float: [10, 5, 4, 5.4] },
  { id: 'onion', src: 'onion-ring', depth: 0.7, float: [12, 6, 5, 6.1] },
  { id: 'tomato', src: 'tomato-slice-wet', depth: 0.75, float: [12, -5, -4, 5.0] },
  { id: 'lettuce-b', src: 'lettuce-leaf', depth: 0.65, float: [10, -6, -5, 5.8] },
  ...[[35, 16], [32.3, 27.8], [24.8, 31.7], [22.6, 35.6], [31.8, 41.8], [35.3, 46.8], [32.8, 59.2], [28, 67.2],
    [63.9, 24.2], [66.3, 37.9], [64.5, 49.1], [66.1, 60.8], [63.9, 65], [71.2, 76.5], [83.4, 38.3]]
    .map(([x, y], i) => ({ id: `seed-${i}`, src: `seed-${(i % 10) + 1}`, depth: 0.25 + (i % 4) * 0.08,
      float: [5 + (i % 3) * 2, (i % 2 ? -1 : 1) * (14 + i), (i % 2 ? 2 : -2), 3.6 + (i % 5) * 0.4], pos: [x, y], seed: true })),
]
const SPRITES_FRONT = [
  { id: 'tomato-blur', src: 'tomato-whole', depth: 1.3, float: [6, 1.5, 3, 7.2] },
  { id: 'lettuce-blur', src: 'lettuce-leaf', depth: 1.2, float: [8, -3, -4, 6.6] },
]

function Sprite({ item }) {
  const style = item.pos ? { left: `${item.pos[0]}vw`, top: `${item.pos[1]}vh`, '--spin': `${(item.pos[0] * 37) % 180}deg` } : undefined
  return (
    <div className={`xb-item xb-sprite xb-s-${item.id}${item.seed ? ' xb-seed' : ''}`} style={style}
      data-depth={item.depth} data-float={item.float.join(',')}>
      <div className="xb-parallax">
        <div className="xb-float">
          <img src={decorUrl(item.src)} alt="" draggable="false" decoding="async" />
        </div>
      </div>
    </div>
  )
}

// Float + cursor parallax for every [data-depth] item inside root.
function useAmbient(root, reducedMotion) {
  useLayoutEffect(() => {
    if (reducedMotion) return undefined
    const ctx = gsap.context(() => {
      const movers = gsap.utils.toArray('[data-depth]', root.current).map((el, i) => {
        const [fy, fr, fx, seconds] = el.dataset.float.split(',').map(Number)
        gsap.to(el.querySelector('.xb-float'), { y: fy, rotation: fr, x: fx, duration: seconds, ease: 'sine.inOut',
          yoyo: true, repeat: -1, delay: -(i * 0.61) % seconds })
        const parallax = el.querySelector('.xb-parallax')
        return { x: gsap.quickTo(parallax, 'x', { duration: 1.3, ease: 'power3' }),
          y: gsap.quickTo(parallax, 'y', { duration: 1.3, ease: 'power3' }), depth: Number(el.dataset.depth) }
      })
      const onMove = (event) => {
        const nx = event.clientX / window.innerWidth - 0.5
        const ny = event.clientY / window.innerHeight - 0.5
        for (const m of movers) {
          m.x(nx * 34 * m.depth)
          m.y(ny * 22 * m.depth)
        }
      }
      window.addEventListener('pointermove', onMove)
      return () => window.removeEventListener('pointermove', onMove)
    }, root)
    return () => ctx.revert()
  }, [root, reducedMotion])
}

// Both ribbon sets are rendered; CSS shows the one that fits the screen (same query here).
const PORTRAIT_QUERY = '(max-aspect-ratio: 9/10)'
const LAYOUTS = { landscape: LANDSCAPE, portrait: PORTRAIT }

export const ExplodedBack = forwardRef(function ExplodedBack({ reducedMotion }, ref) {
  const root = useRef()

  // Ribbons: rebuilt from their growth (--grow, driven by the scroll timeline) and a slow ripple.
  useLayoutEffect(() => {
    const el = root.current
    const portrait = window.matchMedia(PORTRAIT_QUERY)
    const ribbons = [...el.querySelectorAll('[data-ribbon]')].map((g) => ({
      g,
      set: g.dataset.set,
      def: LAYOUTS[g.dataset.set].ribbons.find((r) => r.id === g.dataset.ribbon),
      parts: Object.fromEntries([...g.querySelectorAll('path')].map((p) => [p.dataset.part, p])),
      last: '',
    }))
    const wave = { phase: 0 }
    const ripple = reducedMotion ? null : gsap.to(wave, { phase: Math.PI * 2, duration: 9, ease: 'none', repeat: -1 })
    let lastTime = 0
    const tick = (time) => {
      if (el.style.visibility === 'hidden' || time - lastTime < 1 / 40) return // hidden, or ~40 fps is plenty for silk
      lastTime = time
      const active = portrait.matches ? 'portrait' : 'landscape'
      for (const r of ribbons) {
        if (r.set !== active) continue
        const grow = Math.min(1, Math.max(0, parseFloat(r.g.style.getPropertyValue('--grow')) || 0))
        const key = `${grow.toFixed(4)}|${wave.phase.toFixed(3)}`
        if (key === r.last) continue
        r.last = key
        const paths = grow < 0.002 ? { body: '', sheen: '', fold: '', edge: '' } : ribbonPaths(r.def, grow, wave.phase)
        for (const [part, d] of Object.entries(paths)) r.parts[part].setAttribute('d', d)
      }
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      ripple?.kill()
    }
  }, [reducedMotion])

  useAmbient(root, reducedMotion)

  return (
    <div ref={(node) => { root.current = node; if (ref) ref.current = node }} className="xb-layer xb-back" aria-hidden="true">
      <div className="xb-wash" />
      <Ribbons name="landscape" layout={LANDSCAPE} />
      <Ribbons name="portrait" layout={PORTRAIT} />
      {DOODLE_ITEMS.map((item) => (
        <div key={item.id} className={`xb-item xb-doodle xb-d-${item.id}`} data-depth={item.depth} data-float={item.float.join(',')}>
          <div className="xb-parallax"><div className="xb-float">{DOODLES[item.art]}</div></div>
        </div>
      ))}
      {SPRITES_BACK.map((item) => <Sprite key={item.id} item={item} />)}
    </div>
  )
})

export const ExplodedFront = forwardRef(function ExplodedFront({ reducedMotion }, ref) {
  const root = useRef()
  useAmbient(root, reducedMotion)
  return (
    <div ref={(node) => { root.current = node; if (ref) ref.current = node }} className="xb-layer xb-front" aria-hidden="true">
      {SPRITES_FRONT.map((item) => <Sprite key={item.id} item={item} />)}
    </div>
  )
})
