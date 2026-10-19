/**
 * Topic page: Time-critical Cargo (/industries/time-critical-cargo).
 * Verbatim v2 doc §12 — copy used 100% as specified.
 */
import type { TopicPageContent } from './types';
import { RELATED_RAIL } from './types';

export const TIME_CRITICAL_CARGO_TOPIC: TopicPageContent = {
  id: 'industry-time-critical-cargo',
  kind: 'industry',
  route: '/industries/time-critical-cargo',
  pageLabel: 'Time-critical Cargo',
  breadcrumbParent: { label: 'Industries', href: '/industries' },
  meta: {
    title: 'Time-Critical Cargo Logistics From China | FreightVanta',
    description:
      'Plan time-critical cargo from China with a visible ready date, documents, routing options, escalation path, and confirmed next handoff.',
    keywords: [
      'time-critical cargo logistics from China',
      'urgent freight shipping from China',
      'China air freight for urgent cargo',
      'time-sensitive supply chain coordination',
      'emergency replenishment logistics',
    ],
  },
  serviceName: null,
  startingPoint: null,
  formButton: 'Request a time-critical cargo plan',
  hero: {
    kicker: 'TIME-CRITICAL CARGO',
    title: 'Make the next feasible movement visible before the clock takes over.',
    body: 'Urgent cargo decisions need more than the word “express.” FreightVanta helps collect the business consequence, cargo readiness, ready date, documents, routing question, receiving window and escalation owner so a time-critical movement can be reviewed as a decision set. Carrier capacity, transit time, customs release, rates, special handling and final delivery are confirmed only for the actual cargo and route.',
    primaryCta: 'Request a time-critical cargo plan',
    secondaryCta: 'See the urgency workflow',
    mediaId: 'industry-time-critical',
    mediaAlt:
      'Unbranded cartons awaiting dispatch with folders, a milestone checklist, and a transport handoff beside an aircraft at night.',
    rail: [
      { label: 'REQUEST' },
      { label: 'READY' },
      { label: 'DOCS' },
      { label: 'ROUTE' },
      { label: 'RECEIVE' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'Urgency is a connected set of facts, not a carrier promise.',
        paragraphs: [
          'The business consequence, ready date, package, documents, route options, destination condition and escalation owner need to be visible together. A fast label cannot solve missing cargo readiness, unclear paperwork or an unavailable receiving window.',
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'mist',
      content: {
        heading: 'Urgency workflow',
        steps: [
          { copy: 'Define deadline and business consequence.' },
          { copy: 'Confirm cargo readiness, dimensions, weight, quantity and packaging context.' },
          { copy: 'Collect commercial, product and transport documents available at origin.' },
          { copy: 'Compare route options and unresolved constraints.' },
          { copy: 'Assign escalation owner for carrier, customs, destination or receiving question.' },
          { copy: 'Confirm the next release/handoff only after actual route scope is reviewed.' },
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'white',
      content: {
        heading: 'Time-critical contexts',
        cards: [
          {
            title: 'PRODUCTION / REPLENISHMENT',
            copy: 'Consequence of line stop or stock-out, ready date, replacement quantity.',
          },
          {
            title: 'CUSTOMER / REPLACEMENT',
            copy: 'Customer commitment, product identity, destination and exception owner.',
          },
          {
            title: 'PROJECT / SITE MILESTONE',
            copy: 'Site window, access, document and receiving requirement.',
          },
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'Cargo context checklist',
        items: [
          'Business consequence.',
          'Required arrival/receiving window.',
          'Cargo description.',
          'Packages, dimensions and weight.',
          'Ready date.',
          'Origin.',
          'Destination.',
          'Documents.',
          'Routing concern.',
          'Decision owner.',
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
            label: 'Can organize',
            items: ['Deadline brief', 'Cargo facts', 'Document checklist', 'Route questions', 'Escalation path'],
          },
          {
            label: 'Confirm first',
            items: [
              'Carrier space',
              'Fixed transit time',
              'Customs clearance',
              'Insurance',
              'Dangerous goods',
              'Temperature/special handling',
              'Site access',
              'Rate and delivery date',
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
        body: 'Send the ready date, receiving window, consequence, cargo facts, package details, origin/destination, available documents and the question that is blocking the next movement.',
      },
    },
    {
      type: 'faq',
      tone: 'mist',
      content: {
        heading: 'Time-critical cargo: questions worth answering early.',
        items: [
          {
            id: 'tc-arrival',
            question: 'Can you guarantee an arrival time?',
            answer: 'No; actual carrier, route, customs and receiving conditions must be confirmed.',
          },
          {
            id: 'tc-partial',
            question: 'Can urgent cargo start with partial information?',
            answer:
              'The first review can identify missing facts, but a route cannot be confirmed without the information required for the shipment.',
          },
          {
            id: 'tc-routes',
            question: 'Can you compare air and other route options from China?',
            answer: 'Route questions can be organized; availability, rate and transit require actual confirmation.',
          },
          {
            id: 'tc-fallback',
            question: 'What if the original route fails?',
            answer: 'The escalation path records who reviews alternatives and what decision is needed next.',
          },
          {
            id: 'tc-regulated',
            question: 'Can you handle special or regulated cargo?',
            answer: 'Only after product, documents, handling and legal requirements are explicitly confirmed.',
          },
          {
            id: 'tc-first',
            question: 'What should we send first?',
            answer: 'Ready date, consequence, cargo/package facts, origin, destination, documents and receiving window.',
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
    heading: 'Start with the ready date, the business consequence, and the handoff that cannot miss its decision.',
    reassurance: [],
    contextTitle: 'About this time-critical enquiry',
    contextFields: [
      { name: 'industry_context', label: 'Industry context' },
      { name: 'business_consequence', label: 'Business consequence' },
      { name: 'receiving_owner', label: 'Receiving owner' },
      { name: 'route_concern', label: 'Route concern' },
    ],
  },
};
