# InnerGames prototype: notes for Claude Code

## What this is
A clickable prototype of the new website for InnerGames (Eindhoven), a company that makes games and workshops
that combine play, reflection and body-focused work. It is used for user tests with mbo/hbo teachers,
people from organisations (HR, team leads, managers) and trainers/coaches. The real site will later be built in WordPress (Enfold).

## Stack
React 18 + TypeScript + Vite + Tailwind CSS v4 (`@import 'tailwindcss'` and `@theme` in `src/index.css`).
No router: `App.tsx` switches pages with `go(page, id)` from the `Ctx` context in `wf.tsx`.

## Files
- `src/App.tsx`: page switch, cart, prototype options (⚙ in the bottom-left corner)
- `src/index.css`: brand tokens and the "calm style" overrides (no hard black shadows or thick borders)
- `src/test.tsx`: user test mode (round 0 current site, round 1 prototype, retest). Changing tasks or questions
  changes the research, so only do that when asked, and keep `codes` (D1 to D12) and the `expect` texts in sync.
- `src/data.ts`: all workshops, games, prices, team members and projects. Prices and facts come from innergames.nl.
- `src/pages.tsx`, `src/shop.tsx`, `src/team.tsx`: the pages
- `docs/Figma_Make_Prompt_v5_Echte_Fotos_Rustige_Stijl.md`: the list of changes to make (sections 1 to 12)

## Brand rules (from the InnerGames brand guide)
- Orange `#EA561F`, yellow `#FAB512`, ink `#2A1810`, cream `#FFF6E6`. Small orange text on light backgrounds: `#C84413`.
- Font: Gill Sans only (stack in `index.css`, Cabin as fallback).
- Titles always lowercase. Tags lowercase too.
- Tone: "a serious organisation that does playful things". Calm, warm, lots of white space.
- No hard black offset shadows, no thick black borders (the owner doesn't like them).
- Real InnerGames photos only (see the table in the docs file). No stock photos, no placeholders.

## Rules for content
- All website text is in Dutch.
- Never invent reviews, quotes, client names or numbers. If something isn't known, leave it out (no "n.t.b.").
- Keep prices, durations and group sizes exactly as in `data.ts`.

## Working
- Run `npm run build` after changes. It must pass without type errors.
- One commit per finished change, with a short lowercase message in plain English, for example "add booking form".
- Check desktop and the "mobiel 390" view.
