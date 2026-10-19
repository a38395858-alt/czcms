/**
 * Topic page: Private Label & White Label (/services/private-white-label).
 * Verbatim v2 doc §7 — copy used 100% as specified.
 */
import type { TopicPageContent } from './types';
import { RELATED_RAIL } from './types';

export const PRIVATE_WHITE_LABEL_TOPIC: TopicPageContent = {
  id: 'private-white-label',
  kind: 'service',
  route: '/services/private-white-label',
  pageLabel: 'Private Label & White Label',
  breadcrumbParent: { label: 'Services', href: '#services' },
  meta: {
    title: 'Private Label Products From China | FreightVanta',
    description:
      'Coordinate product, brand assets, packaging versions, approval checkpoints, and fulfillment handoff for private-label and white-label programs from China.',
    keywords: [
      'private label products from China',
      'white label from China',
      'private label sourcing',
      'branded product version control',
      'private label packaging coordination',
    ],
  },
  serviceName: 'Private Label and White Label Products From China',
  startingPoint: 'product-sourcing',
  formButton: 'Request a private-label plan',
  hero: {
    kicker: 'PRIVATE LABEL / WHITE LABEL',
    title: 'Keep your private-label product, packaging, and approval record aligned from China to the next handoff.',
    body: 'A private-label program is more than putting a logo on an existing product. The product version, approved attributes, brand files, labels, packaging, inserts, supplier questions and fulfillment instruction need to refer to the same decision. FreightVanta helps organize that record and prepare the next confirmed handoff. Trademark, IP, legal labeling, product claims, compliance and manufacturing responsibility remain subject to qualified review and written scope.',
    primaryCta: 'Request a private-label plan',
    secondaryCta: 'See the approval workflow',
    mediaId: 'service-private-label',
    mediaAlt:
      'Unprinted packaging, version files, inserts, and product samples prepared for a private-label review.',
    rail: [
      { step: '01', label: 'PRODUCT', note: 'Reference and customer promise' },
      { step: '02', label: 'ASSETS', note: 'Brand files and packaging' },
      { step: '03', label: 'VERSION', note: 'Supplier state and samples' },
      { step: '04', label: 'APPROVAL', note: 'Owners, date, old stock' },
      { step: '05', label: 'HANDOFF', note: 'To storage or fulfillment' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'A branded product needs version control before it needs more volume.',
        paragraphs: [
          'The same product can have several names, artwork files, inserts, labels, bundles and market versions. The operating question is which version is active, who approved it, when it takes effect, what happens to existing stock and how the packout moves to the next team.',
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'mist',
      content: {
        heading: 'When this fits',
        cards: [
          {
            title: 'A WHITE-LABEL BASE PRODUCT NEEDS YOUR CUSTOMER-FACING VERSION',
            copy: 'Connect product reference, brand assets and packout.',
          },
          {
            title: 'A PRIVATE-LABEL PROGRAM IS MOVING FROM SAMPLE TO PURCHASE',
            copy: 'Keep sample approval, specification, quantity and artwork in one record.',
          },
          {
            title: 'A PACKAGING OR LANGUAGE REVISION IS COMING',
            copy: 'Define effective date and old-stock treatment.',
          },
          {
            title: 'THE PRODUCT MUST CONNECT TO STORAGE OR FULFILLMENT',
            copy: 'Carry SKU, label, bundle and exception rules downstream.',
          },
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'white',
      content: {
        heading: 'Approval and handoff workflow',
        steps: [
          { copy: 'Establish product reference, intended market and customer promise.' },
          { copy: 'Collect brand assets, artwork, wording, labels, inserts and packaging direction.' },
          { copy: 'Record supplier/product version, sample context and open commercial questions.' },
          { copy: 'Assign approval owners for product, creative, packaging and operations.' },
          { copy: 'Set active version, effective date and remaining-stock decision.' },
          { copy: 'Prepare packaging, inventory, freight or fulfillment handoff after approval.' },
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
            items: ['Version record', 'Asset checklist', 'Approval path', 'Packout handoff', 'Change log'],
          },
          {
            label: 'Confirm first',
            items: [
              'Trademark/IP/legal advice',
              'Product design/manufacturing',
              'Testing/certification',
              'Market compliance',
              'Claims and guarantee of product acceptance',
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
          'Product and sample reference.',
          'Target market.',
          'Brand assets and approved wording.',
          'Packaging/label/insert files.',
          'Known supplier.',
          'Version names.',
          'Effective dates.',
          'Approval owners.',
          'Inventory and fulfillment destination.',
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'The brand decision remains visible after the design file is approved.',
        items: [
          'Customer-facing experience has an operational record.',
          'Changes are less likely to mix.',
          'Approvals happen before irreversible work.',
          'The program can connect to practical logistics.',
        ],
      },
    },
    {
      type: 'faq',
      tone: 'white',
      content: {
        heading: 'Private label and white label: questions worth answering early.',
        items: [
          {
            id: 'pl-ip',
            question: 'Do you provide trademark or IP advice?',
            answer: 'No; use qualified legal advice and a confirmed scope.',
          },
          {
            id: 'pl-packaging',
            question: 'Can white-label products use custom packaging?',
            answer: 'Possible when product, materials, quantities and packout are approved.',
          },
          {
            id: 'pl-versions',
            question: 'How are old and new labels separated?',
            answer: 'Use active version, effective date, remaining-stock rule and clear instruction.',
          },
          {
            id: 'pl-compliance',
            question: 'Does private-label coordination guarantee market compliance?',
            answer: 'No; safety, certification, legal label and claims need verification.',
          },
          {
            id: 'pl-connect',
            question: 'Can a private-label program connect to sourcing and fulfillment?',
            answer: 'Yes, after product and brand decisions are stable.',
          },
          {
            id: 'pl-draft',
            question: 'What if the artwork is still under review?',
            answer: 'Keep it draft, assign an approver and do not use it as an active packing rule.',
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
      { ...RELATED_RAIL['worldwide-fulfillment'] },
    ],
  },
  enquiry: {
    kicker: 'Start the conversation',
    heading: 'Start with the product, the current approved brand decision, and the change you need to control.',
    reassurance: [],
    contextTitle: 'About this private-label enquiry',
    contextFields: [
      { name: 'product_version', label: 'Product version' },
      { name: 'brand_assets', label: 'Brand assets' },
      { name: 'approval_owner', label: 'Approval owner' },
      { name: 'effective_date', label: 'Effective date' },
    ],
  },
};
