import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { setLenis } from './scroll'

gsap.registerPlugin(ScrollTrigger)

/**
 * Smooth scrolling for the whole page, driven by GSAP's clock
 * so scroll-triggered animations stay in sync with the scroll.
 * Turned off for users who ask for reduced motion, and on pages that
 * opt out (the homepage's scroll story already smooths its own scrubbing).
 */
export default function SmoothScroll({ enabled = true, children }) {
  useEffect(() => {
    if (!enabled) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const lenis = new Lenis({ autoRaf: false })
    lenis.on('scroll', ScrollTrigger.update)
    setLenis(lenis)

    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [enabled])

  return children
}
