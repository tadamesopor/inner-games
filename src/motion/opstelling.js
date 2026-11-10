// .ig-bg-opstelling: the three rings of the Elemental Five floor layout, seen from above, with five
// round floor cards in the element colours. the set turns very slowly (css). when a block with
// [data-opstelling-ring="0|1|2"] comes into view, that ring lights up a little.

import { pauseOffscreen } from './prefs.js'

const NS = 'http://www.w3.org/2000/svg'

// TODO: check these colours against the real card art (vuur, lucht, aarde, water, ether)
const ELEMENTS = [
  ['vuur', '#e0582c'],
  ['lucht', '#8fc3d6'],
  ['aarde', '#e8a93a'],
  ['water', '#3c8f8a'],
  ['ether', '#a98fbf'],
]
const RINGS = [96, 176, 256]

export function initOpstelling(root) {
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('class', 'ig-opstelling__svg')
  svg.setAttribute('viewBox', '0 0 600 600')
  svg.setAttribute('aria-hidden', 'true')
  const set = document.createElementNS(NS, 'g')
  set.setAttribute('class', 'ig-opstelling__set')

  const rings = RINGS.map((r) => {
    const c = document.createElementNS(NS, 'circle')
    c.setAttribute('cx', 300)
    c.setAttribute('cy', 300)
    c.setAttribute('r', r)
    c.setAttribute('class', 'ig-opstelling__ring')
    set.appendChild(c)
    return c
  })
  // the floor cards lie on the middle ring, slightly irregular, like people put them down by hand
  ELEMENTS.forEach(([name, colour], i) => {
    const a = ((-90 + i * 72 + [0, 6, -4, 3, -7][i]) * Math.PI) / 180
    const c = document.createElementNS(NS, 'circle')
    c.setAttribute('cx', (300 + Math.cos(a) * RINGS[1]).toFixed(1))
    c.setAttribute('cy', (300 + Math.sin(a) * RINGS[1]).toFixed(1))
    c.setAttribute('r', 22)
    c.setAttribute('fill', colour)
    c.setAttribute('class', 'ig-opstelling__card')
    c.dataset.element = name
    set.appendChild(c)
  })
  svg.appendChild(set)
  root.prepend(svg)

  const light = (i) => rings.forEach((r, k) => r.classList.toggle('is-lit', k === i))
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && light(Number(e.target.dataset.opstellingRing))),
    { rootMargin: '-40% 0px -40% 0px' }, // only the block in the middle of the screen counts
  )
  root.querySelectorAll('[data-opstelling-ring]').forEach((b) => io.observe(b))
  const stopPause = pauseOffscreen(root)

  return () => {
    io.disconnect()
    stopPause()
    svg.remove()
  }
}

/** adem has no js of its own, it only needs to pause off screen */
export const initAdem = pauseOffscreen
