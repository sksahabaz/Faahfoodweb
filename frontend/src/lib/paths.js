/**
 * Where the app lives, worked out at runtime so ONE build works everywhere:
 *   Docker / Render   → served from the Tomcat ROOT context      "/"
 *   Eclipse Tomcat    → served from the context path            "/Faahfoodweb/"
 *   Vite dev server   → "/" (the dev proxy forwards /api and /images to Tomcat)
 * HomeController sends index.html with <base href="{context path}/">, so the document's
 * base URL is the application root on every React page (/, /restaurants/6, ...).
 * Without that tag (index.html opened directly) the page's own folder is the root.
 */
export const APP_BASE = import.meta.env.DEV
  ? new URL('/', window.location.origin)
  : new URL('.', document.baseURI)

/** Absolute URL of a path inside the application, e.g. appUrl('cart') → /Faahfoodweb/cart. */
export function appUrl(path = '') {
  return new URL(String(path).replace(/^\/+/, ''), APP_BASE).href
}

/** Router basename: the context path without the trailing slash ("" at the root). */
export const ROUTER_BASENAME = APP_BASE.pathname.replace(/\/+$/, '') || '/'

/**
 * Images from the database (restaurants, menu items): absolute URLs as they are,
 * relative ones against the application.
 */
export function resolveImage(url) {
  if (!url) return null
  try {
    return new URL(url, APP_BASE).href
  } catch {
    return null
  }
}
