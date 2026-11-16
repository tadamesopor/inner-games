# Claude Code task: session replay v1

Read this whole file first. Do part A, commit, and stop to tell me. Then do part B.

Do not add `Co-Authored-By` or any Claude/AI attribution lines to commits. Don't change leader mode in `src/test.tsx`. Don't change the questions or task texts.

## Why

The viewer (`public/test/viewer.html`) draws the mouse path in an empty box. I want to watch a session back **on the real website**: the pages change like the participant changed them, the page scrolls like they scrolled, and a cursor moves along their mouse path with a ring at every click.

It is a reconstruction from the log, not a video. Nothing new is recorded of the screen, so the consent text stays as it is.

Part A is urgent: Ariën sends the test link soon, and sessions recorded without scroll positions can't be replayed well. Part B can take longer.

---

## Part A. Record scroll position (small, do this first)

All in `src/tracking.ts` (and `src/participant.tsx` only where needed).

1. **Mouse samples get the scroll position.** A sample is now `[t, x, y, scrollY]`. `scrollY` is `window.scrollY` in px, rounded.
2. **Scrolling without moving the mouse must also be recorded.** Listen to `scroll` (passive). When `scrollY` changed more than 40 px since the last sample and at least 250 ms passed, add a sample with the last known x and y.
3. **Phones and tablets:** there is no mouse path, but do record scroll samples: `[t, null, null, scrollY]`. Taps already have x/y.
4. **Page events must be replayable.** Every `page` event needs the page id **and** the `sel` (the second argument of `go(page, id)`), plus the time. Check that this is the case, and fix it if not.
5. **Every click and tap event** keeps x/y % and gets `scrollY` if it doesn't have it yet.
6. **Session info:** save once per session `viewport: { w, h }` (already there, check) and per page visit the page height (`document.documentElement.scrollHeight`) in the `page` event as `h`, logged about 500 ms after the page change so the page has rendered.
7. Limits stay the same: at most 6000 samples, body under 1 MB, beacon under 64 KB. Run the fake 20-minute session test again with the 4-number samples and tell me the size.
8. Old sessions with `[t, x, y]` samples must still open in the viewer.

**Done when**
- [ ] `npm run build` passes
- [ ] A test run at 1440 gives samples with 4 numbers, and scrolling with a still mouse adds samples
- [ ] A test run at 390 gives scroll-only samples and taps
- [ ] `page` events have page, sel, time and height
- [ ] No typed values anywhere, no keydown or input listeners

Commit: `record scroll position for replay`. Then stop and tell me, so I can push before the link goes out.

---

## Part B. Replay on the real website

### B1. Replay mode in the app (`src/replay.ts`, new)

- The app starts in replay mode when the URL has `?replay=1`. Read it once at startup, like `?test=`.
- In replay mode:
  - no participant mode, no tracking, no leader tools, no ⚙ button
  - forms don't send anything (they already don't)
  - the pencil page transition is off or as short as in test mode, so the replay keeps up
  - the cart starts empty
- It listens to `message` events and **only accepts messages from its own origin** (`event.origin === location.origin`). Messages:
  - `{ type: 'go', page, sel }` → `go(page, sel)` without pushing browser history
  - `{ type: 'scroll', y }` → `window.scrollTo(0, y)` (instant, not smooth)
  - `{ type: 'reset' }` → home page, scroll 0, cart empty
- After every `go`, it answers the parent with `{ type: 'ready', page, sel, h }` when the page has rendered.
- Replay mode never reads or writes `ig:participant`, so it can't disturb a real test session in the same browser.

### B2. The replay player in `public/test/viewer.html`

Keep the current path drawing as a tab ("muispad"). Add a second tab: **"replay op de website"**. Make it the default tab when the session has scroll data.

- An `<iframe>` with `src="/?replay=1"`, exactly as big as the participant's viewport (`viewport.w` x `viewport.h`), scaled down with a CSS transform so it fits the screen. Show the real size and "desktop" or "telefoon" next to it.
- A **cursor layer on top of the iframe** (in the viewer, not in the site): an arrow cursor that moves along the samples, with smooth movement between samples. For phone sessions: no cursor, show a soft dot at each tap.
- **Clicks:** a ring that grows and fades at the click position. Rage clicks red, dead clicks as an open ring. Show the label of the clicked element in a small caption for 1.5 s ("klik: bekijk de workshops").
- **Pages and scroll:** at each `page` event send `go`, wait for `ready`, then continue. For every sample send `scroll` with its `scrollY`.
- **Controls:** play/pause, speed 1x / 2x / 4x, a timeline you can drag, and the task picker that is already there. Show the task text above the player.
- **Timeline:** marks for page changes, clicks and rage clicks. Hover a mark to see what it is.
- **Skip waiting:** when nothing happens for more than 3 seconds, jump ahead and show "… 12 s niets" for a moment. A toggle switches this off.
- **Between tasks:** show a card with the questions and the answers the participant gave after that task, then go on to the next task. A "hele sessie afspelen" button plays all tasks in a row.
- **Side panel:** the facts for the task: time, stuck yes/no, pages in order, hover top 5, rage and dead clicks.
- The viewer still sends the JSON file nowhere. The replay tab needs the website online (the iframe). The "muispad" tab still works offline. Say that in one line in the viewer.
- If the session has no scroll data (old sessions) or is "onvolledig" without a mouse path: show a clear message and replay only pages and clicks.

### B3. Things that can't be replayed exactly (show this as a small note in the viewer)

- What people typed is never recorded, so forms stay empty.
- Hover effects on the site don't show, because the cursor is a drawing on top.
- The Elemental Five preview: we only know they opened it and how long. Show the preview page with a caption "speelde het spel, 2 min 10 s", don't try to replay inside the game.
- If I change the website after a session, the replay shows the new site with the old movements. Show the session date and a warning when it is older than the last deploy if you can find that simply, otherwise just show the session date.

### B4. Test it

- Record two sessions yourself (mock `/api/submit`): one at 1440 with scrolling, hovering, a rage click and a dead click; one at 390 with taps.
- Replay both. Check: pages change at the right moments, scroll positions match, the cursor ends on the button that was clicked (compare with the click label).
- Check an old 3-number session file still opens.
- Check `/?replay=1` ignores messages from another origin.
- `npm run build` passes, leader mode and participant mode still work.

Commit: `replay a session on the real website in the viewer`. Do not push, I push myself.

When done, tell me what you changed per file and what doesn't replay exactly.
