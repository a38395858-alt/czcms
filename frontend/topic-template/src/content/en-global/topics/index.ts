/**
 * Topic-page registry (English Global, v2 doc).
 * Service topics live under /services/:slug; industry topics replace the
 * generic industry detail at /industries/:slug. Product Sourcing keeps its
 * dedicated /product-sourcing route.
 */
import type { TopicPageContent } from './types';
import { BULK_PROCUREMENT_TOPIC } from './bulk-procurement';
import { CONSUMER_GOODS_TOPIC } from './consumer-goods';
import { CROSS_BORDER_ECOMMERCE_TOPIC } from './cross-border-ecommerce';
import { INDUSTRIAL_COMPONENTS_TOPIC } from './industrial-components';
import { INVENTORY_STORAGE_TOPIC } from './inventory-storage';
import { PACKAGING_BRANDING_TOPIC } from './packaging-branding';
import { PRIVATE_WHITE_LABEL_TOPIC } from './private-white-label';
import { TIME_CRITICAL_CARGO_TOPIC } from './time-critical-cargo';
import { WORLDWIDE_FULFILLMENT_TOPIC } from './worldwide-fulfillment';

export { PRODUCT_SOURCING_TOPIC } from './product-sourcing';
export type { TopicPageContent } from './types';

export const SERVICE_TOPICS: Record<string, TopicPageContent> = {
  'bulk-procurement': BULK_PROCUREMENT_TOPIC,
  'packaging-branding': PACKAGING_BRANDING_TOPIC,
  'inventory-storage': INVENTORY_STORAGE_TOPIC,
  'private-white-label': PRIVATE_WHITE_LABEL_TOPIC,
  'worldwide-fulfillment': WORLDWIDE_FULFILLMENT_TOPIC,
};

export const INDUSTRY_TOPICS: Record<string, TopicPageContent> = {
  'cross-border-ecommerce': CROSS_BORDER_ECOMMERCE_TOPIC,
  'consumer-goods': CONSUMER_GOODS_TOPIC,
  'industrial-components': INDUSTRIAL_COMPONENTS_TOPIC,
  'time-critical-cargo': TIME_CRITICAL_CARGO_TOPIC,
};

/**
 * Service topic pages surfaced in the Solutions menu and footer.
 * Industry topics reuse the existing Industries navigation (same slugs).
 */
export interface TopicNavLink {
  label: string;
  href: string;
  menuLine: string;
  match: (routeName: string, slug?: string) => boolean;
}

export const SERVICE_TOPIC_NAV_LINKS: TopicNavLink[] = [
  {
    label: 'Product Sourcing from China',
    href: '/product-sourcing',
    menuLine: 'Supplier-ready briefs, comparisons, handoffs',
    match: (routeName) => routeName === 'product-sourcing',
  },
  {
    label: 'Bulk Procurement',
    href: '/services/bulk-procurement',
    menuLine: 'Quantity, inventory purpose, staged release',
    match: (routeName, slug) => routeName === 'service-topic' && slug === 'bulk-procurement',
  },
  {
    label: 'Packaging & Branding',
    href: '/services/packaging-branding',
    menuLine: 'Packout rules, versions, brand handoff',
    match: (routeName, slug) => routeName === 'service-topic' && slug === 'packaging-branding',
  },
  {
    label: 'Inventory Storage',
    href: '/services/inventory-storage',
    menuLine: 'Receiving, identification, release',
    match: (routeName, slug) => routeName === 'service-topic' && slug === 'inventory-storage',
  },
  {
    label: 'Private Label & White Label',
    href: '/services/private-white-label',
    menuLine: 'Versions, assets, approvals',
    match: (routeName, slug) => routeName === 'service-topic' && slug === 'private-white-label',
  },
  {
    label: 'Worldwide Fulfillment',
    href: '/services/worldwide-fulfillment',
    menuLine: 'Pick, pack, dispatch, exceptions',
    match: (routeName, slug) => routeName === 'service-topic' && slug === 'worldwide-fulfillment',
  },
];

export function getServiceTopic(slug: string): TopicPageContent | null {
  return SERVICE_TOPICS[slug] ?? null;
}

export function getIndustryTopic(slug: string): TopicPageContent | null {
  return INDUSTRY_TOPICS[slug] ?? null;
}
