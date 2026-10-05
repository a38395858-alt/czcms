# FreightVanta Global Services - Content And Development Specification

## 1. Purpose

Build a `Services` center for FreightVanta's English global site. The center needs enough detail for an ecommerce operator, importer, brand owner, or procurement team to understand where a service starts, what information is required, how the work is coordinated, and what the next action is.

This specification studies the information architecture of LstDropshipping as a market reference. It does **not** reuse its wording, claims, testimonials, images, site code, prices, warehouse locations, carrier list, or performance promises. All FreightVanta copy below is original draft copy. Any operational claim, country coverage, warehouse location, integration, SLA, rate, certification, or customer story must be verified by the site owner before publishing.

## 2. Research Summary

### 2.1 Reference observed

Source: `https://www.lstdrop.com/web/index.php` and its public service URLs. Accessed 2026-09-16.

The reference site uses a six-item `PRO SERVICES` menu:

1. Product sourcing
2. Packaging and branding
3. Bulk order
4. Bulk inventory storage
5. Private label and white label
6. Worldwide fulfillment

Its homepage follows a high-density sales narrative:

1. Hero with one primary conversion.
2. A paragraph explaining the end-to-end operating model.
3. Six service entries with short explanatory copy.
4. A reason-to-choose-us section with six operational proof themes.
5. Three operational capability groups: warehousing/delivery, automated order processing, and shipment tracking.
6. Reviews and a long contact conversion section.

The public service pages use a consistent long-form pattern rather than a short marketing landing page:

| Reference service | Observed content pattern | Approximate visible density | FreightVanta response |
| --- | --- | ---: | --- |
| Packaging and branding | Hero, six-step production workflow, packaging formats, conversion CTA | 28 paragraphs | Explain artwork-to-packout coordination without promising manufacturing ownership. |
| Bulk order | Hero, two buyer situations, six steps, four reasons, CTA | 17+ paragraphs | Use a procurement and inventory-readiness page without claiming discounts. |
| Inventory storage | Hero, four operational steps, availability explanation, offer/non-offer list | 19 paragraphs | Explain receiving, count, storage instruction, bundling, and release rules. |
| Private and white label | Hero, six-step workflow, five business outcomes, examples, CTA | 33 paragraphs | Explain approval gates and brand asset control without claiming a product-development team unless verified. |
| Worldwide fulfillment | Hero, six capabilities, five reasons, location/shipping explanation, FAQ-style education | 46 paragraphs | Use a fuller fulfillment page with scope, order lifecycle, exceptions, and handoff rules. |

### 2.2 Content decision

FreightVanta should match the **information depth**, not the competitor's claims. Every service page should contain:

- one H1 and a specific business problem;
- 80-110 words of hero/supporting copy;
- a "when this service fits" section with three buyer situations;
- a 4-6 step service workflow;
- a scope list showing included coordination and items requiring confirmation;
- a practical "what we need from you" list;
- 4-6 operational advantages stated without invented metrics;
- 4-5 visible FAQs;
- a related-services rail;
- a final enquiry band.

Target published copy density: **1,100-1,500 English words per service page**, excluding navigation, footer, legal text, and repeated form labels. This meets the reference's long-page depth while remaining useful for B2B readers.

## 3. Information Architecture

### 3.1 Services navigation

Desktop navigation label: `Services`

Mega-menu group `BUILD AND PREPARE`:

- Product Sourcing
- Packaging and Branding
- Bulk Procurement
- Inventory Storage
- Private and White Label
- Worldwide Fulfillment

Mega-menu supporting line:

> Start with one service or connect several handoffs into one workable plan.

Mega-menu CTA: `Request a shipment plan`

Each menu item needs a one-sentence description, not only a title:

| Item | Menu description |
| --- | --- |
| Product Sourcing | Turn a product brief into supplier questions, comparison points, and a purchase-ready next step. |
| Packaging and Branding | Coordinate approved packaging, inserts, labels, and packout instructions before dispatch. |
| Bulk Procurement | Prepare a larger purchase with clearer quantities, production questions, and inventory decisions. |
| Inventory Storage | Receive, count, hold, combine, and release goods according to an approved instruction. |
| Private and White Label | Keep product, packaging, and brand approvals connected from sample through fulfillment. |
| Worldwide Fulfillment | Prepare orders for dispatch with clear picking, packing, shipping, and exception handoffs. |

### 3.2 Route structure

```text
/services
/services/product-sourcing
/services/packaging-branding
/services/bulk-procurement
/services/inventory-storage
/services/private-white-label
/services/worldwide-fulfillment
```

The `/services` index presents the six services as linked editorial rows or mixed-size visual modules. Do not use six identical icon cards. Each detail page uses the same data contract but has different imagery, workflow emphasis, and scope list.

### 3.3 Shared page order

1. Breadcrumbs
2. Service hero: eyebrow, H1, lead, primary and secondary CTA, service image
3. Buyer situations: "When this service fits"
4. Operating workflow: numbered only because it is a real sequence
5. Service scope: what FreightVanta coordinates and what requires confirmation
6. Information needed to start
7. Why this operating model helps
8. Related services
9. FAQ
10. Enquiry band

## 4. Shared Content Rules

### Voice

- Direct, precise, and practical.
- Explain decisions and handoffs rather than use generic superlatives.
- Use "can coordinate", "can prepare", and "subject to confirmation" when service scope is not yet verified.
- Do not claim lowest prices, guaranteed delivery times, automatic integrations, free storage, a named warehouse network, or global coverage without approved evidence.
- Do not include invented reviews, client logos, carrier logos, warehouse photos, numbers, or ratings.

### Content density per detail page

| Block | Target length | Content requirement |
| --- | ---: | --- |
| Hero lead | 80-110 words | Define the service, its handoff, and the reader benefit. |
| Buyer situations | 3 x 35-55 words | Describe concrete use cases. |
| Workflow | 4-6 x 35-55 words | Each step has a distinct responsibility. |
| Scope | 8-12 bullets | Separate confirmed work from items requiring approval. |
| Start checklist | 5-7 bullets | Make the enquiry easier to complete. |
| Operating advantages | 4-6 x 35-50 words | Use process proof, not unsupported results. |
| FAQ | 4-5 x 45-80 words | Answer scope and responsibility questions. |

### Reusable conversion language

Primary CTA: `Request a service plan`

Secondary CTA: `Talk through your next step`

Enquiry band heading:

> Start with the product, the current handoff, and the outcome you need.

Enquiry band body:

> Share the product, quantity, origin, destination, timing, and the point where your current process needs support. FreightVanta will respond with the practical next questions before a scope is confirmed.

## 5. Service Index Page Copy

### SEO

Title: `Global Sourcing, Fulfillment and Freight Services | FreightVanta`

Meta description: `Explore FreightVanta services for product sourcing, packaging, bulk procurement, inventory storage, private label coordination, and worldwide fulfillment.`

### Hero

Eyebrow: `CONNECTED SERVICES FOR INTERNATIONAL COMMERCE`

H1:

> Build the product path. Coordinate every handoff after it.

Lead:

> A shipment is rarely only transport. It starts with a product decision, moves through supplier questions and packaging instructions, then depends on inventory, documentation, fulfillment, and delivery working from the same brief. FreightVanta brings those handoffs into one service plan so your team can see what is ready, what needs approval, and what should happen next.

Primary CTA: `Request a service plan`

### Intro

H2:

> Choose the support your operation needs now.

Body:

> Some teams need help turning a product reference into supplier questions. Others need to receive inventory, combine orders, apply approved brand materials, or prepare goods for dispatch. Start with one service when the need is focused, or connect several services when the work crosses more than one team or location.

### Six entry modules

| Service | Index heading | Index body | Link |
| --- | --- | --- | --- |
| Product Sourcing | Start with a clearer product brief. | Turn product links, images, specifications, and target quantities into questions a supplier can answer. | Explore product sourcing |
| Packaging and Branding | Make the packout match the approved brand. | Keep inserts, labels, bags, boxes, and assembly instructions connected to the order before goods move. | Explore packaging and branding |
| Bulk Procurement | Prepare larger purchases with fewer loose ends. | Align quantity, supplier questions, inventory intent, production timing, and receiving instructions before payment or release. | Explore bulk procurement |
| Inventory Storage | Hold stock with a defined purpose. | Receive, count, consolidate, store, and release inventory from one approved instruction. | Explore inventory storage |
| Private and White Label | Keep brand decisions visible through production. | Connect samples, approved artwork, packaging rules, and fulfillment requirements before the customer receives the product. | Explore private and white label |
| Worldwide Fulfillment | Turn ready inventory into customer-ready orders. | Coordinate picking, packing, labels, shipping options, tracking references, and exceptions for the next delivery handoff. | Explore worldwide fulfillment |

## 6. Detail Page Copy - Product Sourcing

### SEO

Title: `Product Sourcing Coordination From China | FreightVanta`

Meta description: `Turn product links, specifications, and target quantities into supplier questions, comparison points, and a practical next-step plan with FreightVanta.`

### Hero

Eyebrow: `PRODUCT SOURCING`

H1:

> Turn a product idea into a purchase-ready next step.

Lead:

> A product link, reference image, specification, or target quantity is enough to begin a structured sourcing conversation. FreightVanta helps organize the questions that matter before a purchase is made: what the product needs to be, what can be confirmed with a supplier, which samples or comparison points are useful, and how the resulting goods should be prepared for the next handoff. The goal is not to rush into an order. It is to create a clearer brief that your team can approve.

### When this service fits

1. **You have a product reference but not a supplier-ready brief.** Use sourcing coordination when a link, photo, competitor reference, or rough specification still needs clearer material, size, finish, quantity, packaging, or destination questions.
2. **You need to compare options before committing.** Use the service when supplier responses need to be arranged into an understandable comparison instead of living across disconnected chat messages and spreadsheets.
3. **The next stage depends on product details.** Use it when samples, packaging, inspection, freight, or fulfillment cannot be planned until the product information is consistent.

### Workflow

1. **Share the starting reference.** Provide links, images, specifications, expected quantity, destination, and the outcome you are trying to achieve. Missing details are recorded as open questions instead of guessed.
2. **Translate the reference into a sourcing brief.** Product attributes, required variations, target packaging, desired timing, and decision criteria are organized into a supplier-facing request.
3. **Collect comparable supplier responses.** Supplier answers are grouped by the questions they actually address, so product differences and missing information stay visible.
4. **Review samples or evidence where applicable.** Photos, videos, physical samples, and supplier statements are treated as inputs for approval. The client decides what meets the brief.
5. **Confirm the purchasing handoff.** Once a path is selected, the approved product details, quantities, packaging needs, and receiving instruction are prepared for the next operational owner.

### Scope to confirm

- Product brief preparation
- Supplier question coordination
- Variant and specification comparison
- Sample request coordination
- Packaging requirement handoff
- Purchase and payment process clarification
- Quality-control scope and acceptance standard [VERIFY]
- Factory audit, compliance testing, and certification [VERIFY]
- Product classification and regulatory approval [VERIFY]

### What we need from you

- Product link, image, drawing, or specification
- Target quantity and expected reorder pattern
- Destination market and intended sales channel
- Required material, finish, color, dimensions, or variants
- Brand assets and packaging expectation, if available
- Target ready date and non-negotiable constraints

### Why this structure helps

- **Fewer assumptions move forward.** An open question can be assigned before it becomes a surprise in production or packing.
- **Supplier answers become comparable.** The review focuses on the same product and service questions rather than on whichever response arrived first.
- **The next handoff starts cleaner.** Freight, storage, and fulfillment instructions can reference the approved brief instead of rebuilding it.
- **Brand decisions stay attached to the product.** Packaging and labeling requirements are documented before they reach the dispatch stage.

### FAQ

**Can we start with only a product link?** Yes. A product link, image, or short description is enough to start an initial conversation. FreightVanta will identify the missing details needed to turn it into a usable brief.

**Do you guarantee the supplier or product quality?** No quality, factory, price, or compliance guarantee should be published unless it is part of an approved and documented service agreement. The page should describe coordination and approval steps, not promise an outcome that has not been verified.

**Can sourcing connect to fulfillment?** Yes. Once the product, packaging, quantity, and intended destination are approved, the handoff can connect to inventory storage, packaging, freight, and fulfillment planning.

## 7. Detail Page Copy - Packaging And Branding

### SEO

Title: `Packaging And Branding Coordination For Fulfillment | FreightVanta`

Meta description: `Coordinate approved inserts, labels, bags, boxes, and packout instructions before goods move into fulfillment with FreightVanta.`

### Hero

Eyebrow: `PACKAGING AND BRANDING`

H1:

> Make every packout follow the brand your customer expects.

Lead:

> Packaging is not an afterthought once inventory is already moving. It affects product protection, presentation, assembly time, and the information that reaches the customer. FreightVanta helps connect approved brand materials, supplier-ready instructions, receiving requirements, and fulfillment rules into one packout brief. Your team keeps control of the final approval; the operation gets a practical instruction for what belongs in each order and what must never be included.

### Workflow

1. **Define the customer-facing packout.** Identify the product, packaging components, insert material, labels, bundle rules, and any excluded supplier materials.
2. **Collect approved assets.** Provide final artwork, dimensions, material preferences, wording, language variants, and version control before production or assembly begins.
3. **Confirm the production and receiving path.** Establish where components are produced, how they should be delivered, and how they will be identified when they arrive.
4. **Create the packing instruction.** Translate the approved design into a repeatable order-level instruction: what is packed, in what order, with which label, and under what exception rule.
5. **Review a sample packout when appropriate.** Confirm the presentation, component count, product protection, and customer-facing details before the instruction is used at scale.
6. **Keep revisions controlled.** New artwork, seasonal inserts, and different packaging versions must have an effective date, stock status, and clear replacement instruction.

### Scope to confirm

- Packaging brief and component list
- Artwork and version handoff
- Labels, inserts, stickers, bags, and box coordination
- Supplier material removal instruction
- Bundle and assembly instruction
- Sample packout coordination
- Packaging design services [VERIFY]
- Manufacturing ownership, material sourcing, and regulatory packaging requirements [VERIFY]

### What we need from you

- Brand files in final approved format
- Product dimensions and protection requirements
- Insert, label, bag, and box quantities
- Language and market-specific copy
- Packing sequence and bundle variants
- Start date, replacement date, and stock handling rule

### Why this structure helps

- **Brand assets do not arrive as loose files.** Each component has a version, a purpose, and a packing rule.
- **Fulfillment teams receive instructions they can use.** The page turns visual design into physical order preparation.
- **Changes are easier to control.** Seasonal or revised assets have a deliberate switchover instead of mixed stock.
- **Product and packaging stay connected.** The process considers protection, presentation, and shipment readiness together.

### FAQ

**Can we use our own packaging supplier?** Yes, subject to receiving, identification, and storage requirements being confirmed. The key requirement is a clear component list and a packing instruction that can be followed consistently.

**Can supplier price tags or invoices be excluded?** This can be part of the approved packout instruction, but it must be confirmed against the actual product receiving and fulfillment process before publishing as a service promise.

**How are design changes handled?** A revised asset should be stored as a new version with an effective date and a decision about remaining stock. Do not replace old packaging silently.

## 8. Detail Page Copy - Bulk Procurement

### SEO

Title: `Bulk Procurement Planning And Inventory Coordination | FreightVanta`

Meta description: `Prepare larger product purchases with clearer quantities, supplier questions, inventory plans, and receiving instructions through FreightVanta.`

### Hero

Eyebrow: `BULK PROCUREMENT`

H1:

> Prepare a larger purchase before the details become expensive.

Lead:

> A bulk purchase changes more than the order quantity. It affects supplier confirmation, production timing, product acceptance, storage capacity, packaging components, and the plan for releasing inventory afterward. FreightVanta helps bring those decisions into one working brief before a bulk procurement moves ahead. The result is not a generic promise of lower cost. It is a documented plan showing the quantity, dependencies, approval points, and intended inventory path.

### When this service fits

1. **You are moving from test orders to a planned buy.** The product has enough demand signal that quantity, packaging, and storage need to be agreed before the next purchase.
2. **You need inventory ready before a business event.** A launch, seasonal campaign, retailer delivery, or replenishment window requires a visible sequence of deadlines and owners.
3. **Several services depend on the same purchase.** Sourcing, quality checks, storage, packaging, freight, and fulfillment need to start from the same approved quantity and product version.

### Workflow

1. **Confirm the purchasing objective.** Capture product, quantity, target ready date, demand reason, destination, and whether inventory will be released in one shipment or several.
2. **Build the supplier question set.** Record the items requiring confirmation: product version, materials, production timeline, unit packing, labeling, and delivery terms.
3. **Plan the receiving route.** Decide whether the goods should move to a warehouse, a nominated 3PL, a port, or an end destination once they are ready.
4. **Define approval gates.** Confirm who approves samples, product evidence, packaging, documents, payment milestones, and release instructions.
5. **Prepare inventory instructions.** Define expected arrival, counting method, SKU or carton identification, hold conditions, and release trigger.
6. **Coordinate the next movement.** Freight and fulfillment planning can begin once the approved purchase details are stable enough to support a handoff.

### Scope to confirm

- Purchase planning brief
- Supplier question and timeline coordination
- Inventory intake planning
- Packaging and labeling handoff
- Freight readiness coordination
- Release and dispatch instruction
- Price negotiation and savings guarantees [VERIFY]
- Contracting, payments, trade finance, and purchase-order legal responsibility [VERIFY]

### Why this structure helps

- **The quantity has a destination plan.** Inventory is not treated as an afterthought after purchase.
- **Approval points stay visible.** A late packaging or product decision can be escalated before it affects the next handoff.
- **Different teams work from one version.** Supplier, storage, freight, and fulfillment instructions all reference the same purchase brief.
- **Seasonal pressure is planned rather than improvised.** Demand timing becomes a visible constraint, not a hidden assumption.

### FAQ

**Does FreightVanta promise lower bulk pricing?** No. The page should not promise a discount or saving percentage unless it is supported by a written commercial offer. The service is positioned around preparation and coordination.

**Can inventory be released in stages?** Yes, when the storage, fulfillment, and freight instructions are defined before goods arrive. The plan should record which stock is held and which trigger authorizes release.

**Can this service include product sourcing?** Yes. The same product brief can connect sourcing coordination with a later procurement and inventory plan.

## 9. Detail Page Copy - Inventory Storage

### SEO

Title: `Inventory Storage And Release Coordination | FreightVanta`

Meta description: `Receive, count, hold, consolidate, and release inventory from a documented instruction with FreightVanta storage coordination.`

### Hero

Eyebrow: `INVENTORY STORAGE`

H1:

> Hold inventory with a reason, a record, and a release rule.

Lead:

> Storage should make the next delivery easier, not make stock disappear into another handoff. FreightVanta helps prepare receiving, count, identification, holding, consolidation, packaging, and release instructions so inventory has a defined operational purpose. Whether the next move is customer fulfillment, a retailer shipment, a freight departure, or a staged replenishment, the team should know what arrived, what is available, what needs attention, and who can authorize the next release.

### Workflow

1. **Prepare the inbound instruction.** Confirm origin, expected arrival date, carton or SKU identifiers, receiving contact, product condition expectations, and supporting documents.
2. **Receive and count against the approved record.** Record quantity and visible exceptions according to the agreed intake procedure. Scope and acceptance standard require confirmation.
3. **Assign the storage purpose.** Define whether stock is held for future orders, consolidation, packaging, freight release, retailer delivery, or another named outcome.
4. **Keep inventory rules usable.** Set handling instructions for product versions, bundles, labels, restricted mixing, and any customer-specific packing requirements.
5. **Prepare release instructions.** A release should identify the stock, destination, service level, documents, and owner who has approved the movement.
6. **Capture exceptions early.** Quantity differences, visible damage, missing labels, or unclear product identification should create a decision request rather than an undocumented workaround.

### Scope to confirm

- Inbound receiving coordination
- Count and inventory identification process
- Storage and consolidation instruction
- Bundle, kit, and multi-SKU order preparation
- Stock release coordination
- Exception notification workflow
- Storage location, capacity, fees, insurance, and holding-period terms [VERIFY]
- Temperature control, hazardous goods, regulated goods, and special handling [VERIFY]

### What we need from you

- Expected inbound date and origin
- SKU, carton, pallet, or product identification
- Quantity and any acceptable variance rule
- Product photos and handling instructions
- Required labels, bundles, or packaging components
- Release destinations and approval contact

### Why this structure helps

- **Inventory is easier to explain.** Every receipt and release references an instruction that names the next operational purpose.
- **Exceptions have an owner.** Visible differences become a documented question before stock is shipped onward.
- **Order preparation is not rebuilt each time.** Bundles, product combinations, and packing rules can be attached to the inventory record.
- **Freight and fulfillment start from the same stock view.** The next team does not need to reconstruct what arrived.

### FAQ

**Can goods from multiple suppliers be stored together?** Potentially, but the receiving and identification method must be confirmed first. The service page should not promise consolidation until the product, packaging, and handling requirements are known.

**Can you hold inventory for an unlimited period?** No unlimited storage promise should be made. Holding period, capacity, fees, insurance, and release rules must be confirmed in the commercial scope.

**What happens if quantity or condition is different at receipt?** The expected behavior is to record the exception and ask for a decision before an unauthorized replacement, repack, or release occurs.

## 10. Detail Page Copy - Private And White Label

### SEO

Title: `Private Label And White Label Coordination | FreightVanta`

Meta description: `Coordinate product approvals, branded materials, packaging rules, inventory, and fulfillment handoffs for private and white label programs.`

### Hero

Eyebrow: `PRIVATE AND WHITE LABEL`

H1:

> Keep product, packaging, and brand approvals moving together.

Lead:

> A private or white label program fails when the product, the approved artwork, and the fulfillment instruction are managed as separate projects. FreightVanta helps connect the visible approval points: product reference, sample evidence, approved brand assets, packaging specification, inventory receiving, and customer-ready packout. The client remains responsible for the brand and final commercial decisions. The operating plan makes sure those decisions reach the people who need to act on them.

### Workflow

1. **Define the branded product brief.** Capture the product, variation, target market, approved brand assets, packaging expectation, and customer experience requirement.
2. **Set the approval path.** Record who approves product evidence, samples, visual files, packaging components, and final packout before a new version proceeds.
3. **Prepare the supplier and packaging handoffs.** Translate approved information into a consistent request so product and packaging instructions do not diverge.
4. **Track the active version.** Product, artwork, label, insert, and packaging changes need identifiable versions and a decision about remaining old stock.
5. **Receive against the approved instruction.** Inventory intake references the approved product and packaging set, with visible exception handling when the received goods differ.
6. **Fulfill according to the customer-facing brief.** Picking, packaging, inserts, and release instructions remain tied to the current approved brand version.

### Scope to confirm

- Brand asset and product brief coordination
- Sample and approval checkpoint coordination
- Packaging and label version handoff
- Inventory version identification
- Packout instruction and fulfillment handoff
- Change-control record
- Trademark, IP clearance, regulatory review, and certification [VERIFY]
- Product design, manufacturing ownership, and legal label compliance [VERIFY]

### Why this structure helps

- **The customer-facing experience has an operational record.** Artwork and packaging are not only design files; they become a physical preparation instruction.
- **Version changes are less likely to mix.** The plan defines what starts, what stops, and what happens to remaining components.
- **Approvals happen before irreversible work.** Product, sample, packaging, and fulfillment owners know which decisions need client sign-off.
- **A branded program can still use practical logistics.** The same record can connect sourcing, storage, freight, and fulfillment.

### FAQ

**Does FreightVanta provide legal or trademark advice?** No. The page should make clear that trademark, IP, labeling, and market compliance decisions require the appropriate qualified advisor and verified scope.

**Can we use white label products with custom inserts or packaging?** This can be coordinated where confirmed, but materials, quantities, product suitability, receiving, and packout instructions must be approved before the service is promised.

**How do we prevent old and new packaging from mixing?** Use version identifiers, an effective date, remaining-stock decision, and a clear fulfillment instruction. Do not rely on a verbal change alone.

## 11. Detail Page Copy - Worldwide Fulfillment

### SEO

Title: `Worldwide Fulfillment And Order Preparation | FreightVanta`

Meta description: `Coordinate receiving, picking, packing, labels, shipment handoffs, and exception handling for customer-ready worldwide fulfillment.`

### Hero

Eyebrow: `WORLDWIDE FULFILLMENT`

H1:

> Turn ready inventory into customer-ready orders.

Lead:

> Fulfillment is the operating layer between inventory and the customer promise. FreightVanta helps coordinate how goods are received, identified, picked, packed, labeled, handed to a shipping service, and tracked through the next decision. The right setup depends on the product, order profile, destination, brand materials, and delivery requirement. This page explains the handoffs that should be defined before fulfillment begins, without promising locations, carrier coverage, automation, or processing times that have not been confirmed.

### What the operating model covers

1. **Receiving.** Inventory arrives with an expected quantity, product identifier, document set, and handling instruction.
2. **Order readiness.** Each sellable product has a clear SKU or equivalent identifier, active packaging rule, and destination instruction.
3. **Picking.** The order identifies what is included, what is excluded, and how multi-item orders are handled.
4. **Packing.** Product protection, brand components, invoice or document rules, and carton selection follow an approved instruction.
5. **Labeling and shipping handoff.** Destination details, label requirement, selected service, and tracking reference are linked to the order where available.
6. **Exception management.** A missing item, address issue, stock discrepancy, damage report, or delayed handoff becomes a visible decision request.

### When this service fits

1. **You sell across more than one customer destination.** Orders need consistent packing and status handling rather than individual manual instructions.
2. **Your product has brand or bundle rules.** Inserts, labels, multiple SKUs, product combinations, or excluded materials must be applied consistently.
3. **Inventory and shipping are managed by different people.** A shared record reduces missed handoffs between incoming stock, order preparation, and delivery.

### Scope to confirm

- Receiving and order-preparation workflow
- Picking and packing instruction
- Multi-item order and bundle coordination
- Label and brand-component handoff
- Shipping-service and tracking-reference process
- Exception notification and escalation
- Warehouse locations, same-day processing, cut-off times, carrier list, rate card, and destination coverage [VERIFY]
- Marketplace integrations, API synchronization, returns processing, and customs clearance [VERIFY]

### What we need from you

- Product/SKU list and product photos
- Expected order volume and seasonality
- Order source and required data fields
- Destination markets and shipping priorities
- Brand materials, inserts, labels, and packaging rules
- Bundle, substitution, and excluded-item rules
- Return, cancellation, and delivery-exception policy [VERIFY]

### Why this structure helps

- **Order preparation is described before the first order arrives.** This avoids trying to infer brand or packing rules from a customer note.
- **The team can distinguish inventory status from order status.** Receiving, sellable availability, packing, dispatch, and delivery are separate operational events.
- **Exceptions have a response path.** Missing stock or an address issue does not disappear into a generic support queue.
- **The setup can grow in stages.** A client can begin with one order type or destination profile, then add approved complexity as the process becomes stable.
- **Information remains useful to the customer team.** Tracking references and exception notes can support inventory planning and customer communication where the actual integration supports it.

### FAQ

**Can FreightVanta fulfill worldwide?** Do not publish a blanket worldwide coverage claim until actual warehouse, carrier, prohibited-goods, customs, and destination coverage are verified. The page should invite the visitor to share destination markets for a scope review.

**Can you remove supplier materials or combine several items into one order?** These may be available under an approved packing instruction. The product, source materials, bundle rule, and destination constraints need to be confirmed first.

**Can we connect our store automatically?** Do not promise a platform integration without verified technical support. The enquiry should collect the store platform and order flow so the team can confirm the practical option.

**How are tracking updates handled?** The exact process depends on the confirmed shipping service and integration. The page may state that tracking references and status updates are coordinated where the selected service provides them.

## 12. Related Services Rules

Every service detail page includes a three-item related-services rail. This creates a useful next step without repeating the entire navigation.

| Current page | Related services |
| --- | --- |
| Product Sourcing | Bulk Procurement, Packaging and Branding, Private and White Label |
| Packaging and Branding | Private and White Label, Inventory Storage, Worldwide Fulfillment |
| Bulk Procurement | Product Sourcing, Inventory Storage, Worldwide Fulfillment |
| Inventory Storage | Bulk Procurement, Packaging and Branding, Worldwide Fulfillment |
| Private and White Label | Product Sourcing, Packaging and Branding, Worldwide Fulfillment |
| Worldwide Fulfillment | Inventory Storage, Packaging and Branding, Product Sourcing |

## 13. CMS Data Contract

### 13.1 Service page record

```text
service_pages
  id
  site_id
  locale
  slug
  status: draft | published | archived
  sort_order
  nav_title
  menu_description
  eyebrow
  h1
  hero_body
  hero_media_id
  primary_cta_label
  primary_cta_url
  secondary_cta_label
  secondary_cta_url
  seo_title
  seo_description
  canonical_override
  version
  created_at
  updated_at
  published_at
```

### 13.2 Repeatable service blocks

```text
service_buyer_situations
  service_page_id
  sort_order
  title
  body

service_workflow_steps
  service_page_id
  sort_order
  title
  body
  media_id (optional)

service_scope_items
  service_page_id
  sort_order
  item
  status: included | confirm | excluded

service_start_checklist_items
  service_page_id
  sort_order
  item

service_advantages
  service_page_id
  sort_order
  title
  body

service_faqs
  service_page_id
  sort_order
  question
  answer

service_related_links
  service_page_id
  sort_order
  related_service_page_id
```

### 13.3 Editorial controls

- Every record is scoped by `site_id` and `locale`; a change in one country site cannot overwrite another language version.
- New pages begin as drafts and have a preview URL.
- Changing a published hero, workflow, scope item, FAQ, or SEO field creates an audit-log entry.
- Scope labels must be visible in the public template. Do not store "subject to confirmation" only in an internal note.
- Images come from the existing media library with required alt text and a fixed `aspect_ratio` slot to prevent layout shift.

## 14. Template And Interaction Requirements

### Template files

```text
pages/services-index.html
pages/service-detail.html
partials/services/service-hero.html
partials/services/buyer-situations.html
partials/services/workflow.html
partials/services/service-scope.html
partials/services/start-checklist.html
partials/services/advantages.html
partials/services/related-services.html
partials/services/service-faq.html
partials/services/service-cta.html
assets/services.css
assets/services.js
```

### Interaction requirements

- The desktop `Services` menu supports hover, click, Escape, arrow keys, and focus management. It must not be clipped by a parent with `overflow:hidden`.
- On mobile, the menu becomes an accordion in the existing navigation drawer. Each service description may be hidden there to keep scanning fast.
- The workflow is a real ordered list. Use visual step markers only in this block.
- FAQs use native `<details>` and `<summary>` or an equivalent accessible disclosure component.
- The scope block renders `Included`, `Confirm before publishing`, and `Not part of this service` as text labels as well as color.
- Service imagery uses real operations, product preparation, packaging detail, warehouse activity, or shipping handoffs. No generic world-map placeholders.
- Respect `prefers-reduced-motion`; all text is visible before any animation runs.

### Responsive requirements

| Viewport | Requirement |
| --- | --- |
| 1280px and above | Hero may use split copy/media; workflow can use two or three columns only if the full text remains legible. |
| 768px to 1279px | Keep hero hierarchy, collapse workflow to two columns or a vertical list, and preserve menu keyboard behavior. |
| Below 768px | One-column content. CTA buttons are full-width when necessary. Scope labels wrap without overlap. |
| Below 420px | H1 remains within its container; no horizontal scrolling; checklist and FAQ text must not be truncated. |

## 15. SEO And Structured Data

- Each service detail page has one H1, a unique title, meta description, canonical URL, and language-specific `hreflang` links.
- Output `Service` JSON-LD only for services visibly described on the page and actually offered by the target site.
- Use `FAQPage` JSON-LD only for visible questions and answers. Do not add invisible FAQ content for search engines.
- Use `BreadcrumbList` on service pages: Home > Services > Current service.
- Keep service pages internally linked from the services index, related-services rail, relevant guides, and contact form context.
- Do not publish invented prices, result claims, reviews, counts, warehouse locations, carrier names, or badges in structured data.

## 16. Build Order And Acceptance Criteria

### Phase 1 - Content model

1. Add the `service_pages` record and repeatable blocks.
2. Add the six English service records from this specification as drafts.
3. Add a preview route for each page.
4. Wire navigation to the services index and each service page.

Acceptance: an editor can create, reorder, preview, publish, and localize one service without modifying Go templates or another site.

### Phase 2 - Public template

1. Build the services index and service-detail templates.
2. Add image slots, workflow, scope, checklist, related services, FAQ, and CTA components.
3. Apply responsive layout and accessibility rules.
4. Add canonical, hreflang, breadcrumb, Service, and FAQ structured data.

Acceptance: all six pages render without content duplication, headings overflow, missing alt text, or horizontal scrolling at 390px, 768px, 1024px, and 1440px.

### Phase 3 - Content review

1. Confirm each service's actual scope with operations.
2. Replace every `[VERIFY]` category with verified wording or omit the claim.
3. Add service-specific photographs and approved alt text.
4. Confirm contact details, legal pages, enquiry routing, and consent language.

Acceptance: no unverified commercial claim remains in visible text, metadata, schema, form success text, or image caption.

## 17. Source And Verification Log

- **S1:** `https://www.lstdrop.com/web/index.php`, accessed 2026-09-16. Used only to study the public navigation and high-level homepage content structure.
- **S2:** `https://www.lstdrop.com/ProductService/Packaging`, accessed 2026-09-16. Used only to study the observed sequence: hero, workflow, product/format detail, CTA.
- **S3:** `https://www.lstdrop.com/ProductService/BulkOrder`, accessed 2026-09-16. Used only to study the observed sequence: buyer situations, six steps, operational reasons, CTA.
- **S4:** `https://www.lstdrop.com/ProductService/Storage`, accessed 2026-09-16. Used only to study the observed sequence: receiving, inventory record, bundling, shipping, availability explanations.
- **S5:** `https://www.lstdrop.com/ProductService/Branding`, accessed 2026-09-16. Used only to study the observed sequence: product/samples/production/quality/inventory/shipping workflow and outcome section.
- **S6:** `https://www.lstdrop.com/ProductService/Fulfillment`, accessed 2026-09-16. Used only to study the observed sequence: capability list, operating reasons, education, and CTA.
- **S7:** Existing FreightVanta homepage content and development documentation in this repository. Used to preserve the current brand, service vocabulary, visual direction, and safe-claim policy.

### Required owner verification before implementation

- Actual sourcing, purchasing, inspection, storage, packaging, private-label, fulfillment, and shipping capabilities.
- Countries, ports, warehouses, fulfillment centers, carrier relationships, and prohibited-goods policy.
- Pricing model, minimum order quantities, storage duration, insurance, lead times, processing cut-offs, and delivery coverage.
- Platform integrations, tracking behavior, returns process, data handling, and form recipient.
- Legal business identity, address, phone, email, consent language, privacy policy, and terms.
