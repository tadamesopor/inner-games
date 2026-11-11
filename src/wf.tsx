import { createContext, useContext, useState, type CSSProperties, type ReactNode } from 'react'
import { SplitBtn } from './motionui'
import { CLIENTS, GAMES, PARTNERS, WORKSHOPS, type Aud } from './data'

export type PageId =
  | 'home'
  | 'workshops'
  | 'workshop'
  | 'games'
  | 'game'
  | 'preview'
  | 'projects'
  | 'trainer'
  | 'team'
  | 'contact'

type CtxT = {
  ann: boolean
  sel: string
  cart: string[]
  go: (p: PageId, id?: string) => void
  toggleCart: (id: string) => void
}

export const Ctx = createContext<CtxT>({ ann: false, sel: '', cart: [], go: () => {}, toggleCart: () => {} })

// calm cards: white, a thin soft line, no black border or offset shadow (brand rule).
// the workshop and game cards are .ig-card (the hand pops up on hover), see src/motion/cards.css
const SOFT = ' rounded-[var(--r-box)] bg-white ring-1 ring-ig-ink/12'
export const cardStatic = `${SOFT} overflow-hidden`
export const card = `${cardStatic} transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgb(42_24_16/0.12)]`

export function Section({
  id,
  label,
  note,
  className = '',
  stop = false,
  children,
}: {
  id?: string
  label?: string
  note?: string
  className?: string
  /** a stop on the speelpad: the path makes a square next to this block and the pawn waits there */
  stop?: boolean
  children: ReactNode
}) {
  const { ann } = useContext(Ctx)
  return (
    <section
      className={`relative px-5 py-14 @3xl:px-16 @3xl:py-24 ${className} ${ann ? 'outline-dashed outline-1 -outline-offset-1 outline-black/60' : ''}`}
    >
      {ann && label && (
        <div className="absolute left-0 top-0 z-30 flex max-w-full items-start">
          <span className="bg-black px-2 py-1 text-[11px] text-white">
            {id} · {label}
          </span>
          {note && <span className="hidden bg-yellow-200 px-2 py-1 text-[11px] text-black @3xl:block">{note}</span>}
        </div>
      )}
      {/* content stops at 1280px, so cards and text don't stretch on a wide screen. not positioned on purpose:
          absolute backgrounds (the hero photo) still fill the whole section */}
      <div className="mx-auto w-full max-w-[1280px]" data-speelpad-stop={stop || undefined}>
        {children}
      </div>
    </section>
  )
}

// src is a base path from data.ts (no extension). the browser picks the 800 or 1600 version itself,
// same as WordPress does with srcset. contain = product photos that must not be cropped
export function Photo({
  src,
  alt,
  className = '',
  sizes = '(min-width: 1024px) 50vw, 100vw',
  eager = false,
  contain = false,
}: {
  src: string
  alt: string
  className?: string
  sizes?: string
  eager?: boolean
  contain?: boolean
}) {
  return (
    <img
      src={`${src}-1600.webp`}
      srcSet={`${src}-800.webp 800w, ${src}-1600.webp 1600w`}
      sizes={sizes}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      className={`bg-ig-cream ${contain ? 'object-contain' : 'object-cover'} ${className}`}
    />
  )
}

export function Img({ label, className = 'aspect-[4/3]' }: { label: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden border border-dashed border-ig-ink/40 bg-ig-cream ${className}`}>
      <span className="absolute left-1/2 top-1/2 w-[85%] -translate-x-1/2 -translate-y-1/2 bg-white/90 px-2 py-1 text-center text-xs leading-tight">
        {label}
      </span>
    </div>
  )
}

export function Link({
  to,
  id,
  className = '',
  children,
  onClick,
  ...rest
}: {
  to: PageId
  id?: string
  className?: string
  children: ReactNode
  onClick?: () => void
  'aria-current'?: 'page'
}) {
  const { go } = useContext(Ctx)
  return (
    <a
      href="#"
      className={className}
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
        go(to, id)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}

type Variant = 'primary' | 'dark' | 'light' | 'ghost' | 'ghostLight'
// calm buttons: flat colour, no black offset shadow, no thick border (brand rule).
// the main actions use the split button instead (Btn split)
const VARIANT: Record<Variant, string> = {
  primary: 'border-transparent bg-ig-orange text-ig-ink hover:bg-[#d84f1c]',
  dark: 'border-transparent bg-ig-ink text-white hover:bg-ig-ink/88',
  light: 'border-transparent bg-white text-ig-ink hover:bg-ig-cream',
  ghost: 'border-ig-ink/35 bg-transparent text-ig-ink hover:border-ig-ink hover:bg-ig-ink hover:text-white',
  ghostLight: 'border-white/60 bg-transparent text-white hover:bg-white hover:text-ig-ink',
}

export function Btn({
  children,
  variant = 'primary',
  onClick,
  className = '',
  type = 'button',
  disabled,
  split = false,
}: {
  children: ReactNode
  variant?: Variant
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  /** main actions only: the split button with the drawn arrow (src/motion/buttons.css) */
  split?: boolean
}) {
  if (split)
    return (
      <SplitBtn tone={variant === 'dark' ? 'ink' : variant === 'light' ? 'cream' : 'orange'} type={type} disabled={disabled} onClick={onClick} className={className}>
        {children}
      </SplitBtn>
    )
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-[var(--r-box)] border-[1.5px] px-5 py-3 text-[15px] font-semibold lowercase transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ig-ink disabled:opacity-50 @3xl:w-auto ${VARIANT[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function H1({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h1 className={`text-[2.8rem] font-extrabold lowercase leading-[0.92] tracking-tight @3xl:text-[6.5rem] ${className}`}>{children}</h1>
}

export function H2({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-[2rem] font-extrabold lowercase leading-[0.98] tracking-tight @3xl:text-6xl ${className}`}>{children}</h2>
}

export function Tag({ children, tone = 'yellow' }: { children: ReactNode; tone?: 'yellow' | 'white' | 'orange' | 'cream' }) {
  const t = {
    yellow: 'bg-ig-yellow',
    white: 'bg-white',
    orange: 'bg-ig-orange',
    cream: 'bg-ig-cream',
  }[tone]
  return <span className={`inline-block rounded-full border-2 border-ig-ink px-3 py-0.5 font-mono text-[11px] uppercase tracking-wide text-ig-ink ${t}`}>{children}</span>
}

export function AudIcon({ aud, className = '' }: { aud: Aud; className?: string }) {
  const paths: Record<Aud, string> = {
    onderwijs: 'M3 5h6a3 3 0 013 3v12a2 2 0 00-2-2H3zM21 5h-6a3 3 0 00-3 3v12a2 2 0 012-2h7z',
    organisaties: 'M5 21V4h9v17M14 9h5v12M8 8h3M8 12h3M8 16h3M3 21h18',
    zorg: 'M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z',
    trainers: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z',
  }
  const bg: Record<Aud, string> = {
    onderwijs: 'bg-ig-yellow text-ig-ink',
    organisaties: 'bg-ig-orange text-white',
    zorg: 'bg-ig-cream text-ig-orange',
    trainers: 'bg-ig-ink text-ig-yellow',
  }
  return (
    <span className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ig-ink ${bg[aud]} ${className}`}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={paths[aud]} />
      </svg>
    </span>
  )
}

type Tone = 'white' | 'cream' | 'orange'
const TONE: Record<Tone, string> = {
  white: 'bg-white text-ig-ink',
  cream: 'bg-ig-cream text-ig-ink',
  orange: 'bg-ig-orange text-white',
}

export function PageHero({
  id,
  label,
  kicker,
  title,
  sub,
  photo,
  alt,
  tone = 'cream',
}: {
  id: string
  label: string
  kicker: string
  title: string
  sub: string
  photo: string
  alt: string
  tone?: Tone
}) {
  return (
    <Section id={id} label={label} className={`ig-section--rounded py-10! @3xl:py-16! ${TONE[tone]}`}>
      <div className="grid items-center gap-8 @3xl:grid-cols-[1.2fr_1fr] @3xl:gap-14">
        <div>
          <p className="mb-4 text-sm font-medium">{kicker}</p>
          <H1>{title}</H1>
          <p className="mt-6 max-w-xl text-lg leading-snug @3xl:text-2xl">{sub}</p>
        </div>
        <Photo src={photo} alt={alt} className="h-60 w-full rounded-2xl border-2 border-ig-ink shadow-[6px_6px_0_#1f1a17] @3xl:h-[400px]" />
      </div>
    </Section>
  )
}

export function ClientStrip() {
  return (
    <Section id="LOGO" label="logo’s opdrachtgevers" className="bg-white" note="vertrouwen">
      <p className="mb-8 text-center text-sm font-medium">zij speelden al met ons</p>
      {/* every logo in one calm ink tone at the same height, instead of one big image */}
      <ul className="mx-auto grid max-w-6xl grid-cols-4 items-center justify-items-center gap-x-4 gap-y-6 @3xl:grid-cols-8 @3xl:gap-y-10" aria-label="opdrachtgevers">
        {CLIENTS.map((c) => (
          <li key={c.file}>
            <img
              src={`/assets/img/clients/${c.file}.png`}
              alt={c.name}
              loading="lazy"
              style={{ '--h': c.h } as CSSProperties}
              className="h-[calc(var(--h)*0.48px)] w-auto opacity-60 brightness-0 @3xl:h-[calc(var(--h)*0.75px)]"
            />
          </li>
        ))}
      </ul>
    </Section>
  )
}

export function PartnerStrip() {
  return (
    <Section id="PARTNERS" label="partners" className="bg-ig-cream py-12! @3xl:py-16!" note="partners · onder de logo’s">
      <p className="mb-6 text-center text-sm font-medium">onze partners</p>
      <ul className="mx-auto flex max-w-5xl flex-wrap justify-center gap-2.5">
        {PARTNERS.map((p) => (
          <li key={p} className="rounded-full border-2 border-ig-ink bg-white px-4 py-2 text-[15px] font-semibold shadow-[3px_3px_0_#1f1a17]">
            {p}
          </li>
        ))}
      </ul>
    </Section>
  )
}

export function ContactCta({ id = 'CTA' }: { id?: string }) {
  const { go } = useContext(Ctx)
  return (
    <Section id={id} label="contact-cta" className="bg-white py-10! @3xl:py-16!" note="gewone knop, geen handjes-afbeelding">
      <div className="flex flex-col items-start justify-between gap-8 rounded-3xl border-2 border-ig-ink bg-ig-orange p-7 text-ig-ink shadow-[8px_8px_0_#1f1a17] @3xl:flex-row @3xl:items-center @3xl:p-14">
        <div>
          <H2 className="max-w-2xl">benieuwd wat spelen voor jou doet?</H2>
          <p className="mt-4 max-w-lg text-lg">Vertel ons over je team, klas of cliënten. We denken graag mee.</p>
        </div>
        <Btn split variant="dark" className="shrink-0" onClick={() => go('contact')}>
          boek een workshop
        </Btn>
      </div>
    </Section>
  )
}

const NAV: { label: string; to: PageId }[] = [
  { label: 'home', to: 'home' },
  { label: 'sessies en workshops', to: 'workshops' },
  { label: 'onze spellen', to: 'games' },
  { label: 'projecten', to: 'projects' },
  { label: 'train-de-trainer', to: 'trainer' },
  { label: 'ons team', to: 'team' },
  { label: 'contact', to: 'contact' },
]

const GROUP: Record<PageId, PageId> = {
  home: 'home',
  workshops: 'workshops',
  workshop: 'workshops',
  games: 'games',
  game: 'games',
  preview: 'games',
  projects: 'projects',
  trainer: 'trainer',
  team: 'team',
  contact: 'contact',
}

const iconBtn = 'flex h-10 items-center justify-center gap-2 rounded-full border-2 border-ig-ink bg-white px-3 text-sm font-semibold transition hover:bg-ig-yellow'

/** Zoekt op titels van workshops en spellen. */
export function Search({ placeholder, autoFocus }: { placeholder: string; autoFocus?: boolean }) {
  const { go } = useContext(Ctx)
  const [q, setQ] = useState('')
  const term = q.trim().toLowerCase()
  const hits = term
    ? [
        ...WORKSHOPS.filter((w) => w.title.toLowerCase().includes(term)).map((w) => ({ key: 'w' + w.slug, kind: 'workshop', title: w.title, to: () => go('workshop', w.slug) })),
        ...GAMES.filter((g) => g.title.toLowerCase().includes(term)).map((g) => ({ key: 'g' + g.slug, kind: 'spel', title: g.title, to: () => go('game', g.slug) })),
      ]
    : []
  return (
    <form onSubmit={(e) => { e.preventDefault(); hits[0]?.to() }} role="search" className="relative">
      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus={autoFocus} aria-label="Zoeken" placeholder={placeholder} className="h-11 min-w-0 flex-1 rounded-full border-2 border-ig-ink bg-white px-4 text-base outline-none" />
        <Btn type="submit" variant="dark" className="w-auto! py-2!">zoek</Btn>
      </div>
      {term && (
        <ul className="mt-2 overflow-hidden rounded-2xl border-2 border-ig-ink bg-white text-sm text-ig-ink" aria-label="Zoekresultaten">
          {hits.length === 0 && <li className="px-4 py-3 text-neutral-600">Niets gevonden voor “{q.trim()}”.</li>}
          {hits.map((h) => (
            <li key={h.key} className="border-b border-ig-ink/10 last:border-0">
              <button type="button" onClick={h.to} className="flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-left hover:bg-ig-yellow">
                <span className="font-semibold">{h.title}</span>
                <span className="shrink-0 font-mono text-[11px] uppercase text-neutral-600">{h.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}

export function Header({ active }: { active: PageId }) {
  const { go, cart, toggleCart, ann } = useContext(Ctx)
  const [open, setOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [stop, setStop] = useState(false)
  const items = cart.map((s) => GAMES.find((g) => g.slug === s)!).filter(Boolean)
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ig-ink bg-white">
      {ann && <span className="absolute left-0 top-0 z-50 bg-black px-2 py-1 text-[11px] text-white">NAV · header + navigatie</span>}
      <div className="mx-auto flex max-w-[calc(1280px+8rem)] items-center justify-between gap-4 px-5 py-2.5 @3xl:px-16">
        <Link to="home" className="shrink-0">
          <img src="/assets/logo.png" alt="InnerGames, naar de homepage" className="h-11 w-auto @3xl:h-14" />
        </Link>
        <nav className="hidden items-center gap-5 @6xl:flex" aria-label="Hoofdmenu">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              aria-current={GROUP[active] === n.to ? 'page' : undefined}
              className={`border-b-[3px] pb-0.5 text-[15px] font-medium transition hover:border-ig-orange ${GROUP[active] === n.to ? 'border-ig-orange' : 'border-transparent'}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSearchOpen(!searchOpen); setCartOpen(false) }}
            aria-expanded={searchOpen}
            aria-label="Zoeken"
            className={`${iconBtn} w-10 px-0!`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4.5 4.5" />
            </svg>
          </button>
          <button
            onClick={() => { setCartOpen(!cartOpen); setSearchOpen(false) }}
            aria-expanded={cartOpen}
            aria-label={`Winkelmand, ${cart.length} product${cart.length === 1 ? '' : 'en'}`}
            className={iconBtn}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M3 4h3l2.5 11h10L21 7H7" />
              <circle cx="10" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
            </svg>
            <span className={`min-w-5 rounded-full px-1.5 text-center text-xs ${cart.length ? 'bg-ig-orange text-white' : 'bg-white'}`}>{cart.length}</span>
          </button>
          <Btn className="hidden py-2! @6xl:inline-flex" onClick={() => go('workshops')}>
            boek een workshop
          </Btn>
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Menu"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-full border-2 border-ig-ink @6xl:hidden"
          >
            <i className={`block h-0.5 w-5 bg-ig-ink transition ${open ? 'translate-y-1.5 rotate-45' : ''}`} />
            <i className={`block h-0.5 w-5 bg-ig-ink transition ${open ? 'opacity-0' : ''}`} />
            <i className={`block h-0.5 w-5 bg-ig-ink transition ${open ? '-translate-y-1.5 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>
      {searchOpen && (
        <div className="border-t border-ig-ink/10 bg-ig-cream px-5 py-3 @3xl:px-16">
          <Search autoFocus placeholder="zoek in spellen en workshops" />
        </div>
      )}
      {open && (
        <nav className="border-t border-ig-ink/10 bg-white @6xl:hidden" aria-label="Mobiel menu">
          <div className="p-5 pb-3">
            <Btn onClick={() => { setOpen(false); go('workshops') }}>boek een workshop</Btn>
          </div>
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className={`block border-b border-ig-ink/10 px-5 py-4 text-lg font-medium ${GROUP[active] === n.to ? 'bg-ig-cream' : ''}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
      {cartOpen && (
        <div className="absolute right-5 top-full z-50 mt-2 w-[min(20rem,calc(100%-2.5rem))] rounded-2xl bg-white p-4 border-2 border-ig-ink shadow-[6px_6px_0_#1f1a17] @3xl:right-16">
          <p className="text-sm font-medium text-neutral-600">winkelmand</p>
          {items.length === 0 ? (
            <p className="mt-3 text-sm">Je mand is nog leeg. Speel eerst een preview!</p>
          ) : (
            <ul className="mt-3 divide-y divide-ig-ink/10">
              {items.map((g) => (
                <li key={g.slug} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="font-medium">{g.title}</span>
                  <button onClick={() => toggleCart(g.slug)} className="shrink-0 text-xs underline">verwijder</button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex gap-2">
            <Btn className="w-auto! flex-1 py-2!" variant="dark" disabled={items.length === 0} onClick={() => setStop(true)}>afrekenen</Btn>
            <Btn className="w-auto! py-2!" variant="ghost" onClick={() => { setCartOpen(false); go('games') }}>verder kijken</Btn>
          </div>
          {stop ? (
            <p role="status" className="mt-3 bg-ig-yellow px-3 py-2 text-sm font-bold">hier stopt de test</p>
          ) : (
            <p className="mt-3 text-xs text-neutral-500">prototype · afrekenen verloopt straks via WooCommerce</p>
          )}
        </div>
      )}
    </header>
  )
}

export function Footer() {
  const { ann } = useContext(Ctx)
  const link = 'block py-0.5 hover:underline'
  return (
    <>
      <Section id="FOOT" label="footer" className="bg-ig-orange pb-12! text-ig-ink" note="zelfde op elke pagina">
        <div className="grid grid-cols-1 gap-10 @3xl:grid-cols-4">
          <div className="space-y-1 text-[15px]">
            <p className="font-semibold">bezoekadres</p>
            <p>InnerGames</p>
            <p>Kronehoefstraat 87</p>
            <p>5612 HL Eindhoven</p>
            <p className="pt-3 font-semibold">postadres</p>
            <p>Westrik 3</p>
            <p>5629 CE Eindhoven</p>
          </div>
          <div className="space-y-1 text-[15px]">
            <p className="font-semibold">bel, app of mail ons</p>
            <p>Telefoon: +31 (0)6 – 215 27 855</p>
            <p>WhatsApp: +31 (0)6 – 215 27 855</p>
            <p>
              E-mail: <a className="underline" href="mailto:info@innergames.nl">info@innergames.nl</a>
            </p>
            <p>
              <a className="underline" href="https://www.linkedin.com/company/innergames" target="_blank" rel="noreferrer">LinkedIn</a>
            </p>
          </div>
          <div className="text-[15px]">
            <p className="font-semibold">navigatie</p>
            <Link to="workshops" className={link}>sessies en workshops</Link>
            <Link to="games" className={link}>onze spellen</Link>
            <Link to="projects" className={link}>projecten</Link>
            <Link to="trainer" className={link}>train-de-trainer</Link>
            <Link to="team" className={link}>ons team</Link>
            <Link to="contact" className={link}>contact</Link>
          </div>
          <div className="self-start text-ig-ink">
            <Search placeholder="zoek" />
          </div>
        </div>
      </Section>
      <div className="bg-ig-ink px-5 py-3 text-xs text-neutral-400 @3xl:px-16">
        © Copyright – InnerGames{ann ? ' · Enfold WordPress Theme' : ''}
      </div>
    </>
  )
}

export function Marquee({ text }: { text: string }) {
  return (
    <div className="overflow-hidden bg-ig-yellow py-3 text-ig-ink [--ig-next-pad:12px]" aria-label={text}>
      <div className="flex w-max animate-[marquee_40s_linear_infinite] motion-reduce:animate-none">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="flex items-center gap-6 pr-6 text-2xl font-extrabold lowercase italic @3xl:text-4xl">
                {text}
                <img src="/assets/meeple.png" alt="" className="h-9 w-9 object-contain mix-blend-multiply @3xl:h-12 @3xl:w-12" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
