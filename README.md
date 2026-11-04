# innergames prototype

Clickable prototype of the new InnerGames website, with a built-in user test mode.
Made during my internship at InnerGames (Front End Development, Fontys ICT).
Moved from Figma Make to a normal React + Vite + Tailwind project in week 9.

## before you start: add the files from Figma Make

This folder already has the setup and my v5 files (`src/App.tsx`, `src/index.css`, `src/test.tsx`).
The pages themselves are still in Figma Make, so copy these from the Figma Make code view (or the downloaded zip) into `src/`:

- `wf.tsx`
- `pages.tsx`
- `shop.tsx`
- `team.tsx`
- `data.ts`
- anything else those files import

And the images Figma Make uses (`logo.png`, `meeple.png`, `clients.png`, `arien.png`, `sanne.png` and so on) into `public/assets/`.

**Don't overwrite** `App.tsx`, `index.css` and `test.tsx`: the versions in this folder are the new ones (v5).

## run it

```
npm install
npm run dev
```

Then open the link it shows (usually http://localhost:5173).
`npm run build` checks the types and makes the version for Vercel in `dist/`.

## next steps

The full list of changes is in `docs/Figma_Make_Prompt_v5_Echte_Fotos_Rustige_Stijl.md`.
Do it one section at a time and commit after each section.

## notes / add later

