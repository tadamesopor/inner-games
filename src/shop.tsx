import { useContext, useEffect, useRef, useState } from 'react'
import { ALT, AUD_LABEL, AUDS, BRIGHT, GAMES, PHOTOS, PREVIEW_SLUG, STEPS, WORKSHOPS, type Aud, type Game as G } from './data'
import { Btn, btnLink, chip, ContactCta, Ctx, H1, H2, Header, logEvent, PageHero, Photo, Section, Tag, useMotion, type PageId } from './wf'
import { initBoxscene } from './motion'

/** the number in a price like "€ 152" or "€ 16,35 incl. verzending", for the subtotal */
export function priceOf(g: G): number | null {
  const m = g.price.match(/€\s*([\d.]+(?:,\d+)?)/)
  return m ? parseFloat(m[1].replace(/\./g, '').replace(',', '.')) : null
}
const euro = (n: number) => '€ ' + n.toLocaleString('nl-NL', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })

function GameCard({ g }: { g: G }) {
  const { go, addToCart } = useContext(Ctx)
  // a short "toegevoegd" on the button; you can always add another one
  const [added, setAdded] = useState(false)
  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 1600)
    return () => clearTimeout(t)
  }, [added])
  return (
    <article className="ig-card cursor-pointer" onClick={() => go('game', g.slug)}>
      <div className="ig-card__body flex flex-col">
      <div className="ig-card__media relative">
        <Photo src={g.photo} alt={ALT[g.photo] ?? g.title} sizes="(min-width: 1024px) 300px, 100vw" contain className="aspect-[4/3] w-full" />
        {g.previewKey && <span className="absolute left-3 top-3"><Tag tone="orange">preview</Tag></span>}
        {g.status && <span className="absolute left-3 top-3"><Tag tone="white">{g.status}</Tag></span>}
      </div>
      <div className="flex flex-1 flex-col gap-3 px-2 pb-2 pt-4">
        <div className="flex flex-wrap gap-1.5">
          {g.aud.map((a) => <Tag key={a} tone="cream">{AUD_LABEL[a]}</Tag>)}
        </div>
        <h3 className="ig-card__title">{g.title}</h3>
        <p className="ig-card__text">{g.short}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="text-lead font-semibold">{g.price}</span>
          {!g.status ? (
            <span onClick={(e) => e.stopPropagation()}>
              <Btn
                split
                variant="dark"
                onClick={() => {
                  addToCart(g.slug, 1)
                  setAdded(true)
                }}
              >
                {added ? 'toegevoegd ✓' : 'in mand'}
              </Btn>
            </span>
          ) : null}
        </div>
      </div>
      </div>
    </article>
  )
}

export function Games() {
  const [f, setF] = useState<'alle' | Aud>('alle')
  const list = GAMES.filter((g) => f === 'alle' || g.aud.includes(f))
  return (
    <>
      <Header active="games" tone="orange" />
      <PageHero
        id="A"
        label="paginakop"
        kicker="onze spellen"
        title="onze spellen"
        sub="Zes spellen om te spelen, te leren en te groeien. Probeer eerst een preview van 30 seconden."
        photo={BRIGHT.games}
        alt={ALT[BRIGHT.games]}
        tone="orange"
      />
      <Section id="B" label="shop-overzicht" className="bg-white" note="WooCommerce-grid · filter · preview-label">
        <h2 className="sr-only">alle spellen</h2>
        <div className="mb-8 flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter op doelgroep">
          {(['alle', ...AUDS] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={f === t}
              onClick={() => setF(t)}
              className={chip(f === t)}
            >
              {t}
            </button>
          ))}
          <span className="ml-auto text-meta text-ig-ink/70">{list.length} van {GAMES.length}</span>
        </div>
        <div className="ig-grid">
          {list.map((g) => <GameCard key={g.slug} g={g} />)}
        </div>
      </Section>
      <ContactCta />
    </>
  )
}

// licht oranje, ondoorzichtig, zodat een lichte balk bovenop een volle balk zichtbaar blijft
const lightBar = 'bg-[color-mix(in_srgb,var(--color-ig-orange)_35%,white)]'

function Teaser({ game }: { game: G }) {
  const steps = (game.previewKey && STEPS[game.previewKey]) || []
  const [answers, setAnswers] = useState<string[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const i = answers.length
  const done = i >= steps.length
  const s = steps.length ? steps[Math.min(i, steps.length - 1)](answers) : null
  const { go, addToCart, cart } = useContext(Ctx)
  const matching = WORKSHOPS.filter((w) => w.gameSlug === game.slug)

  const next = (o: string) => {
    setPicked(o)
    setTimeout(() => { setPicked(null); setAnswers((a) => [...a, o]) }, 450)
  }

  if (!s) return null

  return (
    <div className="rounded-box bg-ig-cream p-5 text-ig-ink @3xl:p-8">
      <div className="mb-6 flex items-center gap-1.5" aria-label={`Stap ${Math.min(i + 1, steps.length)} van ${steps.length}`}>
        {steps.map((_, k) => <span key={k} className={`h-1.5 flex-1 rounded-full ${k < i ? 'bg-ig-orange' : k === i && !done ? 'bg-ig-yellow' : 'bg-white'}`} />)}
      </div>
      {!done ? (
        <div className="[perspective:1000px]">
          <div key={i} className="animate-[flipIn_.5s_ease-out] rounded-box bg-white p-6 text-center @3xl:p-10">
            <p className="text-meta font-medium text-ig-orange-text">{s.kind}</p>
            <p className="mx-auto mt-4 max-w-xl text-lead font-semibold leading-tight @3xl:text-h2">{s.prompt}</p>
            {s.body && <p className="mx-auto mt-4 max-w-lg text-lead leading-snug text-ig-ink/80">{s.body}</p>}
            {s.bars && (
              <div className="mx-auto mt-6 max-w-md space-y-3 text-left">
                {s.legend && (
                  <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-meta text-ig-ink/70">
                    <span className="flex items-center gap-1.5"><span className={`h-2.5 w-5 rounded-full ${lightBar}`} />{s.legend.light}</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-full bg-ig-orange" />{s.legend.full}</span>
                  </div>
                )}
                {s.bars.map((b) => {
                  // de kortste balk ligt bovenop, zodat beide zichtbaar blijven
                  const lightOnTop = b.before !== undefined && b.before < b.value
                  return (
                    <div key={b.label}>
                      <div className="flex justify-between gap-3 text-meta"><span>{b.label}</span><span className="text-ig-ink/70">{b.text ?? `${b.value}%`}</span></div>
                      <div className="relative mt-1 h-3 overflow-hidden rounded-full bg-ig-cream">
                        <span className={`absolute inset-y-0 left-0 rounded-full bg-ig-orange transition-all duration-700 ${lightOnTop ? 'z-0' : 'z-10'}`} style={{ width: `${b.value}%` }} />
                        {b.before !== undefined && <span className={`absolute inset-y-0 left-0 rounded-full ${lightBar} ${lightOnTop ? 'z-10' : 'z-0'}`} style={{ width: `${b.before}%` }} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {(s.options ?? ['verder']).map((o) => (
                <button
                  key={o}
                  onClick={() => next(o)}
                  className={`rounded-tag px-5 py-2.5 text-body font-semibold transition hover:-translate-y-0.5 hover:bg-ig-yellow ${picked === o ? 'bg-ig-orange' : 'bg-ig-cream'}`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-box bg-white p-6 text-center @3xl:p-10" role="status">
          <img src="/assets/meeple.png" alt="" aria-hidden className="mx-auto h-14 w-14 object-contain mix-blend-multiply" />
          <p className="mt-3 text-lead font-semibold lowercase @3xl:text-h2">dat was een voorproefje.</p>
          <p className="mx-auto mt-3 max-w-md text-lead">Wil je het hele spel met je team of klas spelen?</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Btn split variant="dark" onClick={() => { if (!cart[game.slug]) addToCart(game.slug, 1); go('game', game.slug) }}>koop het spel · {game.price}</Btn>
            <Btn split variant="primary" onClick={() => (matching.length === 1 ? go('workshop', matching[0].slug) : go('contact'))}>boek een workshop</Btn>
            <Btn variant="ghost" onClick={() => setAnswers([])}>opnieuw</Btn>
          </div>
        </div>
      )}
    </div>
  )
}

// the whole Elemental Five game (public/games/elemental-five, a copy of the game's own repo). it only loads
// after a click, in an iframe, so its css and the site's never mix. one screen high, also on a phone.
// the game sends postMessage: e5:link (koop / workshop) to open our own pages, and e5:start,
// e5:element-done and e5:finished for the test tool.
// WP: Code Block with the same iframe (see docs/WORDPRESS_ENFOLD_MAPPING.md)
const E5_SLUG = 'elemental-five-compleet'
const E5_SRC = '/games/elemental-five/index.html'
const E5_FAN = ['vuur', 'lucht', 'aarde', 'water', 'ether']
let openE5OnArrive = false

/** the "speel het spel" label in the hero: go to the game page and open the game right away */
export function playE5(go: (p: PageId, id?: string) => void) {
  openE5OnArrive = true
  go('game', E5_SLUG)
}

function FullGame() {
  const { go } = useContext(Ctx)
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const start = () => {
    setOpen(true)
    logEvent('e5:open')
  }
  // from the hero label (after the page change has scrolled to the top) or the button higher on the page
  useEffect(() => {
    const show = () => {
      ref.current?.scrollIntoView({ block: 'start' })
      start()
      // then the frame itself, so the whole game is in view under the menu
      setTimeout(() => document.getElementById('spel')?.scrollIntoView({ block: 'start' }), 60)
    }
    // the flag is cleared when it really opens (React runs this effect twice in development)
    const t = openE5OnArrive ? setTimeout(() => { openE5OnArrive = false; show() }, 120) : 0
    window.addEventListener('ig:e5-open', show)
    return () => {
      clearTimeout(t)
      window.removeEventListener('ig:e5-open', show)
    }
  }, [])

  // messages from the game
  useEffect(() => {
    if (!open) return
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== location.origin || typeof e.data?.type !== 'string' || !e.data.type.startsWith('e5:')) return
      if (e.data.type === 'e5:link') {
        logEvent('e5:link', e.data.detail)
        setOpen(false)
        if (e.data.detail === 'koop') go('game', E5_SLUG)
        else go('workshop', 'ontdek-jouw-drijfveren')
        return
      }
      logEvent(e.data.type, e.data.detail)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [open, go])

  return (
    <Section id="SPEL" label="speel de demo" className="bg-ig-cream" note="iframe · laadt pas na de klik">
      <div ref={ref}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <H2>speel de demo</H2>
            <p className="mt-4 max-w-xl text-lead">Kies per element de kaart die bij je past. Speel één element of alle vijf. Er is geen goed of fout.</p>
          </div>
          {open && <Btn variant="ghost" onClick={() => setOpen(false)}>sluit de demo</Btn>}
        </div>
        {open ? (
          // one screen high under the menu, so the whole game is in view without scrolling or full screen
          <div id="spel" className="h-[calc(100svh-112px)] max-h-[860px] min-h-[520px] overflow-hidden rounded-box bg-ig-ink shadow-lift">
            <iframe src={E5_SRC} title="The Elemental Five, demo" allow="autoplay; fullscreen" scrolling="no" className="block h-full w-full border-0" />
          </div>
        ) : (
          <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-box bg-ig-ink px-6 pb-10 pt-12">
            {/* the five card-1s from the game, in a fan */}
            <div className="flex justify-center" aria-hidden>
              {E5_FAN.map((el, i) => (
                <img
                  key={el}
                  src={`/games/elemental-five/assets/img/${el}1.jpg`}
                  alt=""
                  loading="lazy"
                  className="-mx-3 w-[clamp(64px,14cqi,150px)] rounded-media shadow-soft"
                  style={{ rotate: `${(i - 2) * 7}deg`, translate: `0 ${Math.abs(i - 2) * 10}px` }}
                />
              ))}
            </div>
            <Btn split variant="light" onClick={start}>speel de demo</Btn>
          </div>
        )}
      </div>
    </Section>
  )
}

export function Game() {
  const { sel, go, addToCart, openCart } = useContext(Ctx)
  const g = GAMES.find((x) => x.slug === sel) ?? GAMES[0]
  const [img, setImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState<number | null>(null)
  const more = GAMES.filter((x) => x.slug !== g.slug).slice(0, 3)
  const matching = WORKSHOPS.filter((w) => w.gameSlug === g.slug)
  const box = useMotion<HTMLDivElement>(initBoxscene)
  // unknown facts are left out instead of showing "n.t.b."
  const facts = [
    ['voor wie', g.forWhom],
    ['aantal spelers', g.players],
  ].filter((f): f is [string, string] => !!f[1])
  return (
    <>
      <Header active="game" tone="cream" />
      <Section id="A" label="product" className="bg-ig-cream" note="galerij + titel + koopknop (WooCommerce product)">
        <button onClick={() => go('games')} className="mb-6 text-meta underline">← alle spellen</button>
        <div className="grid gap-10 @3xl:grid-cols-2 @3xl:gap-14">
          <div>
            <Photo src={g.gallery[img]} alt={ALT[g.gallery[img]] ?? g.title} eager contain className="aspect-[4/3] w-full rounded-box" />
            <div className={`mt-5 flex gap-3 ${g.gallery.length < 2 ? 'hidden' : ''}`}>
              {g.gallery.map((p, k) => (
                <button key={k} onClick={() => setImg(k)} aria-label={`Foto ${k + 1}`} className={`overflow-hidden rounded-media ${img === k ? 'ring-3 ring-ig-orange' : 'ring-1 ring-ig-ink/12'}`}>
                  {/* all thumbnails the same: square, the same crop, the same white background */}
                  <Photo src={p} alt={ALT[p] ?? ''} sizes="80px" className="aspect-square w-20 bg-white!" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex flex-wrap gap-1.5">
              {g.aud.map((a) => <Tag key={a} tone="white">{AUD_LABEL[a]}</Tag>)}
              {g.status && <Tag tone="yellow">{g.status}</Tag>}
            </div>
            <h1 className="mt-4 text-h2 font-bold tracking-tight">{g.title}</h1>
            <p className="mt-5 text-lead leading-snug">{g.short}</p>
            <dl className="mt-6 grid grid-cols-1 gap-3 text-meta @3xl:grid-cols-2">
              {facts.map(([k, v]) => (
                <div key={k} className="rounded-box bg-white p-3">
                  <dt className="text-ig-ink/70">{k}</dt>
                  <dd className="mt-1 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-lead font-semibold">{g.price}</p>
            <p className="text-meta text-ig-ink/70">{g.priceNote ?? 'incl. btw'}</p>
            {/* TODO Ariën: the delivery text under the button (for example "verzonden binnen 2 werkdagen") */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Qty value={qty} onChange={setQty} label={g.title} disabled={!!g.status} />
              <Btn
                split
                variant="dark"
                disabled={!!g.status}
                onClick={() => {
                  addToCart(g.slug, qty)
                  setAdded(qty)
                }}
              >
                in winkelmand
              </Btn>
              {matching.length === 1 && <Btn variant="primary" onClick={() => go('workshop', matching[0].slug)}>bekijk de workshop</Btn>}
              {matching.length > 1 && (
                <Btn variant="primary" onClick={() => document.getElementById('workshops-bij-spel')?.scrollIntoView({ behavior: 'smooth' })}>bekijk de workshops</Btn>
              )}
              {matching.length === 0 && <Btn variant="primary" onClick={() => go('contact')}>vraag een sessie aan</Btn>}
              {/* the demo is lower on this page (FullGame) */}
              {g.slug.startsWith('elemental-five') && (
                <Btn variant="ghost" onClick={() => window.dispatchEvent(new Event('ig:e5-open'))}>speel de demo ↓</Btn>
              )}
            </div>
            {added !== null && (
              <p role="status" className="mt-4 rounded-box bg-white px-4 py-3 text-body">
                <span className="font-semibold">{added}× {g.title} toegevoegd.</span>{' '}
                <button type="button" onClick={openCart} className="underline underline-offset-2">bekijk winkelmand</button>
                {' · '}
                <button type="button" onClick={() => go('games')} className="underline underline-offset-2">verder winkelen</button>
              </p>
            )}
          </div>
        </div>
      </Section>

      {g.box ? (
        // with a cut-out of the box: the box scene. the box lands next to the text and steps over the
        // rounded edge into the preview section (src/motion/boxscene.css)
        <Section id="B" label="omschrijving" className="ig-section--rounded bg-white pb-0!" innerClassName="ig-boxscene" innerRef={box} note="tekst + inhoud van de doos · doos landt bij scrollen">
          <div className="ig-boxscene__text space-y-5 pb-12 text-lead leading-relaxed">
            <H2 className="mb-6">over dit spel</H2>
            {g.story.map((p, i) => <p key={i}>{p}</p>)}
            <div className="rounded-box bg-ig-cream p-6 text-body">
              <p className="text-meta font-medium text-ig-orange-text">wat zit er in de doos</p>
              <ul className="mt-4 space-y-2">
                {g.contents.map((c) => <li key={c} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ig-orange" />{c}</li>)}
              </ul>
            </div>
          </div>
          <div className="ig-boxscene__stage" style={{ aspectRatio: `${g.box.w} / ${g.box.h}` }}>
            <img className="ig-boxscene__box" src={g.box.src} alt={`Speldoos van ${g.title.split(',')[0]}`} width={g.box.w} height={g.box.h} loading="lazy" />
            <span className="ig-boxscene__shadow" aria-hidden />
          </div>
        </Section>
      ) : (
      <Section id="B" label="omschrijving" className="bg-white" note="tekst + inhoud van de doos">
        <div className="grid gap-12 @3xl:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5 text-lead leading-relaxed">
            <H2 className="mb-6">over dit spel</H2>
            {g.story.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <aside className="ig-card ig-card--still ig-card--text self-start">
            <div className="ig-card__body">
              <p className="text-meta font-medium text-ig-orange-text">wat zit er in de doos</p>
              <ul className="mt-4 space-y-3">
                {g.contents.map((c) => <li key={c} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ig-orange" />{c}</li>)}
              </ul>
            </div>
          </aside>
        </div>
      </Section>
      )}

      {!g.slug.startsWith('elemental-five') && (
      <Section id="C" label="preview ingebed" className="bg-ig-orange text-white" note="speelbare teaser (±30 sec) eindigt in koop/boek-CTA · Kansen Keren: geen preview">
        <H2 className="mb-8">probeer het eerst</H2>
        {g.previewKey ? (
          <Teaser game={g} />
        ) : (
          <div className="ig-card ig-card--still ig-card--text text-ig-ink">
            <div className="ig-card__body">
              <p className="text-lead font-semibold">Voor dit spel is nog geen preview. Het wordt herzien.</p>
              <Btn variant="dark" className="mt-5" onClick={() => go('contact')}>laat het me weten</Btn>
            </div>
          </div>
        )}
      </Section>
      )}

      {g.slug.startsWith('elemental-five') && <FullGame />}

      {matching.length > 0 && (
        <Section id="D" label="workshops bij dit spel" className="bg-white" note="echte relatie spel ↔ workshop">
          <div id="workshops-bij-spel" className="scroll-mt-24">
            <H2 className="mb-8">workshops met dit spel</H2>
            <div className="ig-grid">
              {matching.map((w) => (
                <button key={w.slug} onClick={() => go('workshop', w.slug)} className="ig-card ig-card--text text-left">
                  <span className="ig-card__body block">
                    <h3 className="ig-card__title">{w.title}</h3>
                    <p className="ig-card__meta mt-1">{w.duration} · {w.price}</p>
                    <p className="mt-3 text-meta font-semibold text-ig-orange-text">bekijk de workshop →</p>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Section>
      )}

      <Section id="E" label="meer spellen" className="bg-ig-cream" note="cross-sell">
        <H2 className="mb-8">meer om te spelen</H2>
        <div className="ig-grid">{more.map((x) => <GameCard key={x.slug} g={x} />)}</div>
      </Section>
    </>
  )
}

export function Preview() {
  const { sel, go } = useContext(Ctx)
  const slug = GAMES.some((g) => g.slug === sel && g.previewKey) ? sel : PREVIEW_SLUG['the elemental five']
  const g = GAMES.find((x) => x.slug === slug)!
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <>
      <Header active="preview" tone="orange" />
      <Section id="A" label="speelbare preview" className="min-h-[640px] bg-ig-orange text-white" note="± 30 sec · 4 à 5 stappen · eindigt in CTA">
        <button onClick={() => go('game', g.slug)} className="mb-6 text-meta underline">← terug naar {g.title}</button>
        <p className="text-body font-medium">preview · {g.previewKey}</p>
        <h1 className="mb-8 mt-2 text-h1 font-bold tracking-tight">speel 30 seconden</h1>
        <div className="mx-auto max-w-3xl"><Teaser game={g} /></div>
      </Section>
    </>
  )
}

/** quantity field like WooCommerce: − 1 +, between 1 and 99, also typeable */
export function Qty({ value, onChange, label, disabled }: { value: number; onChange: (n: number) => void; label: string; disabled?: boolean }) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])
  const clamp = (n: number) => Math.max(1, Math.min(99, Math.round(n) || 1))
  const step = 'flex h-11 w-10 items-center justify-center text-lead font-semibold disabled:opacity-40'
  return (
    <div className={`inline-flex h-11 items-center rounded-box bg-white ring-1 ring-ig-ink/20 ${disabled ? 'opacity-50' : ''}`}>
      <button type="button" className={step} onClick={() => onChange(clamp(value - 1))} disabled={disabled || value <= 1} aria-label={`${label}: één minder`}>
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={99}
        value={text}
        disabled={disabled}
        aria-label={`${label}: aantal`}
        onChange={(e) => {
          setText(e.target.value)
          const n = parseInt(e.target.value, 10)
          if (!Number.isNaN(n)) onChange(clamp(n))
        }}
        onBlur={() => setText(String(value))}
        className="h-11 w-10 bg-transparent text-center text-body font-semibold outline-none [appearance:textfield] focus-visible:ring-2 focus-visible:ring-ig-orange [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" className={step} onClick={() => onChange(clamp(value + 1))} disabled={disabled || value >= 99} aria-label={`${label}: één meer`}>
        +
      </button>
    </div>
  )
}

/** the cart as a drawer on the right: a row per product, the subtotal, and the (dummy) checkout */
export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, setQty, go } = useContext(Ctx)
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    close.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  const rows = Object.entries(cart)
    .map(([slug, n]) => ({ g: GAMES.find((x) => x.slug === slug), n }))
    .filter((r): r is { g: G; n: number } => !!r.g)
  const sub = rows.reduce((t, r) => t + (priceOf(r.g) ?? 0) * r.n, 0)
  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Winkelmand">
      <button type="button" className="absolute inset-0 bg-ig-ink/30" onClick={onClose} aria-label="Sluit de winkelmand" tabIndex={-1} />
      <div className="absolute inset-y-0 right-0 flex w-[min(440px,100%)] flex-col bg-white shadow-lift">
        <div className="flex items-center justify-between border-b border-ig-ink/10 px-5 py-4">
          <h2 className="text-lead font-semibold">winkelmand</h2>
          <button ref={close} type="button" onClick={onClose} className="h-11 rounded-box bg-ig-cream px-4 text-meta font-semibold hover:bg-ig-yellow-light">
            sluit
          </button>
        </div>
        {rows.length === 0 ? (
          <div className="flex-1 px-5 py-6">
            <p className="text-body">Je winkelmand is nog leeg.</p>
            <Btn variant="ghost" className="mt-4" onClick={() => { onClose(); go('games') }}>bekijk de spellen</Btn>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-ig-ink/10 overflow-y-auto px-5">
            {rows.map(({ g, n }) => {
              const each = priceOf(g)
              return (
                <li key={g.slug} className="grid grid-cols-[64px_1fr] gap-4 py-4">
                  <Photo src={g.photo} alt="" sizes="64px" contain className="aspect-square w-16 rounded-media" />
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold leading-snug">{g.title}</p>
                      <p className="shrink-0 font-semibold">{each === null ? '' : euro(each * n)}</p>
                    </div>
                    <p className="text-meta text-ig-ink/70">{g.price} per stuk</p>
                    <div className="mt-2 flex items-center gap-3">
                      <Qty value={n} onChange={(x) => setQty(g.slug, x)} label={g.title} />
                      <button type="button" onClick={() => setQty(g.slug, 0)} className="text-meta underline underline-offset-2">
                        verwijder
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        {rows.length > 0 && (
          <div className="border-t border-ig-ink/10 px-5 py-5">
            <div className="flex justify-between text-lead font-semibold">
              <span>subtotaal</span>
              <span>{euro(sub)}</span>
            </div>
            <p className="text-meta text-ig-ink/70">incl. btw · verzendkosten: berekend bij afrekenen</p>
            <Btn
              split
              variant="dark"
              className="mt-4"
              onClick={() => {
                onClose()
                go('checkout')
              }}
            >
              naar afrekenen
            </Btn>
            <p className="mt-3 text-meta text-ig-ink/70">prototype · afrekenen verloopt straks via WooCommerce</p>
          </div>
        )}
      </div>
    </div>
  )
}

/** a dummy checkout, like the WooCommerce one: your details and the order. placing the order is where the
    test stops. nothing is sent */
export function Checkout() {
  const { cart, go } = useContext(Ctx)
  const [stop, setStop] = useState(false)
  const rows = Object.entries(cart)
    .map(([slug, n]) => ({ g: GAMES.find((x) => x.slug === slug), n }))
    .filter((r): r is { g: G; n: number } => !!r.g)
  const sub = rows.reduce((t, r) => t + (priceOf(r.g) ?? 0) * r.n, 0)
  const input = 'mt-1 w-full rounded-box bg-ig-cream px-4 py-2.5 text-body focus-visible:outline-2! focus-visible:outline-offset-0! focus-visible:outline-ig-orange!'
  return (
    <>
      <Header active="checkout" />
      <Section id="A" label="afrekenen" className="bg-white" note="dummy · WooCommerce afrekenen">
        <button onClick={() => go('games')} className="mb-6 text-meta underline">← verder winkelen</button>
        <H1>afrekenen</H1>
        {rows.length === 0 ? (
          <p className="mt-6 text-lead">Je winkelmand is leeg.</p>
        ) : (
          <div className="mt-10 grid gap-10 @4xl:grid-cols-[1.2fr_1fr]">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setStop(true)
              }}
              className="space-y-4"
            >
              <h2 className="text-lead font-bold">je gegevens</h2>
              <div className="grid gap-4 @xl:grid-cols-2">
                <label className="block text-meta font-semibold">Naam<input className={input} autoComplete="name" /></label>
                <label className="block text-meta font-semibold">E-mail<input type="email" className={input} autoComplete="email" /></label>
              </div>
              <label className="block text-meta font-semibold">Adres<input className={input} autoComplete="street-address" /></label>
              <div className="grid gap-4 @xl:grid-cols-[1fr_2fr]">
                <label className="block text-meta font-semibold">Postcode<input className={input} autoComplete="postal-code" /></label>
                <label className="block text-meta font-semibold">Plaats<input className={input} autoComplete="address-level2" /></label>
              </div>
              <Btn split type="submit" variant="dark">bestelling plaatsen</Btn>
              {stop ? (
                <p role="status" className="rounded-media bg-ig-yellow px-3 py-2 text-meta font-semibold">hier stopt de test</p>
              ) : (
                <p className="text-meta text-ig-ink/70">prototype · er wordt niets besteld of betaald</p>
              )}
            </form>
            <aside className="self-start rounded-box bg-ig-cream p-6">
              <h2 className="text-lead font-bold">je bestelling</h2>
              <ul className="mt-4 divide-y divide-ig-ink/10">
                {rows.map(({ g, n }) => {
                  const each = priceOf(g)
                  return (
                    <li key={g.slug} className="flex items-center gap-4 py-3">
                      <Photo src={g.photo} alt="" sizes="56px" className="aspect-square w-14 shrink-0 rounded-media bg-white!" />
                      <span className="flex-1 font-semibold leading-snug">
                        {n}× {g.title}
                      </span>
                      <span className="font-semibold">{each === null ? '' : euro(each * n)}</span>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-4 flex justify-between border-t border-ig-ink/15 pt-4 text-lead font-bold">
                <span>subtotaal</span>
                <span>{euro(sub)}</span>
              </div>
              <p className="text-meta text-ig-ink/70">incl. btw</p>
              {/* TODO Ariën: shipping costs */}
              <p className="mt-3 inline-block rounded-tag border border-dashed border-ig-ink/40 px-2.5 py-1 text-meta">verzendkosten: nog aan te leveren</p>
            </aside>
          </div>
        )}
      </Section>
    </>
  )
}
