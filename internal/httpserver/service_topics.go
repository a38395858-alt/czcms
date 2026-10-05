package httpserver

import (
	"html/template"
	"net/http"
	"strings"

	"czcms/internal/catalog"
)

// publicServiceTopicCopy holds the editorial and SEO source for FreightVanta's
// fixed service topics. It deliberately describes planning and coordination,
// not unverified prices, capacity, coverage, compliance, or delivery outcomes.
type publicServiceTopicCopy struct {
	Slug, NavLabel, ShortDescription                            string
	SEOTitle, SEODescription, SEOKeywordsText                   string
	SEOKeywords                                                 []string
	HeroKicker, HeroTitle, HeroBody, HeroPrimary, HeroSecondary string
	HeroImage, HeroVisualLabel, HeroVisualTitle, HeroVisualBody string
	HeroStages                                                  []string
	IntroTitle                                                  string
	Intro                                                       []string
	SituationsTitle, SituationsLead                             string
	Situations                                                  []publicServiceTopicSituation
	WorkflowTitle, WorkflowLead                                 string
	Workflow                                                    []publicServiceTopicStep
	ScopeTitle, ScopeLead                                       string
	Included, Confirm                                           []publicServiceTopicScope
	NeedsTitle, NeedsLead                                       string
	Needs                                                       []string
	BenefitsTitle, BenefitsLead                                 string
	Benefits                                                    []publicServiceTopicBenefit
	FAQs                                                        []publicFAQItem
	CTATitle, CTABody, CTAButton                                string
	Related                                                     []publicServiceTopicRelated
}

type publicServiceTopicSituation struct {
	Label string
	Title string
	Body  string
}

type publicServiceTopicStep struct {
	Marker string
	Title  string
	Body   string
}

type publicServiceTopicScope struct {
	Title string
	Body  string
}

type publicServiceTopicBenefit struct {
	Label string
	Title string
	Body  string
}

type publicServiceTopicRelated struct {
	Title string
	Body  string
	URL   string
}

var serviceTopicCopies = map[string]publicServiceTopicCopy{
	"bulk-procurement": {
		Slug:             "bulk-procurement",
		NavLabel:         "Bulk Procurement",
		ShortDescription: "Prepare a larger purchase with fewer loose ends.",
		SEOTitle:         "Bulk Procurement From China: Plan the Next Purchase | FreightVanta",
		SEODescription:   "Prepare a bulk purchase from China with clearer quantities, supplier questions, inventory decisions, packaging requirements, and receiving instructions.",
		SEOKeywords:      []string{"bulk procurement from China", "bulk order from China", "China bulk purchasing", "large order planning from China", "inventory handoff planning"},
		SEOKeywordsText:  "bulk procurement from China, bulk order from China, China bulk purchasing, large order planning from China, inventory handoff planning",
		HeroKicker:       "BULK PROCUREMENT FROM CHINA",
		HeroTitle:        "Plan a bulk purchase from China before quantity creates expensive loose ends.",
		HeroBody:         "A larger purchase changes more than the unit count. Product version, packaging, supplier questions, receiving method, inventory purpose, and release instruction must all remain connected. FreightVanta helps organize those decisions into a working procurement brief before a bulk order from China moves to the next stage.",
		HeroPrimary:      "Request a bulk procurement plan",
		HeroSecondary:    "See the planning steps",
		HeroImage:        "freightvanta-service-bulk-procurement-hero-v1.png",
		HeroVisualLabel:  "PURCHASE / PLAN",
		HeroVisualTitle:  "CONNECTED VOLUME",
		HeroVisualBody:   "Quantity becomes useful when product, approval, inventory, and release instructions follow it.",
		HeroStages:       []string{"PRODUCT", "QUANTITY", "INBOUND", "RELEASE"},
		IntroTitle:       "A bulk order needs a destination plan, not only a confirmed quantity.",
		Intro: []string{
			"Before a supplier starts the next production run, the buyer should be able to answer connected questions. Which approved product version is being purchased? Is stock intended for one shipment, staged replenishment, retail delivery, or customer fulfillment? Which packaging and labels need to arrive with the goods, and who can approve a change when a component or inbound plan no longer matches the brief?",
			"This service starts after an exploratory product conversation and before a larger commitment becomes difficult to unwind. It does not promise lower pricing, a production date, an inspection outcome, financing, or a particular shipping result. It gives the buyer and each later operating owner a structured way to identify what needs confirmation before a bulk purchase moves ahead.",
		},
		SituationsTitle: "Use bulk procurement planning when the next purchase affects more than one handoff.",
		SituationsLead:  "The plan does not replace supplier selection or commercial approval. It makes operational dependencies visible before a higher-volume decision reaches a point where changes are harder to manage.",
		Situations: []publicServiceTopicSituation{
			{Label: "01 / TEST TO PLAN", Title: "You are moving from a test order to a planned buy.", Body: "Early orders can be managed through a few messages and a delivery address. A larger buy introduces approved product variation, unit packing, carton markings, stock location, and release timing. The procurement record gives those choices one shared home."},
			{Label: "02 / TIMING", Title: "You have a launch, replenishment, retail delivery, or seasonal window to prepare for.", Body: "A target date does not replace a plan. Product, quantity, packaging, inbound instruction, and destination need their own owners and approval points so an open dependency is not mistaken for a confirmed commitment."},
			{Label: "03 / SHARED PURCHASE", Title: "The same purchase will feed storage, freight, and fulfillment.", Body: "When stock may be split across a warehouse, retailer, freight release, or customer order flow, each portion needs a named purpose. The next team should not rebuild the product information and ask the buyer to make the same decision again."},
		},
		WorkflowTitle: "A six-step bulk procurement workflow keeps the larger decision connected.",
		WorkflowLead:  "Each step creates an input the next owner can use. Unknowns remain visible as questions instead of becoming assumed facts.",
		Workflow: []publicServiceTopicStep{
			{Marker: "01", Title: "Confirm the purchasing objective", Body: "Record the approved product reference, quantity range, target ready period, intended market, and whether stock is for a single release, staged replenishment, retail delivery, or fulfillment."},
			{Marker: "02", Title: "Build the supplier question set", Body: "Bring variation, materials, unit packing, cartons, labels, product evidence, production questions, and delivery terms into one request so the unanswered points remain visible."},
			{Marker: "03", Title: "Set the approval path", Body: "Name who approves product evidence, packaging artwork, documents, commercial milestones, and release instructions. Approval belongs to a decision, not a message thread."},
			{Marker: "04", Title: "Plan the inventory handoff", Body: "Define expected inbound, nominated destination, product identifier, carton or pallet information, counting requirement, and immediate handling rule before the stock arrives."},
			{Marker: "05", Title: "Prepare packaging and release rules", Body: "Carry labels, inserts, branded components, bundles, and supplier-material rules into receiving or fulfillment preparation with an active approved version."},
			{Marker: "06", Title: "Coordinate the next movement", Body: "Prepare the approved handoff for confirmed storage, freight, retailer delivery, or fulfillment work, making clear which information follows the goods and which decision remains with the client."},
		},
		ScopeTitle: "What the bulk procurement plan can organize, and what must be confirmed first.",
		ScopeLead:  "The page is specific about coordination. Commercial, legal, regulated, and quality capability stays a confirmation item until an approved scope defines it.",
		Included: []publicServiceTopicScope{
			{Title: "Purchase brief", Body: "Organize product version, quantity, intended destination, open questions, and decision owners into a shared working brief."},
			{Title: "Supplier questions", Body: "Prepare and track a consistent set of product, packaging, evidence, and delivery questions."},
			{Title: "Inventory readiness", Body: "Prepare expected inbound, product identification, count, purpose, and release information for the next handoff."},
		},
		Confirm: []publicServiceTopicScope{
			{Title: "Price and savings", Body: "Any pricing role, commercial discount, or saving claim needs an approved commercial scope and a written offer."},
			{Title: "Contracts and payment", Body: "Purchasing authority, payment process, legal responsibility, and trade-finance work require explicit confirmation."},
			{Title: "Quality and compliance", Body: "Acceptance standards, audits, testing, certification, and regulatory work must be separately agreed and verified."},
		},
		NeedsTitle: "Bring the purchase context, not just the quantity.",
		NeedsLead:  "A first conversation can start with partial information. These inputs make it possible to turn that starting point into a useful procurement brief.",
		Needs: []string{
			"Product link, image, specification, or approved sample reference.",
			"Target quantity, expected reorder pattern, and whether the quantity is fixed or still under review.",
			"Known supplier or manufacturer details, if one is already identified.",
			"Target market, sales channel, and intended final destination.",
			"Product variation, packaging, label, carton, and bundle requirements.",
			"Target ready period and the intended storage, freight, retail, or fulfillment handoff.",
		},
		BenefitsTitle: "A larger purchase remains easier to explain after it is approved.",
		BenefitsLead:  "The value is an operating record that gives the next team the context behind the quantity, not a promise about commercial or delivery outcomes.",
		Benefits: []publicServiceTopicBenefit{
			{Label: "ONE BRIEF", Title: "The decision travels", Body: "Product, quantity, packaging, and destination stay connected from supplier questions to receiving and release preparation."},
			{Label: "VISIBLE GATES", Title: "Approvals have a place", Body: "A late packaging file or unclear inbound instruction is visible before it affects the next operational handoff."},
			{Label: "NAMED PURPOSE", Title: "Inventory has context", Body: "The record explains whether stock supports a retailer, staged release, freight movement, or customer orders."},
			{Label: "CONTROLLED CHANGE", Title: "Revisions can be reviewed", Body: "A product or carton change can be evaluated against the current procurement brief instead of being silently assumed."},
		},
		FAQs: []publicFAQItem{
			{Question: "Does FreightVanta guarantee lower pricing for a bulk order from China?", Answer: "No. This page does not claim a discount, saving percentage, or supplier price outcome without a written commercial offer. Bulk procurement planning is about making product, quantity, packaging, inventory, and handoff decisions easier to coordinate."},
			{Question: "Can a bulk purchase be released in stages?", Answer: "It can be planned for staged release when receiving, storage, packaging, freight, or fulfillment instructions are confirmed first. The approved scope should identify the held stock, release destination, and authorization owner."},
			{Question: "Does bulk procurement include inspection or compliance work?", Answer: "Do not assume that it does. Quality standards, inspection method, factory audit, product testing, certification, and compliance responsibility need separate confirmation before they are presented as service scope."},
			{Question: "Can this service connect to fulfillment?", Answer: "Yes. Once product, stock identification, packaging, and order-preparation rules are stable, the approved record can be prepared for inventory and fulfillment planning."},
		},
		CTATitle:  "Start with the product, the planned quantity, and the next place the goods need to go.",
		CTABody:   "Share the product reference, quantity, known supplier, intended market, target ready period, packaging requirement, and planned storage, freight, retail, or fulfillment handoff. FreightVanta will respond with the practical questions needed to define scope before a bulk purchase moves ahead.",
		CTAButton: "Request a bulk procurement plan",
		Related: []publicServiceTopicRelated{
			{Title: "Product Sourcing", Body: "Turn a product reference into a supplier-ready next step.", URL: "/product-sourcing"},
			{Title: "Inventory Storage", Body: "Receive, identify, hold, and release stock from an approved instruction.", URL: "/services/inventory-storage"},
			{Title: "Worldwide Fulfillment", Body: "Prepare customer orders from ready inventory with clear packing and exception rules.", URL: "/services/worldwide-fulfillment"},
		},
	},
	"packaging-branding": {
		Slug:             "packaging-branding",
		NavLabel:         "Packaging and Branding",
		ShortDescription: "Turn approved brand material into a physical order instruction.",
		SEOTitle:         "Packaging and Branding for Products From China | FreightVanta",
		SEODescription:   "Turn packaging, labels, inserts, bundles, and approved brand files into a clear packout plan for products sourced from China.",
		SEOKeywords:      []string{"custom packaging for products from China", "packaging and branding fulfillment", "branded packaging from China", "product inserts and labels", "packout instruction"},
		SEOKeywordsText:  "custom packaging for products from China, packaging and branding fulfillment, branded packaging from China, product inserts and labels, packout instruction",
		HeroKicker:       "PACKAGING AND BRANDING",
		HeroTitle:        "Make products from China arrive in packaging that carries your brand forward.",
		HeroBody:         "A finished product is not yet a finished customer experience. The box, bag, insert, label, protection rule, bundle, and excluded supplier material need to reach the packing team as a usable instruction. FreightVanta helps turn approved packaging and branding materials into a coordinated packout brief for products sourced from China.",
		HeroPrimary:      "Request a packout plan",
		HeroSecondary:    "See the packout workflow",
		HeroImage:        "freightvanta-service-packaging-branding-hero-v1.png",
		HeroVisualLabel:  "PACKOUT / VERSION",
		HeroVisualTitle:  "ACTIVE PACKOUT",
		HeroVisualBody:   "A brand file becomes operational when its component, product, sequence, and effective date are clear.",
		HeroStages:       []string{"ASSETS", "COMPONENTS", "PACKOUT", "VERSION"},
		IntroTitle:       "Packaging becomes operational when every component has a purpose and a version.",
		Intro: []string{
			"A logo file does not tell a fulfillment team what to put in an order. It does not identify the correct product variation, insert quantity, active language version, protection method, supplier-material rule, or point at which old packaging must stop being used. Every physical component needs a product connection and a packing sequence.",
			"This service is for teams that want packaging and brand materials to remain connected to the product after goods leave China. It does not promise packaging design, component manufacturing, trademark clearance, or legal label review. Those capabilities and responsibilities require a separately confirmed scope.",
		},
		SituationsTitle: "Use this service when brand materials must survive the move from files to physical orders.",
		SituationsLead:  "The aim is not to decorate a shipment. It is to create a customer-facing packout instruction the next operating team can use repeatedly.",
		Situations: []publicServiceTopicSituation{
			{Label: "01 / PACKOUT", Title: "Your product is ready, but the customer-facing packout is not defined.", Body: "The product can be confirmed while the box, bag, label, insert, or supplier-material rule remains scattered across files and messages. The packout brief brings those pieces together around one product and order context."},
			{Label: "02 / MARKET VERSION", Title: "You sell in more than one market, language, or campaign period.", Body: "Packaging can change across markets, languages, seasons, or launch phases. The active copy, label, quantities, effective date, and old-stock decision should be clear before an order is prepared."},
			{Label: "03 / BUNDLE RULE", Title: "Your product needs bundles, protection, inserts, or presentation rules.", Body: "A multi-item set, fragile product, branded insert, or launch kit requires a repeatable order-level sequence, not only an attractive concept or a folder of artwork."},
		},
		WorkflowTitle: "From approved brand material to a physical order instruction.",
		WorkflowLead:  "Each step turns a creative decision into a detail that can be received, identified, packed, reviewed, and changed deliberately.",
		Workflow: []publicServiceTopicStep{
			{Marker: "01", Title: "Define the customer-facing packout", Body: "Identify product, components, insert materials, labels, protection, bundle rules, and materials that must not reach the customer."},
			{Marker: "02", Title: "Collect final approved assets", Body: "Gather artwork, copy, dimensions, language versions, material preferences, and version identifiers with an approval owner."},
			{Marker: "03", Title: "Confirm the receiving path", Body: "Record how each component is expected to arrive, be identified, and connect to the correct product or order type."},
			{Marker: "04", Title: "Create the packout instruction", Body: "Describe selection, insertion, labeling, protection, exclusions, bundle composition, and the active version check."},
			{Marker: "05", Title: "Review a sample packout", Body: "Coordinate a client review point where presentation, count, protection, wording, and the product connection can be checked before the rule becomes active."},
			{Marker: "06", Title: "Control revisions", Body: "Set an effective date and a rule for remaining old inserts, labels, bags, boxes, or campaign components instead of relying on a replaced file alone."},
		},
		ScopeTitle: "What FreightVanta can coordinate around the packout.",
		ScopeLead:  "The operating brief starts with approved brand decisions. Design, regulated copy, manufacturing, and legal responsibility stay separate until verified.",
		Included: []publicServiceTopicScope{
			{Title: "Packout brief", Body: "Organize component list, product connection, packing sequence, exclusions, and active version into a usable working instruction."},
			{Title: "Brand asset handoff", Body: "Carry approved artwork, copy, label, and insert versions into the receiving and packout workflow."},
			{Title: "Component identification", Body: "Prepare expected inbound and identification information so each component can connect to the right product or order type."},
		},
		Confirm: []publicServiceTopicScope{
			{Title: "Design and manufacturing", Body: "Design ownership, material sourcing, manufacturing, capacity, and product-development responsibility require separate agreement."},
			{Title: "Legal labels", Body: "Market-specific warnings, legal copy, claims, and compliance obligations require qualified review and confirmation."},
			{Title: "Supplier-material removal", Body: "The exact removal process needs confirmation against the applicable receiving and fulfillment operation."},
		},
		NeedsTitle: "Bring the approved brand decision and the physical packing context.",
		NeedsLead:  "Files become useful when they arrive with the product, component, version, and order information that gives them a practical purpose.",
		Needs: []string{
			"Final approved brand files, wording, logo usage, and language variants.",
			"Product dimensions, photos, protection requirements, and fragile-item context.",
			"A list of boxes, bags, inserts, labels, stickers, and related components.",
			"Required number of each component per product, order, or bundle.",
			"Packing sequence and supplier materials that must not reach the customer.",
			"Target market, campaign, active version, start date, and replacement rule.",
		},
		BenefitsTitle: "The brand becomes easier to deliver consistently.",
		BenefitsLead:  "A packaging decision has value only when the right components reach the right product in the intended sequence.",
		Benefits: []publicServiceTopicBenefit{
			{Label: "USABLE ASSETS", Title: "Files become instructions", Body: "The team receives component purpose, product connection, active version, and the order in which each item is used."},
			{Label: "PRODUCT CONTEXT", Title: "Presentation follows the product", Body: "Protection, insert count, bundle composition, and customer experience are considered together."},
			{Label: "EFFECTIVE DATE", Title: "Changes have a boundary", Body: "Seasonal or revised assets receive a deliberate switchover instead of mixed component stock."},
			{Label: "NEXT HANDOFF", Title: "Rules travel further", Body: "Storage, fulfillment, freight, and retail preparation can reference the same active packout instruction."},
		},
		FAQs: []publicFAQItem{
			{Question: "Can we use our own packaging supplier for products from China?", Answer: "Potentially. The packaging source, identification, quantity, receiving method, and packout instruction should be confirmed before the service is promised."},
			{Question: "Can supplier materials be excluded from customer orders?", Answer: "This can be part of an approved packout instruction, but the product, materials, receiving process, and fulfillment scope need confirmation first."},
			{Question: "How are packaging changes handled?", Answer: "Create a new version with an effective date and a decision about remaining old stock. A replaced file alone is not enough to control an operational change."},
			{Question: "Does FreightVanta provide design or legal label review?", Answer: "Do not assume so. Design, trademark usage, product labeling, regulated copy, and market compliance require a separately confirmed scope and, where necessary, qualified advice."},
		},
		CTATitle:  "Start with the product, the approved brand assets, and the packout your customer should receive.",
		CTABody:   "Share the product reference, packaging components, approved files, target market, active language version, launch or replacement date, and the next storage or fulfillment handoff. FreightVanta will respond with the questions needed to turn those materials into a usable packout plan.",
		CTAButton: "Request a packout plan",
		Related: []publicServiceTopicRelated{
			{Title: "Private and White Label", Body: "Keep approved product, packaging, and customer-facing versions connected.", URL: "/services/private-white-label"},
			{Title: "Inventory Storage", Body: "Prepare receipt, identification, holding, and release for components and products.", URL: "/services/inventory-storage"},
			{Title: "Worldwide Fulfillment", Body: "Carry the approved packout rule into customer order preparation.", URL: "/services/worldwide-fulfillment"},
		},
	},
	"inventory-storage": {
		Slug:             "inventory-storage",
		NavLabel:         "Inventory Storage",
		ShortDescription: "Receive, identify, hold, and release goods from an approved instruction.",
		SEOTitle:         "Inventory Storage for Goods From China | FreightVanta",
		SEODescription:   "Prepare receiving, inventory identification, holding, consolidation, packaging, and release instructions for goods imported from China.",
		SEOKeywords:      []string{"inventory storage for goods from China", "imported goods inventory management", "China inventory storage", "inventory receiving and release", "goods consolidation planning"},
		SEOKeywordsText:  "inventory storage for goods from China, imported goods inventory management, China inventory storage, inventory receiving and release, goods consolidation planning",
		HeroKicker:       "INVENTORY STORAGE AND RELEASE",
		HeroTitle:        "Store goods from China with a reason, a record, and a release rule.",
		HeroBody:         "Imported inventory should not disappear into an unclear handoff after it arrives. FreightVanta helps organize receiving, count, identification, holding, consolidation, packaging, and release instructions so goods from China have a defined next purpose and a visible decision owner.",
		HeroPrimary:      "Request an inventory plan",
		HeroSecondary:    "See the inventory workflow",
		HeroImage:        "freightvanta-service-inventory-storage-hero-v1.png",
		HeroVisualLabel:  "RECEIPT / RELEASE",
		HeroVisualTitle:  "STOCK WITH CONTEXT",
		HeroVisualBody:   "A receipt is useful when the expected stock, active rule, and next movement stay together.",
		HeroStages:       []string{"EXPECTED", "RECEIVED", "HELD", "RELEASED"},
		IntroTitle:       "Inventory is more useful when every receipt already points to its next decision.",
		Intro: []string{
			"A warehouse location alone does not give inventory an operational purpose. The receiving team needs the expected product, quantity, identifiers, documents, condition rule, and action to take when the receipt does not match. The next owner needs to know whether stock is held for customer orders, retail, freight release, packaging, or later replenishment.",
			"This page explains the difference between holding goods and managing an inventory handoff. It does not claim unlimited storage, specialized handling, regulated-goods acceptance, insurance terms, a named warehouse network, or a guaranteed release time. Those details require an approved operational scope.",
		},
		SituationsTitle: "Use inventory storage planning when goods need to pause without losing their operational identity.",
		SituationsLead:  "A defined record lets each receiving, storage, packaging, freight, or fulfillment handoff begin from the information already known.",
		Situations: []publicServiceTopicSituation{
			{Label: "01 / MULTIPLE INBOUND", Title: "You need stock from more than one supplier or production handoff understood together.", Body: "Goods can arrive at different times, in different cartons, or with different identifiers. The receiving and identification method should be clear before inventory is described as consolidated or ready to move."},
			{Label: "02 / MORE THAN ONE OUTCOME", Title: "You want inventory held for more than one future purpose.", Body: "Some stock may support customer orders while another portion is prepared for retail, a packaging change, a freight release, or staged replenishment. The record should name those purposes and the release owner."},
			{Label: "03 / NEXT OWNER", Title: "The next team should not have to rediscover what arrived.", Body: "Fulfillment, freight, and packaging work become more practical when product images, identifiers, count rules, bundle instructions, and release conditions remain attached to the inventory record."},
		},
		WorkflowTitle: "A storage instruction follows the goods from expected inbound to approved release.",
		WorkflowLead:  "The sequence makes the record useful before stock arrives and keeps exceptions visible rather than treating them as a later operational surprise.",
		Workflow: []publicServiceTopicStep{
			{Marker: "01", Title: "Describe the expected inbound", Body: "Record supplier or sender, product and version, expected quantity, identifiers, documents, carton information, and intended next purpose."},
			{Marker: "02", Title: "Set receiving and exception rules", Body: "Define what is counted or identified, what evidence is recorded, and who receives a question if the receipt does not match the expected instruction."},
			{Marker: "03", Title: "Connect stock to an active rule", Body: "Keep product version, packaging, bundle, handling, and destination context attached to the inventory record."},
			{Marker: "04", Title: "Separate purpose and availability", Body: "Identify which stock is held, which stock is prepared for packaging, freight, retail, or fulfillment, and which person can authorize a movement."},
			{Marker: "05", Title: "Prepare consolidation or packout", Body: "Bring together approved components, counts, packaging, bundle, and document instructions only where the required operational scope is confirmed."},
			{Marker: "06", Title: "Release to the next handoff", Body: "Use the active destination, quantity, document, and approval instruction to prepare a confirmed freight, retail, or order-fulfillment movement."},
		},
		ScopeTitle: "What inventory planning can make visible before handling capability is confirmed.",
		ScopeLead:  "The service can organize the information surrounding a receipt and release. Capacity, product acceptance, special handling, and contractual terms still need confirmation.",
		Included: []publicServiceTopicScope{
			{Title: "Expected-receipt brief", Body: "Organize inbound product, quantity, identifiers, documents, and the intended next purpose for the stock."},
			{Title: "Inventory identification", Body: "Carry active product, packaging, bundle, count, and release rules with the inventory record."},
			{Title: "Release preparation", Body: "Prepare approved destination, quantity, document, and authorization details for the next handoff."},
		},
		Confirm: []publicServiceTopicScope{
			{Title: "Capacity and locations", Body: "Warehouse site, available capacity, fees, insurance, storage duration, and release timing require operational confirmation."},
			{Title: "Product acceptance", Body: "Hazardous, regulated, temperature-sensitive, oversized, or special-handling goods need verified acceptance rules."},
			{Title: "Inspection and condition", Body: "Quality standards, condition checks, evidence, disposal, rework, and liability requirements require explicit agreement."},
		},
		NeedsTitle: "Bring the incoming-stock picture and the decision that follows it.",
		NeedsLead:  "The starting record should show both what is expected to arrive and what the business intends to do after it is identified.",
		Needs: []string{
			"Supplier or sender details, expected arrival context, and available documents.",
			"Product and version reference, SKU or identifier, images, carton or pallet details.",
			"Expected quantity, counting rule, and how mismatches should be escalated.",
			"Packaging, component, bundle, or customer-facing packout instructions.",
			"Target market, storage purpose, and next release destination.",
			"Named approval owner for release, substitution, exception, or change decisions.",
		},
		BenefitsTitle: "A stock record can remain useful beyond the receiving moment.",
		BenefitsLead:  "The operating benefit comes from preserving the product context and decision path as goods move between teams.",
		Benefits: []publicServiceTopicBenefit{
			{Label: "EXPECTED VS RECEIVED", Title: "Questions have a reference point", Body: "A mismatch can be raised against the expected record instead of being handled as an isolated warehouse message."},
			{Label: "ACTIVE RULE", Title: "Stock stays connected to the product", Body: "Product version, bundle, packaging, and release context are available to the next owner."},
			{Label: "NAMED PURPOSE", Title: "Holding does not mean uncertainty", Body: "The record explains what the inventory is held for and what should happen before it moves."},
			{Label: "CLEANER RELEASE", Title: "The next handoff starts prepared", Body: "Freight, retail, or fulfillment work can begin with approved destination and authorization details."},
		},
		FAQs: []publicFAQItem{
			{Question: "Can FreightVanta store all types of goods imported from China?", Answer: "Do not assume that it can. Product restrictions, dimensions, handling, location, storage capacity, insurance, and operational acceptance need confirmation before a storage commitment is made."},
			{Question: "Can inventory be split between fulfillment and freight release?", Answer: "It can be planned that way when the quantities, identifiers, active packing rules, release destinations, and approval owners are clear in the confirmed scope."},
			{Question: "Does inventory storage include quality inspection?", Answer: "Receiving, counting, inspection, acceptance, product testing, and evidence requirements are separate decisions. The required standard and responsible party need explicit confirmation."},
			{Question: "Can products from different suppliers be consolidated?", Answer: "Potentially, once product identification, expected inbound, handling, component, destination, and release instructions are confirmed. Consolidation should not be assumed merely because goods reach the same location."},
		},
		CTATitle:  "Start with what is arriving, what must stay attached to it, and where the stock goes next.",
		CTABody:   "Share the product or SKU list, expected quantity, supplier or sender, known inbound context, component or packout rules, target market, and intended storage, freight, retail, or fulfillment handoff. FreightVanta will respond with the practical information needed to define the inventory scope.",
		CTAButton: "Request an inventory plan",
		Related: []publicServiceTopicRelated{
			{Title: "Bulk Procurement", Body: "Plan the purchase record before a larger quantity reaches inventory.", URL: "/services/bulk-procurement"},
			{Title: "Packaging and Branding", Body: "Connect components and active packout rules to products and stock.", URL: "/services/packaging-branding"},
			{Title: "Worldwide Fulfillment", Body: "Prepare ready inventory for customer orders and shipping handoff.", URL: "/services/worldwide-fulfillment"},
		},
	},
	"private-white-label": {
		Slug:             "private-white-label",
		NavLabel:         "Private and White Label",
		ShortDescription: "Keep approved product, packaging, and customer-facing versions connected.",
		SEOTitle:         "Private Label Products From China: Version Planning | FreightVanta",
		SEODescription:   "Keep private label and white label product, packaging, artwork, inventory, and fulfillment instructions aligned for products from China.",
		SEOKeywords:      []string{"private label products from China", "white label from China", "private label packaging coordination", "branded product version control", "China private label planning"},
		SEOKeywordsText:  "private label products from China, white label from China, private label packaging coordination, branded product version control, China private label planning",
		HeroKicker:       "PRIVATE LABEL AND WHITE LABEL",
		HeroTitle:        "Keep the product, brand, and active version moving as one decision.",
		HeroBody:         "Private label and white label work becomes hard to control when product evidence, artwork, packaging, insert, stock, and fulfillment instructions each point to a different version. FreightVanta helps organize the approved product and customer-facing version into one operational record before products from China move through the next handoff.",
		HeroPrimary:      "Request a brand-control plan",
		HeroSecondary:    "See the version workflow",
		HeroImage:        "freightvanta-service-private-white-label-hero-v1.png",
		HeroVisualLabel:  "BRAND / CONTROL",
		HeroVisualTitle:  "ONE ACTIVE VERSION",
		HeroVisualBody:   "A brand decision becomes operational when product, packaging, stock, and fulfillment use the same approved version.",
		HeroStages:       []string{"PRODUCT", "ARTWORK", "VERSION", "FULFILLMENT"},
		IntroTitle:       "A private-label program needs more than a logo on a product.",
		Intro: []string{
			"A private label product is the client-facing version of a product decision. A white label product can begin from a more standard product direction, but it still needs an approved product reference, market context, packaging or insert rule, and a clear owner for revisions. In both cases, the operational risk grows when a new file or message silently replaces an active instruction.",
			"This page is for teams that need a usable way to coordinate version, packaging, inventory, and fulfillment handoffs around branded products from China. It does not claim trademark advice, IP ownership, legal clearance, product development, certification, or market compliance. Those areas require appropriate qualified advice and verified scope.",
		},
		SituationsTitle: "Use private and white label coordination when customer-facing changes must stay connected to operations.",
		SituationsLead:  "The service turns brand decisions into an active version record that the supplier, receiving team, stock record, and packing instruction can reference.",
		Situations: []publicServiceTopicSituation{
			{Label: "01 / FIRST VERSION", Title: "You have an approved product but need the customer-facing version defined.", Body: "The product reference, target market, packaging, label, insert, and customer expectation need to be connected before a branded product becomes an operating instruction."},
			{Label: "02 / CHANGE CONTROL", Title: "You are replacing artwork, packaging, label copy, or a product variant.", Body: "A revised logo file or supplier message is not enough. The team needs an active version, effective date, named approval owner, and a decision about remaining old components or stock."},
			{Label: "03 / MULTIPLE HANDOFFS", Title: "One brand decision must reach sourcing, inventory, and fulfillment.", Body: "Supplier questions, product evidence, components, receiving, packaging, and customer order preparation should begin from the same current approved instruction."},
		},
		WorkflowTitle: "A six-step path from branded product brief to active customer packout.",
		WorkflowLead:  "The client retains final approval. The plan gives each operating team a reliable reference for the decision it needs to carry out.",
		Workflow: []publicServiceTopicStep{
			{Marker: "01", Title: "Define the branded product brief", Body: "Record product reference, target market, brand assets, packaging direction, customer experience, and the intended next operational handoff."},
			{Marker: "02", Title: "Set the approval path", Body: "Name who approves product evidence, samples where relevant, artwork, labels, packaging, and final packout."},
			{Marker: "03", Title: "Prepare supplier and packaging handoffs", Body: "Translate the approved product and brand details into a request that references one active version."},
			{Marker: "04", Title: "Track version and change rules", Body: "Give products, labels, inserts, and packaging an effective date, approval owner, and remaining-stock decision."},
			{Marker: "05", Title: "Receive against the approved instruction", Body: "Connect inbound goods and components to the active product and packout version with a visible exception path."},
			{Marker: "06", Title: "Fulfill to the customer-facing brief", Body: "Use the current approved version for picking, packing, inserts, labels, and confirmed release steps."},
		},
		ScopeTitle: "What private-label coordination can keep connected.",
		ScopeLead:  "The service organizes a product and version record while being explicit about the legal, design, manufacturing, and compliance responsibilities that need separate confirmation.",
		Included: []publicServiceTopicScope{
			{Title: "Branded product brief", Body: "Organize product, market, packaging, version, and customer-experience requirements into one working record."},
			{Title: "Approval checkpoints", Body: "Record product evidence, artwork, packaging, label, and packout decisions with named approval owners."},
			{Title: "Version handoff", Body: "Connect the active product, label, insert, and packaging version to receiving and fulfillment instructions."},
		},
		Confirm: []publicServiceTopicScope{
			{Title: "Trademark and IP", Body: "Ownership, clearance, legal advice, and use of brand assets require qualified advice and explicit scope."},
			{Title: "Product development", Body: "Design ownership, engineering, materials, manufacturing, and commercial responsibility require confirmation."},
			{Title: "Regulatory compliance", Body: "Safety, certification, product claims, labels, and market rules must be verified separately."},
		},
		NeedsTitle: "Bring the current approved product decision and the change you need to control.",
		NeedsLead:  "A first discussion can begin with a product reference and partial brand material, provided the missing information is treated as an open decision.",
		Needs: []string{
			"Product reference, current variation, sample, image, specification, or SKU context.",
			"Target market, sales channel, customer-facing positioning, and intended destination.",
			"Approved or draft brand assets, packaging direction, label copy, and language needs.",
			"Known supplier, manufacturing, packaging, or component context where available.",
			"Current version, effective date, change reason, and remaining old-stock decision.",
			"The next inventory, retail, freight, or fulfillment handoff that needs the active record.",
		},
		BenefitsTitle: "A brand change can become an operating decision instead of a loose file.",
		BenefitsLead:  "The value is not a promise about market results. It is a clearer path for maintaining product and customer-facing consistency across handoffs.",
		Benefits: []publicServiceTopicBenefit{
			{Label: "ACTIVE VERSION", Title: "Everyone starts from the same rule", Body: "Product, packaging, label, insert, stock, and fulfillment instructions identify one current approved version."},
			{Label: "NAMED APPROVAL", Title: "Change has an accountable owner", Body: "The record distinguishes a proposed revision from an approved instruction and shows who can authorize it."},
			{Label: "EFFECTIVE DATE", Title: "Old and new materials can be discussed", Body: "A switchover includes a date and a decision about remaining packaging, components, or stock."},
			{Label: "CONNECTED HANDOFF", Title: "Brand intent reaches operations", Body: "Receiving and fulfillment teams can reference the same approved brief rather than interpreting isolated assets."},
		},
		FAQs: []publicFAQItem{
			{Question: "Does FreightVanta provide trademark, IP, or legal advice?", Answer: "No. Trademark, IP ownership, market labeling, product claims, legal copy, regulatory review, and certification require appropriate qualified advice and a separate confirmed scope."},
			{Question: "Can white label products use custom inserts or packaging?", Answer: "This can be coordinated where product, materials, quantities, receiving process, and packout instructions are approved. The page does not promise a component or setup before those details are confirmed."},
			{Question: "How can old and new packaging be kept from mixing?", Answer: "Use an active version, effective date, decision for remaining stock, and a clear packing instruction. A verbal instruction or replaced file alone is not enough."},
			{Question: "Can private-label coordination lead into storage and fulfillment?", Answer: "Yes. Once product, packaging, and approval information is stable, the approved record can be prepared for a confirmed inventory or fulfillment handoff."},
		},
		CTATitle:  "Start with the product, the current approved brand decision, and the change you need to control.",
		CTABody:   "Share the product reference, target market, brand assets, packaging direction, sample or version context, known supplier, and the next inventory or fulfillment handoff. FreightVanta will respond with the approval and operational questions that need to be clear before the program moves forward.",
		CTAButton: "Request a brand-control plan",
		Related: []publicServiceTopicRelated{
			{Title: "Product Sourcing", Body: "Turn an early product reference into a supplier-ready brief.", URL: "/product-sourcing"},
			{Title: "Packaging and Branding", Body: "Translate approved components and assets into a packout instruction.", URL: "/services/packaging-branding"},
			{Title: "Worldwide Fulfillment", Body: "Use the active product and packout rule for customer orders.", URL: "/services/worldwide-fulfillment"},
		},
	},
	"worldwide-fulfillment": {
		Slug:             "worldwide-fulfillment",
		NavLabel:         "Worldwide Fulfillment",
		ShortDescription: "Prepare customer orders from ready inventory with clear packing and exception rules.",
		SEOTitle:         "Fulfillment for China Sourced Products | FreightVanta",
		SEODescription:   "Prepare customer orders for China sourced products with documented product, packing, destination, shipping-handoff, and exception rules.",
		SEOKeywords:      []string{"fulfillment for China sourced products", "worldwide fulfillment for imported products", "ecommerce fulfillment from China", "order preparation and packing", "international fulfillment planning"},
		SEOKeywordsText:  "fulfillment for China sourced products, worldwide fulfillment for imported products, ecommerce fulfillment from China, order preparation and packing, international fulfillment planning",
		HeroKicker:       "WORLDWIDE FULFILLMENT",
		HeroTitle:        "Prepare customer orders with rules that survive the handoff.",
		HeroBody:         "A customer order should not be the first time the team learns the product version, packing rule, bundle, excluded material, destination instruction, or exception owner. FreightVanta helps organize an order-preparation plan for China sourced products before fulfillment capability, locations, carriers, and service levels are confirmed.",
		HeroPrimary:      "Request a fulfillment plan",
		HeroSecondary:    "See the fulfillment workflow",
		HeroImage:        "freightvanta-service-worldwide-fulfillment-hero-v1.png",
		HeroVisualLabel:  "ORDER / HANDOFF",
		HeroVisualTitle:  "CUSTOMER-READY",
		HeroVisualBody:   "An order needs more than stock. It needs an active product rule, packing rule, destination, and exception path.",
		HeroStages:       []string{"READY STOCK", "PICK", "PACK", "HANDOFF"},
		IntroTitle:       "A customer order should not be the first time the team learns the packing rule.",
		Intro: []string{
			"A fulfillment setup needs more than an inventory count. Each sellable product needs an identifier, active packaging or bundle rule, destination instruction, and a defined exception path. A missing item, changed address, damaged component, stock difference, or unclear label should create a visible decision request rather than an undocumented choice.",
			"This page is for brands and ecommerce teams that need a practical plan for order preparation after products have been sourced from China. It does not promise warehouse locations, carrier coverage, store integrations, cut-off times, tracking behavior, service rates, or delivery results unless operations has verified those details for a confirmed scope.",
		},
		SituationsTitle: "Use fulfillment planning when ready inventory needs to become a consistent customer order.",
		SituationsLead:  "Order readiness is separate from stock arrival and delivery status. A defined plan helps the customer-facing rule travel with each handoff.",
		Situations: []publicServiceTopicSituation{
			{Label: "01 / ORDER READINESS", Title: "Inventory has arrived, but the order-level rule is still unclear.", Body: "A SKU, active version, packaging, insert, bundle, exclusion, destination field, and exception owner should be clear before a product is treated as ready for customer orders."},
			{Label: "02 / BRAND AND BUNDLE", Title: "Your customer experience depends on components and packing decisions.", Body: "A multi-item order, branded insert, fragile product, gift set, or supplier-material exclusion needs a current packing instruction that can be repeated and reviewed."},
			{Label: "03 / EXCEPTIONS", Title: "The next team needs a decision route when an order is not straightforward.", Body: "Stock, address, component, cancellation, damage, or delay questions should reach the person who can decide what happens next rather than being handled by assumption."},
		},
		WorkflowTitle: "The fulfillment plan follows an order from ready inventory to its next shipping handoff.",
		WorkflowLead:  "Each step names the information an order needs and avoids claims about a carrier, location, integration, rate, or timing commitment that has not been confirmed.",
		Workflow: []publicServiceTopicStep{
			{Marker: "01", Title: "Receive and identify inventory", Body: "Connect goods to expected quantity, identifiers, documents, and an active product and packing rule."},
			{Marker: "02", Title: "Prepare order readiness", Body: "Give each sellable product an identifier, active packaging rule, bundle rule, destination context, and an accountable change owner."},
			{Marker: "03", Title: "Create the picking rule", Body: "State what is included, excluded, or substituted only with approval in a multi-item order."},
			{Marker: "04", Title: "Apply packing and brand rules", Body: "Use the active protection, component, document, carton, and excluded-material instruction for the customer-facing order."},
			{Marker: "05", Title: "Prepare the shipping handoff", Body: "Connect destination details, required label, selected service where confirmed, and tracking reference where the confirmed service makes one available."},
			{Marker: "06", Title: "Handle exceptions", Body: "Send stock, address, component, cancellation, damage, or delay questions to the accountable decision owner before a new instruction is applied."},
		},
		ScopeTitle: "What the fulfillment setup can define before service capability is confirmed.",
		ScopeLead:  "The page is specific about order preparation while keeping clear boundaries around locations, delivery coverage, integrations, returns, rates, and service levels.",
		Included: []publicServiceTopicScope{
			{Title: "Order-preparation workflow", Body: "Organize readiness, picking, packing, labels, customer-facing components, and shipping-handoff instructions."},
			{Title: "Bundle and brand components", Body: "Carry approved multi-item, insert, label, protection, and excluded-material rules into the order instruction."},
			{Title: "Exception path", Body: "Define how stock, address, component, or order questions are escalated for a decision."},
		},
		Confirm: []publicServiceTopicScope{
			{Title: "Locations and coverage", Body: "Warehouse sites, destinations, carriers, product restrictions, customs rules, and availability require confirmation."},
			{Title: "Timing and rates", Body: "Same-day claims, cut-offs, service levels, rate cards, and timing commitments require an approved service scope."},
			{Title: "Store and returns workflows", Body: "Platform sync, API capability, returns handling, order-source fields, and customs responsibility require confirmation."},
		},
		NeedsTitle: "Bring the products, the orders, and the customer-facing rule that must stay consistent.",
		NeedsLead:  "The initial discussion should make order-readiness information visible before a capability or location commitment is assumed.",
		Needs: []string{
			"Product or SKU list, images, active product version, and expected order profile.",
			"Target markets, destination context, and any known product or shipping restrictions.",
			"Packaging, labels, inserts, bundles, protection, and excluded-material rules.",
			"Order source, required fields, cancellation or address-change context, and current process.",
			"Exception types that require client approval and the named decision owner.",
			"The inventory, packaging, freight, or customer-order problem the team needs to solve next.",
		},
		BenefitsTitle: "A customer-facing order can have a clearer operating record.",
		BenefitsLead:  "The benefit comes from reducing undocumented choices around products, components, destinations, and exceptions before fulfillment begins.",
		Benefits: []publicServiceTopicBenefit{
			{Label: "ORDER CONTEXT", Title: "The packing rule follows the SKU", Body: "The active product, component, bundle, and exclusion rule can stay attached to the order-preparation instruction."},
			{Label: "VISIBLE EXCEPTIONS", Title: "Questions reach the decision owner", Body: "A stock difference or changed customer detail does not need to become an undocumented operational decision."},
			{Label: "BRAND CONTINUITY", Title: "Customer-facing details stay active", Body: "Approved inserts, labels, protection, and packaging versions can be referenced at the moment they matter."},
			{Label: "CLEANER HANDOFF", Title: "Shipping preparation starts informed", Body: "Destination and confirmed-service requirements can travel with the order without claiming a particular coverage or delivery result."},
		},
		FAQs: []publicFAQItem{
			{Question: "Can FreightVanta fulfill customer orders worldwide?", Answer: "Do not publish a blanket worldwide coverage claim until locations, carriers, product restrictions, customs requirements, and destination availability have been verified. Share intended markets so practical scope can be reviewed."},
			{Question: "Can supplier materials be removed or products combined into one order?", Answer: "These actions may be available under an approved packing instruction. Products, components, bundle rules, destination constraints, and scope need confirmation first."},
			{Question: "Can our ecommerce store connect automatically?", Answer: "Do not promise an integration without verified technical support. The enquiry should collect the store platform, order source, fields, and current order flow first."},
			{Question: "How are tracking updates handled?", Answer: "The process depends on the confirmed shipping service and available integration. Tracking references and status information can be coordinated where the selected service provides them."},
		},
		CTATitle:  "Start with the products, the orders, and the customer-facing rule that must stay consistent.",
		CTABody:   "Share the product or SKU list, expected order profile, target markets, order source, packaging and brand materials, bundle rules, and the current issue your team needs to solve. FreightVanta will respond with practical setup questions before a fulfillment scope is confirmed.",
		CTAButton: "Request a fulfillment plan",
		Related: []publicServiceTopicRelated{
			{Title: "Inventory Storage", Body: "Prepare receiving, stock identification, holding, and release before orders are created.", URL: "/services/inventory-storage"},
			{Title: "Packaging and Branding", Body: "Carry active packaging and component rules into customer order preparation.", URL: "/services/packaging-branding"},
			{Title: "Product Sourcing", Body: "Start the product record before packaging, inventory, and fulfillment depend on it.", URL: "/product-sourcing"},
		},
	},
}

func serviceTopicCopyForSlug(slug string) (publicServiceTopicCopy, bool) {
	slug = strings.TrimPrefix(strings.TrimSpace(slug), "services/")
	switch strings.ToLower(strings.Trim(slug, "/")) {
	case "productservice/packaging":
		slug = "packaging-branding"
	case "productservice/bulkorder":
		slug = "bulk-procurement"
	case "productservice/storage":
		slug = "inventory-storage"
	case "productservice/branding":
		slug = "private-white-label"
	case "productservice/fulfillment":
		slug = "worldwide-fulfillment"
	}
	copy, ok := serviceTopicCopies[slug]
	return copy, ok
}

func (s *server) configureServiceTopicPage(r *http.Request, data *publicSitePageData, site catalog.Site, preview bool, network []catalog.PublicLanguageSite, copy publicServiceTopicCopy) {
	copy = localizedServiceTopicCopy(copy, data.LanguageCode)
	data.IsHome = false
	data.IsServiceTopic = true
	data.NotFound = false
	data.HasContent = false
	data.Content = publicContentData{}
	data.ServiceTopic = copy
	data.PageTitle = copy.SEOTitle
	data.MetaDescription = copy.SEODescription
	data.OGTitle = copy.SEOTitle
	data.OGDescription = copy.SEODescription
	data.SocialImageURL = publicSchemaAbsoluteURL(publicSchemaURL(*data), "/assets/images/"+copy.HeroImage)
	data.RobotsIndex = true
	s.populatePublicNetworkForFixedPath(r, data, site, preview, network, "services/"+copy.Slug)
	if preview {
		data.CanonicalURL = ""
	}
	data.StructuredData = template.JS(publicJSONLD(*data, site))
}
