// .ig-menu: knows when the tiles float over the page (.is-stuck: shadow, 94%), and opens and closes
// the folded list on narrow screens. works inside a scrolling box (the lab demo) and on a normal page.

function scrollParent(el) {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY
    if (o === 'auto' || o === 'scroll') return p
  }
  return null // the page itself
}

export function initMenu(nav) {
  // an empty marker where the menu would normally be; once it's scrolled past the top, the menu floats
  const sentinel = document.createElement('div')
  sentinel.setAttribute('aria-hidden', 'true')
  sentinel.style.cssText = 'height:1px;margin-bottom:-1px'
  nav.before(sentinel)
  const io = new IntersectionObserver(
    ([e]) => nav.classList.toggle('is-stuck', !e.isIntersecting && e.boundingClientRect.top < (e.rootBounds?.top ?? 0) + 12),
    { root: scrollParent(nav), rootMargin: '-12px 0px 0px 0px' },
  )
  io.observe(sentinel)

  const toggle = nav.querySelector('.ig-menu__toggle')
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open)
    toggle?.setAttribute('aria-expanded', String(open))
  }
  const onToggle = () => setOpen(!nav.classList.contains('is-open'))
  const onKey = (e) => e.key === 'Escape' && setOpen(false)
  toggle?.addEventListener('click', onToggle)
  nav.addEventListener('keydown', onKey)

  return () => {
    io.disconnect()
    sentinel.remove()
    toggle?.removeEventListener('click', onToggle)
    nav.removeEventListener('keydown', onKey)
    nav.classList.remove('is-stuck', 'is-open')
  }
}
