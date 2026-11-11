# WordPress + Enfold mapping

How the prototype's parts move to the real site. This file was missing, so it starts with the motion effects.
Add the page and element mapping here when it's written.

## Motion: setup (once)

All effects live in `src/motion/` as plain CSS and plain JS (ES modules, no framework).

1. Copy `src/motion/*.css` into the Enfold child theme, for example `css/ig-motion.css` (one file, in this order:
   `tokens`, `pencil`, `sections`, `backgrounds`, `buttons`, `cards`, `transition`, `boxscene`, `footer`, `header`).
   Small things can also go in Enfold → Quick CSS, but one file is easier to keep in sync.
2. Copy `src/motion/*.js` into `js/ig-motion/` and enqueue `index.js` as a module:
   ```php
   add_action('wp_enqueue_scripts', function () {
     wp_enqueue_style('ig-motion', get_stylesheet_directory_uri() . '/css/ig-motion.css', [], '1.0');
     wp_enqueue_script_module('ig-motion', get_stylesheet_directory_uri() . '/js/ig-motion/index.js', [], '1.0');
   });
   ```
   Remove the `import './x.css'` lines at the top of `index.js` (in WordPress the CSS is enqueued separately),
   and add `document.addEventListener('DOMContentLoaded', () => init())` at the bottom.
3. Container queries: the CSS uses `@container` for the phone sizes. Give the page wrapper
   `container-type: inline-size` (for example `#wrap_all { container-type: inline-size; }` in Quick CSS).
4. **Never put `overflow: hidden` on a section that contains a scroll animation (spelbox, footer box), or on its
   parents.** `hidden` makes a scroll container and the scroll timeline stops moving. Use `overflow: clip`.

Reduced motion works on its own: `prefs.js` sets `.ig-reduced` on `<html>` when the visitor's system asks for less
motion, and `tokens.css` has the same rule as a media query for when JS doesn't run. Every effect then shows its
end state.

## Motion: per effect

| Effect | Enfold element | Class | Files | Notes |
|---|---|---|---|---|
| Pencil line (shared) | none | `ig-pencil`, `ig-draw` + `is-drawn`; `<svg data-pencil="name">` for a drawn mark | `pencil.css`, `pencil.js`, `/assets/draw/*.svg` | Every drawn mark (pawn, tick, arrow, underline, pointer, scribble) is an SVG file in `/assets/draw/`. To use real drawings: replace the file, keep the name (paths only; class `ig-fill` for a filled shape). `hydrateMarks()` fills every `data-pencil` svg; `setPencilBase()` points to the theme folder. |
| Rounded section bottom | Color Section | `ig-section--rounded` on the section | `sections.css` | Radius from `--r-section` (56 px, 28 px on a phone). The section after it slides up underneath automatically. Optional `--ig-next-pad`. Hero: also `ig-hero--peek`. |
| Speelpad | Color Section (or a group of sections in one wrapper) | `ig-bg-speelpad` on the wrapper; `data-speelpad-stop` on each block the path stops at | `backgrounds.css`, `speelpad.js`, `pawn.js`, `/assets/img/pawn/meeple-pawn.webp`, `draw/tick.svg` | The pawn is one component (`pawn.js`, `.ig-pawn`): swap it for a 3D model there without touching the path. The blocks need their own background and 44 px or more of space on both sides. Data attributes: use a Code Block wrapper, or a class `ig-stop` and change the selector in `speelpad.js`. |
| Split button | Code Block or shortcode | `ig-btn-split` (+ `--ink` or `--cream`) | `buttons.css`, `draw/arrow.svg` | Needs the inner markup with two copies of the label and the arrow (for the roll); see the comment at the top of `buttons.css`. Main actions only. |
| Card (one style) | Column / Masonry item | wrapper `ig-card` (+ `--hot` for workshop cards, `--text` for text-only cards, `--still` for cards that are not links), inside `ig-card__body` and `ig-card__media`; type `ig-card__title`, `ig-card__text`, `ig-card__meta`; the list around it `ig-grid` | `cards.css`, `cards.js`, `tokens.css`, `/assets/brand/innergames-hand.svg` | White, a 1.5 px line and a 6 px offset shadow in a darker tint of the surface (`--ig-edge`, set by the section background: give the Enfold Color Section the class `ig-on-cream`, `ig-on-white`, `ig-on-yellow` or `ig-on-orange`). Hover: lifts 3 px, shadow 9 px, the hand pops up from behind. `ig-grid`: auto-fill, min 280 px, max 380 px a card, 72 px between rows for the hand. |
| Page transition (scribble) | none | none (added by the script) | `transition.css`, `transition.js`, `draw/scribble.svg`, hand SVG | Not the View Transitions API: its snapshots can't show a live drawing. `initPageLinks()` scribbles in on a same-site link click, then loads the page; the new page starts covered and scribbles out (sessionStorage flag). `mode: 'short'` for the user test. Reduced motion: no transition. |
| Game box scene | Color Section | `ig-boxscene` + `ig-section--rounded` on the section; `ig-boxscene__text` and `ig-boxscene__stage` (optional `ig-boxscene__card` images, `--i: 0..4`, the `ig-boxscene__box` image and `ig-boxscene__shadow`) | `boxscene.css`, `boxscene.js` | Two columns, no sticky. Runs from 25% in view until the section is centred. Needs cut-out PNGs. See the overflow rule above. |
| Footer reveal | last Color Section + footer | `ig-reveal-cover` on the main content wrapper (Enfold: `#main` without the footer), `ig-footer` (+ `--orange`) on the footer; `<span class="ig-footer-hand">` (option A) or `<figure class="ig-footer-photo">` (option B); `ig-footer__mark` on the underline svg | `footer.css`, `footer.js`, hand SVG, `draw/underline.svg` | The footer is sticky at the bottom, under the page. The cover must be ONE element holding all content and come right before the footer: the sticky footer is painted over anything that isn't inside it (found in the prototype: it caught the clicks on the buttons). On a phone the footer scrolls normally. The footer columns need `position: relative; z-index: 1` so the hand stays behind them. |
| Menu | Code Block at the top of the page wrapper (replaces the normal Enfold header) | `ig-nav` + a tone: `ig-nav--white`, `--cream`, `--yellow`, `--orange`, or `--hero` (transparent, the hero slides up under it); inside `ig-nav__inner` > `ig-nav__bar`: `ig-nav__logo` (two images: the normal logo and `ig-nav__logo--cream`), `ig-nav__menu` with six `ig-nav__item` (`aria-current="page"` on the current one), `ig-nav__tools` (`ig-nav__icon` search and cart, the `ig-btn-split`, `ig-nav__toggle` with `data-nav-open`); the full screen menu `ig-nav__sheet` | `header.css`, `menu.js` (`initNav`), hand SVG | The tone is the colour of the first section, per page template. On orange: cream logo, cream text, cream button, hover box cream at 20%. Everywhere else the floating cream bar from the start. `menu.js` adds `.is-compact` after 120 px: the smaller cream bar. From 1024 to 1279 px the items are tighter; below 1024 px: logo, cart and the menu button. Every element with an id gets `scroll-margin-top: 96px`. |
| Hero (photos on the table) | Color Section (orange, `ig-section--rounded`, class `ig-hero`) with a Code Block for the table | `<svg class="ig-hero__waves">` as the first child; `ig-hero__body` around text and table; `ig-table` with `ig-table__item` (`ig-table__print` for a photo, `ig-table__cutout` for a product PNG; `data-key`, `data-at="x,y,deg"`, `data-pile="x,y,deg"`, `style="--w: 250"`), `ig-table__labels` with `ig-table__label` (`data-for`, `data-at`) and `ig-table__tidy` | `hero.css`, `hero.js` (`initHeroWaves`, `initHeroTable`) | Places are in a 640 px design frame and scale with the width. Drag with pointer events (mouse and touch); the arrows are drawn by `hero.js` between object and label. Narrower than 768 px: a still pile, the labels are normal buttons. Reduced motion: still waves, no draw-in, no tilt. The hero has `margin-top: -88px` so it sits under the transparent menu. The client logos under the hero are `ig-proof-logo`. |
| The Elemental Five game | Code Block on the product page: a still image with a button, and the iframe | `<iframe src="/games/elemental-five/index.html" allow="autoplay; fullscreen">`, loaded only after the click | `/games/elemental-five/` (a copy of the game repo's `src`, 4.4 MB, without the unused 3D model), `js/bridge.js` | The iframe keeps the game standalone: its css and the theme's never mix. Desktop: inline in a rounded frame; phone: full screen with a "sluit het spel" bar above it. `bridge.js` (only active in an iframe) sends `e5:link` (koop / workshop) so the site opens its own pages, plus `e5:start`, `e5:element-done` and `e5:finished` for the user test. In WordPress: point `LINKS` in `js/config.js` to the WooCommerce pages and drop `bridge.js`, or keep it and listen with a few lines of js. |
