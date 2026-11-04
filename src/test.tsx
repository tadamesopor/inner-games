import { useEffect, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
import type { PageId } from './wf'

/* =========================================================================
   gebruikerstest InnerGames · test mode v5
   ronde 0 = huidige site (baseline) · ronde 1 = prototype (vindbaarheid + preview + vertrouwen) · retest = ronde 1 op de verbeterde versie
   v5: wireframe-ronde weg. Eén sessie van ± 40 minuten op het ontwerp, zodat 12 mensen genoeg zijn (3 + 6 + 3).
   Onderwijs = mbo en hbo (wens Ariën, week 9).
   Decision codes D1 to D12: see InnerGames_Usability_Test_Plan_v3, section 3.
   ========================================================================= */

type Task = { text: string; codes: string[]; expect: string; ask?: Q[]; noSeq?: boolean }
type Q = { id: string; q: string; kind: 'text' | 'scale7' | 'pick3' | 'choice'; low?: string; high?: string; code?: string; options?: string[]; follow?: string; followWhen?: string[] }
type Round = {
  name: string
  view: 'ontwerp' | 'live'
  impression?: { q: string; code: string }[]
  menu?: string[]
  after: 'seq' | 'none'
  tasks: Task[][]
  closing: Q[]
  profileQ: string[][]
}

/* Warm-up: critical incident technique. Ask about the LAST real time, not about "usually".
   No real example? Ask how they would do it and write "hypothetisch" in the notes. */
export const PROFILES = [
  {
    name: 'onderwijs (docent mbo / hbo)',
    warm: [
      'Vertel eens over de laatste keer dat je iets extra’s voor je studenten of je team regelde, zoals een workshop, gastles, training of spel. Wat was het?',
      'Hoe kwam je daarbij terecht? Waar zocht of hoorde je het eerst?',
      'Wat moest je weten voordat je ja zei, en waar vond je dat?',
      'Wie moest er nog meer mee instemmen, bijvoorbeeld je teamleider of opleidingsmanager?',
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

/* Answer formats (v4):
   - open text when we want to discover something (why, what's missing, expectations, first impression)
   - choice when the answer space is known and we need to count it (ja/nee, next step, which offer)
   - every choice has "weet ik niet" or "iets anders", and most get a "waarom" follow-up
   - never a list of trust signals or menu words to tick: that would put words in people's mouths */
const YNW = ['ja', 'nee', 'weet ik niet']
const OFFERS = [
  'Energiek team!', 'Het spel tussen hoofd en lichaam', 'Ontdek jouw drijfveren', 'De Klimaat Collage', 'Het Impact Imperium (workshop)', 'MemoryStory', 'Kansen Keren (workshop)', 'Hoezo Raar?!', 'Positive Masculinity',
  'the elemental five (spel)', 'Sociality (spel)', 'Impact Imperium klassenset (spel)', 'Kansen Keren (spel)', 'train-de-trainer', 'iets anders', 'niets gevonden',
]
const pick: Q = { id: 'keuze', q: 'Wat heb je gekozen?', kind: 'choice', options: OFFERS, follow: 'Waarom deze?', followWhen: OFFERS.slice(0, -1) }

/* Round 1 tasks. Same structure for every profile so tasks 1 to 3 can be compared over 6 people:
   1 find something that fits (D1, D4) · 2 check the facts (D3) · 3 arrange it (D5) · 4 profile-specific.
   No menu words in the tasks. "expect" is only shown to the test leader.
   "ask" = the answer to the task itself, asked BEFORE the ease score. Action tasks (task 3) have no ask:
   success there is reaching the form, which the page log shows. */
const R1_TASKS: Task[][] = [
  [
    { text: 'Je bent docent in het mbo of hbo. Over drie weken heeft je opleiding een projectweek over duurzaamheid. Zoek iets van InnerGames dat je in die week met je klas kunt doen.', codes: ['D1', 'D4'], expect: 'Het Impact Imperium (workshop) of Impact Imperium klassenset. De Klimaat Collage past qua onderwerp ook. Let op de route: onderwijs-kaart, menu of filter?', ask: [pick] },
    { text: 'Jullie hebben € 500 voor die week en de klas heeft 28 studenten. Kan jouw keuze, ja of nee?', codes: ['D3'], expect: 'Het Impact Imperium: € 423,50, tot 32 → ja. Klassenset € 275 (4 tot 40) → ja. Klimaat Collage € 1.800 → nee.', ask: [{ id: 'kan', q: 'Kan het?', kind: 'choice', options: YNW, follow: 'Welke prijs en welke groepsgrootte zag je?' }] },
    { text: 'Je wilt donderdag 12 maart vastleggen. Regel dat via de website.', codes: ['D5'], expect: '"boek of vraag aan" → aanvraagformulier met de workshop al ingevuld, datum 12 maart ingevuld en verstuurd. Of WhatsApp. Binnen 2 klikken vanaf de workshoppagina.' },
    { text: 'Je wilt dit later ook zonder trainer met andere klassen doen. Kan dat, en wat kost het?', codes: ['D12'], expect: 'Ja: Impact Imperium klassenset, € 275. Via de link op de workshoppagina of via onze spellen.', ask: [{ id: 'kan', q: 'Kan het?', kind: 'choice', options: YNW, follow: 'Wat kost het?', followWhen: ['ja'] }] },
  ],
  [
    { text: 'In je team werkt iedereen op zijn eigen eiland. Je leidinggevende geeft je één middag om daar iets aan te doen. Zoek iets dat past.', codes: ['D1', 'D4'], expect: 'Een workshop van maximaal een middag voor organisaties: Ontdek jouw drijfveren, Het spel tussen hoofd en lichaam, Kansen Keren of Hoezo Raar?!. Kiest iemand Energiek team! (3 x 4 uur): zag die de duur?', ask: [pick] },
    { text: 'Je team is 14 mensen. Wat kost jouw keuze, en kan het met iedereen?', codes: ['D3'], expect: 'Bijv. Ontdek jouw drijfveren: € 950, tot 12 personen → niet met 14 zonder te vragen. Let op: leest de deelnemer de groepsgrootte?', ask: [{ id: 'prijs', q: 'Wat kost het?', kind: 'text' }, { id: 'kan', q: 'Kan het met 14 mensen?', kind: 'choice', options: YNW }] },
    { text: 'Je wilt een datum vastleggen. Regel dat via de website.', codes: ['D5'], expect: '"boek of vraag aan" → aanvraagformulier met de workshop al ingevuld, een datum en het aantal mensen ingevuld en verstuurd. Of WhatsApp. Binnen 2 klikken vanaf de workshoppagina.' },
    { text: 'Je leidinggevende wil weten wie de workshop komt geven. Zoek het uit.', codes: ['D2', 'D11'], expect: 'Het blok "wie begeleidt" op de workshoppagina (naam + foto), of ons team via het menu. Noteer waar de deelnemer eerst zocht.', ask: [{ id: 'wie', q: 'Heb je een naam gevonden?', kind: 'choice', options: YNW, follow: 'Welke naam, en waar vond je die?', followWhen: ['ja'] }] },
  ],
  [
    { text: 'Je begeleidt zelf groepen. Je wilt leren hoe je de spellen van InnerGames zelf kunt inzetten. Zoek uit of dat kan.', codes: ['D1', 'D7'], expect: 'Train-de-trainer, via het menu of de trainers-kaart op de homepage.', ask: [{ id: 'kan', q: 'Kan het?', kind: 'choice', options: YNW, follow: 'Hoe heet het aanbod?', followWhen: ['ja'] }] },
    { text: 'Hoeveel tijd kost je dat, en wat betaal je ervoor?', codes: ['D3', 'D7'], expect: '8 uur (4 theorie, 4 praktijk), € 1.800 per persoon.', ask: [{ id: 'tijd', q: 'Hoeveel tijd kost het?', kind: 'text' }, { id: 'prijs', q: 'Wat kost het?', kind: 'text' }] },
    { text: 'Je wilt je aanmelden. Regel dat via de website.', codes: ['D5'], expect: '"vraag de training aan" → aanvraagformulier met train-de-trainer al ingevuld en verstuurd, of WhatsApp.' },
    { text: 'Je gebruikt The Elemental Five al met grondankers. Je wilt alleen de kaarten erbij kopen. Kan dat, en wat kost het?', codes: ['D6'], expect: 'Ja: the elemental five, losse kaartenset, € 39. Op de spelpagina van The Elemental Five, bij de keuze wat je koopt.', ask: [{ id: 'kan', q: 'Kan het?', kind: 'choice', options: YNW, follow: 'Wat kost het?', followWhen: ['ja'] }] },
  ],
]

/* Preview task, added to round 1 in v5 (was round 2). No ease score: it is about curiosity, not effort. */
const NEXT_STEP = ['het spel kopen', 'een workshop boeken', 'meer lezen over het spel', 'contact opnemen', 'niets', 'iets anders']
const previewAsk: Q[] = [
  { id: 'vervolg', q: 'Wat zou je nu doen?', kind: 'choice', options: NEXT_STEP, follow: 'Waarom?' },
  { id: 'bij', q: 'Wat blijft je het meest bij van de preview?', kind: 'text' },
]
const PREVIEW_TASKS: Task[] = [
  { text: 'Zoek op de website een korte preview van het spel Impact Imperium en speel die tot het einde.', codes: ['D9'], expect: 'Vindt de preview (onze spellen of spelpagina)? Snapt de deelnemer de onthulling? Noemt een volgende stap?', ask: previewAsk, noSeq: true },
  { text: 'Zoek op de website een korte preview van het spel The Elemental Five en speel die tot het einde.', codes: ['D9'], expect: 'Vindt de preview? Ziet de deelnemer het voor zich met het team? Noemt een volgende stap?', ask: previewAsk, noSeq: true },
  { text: 'Zoek op de website een korte preview van het spel Sociality en speel die tot het einde.', codes: ['D9'], expect: 'Vindt de preview? Snapt de deelnemer waar het spel over gaat? Noemt een volgende stap?', ask: previewAsk, noSeq: true },
]
const R1_PROTO_TASKS: Task[][] = R1_TASKS.map((ts, i) => [...ts, PREVIEW_TASKS[i]])

const UMUX: Q[] = [
  { id: 'umux1', q: 'Wat deze website kan, past bij wat ik nodig heb.', kind: 'scale7', low: '1 = helemaal oneens', high: '7 = helemaal eens' },
  { id: 'umux2', q: 'Deze website is makkelijk te gebruiken.', kind: 'scale7', low: '1 = helemaal oneens', high: '7 = helemaal eens' },
]

const R1_CLOSING: Q[] = [
  ...UMUX,
  { id: 'makkelijk_lastig', q: 'Als je terugdenkt aan de taken: wat ging makkelijk, en wat ging lastig?', kind: 'text', code: 'D1' },
  { id: 'info_nodig', q: 'Welke informatie had je nodig om echt een keuze te maken?', kind: 'text', code: 'D3' },
  { id: 'info_gevonden', q: 'Vond je die informatie op de site?', kind: 'choice', options: ['ja', 'deels', 'nee'], follow: 'Wat miste er?', followWhen: ['deels', 'nee'], code: 'D3' },
]
const R1_PROFILE_Q: string[][] = [
  ['Wie op jouw opleiding moet hier nog meer van vinden?', 'Wat zou die persoon op deze site willen zien?'],
  ['Je leidinggevende moet dit goedkeuren. Wat zou die op deze site willen zien dat er nu niet staat?'],
  ['Wat zou je nog willen weten of zien voordat je € 1.800 uitgeeft aan deze training?'],
]

/* Product reaction cards (Benedek & Miner): 9 positive, 7 negative, shown in random order. */
export const WORDS = ['speels', 'professioneel', 'betrouwbaar', 'warm', 'creatief', 'rustig', 'duidelijk', 'uitnodigend', 'serieus', 'kinderachtig', 'rommelig', 'saai', 'druk', 'goedkoop', 'ouderwets', 'afstandelijk']

export const ROUNDS: Round[] = [
  {
    name: 'ronde 0 · huidige site',
    view: 'live',
    after: 'seq',
    tasks: R1_TASKS,
    closing: R1_CLOSING,
    profileQ: R1_PROFILE_Q,
  },
  {
    name: 'ronde 1 · prototype',
    view: 'ontwerp',
    // five-second test: what it is, who it is for, and the first words (fixed order)
    impression: [
      { q: 'Wat doet dit bedrijf?', code: 'D8' },
      { q: 'Voor wie is deze website, denk je?', code: 'D8' },
      { q: 'Noem de eerste drie woorden die bij je opkomen.', code: 'D10' },
    ],
    menu: ['sessies en workshops', 'onze spellen', 'projecten', 'train-de-trainer'],
    after: 'seq',
    tasks: R1_PROTO_TASKS,
    // fixed order: effort first, then trust and image, the intended image only at the very end
    closing: [
      ...UMUX,
      { id: 'makkelijk_lastig', q: 'Als je terugdenkt aan de taken: wat ging makkelijk, en wat ging lastig?', kind: 'text', code: 'D1' },
      { id: 'info_gevonden', q: 'Vond je de informatie die je nodig had om echt te kiezen?', kind: 'choice', options: ['ja', 'deels', 'nee'], follow: 'Wat miste er?', followWhen: ['deels', 'nee'], code: 'D3' },
      { id: 'besluit', q: 'Stel dat dit echt was. Zou je bij InnerGames boeken of kopen?', kind: 'choice', options: ['ja', 'misschien', 'nee'], code: 'D11' },
      { id: 'helpt', q: 'Wat op de website hielp je daarbij?', kind: 'text', code: 'D11' },
      { id: 'tegen', q: 'Wat hield je tegen, of wat miste je om te vertrouwen?', kind: 'text', code: 'D11' },
      { id: 'omschrijf', q: 'Hoe zou je InnerGames omschrijven aan iemand die het niet kent?', kind: 'text', code: 'D10' },
      { id: 'woordkeuze', q: 'Kies de drie woorden die het beste bij deze website passen.', kind: 'pick3', code: 'D10' },
      { id: 'woordkeuze_waarom', q: 'Waarom koos je juist deze drie woorden?', kind: 'text', code: 'D10' },
      { id: 'speels', q: 'Waar ligt de website: saai of speels?', kind: 'scale7', low: '1 = saai', high: '7 = speels', code: 'D10' },
      { id: 'volwassen', q: 'Waar ligt de website: kinderachtig of volwassen?', kind: 'scale7', low: '1 = kinderachtig', high: '7 = volwassen', code: 'D10' },
      { id: 'professioneel', q: 'Hoe komt InnerGames over: amateuristisch of professioneel?', kind: 'scale7', low: '1 = amateuristisch', high: '7 = professioneel', code: 'D10' },
      { id: 'betrouwbaar', q: 'Hoe komt InnerGames over: onbetrouwbaar of betrouwbaar?', kind: 'scale7', low: '1 = onbetrouwbaar', high: '7 = betrouwbaar', code: 'D11' },
      { id: 'beoogd', q: 'InnerGames wil overkomen als een serieuze organisatie die speelse dingen doet. Herken je dat?', kind: 'choice', options: ['ja', 'deels', 'nee'], follow: 'Waar wel, en waar niet?', code: 'D10' },
    ],
    profileQ: [
      ['Wie op jouw opleiding moet hier nog meer van vinden, en wat zou die persoon willen zien?'],
      ['Je leidinggevende moet dit goedkeuren. Wat zou die op deze site willen zien dat er nu niet staat?'],
      ['Wat zou je nog willen weten of zien voordat je € 1.800 uitgeeft aan de train-de-trainer?'],
    ],
  },
]

/* Neutral think-aloud prompts for the test leader. Never ask "is dit duidelijk?" or point at a button. */
const PROBES = ['Wat denk je nu?', 'Wat verwacht je dat er gebeurt?', 'Wat zoek je op dit moment?', 'Kun je daar iets meer over vertellen?']
const RETRO = 'Waar had je verwacht dit te vinden?'
const CORRECT = ['klopt', 'deels', 'klopt niet'] as const
const KNOWN = ['nooit van gehoord', 'van naam', 'eerder mee gewerkt'] as const
const REC = ['ja, scherm en stem', 'alleen stem', 'nee, geen opname'] as const
const QUOTE = ['ja, anoniem', 'nee'] as const

type ModeId = 'r0' | 'r1' | 'retest'
const MODES: { id: ModeId; name: string; note: string }[] = [
  { id: 'r0', name: 'ronde 0 · huidige site (baseline)', note: 'Deelnemer gebruikt innergames.nl in een ander tabblad. Jij bedient dit scherm.' },
  { id: 'r1', name: 'ronde 1 · prototype', note: 'Eerste indruk, menu, 4 taken, preview, vertrouwen en uitstraling. ± 40 minuten.' },
  { id: 'retest', name: 'retest · verbeterde versie', note: 'Zelfde als ronde 1, met nieuwe mensen. Zet versie op v2.' },
]
type PartPlan = { round: number; impression: boolean; only: boolean }
const PLAN: Record<ModeId, PartPlan[]> = {
  r0: [{ round: 0, impression: false, only: false }],
  r1: [{ round: 1, impression: true, only: false }],
  retest: [{ round: 1, impression: true, only: false }],
}

const LEADER = ['zelf gelukt', 'met hulp', 'niet gelukt'] as const

type TaskRes = { start?: number; end?: number; pages: string[]; clicks: number; first?: string; stuck?: boolean; score?: number; sentence?: string; leader?: string; correct?: string; ans?: Record<string, Answer>; notes: string }
type Answer = { n?: number; t?: string; w?: string[]; c?: string; f?: string }
type Part = PartPlan & { covered: boolean; impressionAns: string[]; menuAns: string[]; idx: number; step: 'ready' | 'running' | 'answer' | 'after'; tasks: TaskRes[]; answers: Record<string, Answer>; qi: number }
type Phase = 'start' | 'intro' | 'warmup' | 'impression' | 'menu' | 'tasks' | 'closing' | 'results'
type Session = {
  nr: string
  mode: ModeId
  profile: number
  known: string
  rec: string
  quote: string
  device: 'desktop' | 'mobiel'
  version: string
  pilot: boolean
  consent: boolean
  warmNotes: string[]
  warmDone: boolean
  words: string[]
  parts: Part[]
  pi: number
  phase: Phase
  date: string
  saved: boolean
}

const KEY = 'ig-test5:'
const shuffle = <T,>(a: T[]) => {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}
const fresh = (keep: Partial<Session> = {}): Session => ({
  nr: '', mode: 'r1', profile: -1, known: '', rec: '', quote: '', device: 'desktop', version: 'v1', pilot: false, consent: false,
  warmNotes: [], warmDone: false, words: [], parts: [], pi: 0, phase: 'start', date: '', saved: false, ...keep,
})
const storeKey = (s: Session) => `${KEY}${s.nr}:${s.mode}:${s.version}`
function read(k: string | null): Session | undefined {
  try {
    const raw = k && localStorage.getItem(k)
    return raw ? { ...fresh(), ...JSON.parse(raw) } : undefined
  } catch {
    return undefined
  }
}
function allSessions(): Session[] {
  const out: Session[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(KEY) && k !== KEY + 'current') {
        const s = read(k)
        if (s && s.phase !== 'start') out.push(s)
      }
    }
  } catch {
    /* storage blocked */
  }
  return out.sort((a, b) => a.nr.localeCompare(b.nr, undefined, { numeric: true }))
}
const load = () => {
  try {
    return read(localStorage.getItem(KEY + 'current')) ?? fresh()
  } catch {
    return fresh()
  }
}

const secs = (t?: TaskRes) => (t?.start && t.end ? Math.round((t.end - t.start) / 1000) : undefined)
const closingQs = (part: Part, profile: number): Q[] => {
  const r = ROUNDS[part.round]
  return [...r.closing, ...(r.profileQ[profile] ?? []).map((q, i): Q => ({ id: `profiel${i + 1}`, q, kind: 'text' }))]
}
const umux = (a: Record<string, Answer>) => {
  const x = a.umux1?.n
  const y = a.umux2?.n
  return x && y ? Math.round((((x - 1) + (y - 1)) / 12) * 100) : undefined
}
const fmtA = (q: Q, a?: Answer) => {
  if (q.kind === 'scale7') return a?.n ? `${a.n}/7` : '-'
  if (q.kind === 'pick3') return a?.w?.join(', ') || '-'
  if (q.kind === 'choice') return [a?.c || '-', a?.f].filter(Boolean).join(' · ')
  return a?.t || '-'
}
const modeName = (m: ModeId) => MODES.find((x) => x.id === m)?.name ?? m

function report(s: Session) {
  const L = [
    'gebruikerstest InnerGames website',
    `deelnemer: ${s.nr} · sessie: ${modeName(s.mode)} · versie: ${s.version}${s.pilot ? ' · PILOT (telt niet mee)' : ''}`,
    `profiel: ${PROFILES[s.profile]?.name} · kent InnerGames: ${s.known || '-'} · opname: ${s.rec || '-'} · citaat: ${s.quote || '-'} · apparaat: ${s.device} · datum: ${s.date}`,
  ]
  if (s.warmNotes.some(Boolean)) {
    L.push('', 'opwarmvragen:')
    PROFILES[s.profile]?.warm.forEach((w, i) => L.push(`  ${w}`, `    ${s.warmNotes[i] || '-'}`))
  }
  for (const part of s.parts) {
    const r = ROUNDS[part.round]
    L.push('', `===== ${r.name}${part.only ? ' (alleen eerste indruk)' : ''} =====`)
    if (part.impression && r.impression) r.impression.forEach((q, i) => L.push(`5 seconden [${q.code}] · ${q.q}`, `  ${part.impressionAns[i] || '-'}`))
    if (part.only) continue
    if (part.round === 1 && r.menu) {
      L.push('', 'menu-verwachting [D2]:')
      r.menu.forEach((m, i) => L.push(`  ${m}: ${part.menuAns[i] || '-'}`))
    }
    L.push('')
    ;(r.tasks[s.profile] ?? []).forEach((t, i) => {
      const x = part.tasks[i]
      L.push(
        `taak ${i + 1} [${t.codes.join(', ')}]: ${t.text}`,
        `  tijd: ${secs(x) ?? '-'} s${x?.stuck ? ' (ik kom er niet uit)' : ''}`,
        `  eerste klik: ${x?.first || '-'}`,
        `  pagina's: ${x?.pages.join(' > ') || '-'}`,
        `  klikken: ${x?.clicks ?? 0}`,
        ...(t.ask ?? []).map((q) => `  ${q.q} ${fmtA(q, x?.ans?.[q.id])}`),
        r.after === 'seq' && !t.noSeq ? `  SEQ (1-7): ${x?.score ?? '-'}` : '',
        `  testleider: ${x?.leader ?? '-'} · antwoord: ${x?.correct ?? '-'}`,
        `  notities: ${x?.notes || '-'}`,
        '',
      )
    })
    L.push('afsluitende vragen:')
    closingQs(part, s.profile).forEach((q) => L.push(`  ${q.code ? `[${q.code}] ` : ''}${q.q}`, `    ${fmtA(q, part.answers[q.id])}`))
    L.push(`  UMUX-Lite score: ${umux(part.answers) ?? '-'} / 100`)
  }
  return L.join('\n')
}

function csv(sessions: Session[]) {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = [['deelnemer', 'sessie', 'versie', 'pilot', 'apparaat', 'profiel', 'kent_innergames', 'opname', 'citaat', 'datum', 'ronde', 'item', 'code', 'vraag', 'tijd_s', 'eerste_klik', 'klikken', 'paginas', 'score', 'vastgelopen', 'testleider', 'antwoord_klopt', 'antwoord']]
  for (const s of sessions) {
    const base = [s.nr, modeName(s.mode), s.version, s.pilot ? 'ja' : 'nee', s.device, PROFILES[s.profile]?.name ?? '', s.known, s.rec, s.quote, s.date]
    PROFILES[s.profile]?.warm.forEach((w, i) => rows.push([...base, '', 'opwarm', '', w, '', '', '', '', '', '', '', '', s.warmNotes[i] ?? '']))
    for (const part of s.parts) {
      const r = ROUNDS[part.round]
      const b = [...base, r.name]
      if (part.impression && r.impression) r.impression.forEach((q, i) => rows.push([...b, '5 sec', q.code, q.q, '', '', '', '', '', '', '', '', part.impressionAns[i] ?? '']))
      if (part.only) continue
      if (part.round === 1 && r.menu) r.menu.forEach((m, i) => rows.push([...b, 'menu', 'D2', `Wat verwacht je achter: ${m}`, '', '', '', '', '', '', '', '', part.menuAns[i] ?? '']))
      ;(r.tasks[s.profile] ?? []).forEach((t, i) => {
        const x = part.tasks[i]
        rows.push([...b, String(i + 1), t.codes.join(' '), t.text, String(secs(x) ?? ''), x?.first ?? '', String(x?.clicks ?? 0), x?.pages.join(' > ') ?? '', String(x?.score ?? ''), x?.stuck ? 'ja' : 'nee', x?.leader ?? '', x?.correct ?? '', x?.notes ?? ''])
        ;(t.ask ?? []).forEach((q) => rows.push([...b, `${i + 1} antwoord`, t.codes.join(' '), q.q, '', '', '', '', '', '', '', '', fmtA(q, x?.ans?.[q.id])]))
      })
      closingQs(part, s.profile).forEach((q) => {
        const a = part.answers[q.id]
        rows.push([...b, 'afsluiting', q.code ?? '', q.q, '', '', '', '', q.kind === 'scale7' ? String(a?.n ?? '') : '', '', '', '', q.kind === 'pick3' ? a?.w?.join(', ') ?? '' : q.kind === 'choice' ? fmtA(q, a) : a?.t ?? ''])
      })
      rows.push([...b, 'UMUX-Lite', '', 'score 0-100', '', '', '', '', String(umux(part.answers) ?? ''), '', '', '', ''])
    }
  }
  return '﻿' + rows.map((r) => r.map(esc).join(';')).join('\n')
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

function Scale({ value, onPick, low, high }: { value?: number; onPick: (n: number) => void; low?: string; high?: string }) {
  return (
    <div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button key={n} type="button" onClick={() => onPick(n)} aria-pressed={value === n} className={`h-10 flex-1 ${panelBtn} px-0! ${value === n ? 'bg-ig-ink text-white' : 'bg-white hover:bg-ig-yellow'}`}>
            {n}
          </button>
        ))}
      </div>
      {low && (
        <div className="mt-1 flex justify-between text-[11px] text-neutral-600">
          <span>{low}</span>
          <span>{high}</span>
        </div>
      )}
    </div>
  )
}

function QInput({ q, a, set, words = [], compact = false }: { q: Q; a?: Answer; set: (v: Answer) => void; words?: string[]; compact?: boolean }) {
  const small = compact ? 'text-sm!' : ''
  if (q.kind === 'scale7') return <Scale value={a?.n} low={q.low} high={q.high} onPick={(n) => set({ n })} />
  if (q.kind === 'text') return <textarea value={a?.t ?? ''} onChange={(e) => set({ t: e.target.value })} rows={compact ? 2 : 4} aria-label={q.q} className={`${field} ${small}`} />
  if (q.kind === 'choice') {
    const opts = q.options ?? []
    const showFollow = !!q.follow && !!a?.c && (!q.followWhen || q.followWhen.includes(a.c))
    return (
      <div>
        {opts.length > 6 ? (
          <select value={a?.c ?? ''} onChange={(e) => set({ c: e.target.value })} aria-label={q.q} className={`${field} ${small}`}>
            <option value="" disabled>kies…</option>
            {opts.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {opts.map((o) => (
              <button key={o} type="button" aria-pressed={a?.c === o} onClick={() => set({ c: o })} className={`${panelBtn} ${compact ? 'px-2! py-1! text-xs!' : ''} ${a?.c === o ? 'bg-ig-ink text-white' : 'bg-white hover:bg-ig-yellow'}`}>
                {o}
              </button>
            ))}
          </div>
        )}
        {showFollow && (
          <label className="mt-2 block">
            <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold`}>{q.follow}</span>
            <textarea value={a?.f ?? ''} onChange={(e) => set({ f: e.target.value })} rows={2} className={`${field} mt-1 ${small}`} />
          </label>
        )}
      </div>
    )
  }
  return (
    <div className="flex flex-wrap gap-2">
      {words.map((w) => {
        const on = a?.w?.includes(w) ?? false
        const full = (a?.w?.length ?? 0) >= 3
        return (
          <button
            key={w}
            type="button"
            aria-pressed={on}
            disabled={!on && full}
            onClick={() => set({ w: on ? (a?.w ?? []).filter((x) => x !== w) : [...(a?.w ?? []), w] })}
            className={`${panelBtn} ${on ? 'bg-ig-ink text-white' : 'bg-white hover:bg-ig-yellow'} disabled:opacity-30`}
          >
            {w}
          </button>
        )
      })}
      <p className="w-full text-sm text-neutral-600">{a?.w?.length ?? 0} van 3 gekozen</p>
    </div>
  )
}

function Screen({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div data-test-ui className="fixed inset-0 z-[60] overflow-y-auto bg-ig-cream text-ig-ink" role="dialog" aria-label={label}>
      <div className="mx-auto max-w-2xl px-5 pb-28 pt-10 @container">{children}</div>
    </div>
  )
}

function Choice<T extends string | number>({ legend, options, value, onPick }: { legend: string; options: { v: T; label: string; note?: string }[]; value: T; onPick: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">{legend}</legend>
      <div className="mt-2 grid gap-2 @xl:grid-cols-2">
        {options.map((o) => (
          <label key={String(o.v)} className={`flex cursor-pointer items-start gap-3 border-2 border-ig-ink px-4 py-3 ${value === o.v ? 'bg-ig-yellow' : 'bg-white'}`}>
            <input type="radio" checked={value === o.v} onChange={() => onPick(o.v)} className="mt-1 accent-current" />
            <span>
              {o.label}
              {o.note && <span className="mt-0.5 block text-xs text-neutral-600">{o.note}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default function TestMode({
  pageKey,
  go,
  bus,
  setWire,
  setMobile,
}: {
  pageKey: string
  go: (p: PageId) => void
  bus: MutableRefObject<(() => void) | undefined>
  setWire?: (w: boolean) => void
  setMobile?: (m: boolean) => void
}) {
  const [s, setS] = useState<Session>(load)
  const [leader, setLeader] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState('')
  const taps = useRef<number[]>([])
  const part = s.parts[s.pi] as Part | undefined
  const r = part ? ROUNDS[part.round] : undefined
  const prof = PROFILES[s.profile]
  const tasks = (r && r.tasks[s.profile]) || []
  const cur = part?.tasks[part.idx]
  const isLive = part?.round === 0

  const upd = (f: (d: Session) => Session) => setS((d) => f(d))
  const updPart = (f: (p: Part) => Part) => upd((d) => ({ ...d, parts: d.parts.map((p, i) => (i === d.pi ? f(p) : p)) }))
  const updTask = (f: (t: TaskRes) => TaskRes) => updPart((p) => ({ ...p, tasks: p.tasks.map((t, i) => (i === p.idx ? f(t) : t)) }))
  const setTaskAns = (id: string, v: Answer) => updTask((t) => ({ ...t, ans: { ...t.ans, [id]: { ...t.ans?.[id], ...v } } }))
  const setAns = (id: string, v: Answer) => updPart((p) => ({ ...p, answers: { ...p.answers, [id]: { ...p.answers[id], ...v } } }))
  const flash = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(''), 2500)
  }

  // v5: there is only the design view, so make sure the wireframe view is off
  useEffect(() => {
    setWire?.(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // save per participant + session + version
  useEffect(() => {
    if (!s.nr || s.phase === 'start') return
    try {
      localStorage.setItem(storeKey(s), JSON.stringify(s))
      localStorage.setItem(KEY + 'current', storeKey(s))
    } catch {
      /* storage blocked */
    }
  }, [s])

  // auto-download JSON once when a participant finishes
  useEffect(() => {
    if (s.phase === 'results' && !s.saved) {
      download(`innergames-test-${s.nr}-${s.mode}-${s.version}.json`, JSON.stringify(s, null, 2), 'application/json')
      upd((d) => ({ ...d, saved: true }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.phase])

  // test leader: press T three times
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

  const running = s.phase === 'tasks' && part?.step === 'running' && !isLive

  // log pages during a running task
  useEffect(() => {
    if (running) updTask((t) => (t.pages[t.pages.length - 1] === pageKey ? t : { ...t, pages: [...t.pages, pageKey] }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, running])

  // clicks + first click (old bus not used anymore)
  useEffect(() => {
    bus.current = undefined
    if (!running) return
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null
      if (!el || el.closest('[data-test-ui]') || el.closest('[aria-label="Prototype-opties"]')) return
      const hit = (el.closest('a,button,input,select,textarea,label,[role="button"]') as HTMLElement | null) ?? el
      const label = (hit.getAttribute('aria-label') || hit.innerText || hit.textContent || hit.tagName).replace(/\s+/g, ' ').trim().slice(0, 60)
      updTask((t) => ({ ...t, clicks: t.clicks + 1, first: t.first ?? `${label} (${pageKey})` }))
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, pageKey])

  // dead ends: outside links never leave the test
  useEffect(() => {
    if (s.phase === 'start' || s.phase === 'results') return
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest('a') as HTMLAnchorElement | null
      if (!a) return
      const href = a.getAttribute('href') ?? ''
      if (/^(https?:|mailto:|tel:|\/\/)/i.test(href)) {
        e.preventDefault()
        flash('deze link werkt niet in de test')
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [s.phase])

  // first impression: 5 seconds, then cover
  useEffect(() => {
    if (s.phase !== 'impression' || !part || part.covered) return
    const t = setTimeout(() => updPart((p) => ({ ...p, covered: true })), 5000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.phase, s.pi, part?.covered])

  // which phase comes first for a part
  const enterPart = (d: Session, pi: number): Session => {
    const p = d.parts[pi]
    if (!p) return { ...d, phase: 'results' }
    if (!d.warmDone) return { ...d, pi, phase: 'warmup' }
    return { ...d, pi, phase: p.impression ? 'impression' : 'tasks' }
  }
  const nextPart = () => {
    go('home')
    upd((d) => enterPart(d, d.pi + 1))
  }

  const begin = () => {
    const nr = s.nr.trim()
    const parts: Part[] = PLAN[s.mode].map((pl) => ({
      ...pl, covered: false, impressionAns: [], menuAns: [], idx: 0, step: 'ready', qi: 0, answers: {},
      tasks: ROUNDS[pl.round].tasks[s.profile].map(() => ({ pages: [], clicks: 0, notes: '' })),
    }))
    setMobile?.(s.device === 'mobiel')
    setS({ ...fresh({ nr, mode: s.mode, profile: s.profile, known: s.known, rec: s.rec, quote: s.quote, device: s.device, version: s.version.trim() || 'v1', pilot: s.pilot, consent: true }), parts, words: shuffle(WORDS), date: new Date().toISOString().slice(0, 10), phase: 'intro' })
  }

  const afterTask = () => {
    upd((d) => {
      const p = d.parts[d.pi]
      if (p.idx + 1 < ROUNDS[p.round].tasks[d.profile].length) return { ...d, parts: d.parts.map((x, i) => (i === d.pi ? { ...x, idx: x.idx + 1, step: 'ready' } : x)) }
      return { ...d, phase: 'closing' }
    })
    if (!isLive) go('home')
  }

  const resultBtns = cur && (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {LEADER.map((l) => (
        <button key={l} onClick={() => updTask((t) => ({ ...t, leader: l }))} aria-pressed={cur.leader === l} className={`px-2! py-1! text-xs! ${panelBtn} ${cur.leader === l ? 'bg-ig-ink text-white' : 'bg-white'}`}>
          {l}
        </button>
      ))}
    </div>
  )
  const correctBtns = cur && (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] text-neutral-600">antwoord:</span>
      {CORRECT.map((c) => (
        <button key={c} onClick={() => updTask((t) => ({ ...t, correct: c }))} aria-pressed={cur.correct === c} className={`px-2! py-1! text-xs! ${panelBtn} ${cur.correct === c ? 'bg-ig-ink text-white' : 'bg-white'}`}>
          {c}
        </button>
      ))}
    </div>
  )
  const leaderBox = leader && cur && (
    <div className="mt-3 border-t-2 border-dashed border-ig-ink/40 pt-3">
      <p className="font-mono text-[11px] uppercase tracking-wide text-neutral-600">testleider · {tasks[part!.idx]?.codes.join(', ')}</p>
      <p className="mt-1 text-xs leading-snug"><span className="font-semibold">verwacht: </span>{tasks[part!.idx]?.expect}</p>
      {resultBtns}
      {correctBtns}
      <p className="mt-2 text-[11px] leading-snug text-neutral-600">neutraal doorvragen: {PROBES.join(' · ')}{cur.leader && cur.leader !== 'zelf gelukt' ? ` · achteraf: ${RETRO}` : ''}</p>
      <textarea value={cur.notes} onChange={(e) => updTask((t) => ({ ...t, notes: e.target.value }))} rows={2} placeholder="notities" aria-label="Notities testleider" className={`${field} mt-2 text-sm!`} />
    </div>
  )
  const toastEl = toast && (
    <div data-test-ui role="status" className="fixed left-1/2 top-4 z-[80] -translate-x-1/2 border-2 border-ig-ink bg-ig-yellow px-4 py-2 text-sm font-bold">
      {toast}
    </div>
  )

  /* ---------- start screen (test leader) ---------- */
  if (s.phase === 'start') {
    const ok = !!s.nr.trim() && s.profile >= 0 && !!s.known && !!s.rec && !!s.quote && s.consent
    return (
      <Screen label="Startscherm gebruikerstest">
        <p className={kicker}>innergames · testleider</p>
        <h1 className="mt-3 text-4xl font-extrabold lowercase leading-none @xl:text-6xl">gebruikerstest instellen</h1>
        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            if (ok) begin()
          }}
        >
          <div className="grid gap-4 @xl:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold">deelnemer nr.</span>
              <input value={s.nr} onChange={(e) => setS({ ...s, nr: e.target.value })} inputMode="numeric" className={`${field} mt-1`} required />
              <span className="mt-1 block text-xs text-neutral-600">Nooit een naam invullen.</span>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">versie</span>
              <input value={s.version} onChange={(e) => setS({ ...s, version: e.target.value })} className={`${field} mt-1`} />
              <span className="mt-1 block text-xs text-neutral-600">v1 nu, v2 voor de hertest na aanpassingen.</span>
            </label>
          </div>
          <Choice legend="sessie" value={s.mode} onPick={(mode) => setS({ ...s, mode })} options={MODES.map((m) => ({ v: m.id, label: m.name, note: m.note }))} />
          <Choice legend="profiel" value={s.profile} onPick={(profile) => setS({ ...s, profile })} options={PROFILES.map((p, i) => ({ v: i, label: p.name }))} />
          <Choice legend="kent de deelnemer InnerGames?" value={s.known} onPick={(known) => setS({ ...s, known })} options={KNOWN.map((k) => ({ v: k as string, label: k }))} />
          <Choice legend="opname (vraag het, de deelnemer mag nee zeggen)" value={s.rec} onPick={(rec) => setS({ ...s, rec })} options={REC.map((k) => ({ v: k as string, label: k }))} />
          <Choice legend="anoniem citeren in mijn verslag" value={s.quote} onPick={(quote) => setS({ ...s, quote })} options={QUOTE.map((k) => ({ v: k as string, label: k }))} />
          <Choice legend="apparaat" value={s.device} onPick={(device) => setS({ ...s, device })} options={[{ v: 'desktop' as const, label: 'desktop' }, { v: 'mobiel' as const, label: 'mobiel', note: setMobile ? 'Zet de weergave op mobiel 390.' : 'Zet zelf "mobiel 390" aan in de balk onderaan.' }]} />
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={s.pilot} onChange={(e) => setS({ ...s, pilot: e.target.checked })} className="h-5 w-5 accent-current" />
              <span>pilot (telt niet mee)</span>
            </label>
            <label className="flex items-center gap-3 font-semibold">
              <input type="checkbox" checked={s.consent} onChange={(e) => setS({ ...s, consent: e.target.checked })} className="h-5 w-5 accent-current" />
              <span>toestemmingsformulier getekend</span>
            </label>
          </div>
          <button type="submit" disabled={!ok} className={`${panelBtn} bg-ig-orange px-6! py-3! text-base! disabled:opacity-40`}>
            start
          </button>
          {!s.consent && <p className="text-sm">Start werkt pas als het toestemmingsformulier getekend is.</p>}
          <p className="text-xs text-neutral-600">Resultaten blijven in deze browser. Na elke deelnemer wordt automatisch een JSON-bestand gedownload.</p>
        </form>
        {allSessions().length > 0 && (
          <div className="mt-10 border-t-2 border-ig-ink pt-4">
            <p className="text-sm">{allSessions().length} opgeslagen sessie(s) in deze browser.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button className={`${panelBtn} bg-white`} onClick={() => download('innergames-test-alle-resultaten.csv', csv(allSessions()), 'text/csv;charset=utf-8')}>
                download alle resultaten (.csv)
              </button>
              {leader && (
                <button
                  className={`${panelBtn} bg-white`}
                  onClick={() => {
                    if (window.confirm('Alle testresultaten in deze browser wissen?') && window.confirm('Echt zeker? Dit kan niet ongedaan worden.')) {
                      try {
                        Object.keys(localStorage).filter((k) => k.startsWith(KEY)).forEach((k) => localStorage.removeItem(k))
                      } catch {
                        /* storage blocked */
                      }
                      setS(fresh())
                    }
                  }}
                >
                  alles wissen
                </button>
              )}
            </div>
          </div>
        )}
      </Screen>
    )
  }

  /* ---------- participant intro ---------- */
  if (s.phase === 'intro')
    return (
      <Screen label="Uitleg voor de deelnemer">
        <p className={kicker}>gebruikerstest innergames website</p>
        <h2 className="mt-3 text-3xl font-extrabold lowercase leading-tight">welkom, en bedankt</h2>
        <p className="mt-5 text-lg leading-snug">
          Je test een vroege versie van een website. Je kunt niets fout doen, ik test de website, niet jou. Zeg hardop wat je ziet, denkt en verwacht. Ik help je niet tijdens de taken, dat hoort bij de test.
        </p>
        {s.mode === 'r0' && <p className="mt-4 text-lg leading-snug">Je gebruikt in deze test de huidige website van InnerGames.</p>}
        <div className="mt-5 border-2 border-dashed border-ig-ink/50 bg-white p-4 text-sm">
          <p className="font-mono text-[11px] uppercase tracking-wide text-neutral-600">testleider</p>
          {s.rec.startsWith('nee') ? (
            <p className="mt-1">Geen opname. Maak extra notities van wat de deelnemer zegt.</p>
          ) : (
            <p className="mt-1">Start nu de opname ({s.rec}), bijvoorbeeld met Teams, OBS of QuickTime. Zeg hardop: deelnemer {s.nr}, {s.date}. Stop de opname na de laatste vraag.</p>
          )}
        </div>
        <button onClick={() => { go('home'); upd((d) => enterPart(d, 0)) }} className={`${panelBtn} mt-6 bg-ig-orange px-6! py-3!`}>
          ik ben er klaar voor
        </button>
      </Screen>
    )

  /* ---------- warm-up (before the participant sees the site) ---------- */
  if (s.phase === 'warmup')
    return (
      <Screen label="Opwarmvragen">
        <p className={kicker}>testleider · opwarmvragen · {prof?.name}</p>
        <h2 className="mt-3 text-3xl font-extrabold lowercase leading-tight">eerst even praten</h2>
        <p className="mt-2 text-sm text-neutral-600">Stel deze vragen voordat de deelnemer de site ziet. Vraag naar de laatste echte keer, niet naar "meestal". Geen voorbeeld? Vraag hoe ze het zouden doen en schrijf "hypothetisch" erbij.</p>
        <div className="mt-6 space-y-5">
          {prof?.warm.map((w, i) => (
            <label key={w} className="block">
              <span className="font-semibold">{w}</span>
              <textarea value={s.warmNotes[i] ?? ''} onChange={(e) => upd((d) => { const n = [...d.warmNotes]; n[i] = e.target.value; return { ...d, warmNotes: n } })} rows={2} className={`${field} mt-1`} />
            </label>
          ))}
        </div>
        <button
          onClick={() => {
            go('home')
            upd((d) => ({ ...d, warmDone: true, phase: d.parts[d.pi].impression ? 'impression' : 'tasks' }))
          }}
          className={`${panelBtn} mt-6 bg-ig-orange px-6! py-3!`}
        >
          verder
        </button>
      </Screen>
    )

  /* ---------- five-second test ---------- */
  if (s.phase === 'impression' && part && r?.impression)
    return part.covered ? (
      <Screen label="Eerste indruk">
        <p className={kicker}>{r.name} · eerste indruk</p>
        <div className="mt-4 space-y-6">
          {r.impression.map((q, i) => (
            <label key={q.q} className="block">
              <span className="block text-2xl font-extrabold leading-tight">{q.q}</span>
              <textarea
                value={part.impressionAns[i] ?? ''}
                onChange={(e) => updPart((p) => { const a = [...p.impressionAns]; a[i] = e.target.value; return { ...p, impressionAns: a } })}
                rows={3}
                autoFocus={i === 0}
                className={`${field} mt-2`}
              />
            </label>
          ))}
        </div>
        <button onClick={() => (part.only ? nextPart() : upd((d) => ({ ...d, phase: part.round === 1 && r.menu ? 'menu' : 'tasks' })))} className={`${panelBtn} mt-4 bg-ig-orange px-6! py-3!`}>
          verder
        </button>
        {leader && <p className="mt-4 font-mono text-[11px] uppercase text-neutral-600">testleider · {r.impression[0].code} · five-second test</p>}
      </Screen>
    ) : (
      <div data-test-ui role="status" className="fixed left-1/2 top-4 z-[60] -translate-x-1/2 border-2 border-ig-ink bg-ig-yellow px-4 py-2 text-sm font-bold">
        kijk 5 seconden naar deze pagina…
      </div>
    )

  /* ---------- menu expectation test (round 1, before the tasks) ---------- */
  if (s.phase === 'menu' && part && r?.menu)
    return (
      <Screen label="Wat verwacht je">
        <p className={kicker}>{r.name} · voordat je begint</p>
        <h2 className="mt-3 text-3xl font-extrabold lowercase leading-tight">wat verwacht je te vinden achter deze woorden?</h2>
        <p className="mt-2 text-sm text-neutral-600">Je hoeft niet te klikken. Schrijf kort op wat je denkt dat er op die pagina staat.</p>
        <div className="mt-6 space-y-5">
          {r.menu.map((m, i) => (
            <label key={m} className="block">
              <span className="inline-block border-2 border-ig-ink bg-white px-3 py-1 font-semibold">{m}</span>
              <textarea
                value={part.menuAns[i] ?? ''}
                onChange={(e) => updPart((p) => { const a = [...p.menuAns]; a[i] = e.target.value; return { ...p, menuAns: a } })}
                rows={2}
                className={`${field} mt-2`}
              />
            </label>
          ))}
        </div>
        <button onClick={() => { go('home'); upd((d) => ({ ...d, phase: 'tasks' })) }} className={`${panelBtn} mt-6 bg-ig-orange px-6! py-3!`}>
          verder naar de taken
        </button>
        {leader && <p className="mt-4 font-mono text-[11px] uppercase text-neutral-600">testleider · D2 · verwachtingstest menu</p>}
      </Screen>
    )

  /* ---------- closing questions, one at a time, fixed order ---------- */
  if (s.phase === 'closing' && part) {
    const qs = closingQs(part, s.profile)
    const q = qs[part.qi]
    const a = part.answers[q.id]
    const last = part.qi + 1 >= qs.length
    return (
      <Screen label="Afsluitende vragen">
        <p className={kicker}>
          {r?.name} · vraag {part.qi + 1} van {qs.length}
        </p>
        <h2 className="mt-3 text-2xl font-extrabold leading-tight">{q.q}</h2>
        <div className="mt-5">
          <QInput key={q.id} q={q} a={a} set={(v) => setAns(q.id, v)} words={s.words} />
        </div>
        <div className="mt-6 flex gap-2">
          {part.qi > 0 && (
            <button onClick={() => updPart((p) => ({ ...p, qi: p.qi - 1 }))} className={`${panelBtn} bg-white`}>
              terug
            </button>
          )}
          <button onClick={() => (last ? nextPart() : updPart((p) => ({ ...p, qi: p.qi + 1 })))} className={`${panelBtn} bg-ig-orange px-6!`}>
            {last ? 'afronden' : 'volgende'}
          </button>
        </div>
        {leader && q.code && <p className="mt-4 font-mono text-[11px] uppercase text-neutral-600">testleider · {q.code}</p>}
      </Screen>
    )
  }

  /* ---------- results ---------- */
  if (s.phase === 'results')
    return (
      <Screen label="Resultaten">
        <p className={kicker}>bedankt voor het meedoen!</p>
        <h2 className="mt-3 text-3xl font-extrabold lowercase leading-tight">resultaten deelnemer {s.nr}</h2>
        <p className="mt-2 text-sm">
          {modeName(s.mode)} · {prof?.name} · {s.device} · {s.version}
          {s.pilot ? ' · pilot' : ''}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={`${panelBtn} bg-ig-orange`}
            onClick={async () => {
              const txt = report(s)
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
          <button className={`${panelBtn} bg-white`} onClick={() => download(`innergames-test-${s.nr}-${s.mode}-${s.version}.json`, JSON.stringify(s, null, 2), 'application/json')}>
            download deze deelnemer (.json)
          </button>
          <button className={`${panelBtn} bg-white`} onClick={() => download('innergames-test-alle-resultaten.csv', csv(allSessions()), 'text/csv;charset=utf-8')}>
            download alle resultaten (.csv)
          </button>
          <button
            className={`${panelBtn} bg-white`}
            onClick={() => {
              try {
                localStorage.removeItem(KEY + 'current')
              } catch {
                /* storage blocked */
              }
              go('home')
              setS(fresh({ mode: s.mode, version: s.version, device: s.device }))
            }}
          >
            nieuwe deelnemer
          </button>
        </div>
        <pre className="mt-6 whitespace-pre-wrap border-2 border-ig-ink bg-white p-4 font-mono text-xs leading-relaxed">{report(s)}</pre>
      </Screen>
    )

  if (!part || !r) return null

  /* ---------- round 0: test leader screen, participant uses innergames.nl ---------- */
  if (isLive && cur) {
    const t = tasks[part.idx]
    return (
      <Screen label="Ronde 0 testleider">
        <p className={kicker}>
          {r.name} · taak {part.idx + 1} van {tasks.length} · {t.codes.join(', ')}
        </p>
        <p className="mt-2 text-sm text-neutral-600">Deelnemer werkt op innergames.nl. Lees de taak voor.</p>
        <h2 className="mt-3 text-2xl font-extrabold leading-tight">{t.text}</h2>
        {part.step === 'ready' && (
          <button onClick={() => { updTask((x) => ({ ...x, start: Date.now() })); updPart((p) => ({ ...p, step: 'running' })) }} className={`${panelBtn} mt-5 bg-ig-orange px-6! py-3!`}>
            start timer
          </button>
        )}
        {part.step === 'running' && (
          <div className="mt-5 flex gap-2">
            <button onClick={() => { updTask((x) => ({ ...x, end: Date.now() })); updPart((p) => ({ ...p, step: 'after' })) }} className={`${panelBtn} bg-ig-ink px-6! py-3! text-white`}>
              stop: klaar
            </button>
            <button onClick={() => { updTask((x) => ({ ...x, end: Date.now(), stuck: true })); updPart((p) => ({ ...p, step: 'after' })) }} className={`${panelBtn} bg-white`}>
              komt er niet uit
            </button>
          </div>
        )}
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold">eerste klik</span>
            <input value={cur.first ?? ''} onChange={(e) => updTask((x) => ({ ...x, first: e.target.value }))} className={`${field} mt-1`} />
          </label>
          <div className="border-2 border-dashed border-ig-ink/40 bg-white p-3 text-sm">
            <span className="font-semibold">verwacht: </span>{t.expect}
          </div>
          <div>
            <span className="text-sm font-semibold">resultaat</span>
            {resultBtns}
            {correctBtns}
          </div>
          <label className="block">
            <span className="text-sm font-semibold">notities</span>
            <textarea value={cur.notes} onChange={(e) => updTask((x) => ({ ...x, notes: e.target.value }))} rows={3} className={`${field} mt-1`} />
          </label>
          {part.step === 'after' && (t.ask ?? []).length > 0 && (
            <div className="space-y-3 border-2 border-ig-ink bg-white p-3">
              <p className="text-sm font-semibold">Antwoord van de deelnemer (jij vult in):</p>
              {(t.ask ?? []).map((q) => (
                <div key={q.id}>
                  <p className="text-sm font-semibold">{q.q}</p>
                  <div className="mt-1">
                    <QInput compact q={q} a={cur.ans?.[q.id]} set={(v) => setTaskAns(q.id, v)} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {part.step === 'after' && (
            <div>
              <p className="font-semibold">Vraag aan de deelnemer: hoe makkelijk of moeilijk was deze taak?</p>
              <div className="mt-2">
                <Scale value={cur.score} low="1 = heel moeilijk" high="7 = heel makkelijk" onPick={(n) => updTask((x) => ({ ...x, score: n }))} />
              </div>
              <button disabled={!cur.score} onClick={afterTask} className={`${panelBtn} mt-4 bg-ig-orange px-6! disabled:opacity-40`}>
                volgende
              </button>
            </div>
          )}
        </div>
      </Screen>
    )
  }

  /* ---------- task panel (rounds 1 and 2) ---------- */
  const finish = (stuck = false) => {
    updTask((t) => ({ ...t, end: Date.now(), stuck }))
    updPart((p) => ({ ...p, step: tasks[p.idx]?.ask?.length ? 'answer' : 'after' }))
  }
  return (
    <>
      {toastEl}
      <aside data-test-ui className="fixed inset-x-2 bottom-20 z-50 max-h-[70vh] overflow-y-auto border-2 border-ig-ink bg-white p-4 text-ig-ink shadow-[6px_6px_0_#1f1a17] sm:inset-x-auto sm:right-4 sm:w-[19rem]" aria-label="Testtaak">
        <p className="font-mono text-[11px] uppercase tracking-wide text-neutral-600">{r.name}</p>
        <button onClick={() => setCollapsed(!collapsed)} aria-expanded={!collapsed} className="mt-1 flex w-full items-center justify-between text-left text-sm font-semibold">
          <span>
            taak {part.idx + 1} van {tasks.length}
            {part.step === 'running' ? ' · bezig' : ''}
          </span>
          <span aria-hidden>{collapsed ? '+' : '–'}</span>
        </button>
        {!collapsed && (
          <div className="mt-3">
            {part.step === 'answer' ? (
              <>
                <p className="text-[13px] leading-snug text-neutral-600">{tasks[part.idx]?.text}</p>
                {(tasks[part.idx]?.ask ?? []).map((q) => (
                  <div key={q.id} className="mt-3">
                    <p className="text-sm font-semibold leading-snug">{q.q}</p>
                    <div className="mt-1">
                      <QInput compact q={q} a={cur?.ans?.[q.id]} set={(v) => setTaskAns(q.id, v)} />
                    </div>
                  </div>
                ))}
                <button onClick={() => (r.after === 'seq' && !tasks[part.idx]?.noSeq ? updPart((p) => ({ ...p, step: 'after' })) : afterTask())} className={`${panelBtn} mt-3 w-full bg-ig-orange`}>
                  verder
                </button>
              </>
            ) : part.step === 'after' ? (
              r.after === 'seq' && !tasks[part.idx]?.noSeq ? (
                <>
                  <p className="text-sm font-semibold">Hoe makkelijk of moeilijk was deze taak?</p>
                  <div className="mt-2">
                    <Scale value={cur?.score} low="1 = heel moeilijk" high="7 = heel makkelijk" onPick={(n) => { updTask((t) => ({ ...t, score: n })); afterTask() }} />
                  </div>
                </>
              ) : (
                <button onClick={afterTask} className={`${panelBtn} mt-2 w-full bg-ig-orange`}>
                  volgende
                </button>
              )
            ) : (
              <>
                <p className="text-[15px] leading-snug">{tasks[part.idx]?.text}</p>
                {part.step === 'ready' ? (
                  <button onClick={() => { updTask((t) => ({ ...t, start: Date.now(), pages: [], clicks: 0, first: undefined })); updPart((p) => ({ ...p, step: 'running' })) }} className={`${panelBtn} mt-3 w-full bg-ig-orange`}>
                    start
                  </button>
                ) : (
                  <>
                    <button onClick={() => finish()} className={`${panelBtn} mt-3 w-full bg-ig-ink text-white`}>
                      ik ben klaar
                    </button>
                    <button onClick={() => finish(true)} className="mt-2 w-full text-center text-xs underline underline-offset-2">
                      ik kom er niet uit
                    </button>
                  </>
                )}
              </>
            )}
            {leaderBox}
          </div>
        )}
      </aside>
    </>
  )
}
