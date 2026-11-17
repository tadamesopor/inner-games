// .ig-logos: the logo wall (clients and partners). the first time it scrolls into view, the logos (.ig-logo)
// fade in one after the other, all done within 0.8 s, and then they stand still for good.
// once per page, only with an IntersectionObserver (no scroll listener), nothing with reduced motion.
// in WordPress: put .ig-logos on the section and .ig-logo on every logo.

import { isReduced } from './prefs.js'

const TOTAL = 800 // ms until the last logo is in
const FADE = 320 // ms one logo takes

export function initLogos(root) {
  const items = [...root.querySelectorAll('.ig-logo')]
  if (!items.length || isReduced() || !('IntersectionObserver' in window)) return () => {}
  const step = items.length > 1 ? (TOTAL - FADE) / (items.length - 1) : 0
  items.forEach((el, i) => el.style.setProperty('--logo-delay', `${Math.round(i * step)}ms`))
  root.classList.add('is-waiting')
  let done = 0
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      root.classList.add('is-in')
      // all in: back to the normal state, so nothing is left that animates
      done = window.setTimeout(() => root.classList.remove('is-waiting', 'is-in'), TOTAL + 50)
    },
    { threshold: 0.15 },
  )
  io.observe(root)
  return () => {
    io.disconnect()
    clearTimeout(done)
    root.classList.remove('is-waiting', 'is-in')
  }
}
