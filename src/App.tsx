import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Ctx, type PageId } from './wf'
import TestMode from './test'
// the motion effects from the lab (plain css + js in src/motion/, the same files that go into Enfold)
import { igNavigate, initCards } from './motion'
import { Contact, Home, Projects, Trainer, Workshop, Workshops } from './pages'
import { Game, Games, Preview } from './shop'
import { Team } from './team'

// the motion lab only loads when you open it, so the prototype itself stays exactly as it was
const MotionLab = lazy(() => import('./motionlab'))
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
  const [cart, setCart] = useState<string[]>([])
  const [mobile, setMobile] = useState(false)
  const [ann, setAnn] = useState(false)
  const [tasks, setTasks] = useState(false)
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
    const update = () =>
      flushSync(() => {
        setPage(p)
        setSel(id)
      })
    igNavigate(update, { mode: tasks ? 'short' : 'full', fadeTarget: view.current ?? undefined })
  }
  const toggleCart = (id: string) => setCart((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
  const Page = PAGES[page]
  const pill = (on: boolean) =>
    `rounded-full px-3 py-1.5 text-[13px] ${on ? 'bg-ig-yellow text-ig-ink' : 'text-white hover:bg-white/15'}`

  return (
    <Ctx.Provider value={{ ann, sel, cart, go, toggleCart }}>
      <div className={mobile ? 'flex justify-center bg-neutral-800 py-6' : ''}>
        <div ref={view} className="@container w-full overflow-x-clip bg-white text-ig-ink" style={mobile ? { width: 390 } : undefined} onClickCapture={() => bus.current?.()}>
          <Page key={page + sel} />
        </div>
      </div>
      {tasks && <TestMode pageKey={sel ? `${page}/${sel}` : page} go={go} bus={bus} />}
      <div className="fixed bottom-4 left-1/2 z-[70] max-w-[calc(100vw-1rem)] flex-wrap justify-center flex -translate-x-1/2 items-center gap-1 rounded-full bg-ig-ink p-1 shadow-xl" role="group" aria-label="Prototype-opties">
        <button className={pill(!mobile)} onClick={() => setMobile(false)}>desktop</button>
        <button className={pill(mobile)} onClick={() => setMobile(true)}>mobiel 390</button>
        <button className={pill(ann)} onClick={() => setAnn(!ann)}>labels {ann ? 'aan' : 'uit'}</button>
        <button className={pill(tasks)} onClick={() => setTasks(!tasks)} aria-pressed={tasks}>taken</button>
      </div>
    </Ctx.Provider>
  )
}
