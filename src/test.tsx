import { useEffect, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
import type { PageId } from './wf'

// how long people see the homepage before the first impression questions (was 5, 10 gives them time to actually look)
const LOOK_SECONDS = 10

type Q = {
  id: string
  q: string
  kind: 'scale' | 'slider' | 'text' | 'words' | 'choice'
  low?: string
  high?: string
  /** choice: knoppen, of een dropdown bij meer dan 6 opties */
  options?: string[]
  /** choice: vervolgvraag (open tekst) */
  follow?: string
  /** choice: toon de vervolgvraag alleen bij deze opties; zonder lijst altijd na een keuze */
  followWhen?: string[]
}
type Task = { t: string; code: string; expect?: string; ask?: Q[] }
type Round = {
  name: string
  view: 'huidige site' | 'ontwerp'
  warmup: boolean
  five: { id: string; q: string }[]
  menu: boolean
  tasks: Task[][]
  ease: boolean
  closing: Q[]
  profileQ: Q[][]
}

export const PROFILES = [
  {
    name: 'onderwijs (docent)',
    warm: [
      "Vertel eens over de laatste keer dat je iets extra's voor je klas regelde, zoals een workshop, gastles of spel. Wat was het?",
      'Hoe kwam je daarbij terecht? Waar zocht of hoorde je het eerst?',
      'Wat moest je weten voordat je ja zei, en waar vond je dat?',
      'Wie moest er nog meer mee instemmen?',
      'Hoe werd het betaald?',
    ],
  },
  {
    name: 'organisatie (HR, teamleider, manager)',
    warm: [
      'Vertel eens over de laatste keer dat je een teamactiviteit, training of workshop regelde. Wat was het?',
      'Hoe kwam je bij die aanbieder terecht? Waar zocht of hoorde je het eerst?',
      'Wat moest je weten voordat je ja zei, en waar vond je dat?',
      'Wie besliste uiteindelijk, en wat wilde die persoon zien?',
      'Waaraan merkte je dat je die aanbieder kon vertrouwen?',
    ],
  },
  {
    name: 'trainer of coach',
    warm: [
      'Vertel eens over de laatste training of cursus die je volgde om nieuwe werkvormen te leren. Wat was het?',
      'Hoe kwam je daarbij terecht?',
      'Waarom koos je juist die, en wat liet je twijfelen?',
      'Wie betaalde het: jijzelf of je werkgever?',
      'Hoe zet je nu spel of werkvormen in bij je groepen?',
    ],
  },
]

export const KNOWN = ['nooit van gehoord', 'van naam', 'eerder mee gewerkt'] as const
export const REC = ['ja, scherm en stem', 'alleen stem', 'nee, geen opname'] as const
export const QUOTE_OK = ['ja, anoniem', 'nee'] as const

const WARM_HINT = "Vraag naar de laatste echte keer, niet naar 'meestal'. Geen voorbeeld? Vraag hoe ze het zouden doen en schrijf 'hypothetisch' erbij."
const PROBE = 'neutraal doorvragen: Wat denk je nu? · Wat verwacht je dat er gebeurt? · Wat zoek je op dit moment? · Kun je daar iets meer over vertellen?'
const AFTERWARDS = 'achteraf: Waar had je verwacht dit te vinden?'

const MENU = ['sessies en workshops', 'onze spellen', 'projecten', 'train-de-trainer']
const WORDS = ['speels', 'professioneel', 'betrouwbaar', 'warm', 'creatief', 'rustig', 'duidelijk', 'uitnodigend', 'serieus', 'kinderachtig', 'rommelig', 'saai', 'druk', 'goedkoop', 'ouderwets', 'afstandelijk']

const AGREE = { low: '1 = helemaal oneens', high: '7 = helemaal eens' }
const UMUX: Q[] = [
  { id: 'umux1', q: 'Wat deze website kan, past bij wat ik nodig heb.', kind: 'scale', ...AGREE },
  { id: 'umux2', q: 'Deze website is makkelijk te gebruiken.', kind: 'scale', ...AGREE },
]

/* ---------- antwoordvragen na een taak ---------- */
const YNX = ['ja', 'nee', 'weet ik niet']
const YMN = ['ja', 'misschien', 'nee']
const CHOSEN_OPTIONS = [
  'Energiek team!', 'Het spel tussen hoofd en lichaam', 'Ontdek jouw drijfveren', 'De Klimaat Collage', 'Het Impact Imperium (workshop)', 'MemoryStory', 'Kansen Keren (workshop)', 'Hoezo Raar?!', 'Positive Masculinity',
  'the elemental five (spel)', 'Sociality (spel)', 'Impact Imperium klassenset (spel)', 'Kansen Keren (spel)', 'train-de-trainer', 'iets anders', 'niets gevonden',
]
const CHOSEN: Q = { id: 'gekozen', q: 'Wat heb je gekozen?', kind: 'choice', options: CHOSEN_OPTIONS, follow: 'Waarom deze?', followWhen: CHOSEN_OPTIONS.filter((o) => o !== 'niets gevonden') }
const canIf = (follow: string, followWhen?: string[]): Q => ({ id: 'kan', q: 'Kan het?', kind: 'choice', options: YNX, follow, followWhen })
const text = (id: string, q: string): Q => ({ id, q, kind: 'text' })

const TASKS_R1: Task[][] = [
  [
    { t: 'Je havo 4-klas heeft over twee weken een projectweek over duurzaamheid. Zoek iets van InnerGames dat je in die week met je klas kunt doen.', code: 'D1, D4', expect: 'Het Impact Imperium (workshop) of Impact Imperium klassenset. De Klimaat Collage past ook.', ask: [CHOSEN] },
    { t: 'Jullie hebben € 500 voor die week en de klas heeft 28 leerlingen. Kan jouw keuze, ja of nee?', code: 'D3', expect: 'Impact Imperium € 423,50 tot 32 leerlingen: ja. Klassenset € 275: ja. Klimaat Collage € 1.800: nee.', ask: [canIf('Welke prijs en welke groepsgrootte zag je?')] },
    // "regel het": succes is het formulier bereiken, dat staat in het paginalog
    { t: 'Je wilt donderdag 12 maart vastleggen. Regel dat via de website.', code: 'D5', expect: '"vraag deze workshop aan" → formulier (workshop al ingevuld), of WhatsApp, binnen 2 klikken.' },
    { t: 'Je wilt dit later ook zonder trainer met andere klassen doen. Kan dat, en wat kost het?', code: 'D12', expect: 'Ja: klassenset € 275.', ask: [canIf('Wat kost het?', ['ja'])] },
  ],
  [
    { t: 'In je team werkt iedereen op zijn eigen eiland. Je leidinggevende geeft je één middag om daar iets aan te doen. Zoek iets dat past.', code: 'D1, D4', expect: 'Een workshop van een halve dag of korter voor organisaties. Kiest iemand Energiek team! (3 x 4 uur): zag die de duur?', ask: [CHOSEN] },
    { t: 'Je team is 14 mensen. Wat kost jouw keuze, en kan het met iedereen?', code: 'D3', expect: 'Bijv. Ontdek jouw drijfveren: € 950, tot 12 personen, dus niet met 14 zonder te vragen.', ask: [text('kost', 'Wat kost het?'), { id: 'kan14', q: 'Kan het met 14 mensen?', kind: 'choice', options: YNX }] },
    { t: 'Je wilt een datum vastleggen. Regel dat via de website.', code: 'D5', expect: 'Formulier of WhatsApp binnen 2 klikken.' },
    { t: 'Je leidinggevende wil weten wie de workshop komt geven. Zoek het uit.', code: 'D2, D11', expect: 'Ons team, of een naam op de workshoppagina.', ask: [{ id: 'naam', q: 'Heb je een naam gevonden?', kind: 'choice', options: YNX, follow: 'Welke naam, en waar vond je die?', followWhen: ['ja'] }] },
  ],
  [
    { t: 'Je begeleidt zelf groepen. Je wilt leren hoe je de spellen van InnerGames zelf kunt inzetten. Zoek uit of dat kan.', code: 'D1, D7', expect: 'Train-de-trainer.', ask: [canIf('Hoe heet het aanbod?', ['ja'])] },
    { t: 'Hoeveel tijd kost je dat, en wat betaal je ervoor?', code: 'D3, D7', expect: '8 uur, € 1.800 per persoon.', ask: [text('tijd', 'Hoeveel tijd kost het?'), text('kost', 'Wat kost het?')] },
    { t: 'Je wilt je aanmelden. Regel dat via de website.', code: 'D5', expect: '"vraag de training aan" → formulier.' },
    { t: 'Je gebruikt The Elemental Five al met grondankers. Je wilt alleen de kaarten erbij kopen. Kan dat, en wat kost het?', code: 'D6', expect: 'Ja: kaartenset € 39.', ask: [canIf('Wat kost het?', ['ja'])] },
  ],
]

const CLOSING_R1: Q[] = [
  ...UMUX,
  { id: 'makkelijk', q: 'Als je terugdenkt aan de taken: wat ging makkelijk, en wat ging lastig?', kind: 'text' },
  { id: 'info', q: 'Welke informatie had je nodig om echt een keuze te maken?', kind: 'text' },
  { id: 'gevonden', q: 'Vond je die informatie op de site?', kind: 'choice', options: ['ja', 'deels', 'nee'], follow: 'Wat miste er?', followWhen: ['deels', 'nee'] },
]
const PROFILE_R1: Q[][] = [
  [text('profiel', 'Wie op jouw school moet hier nog meer van vinden?'), text('profiel2', 'Wat zou die persoon op deze site willen zien?')],
  [text('profiel', 'Je leidinggevende moet dit goedkeuren. Wat zou die op deze site willen zien dat er nu niet staat?')],
  [text('profiel', 'Wat zou je nog willen weten of zien voordat je € 1.800 uitgeeft aan deze training?')],
]

const r2Tasks = (game: string, page: string, to: string, decide: string, would: string): Task[] => [
  {
    t: `Speel de preview van ${game} tot het einde.`,
    code: 'D9',
    ask: [
      { id: 'nu', q: 'Wat zou je nu doen?', kind: 'choice', options: ['het spel kopen', 'een workshop boeken', 'meer lezen over het spel', 'contact opnemen', 'niets', 'iets anders'], follow: 'Waarom?' },
      text('bij', 'Wat blijft je het meest bij van de preview?'),
    ],
  },
  {
    t: `Open de pagina ${page}${page.endsWith('!') ? '' : '.'} Stel, je stuurt deze pagina naar ${to}.`,
    code: 'D10',
    ask: [text('erbij', 'Wat schrijf je erbij?'), { id: 'door', q: 'Zou je deze pagina echt doorsturen?', kind: 'choice', options: YMN }],
  },
  {
    t: `Stel, je kent InnerGames nog niet. Kijk maximaal 3 minuten rond tot je weet of je ${decide}. Vertel hardop wat je ziet.`,
    code: 'D11',
    ask: [{ id: 'zou', q: `Zou je ${would}?`, kind: 'choice', options: YMN }, text('hielp', 'Wat hielp je daarbij?'), text('tegen', 'Wat hield je tegen?')],
  },
]

export const ROUNDS: Round[] = [
  {
    name: 'ronde 0 · huidige site (baseline)',
    view: 'huidige site',
    warmup: true,
    five: [],
    menu: false,
    tasks: TASKS_R1,
    ease: true,
    closing: CLOSING_R1,
    profileQ: PROFILE_R1,
  },
  {
    name: 'ronde 1 · prototype',
    view: 'ontwerp',
    warmup: true,
    five: [
      { id: 'wat', q: 'Wat doet dit bedrijf?' },
      { id: 'wie', q: 'Voor wie is deze website, denk je?' },
    ],
    menu: true,
    tasks: TASKS_R1,
    ease: true,
    closing: CLOSING_R1,
    profileQ: PROFILE_R1,
  },
  {
    name: 'ronde 2 · ontwerp',
    view: 'ontwerp',
    warmup: false,
    five: [{ id: 'woorden', q: 'Noem de eerste drie woorden die bij je opkomen.' }],
    menu: false,
    tasks: [
      r2Tasks('Impact Imperium', 'van De Klimaat Collage', 'een collega', 'bij ze zou boeken', 'bij InnerGames boeken'),
      r2Tasks('The Elemental Five', 'van Energiek team!', 'je leidinggevende', 'ze zou inhuren', 'InnerGames inhuren'),
      r2Tasks('Sociality', 'train-de-trainer', 'een collega-trainer', 'met ze zou samenwerken', 'met InnerGames samenwerken'),
    ],
    ease: false,
    closing: [
      { id: 'omschrijf', q: 'Hoe zou je InnerGames omschrijven aan iemand die het niet kent?', kind: 'text' },
      { id: 'woorden', q: 'Kies de drie woorden die het beste bij deze website passen.', kind: 'words' },
      { id: 'waarom', q: 'Waarom koos je juist deze drie woorden?', kind: 'text' },
      { id: 'speels', q: 'Waar ligt de website: saai of speels?', kind: 'slider', low: 'saai', high: 'speels' },
      { id: 'volwassen', q: 'Waar ligt de website: kinderachtig of volwassen?', kind: 'slider', low: 'kinderachtig', high: 'volwassen' },
      { id: 'professioneel', q: 'Hoe komt InnerGames over: amateuristisch of professioneel?', kind: 'slider', low: 'amateuristisch', high: 'professioneel' },
      { id: 'betrouwbaar', q: 'Hoe komt InnerGames over: onbetrouwbaar of betrouwbaar?', kind: 'slider', low: 'onbetrouwbaar', high: 'betrouwbaar' },
      ...UMUX,
      { id: 'afleiding', q: 'Trok er iets je aandacht weg van wat je aan het doen was?', kind: 'choice', options: ['ja', 'nee'], follow: 'Wat?', followWhen: ['ja'] },
      { id: 'vervolg', q: 'Wat zou je na dit bezoek doen?', kind: 'choice', options: ['contact opnemen', 'verder zoeken bij een andere aanbieder', 'niets', 'iets anders'], follow: 'Waarom?' },
      { id: 'serieus', q: 'InnerGames wil overkomen als een serieuze organisatie die speelse dingen doet. Herken je dat?', kind: 'choice', options: ['ja', 'deels', 'nee'], follow: 'Waar wel, en waar niet?' },
    ],
    profileQ: [
      [text('profiel', 'In hoeverre past deze stijl bij jouw school, en waarom?')],
      [text('profiel', 'In hoeverre past deze stijl bij jouw organisatie, en waarom?')],
      [text('profiel', 'Hoe zou het voelen om als trainer met deze uitstraling verbonden te zijn?')],
    ],
  },
]

const EASE_Q = 'Hoe makkelijk of moeilijk was deze taak?'
const LEADER_ANSWER = 'Antwoord van de deelnemer (jij vult in)'
const LEADER = ['zelf gelukt', 'met hulp', 'niet gelukt'] as const
const VERDICT = ['klopt', 'deels', 'klopt niet'] as const

type Ev = { s: number; type: string; detail: string }
type TaskRes = { start?: number; end?: number; pages: string[]; clicks: number; events?: Ev[]; ease?: number; ans?: Record<string, Answer>; stuck?: boolean; leader?: string; verdict?: string; notes: string }
/** n = schaal, t = open tekst, w = woorden, c = keuze, f = vervolgtekst bij een keuze */
type Answer = { n?: number; t?: string; w?: string[]; c?: string; f?: string }
type Session = {
  nr: string
  round: number
  profile: number
  known: string
  rec: string
  quote: string
  consent: boolean
  consentAt?: number
  phase: 'start' | 'warmup' | 'impression' | 'menu' | 'tasks' | 'closing' | 'results'
  look: 'intro' | 'look' | 'done'
  warm: string[]
  five: Record<string, string>
  menu: Record<string, string>
  idx: number
  step: 'ready' | 'running' | 'answer' | 'ease'
  tasks: TaskRes[]
  qIdx: number
  words: string[]
  answers: Record<string, Answer>
}

const KEY = 'ig-test3:'
const fresh = (keep: Partial<Session> = {}): Session => ({
  nr: '', round: 1, profile: -1, known: '', rec: '', quote: '', consent: false, phase: 'start', look: 'intro', warm: [], five: {}, menu: {}, idx: 0, step: 'ready', tasks: [], qIdx: 0, words: [], answers: {}, ...keep,
})
const storeKey = (nr: string, round: number) => `${KEY}${nr}:r${round}`
function read(k: string | null): Session | undefined {
  try {
    const raw = k && localStorage.getItem(k)
    if (!raw) return undefined
    const d = { ...fresh(), ...JSON.parse(raw) }
    // sessies uit v3 kunnen nog op de oude stap 'after' staan
    return d.step === 'after' ? { ...d, step: 'ease' } : d
  } catch {
    return undefined
  }
}
const load = () => read(localStorage.getItem(KEY + 'current')) ?? fresh()
const shuffle = <T,>(a: T[]) => {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

const secs = (t?: TaskRes) => (t?.start && t.end ? Math.round((t.end - t.start) / 1000) : undefined)
const allQs = (r: Round, profile: number): Q[] => [...r.closing, ...(r.profileQ[profile] ?? [])]
const followOn = (q: Q, a?: Answer) => !!a?.c && !!q.follow && (!q.followWhen || q.followWhen.includes(a.c))
const fmtA = (q: Q, a?: Answer) => {
  if (q.kind === 'words') return a?.w?.join(', ') || '-'
  if (q.kind === 'text') return a?.t || '-'
  if (q.kind === 'choice') return [a?.c || '-', followOn(q, a) ? a?.f || '-' : ''].filter(Boolean).join(' · ')
  return `${a?.n ?? '-'}/7`
}
// UMUX-Lite: twee items op 1-7, omgerekend naar 0-100
const umux = (s: Session) => {
  const a = s.answers.umux1?.n
  const b = s.answers.umux2?.n
  return a && b ? Math.round(((a - 1 + (b - 1)) / 12) * 100) : undefined
}

function report(nr: string, sessions: Session[]) {
  const L = ['gebruikerstest InnerGames website', `deelnemer: ${nr}`, `kent InnerGames: ${sessions[0]?.known || '-'}`, `opname: ${sessions[0]?.rec || '-'}`, `anoniem citeren: ${sessions[0]?.quote || '-'}`]
  for (const s of sessions) {
    const r = ROUNDS[s.round]
    const prof = PROFILES[s.profile]
    L.push('', `===== ${r.name} =====`, `profiel: ${prof?.name}`, `toestemming: ${s.consent ? 'ja' : 'nee'}`)
    if (r.warmup) {
      L.push('', 'opwarminterview:')
      prof?.warm.forEach((q, i) => L.push(`  ${q}`, `    ${s.warm[i] || '-'}`))
    }
    if (r.five.length) {
      L.push('', `eerste indruk (${LOOK_SECONDS} sec):`)
      r.five.forEach((f) => L.push(`  ${f.q}`, `    ${s.five[f.id] || '-'}`))
    }
    if (r.menu) {
      L.push('', 'menuverwachting (D2):')
      MENU.forEach((m) => L.push(`  ${m}`, `    ${s.menu[m] || '-'}`))
    }
    L.push('')
    ;(r.tasks[s.profile] ?? []).forEach((t, i) => {
      const x = s.tasks[i]
      L.push(
        `taak ${i + 1} [${t.code}]: ${t.t}`,
        ...(t.expect ? [`  verwacht: ${t.expect}`] : []),
        `  tijd: ${secs(x) ?? '-'} s${x?.stuck ? ' (ik kom er niet uit)' : ''}`,
        `  pagina's: ${x?.pages.join(' > ') || '-'}`,
        `  klikken: ${x?.clicks ?? 0}`,
        `  gebeurtenissen: ${fmtEv(x?.events)}`,
        ...(t.ask ?? []).map((q) => `  ${q.q} ${fmtA(q, x?.ans?.[q.id])}`),
        ...(r.ease ? [`  score (${EASE_Q}): ${x?.ease ?? '-'}/7`] : []),
        `  testleider: ${x?.leader ?? '-'}`,
        ...(t.expect ? [`  antwoord klopt: ${x?.verdict ?? '-'}`] : []),
        `  notities: ${x?.notes || '-'}`,
        '',
      )
    })
    L.push('afsluitende vragen:')
    allQs(r, s.profile).forEach((q) => L.push(`  ${q.q}`, `    ${fmtA(q, s.answers[q.id])}`))
    L.push(`  UMUX-Lite score (0-100): ${umux(s) ?? '-'}`)
  }
  return L.join('\n')
}

const fmtEv = (ev?: Ev[]) => (ev?.length ? ev.map((e) => `${e.s}s ${e.type} ${e.detail}`).join(' | ') : '-')

const COLS = ['deelnemer', 'kent_innergames', 'opname', 'citaat', 'toestemming', 'ronde', 'profiel', 'onderdeel', 'nr', 'code', 'vraag', 'verwacht', 'tijd_s', 'klikken', 'paginas', 'gebeurtenissen', 'score', 'vastgelopen', 'testleider', 'antwoord_klopt', 'keuze', 'antwoord', 'notities'] as const
type Row = Partial<Record<(typeof COLS)[number], string | number>>

// keuze en vervolgtekst in aparte kolommen, zodat keuzes te tellen zijn
const cells = (q: Q, a?: Answer): Row => {
  if (q.kind === 'choice') return { keuze: a?.c, antwoord: followOn(q, a) ? a?.f : '' }
  if (q.kind === 'words') return { antwoord: a?.w?.join(', ') }
  if (q.kind === 'text') return { antwoord: a?.t }
  return { score: a?.n }
}

function csv(sessions: Session[]) {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows: Row[] = []
  for (const s of sessions) {
    const r = ROUNDS[s.round]
    const prof = PROFILES[s.profile]
    const base: Row = { deelnemer: s.nr, kent_innergames: s.known, opname: s.rec, citaat: s.quote, toestemming: s.consent ? 'ja' : 'nee', ronde: r.name, profiel: prof?.name }
    if (r.warmup) prof?.warm.forEach((q, i) => rows.push({ ...base, onderdeel: 'opwarmen', nr: i + 1, vraag: q, notities: s.warm[i] }))
    r.five.forEach((f, i) => rows.push({ ...base, onderdeel: `eerste indruk ${LOOK_SECONDS} sec`, nr: i + 1, vraag: f.q, antwoord: s.five[f.id] }))
    if (r.menu) MENU.forEach((m, i) => rows.push({ ...base, onderdeel: 'menu', nr: i + 1, code: 'D2', vraag: m, antwoord: s.menu[m] }))
    ;(r.tasks[s.profile] ?? []).forEach((t, i) => {
      const x = s.tasks[i]
      rows.push({
        ...base, onderdeel: 'taak', nr: i + 1, code: t.code, vraag: t.t, verwacht: t.expect, tijd_s: secs(x), klikken: x?.clicks ?? 0, paginas: x?.pages.join(' > '), gebeurtenissen: x?.events?.length ? fmtEv(x.events) : '',
        score: x?.ease, vastgelopen: x?.stuck ? 'ja' : 'nee', testleider: x?.leader, antwoord_klopt: x?.verdict, notities: x?.notes,
      })
      ;(t.ask ?? []).forEach((q) => rows.push({ ...base, onderdeel: 'taak antwoord', nr: i + 1, code: t.code, vraag: q.q, ...cells(q, x?.ans?.[q.id]) }))
    })
    allQs(r, s.profile).forEach((q, i) => rows.push({ ...base, onderdeel: 'afsluiting', nr: i + 1, vraag: q.q, ...cells(q, s.answers[q.id]) }))
    rows.push({ ...base, onderdeel: 'umux-lite', vraag: 'UMUX-Lite score (0-100)', score: umux(s) })
  }
  return '\ufeff' + [COLS.map(esc).join(';'), ...rows.map((row) => COLS.map((c) => esc(row[c])).join(';'))].join('\n')
}

function download(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const panelBtn = 'border-2 border-ig-ink px-3 py-2 text-sm font-bold lowercase transition'
const field = 'w-full border-2 border-ig-ink bg-white px-3 py-2 text-base text-ig-ink outline-none focus:border-ig-orange'
const kicker = 'font-mono text-xs uppercase tracking-widest'
const leaderLabel = 'font-mono text-[11px] uppercase tracking-wide text-neutral-600'

function Scale({ value, onPick, low, high }: { value?: number; onPick: (n: number) => void; low?: string; high?: string }) {
  return (
    <div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button key={n} type="button" onClick={() => onPick(n)} aria-pressed={value === n} className={`h-10 min-w-0 flex-1 px-0! ${panelBtn} ${value === n ? 'bg-ig-ink text-white' : 'bg-white hover:bg-ig-yellow'}`}>
            {n}
          </button>
        ))}
      </div>
      {low && (
        <div className="mt-1 flex justify-between gap-4 text-[11px] text-neutral-600">
          <span>{low}</span>
          <span className="text-right">{high}</span>
        </div>
      )}
    </div>
  )
}

function Slider({ value, onPick, low, high, label }: { value?: number; onPick: (n: number) => void; low?: string; high?: string; label: string }) {
  const set = value !== undefined
  // een schuif heeft altijd een waarde; pas na aanraken telt het als antwoord
  const pick = (e: { currentTarget: HTMLInputElement }) => onPick(Number(e.currentTarget.value))
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>1 · {low}</span>
        <span>{high} · 7</span>
      </div>
      <input
        type="range"
        min={1}
        max={7}
        step={1}
        value={value ?? 4}
        onChange={pick}
        onPointerUp={pick}
        onKeyUp={pick}
        aria-label={label}
        aria-valuetext={set ? String(value) : 'nog niet gekozen'}
        className={`mt-3 h-2 w-full cursor-pointer accent-[#EA561F] ${set ? '' : 'opacity-40'}`}
      />
      <div className="mt-1 flex justify-between px-1 font-mono text-[11px] text-neutral-600" aria-hidden>
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <span key={n} className={value === n ? 'font-bold text-ig-ink' : ''}>{n}</span>
        ))}
      </div>
      <p className="mt-2 text-xs text-neutral-600">{set ? `gekozen: ${value}` : 'schuif of klik om te kiezen'}</p>
    </div>
  )
}

function WordPick({ words, value, onPick }: { words: string[]; value: string[]; onPick: (w: string[]) => void }) {
  const full = value.length >= 3
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {words.map((w) => {
          const on = value.includes(w)
          return (
            <button
              key={w}
              type="button"
              aria-pressed={on}
              disabled={!on && full}
              onClick={() => onPick(on ? value.filter((x) => x !== w) : [...value, w])}
              className={`${panelBtn} ${on ? 'bg-ig-ink text-white' : 'bg-white hover:bg-ig-yellow'} disabled:opacity-35 disabled:hover:bg-white`}
            >
              {w}
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-sm" aria-live="polite">{value.length} van 3 gekozen</p>
    </div>
  )
}

function Choice({ q, a, onChange, small }: { q: Q; a?: Answer; onChange: (v: Answer) => void; small?: boolean }) {
  const opts = q.options ?? []
  const btn = small ? 'px-2! py-1! text-xs!' : ''
  return (
    <div>
      {opts.length > 6 ? (
        <select value={a?.c ?? ''} onChange={(e) => onChange({ c: e.target.value })} aria-label={q.q} className={`${field} ${small ? 'text-sm!' : ''}`}>
          <option value="" disabled>
            kies…
          </option>
          {opts.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={q.q}>
          {opts.map((o) => (
            <button key={o} type="button" onClick={() => onChange({ c: o })} aria-pressed={a?.c === o} className={`${panelBtn} ${btn} ${a?.c === o ? 'bg-ig-ink text-white' : 'bg-white hover:bg-ig-yellow'}`}>
              {o}
            </button>
          ))}
        </div>
      )}
      {followOn(q, a) && (
        <label className="mt-3 block">
          <span className={`${small ? 'text-xs' : 'text-sm'} font-semibold`}>{q.follow}</span>
          <textarea value={a?.f ?? ''} onChange={(e) => onChange({ f: e.target.value })} rows={small ? 2 : 3} className={`${field} mt-1 ${small ? 'text-sm!' : ''}`} />
        </label>
      )}
    </div>
  )
}

/** antwoordvragen na een taak: keuze of open tekst */
function AskFields({ qs, ans, onChange }: { qs: Q[]; ans?: Record<string, Answer>; onChange: (id: string, v: Answer) => void }) {
  return (
    <div className="space-y-4">
      {qs.map((q) => (
        <div key={q.id}>
          <p className="mb-1.5 text-sm font-semibold">{q.q}</p>
          {q.kind === 'choice' ? (
            <Choice q={q} a={ans?.[q.id]} small onChange={(v) => onChange(q.id, v)} />
          ) : (
            <textarea value={ans?.[q.id]?.t ?? ''} onChange={(e) => onChange(q.id, { t: e.target.value })} rows={2} aria-label={q.q} className={`${field} text-sm!`} />
          )}
        </div>
      ))}
    </div>
  )
}

function Screen({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-ig-cream text-ig-ink" role="dialog" aria-label={label}>
      <div className="mx-auto max-w-2xl px-5 pb-28 pt-10 @container">{children}</div>
    </div>
  )
}

function Dl({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      {items.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-neutral-600">{k}</dt>
          <dd className="whitespace-pre-wrap">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

function QA({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className="mt-4 border-2 border-ig-ink bg-white p-4 text-sm">
      <p className="text-base font-semibold">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map(([q, a]) => (
          <li key={q}>
            <span className="text-neutral-600">{q}</span>
            <br />
            <span className="whitespace-pre-wrap">{a || '-'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function TestMode({ pageKey, go, bus}: { pageKey: string; go: (p: PageId) => void; bus: MutableRefObject<(() => void) | undefined> }) {
  const [s, setS] = useState<Session>(load)
  const [leader, setLeader] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [copied, setCopied] = useState(false)
  const taps = useRef<number[]>([])
  const r = ROUNDS[s.round] ?? ROUNDS[1]
  const p = PROFILES[s.profile]
  const tasks = r.tasks[s.profile] ?? []
  const task = tasks[s.idx]
  const cur = s.tasks[s.idx]

  const upd = (f: (d: Session) => Session) => setS((d) => f(d))
  const updTask = (f: (t: TaskRes) => TaskRes) => upd((d) => ({ ...d, tasks: d.tasks.map((t, i) => (i === d.idx ? f(t) : t)) }))
  const setAns = (id: string, v: Answer) => upd((d) => ({ ...d, answers: { ...d.answers, [id]: { ...d.answers[id], ...v } } }))

  // opslaan per deelnemer en ronde
  useEffect(() => {
    if (!s.nr || s.phase === 'start') return
    localStorage.setItem(storeKey(s.nr, s.round), JSON.stringify(s))
    localStorage.setItem(KEY + 'current', storeKey(s.nr, s.round))
  }, [s])

  // testleider: druk 3x op T
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (e.key.toLowerCase() !== 't' || tag === 'INPUT' || tag === 'TEXTAREA') return
      const now = Date.now()
      taps.current = [...taps.current.filter((t) => now - t < 1200), now]
      if (taps.current.length >= 3) {
        taps.current = []
        setLeader((l) => !l)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // pagina's en klikken loggen tijdens een lopende taak (niet bij de huidige site: die staat in een ander tabblad)
  const running = s.phase === 'tasks' && s.step === 'running' && r.view !== 'huidige site'
  useEffect(() => {
    if (running) updTask((t) => (t.pages.at(-1) === pageKey ? t : { ...t, pages: [...t.pages, pageKey] }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, running])
  // gebeurtenissen van de site (cart:add, cart:remove), met de seconden sinds de start van de taak
  useEffect(() => {
    if (!running) return
    const onEv = (e: Event) => {
      const d = (e as CustomEvent<{ type: string; detail: string }>).detail
      updTask((t) => ({ ...t, events: [...(t.events ?? []), { s: t.start ? Math.round((Date.now() - t.start) / 1000) : 0, type: d.type, detail: d.detail }] }))
    }
    window.addEventListener('ig:event', onEv)
    return () => window.removeEventListener('ig:event', onEv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])
  useEffect(() => {
    bus.current = running ? () => updTask((t) => ({ ...t, clicks: t.clicks + 1 })) : undefined
    return () => {
      bus.current = undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  // eerste indruk: LOOK_SECONDS kijken, dan afdekken
  useEffect(() => {
    if (s.phase !== 'impression' || s.look !== 'look') return
    const t = setTimeout(() => upd((d) => ({ ...d, look: 'done' })), LOOK_SECONDS * 1000)
    return () => clearTimeout(t)
  }, [s.phase, s.look])

  const afterWarmup = (ro: Round): Session['phase'] => (ro.five.length ? 'impression' : 'tasks')
  const begin = (base: Session) => {
    const ro = ROUNDS[base.round]
    window.dispatchEvent(new Event('ig:cart-reset')) // elke deelnemer begint met een lege winkelmand
    go('home')
    setS({
      ...fresh({ nr: base.nr.trim(), round: base.round, profile: base.profile, known: base.known, rec: base.rec, quote: base.quote, consent: base.consent, consentAt: base.consentAt ?? Date.now() }),
      phase: ro.warmup ? 'warmup' : afterWarmup(ro),
      words: shuffle(WORDS),
      tasks: ro.tasks[base.profile].map(() => ({ pages: [], clicks: 0, notes: '' })),
    })
  }
  const canStart = !!s.nr.trim() && s.profile >= 0 && !!s.known && !!s.rec && !!s.quote && s.consent

  // herinnering voor de testleider; het prototype neemt zelf niets op
  const recording = !!s.rec && !s.rec.startsWith('nee')
  const recBox = (
    <div className="mt-5 border-2 border-dashed border-ig-ink bg-white p-4" role="note">
      <p className={leaderLabel}>testleider · opname</p>
      <p className="mt-1 text-sm leading-snug">
        {recording
          ? `Start nu de opname (${s.rec}), bijvoorbeeld met Teams, OBS of QuickTime. Zeg hardop: deelnemer ${s.nr}, ${new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}. Stop de opname na de laatste vraag.`
          : 'Geen opname. Maak extra notities van wat de deelnemer zegt.'}
      </p>
    </div>
  )
  const radios = (name: string, legend: string, opts: readonly string[], value: string, set: (v: string) => void, cols = '@xl:grid-cols-3') => (
    <fieldset>
      <legend className="text-sm font-semibold">{legend}</legend>
      <div className={`mt-2 grid gap-2 ${cols}`}>
        {opts.map((k) => (
          <label key={k} className={`flex cursor-pointer items-center gap-3 border-2 border-ig-ink px-4 py-3 ${value === k ? 'bg-ig-yellow' : 'bg-white'}`}>
            <input type="radio" name={name} checked={value === k} onChange={() => set(k)} className="accent-current" required />
            <span>{k}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )

  const leaderBox = leader && cur && task && (
    <div className="mt-3 border-t-2 border-dashed border-ig-ink/40 pt-3 text-left">
      <p className={leaderLabel}>testleider · {task.code}</p>
      {task.expect && (
        <p className="mt-1 text-sm leading-snug">
          <span className="font-semibold">verwacht: </span>
          {task.expect}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {LEADER.map((l) => (
          <button key={l} onClick={() => updTask((t) => ({ ...t, leader: l }))} aria-pressed={cur.leader === l} className={`px-2! py-1! text-xs! ${panelBtn} ${cur.leader === l ? 'bg-ig-ink text-white' : 'bg-white'}`}>
            {l}
          </button>
        ))}
      </div>
      {task.expect && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold">antwoord:</span>
          {VERDICT.map((v) => (
            <button key={v} onClick={() => updTask((t) => ({ ...t, verdict: v }))} aria-pressed={cur.verdict === v} className={`px-2! py-1! text-xs! ${panelBtn} ${cur.verdict === v ? 'bg-ig-ink text-white' : 'bg-white'}`}>
              {v}
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs leading-snug text-neutral-700">{PROBE}</p>
      {cur.leader && cur.leader !== 'zelf gelukt' && <p className="mt-1 text-xs font-semibold leading-snug">{AFTERWARDS}</p>}
      <textarea value={cur.notes} onChange={(e) => updTask((t) => ({ ...t, notes: e.target.value }))} rows={2} placeholder="notities" aria-label="Notities testleider" className={`${field} mt-2 text-sm!`} />
    </div>
  )

  if (s.phase === 'start')
    return (
      <Screen label="Startscherm gebruikerstest">
        <p className={kicker}>innergames · prototype</p>
        <h1 className="mt-3 text-4xl font-extrabold lowercase leading-none @xl:text-6xl">gebruikerstest InnerGames website</h1>
        <p className="mt-5 text-lg leading-snug">Je test een website. Je kunt niets fout doen. Zeg hardop wat je ziet en denkt.</p>
        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            if (canStart) begin(s)
          }}
        >
          <label className="block">
            <span className="text-sm font-semibold">deelnemer nr.</span>
            <input value={s.nr} onChange={(e) => setS({ ...s, nr: e.target.value })} inputMode="numeric" className={`${field} mt-1 max-w-40`} required />
          </label>
          <fieldset>
            <legend className="text-sm font-semibold">ronde</legend>
            <div className="mt-2 grid gap-2">
              {ROUNDS.map((ro, i) => (
                <label key={ro.name} className={`flex cursor-pointer items-center gap-3 border-2 border-ig-ink px-4 py-3 ${s.round === i ? 'bg-ig-yellow' : 'bg-white'}`}>
                  <input type="radio" name="ronde" checked={s.round === i} onChange={() => setS({ ...s, round: i })} className="accent-current" />
                  <span>{ro.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-semibold">wie ben je?</legend>
            <div className="mt-2 grid gap-2">
              {PROFILES.map((pr, i) => (
                <label key={pr.name} className={`flex cursor-pointer items-center gap-3 border-2 border-ig-ink px-4 py-3 ${s.profile === i ? 'bg-ig-yellow' : 'bg-white'}`}>
                  <input type="radio" name="profiel" checked={s.profile === i} onChange={() => setS({ ...s, profile: i })} className="accent-current" />
                  <span>{pr.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {radios('kent', 'kent de deelnemer InnerGames?', KNOWN, s.known, (known) => setS({ ...s, known }))}
          {radios('opname', 'opname (vraag het, de deelnemer mag nee zeggen)', REC, s.rec, (rec) => setS({ ...s, rec }))}
          {radios('citaat', 'anoniem citeren in mijn verslag', QUOTE_OK, s.quote, (quote) => setS({ ...s, quote }), '@xl:grid-cols-2')}
          <fieldset className="border-2 border-ig-ink bg-white p-4">
            <legend className="px-1 text-sm font-semibold">toestemming</legend>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-snug">
              <li>We testen de website, niet jou.</li>
              <li>We noteren je antwoorden, de tijd per taak en waar je klikt.</li>
              <li>We nemen alleen scherm of stem op als je daar ja op zegt. Opnames bewaren we onder je nummer, nooit met je naam, en we verwijderen ze uiterlijk 31 januari 2027.</li>
              <li>Je resultaten worden anoniem verwerkt, onder een nummer en zonder naam.</li>
              <li>Je mag altijd stoppen, zonder reden.</li>
            </ul>
            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={s.consent} onChange={(e) => setS({ ...s, consent: e.target.checked, consentAt: e.target.checked ? Date.now() : undefined })} className="mt-1 size-4 accent-current" required />
              <span className="text-sm font-semibold">Ik heb dit gelezen en doe mee.</span>
            </label>
          </fieldset>
          <button type="submit" disabled={!canStart} className={`${panelBtn} bg-ig-orange px-6! py-3! text-base! disabled:opacity-40`}>
            start de test
          </button>
          <p className="text-xs text-neutral-600">Weergave: {r.view}. Resultaten blijven alleen in deze browser.</p>
        </form>
      </Screen>
    )

  if (s.phase === 'warmup')
    return (
      <Screen label="Opwarminterview">
        <p className={kicker}>{r.name} · opwarmen</p>
        <h2 className="mt-3 text-3xl font-extrabold lowercase leading-tight">opwarminterview</h2>
        <p className="mt-1 text-sm">{p?.name}</p>
        {recBox}
        <div className="mt-3 border-2 border-dashed border-ig-ink bg-white p-4">
          <p className={leaderLabel}>testleider</p>
          <p className="mt-1 text-sm leading-snug">{WARM_HINT}</p>
        </div>
        <ol className="mt-6 space-y-5">
          {p?.warm.map((q, i) => (
            <li key={q}>
              <p className="mb-2 font-semibold">
                {i + 1}. {q}
              </p>
              <textarea
                value={s.warm[i] ?? ''}
                onChange={(e) => upd((d) => ({ ...d, warm: p.warm.map((_, j) => (j === i ? e.target.value : d.warm[j] ?? '')) }))}
                rows={3}
                placeholder="notities"
                aria-label={`Notities bij vraag ${i + 1}`}
                className={field}
              />
            </li>
          ))}
        </ol>
        <button onClick={() => upd((d) => ({ ...d, phase: afterWarmup(r) }))} className={`${panelBtn} mt-6 bg-ig-orange px-6! py-3!`}>
          {r.five.length ? 'verder naar de website' : 'verder naar de taken'}
        </button>
      </Screen>
    )

  if (s.phase === 'impression') {
    if (s.look === 'intro')
      return (
        <Screen label="Eerste indruk">
          <p className={kicker}>{r.name} · eerste indruk</p>
          <h2 className="mt-3 text-3xl font-extrabold lowercase leading-tight">kijk {LOOK_SECONDS} seconden</h2>
          <p className="mt-4 text-lg leading-snug">Je ziet zo {LOOK_SECONDS} seconden een website. Kijk rustig rond. Daarna stellen we je een paar vragen.</p>
          {!r.warmup && recBox}
          <button onClick={() => upd((d) => ({ ...d, look: 'look' }))} className={`${panelBtn} mt-6 bg-ig-orange px-6! py-3!`}>
            toon de website
          </button>
        </Screen>
      )
    if (s.look === 'look')
      return (
        <div role="status" className="fixed left-1/2 top-4 z-[60] -translate-x-1/2 border-2 border-ig-ink bg-ig-yellow px-4 py-2 text-sm font-bold">
          kijk {LOOK_SECONDS} seconden naar de homepage…
        </div>
      )
    return (
      <Screen label="Eerste indruk">
        <p className={kicker}>{r.name} · eerste indruk</p>
        <div className="mt-3 space-y-6">
          {r.five.map((f, i) => (
            <label key={f.id} className="block">
              <span className="block text-2xl font-extrabold lowercase leading-tight">{f.q}</span>
              <textarea value={s.five[f.id] ?? ''} onChange={(e) => upd((d) => ({ ...d, five: { ...d.five, [f.id]: e.target.value } }))} rows={3} autoFocus={i === 0} className={`${field} mt-3`} />
            </label>
          ))}
        </div>
        <button onClick={() => upd((d) => ({ ...d, phase: r.menu ? 'menu' : 'tasks', step: 'ready' }))} className={`${panelBtn} mt-6 bg-ig-orange px-6! py-3!`}>
          verder
        </button>
      </Screen>
    )
  }

  if (s.phase === 'menu')
    return (
      <Screen label="Menuverwachting">
        <p className={kicker}>{r.name} · menu</p>
        <h2 className="mt-3 text-3xl font-extrabold lowercase leading-tight">wat verwacht je te vinden achter deze woorden?</h2>
        <p className="mt-3 text-lg leading-snug">Je hoeft niet te klikken. Schrijf kort op wat je denkt dat er op die pagina staat.</p>
        {leader && <p className={`${leaderLabel} mt-3`}>testleider · D2</p>}
        <div className="mt-6 space-y-5">
          {MENU.map((m, i) => (
            <label key={m} className="block">
              <span className="inline-block border-2 border-ig-ink bg-white px-3 py-1 text-lg font-bold lowercase">{m}</span>
              <textarea value={s.menu[m] ?? ''} onChange={(e) => upd((d) => ({ ...d, menu: { ...d.menu, [m]: e.target.value } }))} rows={2} autoFocus={i === 0} className={`${field} mt-2`} />
            </label>
          ))}
        </div>
        <button onClick={() => upd((d) => ({ ...d, phase: 'tasks', step: 'ready' }))} className={`${panelBtn} mt-6 bg-ig-orange px-6! py-3!`}>
          verder naar de taken
        </button>
      </Screen>
    )

  if (s.phase === 'closing') {
    const qs = allQs(r, s.profile)
    const i = Math.min(s.qIdx, qs.length - 1)
    const q = qs[i]
    const a = s.answers[q.id]
    const last = i === qs.length - 1
    const blocked = q.kind === 'words' && (a?.w?.length ?? 0) !== 3
    return (
      <Screen label="Afsluitende vragen">
        <p className={kicker}>
          {r.name} · vraag {i + 1} van {qs.length}
        </p>
        <div className="mt-3 h-2 border-2 border-ig-ink bg-white" aria-hidden>
          <div className="h-full bg-ig-orange transition-all" style={{ width: `${((i + 1) / qs.length) * 100}%` }} />
        </div>
        <div key={q.id} className="mt-8">
          <h2 className="text-2xl font-extrabold leading-tight @xl:text-3xl">{q.q}</h2>
          {q.kind === 'words' && <p className="mt-2 text-sm">Kies er precies drie.</p>}
          <div className="mt-6">
            {q.kind === 'scale' && <Scale value={a?.n} low={q.low} high={q.high} onPick={(n) => setAns(q.id, { n })} />}
            {q.kind === 'slider' && <Slider value={a?.n} low={q.low} high={q.high} label={q.q} onPick={(n) => setAns(q.id, { n })} />}
            {q.kind === 'words' && <WordPick words={s.words.length ? s.words : WORDS} value={a?.w ?? []} onPick={(w) => setAns(q.id, { w })} />}
            {q.kind === 'choice' && <Choice q={q} a={a} onChange={(v) => setAns(q.id, v)} />}
            {q.kind === 'text' && <textarea value={a?.t ?? ''} onChange={(e) => setAns(q.id, { t: e.target.value })} rows={5} autoFocus aria-label={q.q} className={field} />}
          </div>
        </div>
        <div className="mt-8 flex gap-2">
          {i > 0 && (
            <button onClick={() => upd((d) => ({ ...d, qIdx: i - 1 }))} className={`${panelBtn} bg-white px-6! py-3!`}>
              vorige
            </button>
          )}
          <button disabled={blocked} onClick={() => upd((d) => (last ? { ...d, phase: 'results' } : { ...d, qIdx: i + 1 }))} className={`${panelBtn} bg-ig-orange px-6! py-3! disabled:opacity-40`}>
            {last ? 'afronden' : 'volgende'}
          </button>
        </div>
      </Screen>
    )
  }

  if (s.phase === 'results') {
    const sessions = ROUNDS.map((_, i) => (i === s.round ? s : read(storeKey(s.nr, i)))).filter((x): x is Session => !!x && x.phase !== 'start')
    const todo = ROUNDS.map((_, i) => i).filter((i) => !sessions.some((x) => x.round === i))
    return (
      <Screen label="Resultaten">
        <p className={kicker}>bedankt voor het meedoen!</p>
        <h2 className="mt-3 text-3xl font-extrabold lowercase leading-tight">resultaten deelnemer {s.nr}</h2>
        <p className="mt-2 text-sm">
          {p?.name} · kent InnerGames: {s.known || '-'} · opname: {s.rec || '-'} · anoniem citeren: {s.quote || '-'}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={`${panelBtn} bg-ig-orange`}
            onClick={async () => {
              const txt = report(s.nr, sessions)
              try {
                await navigator.clipboard.writeText(txt)
              } catch {
                const ta = document.createElement('textarea')
                ta.value = txt
                document.body.appendChild(ta)
                ta.select()
                document.execCommand('copy')
                ta.remove()
              }
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
          >
            {copied ? 'gekopieerd' : 'kopieer resultaten'}
          </button>
          <button className={`${panelBtn} bg-white`} onClick={() => download(`innergames-test-${s.nr}.csv`, csv(sessions), 'text/csv;charset=utf-8')}>
            download csv
          </button>
          <button className={`${panelBtn} bg-white`} onClick={() => download(`innergames-test-${s.nr}.json`, JSON.stringify(sessions, null, 2), 'application/json')}>
            download json
          </button>
          {todo.map((i) => (
            <button key={i} className={`${panelBtn} bg-white`} onClick={() => begin({ ...s, round: i })}>
              start {ROUNDS[i].name} met deelnemer {s.nr}
            </button>
          ))}
          <button
            className={`${panelBtn} bg-white`}
            onClick={() => {
              localStorage.removeItem(KEY + 'current')
              go('home')
              setS(fresh())
            }}
          >
            nieuwe deelnemer
          </button>
        </div>
        {sessions.map((x) => {
          const ro = ROUNDS[x.round]
          const prof = PROFILES[x.profile]
          return (
            <section key={x.round} className="mt-8">
              <h3 className="border-b-2 border-ig-ink pb-1 text-2xl font-extrabold lowercase">{ro.name}</h3>
              <p className="mt-1 text-sm">
                profiel: {prof?.name} · kent InnerGames: {x.known || '-'} · toestemming: {x.consent ? 'ja' : 'nee'}
              </p>
              {ro.warmup && <QA title="opwarminterview" items={(prof?.warm ?? []).map((q, i) => [q, x.warm[i]])} />}
              {ro.five.length > 0 && <QA title={`eerste indruk (${LOOK_SECONDS} sec)`}items={ro.five.map((f) => [f.q, x.five[f.id]])} />}
              {ro.menu && <QA title="menuverwachting · D2" items={MENU.map((m) => [m, x.menu[m]])} />}
              <ol className="mt-4 space-y-4">
                {(ro.tasks[x.profile] ?? []).map((t, i) => {
                  const res = x.tasks[i]
                  return (
                    <li key={t.t} className="border-2 border-ig-ink bg-white p-4">
                      <p className="font-semibold">
                        taak {i + 1}. {t.t}
                      </p>
                      <Dl
                        items={[
                          ['code', t.code],
                          ...(t.expect ? ([['verwacht', t.expect]] as [string, ReactNode][]) : []),
                          ['tijd', `${secs(res) !== undefined ? `${secs(res)} s` : '-'}${res?.stuck ? ' · ik kom er niet uit' : ''}`],
                          ['pagina’s', ro.view === 'huidige site' ? 'n.v.t. (huidige site)' : res?.pages.join(' › ') || '-'],
                          ['klikken', ro.view === 'huidige site' ? 'n.v.t.' : res?.clicks ?? 0],
                          ...(t.ask ?? []).map((q) => [q.q, fmtA(q, res?.ans?.[q.id])] as [string, ReactNode]),
                          ...(ro.ease ? ([['score', `${res?.ease ?? '-'} / 7`]] as [string, ReactNode][]) : []),
                          ['testleider', res?.leader ?? '-'],
                          ...(t.expect ? ([['antwoord klopt', res?.verdict ?? '-']] as [string, ReactNode][]) : []),
                          ['notities', res?.notes || '-'],
                        ]}
                      />
                    </li>
                  )
                })}
              </ol>
              <QA title="afsluitende vragen" items={[...allQs(ro, x.profile).map((q) => [q.q, fmtA(q, x.answers[q.id])] as [string, string]), ['UMUX-Lite score (0-100)', String(umux(x) ?? '-')]]} />
            </section>
          )
        })}
      </Screen>
    )
  }

  // taken
  const external = r.view === 'huidige site'
  const ask = task?.ask ?? []
  const next = () => upd((d) => (d.idx + 1 < tasks.length ? { ...d, idx: d.idx + 1, step: 'ready' } : { ...d, phase: 'closing', qIdx: 0 }))
  const finish = (stuck = false) => {
    updTask((t) => ({ ...t, end: Date.now(), stuck }))
    // huidige site: de testleider vult het antwoord in boven de gemakscore
    if (external) upd((d) => ({ ...d, step: 'ease' }))
    else if (ask.length) upd((d) => ({ ...d, step: 'answer' }))
    else if (r.ease) upd((d) => ({ ...d, step: 'ease' }))
    else next()
  }
  const setTaskAns = (id: string, v: Answer) => updTask((t) => ({ ...t, ans: { ...t.ans, [id]: { ...t.ans?.[id], ...v } } }))
  const lastLabel = s.idx + 1 < tasks.length ? 'volgende taak' : 'naar de laatste vragen'
  const smallTask = <p className="mb-3 border-l-2 border-ig-ink/40 pl-2 text-xs leading-snug text-neutral-600">{task?.t}</p>

  const body = (
    <>
      {s.step === 'answer' && (
        <>
          {smallTask}
          <AskFields qs={ask} ans={cur?.ans} onChange={setTaskAns} />
          <button onClick={() => (r.ease ? upd((d) => ({ ...d, step: 'ease' })) : next())} className={`${panelBtn} mt-4 w-full bg-ig-orange`}>
            {r.ease ? 'verder' : lastLabel}
          </button>
        </>
      )}
      {s.step === 'ease' && (
        <>
          {smallTask}
          {external && ask.length > 0 && (
            <div className="mb-5 border-2 border-dashed border-ig-ink bg-white p-3">
              <p className={`${leaderLabel} mb-3`}>{LEADER_ANSWER}</p>
              <AskFields qs={ask} ans={cur?.ans} onChange={setTaskAns} />
            </div>
          )}
          <p className="text-sm font-semibold">{EASE_Q}</p>
          <div className="mt-2">
            <Scale value={cur?.ease} low="1 = heel moeilijk" high="7 = heel makkelijk" onPick={(n) => updTask((t) => ({ ...t, ease: n }))} />
          </div>
          <button onClick={next} className={`${panelBtn} mt-4 w-full bg-ig-orange`}>
            {lastLabel}
          </button>
        </>
      )}
      {(s.step === 'ready' || s.step === 'running') && <p className={external ? 'text-xl font-semibold leading-snug' : 'text-[15px] leading-snug'}>{task?.t}</p>}
      {s.step === 'ready' && (
        <button
          onClick={() => {
            updTask((t) => ({ ...t, start: Date.now(), pages: [], clicks: 0 }))
            upd((d) => ({ ...d, step: 'running' }))
          }}
          className={`${panelBtn} mt-3 w-full bg-ig-orange`}
        >
          start
        </button>
      )}
      {s.step === 'running' && (
        <>
          <button onClick={() => finish()} className={`${panelBtn} mt-3 w-full bg-ig-ink text-white`}>
            ik ben klaar
          </button>
          <button onClick={() => finish(true)} className="mt-2 w-full text-center text-xs underline underline-offset-2">
            ik kom er niet uit
          </button>
        </>
      )}
      {leaderBox}
    </>
  )

  if (external)
    return (
      <Screen label="Testtaak">
        <p className={kicker}>
          {r.name} · taak {s.idx + 1} van {tasks.length}
          {s.step === 'running' ? ' · bezig' : ''}
        </p>
        <p className="mt-3 text-sm">
          Gebruik de huidige website in het andere tabblad:{' '}
          <a href="https://www.innergames.nl" target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2">
            innergames.nl
          </a>
        </p>
        <div className="mt-6 max-w-md">{body}</div>
      </Screen>
    )

  return (
    <aside className={`fixed bottom-20 right-4 z-50 border-2 border-ig-ink bg-white p-4 text-ig-ink shadow-[6px_6px_0_#1f1a17] max-h-[70vh] overflow-y-auto ${leader || s.step === 'answer' ? 'w-[min(24rem,calc(100vw-2rem))]' : 'w-[min(19rem,calc(100vw-2rem))]'}`} aria-label="Testtaak">
      <p className="font-mono text-[11px] uppercase tracking-wide text-neutral-600">{r.name}</p>
      <button onClick={() => setCollapsed(!collapsed)} aria-expanded={!collapsed} className="mt-1 flex w-full items-center justify-between text-left text-sm font-semibold">
        <span>
          taak {s.idx + 1} van {tasks.length}
          {s.step === 'running' ? ' · bezig' : ''}
        </span>
        <span aria-hidden>{collapsed ? '+' : '–'}</span>
      </button>
      {!collapsed && <div className="mt-3">{body}</div>}
    </aside>
  )
}
