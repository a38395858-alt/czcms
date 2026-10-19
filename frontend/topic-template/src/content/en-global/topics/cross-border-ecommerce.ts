/**
 * Topic page: Cross-border Ecommerce (/industries/cross-border-ecommerce).
 * Verbatim v2 doc §9 — copy used 100% as specified.
 */
import type { TopicPageContent } from './types';
import { RELATED_RAIL } from './types';

export const CROSS_BORDER_ECOMMERCE_TOPIC: TopicPageContent = {
  id: 'industry-cross-border-ecommerce',
  kind: 'industry',
  route: '/industries/cross-border-ecommerce',
  pageLabel: 'Cross-border Ecommerce',
  breadcrumbParent: { label: 'Industries', href: '/industries' },
  meta: {
    title: 'Cross-Border Ecommerce Logistics From China | FreightVanta',
    description:
      'Plan a cross-border ecommerce operating path from China sourcing to product checks, packout, inbound inventory, release and customer-ready orders.',
    keywords: [
      'cross-border ecommerce logistics from China',
      'China ecommerce supply chain coordination',
      'ecommerce sourcing and fulfillment from China',
      'retail-ready ecommerce inventory',
    ],
  },
  serviceName: null,
  startingPoint: null,
  formButton: 'Plan your ecommerce handoff',
  hero: {
    kicker: 'CROSS-BORDER ECOMMERCE',
    title: 'Connect the China sourcing decision to the order your customer is ready to receive.',
    body: 'Cross-border ecommerce is a chain of connected decisions: product reference, supplier questions, specification, packaging, inbound inventory, release rule and customer order. FreightVanta helps make that chain visible so the next team can act on the same product and packout context. Carrier coverage, delivery timing, customs, platform integration and service availability remain subject to the confirmed destination and scope.',
    primaryCta: 'Plan your ecommerce handoff',
    secondaryCta: 'See the operating path',
    mediaId: 'industry-ecommerce',
    mediaAlt: 'Warehouse team handling cartons beside organized shelving.',
    rail: [
      { label: 'PRODUCT' },
      { label: 'CHECKS' },
      { label: 'PACKOUT' },
      { label: 'INBOUND' },
      { label: 'RELEASE' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'Ecommerce is a sequence of commitments, not one shipping label.',
        paragraphs: [
          'The product a customer sees must be connected to the product that was sourced, the version that was packed, the inventory that was received and the order that is released. If any link is unclear, the next team must ask the same question again or make an assumption that changes the customer experience.',
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'mist',
      content: {
        heading: 'From China sourcing to customer-ready orders.',
        steps: [
          { title: 'PRODUCT REFERENCE', copy: 'Product link, specification, version and market context.' },
          {
            title: 'CHINA SOURCING HANDOFF',
            copy: 'Supplier question set, response comparison and open decisions.',
          },
          { title: 'PACKOUT RULE', copy: 'Packaging, insert, label, bundle and supplier-material rule.' },
          { title: 'INBOUND CONTEXT', copy: 'SKU, quantity, receiving evidence and stock purpose.' },
          { title: 'ORDER RELEASE', copy: 'Pick, pack, label, shipping handoff and exception owner.' },
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'white',
      content: {
        heading: 'One product, different operating contexts.',
        cards: [
          {
            title: 'DTC / SUBSCRIPTION',
            copy: 'Order source, bundle, insert, replenishment and customer-facing rule.',
          },
          {
            title: 'RETAIL / WHOLESALE',
            copy: 'Carton, label, pack quantity, delivery appointment or retailer instruction to be confirmed.',
          },
          {
            title: 'SEASONAL / CAMPAIGN',
            copy: 'Active date, stock purpose, launch window and escalation owner.',
          },
        ],
      },
    },
    {
      type: 'controls',
      tone: 'navy',
      content: {
        heading: 'What must be clear before stock moves.',
        items: [
          'Can the product be identified by an active SKU/version?',
          'Is the packout rule tied to the current product?',
          'Who can release or hold stock?',
          'What evidence is expected at inbound?',
          'What happens when quantity, address, label or product differs?',
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'Start with the operating facts you already have.',
        items: [
          'Product/SKU list.',
          'China supplier or product reference.',
          'Target markets and channels.',
          'Order profile.',
          'Packaging and brand materials.',
          'Expected inbound.',
          'Customer promise.',
          'Current blocker.',
          'Decision owner.',
        ],
      },
    },
    {
      type: 'faq',
      tone: 'white',
      content: {
        heading: 'Cross-border ecommerce: questions worth answering early.',
        items: [
          {
            id: 'ec-manage',
            question: 'Can you manage our entire cross-border ecommerce supply chain?',
            answer:
              'The page connects confirmed service handoffs; actual services and countries require scope review.',
          },
          {
            id: 'ec-dates',
            question: 'Can you guarantee delivery dates?',
            answer: 'No; route, carrier, customs and destination conditions must be confirmed.',
          },
          {
            id: 'ec-store',
            question: 'Can you support Shopify or another store?',
            answer: 'Do not promise an integration before platform/data support is verified.',
          },
          {
            id: 'ec-connect',
            question: 'Can sourcing, packaging, storage and fulfillment be connected?',
            answer: 'Yes, when each handoff has an approved record.',
          },
          {
            id: 'ec-seasonal',
            question: 'Can seasonal inventory be released in stages?',
            answer: 'It can be planned with stock purpose, release owner and confirmed destination.',
          },
          {
            id: 'ec-first',
            question: 'What should an ecommerce brand send first?',
            answer: 'Product/SKU, markets, order source, packaging, timing and the current operational decision.',
          },
        ],
      },
    },
  ],
  related: {
    heading: 'Related services',
    links: [
      {
        label: 'Product Sourcing',
        href: '/product-sourcing',
        note: RELATED_RAIL['product-sourcing'].note,
      },
      { ...RELATED_RAIL['packaging-branding'] },
      { ...RELATED_RAIL['inventory-storage'] },
      { ...RELATED_RAIL['worldwide-fulfillment'] },
    ],
  },
  enquiry: {
    kicker: 'Start the conversation',
    heading: 'Make the next ecommerce handoff easier to approve.',
    body: 'Share your product, channels, destination markets, inventory position and current blocker. We will map the practical questions before a service scope is confirmed.',
    reassurance: [],
    contextTitle: 'About this ecommerce enquiry',
    contextFields: [
      { name: 'industry_context', label: 'Industry context' },
      { name: 'business_consequence', label: 'Business consequence' },
      { name: 'receiving_owner', label: 'Receiving owner' },
      { name: 'route_concern', label: 'Route concern' },
    ],
  },
};
