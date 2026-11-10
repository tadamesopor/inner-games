// 10 menu: the tiles in the centre stay at the top, logo and phone scroll away. shown on a small mock
// page with its own scroll, so you can see the sticky behaviour
import { useRef } from 'react'
import { ALT, GAMES, PHOTOS } from '../data'
import { Photo } from '../wf'
import { initMenu } from '../motion'
import { SplitBtn, useEffectInit, type Effect } from './ui'

export const menu: Effect = {
  n: '10',
  name: 'menu',
  cls: '.ig-menu',
  what: 'Losse, duidelijke menu-tegels in het midden. Scroll in het voorbeeld: logo en telefoonnummer gaan weg, de tegels blijven bovenaan, met een zachte schaduw en iets kleiner. Bij hover komt een mini-hand op in de kleur van de tegel; de huidige pagina is oranje en houdt zijn hand.',
  why: 'Het menu blijft bij de hand zonder een volle balk. Smaller dan 1100px vouwen de tegels in één menu-tegel die de lijst opent.',
}

const ITEMS = ['spellen', 'workshops', 'projecten', 'over ons', 'contact']

export function MenuDemo({ on }: { on: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useEffectInit(ref, initMenu, on)
  return (
    <div className="lab-frame @container">
      <div className="h-[620px] overflow-y-auto bg-white">
        <div className="ig-menubar">
          <a href="#fx-menu" className="ig-menubar__logo">
            <img src="/assets/logo.png" alt="InnerGames" />
          </a>
          <a href="tel:+31621527855" className="ig-menubar__phone">
            +31 (0)6 – 215 27 855
          </a>
        </div>
        {on ? (
          <nav ref={ref} className="ig-menu" aria-label="Hoofdmenu (voorbeeld)">
            <button type="button" className="ig-menu__toggle ig-menu__item" aria-expanded="false">
              menu
            </button>
            <div className="ig-menu__list">
              {ITEMS.map((item) => (
                <a key={item} href="#fx-menu" className="ig-menu__item" aria-current={item === 'spellen' ? 'page' : undefined}>
                  {item}
                </a>
              ))}
              <span className="ig-menu__cta">
                <SplitBtn>boek een workshop</SplitBtn>
              </span>
            </div>
          </nav>
        ) : (
          <nav className="-mt-[52px] mx-auto flex w-fit gap-5 pb-4 text-[15px]" aria-label="Hoofdmenu (voorbeeld, uit)">
            {ITEMS.map((item) => (
              <a key={item} href="#fx-menu" className="hover:underline">
                {item}
              </a>
            ))}
          </nav>
        )}

        {/* a mock games page, long enough to scroll */}
        <section className="ig-section--rounded mt-8 bg-ig-orange px-6 pb-16 pt-14 @3xl:px-12">
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
            <p className="mt-3 max-w-[44ch] text-base leading-relaxed">Scroll terug naar boven: logo en telefoonnummer komen terug en de tegels gaan weer op hun plek staan.</p>
          </div>
          <Photo src={PHOTOS.tafel} alt={ALT[PHOTOS.tafel]} className="aspect-[4/3] w-full rounded-[var(--r-box)]" />
        </section>
      </div>
    </div>
  )
}
