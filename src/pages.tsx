import { useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { initBoxscene, initSpeelpad } from './motion'
import { ALT, AUD_LABEL, AUDS, GAMES, LOCATION, PHOTOS, PROJECTS, QUOTE, WORKSHOPS, type Aud, type Workshop as WS } from './data'
import { MEMBERS } from './team'
import { AudIcon, Btn, card, cardStatic, ClientStrip, ContactCta, Ctx, H1, H2, Header, PageHero, PartnerStrip, Photo, Section, Tag, btnLink, useMotion } from './wf'

function AudTags({ aud }: { aud: Aud[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {aud.map((a) => (
        <Tag key={a} tone="cream">{AUD_LABEL[a]}</Tag>
      ))}
    </div>
  )
}

function WorkshopCard({ w }: { w: WS }) {
  const { go } = useContext(Ctx)
  return (
    <article className="ig-card ig-card--white ig-card--outline cursor-pointer" onClick={() => go('workshop', w.slug)}>
      <div className="ig-card__body flex flex-col">
      <div className="ig-card__media">
        <Photo src={w.photo} alt={ALT[w.photo] ?? w.title} sizes="(min-width: 1024px) 33vw, 100vw" className="aspect-[4/3] w-full" />
      </div>
      <div className="flex flex-1 flex-col gap-3 px-2 pb-2 pt-4">
        <AudTags aud={w.aud} />
        <h3 className="text-xl font-semibold leading-tight tracking-tight">{w.title}</h3>
        <p className="text-[15px] text-neutral-700">{w.tagline}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div className="text-sm text-neutral-600">
            <p>{w.duration} · {w.group}</p>
            <p className="mt-0.5 text-base font-semibold text-ig-ink">{w.price}</p>
          </div>
          <button
            className="shrink-0 border-b-2 border-ig-orange pb-0.5 text-sm font-semibold text-ig-ink"
            onClick={(e) => { e.stopPropagation(); go('workshop', w.slug) }}
          >
            bekijk →
          </button>
        </div>
      </div>
      </div>
    </article>
  )
}

// the speelpad: the drawn game path with the pawn, behind the homepage blocks. sections inside without
// a background of their own let the line through; sections with a colour hide it, like a tunnel
function Speelpad({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => (ref.current ? initSpeelpad(ref.current) : undefined), [])
  return (
    <div ref={ref} className="ig-bg-speelpad bg-ig-cream">
      {children}
    </div>
  )
}

export function Home() {
  const { go } = useContext(Ctx)
  const box = useMotion<HTMLDivElement>(initBoxscene)
  const e5 = GAMES[0]
  // photo: a real InnerGames photo from a workshop for that group, shown softly behind the card
  const audCards: { key: Aud; text: string; cta: string; photo: string; act: () => void }[] = [
    { key: 'onderwijs', text: 'Spellen en lessen die je zo in de klas inzet, met een handleiding erbij.', cta: 'workshops voor onderwijs', photo: WORKSHOPS[7].photo, act: () => go('workshops', 'onderwijs') },
    { key: 'organisaties', text: 'Workshops voor teams die dichter bij elkaar en bij zichzelf willen komen.', cta: 'workshops voor organisaties', photo: WORKSHOPS[0].photo, act: () => go('workshops', 'organisaties') },
    { key: 'zorg', text: 'Spel maakt zorg effectiever en prettiger.', cta: 'workshops voor zorg', photo: WORKSHOPS[8].photo, act: () => go('workshops', 'zorg') },
    { key: 'trainers', text: 'Leer zelf spel-workshops geven en werk met onze methodes.', cta: 'train-de-trainer', photo: PHOTOS.trainerHero, act: () => go('trainer') },
  ]
  return (
    <>
      <Header active="home" />
      <Section id="A" label="hero" className="ig-section--rounded relative overflow-hidden bg-ig-orange py-0! text-white" note="FULL-WIDTH ACHTERGRONDFOTO met oranje overlay">
        <Photo src={PHOTOS.homeHero} alt={ALT[PHOTOS.homeHero]} sizes="100vw" eager className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-ig-orange/80" />
        <div className="relative flex min-h-[560px] flex-col justify-center py-16 @3xl:min-h-[720px]">
          <p className="mb-5 text-base font-medium">spelen om te leren · spelen om te groeien</p>
          <H1 className="max-w-4xl">inner growth for outer change.</H1>
          <p className="mt-6 max-w-xl text-lg leading-snug @3xl:text-2xl">
            Spelen is een mooie manier om te leren, te veranderen, om jezelf te ontwikkelen, om jezelf te leren kennen en te groeien.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Btn split variant="dark" onClick={() => go('workshops')}>boek een workshop</Btn>
            <Btn variant="light" onClick={() => go('preview', 'elemental-five-compleet')}>speel een preview</Btn>
          </div>
        </div>
      </Section>

      <Speelpad>
      <Section id="B" label="vier doelgroepen" stop note="onderwijs · organisaties · zorg · trainers">
        <H2 className="max-w-2xl">waar kom jij voor?</H2>
        <div className="mt-10 grid gap-6 @3xl:grid-cols-4">
          {audCards.map((c) => (
            <div key={c.key} className={`${cardStatic} relative isolate flex min-h-[340px] flex-col gap-4 p-6`}>
              <Photo src={c.photo} alt="" sizes="(min-width: 1024px) 25vw, 100vw" className="absolute inset-x-0 top-0 -z-10 h-[62%] w-full opacity-70" />
              {/* the photo fades into white where the text starts, so the text stays easy to read */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/10 via-white via-60% to-white" aria-hidden />
              <AudIcon aud={c.key} />
              <h3 className="text-3xl font-semibold tracking-tight">{AUD_LABEL[c.key]}</h3>
              <p className="text-[15px] leading-relaxed text-neutral-700">{c.text}</p>
              <Btn variant="ghost" className="mt-auto whitespace-nowrap px-4!" onClick={c.act}>{c.cta} →</Btn>
            </div>
          ))}
        </div>
      </Section>

      <Section id="C" label="uitgelichte workshops" stop note="3 van 9 · link naar overzicht">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <H2>uit onze sessies</H2>
          <Btn variant="ghost" onClick={() => go('workshops')}>alle 9 workshops →</Btn>
        </div>
        <div className="grid gap-x-7 gap-y-20 pt-14 @3xl:grid-cols-3 @3xl:gap-y-24">
          {[WORKSHOPS[0], WORKSHOPS[3], WORKSHOPS[7]].map((w) => <WorkshopCard key={w.slug} w={w} />)}
        </div>
      </Section>

      {/* the box scene: the game lands next to the text while you scroll (src/motion/boxscene.css).
          the photo is the cut-out of box + cards + floor cards, there's no photo of only the box yet */}
      <Section id="D" label="uitgelicht spel" className="ig-section--rounded bg-ig-yellow pb-0!" innerClassName="ig-boxscene" innerRef={box} note="enige gele sectie op deze pagina">
          <div className="ig-boxscene__text">
            <p className="mb-3 text-sm font-medium">uitgelicht spel</p>
            <H2>the elemental five</H2>
            <p className="mt-5 max-w-lg text-lg leading-snug">Vijf elementen, vijf manieren om naar jezelf en elkaar te kijken. Speel eerst 30 seconden en voel het verschil.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn split variant="dark" onClick={() => go('preview', 'elemental-five-compleet')}>speel de preview</Btn>
              <Btn variant="light" onClick={() => go('game', 'elemental-five-compleet')}>meer over het spel</Btn>
            </div>
          </div>
          <div className="ig-boxscene__stage aspect-square!">
            <img className="ig-boxscene__box" src={`${e5.photo}-800.webp`} srcSet={`${e5.photo}-800.webp 800w, ${e5.photo}-1600.webp 1200w`} sizes="400px" alt={ALT[e5.photo]} width={1200} height={1200} loading="lazy" />
            <span className="ig-boxscene__shadow" aria-hidden />
          </div>
      </Section>

      <Section id="E" label="quote" className="bg-white" note={QUOTE.note}>
        <blockquote className="mx-auto max-w-3xl text-center">
          <p className="text-3xl font-medium leading-tight tracking-tight @3xl:text-5xl">“{QUOTE.text}”</p>
          <footer className="mt-6 text-sm font-medium text-ig-orange">{QUOTE.who}</footer>
        </blockquote>
      </Section>

      <ClientStrip />
      <PartnerStrip />

      <Section id="F" label="team-teaser" stop note="verwijst naar ons team">
        <div className="grid items-center gap-10 @3xl:grid-cols-[1fr_1.3fr]">
          <div>
            <H2>vijf spelers, één idee</H2>
            <p className="mt-4 max-w-md text-lg">Een serieuze organisatie die speelse dingen doet, vanuit Eindhoven.</p>
            <Btn variant="dark" className="mt-7" onClick={() => go('team')}>ontmoet het team →</Btn>
          </div>
          <div className="flex gap-4">
            {MEMBERS.slice(0, 3).map((m) => (
              <div key={m.first} className="flex-1 overflow-hidden rounded-2xl bg-white">
                <div className="aspect-[3/4] overflow-hidden">
                  {m.photo ? (
                    <Photo src={m.photo} alt={m.first} sizes="200px" className="h-full w-full" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-ig-cream text-xs text-neutral-500">foto volgt</div>
                  )}
                </div>
                <p className="px-3 py-2 text-sm font-semibold">{m.first}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
      </Speelpad>

      <ContactCta />
    </>
  )
}

const TABS: ('alle' | Aud)[] = ['alle', ...AUDS]

export function Workshops() {
  const { sel } = useContext(Ctx)
  const [f, setF] = useState<'alle' | Aud>((AUDS as string[]).includes(sel) ? (sel as Aud) : 'alle')
  const list = WORKSHOPS.filter((w) => f === 'alle' || w.aud.includes(f))
  return (
    <>
      <Header active="workshops" />
      <PageHero
        id="A"
        label="paginakop"
        kicker="sessies en workshops"
        title="sessies en workshops"
        sub="Negen sessies waarin je speelt, reflecteert en beweegt. Voor teams, klassen, zorg en trainers."
        photo={PHOTOS.workshopsHero}
        alt={ALT[PHOTOS.workshopsHero]}
        tone="cream"
      />
      <Section id="B" label="overzicht + filter" className="bg-white" note="filter op doelgroep · kaart → detailpagina">
        <div className="mb-8 flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter op doelgroep">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={f === t}
              onClick={() => setF(t)}
              className={`rounded-full px-4 py-1.5 text-[15px] transition ${f === t ? 'bg-ig-ink text-white' : 'bg-ig-cream hover:bg-ig-yellow'}`}
            >
              {t}
            </button>
          ))}
          <span className="ml-auto text-sm text-neutral-500">{list.length} van {WORKSHOPS.length}</span>
        </div>
        <div className="grid gap-x-7 gap-y-20 pt-14 @3xl:grid-cols-3 @3xl:gap-y-24">
          {list.map((w) => <WorkshopCard key={w.slug} w={w} />)}
        </div>
      </Section>
      <ContactCta />
    </>
  )
}

export function Workshop() {
  const { sel, go } = useContext(Ctx)
  const w = WORKSHOPS.find((x) => x.slug === sel) ?? WORKSHOPS[0]
  const game = GAMES.find((g) => g.slug === w.gameSlug)
  const others = WORKSHOPS.filter((x) => x.slug !== w.slug && x.aud.some((a) => w.aud.includes(a))).slice(0, 3)
  const facts = [
    ['duur', w.duration],
    ['groepsgrootte', w.group],
    ['prijs', w.price],
    ['locatie', LOCATION],
    // extra facts only show up when we know them (no "n.t.b.")
    ...(w.method ? [['methode', w.method]] : []),
    ...(w.host ? [['begeleid door', w.host]] : []),
    ...(w.madeBy ? [['ontwikkeld door', w.madeBy]] : []),
  ]
  const wide = ['locatie', 'methode', 'begeleid door', 'ontwikkeld door']
  return (
    <>
      <Header active="workshop" />
      <Section id="A" label="workshop-kop" className="bg-white py-10! @3xl:py-16!" note="titel + feiten + boekknop boven de vouw">
        <button onClick={() => go('workshops')} className="mb-6 text-sm underline">← alle workshops</button>
        <div className="grid items-center gap-8 @3xl:grid-cols-[1.2fr_1fr] @3xl:gap-14">
          <div>
            <AudTags aud={w.aud} />
            <H1 className="mt-5 text-[2.5rem]! @3xl:text-[4.5rem]!">{w.title}</H1>
            <p className="mt-5 max-w-xl text-xl leading-snug">{w.tagline}</p>
            <dl className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-ig-cream p-4 text-sm">
              {facts.map(([k, v]) => (
                <div key={k} className={wide.includes(k) ? 'col-span-2' : ''}>
                  <dt className="text-neutral-600">{k}</dt>
                  <dd className="text-base font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Btn split variant="primary" onClick={() => go('contact')}>boek of vraag aan</Btn>
              {game && <Btn variant="ghost" onClick={() => go('game', game.slug)}>bekijk het spel</Btn>}
            </div>
          </div>
          <Photo src={w.photo} alt={ALT[w.photo] ?? w.title} eager className="h-64 w-full rounded-2xl @3xl:h-[460px]" />
        </div>
      </Section>

      <Section id="B" label="verhaal" className="bg-ig-cream" note="lopende tekst + voor wie">
        <div className="grid gap-12 @3xl:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5 text-lg leading-relaxed">
            <H2 className="mb-6">waar gaat het over?</H2>
            {w.story.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <aside className={`${cardStatic} self-start p-6`}>
            <p className="text-sm font-medium text-ig-orange">voor wie</p>
            <ul className="mt-4 space-y-3">
              {w.who.map((x) => (
                <li key={x} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ig-orange" />{x}</li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>

      {/* WP: icon list element, one item per step. Only for workshops where innergames.nl describes the programme */}
      {w.program && (
        <Section id="B2" label="programma" className="bg-white" note="de workshop in stappen">
          <H2>zo ziet de workshop eruit</H2>
          <ol className="mt-10 grid gap-7 @3xl:grid-cols-3">
            {w.program.map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ig-orange font-bold text-ig-ink">{i + 1}</span>
                <div>
                  <h3 className="text-xl font-semibold leading-tight">{t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-neutral-700">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <Section id="C" label="wat het oplevert" className={`bg-white ${w.program ? 'border-t border-ig-ink/10' : ''}`} note="drie kaarten">
        <H2>wat levert het op?</H2>
        <div className="mt-10 grid gap-7 @3xl:grid-cols-3">
          {w.gets.map(([t, d], i) => (
            <div key={t} className={`${cardStatic} bg-ig-cream p-6 shadow-none`}>
              <p className="text-3xl text-ig-orange">0{i + 1}</p>
              <h3 className="mt-3 text-2xl font-semibold leading-tight">{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-neutral-700">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="D" label="gerelateerd" className="bg-ig-cream" note="het bijbehorende spel + andere sessies">
        <div className="grid gap-12 @3xl:grid-cols-2">
          <div>
            <h3 className="text-2xl font-semibold">{game ? 'speel het zelf' : 'bij elkaar horend'}</h3>
            <div className="mt-5 space-y-4">
              {game ? (
                <button onClick={() => go('game', game.slug)} className={`${card} flex w-full items-center gap-4 p-3 text-left`}>
                  <Photo src={game.photo} alt="" sizes="80px" contain className="h-20 w-20 shrink-0 rounded-xl" />
                  <span className="font-semibold">{game.title}</span>
                  <span className="ml-auto pr-2">→</span>
                </button>
              ) : (
                <p className="text-[15px] text-neutral-700">Voor deze workshop is geen apart spel. Bekijk onze andere spellen.</p>
              )}
              <Btn variant="ghost" onClick={() => go('games')}>alle spellen</Btn>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-semibold">ook interessant</h3>
            <ul className="mt-5 divide-y divide-ig-ink/15 border-y border-ig-ink/15">
              {others.map((o) => (
                <li key={o.slug}>
                  <button onClick={() => go('workshop', o.slug)} className="flex w-full items-center justify-between px-1 py-4 text-left text-lg font-semibold hover:bg-white">
                    {o.title}<span>→</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
      <ContactCta />
    </>
  )
}

export function Projects() {
  return (
    <>
      <Header active="projects" />
      <PageHero
        id="A"
        label="paginakop"
        kicker="projecten"
        title="projecten"
        sub="Waar we nu aan werken. Alles op deze pagina is nog in ontwikkeling."
        photo={PROJECTS[0].photo}
        alt="Een groep test een nieuw bordspel aan tafel"
        tone="white"
      />
      <Section id="B" label="projectkaarten" className="bg-ig-cream" note="elke kaart: ‘in ontwikkeling’-label">
        <div className="grid gap-7 @3xl:grid-cols-3">
          {PROJECTS.map((p) => (
            <article key={p.title} className={`${cardStatic} flex flex-col`}>
              <Photo src={p.photo} alt="" sizes="(min-width: 1024px) 33vw, 100vw" className="aspect-[4/3] w-full" />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-wrap gap-1.5">
                  <Tag tone="yellow">in ontwikkeling</Tag>
                </div>
                <h3 className="text-2xl font-semibold leading-tight">{p.title}</h3>
                <p className="text-[15px] leading-relaxed text-neutral-700">{p.text}</p>
                <p className="mt-auto pt-2 text-sm font-semibold text-ig-orange">{p.when}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <ContactCta />
    </>
  )
}

const TRAIN = [
  ['spelen', 'Je ervaart zelf hoe een spel werkt, vanuit de stoel van de deelnemer.'],
  ['begeleiden', 'Je leert groepen voorbereiden, leiden en veilig afsluiten.'],
  ['ontwerpen', 'Je past een werkvorm aan op jouw doelgroep en bouwt je eigen sessie.'],
]

const TRAIN_GAMES: [string, string, 'game' | 'workshop', string][] = [
  ['The Elemental Five', 'Vijf elementen als taal voor gedrag en energie.', 'game', 'elemental-five-compleet'],
  ['Sociality', 'Het model Sociale Kwaliteit met praktijkcasussen.', 'game', 'sociality'],
  ['Kansen Keren', 'Een gesprekspel over ongelijke kansen.', 'game', 'kansen-keren'],
  ['Hoezo Raar?!', 'Een veilige ruimte om iets “raars” te delen.', 'workshop', 'hoezo-raar'],
]

export function Trainer() {
  const { go } = useContext(Ctx)
  const [open, setOpen] = useState<number | null>(0)
  const faq = [
    ['Wat kost het?', '€ 1.800 per persoon voor 8 uur.'],
    ['Hoe is het opgebouwd?', '4 uur theorie, individueel of in groepen tot 10, en 4 uur praktijk, begeleid in je eigen setting.'],
    ['Voor wie is het?', 'Voor trainers, coaches, docenten en hulpverleners die spel willen inzetten in hun werk.'],
  ]
  return (
    <>
      <Header active="trainer" />
      <PageHero
        id="A"
        label="paginakop"
        kicker="train-de-trainer"
        title="train-de-trainer"
        sub="Leer spel-workshops geven. Van zelf spelen tot zelf begeleiden."
        photo={PHOTOS.trainerHero}
        alt={ALT[PHOTOS.trainerHero]}
        tone="cream"
      />
      <Section id="B" label="het aanbod" className="bg-white py-10! @3xl:py-14!" note="echt aanbod: € 1.800 · 8 uur">
        <div className="grid gap-4 @3xl:grid-cols-3">
          {[
            ['prijs', '€ 1.800 per persoon'],
            ['duur', '8 uur'],
            ['opbouw', '4 uur theorie (individueel of in groepen tot 10) en 4 uur praktijk, begeleid in je eigen setting'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-ig-cream p-6">
              <p className="text-sm text-neutral-600">{k}</p>
              <p className={`mt-1 ${k === 'opbouw' ? 'text-base' : 'text-3xl'} font-semibold leading-snug`}>{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex"><Btn split variant="primary" onClick={() => go('contact')}>vraag de training aan</Btn></div>
      </Section>
      <Section id="C" label="drie stappen" className="bg-ig-cream" note="spelen · begeleiden · ontwerpen">
        <H2>zo word je spelleider</H2>
        <div className="mt-10 grid gap-7 @3xl:grid-cols-3">
          {TRAIN.map(([t, d], i) => (
            <div key={t} className={`${cardStatic} p-6`}>
              <p className="text-3xl text-ig-orange">0{i + 1}</p>
              <h3 className="mt-3 text-3xl font-semibold">{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-neutral-700">{d}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section id="D" label="welke spellen leer je" className="bg-white" note="vier spellen">
        <H2>welke spellen leer je</H2>
        <div className="mt-10 grid gap-5 @3xl:grid-cols-4">
          {TRAIN_GAMES.map(([t, d, kind, slug]) => (
            <button key={t} onClick={() => go(kind, slug)} className={`${card} p-6 text-left`}>
              <h3 className="text-2xl font-semibold leading-tight">{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-neutral-700">{d}</p>
              <p className="mt-4 text-sm font-semibold text-ig-orange">meer lezen →</p>
            </button>
          ))}
        </div>
      </Section>
      <Section id="E" label="veelgestelde vragen" className="bg-ig-yellow" note="accordeon · enige gele sectie">
        <div className="grid gap-10 @3xl:grid-cols-[1fr_2fr]">
          <H2>vragen?</H2>
          <div className="border-y border-ig-ink/30">
            {faq.map(([q, a], i) => (
              <div key={q} className="border-b border-ig-ink/20 last:border-0">
                <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between py-5 text-left text-xl font-semibold">
                  {q}<span className="text-2xl">{open === i ? '–' : '+'}</span>
                </button>
                {open === i && <p className="pb-5 pr-8 text-lg leading-relaxed">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </Section>
      <ContactCta />
    </>
  )
}

export function Contact() {
  const [sent, setSent] = useState(false)
  const input = 'w-full rounded-xl bg-ig-cream px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ig-orange'
  return (
    <>
      <Header active="contact" />
      <Section id="A" label="contactformulier" className="bg-white" note="formulier · straks via WordPress-formulier">
        <div className="grid gap-12 @3xl:grid-cols-[1fr_1.1fr]">
          <div>
            <H1>contact</H1>
            <p className="mt-6 max-w-md text-xl leading-snug">Vertel ons over je team, klas of cliënten. We denken graag mee.</p>
            <div className="mt-8 space-y-1 text-lg">
              <p className="font-semibold">InnerGames</p>
              <p>Bezoekadres: Kronehoefstraat 87, 5612 HL Eindhoven</p>
              <p>Postadres: Westrik 3, 5629 CE Eindhoven</p>
              <p>+31 (0)6 – 215 27 855</p>
              <p><a className="underline" href="mailto:info@innergames.nl">info@innergames.nl</a></p>
            </div>
            <a
              href="https://wa.me/31621527855"
              target="_blank"
              rel="noreferrer"
              className={`${btnLink} mt-6 w-full @3xl:w-auto`}
            >
              app ons op whatsapp
            </a>
          </div>
          {sent ? (
            <div role="status" className={`${cardStatic} self-start bg-ig-cream p-8 shadow-none`}>
              <h2 className="text-3xl font-semibold">verstuurd</h2>
              <p className="mt-3 text-lg">(dit is een test, er is niets verzonden)</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4 rounded-[var(--r-box)] bg-white p-6 ring-1 ring-ig-ink/12 @3xl:p-8">
              <label className="block text-sm font-semibold">Naam<input required className={`${input} mt-1`} /></label>
              <label className="block text-sm font-semibold">Organisatie<input className={`${input} mt-1`} /></label>
              <label className="block text-sm font-semibold">E-mail<input required type="email" className={`${input} mt-1`} /></label>
              <label className="block text-sm font-semibold">Waar kunnen we je mee helpen?
                <select className={`${input} mt-1`}>
                  <option>een workshop voor mijn team</option>
                  <option>een les of spel voor mijn klas</option>
                  <option>iets voor mijn cliënten of zorgteam</option>
                  <option>train-de-trainer</option>
                  <option>iets anders</option>
                </select>
              </label>
              <label className="block text-sm font-semibold">Bericht<textarea required rows={5} className={`${input} mt-1`} /></label>
              <Btn split type="submit" variant="dark">verstuur</Btn>
            </form>
          )}
        </div>
      </Section>
      <Section id="B" label="werkplek" className="p-0!" note="FULL-WIDTH · werkplek Eindhoven">
        <Photo src={PHOTOS.tafel} alt={ALT[PHOTOS.tafel]} sizes="100vw" className="h-64 w-full @3xl:h-96" />
      </Section>
    </>
  )
}
