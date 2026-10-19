/**
 * Nederlandse homepage (Nederland) — gelokaliseerde sectiegegevens.
 * De structuur volgt het gedeelde sectiecontract (../types.ts); de inhoud hoort bij deze site.
 * Personaliteit van het sjabloon: « Deltaraster » — getij, dijk, Delfts blauw, poldergroen, oranje.
 * Beleefdheidsvorm «u»; Nederlandse aanhalingstekens “…” waar passend.
 */
import type { StartingPointValue } from '../types';

export const NL_META = {
  title: 'Sourcing in China, internationaal transport & fulfilment | FreightVanta',
  description:
    'FreightVanta coördineert productsourcing in China, zee- en luchtvracht, voorbereiding van zendingen, opslag, fulfilment en levering in Nederland in één praktisch verzendplan.',
  path: '/nl/',
  lang: 'nl-NL',
};

export const nlAnnouncement = {
  body: 'Vracht naar Nederland of de EU? Vraag een verzendplan aan bij een logistiek specialist.',
  cta_label: 'Verzendplan aanvragen',
  cta_url: '/nl/aanvraag',
};

export const nlNav = [
  { label: 'Diensten', href: '/nl/diensten' },
  { label: 'Proces', href: '/nl/proces' },
  { label: 'Sectoren', href: '/nl/sectoren' },
  { label: 'Bronnen', href: '/nl/bronnen' },
  { label: 'Vragen', href: '/nl/vragen' },
  { label: 'Contact', href: '/nl/aanvraag' },
];

export const nlHero = {
  eyebrow: 'Sourcing & transport, helder gecoördineerd',
  title: 'Van sourcing in China tot levering in Nederland: elke overdracht helder.',
  body: 'FreightVanta helpt groeiende bedrijven bij het coördineren van productsourcing, voorbereiding van zendingen, zee- en luchtvracht, douane-informatie, opslag, fulfilment en de uiteindelijke levering in één praktisch operationeel plan.',
  cta_primary_label: 'Verzendplan aanvragen',
  cta_primary_url: '/nl/aanvraag',
  cta_secondary_label: 'Bekijk diensten',
  cta_secondary_url: '/nl/diensten',
  microcopy:
    'Begin met een productlink, een samenvatting van de zending of de route die u moet plannen. Wij helpen u de volgende nuttige stap te bepalen.',
  route_labels: ['HERKOMST', 'HAVEN', 'MAGAZIJN', 'KLANT'],
  media_id: 'nl-hero-haven',
  media_alt: '’s Nachts verlicht containerschip aan de kade in de Rotterdamse haven, met kranen erboven.',
  media_caption: 'Fig. 1 · Containerschip in de Rotterdamse haven, bij nacht',
};

export const nlCoverage = [
  'Productsourcing in China',
  'Zeevracht',
  'Luchtvracht',
  'Douanecoördinatie',
  'Opslag & fulfilment',
  'Last-milebezorging',
];

export interface NlService {
  id: string;
  label: string;
  title: string;
  copy: string;
  tags: string[];
  starting_point: StartingPointValue | null;
  detail_url: string;
}

export const nlServices: NlService[] = [
  {
    id: 'sourcing',
    label: 'Productsourcing',
    title: 'Vind de juiste productroute.',
    copy: 'Deel een productlink, een foto, een specificatie of een richtprijs. Wij helpen bij het ordenen van leveranciersvragen, vergelijkingspunten, monsters en inkoopdetails die vóór de volgende overdracht duidelijk moeten zijn.',
    tags: ['Sourcing in China', 'Leveranciersbriefing', 'Monstercoördinatie'],
    starting_point: 'product-sourcing',
    detail_url: '/product-sourcing',
  },
  {
    id: 'zeevracht',
    label: 'Zeevracht',
    title: 'Plan het voordelige traject.',
    copy: 'Bij geconsolideerde of containervracht helpen wij de gereedheid van de lading, exportdocumenten, overdrachten in de haven en het leverplan op elkaar af te stemmen. De samenvatting toont wat is inbegrepen, welke beslissingen nog openstaan en wie de volgende stap zet.',
    tags: ['FCL', 'LCL', 'Van haven tot deur'],
    starting_point: 'ocean-freight',
    detail_url: '/solutions/ocean-freight',
  },
  {
    id: 'luchtvracht',
    label: 'Luchtvracht',
    title: 'Bescherm het urgente traject.',
    copy: 'Wanneer een lancering, een aanvulling of een spoedorder niet kan wachten op de volgende zeecyclus, vergelijken wij realistische luchtvrachtopties en organiseren wij de ophaling, verzenddocumenten en overdrachten bij levering.',
    tags: ['Express', 'Standaard', 'Spoedaanvulling'],
    starting_point: 'air-freight',
    detail_url: '/solutions/air-freight',
  },
  {
    id: 'douane',
    label: 'Douanecoördinatie',
    title: 'Zorg dat documenten op tijd klaar zijn.',
    copy: 'Wij helpen bij het verzamelen van commerciële facturen, paklijsten en zendingsinformatie, zodat vragen zichtbaar worden voordat de lading het volgende controlepunt bereikt. De definitieve indeling en de douaneafhandeling vallen onder de bevoegde autoriteit en de verantwoordelijke douanevertegenwoordiger.',
    tags: ['Zendingsinformatie', 'Documenten op orde', 'Hulp bij overdracht'],
    starting_point: 'not-sure',
    detail_url: '/solutions/customs-coordination',
  },
  {
    id: 'opslag',
    label: 'Opslag & fulfilment',
    title: 'Ontvang, controleer en verzend met een doel.',
    copy: 'Voorraad kan worden ontvangen, gecontroleerd, geconsolideerd, opgeslagen en voorbereid voor de bestemming die u goedkeurt. De samenvatting houdt product-, verpakkings- en vrijgave-instructies bij de order.',
    tags: ['Consolidatie', 'Opslag', 'Ordervoorbereiding'],
    starting_point: 'warehousing-fulfillment',
    detail_url: '/solutions/warehousing-fulfillment',
  },
  {
    id: 'verpakking',
    label: 'Verpakking & branding',
    title: 'Maak van het pakket úw pakket.',
    copy: 'Coördineer goedgekeurde inserts, stickers, hangtags, zakken, dozen en andere merkelementen als onderdeel van de fulfilmentsamenvatting. Artwork, aantallen en productiestappen worden vóór gebruik bevestigd.',
    tags: ['Inserts', 'Labels', 'Voorbereiding private label'],
    starting_point: 'packaging-branding',
    detail_url: '/solutions/packaging-branding',
  },
];

export const nlServicesSection = {
  kicker: 'VAK 01 · Wat wij coördineren',
  title: 'Eén operationeel beeld, van leverancier tot klant.',
  body: 'Uw zending volgt zelden één simpele stap. Wij verbinden sourcing, voorbereiding, transport, douane, opslag en levering tot een werkwijze die uw team kan volgen.',
  panel_cta_label: 'Neem deze dienst op in het plan',
  detail_link_label: 'Detailpagina (EN)',
};

export const nlOperation = {
  kicker: 'VAK 02 · Eén verbonden operatie',
  title: 'Betrouwbaarheid zit in de details.',
  pull_quote: '“Eén helder operationeel beeld — van de eerste product- of leveranciersbeslissing tot de overdracht bij levering.”',
  items: [
    {
      title: 'Een vast aanspreekpunt',
      copy: 'Eén persoon houdt de aanvraag, leveranciersvragen, notities bij de zending en de volgende actie in dezelfde werkdraad bij elkaar.',
    },
    {
      title: 'Controles vóór verzending',
      copy: 'Staat van het product, aantallen en afgesproken verpakkingsinstructies worden bevestigd voordat goederen de locatie verlaten.',
    },
    {
      title: 'Flexibele voorbereiding',
      copy: 'Consolideer orders, splits bestemmingen of houd voorraad aan volgens het plan dat uw team goedkeurt.',
    },
    {
      title: 'Traceerbare overdrachten',
      copy: 'Vervoerdersreferenties en statusnotities blijven bij elkaar, zodat uw team ziet wat er is veranderd en wat er daarna gebeurt.',
    },
  ],
};

export const nlProcess = {
  kicker: 'VAK 03 · Proces',
  title: 'Een praktisch proces voor complexe vracht.',
  body: 'Het gaat er niet om logistiek eenvoudig te laten lijken. Het gaat erom de volgende beslissing, het volgende document en de volgende overdracht zichtbaar te houden voordat ze een vertraging worden.',
  steps: [
    {
      step: '01',
      title: 'Vertel ons wat er beweegt.',
      copy: 'Deel productlinks, aantallen, herkomst, bestemming, gewenste datum en eventuele verpakkings- of compliance-eisen.',
    },
    {
      step: '02',
      title: 'Beoordeel het plan.',
      copy: 'Wij verduidelijken de voorgestelde route, open vragen, benodigde documenten en verantwoordelijkheden voordat het werk begint.',
    },
    {
      step: '03',
      title: 'Wij coördineren elke overdracht.',
      copy: 'Sourcing, inkoop, inspectie, voorbereiding, transport, opslag en levering volgen één werkdossier.',
    },
    {
      step: '04',
      title: 'Kom uw klantbelofte na.',
      copy: 'Ontvang de tracking- en uitzonderingsnotities die uw team nodig heeft voor voorraad- en klantcommunicatie.',
    },
  ],
  closing: 'Als een aanname verandert, moet het plan die verandering tonen — in plaats van haar te verstoppen in een lange e-mailketen.',
};

export const nlIndustries = {
  kicker: 'VAK 04 · Sectoren',
  title: 'Gebouwd voor teams die bij de overdracht iets te verliezen hebben.',
  body: 'Verschillende goederen vragen om verschillende controles, documenten en leveringsgesprekken. Het werk begint bij de beperking die voor uw operatie het belangrijkst is.',
  detail_label: 'Sectorpagina (EN)',
  items: [
    {
      slug: 'cross-border-ecommerce',
      name: 'E-commerce & retail',
      copy: 'Houd aanvulling, bundels, marktplaatsvoorbereiding en winkelspecifieke verpakkingen geordend, van leverancier tot klant.',
      href: '/industries/cross-border-ecommerce',
    },
    {
      slug: 'consumer-goods',
      name: 'Consumentengoederen',
      copy: 'Coördineer productdetails, kwaliteitscontroles, lanceergereedheid en presentatie, van leverancier tot schap of voordeur.',
      href: '/industries/consumer-goods',
    },
    {
      slug: 'industrial-components',
      name: 'Industriële componenten',
      copy: 'Werk vanuit specificaties, documentatie, ontvangsteisen en een helder plan voor de volgende productie- of serviceoverdracht.',
      href: '/industries/industrial-components',
    },
    {
      slug: 'time-critical-cargo',
      name: 'Urgente vracht',
      copy: 'Geef prioriteit aan de eerstvolgende haalbare beweging en maak uitzonderingen vroeg zichtbaar wanneer de timing niet kan wachten.',
      href: '/industries/time-critical-cargo',
    },
  ],
};

export const nlResources = {
  kicker: 'VAK 05 · Bronnen',
  title: 'Logistieke kennis voor betere beslissingen.',
  body: 'Praktische gidsen over sourcing in China, internationaal transport, importvoorbereiding, Incoterms en leverancierscoördinatie — voor de beslissingen tussen “besteld” en “geleverd”.',
  note: 'Onze gidsen verschijnen eerst in het Engels; Nederlandse versies volgen. De onderstaande links openen de Engelse editie.',
  topics: [
    { label: 'Checklist voor importplanning (EN)', href: '/guides/import-planning-checklist' },
    { label: 'Zeevracht of luchtvracht? (EN)', href: '/guides/ocean-or-air-freight' },
    { label: 'Een sourcingbriefing voor China voorbereiden (EN)', href: '/guides/china-sourcing-brief' },
    { label: 'Gids voor verpakking en inserts (EN)', href: '/guides/packaging-insert-guide' },
    { label: 'Incoterms in heldere taal (EN)', href: '/guides/incoterms-handoffs' },
  ],
  cta_label: 'Bezoek het kenniscentrum (EN)',
  cta_url: '/guides',
};

export const nlFaq = {
  kicker: 'VAK 06 · Veelgestelde vragen',
  title: 'Vragen voordat u gaat verplaatsen?',
  aside_prompt: 'Staat uw vraag er niet bij? Begin met wat u weet — een specialist helpt u met de rest.',
  aside_link_label: 'Vertel ons wat er beweegt',
  aside_link_url: '/nl/aanvraag',
  items: [
    {
      id: 'productlink',
      question: 'Kan ik beginnen met alleen een productlink?',
      answer:
        'Ja. Een productlink, een foto of een korte specificatie is genoeg voor een eerste sourcinggesprek. Aantallen, bestemming en timing kunnen volgen zodra het plan duidelijker wordt.',
    },
    {
      id: 'sourcing-fulfilment',
      question: 'Kunt u sourcing en fulfilment combineren?',
      answer:
        'Deze pagina presenteert sourcing, voorbereiding, transport, opslag en fulfilment als één verbonden werkwijze. Het definitieve bereik wordt in het verzendplan bevestigd.',
    },
    {
      id: 'zee-lucht',
      question: 'Helpt u zowel met zee- als met luchtvracht?',
      answer:
        'Ja. Vertel ons wat er beweegt, hoe snel het moet aankomen en wat voor de zending het belangrijkst is. Wij bespreken de praktische route en de volgende overdracht.',
    },
    {
      id: 'douane',
      question: 'Verzorgt u de douaneafhandeling?',
      answer:
        'Wij coördineren zendingsinformatie en documentoverdrachten. De verantwoordelijke douanevertegenwoordiger, de jurisdictie, de indeling en het formele bereik moeten zijn vastgesteld voordat een toezegging over afhandeling mogelijk is.',
    },
    {
      id: 'opslag-nederland',
      question: 'Ondersteunt u opslag en fulfilment in Nederland?',
      answer:
        'Vertel ons de eisen voor ontvangst, opslag, voorbereiding en vrijgave. Het beschikbare bereik moet in het plan worden bevestigd voordat er voorraad wordt verplaatst.',
    },
    {
      id: 'enkele-dienst',
      question: 'Kan ik ook één enkele dienst aanvragen?',
      answer:
        'Ja. U kunt beginnen met sourcing, transport, opslag, verpakking, fulfilment of een gecombineerd plan. In het formulier kiest u het startpunt.',
    },
  ],
};

export const nlEnquiry = {
  kicker: 'VAK 07 · Verzendplan aanvragen',
  form_tag: 'Vrachtbrief · Aanvraag verzendplan',
  title: 'Vertel ons wat u moet verplaatsen. Wij maken van de losse onderdelen een plan waarmee uw team kan werken.',
  body: 'Begin met het product, de route of het leverresultaat dat u nodig hebt. Een FreightVanta-specialist beoordeelt de gegevens en reageert met de juiste volgende stap.',
  reassurance: [
    'Een productlink, een foto of een korte specificatie is genoeg voor een eerste sourcinggesprek.',
    'U kunt beginnen met sourcing, transport, opslag, verpakking, fulfilment of een gecombineerd plan.',
    'Het definitieve bereik wordt in het verzendplan bevestigd.',
  ],
  copy: {
    button: 'Verzendplan aanvragen',
    loading: 'Uw aanvraag wordt verzonden…',
    success_title: 'Bedankt — uw aanvraag is onderweg.',
    success_body: 'Een FreightVanta-specialist beoordeelt de gegevens en reageert met de juiste volgende stap.',
    error:
      'De aanvraag kon nog niet worden verzonden. Controleer de gemarkeerde velden en probeer het opnieuw, of neem contact met ons op via onderstaande gegevens.',
    reassurance: [],
    consent_prefix:
      'Ik ga ermee akkoord dat FreightVanta deze gegevens gebruikt om mijn aanvraag te beoordelen en contact met mij op te nemen, zoals beschreven in de',
    consent_link_label: 'privacyverklaring',
    consent_suffix: '.',
  },
};

export const nlFooter = {
  tagline: 'Eén praktisch plan, duidelijke verantwoordelijkheden en updates waar u iets aan hebt.',
  cta_label: 'Verzendplan aanvragen',
  cta_url: '/nl/aanvraag',
  columns: {
    services: 'Diensten',
    site: 'Navigatie',
    legal: 'Contact & juridisch',
  },
  legal_links: [
    { label: 'Juridische informatie', href: '/nl/juridisch' },
    { label: 'Privacyverklaring', href: '/nl/privacy' },
    { label: 'Cookieverklaring', href: '/nl/cookies' },
  ],
  language_label: 'Taal',
  cookie_settings: 'Cookievoorkeuren',
  rights: 'Alle rechten voorbehouden.',
  locale_tag: 'Nederlands · Nederland',
};
