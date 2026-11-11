# Prototype fixes: round 5 (for Claude Code)

Hero, menu, card sizes, a consistent card style, and The Elemental Five game inside the prototype. The rules from the earlier prompt files still count (brand, craft standard, WordPress/Enfold notes). Commit per section with short lowercase messages, in my voice, without co-author lines.

Reference demos are in `docs/reference/`: `hero_achtergronden.html` (waves) and `hero_concepten_2.html` (concept 1, "foto's op tafel").

---

## 1. Homepage hero: photos and game cut-outs on the table

Base: concept 1 from `docs/reference/hero_concepten_2.html`, on the orange + yellow waves (Jaydan's choice: option A, colour "oranje + geel" in `hero_achtergronden.html`). Keep the yellow waves on the right, behind the objects, so the white title stays readable.

**What lies on the table (right half of the hero):**
- 2 session photos as prints: cream border 10 px, 36 px at the bottom, a small handwritten-style caption in the brand font (`energiek team!`, `samen aan tafel`).
- 2 or 3 **cut-out game products** without a frame, with a soft drop shadow: the Sociality box (`sociality-box.png`), The Elemental Five set (`elemental-five-compleet`), and optionally a few Elemental Five cards in a small fan.
- Space them out more than the demo: no object covers more than 20% of another. Tilts between −8° and +8°, all different.
- Everything can still be dragged and tilts while dragging (pointer events, works on touch). After a drag the object stays where it was dropped. Double-click or a small "opruimen" link puts them back.

**Curly arrows with labels (like the arrows on the Sociality product image):**
- 3 hand-drawn-style curly arrows (SVG path, cream, 3 px, round caps, a small arrowhead), each from an object to a small label button:
  - session photo → `bekijk de workshops →` → /workshops
  - Sociality box → `bekijk de spellen →` → /spellen
  - Elemental Five cards → `speel het spel →` → the game (section 6)
- Labels: cream pill-free buttons (`--r-box`), ink text, 18 px. They follow their object when it's dragged (the arrow redraws between object and label).
- The arrows draw themselves once on load (stroke-dashoffset, 600 ms, stagger 150 ms).

**Left half (keep as it is now):** title "spellen en workshops voor teams, klassen en zorg", one sentence, the cream split button "boek een workshop".

**Mobile (390):** no dragging. The objects sit still in a small pile under the text, with the three labels as normal buttons underneath.

**Reduced motion:** no draw-in, no tilt animation.

## 2. Menu: fit the hero

**What's wrong:** a white bar on top of the orange hero looks like two separate things.

**Fix:**
- At the top of the homepage the menu sits **on the orange**: transparent background, cream logo (`logo-cream.png`), cream menu text, and the CTA as a cream button with ink text.
- After 120 px of scroll it turns into the floating cream bar (cream at 92% + blur, soft shadow, `--r-box`), normal logo, ink text, orange CTA. Smooth transition (200 ms).
- Pages without an orange hero keep the cream version from the start.
- Logo, items, search, cart and CTA on one baseline. Check at 1440, 1280 and 1024.
- The current page gets the light yellow box + mini hand. On the orange version that box is cream at 20%.

## 3. Card sizes

On several pages the cards are far too big (one card fills half the screen).

- One grid for all card lists: max content width 1200 px, `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`, gap 24 px. So 3 to 4 cards per row on desktop, 2 on tablet, 1 on mobile.
- Card images 4:3, `object-fit: cover`. Max card width 380 px.
- Titles 22 px, text 16 px, meta 14 px. Same on every page.
- Check: workshops, spellen, projecten, ons team, train-de-trainer, homepage sections.

## 4. The "3D" card border, but in brand colours

I want the slightly 3D look back (offset shadow), but not the black version Ariën didn't like.

- Cards: 1.5 px border + a solid offset shadow 6 px down and 6 px right, **in a darker tint of the surface the card sits on**, never black:
  - on cream: border and shadow `#E8CFA8`
  - on white: `#F0DCC0`
  - on yellow: `#E0A20E`
  - on orange: `#C84413`
- Corners `--r-box` (12 px).
- Hover: the card moves up-left 3 px and the shadow grows to 9 px (it "lifts"). Keep the hand pop-up and the orange hover for workshop cards.
- Make this one CSS class (`.ig-card`) and use it on every card. Remove all other card styles.

## 5. Consistency pass

Go through every page and fix anything that doesn't use the shared styles:
- **Tokens:** one CSS file with all colours, radii (`--r-box`, `--r-section`, `--r-tag`), spacing (8 px scale), shadows, and type sizes. Remove all hard-coded values in components.
- **Components:** one button (the split button for main actions plus one outline style), one card (`.ig-card`), one tag, one section header. Replace every local variant.
- **Type:** only the Gill Sans stack. Titles bold and lowercase. Max 6 sizes.
- **Spacing:** every section has the same top and bottom padding (96 px desktop, 64 px mobile).
- Write what you changed in `docs/STYLE_AUDIT.md`: per page, what was inconsistent and what it is now.

## 6. The Elemental Five game in the prototype

The game is at `C:\Users\damia\Desktop\InnerGames-stage\git\elemental-five-repo2\elemental-five`.

1. Check which version it is: the calm one (rings, card slots, breathing pause) or the older one with the videos. Tell me before copying. If the calm changes are there but not committed, commit them first in that repo.
2. Copy the game's `src` folder to `public/games/elemental-five/` in this project. Use the separate files, not the big single-file build.
3. Add it to the prototype as described in step 8 of `docs/CLAUDE_CODE_MOTION_PROMPT.md`:
   - a "speel het hele spel" block on the Elemental Five page, with a still image and a play button
   - the game loads only after the click, in an `<iframe>`: inline on desktop, full screen on mobile with a close button
   - the shop and workshop buttons inside the game go to the prototype pages via `postMessage`
   - the test tool logs `e5:start`, `e5:element-done` and `e5:finished`
4. The "speel het spel →" label in the hero (section 1) opens it.
5. Check: play the full game at 1280 × 800 and 390 × 844 inside the prototype, with no console errors.

**About Vercel:** I couldn't deploy the game because of a contributor/collaborator error. On the free Vercel plan, a private repo only deploys if the commit author is the owner of the Vercel account. Once the game is part of this prototype, it deploys with the prototype. If the prototype hits the same error, tell me the exact message and check:
- that `git config user.email` in this repo is the email of the GitHub account that's linked to Vercel
- or deploy from my laptop with the Vercel CLI (`npx vercel --prod`), which doesn't depend on commit authors.

---

## When you're done

- Screenshots of every page at 1440 and 390 in `docs/screens/round5/`, plus a 15-second recording of the hero.
- `npm run build` passes, and there are no console errors.
- Tell me per section in two lines what you changed and what you're unsure about.
