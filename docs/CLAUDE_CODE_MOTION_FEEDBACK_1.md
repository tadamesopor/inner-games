# Motion lab: feedback round 1 (for Claude Code)

I went through `/motion-lab`. Overall it's a good start, but it looks amateurish. It looks like separate effects, not like one designer made it. I compared it again with the Aardvark Book Club recording. This file says what to keep, what to drop and what to rebuild. Keep following `CLAUDE_CODE_MOTION_PROMPT.md`. Where this file says something different, this file wins.

Work only in the motion lab for now. Don't apply anything to the real pages until I say go.

---

## The idea that ties everything together: the pencil line

Aardvark feels like one thing because everything comes from the same source: their wavy shapes and their aardvark logo. We need our own source. **It's the orange pencil line**, the line a facilitator draws on a flipchart during a workshop. That fits InnerGames: they play, they draw, they set things up on the floor.

That one line shows up everywhere:
- the game path (speelpad) is drawn with it
- the page transition is a scribble with it
- the footer and hovers use small marks of it

**How it should look:**
- slightly uneven, like a real pencil or marker
- an SVG stroke with `stroke-linecap: round`
- a light grain from an SVG filter (`feTurbulence` + `feDisplacementMap`, scale 1.5 to 3), so the edge isn't perfectly smooth
- a slight variation in width
- **no** perfect geometric curves, and **no** dashed-line-from-a-tutorial look

Put the stroke style in one place (`src/motion/pencil.ts` + `pencil.css`) and reuse it, so every effect has the same line.

I will draw a few real scribbles on paper or a tablet later (put them in `public/assets/draw/`). Make it easy to swap your generated paths for my drawn ones: load the paths from SVG files, not hard-coded in components.

## Shape rule: not everything is round

The lab rounds everything into pills. That's what makes it look generated. Use Aardvark's mix:
- **Big radius (56 px desktop / 28 px mobile):** only the bottom of big coloured sections. Keep that, I like it.
- **Boxy with soft corners (10 to 14 px):** cards, buttons, menu items, accordions, input fields, image frames.
- **Full circles:** only icon buttons (arrows, sound, close).
- **Pills (fully round ends):** only small tags such as "onderwijs" or "zorg".

Put these as variables (`--r-section`, `--r-box`, `--r-tag`) and use only those.

---

## Per effect

### 01 Rounded sections: keep

Good as it is. Only check the shape rule above.

### 02 Speelpad: rebuild, good start

What's wrong: the pawn is just a pasted image, so it looks amateurish. The line is a basic dashed line.

Do this:
- Draw the path with the pencil line. It draws itself while you scroll (scrubbed with the scroll, not one animation that plays).
- **The pawn is drawn, not a photo.** Make it an SVG in the same pencil style: a simple pawn outline, orange line, with a cream fill. It follows the line and turns slightly in the direction it walks.
- At each stop (each content block) the pawn makes **a small hop**: up 8 px, a little squash and stretch, and a soft shadow on the "ground" that gets smaller while it's in the air.
- The stops are small squares (boxy, `--r-box`) that start as an outline and fill in yellow when the pawn reaches them, with a short scribbled tick mark.
- The line goes **behind** the cards and sometimes peeks out from behind them, so it feels part of the page and not drawn on top of it.
- On mobile: a simpler vertical path along the left side.
- Reduced motion: the full line is drawn, the pawn stands at the last stop, no hopping.

### 03 Opstelling and 04 Adem: remove

I don't like them and they're not needed. Delete them from the lab and from the code. The speelpad is our one background idea.

### 05 Split button: rebuild

What's wrong: two rounded pills stuck together. Look at Aardvark's "Show all FAQ" and "Log-in / Sign-up" buttons.

Do this:
- Two separate **boxy** parts with soft corners (`--r-box`, around 10 px): a text part and a square arrow part, **with a 3 px gap** between them. Same colour.
- Hover: the arrow part moves 3 px to the right and the arrow inside turns into a small pencil-drawn arrow (or redraws itself). The text part stays still.
- Press: both parts go down 1 px.
- Variants: orange on cream, ink on cream, cream on orange.
- Use it for the main actions only ("boek een workshop", "speel het spel", "bekijk het spel"). Normal links stay normal links.

### 06 Card hover: the InnerGames hand pops up (our version of the "bunny ears")

Look at Aardvark: on hover the book card tilts a little and two small ears pop up from behind it. I love that animation. It works because it comes from their logo. We do the same with **our** logo: **the InnerGames hand pops up from behind the card, like someone raising their hand**: "kies mij", or raising your hand in a workshop. Don't copy the ears' shape; only the feel of the animation.

**Asset:** `public/assets/brand/innergames-hand.svg`. It's a clean vector: one path, white fill. Change `fill="white"` to `fill="currentColor"`, so CSS can colour it. (I put it in `dist/assets` by mistake. `dist` gets overwritten on every build, so it has to live in `public/`.)

**The animation on hover:**
1. The card tilts −2° and lifts 6 px (200 ms, `--ease-out`).
2. **The hand rises from behind the top edge** of the card, near the top-right corner, about 56 px tall on desktop and 40 px on mobile. It starts hidden behind the card (translateY 100%, scale 0.85) and pops up with a spring and a small overshoot: `cubic-bezier(.34,1.56,.64,1)`, 380 ms, starting 60 ms after the tilt.
3. Once it's up, **one small wave**: rotate −8° → +5° → 0 over 500 ms, with the pivot at the wrist (bottom centre). Only once per hover, never a loop.
4. On mouse leave: the hand sinks back behind the card (200 ms, no overshoot), then the card goes back.

**Details that make it look made, not generated:**
- **Colour:** the hand takes a darker tint of the card's own colour (yellow on an orange card, orange on a cream card), like Aardvark's ears. Not always the same orange.
- It sits **behind** the card (lower z-index, inside the card's wrapper), so the bottom of the hand is really hidden by the card and doesn't fade.
- A tiny random variation per card: tilt ±3° and position ±6 px (set once with a CSS variable per card), so not every hand pops up identically.
- The photo inside the card zooms 3%.
- Cards are boxy (`--r-box`), with a thin border in the card colour around the photo, like Aardvark.
- Build it so it works without React later: a wrapper `.ig-card` with the hand as an inline SVG or a `::before` with `mask-image: url(innergames-hand.svg)` and `background: currentColor`. Use the mask version if it looks the same, because then Enfold only needs a CSS class.
- Touch screens: no hover. Show the hand once when the card scrolls into view (pop + wave), then it sinks back.
- Reduced motion: no pop and no wave, just the hand fading in at its end position.

**Use it in small places too**, so it becomes a signature:
- In the menu (10): a mini hand (16 px) pops up above the item you hover, and stays above the current page.
- On the split button (05): no hand. Keep it calm there.

Only one version in the lab this time, the hand. The card-fan idea is dropped.

### 07 Page transition: rebuild as a pencil scribble

What's wrong: an orange block with a logo isn't special. Look at Aardvark: a giant brush stroke swoops in, covers the screen, the logo shows, and the stroke leaves again.

Ours:
1. A pencil line starts in a corner and **scribbles** across the screen (a quick zigzag/loop, like crossing out on a flipchart).
2. While it scribbles, the line gets **thicker and thicker** until the scribble covers the whole screen in orange.
3. The hand logo appears in the centre in cream (fade + scale from 0.9).
4. The new page loads. The orange leaves again: the scribble "unwrites" in the other direction, or the orange slides off with one curved edge.

Timing: about 400 ms in, 150 ms hold, 350 ms out. Use the View Transitions API with the SVG on top. The stroke width is animated, or several strokes grow, whichever looks best. It must cover 100% of the screen at the peak on every size, including 390 px phones.

**User test:** in test mode, use a short version (≤ 500 ms in total) or turn it off. Make that a setting in the test tool, default short.

Reduced motion: a simple 150 ms fade.

### 08 Game box: improve, good start

What's wrong: it's small, it just slides in, and the Elemental Five part still shows a placeholder.

Do this:
- Make the section **sticky for about 1.5 screen heights**, so the scroll drives the scene (scrub, not play once).
- The box is **big** (about 45% of the width on desktop) and **breaks out of the section**: it overlaps the rounded bottom edge into the next section, like Aardvark's box in the footer.
- While you scroll: the box goes from tilted 14° to almost straight (−3°, never perfectly straight), with a soft shadow on the ground that gets sharper as it lands.
- The Elemental Five: the five card-1 images come out of the top of the box **one by one** (stagger 80 ms), fan out and stay. Each card has its thick white border, like in the game.
- Use the Sociality cut-out photo for now and remove the "vrijstaande foto nog aanleveren" placeholder text. If a cut-out is missing, leave the box out rather than showing a placeholder.
- A small pencil arrow points to the "speel het spel" button, with a short hand-written-style label: "probeer het zelf". Use the brand font, not a fake handwriting font.

### 09 Footer: rebuild like the Aardvark reveal

What's wrong: an orange block with text and a photo. Too plain.

Aardvark: the last white section has the big rounded bottom and **slides up off** a dark footer that sits underneath. A big tilted box rises from the bottom edge.

Ours:
- The footer is fixed/sticky **under** the page. The last section (cream, rounded bottom) scrolls up and **reveals** it.
- The footer background is ink `#2A1810` or orange. Show both in the lab.
- A big game box (Sociality cut-out for now) rises from the **bottom edge**, tilted about −15°, cropped by the bottom, and rotates 3 to 4° while the footer comes into view.
- Layout: logo and contact on the left, newsletter or "plan een kennismaking" with a split button on the right, and a thin bottom bar with small text.
- One pencil mark: a scribbled underline under the email address that draws itself when the footer comes into view.
- Mobile: the box is smaller and sits under the text, still cropped by the bottom edge.

### 10 Menu: rebuild like Aardvark

What's wrong: one big pill bar that appears after 200 px. Look at Aardvark: there are **separate small menu items**, centred, each its own soft box. When you scroll, the logo on the left and the extras on the right scroll away, and **only the centre items stay** at the top.

Ours:
- Centre: separate items (`spellen`, `workshops`, `projecten`, `over ons`, `contact`), each a small box (`--r-box`, about 8 px), light orange tint background, ink text.
- Last item: "boek een workshop" as a small orange split button.
- Left: the logo. Right: the phone number or language. These two scroll away; the centre group sticks at the top with 12 px margin.
- Hover on an item: a mini InnerGames hand (16 px) pops up above it, with the same animation as the card hover (06) but small and without the wave. The current page keeps its hand.
- Mobile: keep the current menu.

---

## When you're done with this round

- Lab order: 01 sections, 02 speelpad, 05 button, 06 card hover (the hand), 07 transition, 08 game box, 09 footer (two colours), 10 menu.
- Check the lab at 1440, 1024 and 390 px, with reduced motion on and off. No console errors, and `npm run build` passes.
- Commit per effect, with short lowercase messages.
- Tell me per effect in two lines what you changed and what you're unsure about. Be honest if something still looks generated, and say why.
