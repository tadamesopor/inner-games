// .ig-nav: makes the bar compact after 120px of scrolling (.is-compact), opens and closes the
// "over ons" dropdown, and the full screen menu on small screens (.is-open). Escape closes everything.
// works on a normal page and inside a scrolling box (the motion lab demo).

const COMPACT_AT = 120

function scrollParent(el) {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY
    if (o === 'auto' || o === 'scroll') return p
  }
  return null // the page itself
}

export function initNav(nav) {
  const box = scrollParent(nav)
  const target = box || window
  const onScroll = () => nav.classList.toggle('is-compact', (box ? box.scrollTop : window.scrollY) > COMPACT_AT)

  const drops = [...nav.querySelectorAll('.ig-nav__drop')]
  const setDrop = (drop, open) => {
    drop.classList.toggle('is-open', open)
    drop.querySelector(':scope > button')?.setAttribute('aria-expanded', String(open))
  }
  const closeDrops = () => drops.forEach((d) => setDrop(d, false))

  const opener = nav.querySelector('[data-nav-open]')
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open)
    opener?.setAttribute('aria-expanded', String(open))
    if (open) nav.querySelector('.ig-nav__sheet [data-nav-close]')?.focus()
    else if (nav.contains(document.activeElement)) opener?.focus()
  }

  const onClick = (e) => {
    const t = e.target
    const dropBtn = t.closest('.ig-nav__drop > button')
    if (dropBtn) {
      const drop = dropBtn.parentElement
      const open = !drop.classList.contains('is-open')
      closeDrops()
      setDrop(drop, open)
      return
    }
    if (t.closest('[data-nav-open]')) return setOpen(true)
    if (t.closest('[data-nav-close]')) return setOpen(false)
    // a link in the dropdown or the full screen menu: close them, the page changes underneath
    if (t.closest('.ig-nav__sub a, .ig-nav__sheet a, .ig-nav__sheet .ig-btn-split')) {
      closeDrops()
      nav.classList.remove('is-open')
    }
  }
  const onDocClick = (e) => {
    if (!e.target.closest?.('.ig-nav__drop')) closeDrops()
  }
  const onKey = (e) => {
    if (e.key !== 'Escape') return
    closeDrops()
    if (nav.classList.contains('is-open')) setOpen(false)
  }

  nav.addEventListener('click', onClick)
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
  target.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  return () => {
    nav.removeEventListener('click', onClick)
    document.removeEventListener('click', onDocClick)
    document.removeEventListener('keydown', onKey)
    target.removeEventListener('scroll', onScroll)
    nav.classList.remove('is-compact', 'is-open')
    closeDrops()
  }
}
