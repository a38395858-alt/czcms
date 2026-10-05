/**
 * Nederlandse homepage (Nederland) — gelokaliseerde sectiegegevens.
 * De structuur volgt het gedeelde sectiecontract (../types.ts); de inhoud hoort bij deze site.
 * Personaliteit van het sjabloon: « Deltaraster » — getij, dijk, Delfts blauw, poldergroen, oranje.
 * Beleefdheidsvorm «u»; Nederlandse aanhalingstekens “…” waar passend.
 */
import type { StartingPointValue } from '../types';

export const NL_META = {
  title: 'FreightVanta Nederland | Internationale vracht en fulfillment',
  description:
    'FreightVanta coördineert sourcing, zee- en luchtvracht, douanedocumenten, opslag en fulfillment in één duidelijke logistieke route.',
  path: '/nl/',
  lang: 'nl-NL',
};

export const nlAnnouncement = {
  body: 'Wat moet er bewegen? Wij maken de route duidelijk.',
  cta_label: 'Vraag een plan aan',
  cta_url: '/nl/aanvraag',
};

export const nlNav = [
  { label: 'Oplossingen', href: '/nl/diensten' },
  { label: 'Onze werkwijze', href: '/nl/proces' },
  { label: 'Sectoren', href: '/nl/sectoren' },
  { label: 'Kennis', href: '/nl/bronnen' },
  { label: 'Over ons', href: '/nl/over-ons' },
  { label: 'Plan uw zending', href: '/nl/aanvraag' },
];

export const nlHero = {
  eyebrow: 'ROUTE CONTROL / ORIGIN → PORT → WAREHOUSE → CUSTOMER',
  title: 'Vracht, helder geregeld.',
  body: 'FreightVanta brengt leverancier, voorbereiding, transport, documentatie, opslag en levering samen in één werkbare route. U ziet welke overdracht klaar is, wat aandacht vraagt en wie de volgende stap beheert.',
  cta_primary_label: 'Plan uw zending',
  cta_primary_url: '/nl/aanvraag',
  cta_secondary_label: 'Bekijk diensten',
  cta_secondary_url: '/nl/diensten',
  microcopy:
    'Deel product, vertrekpunt, bestemming en gewenste datum. Wij zetten de losse schakels om in een overzichtelijk plan.',
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
    title: 'Een leverancier die bij de vraag past.',
    copy: 'Stuur een link, foto of specificatie. We kunnen leveranciers in China zoeken, opties naast elkaar zetten en vragen over sample of aankoop voorbereiden.',
    tags: ['Sourcing in China', 'Leveranciersbriefing', 'Monstercoördinatie'],
    starting_point: 'product-sourcing',
    detail_url: '/solutions/product-sourcing',
  },
  {
    id: 'zeevracht',
    label: 'Zeevracht',
    title: 'Volume met overzicht.',
    copy: 'Voor groupage of container stemmen we gereedheid, verpakkingsgegevens, vertrek en overdracht naar de bestemming op elkaar af.',
    tags: ['FCL', 'LCL', 'Van haven tot deur'],
    starting_point: 'ocean-freight',
    detail_url: '/solutions/ocean-freight',
  },
  {
    id: 'luchtvracht',
    label: 'Luchtvracht',
    title: 'Een route voor tijdkritische goederen.',
    copy: 'Voor lanceringen, aanvulling of spoed bekijken we een praktische luchtvrachtoptie en de informatie die voor de overdracht nodig is.',
    tags: ['Express', 'Standaard', 'Spoedaanvulling'],
    starting_point: 'air-freight',
    detail_url: '/solutions/air-freight',
  },
  {
    id: 'douane',
    label: 'Douanecoördinatie',
    title: 'Informatie klaar vóór vertrek.',
    copy: 'Factuur, paklijst en productgegevens worden gestructureerd verzameld. Classificatie en inklaring blijven afhankelijk van uw broker en de bevoegde autoriteiten.',
    tags: ['Zendingsinformatie', 'Documenten op orde', 'Hulp bij overdracht'],
    starting_point: 'not-sure',
    detail_url: '/solutions/customs-coordination',
  },
  {
    id: 'opslag',
    label: 'Opslag & fulfilment',
    title: 'Ontvangen, controleren, doorzetten.',
    copy: 'Goederen kunnen worden ontvangen, gecontroleerd, samengevoegd en volgens uw verzendinstructie klaargemaakt. Neutrale verpakking en orders met meerdere artikelen passen in dezelfde workflow.',
    tags: ['Consolidatie', 'Opslag', 'Ordervoorbereiding'],
    starting_point: 'warehousing-fulfillment',
    detail_url: '/solutions/warehousing-fulfillment',
  },
  {
    id: 'verpakking',
    label: 'Verpakking & branding',
    title: 'Uw merk meegeven aan de laatste meter.',
    copy: 'Inserts, stickers, labels, tassen of dozen worden voorbereid na goedkeuring van ontwerp, aantallen en productiestappen.',
    tags: ['Inserts', 'Labels', 'Voorbereiding private label'],
    starting_point: 'packaging-branding',
    detail_url: '/solutions/packaging-branding',
  },
];

export const nlServicesSection = {
  kicker: 'OPLOSSINGEN PER OVERDRACHT',
  title: 'Eén route voor uw volledige keten.',
  body: 'Elke extra overdracht is een kans op vertraging of misverstanden. Daarom verzamelen we de juiste informatie vóór het volgende knooppunt.',
  panel_cta_label: 'Neem deze dienst op in het plan',
  detail_link_label: 'Detailpagina (EN)',
};

export const nlOperation = {
  kicker: 'VAK 02 · Eén verbonden operatie',
  title: 'Duidelijkheid bij elk knooppunt.',
  pull_quote: '“Eén helder operationeel beeld — van de eerste product- of leveranciersbeslissing tot de overdracht bij levering.”',
  items: [
    {
      title: 'Eén aanspreekpunt',
      copy: 'Sourcingvragen, leveranciersreacties en verzendnotities blijven gekoppeld.',
    },
    {
      title: 'Controle vóór vertrek',
      copy: 'Staat, aantallen en afgesproken verpakking worden gecontroleerd.',
    },
    {
      title: 'Status met betekenis',
      copy: 'Iedere update maakt duidelijk wat gereed is en wat nu nodig is.',
    },
    {
      title: 'Uitzonderingen zichtbaar',
      copy: 'Een wijziging komt vroeg genoeg in beeld om voorraad en klantcommunicatie aan te passen.',
    },
  ],
};

export const nlProcess = {
  kicker: 'ONZE WERKWIJZE',
  title: 'Van eerste vraag naar bevestigde aankomst.',
  body: 'Elke extra overdracht is een kans op vertraging of misverstanden. Daarom verzamelen we de juiste informatie vóór het volgende knooppunt.',
  steps: [
    {
      step: '01',
      title: 'Vertel wat u vervoert',
      copy: 'Product, hoeveelheid, oorsprong, bestemming, datum en voorwaarden.',
    },
    {
      step: '02',
      title: 'Ontvang een praktisch plan',
      copy: 'Route, documenten, eigenaars en open vragen.',
    },
    {
      step: '03',
      title: 'Coördineer iedere overdracht',
      copy: 'Leverancier, controle, verpakking, transport, opslag en laatste kilometer.',
    },
    {
      step: '04',
      title: 'Blijf op de hoogte',
      copy: 'Tracking en uitzonderingsnotities voor uw volgende beslissing.',
    },
  ],
  closing: '',
};

export const nlIndustries = {
  kicker: 'SECTOREN',
  title: 'Logistiek die werkt zoals uw bedrijf werkt.',
  body: 'Verschillende goederen vragen om verschillende controles, documenten en leveringsgesprekken. Het werk begint bij de beperking die voor uw operatie het belangrijkst is.',
  detail_label: 'Sectorpagina (EN)',
  items: [
    {
      slug: 'cross-border-ecommerce',
      name: 'E-commerce & retail',
      copy: 'Herbevoorrading, bundels en een consistente orderverwerking.',
      href: '/industries/cross-border-ecommerce',
    },
    {
      slug: 'consumer-goods',
      name: 'Consumentengoederen',
      copy: 'Kwaliteit, verpakking en levering in één overzicht.',
      href: '/industries/consumer-goods',
    },
    {
      slug: 'industrial-components',
      name: 'Industriële componenten',
      copy: 'Specificaties, documenten en ontvangstafspraken voorop.',
      href: '/industries/industrial-components',
    },
    {
      slug: 'time-critical-cargo',
      name: 'Urgente vracht',
      copy: 'Realistische keuze, snelle signalering en duidelijke eigenaar.',
      href: '/industries/time-critical-cargo',
    },
  ],
};

export const nlResources = {
  kicker: 'KENNIS',
  title: 'Kennis voor betere beslissingen.',
  body: 'Praktische uitleg over importvoorbereiding, Incoterms, een goed leveranciersbriefing, zee- versus luchtvracht en verpakkingscontrole.',
  note: 'Onze gidsen verschijnen eerst in het Engels; Nederlandse versies volgen. De onderstaande links openen de Engelse editie.',
  topics: [
    { label: 'Importchecklist', href: '/guides/import-planning-checklist' },
    { label: 'Zee of lucht?', href: '/guides/ocean-or-air-freight' },
    { label: 'Briefing voor leveranciers', href: '/guides/china-sourcing-brief' },
    { label: 'Verpakking voor directe levering', href: '/guides/packaging-insert-guide' },
  ],
  cta_label: 'Bezoek het kenniscentrum (EN)',
  cta_url: '/guides',
};

export const nlFaq = {
  kicker: 'VEELGESTELDE VRAGEN',
  title: 'Welke vragen spelen vóór de eerste overdracht?',
  aside_prompt: 'Staat uw vraag er niet bij? Begin met wat u weet — een specialist helpt u met de rest.',
  aside_link_label: 'Vertel ons wat er beweegt',
  aside_link_url: '/nl/aanvraag',
  items: [
    {
      id: 'productlink',
      question: 'Kan ik met alleen een productlink beginnen?',
      answer:
        'Ja. Een link, foto of korte specificatie is genoeg voor een eerste gesprek.',
    },
    {
      id: 'sourcing-fulfilment',
      question: 'Kan ik één onderdeel aanvragen?',
      answer:
        'Ja. Kies sourcing, transport, opslag, verpakking, fulfillment of een gecombineerde route.',
    },
    {
      id: 'zee-lucht',
      question: 'Regelen jullie de inklaring?',
      answer:
        'We coördineren gegevens en overdrachten; de verantwoordelijke broker moet per zending worden bevestigd.',
    },
    {
      id: 'douane',
      question: 'Welke gegevens helpen het snelst?',
      answer:
        'Product, hoeveelheid, vertrekpunt, bestemming, gewenste datum en beschikbare documenten.',
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
  kicker: 'PLAN UW ZENDING',
  form_tag: 'Vrachtbrief · Aanvraag verzendplan',
  title: 'Wat moet er bewegen? Wij maken de route duidelijk.',
  body: 'Deel product, vertrekpunt, bestemming en gewenste datum. Een FreightVanta-specialist beoordeelt de gegevens en reageert met de juiste volgende stap.',
  reassurance: [
    'Een productlink, een foto of een korte specificatie is genoeg voor een eerste sourcinggesprek.',
    'U kunt beginnen met sourcing, transport, opslag, verpakking, fulfilment of een gecombineerd plan.',
    'Het definitieve bereik wordt in het verzendplan bevestigd.',
  ],
  copy: {
    button: 'Vraag een plan aan',
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
  tagline: 'FreightVanta · Oplossingen · Sectoren · Kennis · Contact · Privacy · Juridische informatie.',
  cta_label: 'Vraag een plan aan',
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
