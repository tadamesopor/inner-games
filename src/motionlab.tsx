// motion lab: every effect on its own, with a switch, so Ariën and Damian can choose before anything
// goes onto the real pages. open with /motion-lab or #motion-lab, it's not in the menu.
// every effect has its own file in src/lab/, the effects themselves are in src/motion/.
import { useEffect, useState, type ReactNode } from 'react'
import './motionlab.css'
import { forceReduced } from './motion'
import { Switch, type Effect } from './lab/ui'
import { rounded, RoundedDemo } from './lab/rounded'
import { speelpad, SpeelpadDemo } from './lab/speelpad'
import { button, ButtonDemo } from './lab/button'
import { cards, CardsDemo } from './lab/cards'
import { transition, TransitionDemo } from './lab/transition'
import { gamebox, GameboxDemo } from './lab/gamebox'
import { footer, FooterDemo } from './lab/footer'
import { menu, SiteMenu } from './lab/menu'

type Demo = (p: { on: boolean }) => ReactNode
const EFFECTS: [string, Effect, Demo | null][] = [
  ['rounded', rounded, RoundedDemo],
  ['speelpad', speelpad, SpeelpadDemo],
  ['split', button, ButtonDemo],
  ['lift', cards, CardsDemo],
  ['overgang', transition, TransitionDemo],
  ['spelbox', gamebox, GameboxDemo],
  ['footer', footer, FooterDemo],
  ['menu', menu, null], // the menu demo is the header of this page
]

export default function MotionLab() {
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(EFFECTS.map(([k]) => [k, true])))
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    forceReduced(reduced ? true : null)
    return () => forceReduced(null)
  }, [reduced])

  return (
    <div className="lab @container min-h-screen bg-white text-ig-ink">
      <SiteMenu on={on.menu} />

      <main id="top" className="mx-auto max-w-[1200px] px-4 pb-32 @3xl:px-8">
        <section className="grid gap-8 pb-20 pt-16 @3xl:grid-cols-[1fr_1fr] @3xl:pt-24">
          <div>
            <p className="text-base text-ig-ink/70">intern, niet in het menu</p>
            <h1 className="lab-balance mt-2 text-[64px] font-semibold leading-[0.95] tracking-tight">motion lab</h1>
          </div>
          <div className="max-w-[60ch] space-y-4 self-end text-xl leading-snug">
            <p>Elk effect staat hier los, met een schakelaar. Zo kiezen we samen wat bij InnerGames past, voordat het op de echte pagina’s komt.</p>
            <p className="text-base leading-relaxed text-ig-ink/80">
              Alles komt uit dezelfde bron: de oranje potloodlijn van een flip-over, en de hand uit het logo. De toets: merk je het tijdens het lezen, dan is het te veel.
            </p>
            <div className="flex flex-wrap items-center gap-6 border-t border-ig-ink/10 pt-4">
              <label className="flex items-center gap-3 text-base">
                minder beweging
                <Switch on={reduced} onChange={setReduced} label="minder beweging" />
              </label>
              <a href="/" className="text-base underline underline-offset-4">
                terug naar het prototype
              </a>
            </div>
          </div>
        </section>

        {EFFECTS.map(([key, e, Demo]) => (
          <section key={key} id={`fx-${key}`} className="grid scroll-mt-24 gap-6 border-t border-ig-ink/10 py-12 @3xl:grid-cols-[280px_1fr] @3xl:gap-16 @3xl:py-16">
            <div className="@3xl:sticky @3xl:top-24 @3xl:self-start">
              <p className="text-base text-[#C84413] tabular-nums">{e.n}</p>
              <h2 className="lab-balance mt-1 text-[28px] font-semibold leading-tight">{e.name}</h2>
              <p className="mt-3 text-base leading-relaxed">{e.what}</p>
              <p className="mt-3 text-base leading-relaxed text-ig-ink/70">{e.why}</p>
              <div className="mt-5 flex items-center justify-between gap-4 border-t border-ig-ink/10 pt-4">
                <code className="font-[inherit] text-[13px] text-ig-ink/70">{e.cls}</code>
                <Switch on={on[key]} onChange={(v) => setOn((o) => ({ ...o, [key]: v }))} label={e.name} />
              </div>
            </div>
            <div className="min-w-0">{Demo ? <Demo on={on[key]} /> : null}</div>
          </section>
        ))}
      </main>
    </div>
  )
}
