# Prototype fixes: round 4 (for Claude Code)

I recorded a walk through the whole prototype. The menu and the calmer style are a big step forward. But the homepage hero has become a standard "text left, photo right" template, and the site is missing parts a real company site and shop need. The rules from the earlier prompt files still count. Commit per section.

---

## 1. Menu: no dropdown

- Remove "over ons ▾". Make the items separate: `workshops` · `spellen` · `projecten` · `train-de-trainer` · `ons team` · `contact`.
- Keep everything else from round 3 (logo = home, one row, only the CTA solid orange, mini hand on hover and on the current page).
- Check that 6 items + search + cart + CTA fit on one row at 1280 px. If not: make the search an icon only and reduce the gaps to 28 px. Below 1024 px, switch to the mobile menu.
- **Anchor links:** when you jump to a section with a link (for example "alle 9 workshops" or `#sessies`), the sticky bar covers the title. Add `scroll-margin-top: 96px` to every section and heading with an id. Normal scrolling under the bar is fine.
- Use the same names everywhere. The footer still says "sessies en workshops" and "onze spellen": change them to the new menu names.

## 2. Homepage hero: it must say what InnerGames does and look like InnerGames

**What's wrong now**
- A text block left and a photo right, on cream: the most common template there is. Nothing about it says "games company". It could be any coaching site.
- The title is an English slogan in a Dutch site. A first-time visitor still doesn't know what InnerGames sells (my research: visitors don't understand the offer quickly).
- The photo is dark and backlit.
- The rounded section bottom (motion lab 01, which I liked) is gone from the hero.
- The ⚙ toolbar button and the pawn overlap at the bottom left.

**New hero**
- **Orange section** (`#EA561F`) with the big rounded bottom (`--r-section`), cream text. That's the brand moment, the same as the page transition.
- **Small label (tagline):** "inner growth for outer change". It's their real tagline, so keep it, but small.
- **Title in Dutch that says what they do**, for example: **"spellen en workshops die teams, klassen en zorg in beweging brengen"**. Max 2–3 lines at desktop, Gill Sans bold, lowercase. Mark it as `TODO: check with Ariën`.
- **One line of body text:** what you get. Example: "Van een workshop voor je team tot een spel voor in de klas. Gemaakt en begeleid vanuit Eindhoven."
- **Route chips directly in the hero:** "ik zoek iets voor:" `mijn team` · `mijn klas` · `zorg` · `ik ben trainer`. Each one goes to the matching filtered workshop list. This puts "waar kom jij voor?" where people look first. The separate "waar kom jij voor?" section further down can then become smaller or go.
- **Buttons:** "boek een workshop" (cream split button with ink text, so it shows on orange) + "speel het spel" (outline, cream).
- **Visual on the right, made from real InnerGames things, not one stock-like photo:** a small "table" of 3 tilted items like cards thrown on a table: a bright session photo (`energiek-team` or `samen-aan-tafel`), The Elemental Five box/cards (cut-out), and a Sociality box. Each one with a thick cream border like a printed photo or card, tilted −6°, +4°, −2°, overlapping a little. They move slightly with the mouse (parallax, max 6 px) and land one by one on load (stagger 80 ms). The InnerGames hand peeks from behind the pile.
- **Proof line under the buttons:** "o.a. gespeeld met" + 4 small client logos in cream (ASML, Fontys, HAN, Summa, from `clients.png`).
- Mobile: title, chips, buttons, then the pile of cards smaller underneath. The hero stays under one screen and a half.
- Reduced motion: the cards lie still in their end position.

Make the current hero available as option B in the ⚙ toolbar, so I can show Ariën both.

## 3. What the site is missing

These are things a visitor or a buyer expects. Several of them are also SEO and trust items from my research.

**Footer (it's now only addresses + a menu)**
- A row with **social links**: LinkedIn, Instagram, YouTube or whatever InnerGames uses (TODO for Ariën). Social media integration is one of my deliverables.
- **The legal links a Dutch webshop needs:** algemene voorwaarden, privacybeleid, cookiebeleid, verzending en retour, plus KvK number and btw-nummer. Make dummy pages with a TODO. Without these the shop isn't trustworthy, and in the real site it's required.
- "© Copyright – InnerGames" → "© 2026 InnerGames". Remove the second search field in the footer (search is already in the menu).
- A newsletter or "blijf op de hoogte" field only if Ariën wants it (TODO, don't build it yet).

**Trust**
- The quote "Na afloop praatten we anders met elkaar. Dat is gebleven." – deelnemer, teamleider: is that real? If it isn't from a real source, replace it with a clear placeholder `TODO: echte quote van Ariën` and show it in a style that's visibly temporary. Never show an invented quote as real in a test.
- Per workshop page: one short client case or quote (TODO), and "dit kun je verwachten" in 3 steps (kennismaking → sessie op maat → nagesprek).
- On the homepage, a short "zo werkt het" block in 3 steps for booking a workshop: 1. vertel ons over je groep, 2. we stellen samen een sessie samen, 3. we komen spelen. That answers the question "how does this work and what happens after I click?".

**Shop**
- After adding to the cart there must be a **cart page and a dummy checkout** (round 3, section 2). Check that this is there.
- "kansen keren" shows "€ 16,35 incl. verzending" and a "preview volgt" button that does nothing. Make the prices the same format as the others (price incl. btw, shipping separate) and hide the preview button until there is a preview.
- Every product needs a detail page like The Elemental Five, not only a card.

**Workshops**
- Check that "bekijk" on every workshop card opens a detail page with: for whom, duration, group size, price (with unit), what you'll do, a case/quote (TODO) and the button "vraag deze workshop aan" → the contact form with the workshop filled in.

**Photos**
- The team photo is still used on several pages, and the train-de-trainer hero shows two people at an event, not a training. The spellen hero is a dark close-up of hands. Make a list in `OPEN_QUESTIONS.md` of which photos we need from Ariën (a training in progress, games on a table, bright session photos) and use the brightest available photos until then.

**SEO basics (also needed for my SEO deliverable)**
- A unique `<title>` and meta description per page (Dutch, max ~60 / ~155 characters).
- One `h1` per page, headings in the right order.
- Open Graph tags (title, description, image) per page, so a LinkedIn share looks good.
- `alt` text on every image (describe what's in it, in Dutch).
- Readable URLs: `/workshops/energiek-team`, `/spellen/the-elemental-five-compleet`.
- Write it all down in `docs/SEO_CHECKLIST.md`, so I can copy it into Yoast/Rank Math later.

## 4. Small things from the recording

- The ⚙ button and the pawn overlap at the bottom left. Move the pawn so it never sits on fixed UI.
- "ons team" hero: "neem contact op" is now outline on yellow, good. Check the contrast of the outline text (ink, not white).
- Spellen filter chips ("alle · onderwijs · organisaties · zorg · trainers") and the counter "6 van 6": fine, but make the counter update when you filter.
- The workshop cards hover from the previous message: orange `#C84413` with white text and an orange hand. Check that it's built.

---

## When you're done

- Screenshots per page (desktop + mobile) in `docs/screens/round4/`.
- Update `OPEN_QUESTIONS.md` with every TODO for Ariën (title text, quote, social channels, legal texts, KvK/btw, photos, prices).
- `npm run build` passes and there are no console errors.
