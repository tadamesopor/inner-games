// readable urls and the meta tags per page (title, description, Open Graph).
// the prototype has no router: App keeps page + sel in state, this file turns them into a url and back.
// the same urls, titles and descriptions are in docs/SEO_CHECKLIST.md, to copy into Yoast or Rank Math.
import { AUDS, BRIGHT, GAMES, PHOTOS, WORKSHOPS, type Aud } from './data'
import { LEGAL, type PageId } from './wf'

// the legal pages get their full name in the url
const LEGAL_URL: Record<string, string> = {
  voorwaarden: 'algemene-voorwaarden',
  privacy: 'privacybeleid',
  cookies: 'cookiebeleid',
  verzending: 'verzending-en-retour',
}

const BASE: Partial<Record<PageId, string>> = {
  home: '/',
  workshops: '/workshops',
  games: '/spellen',
  projects: '/projecten',
  trainer: '/train-de-trainer',
  team: '/ons-team',
  contact: '/contact',
  checkout: '/afrekenen',
}

/** page + sel -> url, for example ('workshop', 'energiek-team') -> /workshops/energiek-team */
export function toUrl(page: PageId, sel = ''): string {
  if (page === 'workshop') return `/workshops/${sel}`
  if (page === 'game') return `/spellen/${sel}`
  if (page === 'preview') return `/spellen/${sel}/preview`
  if (page === 'legal') return `/${LEGAL_URL[sel] ?? LEGAL_URL.voorwaarden}`
  // a filter or a prefilled form is a query, not a different page
  if (page === 'workshops' && sel) return `/workshops?voor=${sel}`
  if (page === 'contact' && sel) return `/contact?workshop=${sel}`
  return BASE[page] ?? '/'
}

/** url -> page + sel. an unknown url goes to the homepage */
export function fromUrl(path: string, search: string): { page: PageId; sel: string } {
  const q = new URLSearchParams(search)
  const parts = path.replace(/\/+$/, '').split('/').filter(Boolean)
  const [a, b, c] = parts
  if (!a) return { page: 'home', sel: '' }
  if (a === 'workshops' && b && WORKSHOPS.some((w) => w.slug === b)) return { page: 'workshop', sel: b }
  if (a === 'workshops') {
    const voor = q.get('voor') ?? ''
    return { page: 'workshops', sel: (AUDS as string[]).includes(voor) ? (voor as Aud) : '' }
  }
  if (a === 'spellen' && b && GAMES.some((g) => g.slug === b)) return { page: c === 'preview' ? 'preview' : 'game', sel: b }
  if (a === 'contact') {
    const w = q.get('workshop') ?? ''
    return { page: 'contact', sel: WORKSHOPS.some((x) => x.slug === w) ? w : '' }
  }
  const legal = Object.entries(LEGAL_URL).find(([, u]) => u === a)
  if (legal) return { page: 'legal', sel: legal[0] }
  const base = (Object.entries(BASE) as [PageId, string][]).find(([, u]) => u === `/${a}`)
  return { page: base ? base[0] : 'home', sel: '' }
}

export type Meta = { title: string; description: string; image: string }

// a description is at most about 155 characters: cut at a word and add an ellipsis
const cut = (s: string, n = 155) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)) + '…')
const photo = (base: string) => `${base}-1600.webp`

/** the title (max ~60) and description (max ~155) for a page, in Dutch */
export function metaFor(page: PageId, sel = ''): Meta {
  const w = WORKSHOPS.find((x) => x.slug === sel)
  const g = GAMES.find((x) => x.slug === sel)
  switch (page) {
    case 'workshops':
      return {
        title: 'Workshops voor teams, onderwijs en zorg · InnerGames',
        description: 'Speelse workshops met reflectie en lichaamsgericht werk, voor teams, klassen, zorg en trainers. Met duur, groepsgrootte en prijs per workshop.',
        image: photo(BRIGHT.workshops),
      }
    case 'workshop':
      if (w)
        return {
          title: cut(`${w.title} · workshop · InnerGames`, 60),
          description: cut(`${w.tagline} ${w.duration}, ${w.group}, ${w.price}.`),
          image: photo(w.photo),
        }
      break
    case 'games':
      return {
        title: 'Spellen kopen · InnerGames',
        description: 'The Elemental Five, Sociality, Impact Imperium en meer spellen van InnerGames. Speel eerst een preview van 30 seconden.',
        image: photo(BRIGHT.games),
      }
    case 'game':
    case 'preview':
      if (g)
        return page === 'game'
          ? { title: cut(`${g.title} · InnerGames`, 60), description: cut(`${g.short} ${g.price}, ${g.priceNote ?? 'incl. btw'}.`), image: photo(g.photo) }
          : { title: cut(`Speel ${g.title} · preview`, 60), description: cut(`Speel 30 seconden ${g.title} en voel hoe het spel werkt. ${g.short}`), image: photo(g.photo) }
      break
    case 'projects':
      return {
        title: 'Projecten · InnerGames',
        description: 'Spellen en tools die InnerGames samen met organisaties en onderwijs maakt, zoals het bordspel Sociality met de HAN.',
        image: photo(PHOTOS.tafel),
      }
    case 'trainer':
      return {
        title: 'Train-de-trainer: zelf spel-workshops geven · InnerGames',
        description: 'Leer spel-workshops geven: 8 uur, € 1.800 per persoon. 4 uur theorie en 4 uur praktijk, begeleid in je eigen setting.',
        image: photo(BRIGHT.trainer),
      }
    case 'team':
      return {
        title: 'Ons team · InnerGames',
        description: 'Vijf mensen die spellen ontwikkelen, workshops geven en trainers opleiden, vanuit Eindhoven.',
        image: photo(PHOTOS.tafel),
      }
    case 'contact':
      return {
        title: 'Contact · InnerGames Eindhoven',
        description: 'Vertel ons over je team, klas of cliënten. Bel, app of mail, of vul het formulier in. Kronehoefstraat 87, Eindhoven.',
        image: photo(PHOTOS.tafel),
      }
    case 'legal': {
      const t = LEGAL[sel] ?? LEGAL.voorwaarden
      return { title: `${t[0].toUpperCase()}${t.slice(1)} · InnerGames`, description: `Het ${t} van InnerGames in Eindhoven.`, image: photo(PHOTOS.tafel) }
    }
    case 'checkout':
      return { title: 'Afrekenen · InnerGames', description: 'Je bestelling bij InnerGames afronden.', image: photo(BRIGHT.games) }
  }
  return {
    title: 'InnerGames · spellen en workshops vanuit Eindhoven',
    description: 'Spellen en workshops die teams, klassen en zorg in beweging brengen. Van een workshop voor je team tot een spel voor in de klas.',
    image: photo(PHOTOS.tafel),
  }
}

function tag(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

/** writes the title, description and Open Graph tags into <head> */
export function applyMeta(m: Meta, url: string) {
  document.title = m.title
  const abs = (u: string) => new URL(u, location.origin).href
  tag('name', 'description', m.description)
  tag('property', 'og:type', 'website')
  tag('property', 'og:site_name', 'InnerGames')
  tag('property', 'og:locale', 'nl_NL')
  tag('property', 'og:title', m.title)
  tag('property', 'og:description', m.description)
  tag('property', 'og:image', abs(m.image))
  tag('property', 'og:url', abs(url))
}
