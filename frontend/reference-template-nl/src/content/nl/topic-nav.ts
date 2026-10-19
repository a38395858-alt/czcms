// Generated alongside the Dutch topic content.
import { homeContext } from '../../lib/home-context';
import { localizedUrl } from '../../config/site';
const topics = [
  {
    "route": "product-sourcing",
    "slug": "product-sourcing",
    "kind": "service",
    "navLabel": "Sourcing in China",
    "menuLine": "Productreferentie, leveranciersvragen en volgende beslissing."
  },
  {
    "route": "services/bulk-procurement",
    "slug": "bulk-procurement",
    "kind": "service",
    "navLabel": "Grootschalige inkoop in China",
    "menuLine": "Aantal, voorraaddoel en volgende bestemming."
  },
  {
    "route": "services/packaging-branding",
    "slug": "packaging-branding",
    "kind": "service",
    "navLabel": "Verpakking en merk",
    "menuLine": "Goedgekeurde materialen en verpakkingsinstructie."
  },
  {
    "route": "services/inventory-storage",
    "slug": "inventory-storage",
    "kind": "service",
    "navLabel": "Opslag en vrijgave van voorraad",
    "menuLine": "Ontvangst, identificatie en vrijgave."
  },
  {
    "route": "services/private-white-label",
    "slug": "private-white-label",
    "kind": "service",
    "navLabel": "Eigen merk en white label",
    "menuLine": "Productversie, merk en goedkeuring."
  },
  {
    "route": "services/worldwide-fulfillment",
    "slug": "worldwide-fulfillment",
    "kind": "service",
    "navLabel": "Orderverwerking",
    "menuLine": "Picken, verpakken en uitzonderingsroute."
  },
  {
    "route": "industries/cross-border-ecommerce",
    "slug": "cross-border-ecommerce",
    "kind": "industry",
    "navLabel": "Grensoverschrijdende e-commerce",
    "menuLine": "Van sourcing naar klantklare orders."
  },
  {
    "route": "industries/consumer-goods",
    "slug": "consumer-goods",
    "kind": "industry",
    "navLabel": "Consumentengoederen",
    "menuLine": "Presentatie, kanaal en vrijgavebeslissing."
  },
  {
    "route": "industries/industrial-components",
    "slug": "industrial-components",
    "kind": "industry",
    "navLabel": "Industriële onderdelen",
    "menuLine": "Specificatie, documenten en ontvangst."
  },
  {
    "route": "industries/time-critical-cargo",
    "slug": "time-critical-cargo",
    "kind": "industry",
    "navLabel": "Tijdkritische vracht",
    "menuLine": "Beschikbaarheid, route en escalatieverantwoordelijke."
  }
];
export const NL_TOPIC_SERVICES = topics.filter(t => t.kind === 'service');
export const NL_TOPIC_INDUSTRIES = topics.filter(t => t.kind === 'industry');
export function nlTopicHref(route: string) { return (homeContext()?.languages.nl ?? localizedUrl('/nl/', 'nl')).replace(/\/$/, '') + '/' + route; }
