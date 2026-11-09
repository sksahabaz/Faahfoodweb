import { Outlet, ScrollRestoration, useMatches } from 'react-router'
import SmoothScroll from '@/animations/SmoothScroll'
import { useSessionRefresh } from '@/hooks/useSession'

// Shared shell for every page. A route can opt out of Lenis smooth scrolling
// with `handle: { smoothScroll: false }` (the homepage does).
export default function RootLayout() {
  const matches = useMatches()
  const smoothScroll = !matches.some((match) => match.handle?.smoothScroll === false)
  useSessionRefresh()

  return (
    <SmoothScroll enabled={smoothScroll}>
      <main>
        <Outlet />
      </main>
      <ScrollRestoration />
    </SmoothScroll>
  )
}
