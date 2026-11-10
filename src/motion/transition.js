// page transition: the pencil scribbles across the screen, getting thicker until everything is orange,
// the hand appears, the page changes underneath, and the orange slides off upwards with a curved edge.
// full: 400ms in, 150ms hold, 350ms out. short (user test): 200 + 60 + 200 = 460ms. reduced motion: a 150ms fade.
//
// why not the View Transitions API: its snapshots can't show a live svg drawing itself on top.
// a fixed overlay does the same job and works in every browser, also in WordPress (initPageLinks).

import { isReduced } from './prefs.js'
import { loadMark, markMarkup } from './pencil.js'

const TIMING = {
  full: { in: 400, hold: 150, out: 350 },
  short: { in: 200, hold: 60, out: 200 },
}
const KEY = 'ig-scribble' // WordPress: tells the next page to start covered and play the way out

let overlay = null
const scribble = loadMark('scribble')

async function getOverlay() {
  if (overlay) return overlay
  const mark = await scribble
  overlay = document.createElement('div')
  overlay.className = 'ig-scribble'
  overlay.setAttribute('aria-hidden', 'true')
  overlay.innerHTML = `
    <svg class="ig-scribble__svg ig-pencil" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path class="ig-scribble__fill" d="M0 -2 H100 V100 C 72 113, 28 113, 0 100 Z"/>
      ${markMarkup(mark)}
    </svg>
    <span class="ig-scribble__hand"></span>`
  document.body.appendChild(overlay)
  return overlay
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function fade(update, target) {
  const el = target || document.body
  await el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 75, fill: 'forwards' }).finished
  update()
  await el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 75 }).finished
  el.getAnimations().forEach((a) => a.cancel())
}

/** cover the screen. resolves when everything is orange */
async function coverIn(t) {
  const o = await getOverlay()
  const lines = [...o.querySelectorAll('.ig-pencil__grain path')]
  const fill = o.querySelector('.ig-scribble__fill')
  const hand = o.querySelector('.ig-scribble__hand')
  o.getAnimations({ subtree: true }).forEach((a) => a.cancel())
  o.classList.add('is-on')
  const ease = 'cubic-bezier(0.5, 0, 0.75, 0)'
  lines.forEach((l) =>
    l.animate(
      [
        { strokeDashoffset: 1, strokeWidth: 3 },
        { strokeDashoffset: 0, strokeWidth: 10, offset: 0.55 },
        { strokeDashoffset: 0, strokeWidth: 40 },
      ],
      { duration: t.in, easing: ease, fill: 'forwards' },
    ),
  )
  // the fill makes sure it's 100% covered at the peak, on every screen size
  fill.animate([{ opacity: 0 }, { opacity: 0, offset: 0.7 }, { opacity: 1 }], { duration: t.in, fill: 'forwards' })
  hand.animate(
    [
      { opacity: 0, transform: 'translate(-50%, -50%) scale(0.9)' },
      { opacity: 0, transform: 'translate(-50%, -50%) scale(0.9)', offset: 0.6 },
      { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
    ],
    { duration: t.in + t.hold * 0.5, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', fill: 'forwards' },
  )
  await wait(t.in)
}

/** the orange slides off upwards with one curved edge */
async function coverOut(t) {
  const o = await getOverlay()
  await o.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-115%)' }], { duration: t.out, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' }).finished
  o.getAnimations({ subtree: true }).forEach((a) => a.cancel())
  o.classList.remove('is-on')
}

/**
 * prototype: runs update() (which must change the page synchronously) under the scribble.
 * mode: 'full', 'short' (user test) or 'off'. reduced motion: a 150ms fade instead.
 */
export async function igNavigate(update, { mode = 'full', fadeTarget } = {}) {
  if (mode === 'off') return update()
  if (isReduced()) return fade(update, fadeTarget)
  const t = TIMING[mode] || TIMING.full
  await coverIn(t)
  update()
  await wait(t.hold)
  await coverOut(t)
}

/** WordPress: same-site links scribble in before leaving; the next page starts covered and scribbles out */
export function initPageLinks({ mode = 'full' } = {}) {
  const t = TIMING[mode] || TIMING.full
  if (sessionStorage.getItem(KEY)) {
    sessionStorage.removeItem(KEY)
    getOverlay().then(async (o) => {
      o.classList.add('is-on', 'is-covered')
      await wait(t.hold)
      o.classList.remove('is-covered')
      await coverOut(t)
    })
  }
  const onClick = async (e) => {
    const a = e.target.closest?.('a[href]')
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return
    const url = new URL(a.href, location.href)
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return
    if (isReduced()) return
    e.preventDefault()
    await coverIn(t)
    sessionStorage.setItem(KEY, '1')
    location.href = url.href
  }
  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}
