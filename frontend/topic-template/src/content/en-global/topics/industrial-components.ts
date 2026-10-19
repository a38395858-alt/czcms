/**
 * Topic page: Industrial Components (/industries/industrial-components).
 * Verbatim v2 doc §11 — copy used 100% as specified.
 */
import type { TopicPageContent } from './types';
import { RELATED_RAIL } from './types';

export const INDUSTRIAL_COMPONENTS_TOPIC: TopicPageContent = {
  id: 'industry-industrial-components',
  kind: 'industry',
  route: '/industries/industrial-components',
  pageLabel: 'Industrial Components',
  breadcrumbParent: { label: 'Industries', href: '/industries' },
  meta: {
    title: 'Industrial Components Logistics From China | FreightVanta',
    description:
      'Coordinate specification-led industrial parts from China with revision control, protective packaging, documents, inbound identification and a confirmed receiving handoff.',
    keywords: [
      'industrial components logistics from China',
      'industrial parts sourcing and shipping from China',
      'China industrial component supply chain',
      'protective packaging for industrial parts',
      'specification-led freight coordination',
    ],
  },
  serviceName: null,
  startingPoint: null,
  formButton: 'Request an industrial components plan',
  hero: {
    kicker: 'INDUSTRIAL COMPONENTS',
    title: 'Carry the active component specification from China to a controlled receiving handoff.',
    body: 'For industrial parts, a usable delivery decision starts with the correct reference, revision, quantity, protective method, documents, inbound identification and receiving owner. FreightVanta helps organize that information for production input, maintenance/spares, project and site-delivery contexts. Engineering approval, testing, regulatory work, carrier capability and site access remain separate confirmation points.',
    primaryCta: 'Request an industrial components plan',
    secondaryCta: 'See the operating path',
    mediaId: 'industry-industrial',
    mediaAlt:
      'Protected industrial parts in a reusable wooden crate with folders and receiving tags.',
    rail: [
      { label: 'REFERENCE' },
      { label: 'PACK' },
      { label: 'DOCUMENTS' },
      { label: 'RECEIVE' },
      { label: 'RELEASE' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'A correct part still needs a usable receiving decision.',
        paragraphs: [
          'The next team should be able to see which revision is active, what protection is required, which document belongs to the part, where it is going and who can release it. The logistics record does not replace engineering approval; it prevents the receiving team from guessing which product context is current.',
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'mist',
      content: {
        heading: 'Six-step workflow',
        steps: [
          { copy: 'Establish active part number, drawing and revision.' },
          { copy: 'Prepare China purchase/supplier handoff.' },
          { copy: 'Confirm protective packaging and handling questions.' },
          { copy: 'Connect commercial, product and shipping documents where provided.' },
          { copy: 'Identify inbound part, quantity, crate/carton and destination.' },
          { copy: 'Release to production, maintenance, project/site or another confirmed owner.' },
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'white',
      content: {
        heading: 'Component contexts',
        cards: [
          {
            title: 'PRODUCTION INPUT',
            copy: 'Revision, lot/quantity, protective rule and production owner.',
          },
          {
            title: 'MAINTENANCE / SPARES',
            copy: 'Replacement reference, urgency, compatibility question and receiving owner.',
          },
          {
            title: 'PROJECT / SITE DELIVERY',
            copy: 'Site, milestone, access, packaging and document requirements to confirm.',
          },
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'Receipt context checklist',
        items: [
          'Active revision.',
          'Quantity.',
          'Protection method.',
          'Evidence/documents.',
          'Inbound identifier.',
          'Destination/site.',
          'Timing milestone.',
          'Receiving owner.',
          'Exception path.',
        ],
      },
    },
    {
      type: 'controls',
      tone: 'navy',
      content: {
        heading: 'Operating controls',
        groups: [
          {
            label: 'Included coordination',
            items: [
              'Reference and handoff organization',
              'Protective packaging questions',
              'Document path',
              'Inbound identification',
            ],
          },
          {
            label: 'Confirm first',
            items: [
              'Engineering acceptance',
              'Testing',
              'Certification',
              'Dangerous goods/special handling',
              'Carrier',
              'Insurance',
              'Customs',
              'Site access and delivery appointment',
            ],
          },
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'white',
      content: {
        heading: 'Planning brief',
        body: 'Send the active part reference, revision, quantity, origin, destination, protective packaging, documents, required window and decision owner. Mark unknown engineering or regulatory items as open.',
      },
    },
    {
      type: 'faq',
      tone: 'mist',
      content: {
        heading: 'Industrial components: questions worth answering early.',
        items: [
          {
            id: 'ic-engineering',
            question: 'Do you approve the engineering specification?',
            answer:
              'No; the page organizes the active reference, while engineering approval remains with the responsible team.',
          },
          {
            id: 'ic-packaging',
            question: 'Can you arrange protective packaging?',
            answer: 'The requirement can be coordinated; material and handling scope need confirmation.',
          },
          {
            id: 'ic-milestone',
            question: 'Can you guarantee site delivery by a milestone?',
            answer: 'No; route, carrier, customs and site conditions must be confirmed.',
          },
          {
            id: 'ic-storage',
            question: 'Can industrial parts be stored before release?',
            answer: 'Storage and identification can be planned under a confirmed scope.',
          },
          {
            id: 'ic-urgent',
            question: 'Can urgent replacement parts use the time-critical route?',
            answer:
              'Link to Time-critical Cargo when the consequence, ready date and route decision are defined.',
          },
          {
            id: 'ic-first',
            question: 'What should be attached first?',
            answer: 'Part number/revision, drawing or photo, quantity, destination, packaging and timing.',
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
    heading: 'Start with the active reference, the receiving context, and the decision that cannot be left to assumption.',
    reassurance: [],
    contextTitle: 'About this industrial components enquiry',
    contextFields: [
      { name: 'industry_context', label: 'Industry context' },
      { name: 'business_consequence', label: 'Business consequence' },
      { name: 'receiving_owner', label: 'Receiving owner' },
      { name: 'route_concern', label: 'Route concern' },
    ],
  },
};
