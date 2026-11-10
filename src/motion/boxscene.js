// .ig-boxscene: makes the scroll animation play once. css does the animation itself.
// - is-in: the scene is in view (starts the time-based fallback in browsers without scroll timelines)
// - is-done: every part has reached its end, so the animation is dropped and the end state stays,
//   also when you scroll back up

export function initBoxscene(root) {
  const parts = [...root.querySelectorAll('.ig-boxscene__box, .ig-boxscene__card')]
  let raf = 0

  const seen = new IntersectionObserver(([e]) => e.isIntersecting && root.classList.add('is-in'), { threshold: 0.35 })
  seen.observe(root)

  // done = all scroll animations at 100%. reading the animations themselves is more exact than
  // guessing from the scroll position, because the ranges live in the css
  const check = () => {
    raf = 0
    const anims = parts.flatMap((p) => p.getAnimations())
    if (anims.length && anims.every((a) => (a.effect?.getComputedTiming().progress ?? 0) >= 0.999)) finish()
  }
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(check)
  }
  const finish = () => {
    root.classList.add('is-done')
    stop()
  }
  const stop = () => {
    window.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(raf)
  }
  if (CSS.supports('animation-timeline: view()')) window.addEventListener('scroll', onScroll, { passive: true })

  return () => {
    seen.disconnect()
    stop()
  }
}
