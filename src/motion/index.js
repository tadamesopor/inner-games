// one entry for all InnerGames motion. the React app imports this; in WordPress the same files are
// enqueued and init() is called once on DOMContentLoaded.
import './tokens.css'
import './pencil.css'
import './sections.css'
import './backgrounds.css'
import './buttons.css'
import './cards.css'
import './transition.css'
import './boxscene.css'
import './footer.css'
import './header.css'

import { initSpeelpad } from './speelpad.js'
import { initBoxscene } from './boxscene.js'
import { initHeaderPill } from './header.js'

export { isReduced, forceReduced, onReducedChange } from './prefs.js'
export { igNavigate } from './transition.js'
export { loadMark, markMarkup, hydrateMarks, setPencilBase, ensurePencilDefs } from './pencil.js'
export { initSpeelpad, initBoxscene, initHeaderPill }

/** WordPress: finds every element with a motion class and starts it */
export function init(scope = document) {
  const map = {
    '.ig-bg-speelpad': initSpeelpad,
    '.ig-boxscene': initBoxscene,
    '.ig-header-pill': initHeaderPill,
  }
  const stops = []
  for (const sel in map) scope.querySelectorAll(sel).forEach((el) => stops.push(map[sel](el)))
  return () => stops.forEach((s) => s())
}
