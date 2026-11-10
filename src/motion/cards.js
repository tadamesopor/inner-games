// .ig-card: gives every card a tiny random tilt and position for its hand, so they don't all pop up
// identically. on touch screens (no hover) the hand greets once when the card scrolls into view.

export function initCards(root = document) {
  const cards = root.matches?.('.ig-card') ? [root] : [...root.querySelectorAll('.ig-card')]
  cards.forEach((card, i) => {
    // seeded by position, so it's the same on every load
    const r1 = Math.sin(i * 12.9898 + 1) * 43758.5453
    const r2 = Math.sin(i * 78.233 + 2) * 12543.1234
    const a = r1 - Math.floor(r1)
    const b = r2 - Math.floor(r2)
    card.style.setProperty('--hand-tilt', `${((a - 0.5) * 6).toFixed(1)}deg`)
    card.style.setProperty('--hand-x', `${((b - 0.5) * 12).toFixed(1)}px`)
  })

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {}

  const timers = []
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        io.unobserve(e.target)
        e.target.classList.add('is-greeting')
        timers.push(setTimeout(() => e.target.classList.remove('is-greeting'), 1600))
      }),
    { threshold: 0.6 },
  )
  cards.forEach((c) => io.observe(c))
  return () => {
    io.disconnect()
    timers.forEach(clearTimeout)
  }
}
