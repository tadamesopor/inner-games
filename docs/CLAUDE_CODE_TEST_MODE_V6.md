# Claude Code task: remote test mode v6 (deadline Tuesday 17 November)

v6 = v5 plus mouse movement and hover tracking (section 2b) and the consent text that mentions it.

Read this whole file first, then make a short plan, then build it. Keep the existing test-leader mode (`src/test.tsx`, the "taken" toggle) working exactly as it is. This is a **new participant mode** next to it.

Do not add `Co-Authored-By` or any Claude/AI attribution lines to commits.

## Why

Ariën (the owner) sends a link to his clients on Tuesday. Nobody sits next to them, most are 50 to 65, some open it on a phone. The current test mode is built for a test leader and keeps results in localStorage only. I need:

1. Two short flows with their own link: clients (`?test=klant`) and new visitors (`?test=nieuw`).
2. Every finished (and unfinished) session sent to my email automatically, with a small log of what the person did on screen.
3. Nothing confusing: no participant numbers, no rounds, no "testleider", no "zeg hardop".

## 0. First check

- Find how the app is deployed (Vercel project, git or CLI) and tell me.
- There is no `vercel.json`. Deep links like `/spellen/elemental-five-compleet` give a 404 on Vercel when opened directly. Add a SPA rewrite that leaves `/api/*` alone:
  ```json
  { "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }] }
  ```
- Run `npm run build` before and after. It must pass (`tsc --noEmit && vite build`).

## 0b. Things in the code you must handle (checked against commit 9d99394)

- **The `?test=` parameter disappears.** `go()` in `App.tsx` does `history.pushState(null, '', toUrl(p, id))`, so after the first click the URL is `/workshops` and `?test=klant` is gone. Read the parameter **once at startup**, save the group and participant id in `localStorage` under one fixed key (for example `ig:participant`), and start participant mode from that key when the parameter is missing. A reload on `/workshops` must continue the test. The session ends (key removed) on the end screen. Opening a link with `?test=` again while a finished session exists starts a new one.
- **Leader mode stays separate.** It is switched on with the "taken" pill in the ⚙ tools, not with the URL. Participant mode must never show that pill or the ⚙ button.
- **No router.** Pages change through `go(page, id)` from `Ctx` in `wf.tsx`. Use that for "start every task from the homepage" and for opening the contact page at C1. Log page changes from `page`/`sel` state in `App.tsx`.
- **Forms already send nothing** (`pages.tsx` contact form, `shop.tsx` checkout: `preventDefault` + local state). In participant mode only add the message and the `form_submit` event, don't build real sending.
- **`tsconfig.json` only includes `src`.** Keep `api/submit.ts` self-contained (no imports from `src`), so the Vercel function builds on its own. Add `"api"` to a separate check if you want types, but don't break `npm run build`.
- **`CLAUDE.md` says lowercase titles and brand rules.** The test screens follow the brand colours and font, but use the texts in section 3 exactly as written (with capitals and "u").
- **Unfinished mail:** only send the `onvolledig` beacon on `pagehide` when the consent box was ticked and at least one answer exists. A reload also fires `pagehide`, so guard with the "once per id per status" rule.

## 1. Participant mode

- Starts when the URL has `?test=klant` or `?test=nieuw` (on any path, the link I share is `https://inner-games.vercel.app/?test=klant`). Make a new component, for example `src/participant.tsx`. Reuse helpers from `test.tsx` where it makes sense, but don't change leader mode behaviour.
- Auto participant id: `P-` + 4 random characters (no 0/O/1/I). Show it small on the last screen only.
- Hide in participant mode: the ⚙ prototype tools, the leader panel, the "taken" toggle, any download buttons. Empty the cart at the start (the existing `ig:cart-reset` event).
- Save progress in localStorage so a reload continues where they were. Key per participant id.
- Text: plain Dutch, "u", short sentences. All texts are below in section 3, use them exactly.
- Layout for older users:
  - body text at least 18px, buttons at least 48px high, answer options as big buttons, not small radios or sliders
  - "Stap X van Y" on every question screen, and "ongeveer 15 minuten" on the start screen
  - question screens are a centred card over a dimmed site
  - during a task the website is fully usable. The task text stays visible in a bar: on desktop a slim bar at the top; at under 640px a bar at the bottom that is at most 30% of the screen and can be folded to one line ("toon taak")
  - in the task bar two buttons: "Klaar" and "Ik kom er niet uit"
- Forms on the site (contact, booking, newsletter) must not send anything in participant mode. On submit: show a small message "In de test wordt niets verstuurd. U kunt verder met de taak." and log a `form_submit` event with the form name.

## 2. Event log ("screen movements")

No video recording. Log small events into the session, per task and for the whole session:

- `page`: page key and time, every time the page changes (the app already tracks `pageKey`)
- `click`: label of the clicked element, from the closest `button`, `a`, `[role=button]` or `[aria-label]`, trimmed to 60 characters. **Never log values typed into inputs.**
- `scroll`: max scroll depth in % per page (log once per page when leaving)
- `form_submit`: form name
- `task_start`, `task_done`, `task_stuck` with timestamps
- device: phone/tablet/desktop, viewport width x height, browser user agent short form
- cap at 3000 events

Also compute per task: seconds, pages visited in order, number of clicks, and for task 4 whether a game preview page was opened (`preview` page) and how long they stayed there.

## 2b. Mouse movement and hover (new in v6)

Put all tracking in one file, `src/tracking.ts`, so it is easy to switch off. It only runs in participant mode, never in normal use or leader mode.

- **Click position:** add to every `click` event `x` and `y` as % of the viewport (0 to 100, 1 decimal), plus `scrollY` in px, so I can see where on the page they clicked.
- **Hover:** listen to `pointerover`/`pointerout` on the closest `button`, `a`, `[role=button]`, `[aria-label]` or card element (`[data-card]` or the workshop/game card class, check the code). Log a `hover` event only when the pointer stays at least **500 ms**: `{ label, ms, page }`. Ignore `pointerType === 'touch'`.
- **Mouse path:** sample the pointer position every **250 ms**, only when it moved more than 5 px since the last sample. Store compact: `[t, x, y]` with `t` = ms since task start, `x`/`y` = % of viewport (1 decimal). Store separately from the event log in `mouse: { [taskId]: Array<[number, number, number]> }`. Cap at **6000 samples** for the whole session (drop the oldest of the current task if full). Pause when the tab is hidden.
- **Touch (phone):** no mouse path. Log a `tap` event with label and x/y % instead of hover.
- **Rage click:** if there are 3 or more clicks within 1 second within 30 px, log one `rage_click` event with the label. This shows where people got frustrated.
- **Dead click:** a click on something that is not a link, button or input (nothing happens) → log `dead_click` with the closest text (60 chars) and x/y %. This shows what people thought was clickable.
- **Never** log key presses or input values. Do not attach listeners to `keydown`/`input`.
- Keep the whole JSON body under 1 MB. If it gets bigger, drop mouse samples first (every second one), never answers.

Per task in the summary, also compute:
- top 5 elements by hover time (label + seconds)
- number of rage clicks and dead clicks, with labels
- mouse distance in screen widths (sum of the path, rough is fine)

### A small viewer for the mouse path

Make `public/test/viewer.html`: a standalone page (no build, plain HTML + JS) where I drag in the `.json` from the email. It shows:
- a list of tasks; pick one
- a 16:9 box with the mouse path drawn as a line (light to dark over time), clicks as dots, rage clicks as red dots, and the pages visited as labels on the timeline under it
- the hover top 5 for that task
- a "play" button that animates the path at 4x speed

It does not need a screenshot of the site behind it. It must work offline once opened, and must not send the file anywhere.

## 3. The flows and texts

Use exactly these texts. `○` options are big single-choice buttons. `...` is a text field (optional unless noted). Every task is followed by its questions on a question screen.

### Start (both)

**Welkom** (screen 1)
> Fijn dat u meedoet. U helpt InnerGames om hun nieuwe website beter te maken. Dit duurt ongeveer 15 minuten. U test de website, niet uzelf. Er zijn geen foute antwoorden. Er wordt niets verkocht en niets echt verstuurd.

**Toestemming** (same screen, checkbox required before "Beginnen")
> Uw antwoorden worden zonder naam bewaard. Ze worden alleen gebruikt om de website te verbeteren en voor het stageverslag van Damian bij Fontys. We slaan ook op welke pagina's u bekijkt, waar u klikt en hoe u de muis beweegt. Er wordt geen video of beeld van uw scherm opgenomen. Wat u typt in de website zelf slaan we niet op. Alles wordt uiterlijk 31 januari 2027 verwijderd. U kunt altijd stoppen.
>
> ☐ Ik heb dit gelezen en doe mee.

**1. Waar werkt u?** (required)
○ op een school of opleiding (mbo of hbo) → profile `school`
○ bij een bedrijf of organisatie → `organisatie`
○ ik ben zelf trainer of coach → `trainer`
○ iets anders, namelijk: ... → `anders` (gets the organisatie tasks)

### Clients only (`?test=klant`)

- **A1.** Hoe kwam u voor het eerst bij InnerGames terecht? ○ via Ariën op LinkedIn ○ iemand raadde het aan ○ via Google ○ op een evenement of beurs ○ anders, namelijk: ...
- **A2.** Heeft u de website van InnerGames bekeken voordat u contact opnam? ○ ja ○ nee ○ weet ik niet meer. If ja: "Wat zocht u daar?" ...
- **A3.** Hoe nam u contact op? ○ bericht op LinkedIn ○ e-mail ○ telefoon of WhatsApp ○ formulier op de website ○ anders
- **A4.** Wat gaf de doorslag om met InnerGames te werken? ...
- **A5.** Was er iets waardoor u twijfelde? ...

Then the tasks.

### New visitors only (`?test=nieuw`)

- **B1.** Kent u InnerGames? ○ nee ○ alleen van naam ○ ja, ik heb er al mee gewerkt
- **B2.** Screen with the text "U ziet dit bericht van Ariën op LinkedIn en klikt op de link." and the image `public/test/linkedin-post.png` (I will add it; show a grey placeholder box with "LinkedIn-bericht" if the file is missing). Button "Klik op de link" opens the homepage.
- **B3.** The homepage is shown for 10 seconds with a small countdown ("nog 10 seconden"), then hidden behind the question card:
  - "Wat doet dit bedrijf, in uw eigen woorden?" ... (required)
  - "Voor wie is het?" ...

Then the tasks. Start every task from the homepage.

### Tasks (both)

**Taak 1: een workshop vinden.** Task text depends on the profile:
- school: "U wilt met uw studenten iets doen tijdens een projectweek. Zoek op de website een workshop die daarbij past."
- organisatie / anders: "U zoekt een workshop over samenwerken voor uw team van 12 mensen. Zoek er een die past."
- trainer: "U wilt zelf leren werken met de spellen van InnerGames. Zoek op wat daarvoor nodig is."

After "Klaar" or "Ik kom er niet uit":
- **1a.** Welke workshop heeft u gekozen? (trainer: "Wat heeft u gevonden?") ...
- **1b.** Hoe makkelijk was dit? ○ heel moeilijk ○ moeilijk ○ gaat wel ○ makkelijk ○ heel makkelijk

**Taak 2: de prijs.** Task text: "Zoek uit wat de workshop kost die u net koos." (trainer: "Zoek uit wat dat kost.")
- **2.** Wat kost het, en voor hoeveel mensen is dat? Two fields: Prijs ... Aantal mensen ...

**Taak 3: een datum vragen.** Task text: "U wilt in maart een datum vastleggen. Ga zo ver als u zou gaan om dat te regelen. Er wordt niets echt verstuurd."
- **3.** Hoe ging dat? ○ gelukt ○ ik liep vast ○ ik zou liever bellen of mailen

**Taak 4: het spel.** Task text: "U hoort dat u een spel van InnerGames online kunt uitproberen. Zoek het en probeer het een paar minuten." Do not say where it is.
- **4a.** Heeft u het spel gevonden? ○ ja, meteen ○ ja, na wat zoeken ○ nee
- **4b.** Wat zou u hierna doen? ○ meer lezen over het spel ○ het spel kopen ○ een workshop aanvragen ○ niets ○ anders: ...

### Contact and trust

- **C1** (both). Open the contact page behind the card first, then ask: "Bekijk het aanvraagformulier. Zou u dit invullen, of neemt u liever direct contact op?" ○ ik vul het formulier in ○ ik mail Ariën ○ ik bel of app ○ ik stuur een bericht op LinkedIn. Then "Waarom?" ...
- **C2** (nieuw only). Weet u wie er achter InnerGames zit? ○ ja, namelijk: ... ○ nee
- **C3** (nieuw only). Zou u InnerGames inhuren op basis van deze website? ○ ja ○ misschien ○ nee. Then "Wat hielp daarbij?" ... and "Wat hield u tegen?" ...

### Closing (both)

- **E1.** Deze website doet wat ik nodig heb. ○ helemaal mee oneens ○ oneens ○ neutraal ○ eens ○ helemaal mee eens
- **E2.** Deze website is makkelijk te gebruiken. (same 5 options)
- **E3.** Hoe komt de website op u over? Two rows of 5 big buttons: "amateuristisch ... professioneel" and "saai ... speels"
- **E4.** Wat mist u nog op de website? ...
- **E5** (klant only). Vergeleken met wat u eerder van InnerGames zag, vindt u deze website ○ beter ○ even goed ○ slechter ○ weet ik niet. Then "Waarom?" ...

**Einde.** "Bedankt! Uw antwoorden zijn verstuurd. U kunt dit venster sluiten." plus the participant id in small text ("Uw code: P-XXXX. Noem deze code als u uw antwoorden wilt laten verwijderen.").

## 4. Sending to my email

- Add a Vercel serverless function `api/submit.ts` (in the project root `api/` folder, works with Vite on Vercel). Use **Resend** (`npm i resend`). The API key stays on the server, never in the client bundle.
- Environment variables (I will set them in Vercel): `RESEND_API_KEY`, `MAIL_TO` (my email), `MAIL_FROM` (default `onboarding@resend.dev`).
- The function checks: method POST, JSON body under 1 MB, a hidden honeypot field is empty, `group` is `klant` or `nieuw`. Otherwise 400. `sendBeacon` may arrive as `text/plain`, so parse the body yourself when `req.body` is a string.
- Important: with `MAIL_FROM` = `onboarding@resend.dev`, Resend only delivers to the email address of the Resend account itself. `MAIL_TO` must be that same address. If the Resend call fails, log the error with `console.error` so it shows in Vercel's function logs, and return 502.
- Add `GET /api/submit?ping=1` that returns `{ ok: true, resend: boolean, mailTo: boolean }` (only whether the env vars are set, never their values), so I can check the setup in the browser.
- Add a test flag: `/?test=klant&demo=1` fills nothing in automatically, but adds a small "stuur testmail" button on the start screen that sends a fake short session with status `test` and subject `IG test DEMO`. Only show this with `demo=1`.
- Email:
  - subject: `IG test {klant|nieuw} {P-XXXX} {profiel} {compleet|onvolledig}`
  - text body: a readable summary in Dutch, every question with its answer, and per task: time, pages in order, clicks, stuck yes/no, hover top 5, rage clicks, dead clicks, and for task 4 whether the preview was opened. Put the device line (phone/tablet/desktop, size, browser) at the top.
  - attachments: the full session as `.json` and one row per answer as `.csv`
- Client side:
  - send when the participant reaches "Einde" (status `compleet`)
  - if they close the tab before the end, send what there is with `navigator.sendBeacon` on `pagehide` (status `onvolledig`). Send at most once per participant id per status.
  - on failure: retry 3 times (1 s, 3 s, 9 s). If it still fails, keep the session in localStorage with `sent: false`, retry on the next visit, and on the end screen show "Het versturen lukte niet. Wilt u op deze knop drukken en het bestand naar damian… mailen?" with a download button. Use a placeholder `MAIL_TO_DISPLAY` constant for the address, I fill it in.

## 5. Done when

- [ ] `npm run build` passes, leader mode still works with the "taken" toggle
- [ ] `/?test=klant` and `/?test=nieuw` run the right flow from start to end, on desktop and at 390px wide
- [ ] Reload in the middle continues where you were
- [ ] Site forms don't send in participant mode
- [ ] With `vercel dev` and real env vars: finishing sends one email with summary, JSON and CSV; closing halfway sends one "onvolledig" email
- [ ] Wrong body or filled honeypot gives 400
- [ ] No typed input values appear in the event log
- [ ] Deep links work after deploy (e.g. open `/spellen/elemental-five-compleet` directly)
- [ ] Mouse path, hovers (≥ 500 ms), rage clicks and dead clicks appear in the JSON; nothing typed appears anywhere
- [ ] On a phone (390px): no mouse path, taps are logged
- [ ] `public/test/viewer.html` opens the JSON from the email and draws the path per task
- [ ] `/api/submit?ping=1` shows the env vars are set
- [ ] JSON stays under 1 MB after a 20-minute session (test this with a fake long session in code)

When done, give me: the two links, the env vars to set in Vercel, and a short list of what you changed.
