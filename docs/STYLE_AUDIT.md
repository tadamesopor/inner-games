# Style audit (round 5)

What was inconsistent per page, and what it is now. All shared values are in one file:
`src/motion/tokens.css`. Tailwind reads them through `@theme` in `src/index.css`, so the components use
token classes (`text-lead`, `rounded-box`, `shadow-soft`, `text-ig-orange-text`) instead of their own values.

## Tokens

| what | tokens |
|---|---|
| colours | `--ig-orange`, `--ig-orange-text` (#C84413), `--ig-yellow`, `--ig-yellow-light` (#FDE7B0), `--ig-ink`, `--ig-cream` |
| card edge per surface | `--ig-edge`: cream #E8CFA8, white #F0DCC0, yellow #E0A20E, orange #C84413 |
| shapes | `--r-box` 12px, `--r-section` 56px (28px on a phone), `--r-tag` 999px, `--r-media` 8px |
| spacing | `--sp-1` to `--sp-12` (8px scale), `--section-pad` 96px (64px on a phone) |
| shadows | `--ig-shadow-soft`, `--ig-shadow-lift` (warm ink, never a hard black offset) |
| type (6 sizes) | meta 14, body 16, lead 22, h2 32 to 56, h1 40 to 72, display 40 to 54 (only the homepage hero title) |

## Components

- **Buttons:** the split button for main actions, one outline style for the rest (cream outline on dark). No other buttons.
- **Card:** `.ig-card` everywhere (src/motion/cards.css). `--hot` for workshop cards, `--text` for text-only cards, `--still` for cards that aren't links (no hand, no lift). The old `card` and `cardStatic` classes are gone.
- **Grid:** `.ig-grid` for every card list (auto-fill, min 280px, max 380px a card, 1200px wide).
- **Tag:** `<Tag>` everywhere, also the team roles, "oprichter" and the partner names.
- **Filter buttons:** one `chip()` style on workshops, spellen and ons team.
- **Section header:** `<H2>` everywhere (ons team had two of its own h2 styles).

## Per page

| page | was | now |
|---|---|---|
| all pages | 23 different text sizes (text-sm to text-7xl, 11px to 7rem); grey text in four neutral greys; `rounded-2xl`, `rounded-xl` and `rounded-[8px]` next to `--r-box`; three hand-written shadows | 6 type sizes; grey text is ink at 70% or 80%; only the four radius tokens; two shadow tokens |
| all pages | sections between 40px and 96px padding (`py-10!`, `py-12!`, `py-16!` overrides) | 96px top and bottom on desktop, 64px on a phone. The section after a rounded one keeps the same 96/64 below the rounded edge |
| all pages | small orange text in #EA561F (fails contrast on cream and white) | #C84413 (`text-ig-orange-text`) |
| home | "zo werkt het" steps and team teaser as loose white boxes; "waar kom jij voor" photos 16:10 | `.ig-card--still`; photos 4:3 |
| workshops, spellen | 3 big cards a row, titles 20px | `.ig-grid`, 3 to 4 a row, titles 22px |
| workshop | own title size (4.5rem); "voor wie" and "wat levert het op" with the old soft card | page title is h1; both `.ig-card--still` |
| spel | "wat zit er in de doos", "geen preview" and the workshop links with the old card | `.ig-card` / `--still`, workshop links in `.ig-grid` |
| projecten | project cards without a wrapper (only the body class) | `.ig-card--still` in `.ig-grid` |
| train-de-trainer | offer boxes `rounded-2xl` on cream, title squeezed to 2.3rem to 4.6rem | `.ig-card--still`; title is h1, still on one line |
| ons team | team cards 4:5 with a 36px first name; own h1 and h2 sizes; roles in a custom pill | 4:3 photos, name 22px; h1 and `<H2>`; roles are `<Tag>` |
| contact | form in a ring box | `.ig-card--still` |
| afrekenen, juridisch | own h1 size | h1 |

## Left as it is, on purpose

- The ⚙ prototype bar, the "labels" annotations and the test tool (`src/test.tsx`): they're tools for the user test, not part of the site.
- The playable preview (`shop.tsx`, Teaser): its cards and bars are part of the game, not site cards.
- The homepage hero is the only section with its own padding: it slides up under the menu.
