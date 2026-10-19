/**
 * Shared, site-agnostic section contract. Every localized homepage template renders the same
 * section keys, while each site owns its localized copy, media, and settings.
 */
export type SectionKey =
  | 'announcement'
  | 'hero'
  | 'coverage'
  | 'service_paths'
  | 'operation'
  | 'process'
  | 'industries'
  | 'resources'
  | 'faq'
  | 'enquiry'
  | 'footer';

export interface SectionRecord<K extends SectionKey, I, S> {
  site_id: string;
  locale: string;
  section_key: K;
  enabled: boolean;
  sort_order: number;
  eyebrow: string;
  title: string;
  body: string;
  cta_primary_label: string;
  cta_primary_url: string;
  cta_secondary_label: string;
  cta_secondary_url: string;
  media_id: string;
  media_alt: string;
  items: I[];
  settings: S;
  draft_version: number;
  published_version: number;
}

export type StartingPointValue =
  | 'product-sourcing'
  | 'ocean-freight'
  | 'air-freight'
  | 'warehousing-fulfillment'
  | 'packaging-branding'
  | 'not-sure';

export interface LinkItem {
  label: string;
  href: string;
}

export interface ServicePathItem {
  id: string;
  label: string;
  title: string;
  copy: string;
  tags: string[];
  link_label: string;
  link_url: string;
  media_id: string;
  media_alt: string;
  starting_point: StartingPointValue | null;
}

export interface OperationItem {
  title: string;
  copy: string;
}

export interface ProcessItem {
  step: string;
  title: string;
  copy: string;
}

export interface IndustryItem {
  slug: string;
  name: string;
  copy: string;
  href: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FooterColumn {
  key: 'brand' | 'solutions' | 'industries' | 'contact';
  title: string;
}

export interface EnquiryCopy {
  button: string;
  loading: string;
  success_title: string;
  success_body: string;
  error: string;
  reassurance: string[];
  consent_prefix: string;
  consent_link_label: string;
  consent_suffix: string;
}

type NoSettings = Record<string, never>;

export type AnnouncementSection = SectionRecord<'announcement', never, NoSettings>;
export type HeroSection = SectionRecord<'hero', never, { microcopy: string; route_labels: string[] }>;
export type CoverageSection = SectionRecord<'coverage', LinkItem, NoSettings>;
export type ServicePathsSection = SectionRecord<
  'service_paths',
  ServicePathItem,
  { panel_cta_label: string; default_tab: string }
>;
export type OperationSection = SectionRecord<'operation', OperationItem, { pull_quote: string }>;
export type ProcessSection = SectionRecord<'process', ProcessItem, { closing: string }>;
export type IndustriesSection = SectionRecord<'industries', IndustryItem, { media_caption: string }>;
export type ResourcesSection = SectionRecord<
  'resources',
  LinkItem,
  { heading_url: string; article_limit: number; topics_label: string }
>;
export type FaqSection = SectionRecord<
  'faq',
  FaqItem,
  { aside_prompt: string; aside_link_label: string; aside_link_url: string }
>;
export type EnquirySection = SectionRecord<'enquiry', never, EnquiryCopy>;
export type FooterSection = SectionRecord<'footer', FooterColumn, NoSettings>;

export type HomeSection =
  | AnnouncementSection
  | HeroSection
  | CoverageSection
  | ServicePathsSection
  | OperationSection
  | ProcessSection
  | IndustriesSection
  | ResourcesSection
  | FaqSection
  | EnquirySection
  | FooterSection;
