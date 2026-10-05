import type { StartingPointValue } from '../types';

export interface ServiceContentFr {
  slug: string;
  navLabel: string;
  label: string;
  menuLine: string;
  title: string;
  copy: string;
  tags: string[];
  linkLabel: string;
  mediaId: string;
  mediaAlt: string;
  startingPoint: StartingPointValue | null;
  inSelector: boolean;
  share: string[];
  clarify: string[];
  scopeNote?: string;
  relatedGuides: string[];
}

export const SERVICES_FR: ServiceContentFr[] = [
  {
    slug: 'sourcing-en-chine',
    navLabel: 'Sourcing en Chine',
    label: 'Sourcing en Chine',
    menuLine: 'Brief fournisseur, comparaison et échantillons',
    title: 'Partir du bon produit.',
    copy: 'Envoyez un lien, une photo ou une fiche. Notre équipe peut rechercher des fournisseurs adaptés en Chine, comparer les options et préparer les questions d’échantillonnage ou d’achat.',
    tags: ['Sourcing en Chine', 'Brief fournisseur', 'Coordination des échantillons'],
    linkLabel: 'Découvrir le sourcing en Chine',
    mediaId: 'fr-service-sourcing',
    mediaAlt: 'Échantillons de produits, nuanciers et documents sur une table de travail lors d’une sélection de fournisseurs.',
    startingPoint: 'product-sourcing',
    inSelector: true,
    share: [
      'Un lien produit, une photo ou un cahier des charges succinct',
      'Le prix cible et les quantités envisagées',
      'Le marché de destination et la date souhaitée',
      'Les exigences déjà connues en matière d’emballage, d’étiquetage ou de conformité (marquage CE, par exemple)',
    ],
    clarify: [
      'Les questions aux fournisseurs à trancher avant l’achat',
      'Les critères de comparaison qui comptent pour votre produit',
      'Les attentes vis-à-vis des échantillons et la personne qui les valide',
      'Les détails d’achat à confirmer avant le passage de relais suivant',
    ],
    relatedGuides: ['preparer-un-brief-sourcing-chine', 'guide-emballage-et-inserts'],
  },
  {
    slug: 'fret-maritime',
    navLabel: 'Fret maritime',
    label: 'Fret maritime',
    menuLine: 'FCL, LCL et planification port-à-porte',
    title: 'Donner du rythme au volume.',
    copy: 'Pour le groupage ou le conteneur, nous alignons disponibilité, préparation, informations d’expédition et relais jusqu’à la destination prévue.',
    tags: ['FCL', 'LCL', 'Port-à-porte'],
    linkLabel: 'Découvrir le fret maritime',
    mediaId: 'fr-service-maritime',
    mediaAlt: 'Porte-conteneurs à quai sous les portiques d’un terminal portuaire.',
    startingPoint: 'ocean-freight',
    inSelector: true,
    share: [
      'La date de disponibilité de la marchandise et le lieu d’enlèvement',
      'Le nombre de colis, les dimensions et le poids',
      'L’adresse ou le port de destination',
      'L’Incoterm convenu avec le fournisseur, s’il est connu',
    ],
    clarify: [
      'Ce que le plan inclut et les décisions encore ouvertes',
      'Les documents d’export et les relais portuaires',
      'Qui porte chaque étape suivante',
      'Le plan de livraison après le port, post-acheminement compris',
    ],
    relatedGuides: ['maritime-aerien-ou-ferroviaire', 'incoterms-2020-en-clair'],
  },
  {
    slug: 'fret-aerien',
    navLabel: 'Fret aérien',
    label: 'Fret aérien',
    menuLine: 'Express, standard et réassort urgent',
    title: 'Protéger une échéance importante.',
    copy: 'Pour une relance, un lancement ou une commande urgente, nous étudions un chemin aérien cohérent avec le produit et les documents disponibles.',
    tags: ['Express', 'Standard', 'Réassort urgent'],
    linkLabel: 'Découvrir le fret aérien',
    mediaId: 'fr-service-aerien',
    mediaAlt: 'Assistance au sol d’un avion au terminal, avec les véhicules de piste.',
    startingPoint: 'air-freight',
    inSelector: true,
    share: [
      'Ce que l’expédition protège : lancement, réassort ou commande urgente',
      'La date de disponibilité, les dimensions et le poids',
      'Les lieux d’enlèvement et de livraison',
      'Les marchandises nécessitant une manutention ou des documents particuliers (batteries, par exemple)',
    ],
    clarify: [
      'Les options aériennes réalistes pour la date qui compte',
      'Le moment de l’enlèvement et les documents d’expédition',
      'Les relais de livraison à destination',
      'Ce qui se passe si une date ou une hypothèse change',
    ],
    relatedGuides: ['maritime-aerien-ou-ferroviaire', 'check-list-import-france'],
  },
  {
    slug: 'transport-routier-et-livraison',
    navLabel: 'Transport routier et livraison',
    label: 'Transport routier et livraison',
    menuLine: 'Pré- et post-acheminement, réception, remise',
    title: 'Terminer le trajet en pensant au destinataire.',
    copy: 'Une fois la marchandise libérée, le dernier tronçon mérite son propre plan : moment de l’enlèvement, exigences de réception, prise de rendez-vous et créneau, et personne qui confirme la livraison. Nous gardons ces détails attachés à l’expédition pour que la remise à votre entrepôt, votre magasin ou votre client soit planifiée plutôt qu’improvisée.',
    tags: ['Coordination des enlèvements', 'Exigences de réception', 'Remise au destinataire'],
    linkLabel: 'Découvrir le transport routier et la livraison',
    mediaId: 'fr-service-livraison',
    mediaAlt: 'Cartons sur un diable dans l’espace de chargement d’un véhicule de livraison.',
    startingPoint: null,
    inSelector: false,
    share: [
      'L’adresse de livraison, les horaires de réception et un contact sur place',
      'Les exigences de rendez-vous, de quai ou de matériel (hayon, par exemple)',
      'Le nombre de colis ou de palettes et le poids',
      'La personne qui confirme la réception à destination',
    ],
    clarify: [
      'Le moment de l’enlèvement après la libération',
      'Les exigences de réception que la livraison doit respecter',
      'La confirmation de livraison et les notes d’exception',
      'Qui est contacté en cas de changement',
    ],
    relatedGuides: ['check-list-import-france', 'maritime-aerien-ou-ferroviaire'],
  },
  {
    slug: 'coordination-douaniere',
    navLabel: 'Coordination douanière',
    label: 'Coordination douanière',
    menuLine: 'Facture commerciale, liste de colisage, documents prêts',
    title: 'Préparer les documents avant le départ.',
    copy: 'Facture, colisage et données produit sont rassemblés au même endroit. La classification et le dédouanement restent soumis à votre courtier et aux autorités compétentes.',
    tags: ['Informations d’expédition', 'Documents prêts', 'Appui aux relais'],
    linkLabel: 'Découvrir la coordination douanière',
    mediaId: 'fr-service-douane',
    mediaAlt: 'Documents d’expédition, ordinateur portable et cartons sur un bureau lors de la préparation des dossiers.',
    startingPoint: 'not-sure',
    inSelector: true,
    share: [
      'La facture commerciale et la liste de colisage',
      'La description des marchandises, leurs matières et leur usage',
      'Les coordonnées du fournisseur et du destinataire, dont le numéro EORI de l’importateur',
      'Votre représentant en douane actuel, le cas échéant',
    ],
    clarify: [
      'Les informations d’expédition encore manquantes',
      'Les questions documentaires à régler avant le prochain point de contrôle',
      'Qui est responsable du classement tarifaire (nomenclature) et de la déclaration en douane',
      'Les relais entre fournisseur, équipe fret et représentant en douane',
    ],
    scopeNote:
      'Nous coordonnons les informations d’expédition et les relais documentaires. Le représentant en douane enregistré (RDE), le périmètre, le classement tarifaire et l’étendue formelle du dédouanement doivent être définis avant tout engagement. Droits de douane et TVA à l’importation relèvent des règles de la DGDDI ; le mécanisme d’autoliquidation de la TVA à l’import s’applique selon la situation de l’importateur.',
    relatedGuides: ['check-list-import-france', 'incoterms-2020-en-clair'],
  },
  {
    slug: 'entreposage-et-logistique-e-commerce',
    navLabel: 'Entreposage et logistique e-commerce',
    label: 'Entreposage et logistique e-commerce',
    menuLine: 'Groupage, stockage et préparation de commandes',
    title: 'Contrôler avant de remettre en mouvement.',
    copy: 'Réception, contrôle, regroupement, emballage et expédition peuvent suivre une seule consigne. Les commandes multi-articles et les colis neutres sont traités selon le brief approuvé.',
    tags: ['Groupage', 'Stockage', 'Préparation de commandes'],
    linkLabel: 'Découvrir l’entreposage',
    mediaId: 'fr-service-entrepot',
    mediaAlt: 'Employé d’entrepôt portant un carton dans une allée de stockage bien organisée.',
    startingPoint: 'warehousing-fulfillment',
    inSelector: true,
    share: [
      'Ce qui arrive, de quels fournisseurs et quand',
      'Les contrôles à effectuer à la réception',
      'Les consignes de stockage, de groupage ou de libération',
      'Les destinations et les exigences de préparation des commandes',
    ],
    clarify: [
      'Les étapes de réception et de contrôle avant le stockage',
      'Comment les commandes sont groupées, séparées ou mises en attente',
      'Les consignes produit, emballage et libération attachées à chaque commande',
      'Le périmètre opérationnel, confirmé avant tout mouvement de stock',
    ],
    scopeNote:
      'Indiquez-nous vos exigences de réception, de stockage, de préparation et de libération. Le périmètre opérationnel disponible est confirmé dans le plan avant tout mouvement de stock.',
    relatedGuides: ['guide-emballage-et-inserts', 'check-list-import-france'],
  },
  {
    slug: 'emballage-et-image-de-marque',
    navLabel: 'Emballage et image de marque',
    label: 'Emballage et image de marque',
    menuLine: 'Inserts, étiquettes et emballage de marque',
    title: 'Faire arriver votre marque avec le produit.',
    copy: 'Cartes, stickers, étiquettes, sacs ou boîtes personnalisés sont préparés après validation du visuel, de la quantité et de la séquence de production.',
    tags: ['Inserts', 'Étiquettes', 'Préparation marque de distributeur'],
    linkLabel: 'Découvrir l’emballage et l’image de marque',
    mediaId: 'fr-service-emballage',
    mediaAlt: 'Une personne glisse une carte de remerciement avec un t-shirt plié dans un carton d’expédition.',
    startingPoint: 'packaging-branding',
    inSelector: true,
    share: [
      'Les fichiers graphiques et la charte de marque',
      'Les quantités d’inserts, d’autocollants, d’étiquettes, de sachets ou de boîtes',
      'Les consignes de placement par référence (SKU)',
      'La personne qui valide les échantillons avant utilisation',
    ],
    clarify: [
      'Les éléments de marque qui font partie du brief logistique',
      'Les fichiers, quantités et étapes de production à confirmer',
      'Des consignes de placement qu’un préparateur peut suivre',
      'Les points de validation avant l’emballage, y compris l’adhésion à un éco-organisme (REP emballages) et le logo Triman avec l’Info-tri',
    ],
    relatedGuides: ['guide-emballage-et-inserts', 'preparer-un-brief-sourcing-chine'],
  },
  {
    slug: 'marque-de-distributeur',
    navLabel: 'Marque de distributeur et marque blanche',
    label: 'Marque de distributeur et marque blanche',
    menuLine: 'Cahier des charges, fichiers et validation des échantillons',
    title: 'Faire d’un produit sourcé votre produit.',
    copy: 'Quand un produit porte votre marque, le brief exige plus qu’un fichier logo. Nous vous aidons à organiser le cahier des charges, les validations graphiques, les détails d’emballage et d’étiquetage et la validation des échantillons pour que le fournisseur, l’équipe de préparation et le plan de fret travaillent sur la même version.',
    tags: ['Cahier des charges', 'Validation graphique', 'Validation des échantillons'],
    linkLabel: 'Découvrir la marque de distributeur',
    mediaId: 'fr-service-mdd',
    mediaAlt: 'Échantillons de matières et carnet sur une table lors du développement d’un produit.',
    startingPoint: 'product-sourcing',
    inSelector: false,
    share: [
      'Le produit à marquer, ou un lien vers un produit comparable',
      'Le logo, les fichiers graphiques et la charte de marque',
      'Les exigences d’emballage et d’étiquetage pour votre marché (mentions obligatoires en français, par exemple)',
      'Les quantités cibles et la date de lancement',
    ],
    clarify: [
      'Marque blanche (produit existant sous votre marque) ou marque de distributeur (adapté à votre cahier des charges)',
      'Les versions graphiques et la personne qui les valide',
      'La validation des échantillons avant production',
      'Les étapes d’emballage, d’étiquetage et de préparation avant le fret',
    ],
    relatedGuides: ['preparer-un-brief-sourcing-chine', 'guide-emballage-et-inserts'],
  },
];

export const getServiceFr = (slug: string) => SERVICES_FR.find((service) => service.slug === slug) ?? null;
