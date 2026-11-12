import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { PageId } from './wf'

// the remote test (v5): a participant does it alone, from a link Ariën sends.
//   /?test=klant  for clients, /?test=nieuw  for new visitors
// no test leader, no rounds, no participant numbers. the session is saved in localStorage (a reload
// continues), and sent to Damian's email through /api/submit when it's done (or, unfinished, when the
// tab closes). the leader mode in test.tsx is separate and stays as it was.
// the event log: pages, clicks (the label of what was clicked, never what was typed), scroll depth per
// page, form submits, task start/done/stuck. no video.

export type Group = 'klant' | 'nieuw'
export const testGroup = (): Group | null => {
  const t = new URLSearchParams(location.search).get('test')
  return t === 'klant' || t === 'nieuw' ? t : null
}

// TODO Damian: your email address, shown on the end screen when sending didn't work
const MAIL_TO_DISPLAY = 'damian…'
const KEY = 'ig-p5:'
const MAX_EVENTS = 3000
const LOOK_SECONDS = 10
const ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I
const RETRY = [1000, 3000, 9000]

type Profile = 'school' | 'organisatie' | 'trainer' | 'anders'
type TaskId = 't1' | 't2' | 't3' | 't4'
type Status = 'bezig' | 'compleet' | 'onvolledig'
type Ev = { t: number; type: string; detail: string; task?: TaskId }
type TaskRes = { start?: number; end?: number; result?: 'klaar' | 'vast' }

type Session = {
  v: 5
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

/* ---------- the texts (docs/CLAUDE_CODE_TEST_MODE_V5.md, section 3) ---------- */

const WELKOM = 'Fijn dat u meedoet. U helpt InnerGames om hun nieuwe website beter te maken. Dit duurt ongeveer 15 minuten. U test de website, niet uzelf. Er zijn geen foute antwoorden. Er wordt niets verkocht en niets echt verstuurd.'
const CONSENT = "Uw antwoorden worden zonder naam bewaard. Ze worden alleen gebruikt om de website te verbeteren en voor het stageverslag van Damian bij Fontys. We slaan ook op welke pagina's u bekijkt en waar u klikt. Wat u typt in de website zelf slaan we niet op. Alles wordt uiterlijk 31 januari 2027 verwijderd. U kunt altijd stoppen."

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
    { kind: 'ask', id: 't4', qs: [choice('4a', 'Heeft u het spel gevonden?', ['ja, meteen', 'ja, na wat zoeken', 'nee']), choice('4b', 'Wat zou u hierna doen?', ['meer lezen over het spel', 'het spel kopen', 'een workshop aanvragen', 'niets', 'anders:'], 'anders:')] },
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
const fresh = (group: Group): Session => ({ v: 5, id: newId(), group, status: 'bezig', step: 0, started: Date.now(), device: device(), ans: {}, tasks: {}, events: [], sent: {} })
const save = (s: Session) => {
  try {
    localStorage.setItem(KEY + s.id, JSON.stringify(s))
    localStorage.setItem(KEY + 'current:' + s.group, s.id)
  } catch {
    /* private window: the session only lives in memory */
  }
}
function load(group: Group): Session {
  try {
    const id = localStorage.getItem(KEY + 'current:' + group)
    const s = id && (JSON.parse(localStorage.getItem(KEY + id) || 'null') as Session | null)
    if (s && s.v === 5 && s.group === group) return s
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

function taskStats(s: Session) {
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
      clicks: ev.filter((e) => e.type === 'click').length,
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

const payload = (s: Session, status: Status, honey: string) =>
  JSON.stringify({
    group: s.group,
    website: honey, // the honeypot: a person never fills this in
    status,
    session: {
      id: s.id,
      group: s.group,
      profile: profileOf(s.ans) ?? 'onbekend',
      status,
      started: new Date(s.started).toISOString(),
      ended: s.ended ? new Date(s.ended).toISOString() : null,
      minutes: Math.round(((s.ended ?? Date.now()) - s.started) / 6000) / 10,
      step: s.step,
      device: s.device,
      answers: answersOf(s),
      tasks: taskStats(s),
      events: s.events,
    },
  })

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
    if (!k?.startsWith(KEY) || k.startsWith(KEY + 'current') || k === KEY + skip) continue
    try {
      const s = JSON.parse(localStorage.getItem(k) || 'null') as Session | null
      if (!s || s.v !== 5 || s.status !== 'compleet' || s.sent.compleet) continue
      if (await post(payload(s, 'compleet', ''))) save({ ...s, sent: { ...s.sent, compleet: true } })
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
  const [consent, setConsent] = useState(false)
  const [folded, setFolded] = useState(false)
  const [left, setLeft] = useState(LOOK_SECONDS)
  const [toast, setToast] = useState(false)
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'ok' | 'failed'>('idle')
  const [phone, setPhone] = useState(() => matchMedia('(max-width: 639px)').matches)
  const honey = useRef('')
  const sRef = useRef(s)
  sRef.current = s

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
  const log = (type: string, detail = '') =>
    setS((d) => (d.events.length >= MAX_EVENTS ? d : { ...d, events: [...d.events, { t: Date.now() - d.started, type, detail, ...(runningRef.current ? { task: runningRef.current } : {}) }] }))
  const logRef = useRef(log)
  logRef.current = log

  // pages, and the scroll depth of the page you leave
  const depth = useRef(0)
  const lastPage = useRef<string | null>(null)
  useEffect(() => {
    if (!logging) return
    if (lastPage.current !== null && lastPage.current !== pageKey) logRef.current('scroll', `${lastPage.current} ${depth.current}%`)
    if (lastPage.current !== pageKey) logRef.current('page', pageKey)
    lastPage.current = pageKey
    depth.current = 0
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

  // clicks on the site: only the label of the button or link, never the value of a field
  useEffect(() => {
    if (!logging) return
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null
      if (!t || t.closest('[data-participant]')) return
      const el = t.closest('button, a, [role=button], [aria-label]')
      if (!el) return
      const typed = el.matches('input, textarea, select, [contenteditable]')
      const label = (el.getAttribute('aria-label') || (typed ? '' : el.textContent) || el.tagName.toLowerCase()).replace(/\s+/g, ' ').trim().slice(0, 60)
      logRef.current('click', label)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [logging])

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

  // closing the tab before the end: send what there is, once
  useEffect(() => {
    const onHide = () => {
      const d = sRef.current
      if (!d.consentAt || d.status !== 'bezig' || d.sent.onvolledig) return
      const ended = { ...d, events: depth.current && lastPage.current ? [...d.events, { t: Date.now() - d.started, type: 'scroll', detail: `${lastPage.current} ${depth.current}%` }] : d.events }
      const ok = navigator.sendBeacon?.('/api/submit', new Blob([payload(ended, 'onvolledig', honey.current)], { type: 'application/json' }))
      if (ok) save({ ...d, sent: { ...d.sent, onvolledig: true } })
    }
    window.addEventListener('pagehide', onHide)
    return () => window.removeEventListener('pagehide', onHide)
  }, [])

  // at the end: send (3 retries), otherwise keep it with sent: false and offer the file
  useEffect(() => {
    if (step.kind !== 'end' || s.sent.compleet || sendState !== 'idle' || sending.has(s.id)) return
    sending.add(s.id)
    setSendState('sending')
    post(payload(s, 'compleet', honey.current)).then((ok) => {
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
      n = { ...n, tasks: { ...n.tasks, [to.id]: { start: now } }, events: [...n.events, ...before, at0('task_start', to.id, to.id), at0('page', 'home', to.id)] }
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

  const begin = () => {
    window.dispatchEvent(new Event('ig:cart-reset'))
    const now = Date.now()
    const dev = device()
    const d = sRef.current
    lastPage.current = null
    advance({ ...d, consentAt: now, device: dev, events: [{ t: now - d.started, type: 'device', detail: `${dev.type} ${dev.viewport} ${dev.browser}` }] })
  }

  const download = () => {
    const blob = new Blob([payload(s, 'compleet', '')], { type: 'application/json' })
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
        <button type="button" disabled={missing} onClick={next} className={`${primary} mt-8 w-full sm:w-auto`}>Volgende</button>
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
        <>
          <button type="button" onClick={() => finishTask('klaar')} className={`${big} bg-ig-yellow text-ig-ink hover:bg-ig-yellow-light`}>Klaar</button>
          <button type="button" onClick={() => finishTask('vast')} className={`${big} border-[1.5px] border-ig-cream/70 text-ig-cream hover:bg-ig-cream/15`}>Ik kom er niet uit</button>
        </>
      ) : (
        <button type="button" onClick={next} className={`${big} bg-ig-yellow text-ig-ink hover:bg-ig-yellow-light`}>Verder</button>
      )
    // desktop: a slim bar at the top, the menu moves down under it. phone: a bar at the bottom, at most
    // 30% of the screen, that folds to one line
    return (
      <>
        <BarSpace phone={phone} />
        <div data-participant role="region" aria-label="De taak" className={`ig-ptask fixed inset-x-0 z-[95] bg-ig-ink text-ig-cream shadow-lift ${phone ? 'bottom-0 max-h-[30vh] overflow-y-auto rounded-t-box' : 'top-0'}`}>
          {phone && folded ? (
            <div className="flex items-center justify-between gap-3 px-4 py-2">
              <span className="text-[16px] font-semibold">{title}</span>
              <button type="button" onClick={() => setFolded(false)} className={`${big} border-[1.5px] border-ig-cream/70 py-2!`}>toon taak</button>
            </div>
          ) : (
            <div className={`mx-auto flex max-w-[1200px] gap-3 px-4 ${phone ? 'flex-col py-3' : 'items-center py-2.5'}`}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[15px] font-semibold uppercase tracking-wide text-ig-yellow">{title}</p>
                  {phone && <button type="button" onClick={() => setFolded(true)} className="min-h-10 px-2 text-[16px] underline">verberg</button>}
                </div>
                <p className="text-[18px] leading-snug">{step.text}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">{buttons}</div>
            </div>
          )}
        </div>
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
