# Claude Code task: fixes round 6, before the test on Tuesday 17 November

Do these **before** building the test mode (`docs/CLAUDE_CODE_TEST_MODE_V6.md`), because the test measures exactly these parts. Keep it small: no new features, no redesign. Run `npm run build` at the end.

Do not add `Co-Authored-By` or any Claude/AI attribution lines to commits.

## 0. Remove "zorg" as an audience

Ariën and I decided zorg is not a target group for the website. Remove it as an audience everywhere:

- `src/data.ts`: remove `'zorg'` from the `Aud` type, `AUD_LABEL` and `AUDS`, and from every `aud: [...]` array (workshops and games, also Sociality). Keep the real "voor wie" texts of workshops as they are.
- `src/pages.tsx`: hero title becomes `spellen en workshops voor teams en klassen` (until section 1 below replaces it). Remove the zorg card from "waar kom jij voor?" so there are three routes, and make that grid fit three cards (no empty fourth slot). Update the section note/label to three audiences. Remove "zorg" from the workshops subtitle and the contact option "iets voor mijn cliënten of zorgteam".
- `src/seo.ts`: remove zorg from titles and descriptions.
- `src/wf.tsx` (`AudIcon`), `src/lab/speelpad.tsx` and `src/lab/rounded.tsx`: remove the zorg entries. `src/motion/tokens.css` also mentions zorg: check if it is a colour token that is still used before you remove it.
- Search the whole repo for `zorg` afterwards and tell me what is left.

## Why

At the midterm, teachers and the owner said:
1. After seeing the site, nobody could say what InnerGames actually does.
2. Nobody found the game demo, even though "speel het spel" is in the hero.
3. Clients come through Ariën personally, but the contact form feels generic and anonymous.

## 1. Hero: say what InnerGames does (`HeroNew` in `src/pages.tsx`)

- Keep the visual (orange, the table with photos and the box). Only the text and buttons change.
- Replace the title and subtitle with this **draft** (I still check it with Ariën, so put it in one constant at the top of the file with a `// TODO Ariën: check` comment):
  - title: `workshops met spellen voor teams en klassen`
  - subtitle: `Samen spelen, praten en ontdekken wat er in je groep speelt. Een workshop duurt 2 tot 3 uur, bij jullie op locatie of in Eindhoven.`
  - The durations in `src/data.ts` run from 1,5 to 4 uur (and one is 3 sessions of 4 uur), so "2 tot 3 uur" is not right. Use `De meeste workshops duren 1,5 tot 4 uur` instead, and keep the TODO Ariën comment.
- Buttons in the hero: only two.
  - main: `bekijk de workshops` → workshops page
  - second: `plan een gesprek met Ariën` → contact page
- Remove the "opruimen" control (`ig-table__tidy`) completely, nobody understood it. It is in three places: `src/pages.tsx`, `src/motion/hero.js` and `src/motion/hero.css`. Make sure the hero motion still works without it.
- The labels on the table (`bekijk de workshops`, `bekijk de spellen`, `speel het spel`) may stay as small labels, but they must look secondary to the two buttons.

## 2. The game gets its own section on the homepage

- Add a section right under the "waar kom jij voor?" routes. Title: `speel 2 minuten the elemental five`. Text: `Ontdek in een paar minuten welk element bij jou past. Geen test, gewoon voelen en kiezen.` Button: `speel het spel` → the existing preview (`playE5(go)`).
- Use a big visual: the Elemental Five cards or a still of the game (existing assets only).
- On a phone (under 640px): the game is not ready for mobile yet. Show the same section, but the button says `bekijk op een laptop` and opens a small note: `Het spel werkt nu nog het best op een laptop of tablet.` with a button `stuur mij de link` that opens a `mailto:` with the link in the body.

## 3. Contact: make it Ariën, not a form (`contact` page in `src/pages.tsx`)

- At the top of the contact page, next to or above the form, a card with:
  - Ariën's photo from `src/team.tsx` (`/assets/img/team/arien`)
  - `Ariën Kingma, oprichter van InnerGames`
  - `Ik denk graag met je mee. Vertel kort over je groep, dan bel of mail ik je binnen twee werkdagen.` (`// TODO Ariën: check the text and the reply time`)
  - buttons: `bel Ariën`, `stuur een WhatsApp`, `mail Ariën`. If the phone number or email isn't in the data yet, use a clear placeholder constant `CONTACT` with `// TODO Ariën: real number` and don't make up a number.
- Rename the form title to `of stuur een aanvraag` so the form is the second option.
- Add one optional field at the end of the form: `Hoe heeft u ons gevonden?` with options: via Ariën op LinkedIn, iemand raadde het aan, via Google, op een evenement, anders. This field will show where inquiries come from after launch.
- The header button `boek een workshop` stays.

## 4. Small things

- Header: the cart and search are fine for now, leave them.
- Check that nothing still says "zorg" as an audience (workshop "voor wie" lines in `data.ts` are real content and may stay).
- Check the homepage at 390px wide: hero text readable, two buttons visible without scrolling, game section shows the phone version.

## Done when

- [ ] `npm run build` passes
- [ ] Hero has the new text and only two buttons, no "opruimen"
- [ ] Game section is visible under the routes on desktop and has the phone version at 390px
- [ ] Contact page starts with Ariën's card and the three contact buttons, the form has the "Hoe heeft u ons gevonden?" field
- [ ] All TODO Ariën texts are listed in your summary so I can check them with him on Friday
