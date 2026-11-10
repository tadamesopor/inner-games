// motion lab: every effect on its own, with a switch, so Ariën and Damian can choose before anything
// goes onto the real pages. open with /motion-lab or #motion-lab, it's not in the menu.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { ALT, GAMES, PHOTOS, WORKSHOPS } from './data'
import { Photo } from './wf'
import './motionlab.css'
import { SplitBtn, Switch, useEffectInit } from './lab/ui'
import { button, ButtonDemo } from './lab/button'
import { cards, CardsDemo } from './lab/cards'
import { transition, TransitionDemo } from './lab/transition'
import { gamebox, GameboxDemo } from './lab/gamebox'
import { speelpad, SpeelpadDemo } from './lab/speelpad'
import { forceReduced, igNavigate, initBoxscene, initHeaderPill } from './motion'

type Key = 'rounded' | 'speelpad' | 'split' | 'lift' | 'overgang' | 'spelbox' | 'footer' | 'menu'

const EFFECTS: { key: Key; n: string; name: string; cls: string; what: string; why: string }[] = [
  { key: 'rounded', n: '01', name: 'afgeronde secties', cls: '.ig-section--rounded', what: 'De gekleurde kop eindigt met grote ronde hoeken. De volgende sectie schuift eronder.', why: 'De pagina voelt als gestapelde kaarten, en je ziet dat er meer komt.' },
  { key: 'speelpad', ...speelpad },
  { key: 'split', ...button },
  { key: 'lift', ...cards },
  { key: 'overgang', ...transition },
  { key: 'spelbox', ...gamebox },
  { key: 'footer', n: '09', name: 'doos in de footer', cls: '.ig-footer-box', what: 'Een speldoos staat schuin in de footer en draait 4° mee als de footer in beeld komt.', why: 'De pagina eindigt bij het product.' },
  { key: 'menu', n: '10', name: 'compacte menubalk', cls: '.ig-header-pill', what: 'Na 200px scrollen komt bovenaan een kleine menubalk in het midden. Bovenaan de pagina gaat hij weer weg.', why: 'Het menu is altijd bij de hand, zonder de hele breedte te pakken. Niet op mobiel.' },
]

/* ---------------- demos ---------------- */

function DemoRounded({ on }: { on: boolean }) {
  return (
    <div className="lab-frame bg-white @container">
      <section className={`bg-ig-orange px-6 pb-16 pt-12 text-ig-ink @3xl:px-12 ${on ? 'ig-section--rounded' : ''}`}>
        <p className="text-base">spelen om te leren · spelen om te groeien</p>
        <h3 className="lab-balance mt-4 max-w-[14ch] text-[40px] font-semibold leading-[1.02] tracking-tight @3xl:text-[64px]">inner growth for outer change.</h3>
      </section>
      <section className="bg-ig-cream px-6 pb-12 @3xl:px-12" style={on ? undefined : { paddingTop: 48 }}>
        <h3 className="text-[28px] font-semibold leading-tight">waar kom jij voor?</h3>
        <div className="mt-6 flex flex-wrap gap-2">
          {['onderwijs', 'organisaties', 'zorg', 'trainers'].map((a) => (
            <span key={a} className="rounded-full bg-white px-4 py-2 text-base">{a}</span>
          ))}
        </div>
      </section>
    </div>
  )
}

function DemoFooter({ on }: { on: boolean }) {
  return (
    <div className="lab-frame @container">
      <footer className={`relative min-h-[360px] overflow-clip bg-ig-orange px-6 py-12 text-ig-ink @3xl:px-12 ${on ? 'ig-footer' : ''}`}>
        <div className="relative z-[1] grid max-w-[560px] gap-8 @3xl:grid-cols-2">
          <div className="space-y-1 text-base">
            <p className="font-semibold">bezoekadres</p>
            <p>InnerGames</p>
            <p>Kronehoefstraat 87</p>
            <p>5612 HL Eindhoven</p>
          </div>
          <div className="space-y-1 text-base">
            <p className="font-semibold">bel, app of mail ons</p>
            <p>+31 (0)6 – 215 27 855</p>
            <p>info@innergames.nl</p>
          </div>
        </div>
        {on && <img className="ig-footer-box" src="/assets/img/games/sociality-box.png" alt="" width={398} height={459} />}
      </footer>
    </div>
  )
}

/* ---------------- the lab page ---------------- */

export default function MotionLab() {
  const [on, setOn] = useState<Record<Key, boolean>>(() => Object.fromEntries(EFFECTS.map((e) => [e.key, true])) as Record<Key, boolean>)
  const [reduced, setReduced] = useState(false)
  const pill = useRef<HTMLElement>(null)
  useEffectInit(pill, initHeaderPill, on.menu)

  useEffect(() => {
    forceReduced(reduced ? true : null)
    return () => forceReduced(null)
  }, [reduced])

  const demos: Record<Key, ReactNode> = {
    rounded: <DemoRounded on={on.rounded} />,
    speelpad: <SpeelpadDemo on={on.speelpad} />,
    split: <ButtonDemo on={on.split} />,
    lift: <CardsDemo on={on.lift} />,
    overgang: <TransitionDemo on={on.overgang} />,
    spelbox: <GameboxDemo on={on.spelbox} />,
    footer: <DemoFooter on={on.footer} />,
    menu: (
      <div className="lab-frame bg-ig-cream p-8 text-base leading-relaxed">
        Scroll op deze pagina meer dan 200px naar beneden: bovenaan in het midden verschijnt de compacte menubalk. Op een telefoon blijft het gewone menu.
      </div>
    ),
  }

  return (
    <div className="lab @container min-h-screen bg-white text-ig-ink">
      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-6 @3xl:px-8">
        <div className="flex items-center gap-4">
          <img src="/assets/logo.png" alt="InnerGames" className="h-12 w-auto" />
          <span className="text-base text-ig-ink/70">motion lab · intern, niet in het menu</span>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-3 text-base">
            minder beweging
            <Switch on={reduced} onChange={setReduced} label="minder beweging" />
          </label>
          <a href="/" className="text-base underline underline-offset-4">
            terug naar het prototype
          </a>
        </div>
      </header>

      {on.menu && (
        <nav ref={pill} className="ig-header-pill" aria-label="Effecten">
          {EFFECTS.slice(0, 9).map((e) => (
            <a key={e.key} href={`#fx-${e.key}`}>{e.n.slice(0, 2)}</a>
          ))}
          <a href="#top">naar boven</a>
        </nav>
      )}

      <main id="top" className="mx-auto max-w-[1200px] px-4 pb-32 @3xl:px-8">
        <section className="grid gap-8 pb-20 pt-12 @3xl:grid-cols-[1fr_1fr] @3xl:pt-20">
          <h1 className="lab-balance text-[64px] font-semibold leading-[0.95] tracking-tight">motion lab</h1>
          <div className="max-w-[60ch] space-y-4 self-end text-xl leading-snug">
            <p>Elk effect staat hier los, met een schakelaar. Zo kiezen we samen wat bij InnerGames past, voordat het op de echte pagina’s komt.</p>
            <p className="text-base leading-relaxed text-ig-ink/80">
              De toets: merk je het tijdens het lezen, dan is het te veel. Zet <em>minder beweging</em> aan om te zien wat iemand ziet die beweging uit heeft staan.
            </p>
          </div>
        </section>

        {EFFECTS.map((e) => (
          <section key={e.key} id={`fx-${e.key}`} className="grid scroll-mt-24 gap-6 border-t border-ig-ink/10 py-12 @3xl:grid-cols-[280px_1fr] @3xl:gap-16 @3xl:py-16">
            <div className="@3xl:sticky @3xl:top-24 @3xl:self-start">
              <p className="text-base text-[#C84413] tabular-nums">{e.n}</p>
              <h2 className="lab-balance mt-1 text-[28px] font-semibold leading-tight">{e.name}</h2>
              <p className="mt-3 text-base leading-relaxed">{e.what}</p>
              <p className="mt-3 text-base leading-relaxed text-ig-ink/70">{e.why}</p>
              <div className="mt-5 flex items-center justify-between gap-4 border-t border-ig-ink/10 pt-4">
                <code className="font-[inherit] text-[13px] text-ig-ink/70">{e.cls}</code>
                <Switch on={on[e.key]} onChange={(v) => setOn((o) => ({ ...o, [e.key]: v }))} label={e.name} />
              </div>
            </div>
            <div className="min-w-0">{demos[e.key]}</div>
          </section>
        ))}
      </main>
    </div>
  )
}
