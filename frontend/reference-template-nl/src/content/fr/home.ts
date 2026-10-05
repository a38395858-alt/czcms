/**
 * Page d'accueil française — données de sections localisées.
 * Structure conforme au contrat de sections partagé (../types.ts) ; le contenu appartient à ce site.
 * Personnalité du gabarit : « Affiche Atlantique » — crème, encre, bleu de France, safran.
 * Typographie française : espaces fines insécables (\u202f) avant ? ! : et « guillemets ».
 */
import type { StartingPointValue } from '../types';

export const FR_META = {
  title: 'Sourcing en Chine, fret international & fulfillment | FreightVanta',
  description:
    'FreightVanta coordonne le sourcing de produits en Chine, le fret maritime et aérien, la préparation des expéditions, l’entreposage, le fulfillment et la livraison vers la France dans un plan d’expédition exploitable.',
  path: '/fr/',
  lang: 'fr-FR',
};

export const frAnnouncement = {
  body: 'Du fret vers la France ou l’Union européenne\u202f? Demandez un plan d’expédition à un spécialiste logistique.',
  cta_label: 'Demander un plan d’expédition',
  cta_url: '/fr/demande',
};

export const frNav = [
  { label: 'Prestations', href: '/fr/prestations' },
  { label: 'Déroulement', href: '/fr/deroulement' },
  { label: 'Secteurs', href: '/fr/secteurs' },
  { label: 'Ressources', href: '/fr/ressources' },
  { label: 'FAQ', href: '/fr/questions' },
  { label: 'Contact', href: '/fr/demande' },
];

export const frHero = {
  eyebrow: 'Sourcing & fret, clairement coordonnés',
  title: 'Du sourcing en Chine à la livraison en France, chaque passage de relais reste lisible.',
  body: 'FreightVanta aide les entreprises en croissance à coordonner le sourcing produit, la préparation des expéditions, le fret maritime et aérien, les informations douanières, l’entreposage, le fulfillment et la livraison finale dans un plan opérationnel unique.',
  cta_primary_label: 'Demander un plan d’expédition',
  cta_primary_url: '/fr/demande',
  cta_secondary_label: 'Découvrir les prestations',
  cta_secondary_url: '/fr/prestations',
  microcopy:
    'Commencez par un lien produit, un brief d’expédition ou l’itinéraire à planifier. Nous vous aidons à identifier la prochaine étape utile.',
  route_labels: ['ORIGINE', 'PORT', 'ENTREPÔT', 'CLIENT'],
  media_id: 'fr-hero-port',
  media_alt: 'Conteneurs colorés et portiques dans un port de commerce en pleine activité.',
  media_caption: 'Planche n° 1 · Port de commerce, portiques et conteneurs',
};

export const frCoverage = [
  'Sourcing de produits en Chine',
  'Fret maritime',
  'Fret aérien',
  'Coordination douanière',
  'Entreposage & fulfillment',
  'Livraison du dernier kilomètre',
];

export interface FrService {
  id: string;
  label: string;
  title: string;
  copy: string;
  tags: string[];
  starting_point: StartingPointValue | null;
  detail_url: string;
}

export const frServices: FrService[] = [
  {
    id: 'sourcing',
    label: 'Sourcing produit',
    title: 'Trouver le bon chemin produit.',
    copy: 'Partagez un lien produit, une photo, une spécification ou un coût cible. Nous aidons à organiser les questions fournisseurs, les critères de comparaison, les échantillons et les détails d’achat à clarifier avant le prochain passage de relais.',
    tags: ['Sourcing Chine', 'Brief fournisseur', 'Coordination des échantillons'],
    starting_point: 'product-sourcing',
    detail_url: '/solutions/product-sourcing',
  },
  {
    id: 'maritime',
    label: 'Fret maritime',
    title: 'Planifier l’étape économique.',
    copy: 'Pour le fret consolidé ou en conteneur, nous aidons à aligner la disponibilité de la marchandise, les documents d’export, les passages portuaires et le plan de livraison. Le brief montre ce qui est inclus, quelles décisions restent ouvertes et qui porte la prochaine action.',
    tags: ['FCL', 'LCL', 'Port à porte'],
    starting_point: 'ocean-freight',
    detail_url: '/solutions/ocean-freight',
  },
  {
    id: 'aerien',
    label: 'Fret aérien',
    title: 'Protéger l’étape urgente.',
    copy: 'Quand un lancement, un réassort ou une commande urgente ne peut pas attendre le prochain cycle maritime, nous comparons les options aériennes réalistes et organisons l’enlèvement, les documents d’expédition et les passages de livraison.',
    tags: ['Express', 'Standard', 'Réassort urgent'],
    starting_point: 'air-freight',
    detail_url: '/solutions/air-freight',
  },
  {
    id: 'douane',
    label: 'Coordination douanière',
    title: 'Préparer les documents en amont.',
    copy: 'Nous aidons à rassembler factures commerciales, listes de colisage et informations d’expédition afin que les questions apparaissent avant que la marchandise n’atteigne le prochain point de contrôle. Le classement tarifaire définitif et le dédouanement relèvent de l’autorité compétente et du représentant en douane responsable.',
    tags: ['Informations d’expédition', 'Documents prêts', 'Appui aux passages'],
    starting_point: 'not-sure',
    detail_url: '/solutions/customs-coordination',
  },
  {
    id: 'entreposage',
    label: 'Entreposage & fulfillment',
    title: 'Réceptionner, contrôler, expédier avec méthode.',
    copy: 'Les stocks peuvent être réceptionnés, contrôlés, consolidés, entreposés et préparés pour la destination que vous validez. Le brief garde les instructions produit, emballage et libération attachées à la commande.',
    tags: ['Consolidation', 'Stockage', 'Préparation de commandes'],
    starting_point: 'warehousing-fulfillment',
    detail_url: '/solutions/warehousing-fulfillment',
  },
  {
    id: 'emballage',
    label: 'Emballage & branding',
    title: 'Faire du colis votre colis.',
    copy: 'Coordonnez les encarts, autocollants, étiquettes, sachets, boîtes et autres éléments de marque validés dans le cadre du brief fulfillment. Maquettes, quantités et étapes de production sont confirmées avant utilisation.',
    tags: ['Encarts', 'Étiquettes', 'Préparation marque propre'],
    starting_point: 'packaging-branding',
    detail_url: '/solutions/packaging-branding',
  },
];

export const frServicesSection = {
  kicker: 'N° 1 · Ce que nous coordonnons',
  title: 'Une vue d’ensemble, du fournisseur au client.',
  body: 'Votre expédition suit rarement une seule étape. Nous relions sourcing, préparation, transport, douane, stockage et livraison en un déroulé que votre équipe peut suivre.',
  panel_cta_label: 'Inclure cette prestation dans le plan',
  detail_link_label: 'Page détaillée (EN)',
};

export const frOperation = {
  kicker: 'N° 2 · Une opération reliée',
  title: 'La fiabilité se construit dans les détails.',
  pull_quote: '« Une vue d’ensemble claire — de la première décision produit jusqu’à la remise au client. »',
  items: [
    {
      title: 'Un interlocuteur désigné',
      copy: 'Une seule personne garde la demande, les questions fournisseurs, les notes d’expédition et la prochaine action dans le même fil de travail.',
    },
    {
      title: 'Des contrôles avant départ',
      copy: 'État du produit, quantités et consignes d’emballage convenues sont confirmés avant que la marchandise ne quitte l’entrepôt.',
    },
    {
      title: 'Une préparation flexible',
      copy: 'Consolider des commandes, séparer des destinations ou conserver du stock — selon le plan validé par votre équipe.',
    },
    {
      title: 'Des relais traçables',
      copy: 'Références transporteurs et notes de statut restent réunies, pour voir ce qui a changé et ce qui suit.',
    },
  ],
};

export const frProcess = {
  kicker: 'N° 3 · Déroulement',
  title: 'Une méthode concrète pour un fret complexe.',
  body: 'L’objectif n’est pas de faire paraître la logistique simple, mais de garder visibles la prochaine décision, le prochain document et le prochain relais — avant qu’ils ne deviennent un retard.',
  steps: [
    {
      step: '01',
      title: 'Dites-nous ce qui doit voyager.',
      copy: 'Liens produits, quantités, origine, destination, date cible et exigences d’emballage ou de conformité.',
    },
    {
      step: '02',
      title: 'Examinez le plan.',
      copy: 'Nous clarifions la prestation proposée, les questions ouvertes, les documents requis et les responsabilités avant de commencer.',
    },
    {
      step: '03',
      title: 'Chaque relais est coordonné.',
      copy: 'Sourcing, achat, contrôle, préparation, fret, stockage et livraison suivent un même dossier de travail.',
    },
    {
      step: '04',
      title: 'Tenez votre promesse client.',
      copy: 'Recevez le suivi et les notes d’exception dont votre équipe a besoin pour piloter stocks et communication client.',
    },
  ],
  closing: 'Si une hypothèse change, le plan doit montrer le changement — au lieu de l’enfouir dans une longue chaîne d’e-mails.',
};

export const frIndustries = {
  kicker: 'N° 4 · Secteurs',
  title: 'Pour les équipes qui ont quelque chose à perdre au passage de relais.',
  body: 'Chaque marchandise exige ses contrôles, ses documents et ses conversations de livraison. Le travail commence par la contrainte qui compte le plus pour votre activité.',
  detail_label: 'Page secteur (EN)',
  items: [
    {
      slug: 'cross-border-ecommerce',
      name: 'E-commerce & distribution',
      copy: 'Réassorts, lots, préparation marketplace et emballages spécifiques restent organisés du fournisseur au client.',
      href: '/industries/cross-border-ecommerce',
    },
    {
      slug: 'consumer-goods',
      name: 'Biens de consommation',
      copy: 'Détails produit, contrôles qualité, préparation du lancement et présentation sont coordonnés du fournisseur au rayon ou au domicile.',
      href: '/industries/consumer-goods',
    },
    {
      slug: 'industrial-components',
      name: 'Composants industriels',
      copy: 'Le travail s’appuie sur les spécifications, la documentation, les exigences de réception et un plan clair pour le prochain relais de production ou de service.',
      href: '/industries/industrial-components',
    },
    {
      slug: 'time-critical-cargo',
      name: 'Fret urgent',
      copy: 'Le prochain mouvement réalisable est prioritaire, et les exceptions deviennent visibles tôt quand le délai ne peut pas attendre.',
      href: '/industries/time-critical-cargo',
    },
  ],
};

export const frResources = {
  kicker: 'N° 5 · Ressources',
  title: 'Des repères pour mieux décider.',
  body: 'Des guides pratiques sur le sourcing en Chine, le fret international, la préparation des importations, les Incoterms et la coordination fournisseurs — pour les décisions entre «\u00a0commandé\u00a0» et «\u00a0livré\u00a0».',
  note: 'Nos guides paraissent d’abord en anglais\u202f; les versions françaises suivront. Les liens ci-dessous ouvrent l’édition anglaise.',
  topics: [
    { label: 'Check-list de planification d’importation (EN)', href: '/guides/import-planning-checklist' },
    { label: 'Fret maritime ou fret aérien\u202f? (EN)', href: '/guides/ocean-or-air-freight' },
    { label: 'Préparer un brief de sourcing en Chine (EN)', href: '/guides/china-sourcing-brief' },
    { label: 'Guide emballages et encarts (EN)', href: '/guides/packaging-insert-guide' },
    { label: 'Les Incoterms en langage clair (EN)', href: '/guides/incoterms-handoffs' },
  ],
  cta_label: 'Voir le centre de ressources (EN)',
  cta_url: '/guides',
};

export const frFaq = {
  kicker: 'N° 6 · Questions fréquentes',
  title: 'Des questions avant de vous lancer\u202f?',
  aside_prompt: 'Votre question n’apparaît pas ici\u202f? Commencez avec ce que vous savez — un spécialiste vous aidera pour le reste.',
  aside_link_label: 'Dites-nous ce qui doit voyager',
  aside_link_url: '/fr/demande',
  items: [
    {
      id: 'lien-produit',
      question: 'Puis-je commencer avec un simple lien produit\u202f?',
      answer:
        'Oui. Un lien produit, une photo ou une spécification courte suffit pour une première conversation de sourcing. Quantités, destination et calendrier peuvent suivre à mesure que le plan se précise.',
    },
    {
      id: 'sourcing-fulfillment',
      question: 'Pouvez-vous combiner sourcing et fulfillment\u202f?',
      answer:
        'Cette page présente sourcing, préparation, fret, stockage et fulfillment comme un déroulé relié. Le périmètre définitif est confirmé dans le plan d’expédition.',
    },
    {
      id: 'maritime-aerien',
      question: 'Accompagnez-vous le fret maritime et le fret aérien\u202f?',
      answer:
        'Oui. Dites-nous ce qui doit voyager, sous quel délai, et ce qui compte le plus pour l’expédition. Nous pourrons discuter de la prestation réaliste et du prochain relais.',
    },
    {
      id: 'douane',
      question: 'Assurez-vous le dédouanement\u202f?',
      answer:
        'Nous coordonnons les informations d’expédition et les passages de documents. Le représentant en douane responsable, la juridiction, le classement tarifaire et le périmètre formel du dédouanement doivent être identifiés avant tout engagement.',
    },
    {
      id: 'entrepot-france',
      question: 'Proposez-vous entreposage et fulfillment en France\u202f?',
      answer:
        'Indiquez-nous vos exigences de réception, de stockage, de préparation et de libération. Le périmètre opérationnel disponible doit être confirmé dans le plan avant tout mouvement de stock.',
    },
    {
      id: 'prestation-unique',
      question: 'Puis-je ne demander qu’une seule prestation\u202f?',
      answer:
        'Oui. Vous pouvez commencer par le sourcing, le transport, le stockage, l’emballage, le fulfillment ou un plan combiné. Le formulaire vous laisse choisir le point de départ.',
    },
  ],
};

export const frEnquiry = {
  kicker: 'N° 7 · Demande de plan d’expédition',
  form_tag: 'Billet de demande · Plan d’expédition',
  title: 'Dites-nous ce que vous devez expédier. Nous transformons les pièces détachées en un plan exploitable par votre équipe.',
  body: 'Commencez par le produit, l’itinéraire ou le résultat de livraison recherché. Un spécialiste FreightVanta examinera les détails et reviendra vers vous avec la bonne prochaine étape.',
  reassurance: [
    'Un lien produit, une photo ou une spécification courte suffit pour une première conversation de sourcing.',
    'Vous pouvez commencer par le sourcing, le transport, le stockage, l’emballage, le fulfillment ou un plan combiné.',
    'Le périmètre définitif est confirmé dans le plan d’expédition.',
  ],
  copy: {
    button: 'Demander un plan d’expédition',
    loading: 'Envoi de votre demande…',
    success_title: 'Merci — votre demande est en route.',
    success_body: 'Un spécialiste FreightVanta examinera les détails et reviendra vers vous avec la bonne prochaine étape.',
    error:
      'La demande n’a pas encore pu être envoyée. Vérifiez les champs signalés et réessayez, ou utilisez les coordonnées ci-dessous.',
    reassurance: [],
    consent_prefix:
      'J’accepte que FreightVanta utilise ces informations pour examiner ma demande et me recontacter, comme décrit dans la',
    consent_link_label: 'politique de confidentialité',
    consent_suffix: '.',
  },
};

export const frFooter = {
  tagline: 'Un plan exploitable, des responsabilités claires et des mises à jour sur lesquelles agir.',
  cta_label: 'Demander un plan d’expédition',
  cta_url: '/fr/demande',
  columns: {
    services: 'Prestations',
    site: 'Navigation',
    legal: 'Contact & mentions',
  },
  legal_links: [
    { label: 'Mentions légales', href: '/fr/mentions-legales' },
    { label: 'Politique de confidentialité', href: '/fr/confidentialite' },
  ],
  language_label: 'Langue',
  cookie_settings: 'Préférences cookies',
  rights: 'Tous droits réservés.',
  locale_tag: 'Français · France',
};
