import '@fontsource/anton/400.css'          // giant condensed BURGER
import '@fontsource/kaushan-script/400.css' // FAah!! logo
import { PerformanceMonitor, useProgress } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createRef, memo, Suspense, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { detectTier } from '@/lib/device'
import BurgerStory from '@/three/BurgerStory'
import StudioLights from '@/three/StudioLights'
import { DecorBack, DecorFront } from './Decor'
import { ExplodedBack, ExplodedFront } from './ExplodedBackdrop'
import { addBackdropTimeline } from './backdropTimeline'
import { HANDOFF_AT, LANDING_BEATS, LANDING_END, STORY_END } from './storyBeats'
import { useOrbitInput } from './useOrbitInput'
import './story.css'

gsap.registerPlugin(ScrollTrigger)

const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor"
    strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

const Loader = memo(function Loader() {
  const { active, progress } = useProgress()
  if (!active) return null
  return (
    <div className="story-loader" role="status">
      <div className="story-loader-bar"><span style={{ width: `${progress}%` }} /></div>
      <p>Loading burger… {Math.round(progress)}%</p>
    </div>
  )
})

/**
 * The cinematic burger, ONE continuous scroll story (beats in ./storyBeats.js):
 * hero → explode → ingredient close-ups → reassembly → the same 3D burger shrinks and
 * flies into the "All" cuisine tile → the restaurant homepage scrolls on normally.
 *
 * This component owns the single master timeline (scrubbed by one ScrollTrigger from the
 * top of the story track to the cuisine section reaching LANDING_END). It animates the DOM
 * layers; the 3D scene (BurgerStory) adds the burger and camera tweens to the same timeline
 * once the model has loaded. Everything here is position: fixed while the story plays; after
 * the landing the layers are hidden and the canvas stops rendering.
 *
 *   tileRef / tileDiscRef  the "All" tile image and its circle (where the burger lands)
 *   nextSectionRef         the cuisine section (its scroll-in drives the landing)
 *   onOrderNow             Order Now button (scrolls to the restaurant listings)
 *   onContentMode          true once the page content has taken over (solid navigation)
 */
export default function BurgerStorySection({ tileRef, tileDiscRef, nextSectionRef, onOrderNow, onContentMode }) {
  const tier = useMemo(() => detectTier(), [])
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const [dpr, setDpr] = useState(tier.dpr[1])
  const [rendering, setRendering] = useState(true) // false once the burger sits in its tile
  const [timeline, setTimeline] = useState(null)   // the master timeline, shared with the 3D scene
  const storyRef = useRef()
  const grabRef = useRef() // area over the burger: drag here to rotate, scroll everywhere else
  const orbit = useOrbitInput(grabRef)
  // DOM pieces the timeline animates: one stable set of refs, so nothing re-renders while scrolling.
  const [ui] = useState(() => Object.fromEntries(
    ['bigWord', 'heroCta', 'hint', 'decorBack', 'decorFront', 'glow', 'ground',
      'capBeef', 'capCheese', 'capVeg', 'capBun', 'xbBack', 'xbFront',
      'layerBack', 'layerStage', 'layerFront', 'layerUi']
      .map((name) => [name, createRef()]),
  ))
  // Landing progress (0 → 1), tweened by the master timeline and read every frame by the 3D scene.
  const [handoff] = useState(() => ({ p: 0, target: tileRef }))

  useLayoutEffect(() => {
    const next = nextSectionRef.current
    if (!next) return undefined
    let rendered = true
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: storyRef.current,
          start: 'top top',
          endTrigger: next,
          end: `top ${LANDING_END * 100}%`,
          scrub: reducedMotion ? true : 1, // 1 s of smoothing; reduced motion follows the scroll exactly
          invalidateOnRefresh: true,
        },
        // Stop rendering the 3D scene once the burger has landed (and resume when scrolling back).
        onUpdate: () => {
          const landed = tl.progress() >= 0.999
          if (landed === rendered) setRendering((rendered = !landed))
        },
      })

      // ---- Hero -> explode: hero elements out, ingredients drift away ----
      tl.to(ui.hint.current, { autoAlpha: 0, duration: 0.3 }, 0.1)
      tl.to(ui.heroCta.current, { autoAlpha: 0, y: -30, duration: 0.6 }, 0.8)
      tl.to(ui.bigWord.current, { autoAlpha: 0, scale: 1.12, duration: 1.4 }, 1.0)
      tl.to(ui.decorBack.current, { scale: 1.25, autoAlpha: 0, duration: 1.6 }, 1.0)
      tl.to(ui.decorFront.current, { scale: 1.4, autoAlpha: 0, duration: 1.2 }, 0.9)
      tl.to(ui.glow.current, { scale: 1.3, autoAlpha: 0.5, duration: 1.6 }, 1.0)
      tl.to(ui.ground.current, { autoAlpha: 0, duration: 0.8 }, 1.0)
      // Exploded backdrop (ribbons, doodles, ingredients): in as the burger opens, out before it closes.
      addBackdropTimeline(tl, ui.xbBack.current, ui.xbFront.current, { enter: 1.3, exit: 6.9 })

      // ---- Showcase captions (the camera moves are added by the 3D scene) ----
      const captions = [ui.capBeef, ui.capCheese, ui.capVeg, ui.capBun]
      captions.forEach((caption, k) => {
        tl.fromTo(caption.current, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.35 }, 3 + k + 0.35)
        tl.to(caption.current, { autoAlpha: 0, y: -30, duration: 0.3 }, 3 + k + 0.85)
      })

      // ---- Landing: straight after reassembly, the same burger flies into the "All" tile ----
      const L = LANDING_BEATS
      tl.fromTo(handoff, { p: 0 }, { p: 1, duration: L, ease: 'none' }, HANDOFF_AT)
      tl.set(grabRef.current, { autoAlpha: 0 }, HANDOFF_AT) // no dragging over the page content
      tl.to([ui.layerBack.current, ui.layerFront.current, ui.layerUi.current],
        { autoAlpha: 0, duration: 0.4 * L, ease: 'power1.out' }, HANDOFF_AT)
      if (tileDiscRef.current) { // the All circle forms around the arriving burger...
        tl.fromTo(tileDiscRef.current, { autoAlpha: 0, scale: 0.55 },
          { autoAlpha: 1, scale: 1, duration: 0.4 * L, ease: 'power2.out' }, HANDOFF_AT + 0.55 * L)
      }
      if (tileRef.current) { // ...and the tile's still takes over in exactly the same pose
        tl.fromTo(tileRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 * L, ease: 'none' }, HANDOFF_AT + 0.92 * L)
      }
      tl.to(ui.layerStage.current, { autoAlpha: 0, duration: 0.08 * L, ease: 'none' }, HANDOFF_AT + 0.92 * L)
      tl.set({}, {}, STORY_END) // fixed length: the 3D scene adds its tweens inside it

      // Solid navigation once the page content is on screen.
      ScrollTrigger.create({ trigger: next, start: 'top 65%', onEnter: () => onContentMode?.(true), onLeaveBack: () => onContentMode?.(false) })
      setTimeline(tl)
    })
    return () => {
      setTimeline(null)
      ctx.revert() // kills the ScrollTrigger and restores every animated value
    }
  }, [nextSectionRef, tileRef, tileDiscRef, handoff, ui, onContentMode, reducedMotion])

  return (
    <section className="home-story" aria-label="The FAah!! double cheeseburger">
      {/* ---------- Behind the burger ---------- */}
      <div className="story-layer story-back" ref={ui.layerBack} aria-hidden="true">
        <div className="glow" ref={ui.glow} />
        <div className="ground" ref={ui.ground} />
        <div className="big-word" ref={ui.bigWord}>
          {'BURGER'.split('').map((letter, i) => <span key={i} className={`l${i}`}>{letter}</span>)}
        </div>
        {/* Exploded-burger backdrop: ribbons, doodles, ingredients (shown while the burger is open) */}
        <ExplodedBack ref={ui.xbBack} reducedMotion={reducedMotion} />
        <DecorBack ref={ui.decorBack} reducedMotion={reducedMotion} storyRef={storyRef} />
        <div className="vignette" />
      </div>

      {/* ---------- 3D burger ---------- */}
      <div className="story-stage" ref={ui.layerStage}>
        <Canvas
          frameloop={rendering ? 'always' : 'never'}
          shadows={tier.shadows ? 'percentage' : false}
          dpr={dpr}
          camera={{ fov: 36, near: 0.01, far: 20, position: [-0.08, 0.16, 0.42] }} // ~50 mm feel: real perspective
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.NeutralToneMapping
            gl.toneMappingExposure = 1.38 // bright, appetising food-photo exposure
          }}
        >
          <PerformanceMonitor onDecline={() => setDpr(tier.dpr[0])} onIncline={() => setDpr(tier.dpr[1])}
            flipflops={3} onFallback={() => setDpr(1)} />
          <StudioLights tier={tier} keyIntensity={3.2} envScale={0.78} />
          <Suspense fallback={null}>
            <BurgerStory storyRef={storyRef} timeline={timeline} tier={tier} reducedMotion={reducedMotion} orbit={orbit} handoff={handoff} />
          </Suspense>
        </Canvas>
        <Loader />
      </div>

      {/* Invisible drag area over the burger (rotate / pinch); outside it the page scrolls normally. */}
      <div className="grab-zone" ref={grabRef} aria-label="Drag to rotate the burger" role="img" />

      {/* ---------- In front of the burger ---------- */}
      <div className="story-layer story-front" ref={ui.layerFront} aria-hidden="true">
        <ExplodedFront ref={ui.xbFront} reducedMotion={reducedMotion} />
        <DecorFront ref={ui.decorFront} reducedMotion={reducedMotion} storyRef={storyRef} />
      </div>

      <div className="story-layer story-ui" ref={ui.layerUi}>
        <div className="hero-cta" ref={ui.heroCta}>
          <a className="order-pill" href="#restaurants" onClick={(event) => { event.preventDefault(); onOrderNow() }}>
            Order Now <span className="order-arrow"><Arrow /></span>
          </a>
        </div>
        <div className="scroll-hint" ref={ui.hint} aria-hidden="true">
          <span>Scroll to explore</span>
          <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>

        {/* Showcase captions */}
        <p className="caption" ref={ui.capBeef}><small>01</small>Flame-grilled beef</p>
        <p className="caption" ref={ui.capCheese}><small>02</small>Melted cheddar</p>
        <p className="caption" ref={ui.capVeg}><small>03</small>Garden fresh</p>
        <p className="caption" ref={ui.capBun}><small>04</small>Toasted brioche</p>
      </div>

      {/* Scroll track: hero, explode, 2 × showcase, reassemble, landing (TRACK_SCREENS screens) */}
      <div className="story-track" ref={storyRef} id="top">
        <div aria-label="Hero" /><div aria-label="Exploded burger" />
        <div aria-label="Ingredients" /><div aria-label="Ingredients" />
        <div aria-label="Reassembly" /><div aria-label="Landing" />
      </div>
    </section>
  )
}
