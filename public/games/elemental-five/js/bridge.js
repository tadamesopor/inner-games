/* only in the prototype: talks to the site when the game runs in an iframe.
   - "koop het spel" and "boek een workshop" open the prototype's own pages instead of innergames.nl
   - the test tool gets e5:start, e5:element-done and e5:finished
   on its own (not in an iframe) this does nothing, and the links go to innergames.nl as before */
(() => {
  if (window.parent === window) return;
  const send = (type, detail) => window.parent.postMessage({ type, detail: detail || '' }, location.origin);

  // inside the site the frame is exactly one screen: no scrollbars, the screens fit on their own
  const st = document.createElement('style');
  st.textContent = '*{scrollbar-width:none}*::-webkit-scrollbar{display:none}';
  document.head.appendChild(st);

  // the shop links: the site navigates the top window
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const to = a.href === LINKS.koop ? 'koop' : a.href === LINKS.workshop ? 'workshop' : null;
    if (!to) return;
    e.preventDefault();
    send('e5:link', to);
  }, true);

  // started: the play button or one of the five cards on the title screen
  let started = false;
  document.addEventListener('click', e => {
    if (e.target.closest('#restart')) started = false;
    if (started || !e.target.closest('#play, .t-card')) return;
    started = true;
    send('e5:start', e.target.closest('.t-card')?.dataset.el || 'speel');
  }, true);

  // the game calls these by name, so wrapping them is enough
  const done = elementDone;
  elementDone = function (el, n) { send('e5:element-done', `${el} ${n}`); return done.apply(this, arguments); };
  const fin = finish;
  finish = function () { send('e5:finished', `${Object.keys(S.picks).length} van 5`); started = false; return fin.apply(this, arguments); };
})();
