# FreightVanta English / Global Homepage — Frontend Requirements & Copy v2

> **Status:** implementation-ready homepage brief  
> **Market:** Global English, primarily for U.S.-oriented B2B buyers  
> **Primary conversion:** `Get a shipment plan`  
> **Last consolidated:** September 28, 2026

## 1. Homepage job and positioning

The English homepage is FreightVanta’s global entry point for U.S.-oriented importers, ecommerce operators, product teams, distributors, and growing brands. In the first screen it must explain that FreightVanta can coordinate the connected journey from **China product sourcing** through shipment preparation, international freight, warehousing, fulfillment, and the delivery handoff.

The page must answer four questions quickly:

1. Can this team help with my product, freight, storage, or fulfillment situation?
2. Do they understand that a shipment has several handoffs, not only one freight booking?
3. What do I need to provide to get a useful next step?
4. Where can I start an enquiry without knowing every logistics term?

### Positioning statement

> **FreightVanta turns scattered sourcing and freight handoffs into one workable shipment plan.**

### Voice

- Direct, calm, accountable, and practical.
- Explain the next useful action rather than using logistics jargon as decoration.
- Do not promise unverified transit times, cost savings, carrier relationships, warehouse locations, licenses, certifications, customer outcomes, or coverage numbers.

## 2. Research synthesis and page strategy

The existing competitor research shows a broad supply-chain offer: product sourcing, storage, packaging, private label, bulk purchasing, fulfillment, order handling, and tracking. FreightVanta should learn from that **service breadth and decision sequence**, not copy the competitor’s layout, wording, images, logo, or claims.

The differentiated English-site message is:

> **One clear operating view—from the first product or supplier decision through the delivery handoff.**

This supports four real visitor situations:

- “I need to source a product in China.”
- “My goods are ready and I need ocean or air freight.”
- “I need packaging, consolidation, storage, or fulfillment before delivery.”
- “I do not know which document or handoff matters next.”

## 3. English Global visual direction

### Template personality

**Pacific Operations** — a reliable modern freight plan, not a generic SaaS dashboard and not a low-price freight landing page.

### Design rules

- Deep navy carries the hero and operational modules.
- Signal blue is used for links, focus, and selected states.
- Safety orange appears only for decisive CTAs and route nodes.
- Cool white and mist blue separate reading-heavy modules.
- Use authentic port, cargo, warehouse, consolidation, and delivery imagery.
- The hero uses a simple route line: `Origin → Port → Warehouse → Customer`.
- Use structured lines, asymmetry, and generous spacing; do not fill the page with identical rounded cards.
- Motion is subtle and functional only. All content remains visible with `prefers-reduced-motion` enabled.

### Do not use

- Generic animated world maps.
- Fake shipment counters, invented ETA, savings percentages, reviews, stars, client logos, or “trusted by” claims.
- Repeated copy-and-paste imagery across every article or service module.
- Orange as a background for ordinary non-action content.
- Hover-only information or narrow-screen desktop navigation.

## 4. Homepage block order

| # | Block ID | Module | Reader question | Primary action |
| ---: | --- | --- | --- | --- |
| 1 | `home.announcement` | Announcement and header | What can I do here? | Get a shipment plan |
| 2 | `home.hero` | Sourcing-to-delivery hero | Can FreightVanta coordinate my situation? | Start an enquiry |
| 3 | `home.coverage` | Capability rail | Which handoffs are in scope? | Scan services |
| 4 | `home.services` | Service-path selector | Which service path fits me? | Explore a service |
| 5 | `home.operation` | Connected operation | Is this more than a freight booking? | Understand coordination |
| 6 | `home.process` | Four-step process | How will the work move forward? | Understand process |
| 7 | `home.industries` | Industry solutions | Do you understand my operating constraints? | View industry page |
| 8 | `home.resources` | Guides and planning resources | Can I learn before I enquire? | Browse guides |
| 9 | `home.faq` | FAQ | What common concerns are already answered? | Open an answer |
| 10 | `home.enquiry` | Shipment-plan form | What do I need to provide? | Submit enquiry |
| 11 | `home.footer` | Footer and compliance | Where are deeper links and legal details? | Navigate / contact |

## 5. Complete English copy and frontend requirements

### 5.1 Announcement and navigation

### Frontend requirements

- Desktop header: logo, `Solutions` mega menu, `Industries`, `Insights`, `About`, language picker, and primary CTA.
- Tablet and mobile: collapse to an accessible menu; never force desktop links onto one row.
- Header may become compact sticky navigation after the hero, while anchor targets remain visible below it.
- Every menu item must lead to a real page or an intentional same-page anchor.

### Copy

**Announcement**

> Freight moving to the U.S.? Get a shipment plan from a logistics specialist.

**Navigation**

- Solutions
  - Product Sourcing
  - Ocean Freight
  - Air Freight
  - Ground & Final Mile
  - Customs Coordination
  - Warehousing & Fulfillment
  - Packaging & Branding
  - Private Label & White Label
- Industries
  - Ecommerce & Retail
  - Consumer Goods
  - Industrial Components
  - Time-Critical Cargo
- Insights
- About FreightVanta
- Contact

**Header CTA:** `Get a shipment plan`

### 5.2 Hero: source, move, and deliver without losing context

### Layout

- Desktop: 44–48% copy and 52–56% freight visual.
- Image: port, container, cargo, or warehouse handoff. The current `global-us-freight-hero-v1.png` is suitable until an approved replacement exists.
- Route labels: `ORIGIN`, `PORT`, `WAREHOUSE`, `CUSTOMER`.
- Mobile: copy first, full-width CTA buttons, image below; no cropped title or route labels.

### Copy

**Eyebrow**

> GLOBAL SOURCING & FREIGHT, CLEARLY COORDINATED

**H1**

> From China sourcing to U.S. delivery, keep every handoff clear.

**Body**

> FreightVanta helps growing businesses coordinate product sourcing, shipment preparation, ocean and air freight, customs information, warehousing, fulfillment, and final delivery through one practical operating plan.

**Primary CTA**

> Get a shipment plan

**Secondary CTA**

> Explore solutions

**Microcopy**

> Start with a product link, a shipment brief, or the route you need to plan. We will help identify the next useful step.

**Hero image alt text**

> Container cargo moving through a port-to-warehouse freight handoff for U.S. delivery.

### 5.3 Capability rail

### Layout

- Use a horizontal information rail immediately below the hero, not six cards.
- Desktop: evenly spaced labels.
- Mobile: two-column list or deliberately scrollable row with visible continuation; text must remain at least 14px.

### Copy

- China product sourcing
- Ocean freight
- Air freight
- Customs coordination
- Warehousing & fulfillment
- Final-mile delivery

### 5.4 Service-path selector

### Interaction requirements

- Desktop: left vertical tabs and right editorial panel.
- Mobile: a horizontally scrollable tab strip plus one stacked panel.
- Use accessible tabs: `role="tablist"`, `aria-selected`, keyboard arrow navigation, visible focus, and no content-layout jump.
- One panel is active at a time. Do not replace this module with a six-card grid.

### Section copy

**Section label:** `WHAT WE COORDINATE`

**H2**

> One operating view from supplier to customer.

**Introduction**

> Your shipment rarely follows one simple step. We connect sourcing, preparation, transport, customs, storage, and delivery into a workflow your team can follow.

| Service | Title | Copy | Capability tags | Link label |
| --- | --- | --- | --- | --- |
| Product sourcing | Find the right product path. | Share a product link, photo, specification, or target cost. We help organize the supplier questions, comparison points, samples, and purchasing details that need to be clear before the next handoff. | China sourcing · Supplier briefing · Sample coordination | Explore product sourcing |
| Ocean freight | Plan the economical leg. | For consolidated or container freight, we help align cargo readiness, export documents, port handoffs, and the delivery plan. The brief shows what is included, which decisions remain open, and who owns the next move. | FCL · LCL · Port-to-door | Explore ocean freight |
| Air freight | Protect the time-sensitive leg. | When a launch, replenishment, or urgent order cannot wait for the next ocean cycle, we compare practical air options and organize pickup, shipment documents, and delivery handoffs. | Express · Standard · Urgent replenishment | Explore air freight |
| Customs coordination | Make documents ready early. | We help collect commercial invoices, packing details, and shipment information so questions are visible before cargo reaches the next checkpoint. Final classification and compliance remain subject to the applicable authority and responsible broker. | Shipment information · Document readiness · Handoff support | Explore customs support |
| Warehousing & fulfillment | Hold, check, and dispatch with purpose. | Inventory can be received, checked, consolidated, stored, and prepared for the destination you approve. Use the brief to keep product, packaging, and release instructions attached to the order. | Consolidation · Storage · Order preparation | Explore warehousing |
| Packaging & branding | Make the package feel like yours. | Coordinate approved inserts, stickers, hangtags, bags, boxes, and other brand elements as part of the fulfillment brief. Artwork, quantities, and production steps are confirmed before use. | Inserts · Labels · Private-label preparation | Explore packaging & branding |

**Panel CTA pattern**

> See how this service fits your shipment →

### 5.5 Connected operation

### Layout

- Dark navy operation panel with one left-side statement and a right-side editorial list.
- Use a fine route line or a warehouse / operations detail image; avoid large decorative icons.
- The four entries below must be short and scannable.

### Copy

**Section label:** `ONE CONNECTED OPERATION`

**H2**

> The details are where reliability is built.

1. **A named point of contact** — One person keeps the request, supplier questions, shipment notes, and next action in the same working thread.
2. **Checks before dispatch** — Confirm product condition, quantity, and agreed packaging instructions before goods leave the facility.
3. **Flexible shipment preparation** — Consolidate orders, separate destinations, or hold inventory according to the plan your team approves.
4. **Trackable handoffs** — Keep carrier references and status notes together so your team can see what changed and what happens next.

### 5.6 Four-step process

### Layout

- Desktop: horizontal route line with four milestones.
- Mobile: vertical timeline with visible step markers.
- This is the only major numbered sequence on the page because the order communicates actual operational flow.

### Copy

**H2**

> A practical process for complex freight.

**Supporting copy**

> The point is not to make logistics look simple. It is to keep the next decision, document, and handoff visible before it becomes a delay.

| Step | Heading | Copy |
| --- | --- | --- |
| 01 | Tell us what is moving. | Share product links, quantities, origin, destination, target date, and any packaging or compliance needs. |
| 02 | Review the plan. | We clarify the proposed service path, open questions, required documents, and responsibilities before work starts. |
| 03 | Coordinate every handoff. | Sourcing, purchasing, inspection, preparation, freight, storage, and delivery updates follow one working record. |
| 04 | Keep your customer promise. | Receive the tracking and exception notes your team needs to plan inventory and customer communication. |

**Closing reassurance**

> If an assumption changes, the plan should show the change instead of hiding it in a long email chain.

### 5.7 Industry solutions

### Layout

- One large featured industry image story plus a right-side industry list.
- Each list item combines an operating constraint and a real deep link.
- Do not render four identical industry cards.

### Copy

**H2**

> Built for teams that have something to lose in the handoff.

**Supporting copy**

> Different goods need different checks, documents, and delivery conversations. The work starts with the constraint that matters most to your operation.

| Industry | Copy | Destination |
| --- | --- | --- |
| Ecommerce & retail | Keep replenishment, bundles, marketplace preparation, and store-specific packaging organized from supplier to customer. | `/industries/cross-border-ecommerce` |
| Consumer goods | Coordinate product details, quality checks, launch readiness, and presentation from supplier to shelf or doorstep. | `/industries/consumer-goods` |
| Industrial components | Work from specifications, documentation, receiving requirements, and a clear plan for the next production or service handoff. | `/industries/industrial-components` |
| Time-critical cargo | Prioritize the next feasible movement and make exceptions visible early when timing cannot wait. | `/industries/time-critical-cargo` |

**CTA:** `Explore industry solutions`

### 5.8 Resources and guides

### Layout

- Populate from the three newest published English articles.
- First article: wider image-led treatment. Two further articles: supporting stories.
- Use an article’s actual cover image; do not reuse a generic route image on every card.
- The section heading and footer link must point to `/guides`.

### Copy

**Section label:** `PLANNING RESOURCES`

**H2**

> Shipping intelligence for better decisions.

**Introduction**

> Practical guides for China sourcing, international freight, import preparation, Incoterms, supplier coordination, and the decisions that sit between “ordered” and “delivered.”

**Always-visible topic links**

- Import planning checklist
- Ocean freight or air freight?
- How to prepare a China sourcing brief
- Packaging and insert guide

**CTA:** `Visit the resource center`

### 5.9 FAQ

### Interaction requirements

- Use native `<details>` / `<summary>` or an accessibility-equivalent component.
- Minimum 44px touch target; visible focus indicator; multiple answers may remain open.
- Do not force a one-open-only accordion.

### Copy

**H2**

> Questions before you move?

**Can I start with only a product link?**  
Yes. A product link, photo, or short specification is enough for an initial sourcing conversation. Quantities, destination, and timing can follow as the plan becomes clearer.

**Can you combine sourcing and fulfillment?**  
The homepage presents sourcing, preparation, freight, storage, and fulfillment as one connected workflow. The final scope is confirmed in the shipment plan.

**Can you help with both ocean and air freight?**  
Yes. Tell us what is moving, how quickly it needs to arrive, and what matters most to the shipment. We can discuss the practical service path and next handoff.

**Do you provide customs clearance?**  
We coordinate shipment information and document handoffs. The responsible broker, jurisdiction, classification, and formal clearance scope must be identified before making a clearance commitment.

**Can you support warehousing and fulfillment in the United States?**  
Tell us the receiving, storage, preparation, and release requirements. The available operating scope should be confirmed in the plan before inventory moves.

**Can I request just one service?**  
Yes. You can start with sourcing, transport, storage, packaging, fulfillment, or a combined plan. The form should let you choose the starting point.

### 5.10 Enquiry module

### Current implementation gap

The current English template uses a `mailto:` link in the final conversion area. Production requirement: replace it with a first-party enquiry form that has server-side validation, CSRF protection, spam protection, audit logging, loading feedback, success feedback, and recoverable errors.

### Layout

- Pale blue conversion band; desktop has heading left and form right.
- Mobile stacks heading, reassurance, and form in one readable column.
- Do not put the primary enquiry path inside a modal.

### Copy

**Eyebrow:** `REQUEST A SHIPMENT PLAN`

**H2**

> Tell us what you need to move. We will turn the moving parts into a plan your team can use.

**Supporting copy**

> Start with the product, the route, or the delivery outcome you need. A FreightVanta specialist will review the details and come back with the right next step.

| Field | Required | Input / options |
| --- | ---: | --- |
| Full name | Yes | text |
| Work email | Yes | email |
| Company | Yes | text |
| Phone | No | international telephone |
| Origin | Yes | country / city / port |
| Destination | Yes | country / city / port / ZIP code |
| Starting point | Yes | Product sourcing / Ocean freight / Air freight / Warehousing & fulfillment / Packaging & branding / Not sure yet |
| Cargo or product details | No | textarea |
| Target timing | No | Ready now / This month / Planning ahead |
| Additional context | No | textarea |
| Consent | Yes | checkbox with privacy-policy link |

**Button:** `Request a shipment plan`

**Loading:** `Sending your request…`

**Success:** `Thanks — your request is on its way. A FreightVanta specialist will review the details and follow up with the right next step.`

**Error:** `We could not send the request yet. Please check the highlighted fields and try again, or contact us using the details below.`

### 5.11 Footer

Required footer columns:

1. **FreightVanta** — “One practical plan, clear ownership, and updates you can act on.”
2. **Solutions** — product sourcing, freight, preparation, warehousing, fulfillment.
3. **Industries & Insights** — the four industry pages and `/guides`.
4. **Contact & legal** — contact, privacy, cookie policy, terms, language switcher.

Company address, phone number, contact email, social profiles, legal entity, and legal-policy URLs must be configurable. Never invent them in the template.

## 6. SEO and internal-linking requirements

**Recommended title**

> China Sourcing, International Freight & Fulfillment | FreightVanta

**Recommended meta description**

> FreightVanta coordinates China product sourcing, ocean and air freight, shipment preparation, warehousing, fulfillment, and U.S. delivery through one practical shipment plan.

### Requirements

- One H1 only: the hero heading.
- H2 for sections; H3 for individual services, process steps, industries, and article titles.
- Visible anchor text must link into product sourcing, service, industry, and guide pages.
- English root page uses `lang="en-US"`.
- Emit per-site canonical and matching `hreflang` links for all localized homepages.
- JSON-LD includes only visible verified content: `Organization`, `WebSite`, visible `Service` items, and visible `FAQPage` questions.
- Never use `AggregateRating`, `Review`, locations, or credentials until verified.

## 7. Image, performance, and responsive requirements

| Placement | Asset direction | Loading requirement |
| --- | --- | --- |
| Hero | Container port / warehouse freight handoff with clear cargo context | LCP asset: AVIF/WebP where available, fixed dimensions, `fetchpriority="high"`, no lazy load |
| Service selector | Service-specific operations / cargo planning scene | Active panel eager; inactive media lazy |
| Industries | Warehouse, fulfillment, consumer goods, or industrial receiving scene | Lazy load below initial viewport |
| Resources | Article-specific cover image | Lazy load below initial viewport |

### Responsive acceptance

| Width | Required behavior |
| --- | --- |
| ≥ 1280px | Hero remains two-column; selector stays split tab list + editorial panel; industry layout remains asymmetric. |
| 768–1279px | Header becomes menu when links no longer fit; hero remains two-column only when both copy and imagery have sufficient width. |
| 480–767px | Hero, services, process, industries, guides, FAQ, and enquiry stack vertically. |
| 320–479px | Primary CTA is full width; titles never overflow; form labels remain visible; no horizontal page scroll. |

### Accessibility acceptance

- WCAG AA text contrast.
- Meaningful images have descriptive alt text; decorative images use empty alt text.
- Visible keyboard focus for all navigation, links, tabs, accordions, and inputs.
- Tabs and FAQ work with keyboard and screen readers.
- Form errors identify the field and explain how to recover.
- Reduced-motion users see all information without a delayed reveal.
- Test at 320px, 375px, 390px, 768px, 1024px, and 1440px.

## 8. Data contract and implementation boundaries

Do not keep English homepage copy exclusively inside one shared Go template. The English site owns localized content while sharing a safe section contract with the other site templates.

Required fields per section:

```text
site_id, locale, section_key, enabled, sort_order,
eyebrow, title, body,
cta_primary_label, cta_primary_url,
cta_secondary_label, cta_secondary_url,
media_id, media_alt, items, settings,
draft_version, published_version
```

Required section keys:

```text
announcement, hero, coverage, service_paths, operation,
process, industries, resources, faq, enquiry, footer
```

Recommended template split:

```text
partials/header.html
partials/footer.html
pages/home.html
partials/home/hero.html
partials/home/coverage.html
partials/home/service-paths.html
partials/home/operation.html
partials/home/process.html
partials/home/industries.html
partials/home/resources.html
partials/home/faq.html
partials/home/enquiry.html
assets/home.css
assets/home.js
```

## 9. Analytics events

Track first-party, consent-aware interaction events. Never include form values in analytics.

| Event | Trigger |
| --- | --- |
| `home_hero_primary_click` | Hero primary CTA |
| `home_hero_secondary_click` | Hero secondary CTA |
| `home_service_tab_change` | Service tab changes |
| `home_service_link_click` | Service panel link |
| `home_industry_click` | Industry link |
| `home_guides_click` | Guide or resource-center link |
| `home_enquiry_started` | First form-field focus |
| `home_enquiry_submitted` | Valid form submit |
| `home_enquiry_error` | Validation or request failure |

## 10. Development acceptance checklist

- [ ] English Global / Pacific Operations structure is visibly distinct from the five localized templates.
- [ ] Hero clearly connects China sourcing, international freight, and U.S.-oriented delivery without unverified commercial claims.
- [ ] All modules above are present; no section is removed merely to make the page shorter.
- [ ] All CTA and navigation targets work.
- [ ] The production enquiry form replaces the `mailto:`-only conversion path.
- [ ] Article cards populate from published English content and have useful fallback states.
- [ ] Title, description, canonical, `hreflang`, Open Graph image, and JSON-LD match visible page content.
- [ ] No horizontal overflow at required widths.
- [ ] Images reserve layout space and the hero asset does not lazy load.
- [ ] The page has no invented client proof, carrier proof, route coverage, pricing, or performance claim.

## 11. Sources and verification log

| ID | Source | Role | Status |
| --- | --- | --- | --- |
| S1 | `docs/homepage-copy-en-global.md` | Existing English voice, service copy, FAQ, navigation, and prior competitor observation | Internal source |
| S2 | `docs/freightvanta-us-homepage-development-spec.md` | Buyer flow, form, SEO, accessibility, and performance requirements | Internal source |
| S3 | `docs/multilingual-homepage-template-directions.md` | English Global template personality and multi-template boundaries | Internal source |
| S4 | `frontend/public.html`, `frontend/assets/css/public.css`, `internal/httpserver/public.go` | Current implementation, fields, route structure, and existing assets | Implementation source |
| S5 | Prior competitor-site observation recorded in S1, accessed September 8, 2026 | Service-category breadth only; no copied wording, visuals, or claims | Secondary research note |

### Owner verification required before publishing

- Legal entity, official address, phone, email, privacy / cookie / terms URLs.
- Exact operating countries, ports, warehouse locations, broker responsibility, and service scope.
- Any customs license, certification, carrier relationship, transit time, pricing, SLA, case-study outcome, customer testimonial, or client logo.
- Enquiry-delivery behavior: CRM lead, email notification, internal task, or a combination.
