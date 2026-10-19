/**
 * Deutsche Themenseiten-Registry (§3 des DE-Dokuments).
 * Service-Themen unter /de/services/:slug, Branchen-Themen unter
 * /de/industries/:slug, Beschaffung unter /de/product-sourcing.
 */
import type { TopicPageContent } from '../../en-global/topics/types';
export { DE_RELATED_RAIL, DE_INDUSTRY_RAIL } from './rails';
import { DE_CROSS_BORDER_ECOMMERCE_TOPIC } from './industries';
import { DE_CONSUMER_GOODS_TOPIC } from './industries';
import { DE_INDUSTRIAL_COMPONENTS_TOPIC } from './industries';
import { DE_TIME_CRITICAL_CARGO_TOPIC } from './industries';
import { DE_INVENTORY_STORAGE_TOPIC } from './services-b';
import { DE_PRIVATE_WHITE_LABEL_TOPIC } from './services-b';
import { DE_WORLDWIDE_FULFILLMENT_TOPIC } from './services-b';
import { DE_BULK_PROCUREMENT_TOPIC } from './services-a';
import { DE_PACKAGING_BRANDING_TOPIC } from './services-a';

export { DE_PRODUCT_SOURCING_TOPIC } from './product-sourcing';
export type { TopicPageContent } from '../../en-global/topics/types';

export interface DeTopicNavLink {
  label: string;
  href: string;
  menuLine: string;
  match: (routeName: string, slug?: string) => boolean;
}

export const DE_SERVICE_TOPIC_NAV_LINKS: DeTopicNavLink[] = [
  {
    label: 'Beschaffung aus China',
    href: '/de/product-sourcing',
    menuLine: 'Lieferantenfähige Briefs, Vergleiche, Übergaben',
    match: (routeName) => routeName === 'de-product-sourcing',
  },
  {
    label: 'Großeinkauf aus China',
    href: '/de/services/bulk-procurement',
    menuLine: 'Menge, Bestandszweck, gestaffelte Freigabe',
    match: (routeName, slug) => routeName === 'de-topic' && slug === 'service:bulk-procurement',
  },
  {
    label: 'Verpackung & Branding',
    href: '/de/services/packaging-branding',
    menuLine: 'Packregeln, Versionen, Markenübergabe',
    match: (routeName, slug) => routeName === 'de-topic' && slug === 'service:packaging-branding',
  },
  {
    label: 'Lagerhaltung & Bestandsfreigabe',
    href: '/de/services/inventory-storage',
    menuLine: 'Wareneingang, Identifikation, Freigabe',
    match: (routeName, slug) => routeName === 'de-topic' && slug === 'service:inventory-storage',
  },
  {
    label: 'Eigenmarke & White Label',
    href: '/de/services/private-white-label',
    menuLine: 'Versionen, Materialien, Freigaben',
    match: (routeName, slug) => routeName === 'de-topic' && slug === 'service:private-white-label',
  },
  {
    label: 'Fulfillment & Auftragsabwicklung',
    href: '/de/services/worldwide-fulfillment',
    menuLine: 'Kommissionieren, packen, Ausnahmen',
    match: (routeName, slug) => routeName === 'de-topic' && slug === 'service:worldwide-fulfillment',
  },
];

export const DE_INDUSTRY_TOPIC_NAV_LINKS: DeTopicNavLink[] = [
  {
    label: 'Grenzüberschreitender E-Commerce',
    href: '/de/industries/cross-border-ecommerce',
    menuLine: 'Vom Sourcing-Entscheid bis zum Kundenauftrag',
    match: (routeName, slug) => routeName === 'de-topic' && slug === 'industry:cross-border-ecommerce',
  },
  {
    label: 'Konsumgüter',
    href: '/de/industries/consumer-goods',
    menuLine: 'Produkt, Verpackung, Kanalfreigabe',
    match: (routeName, slug) => routeName === 'de-topic' && slug === 'industry:consumer-goods',
  },
  {
    label: 'Industriekomponenten',
    href: '/de/industries/industrial-components',
    menuLine: 'Spezifikation, Schutz, Empfang',
    match: (routeName, slug) => routeName === 'de-topic' && slug === 'industry:industrial-components',
  },
  {
    label: 'Zeitkritische Fracht',
    href: '/de/industries/time-critical-cargo',
    menuLine: 'Bereitstellung, Route, Eskalation',
    match: (routeName, slug) => routeName === 'de-topic' && slug === 'industry:time-critical-cargo',
  },
];

export const DE_SERVICE_TOPICS: Record<string, TopicPageContent> = {
  'bulk-procurement': DE_BULK_PROCUREMENT_TOPIC,
  'packaging-branding': DE_PACKAGING_BRANDING_TOPIC,
  'inventory-storage': DE_INVENTORY_STORAGE_TOPIC,
  'private-white-label': DE_PRIVATE_WHITE_LABEL_TOPIC,
  'worldwide-fulfillment': DE_WORLDWIDE_FULFILLMENT_TOPIC,
};

export const DE_INDUSTRY_TOPICS: Record<string, TopicPageContent> = {
  'cross-border-ecommerce': DE_CROSS_BORDER_ECOMMERCE_TOPIC,
  'consumer-goods': DE_CONSUMER_GOODS_TOPIC,
  'industrial-components': DE_INDUSTRIAL_COMPONENTS_TOPIC,
  'time-critical-cargo': DE_TIME_CRITICAL_CARGO_TOPIC,
};

export function getDeServiceTopic(slug: string): TopicPageContent | null {
  return DE_SERVICE_TOPICS[slug] ?? null;
}

export function getDeIndustryTopic(slug: string): TopicPageContent | null {
  return DE_INDUSTRY_TOPICS[slug] ?? null;
}

/** EN↔DE-Gegenstück je Themenseite (für Pfad-erhaltenden Sprachwechsel + hreflang). */
export const DE_TOPIC_COUNTERPARTS: Record<string, { en: string; de: string }> = {
  'product-sourcing': { en: '/product-sourcing', de: '/de/product-sourcing' },
  'service:bulk-procurement': { en: '/services/bulk-procurement', de: '/de/services/bulk-procurement' },
  'service:packaging-branding': { en: '/services/packaging-branding', de: '/de/services/packaging-branding' },
  'service:inventory-storage': { en: '/services/inventory-storage', de: '/de/services/inventory-storage' },
  'service:private-white-label': { en: '/services/private-white-label', de: '/de/services/private-white-label' },
  'service:worldwide-fulfillment': { en: '/services/worldwide-fulfillment', de: '/de/services/worldwide-fulfillment' },
  'industry:cross-border-ecommerce': { en: '/industries/cross-border-ecommerce', de: '/de/industries/cross-border-ecommerce' },
  'industry:consumer-goods': { en: '/industries/consumer-goods', de: '/de/industries/consumer-goods' },
  'industry:industrial-components': { en: '/industries/industrial-components', de: '/de/industries/industrial-components' },
  'industry:time-critical-cargo': { en: '/industries/time-critical-cargo', de: '/de/industries/time-critical-cargo' },
};
