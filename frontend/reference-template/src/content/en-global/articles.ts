/**
 * English guide content. The homepage resources module shows the three newest *published*
 * English articles; drafts are never rendered. In production this module is replaced by the
 * CMS query with the same shape.
 */
export type ArticleBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'note'; text: string };

export interface ArticleSection {
  heading: string;
  blocks: ArticleBlock[];
}

export interface Article {
  slug: string;
  locale: 'en';
  status: 'published' | 'draft';
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readMinutes: number;
  coverId: string | null;
  coverAlt: string;
  sections: ArticleSection[];
  relatedServices: string[];
}

const ARTICLES: Article[] = [
  {
    slug: 'china-sourcing-brief',
    locale: 'en',
    status: 'published',
    title: 'How to prepare a China sourcing brief',
    excerpt:
      'A useful sourcing brief does not need to be long. It needs to make the product, the quantities, the quality expectations, and the next decision clear to everyone involved.',
    category: 'China sourcing',
    publishedAt: '2026-09-22',
    readMinutes: 6,
    coverId: 'guide-sourcing-brief',
    coverAlt: 'A clipboard with a blank specification form, product samples, fabric swatches, and a tape measure.',
    sections: [
      {
        heading: 'Start with what you already have',
        blocks: [
          {
            type: 'p',
            text: 'A product link, photo, or short specification is enough to open a sourcing conversation. Share what you have instead of waiting for a perfect document — the brief can grow as the plan becomes clearer.',
          },
          {
            type: 'p',
            text: 'If you have a target cost, include it. It narrows supplier options early and keeps comparison conversations grounded.',
          },
        ],
      },
      {
        heading: 'Describe the product the way a supplier will quote it',
        blocks: [
          {
            type: 'p',
            text: 'Suppliers quote against details, not intentions. The more of these points you can confirm, the easier it is to compare answers like-for-like:',
          },
          {
            type: 'list',
            items: [
              'Materials, finish, and color references',
              'Dimensions, weight, and the tolerances that matter',
              'Variants such as sizes, colors, or bundles',
              'Retail and shipping packaging expectations',
              'Labels, markings, or documents your destination market requires',
            ],
          },
        ],
      },
      {
        heading: 'Be clear about quantities and timing',
        blocks: [
          {
            type: 'p',
            text: 'Share the first order quantity you are considering, whether you expect reorders, and the date the goods need to be available. Say whether that date is fixed or flexible — it changes which options are practical.',
          },
        ],
      },
      {
        heading: 'Agree what “acceptable” means before samples',
        blocks: [
          {
            type: 'p',
            text: 'Samples are only useful if everyone knows what they are checking. Write down the points that decide approval, who signs off, and what happens if a sample misses one of them.',
          },
          {
            type: 'note',
            text: 'Keep the brief, supplier answers, and sample feedback in one working thread so the next handoff starts from the latest version.',
          },
        ],
      },
      {
        heading: 'A short checklist before you send it',
        blocks: [
          {
            type: 'list',
            items: [
              'Product link, photo, or specification attached',
              'Target cost and quantity range stated',
              'Destination and target date included',
              'Packaging, labeling, and compliance needs noted',
              'Approval owner for samples named',
            ],
          },
        ],
      },
    ],
    relatedServices: ['product-sourcing', 'private-label'],
  },
  {
    slug: 'ocean-or-air-freight',
    locale: 'en',
    status: 'published',
    title: 'Ocean freight or air freight? A practical way to decide',
    excerpt:
      'The right mode depends on what the shipment has to protect: budget, a launch date, inventory cover, or a customer promise. Start there instead of with the mode.',
    category: 'International freight',
    publishedAt: '2026-09-15',
    readMinutes: 5,
    coverId: 'guide-ocean-air',
    coverAlt: 'Aerial view of a container port with cargo ships and cranes.',
    sections: [
      {
        heading: 'Start with the constraint, not the mode',
        blocks: [
          {
            type: 'p',
            text: 'Mode decisions go wrong when the question is “which is cheaper?” instead of “what does this shipment need to protect?” Name the constraint first — a launch date, stock cover, a customer promise, or the landed budget.',
          },
        ],
      },
      {
        heading: 'When ocean freight usually fits',
        blocks: [
          {
            type: 'p',
            text: 'Ocean freight is typically the economical leg for cargo that is ready early and does not need to arrive on a specific near-term date.',
          },
          {
            type: 'list',
            items: [
              'FCL (full container load): your cargo uses a whole container',
              'LCL (less than container load): your cargo shares container space and is consolidated with other shipments',
              'Port-to-door: the plan continues past the destination port to your delivery address',
            ],
          },
        ],
      },
      {
        heading: 'When air freight earns its place',
        blocks: [
          {
            type: 'p',
            text: 'Air freight is worth comparing when a launch, replenishment, or urgent order cannot wait for the next ocean cycle — or when goods are small and valuable relative to their size.',
          },
        ],
      },
      {
        heading: 'Questions that make the comparison useful',
        blocks: [
          {
            type: 'list',
            items: [
              'When will the cargo actually be ready for pickup?',
              'What are the carton dimensions, weights, and count?',
              'What date matters at destination — and what happens if it slips?',
              'Are there receiving requirements at the delivery address?',
              'Could part of the order move by air while the rest goes by ocean?',
            ],
          },
          {
            type: 'note',
            text: 'We do not publish generic transit times or prices. Practical options depend on the route, the cargo, and the date, and they are confirmed in the shipment plan.',
          },
        ],
      },
    ],
    relatedServices: ['ocean-freight', 'air-freight'],
  },
  {
    slug: 'import-planning-checklist',
    locale: 'en',
    status: 'published',
    title: 'Import planning checklist: what to confirm before cargo moves',
    excerpt:
      'Most delays are visible early if someone is looking. Use this checklist to confirm documents, responsibilities, and receiving details before goods leave the supplier.',
    category: 'Import preparation',
    publishedAt: '2026-09-03',
    readMinutes: 7,
    coverId: 'guide-import-checklist',
    coverAlt: 'A gloved hand writing on a clipboard among packed cartons.',
    sections: [
      {
        heading: 'Product and supplier details',
        blocks: [
          {
            type: 'list',
            items: [
              'Final product description, materials, and quantities',
              'Supplier name, pickup address, and cargo ready date',
              'Carton count, dimensions, and weights',
              'Any product-specific marking or labeling requirements',
            ],
          },
        ],
      },
      {
        heading: 'Commercial documents',
        blocks: [
          {
            type: 'p',
            text: 'Commercial invoices and packing lists should match each other and the goods. Share them early so questions surface before cargo reaches the next checkpoint.',
          },
          {
            type: 'p',
            text: 'Classification and formal clearance are handled by the responsible customs broker under the rules of the destination authority. Identify who that is before the shipment is booked.',
          },
        ],
      },
      {
        heading: 'Responsibilities and Incoterms',
        blocks: [
          {
            type: 'p',
            text: 'Agree the Incoterms rule with your supplier and write down who books, pays for, and insures each leg. If the rule and the plan disagree, fix it before pickup.',
          },
        ],
      },
      {
        heading: 'Destination and receiving',
        blocks: [
          {
            type: 'list',
            items: [
              'Delivery address, receiving hours, and site contact',
              'Appointment, dock, or equipment requirements',
              'Storage, consolidation, or fulfillment instructions',
              'Who confirms receipt and checks the goods',
            ],
          },
        ],
      },
      {
        heading: 'Exceptions',
        blocks: [
          {
            type: 'p',
            text: 'Decide who hears about a change — a late supplier, a document question, a missed appointment — and how quickly. A plan that shows the change early is easier to recover than one that hides it in a long email chain.',
          },
        ],
      },
    ],
    relatedServices: ['customs-coordination', 'warehousing-fulfillment'],
  },
  {
    slug: 'packaging-insert-guide',
    locale: 'en',
    status: 'published',
    title: 'Packaging and insert guide for fulfillment-ready goods',
    excerpt:
      'Inserts, stickers, hangtags, and branded boxes work best when artwork, quantities, and placement are confirmed before goods reach the packing table.',
    category: 'Packaging & branding',
    publishedAt: '2026-08-20',
    readMinutes: 5,
    coverId: 'guide-packaging',
    coverAlt: 'A person packing a folded t-shirt and a thank-you card into a cardboard box.',
    sections: [
      {
        heading: 'Decide what the customer should see first',
        blocks: [
          {
            type: 'p',
            text: 'List every brand element in the order the customer meets it — outer box, tissue, insert card, product label. It keeps the brief focused and avoids paying for elements nobody sees.',
          },
        ],
      },
      {
        heading: 'Confirm artwork and quantities',
        blocks: [
          {
            type: 'list',
            items: [
              'Final artwork files and approved versions',
              'Quantities per SKU, plus a small buffer for damage',
              'Who supplies each element and when it arrives',
              'Storage needs for packaging materials',
            ],
          },
        ],
      },
      {
        heading: 'Write placement instructions a packer can follow',
        blocks: [
          {
            type: 'p',
            text: 'Describe placement for each SKU in plain steps, ideally with a photo of an approved sample. “Insert card on top, logo facing up” is clearer than “include insert.”',
          },
        ],
      },
      {
        heading: 'Protect the product as well as the presentation',
        blocks: [
          {
            type: 'p',
            text: 'Presentation has to survive the journey. Confirm that branded packaging still protects the product through consolidation, freight, and final delivery.',
          },
        ],
      },
    ],
    relatedServices: ['packaging-branding', 'warehousing-fulfillment'],
  },
  {
    slug: 'incoterms-handoffs',
    locale: 'en',
    status: 'published',
    title: 'Incoterms in plain language: who owns which handoff?',
    excerpt:
      'Incoterms rules describe where responsibility moves between seller and buyer. Knowing that point makes quotes, insurance, and delivery plans easier to compare.',
    category: 'Incoterms',
    publishedAt: '2026-08-06',
    readMinutes: 6,
    coverId: 'guide-incoterms',
    coverAlt: 'Aerial view of a container ship crossing open water.',
    sections: [
      {
        heading: 'What Incoterms rules do — and do not — cover',
        blocks: [
          {
            type: 'p',
            text: 'Published by the International Chamber of Commerce, Incoterms® rules describe where delivery happens, when risk passes from seller to buyer, and who arranges and pays for carriage and certain costs.',
          },
          {
            type: 'p',
            text: 'They do not decide when ownership transfers, how payment works, or what happens if a contract is breached. Those belong in your purchase agreement.',
          },
        ],
      },
      {
        heading: 'Rules you will often see in quotes',
        blocks: [
          {
            type: 'list',
            items: [
              'EXW (Ex Works): the seller makes goods available at its premises; the buyer arranges almost everything from there.',
              'FOB (Free On Board): the seller delivers the goods on board the vessel at the named port of shipment. Used for sea and inland waterway transport.',
              'CIF (Cost, Insurance and Freight): the seller pays carriage and minimum insurance to the named destination port, but risk passes once the goods are on board at origin.',
              'DAP (Delivered at Place): the seller delivers to the named destination, ready for unloading; the buyer handles import clearance and duties.',
              'DDP (Delivered Duty Paid): the seller delivers to the named destination cleared for import, with duties paid.',
            ],
          },
        ],
      },
      {
        heading: 'Match the rule to your plan',
        blocks: [
          {
            type: 'p',
            text: 'A quote only makes sense next to the rule it assumes. Check that the named place is precise, that insurance matches where risk passes, and that the plan shows who owns each handoff after that point.',
          },
          {
            type: 'note',
            text: 'This guide is general information, not legal advice. Confirm the Incoterms version and terms in your contract.',
          },
        ],
      },
    ],
    relatedServices: ['ocean-freight', 'customs-coordination'],
  },
  {
    slug: 'supplier-coordination',
    locale: 'en',
    status: 'draft',
    title: 'Supplier coordination: keeping samples, approvals, and changes in one thread',
    excerpt: 'Draft — not yet published.',
    category: 'Supplier coordination',
    publishedAt: '2026-09-26',
    readMinutes: 5,
    coverId: 'guide-supplier-coordination',
    coverAlt: '',
    sections: [],
    relatedServices: ['product-sourcing'],
  },
];

export function getPublishedArticles(locale: Article['locale'] = 'en'): Article[] {
  return ARTICLES.filter((article) => article.status === 'published' && article.locale === locale).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function getLatestArticles(limit = 3): Article[] {
  return getPublishedArticles().slice(0, Math.max(0, limit));
}

export function getArticle(slug: string): Article | null {
  return getPublishedArticles().find((article) => article.slug === slug) ?? null;
}

export function formatArticleDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
