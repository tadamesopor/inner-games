// .ig-header-pill: shows the compact menu bar after 200px of scrolling, hides it again near the top.
// while hidden it's inert, so keyboard users don't tab into an invisible menu.

const LIMIT = 200

export function initHeaderPill(pill) {
  let raf = 0
  const update = () => {
    raf = 0
    const show = window.scrollY > LIMIT
    pill.classList.toggle('is-shown', show)
    pill.inert = !show
  }
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  update()
  return () => {
    window.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(raf)
  }
}
