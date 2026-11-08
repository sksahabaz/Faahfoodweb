// The page's Lenis smooth-scroll instance, set by <SmoothScroll>.
let lenis = null

export function setLenis(instance) {
  lenis = instance
}

/** Smoothly scrolls to an element or selector. Falls back to native scrolling. */
export function scrollToTarget(target) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.6 })
    return
  }
  const element = typeof target === 'string' ? document.querySelector(target) : target
  element?.scrollIntoView({ behavior: 'smooth' })
}
