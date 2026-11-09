import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { scrollToTarget } from '@/animations/scroll'
import PageBackdrop from '@/components/decor/PageBackdrop'
import SiteFooter from '@/components/layout/SiteFooter'
import SiteNav from '@/components/layout/SiteNav'
import { useCuisineIndex } from '@/hooks/useCuisineIndex'
import { useRestaurants } from '@/hooks/useRestaurants'
import { ALL } from '@/lib/cuisines'
import { hasWebGL } from '@/lib/device'
import CuisineSection from '@/sections/home/CuisineSection'
import { RestaurantsSection, TopRestaurants } from '@/sections/home/RestaurantsSection'
import { StaticHero, StoryErrorBoundary } from '@/sections/home/StaticHero'
import '@/sections/home/story/story.css'

// three.js, React Three Fiber and the story are a separate chunk: the rest of the page
// (navigation, cuisines, restaurants) does not wait for it.
const BurgerStorySection = lazy(() => import('@/sections/home/story/BurgerStorySection'))

/**
 * The FAah!! FOOD homepage:
 *   1. cinematic 3D burger (hero → explode → close-ups → reassembly → order scene)
 *   2. the burger lands in the "All" cuisine tile
 *   3. cuisines, top restaurants and all restaurants from the Java API
 */
export default function HomePage() {
  const webgl = useMemo(() => hasWebGL(), [])
  const [storyFailed, setStoryFailed] = useState(false)
  const [contentMode, setContentMode] = useState(!webgl) // solid navigation once the content is on screen
  const [cuisine, setCuisine] = useState(ALL)
  const [query, setQuery] = useState('')
  const cuisinesRef = useRef()
  const allTileRef = useRef()
  const allDiscRef = useRef()
  const searchRef = useRef()

  const restaurants = useRestaurants()
  const index = useCuisineIndex(restaurants.data)

  useEffect(() => {
    document.title = 'FAah!! FOOD | Order from your favourite restaurants'
  }, [])

  // The page grows when the restaurants, menus and images arrive: re-measure the scroll triggers.
  const pageRef = useRef()
  useEffect(() => {
    let timer = 0
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150)
    })
    observer.observe(pageRef.current)
    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  // Arriving with #cuisines / #restaurants (from the menu page's navigation or back button):
  // jump there once the restaurants have loaded and the story above has taken its full height.
  const { hash } = useLocation()
  const restaurantsReady = restaurants.isSuccess
  useEffect(() => {
    const id = hash.replace('#', '')
    if (!id || !restaurantsReady) return undefined
    let frame = 0
    const started = performance.now()
    const jump = () => {
      const target = document.getElementById(id)
      const storyReady = !webgl || document.querySelector('.story-track')
      if (target && (storyReady || performance.now() - started > 2500)) {
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' })
      } else frame = requestAnimationFrame(jump)
    }
    frame = requestAnimationFrame(jump)
    return () => cancelAnimationFrame(frame)
  }, [hash, restaurantsReady, webgl])

  const scrollToId = useCallback((id) => {
    if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' })
    else scrollToTarget(`#${id}`)
  }, [])
  const orderNow = useCallback(() => scrollToId('restaurants'), [scrollToId])
  const search = useCallback(() => {
    scrollToId('restaurants')
    window.setTimeout(() => searchRef.current?.focus({ preventScroll: true }), 700)
  }, [scrollToId])
  const onStoryError = useCallback(() => {
    setStoryFailed(true)
    setContentMode(true)
  }, [])

  const staticHero = <StaticHero onOrderNow={orderNow} />
  return (
    <div className="faah-home" ref={pageRef}>
      <div className="home-bg" aria-hidden="true" />
      <SiteNav solid={contentMode || storyFailed} onNavigate={scrollToId} onSearch={search} />

      {webgl ? (
        <StoryErrorBoundary fallback={staticHero} onError={onStoryError}>
          <Suspense fallback={staticHero}>
            <BurgerStorySection tileRef={allTileRef} tileDiscRef={allDiscRef} nextSectionRef={cuisinesRef}
              onOrderNow={orderNow} onContentMode={setContentMode} />
          </Suspense>
        </StoryErrorBoundary>
      ) : staticHero}

      {/* Page content on the FAah!! background (wash, ribbons, floating ingredients). Its own
          layer (z 1): above the story's back layers, below the 3D canvas that lands in "All". */}
      <div className="relative z-[1]">
        <PageBackdrop />
        <CuisineSection ref={cuisinesRef} tileRef={allTileRef} tileDiscRef={allDiscRef} selected={cuisine} onSelect={setCuisine}
          restaurants={restaurants.data} index={index} />
        <TopRestaurants restaurants={restaurants} />
        <RestaurantsSection restaurants={restaurants} index={index} cuisine={cuisine} onCuisine={setCuisine}
          query={query} onQuery={setQuery} searchRef={searchRef} />
        <SiteFooter onNavigate={scrollToId} />
      </div>
    </div>
  )
}
