import type { StartingPointValue } from '../types';

export interface ServiceContent {
  slug: string;
  /** Title-case label used in navigation. */
  navLabel: string;
  /** Sentence-case label used in tabs and lists. */
  label: string;
  menuLine: string;
  title: string;
  copy: string;
  tags: string[];
  linkLabel: string;
  mediaId: string;
  mediaAlt: string;
  startingPoint: StartingPointValue | null;
  /** Shown in the homepage service-path selector. */
  inSelector: boolean;
  share: string[];
  clarify: string[];
  scopeNote?: string;
  relatedGuides: string[];
}

export const SERVICES: ServiceContent[] = [
  {
    slug: 'product-sourcing',
    navLabel: 'Product Sourcing',
    label: 'Product sourcing',
    menuLine: 'Supplier briefs, comparisons, and samples',
    title: 'Find the right product path.',
    copy: 'Share a product link, photo, specification, or target cost. We help organize the supplier questions, comparison points, samples, and purchasing details that need to be clear before the next handoff.',
    tags: ['China sourcing', 'Supplier briefing', 'Sample coordination'],
    linkLabel: 'Explore product sourcing',
    mediaId: 'service-product-sourcing',
    mediaAlt: 'Product samples, a caliper, and a specification sheet laid out for a sourcing review.',
    startingPoint: 'product-sourcing',
    inSelector: true,
    share: [
      'A product link, photo, or short specification',
      'Target cost and the quantities you are considering',
      'Destination market and target date',
      'Packaging, labeling, or compliance needs you already know about',
    ],
    clarify: [
      'The supplier questions that need answers before purchasing',
      'The comparison points that matter for your product',
      'Sample expectations and who approves them',
      'The purchasing details to confirm before the next handoff',
    ],
    relatedGuides: ['china-sourcing-brief', 'packaging-insert-guide'],
  },
  {
    slug: 'ocean-freight',
    navLabel: 'Ocean Freight',
    label: 'Ocean freight',
    menuLine: 'FCL, LCL, and port-to-door planning',
    title: 'Plan the economical leg.',
    copy: 'For consolidated or container freight, we help align cargo readiness, export documents, port handoffs, and the delivery plan. The brief shows what is included, which decisions remain open, and who owns the next move.',
    tags: ['FCL', 'LCL', 'Port-to-door'],
    linkLabel: 'Explore ocean freight',
    mediaId: 'service-ocean-freight',
    mediaAlt: 'Container ship being loaded by gantry cranes at a container terminal.',
    startingPoint: 'ocean-freight',
    inSelector: true,
    share: [
      'Cargo ready date and pickup location',
      'Carton count, dimensions, and weight',
      'Destination address or port',
      'The Incoterms rule agreed with your supplier, if known',
    ],
    clarify: [
      'What the plan includes and which decisions remain open',
      'Export documents and port handoffs',
      'Who owns each next move',
      'The delivery plan after the port',
    ],
    relatedGuides: ['ocean-or-air-freight', 'incoterms-handoffs'],
  },
  {
    slug: 'air-freight',
    navLabel: 'Air Freight',
    label: 'Air freight',
    menuLine: 'Express, standard, and urgent replenishment',
    title: 'Protect the time-sensitive leg.',
    copy: 'When a launch, replenishment, or urgent order cannot wait for the next ocean cycle, we compare practical air options and organize pickup, shipment documents, and delivery handoffs.',
    tags: ['Express', 'Standard', 'Urgent replenishment'],
    linkLabel: 'Explore air freight',
    mediaId: 'service-air-freight',
    mediaAlt: 'Air cargo pallets being loaded into a freighter aircraft at dusk.',
    startingPoint: 'air-freight',
    inSelector: true,
    share: [
      'What the shipment protects: a launch, replenishment, or urgent order',
      'Cargo ready date, dimensions, and weight',
      'Pickup and delivery locations',
      'Goods that may need special handling or documents',
    ],
    clarify: [
      'Practical air options for the date that matters',
      'Pickup timing and shipment documents',
      'Delivery handoffs at destination',
      'What happens if a date or assumption changes',
    ],
    relatedGuides: ['ocean-or-air-freight', 'import-planning-checklist'],
  },
  {
    slug: 'ground-final-mile',
    navLabel: 'Ground & Final Mile',
    label: 'Ground & final mile',
    menuLine: 'Pickup, receiving, and delivery handoffs',
    title: 'Finish the route with the receiver in mind.',
    copy: 'Once cargo is released, the last leg needs its own plan: pickup timing, receiving requirements, appointment details, and who confirms delivery. We keep those details attached to the shipment so the handoff to your warehouse, store, or customer is planned rather than improvised.',
    tags: ['Pickup coordination', 'Receiving requirements', 'Delivery handoff'],
    linkLabel: 'Explore ground & final mile',
    mediaId: 'service-final-mile',
    mediaAlt: 'Driver wheeling cartons from a box truck toward a receiving door.',
    startingPoint: null,
    inSelector: false,
    share: [
      'Delivery address, receiving hours, and a site contact',
      'Appointment, dock, or equipment requirements',
      'Carton or pallet count and weight',
      'Who confirms receipt at destination',
    ],
    clarify: [
      'Pickup timing after release',
      'Receiving requirements the delivery must meet',
      'Delivery confirmation and exception notes',
      'Who is contacted if something changes',
    ],
    relatedGuides: ['import-planning-checklist', 'ocean-or-air-freight'],
  },
  {
    slug: 'customs-coordination',
    navLabel: 'Customs Coordination',
    label: 'Customs coordination',
    menuLine: 'Invoices, packing details, and document readiness',
    title: 'Make documents ready early.',
    copy: 'We help collect commercial invoices, packing details, and shipment information so questions are visible before cargo reaches the next checkpoint. Final classification and compliance remain subject to the applicable authority and responsible broker.',
    tags: ['Shipment information', 'Document readiness', 'Handoff support'],
    linkLabel: 'Explore customs support',
    mediaId: 'service-customs',
    mediaAlt: 'Shipping documents, a laptop, and cartons on a desk during document preparation.',
    startingPoint: 'not-sure',
    inSelector: true,
    share: [
      'Commercial invoice and packing details',
      'Product descriptions, materials, and intended use',
      'Supplier and consignee details',
      'The customs broker you already work with, if any',
    ],
    clarify: [
      'Which shipment information is still missing',
      'Document questions to resolve before the next checkpoint',
      'Who is responsible for classification and formal clearance',
      'Handoffs between your supplier, freight team, and broker',
    ],
    scopeNote:
      'We coordinate shipment information and document handoffs. The responsible broker, jurisdiction, classification, and formal clearance scope must be identified before making a clearance commitment.',
    relatedGuides: ['import-planning-checklist', 'incoterms-handoffs'],
  },
  {
    slug: 'warehousing-fulfillment',
    navLabel: 'Warehousing & Fulfillment',
    label: 'Warehousing & fulfillment',
    menuLine: 'Consolidation, storage, and order preparation',
    title: 'Hold, check, and dispatch with purpose.',
    copy: 'Inventory can be received, checked, consolidated, stored, and prepared for the destination you approve. Use the brief to keep product, packaging, and release instructions attached to the order.',
    tags: ['Consolidation', 'Storage', 'Order preparation'],
    linkLabel: 'Explore warehousing',
    mediaId: 'service-warehousing',
    mediaAlt: 'Warehouse worker scanning a carton beside consolidated pallets and racking.',
    startingPoint: 'warehousing-fulfillment',
    inSelector: true,
    share: [
      'What is arriving, from which suppliers, and when',
      'Checks to perform on receipt',
      'Storage, consolidation, or release instructions',
      'Destinations and order preparation requirements',
    ],
    clarify: [
      'Receiving and check steps before storage',
      'How orders are consolidated, separated, or held',
      'Product, packaging, and release instructions attached to each order',
      'The operating scope, confirmed before inventory moves',
    ],
    scopeNote:
      'Tell us the receiving, storage, preparation, and release requirements. The available operating scope should be confirmed in the plan before inventory moves.',
    relatedGuides: ['packaging-insert-guide', 'import-planning-checklist'],
  },
  {
    slug: 'packaging-branding',
    navLabel: 'Packaging & Branding',
    label: 'Packaging & branding',
    menuLine: 'Inserts, labels, and branded packaging',
    title: 'Make the package feel like yours.',
    copy: 'Coordinate approved inserts, stickers, hangtags, bags, boxes, and other brand elements as part of the fulfillment brief. Artwork, quantities, and production steps are confirmed before use.',
    tags: ['Inserts', 'Labels', 'Private-label preparation'],
    linkLabel: 'Explore packaging & branding',
    mediaId: 'service-packaging',
    mediaAlt: 'Packing table with navy mailer boxes, tissue paper, insert cards, and hangtags.',
    startingPoint: 'packaging-branding',
    inSelector: true,
    share: [
      'Artwork files and brand guidelines',
      'Quantities for inserts, stickers, hangtags, bags, or boxes',
      'Placement instructions for each SKU',
      'Who approves samples before use',
    ],
    clarify: [
      'Which brand elements are part of the fulfillment brief',
      'Artwork, quantities, and production steps to confirm',
      'Placement instructions a packer can follow',
      'Approval points before goods are packed',
    ],
    relatedGuides: ['packaging-insert-guide', 'china-sourcing-brief'],
  },
  {
    slug: 'private-label',
    navLabel: 'Private Label & White Label',
    label: 'Private label & white label',
    menuLine: 'Brand specifications, artwork, and sample sign-off',
    title: 'Turn a sourced product into your product.',
    copy: 'When a product carries your brand, the brief needs more than a logo file. We help organize the specification, artwork approvals, packaging and labeling details, and sample sign-off so the supplier, the packing team, and the freight plan work from the same version.',
    tags: ['Brand specification', 'Artwork approval', 'Sample sign-off'],
    linkLabel: 'Explore private label & white label',
    mediaId: 'service-private-label',
    mediaAlt: 'Unbranded product sample with packaging artwork proofs and color swatches.',
    startingPoint: 'product-sourcing',
    inSelector: false,
    share: [
      'The product you want to brand, or a link to a similar one',
      'Logo, artwork files, and brand guidelines',
      'Packaging and labeling requirements for your market',
      'Target quantities and launch timing',
    ],
    clarify: [
      'White label (an existing product under your brand) or private label (adjusted to your specification)',
      'Artwork versions and who approves them',
      'Sample sign-off before production',
      'Packaging, labeling, and preparation steps before freight',
    ],
    relatedGuides: ['china-sourcing-brief', 'packaging-insert-guide'],
  },
];

export const getService = (slug: string) => SERVICES.find((service) => service.slug === slug) ?? null;
