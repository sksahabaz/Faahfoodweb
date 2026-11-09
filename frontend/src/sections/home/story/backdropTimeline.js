// Scroll entrance / exit for the exploded-burger backdrop (ExplodedBackdrop.jsx).

/**
 * Entrance and exit, added to the main scroll timeline (so scrolling up reverses them):
 * ribbons grow in from the edges, doodles draw themselves, ingredients burst outwards
 * from the burger; before reassembly everything retracts and fades.
 */
export function addBackdropTimeline(tl, back, front, { enter, exit }) {
  const layers = [back, front]
  const ribbons = back.querySelectorAll('[data-ribbon]')
  const strokes = back.querySelectorAll('.xb-doodle [pathLength]')
  const sprites = [...back.querySelectorAll('.xb-sprite'), ...front.querySelectorAll('.xb-sprite')]
  // Burst outwards: each ingredient starts part of the way towards the screen centre.
  // (layout boxes, not getBoundingClientRect: the float / parallax transforms must not leak in)
  const towardsCentre = (axis) => (i, el) => axis === 'x'
    ? (window.innerWidth / 2 - (el.offsetLeft + el.offsetWidth / 2)) * 0.45
    : (window.innerHeight / 2 - (el.offsetTop + el.offsetHeight / 2)) * 0.45

  tl.fromTo(layers, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'power1.out' }, enter)
  tl.fromTo(ribbons, { '--grow': 0 }, { '--grow': 1, duration: 1.5, stagger: 0.1, ease: 'power2.out' }, enter)
  tl.fromTo(strokes, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, stagger: 0.03, ease: 'power1.inOut' }, enter + 0.4)
  tl.fromTo(sprites, { x: towardsCentre('x'), y: towardsCentre('y'), scale: 0.55, autoAlpha: 0 },
    { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 1.3, stagger: 0.025, ease: 'power3.out' }, enter + 0.15)

  tl.to(ribbons, { '--grow': 0, duration: 1, stagger: 0.05, ease: 'power2.in' }, exit)
  tl.to(strokes, { strokeDashoffset: -1, duration: 0.8, ease: 'power1.in' }, exit)
  tl.to(sprites, { x: towardsCentre('x'), y: towardsCentre('y'), scale: 0.6, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, exit)
  tl.to(layers, { autoAlpha: 0, duration: 0.6 }, exit + 0.7)
}
