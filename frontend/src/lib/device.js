// Picks rendering settings for the current device.
// Force a tier for testing with ?tier=mobile or ?tier=desktop.

export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

const TIERS = {
  desktop: {
    name: 'desktop',
    dpr: [1, 2],          // sharp on retina screens
    shadows: true,        // real-time self-shadowing between layers
    shadowMapSize: 2048,
    envResolution: 256,
    contactShadowResolution: 1024,
    preferredModel: 'draco',     // benchmark: same parse time, 63 % smaller download
  },
  mobile: {
    name: 'mobile',
    dpr: [1, 1.5],        // fewer pixels: big win on phones
    shadows: false,       // no shadow-map pass; the soft contact shadow stays
    shadowMapSize: 0,
    envResolution: 128,
    contactShadowResolution: 256,
    preferredModel: 'draco',       // 2.1 MB instead of 5.8 MB over mobile data
  },
}

export function detectTier() {
  const forced = new URLSearchParams(window.location.search).get('tier')
  if (forced && TIERS[forced]) return TIERS[forced]

  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 700
  const fewCores = (navigator.hardwareConcurrency || 8) <= 4
  const lowMemory = navigator.deviceMemory !== undefined && navigator.deviceMemory <= 4
  return coarsePointer || smallScreen || fewCores || lowMemory ? TIERS.mobile : TIERS.desktop
}
