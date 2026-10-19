/**
 * Per-topic layout variants.
 * Copy stays 100% identical — only the composition changes, so the 10 topic
 * pages feel like distinct pages while sharing the Pacific Operations
 * design language (navy / mist / signal / safety-orange, Barlow + Plex).
 */

export type HeroVariant = 'split' | 'mirror' | 'stacked' | 'band';
export type DecisionVariant = 'stacked' | 'split';
export type ScenariosVariant = 'rows' | 'grid' | 'split';
export type WorkflowVariant = 'timeline' | 'horizontal' | 'steps-grid';
export type ChecklistVariant = 'split' | 'centered';
export type ControlsVariant = 'panels' | 'ledger';
export type FaqVariant = 'aside' | 'stacked';
export type RelatedVariant = 'ledger' | 'grid';
export type EnquiryVariant = 'split' | 'centered' | 'mirror';

export interface TopicLayoutVariant {
  hero: HeroVariant;
  decision: DecisionVariant;
  scenarios: ScenariosVariant;
  workflow: WorkflowVariant;
  checklist: ChecklistVariant;
  controls: ControlsVariant;
  faq: FaqVariant;
  related: RelatedVariant;
  enquiry: EnquiryVariant;
}

const DEFAULT_LAYOUT: TopicLayoutVariant = {
  hero: 'split',
  decision: 'stacked',
  scenarios: 'rows',
  workflow: 'timeline',
  checklist: 'split',
  controls: 'panels',
  faq: 'aside',
  related: 'ledger',
  enquiry: 'split',
};

/**
 * Each topic gets a unique combination. Product Sourcing keeps the
 * reference editorial layout; every other page differs in at least
 * four blocks.
 */
export const TOPIC_LAYOUTS: Record<string, TopicLayoutVariant> = {
  'product-sourcing': { ...DEFAULT_LAYOUT },
  'bulk-procurement': {
    hero: 'mirror',
    decision: 'split',
    scenarios: 'grid',
    workflow: 'horizontal',
    checklist: 'centered',
    controls: 'panels',
    faq: 'stacked',
    related: 'grid',
    enquiry: 'mirror',
  },
  'packaging-branding': {
    hero: 'stacked',
    decision: 'stacked',
    scenarios: 'split',
    workflow: 'steps-grid',
    checklist: 'split',
    controls: 'ledger',
    faq: 'aside',
    related: 'ledger',
    enquiry: 'centered',
  },
  'inventory-storage': {
    hero: 'band',
    decision: 'split',
    scenarios: 'rows',
    workflow: 'timeline',
    checklist: 'centered',
    controls: 'ledger',
    faq: 'stacked',
    related: 'grid',
    enquiry: 'split',
  },
  'private-white-label': {
    hero: 'mirror',
    decision: 'stacked',
    scenarios: 'split',
    workflow: 'horizontal',
    checklist: 'split',
    controls: 'panels',
    faq: 'aside',
    related: 'grid',
    enquiry: 'centered',
  },
  'worldwide-fulfillment': {
    hero: 'stacked',
    decision: 'split',
    scenarios: 'grid',
    workflow: 'steps-grid',
    checklist: 'centered',
    controls: 'panels',
    faq: 'stacked',
    related: 'ledger',
    enquiry: 'mirror',
  },
  'industry-cross-border-ecommerce': {
    hero: 'band',
    decision: 'stacked',
    scenarios: 'grid',
    workflow: 'timeline',
    checklist: 'split',
    controls: 'ledger',
    faq: 'aside',
    related: 'grid',
    enquiry: 'centered',
  },
  'industry-consumer-goods': {
    hero: 'split',
    decision: 'split',
    scenarios: 'split',
    workflow: 'horizontal',
    checklist: 'centered',
    controls: 'panels',
    faq: 'stacked',
    related: 'ledger',
    enquiry: 'split',
  },
  'industry-industrial-components': {
    hero: 'mirror',
    decision: 'stacked',
    scenarios: 'rows',
    workflow: 'steps-grid',
    checklist: 'split',
    controls: 'ledger',
    faq: 'aside',
    related: 'grid',
    enquiry: 'mirror',
  },
  'industry-time-critical-cargo': {
    hero: 'stacked',
    decision: 'split',
    scenarios: 'grid',
    workflow: 'horizontal',
    checklist: 'centered',
    controls: 'ledger',
    faq: 'stacked',
    related: 'ledger',
    enquiry: 'centered',
  },
};

/** Route lookup also accepts localized routes without relying on content IDs. */
export function topicLayoutKey(route: string): string {
  const path = route.replace(/^\/(de|es|fr|it|nl)(?=\/)/, '').replace(/^\/+|\/+$/g, '');
  return path.startsWith('industries/') ? `industry-${path.split('/').pop()}` : path.split('/').pop()!;
}

export function getTopicLayout(idOrRoute: string): TopicLayoutVariant {
  return TOPIC_LAYOUTS[idOrRoute] ?? TOPIC_LAYOUTS[topicLayoutKey(idOrRoute)] ?? DEFAULT_LAYOUT;
}
