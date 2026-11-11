import { useContext, useState } from 'react'
import { PHOTOS, ALT } from './data'
import { Btn, Ctx, ContactCta, Header, Img, Photo, Section } from './wf'

type Member = {
  first: string
  last: string
  roles: string[]
  bio: string
  tags: string[]
  photo?: string
  founder?: boolean
}

export const MEMBERS: Member[] = [
  {
    first: 'Ariën',
    last: 'Kingma',
    roles: ['Oprichter', 'Spelontwikkelaar', 'Ontwerper', 'Trainer', 'Ontwikkelaar opleidingen'],
    bio: 'Ik hou ervan om mensen net dat stuk te laten ontdekken die ze zelf niet zagen, zodat ze daarna zelf weer richting kunnen bepalen.',
    tags: ['spelontwikkelaars', 'trainers', 'workshops en opleidingen'],
    photo: '/assets/img/team/arien',
    founder: true,
  },
  {
    first: 'Aron',
    last: 'Sinke',
    roles: ['Spelontwikkelaar', 'Adviseur Duurzaamheid en Educatie', 'Facilitator', 'Workshopleider'],
    bio: 'Ik maak graag positieve impact op mens, maatschappij en planeet met mijn vernieuwende ideeën en interactieve werkvormen.',
    tags: ['spelontwikkelaars', 'workshops en opleidingen'],
    photo: '/assets/img/team/aron',
  },
  {
    first: 'Sanne',
    last: 'van Bekkum',
    roles: ['Workshopontwikkelaar', 'Coördinator welzijn', 'Coach', 'Trainer'],
    bio: 'Ik werk lichaamsgericht en ervaringsgericht met mensen en teams die dichter bij zichzelf willen komen en beter willen afstemmen met anderen. Dit doe ik speels, liefdevol, met aandacht en humor.',
    tags: ['trainers', 'workshops en opleidingen'],
    photo: '/assets/img/team/sanne',
  },
  {
    first: 'Carinda',
    last: 'Jansen',
    roles: ['(Actie-)onderzoeker', 'Projectleider', 'Tekstschrijver', 'Spelontwikkelaar', 'Trainer'],
    bio: 'Ik draag bij aan grote en kleine sociale verandering. Dat doe ik door (onderzoeks-)projecten mét de mensen waar het om gaat.',
    tags: ['spelontwikkelaars', 'trainers'],
    photo: '/assets/img/team/carinda',
  },
  {
    first: 'Wies',
    last: 'van Beek',
    roles: ['Ademtrainer', 'Opleider', 'Spreker', 'Ontwikkelaar workshops en opleidingen'],
    bio: 'Ik geef ademtrainingen in organisaties met als doel je vitaliteit te verhogen. Het belang van een functioneel adempatroon staat centraal.',
    tags: ['trainers', 'workshops en opleidingen'],
    photo: '/assets/img/team/wies',
  },
]

const FILTERS = ['iedereen', 'spelontwikkelaars', 'trainers', 'workshops en opleidingen']

const PILLARS = [
  ['spelen', 'Een spel haalt de rem eraf. Wie speelt, laat zien hoe hij of zij echt in elkaar zit.'],
  ['reflecteren', 'Na het spel kijken we terug: wat gebeurde er, en wat zegt dat over jou en over ons?'],
  ['bewegen', 'We werken lichaamsgericht. Voelen en bewegen brengen vaak sneller inzicht dan praten alleen.'],
]

function MemberCard({ m }: { m: Member }) {
  const [hover, setHover] = useState(false)
  return (
    <article onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="ig-card ig-card--white ig-card--outline">
      <div className="ig-card__body flex flex-col">
      <div className={`ig-card__media relative aspect-[4/5] transition-colors ${hover ? 'bg-ig-orange/20' : 'bg-ig-cream'}`}>
        {m.photo && (
          <Photo
            src={m.photo}
            alt={`Portret van ${m.first} ${m.last}`}
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="absolute inset-0 h-full w-full"
          />
        )}
        {!m.photo && (
          <Img label={`portret ${m.first} ${m.last} · foto nog aanleveren`} className="absolute inset-0 h-full w-full" />
        )}
        {m.founder && (
          <span className="absolute left-3 top-3 rounded-[var(--r-tag)] bg-ig-yellow px-3 py-1 text-[13px] font-medium leading-none">
            oprichter
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 px-2 pb-2 pt-4">
        {/* names keep their capitals: lowercase is only for titles */}
        <h3 className="normal-case! leading-[0.95]">
          <span className="block text-4xl font-semibold tracking-tight">{m.first}</span>
          <span className="block text-2xl font-semibold tracking-tight text-neutral-600">{m.last}</span>
        </h3>
        <ul className="flex flex-wrap gap-1.5">
          {m.roles.map((r) => (
            <li key={r} className="rounded-full bg-ig-cream px-2.5 py-0.5 text-[13px]">
              {r}
            </li>
          ))}
        </ul>
        <p className="text-[15px] leading-relaxed text-neutral-800">{m.bio}</p>
        <a
          href={`mailto:info@innergames.nl?subject=Vraag%20voor%20${encodeURIComponent(m.first)}`}
          className="mt-auto inline-flex items-center gap-2 self-start border-b-2 border-ig-orange pb-0.5 text-sm font-semibold text-ig-ink hover:border-ig-ink"
        >
          stuur me mail <span aria-hidden>→</span>
        </a>
      </div>
      </div>
    </article>
  )
}

export function Team() {
  const { go } = useContext(Ctx)
  const [filter, setFilter] = useState('iedereen')
  const shown = MEMBERS.filter((m) => filter === 'iedereen' || m.tags.includes(filter))

  return (
    <div>
      <Header active="team" tone="yellow" />

      <Section id="A" label="hero + groepsfoto" className="bg-ig-yellow text-ig-ink" note="PORTRETFOTO (vrijgesteld, groep)">
        <div className="grid items-center gap-8 @3xl:grid-cols-[1.1fr_1fr] @3xl:gap-12">
          <div>
            <p className="mb-4 text-base font-medium">spelen om te leren · spelen om te groeien</p>
            <h1 className="text-[3.5rem] font-bold lowercase leading-[0.95] tracking-tight @3xl:text-[7rem]">ons team</h1>
            <p className="mt-6 max-w-lg text-xl font-medium leading-snug @3xl:text-2xl">
              {/* TODO Ariën: check this intro */}
              Vijf mensen die spellen ontwikkelen, workshops geven en trainers opleiden, vanuit Eindhoven.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn split variant="dark" onClick={() => document.getElementById('leden')?.scrollIntoView({ behavior: 'smooth' })}>
                ontmoet de vijf
              </Btn>
              <Btn variant="ghost" onClick={() => go('contact')}>
                neem contact op
              </Btn>
            </div>
          </div>
          <div className="relative h-[340px] overflow-hidden rounded-[var(--r-box)] bg-ig-cream @3xl:h-[440px]">
            <img
              src="/assets/team-group.png"
              alt="Ariën, Sanne en Aron van InnerGames staan lachend naast elkaar"
              className="absolute bottom-0 left-1/2 h-[125%] max-w-none -translate-x-1/2"
            />
          </div>
        </div>
      </Section>

      <Section id="B" label="de vijf" className="bg-white" note="foto + quote-kaart behouden · filter op expertise · Carinda en Wies: foto ontbreekt">
        <div id="leden" className="scroll-mt-24">
          <div className="mb-8 mt-4 flex flex-col gap-5 @3xl:flex-row @3xl:items-end @3xl:justify-between">
            <h2 className="max-w-xl text-4xl font-bold lowercase leading-none tracking-tight @3xl:text-5xl">vijf spelers, één idee</h2>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter op expertise">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-1.5 text-[15px] transition ${filter === f ? 'bg-ig-ink text-white' : 'bg-ig-cream hover:bg-ig-yellow'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-20 pt-14 @3xl:grid-cols-3 @3xl:gap-y-24">
            {shown.map((m) => (
              <MemberCard key={m.first} m={m} />
            ))}
          </div>
          <p className="mt-4 text-sm text-neutral-500">
            {shown.length} van {MEMBERS.length} teamleden
          </p>
        </div>
      </Section>

      <Section id="C" label="onze aanpak" className="bg-ig-cream text-ig-ink" note="serieus, speels, lichamelijk">
        <div className="mt-4 grid gap-10 @3xl:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-4xl font-bold lowercase leading-none tracking-tight @3xl:text-5xl">hoe we werken</h2>
            <p className="mt-4 max-w-sm text-neutral-700">Een serieuze organisatie die speelse dingen doet: inner growth for outer change.</p>
          </div>
          <div className="grid gap-4 @3xl:grid-cols-3">
            {PILLARS.map(([t, d], i) => (
              <div key={t} className="rounded-[var(--r-box)] bg-white p-5">
                <p className="text-3xl text-ig-orange">0{i + 1}</p>
                <h3 className="mt-3 text-2xl font-semibold lowercase">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="D" label="werkplek" className="p-0!" note="FULL-WIDTH BACKGROUND IMAGE · het team aan het werk, Eindhoven">
        <div className="relative h-72 overflow-hidden @3xl:h-[520px]">
          <Photo src={PHOTOS.tafel} alt={ALT[PHOTOS.tafel]} sizes="100vw" className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <p className="absolute bottom-6 left-5 max-w-xl text-3xl font-bold lowercase leading-none tracking-tight text-white @3xl:bottom-12 @3xl:left-16 @3xl:text-6xl">
            samen aan tafel, vanuit eindhoven
          </p>
        </div>
      </Section>

      <ContactCta id="E" />
    </div>
  )
}
