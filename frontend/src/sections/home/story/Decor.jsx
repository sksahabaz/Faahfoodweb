import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { forwardRef, useLayoutEffect, useRef } from 'react'
import { decorUrl } from '@/lib/models'

gsap.registerPlugin(ScrollTrigger)

// Floating ingredients, placed like the reference. Position/size live in story.css
// (per breakpoint); here: image, depth (parallax strength) and float personality.
//   depth: 0.2 far … 1.4 foreground     float: [y px, rotate deg, x px, seconds]
//   scroll (optional): [xPercent, yPercent] reached at 120 % scroll; default drifts up by depth
const BACK = [
  { id: 'lettuce-ul', src: 'lettuce-leaf', depth: 0.8, float: [14, 4, 6, 5.2] },
  { id: 'tomato-ur', src: 'tomato-slice', depth: 0.65, float: [12, -6, -5, 4.6] },
  { id: 'onion-ll', src: 'onion-ring', depth: 0.75, float: [10, 7, 6, 5.8] },
  { id: 'lettuce-lr', src: 'lettuce-leaf', depth: 0.9, float: [12, -5, -6, 6.2] },
  { id: 'seed-a', src: 'seed-9', depth: 0.35, float: [8, 30, 3, 4.2] },
  { id: 'seed-b', src: 'seed-1', depth: 0.3, float: [6, -20, 2, 3.8] },
  { id: 'seed-c', src: 'seed-10', depth: 0.45, float: [9, 25, -3, 4.9] },
  { id: 'seed-d', src: 'seed-4', depth: 0.25, float: [5, -15, 2, 3.6] },
  { id: 'seed-e', src: 'seed-8', depth: 0.4, float: [7, 18, -2, 4.4] },
  { id: 'seed-f', src: 'seed-6', depth: 0.3, float: [6, -25, 3, 5.1] },
  { id: 'seed-g', src: 'seed-3', depth: 0.2, float: [4, 12, 2, 3.9] },
  { id: 'seed-h', src: 'seed-2', depth: 0.35, float: [7, -18, -2, 4.7] },
  { id: 'seed-i', src: 'seed-5', depth: 0.25, float: [5, 22, 2, 4.0] },
]
const FRONT = [
  // Foreground tomato: sinks down-left out of the corner as you scroll, away from the burger.
  { id: 'tomato-front', src: 'tomato-whole', depth: 1.4, float: [6, 1.5, 3, 7.5], scroll: [-14, 26] },
  { id: 'seed-front', src: 'seed-10', depth: 1.2, float: [10, 15, -4, 5.5] },
]

const Layer = forwardRef(function Layer({ items, className, reducedMotion, storyRef }, ref) {
  const root = useRef()

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray('[data-depth]', root.current)
      const movers = []

      elements.forEach((el, i) => {
        const depth = Number(el.dataset.depth)
        const [fy, fr, fx, seconds] = el.dataset.float.split(',').map(Number)
        const float = el.querySelector('.decor-float')
        const parallax = el.querySelector('.decor-parallax')

        // Scroll: each ingredient drifts away at its own speed (scrubbed, reverses on scroll up).
        const [scrollX, scrollY] = el.dataset.scroll ? el.dataset.scroll.split(',').map(Number) : [0, -40 * depth]
        gsap.to(el, {
          xPercent: scrollX,
          yPercent: scrollY,
          ease: 'none',
          scrollTrigger: { trigger: storyRef.current, start: 'top top', end: '+=120%', scrub: reducedMotion ? true : 1 },
        })

        if (reducedMotion) return
        // Slow float: own amplitude, rotation, sway and tempo; started at a different phase.
        gsap.to(float, { y: fy, rotation: fr, x: fx, duration: seconds, ease: 'sine.inOut', yoyo: true,
          repeat: -1, delay: -(i * 0.73) % seconds })
        movers.push({
          x: gsap.quickTo(parallax, 'x', { duration: 1.2, ease: 'power3' }),
          y: gsap.quickTo(parallax, 'y', { duration: 1.2, ease: 'power3' }),
          depth,
        })
      })

      if (reducedMotion) return undefined
      // Cursor parallax: close ingredients move more than far ones.
      const onMove = (event) => {
        const nx = event.clientX / window.innerWidth - 0.5
        const ny = event.clientY / window.innerHeight - 0.5
        for (const m of movers) {
          m.x(nx * 36 * m.depth)
          m.y(ny * 24 * m.depth)
        }
      }
      window.addEventListener('pointermove', onMove)
      return () => window.removeEventListener('pointermove', onMove)
    }, root)
    return () => ctx.revert()
  }, [reducedMotion, storyRef])

  return (
    <div ref={(node) => { root.current = node; if (ref) ref.current = node }} className={className} aria-hidden="true">
      {items.map((item) => (
        <div key={item.id} className={`decor decor-${item.id}`} data-depth={item.depth} data-float={item.float.join(',')}
          data-scroll={item.scroll?.join(',')}>
          <div className="decor-parallax">
            <div className="decor-float">
              <img src={decorUrl(item.src)} alt="" draggable="false" decoding="async" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

export const DecorBack = forwardRef(function DecorBack(props, ref) {
  return <Layer ref={ref} items={BACK} className="decor-layer decor-back" {...props} />
})

export const DecorFront = forwardRef(function DecorFront(props, ref) {
  return <Layer ref={ref} items={FRONT} className="decor-layer decor-front" {...props} />
})
