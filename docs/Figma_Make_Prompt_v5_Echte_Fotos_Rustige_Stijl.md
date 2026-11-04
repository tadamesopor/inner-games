# Figma Make prompt v5: real photos, calm style, no wireframe

Damian Mattheeuw · InnerGames · week 9 · replaces prompt v3 and v4
Goes with: `figma-code-v5` (App.tsx, index.css, test.tsx) and `Prototype_v5_voor_na.png`

---

## 1. What I found

I went through your screen recording frame by frame, clicked through the live prototype and compared it with innergames.nl. These are the problems, the most important first.

### Look and feel

| # | Problem | Where | Why it matters | Fix |
|---|---|---|---|---|
| 1 | Hard black offset shadows (3, 6 and 8 px) and thick black borders on every card, button, image and the orange block | everywhere | Ariën doesn't like it. It makes the site look loud instead of "a serious organisation doing playful things" | Soft shadow, thin light lines, rounded corners (index.css v5) |
| 2 | Stock photos from Unsplash: poker cards, chess, sticky notes, a globe, a yoga class, a plant | everywhere | The Elemental Five shop page shows **poker cards**, so it misleads people about the product. Participants judge trust on these photos (D11) | Real InnerGames photos, see the table in the prompt |
| 3 | Placeholders: "foto volgt" for Aron, empty and badly cropped team cards, an empty hero on train-de-trainer, sometimes an empty hero on onze spellen | home, ons team, train-de-trainer | Unfinished parts make people trust the site less, and they will comment on them instead of doing the task. Aron's photo already exists on innergames.nl | Real portraits and photos |
| 4 | The font is Bricolage Grotesque | everywhere | The brand guide says Gill Sans only | Gill Sans stack (index.css v5) |
| 5 | Tags in monospace CAPITALS ("ORGANISATIES") | cards | The brand writes everything lowercase | Lowercase, same font |
| 6 | A moving "ontdek de kracht van spelen" band, repeated 12 times | home | Distracts during the tasks and can't be paused (WCAG 2.2.2) | Removed |
| 7 | Small orange text on cream is 3.4:1, white body text on the orange hero is 3.6:1 | eyebrows, "meer lezen", hero | Fails WCAG AA (4.5:1 needed) | Darker orange #C84413 for small text (4.6:1), dark gradient behind the hero text |
| 8 | The prototype bar (ontwerp, wireframe, desktop…) sits in the middle at the bottom and covers content, even the answer buttons of the preview | everywhere | Participants can't click what's underneath, and it's not part of the website | Small ⚙ button in the bottom-left corner that opens the options (App.tsx v5) |

### Flow and findability

| # | Problem | Where | Why it matters | Fix |
|---|---|---|---|---|
| 9 | "boek of vraag aan" opens the general contact form. The workshop isn't filled in, and there are no fields for the date or the number of people. After "verstuur" nothing happens | workshop page → contact | Task 3 ("leg een datum vast") can't be completed properly, and Ariën still has to email back to ask everything. This is the step where the money is made | Booking form with the workshop already filled in, date, group size and a confirmation |
| 10 | The workshop page doesn't say who leads the workshop, has no review, and doesn't say what happens after you ask | workshop pages | Organisation task 4 is "wie geeft de workshop?" and the answer isn't on the page. The benchmark decision was "story, benefits and a review", but the review is missing | "Wie begeleidt" block, a review (only if it's real), "zo werkt het" in 3 steps |
| 11 | The Elemental Five is shown as 3 separate games (compleet, grondankers, kaartenset) | onze spellen | The page says "zes spellen" but there are 4 games. The trainer task (only the cards, € 39) gets harder when people have to compare 3 similar cards | One game card, and on the game page a choice: compleet € 152 / grondankers € 79 / kaartenset € 39 |
| 12 | "aantal spelers: n.t.b." | game page | Unfinished information = less trust | Hide fields that aren't known |
| 13 | The quote "Na afloop praatten we anders met elkaar…" (deelnemer, teamleider) looks made up, and the client logos need checking | home | A made-up review in a trust test makes the results worthless, and it can never go live | Only real quotes and logos, approved by Ariën. Until then: remove the quote |
| 14 | Home says "vijf spelers, één idee" but shows 3 people, one without a photo. The team page has 4 filters for 5 people | home, ons team | Doesn't add up, and the filters add clicks without helping | 5 real portraits, no filters |
| 15 | The same orange "benieuwd wat spelen voor jou doet?" block on every page | all pages | Fine as an ending, but on the games pages people want to play or buy, not book | Text per page: games → "liever eerst spelen?" + preview |
| 16 | A search field in the footer and in the header | footer | Double | Only in the header |
| 17 | The header on mobile: logo, search, cart, a big orange button and a menu icon in 390 px | mobile | Crowded. The button text almost touches the edge | On mobile: a short "boek" button, search inside the menu |
| 18 | The hero photo is behind an orange layer of about 80%, so you hardly see it | home | The photo shows real people playing: that is the trust signal | Lighter layer, dark gradient on the left behind the text |
| 19 | The preview is only reachable through the hero button and the games page | games | The new preview task says "find the preview of game X" | A "speel de preview · 30 sec" button on every game card and game page |

### The test

| # | Problem | Fix (test.tsx v5) |
|---|---|---|
| 20 | The wireframe round was there to test findability without style. The design is ready and the wireframe looks like the design in grey, so it adds little and costs 6 extra people | Wireframe removed. Round 1 is now one session on the design: five-second test (what, for whom, first 3 words), menu test, 4 tasks, preview task, then trust and image questions. About 40 minutes |
| 21 | 18 people needed (3 + 6 + 6 + 3) | 12 people: round 0 (3) + round 1 (6) + retest (3) |
| 22 | Onderwijs tasks were about a havo 4 class | Now mbo/hbo (Ariën, week 9): "Je bent docent in het mbo of hbo… 28 studenten" |
| 23 | Round 2 had a "send this page to a colleague" task. It's hypothetical and measured little | Removed. Trust is now asked after the participant really used the site, with "wat hielp, wat hield je tegen" |
| 24 | The preview task said "speel de preview" while the preview was already in view | Now: "zoek de preview van [spel] en speel die tot het einde", so findability of the previews (D9) is measured too. No ease score after it: it's about curiosity, not effort |
| 25 | Expected answers for task 3 and organisation task 4 were based on the old pages | Updated to the booking form and the "wie begeleidt" block |

---

## 2. How to use this

**Step 1, code (most reliable).** Figma Make ignored test prompts before, so these three files are written and checked by me:
- `index.css` → replaces `src/index.css`: Gill Sans, calm style, no wireframe, darker small orange, no marquee
- `App.tsx` → replaces `src/App.tsx`: no wireframe button, the prototype bar becomes a ⚙ in the corner
- `test.tsx` → replaces `src/test.tsx`: test v5 (see the table above). I ran a full round 1 session in a browser: no errors, the report shows the five-second answers, the menu test, 5 tasks and all closing questions.

**Step 2, prompt.** Paste the prompt below into Figma Make for the page content: photos, booking form, workshop page, games, team and mobile.

**Step 3,** go through the checklist at the end.

If the photos don't load in Figma Make (some hosts block it), download them from innergames.nl, upload them to Figma Make and use the same names.

---

## PROMPT

Improve the InnerGames website prototype. Keep the page structure, all prices, durations, group sizes and texts that are not mentioned here, the cart and the test mode (`src/test.tsx`). Do not add new pages. Do not change `src/test.tsx`, `src/App.tsx` or `src/index.css`; they are already updated.

### 1. Remove the wireframe view completely
- Remove the wireframe toggle and all wireframe-only code paths. Components that read `WireCtx` must always render the design version.
- Remove the `wf-ph` placeholder boxes and the "foto: …" placeholder labels; every image slot gets a real photo (section 3).
- Change the page title from "InnerGames wireframe" to "InnerGames · prototype".

### 2. Calm style (Ariën doesn't like the hard black shadows and thick borders)
- Remove every hard offset shadow (`shadow-[3px_3px_0…]`, `shadow-[6px_6px_0…]`, `shadow-[8px_8px_0…]`) and every `border-2 border-ig-ink` on cards, images, buttons and the orange call-to-action block. Use instead: no border or a 1px line in `rgb(42 24 16 / 0.12)`, a soft shadow `0 12px 32px -14px rgb(42 24 16 / 0.22)` on cards only, and `rounded-2xl` corners on cards and images. Buttons: `rounded-full`, no shadow, no translate on hover; the hover is a slightly darker colour.
- Font: Gill Sans everywhere (`font-sans` already points to the Gill Sans stack). Headings bold (700), not extra black. Remove DM Mono and all `uppercase` labels: tags are lowercase pills in the same font (`text-xs`, cream background, ink text).
- Remove the moving marquee band on the homepage.
- Small orange text on light backgrounds (eyebrows, "meer lezen →", "verwacht december 2026") uses `#C84413`. Big orange blocks and buttons keep `#EA561F`.
- Keep lots of white space and the cream sections. The site should feel warm and calm: "a serious organisation that does playful things".

### 3. Real photos instead of placeholders and stock photos
Replace every Unsplash photo (`PHOTOS` in `src/data.ts`) with these real InnerGames photos. Base URL: `https://innergames.nl/wp-content/uploads/`. Use `object-cover`, and write a short Dutch alt text that describes the photo.

| Where | File (after the base URL) |
|---|---|
| Home hero | `2026/03/IMG_4853-1-scaled-e1772544533859-2048x1082.jpg` |
| Home "samen aan tafel, vanuit eindhoven" / contact / team banner | `2026/03/IMG_1563-scaled.jpeg` |
| Sessies en workshops hero | `2026/03/IMG_4842-1-2048x1365.jpg` |
| Onze spellen hero | `2026/03/IMG_4889-1-710x375.jpg` |
| Train-de-trainer hero | `2026/03/IMG_4993-scaled.jpg` |
| Workshop: Energiek team! | `2026/03/Avans-workshop-e1774535365508.jpg` |
| Workshop: Ontdek jouw drijfveren | `2026/03/IMG_4842-1-2048x1365.jpg` |
| Workshop: De Klimaat Collage | `2026/02/IMG_4917-1-scaled-e1772543858639-2048x1082.jpg` |
| Workshop: Het Impact Imperium | `2026/02/unnamed-bijgesneden-e1772542268769-2048x1081.jpg` |
| Workshop: Het spel tussen hoofd en lichaam | `2026/03/PHOTO-2025-04-25-11-35-44.jpg` |
| Workshop: Hoezo Raar?! | `2026/01/WhatsApp-Image-2025-11-17-at-09.57.21-e1770743799840.jpeg` |
| Workshop: Positive Masculinity | `2026/02/pexels-cottonbro-7236598-2048x1065.png` |
| Workshop: Kansen Keren | `2026/02/DSC_3106-kansen-keren-e1772542529843.webp` |
| Workshop: MemoryStory | `2026/09/IMG_3006-2-scaled-e1790263800689-2048x1299.jpeg` |
| Spel: The Elemental Five (main photo) | `2026/05/The-Elemental-Five-compleet-1.png` |
| The Elemental Five, variant grondankers | `2026/08/The-Elemental-Five-grondankers.png` |
| The Elemental Five, variant kaartenset | `2026/08/The-Elemental-Five-kaarten.png` |
| The Elemental Five, photo of a real opstelling | `2026/08/WhatsApp-Image-2026-07-06-at-12.54.42-710x375.jpeg` |
| Spel: Impact Imperium | `2026/03/Impact-Imperium_Mockup-scaled-1-2048x1536.jpg` |
| Spel: Sociality | `2026/03/Sociality-speeldoos-scaled-e1774361978411.png` |
| Spel: Kansen Keren | `2026/03/kansenkeren.jpeg` |
| Project: KansenKeren Senior | `2026/10/1791211197993.jpeg` |
| Project: Ready to Board | `2026/10/1786627271470.jpeg` |
| Project: Sociality cases | `2026/10/1789629336965.jpeg` |
| Project: Wisselwerk | `2026/10/1791562637029.jpeg` |
| Project: MemoryStory app | `2026/09/IMG_3006-2-scaled-e1790263800689-2048x1299.jpeg` |
| Team: Ariën Kingma | `2026/03/IMG_4930-450x450.jpg` |
| Team: Sanne van Bekkum | `2026/03/IMG_4981-450x450.jpg` |
| Team: Aron Sinke | `2026/03/IMG_4968-450x450.jpg` |
| Team: Carinda Jansen | `2026/02/carinda-portret-copy-450x450.jpg` |
| Team: Wies van Beek | `2026/02/Wies-portret-oranje-450x450.jpg` |

Keep `assets/logo.png`. Keep the cut-out group photo on the ons team hero.

### 4. Homepage
- Hero: the real photo full width, with a dark gradient from the left (`from-ig-ink/80 via-ig-ink/40 to-transparent`) instead of the orange 80% layer. White text stays readable and the people in the photo stay visible.
- Keep "waar kom jij voor?" with the four routes (onderwijs, organisaties, zorg, trainers). Onderwijs text: "Spellen en workshops voor mbo en hbo, met een handleiding erbij."
- Remove the quote "Na afloop praatten we anders met elkaar. Dat is gebleven." until Ariën gives a real quote. Then show it as a real quote with first name, role and organisation, approved by Ariën.
- Client logos: show only `assets/clients.png` if Ariën confirms these are real clients. Heading "zij speelden al met ons".
- Team strip: show all 5 people with the real portraits (first name only) and the line "vijf spelers, één idee". No "foto volgt".

### 5. Workshop pages (`workshop`)
Order on the page: title, one-line promise, a facts box (duur, groepsgrootte, prijs, locatie), buttons, then:
1. **waar gaat het over?** (the existing story)
2. **wat levert het op?** (the existing 3 points)
3. **wie begeleidt?**: a small portrait, name and one sentence, with "meer over ons team →". Add a field `host` to each workshop in `data.ts`. Only fill it where Ariën confirmed who leads it. Otherwise show "Een van onze vijf trainers" with the 5 small portraits.
4. **zo werkt het**: 3 steps: "1. je vraagt de workshop aan · 2. we bellen binnen 2 werkdagen om het af te stemmen · 3. we komen naar jullie toe of jullie komen naar Eindhoven"
5. **ervaring**: only a real quote approved by Ariën. Without one, leave out this section (no placeholder).
6. **speel het zelf** (the related game) and **ook interessant**.

The main button is **"vraag deze workshop aan"**. It opens the booking form (section 6) with this workshop already selected.

### 6. Booking form (`contact`, with a workshop or training preselected)
- When the form opens from a workshop or train-de-trainer page, show at the top: "je vraagt aan: [titel] · [duur] · [prijs]", with a "wijzig" link.
- Fields, in this order: naam*, organisatie of school*, e-mail*, telefoon (optional), **gewenste datum** (date picker, plus "of een periode / ik weet het nog niet"), **aantal deelnemers** (number), bericht (optional).
- Under the button, in small text: "Je zit nergens aan vast. We nemen binnen 2 werkdagen contact op."
- After "verstuur": a thank-you screen "Bedankt, [naam]! We bellen of mailen je binnen 2 werkdagen over [titel] op [datum]." with a button "terug naar de workshops". Nothing is really sent (prototype).
- The general contact page (from the menu) keeps the dropdown "Waar kunnen we je mee helpen?", with the option "een les of spel voor mijn klas" renamed to "iets voor mijn opleiding of studenten".
- Keep "app ons op whatsapp" next to the form.

### 7. Games (`games`, `game`)
- **One card per game**: The Elemental Five, Impact Imperium, Sociality and Kansen Keren. The Elemental Five card says "vanaf € 39". The heading becomes "vier spellen om te spelen, te leren en te groeien".
- Every game card has two buttons: **"speel de preview · 30 sec"** (only for games with a preview) and **"bekijk het spel"**.
- The Elemental Five game page has a variant choice with three options: **compleet** (kaarten + grondankers + handleiding) € 152 · **alleen de grondankers** € 79 · **alleen de kaartenset** € 39. Show what is in each, then "in winkelmand". Keep the photos of the three variants as a gallery.
- Leave out facts that are not known (no "n.t.b."). Show "voor wie" and "hoe lang speel je".
- On each game page: the preview right under the facts ("probeer het eerst"), and under that **"liever samen spelen? boek de workshop"** with a link to the related workshop (The Elemental Five → Ontdek jouw drijfveren and Energiek team!).
- The preview must not end behind any fixed bar. Give it enough bottom padding.

### 8. Ons team
- 5 cards with the real portraits, name, role and one line, plus "stuur me een mail →". No filter buttons. Remove the empty and badly cropped cards.
- Keep "hoe we werken" (spelen, reflecteren, bewegen) and the office photo.

### 9. Train-de-trainer
- Hero photo `IMG_4993-scaled.jpg`.
- Facts box: prijs € 1.800 per persoon · duur 8 uur · opbouw 4 uur theorie en 4 uur praktijk.
- Main button **"vraag de training aan"** → booking form with train-de-trainer preselected.

### 10. Call-to-action block at the bottom of each page
Keep it, but as a calm block (rounded, no black shadow). The text depends on the page:
- workshops and home: "benieuwd wat spelen voor jou doet?" + "vraag een workshop aan"
- games: "liever eerst samen spelen?" + "bekijk de workshops"
- train-de-trainer: "zelf met onze spellen werken?" + "vraag de training aan"

Dark ink text on orange is fine (4.7:1). No white small text on orange.

### 11. Header, footer, mobile
- Remove the search field from the footer (it stays in the header).
- Mobile (390 px): logo, cart, a compact orange **"boek"** button and the menu. Search moves into the menu. Tap targets at least 44 px.
- Desktop: the active menu item keeps its underline.

### 12. Accessibility
- Every photo has a Dutch alt text that describes it. Decorative images get `alt=""`.
- Visible focus on every link and button (keep the existing `:focus-visible`).
- The preview options can be used with the keyboard.

---

## 3. Checklist after pasting

☐ No "wireframe" button any more. The prototype options sit under a small ⚙ in the bottom-left corner.

☐ No black offset shadows or thick black borders anywhere (home, workshops, games, game page, team, contact).

☐ The font looks like Gill Sans (on Windows: Gill Sans MT. If it's not installed you see Cabin, which is very close).

☐ No Unsplash photo left: no poker cards, chess, globe or plant. Aron has a real photo.

☐ Workshop page: "wie begeleidt?" and "zo werkt het" are there. "vraag deze workshop aan" opens the form with the workshop filled in.

☐ The form has a date and the number of people, and shows a thank-you screen after "verstuur".

☐ Onze spellen shows 4 games. The Elemental Five page lets you choose compleet / grondankers / kaartenset.

☐ Every game card with a preview has "speel de preview · 30 sec".

☐ The made-up quote is gone (or replaced by a real one from Ariën).

☐ Mobile 390: the header fits, nothing overlaps.

☐ Test mode: "ronde 1 · prototype" asks the five-second questions, the menu test, 4 tasks + 1 preview task, then the closing questions. The onderwijs tasks say "mbo of hbo".

☐ Run one pilot session yourself and download the CSV.

## 4. Ask Ariën before testing

☐ Is there a real quote from a client that we may use (name, role, organisation)?

☐ Are the logos in `clients.png` real clients that we may show?

☐ Who leads which workshop? (for "wie begeleidt?")

☐ OK with the darker orange #C84413 for small text?

☐ Does Impact Imperium also fit mbo and hbo? If not, which offer fits the mbo/hbo task better?

☐ OK to use these photos from innergames.nl in the prototype and the test?

## Notes / add later

