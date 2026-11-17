import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { PageId } from './wf'
import { fit, startTracking, summarize, type Extra, type Mouse, type TEv } from './tracking'

// the remote test (v6): a participant does it alone, from a link Ariën sends.
//   /?test=klant  for clients, /?test=nieuw  for new visitors (add &demo=1 for the "stuur testmail" button)
// no test leader, no rounds, no participant numbers. the session is saved in localStorage (a reload
// continues), and sent to Damian's email through /api/submit when it's done (or, unfinished, when the
// tab closes). the leader mode in test.tsx is separate and stays as it was.
// the event log: pages, scroll depth per page, form submits, task start/done/stuck. clicks, hovers and the
// mouse path come from src/tracking.ts. never what was typed. no video.

export type Group = 'klant' | 'nieuw'

// ?test= is only in the url of the first page (go() pushes clean urls), so it's read once at startup and
// the running session is kept under one key. a reload on /workshops continues the test. the key goes
// away on the end screen, so after that the site is normal again and a new ?test= link starts over
const POINTER = 'ig:participant'
type Start = { group: Group; id?: string; demo: boolean }
let start: Start | null | undefined
function readStart(): Start | null {
  const q = new URLSearchParams(location.search)
  if (q.get('replay') === '1') return null // the replay never touches a real test session (ig:participant)
  const t = q.get('test')
  let saved: { id?: string; group?: string } | null = null
  try {
    saved = JSON.parse(localStorage.getItem(POINTER) || 'null')
  } catch {
    /* no access */
  }
  // the link again: an unfinished session of the same group continues, otherwise a new one
  if (t === 'klant' || t === 'nieuw') return { group: t, id: saved?.group === t ? saved.id : undefined, demo: q.get('demo') === '1' }
  return saved?.id && (saved.group === 'klant' || saved.group === 'nieuw') ? { group: saved.group, id: saved.id, demo: false } : null
}
const startOf = () => (start === undefined ? (start = readStart()) : start)
export const testGroup = (): Group | null => startOf()?.group ?? null

// shown on the end screen when sending didn't work
const MAIL_TO_DISPLAY = '524795@student.fontys.nl'
const KEY = 'ig-p6:' // ig-p6:<id> the session
const MOUSE_KEY = 'ig-p6m:' // ig-p6m:<id> its mouse path (apart, it changes 4 times a second)
const MAX_EVENTS = 3000
const MAX_BODY = 1_000_000 // the mail body, 1 MB
const MAX_BEACON = 60_000 // sendBeacon stops at 64 KB
const LOOK_SECONDS = 10
const ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I
const RETRY = [1000, 3000, 9000]

type Profile = 'school' | 'organisatie' | 'trainer' | 'anders'
type TaskId = 't1' | 't2' | 't3' | 't4'
type Status = 'bezig' | 'compleet' | 'onvolledig'
type Ev = TEv & { task?: TaskId; from?: string; to?: string } // from/to: the screens of a "vorige"
type TaskRes = { start?: number; end?: number; result?: 'klaar' | 'vast' }

type Session = {
  v: 6
  id: string
  group: Group
  status: Status
  step: number
  started: number
  ended?: number
  consentAt?: number
  device: { type: 'telefoon' | 'tablet' | 'desktop'; viewport: string; browser: string }
  ans: Record<string, string>
  tasks: Partial<Record<TaskId, TaskRes>>
  events: Ev[]
  sent: { compleet?: boolean; onvolledig?: boolean }
}

type Q = {
  id: string
  q: string
  kind: 'choice' | 'text' | 'line' | 'scale'
  options?: string[]
  other?: string // the option that opens a text field ("anders, namelijk:")
  required?: boolean
  showIf?: { id: string; is: string[] } // only when an earlier answer on this screen is one of these
  low?: string
  high?: string
  sum?: string // the question as it appears in the email, when the screen text is different
}
type Step =
  | { kind: 'welkom' }
  | { kind: 'ask'; id: string; intro?: string; qs: Q[]; solid?: boolean }
  | { kind: 'linkedin' }
  | { kind: 'look' }
  | { kind: 'task'; id: TaskId; text: string }
  | { kind: 'view'; text: string; page: PageId }
  | { kind: 'end' }

/* ---------- the texts (docs/CLAUDE_CODE_TEST_MODE_V6.md, section 3) ---------- */

const WELKOM = 'Fijn dat u meedoet. U helpt InnerGames om hun nieuwe website beter te maken. Dit duurt ongeveer 20 minuten. U test de website, niet uzelf. Er zijn geen foute antwoorden. Er wordt niets verkocht en niets echt verstuurd.'
const CONSENT = "Uw antwoorden worden zonder naam bewaard. Ze worden alleen gebruikt om de website te verbeteren en voor het stageverslag van Damian bij Fontys. We slaan ook op welke pagina's u bekijkt, waar u klikt en hoe u de muis beweegt. Er wordt geen video of beeld van uw scherm opgenomen. Wat u typt in de website zelf slaan we niet op. Alles wordt uiterlijk 31 januari 2027 verwijderd. U kunt altijd stoppen."

const WORK: [string, Profile][] = [
  ['op een school of opleiding (mbo of hbo)', 'school'],
  ['bij een bedrijf of organisatie', 'organisatie'],
  ['ik ben zelf trainer of coach', 'trainer'],
  ['iets anders, namelijk:', 'anders'],
]
const EASE = ['heel moeilijk', 'moeilijk', 'gaat wel', 'makkelijk', 'heel makkelijk']
const AGREE = ['helemaal mee oneens', 'oneens', 'neutraal', 'eens', 'helemaal mee eens']
const text = (id: string, q: string, required = false): Q => ({ id, q, kind: 'text', required })
const choice = (id: string, q: string, options: string[], other?: string): Q => ({ id, q, kind: 'choice', options, other })

const TASK_TITLE: Record<TaskId, string> = { t1: 'een workshop vinden', t2: 'de prijs', t3: 'een datum vragen', t4: 'het spel' }
const task1 = (p?: Profile) =>
  p === 'school'
    ? 'U wilt met uw studenten iets doen tijdens een projectweek. Zoek op de website een workshop die daarbij past.'
    : p === 'trainer'
      ? 'U wilt zelf leren werken met de spellen van InnerGames. Zoek op wat daarvoor nodig is.'
      : 'U zoekt een workshop over samenwerken voor uw team van 12 mensen. Zoek er een die past.'

function buildSteps(group: Group, profile?: Profile): Step[] {
  const trainer = profile === 'trainer'
  const start: Step[] = [
    { kind: 'welkom' },
    { kind: 'ask', id: 'werk', qs: [{ ...choice('werk', 'Waar werkt u?', WORK.map((w) => w[0]), 'iets anders, namelijk:'), required: true }] },
  ]
  const klant: Step[] = [
    { kind: 'ask', id: 'A1', qs: [choice('A1', 'Hoe kwam u voor het eerst bij InnerGames terecht?', ['via Ariën op LinkedIn', 'iemand raadde het aan', 'via Google', 'op een evenement of beurs', 'anders, namelijk:'], 'anders, namelijk:')] },
    { kind: 'ask', id: 'A2', qs: [choice('A2', 'Heeft u de website van InnerGames bekeken voordat u contact opnam?', ['ja', 'nee', 'weet ik niet meer']), { ...text('A2_zocht', 'Wat zocht u daar?'), showIf: { id: 'A2', is: ['ja'] } }] },
    { kind: 'ask', id: 'A3', qs: [choice('A3', 'Hoe nam u contact op?', ['bericht op LinkedIn', 'e-mail', 'telefoon of WhatsApp', 'formulier op de website', 'anders'])] },
    { kind: 'ask', id: 'A4', qs: [text('A4', 'Wat gaf de doorslag om met InnerGames te werken?')] },
    { kind: 'ask', id: 'A5', qs: [text('A5', 'Was er iets waardoor u twijfelde?')] },
  ]
  const nieuw: Step[] = [
    { kind: 'ask', id: 'B1', qs: [choice('B1', 'Kent u InnerGames?', ['nee', 'alleen van naam', 'ja, ik heb er al mee gewerkt'])] },
    { kind: 'linkedin' },
    { kind: 'look' },
    { kind: 'ask', id: 'B3', solid: true, qs: [text('B3_wat', 'Wat doet dit bedrijf, in uw eigen woorden?', true), text('B3_wie', 'Voor wie is het?')] },
  ]
  const tasks: Step[] = [
    { kind: 'task', id: 't1', text: task1(profile) },
    { kind: 'ask', id: 't1', qs: [text('1a', trainer ? 'Wat heeft u gevonden?' : 'Welke workshop heeft u gekozen?'), choice('1b', 'Hoe makkelijk was dit?', EASE)] },
    { kind: 'task', id: 't2', text: trainer ? 'Zoek uit wat dat kost.' : 'Zoek uit wat de workshop kost die u net koos.' },
    { kind: 'ask', id: 't2', intro: 'Wat kost het, en voor hoeveel mensen is dat?', qs: [{ id: '2_prijs', q: 'Prijs', kind: 'line', sum: 'Wat kost het? (prijs)' }, { id: '2_mensen', q: 'Aantal mensen', kind: 'line', sum: 'Voor hoeveel mensen is dat?' }] },
    { kind: 'task', id: 't3', text: 'U wilt in maart een datum vastleggen. Ga zo ver als u zou gaan om dat te regelen. Er wordt niets echt verstuurd.' },
    { kind: 'ask', id: 't3', qs: [choice('3', 'Hoe ging dat?', ['gelukt', 'ik liep vast', 'ik zou liever bellen of mailen'])] },
    { kind: 'task', id: 't4', text: 'U hoort dat u een spel van InnerGames online kunt uitproberen. Zoek het en probeer het een paar minuten.' },
    { kind: 'ask', id: 't4', qs: [choice('4a', 'Heeft u het spel gevonden?', ['ja, meteen', 'ja, na wat zoeken', 'nee']), choice('4c', 'Hielp het spel u om te begrijpen wat InnerGames doet?', ['ja', 'een beetje', 'nee', 'ik heb het niet gespeeld']), choice('4b', 'Wat zou u hierna doen?', ['meer lezen over het spel', 'het spel kopen', 'een workshop aanvragen', 'niets', 'anders:'], 'anders:')] },
    { kind: 'view', text: 'Bekijk het aanvraagformulier op deze pagina. Druk daarna op Verder.', page: 'contact' },
    { kind: 'ask', id: 'C1', qs: [choice('C1', 'Bekijk het aanvraagformulier. Zou u dit invullen, of neemt u liever direct contact op?', ['ik vul het formulier in', 'ik mail Ariën', 'ik bel of app', 'ik stuur een bericht op LinkedIn']), text('C1_waarom', 'Waarom?')] },
  ]
  const trust: Step[] = [
    { kind: 'ask', id: 'C2', qs: [choice('C2', 'Weet u wie er achter InnerGames zit?', ['ja, namelijk:', 'nee'], 'ja, namelijk:')] },
    { kind: 'ask', id: 'C3', qs: [choice('C3', 'Zou u InnerGames inhuren op basis van deze website?', ['ja', 'misschien', 'nee']), text('C3_hielp', 'Wat hielp daarbij?'), text('C3_tegen', 'Wat hield u tegen?')] },
  ]
  const closing: Step[] = [
    { kind: 'ask', id: 'E12', qs: [choice('E1', 'Deze website doet wat ik nodig heb.', AGREE), choice('E2', 'Deze website is makkelijk te gebruiken.', AGREE)] },
    {
      kind: 'ask',
      id: 'E3',
      intro: 'Hoe komt de website op u over?',
      qs: [
        { id: 'E3_prof', q: '', kind: 'scale', low: 'amateuristisch', high: 'professioneel', sum: 'Hoe komt de website op u over? (1 amateuristisch, 5 professioneel)' },
        { id: 'E3_speels', q: '', kind: 'scale', low: 'saai', high: 'speels', sum: 'Hoe komt de website op u over? (1 saai, 5 speels)' },
      ],
    },
    { kind: 'ask', id: 'E4', qs: [text('E4', 'Wat mist u nog op de website?')] },
  ]
  const e5: Step[] = [{ kind: 'ask', id: 'E5', qs: [choice('E5', 'Vergeleken met wat u eerder van InnerGames zag, vindt u deze website', ['beter', 'even goed', 'slechter', 'weet ik niet']), text('E5_waarom', 'Waarom?')] }]
  return [...start, ...(group === 'klant' ? klant : nieuw), ...tasks, ...(group === 'nieuw' ? trust : []), ...closing, ...(group === 'klant' ? e5 : []), { kind: 'end' }]
}

// "workshop/samenwerken" → the page and the sel of go(page, sel), so the replay can open the same page
const pageOf = (key: string) => {
  const i = key.indexOf('/')
  return i < 0 ? { page: key, sel: '' } : { page: key.slice(0, i), sel: key.slice(i + 1) }
}

const profileOf = (ans: Record<string, string>): Profile | undefined => WORK.find((w) => w[0] === ans.werk)?.[1]

/* ---------- session: create, save, load ---------- */

const newId = () => 'P-' + Array.from(crypto.getRandomValues(new Uint8Array(4)), (n) => ID_CHARS[n % ID_CHARS.length]).join('')
function device(): Session['device'] {
  const w = window.innerWidth
  const ua = navigator.userAgent
  const browser = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'anders'
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad|Macintosh.*Mobile/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'Mac' : 'anders'
  return { type: w < 640 ? 'telefoon' : w < 1024 ? 'tablet' : 'desktop', viewport: `${w}x${window.innerHeight}`, browser: `${browser} op ${os}` }
}
const fresh = (group: Group): Session => ({ v: 6, id: newId(), group, status: 'bezig', step: 0, started: Date.now(), device: device(), ans: {}, tasks: {}, events: [], sent: {} })
// saved only after the consent box: someone who never starts leaves nothing behind
const save = (s: Session) => {
  if (!s.consentAt) return
  try {
    localStorage.setItem(KEY + s.id, JSON.stringify(s))
    if (s.status === 'bezig') localStorage.setItem(POINTER, JSON.stringify({ id: s.id, group: s.group }))
    else localStorage.removeItem(POINTER)
  } catch {
    /* private window: the session only lives in memory */
  }
}
const saveMouse = (id: string, m: Mouse) => {
  try {
    localStorage.setItem(MOUSE_KEY + id, JSON.stringify(m))
  } catch {
    /* full or no access: the path stays in memory */
  }
}
const loadMouse = (id: string): Mouse => {
  try {
    return JSON.parse(localStorage.getItem(MOUSE_KEY + id) || '{}') as Mouse
  } catch {
    return {}
  }
}
function load(group: Group): Session {
  try {
    const id = startOf()?.id
    const s = id && (JSON.parse(localStorage.getItem(KEY + id) || 'null') as Session | null)
    if (s && s.v === 6 && s.group === group && s.status === 'bezig') return s
  } catch {
    /* nothing saved, or no access */
  }
  return fresh(group)
}

/* ---------- what is sent: the answers with their questions, and per task the numbers ---------- */

function answersOf(s: Session) {
  const profile = profileOf(s.ans)
  const out: { id: string; q: string; a: string }[] = []
  for (const st of buildSteps(s.group, profile)) {
    if (st.kind !== 'ask') continue
    for (const q of st.qs) {
      if (q.showIf && !q.showIf.is.includes(s.ans[q.showIf.id] ?? '')) continue
      const extra = q.other && s.ans[q.id] === q.other ? s.ans[q.id + '_tekst'] : ''
      const a = q.kind === 'scale' && s.ans[q.id] ? `${s.ans[q.id]} van 5` : [s.ans[q.id], extra].filter(Boolean).join(' ')
      out.push({ id: q.id, q: q.sum ?? (st.intro && !q.q ? st.intro : q.q), a: a || '' })
    }
  }
  return out
}

function taskStats(s: Session, mouse: Mouse) {
  const profile = profileOf(s.ans)
  const steps = buildSteps(s.group, profile)
  return (['t1', 't2', 't3', 't4'] as TaskId[]).map((id) => {
    const r = s.tasks[id] ?? {}
    const ev = s.events.filter((e) => e.task === id)
    const pages = ev.filter((e) => e.type === 'page').map((e) => e.detail)
    const stat: Record<string, unknown> = {
      id,
      title: TASK_TITLE[id],
      text: (steps.find((st) => st.kind === 'task' && st.id === id) as { text: string } | undefined)?.text ?? '',
      seconds: r.start && r.end ? Math.round((r.end - r.start) / 1000) : null,
      result: r.result ?? 'niet gedaan',
      stuck: r.result === 'vast',
      pages,
      clicks: ev.filter((e) => e.type === 'click' || e.type === 'tap').length,
      ...summarize(ev, mouse[id], s.device.viewport),
    }
    if (id === 't4') {
      // the game: the preview page, or the demo on the product page (e5:open). time until the next page
      let ms = 0
      let since: number | null = null
      const endT = r.end && r.start ? r.end - s.started : null
      for (const e of ev) {
        const into = (e.type === 'page' && e.detail.startsWith('preview')) || e.type === 'e5:open'
        if (e.type === 'page' && since !== null) {
          ms += e.t - since
          since = null
        }
        if (into && since === null) since = e.t
      }
      if (since !== null && endT !== null) ms += endT - since
      stat.previewOpened = ev.some((e) => (e.type === 'page' && e.detail.startsWith('preview')) || e.type === 'e5:open')
      stat.previewSeconds = Math.round(ms / 1000)
    }
    return stat
  })
}

// the body for /api/submit. under 1 MB (the beacon under 64 KB): mouse samples go first, never answers.
// the task summaries are made from the whole path, before anything is dropped
const payload = (s: Session, mouse: Mouse, status: Status | 'test', honey: string, max = MAX_BODY) => {
  const answers = answersOf(s)
  const tasks = taskStats(s, mouse)
  const build = (m: Mouse, eventsFrom: number) =>
    JSON.stringify({
      group: s.group,
      website: honey, // the honeypot: a person never fills this in
      status,
      session: {
        v: 6,
        id: s.id,
        group: s.group,
        profile: profileOf(s.ans) ?? 'onbekend',
        status,
        started: new Date(s.started).toISOString(),
        ended: s.ended ? new Date(s.ended).toISOString() : null,
        minutes: Math.round(((s.ended ?? Date.now()) - s.started) / 6000) / 10,
        step: s.step,
        back: s.events.filter((e) => e.type === 'back').length, // apart, the beacon drops the events
        device: s.device,
        viewport: { w: +s.device.viewport.split('x')[0], h: +s.device.viewport.split('x')[1] },
        answers,
        tasks: eventsFrom === Infinity ? tasks.map((t) => ({ ...t, pages: (t.pages as string[]).slice(-20) })) : tasks,
        events: eventsFrom === Infinity ? [] : eventsFrom ? s.events.slice(eventsFrom) : s.events,
        mouse: m,
      },
    })
  return fit(build, mouse, max)
}

async function post(body: string) {
  for (let i = 0; i <= RETRY.length; i++) {
    try {
      const r = await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
      if (r.ok) return true
      if (r.status === 400) return false // the same body will never pass
    } catch {
      /* offline or blocked: try again */
    }
    if (i < RETRY.length) await new Promise((res) => setTimeout(res, RETRY[i]))
  }
  return false
}

// sessions that were finished on an earlier visit but never arrived. once per page load
let retried = false
const sending = new Set<string>() // a session that is being sent right now is never sent twice
async function retryOld(skip: string) {
  if (retried) return
  retried = true
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k?.startsWith(KEY) || k === KEY + skip) continue
    try {
      const s = JSON.parse(localStorage.getItem(k) || 'null') as Session | null
      if (!s || s.v !== 6 || s.status !== 'compleet' || s.sent.compleet || sending.has(s.id)) continue
      sending.add(s.id)
      if (await post(payload(s, loadMouse(s.id), 'compleet', ''))) save({ ...s, sent: { ...s.sent, compleet: true } })
    } catch {
      /* broken entry: leave it */
    }
  }
}

/* ---------- the pieces of the screens ---------- */

const big = 'min-h-12 rounded-box px-5 py-3 text-[18px] font-semibold transition-colors'
const primary = `${big} bg-ig-ink text-ig-cream hover:bg-ig-ink/85 disabled:opacity-40`
const secondary = `${big} border-[1.5px] border-ig-ink/40 bg-white text-ig-ink hover:bg-ig-cream`
const field = 'mt-2 w-full rounded-box border-[1.5px] border-ig-ink/25 bg-white px-4 py-3 text-[18px] text-ig-ink outline-none focus:border-ig-orange'

function Card({ children, solid, label }: { children: ReactNode; solid?: boolean; label: string }) {
  return (
    <div data-participant role="dialog" aria-modal="true" aria-label={label} className={`fixed inset-0 z-[95] overflow-y-auto p-4 ${solid ? 'bg-ig-cream' : 'bg-ig-ink/55'}`}>
      <div className="flex min-h-full items-center justify-center">
        <div className="w-full max-w-xl rounded-box bg-white p-6 text-[18px] leading-relaxed text-ig-ink shadow-lift sm:p-8">{children}</div>
      </div>
    </div>
  )
}

function Choice({ q, value, other, onPick, onOther }: { q: Q; value?: string; other?: string; onPick: (v: string) => void; onOther: (v: string) => void }) {
  return (
    <fieldset className="mt-6 first:mt-0">
      <legend className="text-[20px] font-semibold leading-snug">{q.q}{q.required && <span className="sr-only"> (verplicht)</span>}</legend>
      <div className="mt-3 grid gap-2">
        {q.options!.map((o) => (
          <button key={o} type="button" aria-pressed={value === o} onClick={() => onPick(o)} className={`${big} border-[1.5px] text-left ${value === o ? 'border-ig-ink bg-ig-ink text-ig-cream' : 'border-ig-ink/25 bg-white hover:border-ig-ink/60'}`}>
            {o}
          </button>
        ))}
      </div>
      {q.other && value === q.other && <input aria-label={q.other} value={other ?? ''} onChange={(e) => onOther(e.target.value)} className={field} autoFocus />}
    </fieldset>
  )
}

function Scale({ q, value, onPick }: { q: Q; value?: string; onPick: (v: string) => void }) {
  return (
    <fieldset className="mt-6 first:mt-0">
      <legend className="sr-only">{`${q.low} tot ${q.high}`}</legend>
      <div className="grid grid-cols-5 gap-2">
        {['1', '2', '3', '4', '5'].map((n) => (
          <button key={n} type="button" aria-pressed={value === n} aria-label={`${n} van 5`} onClick={() => onPick(n)} className={`${big} border-[1.5px] px-0! text-center ${value === n ? 'border-ig-ink bg-ig-ink text-ig-cream' : 'border-ig-ink/25 bg-white hover:border-ig-ink/60'}`}>
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[16px] text-ig-ink/75">
        <span>{q.low}</span>
        <span>{q.high}</span>
      </div>
    </fieldset>
  )
}

/* ---------- the participant mode ---------- */

export default function Participant({ group, pageKey, go }: { group: Group; pageKey: string; go: (p: PageId, id?: string) => void }) {
  const [s, setS] = useState<Session>(() => load(group))
  const [consent, setConsent] = useState(() => !!s.consentAt) // back on the welcome screen it stays ticked
  const [folded, setFolded] = useState(false)
  const [left, setLeft] = useState(LOOK_SECONDS)
  const [toast, setToast] = useState(false)
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'ok' | 'failed'>('idle')
  const [phone, setPhone] = useState(() => matchMedia('(max-width: 639px)').matches)
  const honey = useRef('')
  const sRef = useRef(s)
  sRef.current = s
  const [mouse] = useState<Mouse>(() => loadMouse(s.id)) // filled in place by tracking.ts

  const profile = profileOf(s.ans)
  const steps = buildSteps(group, profile)
  const step = steps[Math.min(s.step, steps.length - 1)]
  const numbered: Step[] = steps.filter((st) => st.kind !== 'welkom' && st.kind !== 'end')
  const nr = numbered.indexOf(step) + 1
  const runningTask = step.kind === 'task' ? step.id : undefined
  const logging = !!s.consentAt && s.status === 'bezig'

  useEffect(() => save(s), [s])
  useEffect(() => {
    const m = matchMedia('(max-width: 639px)')
    const on = () => setPhone(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])

  // one event into the log, with the time since the start and the running task
  const runningRef = useRef<TaskId | undefined>(runningTask)
  runningRef.current = runningTask
  const log = (type: string, detail = '', extra?: Extra) =>
    setS((d) => (d.events.length >= MAX_EVENTS ? d : { ...d, events: [...d.events, { t: Date.now() - d.started, type, detail, ...extra, ...(runningRef.current ? { task: runningRef.current } : {}) }] }))
  const logRef = useRef(log)
  logRef.current = log

  // the height of a page, half a second after it changed (then it has rendered), into its page event.
  // the replay needs it to scroll the same way
  const measure = (key: string) =>
    setTimeout(() => {
      const h = document.documentElement.scrollHeight
      setS((d) => {
        let i = d.events.length - 1
        while (i >= 0 && !(d.events[i].type === 'page' && d.events[i].detail === key && d.events[i].h == null)) i--
        return i < 0 ? d : { ...d, events: d.events.map((e, j) => (j === i ? { ...e, h } : e)) }
      })
    }, 500)

  // pages, and the scroll depth of the page you leave
  const depth = useRef(0)
  const lastPage = useRef<string | null>(null)
  useEffect(() => {
    if (!logging) return
    if (lastPage.current !== null && lastPage.current !== pageKey) logRef.current('scroll', `${lastPage.current} ${depth.current}%`)
    if (lastPage.current !== pageKey) {
      logRef.current('page', pageKey, pageOf(pageKey))
      measure(pageKey)
    }
    lastPage.current = pageKey
    depth.current = 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, logging])
  useEffect(() => {
    if (!logging) return
    const onScroll = () => {
      const h = document.documentElement.scrollHeight
      const d = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / h) * 100))
      if (d > depth.current) depth.current = d
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [logging, pageKey])

  // clicks, taps, hovers, rage and dead clicks, the mouse path: all in tracking.ts
  useEffect(() => {
    if (!logging) return
    const stop = startTracking({
      log: (type, detail, extra) => logRef.current(type, detail, extra),
      task: () => runningRef.current,
      taskStart: () => (runningRef.current ? sRef.current.tasks[runningRef.current]?.start : undefined),
      page: () => lastPage.current ?? '',
      mouse,
    })
    // the path changes 4 times a second: saved every 3 seconds, not with every sample
    let saved = -1
    const iv = setInterval(() => {
      const n = Object.values(mouse).reduce((a, l) => a + l.length, 0)
      if (n !== saved) saveMouse(sRef.current.id, mouse)
      saved = n
    }, 3000)
    return () => {
      stop()
      clearInterval(iv)
      saveMouse(sRef.current.id, mouse)
    }
  }, [logging, mouse])

  // events from the site itself: the cart, and the game (e5:open, e5:start, e5:finished ...)
  useEffect(() => {
    if (!logging) return
    const onEv = (e: Event) => {
      const d = (e as CustomEvent<{ type: string; detail: string }>).detail
      logRef.current(d.type, String(d.detail ?? '').slice(0, 60))
    }
    window.addEventListener('ig:event', onEv)
    return () => window.removeEventListener('ig:event', onEv)
  }, [logging])

  // forms on the site never send anything in the test: a small message, and a form_submit in the log
  useEffect(() => {
    const onSubmit = (e: Event) => {
      const f = e.target as HTMLFormElement
      if (f.closest('[data-participant]') || f.getAttribute('role') === 'search') return
      e.preventDefault()
      e.stopPropagation()
      logRef.current('form_submit', f.getAttribute('name') || f.getAttribute('aria-label') || 'formulier')
      setToast(true)
    }
    window.addEventListener('submit', onSubmit, true)
    return () => window.removeEventListener('submit', onSubmit, true)
  }, [])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(false), 6000)
    return () => clearTimeout(t)
  }, [toast])

  // closing the tab before the end: send what there is. only after the consent box and at least one
  // answer, and once per participant (a reload fires pagehide too: after the first time it sends nothing).
  // sendBeacon sends text/plain, which needs no preflight; api/submit.ts parses it itself
  useEffect(() => {
    const onHide = () => {
      const d = sRef.current
      saveMouse(d.id, mouse)
      const answered = Object.values(d.ans).some((a) => a.trim())
      if (!d.consentAt || !answered || d.status !== 'bezig' || d.sent.onvolledig) return
      const ended = { ...d, events: depth.current && lastPage.current ? [...d.events, { t: Date.now() - d.started, type: 'scroll', detail: `${lastPage.current} ${depth.current}%` }] : d.events }
      const body = payload(ended, mouse, 'onvolledig', honey.current, MAX_BEACON)
      const ok = navigator.sendBeacon?.('/api/submit', new Blob([body], { type: 'text/plain;charset=UTF-8' }))
      if (ok) save({ ...d, sent: { ...d.sent, onvolledig: true } })
    }
    window.addEventListener('pagehide', onHide)
    return () => window.removeEventListener('pagehide', onHide)
  }, [mouse])

  // at the end: send (3 retries), otherwise keep it with sent: false and offer the file
  useEffect(() => {
    if (step.kind !== 'end' || s.sent.compleet || sendState !== 'idle' || sending.has(s.id)) return
    sending.add(s.id)
    setSendState('sending')
    saveMouse(s.id, mouse)
    post(payload(s, mouse, 'compleet', honey.current)).then((ok) => {
      setSendState(ok ? 'ok' : 'failed')
      if (ok) setS((d) => ({ ...d, sent: { ...d.sent, compleet: true } }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.kind])
  useEffect(() => {
    retryOld(s.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // the first impression: 10 seconds, then the card covers the site
  useEffect(() => {
    if (step.kind !== 'look') return
    setLeft(LOOK_SECONDS)
    const iv = setInterval(() => setLeft((n) => n - 1), 1000)
    const t = setTimeout(() => next(), LOOK_SECONDS * 1000)
    return () => {
      clearInterval(iv)
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.kind, s.step])

  // to the next step. a task starts on the homepage, the contact question on the contact page
  const advance = (d: Session) => {
    const now = Date.now()
    const all = buildSteps(group, profileOf(d.ans))
    const at = Math.min(d.step + 1, all.length - 1)
    const to = all[at]
    let n: Session = { ...d, step: at }
    const at0 = (type: string, detail: string, task?: TaskId): Ev => ({ t: now - d.started, type, detail, ...(task ? { task } : {}) })
    if (to.kind === 'task') {
      // the page you were on gets its scroll depth first, then the task starts on the homepage
      const before = lastPage.current && lastPage.current !== 'home' ? [at0('scroll', `${lastPage.current} ${depth.current}%`)] : []
      go('home')
      n = { ...n, tasks: { ...n.tasks, [to.id]: { start: now } }, events: [...n.events, ...before, at0('task_start', to.id, to.id), { ...at0('page', 'home', to.id), ...pageOf('home') }] }
      measure('home')
      runningRef.current = to.id
      lastPage.current = 'home'
      depth.current = 0
    }
    if (to.kind === 'view') go(to.page)
    if (to.kind === 'end') n = { ...n, status: 'compleet', ended: now }
    window.scrollTo(0, 0)
    setFolded(false)
    setToast(false)
    sRef.current = n
    setS(n)
  }
  const next = () => advance(sRef.current)
  const finishTask = (result: 'klaar' | 'vast') => {
    if (step.kind !== 'task') return
    const now = Date.now()
    const id = step.id
    const d = sRef.current
    runningRef.current = undefined
    advance({
      ...d,
      tasks: { ...d.tasks, [id]: { ...d.tasks[id], end: now, result } },
      events: [...d.events, { t: now - d.started, type: result === 'klaar' ? 'task_done' : 'task_stuck', detail: id, task: id }],
    })
  }
  const setAns = (id: string, v: string) => setS((d) => ({ ...d, ans: { ...d.ans, [id]: v } }))

  // "vorige": one question screen back, answers stay. only from a question screen to a question screen
  // (or from "Waar werkt u?" to the welcome screen). never into a task, the 10 seconds or the contact
  // page step, so the first screen after each of those has no vorige
  const prev = s.step > 0 ? steps[s.step - 1] : undefined
  const canBack = step.kind === 'ask' && (prev?.kind === 'ask' || prev?.kind === 'welkom')
  const back = () => {
    if (!canBack || !prev) return
    const d = sRef.current
    const id = (st: Step) => (st.kind === 'ask' || st.kind === 'task' ? st.id : st.kind)
    const n: Session = { ...d, step: d.step - 1, events: d.events.length >= MAX_EVENTS ? d.events : [...d.events, { t: Date.now() - d.started, type: 'back', detail: `${id(step)} > ${id(prev)}`, from: id(step), to: id(prev) }] }
    window.scrollTo(0, 0)
    sRef.current = n
    setS(n)
  }

  const begin = () => {
    const d = sRef.current
    // back from "Waar werkt u?": the test already started, so just go on (the log and the cart stay)
    if (d.consentAt) return advance(d)
    window.dispatchEvent(new Event('ig:cart-reset'))
    const now = Date.now()
    const dev = device()
    lastPage.current = null
    advance({ ...d, consentAt: now, device: dev, events: [{ t: now - d.started, type: 'device', detail: `${dev.type} ${dev.viewport} ${dev.browser}` }] })
  }

  // &demo=1: a short fake session as a mail (status test), to check Resend and the env vars in Vercel
  const [demo, setDemo] = useState<'idle' | 'sending' | 'ok' | 'failed'>('idle')
  const sendDemo = async () => {
    setDemo('sending')
    const now = Date.now()
    const t1 = (t: number, type: string, detail: string, extra?: Extra): Ev => ({ t, type, detail, task: 't1', ...extra })
    const fake: Session = {
      ...fresh(group),
      started: now - 90_000,
      ended: now,
      consentAt: now - 90_000,
      status: 'compleet',
      ans: { werk: WORK[1][0], E4: 'dit is een testmail' },
      tasks: { t1: { start: now - 80_000, end: now - 40_000, result: 'klaar' } },
      events: [t1(10_000, 'task_start', 't1'), t1(10_000, 'page', 'home'), t1(14_000, 'hover', 'workshops', { ms: 900, page: 'home' }), t1(15_000, 'click', 'workshops', { x: 40, y: 6, sy: 0 }), t1(16_000, 'page', 'workshops'), t1(50_000, 'task_done', 't1')],
    }
    const path: Mouse = { t1: [[0, 50, 50], [2000, 45, 30], [4000, 40, 8], [6000, 41, 6]] }
    setDemo((await post(payload(fake, path, 'test', honey.current))) ? 'ok' : 'failed')
  }

  const download = () => {
    const blob = new Blob([payload(s, mouse, 'compleet', '')], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `innergames-test-${s.id}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  const counter = nr > 0 && <p className="mb-4 text-[16px] font-medium text-ig-ink/70">Stap {nr} van {numbered.length}</p>
  const toastEl = toast && (
    <div data-participant role="status" className={`fixed left-1/2 z-[96] w-[min(92vw,460px)] -translate-x-1/2 rounded-box bg-ig-ink px-5 py-4 text-[18px] text-ig-cream shadow-lift ${phone ? 'top-4' : 'bottom-6'}`}>
      In de test wordt niets verstuurd. U kunt verder met de taak.
    </div>
  )

  /* ---------- the screens ---------- */

  if (step.kind === 'welkom')
    return (
      <Card label="Welkom">
        <h1 className="text-[28px] font-bold normal-case leading-tight">Welkom</h1>
        <p className="mt-4">{WELKOM}</p>
        <div className="mt-6 rounded-box bg-ig-cream p-5 text-[17px]">
          <p>{CONSENT}</p>
          <label className="mt-4 flex cursor-pointer items-start gap-3 text-[18px] font-semibold">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-6 w-6 shrink-0 accent-ig-ink" />
            Ik heb dit gelezen en doe mee.
          </label>
        </div>
        {/* the honeypot: hidden for people, a bot fills it in */}
        <input tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" onChange={(e) => (honey.current = e.target.value)} className="absolute -left-[9999px] h-px w-px opacity-0" />
        <button type="button" disabled={!consent} onClick={begin} className={`${primary} mt-6 w-full sm:w-auto`}>Beginnen</button>
        {startOf()?.demo && (
          <p className="mt-6 flex flex-wrap items-center gap-3 border-t border-ig-ink/10 pt-4 text-[15px]">
            <button type="button" disabled={demo === 'sending'} onClick={sendDemo} className="rounded-box border border-ig-ink/30 px-3 py-1.5 font-semibold hover:bg-ig-cream">stuur testmail</button>
            {demo === 'sending' ? 'bezig…' : demo === 'ok' ? 'verstuurd' : demo === 'failed' ? 'lukte niet, kijk in de Vercel logs' : ''}
          </p>
        )}
      </Card>
    )

  if (step.kind === 'ask') {
    const shown = step.qs.filter((q) => !q.showIf || q.showIf.is.includes(s.ans[q.showIf.id] ?? ''))
    const missing = shown.some((q) => q.required && !(s.ans[q.id] ?? '').trim())
    return (
      <Card label={`Stap ${nr}`} solid={step.solid}>
        {counter}
        {step.intro && <p className="mb-5 text-[22px] font-semibold leading-snug">{step.intro}</p>}
        {shown.map((q) =>
          q.kind === 'choice' ? (
            <Choice key={q.id} q={q} value={s.ans[q.id]} other={s.ans[q.id + '_tekst']} onPick={(v) => setAns(q.id, v)} onOther={(v) => setAns(q.id + '_tekst', v)} />
          ) : q.kind === 'scale' ? (
            <Scale key={q.id} q={q} value={s.ans[q.id]} onPick={(v) => setAns(q.id, v)} />
          ) : (
            <label key={q.id} className={`mt-6 block first:mt-0 ${q.kind === 'line' ? 'text-[18px] font-semibold' : 'text-[20px] font-semibold leading-snug'}`}>
              {q.q}
              {q.required ? '' : q.kind === 'line' ? '' : <span className="ml-2 text-[16px] font-normal text-ig-ink/60">(mag leeg blijven)</span>}
              {q.kind === 'line' ? (
                <input value={s.ans[q.id] ?? ''} onChange={(e) => setAns(q.id, e.target.value)} className={`${field} font-normal`} />
              ) : (
                <textarea rows={3} value={s.ans[q.id] ?? ''} onChange={(e) => setAns(q.id, e.target.value)} className={`${field} font-normal`} />
              )}
            </label>
          ),
        )}
        {canBack ? (
          // side by side when they fit, otherwise vorige wraps to under Volgende (wrap-reverse)
          <div className="mt-8 flex flex-wrap-reverse items-center justify-between gap-3">
            <button type="button" onClick={back} className={secondary}>vorige</button>
            <button type="button" disabled={missing} onClick={next} className={`${primary} flex-1 sm:flex-none`}>Volgende</button>
          </div>
        ) : (
          <button type="button" disabled={missing} onClick={next} className={`${primary} mt-8 w-full sm:w-auto`}>Volgende</button>
        )}
      </Card>
    )
  }

  if (step.kind === 'linkedin')
    return (
      <Card label={`Stap ${nr}`}>
        {counter}
        <p className="text-[20px] font-semibold leading-snug">U ziet dit bericht van Ariën op LinkedIn en klikt op de link.</p>
        <LinkedInPost />
        <button type="button" onClick={() => { go('home'); next() }} className={`${primary} mt-6 w-full sm:w-auto`}>Klik op de link</button>
      </Card>
    )

  if (step.kind === 'look')
    return (
      <div data-participant role="status" className="fixed left-1/2 top-4 z-[95] -translate-x-1/2 rounded-box bg-ig-ink px-5 py-3 text-[18px] font-semibold text-ig-cream shadow-lift">
        nog {Math.max(0, left)} seconden
      </div>
    )

  if (step.kind === 'task' || step.kind === 'view') {
    const title = step.kind === 'task' ? `Taak ${step.id.slice(1)} van 4` : `Stap ${nr} van ${numbered.length}`
    const buttons =
      step.kind === 'task' ? (
        <TaskButtons onDone={() => finishTask('klaar')} onStuck={() => finishTask('vast')} />
      ) : (
        <button type="button" onClick={next} className={`${big} bg-ig-yellow text-ig-ink hover:bg-ig-yellow-light`}>Verder</button>
      )
    return (
      <>
        <TaskBar title={title} text={step.text} phone={phone} folded={folded} onFold={setFolded} buttons={buttons} />
        {toastEl}
      </>
    )
  }

  // the end
  return (
    <Card label="Einde" solid>
      <h1 className="text-[28px] font-bold normal-case leading-tight">Bedankt!</h1>
      {sendState === 'failed' ? (
        <>
          <p className="mt-4">Het versturen lukte niet. Wilt u op deze knop drukken en het bestand naar {MAIL_TO_DISPLAY} mailen?</p>
          <button type="button" onClick={download} className={`${primary} mt-5`}>Download het bestand</button>
        </>
      ) : sendState === 'sending' ? (
        <p className="mt-4">Uw antwoorden worden verstuurd…</p>
      ) : (
        <p className="mt-4">Uw antwoorden zijn verstuurd. U kunt dit venster sluiten.</p>
      )}
      <p className="mt-8 text-[15px] text-ig-ink/70">Uw code: {s.id}. Noem deze code als u uw antwoorden wilt laten verwijderen.</p>
    </Card>
  )
}

// the task bar. desktop: a slim bar at the top, the menu moves down under it. phone: a bar at the bottom,
// at most 30% of the screen, that folds to one line. the replay (replay.ts) shows the same bar, so the
// page lies exactly where it lay for the participant
export function TaskBar({ title, text, phone, folded, onFold, buttons }: { title: string; text: string; phone: boolean; folded: boolean; onFold: (f: boolean) => void; buttons: ReactNode }) {
  return (
    <>
      <BarSpace phone={phone} />
      <div data-participant role="region" aria-label="De taak" className={`ig-ptask fixed inset-x-0 z-[95] bg-ig-ink text-ig-cream shadow-lift ${phone ? 'bottom-0 max-h-[30vh] overflow-y-auto rounded-t-box' : 'top-0'}`}>
        {phone && folded ? (
          <div className="flex items-center justify-between gap-3 px-4 py-2">
            <span className="text-[16px] font-semibold">{title}</span>
            <button type="button" onClick={() => onFold(false)} className={`${big} border-[1.5px] border-ig-cream/70 py-2!`}>toon taak</button>
          </div>
        ) : (
          <div className={`mx-auto flex max-w-[1200px] gap-3 px-4 ${phone ? 'flex-col py-3' : 'items-center py-2.5'}`}>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[15px] font-semibold uppercase tracking-wide text-ig-yellow">{title}</p>
                {phone && <button type="button" onClick={() => onFold(true)} className="min-h-10 px-2 text-[16px] underline">verberg</button>}
              </div>
              <p className="text-[18px] leading-snug">{text}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">{buttons}</div>
          </div>
        )}
      </div>
    </>
  )
}

export function TaskButtons({ onDone, onStuck }: { onDone?: () => void; onStuck?: () => void }) {
  return (
    <>
      <button type="button" onClick={onDone} className={`${big} bg-ig-yellow text-ig-ink hover:bg-ig-yellow-light`}>Klaar</button>
      <button type="button" onClick={onStuck} className={`${big} border-[1.5px] border-ig-cream/70 text-ig-cream hover:bg-ig-cream/15`}>Ik kom er niet uit</button>
    </>
  )
}

// room for the task bar, so it never covers the menu (top) or the end of the page (bottom)
function BarSpace({ phone }: { phone: boolean }) {
  const [h, setH] = useState(0)
  useEffect(() => {
    const bar = document.querySelector('.ig-ptask')
    if (!bar) return
    const ro = new ResizeObserver(() => setH(Math.round(bar.getBoundingClientRect().height)))
    ro.observe(bar)
    return () => ro.disconnect()
  })
  // the game demo (#spel) is one screen high: it gets smaller by the bar, and lands under menu and bar
  return <style>{phone ? `body{padding-bottom:${h}px}#spel{height:calc(100svh - 112px - ${h}px)!important}` : `body{padding-top:${h}px}.ig-nav{top:${h}px!important}[id]{scroll-margin-top:${h + 96}px!important}#spel{height:calc(100svh - 112px - ${h}px)!important}`}</style>
}

// the LinkedIn post: Damian adds public/test/linkedin-post.png. until then a grey box
function LinkedInPost() {
  const [missing, setMissing] = useState(false)
  return missing ? (
    <div className="mt-5 flex aspect-[4/3] items-center justify-center rounded-box bg-neutral-200 text-[18px] text-neutral-600">LinkedIn-bericht</div>
  ) : (
    <img src="/test/linkedin-post.png" alt="Een bericht van Ariën op LinkedIn met een link naar de website" onError={() => setMissing(true)} className="mt-5 w-full rounded-box border border-ig-ink/10" />
  )
}
