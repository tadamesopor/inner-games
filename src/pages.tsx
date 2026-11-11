import { useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { initBoxscene, initHeroTable, initHeroWaves, initSpeelpad } from './motion'
import { ALT, AUD_LABEL, AUDS, BRIGHT, CLIENTS, GAMES, LOCATION, PHOTOS, PROJECTS, QUOTE, WORKSHOPS, type Aud, type Workshop as WS } from './data'
import { MEMBERS } from './team'
import { AudIcon, LEGAL, Todo, Btn, card, cardStatic, ClientStrip, ContactCta, Ctx, H1, H2, Header, PageHero, PartnerStrip, Photo, Section, Tag, btnLink, useMotion } from './wf'

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
    <article className="ig-card ig-card--white ig-card--outline ig-card--hot cursor-pointer" onClick={() => go('workshop', w.slug)}>
      <div className="ig-card__body flex flex-col">
      <div className="ig-card__media">
        <Photo src={w.photo} alt={ALT[w.photo] ?? w.title} sizes="(min-width: 1024px) 300px, 100vw" className="aspect-[4/3] w-full" />
      </div>
      <div className="flex flex-1 flex-col gap-3 px-2 pb-2 pt-4">
        <AudTags aud={w.aud} />
        <h3 className="ig-card__title">{w.title}</h3>
        <p className="ig-card__text">{w.tagline}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="ig-card__meta">{w.duration} · {w.group}</p>
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

// the homepage hero: orange with yellow waves (src/motion/hero.js). left the title, one sentence and one
// button. right a table with two session photos and two of our games: drag them around, and three curly
// arrows show where you can go from there. on a phone it's a still pile with the three labels as buttons.
// TODO Ariën: check the three steps
const HOW: [string, string][] = [
  ['vertel ons over je groep', 'Wie zijn jullie, hoe groot is de groep en wat wil je bereiken? Via het formulier, WhatsApp of de telefoon.'],
  ['we stellen samen een sessie samen', 'We kiezen samen de workshop of het spel dat past, en stemmen het af op jouw groep.'],
  ['we komen spelen', 'Op jullie locatie of bij ons in Eindhoven. Daarna kijken we samen terug.'],
]

// what lies on the table. at = place on desktop, pile = place on a phone, both in the 640px design frame
// (x, y, tilt). w = width in design px. no object covers more than about 20% of another
const TABLE = {
  ws: { at: '20,40,-6', pile: '10,20,-6', w: 250 },
  box: { at: '430,20,7', pile: '470,0,7', w: 150 },
  tafel: { at: '380,360,5', pile: '360,190,4', w: 220 },
  e5: { at: '10,368,-3', pile: '120,236,-3', w: 200 },
}

function HeroNew() {
  const { go } = useContext(Ctx)
  const waves = useMotion<SVGSVGElement>(initHeroWaves)
  const table = useMotion<HTMLDivElement>(initHeroTable)
  const e5 = GAMES[0]
  const print = (key: 'ws' | 'tafel', src: string, caption: string) => (
    <figure className="ig-table__item ig-table__print" data-key={key} data-at={TABLE[key].at} data-pile={TABLE[key].pile} style={{ '--w': TABLE[key].w } as CSSProperties}>
      <img src={`${src}-800.webp`} alt={ALT[src]} width={800} height={600} draggable={false} />
      <figcaption>{caption}</figcaption>
    </figure>
  )
  return (
    <Section id="A" label="hero" className="ig-hero ig-section--rounded bg-ig-orange pb-16! text-white @3xl:pb-24!" note="oranje + gele golven · foto's en spellen op tafel">
      <svg ref={waves} className="ig-hero__waves" viewBox="0 0 1600 800" preserveAspectRatio="xMidYMid slice" aria-hidden />
      <div className="ig-hero__body grid items-center gap-12 @6xl:grid-cols-[minmax(0,520px)_1fr] @6xl:gap-12">
        <div className="max-w-[640px]">
          {/* TODO Ariën: check this title. white on orange only passes as large text, so everything here is big */}
          <h1 className="text-[2.5rem] font-bold leading-[1.02] tracking-tight @3xl:text-[3.4rem]">
            spellen en workshops voor teams, klassen en zorg
          </h1>
          <p className="mt-8 text-2xl leading-snug">Spelen om te leren, spelen om te groeien. Vanuit Eindhoven.</p>
          <div className="mt-10">
            <Btn split variant="light" onClick={() => go('workshops')}>boek een workshop</Btn>
          </div>
        </div>
        <div ref={table} className="ig-table">
          {print('ws', WORKSHOPS[0].photo, 'energiek team!')}
          <img className="ig-table__item ig-table__cutout" data-key="box" data-at={TABLE.box.at} data-pile={TABLE.box.pile} style={{ '--w': TABLE.box.w } as CSSProperties} src="/assets/img/games/sociality-box.png" alt="De doos van het spel Sociality" width={398} height={459} draggable={false} />
          {print('tafel', PHOTOS.tafel, 'samen aan tafel')}
          <img className="ig-table__item ig-table__cutout" data-key="e5" data-at={TABLE.e5.at} data-pile={TABLE.e5.pile} style={{ '--w': TABLE.e5.w } as CSSProperties} src={`${e5.photo}-800.webp`} alt={ALT[e5.photo]} width={800} height={800} draggable={false} />
          <div className="ig-table__labels">
            <button type="button" className="ig-table__label" data-for="ws" data-at="190,326" onClick={() => go('workshops')}>bekijk de workshops →</button>
            <button type="button" className="ig-table__label" data-for="box" data-at="396,284" onClick={() => go('games')}>bekijk de spellen →</button>
            <button type="button" className="ig-table__label" data-for="e5" data-at="300,572" onClick={() => go('preview', e5.slug)}>speel het spel →</button>
          </div>
          <button type="button" className="ig-table__tidy" hidden>opruimen</button>
        </div>
      </div>
    </Section>
  )
}

// file -> width / height of the cut-out logo, so each keeps its own shape
const PROOF: Record<string, number> = { asml: 108 / 52, fontys: 122 / 77, han: 90 / 77, summa: 155 / 76 }

/** a calm strip right under the hero: a few clients, in one ink tone, on cream */
function ProofStrip() {
  const proof = CLIENTS.filter((c) => c.file in PROOF)
  return (
    <div className="bg-ig-cream px-5 pb-6 @3xl:px-16 [--ig-next-pad:28px]">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-10 gap-y-4">
        <p className="text-[15px] font-semibold text-ig-ink/70">o.a. gespeeld met</p>
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-4" aria-label="opdrachtgevers">
          {proof.map((c) => (
            <li key={c.file}>
              <img src={`/assets/img/clients/${c.file}.png`} alt={c.name} className="ig-proof-logo" style={{ height: c.h * 0.5, aspectRatio: PROOF[c.file] }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function Home() {
  const { go, hero } = useContext(Ctx)
  const box = useMotion<HTMLDivElement>(initBoxscene)
  const e5 = GAMES[0]
  // photo: a real InnerGames photo from a workshop for that group. texts short, so the cards stay even
  const audCards: { key: Aud; text: string; cta: string; photo: string; act: () => void }[] = [
    { key: 'onderwijs', text: 'Spellen en lessen voor in de klas.', cta: 'workshops voor onderwijs', photo: WORKSHOPS[7].photo, act: () => go('workshops', 'onderwijs') },
    { key: 'organisaties', text: 'Workshops die je team dichter bij elkaar brengen.', cta: 'workshops voor organisaties', photo: WORKSHOPS[0].photo, act: () => go('workshops', 'organisaties') },
    { key: 'zorg', text: 'Spel maakt zorg effectiever en prettiger.', cta: 'workshops voor zorg', photo: WORKSHOPS[8].photo, act: () => go('workshops', 'zorg') },
    { key: 'trainers', text: 'Leer zelf spel-workshops geven.', cta: 'train-de-trainer', photo: WORKSHOPS[5].photo, act: () => go('trainer') },
  ]
  return (
    <>
      <Header active="home" tone={hero === 'nieuw' ? 'hero' : 'cream'} />
      {hero === 'nieuw' && <HeroNew />}
      {/* option B (round 3): text on cream, the photo in its own box */}
      {hero === 'oud' && (
      <Section id="A" label="hero" className="bg-ig-cream pb-6! pt-8! @3xl:pb-10! @3xl:pt-12!" note="tekst op crème · foto in een eigen kader rechts">
        <div className="grid items-center gap-8 @3xl:grid-cols-[1.05fr_1fr] @3xl:gap-14">
          <div>
            <p className="mb-5 text-base font-medium">spelen om te leren · spelen om te groeien</p>
            <H1 className="max-w-4xl">inner growth for outer change.</H1>
            <p className="mt-6 max-w-xl text-lg leading-snug @3xl:text-2xl">
              Spelen is een mooie manier om te leren, te veranderen, om jezelf te ontwikkelen, om jezelf te leren kennen en te groeien.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Btn split variant="dark" onClick={() => go('workshops')}>boek een workshop</Btn>
              <Btn variant="ghost" onClick={() => go('preview', 'elemental-five-compleet')}>speel een preview</Btn>
            </div>
          </div>
          <Photo src={PHOTOS.homeHero} alt={ALT[PHOTOS.homeHero]} sizes="(min-width: 1024px) 50vw, 100vw" eager className="aspect-[4/3] w-full rounded-[var(--r-box)] @3xl:aspect-[5/4]" />
        </div>
      </Section>
      )}

      <ProofStrip />

      <Speelpad>
      <Section id="B" label="vier doelgroepen" stop note="onderwijs · organisaties · zorg · trainers">
        <H2 className="max-w-2xl">waar kom jij voor?</H2>
        <div className="ig-grid mt-2">
          {audCards.map((c) => (
            <div key={c.key} className="ig-card ig-card--white ig-card--outline">
              <div className="ig-card__body flex flex-col">
                <div className="ig-card__media">
                  <Photo src={c.photo} alt="" sizes="(min-width: 1024px) 300px, 100vw" className="aspect-[4/3] w-full" />
                </div>
                <div className="flex flex-1 flex-col gap-3 px-2 pb-2 pt-4">
                  <div className="flex items-center gap-3">
                    <AudIcon aud={c.key} className="h-10! w-10! [&_svg]:h-5 [&_svg]:w-5" />
                    <h3 className="ig-card__title">{AUD_LABEL[c.key]}</h3>
                  </div>
                  <p className="ig-card__text min-h-[2lh]">{c.text}</p>
                  <Btn variant="ghost" className="mt-auto whitespace-nowrap px-4!" onClick={c.act}>{c.cta} →</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="C" label="uitgelichte workshops" stop note="3 van 9 · link naar overzicht">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <H2>uit onze sessies</H2>
          <Btn variant="ghost" onClick={() => go('workshops')}>alle 9 workshops →</Btn>
        </div>
        <div className="ig-grid">
          {[WORKSHOPS[0], WORKSHOPS[3], WORKSHOPS[7]].map((w) => <WorkshopCard key={w.slug} w={w} />)}
        </div>
      </Section>

      {/* zo werkt het: what happens after you click "boek een workshop". a stop on the speelpad */}
      <Section id="ZO" label="zo werkt het" stop note="drie stappen voor een workshop">
        <div className="grid gap-10 @4xl:grid-cols-[1fr_2fr]">
          <div>
            <H2>zo werkt het</H2>
            <p className="mt-4 max-w-sm text-lg leading-snug">Een workshop boeken gaat in drie stappen.</p>
            <Btn split variant="dark" className="mt-7" onClick={() => go('contact')}>vertel over je groep</Btn>
          </div>
          <ol className="grid gap-5 @3xl:grid-cols-3">
            {HOW.map(([t, d], i) => (
              <li key={t} className="rounded-[var(--r-box)] bg-white p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ig-orange text-lg font-bold text-ig-ink">{i + 1}</span>
                <h3 className="mt-4 text-xl font-bold leading-tight">{t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-neutral-700">{d}</p>
              </li>
            ))}
          </ol>
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

      {/* the quote that was here was an example, not a real one: never show that as real in a test.
          TODO Ariën: a real quote from a participant or client, with name and organisation (with permission) */}
      <Section id="E" label="quote" className="bg-white" note="echte quote volgt">
        <Todo className="mx-auto max-w-3xl text-center">Hier komt een echte quote van een deelnemer of opdrachtgever, met naam en organisatie.</Todo>
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
      <Header active="workshops" tone="cream" />
      <PageHero
        id="A"
        label="paginakop"
        kicker="sessies en workshops"
        title="sessies en workshops"
        sub="Negen sessies waarin je speelt, reflecteert en beweegt. Voor teams, klassen, zorg en trainers."
        photo={BRIGHT.workshops}
        alt={ALT[BRIGHT.workshops]}
        tone="cream"
      />
      <Section id="B" label="overzicht + filter" className="bg-white" note="filter op doelgroep · kaart → detailpagina">
        <h2 className="sr-only">alle workshops</h2>
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
        <div className="ig-grid">
          {list.map((w) => <WorkshopCard key={w.slug} w={w} />)}
        </div>
      </Section>
      <ContactCta />
    </>
  )
}

const EXPECT: [string, string][] = [
  ['kennismaking', 'We bespreken je groep, wat je wilt bereiken en wat er speelt.'],
  ['sessie op maat', 'We stemmen de workshop af op jouw groep en komen spelen.'],
  ['nagesprek', 'We kijken samen terug: wat werkte, en wat neem je mee?'],
]

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
              <Btn split variant="primary" onClick={() => go('contact', w.slug)}>vraag deze workshop aan</Btn>
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
        <div className="ig-grid ig-grid--still mt-10">
          {w.gets.map(([t, d], i) => (
            <div key={t} className={`${cardStatic} bg-ig-cream p-6 shadow-none`}>
              <p className="text-3xl text-ig-orange">0{i + 1}</p>
              <h3 className="ig-card__title mt-3">{t}</h3>
              <p className="ig-card__text mt-2">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* TODO Ariën: check the three steps */}
      <Section id="C2" label="dit kun je verwachten" className="bg-ig-cream" note="kennismaking · sessie op maat · nagesprek">
        <div className="grid gap-10 @4xl:grid-cols-[1fr_1.4fr]">
          <div>
            <H2>dit kun je verwachten</H2>
            <ol className="mt-8 space-y-6">
              {EXPECT.map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ig-orange text-lg font-bold text-ig-ink">{i + 1}</span>
                  <div>
                    <h3 className="text-xl font-bold leading-tight">{t}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-neutral-700">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          {/* TODO Ariën: one short real case or quote per workshop (with permission) */}
          <Todo className="self-start bg-white">Hier komt een korte case of quote van een groep die {w.title} heeft gespeeld: wie, wat was de vraag, en wat het opleverde.</Todo>
        </div>
      </Section>

      <Section id="D" label="gerelateerd" className="bg-white" note="het bijbehorende spel + andere sessies">
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
  const { go } = useContext(Ctx)
  const soc = GAMES.find((g) => g.slug === 'sociality')!
  return (
    <>
      <Header active="projects" />
      <PageHero
        id="A"
        label="paginakop"
        kicker="over ons / projecten"
        title="projecten"
        sub="Spellen en tools die we samen met organisaties en onderwijs maken. Van een vraag uit de praktijk tot iets wat je echt kunt spelen."
        photo={PROJECTS[0].photo}
        alt="Een groep test een nieuw bordspel aan tafel"
        tone="white"
      />

      {/* the main case: everything here comes from the Sociality text on innergames.nl.
          TODO Ariën: one result or quote from the HAN (only with permission) */}
      <Section id="B" label="uitgelichte case" className="bg-ig-cream" note="case: opdrachtgever · vraag · wat we maakten">
        <article className="grid gap-8 @3xl:grid-cols-[1fr_1.1fr] @3xl:gap-14">
          <Photo src={soc.photo} alt={ALT[soc.photo]} contain className="aspect-square w-full rounded-[var(--r-box)] bg-white" />
          <div className="self-center">
            <p className="text-sm font-medium text-[#C84413]">case · met de HAN</p>
            <H2 className="mt-2">sociality</H2>
            <dl className="mt-8 space-y-6 text-lg leading-relaxed">
              <div>
                <dt className="text-sm font-semibold text-neutral-600">opdrachtgever</dt>
                <dd>Het lectoraat Versterken van Sociale Kwaliteit van de HAN</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-neutral-600">de vraag</dt>
                <dd>Het model Sociale Kwaliteit is waardevol, maar ook abstract. Hoe oefen je het in echte situaties?</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-neutral-600">wat we maakten</dt>
                <dd>Een bordspel met praktijkcasussen, gemaakt door het lectoraat samen met Ariën Kingma. Nu maken we nieuwe casussen met studenten sociaal werk.</dd>
              </div>
            </dl>
            <Btn variant="ghost" className="mt-8" onClick={() => go('game', soc.slug)}>bekijk het spel →</Btn>
          </div>
        </article>
      </Section>

      <Section id="C" label="lopende projecten" className="bg-white" note="per project: met wie · wat · stand van zaken">
        <H2>waar we nu aan werken</H2>
        <div className="ig-grid ig-grid--still mt-10">
          {PROJECTS.map((p) => (
            <article key={p.title} className="ig-card__body flex flex-col rounded-[var(--r-box)] bg-white p-[10px] ring-1 ring-ig-ink/12">
              <div className="ig-card__media">
                <Photo src={p.photo} alt={ALT[p.photo] ?? ''} sizes="(min-width: 1024px) 300px, 100vw" className="aspect-[4/3] w-full" />
              </div>
              <div className="flex flex-1 flex-col gap-3 px-2 pb-2 pt-4">
                <div className="flex flex-wrap gap-1.5">
                  <Tag tone="cream">{p.when}</Tag>
                </div>
                <h3 className="ig-card__title">{p.title}</h3>
                {p.with && <p className="ig-card__meta font-semibold text-[#C84413]!">met {p.with}</p>}
                <p className="ig-card__text">{p.text}</p>
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
      <Header active="trainer" tone="cream" />
      <PageHero
        id="A"
        label="paginakop"
        kicker="train-de-trainer"
        title="train-de-trainer"
        // one line: never break after the hyphens. smaller than the other page titles so it fits
        titleClass="whitespace-nowrap text-[2.3rem]! @3xl:text-[3.4rem]! @6xl:text-[4.6rem]!"
        sub="Leer spel-workshops geven. Van zelf spelen tot zelf begeleiden."
        // a group at work, not the team photo again. TODO Ariën: a photo of a train-de-trainer day
        photo={BRIGHT.trainer}
        alt={ALT[BRIGHT.trainer]}
        tone="cream"
      />
      <Section id="B" label="het aanbod" className="bg-white" note="echt aanbod: € 1.800 · 8 uur">
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
        <div className="ig-grid ig-grid--still mt-10">
          {TRAIN.map(([t, d], i) => (
            <div key={t} className={`${cardStatic} p-6`}>
              <p className="text-3xl text-ig-orange">0{i + 1}</p>
              <h3 className="ig-card__title mt-3">{t}</h3>
              <p className="ig-card__text mt-2">{d}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section id="D" label="welke spellen leer je" className="bg-white" note="vier spellen">
        <H2>welke spellen leer je</H2>
        <div className="ig-grid ig-grid--still mt-10">
          {TRAIN_GAMES.map(([t, d, kind, slug]) => (
            <button key={t} onClick={() => go(kind, slug)} className={`${card} p-6 text-left`}>
              <h3 className="ig-card__title">{t}</h3>
              <p className="ig-card__text mt-2">{d}</p>
              <p className="mt-4 text-sm font-semibold text-[#C84413]">meer lezen →</p>
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

// the legal pages a Dutch webshop needs. the texts themselves come from Ariën (or a lawyer)
export function Legal() {
  const { sel } = useContext(Ctx)
  const title = LEGAL[sel] ?? LEGAL.voorwaarden
  return (
    <>
      <Header active="legal" />
      <Section id="A" label="juridische pagina" className="bg-white" note="dummy · tekst volgt">
        <H1 className="text-[2.5rem]! @3xl:text-[4rem]!">{title}</H1>
        <Todo className="mt-8 max-w-2xl">
          De tekst van het {title} komt hier. In WordPress maak je deze pagina met een sjabloon (bijvoorbeeld van de branchevereniging of een jurist) en
          vul je de gegevens van InnerGames in: KvK-nummer, btw-nummer, adres en contact.
        </Todo>
      </Section>
    </>
  )
}

export function Contact() {
  const { sel } = useContext(Ctx)
  // coming from "vraag deze workshop aan": that workshop is already filled in
  const from = WORKSHOPS.find((x) => x.slug === sel)
  const [sent, setSent] = useState(false)
  // a clear focus: 2px orange around the field (instead of the general ink outline)
  const input = 'w-full rounded-[var(--r-box)] bg-ig-cream px-4 py-2.5 text-base focus-visible:outline-2! focus-visible:outline-offset-0! focus-visible:outline-ig-orange!'
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
            <div role="status" className="self-start rounded-[var(--r-box)] bg-ig-cream p-8">
              <h2 className="text-3xl font-bold">dank je!</h2>
              {/* TODO Ariën: check the response time */}
              <p className="mt-3 text-lg">We reageren binnen 2 werkdagen.</p>
              <p className="mt-4 text-sm text-neutral-600">(dit is een test, er is niets verzonden)</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4 rounded-[var(--r-box)] bg-white p-6 ring-1 ring-ig-ink/12 @3xl:p-8">
              {/* naam and organisatie side by side, so the whole form fits on one desktop screen */}
              <div className="grid gap-4 @xl:grid-cols-2">
                <label className="block text-sm font-semibold">Naam<input required className={`${input} mt-1`} /></label>
                <label className="block text-sm font-semibold">Organisatie<input className={`${input} mt-1`} /></label>
              </div>
              <label className="block text-sm font-semibold">E-mail<input required type="email" className={`${input} mt-1`} /></label>
              {from && (
                <label className="block text-sm font-semibold">Workshop<input name="workshop" defaultValue={from.title} className={`${input} mt-1`} /></label>
              )}
              <label className="block text-sm font-semibold">Waar kunnen we je mee helpen?
                <select className={`${input} mt-1`} defaultValue={from ? 'een workshop voor mijn team' : undefined}>
                  <option>een workshop voor mijn team</option>
                  <option>een les of spel voor mijn klas</option>
                  <option>iets voor mijn cliënten of zorgteam</option>
                  <option>train-de-trainer</option>
                  <option>iets anders</option>
                </select>
              </label>
              <label className="block text-sm font-semibold">Bericht<textarea required rows={4} className={`${input} mt-1`} /></label>
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
