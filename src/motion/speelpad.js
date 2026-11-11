// .ig-bg-speelpad: the game path, drawn with the pencil line while you scroll (scrubbed, not played).
// the yellow InnerGames pawn (pawn.js) walks along it, leans a little in the direction it walks,
// and hops once at every stop.
// every child with [data-speelpad-stop] gets a stop square in the margin next to it. between stops the
// line slips behind the bottom corner of the card and comes out in the gap, so it feels part of the page.
// on a phone it's a simple line along the left edge.
//
// TODO: replace with drawing. the wobble below fakes a hand-drawn line until Damian's own path exists.

import { isReduced, onReducedChange } from './prefs.js'
import { loadMark, markMarkup } from './pencil.js'
import { createPawn } from './pawn.js'

const NS = 'http://www.w3.org/2000/svg'
const HOLD = 150 // px of scrolling the pawn waits at each stop
const HEAD = 0.6 // the pawn walks at 60% of the screen height

function seeded(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

// smooth curve through points (catmull-rom as cubic beziers). the control points are kept between lo
// and hi too: a curve never leaves its control points, so the line can't overshoot past the margin
function curve(pts, lo = -Infinity, hi = Infinity) {
  const cx = (x) => Math.max(lo, Math.min(hi, x))
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1 = [cx(p1[0] + (p2[0] - p0[0]) / 6), p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [cx(p2[0] - (p3[0] - p1[0]) / 6), p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d
}

function el(name, attrs, parent) {
  const n = document.createElementNS(NS, name)
  for (const k in attrs) n.setAttribute(k, attrs[k])
  parent?.appendChild(n)
  return n
}

const viewBoxOf = (mark) => mark.viewBox.split(/[\s,]+/).map(Number)

export function initSpeelpad(root) {
  const svg = el('svg', { class: 'ig-speelpad__svg', 'aria-hidden': 'true', focusable: 'false' })
  root.prepend(svg)

  let marks = null
  let path, pawn, stops = [], keys = [], zones = [], total = 0, lastStopLen = 0
  let active = false, raf = 0, zone = -1, alive = true

  function build() {
    if (!marks || !alive) return
    svg.textContent = ''
    const W = root.clientWidth
    const H = root.scrollHeight
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    svg.setAttribute('width', W)
    svg.setAttribute('height', H)

    const box = root.getBoundingClientRect()
    const blocks = [...root.querySelectorAll('[data-speelpad-stop]')].map((s) => {
      const r = s.getBoundingClientRect()
      // the stop sits at the height of the block's title, not at a fixed distance from its top
      const h = s.querySelector('h2, h3')?.getBoundingClientRect()
      const head = h ? h.top + h.height / 2 - box.top : r.top - box.top + 52
      return { top: r.top - box.top, bottom: r.bottom - box.top, left: r.left - box.left, right: r.right - box.left, head }
    })
    path = null
    if (!blocks.length) return

    const rnd = seeded(11)
    const wob = (n) => (rnd() - 0.5) * 2 * n
    // the path stays at least EDGE px from the screen edge, the pawn included. when the margin next to the
    // blocks is too small for that (a phone), there is no path: it would run through the content
    const EDGE = 24
    const room = Math.min(...blocks.map((b) => Math.min(b.left, W - b.right)))
    // the pawn shrinks a little on smaller margins (44px max), so it fits between the edge and the content
    const PAWN = Math.min(44, room - EDGE - 4)
    if (PAWN < 28) return
    const narrow = false
    // the pawn leans (photo tilt + up to 8deg in the walking direction), so its head reaches further
    // than half its width: about 0.8 of its size from the line
    const minX = EDGE + PAWN * 0.8
    const clampX = (x) => Math.max(minX, Math.min(W - minX, x))
    // stop i sits in the left margin for even i, the right margin for odd i
    const margin = (i) => {
      const b = blocks[i]
      return clampX(i % 2 === 0 ? b.left / 2 : b.right + (W - b.right) / 2)
    }

    // starts a little below the top, so the pawn (which stands on the line) stays inside the block
    const pts = [[margin(0) + wob(8), Math.min(64, blocks[0].top)]]
    const stopIdx = []
    blocks.forEach((b, i) => {
      const x = margin(i)
      pts.push([x + wob(3), b.head])
      stopIdx.push(pts.length - 1)
      const next = blocks[i + 1]
      if (narrow) {
        if (next) pts.push([x + wob(3), (b.bottom + next.top) / 2])
        return
      }
      // slip behind the bottom corner of this card...
      const behindX = i % 2 === 0 ? b.left + 40 + wob(10) : b.right - 40 + wob(10)
      pts.push([behindX, b.bottom - 34 + wob(8)])
      // ...and come out in the gap, heading for the other margin
      if (next) pts.push([clampX((behindX + margin(i + 1)) / 2 + wob(40)), (b.bottom + next.top) / 2 + wob(12)])
    })
    pts.push([margin(blocks.length - 1) + wob(8), H - 6])

    const d = curve(pts, minX, W - minX)
    const grain = el('g', { class: 'ig-pencil__grain' }, svg)
    path = el('path', { d, class: 'ig-speelpad__line' }, grain)
    total = path.getTotalLength()
    path.style.strokeDasharray = `${total} ${total}`

    const lenAt = (k) => {
      const tmp = el('path', { d: curve(pts.slice(0, k + 1), minX, W - minX) }, svg)
      const len = tmp.getTotalLength()
      tmp.remove()
      return len
    }
    const stopLen = stopIdx.map(lenAt)
    lastStopLen = stopLen[stopLen.length - 1]

    // the stops: a small boxy square, outline first, yellow with a drawn tick once the pawn gets there
    const size = narrow ? 14 : 22
    const [, , tw, th] = viewBoxOf(marks.tick)
    stops = stopIdx.map((k, i) => {
      const [x, y] = pts[k]
      const g = el('g', { class: 'ig-speelpad__stop', transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${wob(6).toFixed(1)})` }, svg)
      el('rect', { x: -size / 2, y: -size / 2, width: size, height: size, rx: narrow ? 3 : 4, class: 'ig-speelpad__square' }, g)
      const tick = el('svg', { class: 'ig-pencil ig-draw ig-speelpad__tick', x: -size * 0.38, y: -size * 0.38, width: size * 0.76, height: size * 0.76, viewBox: `0 0 ${tw} ${th}` }, g)
      tick.innerHTML = markMarkup(marks.tick)
      return { g, tick, len: stopLen[i] }
    })

    // the pawn: feet on the line, its own component (pawn.js) so it can become 3D later
    pawn = createPawn(svg, { size: PAWN })

    // scroll position (the walking "head", px from the top of root) -> length on the path.
    // between stops it walks, at a stop it waits HOLD px
    keys = [[0, 0]]
    zones = []
    stopIdx.forEach((k, i) => {
      const y = Math.max(pts[k][1], keys[keys.length - 1][0] + 1)
      keys.push([y, stopLen[i]], [y + HOLD, stopLen[i]])
      zones.push([y, y + HOLD])
    })
    keys.push([Math.max(H, keys[keys.length - 1][0] + 1), total])
    zone = -1
    update()
  }

  function lengthAt(head) {
    if (head <= keys[0][0]) return 0
    for (let i = 1; i < keys.length; i++) {
      const [y1, l1] = keys[i]
      const [y0, l0] = keys[i - 1]
      if (head <= y1) return l0 + ((head - y0) / (y1 - y0)) * (l1 - l0)
    }
    return total
  }

  function update() {
    raf = 0
    if (!path) return
    const reduced = isReduced()
    const head = window.innerHeight * HEAD - root.getBoundingClientRect().top
    // reduced motion: the whole line drawn, the pawn standing at the last stop, no hopping
    const drawn = reduced ? total : Math.max(0.001, Math.min(total, lengthAt(head)))
    const at = reduced ? lastStopLen : drawn
    path.style.strokeDashoffset = `${total - drawn}`

    const p = path.getPointAtLength(at)
    const q = path.getPointAtLength(Math.min(total, at + 6))
    const dist = Math.hypot(q.x - p.x, q.y - p.y) || 1
    pawn.pose(p.x, p.y, ((q.x - p.x) / dist) * 10)

    stops.forEach((s) => {
      const reached = at >= s.len - 1
      s.g.classList.toggle('is-reached', reached)
      s.tick.classList.toggle('is-drawn', reached)
    })

    const z = zones.findIndex(([a, b]) => head >= a && head <= b)
    if (z !== zone) {
      if (z >= 0 && !reduced) pawn.hop()
      zone = z
    }
  }

  const onScroll = () => {
    if (active && !raf) raf = requestAnimationFrame(update)
  }
  const io = new IntersectionObserver(([e]) => {
    active = e.isIntersecting
    onScroll()
  })
  const ro = new ResizeObserver(() => build())
  window.addEventListener('scroll', onScroll, { passive: true })
  const offReduced = onReducedChange(() => update())
  loadMark('tick').then((tickMark) => {
    marks = { tick: tickMark }
    io.observe(root)
    ro.observe(root)
    build()
  })

  return () => {
    alive = false
    io.disconnect()
    ro.disconnect()
    window.removeEventListener('scroll', onScroll)
    offReduced()
    cancelAnimationFrame(raf)
    svg.remove()
  }
}
