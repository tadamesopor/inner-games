# Claude Code task: remote test mode v5 (deadline Tuesday 17 November)

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

## 3. The flows and texts

Use exactly these texts. `○` options are big single-choice buttons. `...` is a text field (optional unless noted). Every task is followed by its questions on a question screen.

### Start (both)

**Welkom** (screen 1)
> Fijn dat u meedoet. U helpt InnerGames om hun nieuwe website beter te maken. Dit duurt ongeveer 15 minuten. U test de website, niet uzelf. Er zijn geen foute antwoorden. Er wordt niets verkocht en niets echt verstuurd.

**Toestemming** (same screen, checkbox required before "Beginnen")
> Uw antwoorden worden zonder naam bewaard. Ze worden alleen gebruikt om de website te verbeteren en voor het stageverslag van Damian bij Fontys. We slaan ook op welke pagina's u bekijkt en waar u klikt. Wat u typt in de website zelf slaan we niet op. Alles wordt uiterlijk 31 januari 2027 verwijderd. U kunt altijd stoppen.
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
- The function checks: method POST, JSON body under 500 KB, a hidden honeypot field is empty, `group` is `klant` or `nieuw`. Otherwise 400.
- Email:
  - subject: `IG test {klant|nieuw} {P-XXXX} {profiel} {compleet|onvolledig}`
  - text body: a readable summary in Dutch, every question with its answer, and per task: time, pages in order, clicks, stuck yes/no, and for task 4 whether the preview was opened
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

When done, give me: the two links, the env vars to set in Vercel, and a short list of what you changed.
