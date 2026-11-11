# SEO checklist

Per page: the url, the SEO title (max ~60 characters) and the meta description (max ~155), in Dutch.
They are the same as in the prototype (`src/seo.ts`), so you can copy them into Yoast or Rank Math.
The workshop and game pages are made from the data, the pattern is below the table.

## Pages

| url | SEO title | meta description | h1 |
|---|---|---|---|
| `/` | InnerGames · spellen en workshops vanuit Eindhoven (50) | Spellen en workshops die teams, klassen en zorg in beweging brengen. Van een workshop voor je team tot een spel voor in de klas. (128) | spellen en workshops die teams, klassen en zorg in beweging brengen |
| `/workshops` | Workshops voor teams, onderwijs en zorg · InnerGames (52) | Speelse workshops met reflectie en lichaamsgericht werk, voor teams, klassen, zorg en trainers. Met duur, groepsgrootte en prijs per workshop. (142) | sessies en workshops |
| `/workshops/energiek-team` | Energiek team! · workshop · InnerGames (38) | Ontdek hoe je werkt, wat je energie geeft en hoe je dat inzet in je teamrol. 3 sessies van 4 uur, tot 12 personen, € 2.850 per groep. (133) | Energiek team! |
| `/spellen` | Spellen kopen · InnerGames (26) | The Elemental Five, Sociality, Impact Imperium en meer spellen van InnerGames. Speel eerst een preview van 30 seconden. (119) | onze spellen |
| `/spellen/elemental-five-compleet` | the elemental five – compleet · InnerGames (42) | Gebaseerd op het Big Five-model, via vijf elementen: water, vuur, aarde, lucht en ether. € 152, incl. btw. (106) | the elemental five – compleet |
| `/spellen/elemental-five-compleet/preview` | Speel the elemental five – compleet · preview (45) | Speel 30 seconden the elemental five – compleet en voel hoe het spel werkt. Gebaseerd op het Big Five-model, via vijf elementen: water, vuur, aarde, lucht… (155) | speel 30 seconden |
| `/projecten` | Projecten · InnerGames (22) | Spellen en tools die InnerGames samen met organisaties en onderwijs maakt, zoals het bordspel Sociality met de HAN. (115) | projecten |
| `/train-de-trainer` | Train-de-trainer: zelf spel-workshops geven · InnerGames (56) | Leer spel-workshops geven: 8 uur, € 1.800 per persoon. 4 uur theorie en 4 uur praktijk, begeleid in je eigen setting. (117) | train-de-trainer |
| `/ons-team` | Ons team · InnerGames (21) | Vijf mensen die spellen ontwikkelen, workshops geven en trainers opleiden, vanuit Eindhoven. (92) | ons team |
| `/contact` | Contact · InnerGames Eindhoven (30) | Vertel ons over je team, klas of cliënten. Bel, app of mail, of vul het formulier in. Kronehoefstraat 87, Eindhoven. (116) | contact |
| `/privacybeleid` | Privacybeleid · InnerGames (26) | Het privacybeleid van InnerGames in Eindhoven. (46) | privacybeleid |
| `/afrekenen` | Afrekenen · InnerGames (22) | Je bestelling bij InnerGames afronden. (38) | afrekenen |

### Patterns for the generated pages

- **workshop** `/workshops/{slug}`: title `{naam} · workshop · InnerGames`, description `{korte zin} {duur}, {groep}, {prijs}.`
  (cut at a word at 155 characters). Og image: the workshop photo.
- **spel** `/spellen/{slug}`: title `{naam} · InnerGames`, description `{korte zin} {prijs}, incl. btw.`. Og image: the product photo.
- **preview** `/spellen/{slug}/preview`: title `Speel {naam} · preview`.
- **filter** `/workshops?voor=onderwijs` (and organisaties, zorg, trainers) is the same page with a filter:
  in WordPress give it a canonical to `/workshops`, so it doesn't count as a separate page.
- **contact with a workshop** `/contact?workshop={slug}`: canonical to `/contact`.
- **afrekenen** `/afrekenen`: noindex (WooCommerce does this by default for the checkout).

## Every page

- [x] One `h1` per page, headings in order (h1, h2, h3). Checked on all pages above. The workshop and game lists
      have a hidden `h2` ("alle workshops", "alle spellen") between the page title and the card titles.
- [x] `alt` text on every photo, in Dutch, describing what's in it (`ALT` in `src/data.ts`). Decorative images
      (the hand, a photo right next to the same text) have an empty `alt=""`, which is correct.
      The logo has `alt=""` because the link around it reads "InnerGames home".
- [x] Open Graph per page: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:locale` (nl_NL).
- [x] Readable urls in Dutch, lowercase, with hyphens (WordPress: Instellingen > Permalinks > Berichtnaam;
      WooCommerce product base `spellen`).
- [x] `<html lang="nl">`.

## To do in WordPress

- **Og image as JPG or PNG, 1200 × 630.** The prototype uses the WebP photos; LinkedIn doesn't always show WebP.
  Make one 1200 × 630 JPG per main page (or set a default one in Yoast).
- **Sitemap**: Yoast/Rank Math makes it. Leave out the legal pages and the checkout.
- **Structured data**: Organization (name, logo, address Kronehoefstraat 87, Eindhoven, phone, LinkedIn),
  Product + Offer for the games (WooCommerce adds it), Course or Service for the workshops.
- **Local SEO**: a Google Bedrijfsprofiel with the same address and phone number as on the site.
- **Legal pages**: noindex is fine, but they must be linked from the footer (they are).
- **Speed**: the photos are WebP in two sizes with `srcset`; keep that in WordPress (a plugin like ShortPixel or
  the built-in WebP support).
