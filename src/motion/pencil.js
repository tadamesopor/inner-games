// the pencil line: the orange marker line a facilitator draws on a flipchart. every effect uses it.
// - one svg filter (#ig-pencil) gives the edge a light grain, so it's never perfectly smooth
// - drawn marks (pawn, tick, arrow, underline, scribble) are svg files in /assets/draw/.
//   to use Damian's own drawings: replace the file, keep the name. paths only, no styling needed.
//   a path with class="ig-fill" gets the cream fill (the pawn's body).

let base = '/assets/draw/'
const cache = new Map()

/** WordPress: the theme folder instead of /assets/draw/ */
export function setPencilBase(url) {
  base = url.endsWith('/') ? url : url + '/'
}

/** the grain filter, added to the page once */
export function ensurePencilDefs() {
  if (document.getElementById('ig-pencil')) return
  const holder = document.createElement('div')
  holder.setAttribute('aria-hidden', 'true')
  holder.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'
  holder.innerHTML = `<svg width="0" height="0" focusable="false"><defs>
    <filter id="ig-pencil" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="grain"/>
      <feDisplacementMap in="SourceGraphic" in2="grain" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>
    </filter></defs></svg>`
  document.body.appendChild(holder)
}

/** loads /assets/draw/<name>.svg once: its viewBox and the shapes inside */
export function loadMark(name) {
  if (!cache.has(name)) {
    cache.set(
      name,
      fetch(base + name + '.svg')
        .then((r) => r.text())
        .then((text) => {
          const svg = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement
          const shapes = [...svg.querySelectorAll('path, line, polyline, circle, ellipse')]
          // pathLength=1 makes "draw itself" work the same for every mark
          shapes.forEach((s) => s.setAttribute('pathLength', '1'))
          return { viewBox: svg.getAttribute('viewBox') || '0 0 24 24', inner: shapes.map((s) => s.outerHTML.replace(/ xmlns="[^"]*"/g, '')).join('') }
        }),
    )
  }
  return cache.get(name)
}

/** the markup inside a pencil <svg>. the invisible box gives the filter a real area,
    otherwise a flat line (zero height) would lose its grain */
export function markMarkup(mark) {
  const [x, y, w, h] = mark.viewBox.split(/[\s,]+/).map(Number)
  return `<g class="ig-pencil__grain"><rect class="ig-pencil__box" x="${x}" y="${y}" width="${w}" height="${h}"/>${mark.inner}</g>`
}

/** WordPress: fills every <svg data-pencil="name"> on the page with its drawn mark */
export async function hydrateMarks(root = document) {
  ensurePencilDefs()
  const els = [...root.querySelectorAll('svg[data-pencil]')]
  await Promise.all(
    els.map(async (el) => {
      const mark = await loadMark(el.dataset.pencil)
      el.setAttribute('viewBox', mark.viewBox)
      el.classList.add('ig-pencil')
      el.innerHTML = markMarkup(mark)
    }),
  )
}

ensurePencilDefs()
