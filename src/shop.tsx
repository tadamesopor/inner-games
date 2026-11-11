import { useContext, useEffect, useState } from 'react'
import { ALT, AUD_LABEL, AUDS, GAMES, PHOTOS, PREVIEW_SLUG, STEPS, WORKSHOPS, type Aud, type Game as G } from './data'
import { Btn, card, cardStatic, ContactCta, Ctx, H2, Header, PageHero, Photo, Section, Tag, useMotion } from './wf'
import { initBoxscene } from './motion'

function GameCard({ g }: { g: G }) {
  const { go, cart, toggleCart } = useContext(Ctx)
  const inCart = cart.includes(g.slug)
  return (
    <article className="ig-card ig-card--white ig-card--outline cursor-pointer" onClick={() => go('game', g.slug)}>
      <div className="ig-card__body flex flex-col">
      <div className="ig-card__media relative">
        <Photo src={g.photo} alt={ALT[g.photo] ?? g.title} sizes="(min-width: 1024px) 33vw, 100vw" contain className="aspect-[4/3] w-full" />
        {g.previewKey && <span className="absolute left-3 top-3"><Tag tone="orange">preview</Tag></span>}
        {g.status && <span className="absolute left-3 top-3"><Tag tone="white">{g.status}</Tag></span>}
      </div>
      <div className="flex flex-1 flex-col gap-3 px-2 pb-2 pt-4">
        <div className="flex flex-wrap gap-1.5">
          {g.aud.map((a) => <Tag key={a} tone="cream">{AUD_LABEL[a]}</Tag>)}
        </div>
        <h3 className="text-xl font-semibold leading-tight tracking-tight">{g.title}</h3>
        <p className="text-[15px] text-neutral-700">{g.short}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="text-lg font-semibold">{g.price}</span>
          {g.previewKey ? (
            <Btn
              variant={inCart ? 'light' : 'dark'}
              className={`w-auto! py-2! ${inCart ? 'bg-ig-cream!' : ''}`}
              onClick={() => { toggleCart(g.slug) }}
            >
              {inCart ? 'in mand ✓' : 'in mand'}
            </Btn>
          ) : (
            <Btn variant="dark" className="w-auto! py-2!" disabled>preview volgt</Btn>
          )}
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
      <Header active="games" />
      <PageHero
        id="A"
        label="paginakop"
        kicker="onze spellen"
        title="onze spellen"
        sub="Zes spellen om te spelen, te leren en te groeien. Probeer eerst een preview van 30 seconden."
        photo={PHOTOS.gamesHero}
        alt={ALT[PHOTOS.gamesHero]}
        tone="orange"
      />
      <Section id="B" label="shop-overzicht" className="bg-white" note="WooCommerce-grid · filter · preview-label">
        <div className="mb-8 flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter op doelgroep">
          {(['alle', ...AUDS] as const).map((t) => (
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
          <span className="ml-auto text-sm text-neutral-500">{list.length} van {GAMES.length}</span>
        </div>
        <div className="grid gap-x-7 gap-y-20 pt-14 @3xl:grid-cols-3 @3xl:gap-y-24">
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
  const { go, toggleCart, cart } = useContext(Ctx)
  const matching = WORKSHOPS.filter((w) => w.gameSlug === game.slug)

  const next = (o: string) => {
    setPicked(o)
    setTimeout(() => { setPicked(null); setAnswers((a) => [...a, o]) }, 450)
  }

  if (!s) return null

  return (
    <div className="rounded-2xl bg-ig-cream p-5 text-ig-ink border-2 border-ig-ink shadow-[6px_6px_0_#1f1a17] @3xl:p-8">
      <div className="mb-6 flex items-center gap-1.5" aria-label={`Stap ${Math.min(i + 1, steps.length)} van ${steps.length}`}>
        {steps.map((_, k) => <span key={k} className={`h-1.5 flex-1 rounded-full ${k < i ? 'bg-ig-orange' : k === i && !done ? 'bg-ig-yellow' : 'bg-white'}`} />)}
      </div>
      {!done ? (
        <div className="[perspective:1000px]">
          <div key={i} className="animate-[flipIn_.5s_ease-out] rounded-2xl bg-white p-6 text-center @3xl:p-10">
            <p className="text-sm font-medium text-ig-orange">{s.kind}</p>
            <p className="mx-auto mt-4 max-w-xl text-2xl font-semibold leading-tight @3xl:text-4xl">{s.prompt}</p>
            {s.body && <p className="mx-auto mt-4 max-w-lg text-lg leading-snug text-neutral-700">{s.body}</p>}
            {s.bars && (
              <div className="mx-auto mt-6 max-w-md space-y-3 text-left">
                {s.legend && (
                  <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-neutral-600">
                    <span className="flex items-center gap-1.5"><span className={`h-2.5 w-5 rounded-full ${lightBar}`} />{s.legend.light}</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-full bg-ig-orange" />{s.legend.full}</span>
                  </div>
                )}
                {s.bars.map((b) => {
                  // de kortste balk ligt bovenop, zodat beide zichtbaar blijven
                  const lightOnTop = b.before !== undefined && b.before < b.value
                  return (
                    <div key={b.label}>
                      <div className="flex justify-between gap-3 text-sm"><span>{b.label}</span><span className="text-neutral-500">{b.text ?? `${b.value}%`}</span></div>
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
                  className={`rounded-full px-5 py-2.5 text-base font-semibold transition hover:-translate-y-0.5 hover:bg-ig-yellow ${picked === o ? 'bg-ig-orange' : 'bg-ig-cream'}`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-6 text-center @3xl:p-10" role="status">
          <img src="/assets/meeple.png" alt="" aria-hidden className="mx-auto h-14 w-14 object-contain mix-blend-multiply" />
          <p className="mt-3 text-2xl font-semibold lowercase @3xl:text-4xl">dat was een voorproefje.</p>
          <p className="mx-auto mt-3 max-w-md text-lg">Wil je het hele spel met je team of klas spelen?</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Btn variant="dark" onClick={() => { if (!cart.includes(game.slug)) toggleCart(game.slug); go('game', game.slug) }}>koop het spel · {game.price}</Btn>
            <Btn split variant="primary" onClick={() => (matching.length === 1 ? go('workshop', matching[0].slug) : go('contact'))}>boek een workshop</Btn>
            <Btn variant="ghost" onClick={() => setAnswers([])}>opnieuw</Btn>
          </div>
        </div>
      )}
    </div>
  )
}

export function Game() {
  const { sel, go, cart, toggleCart } = useContext(Ctx)
  const g = GAMES.find((x) => x.slug === sel) ?? GAMES[0]
  const [img, setImg] = useState(0)
  const inCart = cart.includes(g.slug)
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
      <Header active="game" />
      <Section id="A" label="product" className="bg-ig-cream" note="galerij + titel + koopknop (WooCommerce product)">
        <button onClick={() => go('games')} className="mb-6 text-sm underline">← alle spellen</button>
        <div className="grid gap-10 @3xl:grid-cols-2 @3xl:gap-14">
          <div>
            <Photo src={g.gallery[img]} alt={ALT[g.gallery[img]] ?? g.title} eager contain className="aspect-[4/3] w-full rounded-2xl" />
            <div className={`mt-5 flex gap-3 ${g.gallery.length < 2 ? 'hidden' : ''}`}>
              {g.gallery.map((p, k) => (
                <button key={k} onClick={() => setImg(k)} aria-label={`Foto ${k + 1}`} className={`overflow-hidden rounded-xl ${img === k ? 'ring-4 ring-ig-orange' : ''}`}>
                  <Photo src={p} alt="" sizes="80px" contain className="h-16 w-20" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex flex-wrap gap-1.5">
              {g.aud.map((a) => <Tag key={a} tone="white">{AUD_LABEL[a]}</Tag>)}
              {g.status && <Tag tone="yellow">{g.status}</Tag>}
            </div>
            <h1 className="mt-4 text-4xl font-normal leading-[1] tracking-tight @3xl:text-6xl">{g.title}</h1>
            <p className="mt-5 text-xl leading-snug">{g.short}</p>
            <dl className="mt-6 grid grid-cols-1 gap-3 text-sm @3xl:grid-cols-2">
              {facts.map(([k, v]) => (
                <div key={k} className="rounded-xl bg-white p-3">
                  <dt className="text-neutral-600">{k}</dt>
                  <dd className="mt-1 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-3xl font-semibold">{g.price}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Btn split variant="dark" disabled={!!g.status} onClick={() => toggleCart(g.slug)}>{inCart ? 'in je mand ✓' : 'in winkelmand'}</Btn>
              {matching.length === 1 && <Btn variant="primary" onClick={() => go('workshop', matching[0].slug)}>bekijk de workshop</Btn>}
              {matching.length > 1 && (
                <Btn variant="primary" onClick={() => document.getElementById('workshops-bij-spel')?.scrollIntoView({ behavior: 'smooth' })}>bekijk de workshops</Btn>
              )}
              {matching.length === 0 && <Btn variant="primary" onClick={() => go('contact')}>vraag een sessie aan</Btn>}
            </div>
          </div>
        </div>
      </Section>

      {g.box ? (
        // with a cut-out of the box: the box scene. the box lands next to the text and steps over the
        // rounded edge into the preview section (src/motion/boxscene.css)
        <Section id="B" label="omschrijving" className="ig-section--rounded bg-white pb-0!" innerClassName="ig-boxscene" innerRef={box} note="tekst + inhoud van de doos · doos landt bij scrollen">
          <div className="ig-boxscene__text space-y-5 pb-12 text-lg leading-relaxed">
            <H2 className="mb-6">over dit spel</H2>
            {g.story.map((p, i) => <p key={i}>{p}</p>)}
            <div className="rounded-[var(--r-box)] bg-ig-cream p-6 text-base">
              <p className="text-sm font-medium text-[#C84413]">wat zit er in de doos</p>
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
          <div className="space-y-5 text-lg leading-relaxed">
            <H2 className="mb-6">over dit spel</H2>
            {g.story.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <aside className={`${cardStatic} self-start bg-ig-cream p-6 shadow-none`}>
            <p className="text-sm font-medium text-ig-orange">wat zit er in de doos</p>
            <ul className="mt-4 space-y-3">
              {g.contents.map((c) => <li key={c} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ig-orange" />{c}</li>)}
            </ul>
          </aside>
        </div>
      </Section>
      )}

      <Section id="C" label="preview ingebed" className="bg-ig-orange text-white" note="speelbare teaser (±30 sec) eindigt in koop/boek-CTA · Kansen Keren: geen preview">
        <H2 className="mb-8">probeer het eerst</H2>
        {g.previewKey ? (
          <Teaser game={g} />
        ) : (
          <div className={`${cardStatic} p-8 text-ig-ink`}>
            <p className="text-xl font-semibold">Voor dit spel is nog geen preview. Het wordt herzien.</p>
            <Btn variant="dark" className="mt-5" onClick={() => go('contact')}>laat het me weten</Btn>
          </div>
        )}
      </Section>

      {matching.length > 0 && (
        <Section id="D" label="workshops bij dit spel" className="bg-white" note="echte relatie spel ↔ workshop">
          <div id="workshops-bij-spel" className="scroll-mt-24">
            <H2 className="mb-8">workshops met dit spel</H2>
            <div className="grid gap-4 @3xl:grid-cols-3">
              {matching.map((w) => (
                <button key={w.slug} onClick={() => go('workshop', w.slug)} className={`${card} p-5 text-left`}>
                  <h3 className="text-xl font-semibold">{w.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600">{w.duration} · {w.price}</p>
                  <p className="mt-3 text-sm font-semibold text-ig-orange">bekijk de workshop →</p>
                </button>
              ))}
            </div>
          </div>
        </Section>
      )}

      <Section id="E" label="meer spellen" className="bg-ig-cream" note="cross-sell">
        <H2 className="mb-8">meer om te spelen</H2>
        <div className="grid gap-x-7 gap-y-20 pt-14 @3xl:grid-cols-3 @3xl:gap-y-24">{more.map((x) => <GameCard key={x.slug} g={x} />)}</div>
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
      <Header active="preview" />
      <Section id="A" label="speelbare preview" className="min-h-[640px] bg-ig-orange text-white" note="± 30 sec · 4 à 5 stappen · eindigt in CTA">
        <button onClick={() => go('game', g.slug)} className="mb-6 text-sm underline">← terug naar {g.title}</button>
        <p className="text-base font-medium">preview · {g.previewKey}</p>
        <h1 className="mb-8 mt-2 text-4xl font-normal leading-none tracking-tight @3xl:text-7xl">speel 30 seconden</h1>
        <div className="mx-auto max-w-3xl"><Teaser game={g} /></div>
      </Section>
    </>
  )
}
