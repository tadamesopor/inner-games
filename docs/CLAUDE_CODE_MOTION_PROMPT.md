# Prompt for Claude Code: real photos + motion, inspired by Aardvark Book Club

Put this file in `docs/` of `innergames-prototype`, then tell Claude Code:
> Read docs/CLAUDE_CODE_MOTION_PROMPT.md and follow it. Start with step 0 and your plan. Don't build anything before I say go.

---

## Context

You already know this project from `docs/CLAUDE_CODE_BRIEF.md`, `CLAUDE.md`, `docs/INNERGAMES_CONTENT.md` and `docs/WORDPRESS_ENFOLD_MAPPING.md`. Read them again if you haven't in this session.

I want the prototype to feel more alive and more like InnerGames. My reference is **aardvarkbookclub.com** (a book subscription site). I studied it with a screen recording. These are the things I liked:

1. **Rounded bottoms on sections.** The big coloured hero ends with large rounded corners, and the next section's colour shows underneath. It makes the page feel like stacked cards and shows there's more below.
2. **Animated organic background shapes.** Big, soft, wavy blob shapes behind the content, in a slightly lighter or darker tint of the section colour. They move very slowly.
3. **Page transitions.** When you go to another page, a big shape in the brand colour sweeps over the screen with the logo mark in the middle, then reveals the new page.
4. **Split buttons.** A label part plus a separate square part with an arrow (→). On hover the arrow moves a little.
5. **A product box animation.** Their subscription box sits tilted in the footer, and further up a box opens while you scroll. For InnerGames this would be a **game box**, for example Sociality or The Elemental Five.
6. **Cards that react on hover:** they lift a little, and a small shape pops up behind them.
7. **A sticky pill-style menu** in the middle of the top.

**Don't copy Aardvark's assets, logo, shapes or exact layout.** Recreate the techniques with InnerGames' own colours, photos and logo.

## The most important rule: calm, not loud

Aardvark is loud on purpose: pink, confetti, stickers, rotated banners. **InnerGames is "a serious organisation that does playful things".** Ariën (the owner) has already said:
- the black borders were too much
- the background videos in the game were too distracting

So:
- Motion supports the content and is never the content. If you notice it while reading, it's too much.
- **No confetti, no stickers, no rotated marquee banners, no autoplaying video.**
- Use the brand colours (orange `#EA561F`, yellow `#FAB512`, ink `#2A1810`, cream `#FFF6E6`), with tints at low contrast for shapes.
- Everything respects `prefers-reduced-motion: reduce`. Then the shapes stand still, the page transition is instant, and scroll animations show their end state.
- Only animate `transform` and `opacity`, so there's no layout shift and it runs at 60 fps on a normal laptop and phone.
- Text contrast stays WCAG AA. Shapes never sit behind body text in a way that lowers contrast.

## Craft standard: it must look made by a good designer, not generated

This is the bar for every step. If something doesn't meet it, tell me instead of shipping it.

**Things that make a site look AI-made, so avoid them:**
- default-looking gradients, glows, glassmorphism, and shadows on everything
- every section centred, every card the same size, the same rounded corners everywhere
- generic icon sets (Lucide/Heroicons) used as decoration, emoji in the interface
- filler text, invented quotes, stock photos
- motion that's all the same `ease-in-out 300ms`, or things that bounce and fade in on every scroll
- perfect, symmetric, computer-drawn shapes where a hand-made feel fits better

**What I want instead:**
- **Real material first.** Real InnerGames photos, my own product photos and drawings when I add them (they go in `public/assets/img/own/` and `public/assets/draw/`), the real logo, the real card art. Leave a clear slot for a missing asset; never fill it with something generic.
- **Hand-made feel for the illustrated parts** (the game path, the pawn, the rings): use my drawn SVGs when I add them. Until then, make a simple placeholder version and mark it `TODO: replace with drawing`.
- **A real type system.** Gill Sans (or the agreed fallback), one type scale with no more than 6 sizes, line length 60 to 75 characters for body text, tight headings, and generous but consistent spacing on an 8 px grid.
- **Layout with rhythm.** Mix full-width photo moments, narrow text columns and asymmetric blocks. Not every section is a centred title with three cards.
- **Motion with character:**
  - a small set of named easing curves in CSS variables, for example `--ease-out: cubic-bezier(.2,.7,.2,1)` and `--ease-soft: cubic-bezier(.4,0,.2,1)`
  - durations of 150 ms for small UI, 300 to 450 ms for larger moves
  - stagger only where it tells something, for example the cards leaving the box
  - nothing animates just because it entered the screen
- **Details:** consistent focus states, hover states that make sense, image crops that keep faces in frame, no widows in headings (`text-wrap: balance`), and real Dutch copy.
- Before each commit, compare the page with the Aardvark recording and with innergames.nl. It should feel at least as finished as Aardvark, and clearly like InnerGames.

## It has to work in WordPress + Enfold later

Build every effect so it can move to the real site:
- **Plain CSS first, then a small vanilla JS module.** No React-only animation libraries. Put the effects in `src/motion/` as plain `.css` and `.js` files that the React app imports, so the same files can later go into an Enfold child theme (Quick CSS + `wp_enqueue_script`).
- **GSAP + ScrollTrigger is allowed** (it's free), but only for the game box scene, and only if CSS scroll-driven animations (`animation-timeline: view()`) can't do it with a fallback.
- Each effect hangs on a **class name** (for example `.ig-blob-bg`, `.ig-section--rounded`, `.ig-btn-split`), because in Enfold you can give a section or button a custom CSS class.
- For each effect, add to `docs/WORDPRESS_ENFOLD_MAPPING.md`: which Enfold element it goes on, which class, which CSS/JS file, and anything custom.

## Don't break the user test

- Test mode (`src/test.tsx`) logs page changes through `go()` and clicks through the `bus` ref. Keep both working with page transitions.
- **Page transition max 500 ms in total.** It must not block clicks after it ends.
- Don't move the things the tasks depend on (prices, the booking form, "wie begeleidt", the previews). After the changes, run one full test session (round 1, any profile) and tell me if anything changed for a task.

---

## Steps (one commit per step, short lowercase messages)

### Step 0: plan + real photos (do this first)

**Photos.** Replace all images with the real InnerGames photos:
- The URLs are in `docs/Figma_Make_Prompt_v5_Echte_Fotos_Rustige_Stijl.md` section 3, and the product photos are in `docs/INNERGAMES_CONTENT.md`.
- Write `scripts/fetch-images.mjs`. It downloads them once into `public/assets/img/` (folders `workshops/`, `games/`, `team/`, `projects/`, `site/`), makes web versions (WebP, 1600 px and 800 px wide; use `sharp`), and writes `public/assets/img/SOURCES.md` listing each file's original URL.
- Use the local files in the app (with `srcset`), never hotlinks.
- I'll add `public/assets/img/games/sociality-box.png` myself (a cut-out photo of the Sociality box).
- Note in `docs/OPEN_QUESTIONS.md`: "Ariën: OK to use these photos? Do you have cut-out (transparent) photos of the game boxes in high resolution?"

**Plan.** Then reply with your plan for steps 1 to 7: for each step, what you'll build, which files, and the risk. Wait for my "go".

### Step 1: motion lab page (to choose first)

Make a hidden route `/motion-lab`, not in the menu, where every effect below is shown on its own with a short label. Add an on/off toggle per effect, and a "reduced motion" toggle. I'll show this page to Ariën so we can choose together before it goes onto the real pages. Build each effect here first, then apply it to the pages after I confirm.

### Step 2: rounded section bottoms

- `.ig-section--rounded`: bottom corners of about 56 px radius on desktop and 28 px on mobile. The next section slides up underneath (negative top margin), so its colour peeks out.
- Use it on the homepage hero and the coloured sections, not on every section.
- The hero is **not** a full 100vh. Leave about 80 to 120 px of the next section visible, so people see there's more. A rounded edge alone doesn't invite scrolling; content peeking out does.

### Step 3: a background that is unmistakably InnerGames (not blobs)

Generic blobs are what every site has. The background has to come from InnerGames itself: games, the floor-card method, and body-focused work. Build these three concepts in the motion lab, so Ariën and I can choose. Use **one concept per page at most**.

**A. "Speelpad" (the game path), my favourite for the homepage**
- A hand-drawn, dashed board-game path (like the "levensweg" in Kansen Keren) runs through the page behind the sections. It **draws itself while you scroll** (SVG `stroke-dashoffset`, linked to scroll).
- A small pawn walks along the path as you scroll down. Use the meeple asset if it's still in `public/assets`; otherwise draw a simple pawn in SVG.
- The path makes a small stop ("speelvakje") next to the main blocks: waar kom jij voor, workshops, uitgelicht spel, team. The pawn pauses there for a moment.
- Colour: orange at about 25% on cream, 3 to 4 px wide. It never crosses text; it runs in the margins and between sections.
- Why: it says "spelen om te groeien" (a path, playing, growing), and it invites people to scroll, without words.

**B. "Opstelling" (floor cards from above), for the games pages and The Elemental Five**
- Faint concentric rings (the three rings of the real Elemental Five floor layout), with five small round "floor cards" in the element colours (vuur, lucht, aarde, water, ether), as if you look down on an opstelling.
- Motion: the whole set turns very slowly (one turn per 120 s or slower). When a section comes into view, one ring lights up a little.
- Why: it links the website to the game and to the method.

**C. "Adem" (breath), an option for the team or "hoe we werken" section**
- One large, soft ring behind the heading that slowly grows and shrinks at a breathing pace (about 5 s in, 5 s out), at very low contrast.
- Why: InnerGames works with the body and the breath (Wies van Beek gives breathing training). It's the calmest option.

For all three:
- Draw everything in code (SVG + CSS/JS), in brand colours at low contrast. No images, no copied shapes.
- Pause when off screen (IntersectionObserver). With reduced motion, show a still version: the path fully drawn and the pawn at the end, the rings standing still, the breath ring at rest.
- Never behind body text in a way that lowers contrast.
- `.ig-bg-speelpad`, `.ig-bg-opstelling` and `.ig-bg-adem` as class names, so they work in Enfold too.

### Step 4: split buttons and card hover

- `.ig-btn-split`: a label part + a square arrow part, `rounded-full` on the outside. On hover the arrow slides 3 px to the right and the arrow part gets a slightly darker tone. Clear focus ring. Use it for all main buttons ("vraag deze workshop aan", "speel de preview", "boek een workshop"). Secondary buttons stay simple.
- Cards: on hover lift 4 px, get a slightly stronger soft shadow, and the image zooms to 1.04 over 300 ms. Nothing on touch devices.

### Step 5: page transitions

- On page change: a curved shape in orange `#EA561F` with the InnerGames hand logo in the centre sweeps up over the screen (about 220 ms), the new page is set, then the shape sweeps away upwards (about 220 ms). 500 ms max in total.
- Use the **View Transitions API** where it exists: in the prototype `document.startViewTransition()` around `go()`, and write down in the mapping doc how to do it in WordPress (`@view-transition { navigation: auto; }` with `::view-transition-old/new`). Without support, or with reduced motion, there is no transition, just the normal page change.
- The first page load gets no transition.

### Step 6: game box scene

On the game page of Sociality, and on the homepage "uitgelicht spel" block:
- The box (cut-out PNG) comes in while you scroll the section into view: from tilted 12° and slightly smaller to straight and full size. Then for The Elemental Five, the five element cards (card 1 of each element, from the game's assets) slide out of the box in a fan, one by one.
- Scroll-driven with CSS `animation-timeline: view()` if possible, otherwise GSAP ScrollTrigger. It plays once (it doesn't reverse when you scroll back up).
- Without JS or with reduced motion: the end state (box straight, cards fanned).
- A box with an opening lid needs a 3D model or a photo sequence. **Don't fake it.** Note it in `OPEN_QUESTIONS.md` as an option if Ariën has photos of the box opening.

### Step 7: footer box and sticky menu

- Footer: a large product photo of a game box, tilted about −15° and cropped at the bottom edge, that rotates 3 to 4° while the footer scrolls into view. Next to it the contact details and the main links, as now.
- Header: when you scroll down more than 200 px, the menu becomes a compact pill-shaped bar in the centre (cream background, light shadow), and it comes back full at the top. On mobile, keep the current menu.

### Step 8: put the playable Elemental Five game in the prototype (if possible)

I built a full playable online version of The Elemental Five. Read `docs/ELEMENTAL_FIVE_GAME.md` first (if it's not there, ask me for it). It explains the game, the code structure and the design rules.

**Where the game is:** a separate repo, `elemental-five` (plain HTML/CSS/JS, no framework). The newest version, with the 10 November changes (simpler table, rings, card slots, breathing pause), is on my laptop and not committed yet. **Ask me for the folder path.** Then:
1. In the game repo: commit those changes first (short lowercase message in my voice, no Claude co-author line), and run the build and the playthrough test there.
2. Copy the game's `src` folder into this project as `public/games/elemental-five/`. Don't use the 5.7 MB single-file build here, because the separate files load faster and match how it will go into WordPress later.

**How it shows on the site:**
- On the game page of The Elemental Five, below the short preview: a block "speel het hele spel" with a still image (the fan of five card-1s from the game's assets) and a play button.
- The game loads only after that click, in an `<iframe>` (lazy, no download on page load). On desktop it opens inline in a large rounded frame. On phones it opens full screen, with a clear close button.
- Also link to it from the homepage "uitgelicht spel" block, for example the step 6 box scene ending with a "speel het spel" button.
- The iframe keeps the game standalone: its CSS can't leak into the site and the other way round. This is exactly how it will go into Enfold later (iframe in a code block), so note it in `docs/WORDPRESS_ENFOLD_MAPPING.md`.

**Links inside the game:** the "koop het spel" and "boek de workshop" buttons now point to innergames.nl (`LINKS` in `js/config.js`). In the prototype they must go to the prototype's own product and workshop pages. Let the game send a `postMessage` (`{ type: 'e5:link', to: 'koop' | 'workshop' }`) and let the site navigate the top window. Keep the innergames.nl links as the fallback when the game runs on its own (not in an iframe).

**For the user test:** round 1 has the task "find the preview and play it to the end, then: wat zou je nu doen?". Let the game send `e5:start`, `e5:element-done` and `e5:finished` by `postMessage`, and let the test tool (`test.tsx`) log them with a timestamp, the same way it logs other task events. Don't change how the test works otherwise.

**Rules:**
- Don't change card texts (Ariën approved them), and don't add points, timers or winning.
- Ariën finds the background videos too distracting. Don't solve that here; just make sure the game still works if I later swap the background.
- The page transition (step 5) must not run inside the iframe, and the site's motion must not run behind an open full-screen game.
- Sound starts only after a click inside the game (browser rule). Check that it works in the iframe (`allow="autoplay; fullscreen"`).
- If something makes this too heavy or fragile for the prototype, stop and tell me. Then just link to the Vercel version (`elemental-five-two.vercel.app`) in a new tab, and note why in `OPEN_QUESTIONS.md`.

**Check:** play the full game inside the prototype at 1280×800 and 390×844 with no console errors, check that both shop buttons go to the right prototype pages, and check that the test tool logs the three events.

---

## When you're done

- Run `npm run build` (no errors), check desktop and the "mobiel 390" view, and check with reduced motion on.
- Run one full test session in test mode, including playing the Elemental Five game to the end.
- Update `docs/WORDPRESS_ENFOLD_MAPPING.md` for every effect.
- Tell me per effect: what it adds, what it costs (file size), and whether you'd keep it or drop it. Be honest if something feels too loud for InnerGames.
