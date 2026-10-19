/**
 * Topic page: Bulk Procurement From China (/services/bulk-procurement).
 * Verbatim v2 doc §4 — copy used 100% as specified.
 */
import type { TopicPageContent } from './types';
import { RELATED_RAIL } from './types';

export const BULK_PROCUREMENT_TOPIC: TopicPageContent = {
  id: 'bulk-procurement',
  kind: 'service',
  route: '/services/bulk-procurement',
  pageLabel: 'Bulk Procurement from China',
  breadcrumbParent: { label: 'Services', href: '#services' },
  meta: {
    title: 'Bulk Procurement From China: Plan the Next Purchase | FreightVanta',
    description:
      'Prepare a bulk purchase from China with clearer quantities, supplier questions, inventory decisions, packaging requirements, and receiving instructions.',
    keywords: [
      'bulk procurement from China',
      'bulk order from China',
      'China bulk purchasing',
      'bulk procurement planning',
      'staged inventory release',
    ],
  },
  serviceName: 'Bulk Procurement from China',
  startingPoint: 'product-sourcing',
  formButton: 'Request a bulk procurement plan',
  hero: {
    kicker: 'BULK PROCUREMENT FROM CHINA',
    title: 'Plan a bulk purchase from China before quantity creates expensive loose ends.',
    body: 'A larger purchase is not simply a smaller order with more units. It can change the production questions, packaging requirement, payment discussion, receiving method, inventory purpose and release plan. FreightVanta helps turn those connected decisions into one working procurement brief before a bulk purchase from China moves to the next stage. Your team remains responsible for supplier selection, commercial terms and final approval.',
    primaryCta: 'Request a bulk procurement plan',
    secondaryCta: 'See the planning steps',
    mediaId: 'industry-receiving',
    mediaAlt:
      'Neat bulk cartons with product labels being checked against a procurement brief at a warehouse dock.',
    rail: [
      { step: '01', label: 'OBJECTIVE', note: 'Approved product and purchase goal' },
      { step: '02', label: 'QUESTIONS', note: 'One supplier question set' },
      { step: '03', label: 'APPROVAL', note: 'Owners before the next move' },
      { step: '04', label: 'INVENTORY', note: 'Named purpose and release rule' },
      { step: '05', label: 'HANDOFF', note: 'Into storage, freight, or fulfillment' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'A bulk order needs a destination plan, not only a confirmed quantity.',
        paragraphs: [
          'Before a supplier starts the next production run, the buyer should be able to answer which product version is approved, whether the quantity is for one shipment or staged replenishment, which packaging and labels travel with the goods, how stock will be identified, and who approves a change. The page organizes those questions; it does not promise a price, production date, inspection outcome or shipping result.',
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'mist',
      content: {
        heading: 'Use bulk procurement planning when the next purchase affects more than one handoff.',
        cards: [
          {
            title: 'TEST ORDER TO PLANNED BUY',
            copy: 'A larger buy introduces product version, unit packing, carton markings, stock location and release decisions that small orders may have hidden.',
          },
          {
            title: 'LAUNCH, REPLENISHMENT OR RETAIL WINDOW',
            copy: 'A target date needs owners for product, quantity, packaging, inbound instruction and destination; it is not by itself a delivery guarantee.',
          },
          {
            title: 'ONE PURCHASE, SEVERAL DESTINATIONS',
            copy: 'Record whether stock is for storage, freight release, retailer delivery or customer fulfillment so the next team does not rebuild the context.',
          },
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'white',
      content: {
        heading: 'Keep the larger decision connected.',
        steps: [
          { copy: 'Confirm purchasing objective and approved product reference.' },
          { copy: 'Create a supplier question set for product, packing, cartons and delivery terms.' },
          { copy: 'Set approval owners for evidence, artwork, commercial milestones and release instructions.' },
          { copy: 'Plan inventory handoff: identifier, count, carton/pallet information and receiving destination.' },
          { copy: 'Prepare packaging and release instructions for labels, inserts, bundles and supplier-material removal.' },
          { copy: 'Coordinate the confirmed next movement into storage, freight, retail delivery or fulfillment.' },
        ],
      },
    },
    {
      type: 'controls',
      tone: 'mist',
      content: {
        heading: 'What the bulk procurement plan can organize.',
        groups: [
          {
            label: 'Included coordination',
            items: [
              'Product/quantity brief',
              'Supplier questions',
              'Inventory readiness',
              'Packaging handoff',
              'Release ownership',
            ],
          },
          {
            label: 'Confirm first',
            items: [
              'Price negotiation or savings',
              'Contracts/payment/trade finance',
              'Factory audit',
              'Inspection/testing',
              'Certification',
              'Capacity',
              'Shipping rate and timing',
            ],
          },
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'white',
      content: {
        heading: 'Bring the purchase context, not just the quantity.',
        items: [
          'Product link or approved sample.',
          'Target quantity and reorder pattern.',
          'Known supplier.',
          'Target market and destination.',
          'Product variation, material, finish, dimensions and packaging.',
          'Desired ready period.',
          'Next handoff.',
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'A larger purchase remains easier to explain after it is approved.',
        items: [
          'One brief travels with the decision.',
          'Approval points are visible before they become delays.',
          'Inventory has a named purpose.',
          'Change has a place to go.',
        ],
      },
    },
    {
      type: 'faq',
      tone: 'white',
      content: {
        heading: 'Bulk procurement from China: questions worth answering early.',
        items: [
          {
            id: 'bulk-pricing',
            question: 'Does FreightVanta guarantee lower pricing for a bulk order from China?',
            answer: 'No savings or discount is promised without a written commercial scope.',
          },
          {
            id: 'bulk-stages',
            question: 'Can a bulk purchase be released in stages?',
            answer:
              'It can be planned when receiving, storage, packaging, freight and approval instructions are confirmed.',
          },
          {
            id: 'bulk-existing-supplier',
            question: 'Can we start from an existing supplier?',
            answer: 'Yes, if product version, quantity, packaging, destination and approval path are provided.',
          },
          {
            id: 'bulk-inspection',
            question: 'Does bulk procurement include quality inspection?',
            answer: 'Not automatically; acceptance standards, audit, testing and compliance require confirmation.',
          },
          {
            id: 'bulk-fulfillment',
            question: 'Can bulk procurement connect to fulfillment?',
            answer: 'Yes, once stock identification, packaging and order-preparation rules are stable.',
          },
          {
            id: 'bulk-range',
            question: 'What happens when quantity is still under review?',
            answer:
              'Keep a range and the decision owner visible rather than presenting an unapproved figure as final.',
          },
        ],
      },
    },
  ],
  related: {
    heading: 'Related services',
    links: [
      { ...RELATED_RAIL['product-sourcing'] },
      { ...RELATED_RAIL['inventory-storage'] },
      { ...RELATED_RAIL['worldwide-fulfillment'] },
    ],
  },
  enquiry: {
    kicker: 'Start the conversation',
    heading: 'Start with the product, the planned quantity, and the next place the goods need to go.',
    body: 'Share the product reference, quantity, known supplier, intended market, target ready period, packaging requirement and planned storage, freight, retail or fulfillment handoff.',
    reassurance: [],
    contextTitle: 'About this bulk procurement enquiry',
    contextFields: [
      { name: 'quantity_range', label: 'Quantity range' },
      { name: 'reorder_pattern', label: 'Reorder pattern' },
      { name: 'stock_purpose', label: 'Stock purpose' },
      { name: 'planned_release', label: 'Planned release' },
    ],
  },
};
