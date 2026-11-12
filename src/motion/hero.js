// the homepage hero (see hero.css).
// initHeroWaves: big soft shapes in tints of orange and yellow that breathe slowly behind the hero
// (option A "oranje + geel" from docs/reference/hero_achtergronden.html, Jaydan's choice).
// initHeroTable: photos and games lying on the table. you can drag them around, they tilt with your
// movement and stay where you drop them. three curly arrows point from an object to a label and follow
// it. on a phone (or a narrow hero) nothing moves: the objects are a small pile and the labels are buttons.

import { isReduced } from './prefs.js'

const NS = 'http://www.w3.org/2000/svg'

// smooth closed shape through points (catmull-rom)
function closed(p) {
  const n = p.length
  let d = `M${p[0][0]},${p[0][1]}`
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n]
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`
  }
  return d + 'Z'
}

// the dark tints stay on the left behind the white title, the yellow ones on the right behind the objects
const WAVES = [
  { c: '#DD4C17', a: 30, pts: [[-150, -120], [420, -150], [380, 90], [120, 170], [-150, 150]] },
  { c: '#E35E25', a: 40, pts: [[-200, 520], [260, 470], [560, 620], [700, 900], [-200, 900]] },
  { c: '#F59A2E', a: 44, pts: [[900, -150], [1500, -80], [1800, 250], [1700, 700], [1250, 640], [1000, 330]] },
  { c: '#FAB512', a: 40, pts: [[1120, -160], [1700, -120], [1700, 330], [1400, 420], [1180, 160]] },
  { c: '#F27C48', a: 30, pts: [[1150, 700], [1550, 600], [1750, 820], [1500, 950], [1200, 900]] },
]

/** svg: an empty <svg viewBox="0 0 1600 800" preserveAspectRatio="xMidYMid slice"> */
export function initHeroWaves(svg) {
  const paths = WAVES.map((w) => {
    const p = document.createElementNS(NS, 'path')
    p.setAttribute('fill', w.c)
    svg.appendChild(p)
    return p
  })
  const frame = (t) => {
    const s = t / 1000
    WAVES.forEach((w, wi) => {
      const pts = w.pts.map(([x, y], i) => [x + Math.sin(s * 0.45 + i * 1.3 + wi * 1.7) * w.a, y + Math.cos(s * 0.38 + i * 0.9 + wi * 1.7) * w.a])
      paths[wi].setAttribute('d', closed(pts))
    })
  }
  frame(0)
  // only breathe while the hero is on screen, and never with reduced motion
  let raf = 0
  let visible = true
  const loop = (t) => {
    frame(t)
    raf = requestAnimationFrame(loop)
  }
  const sync = () => {
    cancelAnimationFrame(raf)
    raf = 0
    if (visible && !isReduced()) raf = requestAnimationFrame(loop)
  }
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    sync()
  })
  io.observe(svg)
  return () => {
    io.disconnect()
    cancelAnimationFrame(raf)
    paths.forEach((p) => p.remove())
  }
}

/* ---------- the table ---------- */

// everything is placed in a design frame of 640 x 620 px and scaled to the real width
const FRAME = 640
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const nums = (s) => (s || '').split(',').map(Number)

// a hand-drawn arrow from a to b: a soft bend with one small loop halfway, like the arrows on the
// Sociality product photo. the loop is a full circle that touches the line, so the line runs on smoothly
function arrowPath(a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const L = Math.hypot(dx, dy) || 1
  const ux0 = dx / L, uy0 = dy / L
  const nx = -uy0, ny = ux0 // a quarter turn clockwise on screen
  const bend = L * 0.12
  const r = clamp(L * 0.08, 7, 12)
  const m = [a[0] + dx * 0.5 - nx * bend, a[1] + dy * 0.5 - ny * bend]
  const c1 = [a[0] + dx * 0.2 - nx * bend, a[1] + dy * 0.2 - ny * bend]
  const c2 = [m[0] + dx * 0.3, m[1] + dy * 0.3]
  const loop = `a${r},${r} 0 1,1 ${2 * r * nx},${2 * r * ny} a${r},${r} 0 1,1 ${-2 * r * nx},${-2 * r * ny}`
  // the head follows the direction the line arrives in
  const hx = b[0] - c2[0], hy = b[1] - c2[1]
  const h = Math.hypot(hx, hy) || 1
  const ux = hx / h, uy = hy / h
  const head = (ang) => {
    const c = Math.cos(ang), s = Math.sin(ang)
    return [b[0] - (ux * c - uy * s) * 12, b[1] - (ux * s + uy * c) * 12]
  }
  const hl = head(0.5), hr = head(-0.5)
  return {
    line: `M${a[0]},${a[1]} Q${c1[0]},${c1[1]} ${m[0]},${m[1]} ${loop} Q${c2[0]},${c2[1]} ${b[0]},${b[1]}`,
    head: `M${hl[0]},${hl[1]} L${b[0]},${b[1]} L${hr[0]},${hr[1]}`,
  }
}

// the point on a box's edge in the direction of p, a little outside the box
function edge(box, p, gap) {
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2
  const dx = p[0] - cx, dy = p[1] - cy
  const t = 1 / Math.max(Math.abs(dx) / (box.w / 2) || 0, Math.abs(dy) / (box.h / 2) || 0, 1e-6)
  const len = Math.hypot(dx, dy) || 1
  return [cx + dx * t + (dx / len) * gap, cy + dy * t + (dy / len) * gap]
}

/**
 * stage: .ig-table, with
 *   .ig-table__item[data-key][data-at="x,y,deg"][data-pile="x,y,deg"][style="--w: 250"]  (design px)
 *   .ig-table__labels > .ig-table__label[data-for=key][data-at="x,y"]
 *   .ig-table__tidy (the "opruimen" button)
 */
export function initHeroTable(stage) {
  const items = [...stage.querySelectorAll('.ig-table__item')]
  const labels = [...stage.querySelectorAll('.ig-table__label')]
  const tidy = stage.querySelector('.ig-table__tidy')
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('class', 'ig-table__arrows')
  svg.setAttribute('aria-hidden', 'true')
  stage.appendChild(svg)

  // per item its place now (design px) and its tilt; per label which item it follows
  const state = new Map()
  const arrows = labels.map((label) => {
    const g = document.createElementNS(NS, 'g')
    const line = document.createElementNS(NS, 'path')
    const head = document.createElementNS(NS, 'path')
    g.append(line, head)
    svg.appendChild(g)
    return { label, item: stage.querySelector(`.ig-table__item[data-key="${label.dataset.for}"]`), line, head, at: nums(label.dataset.at) }
  })

  let scale = 1
  let live = false // false = the still pile (phone)
  let z = 10

  const place = (el, s) => {
    el.style.left = `${s.x * scale}px`
    el.style.top = `${s.y * scale}px`
    el.style.rotate = `${s.r}deg`
  }
  const reset = (animate) => {
    items.forEach((el) => {
      const [x, y, r] = nums(live ? el.dataset.at : el.dataset.pile)
      const s = { x, y, r, dx: 0, dy: 0 }
      state.set(el, s)
      el.classList.toggle('is-settling', !!animate)
      el.style.zIndex = ''
      place(el, s)
    })
    if (tidy) tidy.hidden = true
    draw()
  }

  // the label moves with its item: same offset as at the start
  const labelBox = (a) => {
    const s = state.get(a.item)
    const [ix, iy] = nums(live ? a.item.dataset.at : a.item.dataset.pile)
    const w = a.label.offsetWidth, h = a.label.offsetHeight
    const x = clamp((a.at[0] + s.x - ix) * scale, 0, stage.clientWidth - w)
    const y = clamp((a.at[1] + s.y - iy) * scale, 0, stage.clientHeight - h)
    return { x, y, w, h }
  }
  function draw() {
    if (!live) return
    for (const a of arrows) {
      const lb = labelBox(a)
      a.label.style.left = `${lb.x}px`
      a.label.style.top = `${lb.y}px`
      const s = state.get(a.item)
      const ib = { x: s.x * scale, y: s.y * scale, w: a.item.offsetWidth, h: a.item.offsetHeight }
      const from = edge(ib, [lb.x + lb.w / 2, lb.y + lb.h / 2], 10)
      const to = edge(lb, [ib.x + ib.w / 2, ib.y + ib.h / 2], 10)
      const p = arrowPath(from, to)
      a.line.setAttribute('d', p.line)
      a.head.setAttribute('d', p.head)
    }
  }

  // the arrows draw themselves once, one after the other
  let drawn = false
  const drawIn = () => {
    if (drawn || !live || isReduced()) return
    drawn = true
    arrows.forEach((a, i) => {
      const len = a.line.getTotalLength()
      const opts = { duration: 600, delay: 500 + i * 150, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', fill: 'backwards' }
      a.line.animate([{ strokeDasharray: len, strokeDashoffset: len }, { strokeDasharray: len, strokeDashoffset: 0 }], opts)
      a.head.animate([{ opacity: 0 }, { opacity: 0, offset: 0.85 }, { opacity: 1 }], opts)
      a.label.animate([{ opacity: 0, translate: '0 6px' }, { opacity: 1, translate: '0 0' }], { ...opts, delay: opts.delay + 350, duration: 300 })
    })
  }

  const measure = () => {
    const hero = stage.closest('section') || stage.parentElement
    const wasLive = live
    live = hero.clientWidth >= 768
    stage.classList.toggle('is-live', live)
    scale = stage.clientWidth / FRAME
    stage.style.setProperty('--s', String(scale))
    if (live !== wasLive) reset(false)
    else {
      items.forEach((el) => place(el, state.get(el)))
      draw()
    }
    drawIn()
  }

  /* dragging: pointer events, so mouse and touch work the same */
  let drag = null
  const down = (e) => {
    const el = e.target.closest('.ig-table__item')
    if (!el || !live || e.button > 0) return
    e.preventDefault()
    el.setPointerCapture(e.pointerId)
    const s = state.get(el)
    drag = { el, s, sx: e.clientX, sy: e.clientY, ox: s.x, oy: s.y, lx: e.clientX, vx: 0 }
    el.classList.remove('is-settling')
    el.classList.add('is-dragging')
    el.style.zIndex = String(++z)
  }
  const move = (e) => {
    if (!drag || e.pointerId === undefined) return
    const { el, s } = drag
    drag.vx = e.clientX - drag.lx
    drag.lx = e.clientX
    const w = el.offsetWidth / scale, h = el.offsetHeight / scale
    const maxY = stage.clientHeight / scale
    s.x = clamp(drag.ox + (e.clientX - drag.sx) / scale, -w * 0.3, FRAME - w * 0.7)
    s.y = clamp(drag.oy + (e.clientY - drag.sy) / scale, -h * 0.3, maxY - h * 0.7)
    place(el, s)
    // it leans into the movement, like a photo you slide across a table
    if (!isReduced()) el.style.rotate = `${s.r + clamp(drag.vx * 1.2, -12, 12)}deg`
    draw()
  }
  const up = () => {
    if (!drag) return
    const { el, s } = drag
    if (!isReduced()) s.r = clamp(s.r + drag.vx * 0.5, -10, 10)
    el.classList.remove('is-dragging')
    el.classList.add('is-settling')
    place(el, s)
    drag = null
    if (tidy) tidy.hidden = false
  }
  const dbl = (e) => {
    if (live && !e.target.closest('.ig-table__label, .ig-table__tidy')) reset(true)
  }
  const onTidy = () => reset(true)

  /* the mouse over the hero: the objects follow it a little and tilt with it, each by its own amount,
     so the table has some depth. only with a mouse, only on the live table, never with reduced motion.
     it eases with rAF and stops when everything is back in place */
  const hero = stage.closest('section') || stage.parentElement
  const DEPTH = [1, 0.55, 0.8, 1.25] // per item, in the order of the markup
  const MAX_X = 12, MAX_Y = 9, MAX_TILT = 2.5 // px, px, deg at the edge of the hero
  let aim = [0, 0], cur = [0, 0], raf = 0
  const tick = () => {
    cur = cur.map((c, i) => c + (aim[i] - c) * 0.08)
    items.forEach((el, i) => {
      if (el.classList.contains('is-dragging')) return
      const d = DEPTH[i % DEPTH.length]
      el.style.translate = `${(cur[0] * MAX_X * d).toFixed(2)}px ${(cur[1] * MAX_Y * d).toFixed(2)}px`
      el.style.transform = `rotate(${(cur[0] * MAX_TILT * d).toFixed(2)}deg)`
    })
    raf = Math.abs(aim[0] - cur[0]) + Math.abs(aim[1] - cur[1]) > 0.002 ? requestAnimationFrame(tick) : 0
  }
  const follow = (e) => {
    if (e.pointerType !== 'mouse' || !live || isReduced()) return
    const r = hero.getBoundingClientRect()
    aim = [clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1), clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1)]
    if (!raf) raf = requestAnimationFrame(tick)
  }
  const rest = () => {
    aim = [0, 0]
    if (!raf) raf = requestAnimationFrame(tick)
  }
  hero.addEventListener('pointermove', follow)
  hero.addEventListener('pointerleave', rest)

  stage.addEventListener('pointerdown', down)
  stage.addEventListener('pointermove', move)
  stage.addEventListener('pointerup', up)
  stage.addEventListener('pointercancel', up)
  stage.addEventListener('dblclick', dbl)
  tidy?.addEventListener('click', onTidy)
  const ro = new ResizeObserver(measure)
  ro.observe(stage)
  // the labels are text: once the font is in, their size can change
  document.fonts?.ready.then(() => draw())
  reset(false)
  measure()

  return () => {
    ro.disconnect()
    cancelAnimationFrame(raf)
    hero.removeEventListener('pointermove', follow)
    hero.removeEventListener('pointerleave', rest)
    stage.removeEventListener('pointerdown', down)
    stage.removeEventListener('pointermove', move)
    stage.removeEventListener('pointerup', up)
    stage.removeEventListener('pointercancel', up)
    stage.removeEventListener('dblclick', dbl)
    tidy?.removeEventListener('click', onTidy)
    svg.remove()
  }
}
