export interface IndustryContentFr {
  slug: string;
  navLabel: string;
  name: string;
  menuLine: string;
  copy: string;
  questions: string[];
  relatedServices: string[];
  relatedGuides: string[];
  mediaId: string;
  mediaAlt: string;
}

export const INDUSTRIES_FR: IndustryContentFr[] = [
  {
    slug: 'e-commerce-et-distribution',
    navLabel: 'E-commerce et distribution',
    name: 'E-commerce et distribution',
    menuLine: 'Réassort, lots et préparation marketplace',
    copy: 'Réassorts, bundles et expérience colis cohérente.',
    questions: [
      'Quelles références, quels lots ou quels kits doivent voyager ensemble ?',
      'Existe-t-il des consignes de cartons, d’étiquettes ou d’emballage propres à une marketplace ou à une enseigne ?',
      'Comment le rythme de réassort influence-t-il le stock à destination ?',
      'Qui valide les inserts, les étiquettes et l’emballage avant la libération de la marchandise ?',
    ],
    relatedServices: ['entreposage-et-logistique-e-commerce', 'emballage-et-image-de-marque', 'fret-maritime', 'sourcing-en-chine'],
    relatedGuides: ['guide-emballage-et-inserts', 'maritime-aerien-ou-ferroviaire'],
    mediaId: 'fr-industry-ecommerce',
    mediaAlt: 'Équipe d’entrepôt manipulant des cartons devant des rayonnages ordonnés.',
  },
  {
    slug: 'biens-de-consommation',
    navLabel: 'Biens de consommation',
    name: 'Biens de consommation',
    menuLine: 'Contrôle qualité, lancement et présentation',
    copy: 'Qualité, présentation et informations produit alignées.',
    questions: [
      'Quels détails produit et quels contrôles qualité doivent être confirmés avant l’expédition ?',
      'De quoi dépend la préparation du lancement : échantillons, emballage ou calendrier ?',
      'Comment la présentation doit-elle tenir du fournisseur jusqu’au rayon ou au pas de la porte ?',
      'Quels étiquetages ou documents le marché français ou européen attend-il ?',
    ],
    relatedServices: ['sourcing-en-chine', 'emballage-et-image-de-marque', 'marque-de-distributeur', 'entreposage-et-logistique-e-commerce'],
    relatedGuides: ['preparer-un-brief-sourcing-chine', 'guide-emballage-et-inserts'],
    mediaId: 'fr-industry-consommation',
    mediaAlt: 'Une personne déballe un petit produit d’un carton garni de papier de calage.',
  },
  {
    slug: 'composants-industriels',
    navLabel: 'Composants industriels',
    name: 'Composants industriels',
    menuLine: 'Spécifications, documentation et réception',
    copy: 'Spécifications, documents et réception maîtrisés.',
    questions: [
      'Quelles spécifications et quels plans définissent une pièce acceptable ?',
      'Quelle documentation doit accompagner l’expédition (certificats matière, par exemple) ?',
      'Quelles exigences s’appliquent à la réception sur le site de destination ?',
      'Quel est le relais suivant en production ou en service après la livraison ?',
    ],
    relatedServices: ['sourcing-en-chine', 'coordination-douaniere', 'fret-maritime', 'transport-routier-et-livraison'],
    relatedGuides: ['check-list-import-france', 'incoterms-2020-en-clair'],
    mediaId: 'fr-industry-industrie',
    mediaAlt: 'Gros plan sur des engrenages et des pièces usinées dans un atelier.',
  },
  {
    slug: 'fret-urgent',
    navLabel: 'Fret urgent',
    name: 'Fret urgent',
    menuLine: 'Prochain mouvement réalisable, exceptions précoces',
    copy: 'Décision rapide, scénario lisible et risques explicités.',
    questions: [
      'Quel est le prochain mouvement réalisable, et de quoi dépend-il ?',
      'Quels documents ou quelles validations pourraient bloquer l’expédition ?',
      'Qui doit être informé d’une exception, et dans quel délai ?',
      'Quelle est la solution de repli si la première option n’est plus réalisable ?',
    ],
    relatedServices: ['fret-aerien', 'coordination-douaniere', 'transport-routier-et-livraison'],
    relatedGuides: ['maritime-aerien-ou-ferroviaire', 'check-list-import-france'],
    mediaId: 'fr-industry-urgent',
    mediaAlt: 'Avion à la porte d’embarquement de nuit pendant le traitement du fret.',
  },
];

export const getIndustryFr = (slug: string) => INDUSTRIES_FR.find((industry) => industry.slug === slug) ?? null;
