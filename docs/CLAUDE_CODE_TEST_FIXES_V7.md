# Claude Code task: test fixes v7 (before Ariën sends the link)

Read this whole file first. Small changes only, no redesign. Don't change leader mode in `src/test.tsx`, the tracking in `src/tracking.ts` or the replay. Run `npm run build` at the end.

Do not add `Co-Authored-By` or any Claude/AI attribution lines to commits.

## 1. New question 4c (the game)

My sub-question is "what makes a game preview work". The test only asks if people found the game, not if it helped. Add one question in task 4, right after 4a, on the same question screen as 4a and 4b if it fits, otherwise on its own screen:

- **4c.** Hielp het spel u om te begrijpen wat InnerGames doet? ○ ja ○ een beetje ○ nee ○ ik heb het niet gespeeld

Use the same big single-choice buttons as the other questions. Add it to:
- the email summary
- the CSV (one row, code `4c`)
- the answers card between tasks in the replay viewer

If 4a is "nee", preselect nothing, but show 4c anyway (they may have found something else).

## 2. "ongeveer 20 minuten"

Change "ongeveer 15 minuten" to "ongeveer 20 minuten" everywhere in participant mode (the welcome text and anywhere else it appears). The welcome text becomes:

> Fijn dat u meedoet. U helpt InnerGames om hun nieuwe website beter te maken. Dit duurt ongeveer 20 minuten. U test de website, niet uzelf. Er zijn geen foute antwoorden. Er wordt niets verkocht en niets echt verstuurd.

## 3. A "vorige" button on the question screens

Older participants want to fix an answer. Add a **vorige** button on the question screens.

- Place: bottom left of the question card, next to the main button on the right. Secondary style (outline), at least 48px high, same font size as the other buttons. Text: `vorige`.
- It goes back **one question screen**. Answers stay filled in, going back and forward again keeps them.
- **It never goes back into a task.** A task can't be done again, because the times, clicks and mouse path would get mixed up. So:
  - On the first question screen after a task (1a/1b, 2, 3, 4a/4b/4c), there is **no** vorige button.
  - On the B3 screen (after the 10-second homepage) there is **no** vorige button, the 10 seconds can't be done again.
  - On C1, there is no vorige button if going back would mean the contact page step again; check how C1 is built and pick the simple, safe option.
- From question 1 ("Waar werkt u?") it may go back to the welcome screen. The consent box stays ticked.
- If someone goes back to question 1 and changes their profile before any task has started, the task texts follow the new profile. After task 1 has started, question 1 can't be reached anymore (it's behind a task).
- "Stap X van Y" updates when going back.
- Log a `back` event `{ from, to }` with the screen ids. Show the number of times someone used vorige in the email summary ("vorige gebruikt: 2x").
- A reload after going back continues on the screen they were on, with the answers kept.
- On phones (390px): vorige and the main button sit next to each other if they fit, otherwise vorige goes under the main button. Both stay visible without scrolling the card.

## 4. Dutch time in the email

The email shows times in UTC ("Begonnen: 2026-11-16T23:50:57.971Z"). Show them in Dutch time instead, in a readable form:

- `Begonnen: maandag 16 november 2026, 00:50`
- `Klaar: maandag 16 november 2026, 00:52`

Use `Europe/Amsterdam` with `Intl.DateTimeFormat('nl-NL', …)` in `api/submit.ts`. Keep the raw ISO times in the JSON and CSV as they are, so the viewer and my analysis still work.

## Done when

- [ ] `npm run build` passes
- [ ] 4c shows after 4a, is required like the other single-choice questions, and appears in the email, CSV and the replay answers card
- [ ] "ongeveer 20 minuten" on the start screen, "15 minuten" appears nowhere in participant mode
- [ ] vorige works on the screens where it's allowed, is hidden on the first screen after every task, on B3 and where C1 would repeat a step
- [ ] Going back and forward keeps the answers; a reload keeps the screen and the answers
- [ ] `back` events in the JSON, "vorige gebruikt" in the email
- [ ] Email times in Dutch time, JSON and CSV still ISO
- [ ] Ran both flows at 1440 and 390 with `/api/submit` mocked, leader mode still works

Commit: `test fixes v7: question 4c, 20 minutes, vorige button, dutch time in mail`. Commit this file too. Do not push, I push myself.

When done, tell me per file what changed and on which screens vorige is hidden.
