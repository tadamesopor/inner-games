// POST /api/submit: one session of the remote test (src/participant.tsx) as an email to Damian.
// a Vercel serverless function. the Resend key only lives here, on the server, never in the site.
// env vars (set in Vercel): RESEND_API_KEY, MAIL_TO, MAIL_FROM (default onboarding@resend.dev).
// MAIL_DRY=1 builds the email but doesn't send it (for testing on your own laptop).
import { Resend } from 'resend'

type Req = { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown }
type Res = { status: (code: number) => Res; json: (body: unknown) => void }

type Answer = { id: string; q: string; a: string }
type TaskStat = { id: string; title: string; text: string; seconds: number | null; result: string; stuck: boolean; pages: string[]; clicks: number; previewOpened?: boolean; previewSeconds?: number }
type Body = {
  group: 'klant' | 'nieuw'
  website?: string
  status: 'compleet' | 'onvolledig'
  session: {
    id: string
    group: string
    profile: string
    status: string
    started: string
    ended: string | null
    minutes: number
    step: number
    device: { type: string; viewport: string; browser: string }
    answers: Answer[]
    tasks: TaskStat[]
    events: unknown[]
  }
}

const MAX_BYTES = 500 * 1024
const clean = (s: unknown, n = 40) => String(s ?? '').replace(/[^\w\- ]/g, '').slice(0, n)

/** checks the body. returns the reason it's wrong, or null when it's fine */
export function check(raw: unknown, length: number): string | null {
  if (length > MAX_BYTES) return 'te groot'
  const b = raw as Partial<Body> | null
  if (!b || typeof b !== 'object') return 'geen json'
  if (b.website) return 'honeypot'
  if (b.group !== 'klant' && b.group !== 'nieuw') return 'groep'
  if (b.status !== 'compleet' && b.status !== 'onvolledig') return 'status'
  const s = b.session
  if (!s || typeof s !== 'object' || !/^P-[A-Z2-9]{4}$/.test(String(s.id)) || !Array.isArray(s.answers) || !Array.isArray(s.tasks) || !Array.isArray(s.events)) return 'sessie'
  return null
}

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`

/** the email: subject, a readable summary in Dutch, the session as json and the answers as csv */
export function buildMail(b: Body) {
  const s = b.session
  const id = clean(s.id, 6)
  const profile = clean(s.profile, 20)
  const subject = `IG test ${b.group} ${id} ${profile} ${b.status}`
  const line = (k: string, v: unknown) => `${k}: ${v === '' || v == null ? '-' : v}`
  const text = [
    `Testsessie ${id} (${b.group === 'klant' ? 'klant' : 'nieuwe bezoeker'}), ${b.status}.`,
    '',
    line('Profiel', profile),
    line('Begonnen', s.started),
    line('Klaar', s.ended),
    line('Duur', `${s.minutes} minuten`),
    line('Laatste stap', s.step),
    line('Apparaat', `${s.device?.type}, ${s.device?.viewport}, ${s.device?.browser}`),
    '',
    'ANTWOORDEN',
    ...s.answers.flatMap((a) => [`${a.id}. ${a.q}`, `   ${a.a || '-'}`]),
    '',
    'TAKEN',
    ...s.tasks.flatMap((t) => [
      `Taak ${t.id.slice(1)}: ${t.title}`,
      `   ${line('Tijd', t.seconds == null ? 'niet gedaan' : `${t.seconds} seconden`)}`,
      `   ${line('Afgerond', t.result === 'klaar' ? 'ja, klaar' : t.result === 'vast' ? 'nee, kwam er niet uit' : t.result)}`,
      `   ${line("Pagina's", t.pages.join(' > '))}`,
      `   ${line('Klikken', t.clicks)}`,
      ...(t.id === 't4' ? [`   ${line('Spel geopend', t.previewOpened ? `ja, ${t.previewSeconds} seconden` : 'nee')}`] : []),
    ]),
    '',
    `In de bijlagen: de hele sessie als json (met ${s.events.length} gebeurtenissen) en de antwoorden als csv.`,
  ].join('\n')
  const head = ['deelnemer', 'groep', 'profiel', 'status', 'vraag_id', 'vraag', 'antwoord']
  const rows = s.answers.map((a) => [id, b.group, profile, b.status, a.id, a.q, a.a].map(csvCell).join(','))
  const csv = '﻿' + [head.join(','), ...rows].join('\r\n')
  const name = `ig-test-${b.group}-${id}-${b.status}`
  return {
    subject,
    text,
    attachments: [
      { filename: `${name}.json`, content: Buffer.from(JSON.stringify(b.session, null, 2)) },
      { filename: `${name}.csv`, content: Buffer.from(csv) },
    ],
  }
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(400).json({ error: 'alleen POST' })
  // sendBeacon and fetch both send json; a body that wasn't parsed yet arrives as a string
  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return res.status(400).json({ error: 'geen json' })
    }
  }
  const length = Number(req.headers['content-length'] ?? 0) || JSON.stringify(body ?? '').length
  const why = check(body, length)
  if (why) return res.status(400).json({ error: why })

  const mail = buildMail(body as Body)
  if (process.env.MAIL_DRY === '1') {
    console.log(`\n--- ${mail.subject} ---\n${mail.text}\n(${mail.attachments.map((a) => `${a.filename} ${a.content.length} bytes`).join(', ')})`)
    return res.status(200).json({ ok: true, dry: true })
  }
  const key = process.env.RESEND_API_KEY
  const to = process.env.MAIL_TO
  if (!key || !to) return res.status(500).json({ error: 'RESEND_API_KEY of MAIL_TO ontbreekt' })
  const { error } = await new Resend(key).emails.send({
    from: process.env.MAIL_FROM || 'onboarding@resend.dev',
    to,
    subject: mail.subject,
    text: mail.text,
    attachments: mail.attachments,
  })
  if (error) return res.status(502).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
