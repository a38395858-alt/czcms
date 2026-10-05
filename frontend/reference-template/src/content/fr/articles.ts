/**
 * Guides en français. La page d’accueil affiche les trois articles *publiés* les plus récents ;
 * les brouillons ne sont jamais rendus. En production, la requête CMS remplace ce module.
 */
import type { Article, ArticleSection } from '../en-global/articles';

export interface ArticleFr extends Omit<Article, 'locale'> {
  locale: 'fr';
  sections: ArticleSection[];
}

const ARTICLES_FR: ArticleFr[] = [
  {
    slug: 'check-list-import-france',
    locale: 'fr',
    status: 'published',
    title: 'Importer de Chine en France : la check-list avant de réserver',
    excerpt:
      'La plupart des retards sont visibles tôt quand quelqu’un regarde. Cette check-list aide à clarifier documents, responsabilités et détails de réception avant que la marchandise ne quitte le fournisseur.',
    category: 'Préparation à l’import',
    publishedAt: '2026-09-25',
    readMinutes: 8,
    coverId: 'fr-guide-checklist',
    coverAlt: 'Une main gantée écrit sur un porte-bloc au milieu de cartons emballés.',
    sections: [
      {
        heading: 'Produit et fournisseur',
        blocks: [
          {
            type: 'list',
            items: [
              'Description définitive des marchandises, matières et quantités',
              'Nom du fournisseur, adresse d’enlèvement et date de disponibilité',
              'Nombre de colis, dimensions et poids',
              'Exigences de marquage ou d’étiquetage propres au produit',
            ],
          },
        ],
      },
      {
        heading: 'Données douanières',
        blocks: [
          {
            type: 'p',
            text: 'Pour importer dans l’Union européenne, l’importateur a besoin d’un numéro EORI ; en France, il s’obtient auprès de la douane (DGDDI). Clarifiez aussi la nomenclature (code SH / TARIC), la valeur en douane et l’origine des marchandises : c’est de là que découlent les droits de douane et la TVA à l’importation.',
          },
          {
            type: 'p',
            text: 'Depuis 2022, la TVA à l’importation est en principe autoliquidée sur la déclaration de TVA de l’importateur assujetti, ce qui suppose un numéro de TVA intracommunautaire français valide. Le classement tarifaire et la déclaration en douane relèvent du représentant en douane enregistré (RDE) : désignez-le avant de réserver l’expédition.',
          },
        ],
      },
      {
        heading: 'Documents commerciaux',
        blocks: [
          {
            type: 'p',
            text: 'La facture commerciale et la liste de colisage doivent concorder entre elles et avec la marchandise. Partagez-les tôt pour que les questions surgissent avant le prochain point de contrôle.',
          },
          {
            type: 'list',
            items: [
              'Facture commerciale avec description, valeurs et Incoterm',
              'Liste de colisage avec colis, dimensions et poids',
              'Documents de transport (connaissement ou lettre de transport aérien)',
              'Le cas échéant, justificatifs d’origine ou documents de conformité',
            ],
          },
        ],
      },
      {
        heading: 'Conformité des produits en France et dans l’UE',
        blocks: [
          {
            type: 'p',
            text: 'Selon le produit, des exigences propres s’appliquent : marquage CE, personne responsable établie dans l’UE au titre du règlement sur la sécurité générale des produits (RSGP/GPSR), obligations de responsabilité élargie du producteur (REP) pour les emballages, les équipements électriques et électroniques ou les piles, logo Triman et Info-tri, et mentions obligatoires en français (loi Toubon). Déterminez tôt qui porte ces obligations.',
          },
          {
            type: 'note',
            text: 'Ce guide est une orientation générale et non un conseil juridique ou douanier. Les informations faisant foi sont celles de la douane, des autorités compétentes et de vos conseils.',
          },
        ],
      },
      {
        heading: 'Responsabilités et Incoterms',
        blocks: [
          {
            type: 'p',
            text: 'Convenez de l’Incoterm avec votre fournisseur et notez qui réserve, paie et assure chaque tronçon. Si la règle et le plan ne concordent pas, corrigez avant l’enlèvement.',
          },
        ],
      },
      {
        heading: 'Destination et réception',
        blocks: [
          {
            type: 'list',
            items: [
              'Adresse de livraison, horaires de réception et contact',
              'Exigences de rendez-vous, de quai ou de matériel',
              'Consignes de stockage, de groupage ou de logistique e-commerce',
              'Qui confirme la réception et contrôle la marchandise',
            ],
          },
        ],
      },
      {
        heading: 'Exceptions',
        blocks: [
          {
            type: 'p',
            text: 'Décidez qui est informé d’un changement — fournisseur en retard, question documentaire, créneau manqué — et dans quel délai. Un plan qui montre le changement tôt se rattrape plus facilement qu’un plan qui l’enfouit dans une longue chaîne de courriels.',
          },
        ],
      },
    ],
    relatedServices: ['coordination-douaniere', 'entreposage-et-logistique-e-commerce'],
  },
  {
    slug: 'maritime-aerien-ou-ferroviaire',
    locale: 'fr',
    status: 'published',
    title: 'Maritime, aérien ou ferroviaire ? Une aide à la décision pragmatique',
    excerpt:
      'Le bon mode de transport dépend de ce que l’expédition doit protéger : budget, date de lancement, couverture de stock ou promesse client. Partez de là, pas du mode.',
    category: 'Fret international',
    publishedAt: '2026-09-18',
    readMinutes: 6,
    coverId: 'fr-guide-modes',
    coverAlt: 'Cargo naviguant sur une large voie navigable intérieure sous un ciel dégagé.',
    sections: [
      {
        heading: 'Partir de la contrainte, pas du mode',
        blocks: [
          {
            type: 'p',
            text: 'Les décisions de mode déraillent quand la question est « lequel est le moins cher ? » au lieu de « que doit protéger cette expédition ? ». Nommez d’abord la contrainte : une date de lancement, la couverture de stock, une promesse client ou le budget du coût rendu.',
          },
        ],
      },
      {
        heading: 'Quand le maritime convient le plus souvent',
        blocks: [
          {
            type: 'p',
            text: 'Le fret maritime est en général le tronçon économique pour une marchandise disponible tôt et sans date d’arrivée proche impérative. Pour la France, les routes typiques passent par les grands ports maritimes français ou les ports du Benelux, avec un post-acheminement routier, ferroviaire ou fluvial (l’axe Seine, par exemple).',
          },
          {
            type: 'list',
            items: [
              'FCL (conteneur complet) : votre marchandise occupe tout le conteneur',
              'LCL (groupage) : votre marchandise partage le conteneur avec d’autres expéditions',
              'Port-à-porte : le plan se poursuit au-delà du port de destination jusqu’à votre adresse de livraison',
            ],
          },
        ],
      },
      {
        heading: 'Quand le ferroviaire Chine–Europe est une option',
        blocks: [
          {
            type: 'p',
            text: 'Entre le maritime et l’aérien se situe le fret ferroviaire Chine–Europe. Il peut être intéressant quand la marchandise doit arriver plus vite que par bateau sans l’urgence de l’avion. Disponibilité, délais et conditions dépendent de la route et de la période et sont vérifiés dans le plan d’expédition.',
          },
        ],
      },
      {
        heading: 'Quand l’aérien mérite sa place',
        blocks: [
          {
            type: 'p',
            text: 'Le fret aérien vaut la comparaison quand un lancement, un réassort ou une commande urgente ne peut pas attendre le prochain cycle maritime, ou quand la marchandise est petite et de forte valeur par rapport à son volume.',
          },
        ],
      },
      {
        heading: 'Les questions qui rendent la comparaison utile',
        blocks: [
          {
            type: 'list',
            items: [
              'Quand la marchandise sera-t-elle réellement prête à l’enlèvement ?',
              'Quels sont les dimensions, les poids et le nombre de colis ?',
              'Quelle date compte à destination, et que se passe-t-il si elle glisse ?',
              'Y a-t-il des exigences de réception à l’adresse de livraison ?',
              'Une partie de la commande pourrait-elle voyager par avion pendant que le reste suit par mer ou par rail ?',
            ],
          },
          {
            type: 'note',
            text: 'Nous ne publions ni délais ni tarifs génériques. Les options réalistes dépendent de la route, de la marchandise et de la date, et sont confirmées dans le plan d’expédition.',
          },
        ],
      },
    ],
    relatedServices: ['fret-maritime', 'fret-aerien'],
  },
  {
    slug: 'preparer-un-brief-sourcing-chine',
    locale: 'fr',
    status: 'published',
    title: 'Comment préparer un brief de sourcing pour la Chine',
    excerpt:
      'Un brief de sourcing utile n’a pas besoin d’être long. Il doit rendre le produit, les quantités, les attentes qualité et la prochaine décision clairs pour toutes les personnes impliquées.',
    category: 'Sourcing en Chine',
    publishedAt: '2026-09-09',
    readMinutes: 6,
    coverId: 'fr-guide-sourcing',
    coverAlt: 'Sélection de nuanciers et d’échantillons de tissu sur un bureau.',
    sections: [
      {
        heading: 'Partir de ce que vous avez déjà',
        blocks: [
          {
            type: 'p',
            text: 'Un lien produit, une photo ou un cahier des charges succinct suffit pour ouvrir la conversation. Partagez ce que vous avez plutôt que d’attendre le document parfait : le brief s’étoffera à mesure que le plan se précise.',
          },
          {
            type: 'p',
            text: 'Si vous avez un prix cible, indiquez-le. Il resserre tôt le champ des fournisseurs et garde les comparaisons les pieds sur terre.',
          },
        ],
      },
      {
        heading: 'Décrire le produit comme un fournisseur le chiffre',
        blocks: [
          {
            type: 'p',
            text: 'Les fournisseurs chiffrent des détails, pas des intentions. Plus vous confirmez de points ci-dessous, plus il est facile de comparer les offres à périmètre égal :',
          },
          {
            type: 'list',
            items: [
              'Matières, finitions et références de couleur',
              'Dimensions, poids et tolérances qui comptent',
              'Variantes : tailles, coloris ou lots',
              'Attentes en matière d’emballage de vente et d’expédition',
              'Étiquetages, marquages ou documents exigés par votre marché',
            ],
          },
        ],
      },
      {
        heading: 'Être clair sur les quantités et le calendrier',
        blocks: [
          {
            type: 'p',
            text: 'Indiquez la quantité de première commande envisagée, si vous prévoyez des réassorts et la date à laquelle la marchandise doit être disponible. Précisez si cette date est ferme ou souple : cela change les options réalistes.',
          },
        ],
      },
      {
        heading: 'Définir « acceptable » avant les échantillons',
        blocks: [
          {
            type: 'p',
            text: 'Les échantillons ne servent que si chacun sait ce qui est vérifié. Notez les points qui décident de la validation, qui valide, et ce qui se passe si un échantillon en manque un.',
          },
          {
            type: 'note',
            text: 'Gardez le brief, les réponses des fournisseurs et les retours sur échantillons dans un même fil de travail pour que le relais suivant parte de la dernière version.',
          },
        ],
      },
      {
        heading: 'Une courte check-list avant l’envoi',
        blocks: [
          {
            type: 'list',
            items: [
              'Lien produit, photo ou cahier des charges joint',
              'Prix cible et fourchette de quantités indiqués',
              'Destination et date souhaitée précisées',
              'Exigences d’emballage, d’étiquetage et de conformité notées',
              'Personne chargée de valider les échantillons nommée',
            ],
          },
        ],
      },
    ],
    relatedServices: ['sourcing-en-chine', 'marque-de-distributeur'],
  },
  {
    slug: 'guide-emballage-et-inserts',
    locale: 'fr',
    status: 'published',
    title: 'Emballage et inserts : ce qu’il faut régler avant la préparation des commandes',
    excerpt:
      'Inserts, autocollants, étiquettes volantes et boîtes de marque fonctionnent mieux quand fichiers, quantités et placement sont confirmés avant que la marchandise n’atteigne la table de préparation.',
    category: 'Emballage et image de marque',
    publishedAt: '2026-08-28',
    readMinutes: 5,
    coverId: 'fr-guide-emballage',
    coverAlt: 'Une personne emballe un t-shirt plié et une carte de remerciement dans un carton.',
    sections: [
      {
        heading: 'Décider ce que le client voit en premier',
        blocks: [
          {
            type: 'p',
            text: 'Listez chaque élément de marque dans l’ordre où le client le rencontre : boîte extérieure, papier de soie, carte insérée, étiquette produit. Le brief reste concentré et vous évitez de payer des éléments que personne ne voit.',
          },
        ],
      },
      {
        heading: 'Confirmer les fichiers et les quantités',
        blocks: [
          {
            type: 'list',
            items: [
              'Fichiers graphiques définitifs et versions validées',
              'Quantités par référence, plus une petite marge pour la casse',
              'Qui fournit chaque élément et quand il arrive',
              'Besoins de stockage pour les matériaux d’emballage',
            ],
          },
        ],
      },
      {
        heading: 'Rédiger des consignes de placement qu’un préparateur peut suivre',
        blocks: [
          {
            type: 'p',
            text: 'Décrivez le placement par référence en étapes simples, idéalement avec la photo d’un échantillon validé. « Carte insérée sur le dessus, logo vers le haut » est plus clair qu’« ajouter l’insert ».',
          },
        ],
      },
      {
        heading: 'Ne pas oublier la REP emballages et le Triman',
        blocks: [
          {
            type: 'p',
            text: 'Quiconque met des produits emballés sur le marché français est en principe soumis à la responsabilité élargie du producteur : adhésion à un éco-organisme agréé, identifiant unique et apposition du logo Triman accompagné de l’Info-tri. Précisez dans le brief qui assume ce rôle : fournisseur, marque ou distributeur.',
          },
          {
            type: 'note',
            text: 'Orientation générale, pas un conseil juridique. Les informations faisant foi sont celles de l’ADEME, des éco-organismes agréés et de vos conseils.',
          },
        ],
      },
      {
        heading: 'Protéger le produit autant que la présentation',
        blocks: [
          {
            type: 'p',
            text: 'La présentation doit survivre au voyage. Vérifiez que l’emballage de marque protège toujours le produit à travers le groupage, le fret et la livraison finale.',
          },
        ],
      },
    ],
    relatedServices: ['emballage-et-image-de-marque', 'entreposage-et-logistique-e-commerce'],
  },
  {
    slug: 'incoterms-2020-en-clair',
    locale: 'fr',
    status: 'published',
    title: 'Incoterms 2020 en clair : qui porte quel relais ?',
    excerpt:
      'Les Incoterms décrivent où la responsabilité passe du vendeur à l’acheteur. Connaître ce point rend les devis, l’assurance et les plans de livraison plus faciles à comparer.',
    category: 'Incoterms',
    publishedAt: '2026-08-14',
    readMinutes: 6,
    coverId: 'fr-guide-incoterms',
    coverAlt: 'Grand porte-conteneurs dans un port industriel sous les grues.',
    sections: [
      {
        heading: 'Ce que les Incoterms règlent, et ce qu’ils ne règlent pas',
        blocks: [
          {
            type: 'p',
            text: 'Publiés par la Chambre de commerce internationale (ICC), les Incoterms® décrivent où a lieu la livraison, quand le risque passe du vendeur à l’acheteur, et qui organise et paie le transport et certains frais.',
          },
          {
            type: 'p',
            text: 'Ils ne règlent ni le transfert de propriété, ni les modalités de paiement, ni les conséquences d’un manquement au contrat. Tout cela relève de votre contrat de vente.',
          },
        ],
      },
      {
        heading: 'Les règles que vous rencontrez souvent dans les devis',
        blocks: [
          {
            type: 'list',
            items: [
              'EXW (À l’usine) : le vendeur met la marchandise à disposition dans ses locaux ; l’acheteur organise presque tout à partir de là, dédouanement export compris.',
              'FCA (Franco transporteur) : le vendeur remet la marchandise dédouanée à l’export au transporteur désigné par l’acheteur. Souvent plus adapté que EXW pour le conteneur.',
              'FOB (Franco à bord) : le vendeur livre la marchandise à bord du navire au port d’embarquement désigné. Réservé au transport maritime et fluvial.',
              'CIF (Coût, assurance et fret) : le vendeur paie le fret et une assurance minimale jusqu’au port de destination, mais le risque passe dès la mise à bord à l’origine.',
              'DAP (Rendu au lieu de destination) : le vendeur livre au lieu convenu, prêt à être déchargé ; le dédouanement import et les droits sont à la charge de l’acheteur.',
              'DDP (Rendu droits acquittés) : le vendeur livre au lieu convenu, dédouané à l’import, droits acquittés.',
            ],
          },
        ],
      },
      {
        heading: 'Faire concorder la règle et le plan',
        blocks: [
          {
            type: 'p',
            text: 'Un devis n’a de sens qu’à côté de la règle qu’il suppose. Vérifiez que le lieu désigné est précis, que l’assurance correspond au point de transfert du risque et que le plan indique qui porte chaque relais à partir de là.',
          },
          {
            type: 'note',
            text: 'Ce guide est une information générale, pas un conseil juridique. Vérifiez la version des Incoterms et la règle dans votre contrat. Incoterms® est une marque de l’ICC.',
          },
        ],
      },
    ],
    relatedServices: ['fret-maritime', 'coordination-douaniere'],
  },
  {
    slug: 'coordination-fournisseurs',
    locale: 'fr',
    status: 'draft',
    title: 'Coordination fournisseurs : échantillons, validations et changements dans un même fil',
    excerpt: 'Brouillon – pas encore publié.',
    category: 'Coordination fournisseurs',
    publishedAt: '2026-09-27',
    readMinutes: 5,
    coverId: 'fr-guide-fournisseurs',
    coverAlt: '',
    sections: [],
    relatedServices: ['sourcing-en-chine'],
  },
];

export function getPublishedArticlesFr(): ArticleFr[] {
  return ARTICLES_FR.filter((article) => article.status === 'published').sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export const getLatestArticlesFr = (limit = 3) => getPublishedArticlesFr().slice(0, Math.max(0, limit));

export const getArticleFr = (slug: string) => getPublishedArticlesFr().find((article) => article.slug === slug) ?? null;

export function formatDateFr(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
