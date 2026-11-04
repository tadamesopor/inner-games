export type Aud = 'onderwijs' | 'organisaties' | 'zorg' | 'trainers'

const u = (id: string, w = 1200) => `https://images.unsplash.com/photo-${id}?w=${w}&fit=crop&auto=format&q=75`

export const PHOTOS = {
  play: u('1676651471150-0e3a5f8de05e', 1800),
  play2: u('1676482721054-59f8326cd1d9'),
  notes: u('1623652554515-91c833e3080e'),
  notes2: u('1590402494587-44b71d7772f6'),
  notes3: u('1503551723145-6c040742065b-v2'),
  class: u('1509062522246-3755977927d7'),
  circle: u('1643682661119-28da0685be2c'),
  chairs: u('1601931992301-5c9a46c92808'),
  grass: u('1555069855-e580a9adbf43'),
  cards: u('1501003878151-d3cb87799705'),
  cards2: u('1503482618211-c70b46ede8b0'),
  board: u('1756130085073-2c96cbac079d'),
  move: u('1615657973599-990d6e05fb8a'),
  plant: u('1679110667877-408593fab0f6'),
  globe: u('1585871746932-e133d3fedf4d', 900),
}

export const AUD_LABEL: Record<Aud, string> = { onderwijs: 'onderwijs', organisaties: 'organisaties', zorg: 'zorg', trainers: 'trainers' }
export const AUDS: Aud[] = ['onderwijs', 'organisaties', 'zorg', 'trainers']

export const LOCATION = 'op kantoor in Eindhoven of op locatie (reiskosten extra)'

export type Workshop = {
  slug: string
  title: string
  tagline: string
  aud: Aud[]
  duration: string
  group: string
  price: string
  photo: string
  gameSlug?: string
  story: string[]
  gets: [string, string][]
  who: string[]
}

export const WORKSHOPS: Workshop[] = [
  {
    slug: 'energiek-team',
    title: 'Energiek team!',
    tagline: 'Ontdek hoe je werkt, wat je energie geeft en hoe je dat inzet in je teamrol.',
    aud: ['organisaties'],
    duration: '3 sessies van 4 uur',
    group: 'tot 12 personen',
    price: '€ 2.850 per groep',
    photo: PHOTOS.notes,
    gameSlug: 'elemental-five-compleet',
    story: [
      'Een teamworkshop met The Elemental Five. Je ontdekt hoe je werkt, wat je energie geeft en hoe je dat inzet in je teamrol.',
      'Samen bepaal je de richting en verdeel je de rollen. De workshop loopt over drie sessies van vier uur.',
    ],
    gets: [
      ['Zicht op wat energie geeft', 'Je ontdekt hoe je werkt en waar jij energie van krijgt.'],
      ['Een passende teamrol', 'Je zet je eigen manier van werken in binnen het team.'],
      ['Samen richting bepalen', 'Het team kiest samen een richting en verdeelt de rollen.'],
    ],
    who: ['Teams tot 12 personen', 'Teams die hun rollen opnieuw willen verdelen', 'Organisaties die samen richting willen bepalen'],
  },
  {
    slug: 'de-klimaat-collage',
    title: 'De Klimaat Collage',
    tagline: 'Ontdek met 42 kaarten hoe klimaatvraagstukken samenhangen.',
    aud: ['onderwijs', 'organisaties'],
    duration: '3 uur',
    group: 'tot 30 personen',
    price: '€ 1.800',
    photo: PHOTOS.globe,
    story: [
      'Met 42 informatiekaarten ontdek je hoe klimaatvraagstukken met elkaar samenhangen.',
      'Daarna bedenk je samen oplossingen door te tekenen, te praten en te schrijven. Voor onderwijs en NGO’s is korting mogelijk.',
    ],
    gets: [
      ['Een gedeeld beeld', 'Iedereen ziet hoe de vraagstukken samenhangen.'],
      ['Samen oplossingen bedenken', 'Door tekenen, praten en schrijven ontstaan er ideeën met de hele groep.'],
      ['Korting mogelijk', 'Voor onderwijs en NGO’s is een lager tarief mogelijk.'],
    ],
    who: ['Klassen en lerarenteams', 'Teams in organisaties en NGO’s', 'Groepen tot 30 personen'],
  },
  {
    slug: 'hoezo-raar',
    title: 'Hoezo Raar?!',
    tagline: 'Een speelse, veilige ruimte om iets “raars” over jezelf te delen.',
    aud: ['onderwijs', 'organisaties', 'zorg'],
    duration: '1,5 uur',
    group: 'tot 25 personen',
    price: '€ 350',
    photo: PHOTOS.class,
    story: [
      'Hoezo Raar?! is een speelse, veilige ruimte om iets “raars” over jezelf te delen. Voor mensen van 12 tot 99 jaar, ook voor neurodivergente mensen.',
      'De workshop bouwt verbinding en zelfacceptatie. Hij is ontwikkeld met WAVE (Fontys en ASML).',
    ],
    gets: [
      ['Verbinding', 'Je deelt iets over jezelf en ontdekt dat anderen dat herkennen.'],
      ['Zelfacceptatie', 'Wat “raar” lijkt, mag er zijn.'],
      ['Voor iedereen', 'Geschikt vanaf 12 jaar, ook voor neurodivergente mensen.'],
    ],
    who: ['Groepen van 12 tot 99 jaar', 'Neurodivergente mensen', 'Klassen, teams en groepen in de zorg'],
  },
  {
    slug: 'positive-masculinity',
    title: 'Positive Masculinity',
    tagline: 'Wat betekent man zijn, voorbij sterk, dominant of succesvol?',
    aud: ['onderwijs', 'zorg'],
    duration: '± 2 uur',
    group: '3 tot 12 personen',
    price: '€ 350',
    photo: PHOTOS.circle,
    story: [
      'Voor jongens en jonge mannen: wat betekent man zijn, voorbij sterk, dominant of succesvol?',
      'Er is ruimte voor emoties en kwetsbaarheid. Voor individuen zijn er open dagen in Eindhoven.',
    ],
    gets: [
      ['Een veilige groep', 'Een klein gezelschap van 3 tot 12 deelnemers.'],
      ['Ruimte voor emoties', 'Kwetsbaarheid hoort er gewoon bij.'],
      ['Open dagen', 'Individuele deelnemers kunnen meedoen op open dagen in Eindhoven.'],
    ],
    who: ['Jongens en jonge mannen', 'Scholen en jongerenwerk', 'Individuen via de open dagen'],
  },
  {
    slug: 'kansen-keren',
    title: 'Kansen Keren',
    tagline: 'Maak ongelijke kansen voelbaar en open het gesprek over levenspaden.',
    aud: ['onderwijs', 'organisaties', 'trainers'],
    duration: '± 1,5 uur',
    group: '3 tot ~50 personen',
    price: 'vanaf € 350 (tot 15 personen)',
    photo: PHOTOS.notes3,
    gameSlug: 'kansen-keren',
    story: [
      'Kansen Keren maakt ongelijke kansen voelbaar en opent het gesprek over levenspaden. Voor teams, klassen en trainingen.',
      'De workshop is ontwikkeld door Carinda Jansen (buro KAN).',
    ],
    gets: [
      ['Ongelijkheid voelen', 'Deelnemers ervaren het verschil in kansen in plaats van er alleen over te praten.'],
      ['Gesprek over levenspaden', 'Het opent het gesprek over wat je meekrijgt en wat niet.'],
      ['Flexibele groepsgrootte', 'Van 3 tot ongeveer 50 deelnemers.'],
    ],
    who: ['Teams', 'Klassen', 'Trainingen en trainers'],
  },
  {
    slug: 'ontdek-jouw-drijfveren',
    title: 'Ontdek jouw drijfveren',
    tagline: 'Ontdek je gewoontegedrag en wat je eigenlijk liever doet.',
    aud: ['organisaties', 'trainers'],
    duration: '± 4 uur',
    group: 'tot 12 personen',
    price: '€ 950',
    photo: PHOTOS.notes2,
    gameSlug: 'elemental-five-compleet',
    story: [
      'Met The Elemental Five ontdek je je gewoontegedrag en wat je eigenlijk liever doet.',
      'Je ontdekt ook hoe je dat in je dagelijks leven brengt.',
    ],
    gets: [
      ['Inzicht in gewoontegedrag', 'Je ziet wat je automatisch doet.'],
      ['Wat je liever doet', 'Je ontdekt wat jou echt past.'],
      ['Vertaling naar je dag', 'Je brengt het mee naar je dagelijks leven.'],
    ],
    who: ['Groepen tot 12 personen', 'Teams en organisaties', 'Trainers en coaches'],
  },
  {
    slug: 'hoofd-en-lichaam',
    title: 'Het spel tussen hoofd en lichaam',
    tagline: 'Meer focus, veerkracht, energie en balans onder druk.',
    aud: ['organisaties', 'zorg', 'trainers'],
    duration: '± 4 uur (halve of hele dag mogelijk)',
    group: 'tot 12 personen, 1 trainer',
    price: '€ 950',
    photo: PHOTOS.move,
    gameSlug: 'elemental-five-compleet',
    story: [
      'The Elemental Five gecombineerd met adem- en lichaamsoefeningen.',
      'Het geeft meer focus, veerkracht, energie en balans onder druk. De sessie duurt ongeveer 4 uur, een halve of hele dag is mogelijk.',
    ],
    gets: [
      ['Meer focus', 'Je blijft scherp wanneer het druk wordt.'],
      ['Veerkracht en energie', 'Adem- en lichaamsoefeningen geven je energie terug.'],
      ['Balans onder druk', 'Je leert sneller terug te keren naar rust.'],
    ],
    who: ['Groepen tot 12 personen', 'Teams met werkdruk', 'Zorg, coaches en trainers'],
  },
  {
    slug: 'het-impact-imperium',
    title: 'Het Impact Imperium',
    tagline: 'Een competitief teamspel over circulaire economie.',
    aud: ['onderwijs', 'organisaties'],
    duration: '1,5 tot 2 uur',
    group: 'tot 32 personen',
    price: '€ 423,50',
    photo: PHOTOS.play2,
    gameSlug: 'impact-imperium',
    story: [
      'Teams verzamelen grondstoffen, energie en water met dobbelstenen en zien de verborgen kosten van productie.',
      'Een competitief teamspel over circulaire economie. CJP-geaccrediteerd voor mbo en vo.',
    ],
    gets: [
      ['De verborgen kosten zien', 'Teams ontdekken wat productie echt kost.'],
      ['Samen spelen en bespreken', 'Competitie levert gesprek op over circulaire economie.'],
      ['CJP-geaccrediteerd', 'Geschikt voor mbo en vo.'],
    ],
    who: ['Klassen in mbo en vo', 'Teams in organisaties', 'Groepen tot 32 personen'],
  },
  {
    slug: 'memorystory',
    title: 'MemoryStory',
    tagline: 'Maak zelf memorykaarten en open het gesprek.',
    aud: ['onderwijs', 'organisaties', 'zorg'],
    duration: '1 tot 3 uur',
    group: '4 tot 30 personen',
    price: '€ 423,50',
    photo: PHOTOS.cards2,
    story: [
      'Deelnemers maken zelf memorykaarten met tekeningen, foto’s, video of geluid en spelen ermee.',
      'Zo open je het gesprek over groei, veerkracht en samenwerking. Ontwikkeld met Paper2Play.',
    ],
    gets: [
      ['Eigen verhalen op kaart', 'Tekeningen, foto’s, video of geluid worden een spel.'],
      ['Gesprek over groei', 'Over veerkracht en samenwerking.'],
      ['Flexibel in tijd', 'Van 1 tot 3 uur, voor 4 tot 30 personen.'],
    ],
    who: ['Klassen en teams', 'Groepen in de zorg', 'Groepen van 4 tot 30 personen'],
  },
]

export type PreviewKey = 'the elemental five' | 'Sociality' | 'Impact Imperium' | 'Kansen Keren'

export type Game = {
  slug: string
  title: string
  short: string
  aud: Aud[]
  price: string
  photo: string
  gallery: string[]
  previewKey: PreviewKey | null
  forWhom: string
  players: string
  story: string[]
  contents: string[]
  status?: string
}

export const GAMES: Game[] = [
  {
    slug: 'elemental-five-compleet',
    title: 'the elemental five – compleet',
    short: 'Gebaseerd op het Big Five-model, via vijf elementen: water, vuur, aarde, lucht en ether.',
    aud: ['organisaties', 'onderwijs', 'trainers'],
    price: '€ 152',
    photo: PHOTOS.cards,
    gallery: [PHOTOS.cards, PHOTOS.cards2, PHOTOS.board],
    previewKey: 'the elemental five',
    forWhom: 'coaches, trainers, teams en studie- en loopbaanbegeleiding',
    players: 'n.t.b.',
    story: [
      'The Elemental Five is gebaseerd op het Big Five-model en werkt via vijf elementen: water, vuur, aarde, lucht en ether.',
      'In de doos zit alles om met een groep te beginnen, inclusief een presentatie voor groepsworkshops.',
    ],
    contents: ['Kaartspel', 'Grondankers', 'Digitale handleiding', 'Presentatie voor groepsworkshops'],
  },
  {
    slug: 'elemental-five-grondankers',
    title: 'the elemental five – grondankers',
    short: '36 ronde vloerkaarten om de elementen fysiek te ervaren.',
    aud: ['trainers', 'organisaties'],
    price: '€ 79',
    photo: PHOTOS.board,
    gallery: [PHOTOS.board, PHOTOS.cards, PHOTOS.play],
    previewKey: 'the elemental five',
    forWhom: 'n.t.b.',
    players: 'individuele en groepsopstellingen',
    story: ['36 ronde vloerkaarten (210 mm) voor individuele en groepsopstellingen, om de elementen fysiek te ervaren.'],
    contents: ['36 ronde vloerkaarten (210 mm)'],
  },
  {
    slug: 'elemental-five-kaartenset',
    title: 'the elemental five – kaartenset',
    short: '36 grote kaarten, de basis van de serie.',
    aud: ['trainers', 'organisaties'],
    price: '€ 39',
    photo: PHOTOS.cards2,
    gallery: [PHOTOS.cards2, PHOTOS.cards, PHOTOS.notes],
    previewKey: 'the elemental five',
    forWhom: 'n.t.b.',
    players: 'alleen of in groepen',
    story: ['36 grote kaarten (148 x 105 mm), de basis van de serie. Te gebruiken alleen of in groepen.'],
    contents: ['36 grote kaarten (148 x 105 mm)'],
  },
  {
    slug: 'sociality',
    title: 'Sociality, een kijk op sociale kwaliteit',
    short: 'Een bordspel van HAN en InnerGames over het model Sociale Kwaliteit, met praktijkcasussen.',
    aud: ['zorg', 'onderwijs'],
    price: '€ 69',
    photo: PHOTOS.chairs,
    gallery: [PHOTOS.chairs, PHOTOS.circle, PHOTOS.notes2],
    previewKey: 'Sociality',
    forWhom: 'sociaal werkers en studenten',
    players: '3 tot 6 spelers per set',
    story: ['Een bordspel van HAN en InnerGames over het model Sociale Kwaliteit, met praktijkcasussen.'],
    contents: ['Speelbord', 'Blik', '2 casussets van 21 kaarten', '10 theoriekaarten', 'Boekje met regels en theorie', 'Pion'],
  },
  {
    slug: 'impact-imperium',
    title: 'Impact Imperium (klassenset)',
    short: 'Een competitief klassenspel over alledaagse producten, afval en plastic.',
    aud: ['onderwijs'],
    price: '€ 275',
    photo: PHOTOS.play2,
    gallery: [PHOTOS.play2, PHOTOS.board, PHOTOS.play],
    previewKey: 'Impact Imperium',
    forWhom: 'klassen',
    players: '4 tot 40 personen (8 exemplaren)',
    story: ['Verzamel water, energie en grondstoffen om alledaagse producten te maken zonder te veel afval en plastic.'],
    contents: ['8 exemplaren van het spel', 'Dobbelstenen', 'Docentenhandleiding met vervolgopdrachten', 'Uitdagingskaarten', 'Gratis extra spel'],
  },
  {
    slug: 'kansen-keren',
    title: 'Kansen Keren',
    short: '66 levenssituaties in een niet-competitief gesprekspel.',
    aud: ['onderwijs', 'organisaties'],
    price: '€ 16,35 incl. verzending',
    photo: PHOTOS.notes3,
    gallery: [PHOTOS.notes3, PHOTOS.notes, PHOTOS.class],
    // preview staat uit tot Ariën en Carinda Jansen akkoord geven; aanzetten: previewKey: 'Kansen Keren' en status weghalen
    previewKey: null,
    forWhom: 'n.t.b.',
    players: 'n.t.b.',
    status: 'wordt herzien',
    story: ['66 levenssituaties in een niet-competitief gesprekspel.', 'Het spel wordt op dit moment herzien. Een preview is daarom nog niet beschikbaar.'],
    contents: ['66 levenssituaties'],
  },
]

export const PREVIEW_SLUG: Record<string, string> = {
  'the elemental five': 'elemental-five-compleet',
  Sociality: 'sociality',
  'Impact Imperium': 'impact-imperium',
  'Kansen Keren': 'kansen-keren',
}

export const QUOTE = {
  text: 'Na afloop praatten we anders met elkaar. Dat is gebleven.',
  who: 'deelnemer, teamleider',
  note: 'voorbeeldquote · vervangen door echte review',
}

export const CLIENTS_ALT = 'Logo’s van opdrachtgevers, onder andere ASML, Philips, Fontys, HAN, TU/e en Summa College'

export const PARTNERS = [
  'BreathCompany',
  'buro KAN',
  'De Stap naar Gezonder',
  'Duurzaamheid in de klas',
  'Fontys Toegepaste Psychologie en HRM',
  'Fontys ICT',
  'LOB 123',
  'HAN Lectoraat Sociale Kwaliteit',
]

export const PROJECTS = [
  { title: 'KansenKeren Senior', text: 'Bordspel over ongelijke kansen bij ouderen, met buro KAN.', when: 'verwacht december 2026', photo: PHOTOS.notes3 },
  { title: 'MemoryStory app', text: 'Deel tekeningen, geluid, foto’s en video op een digibord en speel samen. Voor klassen, teams en zorg.', when: 'verwacht eind 2026', photo: PHOTOS.cards2 },
  { title: 'Ready to Board', text: 'Een speelse gesprekstool voor sollicitatie en onboarding, vooral voor neurodivergente mensen.', when: 'bèta', photo: PHOTOS.notes },
  { title: 'Sociality cases', text: 'Nieuwe praktijkcasussen, gemaakt met studenten sociaal werk van de HAN.', when: 'in ontwikkeling', photo: PHOTOS.chairs },
  { title: 'Wisselwerk', text: 'Een app voor teams over verschillende werk- en communicatiestijlen.', when: 'in ontwikkeling', photo: PHOTOS.play },
]

export type Step = {
  kind: string
  prompt: string
  body?: string
  options?: string[]
  /** value en before op een schaal van 0 tot 100; de kortste balk ligt bovenop */
  bars?: { label: string; value: number; before?: number; text?: string }[]
  /** uitleg bij de balken: licht = before, vol = value */
  legend?: { light: string; full: string }
}
export type StepFn = (a: string[]) => Step

/* ---------- the elemental five ---------- */
// Geen koppeling tussen elementen en Big Five-eigenschappen: InnerGames publiceert die niet.
const ELEMENTS = ['water', 'vuur', 'aarde', 'lucht', 'ether']

/* ---------- sociality ---------- */
// De vier voorwaarden van het model Sociale Kwaliteit (HAN lectoraat)
const CONDITIONS: Record<string, { plain: string; question: string; aim: string }> = {
  'sociaal-economische zekerheid': { plain: 'een stevige basis', question: 'Heeft iemand genoeg zekerheid over inkomen, wonen, werk en zorg om mee te kunnen doen?', aim: 'sociale rechtvaardigheid' },
  'sociale inclusie': { plain: 'erbij kunnen horen', question: 'Heeft iemand toegang tot de plekken, voorzieningen en netwerken die er voor iedereen zijn?', aim: 'gelijkwaardigheid' },
  'sociale cohesie': { plain: 'verbinding met anderen', question: 'Zijn er onderlinge contacten, vertrouwen en gedeelde normen in de buurt of groep?', aim: 'solidariteit' },
  'sociale empowerment': { plain: 'zelf invloed hebben', question: 'Kan iemand zelf keuzes maken en invloed uitoefenen op zijn eigen leven en omgeving?', aim: 'menselijke waardigheid' },
}
const LEVELS = ['micro: haar eigen netwerk', 'meso: buurthuis en instanties', 'macro: regels en beleid']

/* ---------- impact imperium ---------- */
// Voorbeeldwaarden (0 tot 50 per product) tot de echte productkaarten er zijn.
const IMPACT_LABELS = ['water', 'stroom', 'grondstoffen', 'schadelijke stoffen', 'plastic soep']
const IMPACT: Record<string, number[]> = {
  spijkerbroek: [50, 15, 20, 30, 15],
  smartphone: [15, 40, 45, 35, 20],
  hamburger: [45, 20, 25, 20, 10],
  laptop: [20, 50, 45, 35, 20],
  't-shirt van polyester': [10, 25, 15, 25, 45],
  'vliegreis naar Parijs': [5, 50, 30, 40, 5],
}
const PRODUCTS_1 = ['spijkerbroek', 'smartphone', 'hamburger']
const PRODUCTS_2 = ['laptop', 't-shirt van polyester', 'vliegreis naar Parijs']

/* ---------- kansen keren ---------- */
const MOVES: Record<string, number> = { '2 stappen omhoog': 2, '1 stap omhoog': 1, 'blijft staan': 0, '1 stap omlaag': -1, '2 stappen omlaag': -2 }
const MOVE_OPTIONS = Object.keys(MOVES)
const pawn = (a: string[]) => (a[0] ?? 'Sam').split(',')[0]

export const STEPS: Record<PreviewKey, StepFn[]> = {
  'the elemental five': [
    () => ({ kind: 'de opstelling', prompt: 'Vijf elementen liggen op de vloer. Bij welk element sta jij meestal, op je werk?', body: 'Kies op gevoel. Er is geen goed of fout.', options: ELEMENTS }),
    () => ({ kind: 'en eigenlijk', prompt: 'Bij welk element zou je vaker willen staan?', options: ELEMENTS }),
    ([from, to]) => ({
      kind: 'voel',
      prompt: from === to ? `Je staat al bij ${from}. Blijf even staan. Wat voel je?` : `Zet in gedachten één stap van ${from} naar ${to}. Wat voel je?`,
      options: ['rust', 'energie', 'twijfel', 'spanning'],
    }),
    ([from, to]) => ({
      kind: 'in het echte spel',
      prompt: from === to ? 'Je zit goed op je plek. Weet je ook waarom?' : `Van ${from} naar ${to}: daar zit je energie.`,
      body: 'In het spel en de workshop ontdek je met 36 kaarten en 36 grondankers wat je gewoontegedrag is, wat je energie geeft, en hoe je dat inzet in je werk of team.',
    }),
  ],
  Sociality: [
    () => ({ kind: 'casus · voorbeeld', prompt: 'Fatima (34) is net verhuisd naar een nieuwe wijk.', body: 'Ze werkt met een tijdelijk contract, kent haar buren nog niet en durft het buurthuis niet binnen te lopen.' }),
    () => ({ kind: 'kies', prompt: 'Welke voorwaarde van sociale kwaliteit staat het meest onder druk?', body: 'Vaak spelen er meer. In het spel bespreek je samen je keuze.', options: Object.keys(CONDITIONS) }),
    (a) => {
      const name = a[1] in CONDITIONS ? a[1] : 'sociale cohesie'
      const c = CONDITIONS[name]
      return { kind: 'theoriekaart', prompt: `${name}: ${c.plain}`, body: `${c.question} Doel: ${c.aim}.` }
    },
    () => ({ kind: 'aan de slag', prompt: 'Op welk niveau begin jij als sociaal werker?', options: LEVELS }),
    (a) => ({
      kind: 'in het echte spel',
      prompt: `Jij koos ${a[1] ?? 'sociale cohesie'} en begint op ${(a[3] ?? 'micro').split(':')[0]}-niveau. Een collega kiest misschien anders.`,
      body: 'Dat gesprek is het spel. Met 42 casuskaarten en 10 theoriekaarten, voor groepen van 3 tot 6.',
    }),
  ],
  'Impact Imperium': [
    () => ({
      kind: 'jouw imperium',
      prompt: 'Jullie team is een imperium. Doel: maak zoveel mogelijk producten.',
      body: 'Je gooit dobbelstenen voor water, stroom en grondstoffen. Gooi je 3 keer gif, dan is het een milieuramp en ben je je beurt kwijt.',
      options: ['start'],
    }),
    () => ({ kind: 'beurt 1', prompt: 'Welk product maak je?', options: PRODUCTS_1 }),
    (a) => ({ kind: 'beurt 2', prompt: `Je ${a[1] ?? 'spijkerbroek'} is klaar. Op naar de volgende!`, body: 'Welk product maak je nu?', options: PRODUCTS_2 }),
    () => ({ kind: 'score', prompt: 'Jullie imperium maakte 2 producten. Goed bezig!', body: 'Maar wat kostten ze eigenlijk? Draai de productkaarten om.', options: ['draai de kaarten om'] }),
    (a) => {
      const p1 = a[1] in IMPACT ? a[1] : 'spijkerbroek'
      const p2 = a[2] in IMPACT ? a[2] : 'laptop'
      return {
        kind: 'de onthulling',
        prompt: 'Het team met de meeste producten is… de grootste vervuiler.',
        body: 'De echte winnaar is het team met de minste milieu-impact. (voorbeeldwaarden)',
        legend: { light: p1, full: `${p1} + ${p2}` },
        bars: IMPACT_LABELS.map((label, i) => {
          const one = IMPACT[p1][i]
          const both = one + IMPACT[p2][i]
          return { label, before: one, value: both, text: `${one} + ${IMPACT[p2][i]} = ${both}` }
        }),
      }
    },
  ],
  // Staat uit: Kansen Keren heeft previewKey null en status 'wordt herzien' tot Ariën en Carinda Jansen akkoord geven.
  'Kansen Keren': [
    () => ({ kind: 'jullie pion', prompt: 'Geef de pion samen een identiteit. Wie is het?', options: ['Sam, 12 jaar', 'Noor, 12 jaar'] }),
    (a) => ({
      kind: 'levensgebeurtenis · voorbeeld',
      prompt: 'Je ouders verliezen allebei hun baan. Er is weinig geld thuis.',
      body: `Wat doet dit met de kansen van ${pawn(a)}? Je pion staat in het midden van de levensweg.`,
      options: MOVE_OPTIONS,
    }),
    () => ({
      kind: 'levensgebeurtenis · voorbeeld',
      prompt: 'Een docent ziet dat je goed kunt tekenen en helpt je naar een kunstopleiding.',
      body: 'Gebeurtenissen bouwen op elkaar voort. Hoe ver beweegt de pion nu?',
      options: MOVE_OPTIONS,
    }),
    (a) => {
      const n = (MOVES[a[1]] ?? 0) + (MOVES[a[2]] ?? 0)
      const steps = `${Math.abs(n)} ${Math.abs(n) === 1 ? 'stap' : 'stappen'}`
      const where = n === 0 ? 'staat precies in het midden' : `staat ${steps} ${n > 0 ? 'boven' : 'onder'} het midden`
      return {
        kind: 'de levensweg',
        prompt: `${pawn(a)} ${where}. Je kunt dit spel niet winnen.`,
        body: 'Het gaat om het gesprek: waarom besloot jij dit, en zou een ander het net zo zien? In het echte spel zijn er 66 levensgebeurtenissen.',
        legend: { light: 'start in het midden', full: 'positie nu' },
        // -4 tot +4 stappen op een schaal van 0 tot 100, midden = 50
        bars: [{ label: 'levensweg', before: 50, value: 50 + n * 12.5, text: n === 0 ? 'midden' : `${n > 0 ? '+' : '−'}${steps}` }],
      }
    },
  ],
}
