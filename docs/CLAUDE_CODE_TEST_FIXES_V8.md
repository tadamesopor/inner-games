# Claude Code task: test fixes v8 (old vs new first impression)

Read this whole file first. Don't change leader mode in `src/test.tsx`. Keep the tracking, the replay and everything from v7 working. Run `npm run build` at the end.

Do not add `Co-Authored-By` or any Claude/AI attribution lines to commits.

## 0. Check these two first (from earlier messages)

If they are not done yet, do them now. If they are, skip them.

- **4c optional:** 4c is optional, like 4a and 4b.
- **Date field on the contact form** (`src/pages.tsx`), right under "Bericht": label `Wanneer zou u het willen doen?` with `(niet verplicht)` like the "Hoe heeft u ons gevonden?" field, a free text input, placeholder `bijvoorbeeld: begin maart, een dinsdag`. In participant mode it sends nothing and is never logged.

## 1. Why

In the nieuw flow, B3 shows the new homepage for 10 seconds and asks what the company does. Teachers said nobody could tell what InnerGames does from the site. I want to compare the **old** homepage (innergames.nl) with the **new** one on exactly that question, so the comparison is not only an opinion.

## 2. The images of the old homepage

I add two full-page screenshots of innergames.nl:

- `public/test/old-homepage-desktop.png` (taken at desktop width)
- `public/test/old-homepage-mobile.png` (taken at phone width)

Use the desktop one when the viewport is 640px or wider, the mobile one below that. If the right one is missing, use the other one. If both are missing, skip the old look completely, log `{ type: 'old_missing' }`, and run B3 as one look at the new homepage.

## 3. B3 becomes two looks of 20 seconds (nieuw flow only)

The klant flow doesn't change.

**Order:** at the start of the session, pick at random `old_first` or `new_first` (50/50) and save it in the session as `b3Order`. Half see the old one first, half the new one. Otherwise the second one always seems clearer, because they already know a bit.

**Never say which one is old or new.** Call them "website 1" and "website 2" in the order they are shown.

**Each look:**
- A short intro card: `U ziet nu website 1. Kijk rustig rond, u heeft 20 seconden.` (or "website 2"). Button `Bekijken`.
- Then 20 seconds with a small countdown `nog 20 seconden`. Scrolling is allowed. Clicks do nothing (no page change, no message), but are logged as clicks.
- **Old look:** show the screenshot as a scrollable page, full viewport width, no website header or test bar around it except the countdown. Scale the image to the viewport width.
- **New look:** the live homepage (`go('home')`, scroll 0), with the website header as normal.
- After the 20 seconds, the question card comes over it:
  - `Wat doet dit bedrijf, in uw eigen woorden?` (text, required)

**After both looks, one question screen:**
- `Welke van de twee websites maakt duidelijker wat dit bedrijf doet?` ○ website 1 ○ website 2 ○ even duidelijk
- `Waarom?` (text, optional)
- `Voor wie is dit bedrijf, denkt u?` (text, optional)

No vorige button on any B3 screen (the looks can't be done again). The step counter ("Stap X van Y") counts these screens.

Then the tasks start from the new homepage, as now.

## 4. Recording and the email

- Record mouse, scroll and clicks during each look as its own segment: `b3_old` and `b3_new`, like a task. Mouse samples use the same `[t, x, y, scrollY]` format. For the old look, `scrollY` is the scroll position inside the screenshot.
- Save answers with codes that say which site it was, whatever the order: `B3_old`, `B3_new`, `B3_compare` (stored as `old`, `new` or `equal`, not "website 1/2"), `B3_why`, `B3_who`.
- Email summary, near the top of the answers:
  ```
  EERSTE INDRUK (volgorde: oud eerst)
  Oude site: ...
  Nieuwe site: ...
  Duidelijker: nieuwe site
  Waarom: ...
  Voor wie: ...
  ```
- CSV: one row per code, as now.

## 5. Replay viewer (`public/test/viewer.html`)

- `b3_old` and `b3_new` appear in the task list as `eerste indruk: oude site (20 s)` and `eerste indruk: nieuwe site (20 s)`, in the order they were shown.
- For `b3_old`, the replay shows the old screenshot (desktop or mobile, the one that was used) instead of the iframe, scrolled like the participant scrolled, with the cursor and click rings on top.
- For `b3_new`, the replay uses the iframe on the homepage, like a task.
- The answers card after each look shows that look's answer, and after the second look the comparison answers.

## 6. Also

- Update `docs/CLAUDE_CODE_TEST_MODE_V6.md` where it describes B3, so the doc matches the code.
- The welcome text keeps "ongeveer 20 minuten".

## Done when

- [ ] `npm run build` passes
- [ ] nieuw flow: two looks of 20 s in a random order, saved as `b3Order`; both orders tested
- [ ] "website 1/2" on screen, never "oud/nieuw"
- [ ] Clicks during the looks do nothing and are logged
- [ ] At 390 the mobile screenshot is used, at 1440 the desktop one; with both images missing, B3 is one look at the new homepage
- [ ] Answers stored as `B3_old`, `B3_new`, `B3_compare` (`old/new/equal`), `B3_why`, `B3_who`; email shows the "EERSTE INDRUK" block with the order
- [ ] Replay: both looks play back, the old one on the screenshot
- [ ] klant flow unchanged, leader mode still works
- [ ] 4c optional and the date field are in (section 0)

Commit: `b3: compare old and new homepage, 20 seconds each, random order`. Commit this file too. Do not push, I push myself.

When done, tell me what changed per file, and how to test both orders myself (for example a `&order=old` / `&order=new` flag together with `&demo=1`, only for testing).
