/**
 * Page d’accueil française — enregistrements de sections localisés.
 * La structure suit le contrat de section partagé (../types.ts) ; les textes appartiennent à ce site.
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
import { INDUSTRIES_FR } from './industries';
import { SERVICES_FR } from './services';

const base = {
  site_id: SITE_META.fr.siteId,
  locale: SITE_META.fr.locale,
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

export const FR_ANCHORS = {
  enquiry: '/fr/#demande',
  services: '/fr/#solutions',
  process: '/fr/#methode',
};

export const announcementFr: AnnouncementSection = {
  ...base,
  section_key: 'announcement',
  sort_order: 10,
  body: 'Des marchandises de Chine vers la France ou l’UE ? Demandez un plan d’expédition à un spécialiste logistique.',
  cta_primary_label: 'Demander un plan d’expédition',
  cta_primary_url: FR_ANCHORS.enquiry,
  items: [],
  settings: {},
};

export const heroFr: HeroSection = {
  ...base,
  section_key: 'hero',
  sort_order: 20,
  eyebrow: 'LE MOUVEMENT, AVEC UNE MÉTHODE',
  title: 'Une logistique qui vous suit, sans vous ralentir.',
  body: 'Un fournisseur, un départ, plusieurs relais : FreightVanta relie l’approvisionnement, le transport, les documents, le stockage et la livraison dans un même fil de travail. Vous savez où en est votre marchandise et quelle décision vient ensuite.',
  cta_primary_label: 'Échanger avec un expert',
  cta_primary_url: FR_ANCHORS.enquiry,
  cta_secondary_label: 'Découvrir nos solutions',
  cta_secondary_url: FR_ANCHORS.services,
  media_id: 'fr-hero-port',
  media_alt: 'Porte-conteneurs à quai dans un port industriel, sous les portiques, par ciel dégagé.',
  items: [],
  settings: {
    microcopy:
      'Décrivez votre produit, son origine et sa destination. Nous commencerons par les questions qui comptent.',
    route_labels: ['USINE', 'PORT', 'ENTREPÔT', 'CLIENT'],
  },
};

/** Lines of the "carnet d’escales" ledger shown beneath the hero image. */
export const HERO_LEDGER_FR: Array<{ step: string; term: string; detail: string }> = [
  { step: '01', term: 'Origine', detail: 'Fournisseur ou usine en Chine' },
  { step: '02', term: 'Transport', detail: 'Maritime, aérien ou ferroviaire, comparés pour chaque expédition' },
  { step: '03', term: 'Relais', detail: 'Documents douaniers, entrepôt, préparation, livraison' },
  { step: '04', term: 'Résultat', detail: 'Un plan d’expédition avec des responsabilités claires' },
];

export const coverageFr: CoverageSection = {
  ...base,
  section_key: 'coverage',
  sort_order: 30,
  title: 'Nos domaines d’intervention',
  items: [
    { label: 'Sourcing en Chine', href: '/fr/solutions/sourcing-en-chine' },
    { label: 'Fret maritime', href: '/fr/solutions/fret-maritime' },
    { label: 'Fret aérien', href: '/fr/solutions/fret-aerien' },
    { label: 'Coordination douanière', href: '/fr/solutions/coordination-douaniere' },
    { label: 'Entreposage et logistique e-commerce', href: '/fr/solutions/entreposage-et-logistique-e-commerce' },
    { label: 'Livraison du dernier kilomètre', href: '/fr/solutions/transport-routier-et-livraison' },
  ],
  settings: {},
};

export const servicePathsFr: ServicePathsSection = {
  ...base,
  section_key: 'service_paths',
  sort_order: 40,
  eyebrow: 'Ce que nous coordonnons',
  title: 'Des savoir-faire qui se complètent.',
  body: 'Une bonne livraison est une suite de petites décisions bien prises. Nous les rassemblons pour que votre équipe puisse avancer sereinement.',
  items: SERVICES_FR.filter((service) => service.inSelector).map((service) => ({
    id: service.slug,
    label: service.label,
    title: service.title,
    copy: service.copy,
    tags: service.tags,
    link_label: service.linkLabel,
    link_url: `/fr/solutions/${service.slug}`,
    media_id: service.mediaId,
    media_alt: service.mediaAlt,
    starting_point: service.startingPoint,
  })),
  settings: {
    panel_cta_label: 'Voir comment cette prestation s’intègre à votre expédition',
    default_tab: 'sourcing-en-chine',
  },
};

export const operationFr: OperationSection = {
  ...base,
  section_key: 'operation',
  sort_order: 50,
  eyebrow: 'Une opération d’un seul tenant',
  title: 'La maîtrise se voit dans les transitions.',
  cta_primary_label: 'Comment le travail avance',
  cta_primary_url: FR_ANCHORS.process,
  items: [
    {
      title: 'Un fil de conversation',
      copy: 'Les questions fournisseur et les décisions de transport restent rattachées au même dossier.',
    },
    {
      title: 'Un contrôle avant départ',
      copy: 'État, quantité et présentation sont revus avant le prochain relais.',
    },
    {
      title: 'Une information lisible',
      copy: 'Le statut explique ce qui est fait, ce qui manque et qui agit.',
    },
    {
      title: 'Une alerte utile',
      copy: 'Lorsqu’un point change, votre équipe le voit assez tôt pour choisir.',
    },
  ],
  settings: {
    pull_quote: 'Une vue d’ensemble claire, de la première décision produit ou fournisseur jusqu’à la remise au destinataire.',
  },
};

export const processFr: ProcessSection = {
  ...base,
  section_key: 'process',
  sort_order: 60,
  title: 'De la première question à la bonne réception.',
  body: 'Une bonne livraison est une suite de petites décisions bien prises. Nous les rassemblons pour que votre équipe puisse avancer sereinement.',
  items: [
    {
      step: '01',
      title: 'Comprendre',
      copy: 'Produit, volume, origine, destination, date cible et contraintes.',
    },
    {
      step: '02',
      title: 'Proposer',
      copy: 'Chemin de service, documents à réunir, responsabilités et questions ouvertes.',
    },
    {
      step: '03',
      title: 'Coordonner',
      copy: 'Fournisseur, contrôle, emballage, transport, stockage et remise au dernier relais.',
    },
    {
      step: '04',
      title: 'Accompagner',
      copy: 'Tracking et notes d’exception pour préparer la suite avec vos clients ou vos équipes.',
    },
  ],
  settings: {
    closing: '',
  },
};

export const industriesFr: IndustriesSection = {
  ...base,
  section_key: 'industries',
  sort_order: 70,
  title: 'Une attention adaptée à chaque activité.',
  body: 'Des marchandises différentes exigent des contrôles, des documents et des conversations de livraison différents. Le travail commence par la contrainte qui compte le plus pour votre activité.',
  cta_primary_label: 'Voir les solutions par secteur',
  cta_primary_url: '/fr/secteurs',
  media_id: 'fr-industry-featured',
  media_alt: 'Employé d’entrepôt déplaçant des marchandises au chariot élévateur entre les rayonnages.',
  items: INDUSTRIES_FR.map((industry) => ({
    slug: industry.slug,
    name: industry.name,
    copy: industry.copy,
    href: `/fr/secteurs/${industry.slug}`,
  })),
  settings: {
    media_caption: 'Réception et contrôle',
  },
};

export const resourcesFr: ResourcesSection = {
  ...base,
  section_key: 'resources',
  sort_order: 80,
  eyebrow: 'Ressources de planification',
  title: 'Des ressources pour décider avec justesse.',
  body: 'Guides pratiques sur l’import, les Incoterms, le brief fournisseur, la différence entre maritime et aérien, et les contrôles à prévoir avant expédition.',
  cta_primary_label: 'Consulter les guides',
  cta_primary_url: '/fr/guides',
  items: [
    { label: 'Préparer un import', href: '/fr/guides/check-list-import-france' },
    { label: 'Choisir maritime ou aérien', href: '/fr/guides/maritime-aerien-ou-ferroviaire' },
    { label: 'Brief fournisseur', href: '/fr/guides/preparer-un-brief-sourcing-chine' },
    { label: 'Emballage et inserts', href: '/fr/guides/guide-emballage-et-inserts' },
  ],
  settings: {
    heading_url: '/fr/guides',
    article_limit: 3,
    topics_label: 'Commencer par un sujet',
  },
};

export const faqFr: FaqSection = {
  ...base,
  section_key: 'faq',
  sort_order: 90,
  title: 'Des questions avant d’expédier ?',
  items: [
    {
      id: 'lien-produit',
      question: 'Puis-je commencer avec une simple URL produit ?',
      answer:
        'Oui. Un lien, une photo ou une courte fiche permet d’ouvrir l’échange.',
    },
    {
      id: 'sourcing-logistique',
      question: 'Proposez-vous une seule étape ou un parcours complet ?',
      answer:
        'Les deux : le formulaire permet de sélectionner sourcing, transport, stockage, marque, fulfilment ou une combinaison.',
    },
    {
      id: 'maritime-aerien',
      question: 'Gérez-vous le dédouanement ?',
      answer:
        'Nous préparons les informations et les relais ; le courtier et la juridiction doivent être confirmés pour chaque dossier.',
    },
    {
      id: 'douane',
      question: 'Que faut-il indiquer dans la demande ?',
      answer:
        'Origine, destination, quantité, produit, échéance souhaitée et documents déjà disponibles.',
    },
    {
      id: 'entreposage-france',
      question: 'Proposez-vous entreposage et logistique e-commerce en France ?',
      answer:
        'Indiquez-nous vos exigences de réception, de stockage, de préparation et de libération. Le périmètre opérationnel disponible est confirmé dans le plan avant tout mouvement de stock.',
    },
    {
      id: 'prestation-unique',
      question: 'Puis-je ne demander qu’une seule prestation ?',
      answer:
        'Oui. Vous pouvez commencer par le sourcing, le transport, le stockage, l’emballage, la logistique e-commerce ou un plan combiné. Le formulaire vous laisse choisir le point de départ.',
    },
  ],
  settings: {
    aside_prompt: 'Votre question n’apparaît pas ? Partez de ce que vous savez : un spécialiste vous aidera pour le reste.',
    aside_link_label: 'Dites-nous ce qui doit voyager',
    aside_link_url: FR_ANCHORS.enquiry,
  },
};

export const enquiryFr: EnquirySection = {
  ...base,
  section_key: 'enquiry',
  sort_order: 100,
  eyebrow: 'Parler à un expert',
  title: 'Votre prochaine expédition mérite mieux qu’une suite d’e-mails. Parlons-en et construisons un plan lisible.',
  body: 'Décrivez votre produit, son origine et sa destination. Un spécialiste FreightVanta examine les détails et revient vers vous avec la prochaine étape adaptée.',
  items: [],
  settings: {
    button: 'Demander un échange',
    loading: 'Envoi de votre demande…',
    success_title: 'Merci, votre demande est en route.',
    success_body: 'Un spécialiste FreightVanta examine les détails et reviendra vers vous avec la prochaine étape adaptée.',
    error:
      'Nous n’avons pas encore pu envoyer la demande. Vérifiez les champs signalés et réessayez, ou contactez-nous grâce aux coordonnées ci-dessous.',
    reassurance: [
      'Nous ne demandons que ce qui est nécessaire à un premier plan d’expédition ; les champs obligatoires sont marqués d’un *.',
      'Un lien produit, une photo ou un cahier des charges succinct suffit pour une première conversation de sourcing.',
      'Vous pouvez commencer par une seule prestation ou un plan combiné ; le périmètre définitif est confirmé dans le plan d’expédition.',
    ],
    consent_prefix:
      'J’ai pris connaissance de la politique de confidentialité et j’accepte que FreightVanta traite mes données pour étudier ma demande et me recontacter. Je peux retirer ce consentement à tout moment. Consulter la',
    consent_link_label: 'politique de confidentialité',
    consent_suffix: '.',
  },
};

export const footerFr: FooterSection = {
  ...base,
  section_key: 'footer',
  sort_order: 110,
  body: 'FreightVanta · Solutions · Secteurs · Ressources · Contact · Confidentialité · Mentions légales.',
  cta_primary_label: 'Demander un plan d’expédition',
  cta_primary_url: FR_ANCHORS.enquiry,
  items: [
    { key: 'brand', title: 'FreightVanta' },
    { key: 'solutions', title: 'Solutions' },
    { key: 'industries', title: 'Secteurs et guides' },
    { key: 'contact', title: 'Contact et mentions légales' },
  ],
  settings: {},
};

export const HOME_SECTIONS_FR: HomeSection[] = [
  announcementFr,
  heroFr,
  coverageFr,
  servicePathsFr,
  operationFr,
  processFr,
  industriesFr,
  resourcesFr,
  faqFr,
  enquiryFr,
  footerFr,
];

export function getPublishedHomeSectionsFr(): HomeSection[] {
  return HOME_SECTIONS_FR.filter((section) => section.enabled && section.published_version > 0).sort((a, b) => a.sort_order - b.sort_order);
}

export const HOME_META_FR = {
  title: 'FreightVanta France | Sourcing, transport et fulfilment international',
  description:
    'FreightVanta relie sourcing, transport maritime et aérien, préparation documentaire, stockage et fulfilment dans un parcours clair.',
  path: '/fr/',
};
