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

## Fixes round 3: TODOs for Ariën

- **Prices and units.** Every price should show its unit. Known from innergames.nl: Energiek team!, Ontdek jouw
  drijfveren and Hoofd en lichaam are per group (12 people), so the site says "per groep"; train-de-trainer is per person.
  Not clear, so still without a unit: De Klimaat Collage (€ 1.800), Hoezo Raar?! (€ 350), Positive Masculinity (€ 350),
  Het Impact Imperium (€ 423,50) and MemoryStory (€ 423,50). Per group, per session or per person?
- **Delivery text.** What goes under the "in winkelmand" button (for example "verzonden binnen 2 werkdagen")?
  Nothing is shown until we know. Sociality's own text says 2 to 3 working days in the Netherlands.
- **Shipping costs.** The cart says "verzendkosten: berekend bij afrekenen". What are they?
- **Response time contact form.** The thank-you message says "We reageren binnen 2 werkdagen." Is that right?
- **Team intro.** "Vijf mensen die spellen ontwikkelen, workshops geven en trainers opleiden, vanuit Eindhoven."
  Is that how you want to describe the team?
- **Project cases.** Sociality (with the HAN) is now the main case, written only from the text on innergames.nl.
  For each project: the client, the question, what you made, and one result or quote (with permission).
  Which ones may we show, and who were the clients of MemoryStory app, Ready to Board and Wisselwerk?
- **Photos.** A photo of a train-de-trainer day (the page now uses a photo from Hoofd en lichaam), and photos of
  Carinda and Wies.
- **Short card texts.** The "waar kom jij voor?" texts were shortened so the cards stay even (for example
  "Spellen en lessen voor in de klas."). Check if they still say what you mean.
- **Menu.** "home" is gone (the logo is home), and "ons team" and "projecten" are under "over ons". Watch in the
  user test whether people still find the team (task D2).

## Fixes round 4: TODOs for Ariën

Everything that is still a placeholder on the site has a dashed frame with "nog aan te leveren", so nobody in a
test reads it as real.

- **Homepage title.** "spellen en workshops die teams, klassen en zorg in beweging brengen", with "inner growth for
  outer change" as the small label above it. Is that how you want to say what InnerGames does?
- **Zo werkt het (homepage) and "dit kun je verwachten" (workshop pages).** The steps are written from the brief:
  vertel ons over je groep → we stellen samen een sessie samen → we komen spelen, and kennismaking → sessie op maat →
  nagesprek. Is that how it really goes?
- **Quote.** The quote on the homepage ("Na afloop praatten we anders met elkaar...") was an example, not a real one.
  It's now a placeholder. We need one or more real quotes, with name and organisation, and permission to use them.
- **Cases per workshop.** One short real case or quote per workshop (who, the question, what it gave).
- **Social media.** Only LinkedIn is known. Which other channels does InnerGames use (Instagram, YouTube ...)?
- **Newsletter.** Do you want a "blijf op de hoogte" field in the footer? Not built yet.
- **Legal texts.** Algemene voorwaarden, privacybeleid, cookiebeleid, verzending en retour: these pages exist as
  placeholders. The texts must come from you (or a template from a branch organisation or a lawyer).
- **KvK-nummer and btw-nummer.** Needed in the footer of a Dutch webshop.
- **Shipping.** Shipping costs, and the delivery text under the cart button. Impact Imperium and Kansen Keren
  include shipping in the Netherlands in their price (innergames.nl), the other games don't say: is shipping extra?
- **Prices and units.** Still open from round 3: € 350, € 423,50 and € 1.800 for De Klimaat Collage, Hoezo Raar?!,
  Positive Masculinity, Het Impact Imperium and MemoryStory: per group, per session or per person?
- **Client logos.** "o.a. gespeeld met" in the hero shows ASML, Fontys, HAN and Summa (from clients.png).
  May we show these, and which organisation is the "V" logo?

### Photos we need

The pages now use the brightest photos we have. Better ones would help a lot:

- **A training in progress** (train-de-trainer): now a group from Hoezo Raar?! in a light room.
- **Games on a table, from above or close by** (spellen): now the Kansen Keren board.
- **Bright session photos** with faces in the light (workshops, homepage): now MemoryStory and the team at work.
- The old homepage photo and the old spellen photo were dark and backlit; the trainer photo showed two people at an
  event, not a training.
- **Cut-outs** of each game box (only Sociality has one), and the five card-1s of The Elemental Five.
- Portraits of Carinda and Wies, and a larger version of the team photo (it's also used on several pages).
