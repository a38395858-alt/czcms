/**
 * Topic page: Product Sourcing from China (/product-sourcing).
 * Verbatim v2 doc §3 — modules 1–12, copy used 100% as specified.
 */
import type { TopicPageContent } from './types';
import { RELATED_RAIL } from './types';

export const PRODUCT_SOURCING_TOPIC: TopicPageContent = {
  id: 'product-sourcing',
  kind: 'service',
  route: '/product-sourcing',
  pageLabel: 'Product Sourcing from China',
  breadcrumbParent: { label: 'Services', href: '#services' },
  meta: {
    title: 'Product Sourcing from China for Businesses | FreightVanta',
    description:
      'Coordinate product sourcing from China with a supplier-ready brief, comparable responses, sample checkpoints, and an approved handoff for your destination market.',
    keywords: [
      'product sourcing from China',
      'China sourcing agent',
      'source products from China',
      'supplier sourcing in China',
      'China product sourcing service',
      'China supplier comparison',
      'product sample coordination',
      'can I source a product from China with only a product link',
      'how to compare suppliers in China',
      'how to prepare a China sourcing brief',
      'China sourcing packaging and fulfillment',
    ],
  },
  serviceName: 'Product Sourcing from China',
  startingPoint: 'product-sourcing',
  formButton: 'Request a sourcing plan',
  hero: {
    kicker: 'PRODUCT SOURCING FROM CHINA',
    title: 'Product sourcing from China, organized for your next business decision.',
    body: 'Start with a product link, reference image, specification, or target quantity. FreightVanta helps structure sourcing from China into a supplier-ready brief: what the product needs to be, what a China supplier needs to confirm, which samples or comparison points matter, and how approved details move to the next operational handoff. You keep the purchasing decision; we help make the questions, evidence, and next owner visible.',
    primaryCta: 'Request a sourcing plan',
    secondaryCta: 'See the sourcing workflow',
    mediaId: 'service-product-sourcing',
    mediaAlt:
      'Product samples, measurement tools, specifications, and packaging references prepared for a China sourcing review.',
    rail: [
      { step: '01', label: 'CHINA REFERENCE', note: 'Start with the product you can identify' },
      { step: '02', label: 'BRIEF', note: 'Turn the reference into supplier questions' },
      { step: '03', label: 'COMPARE', note: 'Keep responses in the same frame' },
      { step: '04', label: 'REVIEW', note: 'Connect samples, specifications, and open decisions' },
      { step: '05', label: 'HANDOFF', note: 'Carry approved details to the next operation' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        kicker: 'THE SOURCING DECISION',
        heading: 'A product link is a starting point. A usable sourcing brief is the next decision.',
        paragraphs: [
          'A marketplace link or supplier message rarely contains everything a business needs to approve a purchase. Material, dimensions, finish, variants, target quantity, packaging, destination market, sample requirements, and unresolved questions can be scattered across images and conversations. A structured China sourcing brief keeps those details together, so each supplier is asked comparable questions and the next team does not have to rebuild the product context.',
          'The goal is not to make an uncertain supplier, price, quality, or compliance outcome sound certain. The goal is to make the decision easier to inspect: what is known, what still needs an answer, what evidence is available, who approves it, and where the approved product goes next.',
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'mist',
      content: {
        heading: 'Source products from China when the opportunity is clear but the next approval is not.',
        intro:
          'Use the service when a product direction exists and the business needs a cleaner path from first reference to an approved operational handoff.',
        cards: [
          {
            title: 'YOU HAVE A CHINA REFERENCE',
            copy: 'A product link, factory page, image, competitor sample, drawing, or early specification can be turned into concrete questions about material, size, finish, variants, quantity, packaging, and destination.',
          },
          {
            title: 'YOU NEED A COMPARABLE SUPPLIER CONVERSATION',
            copy: 'Responses from China suppliers are read against the same question set, so differences, missing information, sample requirements, and open commercial decisions remain visible to the buyer.',
          },
          {
            title: 'YOU ARE MOVING TOWARD A PURCHASE',
            copy: 'When the product, quantity, packaging, destination, and approval owner are clearer, the team can decide what is ready for a purchase or what must remain open.',
          },
          {
            title: 'THE NEXT TEAM NEEDS CONTEXT',
            copy: 'Sampling, packaging, inspection, storage, freight, and fulfillment are easier to plan when the approved product state is recorded instead of being reconstructed from separate messages.',
          },
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'white',
      content: {
        heading: 'You do not need every answer before the first China supplier conversation.',
        body: 'A useful first brief can begin with incomplete information. Share what is known and identify what is not. A product link, image, drawing, existing sample, target quantity, destination market, or known supplier is enough to define the first set of questions. Unknown information is kept as an open item; it is never silently filled in with an assumption.',
        items: [
          'Product link, image, drawing, existing sample or competitor reference.',
          'Product name, intended use, materials, finish, dimensions, variants and non-negotiable attributes.',
          'Target quantity, expected reorder pattern and whether the quantity is fixed or exploratory.',
          'Known China supplier, factory, marketplace or manufacturer contact, if available.',
          'Destination market, sales channel and any customer-facing packaging expectation.',
          'Target ready period, launch/replenishment context and known constraints.',
          'The next handoff: sampling, purchasing approval, packaging, storage, freight or fulfillment.',
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'mist',
      content: {
        heading: 'Move a China sourcing decision forward without losing its context.',
        intro:
          'Each stage separates confirmed information, open questions, evidence and ownership. Purchasing approval remains with your team.',
        steps: [
          {
            step: '01',
            title: 'Share the China sourcing reference',
            copy: 'Bring together product links, supplier or factory details where available, images, specifications, quantity, destination, and the result you need.',
          },
          {
            step: '02',
            title: 'Build the supplier-ready brief',
            copy: 'Turn attributes, variants, packaging, target market, timing, and decision criteria into a clear request for a supplier in China.',
          },
          {
            step: '03',
            title: 'Create a comparable question set',
            copy: 'Ask each China supplier for the same core information, while recording supplier-specific questions separately so the comparison remains readable.',
          },
          {
            step: '04',
            title: 'Review responses and missing evidence',
            copy: 'Connect every response to the question it answers. Mark unknowns, conflicting details, and items that need a sample, photo, video, drawing, or written confirmation.',
          },
          {
            step: '05',
            title: 'Coordinate samples and specification review',
            copy: 'Organize sample checkpoints, measurements, finish, variant, packout, and approval notes. Sampling or inspection standards are published only when separately confirmed.',
          },
          {
            step: '06',
            title: 'Prepare purchasing approval',
            copy: 'Record the selected or shortlisted product state, quantity assumptions, packaging requirement, destination context, open risk and approval owner. This is a decision record, not a price or quality guarantee.',
          },
          {
            step: '07',
            title: 'Prepare the next operational handoff',
            copy: 'Carry approved product details, quantities, packaging, origin information, and owner instructions into confirmed bulk procurement, packaging, storage, freight or fulfillment work.',
          },
        ],
      },
    },
    {
      type: 'brief',
      tone: 'navy',
      content: {
        heading: 'Give China supplier sourcing one shared brief instead of several disconnected conversations.',
        paragraphs: [
          'A sourcing conversation becomes more useful when the product reference, supplier questions, intended market, sample evidence, and approval record stay connected. This is the practical meaning behind searches such as “China sourcing agent” or “supplier sourcing in China”: a business needs a reliable way to move from a reference to a decision, not a list of vague supplier promises.',
          'The brief can show which supplier information is comparable, which commercial term still needs negotiation, which product attribute is not yet evidenced, and which downstream team needs to be involved. The page must not describe FreightVanta as the legal importer, a factory auditor, or a guaranteed quality authority unless the confirmed scope says so.',
        ],
        points: [
          {
            lead: 'China supplier reference',
            rest: 'link, factory page, marketplace listing, contact, image or sample.',
          },
          {
            lead: 'Product and commercial context',
            rest: 'materials, variants, target quantity, packaging, market and constraints.',
          },
          {
            lead: 'Comparable communication',
            rest: 'same questions, replies, sample evidence and open decisions.',
          },
          {
            lead: 'Planned handoff',
            rest: 'approved details ready for purchasing, packaging, storage, freight or fulfillment.',
          },
        ],
        mediaId: 'guide-sourcing-brief',
        mediaAlt:
          'A supplier-ready China sourcing brief with product dimensions, materials, target quantities, and packaging notes.',
      },
    },
    {
      type: 'comparison',
      tone: 'white',
      content: {
        heading: 'Compare what each supplier answered, not just the number on a quotation.',
        body: 'A useful comparison keeps product version, quantity basis, packaging assumption, sample status, commercial term and unresolved question in the same view. That helps a buyer see whether two responses are genuinely comparable or whether a lower-looking figure is based on a different product, quantity, packout or delivery assumption.',
        rows: [
          'Product reference and active revision.',
          'Material, dimensions, finish, color and variant details.',
          'Quantity basis, carton/unit packing and expected reorder context.',
          'Sample, image, drawing or written evidence available.',
          'Packaging, labels, inserts and supplier-material treatment.',
          'Destination-market question and next handoff.',
          'Open decision, responsible owner and approval status.',
        ],
        mediaId: 'service-private-label',
        mediaAlt:
          'Product samples and specification notes arranged for comparison between China supplier options.',
      },
    },
    {
      type: 'checkpoints',
      tone: 'mist',
      content: {
        heading: 'Use samples and evidence to make the next question specific.',
        body: 'Samples, photos, videos, measurements and supplier statements can support an internal review, but they only answer the questions they actually evidence. A sample does not by itself guarantee a production run, regulatory result or future batch. The sourcing record should show what was reviewed, what was accepted, what remains open and whether a separate inspection or testing scope is required.',
        cards: [
          {
            tag: 'SPECIFICATION',
            copy: 'Compare the approved attributes, dimensions, materials, finish and variants.',
          },
          {
            tag: 'EVIDENCE',
            copy: 'Link photos, videos, sample notes, drawings or supplier statements to the relevant question.',
          },
          {
            tag: 'APPROVAL',
            copy: 'Record who accepted the product state and which assumptions remain open.',
          },
          {
            tag: 'CHANGE CONTROL',
            copy: 'Give a revised product, component, packaging or supplier response a new review point.',
          },
        ],
      },
    },
    {
      type: 'scopeTable',
      tone: 'white',
      content: {
        heading: 'What the sourcing brief can organize, and what must be confirmed first.',
        headers: ['Topic', 'What the sourcing brief can organize', 'What must be confirmed first'],
        rows: [
          {
            topic: 'Product brief',
            organize: 'Organize product reference, specification, variants, quantity and open questions.',
            confirm: '—',
          },
          {
            topic: 'Supplier questions',
            organize: 'Coordinate comparable questions and record responses from known or identified suppliers.',
            confirm: '—',
          },
          {
            topic: 'Sample coordination',
            organize: 'Organize sample requests and review notes where the scope includes them.',
            confirm: 'Sample fees, testing standard and acceptance criteria.',
          },
          {
            topic: 'Quality work',
            organize: 'Carry agreed evidence and checkpoints into the record.',
            confirm: 'Inspection, factory audit, testing and quality guarantee.',
          },
          {
            topic: 'Commercial result',
            organize: 'Make assumptions and terms easier to compare.',
            confirm: 'Final price, discount, MOQ, payment, contract and savings.',
          },
          {
            topic: 'Compliance',
            organize: 'Identify market or product questions that need review.',
            confirm: 'Certification, legal labeling, customs, product safety and regulatory advice.',
          },
          {
            topic: 'Handoff',
            organize: 'Prepare approved information for confirmed packaging, storage, freight or fulfillment.',
            confirm: 'Warehouse, carrier, delivery time and coverage.',
          },
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'The deliverable is a decision-ready sourcing record.',
        body: 'The useful result is not a long list of unfiltered supplier links. It is a working record another person can understand and use: the product reference, the current brief, supplier questions and replies, sample or evidence notes, unresolved issues, approval owner, packaging context, quantity assumptions and the next confirmed handoff.',
        items: [
          'Supplier-ready product brief.',
          'Comparable question and response matrix.',
          'Sample/evidence review notes (when included in the confirmed scope).',
          'Open-question and decision log.',
          'Approved product/variant/packaging snapshot.',
          'Handoff notes for bulk procurement, packaging, storage, freight or fulfillment.',
        ],
      },
    },
    {
      type: 'faq',
      tone: 'white',
      content: {
        heading: 'Product sourcing from China: questions worth answering early.',
        items: [
          {
            id: 'ps-link',
            question: 'Can you help us source products from China if we only have a link?',
            answer:
              'Yes. A link, image or short description can open the first conversation. Missing product, supplier, packaging and destination information is captured as an open question rather than assumed.',
          },
          {
            id: 'ps-agent',
            question: 'Do you act as a China sourcing agent?',
            answer:
              'The page describes sourcing coordination, question management, comparison and handoff. Any agency, purchasing authority, importer-of-record or legal representation must be defined in a separate confirmed scope.',
          },
          {
            id: 'ps-compare',
            question: 'Can you compare several China suppliers?',
            answer:
              'Yes, when supplier references or responses are available. They are compared against a shared question set, with differences and missing evidence kept visible.',
          },
          {
            id: 'ps-guarantee',
            question: 'Is the supplier, price or quality guaranteed?',
            answer:
              'No. Supplier selection, price, quality control, factory audit, testing, compliance and acceptance criteria require explicit confirmation.',
          },
          {
            id: 'ps-samples',
            question: 'Can you arrange samples or inspection?',
            answer:
              'Sample coordination and inspection can be discussed as separate scope items. The page must not imply a test method, pass result or inspection guarantee before it is agreed.',
          },
          {
            id: 'ps-downstream',
            question: 'Can sourcing continue into packaging, storage and fulfillment?',
            answer:
              'Yes. Once product, quantity, packaging, origin and destination details are approved, the record can be handed to confirmed downstream services.',
          },
          {
            id: 'ps-private-label',
            question: 'Can you source private-label products from China?',
            answer:
              'The product and brand program can be discussed, but artwork, trademark, IP, legal labels, product claims and manufacturing responsibilities require their own review and approval.',
          },
          {
            id: 'ps-first',
            question: 'What should we send first?',
            answer:
              'Send the product reference, target quantity, market, timing, known supplier and the decision that is currently blocked. The first response will focus on the questions needed to define scope.',
          },
        ],
      },
    },
  ],
  related: {
    heading: 'Related services',
    links: [
      {
        label: 'Bulk procurement from China',
        href: '/services/bulk-procurement',
        note: RELATED_RAIL['bulk-procurement'].note,
      },
      {
        label: 'Packaging and branding for sourced products',
        href: '/services/packaging-branding',
        note: RELATED_RAIL['packaging-branding'].note,
      },
      {
        label: 'Inventory storage for imported goods',
        href: '/services/inventory-storage',
        note: RELATED_RAIL['inventory-storage'].note,
      },
      {
        label: 'Fulfillment for China-sourced products',
        href: '/services/worldwide-fulfillment',
        note: RELATED_RAIL['worldwide-fulfillment'].note,
      },
    ],
  },
  enquiry: {
    kicker: 'Start the conversation',
    heading: 'Begin with the product, the China sourcing handoff, and the outcome you need.',
    body: 'Share the product, quantity, China supplier reference if known, destination, timing, packaging expectation and the point where your process needs support. FreightVanta will begin with the practical questions that define the scope.',
    reassurance: [],
    contextTitle: 'About this sourcing enquiry',
    contextFields: [
      { name: 'known_china_supplier', label: 'Known China supplier' },
      { name: 'material', label: 'Material' },
      { name: 'variant', label: 'Variant' },
      { name: 'sample_need', label: 'Sample need' },
      { name: 'target_market', label: 'Target market' },
    ],
  },
};
