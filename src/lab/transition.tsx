// 07 page transition: the pencil scribble
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { ALT, PHOTOS } from '../data'
import { Photo } from '../wf'
import { igNavigate } from '../motion'
import { SplitBtn, type Effect } from './ui'

export const transition: Effect = {
  n: '07',
  name: 'paginaovergang',
  cls: '.ig-scribble',
  what: 'Een potloodlijn krabbelt over het scherm en wordt dikker tot alles oranje is. De hand verschijnt, de pagina wisselt, en het oranje schuift met een ronde rand naar boven weg.',
  why: 'Zoals je op een flip-over iets doorkrast en opnieuw begint. Volledig 900 ms; in de gebruikerstest een korte versie van 460 ms, of uit.',
}

const MODES = [
  ['full', 'volledig (900 ms)'],
  ['short', 'kort, voor de test (460 ms)'],
  ['off', 'uit'],
] as const

export function TransitionDemo({ on }: { on: boolean }) {
  const [page, setPage] = useState(0)
  const [mode, setMode] = useState<'full' | 'short' | 'off'>('full')
  const pages = [
    { title: 'sessies en workshops', photo: PHOTOS.workshopsHero },
    { title: 'onze spellen', photo: PHOTOS.gamesHero },
  ]
  const p = pages[page]
  const next = () => {
    const update = () => flushSync(() => setPage((x) => 1 - x))
    if (on) igNavigate(update, { mode })
    else update()
  }
  return (
    <div className="lab-frame grid items-center gap-8 bg-white p-6 @container @3xl:grid-cols-[1fr_1.1fr] @3xl:p-10">
      <div>
        <p className="text-[13px] text-ig-ink/70">pagina {page + 1} van 2</p>
        <h3 className="mt-2 text-[40px] font-semibold leading-none tracking-tight">{p.title}</h3>
        <div className="mt-8">
          <SplitBtn onClick={next}>naar de volgende pagina</SplitBtn>
        </div>
        <fieldset className="mt-6 flex flex-wrap gap-2 text-[13px]">
          <legend className="mb-2 text-ig-ink/70">lengte</legend>
          {MODES.map(([m, label]) => (
            <label key={m} className={`cursor-pointer rounded-[8px] px-3 py-2 ${mode === m ? 'bg-ig-ink text-ig-cream' : 'bg-ig-cream'}`}>
              <input type="radio" name="vt-mode" value={m} checked={mode === m} onChange={() => setMode(m)} className="sr-only" />
              {label}
            </label>
          ))}
        </fieldset>
      </div>
      <Photo src={p.photo} alt={ALT[p.photo]} className="aspect-[4/3] w-full rounded-[var(--r-box)]" />
    </div>
  )
}
