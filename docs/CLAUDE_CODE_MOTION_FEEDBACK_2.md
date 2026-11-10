# Motion lab: feedback round 2 (for Claude Code)

I went through the lab again. It's a lot better. This round is smaller: keep what works and fix the points below. The rules from `CLAUDE_CODE_MOTION_PROMPT.md` and `CLAUDE_CODE_MOTION_FEEDBACK_1.md` still count. Where this file says something different, this file wins.

Work only in the motion lab. Commit per effect, with short lowercase messages.

---

## 01 Rounded sections: keep

No changes.

## 02 Speelpad: go back to the real yellow pawn

- Use the **real yellow InnerGames pawn image** again (`meeple-pawn.png`, cut-out). Move it from `dist/assets` to `public/assets/img/` if it's only in `dist`, because `dist` gets overwritten.
- Keep everything else: the pencil line drawn on scroll, the hop at each stop with squash and stretch, the shadow on the ground, and the stops that fill in.
- Make the image feel physical, not pasted:
  - a soft contact shadow under it that shrinks while it's in the air
  - it turns slightly in the direction it walks (max ±8°)
  - sharp at 2× (use a big enough source image, WebP)
- **Later:** a 3D pawn (a phone 3D scan or a model made in Blender, shown with `<model-viewer>` or three.js). Don't build it now. Write it in `OPEN_QUESTIONS.md` as the next step, and make the pawn one component (`<Pawn />` / `.ig-pawn`), so we can swap the image for a 3D model later without touching the path.

## 05 Split button: add the Aardvark hover animation

The shape is good now. What's missing is the hover animation. I looked at Aardvark's "Log-in / Sign-up" button frame by frame. This is what happens on hover (about 350 ms in total):

1. **The button squishes, like soft rubber.** The two parts deform **separately**, with corners moving in different directions:
   - the text part tilts about −2° and its corners skew unevenly (the top-right corner drops a bit, the bottom-left goes up)
   - the arrow part tilts the other way, about +6°, and shifts 2 px down
   - it doesn't look like a clean rotation; it looks like a squeezed piece of card
2. **The text rolls.** The label slides up out of view and the same label slides in from below (two copies stacked, `overflow: hidden`, translateY −100%). The arrow does the same thing sideways: out to the right, in from the left.
3. **It settles back** to its normal shape with a small spring (`cubic-bezier(.34,1.56,.64,1)`), while the mouse is still on it. The final hover state is straight, only a little darker.

Build tips:
- Animate the shape with `clip-path: polygon()` keyframes or a combination of `skew` + `rotate` per part. Choose whichever looks most like soft card. Not a clean CSS rotation.
- Two keyframe steps (deform → overshoot → rest) are enough.
- Mouse leave: no animation back, just the normal state.
- Keyboard focus: the same roll, without the deform.
- Reduced motion: only a colour change.
- Compare your result with Aardvark side by side (frame by frame if you can) before you show me.

## 06 The hand on the card: same colour, left side, bigger

The animation is good, keep it (the pop, one wave, sinking back). Change:
- **Colour:** the hand is **exactly the colour of the card it's on**, not darker, not a fixed orange. It should look like part of the card that pops up, like Aardvark's ears. If a card has the same colour as the background behind it, give the hand a 1.5 px outline in the card's border colour so it stays visible.
- **Position:** on the **left** side of the top edge, about 20 px in from the left corner. Keep the small random variation per card (±3°, ±6 px).
- **Size:** bigger, about 88 px tall on desktop and 60 px on mobile. Check it doesn't cover the menu or the card above it.
- The bottom of the hand stays hidden behind the card. Only the fingers and part of the palm come out.

## 07 Page transition: keep the scribble, fix the hand

I like the scribble animation, keep it. Only the hand moment in the middle needs work. Now it fades in, which is flat. Make it the same signature as the card hover:
- When the screen is fully orange, the **cream hand rises from the bottom edge** of the screen to the centre (spring with a small overshoot, about 300 ms), does **one short wave** (−6° → +4° → 0), and then leaves together with the orange.
- The total time stays the same (about 900 ms), and the short test-mode version stays ≤ 500 ms. In the short version, the hand only pops, without the wave.
- Reduced motion: a simple fade, no hand movement.

## 08 Game box: next to the text, much less scrolling

Right now the box sits very low and you have to scroll a lot before you even see it.
- Layout: **two columns**. Text left (label, "sociality", description, button), **box right, next to the text**, vertically centred with it. On mobile: the box above the text, smaller.
- **Remove the long sticky part.** The animation (tilted → almost straight, shadow landing, cards fanning out for The Elemental Five) should start when the section is about 25% in view and be finished when the section is in the centre of the screen. That's one normal scroll, not several.
- Keep the box slightly overlapping the rounded bottom edge into the next section, but only a little (about 10% of the box), so it doesn't push everything down.
- The whole section should fit on one desktop screen (1440 × 900) without scrolling inside it.

## 09 Footer: keep the design, change the image

I like the design, keep it. Swap the Sociality box for something that's about InnerGames as a company and not one product. Show both in the lab:
- **Option A (my favourite): the InnerGames hand, big.** It rises from the bottom edge of the footer in cream (about 260 px tall on desktop), tilted −10°, cropped by the bottom, and **waves once** when the footer is revealed. A "goodbye" wave at the end of every page. It's the same hand as the cards and the transition, so it closes the story.
- **Option B: the team photo** (`team-group.png`) in a boxy frame (`--r-box`) with a thick cream border like a printed photo, tilted −4°, rising from the bottom edge.

## 10 Menu: needs to be much better

It's too small, too pale and it doesn't feel like anything. Look at Aardvark again: the items are **bigger, bolder and clearly coloured**, and they sit close together in a row. Ours look like tiny tags.

Do this:
- **Bigger:** about 44 px tall, 15 to 16 px text, padding about 10 × 18 px, a 6 px gap between items. The text weight should be medium or bold, not thin.
- **A clearer colour:** a stronger tint (for example a light yellow or a light orange that's clearly visible on cream and on white), ink text. The **current page** gets a filled orange item with cream text.
- **Hover:** the item gets 1 step darker and lifts 2 px, and the **mini hand pops up** above it in the item's colour (same animation as the cards, about 22 px, no wave). The current page keeps its hand.
- **CTA:** "boek een workshop" as the split button with the new squish + roll hover from 05.
- **When scrolling:** the logo and the phone number scroll away and the centre group stays at the top. Give that group a soft shadow when it floats over content, so it reads as a layer, and scale it to about 94%.
- **Demo:** the lab section is empty now. Show the menu on a mock page with enough content to scroll, so I can see the sticky behaviour.
- Mobile: keep the current menu for now, but make the button that opens it use the same item style.

---

## When you're done

- Check 1440, 1024 and 390 px, with reduced motion on and off. No console errors, and `npm run build` passes.
- For 05 and 10, put a short screen recording or a GIF next to the Aardvark reference in `docs/reference/` so I can compare.
- Tell me per effect in two lines what you changed and what you're still unsure about.
