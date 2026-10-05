/**
 * English Global homepage — localized section records.
 * Shape follows the shared section contract (see ../types.ts); copy is owned by this site.
 */
import { SITE_META } from '../../config/site';
import type {
  AnnouncementSection,
  CoverageSection,
  EnquirySection,
  FaqSection,
  FooterSection,
  HeroSection,
  HomeSection,
  IndustriesSection,
  OperationSection,
  ProcessSection,
  ResourcesSection,
  ServicePathsSection,
} from '../types';
import { INDUSTRIES } from './industries';
import { SERVICES } from './services';

const base = {
  site_id: SITE_META.en.siteId,
  locale: SITE_META.en.locale,
  enabled: true,
  eyebrow: '',
  title: '',
  body: '',
  cta_primary_label: '',
  cta_primary_url: '',
  cta_secondary_label: '',
  cta_secondary_url: '',
  media_id: '',
  media_alt: '',
  draft_version: 2,
  published_version: 2,
};

export const announcementSection: AnnouncementSection = {
  ...base,
  section_key: 'announcement',
  sort_order: 10,
  body: 'Freight moving to the U.S.? Get a shipment plan from a logistics specialist.',
  cta_primary_label: 'Get a shipment plan',
  cta_primary_url: '#enquiry',
  items: [],
  settings: {},
};

export const heroSection: HeroSection = {
  ...base,
  section_key: 'hero',
  sort_order: 20,
  eyebrow: 'Global sourcing & freight, clearly coordinated',
  title: 'From China sourcing to U.S. delivery, keep every handoff clear.',
  body: 'FreightVanta helps growing businesses coordinate product sourcing, shipment preparation, ocean and air freight, customs information, warehousing, fulfillment, and final delivery through one practical operating plan.',
  cta_primary_label: 'Get a shipment plan',
  cta_primary_url: '#enquiry',
  cta_secondary_label: 'Explore solutions',
  cta_secondary_url: '#services',
  media_id: 'hero-port-warehouse',
  media_alt: 'Container cargo moving through a port-to-warehouse freight handoff for U.S. delivery.',
  items: [],
  settings: {
    microcopy:
      'Start with a product link, a shipment brief, or the route you need to plan. We will help identify the next useful step.',
    route_labels: ['ORIGIN', 'PORT', 'WAREHOUSE', 'CUSTOMER'],
  },
};

export const coverageSection: CoverageSection = {
  ...base,
  section_key: 'coverage',
  sort_order: 30,
  title: 'Capabilities in scope',
  items: [
    { label: 'China product sourcing', href: '/solutions/product-sourcing' },
    { label: 'Ocean freight', href: '/solutions/ocean-freight' },
    { label: 'Air freight', href: '/solutions/air-freight' },
    { label: 'Customs coordination', href: '/solutions/customs-coordination' },
    { label: 'Warehousing & fulfillment', href: '/solutions/warehousing-fulfillment' },
    { label: 'Final-mile delivery', href: '/solutions/ground-final-mile' },
  ],
  settings: {},
};

export const servicePathsSection: ServicePathsSection = {
  ...base,
  section_key: 'service_paths',
  sort_order: 40,
  eyebrow: 'What we coordinate',
  title: 'One operating view from supplier to customer.',
  body: 'Your shipment rarely follows one simple step. We connect sourcing, preparation, transport, customs, storage, and delivery into a workflow your team can follow.',
  items: SERVICES.filter((service) => service.inSelector).map((service) => ({
    id: service.slug,
    label: service.label,
    title: service.title,
    copy: service.copy,
    tags: service.tags,
    link_label: service.linkLabel,
    link_url: `/solutions/${service.slug}`,
    media_id: service.mediaId,
    media_alt: service.mediaAlt,
    starting_point: service.startingPoint,
  })),
  settings: {
    panel_cta_label: 'See how this service fits your shipment',
    default_tab: 'product-sourcing',
  },
};

export const operationSection: OperationSection = {
  ...base,
  section_key: 'operation',
  sort_order: 50,
  eyebrow: 'One connected operation',
  title: 'The details are where reliability is built.',
  cta_primary_label: 'How the work moves forward',
  cta_primary_url: '#process',
  items: [
    {
      title: 'A named point of contact',
      copy: 'One person keeps the request, supplier questions, shipment notes, and next action in the same working thread.',
    },
    {
      title: 'Checks before dispatch',
      copy: 'Confirm product condition, quantity, and agreed packaging instructions before goods leave the facility.',
    },
    {
      title: 'Flexible shipment preparation',
      copy: 'Consolidate orders, separate destinations, or hold inventory according to the plan your team approves.',
    },
    {
      title: 'Trackable handoffs',
      copy: 'Keep carrier references and status notes together so your team can see what changed and what happens next.',
    },
  ],
  settings: {
    pull_quote: 'One clear operating view—from the first product or supplier decision through the delivery handoff.',
  },
};

export const processSection: ProcessSection = {
  ...base,
  section_key: 'process',
  sort_order: 60,
  title: 'A practical process for complex freight.',
  body: 'The point is not to make logistics look simple. It is to keep the next decision, document, and handoff visible before it becomes a delay.',
  items: [
    {
      step: '01',
      title: 'Tell us what is moving.',
      copy: 'Share product links, quantities, origin, destination, target date, and any packaging or compliance needs.',
    },
    {
      step: '02',
      title: 'Review the plan.',
      copy: 'We clarify the proposed service path, open questions, required documents, and responsibilities before work starts.',
    },
    {
      step: '03',
      title: 'Coordinate every handoff.',
      copy: 'Sourcing, purchasing, inspection, preparation, freight, storage, and delivery updates follow one working record.',
    },
    {
      step: '04',
      title: 'Keep your customer promise.',
      copy: 'Receive the tracking and exception notes your team needs to plan inventory and customer communication.',
    },
  ],
  settings: {
    closing: 'If an assumption changes, the plan should show the change instead of hiding it in a long email chain.',
  },
};

export const industriesSection: IndustriesSection = {
  ...base,
  section_key: 'industries',
  sort_order: 70,
  title: 'Built for teams that have something to lose in the handoff.',
  body: 'Different goods need different checks, documents, and delivery conversations. The work starts with the constraint that matters most to your operation.',
  cta_primary_label: 'Explore industry solutions',
  cta_primary_url: '/industries',
  media_id: 'industry-receiving',
  media_alt: 'Receiving coordinator checking a delivery of retail cartons, consumer goods, and a crate of industrial parts at a warehouse dock.',
  items: INDUSTRIES.map((industry) => ({
    slug: industry.slug,
    name: industry.name,
    copy: industry.copy,
    href: `/industries/${industry.slug}`,
  })),
  settings: {
    media_caption: 'Receiving & inspection handoff',
  },
};

export const resourcesSection: ResourcesSection = {
  ...base,
  section_key: 'resources',
  sort_order: 80,
  eyebrow: 'Planning resources',
  title: 'Shipping intelligence for better decisions.',
  body: 'Practical guides for China sourcing, international freight, import preparation, Incoterms, supplier coordination, and the decisions that sit between “ordered” and “delivered.”',
  cta_primary_label: 'Visit the resource center',
  cta_primary_url: '/guides',
  items: [
    { label: 'Import planning checklist', href: '/guides/import-planning-checklist' },
    { label: 'Ocean freight or air freight?', href: '/guides/ocean-or-air-freight' },
    { label: 'How to prepare a China sourcing brief', href: '/guides/china-sourcing-brief' },
    { label: 'Packaging and insert guide', href: '/guides/packaging-insert-guide' },
  ],
  settings: {
    heading_url: '/guides',
    article_limit: 3,
    topics_label: 'Start with a topic',
  },
};

export const faqSection: FaqSection = {
  ...base,
  section_key: 'faq',
  sort_order: 90,
  title: 'Questions before you move?',
  items: [
    {
      id: 'product-link',
      question: 'Can I start with only a product link?',
      answer:
        'Yes. A product link, photo, or short specification is enough for an initial sourcing conversation. Quantities, destination, and timing can follow as the plan becomes clearer.',
    },
    {
      id: 'sourcing-fulfillment',
      question: 'Can you combine sourcing and fulfillment?',
      answer:
        'The homepage presents sourcing, preparation, freight, storage, and fulfillment as one connected workflow. The final scope is confirmed in the shipment plan.',
    },
    {
      id: 'ocean-air',
      question: 'Can you help with both ocean and air freight?',
      answer:
        'Yes. Tell us what is moving, how quickly it needs to arrive, and what matters most to the shipment. We can discuss the practical service path and next handoff.',
    },
    {
      id: 'customs',
      question: 'Do you provide customs clearance?',
      answer:
        'We coordinate shipment information and document handoffs. The responsible broker, jurisdiction, classification, and formal clearance scope must be identified before making a clearance commitment.',
    },
    {
      id: 'us-warehousing',
      question: 'Can you support warehousing and fulfillment in the United States?',
      answer:
        'Tell us the receiving, storage, preparation, and release requirements. The available operating scope should be confirmed in the plan before inventory moves.',
    },
    {
      id: 'single-service',
      question: 'Can I request just one service?',
      answer:
        'Yes. You can start with sourcing, transport, storage, packaging, fulfillment, or a combined plan. The form should let you choose the starting point.',
    },
  ],
  settings: {
    aside_prompt: 'Don’t see your question here? Start with what you know — a specialist will help with the rest.',
    aside_link_label: 'Tell us what is moving',
    aside_link_url: '#enquiry',
  },
};

export const enquirySection: EnquirySection = {
  ...base,
  section_key: 'enquiry',
  sort_order: 100,
  eyebrow: 'Request a shipment plan',
  title: 'Tell us what you need to move. We will turn the moving parts into a plan your team can use.',
  body: 'Start with the product, the route, or the delivery outcome you need. A FreightVanta specialist will review the details and come back with the right next step.',
  items: [],
  settings: {
    button: 'Request a shipment plan',
    loading: 'Sending your request…',
    success_title: 'Thanks — your request is on its way.',
    success_body: 'A FreightVanta specialist will review the details and follow up with the right next step.',
    error:
      'We could not send the request yet. Please check the highlighted fields and try again, or contact us using the details below.',
    reassurance: [
      'A product link, photo, or short specification is enough for an initial sourcing conversation.',
      'You can start with sourcing, transport, storage, packaging, fulfillment, or a combined plan.',
      'The final scope is confirmed in the shipment plan.',
    ],
    consent_prefix: 'I agree that FreightVanta may use these details to review my request and follow up with me, as described in the',
    consent_link_label: 'privacy policy',
    consent_suffix: '.',
  },
};

export const footerSection: FooterSection = {
  ...base,
  section_key: 'footer',
  sort_order: 110,
  body: 'One practical plan, clear ownership, and updates you can act on.',
  cta_primary_label: 'Get a shipment plan',
  cta_primary_url: '#enquiry',
  items: [
    { key: 'brand', title: 'FreightVanta' },
    { key: 'solutions', title: 'Solutions' },
    { key: 'industries', title: 'Industries & Insights' },
    { key: 'contact', title: 'Contact & legal' },
  ],
  settings: {},
};

export const HOME_SECTIONS: HomeSection[] = [
  announcementSection,
  heroSection,
  coverageSection,
  servicePathsSection,
  operationSection,
  processSection,
  industriesSection,
  resourcesSection,
  faqSection,
  enquirySection,
  footerSection,
];

/** Published, enabled sections in display order (the renderer never shows drafts). */
export function getPublishedHomeSections(): HomeSection[] {
  return HOME_SECTIONS.filter((section) => section.enabled && section.published_version > 0).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
}

export const HOME_META = {
  title: 'China Sourcing, International Freight & Fulfillment | FreightVanta',
  description:
    'FreightVanta coordinates China product sourcing, ocean and air freight, shipment preparation, warehousing, fulfillment, and U.S. delivery through one practical shipment plan.',
  path: '/',
};
