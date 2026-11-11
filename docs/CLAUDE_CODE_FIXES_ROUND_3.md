# Prototype fixes: round 3 (for Claude Code)

I went through the prototype page by page (home, sessies, projecten, train-de-trainer, ons team, contact, product page). The motion is getting there, but the pages don't feel like one design yet. This file lists what's wrong and how to fix it. The order is the priority order.

The rules from `CLAUDE_CODE_MOTION_PROMPT.md` and the feedback files still count. Commit per section, with short lowercase messages.

---

## 1. Navigation (most important)

**What's wrong**
- The logo sits alone at the top left and the menu is a second row under it, centred. It looks like two separate things and nothing lines up.
- 8 items + a CTA, all the same yellow box. Too many, all equally loud, and the row is almost full width.
- "home" is a menu item and gets the hand. Not needed: the logo is the home button on every website.
- The floating sticky menu has no background, so when you scroll it sits on top of the photos and the marquee and becomes hard to read (see the screenshot of "waar kom jij voor").

**Fix**
- **One row, aligned to the content grid** (same left and right edge as the page content, max width 1440 with the normal side padding):
  - **left:** the InnerGames logo = the home link (`aria-label="InnerGames home"`). No hand on the logo.
  - **centre:** the menu items
  - **right:** search, cart (with count), and the "boek een workshop" split button
- **Fewer items:** `workshops` · `spellen` · `train-de-trainer` · `over ons` · `contact`.
  - "over ons" = team + projecten (one page with two sections, or a small dropdown). "home" is removed.
  - Shorter labels: "sessies en workshops" → "workshops", "onze spellen" → "spellen". Keep the page titles as they are.
- **Calmer items:** no background on the normal items, only ink text, medium weight. On hover a light yellow box comes behind the item (`--r-box`) and the mini hand pops up. The **current page** gets the light yellow box + the hand, and keeps it. Only the CTA is solid orange. So one loud thing in the menu, not nine.
- **Sticky:** after 200 px the whole bar becomes a compact floating bar: cream background (`#FFF6E6` at 92% + `backdrop-filter: blur(8px)`), soft shadow, `--r-box` corners, logo smaller (28 px high). The bar has its own background, so it never sits "loose" on top of photos. Remove the old version where only the centre group floats.
- **Vertical alignment:** logo, items, icons and CTA all centred on one line (same height, 44 px). Check it at 1440, 1280 and 1024.
- **Mobile:** logo left, cart + menu button right. The menu opens full screen with big items and the CTA at the bottom.

## 2. Cart: you can only add 1 of each product

**What's wrong:** on the product page the button turns into "in je mand ✓" and you can't add a second one. The cart probably stores products as a list of IDs (in or out), not as quantities. A teacher who wants 3 sets for a class can't order them. That's also not how WooCommerce works, so it would make the test less realistic.

**Fix (copy WooCommerce's behaviour, because the real site will use it)**
- Store the cart as `{ productId: quantity }`.
- Product page: a **quantity selector** (− 1 +, min 1, max 99, also typeable) next to the button **"in winkelmand"**. The button always stays clickable. Clicking adds the chosen amount.
- After adding: a short confirmation ("3× the elemental five – compleet toegevoegd") with the links "bekijk winkelmand" and "verder winkelen". The cart count in the menu updates with a small bump animation.
- **Cart page / drawer:** a row per product with a photo, name, price, quantity (− +), remove, and the line total. Then the subtotal, "verzendkosten: berekend bij afrekenen" and a "naar afrekenen" button (it can be a dummy page in the prototype).
- **Workshops are not cart products.** For a workshop you choose a date or ask for a quote ("vraag deze workshop aan"), because the price is per group or per session. Keep the cart for games and card sets only. Check that no workshop page has an "in je mand" button.
- Show "incl. btw" under every price, and the delivery info under the button ("verzonden binnen 2 werkdagen": **ask Ariën for the real text, use a TODO until then**).
- Save the cart in `localStorage` so it survives page changes and a reload.
- The test tool: log `cart:add` and `cart:remove` with quantity, like the other events.

## 3. Things that make it look like several designs

Fix these on every page:
- **Fonts:** headings, body, menu and buttons now use different fonts (a tight grotesk for big titles, a rounded bold for the menu and buttons, a monospace for tags). Use the **Gill Sans stack everywhere** (`'Gill Sans','Gill Sans MT','Cabin',Calibri,sans-serif`). One family, with weight and size for the hierarchy. Big titles bold, the "ons team" and "vijf spelers, één idee" titles too (now they're thin and look like another site).
- **Tags** (ORGANISATIES, ONDERWIJS): no monospace, no capitals. Lowercase, the brand font, 13 px, light cream background, `--r-tag`. That matches the brand rule "lowercase titles".
- **Black offset shadows and thick black borders** are still on photos and cards (projecten, train-de-trainer, team cards, contact form). Ariën already said no to those. Remove them everywhere: use the soft shadow and `--r-box` instead. Search the code for every `shadow-[` and `border-2 border-ink` / `border-black` and replace them.
- **Buttons:** every main button is the split button with the squish + roll hover. Secondary buttons are one style: outline, ink text, `--r-box`. Now there are 4 versions (white pill, white outline on yellow, square orange WhatsApp, round). The WhatsApp button now has square corners; give it `--r-box` too.
- **The marquee "ontdek de kracht van spelen"** is back on the homepage. We hid it in v5 because it's too loud. Remove it, or show it once as a calm static line.
- **The dev toolbar** at the bottom (desktop / mobiel 390 / labels uit / taken / footer) covers content on every screenshot. Collapse it into the small ⚙ button bottom-left again, and only open it on click. It must be completely hidden in test mode.

## 4. Per page

### Home: hero
- The orange layer over the photo is so strong that the people look like ghosts. Show the photo: use a lighter overlay (orange at about 35% on the left only, as a gradient to transparent on the right), or put the photo in a box on the right and the text on cream on the left.
- "speel een preview" is a different button style than "boek een workshop". Make it the secondary style from section 3.

### Home: "waar kom jij voor?"
- The photos in the cards fade into white, so they look washed out, and the text partly sits on the photo. Make it clean: the photo on top (16:10, full colour, `--r-box`), then the icon, title, text and button underneath on white.
- Cards have different text lengths, so there's a big empty gap above the buttons. Put the button at the bottom with flex and shorten the texts to one line each, so all cards are the same height.

### Home: speelpad (the pawn path)
- The line runs through the menu and off the right edge, and the pawn is half outside the screen. Keep the path **inside the content margins** (at least 24 px from the screen edge) and **behind** the menu, never on top of it.
- The checkmark boxes should sit exactly at the height of the block they belong to. Now they float at random spots.

### Home: "uit onze sessies"
- Prices use different units: "€ 2.850 per groep", "€ 350", "€ 423,50". Always show the unit ("per groep", "per persoon", "per sessie"). Check each one in `INNERGAMES_CONTENT.md`, and if it's unclear, add a TODO for Ariën.
- The hand on a white card is white with a grey outline. It should follow the card colour rule, but white on cream disappears. For white cards use the light yellow (`#FDE7B0`).

### Projecten
- "Waar we nu aan werken. Alles op deze pagina is nog in ontwikkeling." sounds like an unfinished page. Projects are the best **trust signal** InnerGames has (research finding: little proof). Rewrite it as cases: per project the client, what the question was, what InnerGames made, a photo, and one result or quote (TODO until Ariën gives real ones). For example the Sociality project with HAN.
- The small label "projecten" above the big title "projecten" is a double. Remove the small one, or make it a real breadcrumb ("home / over ons / projecten").
- The thick black shadow on the photo: remove it (section 3).

### Train-de-trainer
- The title breaks as "train-de-" / "trainer". Use non-breaking hyphens (`train‑de‑trainer` with U+2011), or a smaller size so it fits on one line on desktop.
- The three info cards (prijs, duur, opbouw) touch the rounded bottom edge of the section. Give them 48 px space, or put them inside the cream section.
- The team photo is used three times (trainers card, train-de-trainer, ons team). Use a workshop or training photo here, from `public/assets/img/` or with a TODO for Ariën.

### Ons team
- A lot of empty yellow space above the title. Start the content higher (hero height = its content + 96 px padding, not a fixed height).
- "neem contact op" is white text on yellow: that fails WCAG. Use the secondary button style (ink).
- The intro text is about playing with your team and has nothing to do with the team page. Write 1–2 lines about who they are ("vijf mensen die spellen ontwikkelen, workshops geven en trainers opleiden, vanuit Eindhoven"). Mark it as a TODO so Ariën can check it.
- The pawn on the photo card looks random. Remove it here.
- Team cards: remove the black offset shadow, and use the same card style as the workshop cards. Names: keep the capitals in names ("Ariën Kingma"); lowercase is only for titles.

### Contact
- The form card has the black offset shadow (remove it, see section 3).
- The send button isn't visible on the screenshot. The form should fit on one desktop screen: put "naam" and "organisatie" next to each other, and make "bericht" 4 lines.
- Add a clear focus style on the fields (2 px orange outline) and the labels above the fields (already done, keep it).
- After sending: a thank-you message on the same page ("Dank je! We reageren binnen 2 werkdagen." TODO: check the term with Ariën).

### Product page (The Elemental Five)
- Quantity + cart: see section 2.
- The tags in mono capitals: see section 3.
- The second thumbnail (feet on the floor cards) has a different crop and size from the rest. Give all thumbnails the same square crop and the same background.
- Under the price: "incl. btw" and the delivery info (section 2).
- Add "speel het spel online" (the playable game, prompt step 8) as a secondary button. That's the strongest reason to buy.

---

## When you're done

- Click through all pages at 1440, 1024 and 390 px. No console errors, and `npm run build` passes.
- Add a product 3 times, change the quantity in the cart, remove it, reload: everything must stay correct.
- Search the code: no black offset shadows, no monospace fonts and no `uppercase` left.
- Make one screenshot per page (desktop + mobile) in `docs/screens/round3/` so I can compare.
- List every TODO for Ariën in `OPEN_QUESTIONS.md` (prices and units, delivery text, team intro, project cases, photos).
