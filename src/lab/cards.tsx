// 06 card hover: the InnerGames hand pops up from behind the card
import { useRef } from 'react'
import { ALT, WORKSHOPS } from '../data'
import { Photo } from '../wf'
import { initCards } from '../motion'
import { useEffectInit, type Effect } from './ui'

export const cards: Effect = {
  n: '06',
  name: 'de hand bij hover',
  cls: '.ig-card',
  what: 'De kaart kantelt iets en komt omhoog. Achter de bovenrand komt de InnerGames-hand op, zwaait één keer en zakt terug als je weggaat.',
  why: 'Ons eigen handschrift, uit het logo: iemand die zijn hand opsteekt. Op een telefoon groet de hand één keer als de kaart in beeld komt.',
}

const TONES = ['cream', 'orange', 'yellow'] as const
const PLAIN_BG = ['bg-ig-cream', 'bg-ig-orange', 'bg-ig-yellow']

export function CardsDemo({ on }: { on: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffectInit(ref, initCards, on)
  return (
    <div className="lab-frame bg-white px-6 pb-10 pt-20 @container @3xl:px-10">
      <div ref={ref} className="grid gap-x-6 gap-y-16 @xl:grid-cols-3">
        {[WORKSHOPS[0], WORKSHOPS[3], WORKSHOPS[7]].map((w, i) => (
          <a key={w.slug} href="#fx-lift" className={on ? `ig-card ig-card--${TONES[i]}` : 'block'}>
            <article className={on ? 'ig-card__body flex flex-col' : `flex h-full flex-col rounded-[var(--r-box)] p-[10px] ${PLAIN_BG[i]}`}>
              <div className={on ? 'ig-card__media' : 'overflow-hidden rounded-[8px]'}>
                <Photo src={w.photo} alt={ALT[w.photo] ?? w.title} sizes="(min-width: 1024px) 25vw, 100vw" className="aspect-[4/3] w-full" />
              </div>
              <div className="flex flex-1 flex-col gap-2 px-2 pb-2 pt-4">
                <h3 className="text-xl font-semibold leading-tight">{w.title}</h3>
                <p className="text-base leading-relaxed">{w.tagline}</p>
                <p className="mt-auto pt-3 text-base">{w.price}</p>
              </div>
            </article>
          </a>
        ))}
      </div>
    </div>
  )
}
