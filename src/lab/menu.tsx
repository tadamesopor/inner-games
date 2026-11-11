// 10 menu: the real header of the prototype, on a small mock page with its own scroll, so you can see
// the bar turn into the compact floating bar
import { ALT, GAMES, PHOTOS } from '../data'
import { Header, Photo } from '../wf'
import type { Effect } from './ui'

export const menu: Effect = {
  n: '10',
  name: 'menu',
  cls: '.ig-nav',
  what: 'Eén balk op het raster van de pagina: links het logo (dat is home), in het midden zes rustige items, rechts zoeken, de winkelmand en de oranje knop. Bij hover komt een lichtgeel vlak achter het item en een mini-hand op. Scroll in het voorbeeld: na 200px wordt het een compacte crème balk met een eigen achtergrond.',
  why: 'Eén luid ding in het menu, de knop. Smaller dan 1024px: logo, mand en een menuknop die het menu over het hele scherm opent.',
}

export function MenuDemo({ on }: { on: boolean }) {
  return (
    <div className="lab-frame @container">
      <div className="h-[620px] overflow-y-auto bg-white">
        {on ? (
          <Header active="games" />
        ) : (
          <div className="flex items-center justify-between px-6 py-5">
            <img src="/assets/logo.png" alt="InnerGames" className="h-10 w-auto" />
            <span className="text-[15px]">workshops · spellen · projecten · train-de-trainer · ons team · contact</span>
          </div>
        )}

        {/* a mock games page, long enough to scroll */}
        <section className="ig-section--rounded bg-ig-orange px-6 pb-16 pt-14 @3xl:px-12">
          <p className="text-base">onze spellen</p>
          <h3 className="mt-3 max-w-[16ch] text-[40px] font-semibold leading-[1.02] tracking-tight @3xl:text-[56px]">spelen om te leren, spelen om te groeien</h3>
        </section>
        <section className="bg-ig-cream px-6 pb-16 @3xl:px-12">
          <div className="grid gap-6 @2xl:grid-cols-3">
            {GAMES.slice(0, 6).map((g) => (
              <article key={g.slug} className="rounded-[var(--r-box)] bg-white p-[10px]">
                <Photo src={g.photo} alt={ALT[g.photo] ?? g.title} sizes="300px" contain className="aspect-[4/3] w-full rounded-[8px]" />
                <p className="px-2 pb-2 pt-3 text-lg font-semibold leading-tight">{g.title}</p>
                <p className="px-2 pb-2 text-base">{g.price}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="grid items-center gap-8 bg-white px-6 py-16 @3xl:grid-cols-2 @3xl:px-12">
          <div>
            <h3 className="text-[28px] font-semibold leading-tight">samen aan tafel, vanuit eindhoven</h3>
            <p className="mt-3 max-w-[44ch] text-base leading-relaxed">Scroll terug naar boven: de balk wordt weer gewoon, zonder eigen achtergrond.</p>
          </div>
          <Photo src={PHOTOS.tafel} alt={ALT[PHOTOS.tafel]} className="aspect-[4/3] w-full rounded-[var(--r-box)]" />
        </section>
      </div>
    </div>
  )
}
