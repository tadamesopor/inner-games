// .ig-boxscene: turns the scroll position inside the scene into --p (0 to 1). css does the rest.
// .is-landed when the box is down, so the drawn arrow to the button can draw itself.
// reduced motion: --p is always 1, the end state.

import { isReduced, onReducedChange } from './prefs.js'

export function initBoxscene(root) {
  let raf = 0
  let active = false
  const pointer = root.querySelector('.ig-boxscene__pointer')

  const update = () => {
    raf = 0
    const r = root.getBoundingClientRect()
    const range = Math.max(1, r.height - window.innerHeight)
    const p = isReduced() ? 1 : Math.min(1, Math.max(0, -r.top / range))
    root.style.setProperty('--p', p.toFixed(4))
    const landed = p > 0.72
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
  window.addEventListener('scroll', onScroll, { passive: true })
  const off = onReducedChange(update)
  update()

  return () => {
    io.disconnect()
    window.removeEventListener('scroll', onScroll)
    off()
    cancelAnimationFrame(raf)
    root.style.removeProperty('--p')
  }
}
