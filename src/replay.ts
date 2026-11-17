// replay mode (/?replay=1): the website inside the replay player of public/test/viewer.html.
// the viewer tells it which page to open and how far to scroll, the cursor is drawn by the viewer on top.
// in replay mode: no participant mode, no tracking, no prototype tools, no page transition, an empty cart.
// it never reads or writes ig:participant, so a real test session in the same browser stays as it is.
//
// messages from the viewer (only from the same origin):
//   { type: 'go', page, sel }        open a page, without browser history
//   { type: 'scroll', y }            scroll to y px, instantly
//   { type: 'reset' }                home page, scroll 0, empty cart, no task bar
//   { type: 'task', title, text }    show the task bar like the participant saw it (or text: '' to hide it)
// answers to the viewer: { type: 'ready', page, sel, h, build } once the page has rendered

let on: boolean | undefined
export const isReplay = () => (on ??= new URLSearchParams(location.search).get('replay') === '1')

export type ReplayBar = { title: string; text: string } | null

type Hooks = {
  go: (page: string, sel: string) => boolean // false when the page doesn't exist
  page: () => { page: string; sel: string }
  bar: (b: ReplayBar) => void
}

const tell = (msg: Record<string, unknown>) => parent !== window && parent.postMessage(msg, location.origin)

// two frames and a moment for images and fonts, then the page has its real height
const whenRendered = () => new Promise<void>((res) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(res, 150))))
const ready = async () => {
  await whenRendered()
  return { h: document.documentElement.scrollHeight, build: __BUILD__ }
}

export function startReplay(h: Hooks) {
  // the page in an iframe never scrolls by itself (smooth scroll would lag behind the replay)
  document.documentElement.style.scrollBehavior = 'auto'
  const onMsg = async (e: MessageEvent) => {
    if (e.origin !== location.origin || e.source !== parent) return // only the viewer on this site
    const m = e.data as { type?: string; page?: unknown; sel?: unknown; y?: unknown; title?: unknown; text?: unknown }
    if (!m || typeof m !== 'object') return
    if (m.type === 'go') {
      const ok = h.go(String(m.page ?? 'home'), String(m.sel ?? ''))
      tell({ type: 'ready', ...h.page(), ok, ...(await ready()) })
    }
    if (m.type === 'scroll' && typeof m.y === 'number') window.scrollTo({ top: m.y, behavior: 'instant' })
    if (m.type === 'task') h.bar(m.text ? { title: String(m.title ?? ''), text: String(m.text) } : null)
    if (m.type === 'reset') {
      window.dispatchEvent(new Event('ig:cart-reset'))
      h.bar(null)
      h.go('home', '')
      window.scrollTo({ top: 0, behavior: 'instant' })
      tell({ type: 'ready', ...h.page(), ok: true, ...(await ready()) })
    }
  }
  window.addEventListener('message', onMsg)
  window.dispatchEvent(new Event('ig:cart-reset'))
  // the first page has loaded: the viewer can start
  ready().then((r) => tell({ type: 'ready', ...h.page(), ok: true, first: true, ...r }))
  return () => window.removeEventListener('message', onMsg)
}
