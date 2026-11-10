// 09 footer: the last section slides up off the footer, a game box rises from the bottom edge
import { useRef } from 'react'
import { initFooterReveal } from '../motion'
import { PencilMark, SplitBtn, useEffectInit, type Effect } from './ui'

export const footer: Effect = {
  n: '09',
  name: 'footer',
  cls: '.ig-footer',
  what: 'De laatste sectie schuift met haar ronde onderkant omhoog en onthult de footer eronder. Uit de onderrand komt iets van InnerGames als bedrijf op: A de grote hand die één keer gedag zwaait, of B de teamfoto als afgedrukte foto.',
  why: 'Een groet aan het eind van elke pagina, met dezelfde hand als op de kaarten en in de overgang. Hier: A op inkt, B op oranje.',
}

function Reveal({ tone, art, on }: { tone: 'ink' | 'orange'; art: 'hand' | 'photo'; on: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useEffectInit(ref, initFooterReveal, on)
  const onInk = tone === 'ink'
  return (
    <div className="lab-frame @container">
      <section className={`bg-ig-cream px-6 pb-24 pt-16 @3xl:px-12 ${on ? 'ig-reveal-cover ig-section--rounded' : ''}`}>
        <p className="text-[13px] text-ig-ink/70">{art === 'hand' ? 'optie A: de hand, op inkt' : 'optie B: de teamfoto, op oranje'}: scroll verder</p>
        <h3 className="mt-3 max-w-[18ch] text-[40px] font-semibold leading-[1.05] tracking-tight">zullen we samen spelen?</h3>
        <p className="mt-4 max-w-[48ch] text-lg leading-snug">Dit is de laatste sectie van de pagina. Hij schuift omhoog en de footer komt eronder vandaan.</p>
      </section>
      <footer
        ref={ref}
        className={on ? `ig-footer ig-footer--${tone}` : onInk ? 'bg-ig-ink text-ig-cream' : 'bg-ig-orange text-ig-ink'}
      >
        <div className="relative grid gap-10 px-6 pb-[18%] pt-14 @3xl:grid-cols-[1fr_1fr_1fr] @3xl:px-12 @3xl:pb-28">
          <div className="relative z-[1] space-y-1 text-base">
            <img src="/assets/logo-cream.png" alt="InnerGames" className={`mb-6 h-12 w-auto ${onInk ? '' : 'brightness-0'}`} />
            <p>Kronehoefstraat 87</p>
            <p>5612 HL Eindhoven</p>
            <p className="pt-3">+31 (0)6 – 215 27 855</p>
            <a href="mailto:info@innergames.nl" className="inline-block">
              info@innergames.nl
              {on && <PencilMark name="underline" className="ig-draw ig-footer__mark" />}
            </a>
          </div>
          <div aria-hidden />
          <div className="relative z-[1]">
            <p className="text-[28px] font-semibold leading-tight">plan een kennismaking</p>
            <p className="mt-3 max-w-[34ch] text-base leading-relaxed">Vertel wat je wilt bereiken met je team, klas of groep. We denken graag mee.</p>
            <div className="mt-6">
              <SplitBtn tone={onInk ? 'orange' : 'ink'}>neem contact op</SplitBtn>
            </div>
          </div>
          {on && art === 'hand' && <span className="ig-footer-hand" aria-hidden />}
          {on && art === 'photo' && (
            <figure className="ig-footer-photo">
              <img src="/assets/team-group.png" alt="Ariën, Sanne en Aron van InnerGames staan lachend naast elkaar" width={986} height={1479} />
            </figure>
          )}
        </div>
        <div className={`relative flex flex-wrap justify-between gap-2 border-t px-6 py-4 text-[13px] @3xl:px-12 ${onInk ? 'border-ig-cream/15' : 'border-ig-ink/15'}`}>
          <span>InnerGames, Eindhoven</span>
          <span>spelen om te leren · spelen om te groeien</span>
        </div>
      </footer>
    </div>
  )
}

export function FooterDemo({ on }: { on: boolean }) {
  return (
    <div className="space-y-10">
      <Reveal tone="ink" art="hand" on={on} />
      <Reveal tone="orange" art="photo" on={on} />
    </div>
  )
}
