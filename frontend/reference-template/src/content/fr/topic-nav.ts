// Generated alongside the French topic content.
import { homeContext } from '../../lib/home-context';
import { localizedUrl } from '../../config/site';
const topics = [
  {
    "route": "product-sourcing",
    "slug": "product-sourcing",
    "kind": "service",
    "navLabel": "Sourcing en Chine",
    "menuLine": "Référence, questions fournisseur et prochaine décision."
  },
  {
    "route": "services/bulk-procurement",
    "slug": "bulk-procurement",
    "kind": "service",
    "navLabel": "Achat en volume depuis la Chine",
    "menuLine": "Quantité, finalité du stock et prochaine destination."
  },
  {
    "route": "services/packaging-branding",
    "slug": "packaging-branding",
    "kind": "service",
    "navLabel": "Emballage et image de marque",
    "menuLine": "Éléments validés et instruction de conditionnement."
  },
  {
    "route": "services/inventory-storage",
    "slug": "inventory-storage",
    "kind": "service",
    "navLabel": "Stockage et libération des stocks",
    "menuLine": "Réception, identification et libération."
  },
  {
    "route": "services/private-white-label",
    "slug": "private-white-label",
    "kind": "service",
    "navLabel": "Marque propre et marque blanche",
    "menuLine": "Version produit, marque et validation."
  },
  {
    "route": "services/worldwide-fulfillment",
    "slug": "worldwide-fulfillment",
    "kind": "service",
    "navLabel": "Préparation de commandes",
    "menuLine": "Picking, conditionnement et circuit d’exception."
  },
  {
    "route": "industries/cross-border-ecommerce",
    "slug": "cross-border-ecommerce",
    "kind": "industry",
    "navLabel": "E-commerce transfrontalier",
    "menuLine": "Du produit sourcé à la commande client."
  },
  {
    "route": "industries/consumer-goods",
    "slug": "consumer-goods",
    "kind": "industry",
    "navLabel": "Biens de consommation",
    "menuLine": "Présentation, canal et décision de libération."
  },
  {
    "route": "industries/industrial-components",
    "slug": "industrial-components",
    "kind": "industry",
    "navLabel": "Composants industriels",
    "menuLine": "Spécification, documents et réception."
  },
  {
    "route": "industries/time-critical-cargo",
    "slug": "time-critical-cargo",
    "kind": "industry",
    "navLabel": "Fret urgent",
    "menuLine": "Disponibilité, itinéraire et responsable d’escalade."
  }
];
export const FR_TOPIC_SERVICES = topics.filter(t => t.kind === 'service');
export const FR_TOPIC_INDUSTRIES = topics.filter(t => t.kind === 'industry');
export function frTopicHref(route: string) { return (homeContext()?.languages.fr ?? localizedUrl('/fr/', 'fr')).replace(/\/$/, '') + '/' + route; }
