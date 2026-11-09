import { useEffect, useState } from 'react'

// Manual 3D viewing input (an OrbitControls equivalent that layers on top of the
// scroll-driven camera rig instead of fighting it). Everything lives in one mutable
// object read by the scene every frame: no React state changes while dragging.
//
//   az / el     orbit offset (radians) added to the scripted camera angles
//   zoom        multiplies the scripted camera distance
//   vAz / vEl   angular velocity after release (momentum)
//   returning   true while easing back to the scripted view (after the page scrolls)
export const ZOOM_MIN = 0.7
export const ZOOM_MAX = 1.7
const RADIANS_PER_PIXEL = 0.0085
const MAX_SPIN = 9 // rad/s: a hard flick spins briskly, never wildly
const WHEEL_ZOOM = 0.0035 // per wheel pixel: one mouse notch ~ 30 %, trackpad pinch stays smooth

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export function useOrbitInput(zoneRef) {
  const [orbit] = useState(() => ({
    az: 0, el: 0, zoom: 1, vAz: 0, vEl: 0, active: false, lastInput: 0, returning: false,
  }))

  useEffect(() => {
    const zone = zoneRef.current
    if (!zone) return undefined
    const pointers = new Map()
    let lastTime = 0
    let pinchStart = 0
    let zoomStart = 1

    const spread = () => {
      const [a, b] = [...pointers.values()]
      return Math.hypot(a.x - b.x, a.y - b.y)
    }
    const touched = () => {
      orbit.lastInput = performance.now()
      orbit.returning = false
    }

    const onDown = (event) => {
      zone.setPointerCapture(event.pointerId)
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      orbit.active = true
      orbit.vAz = 0
      orbit.vEl = 0
      lastTime = performance.now()
      if (pointers.size === 2) {
        pinchStart = spread()
        zoomStart = orbit.zoom
      }
      zone.classList.add('dragging')
      touched()
    }

    const onMove = (event) => {
      const point = pointers.get(event.pointerId)
      if (!point) return
      const dx = event.clientX - point.x
      const dy = event.clientY - point.y
      point.x = event.clientX
      point.y = event.clientY
      const now = performance.now()
      const dt = Math.max(0.008, (now - lastTime) / 1000)
      lastTime = now

      if (pointers.size === 1) {
        const dAz = -dx * RADIANS_PER_PIXEL // drag right: burger turns right
        const dEl = dy * RADIANS_PER_PIXEL  // drag down: tilt to see the top
        orbit.az += dAz
        orbit.el += dEl
        // Smoothed velocity for the momentum after release.
        orbit.vAz = clamp(orbit.vAz * 0.6 + (dAz / dt) * 0.4, -MAX_SPIN, MAX_SPIN)
        orbit.vEl = clamp(orbit.vEl * 0.6 + (dEl / dt) * 0.4, -MAX_SPIN, MAX_SPIN)
      } else if (pointers.size === 2 && pinchStart > 0) {
        orbit.zoom = clamp((zoomStart * pinchStart) / spread(), ZOOM_MIN, ZOOM_MAX) // pinch out = closer
      }
      touched()
    }

    const onUp = (event) => {
      pointers.delete(event.pointerId)
      if (pointers.size === 1) pinchStart = 0
      if (pointers.size === 0) {
        orbit.active = false
        zone.classList.remove('dragging')
        // A pause before release means no throw.
        if (performance.now() - lastTime > 80) {
          orbit.vAz = 0
          orbit.vEl = 0
        }
      }
      touched()
    }

    // Plain wheel keeps scrolling the story; Ctrl + wheel (and trackpad pinch,
    // which Chrome reports as Ctrl + wheel) zooms.
    const onWheel = (event) => {
      if (!event.ctrlKey) return
      event.preventDefault()
      const pixels = event.deltaY * (event.deltaMode === 1 ? 40 : 1) // line-based wheels report lines
      orbit.zoom = clamp(orbit.zoom * Math.exp(pixels * WHEEL_ZOOM), ZOOM_MIN, ZOOM_MAX)
      touched()
    }

    // Scrolling hands the camera back to the scroll story.
    const onScroll = () => {
      if (!orbit.active) orbit.returning = true
    }

    zone.addEventListener('pointerdown', onDown)
    zone.addEventListener('pointermove', onMove)
    zone.addEventListener('pointerup', onUp)
    zone.addEventListener('pointercancel', onUp)
    zone.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      zone.removeEventListener('pointerdown', onDown)
      zone.removeEventListener('pointermove', onMove)
      zone.removeEventListener('pointerup', onUp)
      zone.removeEventListener('pointercancel', onUp)
      zone.removeEventListener('wheel', onWheel)
      window.removeEventListener('scroll', onScroll)
    }
  }, [zoneRef, orbit])

  return orbit
}
