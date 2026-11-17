// .ig-pawn: the real yellow InnerGames meeple as one component, so it can be swapped later
// (for example for a 3D model with <model-viewer>) without touching the path in speelpad.js.
// it stands with its feet on (0, 0): a soft contact shadow under it, a slight lean in the walking
// direction (max 8deg), and a hop with squash and stretch.
// plain html on its own layer: it only ever moves with transform, so walking never repaints the page.

export const PAWN_SRC = '/assets/img/pawn/meeple-pawn.webp' // 109 x 119, sharp up to about 50px at 2x
const RATIO = 119 / 109
const EASE_OUT = 'cubic-bezier(0.2, 0.7, 0.2, 1)' // --ease-out in tokens.css

function div(cls, parent) {
  const n = document.createElement('div')
  n.className = cls
  parent?.appendChild(n)
  return n
}

/** builds the pawn inside an element. returns { node, pose(x, y, lean), hop() } */
export function createPawn(parent, { size = 38, src = PAWN_SRC } = {}) {
  const h = size * RATIO
  const node = div('ig-pawn', parent)
  node.setAttribute('aria-hidden', 'true')
  const shadow = div('ig-pawn__shadow', node)
  shadow.style.cssText = `width:${size * 0.84}px;height:${size * 0.22}px;margin:${-size * 0.11}px 0 0 ${-size * 0.42}px`
  const tilt = div('ig-pawn__tilt', node)
  const hopper = div('ig-pawn__hop', tilt)
  const img = document.createElement('img')
  img.className = 'ig-pawn__img'
  img.src = src
  img.alt = ''
  img.decoding = 'async'
  // the photo leans to the right; -14deg stands it up
  img.style.cssText = `width:${size}px;height:${h}px;left:${-size / 2}px;top:${-h * 0.97}px`
  hopper.appendChild(img)

  let x = NaN, y = NaN, l = NaN
  return {
    node,
    pose(nx, ny, lean) {
      const nl = Math.round(Math.max(-8, Math.min(8, lean)) * 10) / 10
      // only write what changed: every write is a style change
      if (nx !== x || ny !== y) node.style.transform = `translate3d(${nx.toFixed(1)}px, ${ny.toFixed(1)}px, 0)`
      if (nl !== l) tilt.style.transform = `rotate(${nl}deg)`
      x = nx
      y = ny
      l = nl
    },
    // squash before the jump, stretch in the air, a small squash when it lands. web animations: they run on
    // the compositor, and restarting one needs no layout read
    hop() {
      hopper.animate(
        [
          { transform: 'scale(1, 1)' },
          { transform: 'scale(1.1, 0.88)', offset: 0.14 },
          { transform: 'translateY(-8px) scale(0.94, 1.08)', offset: 0.45 },
          { transform: 'translateY(0) scale(1.07, 0.92)', offset: 0.78 },
          { transform: 'scale(1, 1)' },
        ],
        { duration: 460, easing: EASE_OUT },
      )
      shadow.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0.55)', opacity: 0.4, offset: 0.45 }, { transform: 'scale(1)', opacity: 1 }], { duration: 460, easing: EASE_OUT })
    },
  }
}
