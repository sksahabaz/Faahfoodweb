/**
 * Glossy silk-ribbon geometry shared by the scroll story backdrop and the page background.
 * A ribbon follows a cubic Bezier centreline (viewBox units):
 *   { pts: [[x,y] x4], width: [start, end], twist: ripples along the length, tone: 'deep' | 'light' }
 * ribbonPaths(ribbon, grow 0..1, phase) returns the SVG paths of its body, sheen, fold and edge.
 */

export const TONES = {
  //        body stops [offset, colour, opacity]                                  sheen      fold       edge
  deep: { body: [[0, '#eb7624', 1], [0.4, '#ef8a36', 0.94], [0.75, '#f4a65c', 0.62], [1, '#f8c99a', 0]],
    sheen: '#ffd49a', fold: '#cc5418', edge: '#fff2dc' },
  light: { body: [[0, '#f29448', 0.9], [0.5, '#f5ad6c', 0.62], [1, '#f9d3ac', 0]],
    sheen: '#ffe2b8', fold: '#dc7430', edge: '#fff6e8' },
}

const bez = (p, t, i) => {
  const u = 1 - t
  return u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]
}
const bezD = (p, t, i) => {
  const u = 1 - t
  return 3 * u * u * (p[1][i] - p[0][i]) + 6 * u * t * (p[2][i] - p[1][i]) + 3 * t * t * (p[3][i] - p[2][i])
}
const fmt = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`
// Catmull-Rom through the points, as cubic Béziers.
function smooth(points, start = 'M') {
  let d = `${start}${fmt(points[0])}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${fmt(c1)} ${fmt(c2)} ${fmt(p2)}`
  }
  return d
}
const band = (a, b) => `${smooth(a)}${smooth([...b].reverse(), 'L')}Z`

/** Ribbon outline for a given growth (0 = hidden at the edge, 1 = full length) and ripple phase. */
export function ribbonPaths(r, grow, phase) {
  const N = 34
  const offsets = { top: -0.5, sheenIn: -0.08, foldIn: 0.16, bottom: 0.5 }
  const rows = Object.fromEntries(Object.keys(offsets).map((k) => [k, []]))
  let flip = 0
  for (let s = 0; s <= N; s++) {
    const local = s / N
    const t = grow * local
    const x = bez(r.pts, t, 0)
    const y = bez(r.pts, t, 1)
    const dx = bezD(r.pts, t, 0)
    const dy = bezD(r.pts, t, 1)
    const len = Math.hypot(dx, dy) || 1
    let nx = -dy / len
    let ny = dx / len
    if (!flip) flip = ny >= 0 ? 1 : -1 // normals point down the screen: "top" edge = -n
    nx *= flip
    ny *= flip
    const tip = Math.min(1, (1 - local) * 4.5)                           // tapers to a point
    const ripple = 0.8 + 0.2 * Math.cos(Math.PI * 2 * r.twist * t - phase) // silk gently folding
    const narrowing = 1 - Math.pow(t, 1.4)                                  // even taper along the length
    const w = (r.width[1] + (r.width[0] - r.width[1]) * narrowing) * tip * tip * (3 - 2 * tip) * ripple
    const wave = Math.sin(Math.PI * 2 * 1.1 * t - phase * 0.8) * 12 * t  // the free end sways more
    for (const [k, o] of Object.entries(offsets)) rows[k].push([x + nx * (wave + o * w), y + ny * (wave + o * w)])
  }
  return {
    body: band(rows.top, rows.bottom),
    sheen: band(rows.top, rows.sheenIn),
    fold: band(rows.foldIn, rows.bottom),
    edge: smooth(rows.top),
  }
}
