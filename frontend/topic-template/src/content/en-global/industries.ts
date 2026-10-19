export interface IndustryContent {
  slug: string;
  navLabel: string;
  name: string;
  menuLine: string;
  copy: string;
  questions: string[];
  relatedServices: string[];
  relatedGuides: string[];
  mediaId: string;
  mediaAlt: string;
}

export const INDUSTRIES: IndustryContent[] = [
  {
    slug: 'cross-border-ecommerce',
    navLabel: 'Ecommerce & Retail',
    name: 'Ecommerce & retail',
    menuLine: 'Replenishment, bundles, and marketplace preparation',
    copy: 'Keep replenishment, bundles, marketplace preparation, and store-specific packaging organized from supplier to customer.',
    questions: [
      'Which SKUs, bundles, or kits need to ship together?',
      'Are there marketplace or store-specific carton, label, or packaging instructions?',
      'How does replenishment timing affect inventory at the destination?',
      'Who approves inserts, labels, and packaging before goods are released?',
    ],
    relatedServices: ['warehousing-fulfillment', 'packaging-branding', 'ocean-freight', 'product-sourcing'],
    relatedGuides: ['packaging-insert-guide', 'ocean-or-air-freight'],
    mediaId: 'industry-ecommerce',
    mediaAlt: 'Warehouse team handling cartons beside organized shelving.',
  },
  {
    slug: 'consumer-goods',
    navLabel: 'Consumer Goods',
    name: 'Consumer goods',
    menuLine: 'Quality checks, launch readiness, and presentation',
    copy: 'Coordinate product details, quality checks, launch readiness, and presentation from supplier to shelf or doorstep.',
    questions: [
      'Which product details and quality checks must be confirmed before shipment?',
      'What does launch readiness depend on — samples, packaging, or timing?',
      'How should presentation hold up from supplier to shelf or doorstep?',
      'Which documents or labels does the destination market expect?',
    ],
    relatedServices: ['product-sourcing', 'packaging-branding', 'private-label', 'warehousing-fulfillment'],
    relatedGuides: ['china-sourcing-brief', 'packaging-insert-guide'],
    mediaId: 'industry-consumer-goods',
    mediaAlt: 'A customer unboxing a small product from a carton with paper fill.',
  },
  {
    slug: 'industrial-components',
    navLabel: 'Industrial Components',
    name: 'Industrial components',
    menuLine: 'Specifications, documentation, and receiving',
    copy: 'Work from specifications, documentation, receiving requirements, and a clear plan for the next production or service handoff.',
    questions: [
      'Which specifications and drawings define an acceptable part?',
      'What documentation must travel with the shipment?',
      'What are the receiving requirements at the destination?',
      'What is the next production or service handoff after delivery?',
    ],
    relatedServices: ['product-sourcing', 'customs-coordination', 'ocean-freight', 'ground-final-mile'],
    relatedGuides: ['import-planning-checklist', 'incoterms-handoffs'],
    mediaId: 'industry-industrial',
    mediaAlt: 'Close-up of industrial gears and machined parts in a workshop.',
  },
  {
    slug: 'time-critical-cargo',
    navLabel: 'Time-Critical Cargo',
    name: 'Time-critical cargo',
    menuLine: 'Next feasible movement and early exceptions',
    copy: 'Prioritize the next feasible movement and make exceptions visible early when timing cannot wait.',
    questions: [
      'What is the next feasible movement, and what does it depend on?',
      'Which documents or approvals could hold the shipment?',
      'Who needs to hear about an exception, and how quickly?',
      'What is the fallback if the first option is no longer feasible?',
    ],
    relatedServices: ['air-freight', 'customs-coordination', 'ground-final-mile'],
    relatedGuides: ['ocean-or-air-freight', 'import-planning-checklist'],
    mediaId: 'industry-time-critical',
    mediaAlt: 'Aircraft at an airport gate at night while cargo is handled.',
  },
];

export const getIndustry = (slug: string) => INDUSTRIES.find((industry) => industry.slug === slug) ?? null;
