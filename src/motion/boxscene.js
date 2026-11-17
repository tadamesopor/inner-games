// .ig-boxscene: turns the scroll position into --p (0 to 1). css does the rest.
// 0 when the section is about 25% in view, 1 when its middle is in the middle of the screen.
// .is-landed when the box is down, so the drawn arrow to the button can draw itself.
// reduced motion: --p is always 1, the end state.

import { isReduced, onReducedChange } from './prefs.js'

export function initBoxscene(root) {
  let raf = 0
  let active = false
  const pointer = root.querySelector('.ig-boxscene__pointer')
  // measured when something changes size, not while scrolling: where the section sits on the page
  let top = 0
  let height = 0
  const measure = () => {
    const r = root.getBoundingClientRect()
    top = r.top + window.scrollY
    height = r.height
  }
  measure()

  const update = () => {
    raf = 0
    const r = { top: top - window.scrollY, height }
    const vh = window.innerHeight
    const start = vh - r.height * 0.25 // top of the section when 25% of it is in view
    const end = vh / 2 - r.height / 2 // top of the section when it's centred
    const p = isReduced() ? 1 : Math.min(1, Math.max(0, (start - r.top) / Math.max(1, start - end)))
    root.style.setProperty('--p', p.toFixed(4))
    const landed = p > 0.85
    root.classList.toggle('is-landed', landed)
    pointer?.classList.toggle('is-drawn', landed)
  }
  const onScroll = () => {
    if (active && !raf) raf = requestAnimationFrame(update)
  }
  const io = new IntersectionObserver(([e]) => {
    active = e.isIntersecting
    onScroll()
  })
  io.observe(root)
  const ro = new ResizeObserver(() => {
    measure()
    onScroll()
  })
  ro.observe(document.body)
  window.addEventListener('scroll', onScroll, { passive: true })
  const off = onReducedChange(update)
  update()

  return () => {
    io.disconnect()
    ro.disconnect()
    window.removeEventListener('scroll', onScroll)
    off()
    cancelAnimationFrame(raf)
    root.style.removeProperty('--p')
  }
}
