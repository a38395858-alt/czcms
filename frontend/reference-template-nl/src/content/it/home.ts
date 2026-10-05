/**
 * Pagina iniziale in italiano (Italia) — dati di sezione localizzati.
 * La struttura rispetta il contratto di sezioni condiviso (../types.ts); i contenuti appartengono a questo sito.
 * Personalità del modello: « Piazza Italiana » — avorio, verde bottiglia, rosso pompeiano e oro.
 * Forma di cortesia «Lei»; virgolette «…»; apostrofi tipografici ’.
 */
import type { StartingPointValue } from '../types';

export const IT_META = {
  title: 'Sourcing in Cina, trasporto internazionale e fulfillment | FreightVanta',
  description:
    'FreightVanta coordina il sourcing di prodotto in Cina, il trasporto marittimo e aereo, la preparazione delle spedizioni, il magazzinaggio, il fulfillment e la consegna in Italia in un piano di spedizione pratico.',
  path: '/it/',
  lang: 'it-IT',
};

export const itAnnouncement = {
  body: 'Merci dirette in Italia o nella UE? Richieda un piano di spedizione a uno specialista della logistica.',
  cta_label: 'Richieda un piano di spedizione',
  cta_url: '/it/richiesta',
};

export const itNav = [
  { label: 'Servizi', href: '/it/servizi' },
  { label: 'Processo', href: '/it/processo' },
  { label: 'Settori', href: '/it/settori' },
  { label: 'Risorse', href: '/it/risorse' },
  { label: 'FAQ', href: '/it/domande' },
  { label: 'Contatto', href: '/it/richiesta' },
];

export const itHero = {
  eyebrow: 'Sourcing e trasporti, coordinati con chiarezza',
  title: 'Dal sourcing in Cina alla consegna in Italia, ogni passaggio in chiaro.',
  body: 'FreightVanta aiuta le aziende in crescita a coordinare il sourcing di prodotto, la preparazione della spedizione, il trasporto marittimo e aereo, le informazioni doganali, il magazzinaggio, il fulfillment e la consegna finale in un unico piano operativo.',
  cta_primary_label: 'Richieda un piano di spedizione',
  cta_primary_url: '/it/richiesta',
  cta_secondary_label: 'Scopra i servizi',
  cta_secondary_url: '/it/servizi',
  microcopy:
    'Cominci con un link di prodotto, un riepilogo della spedizione o la rotta da pianificare. L’aiuteremo a individuare il prossimo passo utile.',
  route_labels: ['ORIGINE', 'PORTO', 'MAGAZZINO', 'CLIENTE'],
  media_id: 'it-hero-porto',
  media_alt: 'Veduta aerea di una nave portacontainer in navigazione in mare aperto.',
  media_caption: 'Fig. 1 · Nave portacontainer in navigazione',
};

export const itCoverage = [
  'Sourcing di prodotto in Cina',
  'Trasporto marittimo',
  'Trasporto aereo',
  'Coordinamento doganale',
  'Magazzinaggio e fulfillment',
  'Consegna dell’ultimo miglio',
];

export interface ItService {
  id: string;
  label: string;
  title: string;
  copy: string;
  tags: string[];
  starting_point: StartingPointValue | null;
  detail_url: string;
}

export const itServices: ItService[] = [
  {
    id: 'sourcing',
    label: 'Sourcing di prodotto',
    title: 'Trovi la strada di prodotto giusta.',
    copy: 'Condivida un link di prodotto, una foto, una specifica o un costo obiettivo. L’aiutiamo a ordinare le domande al fornitore, i punti di confronto, i campioni e i dettagli di acquisto da chiarire prima del passaggio successivo.',
    tags: ['Sourcing in Cina', 'Briefing ai fornitori', 'Coordinamento campioni'],
    starting_point: 'product-sourcing',
    detail_url: '/solutions/product-sourcing',
  },
  {
    id: 'marittimo',
    label: 'Trasporto marittimo',
    title: 'Pianifichi la tratta economica.',
    copy: 'Per carichi consolidati o in container, aiutiamo ad allineare la disponibilità della merce, i documenti di esportazione, i passaggi in porto e il piano di consegna. Il riepilogo mostra cosa è incluso, quali decisioni restano aperte e chi assume il passo successivo.',
    tags: ['FCL', 'LCL', 'Dal porto a destinazione'],
    starting_point: 'ocean-freight',
    detail_url: '/solutions/ocean-freight',
  },
  {
    id: 'aereo',
    label: 'Trasporto aereo',
    title: 'Protegga la tratta urgente.',
    copy: 'Quando un lancio, un riassortimento o un ordine urgente non può attendere il successivo ciclo marittimo, confrontiamo opzioni aeree realistiche e organizziamo il ritiro, i documenti di spedizione e i passaggi di consegna.',
    tags: ['Express', 'Standard', 'Riassortimento urgente'],
    starting_point: 'air-freight',
    detail_url: '/solutions/air-freight',
  },
  {
    id: 'dogana',
    label: 'Coordinamento doganale',
    title: 'Abbia i documenti pronti in anticipo.',
    copy: 'Aiutiamo a raccogliere fatture commerciali, packing list e informazioni sulla spedizione, così che i dubbi emergano prima che la merce raggiunga il successivo punto di controllo. La classificazione definitiva e lo sdoganamento spettano all’autorità competente e al rappresentante doganale responsabile.',
    tags: ['Dati della spedizione', 'Documenti pronti', 'Supporto nei passaggi'],
    starting_point: 'not-sure',
    detail_url: '/solutions/customs-coordination',
  },
  {
    id: 'magazzino',
    label: 'Magazzinaggio e fulfillment',
    title: 'Ricevere, controllare e spedire con metodo.',
    copy: 'Le giacenze possono essere ricevute, controllate, consolidate, stoccate e preparate per la destinazione da Lei approvata. Il riepilogo mantiene le istruzioni di prodotto, imballaggio e svincolo legate all’ordine.',
    tags: ['Consolidamento', 'Stoccaggio', 'Preparazione ordini'],
    starting_point: 'warehousing-fulfillment',
    detail_url: '/solutions/warehousing-fulfillment',
  },
  {
    id: 'imballaggio',
    label: 'Imballaggio e branding',
    title: 'Renda il pacco davvero Suo.',
    copy: 'Coordini inserti, adesivi, cartellini, sacchetti, scatole e altri elementi del marchio già approvati dentro il riepilogo di fulfillment. Grafiche, quantità e fasi di produzione si confermano prima dell’uso.',
    tags: ['Inserti', 'Etichette', 'Preparazione private label'],
    starting_point: 'packaging-branding',
    detail_url: '/solutions/packaging-branding',
  },
];

export const itServicesSection = {
  kicker: 'Cosa coordiniamo',
  title: 'Un’unica visione operativa, dal fornitore al cliente.',
  body: 'La Sua spedizione raramente segue un solo passo. Colleghiamo sourcing, preparazione, trasporto, dogana, magazzinaggio e consegna in un flusso di lavoro che il Suo team può seguire.',
  panel_cta_label: 'Includa questo servizio nel piano',
  detail_link_label: 'Pagina di dettaglio (EN)',
};

export const itOperation = {
  kicker: 'Un’operazione connessa',
  title: 'L’affidabilità si costruisce nei dettagli.',
  pull_quote: '«Una visione operativa chiara, dalla prima decisione di prodotto o fornitore fino alla consegna.»',
  items: [
    {
      title: 'Un referente assegnato',
      copy: 'Un’unica persona mantiene la richiesta, le domande al fornitore, le note della spedizione e l’azione successiva nello stesso filo di lavoro.',
    },
    {
      title: 'Controlli prima della spedizione',
      copy: 'Stato del prodotto, quantità e istruzioni di imballaggio concordate si confermano prima che la merce lasci la struttura.',
    },
    {
      title: 'Preparazione flessibile',
      copy: 'Consolidi gli ordini, separi le destinazioni o mantenga le giacenze secondo il piano approvato dal Suo team.',
    },
    {
      title: 'Passaggi tracciabili',
      copy: 'Riferimenti del vettore e note di stato restano insieme, così che il Suo team veda cosa è cambiato e cosa accade dopo.',
    },
  ],
};

export const itProcess = {
  kicker: 'Processo',
  title: 'Un processo pratico per carichi complessi.',
  body: 'L’idea non è far sembrare semplice la logistica, ma tenere visibili la prossima decisione, il prossimo documento e il prossimo passaggio prima che diventino un ritardo.',
  steps: [
    {
      step: 'I',
      title: 'Ci dica cosa si muove.',
      copy: 'Condivida link di prodotto, quantità, origine, destinazione, data obiettivo ed esigenze di imballaggio o conformità.',
    },
    {
      step: 'II',
      title: 'Esamini il piano.',
      copy: 'Chiariamo il servizio proposto, le questioni aperte, i documenti necessari e le responsabilità prima di cominciare.',
    },
    {
      step: 'III',
      title: 'Coordiniamo ogni passaggio.',
      copy: 'Sourcing, acquisti, ispezione, preparazione, trasporto, magazzinaggio e consegna seguono un unico registro di lavoro.',
    },
    {
      step: 'IV',
      title: 'Mantenga la promessa al cliente.',
      copy: 'Riceva il tracking e le note sulle eccezioni che servono al Suo team per pianificare giacenze e comunicazione.',
    },
  ],
  closing: 'Se cambia un’ipotesi, il piano deve mostrarlo invece di nasconderlo in una lunga catena di e-mail.',
};

export const itIndustries = {
  kicker: 'Settori',
  title: 'Pensato per chi in ogni passaggio si gioca qualcosa.',
  body: 'Ogni merce esige controlli, documenti e dialoghi di consegna diversi. Il lavoro comincia dal vincolo che conta di più per la Sua attività.',
  detail_label: 'Pagina del settore (EN)',
  items: [
    {
      slug: 'cross-border-ecommerce',
      name: 'E-commerce e retail',
      copy: 'Riassortimenti, bundle, preparazione per i marketplace e imballaggi specifici per punto vendita restano ordinati, dal fornitore al cliente.',
      href: '/industries/cross-border-ecommerce',
    },
    {
      slug: 'consumer-goods',
      name: 'Beni di consumo',
      copy: 'Dettagli di prodotto, controlli qualità, preparazione del lancio e presentazione si coordinano dal fornitore allo scaffale o alla porta di casa.',
      href: '/industries/consumer-goods',
    },
    {
      slug: 'industrial-components',
      name: 'Componenti industriali',
      copy: 'Si lavora da specifiche, documentazione, requisiti di ricevimento e un piano chiaro per il successivo passaggio di produzione o assistenza.',
      href: '/industries/industrial-components',
    },
    {
      slug: 'time-critical-cargo',
      name: 'Merci urgenti',
      copy: 'Il prossimo movimento fattibile ha la priorità e le eccezioni diventano visibili subito quando i tempi non ammettono attesa.',
      href: '/industries/time-critical-cargo',
    },
  ],
};

export const itResources = {
  kicker: 'Risorse',
  title: 'Informazioni logistiche per decidere meglio.',
  body: 'Guide pratiche su sourcing in Cina, trasporto internazionale, preparazione delle importazioni, Incoterms e coordinamento dei fornitori: le decisioni tra «ordinato» e «consegnato».',
  note: 'Le nostre guide escono prima in inglese; le versioni italiane seguiranno. I collegamenti aprono l’edizione inglese.',
  topics: [
    { label: 'Lista di controllo per pianificare le importazioni (EN)', href: '/guides/import-planning-checklist' },
    { label: 'Trasporto marittimo o aereo? (EN)', href: '/guides/ocean-or-air-freight' },
    { label: 'Come preparare un briefing di sourcing in Cina (EN)', href: '/guides/china-sourcing-brief' },
    { label: 'Guida a imballaggi e inserti (EN)', href: '/guides/packaging-insert-guide' },
    { label: 'Incoterms in linguaggio chiaro (EN)', href: '/guides/incoterms-handoffs' },
  ],
  cta_label: 'Visiti il centro risorse (EN)',
  cta_url: '/guides',
};

export const itFaq = {
  kicker: 'Domande frequenti',
  title: 'Domande prima di muovere la merce?',
  aside_prompt: 'Non trova la Sua domanda? Cominci da ciò che sa: uno specialista L’aiuterà per il resto.',
  aside_link_label: 'Ci dica cosa si muove',
  aside_link_url: '/it/richiesta',
  items: [
    {
      id: 'link-prodotto',
      question: 'Posso cominciare con un semplice link di prodotto?',
      answer:
        'Sì. Un link di prodotto, una foto o una breve specifica bastano per una prima conversazione di sourcing. Quantità, destinazione e tempi potranno seguire quando il piano sarà più chiaro.',
    },
    {
      id: 'sourcing-fulfillment',
      question: 'Potete combinare sourcing e fulfillment?',
      answer:
        'Questa pagina presenta sourcing, preparazione, trasporto, magazzinaggio e fulfillment come un flusso connesso. L’ambito finale si conferma nel piano di spedizione.',
    },
    {
      id: 'marittimo-aereo',
      question: 'Potete aiutare sia con il marittimo sia con l’aereo?',
      answer:
        'Sì. Ci dica cosa si muove, quanto in fretta deve arrivare e cosa conta di più per la spedizione. Potremo discutere il servizio più pratico e il passaggio successivo.',
    },
    {
      id: 'dogana',
      question: 'Offrite lo sdoganamento?',
      answer:
        'Coordiniamo le informazioni della spedizione e i passaggi dei documenti. Prima di assumere impegni di sdoganamento vanno identificati rappresentante doganale responsabile, giurisdizione, classificazione e ambito formale.',
    },
    {
      id: 'magazzino-italia',
      question: 'Potete supportare magazzinaggio e fulfillment in Italia?',
      answer:
        'Ci indichi i requisiti di ricevimento, stoccaggio, preparazione e svincolo. L’ambito operativo disponibile va confermato nel piano prima di muovere le giacenze.',
    },
    {
      id: 'singolo-servizio',
      question: 'Posso richiedere un singolo servizio?',
      answer:
        'Sì. Può cominciare da sourcing, trasporto, magazzinaggio, imballaggio, fulfillment o da un piano combinato. Nel modulo può scegliere il punto di partenza.',
    },
  ],
};

export const itEnquiry = {
  kicker: 'Richieda un piano di spedizione',
  form_tag: 'Scheda di richiesta · Piano di spedizione',
  title: 'Ci dica cosa deve muovere. Trasformeremo i pezzi sparsi in un piano che il Suo team potrà usare.',
  body: 'Cominci dal prodotto, dalla rotta o dal risultato di consegna che Le serve. Uno specialista FreightVanta esaminerà i dettagli e risponderà con il prossimo passo adatto.',
  reassurance: [
    'Un link di prodotto, una foto o una breve specifica bastano per una prima conversazione di sourcing.',
    'Può cominciare da sourcing, trasporto, magazzinaggio, imballaggio, fulfillment o da un piano combinato.',
    'L’ambito finale si conferma nel piano di spedizione.',
  ],
  copy: {
    button: 'Richieda un piano di spedizione',
    loading: 'Invio della richiesta…',
    success_title: 'Grazie: la Sua richiesta è in viaggio.',
    success_body: 'Uno specialista FreightVanta esaminerà i dettagli e risponderà con il prossimo passo adatto.',
    error:
      'Non siamo ancora riusciti a inviare la richiesta. Controlli i campi evidenziati e riprovi, oppure ci contatti ai recapiti sotto.',
    reassurance: [],
    consent_prefix:
      'Accetto che FreightVanta utilizzi questi dati per esaminare la mia richiesta e ricontattarmi, come descritto nell’',
    consent_link_label: 'informativa sulla privacy',
    consent_suffix: '.',
  },
};

export const itFooter = {
  tagline: 'Un piano pratico, responsabilità chiare e aggiornamenti su cui agire.',
  cta_label: 'Richieda un piano di spedizione',
  cta_url: '/it/richiesta',
  columns: {
    services: 'Servizi',
    site: 'Navigazione',
    legal: 'Contatti e note legali',
  },
  legal_links: [
    { label: 'Note legali', href: '/it/note-legali' },
    { label: 'Informativa sulla privacy', href: '/it/privacy' },
    { label: 'Informativa sui cookie', href: '/it/cookie' },
  ],
  language_label: 'Lingua',
  cookie_settings: 'Preferenze sui cookie',
  rights: 'Tutti i diritti riservati.',
  locale_tag: 'Italiano · Italia',
};
