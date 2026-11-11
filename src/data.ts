export type Aud = 'onderwijs' | 'organisaties' | 'zorg' | 'trainers'

// real photos from innergames.nl, made by scripts/fetch-images.mjs.
// a photo is a base path: <Photo> adds -800.webp / -1600.webp itself
const img = (name: string) => `/assets/img/${name}`

export const PHOTOS = {
  homeHero: img('site/home-hero'),
  tafel: img('site/samen-aan-tafel'),
  workshopsHero: img('site/workshops-hero'),
  gamesHero: img('site/games-hero'),
  trainerHero: img('site/trainer-hero'),
}

// alt text per photo, so every page describes the same photo the same way
export const ALT: Record<string, string> = {
  [PHOTOS.homeHero]: 'Deelnemers spelen samen een spel aan tafel',
  [PHOTOS.tafel]: 'Het team aan het werk op een zonnige werkplek met grote ramen en planten',
  [PHOTOS.workshopsHero]: 'Een groep speelt een spel aan een tafel bij het raam',
  [PHOTOS.gamesHero]: 'Deelnemers schrijven op kaartjes tijdens een spel',
  [PHOTOS.trainerHero]: 'Drie mensen van InnerGames staan buiten naast elkaar',
  [img('workshops/energiek-team')]: 'Twee begeleiders lachen in de camera, achter hen werken groepjes aan tafels',
  [img('workshops/ontdek-jouw-drijfveren')]: 'Een groep speelt een spel aan een tafel bij het raam',
  [img('workshops/de-klimaat-collage')]: 'Deelnemers staan rond een tafel en werken aan een collage',
  [img('workshops/het-impact-imperium')]: 'Deelnemers spelen Het Impact Imperium aan tafel',
  [img('workshops/hoofd-en-lichaam')]: 'Twee begeleiders op een evenement, met een groot scherm achter hen',
  [img('workshops/hoezo-raar')]: 'Een groep staat en loopt door een lichte ruimte',
  [img('workshops/positive-masculinity')]: 'Twee jonge mannen praten met elkaar',
  [img('workshops/kansen-keren')]: 'Spelbord van Kansen Keren met een pion en een dobbelsteen',
  [img('workshops/memorystory')]: 'Deelnemers zitten aan tafel en spelen samen',
  [img('games/elemental-five-compleet')]: 'Doos, kaarten en grondankers van The Elemental Five',
  [img('games/elemental-five-grondankers')]: 'De ronde grondankers van The Elemental Five',
  [img('games/elemental-five-kaartenset')]: 'Kaarten van The Elemental Five',
  [img('games/elemental-five-opstelling')]: 'Deelnemers staan op blote voeten bij de grondankers van The Elemental Five',
  [img('games/impact-imperium')]: 'Spelbord en kaarten van Impact Imperium',
  [img('games/sociality')]: 'Speldoos en kaarten van Sociality',
  [img('games/kansen-keren')]: 'Speldozen van Kansen Keren',
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
  // only filled in when innergames.nl says it, otherwise left out (see docs/INNERGAMES_CONTENT.md)
  program?: [string, string][]
  method?: string
  madeBy?: string
  host?: string
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
    photo: img('workshops/energiek-team'),
    gameSlug: 'elemental-five-compleet',
    story: [
      'Iedereen in een team werkt op een eigen manier. Met The Elemental Five ontdek je wat die van jou is: hoe je je gedraagt, wat je gewoontes zijn en wat je eigenlijk liever zou doen.',
      'In drie dagdelen werk je van jezelf naar het hele team. Jullie kijken wat jullie samen drijft en kiezen een richting die past bij de organisatie én bij de mensen die er werken.',
      'Daarna maken jullie het concreet. Wie doet wat, waar en met wie? Zo benut je elkaars krachten en haal je energie uit het samenwerken.',
    ],
    program: [
      ['jezelf leren kennen', 'Je ontdekt je eigen gedrag en gewoontes, op het werk en thuis, en wat je liever zou doen.'],
      ['samen richting kiezen', 'Het team onderzoekt wat jullie samen energie geeft en kiest een richting die past bij de organisatie en de teamleden.'],
      ['het concreet maken', 'Jullie verdelen werkplekken, activiteiten, rollen en taken, zodat iedereen zijn kracht kan inzetten.'],
    ],
    method: 'The Elemental Five',
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
    photo: img('workshops/de-klimaat-collage'),
    story: [
      'Klimaatverandering is groot en ingewikkeld. In deze workshop maak je het samen overzichtelijk: met 42 informatiekaarten ontdekt de groep hoe de onderdelen van het klimaatprobleem met elkaar samenhangen.',
      'Je praat, tekent, brainstormt en schrijft. Zo ontstaat stap voor stap een gedeeld beeld, en eindig je met oplossingen die de groep zelf bedenkt.',
      'De workshop wordt begeleid door een workshopleider, maar een leraar of docent kan hem ook zelf geven. Voor onderwijs en NGO’s is korting mogelijk, vraag er gerust naar.',
    ],
    program: [
      ['de kaarten leggen', 'Met 42 informatiekaarten ontdekt de groep hoe de onderdelen van het klimaatprobleem samenhangen.'],
      ['samen begrijpen', 'Door te praten, tekenen en schrijven krijgt iedereen hetzelfde beeld.'],
      ['oplossingen bedenken', 'De groep brainstormt over oplossingen voor een groene toekomst.'],
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
    photo: img('workshops/hoezo-raar'),
    story: [
      'Iedereen heeft wel iets wat hij zelf een beetje raar vindt. Iets aan je lijf, aan hoe je denkt of aan hoe je dingen doet. In Hoezo Raar?! deel je dat, op een speelse en veilige manier.',
      'Al snel merk je dat je niet de enige bent. Dat maakt het gesprek open en brengt mensen dichter bij elkaar, en dichter bij zichzelf. Het werkt in groepen die elkaar al kennen en in groepen die elkaar nog nooit hebben gezien.',
      'De workshop is voor iedereen van 12 tot 99 jaar, ook voor neurodivergente mensen.',
    ],
    madeBy: 'een ontwerpteam van Wave (Fontys en ASML)',
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
    photo: img('workshops/positive-masculinity'),
    story: [
      'Wat betekent het om een man te zijn? Via social media, school en de samenleving krijgen jongens vaak één beeld mee: sterk, dominant en succesvol.',
      'In deze workshop praten jongens en jonge mannen daar samen over. Ze ontdekken dat er meer is: dat je emoties mag delen, je eigen pad mag kiezen en kwetsbaar mag zijn.',
      'Groepen boeken de workshop en geven een voorkeursdatum door. Kom je alleen? Dan kun je meedoen op een open workshopdag op ons kantoor in Eindhoven. Mail daarvoor naar info@innergames.nl.',
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
    photo: img('workshops/kansen-keren'),
    gameSlug: 'kansen-keren',
    story: [
      'Niet iedereen krijgt dezelfde kansen mee. Kansen Keren maakt dat voelbaar: je ervaart hoe achterstand en privilege iemands levenspad beïnvloeden, in plaats van er alleen over te praten.',
      'Dat opent het gesprek over levenspaden, over wat je meekrijgt en over hoe je een achterstand kunt keren. In een kleine groep is er meer ruimte voor diepgang en persoonlijke uitwisseling. Grotere groepen kunnen ook, in een andere opzet.',
      'De workshop bestaat ook in het Engels, als TurningPoints.',
    ],
    madeBy: 'Carinda Jansen (buro KAN)',
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
    price: '€ 950 per groep',
    photo: img('workshops/ontdek-jouw-drijfveren'),
    gameSlug: 'elemental-five-compleet',
    story: [
      'Wat geeft jou de meeste energie? In deze speelse workshop ontdek je het met The Elemental Five.',
      'Je leert jezelf en je medespelers beter kennen. Je ziet welk gedrag en welke strategieën je meestal gebruikt, thuis en op het werk, en wat je eigenlijk liever zou doen.',
      'Daarna kijk je hoe je dat in je dagelijks leven brengt. De workshop duurt een ochtend of een middag en is in kleine groepen. Wil je dit met je hele team doen? Kijk dan ook naar Energiek team!.',
    ],
    method: 'The Elemental Five',
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
    price: '€ 950 per groep',
    photo: img('workshops/hoofd-en-lichaam'),
    gameSlug: 'elemental-five-compleet',
    story: [
      'Werkdruk en stress zitten niet alleen in je hoofd. Volgens TNO heeft één op de zes werknemers burn-outklachten, en werkstress is de beroepsziekte nummer één.',
      'In deze workshop werk je aan balans tussen hoofd en lichaam. The Elemental Five is de rode draad: je ontdekt zonder oordeel wat je drijft en welk gedrag je energie geeft. Met lichaamsgerichte oefeningen en ademoefeningen kom je tot rust en voel je beter wat je lichaam je vertelt.',
      'Je gaat naar huis met meer focus, veerkracht en energie, en je weet hoe je sneller stress loslaat. Een hele dag kan ook (twee dagdelen), en verdiepingsdagen in overleg.',
    ],
    program: [
      ['the elemental five', 'Een speels, actief spel als rode draad. Je ontdekt wat je drijft en wat je energie geeft, zonder oordeel.'],
      ['lichaamsgerichte oefeningen', 'Je wordt je bewuster van je lijf en je omgeving, en verdiept wat het spel je liet zien.'],
      ['ademoefeningen', 'Je komt tot rust, laat spanning los en voelt beter wat er in je lichaam gebeurt.'],
    ],
    method: 'The Elemental Five, met adem- en lichaamswerk',
    host: 'Wies van Beek en Ariën Kingma',
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
    photo: img('workshops/het-impact-imperium'),
    gameSlug: 'impact-imperium',
    story: [
      'Hoeveel water, energie en grondstoffen kost het eigenlijk om iets te maken? In Het Impact Imperium ontdekken leerlingen en studenten het door te spelen.',
      'De groep speelt in kleine teams tegen elkaar. Met dobbelstenen verzamel je grondstoffen, energie en water, en daarmee maak je zoveel mogelijk producten. Door de competitie is iedereen meteen betrokken, en zie je de verborgen kosten van productie en consumptie. Daarna gaan de teams als innovators aan de slag met ideeën voor een betere wereld.',
      'Voor mbo en vo is de workshop officieel CJP-acceptant, dus kun je hem met CJP betalen.',
    ],
    program: [
      ['strijden om grondstoffen', 'In kleine teams verzamel je met dobbelstenen grondstoffen, energie en water.'],
      ['producten maken', 'Je maakt zoveel mogelijk producten en ontdekt wat productie echt kost.'],
      ['zelf innoveren', 'Daarna bedenken de teams ideeën voor een betere wereld.'],
    ],
    madeBy: 'Duurzaamheid in de Klas',
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
    photo: img('workshops/memorystory'),
    story: [
      'Teken een kaart, maak een video, neem een geluid op en vind het paar. In MemoryStory maken deelnemers zelf de tegels van een memoryspel, rond een thema dat bij de groep past.',
      'Dat kan met tekeningen, schilderingen, foto’s, video of geluid. De tegels komen op een groot scherm of digibord, en dan speel je samen memory. Bij elk paar praat je over wat de tegel betekent.',
      'Een paar kan ook bestaan uit oorzaak en gevolg, of uit probleem, gevoel en oplossing. Daardoor werkt het voor luchtige onderwerpen, en als gespreksopener bij gevoelige thema’s.',
    ],
    program: [
      ['tegels maken', 'Iedereen maakt tegels rond het thema: een tekening, foto, video of geluid.'],
      ['samen spelen', 'De tegels komen op een groot scherm en de groep speelt memory.'],
      ['erover praten', 'Bij elk paar bespreek je wat de tegel betekent.'],
    ],
    madeBy: 'InnerGames samen met Paper2Play',
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
  // leave these out when innergames.nl doesn't say it, the page then hides the box
  forWhom?: string
  players?: string
  story: string[]
  contents: string[]
  status?: string
  // a cut-out photo of only the box (transparent png), for the box scene on the game page
  box?: { src: string; w: number; h: number }
}

export const GAMES: Game[] = [
  {
    slug: 'elemental-five-compleet',
    title: 'the elemental five – compleet',
    short: 'Gebaseerd op het Big Five-model, via vijf elementen: water, vuur, aarde, lucht en ether.',
    aud: ['organisaties', 'onderwijs', 'trainers'],
    price: '€ 152',
    photo: img('games/elemental-five-compleet'),
    gallery: [img('games/elemental-five-compleet'), img('games/elemental-five-opstelling'), img('games/elemental-five-kaartenset'), img('games/elemental-five-grondankers')],
    previewKey: 'the elemental five',
    forWhom: 'coaches, trainers, teams en studie- en loopbaanbegeleiding',
    story: [
      'The Elemental Five is gebaseerd op het Big Five-persoonlijkheidsmodel. Zo’n test is nauwkeurig en goed onderzocht, maar ook erg cognitief: hij vraagt niet hoe iets voelt of waar je naartoe wilt groeien.',
      'Dat voegt The Elemental Five toe. Via vijf elementen (water, vuur, aarde, lucht en ether) werk je met spel, beweging, verbeelding, opstellingen, ademhaling en meditatie. Zonder hokjes, en je eindigt met heldere punten om aan te werken.',
      'Je zet het op veel manieren in, van persoonlijke reflectie tot teamcoaching. Het past ook goed in het onderwijs, bijvoorbeeld bij studieloopbaanbegeleiding (SLB). In de complete set zit alles om met een groep te beginnen.',
    ],
    contents: ['Het kaartspel', 'Een set grondankers', 'Uitgebreide digitale handleiding', 'PowerPoint voor groepsworkshops'],
  },
  {
    slug: 'elemental-five-grondankers',
    title: 'the elemental five – grondankers',
    short: '36 ronde vloerkaarten om de elementen fysiek te ervaren.',
    aud: ['trainers', 'organisaties'],
    price: '€ 79',
    photo: img('games/elemental-five-grondankers'),
    gallery: [img('games/elemental-five-grondankers'), img('games/elemental-five-opstelling')],
    previewKey: 'the elemental five',
    players: 'individuele en groepsopstellingen',
    story: [
      '36 ronde vloerkaarten (210 mm) voor individuele en groepsopstellingen. Je legt de elementen op de vloer en ervaart ze met je lijf, in plaats van er alleen over na te denken.',
      'The Elemental Five is gebaseerd op het Big Five-model en werkt met vijf elementen: water, vuur, aarde, lucht en ether. De grondankers brengen het spel in beweging.',
    ],
    contents: ['36 ronde vloerkaarten (210 mm)'],
  },
  {
    slug: 'elemental-five-kaartenset',
    title: 'the elemental five – kaartenset',
    short: '36 grote kaarten, de basis van de serie.',
    aud: ['trainers', 'organisaties'],
    price: '€ 39',
    photo: img('games/elemental-five-kaartenset'),
    gallery: [img('games/elemental-five-kaartenset'), img('games/elemental-five-compleet')],
    previewKey: 'the elemental five',
    players: 'alleen of in groepen',
    story: [
      '36 grote, stevige kaarten (148 × 105 mm). Dit is de basis van de hele serie: met deze kaarten ontdek je via vijf elementen (water, vuur, aarde, lucht en ether) hoe je in elkaar zit.',
      'Je werkt er alleen mee, voor persoonlijke reflectie, of samen in een groep. The Elemental Five is gebaseerd op het Big Five-model, maar dan zonder hokjes.',
    ],
    contents: ['36 grote, stevige kaarten (148 × 105 mm)'],
  },
  {
    slug: 'sociality',
    title: 'Sociality, een kijk op sociale kwaliteit',
    short: 'Een bordspel van HAN en InnerGames over het model Sociale Kwaliteit, met praktijkcasussen.',
    aud: ['zorg', 'onderwijs'],
    price: '€ 69',
    photo: img('games/sociality'),
    gallery: [img('games/sociality')],
    previewKey: 'Sociality',
    forWhom: 'mensen die werken of studeren in het sociaal werk, en iedereen die meer wil weten over Sociale Kwaliteit',
    players: 'ongeveer 3 tot 6 per set (meer sets voor grotere groepen)',
    story: [
      'Het model Sociale Kwaliteit is waardevol, maar ook abstract. Met Sociality oefen je het in echte situaties: je speelt praktijkcasussen en leert zo het model toe te passen.',
      'Het spel is gemaakt door het lectoraat Versterken van Sociale Kwaliteit van de HAN (Robin Smits, Nicole Moorman, Lisbeth Verharen en Carinda Jansen), samen met Ariën Kingma.',
      'Er komen nog meer casussen bij, op micro-, meso- en macroniveau. In Nederland heb je het spel binnen 2 tot 3 werkdagen in huis.',
    ],
    box: { src: '/assets/img/games/sociality-box.png', w: 398, h: 459 },
    contents: ['Speeldoos', 'Speelbord', '2 kaartsets van 21 kaarten met verschillende casussen', '1 set van 10 kaarten over sociale kwaliteit', 'Boekje met handleiding en theorie', 'Pion'],
  },
  {
    slug: 'impact-imperium',
    title: 'Impact Imperium (klassenset)',
    short: 'Een competitief klassenspel over alledaagse producten, afval en plastic.',
    aud: ['onderwijs'],
    price: '€ 275',
    photo: img('games/impact-imperium'),
    gallery: [img('games/impact-imperium'), img('workshops/het-impact-imperium')],
    previewKey: 'Impact Imperium',
    forWhom: 'klassen: leerlingen en studenten',
    players: '4 tot 40 personen (8 exemplaren)',
    story: [
      'Een spel om fanatiek te spelen. Verzamel genoeg water, stroom en grondstoffen om alledaagse producten te maken, zonder te veel schadelijke stoffen en plastic te produceren.',
      'Zo ontdekken leerlingen en studenten hoeveel er nodig is om iets te maken. Ze baseren hun keuzes daarop, en vertalen het daarna naar concrete stappen voor hun eigen gedrag.',
      'Gemaakt door Duurzaamheid in de klas. De prijs is inclusief verzending, en je hebt de set binnen 10 werkdagen na bevestiging.',
    ],
    contents: ['8 Impact Imperium-spellen', 'Gespreksstarter Kansen(on)gelijkheid (gratis)', '10 uitdagingskaarten (voor de verliezers)', 'Docentenhandleiding met vervolgopdrachten', 'Kaartsets', 'Dobbelstenen'],
  },
  {
    slug: 'kansen-keren',
    title: 'Kansen Keren',
    short: '66 levenssituaties in een niet-competitief gesprekspel.',
    aud: ['onderwijs', 'organisaties'],
    price: '€ 16,35 incl. verzending',
    photo: img('games/kansen-keren'),
    gallery: [img('games/kansen-keren'), img('workshops/kansen-keren')],
    // preview staat uit tot Ariën en Carinda Jansen akkoord geven; aanzetten: previewKey: 'Kansen Keren' en status weghalen
    previewKey: null,
    status: 'wordt herzien',
    story: [
      'Een coöperatief spel over kansenongelijkheid. Winnen kan niet: het gaat om het gesprek.',
      'De groep geeft een pion een identiteit en zet hem midden op een levensweg. De dobbelsteen bepaalt welk van de 11 levensmomenten er gebeurt, met in totaal 66 levensgebeurtenissen. Bij elke gebeurtenis bespreek je samen hoeveel stappen de pion omhoog of omlaag gaat.',
      'Thema’s zijn onder andere woonomgeving, gezondheid, sociale steun, onderwijs en geloof. In het boekje staan varianten, bijvoorbeeld met 15 stoelen in plaats van het bord en een deelnemer als pion. Gemaakt door Carinda Jansen (buro KAN).',
      'Het spel wordt op dit moment herzien. Een preview is daarom nog niet beschikbaar.',
    ],
    contents: ['Spelbord met levensweg', '66 levensgebeurtenissen', 'Boekje met spelvarianten'],
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

// the client logos, cut one by one out of clients.png (same order). name is the alt text,
// h is the height in the original image, so the logos keep the sizes the designer gave them
// the v-logo has no name yet: we don't know which organisation it is, so it stays without alt text
export const CLIENTS: { name: string; file: string; h: number }[] = [
  { name: 'ASML', file: 'asml', h: 52 },
  { name: 'Avans Hogeschool', file: 'avans', h: 52 },
  { name: 'Curio', file: 'curio', h: 52 },
  { name: 'Gemeente Eindhoven', file: 'gemeente-eindhoven', h: 52 },
  { name: 'Fontys', file: 'fontys', h: 77 },
  { name: 'GGzE', file: 'ggze', h: 77 },
  { name: 'HAN', file: 'han', h: 77 },
  { name: 'Met GGZ', file: 'metggz', h: 77 },
  { name: 'Novadic-Kentron', file: 'novadic-kentron', h: 76 },
  { name: 'Philips', file: 'philips', h: 76 },
  { name: 'Summa College', file: 'summa', h: 76 },
  { name: 'TU/e', file: 'tue', h: 76 },
  { name: 'UWV', file: 'uwv', h: 63 },
  { name: '', file: 'v-logo', h: 63 },
  { name: 'WAVE', file: 'wave', h: 63 },
  { name: 'WIJeindhoven', file: 'wijeindhoven', h: 63 },
]

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
  { title: 'KansenKeren Senior', text: 'Bordspel over ongelijke kansen bij ouderen, met buro KAN.', when: 'verwacht december 2026', photo: img('projects/kansenkeren-senior') },
  { title: 'MemoryStory app', text: 'Deel tekeningen, geluid, foto’s en video op een digibord en speel samen. Voor klassen, teams en zorg.', when: 'verwacht eind 2026', photo: img('projects/memorystory-app') },
  { title: 'Ready to Board', text: 'Een speelse gesprekstool voor sollicitatie en onboarding, vooral voor neurodivergente mensen.', when: 'bèta', photo: img('projects/ready-to-board') },
  { title: 'Sociality cases', text: 'Nieuwe praktijkcasussen, gemaakt met studenten sociaal werk van de HAN.', when: 'in ontwikkeling', photo: img('projects/sociality-cases') },
  { title: 'Wisselwerk', text: 'Een app voor teams over verschillende werk- en communicatiestijlen.', when: 'in ontwikkeling', photo: img('projects/wisselwerk') },
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
