/**
 * Home italiana — record di sezione localizzati.
 * La struttura segue il contratto di sezione condiviso (../types.ts); i testi appartengono a questo sito.
 */
import { SITE_META } from '../../config/site';
import type {
  AnnouncementSection,
  CoverageSection,
  EnquirySection,
  FaqSection,
  FooterSection,
  HeroSection,
  HomeSection,
  IndustriesSection,
  OperationSection,
  ProcessSection,
  ResourcesSection,
  ServicePathsSection,
} from '../types';
import { INDUSTRIES_IT } from './industries';
import { SERVICES_IT } from './services';

const base = {
  site_id: SITE_META.it.siteId,
  locale: SITE_META.it.locale,
  enabled: true,
  eyebrow: '',
  title: '',
  body: '',
  cta_primary_label: '',
  cta_primary_url: '',
  cta_secondary_label: '',
  cta_secondary_url: '',
  media_id: '',
  media_alt: '',
  draft_version: 1,
  published_version: 1,
};

export const IT_ANCHORS = {
  enquiry: '/it/#richiesta',
  services: '/it/#servizi',
  process: '/it/#metodo',
};

export const announcementIt: AnnouncementSection = {
  ...base,
  section_key: 'announcement',
  sort_order: 10,
  body: 'Merce dalla Cina verso l’Italia o l’UE? Richieda un piano di spedizione a uno specialista della logistica.',
  cta_primary_label: 'Richiedi un piano di spedizione',
  cta_primary_url: IT_ANCHORS.enquiry,
  items: [],
  settings: {},
};

export const heroIt: HeroSection = {
  ...base,
  section_key: 'hero',
  sort_order: 20,
  eyebrow: 'MOVIMENTO, CURATO IN OGNI PASSAGGIO',
  title: 'Una filiera che lavora bene, dall’origine alla consegna.',
  body: 'FreightVanta unisce ricerca prodotto, acquisto, controllo, preparazione, trasporto, magazzino e consegna in un percorso leggibile. Il tuo team sa cosa è stato fatto, cosa manca e quale decisione viene dopo.',
  cta_primary_label: 'Parla con un esperto',
  cta_primary_url: IT_ANCHORS.enquiry,
  cta_secondary_label: 'Vedi i servizi',
  cta_secondary_url: IT_ANCHORS.services,
  media_id: 'it-hero-porto',
  media_alt: 'Porto con gru e container avvolto dalla foschia, con le montagne sullo sfondo.',
  items: [],
  settings: {
    microcopy:
      'Raccontaci il prodotto, il punto di partenza e la destinazione. Costruiamo il primo passaggio insieme.',
    route_labels: ['FABBRICA', 'PORTO', 'MAGAZZINO', 'CLIENTE'],
  },
};

/** "Scheda spedizione" — the editorial index printed beside the hero image. */
export const HERO_SCHEDA_IT: Array<{ term: string; detail: string }> = [
  { term: 'Origine', detail: 'Fornitore o stabilimento in Cina' },
  { term: 'Modalità', detail: 'Mare, aria o ferrovia, confrontate per ogni spedizione' },
  { term: 'Passaggi', detail: 'Dogana, magazzino, preparazione, consegna' },
  { term: 'Risultato', detail: 'Un piano con responsabilità chiare' },
];

export const coverageIt: CoverageSection = {
  ...base,
  section_key: 'coverage',
  sort_order: 30,
  title: 'Il nostro ambito di lavoro',
  items: [
    { label: 'Ricerca fornitori in Cina', href: '/it/servizi/ricerca-fornitori-in-cina' },
    { label: 'Trasporto marittimo', href: '/it/servizi/trasporto-marittimo' },
    { label: 'Trasporto aereo', href: '/it/servizi/trasporto-aereo' },
    { label: 'Coordinamento doganale', href: '/it/servizi/coordinamento-doganale' },
    { label: 'Magazzino e logistica e-commerce', href: '/it/servizi/magazzino-e-logistica-e-commerce' },
    { label: 'Consegna ultimo miglio', href: '/it/servizi/trasporto-terrestre-e-consegna' },
  ],
  settings: {},
};

export const servicePathsIt: ServicePathsSection = {
  ...base,
  section_key: 'service_paths',
  sort_order: 40,
  eyebrow: 'Che cosa coordiniamo',
  title: 'Una catena pensata con cura.',
  body: 'Una consegna ben fatta nasce prima della partenza. Mettiamo in ordine le informazioni che servono a ogni passaggio.',
  items: SERVICES_IT.filter((service) => service.inSelector).map((service) => ({
    id: service.slug,
    label: service.label,
    title: service.title,
    copy: service.copy,
    tags: service.tags,
    link_label: service.linkLabel,
    link_url: `/it/servizi/${service.slug}`,
    media_id: service.mediaId,
    media_alt: service.mediaAlt,
    starting_point: service.startingPoint,
  })),
  settings: {
    panel_cta_label: 'Vedi come questo servizio si inserisce nella sua spedizione',
    default_tab: 'ricerca-fornitori-in-cina',
  },
};

export const operationIt: OperationSection = {
  ...base,
  section_key: 'operation',
  sort_order: 50,
  eyebrow: 'Un’operazione collegata',
  title: 'La qualità si riconosce nei dettagli.',
  cta_primary_label: 'Come procede il lavoro',
  cta_primary_url: IT_ANCHORS.process,
  items: [
    {
      title: 'Un riferimento personale',
      copy: 'Domande, risposte dei fornitori e note di spedizione non si disperdono.',
    },
    {
      title: 'Controllo prima del movimento',
      copy: 'Stato, quantità e presentazione verificati prima del passaggio successivo.',
    },
    {
      title: 'Ordine nelle informazioni',
      copy: 'Ogni aggiornamento dice cosa è pronto e cosa va deciso.',
    },
    {
      title: 'Eccezioni raccontate bene',
      copy: 'Una variazione diventa una scelta, non una sorpresa.',
    },
  ],
  settings: {
    pull_quote: 'Una visione d’insieme chiara, dalla prima decisione su prodotto o fornitore fino alla consegna al destinatario.',
  },
};

export const processIt: ProcessSection = {
  ...base,
  section_key: 'process',
  sort_order: 60,
  title: 'Quattro gesti, un flusso continuo.',
  body: 'Una consegna ben fatta nasce prima della partenza. Mettiamo in ordine le informazioni che servono a ogni passaggio.',
  items: [
    {
      step: '01',
      title: 'Capire la merce',
      copy: 'Prodotto, quantità, origine, destinazione, data e vincoli.',
    },
    {
      step: '02',
      title: 'Costruire il piano',
      copy: 'Percorso, documenti, responsabilità e domande aperte.',
    },
    {
      step: '03',
      title: 'Coordinare i passaggi',
      copy: 'Fornitore, controllo, packaging, trasporto, magazzino e ultimo miglio.',
    },
    {
      step: '04',
      title: 'Restare aggiornati',
      copy: 'Tracking e note di eccezione per organizzare clienti e stock.',
    },
  ],
  settings: {
    closing: '',
  },
};

export const industriesIt: IndustriesSection = {
  ...base,
  section_key: 'industries',
  sort_order: 70,
  title: 'Ritmi diversi, stessa cura.',
  body: 'Merci diverse richiedono controlli, documenti e conversazioni di consegna diversi. Il lavoro parte dal vincolo che conta di più per la sua operatività.',
  cta_primary_label: 'Vedi le soluzioni per settore',
  cta_primary_url: '/it/settori',
  media_id: 'it-industry-featured',
  media_alt: 'Veduta aerea di un porto merci con container impilati e mezzi per la logistica.',
  items: INDUSTRIES_IT.map((industry) => ({
    slug: industry.slug,
    name: industry.name,
    copy: industry.copy,
    href: `/it/settori/${industry.slug}`,
  })),
  settings: {
    media_caption: 'Ricevimento e controllo',
  },
};

export const resourcesIt: ResourcesSection = {
  ...base,
  section_key: 'resources',
  sort_order: 80,
  eyebrow: 'Risorse di pianificazione',
  title: 'Conoscenze per muoversi meglio.',
  body: 'Guide pratiche su importazione, Incoterms, brief ai fornitori, scelta tra mare e aereo e controllo dell’imballo.',
  cta_primary_label: 'Vedi tutte le guide',
  cta_primary_url: '/it/guide',
  items: [
    { label: 'Checklist import', href: '/it/guide/checklist-import-italia' },
    { label: 'Mare o aereo?', href: '/it/guide/marittimo-aereo-o-ferrovia' },
    { label: 'Brief al fornitore', href: '/it/guide/briefing-acquisti-cina' },
    { label: 'Packaging per la consegna diretta', href: '/it/guide/guida-imballaggio-e-inserti' },
  ],
  settings: {
    heading_url: '/it/guide',
    article_limit: 3,
    topics_label: 'Inizia da un argomento',
  },
};

export const faqIt: FaqSection = {
  ...base,
  section_key: 'faq',
  sort_order: 90,
  title: 'Dubbi prima di spedire?',
  items: [
    {
      id: 'link-prodotto',
      question: 'Posso iniziare da un semplice link?',
      answer:
        'Sì. Un link, una foto o una breve scheda aprono la conversazione.',
    },
    {
      id: 'fornitori-logistica',
      question: 'Posso chiedere una sola soluzione?',
      answer:
        'Sì. Il form permette di scegliere sourcing, trasporto, magazzino, packaging, fulfillment o un percorso completo.',
    },
    {
      id: 'marittimo-aereo',
      question: 'Gestite lo sdoganamento?',
      answer:
        'Organizziamo dati e passaggi; broker e autorità vanno confermati per ogni pratica.',
    },
    {
      id: 'dogana',
      question: 'Quali dati servono?',
      answer:
        'Prodotto, quantità, origine, destinazione, data desiderata e documenti disponibili.',
    },
    {
      id: 'magazzino-italia',
      question: 'Offrite magazzino e logistica e-commerce in Italia?',
      answer:
        'Ci indichi i suoi requisiti di ricevimento, stoccaggio, preparazione e rilascio. Il perimetro operativo disponibile viene confermato nel piano prima di muovere lo stock.',
    },
    {
      id: 'servizio-singolo',
      question: 'Posso richiedere un solo servizio?',
      answer:
        'Sì. Può iniziare da ricerca fornitori, trasporto, stoccaggio, imballaggio, logistica e-commerce o da un piano combinato. Nel modulo sceglie il punto di partenza.',
    },
  ],
  settings: {
    aside_prompt: 'Non trova la sua domanda? Parta da quello che sa: uno specialista la aiuta per il resto.',
    aside_link_label: 'Ci dica che cosa deve viaggiare',
    aside_link_url: IT_ANCHORS.enquiry,
  },
};

export const enquiryIt: EnquirySection = {
  ...base,
  section_key: 'enquiry',
  sort_order: 100,
  eyebrow: 'Parla con un esperto',
  title: 'La tua prossima spedizione merita un flusso comprensibile.',
  body: 'Raccontaci il prodotto, il punto di partenza e la destinazione. Uno specialista FreightVanta esaminerà i dettagli e le proporrà il passo successivo adatto.',
  items: [],
  settings: {
    button: 'Richiedi un piano',
    loading: 'Invio della richiesta in corso…',
    success_title: 'Grazie, la sua richiesta è in viaggio.',
    success_body: 'Uno specialista FreightVanta esaminerà i dettagli e la ricontatterà con il passo successivo adatto.',
    error:
      'Non siamo ancora riusciti a inviare la richiesta. Controlli i campi segnalati e riprovi, oppure ci contatti con i recapiti indicati qui sotto.',
    reassurance: [
      'Chiediamo solo ciò che serve per un primo piano di spedizione; i campi obbligatori sono contrassegnati da un asterisco.',
      'Un link al prodotto, una foto o una scheda tecnica sintetica bastano per iniziare a parlare di fornitori.',
      'Può partire da un singolo servizio o da un piano combinato; il perimetro definitivo viene confermato nel piano di spedizione.',
    ],
    consent_prefix: 'Ho letto l’',
    consent_link_label: 'informativa privacy',
    consent_suffix: ' e acconsento al trattamento dei miei dati per la gestione della richiesta e per essere ricontattato.',
  },
};

export const footerIt: FooterSection = {
  ...base,
  section_key: 'footer',
  sort_order: 110,
  body: 'FreightVanta · Soluzioni · Settori · Risorse · Contatti · Privacy · Note legali.',
  cta_primary_label: 'Richiedi un piano',
  cta_primary_url: IT_ANCHORS.enquiry,
  items: [
    { key: 'brand', title: 'FreightVanta' },
    { key: 'solutions', title: 'Servizi' },
    { key: 'industries', title: 'Settori e guide' },
    { key: 'contact', title: 'Contatti e note legali' },
  ],
  settings: {},
};

export const HOME_SECTIONS_IT: HomeSection[] = [
  announcementIt,
  heroIt,
  coverageIt,
  servicePathsIt,
  operationIt,
  processIt,
  industriesIt,
  resourcesIt,
  faqIt,
  enquiryIt,
  footerIt,
];

export function getPublishedHomeSectionsIt(): HomeSection[] {
  return HOME_SECTIONS_IT.filter((section) => section.enabled && section.published_version > 0).sort((a, b) => a.sort_order - b.sort_order);
}

export const HOME_META_IT = {
  title: 'FreightVanta Italia | Sourcing, trasporto e fulfillment internazionale',
  description:
    'FreightVanta coordina sourcing, trasporto via mare e aereo, dati doganali, magazzino e fulfillment in un unico flusso operativo.',
  path: '/it/',
};
