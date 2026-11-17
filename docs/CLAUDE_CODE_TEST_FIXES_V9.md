# Claude Code task: test fixes v9 (optional name and "hou mij op de hoogte")

Read this whole file first. Don't change leader mode, the tracking, the replay or the old vs new look. Run `npm run build` at the end.

Do not add `Co-Authored-By` or any Claude/AI attribution lines to commits.

## Why

The test is anonymous. Some participants want to leave their name, for example so I can ask a follow-up question, or because they want to hear the results. Also, Ariën needs real quotes with a name for the website, and a participant can only give that if they are not anonymous. So: anonymous stays the default, giving a name is an option at the end.

## 1. Consent text (welcome screen, both flows)

Replace the first sentence of the consent text:

- old: `Uw antwoorden worden zonder naam bewaard.`
- new: `Uw antwoorden worden zonder naam bewaard, tenzij u aan het eind zelf uw naam of e-mailadres invult. Dat is niet verplicht.`

The rest of the text stays exactly as it is.

## 2. New screen before "Einde" (both flows): "Bijna klaar"

After the last question screen (E4 or E5), before the end screen. It counts in "Stap X van Y". It has a vorige button back to the last question screen.

Text:

> **Bijna klaar**
>
> Wilt u uw naam achterlaten? Dat hoeft niet. U kunt dit ook overslaan.

Fields, all optional:
- `Naam`
- `Organisatie`
- `E-mailadres`

Checkboxes, only clickable when an e-mailadres is filled in (otherwise greyed out, with the small text "vul eerst uw e-mailadres in"):
- ☐ `U mag mij mailen als u nog een vraag heeft over mijn antwoorden.`
- ☐ `Hou mij op de hoogte: stuur mij de uitkomsten als de test klaar is.`
- ☐ `InnerGames mag contact met mij opnemen om een van mijn antwoorden als citaat op de website te gebruiken. Er wordt niets geplaatst zonder dat ik het eerst zie en goedkeur.`

Buttons: `Overslaan` (secondary) and `Afronden` (main).
- `Overslaan` goes to the end screen and clears anything typed on this screen.
- `Afronden`: if an e-mailadres is filled in, check it lightly (one `@` and a dot after it). If it looks wrong: "Dit e-mailadres lijkt niet te kloppen." and stay on the screen. Then go to the end screen.

Same layout rules as the other question screens: 18px text, fields and buttons at least 48px high, works at 390.

## 2b. A thank-you gift (text still to be decided with Ariën)

Ariën wants to give participants a small thank-you gift. To receive it they need to leave their email. We haven't picked the gift yet, so put all gift text in **one constant** at the top of `src/participant.tsx`:

```ts
// TODO Ariën: pick the gift and fill in the texts. GIFT = null hides everything about the gift.
const GIFT: null | { short: string; long: string } = null
```

When `GIFT` is not null:
- **Welcome screen:** one extra line under the welcome text: `Als dank voor uw tijd: ${GIFT.short}` (for example "een kleine attentie van InnerGames").
- **"Bijna klaar" screen:** change the intro to: `Wilt u uw naam achterlaten? Dat hoeft niet. Als dank sturen we u ${GIFT.long} Laat dan uw e-mailadres achter.` Add one checkbox at the top of the list, only clickable with an email: ☐ `Ja, stuur mij het bedankje.`
- **Separate checkbox for InnerGames news**, never ticked by default and never needed for the gift: ☐ `InnerGames mag mij af en toe mailen over nieuwe spellen en workshops.` Store it as `nieuwsbrief: true`. Show it in the CONTACT block of the email.
- **Small text under the checkboxes:** `Het bedankje krijgt u ook als u de andere vakjes leeg laat. Uw antwoorden staan los van uw naam en tellen hetzelfde.`
- **End screen:** if they asked for the gift: `We sturen u het bedankje zo snel mogelijk.`
- Add `cadeau: ja` to the CONTACT block of the email when they asked for it.

When `GIFT` is null: none of the above shows, except the "nieuwsbrief" checkbox, which always shows when an email is filled in.

## 3. Privacy rules for these fields

- These values are **never** logged in the event log, the mouse data or the replay. No click labels with the value either.
- Store them separately in the session as `contact: { naam, organisatie, email, mailVraag, opDeHoogte, citaat, cadeau, nieuwsbrief }`. Only keys that are filled in.
- They are **not** in the JSON or CSV attachments. The attachments stay anonymous, so I can use them for analysis and in my portfolio.
- They **are** in the email body, at the very top, in a separate block:
  ```
  CONTACT (zelf ingevuld)
  Naam: ...
  Organisatie: ...
  E-mail: ...
  Mag mailen voor een vervolgvraag: ja
  Op de hoogte houden: ja
  Citaat mag gevraagd worden: ja
  ```
  No block when nothing was filled in.
- Email subject: add `met naam` at the end when a name or email is filled in, so I can find them: `IG test klant P-XXXX organisatie compleet met naam`.
- The `onvolledig` beacon never contains contact data (this screen comes last anyway, but make sure).
- In localStorage, remove `contact` as soon as the "compleet" mail has been sent successfully. If sending fails, keep it until it succeeds, like the rest.
- On the "sending failed" fallback (the download button), the downloaded file **does** include the contact block, because then the participant mails it to me themselves.

## 4. End screen

Keep the current text. Add, depending on what they chose:
- if "Hou mij op de hoogte" is ticked: `U hoort van ons als de uitkomsten klaar zijn.`
- always, in the small text with the code: `Wilt u uw gegevens laten verwijderen? Mail naar [MAIL_TO_DISPLAY] en noem uw code.` (use the existing `MAIL_TO_DISPLAY` constant)

Also add a small secondary button on the end screen: `Bewaar uw antwoorden`. It downloads a plain text file `innergames-test-P-XXXX.txt` with the questions and their own answers in readable Dutch (no event log, no mouse data). This is so participants can keep their answers, since I can't email them automatically.

## 5. Not now: emailing the answers to participants

Don't build automatic emails to participants. With the free Resend test sender, Resend only delivers to my own address. That needs a verified domain first. Just tell me in your summary what would be needed later.

## Done when

- [ ] `npm run build` passes
- [ ] New consent sentence on the welcome screen, rest unchanged
- [ ] "Bijna klaar" screen in both flows, before the end screen, with vorige, Overslaan and Afronden
- [ ] Checkboxes disabled without an email, light email check works
- [ ] With `GIFT` filled in for a test: the welcome line, the gift intro, the gift checkbox and the end screen line show; the nieuwsbrief checkbox is separate and never needed for the gift. With `GIFT = null` they are hidden
- [ ] Contact data: in the email body (top block) and subject ("met naam"), never in the JSON, CSV, event log, mouse data, replay or the onvolledig beacon
- [ ] localStorage contact removed after a successful send
- [ ] End screen: "U hoort van ons" when chosen, the deletion line always, and "Bewaar uw antwoorden" downloads a readable text file
- [ ] Tested at 1440 and 390, with `/api/submit` mocked: once with everything filled in, once with Overslaan, once with a wrong email

Commit: `optional name at the end, keep me posted, save your answers`. Commit this file too. Do not push, I push myself.

When done, tell me per file what changed, and show me the "Bijna klaar" screen and the CONTACT block of a test mail.
