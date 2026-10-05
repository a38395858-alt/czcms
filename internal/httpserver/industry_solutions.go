package httpserver

import (
	"html/template"

	"czcms/internal/catalog"
)

const (
	crossBorderEcommerceIndustrySlug = "industries/cross-border-ecommerce"
	consumerGoodsIndustrySlug        = "industries/consumer-goods"
	timeCriticalCargoIndustrySlug    = "industries/time-critical-cargo"
)

// publicIndustrySolutionCopy is intentionally separate from a service topic.
// An industry page connects several services around an operating situation, so
// it must not imply that every coordination item is one bundled service.
type publicIndustrySolutionCopy struct {
	Slug, NavLabel                                   string
	SEOTitle, SEODescription, SEOKeywordsText        string
	SEOKeywords                                      []string
	HeroKicker, HeroTitle, HeroBody                  string
	HeroPrimary, HeroSecondary                       string
	HeroImage, HeroAlt                               string
	HeroVisualLabel, HeroVisualTitle, HeroVisualBody string
	HeroStages                                       []string
	DecisionKicker, DecisionTitle                    string
	Decision                                         []string
	Evidence                                         []string
	WorkflowKicker, WorkflowTitle, WorkflowLead      string
	Workflow                                         []publicServiceTopicStep
	ChannelsKicker, ChannelsTitle, ChannelsLead      string
	Channels                                         []publicIndustrySolutionChannel
	ScopeKicker, ScopeTitle, ScopeLead               string
	Included, Confirm                                []publicServiceTopicScope
	InventoryKicker, InventoryTitle, InventoryLead   string
	InventoryChecklist                               []string
	InventoryImage, InventoryAlt, InventoryCaption   string
	RequestKicker, RequestTitle, RequestLead         string
	RequestChecklist                                 []string
	FAQs                                             []publicFAQItem
	RelatedTitle                                     string
	Related                                          []publicIndustrySolutionRelated
	FinalTitle, FinalBody, CTAButton                 string
}

type publicIndustrySolutionChannel struct {
	Label string
	Title string
	Body  string
}

type publicIndustrySolutionRelated struct {
	Title string
	Body  string
	Path  string
}

var crossBorderEcommerceIndustry = publicIndustrySolutionCopy{
	Slug:            crossBorderEcommerceIndustrySlug,
	NavLabel:        "Cross-border ecommerce",
	SEOTitle:        "Cross-Border Ecommerce Logistics From China | FreightVanta",
	SEODescription:  "Plan China sourcing, branded ecommerce packaging, inventory context, and customer-ready order handoffs with a practical cross-border ecommerce operating brief.",
	SEOKeywords:     []string{"cross-border ecommerce logistics from China", "China sourcing and fulfillment for ecommerce", "ecommerce inventory and fulfillment coordination", "branded ecommerce packaging from China", "marketplace and DTC order preparation"},
	SEOKeywordsText: "cross-border ecommerce logistics from China, China sourcing and fulfillment for ecommerce, ecommerce inventory and fulfillment coordination, branded ecommerce packaging from China, marketplace and DTC order preparation",
	HeroKicker:      "CROSS-BORDER ECOMMERCE / FROM CHINA TO CUSTOMER-READY ORDERS",
	HeroTitle:       "Keep the ecommerce handoffs connected after you source from China.",
	HeroBody:        "Product details, approved packaging, inbound inventory, and customer-order instructions need to remain connected after the purchase is made. FreightVanta turns those handoffs into one practical operating path.",
	HeroPrimary:     "Request an ecommerce operating plan",
	HeroSecondary:   "See the connected workflow",
	HeroImage:       "freightvanta-service-worldwide-fulfillment-hero-v1.png",
	HeroAlt:         "Ecommerce fulfillment workbench with unbranded cartons and packing materials",
	HeroVisualLabel: "ORDER / HANDOFF",
	HeroVisualTitle: "CONNECTED OPERATIONS",
	HeroVisualBody:  "Make the next instruction useful before a customer order depends on it.",
	HeroStages:      []string{"PRODUCT", "PACKOUT", "INVENTORY", "ORDERS", "HANDOFF"},

	DecisionKicker: "THE OPERATING DECISION",
	DecisionTitle:  "A customer order is only as reliable as the decisions made before it exists.",
	Decision: []string{
		"A storefront can make a product look ready long before the operating path is ready. For products sourced from China, that path often crosses supplier questions, approved product variants, packaging components, inbound expectations, inventory identification, sales-channel rules, and a final customer-order instruction. When each handoff is managed as a separate task, changes can become invisible until they affect a shipment or customer experience.",
		"FreightVanta is designed around the connection between those decisions. The work starts with the current reality of the product and the next place it needs to go. It does not ask a growing ecommerce team to pretend that every product, supplier, channel, or exception follows the same template.",
	},
	Evidence: []string{
		"Product version, quantity, and destination remain attached to the next instruction.",
		"Approved packaging and inserts become an order-level rule, not a loose folder of files.",
		"Inbound stock is described with a purpose and release owner before it is treated as available.",
		"Marketplace, DTC, retail, or replenishment requirements are recorded as distinct operational contexts.",
	},

	WorkflowKicker: "CONNECTED WORKFLOW",
	WorkflowTitle:  "One operating path for the work that happens between supplier and customer.",
	WorkflowLead:   "Start with the stage that is uncertain today. The later stages are included here so product, packaging, inventory, and order decisions can be made with the next handoff in view.",
	Workflow: []publicServiceTopicStep{
		{Marker: "01", Title: "Define the product brief", Body: "Turn a link, image, specification, or existing SKU record into the product details that a supplier, packaging partner, receiving team, and ecommerce operator can understand in the same way."},
		{Marker: "02", Title: "Confirm the purchase handoff", Body: "Keep quantity, approved variation, known supplier questions, target market, and intended next movement visible before a production or purchasing decision advances."},
		{Marker: "03", Title: "Make the packout usable", Body: "Connect final packaging, inserts, labels, bundle rules, language versions, and materials that should not reach the customer to a practical packing instruction."},
		{Marker: "04", Title: "Prepare inbound inventory", Body: "Describe expected goods, identifiers, carton context, count or evidence rules, and the person who should decide what happens when the receipt differs from the plan."},
		{Marker: "05", Title: "Separate stock by purpose", Body: "Record whether inventory supports customer orders, a marketplace replenishment, retail preparation, branded packaging, a freight release, or a staged launch."},
		{Marker: "06", Title: "Release customer-ready orders", Body: "Prepare the agreed product, packout, channel, destination, and exception information for the confirmed fulfillment or delivery handoff."},
	},

	ChannelsKicker: "SALES CHANNELS",
	ChannelsTitle:  "Set the operating rule around the way you actually sell.",
	ChannelsLead:   "A product can have one source but more than one route to market. The purpose of this section is to make those differences visible before inventory, packaging, or order instructions are reused in the wrong context.",
	Channels: []publicIndustrySolutionChannel{
		{Label: "DTC STOREFRONT", Title: "Your order experience is part of the brand promise.", Body: "The product, protection, insert, bundle, return-material decision, and customer-facing language may need to travel together. The plan should identify which packout version is active and what happens when an item, component, or customer instruction changes."},
		{Label: "MARKETPLACE", Title: "Channel requirements need their own preparation rule.", Body: "A marketplace listing, replenishment, prep requirement, carton instruction, or destination can be different from a DTC order. Record the approved channel context rather than treating all available stock as automatically ready for every route."},
		{Label: "WHOLESALE OR RETAIL", Title: "The receiving handoff is not the same as a consumer order.", Body: "Retail-facing movements can depend on item identifiers, carton details, appointment context, documentation, bundle composition, or delivery instructions that do not belong in a direct-to-customer packout. Keep that route distinct from DTC preparation."},
	},

	ScopeKicker: "OPERATING CONTROLS",
	ScopeTitle:  "Make the useful instruction visible. Confirm the rest before it becomes a promise.",
	ScopeLead:   "Cross-border ecommerce includes physical work, commercial decisions, platform data, and legal responsibilities. The site should clearly show what can be organized as a workflow and what needs specific operational or qualified confirmation.",
	Included: []publicServiceTopicScope{
		{Title: "Product-detail and variation handoff", Body: "Organize the product information that must move from China sourcing into the later operating steps."},
		{Title: "One working brief", Body: "Keep supplier, quantity, packaging, inventory, and destination questions together where the next owner can use them."},
		{Title: "Approved customer-facing rules", Body: "Record approved inserts, labels, bundles, packout versions, and excluded-material instructions."},
		{Title: "Inbound and release context", Body: "Prepare expected stock, identifiers, count instructions, discrepancy ownership, and release purpose."},
		{Title: "Channel distinction", Body: "Document the different DTC, marketplace, retail, replenishment, and freight-release contexts."},
		{Title: "Confirmed handoff questions", Body: "Identify the questions required to prepare a confirmed fulfillment or delivery handoff."},
	},
	Confirm: []publicServiceTopicScope{
		{Title: "Commercial and supplier outcomes", Body: "Supplier selection, price, product quality, inspection, factory audit, testing, certification, and compliance responsibility require confirmation."},
		{Title: "Platform and delivery capability", Body: "Marketplace or storefront integrations, automatic order sync, data handling, carrier selection, delivery time, rate, and tracking availability require approved scope."},
		{Title: "Warehouse and handling capability", Body: "Warehouse capacity, product acceptance, special handling, storage term, insurance, return processing, and country coverage remain subject to confirmation."},
		{Title: "Legal responsibilities", Body: "Legal labeling, product safety, tax, customs classification, importer-of-record, and market-specific obligations need qualified confirmation."},
	},

	InventoryKicker: "INVENTORY WITH CONTEXT",
	InventoryTitle:  "A SKU is not ready because it has a name and a price.",
	InventoryLead:   "Before a product can move confidently through a cross-border ecommerce operation, the next team needs more than a storefront title. They need an active product version, product image or reference, variation rule, packaging context, expected quantity, channel purpose, market language, and an instruction for what should happen when the incoming record no longer matches the approved plan. This is what lets a source decision travel further without becoming an assumption.",
	InventoryChecklist: []string{
		"Product name, reference image, variation, dimensions, material, and approved version.",
		"Known supplier or sender, expected quantity, carton details, and expected ready period.",
		"Destination market, intended channel, and whether the stock is for launch, replenishment, retail, or customer orders.",
		"Active packout version, component quantities, language variants, and excluded supplier materials.",
		"Inbound identifier, count or evidence rule, discrepancy owner, and release authorization.",
	},
	InventoryImage:   "freightvanta-service-inventory-storage-hero-v1.png",
	InventoryAlt:     "Inbound ecommerce inventory verification with cartons and a barcode scanner",
	InventoryCaption: "THE NEXT HANDOFF BEGINS WITH AN IDENTIFIABLE PRODUCT, AN ACTIVE RULE, AND AN OWNER FOR EXCEPTIONS.",

	RequestKicker: "START YOUR PLAN",
	RequestTitle:  "Bring the current product reality. We will identify the next operational questions.",
	RequestLead:   "A useful ecommerce plan can begin before every detail is known. Share what is already decided, name the handoff that feels uncertain, and leave unknown information visible. FreightVanta can use that starting point to ask practical scoping questions rather than making the missing decisions disappear behind a generic quote request.",
	RequestChecklist: []string{
		"Product reference, product link, SKU list, or specification.",
		"Origin in China, known supplier status, and expected quantity or reorder pattern.",
		"Target market, storefront, marketplace, retail, or wholesale context.",
		"Packaging, insert, label, bundle, or brand-material requirement.",
		"Current inventory position and the next place the goods need to go.",
		"Known timing constraint and the responsible decision maker for product, brand, and release approval.",
	},
	FAQs: []publicFAQItem{
		{Question: "Can we start with only a product link or product image?", Answer: "Yes. A link, image, rough SKU list, or short specification can be enough to start a source-to-operation conversation. The resulting plan should identify the missing product, packaging, quantity, channel, and destination information instead of guessing it."},
		{Question: "Does this page promise direct integration with our ecommerce platform or marketplace?", Answer: "No. Storefront, marketplace, OMS, WMS, order-data, and tracking connections depend on confirmed technical and operational scope. The enquiry should collect the relevant platform, order source, fields, current workflow, and target outcome before an integration is described as available."},
		{Question: "Can products sourced from China be prepared for both DTC and marketplace sales?", Answer: "They can be planned around more than one approved route, but the product version, available inventory, packaging, prep requirement, destination, and authorization rule must be clear for each route. A common source does not make every unit automatically ready for every channel."},
		{Question: "Does ecommerce fulfillment include returns, carrier selection, or delivery guarantees?", Answer: "Do not assume that it does. Returns policy, product acceptance, carrier options, transit time, tracking, rate, country coverage, and exception ownership need confirmation against the actual product, destinations, and operating scope."},
		{Question: "Can packaging and branded inserts be coordinated with sourced products?", Answer: "Yes, the approved packaging and branding decisions can be organized into a packout brief. Design ownership, component manufacturing, legal copy, regulated labels, and stock-management terms remain subject to confirmation."},
		{Question: "What should we prepare for a planning conversation?", Answer: "Provide the product reference, source status, estimated quantity, target market, intended sales channels, packaging requirements, expected next handoff, and the decisions that are still open. A useful plan begins by making the unknowns visible."},
	},
	RelatedTitle: "Build the next handoff without rebuilding the whole plan.",
	Related: []publicIndustrySolutionRelated{
		{Title: "Product Sourcing", Body: "Turn a product reference into supplier questions and a purchase-ready next step.", Path: "product-sourcing"},
		{Title: "Packaging and Branding", Body: "Convert approved packaging, inserts, labels, and bundles into a usable packout instruction.", Path: "services/packaging-branding"},
		{Title: "Inventory Storage", Body: "Receive, identify, hold, and release stock from a defined instruction.", Path: "services/inventory-storage"},
		{Title: "Worldwide Fulfillment", Body: "Prepare customer orders from ready inventory with clear packing and exception rules.", Path: "services/worldwide-fulfillment"},
	},
	FinalTitle: "Start with the product, the current handoff, and the outcome your customers should receive.",
	FinalBody:  "Share the product reference, source status, quantity, market, sales channel, packaging context, current inventory position, and next destination. FreightVanta will respond with the practical questions needed to define a cross-border ecommerce operating scope before the work is confirmed.",
	CTAButton:  "Request an ecommerce operating plan",
}

var consumerGoodsIndustry = publicIndustrySolutionCopy{
	Slug:            consumerGoodsIndustrySlug,
	NavLabel:        "Consumer goods",
	SEOTitle:        "Consumer Goods Logistics From China | FreightVanta",
	SEODescription:  "Plan China consumer goods sourcing, product detail, packaging, inbound inventory, and retail-ready operating handoffs with FreightVanta.",
	SEOKeywords:     []string{"consumer goods logistics from China", "consumer goods sourcing and packaging from China", "China consumer goods supply chain coordination", "quality and packaging coordination from China", "retail-ready consumer goods handoff"},
	SEOKeywordsText: "consumer goods logistics from China, consumer goods sourcing and packaging from China, China consumer goods supply chain coordination, quality and packaging coordination from China, retail-ready consumer goods handoff",
	HeroKicker:      "CONSUMER GOODS / FROM CHINA SOURCING TO THE NEXT RETAIL-READY HANDOFF",
	HeroTitle:       "Keep consumer-goods decisions intact from China sourcing to the next shelf or customer handoff.",
	HeroBody:        "A consumer product is not ready because the purchase is complete. Its approved version, presentation, inbound context, and release instruction need to remain connected as it moves from China toward retail, wholesale, or direct customer orders.",
	HeroPrimary:     "Request a consumer-goods operating plan",
	HeroSecondary:   "See the connected workflow",
	HeroImage:       "italy-industries-consumer-goods-v1.png",
	HeroAlt:         "Consumer goods and unbranded cartons organized in a warehouse for the next logistics handoff",
	HeroVisualLabel: "PRODUCT / PRESENTATION",
	HeroVisualTitle: "THE APPROVED VERSION",
	HeroVisualBody:  "Keep the product, its packout, and its next destination attached to the same working instruction.",
	HeroStages:      []string{"PRODUCT", "CHECKS", "PACKOUT", "INBOUND", "RELEASE"},

	DecisionKicker: "THE OPERATING DECISION",
	DecisionTitle:  "For consumer goods, the finished product is more than the item inside the carton.",
	Decision: []string{
		"A consumer-goods purchase can appear simple when the conversation stops at a product image, a quantity, and a shipment date. The next handoff often needs more: the approved material, colour or variation, product reference, packaging components, carton context, expected quantity, destination, and a clear decision path when the delivered goods differ from the working plan. When those details are separated across supplier messages, design files, and receiving notes, the product can arrive without a usable instruction.",
		"FreightVanta helps organize the handoffs around the approved product reality. The aim is not to declare every source, quality, delivery, or compliance outcome in advance. It is to keep the useful facts visible so the next owner can prepare the right question, check, packout, or release decision before the product is treated as ready.",
	},
	Evidence: []string{
		"The approved product version, quantity, and intended market stay attached to the next instruction.",
		"Packaging components and presentation rules are treated as a packout decision, not as loose artwork files.",
		"Expected inbound goods have an identifier, evidence or count rule, and an owner for differences.",
		"Retail, wholesale, seasonal, and direct-to-customer releases remain separate operating contexts.",
	},

	WorkflowKicker: "CONNECTED WORKFLOW",
	WorkflowTitle:  "One practical path for the details that make a consumer product ready for its next handoff.",
	WorkflowLead:   "Begin with the stage that is unclear today. The later stages stay visible so a product, packaging, and inventory decision is made with its next release context in mind.",
	Workflow: []publicServiceTopicStep{
		{Marker: "01", Title: "Capture the approved product reference", Body: "Record the product image or specification, active variation, material, colour, dimensions, known source context, and the approval version that later owners should follow."},
		{Marker: "02", Title: "Align the China sourcing handoff", Body: "Keep the intended quantity, supplier status, known questions, target market, and next movement visible before a purchase, production, or consolidation decision moves forward."},
		{Marker: "03", Title: "Define the evidence and exception rule", Body: "Identify the count, photo, reference, or discrepancy question needed at the next handoff. Inspection outcomes, product testing, and acceptance responsibility remain subject to confirmed scope."},
		{Marker: "04", Title: "Make the presentation usable", Body: "Connect approved packaging, labels, inserts, bundles, language versions, and materials to be removed into a practical packout instruction for the intended route."},
		{Marker: "05", Title: "Prepare the inbound release context", Body: "Describe expected goods, carton details, identifiers, hold or release purpose, and the person who should decide what happens when the receipt differs from the plan."},
		{Marker: "06", Title: "Release by the correct route", Body: "Prepare the product, packout, destination, channel, and exception information for the confirmed retail, wholesale, fulfillment, or freight handoff."},
	},

	ChannelsKicker: "RELEASE CONTEXTS",
	ChannelsTitle:  "The same product may need a different operating rule for every route to market.",
	ChannelsLead:   "Consumer goods often travel through more than one commercial context. Treating all available cartons as ready for every destination can obscure the packaging, receiving, document, or release decision that makes the next handoff usable.",
	Channels: []publicIndustrySolutionChannel{
		{Label: "DTC OR SUBSCRIPTION", Title: "The product presentation reaches the customer with the product.", Body: "Customer-facing packaging, protection, insert, bundle, language, and excluded supplier-material rules need to remain connected to the active product version. A change to one component should create a visible decision before it is repeated in later customer orders."},
		{Label: "RETAIL OR WHOLESALE", Title: "A receiving handoff has its own preparation requirements.", Body: "Retail and wholesale routes can depend on item identifiers, carton structure, product presentation, delivery context, documentation, or receiving instructions that do not belong in a direct customer packout. Keep the intended route visible before stock is released."},
		{Label: "SEASONAL OR CAMPAIGN", Title: "Timing does not remove the need for a clear product version.", Body: "A launch, promotion, event, or replenishment can add a deadline without making an incomplete product, packaging, or destination instruction usable. Record the timing constraint alongside the active version and the owner who can decide what changes if the plan no longer matches reality."},
	},

	ScopeKicker: "OPERATING CONTROLS",
	ScopeTitle:  "Make the approved product version visible. Confirm the remaining responsibility before it becomes a promise.",
	ScopeLead:   "Consumer-goods logistics combines source information, physical preparation, commercial choices, and market requirements. The plan distinguishes the practical workflow that can be organized from commercial, legal, or operational capability that needs specific confirmation.",
	Included: []publicServiceTopicScope{
		{Title: "Product-reference and variation handoff", Body: "Organize the active product details that need to travel from China sourcing into packaging, receipt, and release preparation."},
		{Title: "One working operating brief", Body: "Keep source, quantity, product version, packaging, inbound, destination, and exception questions together for the next owner."},
		{Title: "Approved presentation rules", Body: "Record approved packaging, labels, inserts, bundles, language variants, and materials that should not travel with the finished product."},
		{Title: "Inbound and release context", Body: "Prepare expected goods, identifiers, count or evidence questions, stock purpose, discrepancy ownership, and release authorization."},
		{Title: "Route-specific preparation", Body: "Distinguish DTC, retail, wholesale, seasonal, replenishment, fulfillment, and freight-release instructions."},
		{Title: "Confirmed handoff questions", Body: "Identify the practical questions required before a confirmed packing, inventory, fulfillment, or delivery handoff."},
	},
	Confirm: []publicServiceTopicScope{
		{Title: "Supplier and product outcomes", Body: "Supplier selection, price, product quality, inspection, audit, sample approval, testing, certification, and compliance responsibility require confirmation."},
		{Title: "Handling and delivery capability", Body: "Product acceptance, warehouse capacity, special handling, storage terms, carrier selection, rate, tracking, transit time, insurance, returns, and country coverage require approved scope."},
		{Title: "Retail and platform requirements", Body: "Retailer, marketplace, storefront, packaging, product-data, integration, delivery-window, and receiving requirements need confirmation for the actual route."},
		{Title: "Legal and market responsibilities", Body: "Product safety, labelling, tax, customs classification, importer-of-record, consumer rules, and market-specific obligations need qualified confirmation."},
	},

	InventoryKicker: "PRODUCT CONTEXT AT RECEIPT",
	InventoryTitle:  "A consumer-goods SKU needs a product version, a packout rule, and a release context.",
	InventoryLead:   "The next team should not need to infer whether an inbound carton is the current approved product, which packaging version applies, where the goods are intended to go, or who can resolve a mismatch. A concise operating record makes those decisions visible before the goods are treated as available for retail, wholesale, customer orders, or a freight release.",
	InventoryChecklist: []string{
		"Product name, reference image, active variation, material, dimensions, and approved version.",
		"Known supplier or sender, expected quantity, carton context, and expected ready period.",
		"Target market, release route, and whether the stock supports a launch, replenishment, retail, wholesale, or customer orders.",
		"Active packaging, insert, label, bundle, language, and excluded-material instruction.",
		"Inbound identifier, count or evidence rule, discrepancy owner, and release authorization.",
	},
	InventoryImage:   "freightvanta-service-packaging-branding-hero-v1.png",
	InventoryAlt:     "Packaging team reviewing unbranded consumer product boxes and packout materials",
	InventoryCaption: "THE PRODUCT VERSION, PRESENTATION RULE, AND NEXT RELEASE CONTEXT SHOULD BE VISIBLE IN THE SAME WORKING RECORD.",

	RequestKicker: "START YOUR PLAN",
	RequestTitle:  "Bring the current product reality. We will identify the next consumer-goods handoff.",
	RequestLead:   "A useful consumer-goods plan can begin before every source, packaging, or destination detail is final. Share what is approved, name the handoff that is uncertain, and keep the unknowns visible. FreightVanta can use that starting point to ask practical scoping questions instead of hiding unconfirmed decisions behind a generic request.",
	RequestChecklist: []string{
		"Product reference, product link, image, SKU list, or specification.",
		"Origin in China, supplier status, expected quantity, and available timing context.",
		"Target market and intended DTC, retail, wholesale, launch, or replenishment route.",
		"Packaging, insert, label, bundle, language, or brand-material requirements.",
		"Current inventory position, next destination, and known receiving or release constraint.",
		"The owner who can approve product, packaging, discrepancy, and release decisions.",
	},
	FAQs: []publicFAQItem{
		{Question: "Can we start with a product image, link, or SKU list from China?", Answer: "Yes. A product reference, image, link, SKU list, or short specification can be enough to begin a planning conversation. The working brief should identify the missing version, source, quantity, packaging, market, and release information rather than guessing it."},
		{Question: "Does this page guarantee product quality, inspection, testing, or supplier approval?", Answer: "No. Product quality, inspection method, factory audit, sample approval, testing, certification, and supplier selection are separate responsibilities that require an agreed scope. This page explains how the related questions can remain visible in the operating handoff."},
		{Question: "Can packaging, labels, and branded inserts be coordinated with consumer goods sourced from China?", Answer: "Approved packaging, label, insert, bundle, and excluded-material decisions can be organized into a packout brief. Design ownership, production capability, legal copy, regulated labels, component availability, and stock terms remain subject to confirmation."},
		{Question: "Can the same consumer goods be prepared for retail, wholesale, and direct customer orders?", Answer: "They can be planned around more than one approved route, but each route needs a clear product version, stock purpose, packaging instruction, destination, and release rule. A common source does not make every unit automatically ready for every channel."},
		{Question: "Does this page promise storage, fulfillment, delivery timing, tracking, or returns processing?", Answer: "No. Warehouse acceptance, capacity, special handling, storage terms, fulfillment, carrier options, rates, transit time, tracking, returns, insurance, and country coverage depend on the confirmed product, locations, and operating scope."},
		{Question: "What should we bring to a consumer-goods planning conversation?", Answer: "Share the product reference, approved version, China source status, quantity, target market, intended route, packaging context, current inventory position, next destination, and the decisions that remain open. A useful plan begins with the known facts and makes the unknowns explicit."},
	},
	RelatedTitle: "Build the next consumer-goods handoff without losing the approved product context.",
	Related: []publicIndustrySolutionRelated{
		{Title: "Product Sourcing", Body: "Turn a product reference into supplier questions and a purchase-ready next step.", Path: "product-sourcing"},
		{Title: "Bulk Procurement", Body: "Organize quantities, supplier inputs, packaging context, and purchasing questions before the next bulk order moves forward.", Path: "services/bulk-procurement"},
		{Title: "Packaging and Branding", Body: "Convert approved packaging, labels, inserts, and bundles into a practical packout instruction.", Path: "services/packaging-branding"},
		{Title: "Inventory Storage", Body: "Receive, identify, hold, and release consumer-goods stock from a defined instruction.", Path: "services/inventory-storage"},
	},
	FinalTitle: "Start with the approved product, the next handoff, and the route it needs to serve.",
	FinalBody:  "Share the product reference, source status, quantity, product version, market, release route, packaging context, current inventory position, and next destination. FreightVanta will respond with the practical questions needed to define a consumer-goods operating scope before the work is confirmed.",
	CTAButton:  "Request a consumer-goods operating plan",
}

// industrialComponentsIndustry keeps the same industry-page information
// architecture while changing the buyer situation, evidence language, and
// physical handoff for specification-led industrial components.
var industrialComponentsIndustry = func() publicIndustrySolutionCopy {
	copy := consumerGoodsIndustry
	copy.Slug = "industries/industrial-components"
	copy.NavLabel = "Industrial components"
	copy.SEOTitle = "Industrial Components Logistics From China | FreightVanta"
	copy.SEODescription = "Plan industrial component sourcing from China, specification handoffs, protective packaging, inbound identification, and delivery-ready release decisions with FreightVanta."
	copy.SEOKeywords = []string{"industrial components logistics from China", "industrial parts sourcing and shipping from China", "China industrial component supply chain", "protective packaging for industrial parts", "specification-led freight coordination"}
	copy.SEOKeywordsText = "industrial components logistics from China, industrial parts sourcing and shipping from China, China industrial component supply chain, protective packaging for industrial parts, specification-led freight coordination"
	copy.HeroKicker = "INDUSTRIAL COMPONENTS / SPECIFICATIONS FROM CHINA TO A CONTROLLED HANDOFF"
	copy.HeroTitle = "Keep the specification attached to every industrial component handoff."
	copy.HeroBody = "A component can be physically delivered and still be operationally unclear. FreightVanta helps keep the reference, approved variation, packing context, documents, receiving instruction, and next movement visible as industrial parts move from China toward production, maintenance, or a project site."
	copy.HeroPrimary = "Request an industrial-components plan"
	copy.HeroSecondary = "See the component workflow"
	copy.HeroImage = "germany-industries-manufacturing-v1.png"
	copy.HeroAlt = "Industrial components protected in reusable crates inside a warehouse ready for a controlled freight handoff"
	copy.HeroVisualLabel = "SPECIFICATION / HANDOFF"
	copy.HeroVisualTitle = "THE ACTIVE REFERENCE"
	copy.HeroVisualBody = "Keep the part, packing method, document context, and receiving decision on the same working path."
	copy.HeroStages = []string{"REFERENCE", "PACK", "DOCUMENTS", "RECEIVE", "RELEASE"}

	copy.DecisionKicker = "THE OPERATING DECISION"
	copy.DecisionTitle = "For industrial components, a correct part still needs a usable receiving decision."
	copy.Decision = []string{
		"Industrial parts rarely move on product name alone. A buyer, supplier, packer, carrier, receiving team, and production or maintenance owner may each need a different piece of the same reference: drawing or specification, revision, material, quantity, protective method, carton or crate context, document set, destination, and the rule for a mismatch. If those details are scattered across purchase messages and attachments, a shipment can arrive without enough context to be released safely.",
		"FreightVanta helps organize the practical handoffs around the active component reference. The page does not turn a logistics brief into an engineering approval, inspection certificate, customs ruling, or delivery guarantee. It makes the open technical and operating questions visible so the correct owner can confirm them before the part moves to the next stage.",
	}
	copy.Evidence = []string{
		"Part reference, revision, quantity, and destination remain attached to the next handoff.",
		"Protective packaging and handling notes are recorded as an active packing instruction.",
		"Expected cartons, crates, identifiers, documents, and discrepancy ownership are visible before receipt.",
		"Production, maintenance, project, spare-part, and site-delivery contexts remain distinct.",
	}

	copy.WorkflowKicker = "CONTROLLED COMPONENT WORKFLOW"
	copy.WorkflowTitle = "One practical path from a China component reference to a receiving-ready handoff."
	copy.WorkflowLead = "Start with the uncertain part of the movement. Keep the later receiving and release decisions visible so a specification is not lost when ownership changes."
	copy.Workflow = []publicServiceTopicStep{
		{Marker: "01", Title: "Capture the active part reference", Body: "Record the drawing, image, SKU, revision, material, dimensions, approved variation, and the reference version that supplier and receiving teams should follow."},
		{Marker: "02", Title: "Align the China purchase handoff", Body: "Keep quantity, supplier status, known technical questions, target destination, ready period, and next movement visible before a purchasing or production decision advances."},
		{Marker: "03", Title: "Define packing and handling context", Body: "Connect corrosion protection, cushioning, crate or carton method, orientation, lifting, stacking, and handling questions to the confirmed component scope."},
		{Marker: "04", Title: "Prepare the document path", Body: "Identify the packing list, commercial invoice, reference files, receiving notes, and any requested certificate or test document that needs qualified confirmation."},
		{Marker: "05", Title: "Prepare inbound identification", Body: "Describe expected units, carton or crate identifiers, evidence or count rules, storage or hold purpose, and the owner for a discrepancy at receipt."},
		{Marker: "06", Title: "Release to the correct destination", Body: "Prepare the approved component, package, documents, destination, and exception information for the confirmed production, maintenance, project, or site handoff."},
	}

	copy.ChannelsKicker = "COMPONENT CONTEXTS"
	copy.ChannelsTitle = "The same part may need a different handoff for production, maintenance, or a project site."
	copy.ChannelsLead = "Industrial components can be sourced once and used in very different operating contexts. The receiving owner, documents, packaging, timing, and exception path should be visible before a common packing or delivery assumption is reused."
	copy.Channels = []publicIndustrySolutionChannel{
		{Label: "PRODUCTION INPUT", Title: "The receiving team needs the active reference before the line needs the part.", Body: "Component revision, quantity, packaging, identifiers, receiving window, and document context may need to travel together. A production input should not be released on a generic product name when the approved reference has changed."},
		{Label: "MAINTENANCE / SPARES", Title: "A spare part needs an owner and a clear destination.", Body: "Maintenance stock can depend on equipment reference, urgency, storage purpose, packaging protection, part identity, and the person who can decide whether an incoming difference is acceptable. Keep those questions distinct from production replenishment."},
		{Label: "PROJECT / SITE DELIVERY", Title: "Site delivery adds timing and receiving context to the part.", Body: "A project movement may depend on site contact, delivery window, lifting or unloading question, crate details, document handoff, and an exception decision when the site is not ready. Record the context without promising a capability that has not been confirmed."},
	}

	copy.ScopeKicker = "OPERATING CONTROLS"
	copy.ScopeTitle = "Keep the active specification visible. Confirm engineering, compliance, handling, and delivery responsibility before it becomes a promise."
	copy.ScopeLead = "Industrial component logistics combines technical references, physical protection, commercial decisions, documents, and destination requirements. The plan separates coordination work from engineering, regulatory, warehouse, carrier, and site capabilities that need explicit confirmation."
	copy.Included = []publicServiceTopicScope{
		{Title: "Part-reference and revision handoff", Body: "Organize the active component details that must travel from China sourcing into packing, documents, receipt, and release."},
		{Title: "One working movement brief", Body: "Keep source, revision, quantity, package, destination, timing, documents, and exception questions together for the next owner."},
		{Title: "Protective packing context", Body: "Record approved carton, crate, cushioning, corrosion, orientation, handling, and excluded-material instructions where confirmed."},
		{Title: "Inbound identification", Body: "Prepare expected units, crate or carton identifiers, count or evidence questions, hold purpose, discrepancy ownership, and release authorization."},
		{Title: "Destination-specific preparation", Body: "Distinguish production input, maintenance spare, project site, consolidation, and freight-release contexts."},
		{Title: "Confirmed handoff questions", Body: "Identify what must be confirmed before a component is packed, stored, released, or delivered to its next owner."},
	}
	copy.Confirm = []publicServiceTopicScope{
		{Title: "Engineering and product acceptance", Body: "Drawing approval, revision control, material, fit, function, quality, inspection, testing, certification, and technical acceptance require qualified responsibility."},
		{Title: "Supplier and commercial outcomes", Body: "Supplier selection, pricing, production schedule, factory audit, sample approval, and purchase terms require confirmation."},
		{Title: "Handling and delivery capability", Body: "Weight, dimensions, special handling, storage, lifting, loading, carrier selection, rates, transit, tracking, insurance, and site coverage need approved scope."},
		{Title: "Legal and customs responsibilities", Body: "Classification, export controls, safety, tax, customs, importer-of-record, destination rules, and required documentation need qualified confirmation."},
	}

	copy.InventoryKicker = "COMPONENT CONTEXT AT RECEIPT"
	copy.InventoryTitle = "A component is not ready because the crate arrived; it needs a reference, evidence, and an owner."
	copy.InventoryLead = "The receiving team should not have to infer whether a crate contains the current revision, which protective method was approved, where the part is intended to go, or who can resolve a mismatch. A concise record lets the component travel from China sourcing into storage, production, maintenance, or a project release without turning missing context into an assumption."
	copy.InventoryChecklist = []string{
		"Part name, drawing or reference image, revision, material, dimensions, and approved version.",
		"Known supplier or sender, expected quantity, crate or carton details, and expected ready period.",
		"Destination context: production, maintenance spare, project site, consolidation, or freight release.",
		"Active packing, corrosion, cushioning, handling, orientation, and document instruction.",
		"Inbound identifier, count or evidence rule, discrepancy owner, hold purpose, and release authorization.",
	}
	copy.InventoryImage = "freightvanta-service-bulk-procurement-hero-v1.png"
	copy.InventoryAlt = "Industrial cargo and protected crates prepared for a bulk procurement handoff"
	copy.InventoryCaption = "THE ACTIVE REVISION, PROTECTIVE METHOD, AND RECEIVING OWNER SHOULD BE VISIBLE BEFORE THE PART IS RELEASED."

	copy.RequestKicker = "START YOUR PLAN"
	copy.RequestTitle = "Bring the active component reference. We will identify the next controlled handoff."
	copy.RequestLead = "A useful industrial-components plan can start before every engineering, supplier, or destination detail is final. Share the active reference, name the handoff that is uncertain, and leave unknowns visible. FreightVanta can use that starting point to ask practical scoping questions without presenting an unconfirmed technical or delivery outcome as settled."
	copy.RequestChecklist = []string{
		"Drawing, part reference, image, SKU, revision, or available specification.",
		"Origin in China, supplier status, expected quantity, and required ready period.",
		"Production, maintenance, project, site, consolidation, or freight-release context.",
		"Crate, carton, corrosion, cushioning, lifting, orientation, or handling requirement.",
		"Current inventory position, destination, receiving window, and known document need.",
		"The owner who can approve technical, packing, discrepancy, and release decisions.",
	}
	copy.FAQs = []publicFAQItem{
		{Question: "Can we start with a drawing, part number, image, or SKU from China?", Answer: "Yes. A drawing, part number, image, SKU, or short specification can be enough to begin a planning conversation. The working brief should identify the missing revision, quantity, packing, documents, destination, and receiving information rather than guessing it."},
		{Question: "Does this page replace engineering approval or quality inspection?", Answer: "No. Engineering approval, revision control, product quality, inspection method, testing, certification, and technical acceptance remain qualified responsibilities. This page shows how the related questions can stay visible in a logistics handoff."},
		{Question: "Can protective crates, cartons, cushioning, or corrosion instructions be coordinated?", Answer: "Approved packing and handling requirements can be organized into a working instruction. The suitable method, material, load, lifting, storage, and regulatory responsibility need confirmation for the actual part and movement."},
		{Question: "Can one component movement serve production, maintenance, and a project site?", Answer: "The same source may support more than one approved route, but each route needs its own destination, receiving context, package, document, timing, and release rule. A common part reference does not make every unit ready for every destination."},
		{Question: "Does this page promise heavy handling, site delivery, storage, or tracking?", Answer: "No. Weight and dimensions, handling equipment, warehouse acceptance, storage, carrier selection, site access, delivery timing, tracking, insurance, and country coverage depend on confirmed product and operating scope."},
		{Question: "What should we bring to an industrial-components planning conversation?", Answer: "Share the active reference and revision, China source status, quantity, destination context, packing requirement, document need, timing, current inventory position, receiving window, and the decisions that remain open. A useful plan starts with confirmed facts and makes the unknowns explicit."},
	}
	copy.RelatedTitle = "Build the next component handoff without losing the active specification."
	copy.Related = []publicIndustrySolutionRelated{
		{Title: "Product Sourcing", Body: "Turn a component reference into supplier questions and a purchase-ready next step.", Path: "product-sourcing"},
		{Title: "Bulk Procurement", Body: "Organize quantity, source inputs, packing context, and purchasing questions before the next component order moves.", Path: "services/bulk-procurement"},
		{Title: "Inventory Storage", Body: "Receive, identify, hold, and release components from a defined reference and exception instruction.", Path: "services/inventory-storage"},
		{Title: "Packaging and Branding", Body: "Coordinate packaging, labels, and presentation materials where the confirmed component route requires them.", Path: "services/packaging-branding"},
	}
	copy.FinalTitle = "Start with the active specification, the next receiving owner, and the destination it needs to serve."
	copy.FinalBody = "Share the component reference, revision, source status, quantity, destination context, packing requirement, document need, current inventory position, and next handoff. FreightVanta will respond with the practical questions needed to define an industrial-components operating scope before the work is confirmed."
	copy.CTAButton = "Request an industrial-components plan"
	return copy
}()

var timeCriticalCargoIndustry = func() publicIndustrySolutionCopy {
	copy := industrialComponentsIndustry
	copy.Slug = timeCriticalCargoIndustrySlug
	copy.NavLabel = "Time-critical cargo"
	copy.SEOTitle = "Time-Critical Cargo Logistics From China | FreightVanta"
	copy.SEODescription = "Plan time-critical cargo from China with a visible ready date, documents, routing options, escalation path, and confirmed next handoff with FreightVanta."
	copy.SEOKeywords = []string{"time-critical cargo logistics from China", "urgent freight shipping from China", "China air freight for urgent cargo", "time-sensitive supply chain coordination", "emergency replenishment logistics"}
	copy.SEOKeywordsText = "time-critical cargo logistics from China, urgent freight shipping from China, China air freight for urgent cargo, time-sensitive supply chain coordination, emergency replenishment logistics"
	copy.HeroKicker = "TIME-CRITICAL CARGO / FROM CHINA TO THE NEXT FEASIBLE HANDOFF"
	copy.HeroTitle = "Make the next feasible movement visible before the clock takes over."
	copy.HeroBody = "Urgent cargo still needs a usable product reference, ready date, document path, route choice, receiving owner, and exception decision. FreightVanta helps turn a time-sensitive request from China into a practical movement brief without presenting an unconfirmed transit promise as settled."
	copy.HeroPrimary = "Request a time-critical cargo plan"
	copy.HeroSecondary = "See the urgency workflow"
	copy.HeroImage = "guide-express-freight-v1.png"
	copy.HeroAlt = "Time-critical express freight prepared for an urgent handoff"
	copy.HeroVisualLabel = "READY DATE / NEXT MOVE"
	copy.HeroVisualTitle = "THE CLOCK IS PART OF THE BRIEF"
	copy.HeroVisualBody = "Keep the earliest feasible handoff, the open constraint, and the next owner visible."
	copy.HeroStages = []string{"REQUEST", "READY", "DOCS", "ROUTE", "RECEIVE"}

	copy.DecisionKicker = "THE OPERATING DECISION"
	copy.DecisionTitle = "Urgency is not a route. It is a set of decisions that must stay visible."
	copy.Decision = []string{
		"A shipment becomes time-critical when a missed handoff affects a launch, production line, customer promise, repair, replenishment, or project milestone. The pressure can make teams jump directly to a carrier or a quoted transit time while the product reference, ready date, documents, dimensions, destination, receiving window, and exception owner are still uncertain.",
		"FreightVanta helps organize the decisions that make an urgent movement workable. The plan distinguishes what is known, what can be prepared now, what route alternatives need checking, and which timing or compliance outcome requires confirmation. It does not turn an urgent request into a guaranteed transit, customs release, carrier capacity, or delivery result.",
	}
	copy.Evidence = []string{
		"The actual ready date, latest useful arrival, destination, and business consequence remain on the same brief.",
		"Product, carton, weight, dimensions, document, and receiving information are visible before route options are compared.",
		"Air, express, ocean, rail, consolidation, and split-shipment alternatives are treated as options to confirm, not automatic promises.",
		"Escalation owner, cutoff question, exception path, and next update remain visible when the plan changes.",
	}

	copy.WorkflowKicker = "URGENCY WORKFLOW"
	copy.WorkflowTitle = "One decision path for cargo that cannot wait for a normal handoff."
	copy.WorkflowLead = "Start with the consequence of missing the date. Keep the physical, document, routing, and receiving constraints together while the next feasible movement is checked."
	copy.Workflow = []publicServiceTopicStep{
		{Marker: "01", Title: "State the business deadline", Body: "Record the needed arrival window, the event or operation it protects, the destination, and what happens if the first feasible movement is missed."},
		{Marker: "02", Title: "Confirm cargo readiness", Body: "Capture the product reference, quantity, package count, weight, dimensions, dangerous-goods question, supplier status, and earliest handover date from China."},
		{Marker: "03", Title: "Prepare the document path", Body: "Collect the commercial invoice, packing details, product description, destination information, and any document or compliance question that could hold the next checkpoint."},
		{Marker: "04", Title: "Compare route options", Body: "Make air, express, ocean, rail, consolidation, split, or hold options comparable by readiness, cutoff, destination, cost question, and known constraint."},
		{Marker: "05", Title: "Name the escalation path", Body: "Set the owner for a missing document, capacity question, supplier delay, customs issue, destination change, or receiving-window exception."},
		{Marker: "06", Title: "Release the confirmed movement", Body: "Pass the approved cargo, documents, route, destination, timing assumption, and exception instruction to the next confirmed carrier or receiving handoff."},
	}

	copy.ChannelsKicker = "TIME-CRITICAL CONTEXTS"
	copy.ChannelsTitle = "The right response depends on what the missed date would affect."
	copy.ChannelsLead = "An urgent shipment for a production line is not the same operating conversation as a customer replacement or a project-site part. Name the consequence first so the route and escalation question can be scoped correctly."
	copy.Channels = []publicIndustrySolutionChannel{
		{Label: "PRODUCTION / REPLENISHMENT", Title: "Protect the next operating window, not just the departure date.", Body: "A line-side shortage or delayed replenishment may depend on the approved part, usable quantity, split-shipment option, receiving window, and the person who can approve an alternate route or partial release."},
		{Label: "CUSTOMER / REPLACEMENT", Title: "The customer promise needs a realistic next update.", Body: "A replacement or urgent order needs the correct product, destination, contact, delivery constraint, and communication owner. Record what can be confirmed now instead of turning a requested date into a guarantee."},
		{Label: "PROJECT / SITE MILESTONE", Title: "A site date adds access and handoff questions.", Body: "Project cargo can depend on site access, appointment, lifting or unloading, documents, packaging, and an owner for a missed-window decision. Keep site readiness separate from carrier transit assumptions."},
	}

	copy.ScopeKicker = "OPERATING CONTROLS"
	copy.ScopeTitle = "Move quickly by making the constraint explicit. Confirm capacity, compliance, and timing before promising the result."
	copy.ScopeLead = "Time-critical planning combines a business deadline with physical cargo, documentation, routing, carrier, customs, destination, and communication decisions. The working brief keeps those decisions together while clearly separating coordination from outcomes that require confirmation."
	copy.Included = []publicServiceTopicScope{
		{Title: "Deadline and consequence brief", Body: "Record the required arrival window, affected operation, destination, and decision that follows if the first option cannot be used."},
		{Title: "Ready-date and cargo capture", Body: "Organize product, quantity, package, weight, dimensions, supplier status, and earliest handover information from China."},
		{Title: "Document-readiness path", Body: "Keep invoice, packing, product, destination, and open compliance questions visible before a route is treated as ready."},
		{Title: "Option comparison", Body: "Set air, express, ocean, rail, consolidation, split, or defer options beside the constraints that affect each one."},
		{Title: "Escalation ownership", Body: "Name the owner for missing information, supplier delay, capacity question, customs hold, destination change, or receiving exception."},
		{Title: "Confirmed next handoff", Body: "Prepare the approved cargo, route, documents, destination, timing assumption, and exception instructions for the next owner."},
	}
	copy.Confirm = []publicServiceTopicScope{
		{Title: "Transit and delivery outcomes", Body: "Carrier capacity, cutoff, transit time, delivery date, tracking, service level, and destination coverage require confirmation for the actual movement."},
		{Title: "Customs and regulated cargo", Body: "Classification, export controls, dangerous goods, permits, taxes, importer-of-record, customs release, and destination rules need qualified confirmation."},
		{Title: "Rates and commercial terms", Body: "Freight rate, surcharge, fuel, peak fee, insurance, storage, demurrage, cancellation, and split-shipment cost depend on approved scope."},
		{Title: "Handling and site capability", Body: "Weight, dimensions, special handling, warehouse acceptance, lifting, appointment, site access, and unloading capability must be confirmed."},
	}

	copy.InventoryKicker = "CARGO CONTEXT AT THE NEXT HANDOFF"
	copy.InventoryTitle = "A shipment is not urgent because the email says urgent; it needs a ready date, a route question, and an owner."
	copy.InventoryLead = "The next team should not have to reconstruct the deadline from a message thread. A concise record shows which cargo is moving, when it can be handed over, where it needs to go, what documents exist, which route is being checked, and who decides when a constraint changes. That record lets a time-sensitive movement progress without hiding uncertainty behind a countdown."
	copy.InventoryChecklist = []string{
		"Business consequence, required arrival window, destination, receiving contact, and latest useful handoff.",
		"Product reference, quantity, package count, weight, dimensions, value, and earliest ready date in China.",
		"Commercial invoice, packing details, product description, permits, dangerous-goods question, and missing documents.",
		"Route options under consideration, cutoff question, known carrier or broker, and the assumption each option depends on.",
		"Escalation owner, next update point, exception rule, and release authorization when the plan changes.",
	}
	copy.InventoryImage = "global-us-freight-hero-v1.png"
	copy.InventoryAlt = "Urgent freight staged for an airport or express handoff"
	copy.InventoryCaption = "THE READY DATE, OPEN CONSTRAINT, NEXT ROUTE QUESTION, AND ESCALATION OWNER SHOULD BE VISIBLE TOGETHER."

	copy.RequestKicker = "START YOUR PLAN"
	copy.RequestTitle = "Bring the deadline and the cargo facts. We will identify the next feasible handoff."
	copy.RequestLead = "A useful time-critical plan can start before every route, rate, and document is final. Share the business consequence, current cargo reality, and the constraint that is blocking confidence. FreightVanta can use that starting point to ask focused scoping questions without presenting an unconfirmed arrival outcome as settled."
	copy.RequestChecklist = []string{
		"Required arrival window, destination, receiving contact, and the operation or customer promise at risk.",
		"Product reference, quantity, package count, weight, dimensions, and earliest ready date in China.",
		"Supplier status, current document set, dangerous-goods or permit question, and missing information.",
		"Route already considered, carrier or broker contact, cutoff concern, and acceptable alternative.",
		"Current inventory position, split-shipment or partial-release question, and next decision owner.",
		"Escalation contact who can approve timing, cost, route, compliance, and receiving changes.",
	}
	copy.FAQs = []publicFAQItem{
		{Question: "Can we start with an urgent request and only partial cargo information?", Answer: "Yes. A deadline, destination, product reference, approximate quantity, and current ready-date information can begin the conversation. The plan should identify missing package, document, compliance, route, and receiving details instead of guessing them."},
		{Question: "Does a time-critical plan guarantee a transit time or delivery date?", Answer: "No. Capacity, cutoff, carrier, customs, handling, destination, and receiving conditions must be confirmed for the actual shipment. The page makes the timing question visible; it does not replace a confirmed service scope."},
		{Question: "Can you compare express, air freight, ocean, rail, or a split shipment?", Answer: "Those options can be organized for comparison when the cargo facts and destination are available. Feasibility, rate, cutoff, transit, tracking, and delivery outcome remain subject to the relevant carrier, broker, authority, and destination confirmation."},
		{Question: "Can urgent cargo be sourced or prepared from China?", Answer: "The source, supplier readiness, product version, quantity, packaging, documents, and next movement can be coordinated as one brief. Supplier production, inspection, product acceptance, and route availability require confirmation."},
		{Question: "What happens when the first route cannot meet the needed window?", Answer: "The brief should already name the next decision owner, acceptable alternative, partial-release or split question, communication point, and exception rule. That makes the change actionable without promising that every alternative is available."},
		{Question: "What should we bring to a time-critical cargo planning conversation?", Answer: "Share the deadline and consequence, destination, product and package facts, China ready date, documents, route already considered, known constraint, receiving contact, and the person who can approve a timing or cost change."},
	}
	copy.RelatedTitle = "Build the urgent movement from the decision that matters next."
	copy.Related = []publicIndustrySolutionRelated{
		{Title: "Product Sourcing", Body: "Turn a product reference into supplier questions and a purchase-ready next step.", Path: "product-sourcing"},
		{Title: "Bulk Procurement", Body: "Organize quantity, supplier readiness, packing context, and the next purchasing decision.", Path: "services/bulk-procurement"},
		{Title: "Inventory Storage", Body: "Receive, identify, hold, and release urgent stock from a defined exception instruction.", Path: "services/inventory-storage"},
		{Title: "Worldwide Fulfillment", Body: "Prepare customer orders from available inventory with clear packing and escalation rules.", Path: "services/worldwide-fulfillment"},
	}
	copy.FinalTitle = "Start with the deadline, the cargo facts, and the next decision owner."
	copy.FinalBody = "Share the required arrival window, business consequence, product reference, ready date in China, package facts, documents, destination, route question, current inventory position, and escalation owner. FreightVanta will respond with the practical questions needed to define a time-critical cargo scope before the work is confirmed."
	copy.CTAButton = "Request a time-critical cargo plan"
	return copy
}()

func industrySolutionCopyForSlug(slug string) (publicIndustrySolutionCopy, bool) {
	switch slug {
	case crossBorderEcommerceIndustrySlug:
		return crossBorderEcommerceIndustry, true
	case consumerGoodsIndustrySlug:
		return consumerGoodsIndustry, true
	case industrialComponentsIndustry.Slug:
		return industrialComponentsIndustry, true
	case timeCriticalCargoIndustry.Slug:
		return timeCriticalCargoIndustry, true
	default:
		return publicIndustrySolutionCopy{}, false
	}
}

func (s *server) configureIndustrySolutionPage(data *publicSitePageData, site catalog.Site, preview bool, solution publicIndustrySolutionCopy) {
	solution = localizedIndustrySolutionCopy(solution, data.LanguageCode)
	copy := solution
	copy.Related = append([]publicIndustrySolutionRelated(nil), copy.Related...)
	for index := range copy.Related {
		copy.Related[index].Path = publicURL(data.BasePath, "", copy.Related[index].Path)
	}
	data.IsHome = false
	data.IsIndustrySolution = true
	data.NotFound = false
	data.HasContent = false
	data.Content = publicContentData{}
	data.IndustrySolution = copy
	data.PageTitle = copy.SEOTitle
	data.MetaDescription = copy.SEODescription
	data.OGTitle = copy.SEOTitle
	data.OGDescription = copy.SEODescription
	data.SocialImageURL = publicSchemaAbsoluteURL(publicSchemaURL(*data), "/assets/images/"+copy.HeroImage)
	data.RobotsIndex = true
	// The localized industry versions are not live. Do not advertise this
	// English page as a translation that does not exist.
	data.Hreflangs = nil
	if preview {
		data.CanonicalURL = ""
	}
	data.StructuredData = template.JS(publicJSONLD(*data, site))
}
