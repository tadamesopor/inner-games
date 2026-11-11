// .ig-pile: the cards move a few pixels with the mouse over the hero (--mx and --my between -1 and 1).
// only with a real mouse, and not with reduced motion: then they simply lie still.

import { isReduced } from './prefs.js'

export function initPile(pile) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {}
  const area = pile.closest('section') || pile
  let raf = 0
  let mx = 0
  let my = 0
  const apply = () => {
    raf = 0
    pile.style.setProperty('--mx', mx.toFixed(3))
    pile.style.setProperty('--my', my.toFixed(3))
  }
  const onMove = (e) => {
    if (isReduced()) return
    const r = area.getBoundingClientRect()
    mx = ((e.clientX - r.left) / r.width) * 2 - 1
    my = ((e.clientY - r.top) / r.height) * 2 - 1
    if (!raf) raf = requestAnimationFrame(apply)
  }
  const onLeave = () => {
    mx = 0
    my = 0
    if (!raf) raf = requestAnimationFrame(apply)
  }
  area.addEventListener('pointermove', onMove)
  area.addEventListener('pointerleave', onLeave)
  return () => {
    area.removeEventListener('pointermove', onMove)
    area.removeEventListener('pointerleave', onLeave)
    cancelAnimationFrame(raf)
  }
}
