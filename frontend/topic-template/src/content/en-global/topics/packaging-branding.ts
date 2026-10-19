/**
 * Topic page: Packaging and Branding (/services/packaging-branding).
 * Verbatim v2 doc §5 — copy used 100% as specified.
 */
import type { TopicPageContent } from './types';
import { RELATED_RAIL } from './types';

export const PACKAGING_BRANDING_TOPIC: TopicPageContent = {
  id: 'packaging-branding',
  kind: 'service',
  route: '/services/packaging-branding',
  pageLabel: 'Packaging & Branding',
  breadcrumbParent: { label: 'Services', href: '#services' },
  meta: {
    title: 'Packaging and Branding for Products From China | FreightVanta',
    description:
      'Turn approved packaging, labels, inserts, and brand materials for products from China into a practical packout and fulfillment instruction.',
    keywords: [
      'custom packaging for products from China',
      'packaging and branding fulfillment',
      'product inserts and labels',
      'packout instruction',
      'branded packaging from China',
    ],
  },
  serviceName: 'Packaging and Branding for Products From China',
  startingPoint: 'packaging-branding',
  formButton: 'Request a packaging and branding plan',
  hero: {
    kicker: 'PACKAGING AND BRANDING',
    title: 'Make products from China arrive in packaging that carries your brand forward.',
    body: 'A finished product is not yet a finished customer experience. The box, bag, insert, label, protection rule, bundle, and excluded supplier material all need to reach the packing team as a usable instruction. FreightVanta helps turn approved packaging and branding materials into a coordinated packout brief for products sourced from China. Your team retains ownership of the brand, artwork, customer promise and final approval.',
    primaryCta: 'Request a packaging and branding plan',
    secondaryCta: 'See the packout workflow',
    mediaId: 'service-packaging',
    mediaAlt:
      'Unprinted boxes, labels, inserts, and packout sequence laid out on a packing table.',
    rail: [
      { step: '01', label: 'PRODUCT', note: 'Version and customer objective' },
      { step: '02', label: 'MATERIALS', note: 'Artwork, labels, inserts, components' },
      { step: '03', label: 'RULES', note: 'Quantity, sequence, protection' },
      { step: '04', label: 'VERSION', note: 'Effective date and change owner' },
      { step: '05', label: 'PACKOUT', note: 'Active instruction for handoff' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'Packaging becomes operational when every component has a purpose and a version.',
        paragraphs: [
          'A logo file alone does not tell a packing team what to place in an order. The operational brief must identify the product variant, quantity of inserts, active language, protection method, treatment of supplier materials and the point at which old packaging stops being used.',
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'mist',
      content: {
        heading: 'Use packaging and branding coordination when files need to become physical orders.',
        cards: [
          {
            title: 'THE PRODUCT IS READY, THE PACKOUT IS NOT',
            copy: 'Connect box, bag, label, insert, gift component and supplier-material rules.',
          },
          {
            title: 'A BRAND REVISION IS COMING',
            copy: 'Use version, effective date and remaining-stock decision to keep old and new materials from mixing.',
          },
          {
            title: 'SEVERAL TEAMS TOUCH THE ORDER',
            copy: 'Give sourcing, inventory, packing, fulfillment and customer teams one current instruction.',
          },
          {
            title: 'THE PRODUCT IS SOURCED FROM CHINA',
            copy: 'Carry approved packaging requirements from supplier handoff to inbound and final order preparation.',
          },
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'white',
      content: {
        heading: 'Move from approved brand choice to repeatable packout.',
        steps: [
          { copy: 'Confirm product/version and customer-facing objective.' },
          { copy: 'Collect artwork, labels, inserts, packaging components and language versions.' },
          { copy: 'Define quantity, sequence, protection, bundle and excluded-material rules.' },
          { copy: 'Record supplier/component information, effective date and change owner.' },
          { copy: 'Review a sample or evidence item where included in the scope.' },
          { copy: 'Publish the active packout instruction for inventory or fulfillment handoff.' },
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
              'Packaging brief',
              'Active version',
              'Insert/label sequence',
              'Component list',
              'Handoff notes',
            ],
          },
          {
            label: 'Confirm first',
            items: [
              'Graphic design',
              'Printing/manufacturing',
              'Trademark/IP/legal review',
              'Product safety labels',
              'Regulatory wording',
              'Material testing and final creative approval',
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
          'Product reference and variations.',
          'Current artwork and wording.',
          'Packaging direction.',
          'Inserts, labels and languages.',
          'Known supplier/component source.',
          'Approval owners.',
          'Version name and effective date.',
          'Intended storage, freight or fulfillment handoff.',
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'mist',
      content: {
        heading: 'The brand decision remains visible after the design file is approved.',
        cards: [
          {
            title: 'Customer-facing experience has an operational record',
            copy: 'Artwork is linked to product and order preparation.',
          },
          {
            title: 'Changes are less likely to mix',
            copy: 'Active version and old-stock rule are explicit.',
          },
          {
            title: 'Approvals happen before irreversible work',
            copy: 'Product, sample, packaging and packout checkpoints are visible.',
          },
          {
            title: 'Brand decisions can connect to logistics',
            copy: 'A stable instruction can follow sourcing, storage, freight and fulfillment.',
          },
        ],
      },
    },
    {
      type: 'faq',
      tone: 'white',
      content: {
        heading: 'Packaging and branding: questions worth answering early.',
        items: [
          {
            id: 'pack-design',
            question: 'Can you design our logo or trademark?',
            answer: 'The page coordinates approved materials; legal/IP and creative ownership need separate scope.',
          },
          {
            id: 'pack-whitelabel',
            question: 'Can white-label products use custom inserts or packaging?',
            answer: 'Possible when product, materials, quantities and packout are approved.',
          },
          {
            id: 'pack-mixing',
            question: 'How do we avoid mixing old and new packaging?',
            answer: 'Use active version, effective date, remaining-stock rule and a current instruction.',
          },
          {
            id: 'pack-compliance',
            question: 'Does packaging coordination guarantee regulatory compliance?',
            answer: 'No; market labels, safety and certification require qualified review.',
          },
          {
            id: 'pack-connect',
            question: 'Can packaging connect to private label and fulfillment?',
            answer: 'Yes, once product/version and packout rules are stable.',
          },
          {
            id: 'pack-draft',
            question: 'What if artwork is not final?',
            answer: 'Keep the status as draft and record the approver; do not publish it as active.',
          },
        ],
      },
    },
  ],
  related: {
    heading: 'Related services',
    links: [
      { ...RELATED_RAIL['private-white-label'] },
      { ...RELATED_RAIL['inventory-storage'] },
      { ...RELATED_RAIL['worldwide-fulfillment'] },
    ],
  },
  enquiry: {
    kicker: 'Start the conversation',
    heading: 'Start with the product, the current approved brand decision, and the change you need to control.',
    reassurance: [],
    contextTitle: 'About this packaging enquiry',
    contextFields: [
      { name: 'artwork_status', label: 'Artwork status' },
      { name: 'packaging_components', label: 'Packaging components' },
      { name: 'insert_label_language', label: 'Insert/label language' },
      { name: 'active_version', label: 'Active version' },
    ],
  },
};
