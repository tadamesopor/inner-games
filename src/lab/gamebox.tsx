// 08 game box: scroll-driven, sticky, the box breaks out over the rounded edge
import { useRef } from 'react'
import { GAMES } from '../data'
import { initBoxscene } from '../motion'
import { PencilMark, SplitBtn, useEffectInit, type Effect } from './ui'

export const gamebox: Effect = {
  n: '08',
  name: 'spelbox',
  cls: '.ig-boxscene',
  what: 'Het blok blijft staan terwijl je scrolt, en de scroll stuurt de doos: van 14° gekanteld naar bijna recht, met een schaduw die scherper wordt als hij landt. De doos steekt over de ronde rand de volgende sectie in.',
  why: 'Het echte spel, groot en tastbaar. De vijf kaarten van The Elemental Five komen er later uit, zodra de vrijstaande foto’s er zijn.',
}

// TODO: the five card-1 images of The Elemental Five (cut-out, white border) go here,
// together with a cut-out of the E5 box. without them the scene shows only the box.
const E5_CARDS: string[] = []

export function GameboxDemo({ on }: { on: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useEffectInit(ref, initBoxscene, on)
  const soc = GAMES.find((g) => g.slug === 'sociality')!
  if (!on)
    return (
      <div className="lab-frame bg-ig-yellow p-10">
        <div className="grid items-center gap-8 @3xl:grid-cols-2">
          <h3 className="text-[40px] font-semibold leading-none tracking-tight">sociality</h3>
          <img src="/assets/img/games/sociality-box.png" alt="Speldoos van Sociality" className="mx-auto w-[260px]" />
        </div>
      </div>
    )
  return (
    <div className="lab-frame bg-white @container">
      <p className="px-6 py-10 text-[13px] text-ig-ink/70 @3xl:px-12">scroll langzaam: het gele blok blijft staan en de doos landt</p>
      <section ref={ref} className="ig-boxscene">
        <div className="ig-boxscene__panel bg-ig-yellow px-6 @3xl:px-12">
          <div className="max-w-[46%] @max-3xl:max-w-none">
            <p className="text-base">uitgelicht spel</p>
            <h3 className="mt-2 text-[40px] font-semibold leading-none tracking-tight @3xl:text-[64px]">sociality</h3>
            <p className="mt-5 max-w-[40ch] text-xl leading-snug">{soc.short}</p>
            <div className="relative mt-8 inline-block">
              <SplitBtn tone="ink">bekijk het spel</SplitBtn>
              <span className="absolute left-[calc(100%+12px)] top-[-58px] hidden w-[150px] @3xl:block">
                <span className="block text-base leading-tight">kijk wat erin zit</span>
                <PencilMark name="pointer" className="ig-draw ig-boxscene__pointer -ml-6 mt-1 h-[52px] w-[80px] -scale-x-100 [color:var(--ig-ink)]" />
              </span>
            </div>
          </div>
          <div className="ig-boxscene__stage">
            {E5_CARDS.map((src, i) => (
              <img key={src} className="ig-boxscene__card" src={src} alt="" style={{ ['--i' as string]: i }} />
            ))}
            <img className="ig-boxscene__box" src="/assets/img/games/sociality-box.png" alt="Speldoos van Sociality" width={398} height={459} />
            <span className="ig-boxscene__shadow" aria-hidden />
          </div>
        </div>
      </section>
      <div className="relative z-[1] -mt-[var(--r-section)] bg-ig-cream px-6 pb-24 pt-[calc(var(--r-section)+96px)] @3xl:px-12">
        <h3 className="max-w-[46%] text-[28px] font-semibold leading-tight @max-3xl:max-w-none">de volgende sectie</h3>
        <p className="mt-3 max-w-[40ch] text-base leading-relaxed">De doos steekt over de ronde rand hierin.</p>
      </div>
    </div>
  )
}
