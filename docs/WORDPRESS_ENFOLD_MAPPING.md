# WordPress + Enfold mapping

How the prototype's parts move to the real site. This file was missing, so it starts with the motion effects.
Add the page and element mapping here when it's written.

## Motion: setup (once)

All effects live in `src/motion/` as plain CSS and plain JS (ES modules, no framework).

1. Copy `src/motion/*.css` into the Enfold child theme, for example `css/ig-motion.css` (one file, in this order:
   `tokens`, `sections`, `backgrounds`, `buttons`, `cards`, `transition`, `boxscene`, `footer`, `header`).
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
| Rounded section bottom | Color Section | `ig-section--rounded` on the section | `sections.css` | The section after it slides up underneath automatically. Optional `--ig-next-pad` to change its top padding. Hero: also `ig-hero--peek` (not full screen, ~104 px of the next section visible). |
| Background A: speelpad | Color Section (or a group of sections in one wrapper) | `ig-bg-speelpad` on the wrapper; `data-speelpad-stop` on each block the path stops at | `backgrounds.css`, `speelpad.js`, `/assets/meeple-pawn.png` | Enfold can't add a data attribute in the editor: add it with a Code Block wrapper, or give the blocks a class `ig-stop` and change the selector in `speelpad.js`. The blocks need empty space on both sides (40 px or more), otherwise the path runs along the left edge. |
| Background B: opstelling | Color Section | `ig-bg-opstelling`; `data-opstelling-ring="0"`, `"1"`, `"2"` on blocks inside | `backgrounds.css`, `opstelling.js` | Position and size with `--ig-opstelling-x`, `--ig-opstelling-y`, `--ig-opstelling-size`. |
| Background C: adem | Color Section | `ig-bg-adem` | `backgrounds.css`, `opstelling.js` (only to pause off screen) | Position and size with `--ig-adem-x`, `--ig-adem-y`, `--ig-adem-size`. |
| Split button | Button (or a Code Block) | `ig-btn-split` (+ `ig-btn-split--dark` on orange or dark) | `buttons.css` | Needs the two inner spans (label + arrow). Enfold's Button element doesn't allow that: use a small Code Block or a shortcode. Only for main actions. |
| Card hover | Column / Masonry item | `ig-card-lift`; the image wrapper gets `ig-card-lift__media` | `cards.css` | Only with a mouse (`hover: hover`). |
| Page transition | none | none | `transition.css` | Works on normal page loads in Chrome, Edge and Safari 18+ through `@view-transition { navigation: auto; }`, no JS. Same-site links only. Other browsers just load the page. `transition.js` is only for the prototype (one page app). Uses `/assets/logo-cream.png`: upload it and fix the path in the CSS. |
| Game box scene | Color Section with two columns | `ig-boxscene` (+ `ig-boxscene--fan` for the cards) on the section; inside: `ig-boxscene__stage` with `ig-boxscene__card` images (max 5) and an `ig-boxscene__box` image last | `boxscene.css`, `boxscene.js` | Needs cut-out (transparent) PNGs. Firefox gets a time-based version that starts when the block is in view. See the overflow rule above. |
| Footer box | Footer Color Section | `ig-footer` on the section, `ig-footer-box` on the image | `footer.css` | Image is decorative (`alt=""`). See the overflow rule above. |
| Compact menu bar | Code Block in the header area (or `wp_footer` hook) | `ig-header-pill` | `header.css`, `header.js` | A separate small `<nav>` with the main links. Desktop only; the normal Enfold header stays as it is. |
