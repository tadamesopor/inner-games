// 10 menu: separate small items in the centre that stay at the top; logo and phone scroll away
import type { Effect } from './ui'
import { SplitBtn } from './ui'

export const menu: Effect = {
  n: '10',
  name: 'menu',
  cls: '.ig-menu',
  what: 'Losse kleine menu-items in het midden, elk een eigen vlakje. Bij scrollen gaan logo en telefoonnummer weg en blijven alleen de items bovenaan staan. Bij hover komt een mini-hand op; bij de huidige pagina blijft hij staan.',
  why: 'Het menu blijft bij de hand zonder een volle balk. Kijk bovenaan deze pagina: dit is het menu. Op een telefoon blijft het gewone menu.',
}

const ITEMS = ['spellen', 'workshops', 'projecten', 'over ons', 'contact']

/** the lab's own header is the demo */
export function SiteMenu({ on }: { on: boolean }) {
  return (
    <>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 pb-2 pt-5 @3xl:px-8">
        <img src="/assets/logo.png" alt="InnerGames" className="h-12 w-auto" />
        <a href="tel:+31621527855" className="hidden text-[15px] @3xl:block">
          +31 (0)6 – 215 27 855
        </a>
      </div>
      <nav className={on ? 'ig-menu' : 'mx-auto flex w-fit flex-wrap justify-center gap-4 pb-4'} aria-label="Hoofdmenu (voorbeeld)">
        {ITEMS.map((item) => (
          <a key={item} href="#fx-menu" className={on ? 'ig-menu__item' : 'text-[15px] underline-offset-4 hover:underline'} aria-current={item === 'spellen' ? 'page' : undefined}>
            {item}
          </a>
        ))}
        {on && (
          <span className="ig-menu__cta">
            <SplitBtn>boek een workshop</SplitBtn>
          </span>
        )}
      </nav>
    </>
  )
}
