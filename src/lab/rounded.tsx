// 01 rounded sections
import type { Effect } from './ui'

export const rounded: Effect = {
  n: '01',
  name: 'afgeronde secties',
  cls: '.ig-section--rounded',
  what: 'De gekleurde kop eindigt met grote ronde hoeken. De volgende sectie schuift eronder.',
  why: 'De pagina voelt als gestapelde kaarten, en je ziet dat er meer komt.',
}

export function RoundedDemo({ on }: { on: boolean }) {
  return (
    <div className="lab-frame bg-white @container">
      <section className={`bg-ig-orange px-6 pb-16 pt-12 text-ig-ink @3xl:px-12 ${on ? 'ig-section--rounded' : ''}`}>
        <p className="text-base">spelen om te leren · spelen om te groeien</p>
        <h3 className="lab-balance mt-4 max-w-[14ch] text-[40px] font-semibold leading-[1.02] tracking-tight @3xl:text-[64px]">inner growth for outer change.</h3>
      </section>
      <section className="bg-ig-cream px-6 pb-12 @3xl:px-12" style={on ? undefined : { paddingTop: 48 }}>
        <h3 className="text-[28px] font-semibold leading-tight">waar kom jij voor?</h3>
        <div className="mt-6 flex flex-wrap gap-2">
          {['onderwijs', 'organisaties', 'zorg', 'trainers'].map((a) => (
            <span key={a} className="rounded-[var(--r-tag)] bg-white px-4 py-2 text-base">{a}</span>
          ))}
        </div>
      </section>
    </div>
  )
}
