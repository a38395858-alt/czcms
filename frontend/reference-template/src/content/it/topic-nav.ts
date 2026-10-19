// Generated alongside the Italian topic content.
import { homeContext } from '../../lib/home-context';
import { localizedUrl } from '../../config/site';
const topics = [
  {
    "route": "product-sourcing",
    "slug": "product-sourcing",
    "kind": "service",
    "navLabel": "Ricerca fornitori in Cina",
    "menuLine": "Referenza, domande al fornitore e prossima decisione."
  },
  {
    "route": "services/bulk-procurement",
    "slug": "bulk-procurement",
    "kind": "service",
    "navLabel": "Acquisto all'ingrosso in Cina",
    "menuLine": "Quantità, finalità delle scorte e prossima destinazione."
  },
  {
    "route": "services/packaging-branding",
    "slug": "packaging-branding",
    "kind": "service",
    "navLabel": "Imballaggio e immagine di marca",
    "menuLine": "Materiali approvati e istruzione di confezionamento."
  },
  {
    "route": "services/inventory-storage",
    "slug": "inventory-storage",
    "kind": "service",
    "navLabel": "Stoccaggio e rilascio delle scorte",
    "menuLine": "Ricezione, identificazione e rilascio."
  },
  {
    "route": "services/private-white-label",
    "slug": "private-white-label",
    "kind": "service",
    "navLabel": "Marca privata e white label",
    "menuLine": "Versione prodotto, marca e approvazione."
  },
  {
    "route": "services/worldwide-fulfillment",
    "slug": "worldwide-fulfillment",
    "kind": "service",
    "navLabel": "Preparazione degli ordini",
    "menuLine": "Prelievo, confezionamento e percorso di eccezione."
  },
  {
    "route": "industries/cross-border-ecommerce",
    "slug": "cross-border-ecommerce",
    "kind": "industry",
    "navLabel": "E-commerce transfrontaliero",
    "menuLine": "Dal prodotto approvvigionato all’ordine cliente."
  },
  {
    "route": "industries/consumer-goods",
    "slug": "consumer-goods",
    "kind": "industry",
    "navLabel": "Beni di consumo",
    "menuLine": "Presentazione, canale e decisione di rilascio."
  },
  {
    "route": "industries/industrial-components",
    "slug": "industrial-components",
    "kind": "industry",
    "navLabel": "Componenti industriali",
    "menuLine": "Specifica, documenti e ricezione."
  },
  {
    "route": "industries/time-critical-cargo",
    "slug": "time-critical-cargo",
    "kind": "industry",
    "navLabel": "Spedizione urgente",
    "menuLine": "Disponibilità, itinerario e responsabile di escalation."
  }
];
export const IT_TOPIC_SERVICES = topics.filter(t => t.kind === 'service');
export const IT_TOPIC_INDUSTRIES = topics.filter(t => t.kind === 'industry');
export function itTopicHref(route: string) { return (homeContext()?.languages.it ?? localizedUrl('/it/', 'it')).replace(/\/$/, '') + '/' + route; }
