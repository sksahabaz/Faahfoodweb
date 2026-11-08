import { Outlet, ScrollRestoration } from 'react-router'

// Shared shell for every page (navbar and footer get added with the new design).
export default function RootLayout() {
  return (
    <>
      <main>
        <Outlet />
      </main>
      <ScrollRestoration />
    </>
  )
}
