// motion lab: every effect on its own, with a switch, so Ariën and Damian can choose before anything
// goes onto the real pages. open with /motion-lab or #motion-lab, it's not in the menu.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { ALT, GAMES, PHOTOS, WORKSHOPS } from './data'
import { Btn, Photo } from './wf'
import './motionlab.css'
import { Switch, useEffectInit } from './lab/ui'
import { speelpad, SpeelpadDemo } from './lab/speelpad'
import { forceReduced, igNavigate, initBoxscene, initHeaderPill } from './motion'

type Key = 'rounded' | 'speelpad' | 'split' | 'lift' | 'overgang' | 'spelbox' | 'footer' | 'menu'

const EFFECTS: { key: Key; n: string; name: string; cls: string; what: string; why: string }[] = [
  { key: 'rounded', n: '01', name: 'afgeronde secties', cls: '.ig-section--rounded', what: 'De gekleurde kop eindigt met grote ronde hoeken. De volgende sectie schuift eronder.', why: 'De pagina voelt als gestapelde kaarten, en je ziet dat er meer komt.' },
  { key: 'speelpad', ...speelpad },
  { key: 'split', n: '05', name: 'gesplitste knop', cls: '.ig-btn-split', what: 'Een tekstdeel en een apart pijldeel. Bij hover schuift de pijl 3px op.', why: 'Alleen voor de hoofdactie. Laat zien: hier ga je verder.' },
  { key: 'lift', n: '06', name: 'kaart bij hover', cls: '.ig-card-lift', what: 'De kaart komt 4px omhoog, de schaduw wordt iets sterker en de foto zoomt licht in.', why: 'Laat zien dat de hele kaart klikbaar is. Alleen met een muis.' },
  { key: 'overgang', n: '07', name: 'paginaovergang', cls: '@view-transition', what: 'Oranje met het logo komt van onder op en gaat naar boven weg: 440 ms in totaal.', why: 'Voelt als één geheel in plaats van losse pagina’s. In WordPress werkt het zonder extra code.' },
  { key: 'spelbox', n: '08', name: 'spelbox', cls: '.ig-boxscene', what: 'De doos draait recht terwijl je naar het blok scrolt. Bij The Elemental Five schuiven daarna de vijf kaarten in een waaier uit de doos.', why: 'Laat het echte spel zien, niet alleen een foto. Speelt één keer.' },
  { key: 'footer', n: '09', name: 'doos in de footer', cls: '.ig-footer-box', what: 'Een speldoos staat schuin in de footer en draait 4° mee als de footer in beeld komt.', why: 'De pagina eindigt bij het product.' },
  { key: 'menu', n: '10', name: 'compacte menubalk', cls: '.ig-header-pill', what: 'Na 200px scrollen komt bovenaan een kleine menubalk in het midden. Bovenaan de pagina gaat hij weer weg.', why: 'Het menu is altijd bij de hand, zonder de hele breedte te pakken. Niet op mobiel.' },
]

const Arrow = () => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 9.2h11.5M10 4.5l4.6 4.7L10 13.7" />
  </svg>
)

function SplitBtn({ children, dark = false, onClick }: { children: ReactNode; dark?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`ig-btn-split ${dark ? 'ig-btn-split--dark' : ''}`}>
      <span className="ig-btn-split__label">{children}</span>
      <span className="ig-btn-split__arrow" aria-hidden>
        <Arrow />
      </span>
    </button>
  )
}

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

function DemoSplit({ on }: { on: boolean }) {
  return (
    <div className="lab-frame grid gap-px bg-ig-ink/10 @container @3xl:grid-cols-2">
      <div className="flex flex-col items-start gap-4 bg-white p-8">
        <p className="text-[13px] text-ig-ink/70">op wit</p>
        {on ? <SplitBtn>vraag deze workshop aan</SplitBtn> : <Btn variant="primary" className="w-auto!">vraag deze workshop aan</Btn>}
        {on ? <SplitBtn dark>speel de preview</SplitBtn> : <Btn variant="dark" className="w-auto!">speel de preview</Btn>}
        <button type="button" className="text-base underline underline-offset-4">bekijk het spel</button>
      </div>
      <div className="flex flex-col items-start gap-4 bg-ig-orange p-8">
        <p className="text-[13px] text-ig-ink">op oranje</p>
        {on ? <SplitBtn dark>boek een workshop</SplitBtn> : <Btn variant="dark" className="w-auto!">boek een workshop</Btn>}
        <p className="max-w-[34ch] text-base">De link eronder blijft een gewone link: alleen de hoofdactie krijgt een pijl.</p>
      </div>
    </div>
  )
}

function DemoLift({ on }: { on: boolean }) {
  return (
    <div className="lab-frame bg-ig-cream p-6 @container @3xl:p-10">
      <div className="grid gap-6 @xl:grid-cols-3">
        {[WORKSHOPS[0], WORKSHOPS[3], WORKSHOPS[7]].map((w) => (
          <article key={w.slug} className={`flex cursor-pointer flex-col overflow-hidden rounded-[18px] bg-white ${on ? 'ig-card-lift' : ''}`}>
            <div className="ig-card-lift__media">
              <Photo src={w.photo} alt={ALT[w.photo] ?? w.title} sizes="(min-width: 1024px) 25vw, 100vw" className="aspect-[4/3] w-full" />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <h3 className="text-xl font-semibold leading-tight">{w.title}</h3>
              <p className="text-base leading-relaxed text-ig-ink/80">{w.tagline}</p>
              <p className="mt-auto pt-3 text-base">{w.price}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function DemoOvergang({ on }: { on: boolean }) {
  const [page, setPage] = useState(0)
  const pages = [
    { title: 'sessies en workshops', photo: PHOTOS.workshopsHero },
    { title: 'onze spellen', photo: PHOTOS.gamesHero },
  ]
  const p = pages[page]
  const next = () => {
    const update = () => flushSync(() => setPage((x) => 1 - x))
    if (on) igNavigate(update)
    else update()
  }
  return (
    <div className="lab-frame grid items-center gap-8 bg-white p-6 @container @3xl:grid-cols-[1fr_1.1fr] @3xl:p-10">
      <div>
        <p className="text-[13px] text-ig-ink/70">pagina {page + 1} van 2</p>
        <h3 className="mt-2 text-[40px] font-semibold leading-none tracking-tight">{p.title}</h3>
        <div className="mt-8">
          <SplitBtn onClick={next}>naar de volgende pagina</SplitBtn>
        </div>
        <p className="mt-4 max-w-[44ch] text-[13px] leading-relaxed text-ig-ink/70">
          Werkt in Chrome, Edge en Safari 18+. In Firefox (nog) geen overgang, dan wisselt de pagina gewoon.
        </p>
      </div>
      <Photo src={p.photo} alt={ALT[p.photo]} className="aspect-[4/3] w-full rounded-[18px]" />
    </div>
  )
}

const E5_ELEMENTS: [string, string][] = [
  ['vuur', '#e0582c'],
  ['lucht', '#8fc3d6'],
  ['aarde', '#e8a93a'],
  ['water', '#3c8f8a'],
  ['ether', '#a98fbf'],
]

function DemoSpelbox({ on }: { on: boolean }) {
  const a = useRef<HTMLDivElement>(null)
  const b = useRef<HTMLDivElement>(null)
  useEffectInit(a, initBoxscene, on)
  useEffectInit(b, initBoxscene, on)
  const soc = GAMES.find((g) => g.slug === 'sociality')!
  return (
    <div className="lab-frame bg-white @container">
      <p className="px-6 pt-8 text-[13px] text-ig-ink/70 @3xl:px-12">scroll langzaam naar beneden</p>
      <div className="h-[40vh]" />
      {/* key: switching the effect off and on again restarts the scene */}
      <div key={`a${on}`} ref={a} className={`grid items-center gap-10 px-6 py-16 @3xl:grid-cols-[1fr_1fr] @3xl:px-12 ${on ? 'ig-boxscene' : ''}`}>
        <div>
          <p className="text-base text-[#C84413]">uitgelicht spel</p>
          <h3 className="mt-2 text-[40px] font-semibold leading-none tracking-tight">sociality</h3>
          <p className="mt-4 max-w-[44ch] text-xl leading-snug">{soc.short}</p>
        </div>
        <div className="ig-boxscene__stage mx-auto w-full max-w-[340px]">
          <img className="ig-boxscene__box" src="/assets/img/games/sociality-box.png" alt="Speldoos van Sociality" width={398} height={459} />
        </div>
      </div>
      <div className="h-[30vh]" />
      <div key={`b${on}`} ref={b} className={`grid items-center gap-10 bg-ig-yellow px-6 py-16 @3xl:grid-cols-[1fr_1fr] @3xl:px-12 ${on ? 'ig-boxscene ig-boxscene--fan' : ''}`}>
        <div>
          <p className="text-base">uitgelicht spel</p>
          <h3 className="mt-2 text-[40px] font-semibold leading-none tracking-tight">the elemental five</h3>
          <p className="mt-4 max-w-[44ch] text-xl leading-snug">{GAMES[0].short}</p>
        </div>
        <div className="ig-boxscene__stage mx-auto w-full max-w-[340px] pt-[58%]">
          {E5_ELEMENTS.map(([name, colour], i) => (
            // TODO: replace with the real card 1 of each element (game assets)
            <div key={name} className="ig-boxscene__card lab-slot-card" style={{ ['--i' as string]: i, background: colour }}>
              <span>kaart 1 · {name}</span>
            </div>
          ))}
          <div className="ig-boxscene__box lab-slot-box">
            <span>vrijstaande foto van de doos</span>
            <span className="text-[13px] opacity-70">nog aanleveren</span>
          </div>
        </div>
      </div>
      <div className="h-[50vh]" />
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
    split: <DemoSplit on={on.split} />,
    lift: <DemoLift on={on.lift} />,
    overgang: <DemoOvergang on={on.overgang} />,
    spelbox: <DemoSpelbox on={on.spelbox} />,
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
