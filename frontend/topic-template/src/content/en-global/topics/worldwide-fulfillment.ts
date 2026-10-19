/**
 * Topic page: Worldwide Fulfillment (/services/worldwide-fulfillment).
 * Verbatim v2 doc §8 — copy used 100% as specified.
 */
import type { TopicPageContent } from './types';
import { RELATED_RAIL } from './types';

export const WORLDWIDE_FULFILLMENT_TOPIC: TopicPageContent = {
  id: 'worldwide-fulfillment',
  kind: 'service',
  route: '/services/worldwide-fulfillment',
  pageLabel: 'Worldwide Fulfillment',
  breadcrumbParent: { label: 'Services', href: '#services' },
  meta: {
    title: 'Fulfillment for China-Sourced Products | FreightVanta',
    description:
      'Prepare China-sourced inventory for customer orders with clear picking, packing, label, shipping-handoff, and exception instructions.',
    keywords: [
      'fulfillment for China-sourced products',
      'worldwide fulfillment for imported products',
      'ecommerce fulfillment from China',
      'pick and pack handoff',
      'order exception workflow',
    ],
  },
  serviceName: 'Worldwide Fulfillment for China-Sourced Products',
  startingPoint: 'warehousing-fulfillment',
  formButton: 'Request a fulfillment setup plan',
  hero: {
    kicker: 'WORLDWIDE FULFILLMENT',
    title: 'Turn China-sourced inventory into customer-ready orders with a clear fulfillment plan.',
    body: 'Fulfillment is the operating layer between ready inventory and the customer promise. FreightVanta helps coordinate how China-sourced products are identified, picked, packed, labeled, handed to a shipping service, and managed when an order needs a decision. The right setup depends on product, order profile, destination, brand materials, order source and delivery requirement. This page does not promise warehouse locations, carrier coverage, automation, cut-off times, tracking behavior or worldwide delivery until those details are verified.',
    primaryCta: 'Request a fulfillment setup plan',
    secondaryCta: 'See the order lifecycle',
    mediaId: 'industry-ecommerce',
    mediaAlt:
      'Scanning, picking, packing, and label handoff for customer orders at a fulfillment station.',
    rail: [
      { step: '01', label: 'INVENTORY', note: 'Identified, sellable stock' },
      { step: '02', label: 'RULE', note: 'Active packout and bundle rule' },
      { step: '03', label: 'PICK & PACK', note: 'Pick, pack, label' },
      { step: '04', label: 'DISPATCH', note: 'Shipping handoff and reference' },
      { step: '05', label: 'EXCEPTIONS', note: 'Visible decision route' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'A customer order should not be the first time the team learns the packing rule.',
        paragraphs: [
          'Each sellable product needs an identifier, active packaging or bundle rule, destination instruction and exception path. A missing item, changed address, damaged component, stock difference or unclear label should create a visible decision request rather than an improvised customer-facing result.',
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'mist',
      content: {
        heading: 'When it fits',
        cards: [
          {
            title: 'MULTIPLE DESTINATIONS OR ORDER TYPES',
            copy: 'Different products, labels, documents and packing rules need one order lifecycle.',
          },
          {
            title: 'BRANDED COMPONENTS OR BUNDLES',
            copy: 'Inserts, gifts, multi-SKU combinations and excluded supplier material need active rules.',
          },
          {
            title: 'SEVERAL TEAMS TOUCH THE ORDER',
            copy: 'Separate received, sellable, picked, packed, dispatched and exception states.',
          },
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'white',
      content: {
        heading: 'Order lifecycle',
        steps: [
          { copy: 'Receive and identify inventory.' },
          { copy: 'Prepare sellable product/SKU and active packout rule.' },
          { copy: 'Create picking rule for included, excluded and approved substitutions.' },
          { copy: 'Apply packing and brand rule.' },
          { copy: 'Prepare labels and confirmed shipping handoff.' },
          { copy: 'Connect tracking reference where selected service provides it.' },
          { copy: 'Handle stock, address, damage, cancellation, delay or return question as an exception request.' },
        ],
      },
    },
    {
      type: 'controls',
      tone: 'mist',
      content: {
        heading: 'Scope controls',
        groups: [
          {
            label: 'Included coordination',
            items: [
              'Order-preparation workflow',
              'Bundle and brand components',
              'Exception path',
              'Tracking reference handoff where supported',
            ],
          },
          {
            label: 'Confirm first',
            items: [
              'Warehouse location',
              'Country coverage',
              'Carrier availability',
              'Prohibited goods',
              'Processing time',
              'Cut-off',
              'Rate',
              'Store API',
              'Returns and customs',
            ],
          },
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'white',
      content: {
        heading: 'Preparation checklist',
        items: [
          'Product/SKU list.',
          'Inventory context.',
          'Expected order volume and seasonality.',
          'Order source and data fields.',
          'Destination markets.',
          'Brand materials.',
          'Bundle/substitution/exclusion rule.',
          'Customer-service exception approach.',
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'Order preparation becomes visible before a customer is waiting for an answer.',
        items: [
          'Stock status and order status remain separate.',
          'Brand and bundle rules travel with the order.',
          'Exceptions have an accountable route.',
          'The workflow can grow by approved complexity.',
        ],
      },
    },
    {
      type: 'faq',
      tone: 'white',
      content: {
        heading: 'Worldwide fulfillment: questions worth answering early.',
        items: [
          {
            id: 'ff-worldwide',
            question: 'Can you fulfill customer orders worldwide?',
            answer:
              'Share intended markets; actual locations, carriers, product restrictions and destination availability must be verified.',
          },
          {
            id: 'ff-bundle',
            question: 'Can supplier material be removed or products bundled?',
            answer: 'Possible under an approved packing instruction.',
          },
          {
            id: 'ff-store',
            question: 'Can our ecommerce store connect automatically?',
            answer: 'No integration promise before platform and technical support are confirmed.',
          },
          {
            id: 'ff-tracking',
            question: 'How are tracking updates handled?',
            answer: 'Depends on selected shipping service and available integration.',
          },
          {
            id: 'ff-existing',
            question: 'Can fulfillment start with inventory already sourced from China?',
            answer: 'Yes, after product identity, quantity and packout rule are usable.',
          },
          {
            id: 'ff-returns',
            question: 'How are returns or address changes handled?',
            answer: 'Define the exception owner and response path before release.',
          },
        ],
      },
    },
  ],
  related: {
    heading: 'Related services',
    links: [
      { ...RELATED_RAIL['inventory-storage'] },
      { ...RELATED_RAIL['packaging-branding'] },
      {
        label: 'Product Sourcing',
        href: '/product-sourcing',
        note: RELATED_RAIL['product-sourcing'].note,
      },
    ],
  },
  enquiry: {
    kicker: 'Start the conversation',
    heading: 'Start with the products, the orders, and the customer-facing rule that must stay consistent.',
    reassurance: [],
    contextTitle: 'About this fulfillment enquiry',
    contextFields: [
      { name: 'order_source', label: 'Order source' },
      { name: 'sku_list', label: 'SKU list' },
      { name: 'destination_markets', label: 'Destination markets' },
      { name: 'bundle_rule', label: 'Bundle rule' },
      { name: 'exception_type', label: 'Exception type' },
    ],
  },
};
