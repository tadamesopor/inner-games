// .ig-bg-speelpad: the game path, drawn with the pencil line while you scroll (scrubbed, not played).
// the yellow InnerGames pawn (pawn.js) walks along it, leans a little in the direction it walks,
// and hops once at every stop.
// every child with [data-speelpad-stop] gets a stop square in the margin next to it. between stops the
// line slips behind the bottom corner of the card and comes out in the gap, so it feels part of the page.
// on a phone it's a simple line along the left edge.
//
// smooth scrolling: the line is drawn once (with its grain) on its own layer, and "draws itself" by
// moving a window over it with two opposite translateY's. the pawn moves with transform only. so while
// scrolling nothing is repainted and nothing is measured: the points along the line are worked out once,
// and where the path sits on the page is measured on build and resize, never in the scroll loop.
// reduced motion: the whole line, the pawn standing at the last stop, nothing moves on scroll.
//
// TODO: replace with drawing. the wobble below fakes a hand-drawn line until Damian's own path exists.

import { isReduced, onReducedChange } from './prefs.js'
import { loadMark, markMarkup } from './pencil.js'
import { createPawn } from './pawn.js'

const NS = 'http://www.w3.org/2000/svg'
const HOLD = 150 // px of scrolling the pawn waits at each stop
const HEAD = 0.6 // the pawn walks at 60% of the screen height
const STEP = 6 // px along the line between two points of the lookup table

function seeded(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

// smooth curve through points (catmull-rom as cubic beziers). the control points are kept between lo
// and hi too: a curve never leaves its control points, so the line can't overshoot past the margin.
// one segment per pair of points: [start, control 1, control 2, end]
function segments(pts, lo = -Infinity, hi = Infinity) {
  const cx = (x) => Math.max(lo, Math.min(hi, x))
  const out = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1 = [cx(p1[0] + (p2[0] - p0[0]) / 6), p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [cx(p2[0] - (p3[0] - p1[0]) / 6), p2[1] - (p3[1] - p1[1]) / 6]
    out.push([p1, c1, c2, p2])
  }
  return out
}
const f1 = (n) => n.toFixed(1)
const pathOf = (segs) => `M${f1(segs[0][0][0])},${f1(segs[0][0][1])}` + segs.map(([, a, b, c]) => ` C${f1(a[0])},${f1(a[1])} ${f1(b[0])},${f1(b[1])} ${f1(c[0])},${f1(c[1])}`).join('')

// walks the line in JS: the points every STEP px along it, its length, and the length at the end of each
// segment. much faster than asking the browser (getPointAtLength walks the whole path on every call)
function walk(segs) {
  const SUB = 40 // straight bits per segment while measuring
  const lx = [], ly = [], ll = [] // fine points with their length along the line
  const ends = [] // length at the end of each segment
  let len = 0, px = segs[0][0][0], py = segs[0][0][1]
  lx.push(px), ly.push(py), ll.push(0)
  for (const [p, a, b, c] of segs) {
    for (let k = 1; k <= SUB; k++) {
      const t = k / SUB, u = 1 - t
      const x = u * u * u * p[0] + 3 * u * u * t * a[0] + 3 * u * t * t * b[0] + t * t * t * c[0]
      const y = u * u * u * p[1] + 3 * u * u * t * a[1] + 3 * u * t * t * b[1] + t * t * t * c[1]
      len += Math.hypot(x - px, y - py)
      lx.push(x), ly.push(y), ll.push(len)
      px = x
      py = y
    }
    ends.push(len)
  }
  // the same points again, now every STEP px along the line
  const n = Math.ceil(len / STEP) + 1
  const xs = new Float32Array(n), ys = new Float32Array(n)
  for (let i = 0, j = 0; i < n; i++) {
    const at = Math.min(len, i * STEP)
    while (j < ll.length - 2 && ll[j + 1] < at) j++
    const f = ll[j + 1] > ll[j] ? (at - ll[j]) / (ll[j + 1] - ll[j]) : 0
    xs[i] = lx[j] + (lx[j + 1] - lx[j]) * f
    ys[i] = ly[j] + (ly[j + 1] - ly[j]) * f
  }
  return { xs, ys, total: len, ends }
}

function el(name, attrs, parent) {
  const n = document.createElementNS(NS, name)
  for (const k in attrs) n.setAttribute(k, attrs[k])
  parent?.appendChild(n)
  return n
}
function div(cls) {
  const n = document.createElement('div')
  n.className = cls
  n.setAttribute('aria-hidden', 'true')
  return n
}

const viewBoxOf = (mark) => mark.viewBox.split(/[\s,]+/).map(Number)

export function initSpeelpad(root) {
  // three layers behind the content: the line (in a window that opens downwards), the stops, the pawn
  const reveal = div('ig-speelpad__layer ig-speelpad__reveal')
  const inner = div('ig-speelpad__inner')
  reveal.appendChild(inner)
  const svg = el('svg', { class: 'ig-speelpad__svg', focusable: 'false' }, inner)
  const stopsSvg = el('svg', { class: 'ig-speelpad__layer ig-speelpad__svg', 'aria-hidden': 'true', focusable: 'false' })
  const pawnLayer = div('ig-speelpad__layer ig-speelpad__pawn')
  root.prepend(reveal, stopsSvg, pawnLayer)

  let marks = null
  let pawn = null, stops = [], keys = [], zones = [], total = 0, lastStopLen = 0
  let xs = null, ys = null, reach = null // the lookup table: x and y every STEP px, and the lowest y so far
  let W = 0, H = 0, rootTop = 0
  let active = false, raf = 0, zone = -1, alive = true, buildRaf = 0
  let cutNow = NaN, awayNow = null

  // where the path sits on the page (document y). in a ResizeObserver callback or on build: layout is
  // clean there, so this read costs nothing
  const measure = () => {
    rootTop = root.getBoundingClientRect().top + window.scrollY
  }

  function build() {
    buildRaf = 0
    if (!marks || !alive) return
    svg.textContent = ''
    stopsSvg.textContent = ''
    pawnLayer.textContent = ''
    xs = null
    W = root.clientWidth
    H = root.scrollHeight
    for (const s of [svg, stopsSvg]) {
      s.setAttribute('viewBox', `0 0 ${W} ${H}`)
      s.setAttribute('width', W)
      s.setAttribute('height', H)
    }
    reveal.style.width = inner.style.width = `${W}px`
    reveal.style.height = inner.style.height = `${H}px`
    cutNow = NaN
    awayNow = null

    const box = root.getBoundingClientRect()
    rootTop = box.top + window.scrollY
    const blocks = [...root.querySelectorAll('[data-speelpad-stop]')].map((s) => {
      const r = s.getBoundingClientRect()
      // the stop sits at the height of the block's title, not at a fixed distance from its top
      const h = s.querySelector('h2, h3')?.getBoundingClientRect()
      const head = h ? h.top + h.height / 2 - box.top : r.top - box.top + 52
      return { top: r.top - box.top, bottom: r.bottom - box.top, left: r.left - box.left, right: r.right - box.left, head }
    })
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
      // slip behind the bottom corner of this card...
      const behindX = i % 2 === 0 ? b.left + 40 + wob(10) : b.right - 40 + wob(10)
      pts.push([behindX, b.bottom - 34 + wob(8)])
      // ...and come out in the gap, heading for the other margin
      if (next) pts.push([clampX((behindX + margin(i + 1)) / 2 + wob(40)), (b.bottom + next.top) / 2 + wob(12)])
    })
    pts.push([margin(blocks.length - 1) + wob(8), H - 6])

    // the whole line, drawn once. it never changes while scrolling, so its grain is rendered once too
    const segs = segments(pts, minX, W - minX)
    const grain = el('g', { class: 'ig-pencil__grain' }, svg)
    el('path', { d: pathOf(segs), class: 'ig-speelpad__line' }, grain)

    // the lookup table: a point every STEP px along the line, worked out once instead of every frame
    const line = walk(segs)
    xs = line.xs
    ys = line.ys
    total = line.total
    reach = new Float32Array(xs.length)
    let low = -Infinity
    for (let i = 0; i < ys.length; i++) {
      low = Math.max(low, ys[i])
      reach[i] = low // the line is drawn down to here: the lowest point reached so far
    }

    // the length along the line at each stop: stop point k is the end of segment k - 1
    const stopLen = stopIdx.map((k) => line.ends[k - 1])
    lastStopLen = stopLen[stopLen.length - 1]

    // the stops: a small boxy square, outline first, yellow with a drawn tick once the pawn gets there.
    // on their own layer, so they show before the line reaches them
    const size = 22
    const [, , tw, th] = viewBoxOf(marks.tick)
    stops = stopIdx.map((k, i) => {
      const [x, y] = pts[k]
      const g = el('g', { class: 'ig-speelpad__stop', transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${wob(6).toFixed(1)})` }, stopsSvg)
      el('rect', { x: -size / 2, y: -size / 2, width: size, height: size, rx: 4, class: 'ig-speelpad__square' }, g)
      const tick = el('svg', { class: 'ig-pencil ig-draw ig-speelpad__tick', x: -size * 0.38, y: -size * 0.38, width: size * 0.76, height: size * 0.76, viewBox: `0 0 ${tw} ${th}` }, g)
      tick.innerHTML = markMarkup(marks.tick)
      return { g, tick, len: stopLen[i], on: false }
    })

    // the pawn: feet on the line, its own component (pawn.js) so it can become 3D later
    pawn = createPawn(pawnLayer, { size: PAWN })

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

  // a point on the line from the lookup table, in between two entries
  const at = (arr, len) => {
    const f = Math.max(0, Math.min(arr.length - 1, len / STEP))
    const i = Math.floor(f)
    const j = Math.min(arr.length - 1, i + 1)
    return arr[i] + (arr[j] - arr[i]) * (f - i)
  }

  function update() {
    raf = 0
    if (!xs) return
    const reduced = isReduced()
    const scrollY = window.scrollY // read first, then only writes
    const head = window.innerHeight * HEAD - (rootTop - scrollY)
    const drawn = reduced ? total : Math.max(0, Math.min(total, lengthAt(head)))
    const len = reduced ? lastStopLen : drawn

    // the line: the window over it opens down to the lowest point drawn so far (+ the line's width)
    const cut = reduced ? H : Math.min(H, Math.round(at(reach, drawn) + 4))
    if (cut !== cutNow) {
      reveal.style.transform = `translate3d(0, ${cut - H}px, 0)`
      inner.style.transform = `translate3d(0, ${H - cut}px, 0)`
      cutNow = cut
    }

    const x = at(xs, len), y = at(ys, len)
    const qx = at(xs, Math.min(total, len + 6)), qy = at(ys, Math.min(total, len + 6))
    const dist = Math.hypot(qx - x, qy - y) || 1
    pawn.pose(x, y, ((qx - x) / dist) * 10)
    // near the top or bottom of the screen it fades out, so it never sits on fixed buttons
    const onScreen = rootTop - scrollY + y
    const away = !reduced && (onScreen < window.innerHeight * 0.15 || onScreen > window.innerHeight * 0.85)
    if (away !== awayNow) {
      pawn.node.classList.toggle('is-away', away)
      awayNow = away
    }

    for (const s of stops) {
      const reached = len >= s.len - 1
      if (reached === s.on) continue
      s.on = reached
      s.g.classList.toggle('is-reached', reached)
      s.tick.classList.toggle('is-drawn', reached)
    }

    const z = zones.findIndex(([a, b]) => head >= a && head <= b)
    if (z !== zone) {
      if (z >= 0 && !reduced) pawn.hop()
      zone = z
    }
  }

  // reduced motion: everything stands still, so scrolling does nothing
  const onScroll = () => {
    if (active && !raf && !isReduced()) raf = requestAnimationFrame(update)
  }
  const io = new IntersectionObserver(([e]) => {
    active = e.isIntersecting
    if (active && !raf) raf = requestAnimationFrame(update)
  })
  // the path itself changes size (images loading, a new width): build it again, once per frame at most
  const ro = new ResizeObserver(() => {
    if (!buildRaf) buildRaf = requestAnimationFrame(build)
  })
  // something above it changes height: only measure where it sits now
  const roPage = new ResizeObserver(() => {
    measure()
    onScroll()
  })
  window.addEventListener('scroll', onScroll, { passive: true })
  const offReduced = onReducedChange(() => update())
  loadMark('tick').then((tickMark) => {
    if (!alive) return
    marks = { tick: tickMark }
    io.observe(root)
    ro.observe(root)
    roPage.observe(document.body)
    build()
  })

  return () => {
    alive = false
    io.disconnect()
    ro.disconnect()
    roPage.disconnect()
    window.removeEventListener('scroll', onScroll)
    offReduced()
    cancelAnimationFrame(raf)
    cancelAnimationFrame(buildRaf)
    reveal.remove()
    stopsSvg.remove()
    pawnLayer.remove()
  }
}
