import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Ctx, Footer, logEvent, type Cart, type PageId } from './wf'
import TestMode from './test'
// the motion effects from the lab (plain css + js in src/motion/, the same files that go into Enfold)
import { igNavigate, initCards } from './motion'
import { Contact, Home, Projects, Trainer, Workshop, Workshops } from './pages'
import { CartDrawer, Game, Games, Preview } from './shop'
import { Team } from './team'

// the motion lab only loads when you open it, so the prototype itself stays exactly as it was
const MotionLab = lazy(() => import('./motionlab'))
const CART_KEY = 'ig-cart'
const isLab = () => location.pathname === '/motion-lab' || location.hash === '#motion-lab'

const PAGES: Record<PageId, () => React.ReactNode> = {
  home: Home,
  workshops: Workshops,
  workshop: Workshop,
  games: Games,
  game: Game,
  preview: Preview,
  projects: Projects,
  trainer: Trainer,
  team: Team,
  contact: Contact,
}

export default function App() {
  const [page, setPage] = useState<PageId>('home')
  const [sel, setSel] = useState('')
  // the cart survives page changes and a reload (localStorage). a new test session empties it
  const [cart, setCart] = useState<Cart>(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '{}')
    } catch {
      return {}
    }
  })
  const [cartOpen, setCartOpen] = useState(false)
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart))
    } catch {
      /* private window: the cart only lives in memory */
    }
  }, [cart])
  useEffect(() => {
    const reset = () => setCart({})
    window.addEventListener('ig:cart-reset', reset)
    return () => window.removeEventListener('ig:cart-reset', reset)
  }, [])
  const closeCart = useCallback(() => setCartOpen(false), [])
  const [mobile, setMobile] = useState(false)
  const [ann, setAnn] = useState(false)
  const [tasks, setTasks] = useState(false)
  const [footer, setFooter] = useState<'hand' | 'foto'>('hand')
  const bus = useRef<(() => void) | undefined>(undefined)
  const [lab, setLab] = useState(isLab)

  const view = useRef<HTMLDivElement>(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    return view.current ? initCards(view.current) : undefined
  }, [page, sel])

  // the lab's own menu uses #fx-... links, so only ever switch the lab on here, never off
  useEffect(() => {
    const onHash = () => isLab() && setLab(true)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (lab)
    return (
      <Suspense fallback={null}>
        <MotionLab />
      </Suspense>
    )

  // every page change goes through the pencil transition (src/motion/transition.js). the page itself
  // changes while the screen is orange. in test mode the short version (460ms, no wave), so it doesn't
  // slow the tasks down. reduced motion: a short fade. the first page load has no transition
  const go = (p: PageId, id = '') => {
    setCartOpen(false)
    const update = () =>
      flushSync(() => {
        setPage(p)
        setSel(id)
      })
    igNavigate(update, { mode: tasks ? 'short' : 'full', fadeTarget: view.current ?? undefined })
  }
  const addToCart = (slug: string, n: number) => {
    setCart((c) => ({ ...c, [slug]: Math.min(99, (c[slug] ?? 0) + n) }))
    logEvent('cart:add', `${n}× ${slug}`)
  }
  const setQty = (slug: string, n: number) => {
    const was = cart[slug] ?? 0
    if (n > was) logEvent('cart:add', `${n - was}× ${slug}`)
    if (n < was) logEvent('cart:remove', `${was - n}× ${slug}`)
    setCart((c) => {
      const next = { ...c }
      if (n <= 0) delete next[slug]
      else next[slug] = Math.min(99, n)
      return next
    })
  }
  const Page = PAGES[page]
  const pill = (on: boolean) =>
    `rounded-full px-3 py-1.5 text-[13px] ${on ? 'bg-ig-yellow text-ig-ink' : 'text-white hover:bg-white/15'}`

  return (
    <Ctx.Provider value={{ ann, footer, sel, cart, go, addToCart, setQty, openCart: () => setCartOpen(true) }}>
      <div className={mobile ? 'flex justify-center bg-neutral-800 py-6' : ''}>
        <div ref={view} className="@container w-full overflow-x-clip bg-white text-ig-ink" style={mobile ? { width: 390 } : undefined} onClickCapture={() => bus.current?.()}>
          {/* the page lies on top of the footer: when you reach the end, it slides up with a rounded
              bottom and the footer appears underneath (src/motion/footer.css) */}
          <div className="ig-reveal-cover bg-white">
            <Page key={page + sel} />
          </div>
          <Footer />
        </div>
      </div>
      <CartDrawer open={cartOpen} onClose={closeCart} />
      {tasks && <TestMode pageKey={sel ? `${page}/${sel}` : page} go={go} bus={bus} />}
      <div className="fixed bottom-4 left-1/2 z-[70] max-w-[calc(100vw-1rem)] flex-wrap justify-center flex -translate-x-1/2 items-center gap-1 rounded-full bg-ig-ink p-1 shadow-xl" role="group" aria-label="Prototype-opties">
        <button className={pill(!mobile)} onClick={() => setMobile(false)}>desktop</button>
        <button className={pill(mobile)} onClick={() => setMobile(true)}>mobiel 390</button>
        <button className={pill(ann)} onClick={() => setAnn(!ann)}>labels {ann ? 'aan' : 'uit'}</button>
        <button className={pill(tasks)} onClick={() => setTasks(!tasks)} aria-pressed={tasks}>taken</button>
        {/* footer option A or B, so Ariën can choose on the real pages */}
        <button className={pill(false)} onClick={() => setFooter(footer === 'hand' ? 'foto' : 'hand')}>footer: {footer}</button>
      </div>
    </Ctx.Provider>
  )
}
