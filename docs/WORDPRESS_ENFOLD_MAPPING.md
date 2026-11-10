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
| Card hover (the hand) | Column / Masonry item | wrapper `ig-card` (+ `--orange` / `--yellow`, + `--outline` on a background of the card colour), inside `ig-card__body` and `ig-card__media` | `cards.css`, `cards.js`, `/assets/brand/innergames-hand.svg`, `innergames-hand-outline.svg` | The hand has the card colour (`--card-bg`) and is the wrapper's `::before` with the hand as a mask; the outline is `::after` with the outline mask. Leave about 100 px above a row of cards for the hand. |
| Page transition (scribble) | none | none (added by the script) | `transition.css`, `transition.js`, `draw/scribble.svg`, hand SVG | Not the View Transitions API: its snapshots can't show a live drawing. `initPageLinks()` scribbles in on a same-site link click, then loads the page; the new page starts covered and scribbles out (sessionStorage flag). `mode: 'short'` for the user test. Reduced motion: no transition. |
| Game box scene | Color Section | `ig-boxscene` + `ig-section--rounded` on the section; `ig-boxscene__text` and `ig-boxscene__stage` (optional `ig-boxscene__card` images, `--i: 0..4`, the `ig-boxscene__box` image and `ig-boxscene__shadow`) | `boxscene.css`, `boxscene.js` | Two columns, no sticky. Runs from 25% in view until the section is centred. Needs cut-out PNGs. See the overflow rule above. |
| Footer reveal | last Color Section + footer | `ig-reveal-cover` (+ `ig-section--rounded`) on the last section, `ig-footer` (+ `--orange`) on the footer; `<span class="ig-footer-hand">` (option A) or `<figure class="ig-footer-photo">` (option B); `ig-footer__mark` on the underline svg | `footer.css`, `footer.js`, hand SVG, `draw/underline.svg` | The footer is sticky at the bottom, under the page. The cover must be the element right before the footer. The footer columns need `position: relative; z-index: 1` so the hand stays behind them. |
| Menu | Code Block as a direct child of the page wrapper | `ig-menubar` (logo + phone, scroll away), `ig-menu` with `ig-menu__toggle`, `ig-menu__list`, items `ig-menu__item` (`aria-current="page"` on the current one) and `ig-menu__cta` | `header.css`, `menu.js`, hand SVG | `menu.js` adds `.is-stuck` (shadow, 94%) and opens the folded list below 1100 px. Replaces the normal Enfold header. |
