// 02 speelpad: the game path behind the homepage blocks
import { useRef } from 'react'
import { ALT, GAMES, WORKSHOPS } from '../data'
import { MEMBERS } from '../team'
import { Photo } from '../wf'
import { initSpeelpad } from '../motion'
import { useEffectInit, type Effect } from './ui'

export const speelpad: Effect = {
  n: '02',
  name: 'speelpad',
  cls: '.ig-bg-speelpad',
  what: 'Het spelpad tekent zichzelf met de potloodlijn terwijl je scrolt. De pion loopt mee, leunt in de looprichting en maakt een sprongetje bij elk blok.',
  why: 'Spelen om te groeien, zonder woorden. De lijn loopt achter de kaarten langs, alsof hij bij de pagina hoort.',
}

// blocks alternate: the stop sits in the wide margin, the block leans to the other side
const block = 'rounded-[var(--r-box)] bg-white p-6 @3xl:p-8'

export function SpeelpadDemo({ on }: { on: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffectInit(ref, initSpeelpad, on)
  const e5 = GAMES[0]
  return (
    <div className="lab-frame bg-ig-cream @container">
      <div ref={ref} className={`flex flex-col gap-24 px-4 py-20 @3xl:gap-32 @3xl:px-0 ${on ? 'ig-bg-speelpad' : ''}`}>
        <div data-speelpad-stop className={`${block} w-full max-w-[500px] @3xl:ml-[24%]`}>
          <h3 className="text-[28px] font-semibold leading-tight">waar kom jij voor?</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {['onderwijs', 'organisaties', 'zorg', 'trainers'].map((a) => (
              <span key={a} className="rounded-[var(--r-tag)] bg-ig-cream px-3 py-1 text-[15px]">{a}</span>
            ))}
          </div>
        </div>
        <div data-speelpad-stop className={`${block} w-full max-w-[560px] @3xl:ml-[10%]`}>
          <h3 className="text-[28px] font-semibold leading-tight">uit onze sessies</h3>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {[WORKSHOPS[0], WORKSHOPS[3]].map((w) => (
              <div key={w.slug}>
                <Photo src={w.photo} alt="" sizes="260px" className="aspect-[4/3] w-full rounded-[8px]" />
                <p className="mt-2 text-base font-semibold leading-snug">{w.title}</p>
              </div>
            ))}
          </div>
        </div>
        <div data-speelpad-stop className={`${block} grid w-full max-w-[540px] items-center gap-6 @3xl:ml-[26%] @3xl:grid-cols-[1fr_170px]`}>
          <div>
            <p className="text-[15px] text-[#C84413]">uitgelicht spel</p>
            <h3 className="text-[28px] font-semibold leading-tight">the elemental five</h3>
            <p className="mt-2 text-base leading-relaxed">{e5.short}</p>
          </div>
          <Photo src={e5.photo} alt={ALT[e5.photo]} sizes="170px" contain className="aspect-square w-full bg-transparent!" />
        </div>
        <div data-speelpad-stop className={`${block} w-full max-w-[480px] @3xl:ml-[14%]`}>
          <h3 className="text-[28px] font-semibold leading-tight">vijf spelers, één idee</h3>
          <div className="mt-5 flex gap-3">
            {MEMBERS.slice(0, 3).map((m) => m.photo && <Photo key={m.first} src={m.photo} alt={m.first} sizes="120px" className="aspect-[3/4] w-1/3 rounded-[8px]" />)}
          </div>
        </div>
      </div>
    </div>
  )
}
