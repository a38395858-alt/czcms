/**
 * Topic page: Consumer Goods (/industries/consumer-goods).
 * Verbatim v2 doc §10 — copy used 100% as specified.
 */
import type { TopicPageContent } from './types';
import { RELATED_RAIL } from './types';

export const CONSUMER_GOODS_TOPIC: TopicPageContent = {
  id: 'industry-consumer-goods',
  kind: 'industry',
  route: '/industries/consumer-goods',
  pageLabel: 'Consumer Goods',
  breadcrumbParent: { label: 'Industries', href: '/industries' },
  meta: {
    title: 'Consumer Goods Logistics From China | FreightVanta',
    description:
      'Coordinate China-sourced consumer goods from product reference and packaging through inbound inventory, channel release and customer-ready handoff.',
    keywords: [
      'consumer goods logistics from China',
      'consumer goods sourcing and packaging from China',
      'China consumer goods supply chain coordination',
      'retail-ready consumer goods handoff',
    ],
  },
  serviceName: null,
  startingPoint: null,
  formButton: 'Request a consumer goods plan',
  hero: {
    kicker: 'CONSUMER GOODS',
    title: 'Move consumer goods from a China product reference to a retail-ready or customer-ready handoff.',
    body: 'A consumer product is more than the item inside the carton. Product version, presentation, packaging, inbound evidence, channel and release owner all shape the next decision. FreightVanta helps organize those handoffs for DTC, subscription, retail, wholesale, seasonal and replenishment contexts without assuming product quality, compliance, storage capacity or delivery coverage.',
    primaryCta: 'Request a consumer goods plan',
    secondaryCta: 'See the operating path',
    mediaId: 'industry-consumer-goods',
    mediaAlt: 'A customer unboxing a small unbranded consumer product from a carton with paper fill.',
    rail: [
      { label: 'PRODUCT' },
      { label: 'SOURCE' },
      { label: 'PRESENT' },
      { label: 'RECEIVE' },
      { label: 'RELEASE' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'The product experience starts before the customer opens the carton.',
        paragraphs: [
          'The active product, package, insert, label, bundle and receiving rule should describe the same customer-facing version. A change in artwork, component or product variant needs an owner and an effective date before stock is released.',
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'mist',
      content: {
        heading: 'Six-step workflow',
        steps: [
          { copy: 'Approved product reference.' },
          { copy: 'China sourcing or purchase handoff.' },
          { copy: 'Packaging and presentation rule.' },
          { copy: 'Inbound count and evidence context.' },
          { copy: 'Channel-specific release rule.' },
          { copy: 'Customer/retail handoff and exception path.' },
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'white',
      content: {
        heading: 'Release contexts',
        cards: [
          {
            title: 'DTC / SUBSCRIPTION',
            copy: 'Replenishment cycle, bundle, insert and customer order rule.',
          },
          {
            title: 'RETAIL / WHOLESALE',
            copy: 'Pack quantity, carton/label and retailer instruction to confirm.',
          },
          {
            title: 'SEASONAL / CAMPAIGN',
            copy: 'Active date, launch stock, destination and escalation owner.',
          },
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'Product-context checklist',
        items: [
          'Product version.',
          'Material/variant.',
          'Packaging/presentation.',
          'Destination channel.',
          'Inbound evidence.',
          'Stock purpose.',
          'Release owner.',
          'Exception decision.',
        ],
      },
    },
    {
      type: 'controls',
      tone: 'navy',
      content: {
        heading: 'Operating controls',
        paragraphs: [
          'Coordination can organize product/version, packaging, evidence and release questions. Quality, inspection, product compliance, claims, regulations, storage, rates, returns and delivery capability remain subject to confirmation.',
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'white',
      content: {
        heading: 'Planning brief',
        body: 'Send the product reference, target market/channel, expected quantity, packaging direction, inbound timing, customer/retailer requirement and current blocker. Unknowns are retained as open questions.',
      },
    },
    {
      type: 'faq',
      tone: 'mist',
      content: {
        heading: 'Consumer goods: questions worth answering early.',
        items: [
          {
            id: 'cg-regulations',
            question: 'Can you guarantee a consumer product meets local regulations?',
            answer: 'No; qualified compliance review is required.',
          },
          {
            id: 'cg-retail',
            question: 'Can you prepare retail-ready packaging?',
            answer: 'Packaging/packout can be planned when files, components and instructions are approved.',
          },
          {
            id: 'cg-seasonal',
            question: 'Can you handle seasonal launch stock?',
            answer: 'The stock path can be planned; dates and capacity require confirmation.',
          },
          {
            id: 'cg-fulfilled',
            question: 'Can products be sourced from China and then fulfilled?',
            answer: 'Yes, through confirmed service handoffs.',
          },
          {
            id: 'cg-testing',
            question: 'Do you provide product testing?',
            answer: 'Only when testing method and scope are explicitly confirmed.',
          },
          {
            id: 'cg-first',
            question: 'What should a brand send first?',
            answer: 'Product version, channel, packaging, quantity, destination and desired handoff.',
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
      { ...RELATED_RAIL['bulk-procurement'] },
      { ...RELATED_RAIL['inventory-storage'] },
      { ...RELATED_RAIL['worldwide-fulfillment'] },
    ],
  },
  enquiry: {
    kicker: 'Start the conversation',
    heading: 'Start with the product customers will see, the channel it must reach, and the next release decision.',
    reassurance: [],
    contextTitle: 'About this consumer goods enquiry',
    contextFields: [
      { name: 'industry_context', label: 'Industry context' },
      { name: 'business_consequence', label: 'Business consequence' },
      { name: 'receiving_owner', label: 'Receiving owner' },
      { name: 'route_concern', label: 'Route concern' },
    ],
  },
};
