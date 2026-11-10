// 08 game box: next to the text, driven by one normal scroll, sticking out over the rounded edge
import { useRef } from 'react'
import { GAMES } from '../data'
import { initBoxscene } from '../motion'
import { PencilMark, SplitBtn, useEffectInit, type Effect } from './ui'

export const gamebox: Effect = {
  n: '08',
  name: 'spelbox',
  cls: '.ig-boxscene',
  what: 'De doos staat naast de tekst. Terwijl het blok in beeld scrolt, landt hij van 14° gekanteld naar bijna recht, met een schaduw die scherper wordt. Klaar als het blok in het midden staat. De doos steekt een stukje over de ronde rand.',
  why: 'Het echte spel, groot en tastbaar, zonder extra scrollen. De vijf kaarten van The Elemental Five komen er later uit, zodra de vrijstaande foto’s er zijn.',
}

// TODO: the five card-1 images of The Elemental Five (cut-out, white border) go here,
// together with a cut-out of the E5 box. without them the scene shows only the box.
const E5_CARDS: string[] = []

export function GameboxDemo({ on }: { on: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useEffectInit(ref, initBoxscene, on)
  const soc = GAMES.find((g) => g.slug === 'sociality')!
  const text = (
    <div className="ig-boxscene__text">
      <p className="text-base">uitgelicht spel</p>
      <h3 className="mt-2 text-[40px] font-semibold leading-none tracking-tight @3xl:text-[64px]">sociality</h3>
      <p className="mt-5 max-w-[40ch] text-xl leading-snug">{soc.short}</p>
      <div className="relative mt-8 inline-block">
        <SplitBtn tone="ink">bekijk het spel</SplitBtn>
        {on && (
          <span className="absolute left-[calc(100%+12px)] top-[-58px] hidden w-[150px] @3xl:block">
            <span className="block text-base leading-tight">kijk wat erin zit</span>
            <PencilMark name="pointer" className="ig-draw ig-boxscene__pointer -ml-6 mt-1 h-[52px] w-[80px] -scale-x-100 [color:var(--ig-ink)]" />
          </span>
        )}
      </div>
    </div>
  )
  return (
    <div className="lab-frame bg-white @container">
      <p className="px-6 py-8 text-[13px] text-ig-ink/70 @3xl:px-12">scroll gewoon door: de doos landt terwijl het blok in beeld komt</p>
      {on ? (
        <section ref={ref} className="ig-boxscene ig-section--rounded bg-ig-yellow px-6 pt-16 @3xl:px-12 @3xl:pt-20">
          {text}
          <div className="ig-boxscene__stage">
            {E5_CARDS.map((src, i) => (
              <img key={src} className="ig-boxscene__card" src={src} alt="" style={{ ['--i' as string]: i }} />
            ))}
            <img className="ig-boxscene__box" src="/assets/img/games/sociality-box.png" alt="Speldoos van Sociality" width={398} height={459} />
            <span className="ig-boxscene__shadow" aria-hidden />
          </div>
        </section>
      ) : (
        <section className="grid items-center gap-8 bg-ig-yellow px-6 py-16 @3xl:grid-cols-2 @3xl:px-12">
          {text}
          <img src="/assets/img/games/sociality-box.png" alt="Speldoos van Sociality" className="mx-auto w-[300px]" />
        </section>
      )}
      <div className="bg-ig-cream px-6 pb-20 @3xl:px-12" style={on ? undefined : { paddingTop: 64 }}>
        <h3 className="text-[28px] font-semibold leading-tight">de volgende sectie</h3>
        <p className="mt-3 max-w-[40ch] text-base leading-relaxed">De doos steekt een klein stukje over de ronde rand hierin.</p>
      </div>
    </div>
  )
}
