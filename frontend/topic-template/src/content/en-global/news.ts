/**
 * English news content. The newsroom listing (/news) shows published items
 * newest-first; drafts are never rendered. In production this module is
 * replaced by the CMS query with the same shape.
 *
 * Voice: direct, calm, accountable, practical. No invented transit times,
 * rates, ETAs, savings, customer outcomes, carrier relationships, or
 * coverage claims — every item explains what to check and who owns it.
 */
import type { ArticleSection } from './articles';

export type NewsCategory =
  | 'Freight operations'
  | 'Customs & documents'
  | 'Sourcing & quality'
  | 'Warehousing & fulfillment';

export interface NewsItem {
  slug: string;
  locale: 'en';
  status: 'published' | 'draft';
  /** Shown on the listing lead card. Only one item should be featured. */
  featured?: boolean;
  title: string;
  excerpt: string;
  category: NewsCategory;
  publishedAt: string;
  updatedAt?: string;
  readMinutes: number;
  coverId: string | null;
  coverAlt: string;
  /** 3–4 bullets rendered in the "In brief" box on the detail page. */
  keyPoints: string[];
  sections: ArticleSection[];
  tags: string[];
  relatedServices: string[];
  relatedGuides: string[];
}

export const NEWS_CATEGORIES: Array<{ name: NewsCategory; description: string }> = [
  {
    name: 'Freight operations',
    description: 'Ocean, air, and final-mile movements — what changes, and what to check first.',
  },
  {
    name: 'Customs & documents',
    description: 'Invoices, packing details, and document readiness before each checkpoint.',
  },
  {
    name: 'Sourcing & quality',
    description: 'Supplier conversations, samples, and specifications from China.',
  },
  {
    name: 'Warehousing & fulfillment',
    description: 'Receiving, counts, packout rules, and release decisions.',
  },
];

const NEWS: NewsItem[] = [
  {
    slug: 'peak-season-ocean-planning',
    locale: 'en',
    status: 'published',
    featured: true,
    title: 'Peak-season ocean planning: what to lock in before space tightens',
    excerpt:
      'Peak season does not change how ocean freight works — it shortens how long each decision can wait. Here is what to confirm early so a booking stays workable when space gets tight.',
    category: 'Freight operations',
    publishedAt: '2026-09-28',
    readMinutes: 6,
    coverId: 'news-ocean-peak',
    coverAlt: 'Aerial view of a container ship loading at a busy port terminal.',
    keyPoints: [
      'Confirm cargo readiness and carton details before requesting space.',
      'Keep one owner for export documents so nothing waits on a missing file.',
      'Decide the destination handoff early — port pickup or door delivery.',
    ],
    sections: [
      {
        heading: 'Why peak season punishes vague bookings',
        blocks: [
          {
            type: 'p',
            text: 'Outside peak season, a booking with approximate carton counts or an unsettled pickup date can usually be corrected without consequence. During peak, those same gaps compete with every other shipper for the same space, and corrections move to the back of the queue.',
          },
          {
            type: 'p',
            text: 'The fix is not to book earlier at any cost. It is to arrive with a booking your forwarder can actually execute: confirmed readiness, real dimensions, and documents that already exist in draft.',
          },
        ],
      },
      {
        heading: 'The four details that decide whether space holds',
        blocks: [
          {
            type: 'p',
            text: 'Space is allocated to shipments that look ready to move. Before you ask about availability, confirm these four points with your supplier:',
          },
          {
            type: 'list',
            items: [
              'Cargo ready date — the day goods can leave the factory, not the day production starts',
              'Final carton count, dimensions, and gross weight per carton',
              'Pickup address and contact, plus any loading constraints',
              'Commercial invoice and packing list, at least in near-final draft',
            ],
          },
          {
            type: 'note',
            text: 'If any of these four are still estimates, say so plainly. A booking built on declared estimates is easier to adjust than one built on silent guesses.',
          },
        ],
      },
      {
        heading: 'LCL or FCL during peak: how to think about it',
        blocks: [
          {
            type: 'p',
            text: 'Consolidated (LCL) freight depends on cutoff times at the consolidation warehouse, which compress first when volume rises. Full container (FCL) freight depends more on equipment availability at your origin. Neither is automatically safer — the safer choice is the one whose dependencies you have already confirmed.',
          },
          {
            type: 'p',
            text: 'If your cartons are ready early but your documents are not, that imbalance matters more than the mode itself. Close the document gap first, then compare modes on equal footing.',
          },
        ],
      },
      {
        heading: 'What to do this week',
        blocks: [
          {
            type: 'list',
            items: [
              'Ask your supplier for a written ready date and final packing details',
              'Decide port pickup versus door delivery with whoever receives the goods',
              'Name one person who owns export documents end to end',
              'Share the draft invoice and packing list with your freight contact before booking',
            ],
          },
        ],
      },
    ],
    tags: ['ocean freight', 'peak season', 'LCL', 'FCL', 'booking readiness'],
    relatedServices: ['ocean-freight', 'customs-coordination'],
    relatedGuides: ['ocean-or-air-freight', 'import-planning-checklist'],
  },
  {
    slug: 'air-freight-peak-decisions',
    locale: 'en',
    status: 'published',
    title: 'When air freight makes sense during peak replenishment',
    excerpt:
      'Air freight is not a faster version of ocean freight — it is a different decision with different trade-offs. Use this framing to decide what flies, what waits, and what splits.',
    category: 'Freight operations',
    publishedAt: '2026-09-18',
    readMinutes: 5,
    coverId: 'news-air-ops',
    coverAlt: 'Ground crew and service vehicles handling an aircraft at an airport terminal.',
    keyPoints: [
      'Fly the SKUs that protect revenue, not the whole replenishment.',
      'Dimensional weight decides the true cost — measure cartons, not hopes.',
      'Confirm destination receiving before the cargo lands.',
    ],
    sections: [
      {
        heading: 'Start from the stockout, not the mode',
        blocks: [
          {
            type: 'p',
            text: 'The useful question is never “should we use air freight?” It is “which SKUs, in what quantity, keep us covered until the ocean shipment arrives?” Answer that first, and the air freight decision usually becomes obvious — often smaller than feared.',
          },
          {
            type: 'p',
            text: 'Split shipments are normal during peak: a small air portion covers the gap while the economical ocean portion follows. The two legs need one shared record so receiving knows what arrives when.',
          },
        ],
      },
      {
        heading: 'What air freight actually charges for',
        blocks: [
          {
            type: 'p',
            text: 'Air freight bills on chargeable weight — the greater of actual weight and dimensional (volumetric) weight. Light but bulky cartons cost far more than their scale weight suggests, which is why estimated dimensions produce estimated budgets.',
          },
          {
            type: 'list',
            items: [
              'Measure a packed, sealed carton — length, width, height, and gross weight',
              'Count cartons exactly; “about 40 cartons” is not a booking',
              'Flag batteries, liquids, magnets, or anything that may need review',
              'Confirm the pickup address and earliest handover time',
            ],
          },
        ],
      },
      {
        heading: 'The destination half of the decision',
        blocks: [
          {
            type: 'p',
            text: 'Air cargo that lands without a receiving plan simply waits in a different place. Before confirming, check who clears it, who picks it up, and whether the destination can receive on arrival day — including weekends and holidays.',
          },
          {
            type: 'note',
            text: 'We do not publish generic transit times. Practical timing depends on the route, the cargo, and the ready date, and it is confirmed per shipment — never assumed from a previous one.',
          },
        ],
      },
    ],
    tags: ['air freight', 'replenishment', 'peak season', 'split shipment'],
    relatedServices: ['air-freight', 'ocean-freight'],
    relatedGuides: ['ocean-or-air-freight'],
  },
  {
    slug: 'customs-document-readiness',
    locale: 'en',
    status: 'published',
    title: 'Customs document readiness: the three checks that prevent holds',
    excerpt:
      'Most customs holds trace back to documents that disagree with each other — not to the goods themselves. Run these three checks before cargo leaves and most surprises disappear.',
    category: 'Customs & documents',
    publishedAt: '2026-09-10',
    readMinutes: 5,
    coverId: 'news-docs-sign',
    coverAlt: 'Hands signing shipping documents on a clipboard.',
    keyPoints: [
      'Invoice, packing list, and booking must describe the same goods.',
      'Product descriptions should say what the item is, not just a model code.',
      'Name the responsible broker before the shipment is booked.',
    ],
    sections: [
      {
        heading: 'Check one: the three documents agree',
        blocks: [
          {
            type: 'p',
            text: 'The commercial invoice, packing list, and freight booking are read together. When quantities, weights, or goods descriptions differ between them, the shipment stops until someone reconciles the difference — usually at the worst moment.',
          },
          {
            type: 'list',
            items: [
              'Total quantity matches on invoice, packing list, and booking',
              'Gross and net weights are consistent across all three',
              'Shipper, consignee, and notify party are complete and identical',
            ],
          },
        ],
      },
      {
        heading: 'Check two: descriptions a stranger could understand',
        blocks: [
          {
            type: 'p',
            text: 'Model numbers and internal SKUs mean nothing to an officer meeting your goods for the first time. Each line should state plainly what the item is, what it is made of, and what it is used for.',
          },
          {
            type: 'p',
            text: '“Silicone kitchen spatula, retail-packed” clears faster than “Model K-2200.” Keep the model code — but add the plain description beside it.',
          },
        ],
      },
      {
        heading: 'Check three: the broker is named, not assumed',
        blocks: [
          {
            type: 'p',
            text: 'Someone has to classify the goods, file the entry, and answer questions. If no broker is named before departure, that decision gets made under time pressure at arrival — exactly when mistakes are most expensive.',
          },
          {
            type: 'note',
            text: 'Final classification and compliance remain subject to the applicable authority and the responsible broker. FreightVanta coordinates the document handoff; it does not replace either.',
          },
        ],
      },
    ],
    tags: ['customs', 'documents', 'commercial invoice', 'packing list'],
    relatedServices: ['customs-coordination', 'ocean-freight'],
    relatedGuides: ['import-planning-checklist', 'incoterms-handoffs'],
  },
  {
    slug: 'warehouse-peak-readiness',
    locale: 'en',
    status: 'published',
    title: 'Warehouse peak readiness: receiving, counts, and release rules',
    excerpt:
      'Peak volume exposes every ambiguity in receiving. Tighten three things — the inbound notice, the count method, and the release rule — and the warehouse stops being the bottleneck.',
    category: 'Warehousing & fulfillment',
    publishedAt: '2026-08-28',
    readMinutes: 6,
    coverId: 'news-warehouse-scan',
    coverAlt: 'A warehouse employee scanning items with a tablet for inventory accuracy.',
    keyPoints: [
      'Every inbound needs a written notice: what, how many, and for whom.',
      'Agree the count method before cartons arrive, not during unloading.',
      'No release without a release rule — who approves, and in what form.',
    ],
    sections: [
      {
        heading: 'The inbound notice is the whole game',
        blocks: [
          {
            type: 'p',
            text: 'A warehouse can only receive against expectations. An inbound notice that lists SKUs, carton counts, and the purchase reference turns unloading into verification. Without one, unloading becomes detective work — slow, error-prone, and billed by the hour of confusion.',
          },
          {
            type: 'list',
            items: [
              'SKU list with expected units per SKU',
              'Carton count and any pallet breakdown',
              'Purchase or shipment reference the team can quote back',
              'Known exceptions already declared (short carton, split delivery)',
            ],
          },
        ],
      },
      {
        heading: 'Agree how counts are settled',
        blocks: [
          {
            type: 'p',
            text: 'Disputes are rarely about dishonesty; they are about method. Was the count by carton or by unit? Were damages photographed before or after stacking? Settle the method in writing before the truck arrives and most “missing unit” conversations never start.',
          },
          {
            type: 'p',
            text: 'For high-SKU inbounds, confirm whether the warehouse checks every unit or samples by carton — and what evidence (photos, scan logs) you receive either way.',
          },
        ],
      },
      {
        heading: 'Release rules prevent the second bottleneck',
        blocks: [
          {
            type: 'p',
            text: 'Goods that arrive cleanly can still stall if nobody defined how they leave. A release rule names who can authorize a release, what a valid instruction looks like, and what happens to partial or held stock.',
          },
          {
            type: 'note',
            text: 'Keep product, packaging, and release instructions attached to the order — not scattered across chat threads the packing team cannot see.',
          },
        ],
      },
    ],
    tags: ['warehousing', 'receiving', 'inventory counts', 'peak season'],
    relatedServices: ['warehousing-fulfillment'],
    relatedGuides: ['import-planning-checklist', 'packaging-insert-guide'],
  },
  {
    slug: 'supplier-sample-rounds',
    locale: 'en',
    status: 'published',
    title: 'Supplier sample rounds: how to keep feedback usable',
    excerpt:
      'Sample rounds fail when feedback is vague, scattered, or late. A simple round structure — one checklist, one owner, one deadline — keeps suppliers and buyers moving together.',
    category: 'Sourcing & quality',
    publishedAt: '2026-08-19',
    readMinutes: 5,
    coverId: 'news-factory-inspect',
    coverAlt: 'A factory worker inspecting materials for quality in a bright production hall.',
    keyPoints: [
      'Send one consolidated feedback list per round — never drip comments.',
      'Pair every complaint with its evidence: photo, measurement, or reference.',
      'Define what ends sampling: approval criteria, not a round count.',
    ],
    sections: [
      {
        heading: 'Why samples stall: feedback without structure',
        blocks: [
          {
            type: 'p',
            text: 'A supplier receiving “the color is a bit off” alongside three separate chat messages cannot act with confidence — so they guess, and the next sample misses in a new direction. Each round should carry one consolidated list, in priority order, with the previous round attached for comparison.',
          },
        ],
      },
      {
        heading: 'The anatomy of usable feedback',
        blocks: [
          {
            type: 'list',
            items: [
              'What you checked (dimension, color, finish, function, packaging)',
              'What you found, with a photo or measurement as evidence',
              'What “correct” looks like, referencing the approved spec or prior sample',
              'Whether the issue blocks approval or is a minor note',
            ],
          },
          {
            type: 'p',
            text: 'Photos beat adjectives. A picture of the defect next to a ruler answers in seconds what paragraphs cannot.',
          },
        ],
      },
      {
        heading: 'Agree the exit before round one',
        blocks: [
          {
            type: 'p',
            text: 'Endless sampling usually means nobody defined “approved.” Before the first sample ships, write down who approves, against which checklist, and how many rounds the plan assumes — plus what happens if the plan needs more.',
          },
          {
            type: 'note',
            text: 'Sampling or inspection standards are published only when separately confirmed. The sourcing record should show what was reviewed and what remains open.',
          },
        ],
      },
    ],
    tags: ['sourcing', 'samples', 'supplier communication', 'quality'],
    relatedServices: ['product-sourcing'],
    relatedGuides: ['china-sourcing-brief', 'supplier-coordination'],
  },
  {
    slug: 'packout-rules-peak-volume',
    locale: 'en',
    status: 'published',
    title: 'Packout rules that survive peak volume',
    excerpt:
      'When order volume doubles, packout quality is decided by the written rule — not by memory. Here is how to write a packout instruction a new packer can follow on day one.',
    category: 'Warehousing & fulfillment',
    publishedAt: '2026-08-07',
    readMinutes: 5,
    coverId: 'news-pack-seal',
    coverAlt: 'Hands sealing a cardboard shipping box with packing tape.',
    keyPoints: [
      'One SKU, one packout rule — no exceptions living in chat history.',
      'Photograph the approved packout, not just the finished product.',
      'Version every insert and label change with an effective date.',
    ],
    sections: [
      {
        heading: 'What a packout rule must contain',
        blocks: [
          {
            type: 'p',
            text: 'A complete packout rule answers six questions for each SKU: which box, which dunnage, which inserts and labels, in what order, sealed how, and what a finished parcel looks like. If any answer lives only in someone’s head, peak volume will find it.',
          },
          {
            type: 'list',
            items: [
              'Box size and dunnage type per SKU or bundle',
              'Insert, sticker, and label placement — with photos',
              'Sealing method and fragile or orientation markings',
              'What to do when a component runs out (never improvise silently)',
            ],
          },
        ],
      },
      {
        heading: 'Photograph the process, not just the result',
        blocks: [
          {
            type: 'p',
            text: 'A photo of the sealed box proves nothing about what went inside. Photograph each layer as it is built — empty box, dunnage, product, inserts, sealed box — and pin the sequence where packers work.',
          },
        ],
      },
      {
        heading: 'Version changes like software releases',
        blocks: [
          {
            type: 'p',
            text: 'Insert swaps and label updates are the classic source of mixed parcels. Give every packout change a version number and an effective date, and state plainly what happens to old stock: use up, quarantine, or destroy.',
          },
          {
            type: 'note',
            text: 'Artwork, quantities, and production steps are confirmed before use — and re-confirmed before any peak rerun.',
          },
        ],
      },
    ],
    tags: ['fulfillment', 'packout', 'packaging', 'peak season'],
    relatedServices: ['warehousing-fulfillment', 'packaging-branding'],
    relatedGuides: ['packaging-insert-guide'],
  },
  {
    slug: 'reading-rolled-sailing',
    locale: 'en',
    status: 'published',
    title: 'Port schedule changes: how to read a rolled sailing',
    excerpt:
      'A “rolled” booking is frustrating but legible. Learn what the notice actually says, which questions unlock the next options, and how to protect the delivery plan.',
    category: 'Freight operations',
    publishedAt: '2026-07-24',
    readMinutes: 5,
    coverId: 'news-port-dusk',
    coverAlt: 'Container port cranes silhouetted against a dusk sky.',
    keyPoints: [
      'A rolled sailing means the cargo did not load — the why decides the remedy.',
      'Ask for the next confirmed option in writing, with its own cutoff.',
      'Protect the destination plan first; the sailing is only half the story.',
    ],
    sections: [
      {
        heading: 'What “rolled” actually means',
        blocks: [
          {
            type: 'p',
            text: 'When a booking is rolled, the cargo stays behind while the vessel sails — usually because the vessel is full, the cutoff was missed, or documents were incomplete. The notice should say which. If it does not, that missing reason is your first question, because each cause has a different fix.',
          },
        ],
      },
      {
        heading: 'The four questions that unlock options',
        blocks: [
          {
            type: 'list',
            items: [
              'What is the next sailing with confirmed space for this cargo?',
              'What is its documentation and cargo cutoff, exactly?',
              'Does anything about the booking need to change (port, service, split)?',
              'Who confirms the rebooking, and by when?',
            ],
          },
          {
            type: 'p',
            text: 'Get the answers in writing. Verbal “probably next week” commitments evaporate the moment space tightens again.',
          },
        ],
      },
      {
        heading: 'Protect the delivery plan, not just the sailing',
        blocks: [
          {
            type: 'p',
            text: 'While the new sailing is arranged, warn the destination side immediately: receiving windows, warehouse appointments, and customer promises all shift. A plan that shows the change early is recoverable; one that hides it becomes a second crisis on arrival.',
          },
          {
            type: 'note',
            text: 'If an assumption changes, the plan should show the change instead of hiding it in a long email chain.',
          },
        ],
      },
    ],
    tags: ['ocean freight', 'schedule reliability', 'port operations'],
    relatedServices: ['ocean-freight'],
    relatedGuides: ['ocean-or-air-freight', 'incoterms-handoffs'],
  },
  {
    slug: 'replenishment-cadence-marketplaces',
    locale: 'en',
    status: 'published',
    title: 'Replenishment cadence: keeping marketplace stock covered',
    excerpt:
      'Stockouts rarely come from one failed shipment — they come from a replenishment rhythm nobody wrote down. Set a cadence around lead time, safety cover, and reorder triggers.',
    category: 'Warehousing & fulfillment',
    publishedAt: '2026-07-10',
    readMinutes: 6,
    coverId: 'news-pack-thanks',
    coverAlt: 'Hands packing a product with a thank-you card into a shipping box.',
    keyPoints: [
      'Reorder from lead time plus cover — not from gut feel.',
      'Separate marketplace prep rules per channel before stock arrives.',
      'Review the cadence monthly; demand and lead times both move.',
    ],
    sections: [
      {
        heading: 'The three numbers behind every reorder',
        blocks: [
          {
            type: 'p',
            text: 'A workable cadence needs three numbers per SKU: average daily sales, total lead time from order to available stock, and the safety cover you want in days. Reorder when stock on hand plus inbound falls below daily sales times lead time plus cover.',
          },
          {
            type: 'p',
            text: 'Write the formula down and share it. When the person who “just knows” is on leave, the business should still reorder correctly.',
          },
        ],
      },
      {
        heading: 'Marketplace prep is part of the lead time',
        blocks: [
          {
            type: 'p',
            text: 'FNSKU labels, poly-bagging, bundle building, and carton requirements all consume days between arrival and availability. Different marketplaces mean different prep rules — confirm them per channel before the goods land, not while they sit.',
          },
          {
            type: 'list',
            items: [
              'Label and prep requirements per marketplace',
              'Who applies them — origin, warehouse, or not at all',
              'How prep time is counted inside the lead time',
            ],
          },
        ],
      },
      {
        heading: 'Review the rhythm, not just the stock',
        blocks: [
          {
            type: 'p',
            text: 'A cadence set in January will be wrong by October. Put a monthly review on the calendar: compare actual sales and actual lead times against the plan, and adjust triggers before a stockout forces the conversation.',
          },
        ],
      },
    ],
    tags: ['ecommerce', 'replenishment', 'marketplaces', 'inventory planning'],
    relatedServices: ['warehousing-fulfillment', 'product-sourcing'],
    relatedGuides: ['packaging-insert-guide', 'import-planning-checklist'],
  },
  {
    slug: 'last-mile-delivery-handoff',
    locale: 'en',
    status: 'published',
    title: 'Last-mile delivery handoff: a checklist for U.S. addresses',
    excerpt:
      'Failed deliveries are usually failed handoffs: incomplete addresses, no receiving contact, or access rules nobody shared. This checklist closes those gaps before dispatch.',
    category: 'Freight operations',
    publishedAt: '2026-06-26',
    readMinutes: 4,
    coverId: 'news-lastmile-van',
    coverAlt: 'A courier stepping out of a delivery van with a parcel in a residential street.',
    keyPoints: [
      'Validate the full address, including unit, access codes, and hours.',
      'Name a receiving contact with a working phone number.',
      'Confirm what happens on a failed attempt — before dispatch.',
    ],
    sections: [
      {
        heading: 'The address is a delivery plan, not a line of text',
        blocks: [
          {
            type: 'p',
            text: 'A street address without a unit number, gate code, or receiving hours is a guess, not a plan. Residential, commercial, and warehouse addresses each fail differently — collect the fields each type needs.',
          },
          {
            type: 'list',
            items: [
              'Full address with unit, floor, or suite — never optional',
              'Access codes, gate instructions, or dock directions',
              'Receiving hours and the name of the receiving contact',
              'A phone number that is answered during delivery hours',
            ],
          },
        ],
      },
      {
        heading: 'Agree the failed-attempt path in advance',
        blocks: [
          {
            type: 'p',
            text: 'Even perfect addresses meet locked gates and absent receivers. Decide beforehand: how many attempts, where the parcel waits between them, who is notified, and who pays for redelivery or storage.',
          },
          {
            type: 'note',
            text: 'Keep carrier references and status notes together so your team can see what changed and what happens next.',
          },
        ],
      },
    ],
    tags: ['last mile', 'delivery', 'receiving', 'checklist'],
    relatedServices: ['warehousing-fulfillment'],
    relatedGuides: ['import-planning-checklist'],
  },
  {
    slug: 'freight-documents-final-mile-paperwork',
    locale: 'en',
    status: 'draft',
    title: 'Final-mile paperwork: what drivers actually need at the door',
    excerpt: 'Draft — not yet published.',
    category: 'Customs & documents',
    publishedAt: '2026-10-02',
    readMinutes: 4,
    coverId: 'news-parcel-van',
    coverAlt: '',
    keyPoints: [],
    sections: [],
    tags: [],
    relatedServices: [],
    relatedGuides: [],
  },
];

export function getPublishedNews(): NewsItem[] {
  return NEWS.filter((item) => item.status === 'published' && item.locale === 'en').sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function getNewsBySlug(slug: string): NewsItem | null {
  return getPublishedNews().find((item) => item.slug === slug) ?? null;
}

export function getFeaturedNews(): NewsItem | null {
  const published = getPublishedNews();
  return published.find((item) => item.featured) ?? published[0] ?? null;
}

export function getAdjacentNews(slug: string): { newer: NewsItem | null; older: NewsItem | null } {
  const published = getPublishedNews();
  const index = published.findIndex((item) => item.slug === slug);
  if (index === -1) return { newer: null, older: null };
  return {
    newer: index > 0 ? published[index - 1] : null,
    older: index < published.length - 1 ? published[index + 1] : null,
  };
}

export function getRelatedNews(slug: string, limit = 3): NewsItem[] {
  const published = getPublishedNews();
  const current = published.find((item) => item.slug === slug);
  if (!current) return published.slice(0, limit);
  const others = published.filter((item) => item.slug !== slug);
  const sameCategory = others.filter((item) => item.category === current.category);
  const rest = others.filter((item) => item.category !== current.category);
  return [...sameCategory, ...rest].slice(0, Math.max(0, limit));
}

export function formatNewsDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export function formatNewsMonth(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function slugifyHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}
