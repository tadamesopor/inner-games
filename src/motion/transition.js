// page transition for the prototype (one page app). WordPress doesn't need this file:
// there the @view-transition rule in transition.css does the same on normal page loads.

import { isReduced } from './prefs.js'

/**
 * runs update() (which must change the page synchronously) inside a view transition.
 * without support or with reduced motion it just runs update().
 * the first page load never gets here, so it never has a transition.
 */
export function igNavigate(update) {
  if (!document.startViewTransition || isReduced()) {
    update()
    return
  }
  document.startViewTransition(update)
}
