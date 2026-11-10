// .ig-footer: how far the footer is revealed, as --p (0 to 1). the cover (the section before it)
// scrolls up; its bottom edge tells how much of the footer shows. the underline draws itself
// once the footer is mostly in view, and the hand waves once. reduced motion: --p is 1, no wave.

import { isReduced, onReducedChange } from './prefs.js'

export function initFooterReveal(footer) {
  const cover = footer.previousElementSibling
  const mark = footer.querySelector('.ig-footer__mark')
  let raf = 0
  let active = false
  let waved = false

  const update = () => {
    raf = 0
    const vh = window.innerHeight
    const h = footer.offsetHeight
    const coverBottom = cover ? cover.getBoundingClientRect().bottom : vh - h
    const p = isReduced() ? 1 : Math.min(1, Math.max(0, (vh - coverBottom) / h))
    footer.style.setProperty('--p', p.toFixed(4))
    mark?.classList.toggle('is-drawn', p > 0.6)
    // the hand waves once, the first time the footer is mostly revealed
    if (p > 0.75 && !waved && !isReduced()) {
      waved = true
      footer.classList.add('is-waving')
    }
  }
  const onScroll = () => {
    if (active && !raf) raf = requestAnimationFrame(update)
  }
  const io = new IntersectionObserver(([e]) => {
    active = e.isIntersecting
    onScroll()
  })
  io.observe(footer)
  window.addEventListener('scroll', onScroll, { passive: true })
  const off = onReducedChange(update)
  update()

  return () => {
    io.disconnect()
    window.removeEventListener('scroll', onScroll)
    off()
    cancelAnimationFrame(raf)
  }
}
