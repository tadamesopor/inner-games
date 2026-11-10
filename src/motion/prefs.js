// shared helpers for all InnerGames motion. plain js, no framework, so it can be enqueued in WordPress.

const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
const root = document.documentElement
const listeners = new Set()
let forced = null // the motion lab can force reduced motion on or off; null = follow the OS

export function isReduced() {
  return forced ?? mq.matches
}

function apply() {
  root.classList.toggle('ig-reduced', isReduced())
  listeners.forEach((f) => f(isReduced()))
}

/** lab only: true/false to force, null to follow the OS again */
export function forceReduced(value) {
  forced = value
  apply()
}

export function onReducedChange(f) {
  listeners.add(f)
  return () => listeners.delete(f)
}

/** adds .ig-paused while the element is off screen, so slow loops don't run for nothing */
export function pauseOffscreen(el) {
  const io = new IntersectionObserver(([e]) => el.classList.toggle('ig-paused', !e.isIntersecting))
  io.observe(el)
  return () => {
    io.disconnect()
    el.classList.remove('ig-paused')
  }
}

// css can check .ig-js to know the fallbacks below are safe to use
root.classList.add('ig-js')
mq.addEventListener('change', apply)
apply()
