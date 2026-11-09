import { ContactShadows, useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { BURGER_MODEL_URL, DRACO_DECODER_PATH, ROOT_NAME } from '@/lib/models'
import { HANDOFF_AT, LANDING_BEATS } from '@/sections/home/story/storyBeats'

gsap.registerPlugin(ScrollTrigger)

const TEXTURE_SLOTS = ['map', 'normalMap', 'roughnessMap']
const HERO_HEIGHT_SHARE = 0.6 // the hero burger fills ~56 % of the screen height (reference)
const HERO_AIM_DROP = 0.006   // aim slightly below the centre: the burger sits a little higher, clear of the CTA
const HERO_LIFT = 0.012       // the hero burger floats this far (m) above its ground shadow
// In the "All" cuisine tile the burger's projected bounding box is this share of the tile image's
// height: sized to the burger in the All illustration (public/cuisines/all.webp), which takes over.
export const TILE_FILL = 0.61
const TURN = Math.PI * 2
const smootherstep = (t) => t * t * t * (t * (t * 6 - 15) + 10)

/**
 * The 3D side of the homepage scroll story. The master timeline (owned by
 * BurgerStorySection, beats in storyBeats.js) arrives as `timeline`; this scene adds the
 * burger and camera tweens to it, so hero, explosion, reassembly and landing are one
 * continuous, scrubbed timeline (scrolling up plays everything backwards exactly):
 *   0–1    hero         assembled burger, idle turn + float
 *   1–3    explode      parts travel from assembled_z to exploded_z (top bun first)
 *   3–7    showcase     camera frames beef, cheddar, vegetables, brioche
 *   7–8.6  reassemble   the same parts return to assembled_z, camera pulls back
 *   8.6–   landing      handoff.p 0 → 1: the same burger shrinks into the "All" tile
 */
export default function BurgerStory({ storyRef, timeline, tier, reducedMotion, orbit, handoff }) {
  const { scene } = useGLTF(BURGER_MODEL_URL, DRACO_DECODER_PATH, false)
  const gl = useThree((state) => state.gl)
  const turn = useRef()   // scroll-controlled rotation
  const idle = useRef()   // time-based idle turn + float
  const idleUser = useRef(1) // 0 while the user rotates, back to 1 after a quiet moment
  // Camera rig, animated by the timeline and read every frame (never React state):
  // frameH / frameW = how much of the scene (metres) must fit the view; targetY = where it looks.
  // Hero view: nearly front-on (azimuth), camera ~11° above the burger's centre so the bun top shows.
  const rig = useRef({ frameH: 0.14, frameW: 0.135, azimuth: -0.16, elevation: 0.19, targetY: 0.069, idle: 1, lift: HERO_LIFT })
  // Scratch objects for measuring where the burger is on screen during the handoff.
  const measure = useRef({ root: null, box: new THREE.Box3(), corner: new THREE.Vector3() })
  const landing = useRef({ from: null }) // idle angle when the landing started (scroll-reversible)

  useLayoutEffect(() => {
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    scene.traverse((node) => {
      if (!node.isMesh) return
      node.castShadow = tier.shadows
      node.receiveShadow = tier.shadows
      for (const material of [node.material].flat()) {
        for (const slot of TEXTURE_SLOTS) if (material[slot]) material[slot].anisotropy = anisotropy
      }
    })

    // Parts and their metadata straight from the GLB.
    const root = scene.getObjectByName(ROOT_NAME)
    const parts = root.children.map((object) => ({
      object,
      name: object.name,
      index: object.userData.stack_index,
      assembled: object.userData.assembled_z,
      exploded: object.userData.exploded_z,
    }))
    const byName = Object.fromEntries(parts.map((p) => [p.name, p]))
    const at = (name) => byName[name].exploded            // showcase targets = real exploded heights
    // Measured in the model's own space: the idle float/turn groups must not leak in
    // (their transforms depend on whether a frame has already run, which varies per load).
    scene.updateWorldMatrix(true, true)
    const box = new THREE.Box3().setFromObject(root).applyMatrix4(scene.matrixWorld.clone().invert())
    const assembledCentre = box.getCenter(new THREE.Vector3()).y + HERO_LIFT // the hero burger floats HERO_LIFT up
    const assembledHeight = box.getSize(new THREE.Vector3()).y
    const explodedTop = Math.max(...parts.map((p) => p.exploded)) + 0.03
    const r = rig.current
    if (import.meta.env.DEV) window.__FAAH_RIG__ = { rig: r, idle: idle.current, turn: turn.current, orbit } // debugging aid
    r.frameH = assembledHeight
    r.targetY = assembledCentre - HERO_AIM_DROP

    measure.current.root = root

    if (!timeline) return undefined
    const ctx = gsap.context(() => {
      const tl = timeline

      // ---- Hero -> explode (top bun first), camera pulls back ----
      tl.to(r, { idle: 0, lift: 0, duration: 1 }, 1)
      for (const part of parts) {
        const delay = (10 - part.index) * 0.06 // 01 top bun first ... 10 bottom bun last
        tl.to(part.object.position, { y: part.exploded, duration: 1.6 }, 1.1 + (0.54 - delay))
      }
      tl.to(r, { frameH: explodedTop * 0.66, targetY: explodedTop / 2, azimuth: -0.12, elevation: 0.1, duration: 2 }, 1)
      tl.to(turn.current.rotation, { y: 0.35, duration: 2 }, 1)

      // ---- Ingredient showcase (gentle dolly + orbit, one subject per beat) ----
      const shots = [
        { y: at('07_Patty_Upper'), frame: 0.085, azimuth: 0.35, elevation: 0.2 },
        { y: at('06_Cheese_Upper'), frame: 0.08, azimuth: -0.3, elevation: 0.32 },
        { y: (at('04_Tomato') + at('03_Lettuce') + at('05_Onion')) / 3, frame: 0.095, azimuth: 0.4, elevation: 0.28 },
        { y: at('01_Top_Bun'), frame: 0.085, azimuth: -0.25, elevation: 0.36 },
      ]
      shots.forEach((shot, k) => {
        tl.to(r, { targetY: shot.y, frameH: shot.frame, frameW: shot.frame, azimuth: shot.azimuth, elevation: shot.elevation, duration: 0.8 }, 3 + k)
      })
      tl.to(turn.current.rotation, { y: 0.9, duration: 4, ease: 'none' }, 3)

      // ---- Reassembly (bottom first, so the stack closes upwards), done by HANDOFF_AT ----
      for (const part of parts) {
        const delay = (10 - part.index) * 0.04
        tl.to(part.object.position, { y: part.assembled, duration: 1.2 }, 7 + delay)
      }
      tl.to(r, { frameH: assembledHeight * 1.05, frameW: 0.135, elevation: 0.19, azimuth: -0.2, targetY: assembledCentre - HERO_AIM_DROP, duration: 1.5 }, 7)
      tl.to(turn.current.rotation, { y: Math.PI * 2, duration: 1.5 }, 7)

      // ---- Landing: no hero replay; the camera eases to the tile's view as the burger flies in ----
      tl.to(r, { azimuth: -0.06, elevation: 0.26, duration: LANDING_BEATS, ease: 'power1.inOut' }, HANDOFF_AT)

      // Bring the new tweens up to the current scroll position (the page may not be at the top).
      const time = tl.time()
      tl.time(0, true).time(time, true)
    })
    const track = storyRef.current
    track.dataset.model = 'ready' // model loaded and its tweens are in the timeline (tests, diagnostics)

    return () => {
      delete track.dataset.model
      ctx.revert() // removes these tweens from the timeline and restores every value
    }
  }, [scene, gl, tier.shadows, storyRef, reducedMotion, orbit, timeline])

  useFrame((state, delta) => {
    const r = rig.current
    const dt = Math.min(delta, 0.05)
    // ---- Manual orbit (drag / pinch), layered on top of the scripted camera ----
    const o = orbit
    if (!o.active) {
      // Momentum after release, slowing down naturally.
      o.az += o.vAz * dt
      o.el += o.vEl * dt
      const decay = Math.exp(-3.2 * dt)
      o.vAz *= decay
      o.vEl *= decay
    }
    if (o.returning) {
      // The page scrolled: ease back to the scripted shot (shortest way round).
      o.az = THREE.MathUtils.euclideanModulo(o.az + Math.PI, Math.PI * 2) - Math.PI
      o.vAz = 0
      o.vEl = 0
      o.az = THREE.MathUtils.damp(o.az, 0, 4, dt)
      o.el = THREE.MathUtils.damp(o.el, 0, 4, dt)
      o.zoom = THREE.MathUtils.damp(o.zoom, 1, 4, dt)
      if (Math.abs(o.az) + Math.abs(o.el) + Math.abs(o.zoom - 1) < 1e-3) {
        o.az = 0
        o.el = 0
        o.zoom = 1
        o.returning = false
      }
    }
    // Tilt limits: from a little below to almost straight down; never flips over.
    const elevation = THREE.MathUtils.clamp(r.elevation + o.el, -0.3, 1.32)
    o.el = elevation - r.elevation
    const azimuth = r.azimuth + o.az

    // Idle turn + float (hero and final scenes only, off for reduced motion), paused while the
    // user is rotating or the view is still gliding, back ~2.5 s after the last touch.
    const quiet = !o.active && performance.now() - o.lastInput > 2500 && Math.abs(o.vAz) + Math.abs(o.vEl) < 0.05
    idleUser.current = THREE.MathUtils.damp(idleUser.current, quiet ? 1 : 0, quiet ? 1.2 : 8, dt)
    const p = Math.min(1, handoff.p)
    const isLanding = p > 0
    const weight = reducedMotion || isLanding ? 0 : r.idle * idleUser.current
    const land = landing.current
    if (isLanding) {
      // Turn to a whole turn (the pose of the tile's still), driven by the scroll so it reverses exactly.
      if (land.from === null) land.from = idle.current.rotation.y
      const rest = Math.round(land.from / TURN) * TURN
      idle.current.rotation.y = land.from + (rest - land.from) * smootherstep(p)
      o.returning = true
    } else if (land.from !== null) {
      idle.current.rotation.y = land.from // scrolled back above the landing
      land.from = null
    }
    idle.current.rotation.y += dt * 0.22 * weight
    idle.current.position.y = r.lift + Math.sin(state.clock.elapsedTime * 1.15) * 0.0016 * weight

    // Distance that fits the requested frame: by height on wide screens, by width on narrow ones.
    const camera = state.camera
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const portrait = camera.aspect < 1
    const byHeight = r.frameH / (HERO_HEIGHT_SHARE * 2 * tan)
    const byWidth = r.frameW / ((portrait ? 0.78 : 0.4) * 2 * tan * camera.aspect)
    const radius = (Math.max(byHeight, byWidth) + 0.05) * o.zoom

    const place = (zoom) => {
      camera.position.set(
        Math.sin(azimuth) * Math.cos(elevation) * radius * zoom,
        r.targetY + Math.sin(elevation) * radius * zoom,
        Math.cos(azimuth) * Math.cos(elevation) * radius * zoom,
      )
      camera.lookAt(0, r.targetY, 0)
      camera.updateMatrixWorld()
    }
    if (camera.view?.enabled) camera.clearViewOffset()
    place(1)

    // ---- Handoff: fly into the "All" cuisine tile ----
    const tile = isLanding && handoff.target?.current
    if (tile && measure.current.root) {
      const { width, height } = state.size
      const canvasBox = gl.domElement.getBoundingClientRect()
      const tileBox = tile.getBoundingClientRect()
      const from = screenBox(camera, measure.current, width, height)    // where the burger is now
      const e = smootherstep(p)
      const want = {
        x: THREE.MathUtils.lerp(from.x, tileBox.left + tileBox.width / 2 - canvasBox.left, e),
        y: THREE.MathUtils.lerp(from.y, tileBox.top + tileBox.height / 2 - canvasBox.top, e),
        h: THREE.MathUtils.lerp(from.h, tileBox.height * TILE_FILL, e),
      }
      place(from.h / Math.max(1, want.h))                                  // size: move the camera back
      const now = screenBox(camera, measure.current, width, height)
      camera.setViewOffset(width, height, now.x - want.x, now.y - want.y, width, height) // position: shift the view
    }
    if (import.meta.env.DEV && window.__FAAH_RIG__) window.__FAAH_RIG__.camera = camera // debugging aid
  })

  return (
    <>
      <group ref={turn}>
        <group ref={idle}>
          <primitive object={scene} />
        </group>
      </group>
      <ContactShadows position={[0, 0.0002, 0]} scale={0.46} far={0.3} blur={2.2} opacity={0.68}
        color="#4a250c" resolution={tier.contactShadowResolution} frames={1} />
    </>
  )
}

/** Screen-space centre and height (CSS px) of the burger's bounding box, without view offset. */
function screenBox(camera, m, width, height) {
  m.box.setFromObject(m.root)
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (let i = 0; i < 8; i++) {
    m.corner.set(i & 1 ? m.box.max.x : m.box.min.x, i & 2 ? m.box.max.y : m.box.min.y, i & 4 ? m.box.max.z : m.box.min.z)
    m.corner.project(camera)
    minX = Math.min(minX, m.corner.x); maxX = Math.max(maxX, m.corner.x)
    minY = Math.min(minY, m.corner.y); maxY = Math.max(maxY, m.corner.y)
  }
  return { x: ((minX + maxX) / 2 + 1) / 2 * width, y: (1 - (minY + maxY) / 2) / 2 * height, h: (maxY - minY) / 2 * height }
}

useGLTF.preload(BURGER_MODEL_URL, DRACO_DECODER_PATH, false)
