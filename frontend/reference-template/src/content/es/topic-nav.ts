// Generated alongside the Spanish topic content.
import { homeContext } from '../../lib/home-context';
import { localizedUrl } from '../../config/site';
const topics = [
  {
    "route": "product-sourcing",
    "slug": "product-sourcing",
    "kind": "service",
    "navLabel": "Sourcing de productos en China",
    "menuLine": "Referencia, preguntas al proveedor y próxima decisión."
  },
  {
    "route": "services/bulk-procurement",
    "slug": "bulk-procurement",
    "kind": "service",
    "navLabel": "Compra al por mayor en China",
    "menuLine": "Cantidad, finalidad del stock y siguiente destino."
  },
  {
    "route": "services/packaging-branding",
    "slug": "packaging-branding",
    "kind": "service",
    "navLabel": "Embalaje e imagen de marca",
    "menuLine": "Materiales aprobados e instrucción de empaquetado."
  },
  {
    "route": "services/inventory-storage",
    "slug": "inventory-storage",
    "kind": "service",
    "navLabel": "Almacenaje y liberación de stock",
    "menuLine": "Recepción, identificación y liberación."
  },
  {
    "route": "services/private-white-label",
    "slug": "private-white-label",
    "kind": "service",
    "navLabel": "Marca propia y marca blanca",
    "menuLine": "Versión de producto, marca y aprobación."
  },
  {
    "route": "services/worldwide-fulfillment",
    "slug": "worldwide-fulfillment",
    "kind": "service",
    "navLabel": "Preparación de pedidos",
    "menuLine": "Picking, empaquetado y circuito de excepción."
  },
  {
    "route": "industries/cross-border-ecommerce",
    "slug": "cross-border-ecommerce",
    "kind": "industry",
    "navLabel": "Comercio electrónico transfronterizo",
    "menuLine": "Del producto adquirido al pedido de cliente."
  },
  {
    "route": "industries/consumer-goods",
    "slug": "consumer-goods",
    "kind": "industry",
    "navLabel": "Bienes de consumo",
    "menuLine": "Presentación, canal y decisión de liberación."
  },
  {
    "route": "industries/industrial-components",
    "slug": "industrial-components",
    "kind": "industry",
    "navLabel": "Componentes industriales",
    "menuLine": "Especificación, documentos y recepción."
  },
  {
    "route": "industries/time-critical-cargo",
    "slug": "time-critical-cargo",
    "kind": "industry",
    "navLabel": "Carga urgente",
    "menuLine": "Disponibilidad, ruta y responsable de escalado."
  }
];
export const ES_TOPIC_SERVICES = topics.filter(t => t.kind === 'service');
export const ES_TOPIC_INDUSTRIES = topics.filter(t => t.kind === 'industry');
export function esTopicHref(route: string) { return (homeContext()?.languages.es ?? localizedUrl('/es/', 'es')).replace(/\/$/, '') + '/' + route; }
