// .ig-pawn: the real yellow InnerGames meeple as one component, so it can be swapped later
// (for example for a 3D model with <model-viewer>) without touching the path in speelpad.js.
// it stands with its feet on (0, 0): a soft contact shadow under it, a slight lean in the walking
// direction (max 8deg), and a hop with squash and stretch.

const NS = 'http://www.w3.org/2000/svg'
export const PAWN_SRC = '/assets/img/pawn/meeple-pawn.webp' // 109 x 119, sharp up to about 50px at 2x
const RATIO = 119 / 109

function el(name, attrs, parent) {
  const n = document.createElementNS(NS, name)
  for (const k in attrs) n.setAttribute(k, attrs[k])
  parent?.appendChild(n)
  return n
}

/** builds the pawn inside an svg. returns { node, pose(x, y, lean), hop() } */
export function createPawn(parent, { size = 38, src = PAWN_SRC } = {}) {
  const h = size * RATIO
  const node = el('g', { class: 'ig-pawn' }, parent)
  el('ellipse', { class: 'ig-pawn__shadow', cx: 0, cy: 0, rx: size * 0.42, ry: size * 0.11 }, node)
  const tilt = el('g', {}, node)
  const hopper = el('g', { class: 'ig-pawn__hop' }, tilt)
  // the photo leans a little to the right; -6deg stands it up
  el('image', { class: 'ig-pawn__img', href: src, x: -size / 2, y: -h * 0.97, width: size, height: h, transform: 'rotate(-6)' }, hopper)

  return {
    node,
    pose(x, y, lean) {
      const l = Math.max(-8, Math.min(8, lean))
      node.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`)
      tilt.setAttribute('transform', `rotate(${l.toFixed(1)})`)
    },
    hop() {
      node.classList.remove('is-hopping')
      void node.getBoundingClientRect() // restart the animation
      node.classList.add('is-hopping')
    },
  }
}
