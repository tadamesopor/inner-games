# Open questions

## For Ariën

- **Photos.** OK to use these photos? Do you have cut-out (transparent) photos of the game boxes in high resolution?
  The list of photos and where they come from is in `public/assets/img/SOURCES.md`.
- **Positive Masculinity photo.** The photo on innergames.nl is a Pexels stock photo (`pexels-cottonbro-7236598`).
  The prototype uses it for now because it's the photo on the current site. Is there a photo of a real session?
- **Projects page.** There is no hero photo for the projects page, so it uses the KansenKeren Senior photo for now. Is there a better one?
- **Small photos.** A few photos only exist in a small size on the site (games hero 710 px, Elemental Five opstelling 710 px,
  Kansen Keren workshop 923 px, the team portraits 450 px). Larger versions would look sharper on big screens.

## Motion lab (step 1)

- **Elemental Five cards.** For the box scene: the five "card 1" images (one per element) from the game's assets, as cut-out PNGs.
  The lab shows coloured slots until then.
- **Elemental Five box.** A cut-out photo of only the box (the current photo has the cards and floor cards in it).
- **Sociality box.** The cut-out is 398 × 459 px. Fine for the footer, too soft for a big scene. A larger version would help.
- **Opening lid.** A box that opens needs a 3D model or a photo sequence of the box opening. Does Ariën have photos of that?
  Until then the box doesn't open (no fake lid).
- **Element colours.** The colours for vuur, lucht, aarde, water and ether in the opstelling background are taken from the
  floor-card photo. Check them against the real card art.
- **Speelpad drawing.** The path is drawn in code with a little wobble. Damian's own drawn path goes in `public/assets/draw/`.

## Motion lab (round 2)

- **3D pawn (next step).** Replace the photo of the yellow pawn with a 3D pawn: a phone 3D scan, or a model made in Blender,
  shown with `<model-viewer>` or three.js. The pawn is one component (`src/motion/pawn.js`, class `.ig-pawn`), so only that
  file changes; the path stays as it is. The current photo is 109 × 119 px: a larger cut-out would also help.

## Motion on the real pages (round 3)

- **Client logos.** `clients.png` is now cut into separate logos (`public/assets/img/clients/`). One logo (a "V" with lines)
  has no name: which organisation is it? It now has no alt text. Still open: may we show these logos at all?
- **Footer A or B.** Both are on the real pages; switch with "footer: hand / foto" in the prototype bar. Which one?
- **Homepage box scene.** There's no cut-out of only The Elemental Five box, so the scene uses the product cut-out
  (box + cards + floor cards). A photo of only the box, and the five card-1s, would make the scene complete.
- **Search and cart.** They scroll away with the logo bar; only the menu tiles stay at the top. Check in the user test
  whether people miss the cart while scrolling.
- **Transition length.** Outside test mode the transition is the full 920 ms version (with the wave), longer than the
  500 ms from the first brief. In test mode it's the short 460 ms version.
