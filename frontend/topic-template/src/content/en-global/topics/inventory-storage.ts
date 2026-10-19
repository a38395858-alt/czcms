/**
 * Topic page: Inventory Storage (/services/inventory-storage).
 * Verbatim v2 doc §6 — copy used 100% as specified.
 */
import type { TopicPageContent } from './types';
import { RELATED_RAIL } from './types';

export const INVENTORY_STORAGE_TOPIC: TopicPageContent = {
  id: 'inventory-storage',
  kind: 'service',
  route: '/services/inventory-storage',
  pageLabel: 'Inventory Storage',
  breadcrumbParent: { label: 'Services', href: '#services' },
  meta: {
    title: 'Inventory Storage for Goods From China | FreightVanta',
    description:
      'Organize imported inventory receiving, identification, storage, release instructions, and exception decisions before goods move to freight, retail, or customer orders.',
    keywords: [
      'inventory storage for goods from China',
      'imported goods inventory management',
      'inventory receiving and release',
      'storage for China-sourced products',
    ],
  },
  serviceName: 'Inventory Storage for Goods From China',
  startingPoint: 'warehousing-fulfillment',
  formButton: 'Request an inventory storage plan',
  hero: {
    kicker: 'INVENTORY STORAGE',
    title: 'Give imported inventory a clear receiving, storage, and release plan.',
    body: 'When goods arrive from China, the next question is not only where they sit. The team needs to know what arrived, which product version it belongs to, how it is identified, what evidence is recorded, what may be released, and who decides when a count, carton, label or destination does not match. FreightVanta helps organize that operating record before storage and release scope is confirmed.',
    primaryCta: 'Request an inventory storage plan',
    secondaryCta: 'See the receiving-to-release workflow',
    mediaId: 'service-warehousing',
    mediaAlt:
      'Warehouse receiving area with scanned labels, unbranded cartons, partitioned inventory, and a release checklist.',
    rail: [
      { step: '01', label: 'NOTICE', note: 'Expected inbound and documents' },
      { step: '02', label: 'RECEIVE', note: 'Identify cartons and version' },
      { step: '03', label: 'RECORD', note: 'Count, condition, evidence' },
      { step: '04', label: 'PURPOSE', note: 'Hold, store, release owner' },
      { step: '05', label: 'RELEASE', note: 'To freight, retail, or fulfillment' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'Storage is useful when the next release decision is visible.',
        paragraphs: [
          'A warehouse address or a stock count alone does not tell the next team whether goods are sellable, reserved, awaiting evidence, intended for a retailer, or held for a later fulfillment order. A receiving-to-release record connects product identity, quantity, packaging, destination and approval owner.',
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
            title: 'GOODS ARE ARRIVING BEFORE THE FINAL RELEASE',
            copy: 'Record expected cartons, product identity and hold/release rule.',
          },
          {
            title: 'ONE INBOUND FEEDS MULTIPLE DESTINATIONS',
            copy: 'Separate retail, freight, replenishment and order-preparation purpose.',
          },
          {
            title: 'INVENTORY INFORMATION IS SCATTERED',
            copy: 'Unite SKU/reference, count, images, damage notes and open decisions.',
          },
          {
            title: 'PACKAGING OR BRAND MATERIALS ARE STORED WITH THE PRODUCT',
            copy: 'Keep component and packout versions visible.',
          },
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'white',
      content: {
        heading: 'Receiving-to-release workflow',
        steps: [
          { copy: 'Prepare expected inbound notice and document context.' },
          { copy: 'Receive and identify cartons, pallets, products and active version.' },
          { copy: 'Record count, visible condition and evidence required by confirmed scope.' },
          { copy: 'Assign stock purpose, hold status, storage instruction and release owner.' },
          { copy: 'Connect packaging, label, bundle or destination rule.' },
          { copy: 'Release to confirmed freight, retailer, fulfillment or another nominated handoff.' },
          { copy: 'Escalate discrepancy, damage, missing document or quantity difference for a decision.' },
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
              'Receiving brief',
              'Inventory identifiers',
              'Count/release rule',
              'Exception path',
              'Handoff record',
            ],
          },
          {
            label: 'Confirm first',
            items: [
              'Warehouse location',
              'Capacity',
              'Storage fee',
              'Insurance',
              'Temperature/special handling',
              'Inspection standard',
              'Inventory system integration and actual country coverage',
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
          'Expected inbound date or period.',
          'Cartons/pallets.',
          'Product and SKU list.',
          'Supplier and origin.',
          'Active packaging/version.',
          'Destination or stock purpose.',
          'Count and evidence requirement.',
          'Release owner.',
          'Special handling or restriction to review.',
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'Inventory status and order status stay separate.',
        items: ['Received', 'Identified', 'Held', 'Available', 'Reserved', 'Released', 'Exception'],
      },
    },
    {
      type: 'faq',
      tone: 'white',
      content: {
        heading: 'Inventory storage: questions worth answering early.',
        items: [
          {
            id: 'store-can',
            question: 'Can you store products imported from China?',
            answer:
              'Share origin, product, quantity, timing and destination; actual location, capacity and handling must be confirmed.',
          },
          {
            id: 'store-stages',
            question: 'Can inventory be released in stages?',
            answer: 'Yes, when stock purpose, identification and approval owner are defined.',
          },
          {
            id: 'store-count',
            question: 'Do you guarantee a count or inspection result?',
            answer: 'No; evidence, inspection and acceptance standards require explicit scope.',
          },
          {
            id: 'store-components',
            question: 'Can packaging and inserts remain with the inventory?',
            answer: 'They can be included in an approved component and release rule.',
          },
          {
            id: 'store-fulfillment',
            question: 'Can storage connect to fulfillment?',
            answer: 'Yes, once sellable identity, packing rule and order handoff are ready.',
          },
          {
            id: 'store-mismatch',
            question: 'What happens if cartons do not match the notice?',
            answer: 'Record the discrepancy and route it to the named decision owner before release.',
          },
        ],
      },
    },
  ],
  related: {
    heading: 'Related services',
    links: [
      {
        label: 'Bulk Procurement',
        href: '/services/bulk-procurement',
        note: RELATED_RAIL['bulk-procurement'].note,
      },
      { ...RELATED_RAIL['packaging-branding'] },
      { ...RELATED_RAIL['worldwide-fulfillment'] },
    ],
  },
  enquiry: {
    kicker: 'Start the conversation',
    heading: 'Start with what is arriving, what it is for, and who can release it.',
    reassurance: [],
    contextTitle: 'About this inventory enquiry',
    contextFields: [
      { name: 'inbound_cartons', label: 'Inbound cartons' },
      { name: 'sku_identifier', label: 'SKU/identifier' },
      { name: 'receiving_evidence', label: 'Receiving evidence' },
      { name: 'release_destination', label: 'Release destination' },
    ],
  },
};
