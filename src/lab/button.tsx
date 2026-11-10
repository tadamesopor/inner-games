// 05 split button
import { Btn } from '../wf'
import { SplitBtn, type Effect } from './ui'

export const button: Effect = {
  n: '05',
  name: 'gesplitste knop',
  cls: '.ig-btn-split',
  what: 'Twee losse, hoekige delen met 3px ertussen. Bij hover vervormen ze elk apart als zacht karton, rolt de tekst omhoog en de pijl opzij, en veren ze terug naar recht en iets donkerder.',
  why: 'Alleen voor de hoofdactie. Gewone links blijven gewone links.',
}

export function ButtonDemo({ on }: { on: boolean }) {
  return (
    <div className="lab-frame grid gap-px bg-ig-ink/10 @container @3xl:grid-cols-[1.2fr_1fr]">
      <div className="flex flex-col items-start gap-4 bg-ig-cream p-8">
        <p className="text-[13px] text-ig-ink/70">op crème: oranje en inkt</p>
        {on ? <SplitBtn>boek een workshop</SplitBtn> : <Btn variant="primary" className="w-auto!">boek een workshop</Btn>}
        {on ? <SplitBtn tone="ink">speel het spel</SplitBtn> : <Btn variant="dark" className="w-auto!">speel het spel</Btn>}
        <a href="#fx-split" className="text-base underline underline-offset-4">alle spellen</a>
      </div>
      <div className="flex flex-col items-start gap-4 bg-ig-orange p-8">
        <p className="text-[13px] text-ig-ink">op oranje: crème</p>
        {on ? <SplitBtn tone="cream">bekijk het spel</SplitBtn> : <Btn variant="light" className="w-auto!">bekijk het spel</Btn>}
        <p className="max-w-[34ch] text-base">De link eronder blijft een gewone link: alleen de hoofdactie krijgt een pijl.</p>
      </div>
    </div>
  )
}
