import { useEffect, useRef, useState } from 'react'
import { Ctx, WireCtx, type PageId } from './wf'
import TestMode from './test'
import { Contact, Home, Projects, Trainer, Workshop, Workshops } from './pages'
import { Game, Games, Preview } from './shop'
import { Team } from './team'

/* v5: the wireframe view is gone. WireCtx stays (always false) so older components keep working. */

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
  const [bar, setBar] = useState(false)
  const bus = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page, sel])

  const go = (p: PageId, id = '') => {
    setPage(p)
    setSel(id)
  }
  const toggleCart = (id: string) => setCart((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
  const Page = PAGES[page]
  const pill = (on: boolean) =>
    `rounded-full px-3 py-1.5 text-[13px] ${on ? 'bg-ig-yellow text-ig-ink' : 'text-white hover:bg-white/15'}`

  return (
    <Ctx.Provider value={{ ann, sel, cart, go, toggleCart }}>
      <WireCtx.Provider value={false}>
        <div className={mobile ? 'flex justify-center bg-neutral-800 py-6' : ''}>
          <div className="@container w-full overflow-x-clip bg-white text-ig-ink" style={mobile ? { width: 390 } : undefined} onClickCapture={() => bus.current?.()}>
            <Page key={page + sel} />
          </div>
        </div>
        {tasks && <TestMode setMobile={setMobile} pageKey={sel ? `${page}/${sel}` : page} go={go} bus={bus} />}
      </WireCtx.Provider>
      {/* prototype options: a small button in the bottom-left corner, so it never covers the content */}
      <div data-test-ui className="fixed bottom-3 left-3 z-[70] flex items-center gap-1 rounded-full bg-ig-ink/90 p-1 text-white" role="group" aria-label="Prototype-opties">
        <button className={pill(bar)} onClick={() => setBar(!bar)} aria-expanded={bar} aria-label="prototype-opties tonen of verbergen">
          {bar ? '×' : '⚙'}
        </button>
        {bar && (
          <>
            <button className={pill(!mobile)} onClick={() => setMobile(false)}>desktop</button>
            <button className={pill(mobile)} onClick={() => setMobile(true)}>mobiel 390</button>
            <button className={pill(ann)} onClick={() => setAnn(!ann)}>labels {ann ? 'aan' : 'uit'}</button>
            <button className={pill(tasks)} onClick={() => setTasks(!tasks)} aria-pressed={tasks}>taken</button>
          </>
        )}
      </div>
    </Ctx.Provider>
  )
}
