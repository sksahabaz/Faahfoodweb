import { Component } from 'react'
import { FALLBACK_IMAGE } from '@/lib/models'

/**
 * Simple hero used while the 3D story loads, when the device has no WebGL, or if the
 * 3D scene fails: BURGER lettering, the studio render of the burger and Order Now.
 */
export function StaticHero({ onOrderNow, note }) {
  return (
    <section className="relative z-[1] flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pb-14 pt-28 text-center" aria-label="The FAah!! double cheeseburger" data-testid="static-hero">
      <p className="pointer-events-none select-none font-display text-[min(27vw,46vh)] uppercase leading-none text-orange-deep/90" aria-hidden="true">Burger</p>
      <img src={FALLBACK_IMAGE} alt="FAah!! FOOD double cheeseburger" className="-mt-[16vh] w-[min(540px,82vw)] rounded-[32px] shadow-[0_30px_60px_-36px_rgb(110_52_16/0.6)]" />
      <button type="button" onClick={onOrderNow} className="pill-button mt-8 text-lg">Order Now →</button>
      {note && <p className="mt-4 text-xs text-espresso-soft">{note}</p>}
    </section>
  )
}

/** Swaps the 3D story for the static hero if anything in it throws (e.g. the model fails to load). */
export class StoryErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error('3D burger story unavailable:', error)
    this.props.onError?.()
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
