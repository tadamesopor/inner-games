import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from 'react'
import { PencilMark, SplitBtn } from './motionui'
import { initFooterReveal, initNav } from './motion'
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
  /** footer option A (the hand, on ink) or B (the team photo, on orange), switchable in the prototype bar */
  footer: 'hand' | 'foto'
  sel: string
  /** the cart like WooCommerce: product slug -> quantity */
  cart: Cart
  go: (p: PageId, id?: string) => void
  addToCart: (slug: string, n: number) => void
  /** set the quantity; 0 removes the product */
  setQty: (slug: string, n: number) => void
  openCart: () => void
}

export type Cart = Record<string, number>
export const cartCount = (c: Cart) => Object.values(c).reduce((t, n) => t + n, 0)

/** an event for the test tool (cart:add, cart:remove ...), logged with a timestamp during a task */
export function logEvent(type: string, detail = '') {
  window.dispatchEvent(new CustomEvent('ig:event', { detail: { type, detail } }))
}

export const Ctx = createContext<CtxT>({ ann: false, footer: 'hand', sel: '', cart: {}, go: () => {}, addToCart: () => {}, setQty: () => {}, openCart: () => {} })

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
  innerClassName = '',
  innerRef,
  children,
}: {
  id?: string
  label?: string
  note?: string
  className?: string
  /** a stop on the speelpad: the path makes a square next to this block and the pawn waits there */
  stop?: boolean
  /** classes and ref for the 1280px content box, for effects that hang on it (like .ig-boxscene) */
  innerClassName?: string
  innerRef?: Ref<HTMLDivElement>
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
      <div ref={innerRef} className={`mx-auto w-full max-w-[1280px] ${innerClassName}`} data-speelpad-stop={stop || undefined}>
        {children}
      </div>
    </section>
  )
}

/** starts a plain js effect from src/motion/ on an element, and stops it when the page goes */
export function useMotion<T extends HTMLElement>(init: (el: T) => () => void) {
  const ref = useRef<T>(null)
  useEffect(() => (ref.current ? init(ref.current) : undefined), [init])
  return ref
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
  'aria-label'?: string
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
// two kinds of buttons only. main actions: the split button (Btn split, the variant picks its colour).
// everything else: one secondary style, an outline with ink text (cream on dark backgrounds)
export const OUTLINE = 'border-ig-ink/40 bg-transparent text-ig-ink hover:border-ig-ink hover:bg-ig-ink hover:text-white'
const VARIANT: Record<Variant, string> = {
  primary: OUTLINE,
  dark: OUTLINE,
  light: OUTLINE,
  ghost: OUTLINE,
  ghostLight: 'border-ig-cream/60 bg-transparent text-ig-cream hover:bg-ig-cream hover:text-ig-ink',
}
/** the secondary button look, for links (like the WhatsApp link) */
export const btnLink = `inline-flex items-center justify-center gap-2 rounded-[var(--r-box)] border-[1.5px] px-5 py-3 text-[15px] font-semibold lowercase transition-colors duration-150 ${OUTLINE}`

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
  return <h1 className={`text-[2.8rem] font-bold lowercase leading-[0.95] tracking-tight @3xl:text-[6.5rem] ${className}`}>{children}</h1>
}

export function H2({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-[2rem] font-bold lowercase leading-[1] tracking-tight @3xl:text-6xl ${className}`}>{children}</h2>
}

export function Tag({ children, tone = 'yellow' }: { children: ReactNode; tone?: 'yellow' | 'white' | 'orange' | 'cream' }) {
  const t = {
    yellow: 'bg-ig-yellow',
    white: 'bg-white',
    orange: 'bg-ig-orange',
    cream: 'bg-ig-cream',
  }[tone]
  return <span className={`inline-block rounded-[var(--r-tag)] px-3 py-1 text-[13px] font-medium lowercase leading-none text-ig-ink ${t}`}>{children}</span>
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
    <span className={`flex h-14 w-14 items-center justify-center rounded-[var(--r-box)] ${bg[aud]} ${className}`}>
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
        <Photo src={photo} alt={alt} className="h-60 w-full rounded-[var(--r-box)] @3xl:h-[400px]" />
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
          <li key={p} className="rounded-[var(--r-tag)] bg-white px-4 py-2 text-[15px] font-medium">
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
      <div className="flex flex-col items-start justify-between gap-8 rounded-[var(--r-box)] bg-ig-orange p-7 text-ig-ink @3xl:flex-row @3xl:items-center @3xl:p-14">
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

// five items, short labels. home is the logo. "over ons" holds the team and the projects
type NavLink = { label: string; to: PageId }
const NAV: (NavLink | { label: string; sub: NavLink[] })[] = [
  { label: 'workshops', to: 'workshops' },
  { label: 'spellen', to: 'games' },
  { label: 'train-de-trainer', to: 'trainer' },
  {
    label: 'over ons',
    sub: [
      { label: 'ons team', to: 'team' },
      { label: 'projecten', to: 'projects' },
    ],
  },
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

const iconBtn = 'flex h-11 items-center justify-center gap-2 rounded-[var(--r-box)] bg-ig-cream px-3 text-sm font-semibold transition-colors hover:bg-ig-yellow'

/** Zoekt op titels van workshops en spellen. */
export function Search({ placeholder, autoFocus, onDark }: { placeholder: string; autoFocus?: boolean; onDark?: boolean }) {
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
        <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus={autoFocus} aria-label="Zoeken" placeholder={placeholder} className="h-11 min-w-0 flex-1 rounded-[var(--r-box)] border border-ig-ink/25 bg-white px-4 text-base outline-none focus-visible:border-ig-orange focus-visible:ring-2 focus-visible:ring-ig-orange" />
        <Btn type="submit" variant={onDark ? 'ghostLight' : 'ghost'} className="w-auto! py-2!">zoek</Btn>
      </div>
      {term && (
        <ul className="mt-2 overflow-hidden rounded-[var(--r-box)] bg-white text-sm text-ig-ink shadow-[0_14px_34px_rgb(42_24_16/0.14)]" aria-label="Zoekresultaten">
          {hits.length === 0 && <li className="px-4 py-3 text-neutral-600">Niets gevonden voor “{q.trim()}”.</li>}
          {hits.map((h) => (
            <li key={h.key} className="border-b border-ig-ink/10 last:border-0">
              <button type="button" onClick={h.to} className="flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-left hover:bg-ig-yellow">
                <span className="font-semibold">{h.title}</span>
                <span className="shrink-0 text-[13px] text-neutral-600">{h.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}

// the header: one bar on the content grid (src/motion/header.css). the logo is the home link, five quiet
// items in the middle, search, cart and the one orange button on the right. after 200px it becomes a
// compact floating bar; narrower than 1180px the items move into a full screen menu (src/motion/menu.js)
export function Header({ active }: { active: PageId }) {
  const { go, cart, ann, openCart } = useContext(Ctx)
  const [searchOpen, setSearchOpen] = useState(false)
  const nav = useMotion<HTMLElement>(initNav)
  const count = cartCount(cart)
  // the count only bumps when something is added, not when a new page mounts the header
  const prev = useRef(count)
  const [bump, setBump] = useState(0)
  useEffect(() => {
    if (count > prev.current) setBump((b) => b + 1)
    prev.current = count
  }, [count])
  const current = (to: PageId) => (GROUP[active] === to ? ('page' as const) : undefined)
  const caret = (
    <svg className="ig-nav__caret" viewBox="0 0 10 10" aria-hidden>
      <path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  return (
    <header ref={nav} className="ig-nav">
      {ann && <span className="pointer-events-auto absolute left-0 top-0 z-50 bg-black px-2 py-1 text-[11px] text-white">NAV · header + navigatie</span>}
      <div className="ig-nav__inner">
        <div className="ig-nav__bar">
          <Link to="home" className="ig-nav__logo" aria-label="InnerGames home">
            <img src="/assets/logo-clear.png" alt="" width={804} height={391} />
          </Link>
          <nav className="ig-nav__menu" aria-label="Hoofdmenu">
            {NAV.map((n) =>
              'sub' in n ? (
                <div key={n.label} className="ig-nav__drop">
                  <button type="button" className="ig-nav__item" aria-expanded="false" aria-current={n.sub.some((s) => current(s.to)) ? 'page' : undefined}>
                    {n.label}
                    {caret}
                  </button>
                  <div className="ig-nav__sub">
                    {n.sub.map((s) => (
                      <Link key={s.to} to={s.to} className="ig-nav__subitem" aria-current={current(s.to)}>
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={n.to} to={n.to} className="ig-nav__item" aria-current={current(n.to)}>
                  {n.label}
                </Link>
              ),
            )}
          </nav>
          <div className="ig-nav__tools">
            <button type="button" onClick={() => setSearchOpen(!searchOpen)} aria-expanded={searchOpen} aria-label="Zoeken" className="ig-nav__icon ig-nav__search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4.5 4.5" />
              </svg>
            </button>
            <button type="button" onClick={() => { openCart(); setSearchOpen(false) }} aria-label={`Winkelmand, ${count} product${count === 1 ? '' : 'en'}`} className="ig-nav__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path d="M3 4h3l2.5 11h10L21 7H7" />
                <circle cx="10" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
              </svg>
              <span key={bump} className={`ig-nav__count ${count ? 'is-full' : ''} ${bump ? 'is-bumping' : ''}`}>{count}</span>
            </button>
            <SplitBtn onClick={() => go('workshops')}>boek een workshop</SplitBtn>
            <button type="button" className="ig-nav__icon ig-nav__toggle" data-nav-open aria-expanded="false" aria-controls="ig-nav-sheet">
              menu
            </button>
          </div>
        </div>
        {searchOpen && (
          <div className="pointer-events-auto mt-2 rounded-[var(--r-box)] bg-ig-cream p-3 shadow-[0_14px_34px_rgb(42_24_16/0.12)]">
            <Search autoFocus placeholder="zoek in spellen en workshops" />
          </div>
        )}
      </div>

      {/* the full screen menu for phones and small screens */}
      <div id="ig-nav-sheet" className="ig-nav__sheet" role="dialog" aria-label="Menu">
        <div className="ig-nav__sheet-top">
          <Link to="home" aria-label="InnerGames home">
            <img src="/assets/logo-clear.png" alt="" width={804} height={391} />
          </Link>
          <button type="button" className="ig-nav__icon" data-nav-close>
            sluit
          </button>
        </div>
        <div className="mb-4">
          <Search placeholder="zoek in spellen en workshops" />
        </div>
        {NAV.map((n) =>
          'sub' in n ? (
            <div key={n.label}>
              <p className="ig-nav__sheet-label">{n.label}</p>
              {n.sub.map((s) => (
                <Link key={s.to} to={s.to} className="ig-nav__sheet-item ig-nav__sheet-sub" aria-current={current(s.to)}>
                  {s.label}
                </Link>
              ))}
            </div>
          ) : (
            <Link key={n.to} to={n.to} className="ig-nav__sheet-item" aria-current={current(n.to)}>
              {n.label}
            </Link>
          ),
        )}
        <div className="ig-nav__sheet-cta">
          <SplitBtn onClick={() => go('workshops')}>boek een workshop</SplitBtn>
        </div>
      </div>
    </header>
  )
}

// the footer slides out from under the last section (src/motion/footer.css). at the bottom edge
// something of InnerGames as a company rises up: A the big hand that waves once, or B the team photo
export function Footer() {
  const { ann, footer } = useContext(Ctx)
  const ref = useMotion<HTMLElement>(initFooterReveal)
  const foto = footer === 'foto'
  const link = 'block py-0.5 hover:underline'
  return (
    <footer ref={ref} className={`ig-footer ${foto ? 'ig-footer--orange' : 'ig-footer--ink'}`}>
      {ann && (
        <div className="absolute left-0 top-0 z-30 flex">
          <span className="bg-black px-2 py-1 text-[11px] text-white">FOOT · footer</span>
          <span className="hidden bg-yellow-200 px-2 py-1 text-[11px] text-black @3xl:block">zelfde op elke pagina · {foto ? 'optie B: teamfoto' : 'optie A: hand'}</span>
        </div>
      )}
      <div className="relative mx-auto max-w-[calc(1280px+8rem)] px-5 pb-4 pt-14 @3xl:px-16 @3xl:pb-36">
        <div className="relative z-[1] grid grid-cols-1 gap-10 @3xl:grid-cols-4">
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
              E-mail:{' '}
              <a className="inline-block" href="mailto:info@innergames.nl">
                info@innergames.nl
                <PencilMark name="underline" className="ig-draw ig-footer__mark" />
              </a>
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
            <Search placeholder="zoek" onDark={!foto} />
          </div>
        </div>
        {foto ? (
          <figure className="ig-footer-photo ig-footer-photo--right">
            <img src="/assets/team-group.png" alt="Ariën, Sanne en Aron van InnerGames staan lachend naast elkaar" width={986} height={1479} loading="lazy" />
          </figure>
        ) : (
          <span className="ig-footer-hand ig-footer-hand--right" aria-hidden />
        )}
      </div>
      <div className={`relative border-t px-5 py-3 text-xs @3xl:px-16 ${foto ? 'border-ig-ink/15' : 'border-ig-cream/15 text-ig-cream/70'}`}>
        <div className="mx-auto max-w-[1280px]">© Copyright – InnerGames{ann ? ' · Enfold WordPress Theme' : ''}</div>
      </div>
    </footer>
  )
}
