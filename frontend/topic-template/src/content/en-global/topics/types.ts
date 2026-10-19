/**
 * Unified topic-page content model (English Global, v2 doc).
 * One template (`TopicPage`) renders every service topic and industry solution page;
 * each page owns its copy in its own file under this folder (CMS-repeater style).
 */
import type { EnquiryCopy, FaqItem, StartingPointValue } from '../../types';

export type TopicTone = 'white' | 'mist' | 'navy';
export type TopicKind = 'service' | 'industry';

export interface TopicRailItem {
  step?: string;
  label: string;
  note?: string;
}

export interface TopicHero {
  kicker: string;
  title: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
  mediaId: string;
  mediaAlt: string;
  rail: TopicRailItem[];
}

export interface TopicDecision {
  kicker?: string;
  heading: string;
  paragraphs: string[];
}

export interface TopicScenario {
  tag?: string;
  title: string;
  copy: string;
}

export interface TopicScenarios {
  kicker?: string;
  heading: string;
  intro?: string;
  cards: TopicScenario[];
}

export interface TopicChecklist {
  kicker?: string;
  heading: string;
  body?: string;
  items?: string[];
  /** Show the contextual "request a plan" button next to the copy. */
  midCta?: boolean;
}

export interface TopicStep {
  step?: string;
  title?: string;
  copy: string;
}

export interface TopicWorkflow {
  kicker?: string;
  heading: string;
  intro?: string;
  steps: TopicStep[];
  scopeNote?: string;
}

export interface TopicBriefPoint {
  lead: string;
  rest: string;
}

export interface TopicBrief {
  kicker?: string;
  heading: string;
  paragraphs: string[];
  points: TopicBriefPoint[];
  mediaId?: string;
  mediaAlt?: string;
}

export interface TopicComparison {
  kicker?: string;
  heading: string;
  body?: string;
  rows: string[];
  mediaId?: string;
  mediaAlt?: string;
}

export interface TopicCheckpoint {
  tag: string;
  copy: string;
}

export interface TopicCheckpoints {
  kicker?: string;
  heading: string;
  body?: string;
  cards: TopicCheckpoint[];
}

export interface TopicScopeRow {
  topic: string;
  organize: string;
  confirm: string;
}

export interface TopicScopeTable {
  kicker?: string;
  heading: string;
  intro?: string;
  headers: [string, string, string];
  rows: TopicScopeRow[];
}

export interface TopicControlGroup {
  label: string;
  items: string[];
}

export interface TopicControls {
  kicker?: string;
  heading: string;
  intro?: string;
  groups?: TopicControlGroup[];
  paragraphs?: string[];
  items?: string[];
}

export interface TopicFaq {
  kicker?: string;
  heading: string;
  guide?: string;
  items: FaqItem[];
}

export interface TopicRelatedLink {
  label: string;
  href: string;
  note: string;
}

export interface TopicRelated {
  heading: string;
  intro?: string;
  links: TopicRelatedLink[];
}

export interface TopicContextField {
  name: string;
  label: string;
  hint?: string;
}

export interface TopicEnquiry {
  kicker: string;
  heading: string;
  body?: string;
  reassurance: string[];
  contextTitle: string;
  contextFields: TopicContextField[];
}

export type TopicSection =
  | { type: 'decision'; tone: TopicTone; content: TopicDecision }
  | { type: 'scenarios'; tone: TopicTone; content: TopicScenarios }
  | { type: 'checklist'; tone: TopicTone; content: TopicChecklist }
  | { type: 'workflow'; tone: TopicTone; content: TopicWorkflow }
  | { type: 'brief'; tone: 'navy'; content: TopicBrief }
  | { type: 'comparison'; tone: TopicTone; content: TopicComparison }
  | { type: 'checkpoints'; tone: TopicTone; content: TopicCheckpoints }
  | { type: 'scopeTable'; tone: TopicTone; content: TopicScopeTable }
  | { type: 'controls'; tone: TopicTone; content: TopicControls }
  | { type: 'faq'; tone: TopicTone; content: TopicFaq };

export interface TopicPageContent {
  /** Stable id: analytics placement, form prefix, JSON-LD key. */
  id: string;
  kind: TopicKind;
  /** Canonical production path, e.g. /services/bulk-procurement */
  route: string;
  /** Breadcrumb label + parent crumb. */
  pageLabel: string;
  breadcrumbParent: { label: string; href: string };
  meta: { title: string; description: string; keywords: string[] };
  /** Service JSON-LD name; null for industry pages (no Service entity claimed). */
  serviceName: string | null;
  /** Starting-point prefill for enquiry CTAs; null lets the visitor choose. */
  startingPoint: StartingPointValue | null;
  /** "Request a [specific] plan" label reused by hero, mid-page and form buttons. */
  formButton: string;
  hero: TopicHero;
  sections: TopicSection[];
  related: TopicRelated;
  /** Optional second rail (DE industry pages interlink each other, DE-Dok §3). */
  relatedIndustries?: TopicRelated;
  enquiry: TopicEnquiry;
}

/** Shared enquiry-form strings for topic pages; each page overrides `button`. */
export const TOPIC_ENQUIRY_COPY: Omit<EnquiryCopy, 'button' | 'reassurance'> = {
  loading: 'Sending your request…',
  success_title: 'Thanks — your request is on its way.',
  success_body: 'A FreightVanta specialist will review the details and follow up with the right next step.',
  error:
    'We could not send the request yet. Please check the highlighted fields and try again, or contact us using the details below.',
  consent_prefix:
    'I agree that FreightVanta may use these details to review my request and follow up with me, as described in the',
  consent_link_label: 'privacy policy',
  consent_suffix: '.',
};

/** Generic reassurance lines for topic enquiry bands (no unverified claims). */
export const TOPIC_REASSURANCE: string[] = [
  'You do not need every answer in the first message — open questions are captured, not assumed.',
  'Scope, responsibilities, and timing are confirmed in writing before work starts.',
  'Approval stays with your team; we organize the questions, evidence, and next owner.',
];

/** §13.2 related-service rail copy, shared by every topic page. */
export const RELATED_RAIL: Record<string, { label: string; href: string; note: string }> = {
  'product-sourcing': {
    label: 'Product Sourcing from China',
    href: '/product-sourcing',
    note: 'Build the product and supplier brief before the next purchase decision.',
  },
  'bulk-procurement': {
    label: 'Bulk Procurement from China',
    href: '/services/bulk-procurement',
    note: 'Plan quantity, inventory purpose and the next release before a larger buy.',
  },
  'packaging-branding': {
    label: 'Packaging & Branding',
    href: '/services/packaging-branding',
    note: 'Carry approved packaging and brand rules into the physical packout.',
  },
  'inventory-storage': {
    label: 'Inventory Storage',
    href: '/services/inventory-storage',
    note: 'Make receiving, identification, storage and release visible.',
  },
  'private-white-label': {
    label: 'Private Label & White Label',
    href: '/services/private-white-label',
    note: 'Keep product, brand version and approval ownership aligned.',
  },
  'worldwide-fulfillment': {
    label: 'Worldwide Fulfillment',
    href: '/services/worldwide-fulfillment',
    note: 'Turn ready inventory into customer-ready order instructions.',
  },
};
