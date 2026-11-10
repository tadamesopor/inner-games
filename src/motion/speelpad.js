// .ig-bg-speelpad: a dashed board-game path that draws itself while you scroll, with a pawn walking along.
// the path is built from the blocks it passes: every child with [data-speelpad-stop] gets a "speelvakje"
// next to it, in the margin, and the pawn waits there for a moment. it never crosses text: it runs in
// the side margins and only crosses over in the gaps between blocks.
//
// TODO: replace with drawing. the wobble below fakes a hand-drawn line until Damian's drawn path exists.

import { isReduced, onReducedChange } from './prefs.js'

const NS = 'http://www.w3.org/2000/svg'
const HOLD = 140 // px of scrolling the pawn waits at each stop
const HEAD = 0.62 // the pawn walks at 62% of the screen height

// small seeded random, so the wobble is the same on every load and every resize
function seeded(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

// smooth curve through points (catmull-rom turned into cubic beziers)
function curve(pts) {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
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

let uid = 0

export function initSpeelpad(root, { pawn = '/assets/meeple-pawn.png' } = {}) {
  const id = `ig-speelpad-${++uid}`
  const svg = el('svg', { class: 'ig-speelpad__svg', 'aria-hidden': 'true', focusable: 'false' })
  root.prepend(svg)

  let path, maskPath, pawnEl, vakjes = [], keys = [], total = 0, active = false, raf = 0, pawnSize = 30

  function build() {
    svg.textContent = ''
    const W = root.clientWidth
    const H = root.scrollHeight
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    svg.setAttribute('width', W)
    svg.setAttribute('height', H)

    const box = root.getBoundingClientRect()
    const stops = [...root.querySelectorAll('[data-speelpad-stop]')].map((s) => {
      const r = s.getBoundingClientRect()
      return { top: r.top - box.top, bottom: r.bottom - box.top, left: r.left - box.left, right: r.right - box.left }
    })
    if (!stops.length) return

    const rnd = seeded(7)
    const wob = (n) => (rnd() - 0.5) * 2 * n
    const leftM = Math.min(...stops.map((s) => s.left))
    const rightM = W - Math.max(...stops.map((s) => s.right))
    const narrow = leftM < 40 || rightM < 40
    // x of the path in the left or right margin (or hugging the edge on a phone)
    const side = (i) => (narrow ? 10 : i % 2 === 0 ? leftM / 2 : W - rightM / 2)
    // on a phone the path hugs the edge, so the pawn and the squares get smaller
    const vak = narrow ? 12 : 22
    pawnSize = narrow ? 20 : 30

    const pts = [[side(0) + wob(6), 8]]
    const stopIdx = []
    stops.forEach((s, i) => {
      const x = side(i)
      pts.push([x + wob(4), s.top + 56])
      stopIdx.push(pts.length - 1)
      const next = stops[i + 1]
      if (next) {
        const gap = (s.bottom + next.top) / 2
        if (narrow) {
          pts.push([x + wob(3), gap + wob(8)])
        } else {
          // down the margin, across in the gap with a little dip, up the other margin
          const nx = side(i + 1)
          pts.push([x + wob(5), gap - 18 + wob(6)])
          pts.push([(x + nx) / 2 + wob(30), gap + 10 + wob(10)])
          pts.push([nx + wob(5), gap - 4 + wob(6)])
        }
      }
    })
    pts.push([side(stops.length - 1) + wob(6), H - 8])

    const d = curve(pts)
    const mask = el('mask', { id, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, el('defs', {}, svg))
    maskPath = el('path', { d, class: 'ig-speelpad__mask' }, mask)
    path = el('path', { d, class: 'ig-speelpad__path', mask: `url(#${id})` }, svg)
    total = path.getTotalLength()
    maskPath.style.strokeDasharray = `${total} ${total}`

    // length of the path at every stop: measure the curve up to that point
    const stopLen = stopIdx.map((k) => {
      const tmp = el('path', { d: curve(pts.slice(0, k + 1)) }, svg)
      const len = tmp.getTotalLength()
      tmp.remove()
      return len
    })

    // speelvakjes: a small square next to each block
    vakjes = stopIdx.map((k, i) => {
      const [x, y] = pts[k]
      return el('rect', { x: x - vak / 2, y: y - vak / 2, width: vak, height: vak, rx: narrow ? 3 : 5, class: 'ig-speelpad__vak', transform: `rotate(${(wob(7)).toFixed(1)} ${x} ${y})`, 'data-len': stopLen[i] }, svg)
    })

    pawnEl = el('image', { href: pawn, width: pawnSize, height: pawnSize, class: 'ig-speelpad__pawn' }, svg)

    // scroll position (where the pawn's "head" is, in px from the top of root) -> length on the path.
    // between stops it walks, at a stop it waits HOLD px.
    keys = [[0, 0]]
    stopIdx.forEach((k, i) => {
      const y = Math.max(pts[k][1], keys[keys.length - 1][0] + 1)
      keys.push([y, stopLen[i]], [y + HOLD, stopLen[i]])
    })
    keys.push([H, total])

    update()
  }

  function lengthAt(head) {
    if (head <= keys[0][0]) return 0
    for (let i = 1; i < keys.length; i++) {
      const [y1, l1] = keys[i]
      const [y0, l0] = keys[i - 1]
      if (head <= y1) return y1 === y0 ? l1 : l0 + ((head - y0) / (y1 - y0)) * (l1 - l0)
    }
    return total
  }

  function update() {
    raf = 0
    if (!path) return
    const head = isReduced() ? Infinity : window.innerHeight * HEAD - root.getBoundingClientRect().top
    const len = Math.max(0.001, Math.min(total, lengthAt(head)))
    maskPath.style.strokeDashoffset = `${total - len}`
    const p = path.getPointAtLength(len)
    pawnEl.setAttribute('x', (p.x - pawnSize / 2).toFixed(1))
    pawnEl.setAttribute('y', (p.y - pawnSize * 0.87).toFixed(1))
    vakjes.forEach((v) => v.classList.toggle('is-reached', len >= Number(v.dataset.len) - 1))
  }

  const onScroll = () => {
    if (active && !raf) raf = requestAnimationFrame(update)
  }
  const io = new IntersectionObserver(([e]) => {
    active = e.isIntersecting
    onScroll()
  })
  io.observe(root)
  const ro = new ResizeObserver(() => build())
  ro.observe(root)
  window.addEventListener('scroll', onScroll, { passive: true })
  const offReduced = onReducedChange(() => update())
  build()

  return () => {
    io.disconnect()
    ro.disconnect()
    window.removeEventListener('scroll', onScroll)
    offReduced()
    cancelAnimationFrame(raf)
    svg.remove()
  }
}
