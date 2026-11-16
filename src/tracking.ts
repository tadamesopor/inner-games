// tracking for the remote test (v6): where people click, what they hover, how the mouse moves.
// only runs in participant mode (src/participant.tsx), never on the normal site or in leader mode.
// to switch it all off: TRACKING = false. pages, scroll depth and the tasks are still logged then.
// never: key presses, or what someone types. there is no keydown or input listener in here.

export const TRACKING = true

export type Sample = [number, number, number] // [ms since the task started, x %, y %]
export type Mouse = Record<string, Sample[]>
export type Extra = { x?: number; y?: number; sy?: number; ms?: number; page?: string }
export type TEv = { t: number; type: string; detail: string; task?: string } & Extra

const MAX_SAMPLES = 6000
const SAMPLE_MS = 250
const MOVE_PX = 5
const HOVER_MS = 500
const RAGE = { clicks: 3, ms: 1000, px: 30 }

const CONTROL = 'button, a, [role=button]'
// [aria-label], but not on a whole section or menu: that would be a "hover" of half the page
const NAMED = '[aria-label]:not(section, nav, main, header, footer, aside, form, ul, ol, [role=region], [role=group], [role=dialog], [role=list], [role=navigation])'
const CARD = '.ig-card, [data-card]'
const CLICKABLE = 'a, button, input, select, textarea, label, summary, [role=button], [role=link], [tabindex]'

const pct = (n: number, of: number) => Math.round((n / of) * 1000) / 10

// the visible text of an element, without anything inside a field (so never a typed value), and
// without hidden copies (the split buttons have their text twice, once aria-hidden)
const SKIP = 'head, input, textarea, select, [contenteditable], script, style, noscript, template, svg, [aria-hidden=true], .sr-only'
function textOf(el: Element, n = 60) {
  let out = ''
  const walk = (node: Node) => {
    if (out.length > n * 2) return
    if (node.nodeType === Node.TEXT_NODE) out += node.textContent + ' '
    else if (node instanceof Element && !node.matches(SKIP)) node.childNodes.forEach(walk)
  }
  walk(el)
  return out.replace(/\s+/g, ' ').trim().slice(0, n)
}
// the closest text to a spot that does nothing: the element itself, or the first parent with text
function nearText(el: Element) {
  if (!document.body.contains(el) || el === document.body) return 'pagina (lege plek)'
  for (let e: Element | null = el; e && e !== document.body; e = e.parentElement) {
    const t = textOf(e)
    if (t) return t
  }
  return el.tagName.toLowerCase()
}
// a card only counts when it can be clicked (the contact form sits in a card too)
const cardOf = (el: Element) => {
  const c = el.closest(CARD)
  return c && getComputedStyle(c).cursor === 'pointer' ? c : null
}

// the label of a button, link or card: aria-label first, then the title of a card, then the text
export function labelOf(el: Element) {
  const aria = el.getAttribute('aria-label')
  if (aria) return aria.replace(/\s+/g, ' ').trim().slice(0, 60)
  if (el.matches(CARD)) {
    const title = el.querySelector('h2, h3, .ig-card__title')
    if (title) return textOf(title)
  }
  if (el.matches('input, textarea, select')) return el.getAttribute('name') || el.tagName.toLowerCase()
  return textOf(el) || el.tagName.toLowerCase()
}

const targetOf = (t: EventTarget | null) => {
  const el = t instanceof Element ? t : null
  if (!el || el.closest('[data-participant]')) return null // the test's own screens are not the site
  return el
}

type Hooks = {
  log: (type: string, detail: string, extra?: Extra) => void
  task: () => string | undefined // the running task, if any
  taskStart: () => number | undefined // when it started (Date.now())
  page: () => string
  mouse: Mouse // filled in place, the participant mode saves it
}

/** starts all listeners. returns the function that stops them */
export function startTracking(h: Hooks) {
  if (!TRACKING) return () => {}
  // a phone or tablet without a mouse: no hovers and no path, every click is a tap. some phones also
  // fire mouse events after a touch, so the pointer type alone is not enough
  const touchOnly = matchMedia('(pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches
  const off: (() => void)[] = []
  const on = <K extends keyof DocumentEventMap>(type: K, fn: (e: DocumentEventMap[K]) => void) => {
    document.addEventListener(type, fn, { capture: true, passive: true })
    off.push(() => document.removeEventListener(type, fn, { capture: true }))
  }
  const where = (e: MouseEvent): Extra => ({ x: pct(e.clientX, innerWidth), y: pct(e.clientY, innerHeight), sy: Math.round(scrollY) })

  // clicks, taps, dead clicks and rage clicks
  let pointerType = 'mouse'
  let recent: { t: number; x: number; y: number }[] = []
  on('pointerdown', (e) => (pointerType = e.pointerType || 'mouse'))
  on('click', (e) => {
    const el = targetOf(e.target)
    if (!el) return
    const hit = el.closest(CONTROL) || cardOf(el) || el.closest(NAMED)
    const cursor = getComputedStyle(el).cursor
    const clickable = el.closest(CLICKABLE) || cursor === 'pointer' || cursor === 'grab'
    // a dead click gets the closest text, so you can see what they thought was a button
    const label = hit && clickable ? labelOf(hit) : nearText(el)
    if (!clickable) h.log('dead_click', label, where(e))
    else h.log(touchOnly || pointerType === 'touch' ? 'tap' : 'click', label, where(e))

    const now = performance.now()
    recent = recent.filter((r) => now - r.t < RAGE.ms && Math.hypot(r.x - e.clientX, r.y - e.clientY) <= RAGE.px)
    recent.push({ t: now, x: e.clientX, y: e.clientY })
    if (recent.length >= RAGE.clicks) {
      h.log('rage_click', label, where(e))
      recent = []
    }
  })

  // hovers of at least half a second, on buttons, links and cards. not on touch screens
  let over: { el: Element; t: number } | null = null
  const endHover = () => {
    if (!over) return
    const ms = Math.round(performance.now() - over.t)
    if (ms >= HOVER_MS && over.el.isConnected) h.log('hover', labelOf(over.el), { ms, page: h.page() })
    over = null
  }
  on('pointerover', (e) => {
    if (touchOnly || e.pointerType === 'touch') return
    const raw = targetOf(e.target)
    const el = raw && (raw.closest(CONTROL) || cardOf(raw) || raw.closest(NAMED))
    if (el === over?.el) return
    endHover()
    if (el) over = { el, t: performance.now() }
  })
  on('pointerout', (e) => {
    if (!over || e.pointerType === 'touch') return
    const to = e.relatedTarget instanceof Element ? e.relatedTarget : null
    if (!to || !over.el.contains(to)) endHover()
  })

  // the mouse path: a sample every 250 ms, only during a task, only when it moved, not when the tab is hidden
  let last: { x: number; y: number } | null = null
  let pos: { x: number; y: number } | null = null
  on('pointermove', (e) => {
    if (!touchOnly && (e.pointerType === 'mouse' || e.pointerType === 'pen')) pos = { x: e.clientX, y: e.clientY }
  })
  const iv = setInterval(() => {
    const task = h.task()
    const start = h.taskStart()
    if (!task || !start || !pos || document.hidden) return
    if (last && Math.hypot(pos.x - last.x, pos.y - last.y) <= MOVE_PX) return
    last = pos
    const list = (h.mouse[task] ??= [])
    if (Object.values(h.mouse).reduce((n, l) => n + l.length, 0) >= MAX_SAMPLES) list.shift() // full: drop the oldest of this task
    list.push([Date.now() - start, pct(pos.x, innerWidth), pct(pos.y, innerHeight)])
  }, SAMPLE_MS)
  off.push(() => clearInterval(iv))

  return () => {
    endHover()
    off.forEach((f) => f())
  }
}

/** per task: the top 5 hovers, rage and dead clicks, and how far the mouse went (in screen widths) */
export function summarize(events: TEv[], path: Sample[] = [], viewport = '1440x900') {
  const ms = new Map<string, number>()
  for (const e of events) if (e.type === 'hover') ms.set(e.detail, (ms.get(e.detail) ?? 0) + (e.ms ?? 0))
  const hoverTop = [...ms].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, m]) => ({ label, seconds: Math.round(m / 100) / 10 }))
  const labels = (type: string) => events.filter((e) => e.type === type).map((e) => e.detail)
  const [w, h] = viewport.split('x').map(Number)
  const ratio = w && h ? h / w : 0.6
  let dist = 0
  for (let i = 1; i < path.length; i++) dist += Math.hypot((path[i][1] - path[i - 1][1]) / 100, ((path[i][2] - path[i - 1][2]) / 100) * ratio)
  return {
    hoverTop,
    rageClicks: labels('rage_click'),
    deadClicks: labels('dead_click'),
    taps: events.filter((e) => e.type === 'tap').length,
    mouseScreens: Math.round(dist * 10) / 10,
    mouseSamples: path.length,
  }
}

const bytes = (s: string) => new TextEncoder().encode(s).length

/** the json body, at most `max` bytes: first every second mouse sample goes, then (only for the small
 * beacon) the mouse path and the oldest events. the answers always stay */
export function fit(build: (mouse: Mouse, eventsFrom: number) => string, mouse: Mouse, max: number) {
  let m = mouse
  let body = build(m, 0)
  while (bytes(body) > max && Object.values(m).some((l) => l.length > 1)) {
    m = Object.fromEntries(Object.entries(m).map(([k, l]) => [k, l.filter((_, i) => i % 2 === 0)]))
    body = build(m, 0)
  }
  if (bytes(body) > max) body = build({}, 0)
  for (let from = 500; bytes(body) > max && from < 6000; from += 500) body = build({}, from)
  if (bytes(body) > max) body = build({}, Infinity) // the last step: answers and short task summaries only
  return body
}
