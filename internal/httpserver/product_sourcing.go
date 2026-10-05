package httpserver

import (
	"html/template"
	"net/http"

	"czcms/internal/catalog"
)

const productSourcingSlug = "product-sourcing"

type publicProductSourcingCopy struct {
	SEOTitle, SEODescription, SEOKeywordsText               string
	SEOKeywords                                             []string
	HeroKicker, HeroTitle, HeroBody                         string
	HeroPrimary, HeroSecondary                              string
	HeroStages                                              []publicProductSourcingStage
	FitKicker, FitTitle, FitBody                            string
	Situations                                              []publicProductSourcingSituation
	ProcessKicker, ProcessTitle, ProcessBody                string
	ProcessSteps                                            []publicProductSourcingStep
	ChinaKicker, ChinaTitle, ChinaBody                      string
	ChinaPoints                                             []string
	RequirementsKicker, RequirementsTitle, RequirementsBody string
	Requirements                                            []string
	ComparisonTitle, ComparisonBody                         string
	ComparisonRows                                          []string
	CheckpointsTitle, CheckpointsBody                       string
	Checkpoints                                             []publicProductSourcingCheckpoint
	ScopeRows                                               []publicProductSourcingScopeRow
	DeliverablesTitle, DeliverablesBody                     string
	Deliverables                                            []string
	FAQKicker, FAQTitle, FAQBody                            string
	FAQs                                                    []publicFAQItem
	ContactKicker, ContactTitle, ContactBody, ContactButton string
}

type publicProductSourcingStage struct {
	Label string
	Title string
}

type publicProductSourcingSituation struct {
	Label string
	Title string
	Body  string
}

type publicProductSourcingStep struct {
	Marker string
	Title  string
	Body   string
}

type publicProductSourcingCheckpoint struct {
	Tag  string
	Body string
}

type publicProductSourcingScopeRow struct {
	Topic    string
	Organize string
	Confirm  string
}

var productSourcingCopies = map[string]publicProductSourcingCopy{
	"en": {
		SEOTitle:        "Product Sourcing from China for Businesses | FreightVanta",
		SEODescription:  "Coordinate product sourcing from China with a supplier-ready brief, comparable responses, sample checkpoints, and an approved handoff for your destination market.",
		SEOKeywords:     []string{"product sourcing from China", "China sourcing agent", "source products from China", "supplier sourcing in China", "China product sourcing service"},
		SEOKeywordsText: "product sourcing from China, China sourcing agent, source products from China, supplier sourcing in China, China product sourcing service",
		HeroKicker:      "PRODUCT SOURCING FROM CHINA",
		HeroTitle:       "Product sourcing from China, organized for your next business decision.",
		HeroBody:        "Start with a product link, reference image, specification, or target quantity. FreightVanta helps structure sourcing from China into a supplier-ready brief: what the product needs to be, what a China supplier needs to confirm, which samples or comparison points matter, and how approved details move to the next operational handoff.",
		HeroPrimary:     "Request a sourcing plan",
		HeroSecondary:   "See the workflow",
		HeroStages:      []publicProductSourcingStage{{"01 / CHINA REFERENCE", "A concrete sourcing starting point"}, {"02 / BRIEF", "A readable supplier request"}, {"03 / COMPARE", "Responses in the same frame"}, {"04 / HANDOFF", "Approved details ready to move"}},
		FitKicker:       "WHEN IT FITS",
		FitTitle:        "Source products from China with a requirement that can be checked.",
		FitBody:         "Use this service when the product opportunity is visible, but China supplier, packaging, destination-market, or specification information still needs a practical structure before a purchasing decision.",
		Situations: []publicProductSourcingSituation{
			{"CHINA REFERENCE", "You have a China product or supplier reference, but not a supplier-ready brief.", "A marketplace link, manufacturer page, product image, competitor reference, or early specification becomes concrete questions about material, size, finish, quantity, packaging, and destination."},
			{"COMPARE", "You want to compare China supplier responses before committing.", "Supplier feedback is read against the same questions, so differences, missing information, and sample requirements remain visible to the buyer."},
			{"HANDOFF", "The next operation depends on stable product details from China.", "Sampling, packaging, inspection, storage, freight, and fulfillment are easier to plan once the approved product state is clearly recorded."},
		},
		ProcessKicker: "THE WORKFLOW",
		ProcessTitle:  "Move a China sourcing decision forward without losing its context.",
		ProcessBody:   "Each stage keeps confirmed information, open questions, and ownership in the same working thread. Purchasing approval remains with your team.",
		ProcessSteps: []publicProductSourcingStep{
			{"01", "Share the China sourcing reference", "Bring together product links, China supplier or factory details where available, images, specifications, quantity, destination, and the result you need."},
			{"02", "Build the supplier brief", "Turn attributes, variants, packaging, target market, timing, and decision criteria into a workable request for a supplier in China."},
			{"03", "Compare the answers", "Connect each China supplier response to the question it actually answers, rather than relying on scattered messages."},
			{"04", "Review samples or evidence", "Use photos, videos, samples, and supplier statements as inputs for your team’s approval; acceptance standards need a separately confirmed scope."},
			{"05", "Prepare the handoff", "Document approved product details, quantities, packaging needs, origin information, and next-owner instructions for the purchasing, freight, storage, or fulfillment scope you confirm."},
		},
		ChinaKicker:        "SOURCE PRODUCTS FROM CHINA",
		ChinaTitle:         "Give China supplier sourcing one shared brief.",
		ChinaBody:          "A sourcing conversation is more useful when the product reference, supplier questions, intended market, and approval record stay connected. The goal is a decision-ready brief, not an implied promise about supplier, price, quality, compliance, or delivery.",
		ChinaPoints:        []string{"China supplier reference: a product link, manufacturer page, marketplace listing, or factory contact when available", "Product and commercial context: materials, variants, target quantity, packaging, destination market, and non-negotiable constraints", "Comparable communication: questions, replies, sample evidence, and open decisions in one working comparison", "A planned China handoff: approved details ready for the purchasing, freight, storage, or fulfillment scope your team confirms"},
		RequirementsKicker: "WHAT TO SHARE",
		RequirementsTitle:  "A useful China sourcing reference and an intended outcome are enough to begin.",
		RequirementsBody:   "You do not need every answer in the first message. These details turn an early conversation about sourcing products from China into a brief another owner can use.",
		Requirements:       []string{"Product link, image, drawing, or specification", "China supplier, factory, or marketplace link if you already have one", "Target quantity and expected reorder pattern", "Destination market and intended sales channel", "Material, finish, color, dimensions, variants, and packaging expectations", "Target date and non-negotiable constraints"},
		ComparisonTitle:    "Compare what each supplier answered, not just the number on a quotation.",
		ComparisonBody:     "A useful comparison keeps product version, quantity basis, packaging assumption, sample status, commercial term, and unresolved question in the same view. That helps a buyer see whether two responses are genuinely comparable or whether a lower-looking figure is based on a different product, quantity, packout, or delivery assumption.",
		ComparisonRows:     []string{"Product reference and active revision", "Material, dimensions, finish, color, and variant details", "Quantity basis, carton or unit packing, and expected reorder context", "Sample, image, drawing, or written evidence available", "Packaging, labels, inserts, and supplier-material treatment", "Destination-market question and next handoff", "Open decision, responsible owner, and approval status"},
		CheckpointsTitle:   "Use samples and evidence to make the next question specific.",
		CheckpointsBody:    "Samples, photos, videos, measurements, and supplier statements can support an internal review, but they only answer the questions they actually evidence. A sample does not by itself guarantee a production run, regulatory result, or future batch. The sourcing record should show what was reviewed, what was accepted, what remains open, and whether a separate inspection or testing scope is required.",
		Checkpoints: []publicProductSourcingCheckpoint{
			{Tag: "SPECIFICATION", Body: "Compare the approved attributes, dimensions, materials, finish, and variants."},
			{Tag: "EVIDENCE", Body: "Link photos, videos, sample notes, drawings, or supplier statements to the relevant question."},
			{Tag: "APPROVAL", Body: "Record who accepted the product state and which assumptions remain open."},
			{Tag: "CHANGE CONTROL", Body: "Give a revised product, component, packaging, or supplier response a new review point."},
		},
		ScopeRows: []publicProductSourcingScopeRow{
			{Topic: "Product brief", Organize: "Organize product reference, specification, variants, quantity, and open questions.", Confirm: "—"},
			{Topic: "Supplier questions", Organize: "Coordinate comparable questions and record responses from known or identified suppliers.", Confirm: "—"},
			{Topic: "Sample coordination", Organize: "Organize sample requests and review notes where the scope includes them.", Confirm: "Sample fees, testing standard, and acceptance criteria."},
			{Topic: "Quality work", Organize: "Carry agreed evidence and checkpoints into the record.", Confirm: "Inspection, factory audit, testing, and quality guarantee."},
			{Topic: "Commercial result", Organize: "Make assumptions and terms easier to compare.", Confirm: "Final price, discount, MOQ, payment, contract, and savings."},
			{Topic: "Compliance", Organize: "Identify market or product questions that need review.", Confirm: "Certification, legal labeling, customs, product safety, and regulatory advice."},
			{Topic: "Handoff", Organize: "Prepare approved information for confirmed packaging, storage, freight, or fulfillment.", Confirm: "Warehouse, carrier, delivery time, and coverage."},
		},
		DeliverablesTitle: "The deliverable is a decision-ready sourcing record.",
		DeliverablesBody:  "The useful result is not a long list of unfiltered supplier links. It is a working record another person can understand and use: the product reference, current brief, supplier questions and replies, sample or evidence notes, unresolved issues, approval owner, packaging context, quantity assumptions, and the next confirmed handoff.",
		Deliverables:      []string{"Supplier-ready product brief", "Comparable question and response matrix", "Sample and evidence review notes when included in the confirmed scope", "Open-question and decision log", "Approved product, variant, and packaging snapshot", "Handoff notes for bulk procurement, packaging, storage, freight, or fulfillment"},
		FAQKicker:         "BEFORE THE FIRST CHINA SUPPLIER CONVERSATION",
		FAQTitle:          "Questions worth answering early.",
		FAQBody:           "Sourcing coordinates information, comparisons, and approvals. Quality, price, factory, and compliance commitments need an explicitly confirmed scope.",
		FAQs: []publicFAQItem{
			{"Can you help us source products from China?", "Yes. FreightVanta can structure the product brief, coordinate questions for suppliers in China, organize comparable responses, and prepare the approved handoff. Supplier selection, quality control, price, compliance, and acceptance standards require a separately confirmed scope."},
			{"Can we start with only a product link?", "Yes. A link, image, or short description is enough to open the first conversation. Missing China sourcing information is captured as an open question."},
			{"Is a China supplier or product quality guaranteed?", "No. Quality control, factory audits, price, compliance, and product acceptance must be included in a separately confirmed service scope."},
			{"Can China sourcing continue into fulfillment?", "Yes. Once product, packaging, quantity, origin, and destination are approved, the handoff can be prepared for storage, freight, and fulfillment planning."},
		},
		ContactKicker: "START THE CONVERSATION",
		ContactTitle:  "Begin with the product, the China sourcing handoff, and the outcome you need.",
		ContactBody:   "Share the product, quantity, China supplier reference if known, destination, timing, and the point where your process needs support. We will begin with the practical questions that define the scope.",
		ContactButton: "Request a sourcing plan",
	},
	"de": {
		SEOTitle:        "Produkte aus China beschaffen | FreightVanta",
		SEODescription:  "Produkte aus China beschaffen: Lieferantenanfragen, vergleichbare Antworten, Musterpunkte und die Übergabe für Ihren Zielmarkt klar koordinieren.",
		SEOKeywords:     []string{"Produkte aus China beschaffen", "China Sourcing", "Lieferanten in China finden", "Beschaffung aus China", "Einkauf in China"},
		SEOKeywordsText: "Produkte aus China beschaffen, China Sourcing, Lieferanten in China finden, Beschaffung aus China, Einkauf in China",
		HeroKicker:      "PRODUKTBESCHAFFUNG AUS CHINA",
		HeroTitle:       "Produkte aus China beschaffen – mit einem klaren Brief für den nächsten Einkauf.",
		HeroBody:        "Ein Link, ein Referenzbild, eine Skizze oder eine Zielmenge genügt für den Start. FreightVanta strukturiert die Beschaffung aus China in einen lieferantenfähigen Brief: Produkteigenschaften, Rückfragen an Lieferanten in China, Muster, Vergleichspunkte und die Übergabe für Ihren Zielmarkt.",
		HeroPrimary:     "Beschaffungsplan anfragen",
		HeroSecondary:   "Ablauf ansehen",
		HeroStages:      []publicProductSourcingStage{{"01 / CHINA-REFERENZ", "Konkreter Ausgangspunkt"}, {"02 / ANFORDERUNG", "Lieferantenfähiger Brief"}, {"03 / VERGLEICH", "Antworten nach denselben Kriterien"}, {"04 / ÜBERGABE", "Freigegebene Details weitergeben"}},
		FitKicker:       "WANN ES PASST",
		FitTitle:        "Beschaffung aus China beginnt mit einer überprüfbaren Anforderung.",
		FitBody:         "Wenn Produkt-, Verpackungs-, Lieferanten- und Zielmarktinformationen für Deutschland oder einen anderen Zielmarkt verstreut sind, sollte der nächste Einkaufsschritt nicht auf Annahmen beruhen.",
		Situations: []publicProductSourcingSituation{
			{"CHINA-REFERENZ PRÄZISIEREN", "Sie haben eine Produkt- oder Lieferantenreferenz aus China, aber noch keinen lieferantenfähigen Brief.", "Aus Link, Foto, Marktplatzangebot, Herstellerseite oder grober Spezifikation werden konkrete Fragen zu Material, Größe, Ausführung, Menge, Verpackung und Zielmarkt."},
			{"OPTIONEN VERGLEICHEN", "Sie möchten Antworten von Lieferanten in China vergleichen, bevor Sie sich festlegen.", "Rückmeldungen werden entlang derselben Kriterien lesbar gemacht, damit Unterschiede, Musterpunkte und offene Fragen sichtbar bleiben."},
			{"ÜBERGABE VORBEREITEN", "Der nächste Prozess hängt von belastbaren Produktdetails aus China ab.", "Muster, Verpackung, Prüfung, Lagerung und Versand können erst sauber geplant werden, wenn der Produktstand eindeutig dokumentiert ist."},
		},
		ProcessKicker: "ABLAUF",
		ProcessTitle:  "Ein klarer Ablauf für Beschaffungsentscheidungen aus China.",
		ProcessBody:   "Die Reihenfolge bleibt bewusst einfach: Informationen erfassen, mit Lieferanten in China abgleichen, intern freigeben und mit einem sauberen Übergabestand weiterarbeiten.",
		ProcessSteps: []publicProductSourcingStep{
			{"01", "China-Referenz teilen", "Produktlinks, Bilder, Spezifikationen, bekannte Lieferanten oder Hersteller in China, Mengen, Zielmarkt und gewünschtes Ergebnis erfassen."},
			{"02", "Anforderung strukturieren", "Produktattribute, Varianten, Verpackung, Zielmarkt und Entscheidungskriterien in eine arbeitsfähige Anfrage für einen Lieferanten in China überführen."},
			{"03", "Antworten vergleichbar machen", "Lieferanteninformationen nach den Fragen sortieren, die sie tatsächlich beantworten – nicht nach ihrem Eingang."},
			{"04", "Muster oder Nachweise prüfen", "Fotos, Videos, Muster und Lieferantenangaben dienen Ihrer Freigabe. Prüfmethoden und Annahmekriterien gehören in einen bestätigten Leistungsumfang."},
			{"05", "Nächsten Eigentümer vorbereiten", "Freigegebene Details, Mengen, Verpackungsanforderungen und Ursprungsinformationen an die nächste verantwortliche Stelle übergeben."},
		},
		ChinaKicker:        "CHINA SOURCING",
		ChinaTitle:         "Lieferanten in China mit einem gemeinsamen Brief ansprechen.",
		ChinaBody:          "Beim Einkauf in China wird die Anfrage belastbarer, wenn Produktreferenz, Lieferantenfragen, Zielmarkt und Freigabestand zusammenbleiben. Die Seite verspricht keine Lieferantenauswahl, Preise, Qualität, Konformität oder Lieferzeit; diese Punkte benötigen eine ausdrücklich bestätigte Prüfung oder Leistung.",
		ChinaPoints:        []string{"China-Referenz: Produktlink, Herstellerseite, Marktplatzangebot oder bekannter Lieferantenkontakt", "Produkt- und Einkaufskontext: Material, Varianten, Zielmenge, Verpackung, Zielmarkt und nicht verhandelbare Vorgaben", "Vergleichbare Kommunikation: Rückfragen, Antworten, Musternachweise und offene Entscheidungen in einer Arbeitsgrundlage", "Übergabe aus China: freigegebene Details für den bestätigten Einkauf-, Versand-, Lager- oder Fulfillment-Schritt"},
		RequirementsKicker: "WAS WIR BENÖTIGEN",
		RequirementsTitle:  "Eine brauchbare China-Referenz und das gewünschte Ergebnis reichen für den Anfang.",
		RequirementsBody:   "Ein perfektes Dokument ist nicht nötig. Diese Angaben helfen, die erste Beschaffungsanfrage aus China in einen belastbaren Produktbrief zu übersetzen.",
		Requirements:       []string{"Produktlink, Bild, Zeichnung oder Spezifikation", "Bekannter Lieferant, Hersteller oder Marktplatzlink in China, falls vorhanden", "Zielmenge und erwartetes Nachbestellmuster", "Zielmarkt und geplanter Vertriebskanal", "Material, Ausführung, Farbe, Maße, Varianten und Verpackungsvorgaben", "Gewünschter Bereitstellungstermin und Fixpunkte"},
		FAQKicker:          "VOR DEM ERSTEN GESPRÄCH MIT EINEM LIEFERANTEN IN CHINA",
		FAQTitle:           "Fragen, die früh Klarheit schaffen.",
		FAQBody:            "Die Beschaffung aus China koordiniert Informationen und Entscheidungen. Zusagen zu Qualität, Preis, Werk, Prüfung oder Konformität gehören erst in einen bestätigten Leistungsumfang.",
		FAQs: []publicFAQItem{
			{"Unterstützt FreightVanta beim Beschaffen von Produkten aus China?", "Ja. FreightVanta kann Produktbrief, Rückfragen an Lieferanten in China, vergleichbare Antworten und die freigegebene Übergabe strukturieren. Lieferantenauswahl, Qualitätsprüfung, Preise, Konformität und Annahmestandards müssen separat bestätigt werden."},
			{"Reicht ein Produktlink für den Anfang?", "Ja. Ein Link, Bild oder eine kurze Beschreibung reicht für das erste Gespräch. Fehlende Informationen zur Beschaffung aus China werden als offene Fragen notiert."},
			{"Wird ein Lieferant in China oder die Produktqualität garantiert?", "Nein. Qualitätsprüfung, Werksaudit, Preise, Konformität und Annahmekriterien müssen ausdrücklich bestätigt werden."},
			{"Kann die Beschaffung aus China an Fulfillment anschließen?", "Ja. Nach der Freigabe von Produkt, Verpackung, Menge, Ursprung und Zielmarkt kann die Übergabe an Lagerung, Versand und Fulfillment vorbereitet werden."},
		},
		ContactKicker: "ANFRAGE VORBEREITEN",
		ContactTitle:  "Starten Sie mit dem Produkt, der China-Beschaffung und dem gewünschten Ergebnis.",
		ContactBody:   "Teilen Sie Produkt, Menge, bekannten Lieferanten in China, Zielmarkt, Termin und die Stelle im Prozess, an der Unterstützung benötigt wird. Wir beginnen mit den praktischen Rückfragen zur Eingrenzung des Umfangs.",
		ContactButton: "Beschaffungsplan anfragen",
	},
	"fr": {
		SEOTitle:        "Sourcing en Chine pour entreprises | FreightVanta",
		SEODescription:  "Coordonnez votre sourcing en Chine avec un brief fournisseur, des réponses comparables, des points d'échantillonnage et une remise préparée pour le marché français.",
		SEOKeywords:     []string{"sourcing en Chine", "acheter en Chine pour entreprise", "trouver un fournisseur en Chine", "approvisionnement Chine", "sourcing produits Chine"},
		SEOKeywordsText: "sourcing en Chine, acheter en Chine pour entreprise, trouver un fournisseur en Chine, approvisionnement Chine, sourcing produits Chine",
		HeroKicker:      "SOURCING PRODUIT EN CHINE",
		HeroTitle:       "Sourcing en Chine : un brief clair avant la prochaine décision d'achat.",
		HeroBody:        "Un lien, une image de référence, une spécification ou une quantité cible suffit pour ouvrir une conversation structurée. FreightVanta organise le sourcing produits en Chine : produit attendu, questions à poser au fournisseur chinois, échantillons utiles, réponses comparables et relais opérationnel vers votre marché français.",
		HeroPrimary:     "Demander un plan de sourcing",
		HeroSecondary:   "Voir le parcours",
		HeroStages:      []publicProductSourcingStage{{"RÉFÉRENCE CHINE", "Un point de départ concret"}, {"BRIEF", "Une demande lisible"}, {"COMPARAISON", "Des réponses dans le même cadre"}, {"RELAIS", "Des détails prêts à transmettre"}},
		FitKicker:       "QUAND COMMENCER",
		FitTitle:        "Le sourcing en Chine devient utile quand l'exigence produit reste à clarifier.",
		FitBody:         "Le service convient lorsqu'une opportunité est identifiable, mais que les informations produit, packaging, fournisseur chinois ou marché de destination restent dispersées, incomplètes ou difficiles à comparer.",
		Situations: []publicProductSourcingSituation{
			{"RÉFÉRENCE CHINE", "Une référence ou un fournisseur chinois existe, sans brief exploitable.", "Un lien produit, une photo, une page fabricant, une annonce de marketplace ou une première spécification devient une série de questions sur les matières, les dimensions, les finitions, les quantités, le packaging et le marché français."},
			{"COMPARAISON", "Plusieurs réponses de fournisseurs en Chine doivent être comparées avant de s'engager.", "Les réponses sont regroupées selon les mêmes critères afin que les écarts, les preuves d'échantillon et les informations manquantes restent visibles lors de la décision."},
			{"RELAIS", "Les étapes suivantes dépendent d'un détail produit stable depuis la Chine.", "Échantillonnage, packaging, contrôle, fret, stockage et fulfillment demandent un produit clairement défini avant de pouvoir être préparés."},
		},
		ProcessKicker: "LE PARCOURS",
		ProcessTitle:  "Un parcours de sourcing en Chine où chaque décision reste attachée au produit.",
		ProcessBody:   "Les questions ouvertes restent apparentes jusqu'à réponse. La validation reste entre les mains de l'équipe qui porte la décision d'achat.",
		ProcessSteps: []publicProductSourcingStep{
			{"01", "Partager la référence Chine", "Liens produits, images, spécifications, fournisseur ou fabricant chinois connu, quantité, marché de destination et résultat attendu sont réunis."},
			{"02", "Construire le brief fournisseur", "Attributs, variantes, packaging, marché français, calendrier et critères de décision deviennent une demande lisible pour un fournisseur en Chine."},
			{"03", "Rendre les réponses comparables", "Chaque réponse est reliée à la question qu'elle traite afin de ne pas masquer les écarts dans les échanges fournisseur."},
			{"04", "Examiner les preuves ou échantillons", "Photos, vidéos, échantillons physiques et déclarations fournisseur alimentent la validation de votre équipe ; les critères d'acceptation demandent un périmètre confirmé."},
			{"05", "Préparer le relais suivant", "Les détails approuvés, les quantités, le packaging et les informations d'origine sont documentés pour l'opération confirmée ensuite."},
		},
		ChinaKicker:        "SOURCING PRODUITS CHINE",
		ChinaTitle:         "Conserver la référence, le fournisseur chinois et l'approbation dans le même brief.",
		ChinaBody:          "Acheter en Chine pour une entreprise devient plus lisible lorsque la référence produit, les questions fournisseur, le marché visé et les décisions restent liés. Cette coordination ne promet pas le fournisseur, le prix, la qualité, la conformité ou le délai : ces éléments exigent une vérification ou un périmètre explicitement confirmé.",
		ChinaPoints:        []string{"Référence Chine : lien produit, page fabricant, annonce marketplace ou contact fournisseur déjà identifié", "Contexte produit et commercial : matières, variantes, quantité cible, packaging, marché de destination et contraintes", "Échanges comparables : questions, réponses, preuves d'échantillon et décisions ouvertes dans un même cadre", "Relais depuis la Chine : détails approuvés prêts pour l'achat, le fret, le stockage ou le fulfillment que votre équipe confirme"},
		RequirementsKicker: "POUR COMMENCER",
		RequirementsTitle:  "Une référence Chine utile et l'objectif visé suffisent pour ouvrir le travail.",
		RequirementsBody:   "Il n'est pas nécessaire de connaître toutes les réponses dès le premier échange. Ces informations aident à transformer une première demande de sourcing en Chine en brief utilisable.",
		Requirements:       []string{"Lien produit, image, plan ou spécification", "Fournisseur, fabricant ou annonce marketplace en Chine, si déjà identifié", "Quantité visée et rythme de réassort", "Marché de destination et canal de vente", "Matière, finition, couleur, dimensions, variantes et attentes packaging", "Date cible et contraintes non négociables"},
		FAQKicker:          "AVANT LE PREMIER ÉCHANGE AVEC UN FOURNISSEUR EN CHINE",
		FAQTitle:           "Questions à éclaircir tôt.",
		FAQBody:            "Le sourcing en Chine coordonne informations et validations. Les engagements de qualité, prix, usine, conformité ou contrôle doivent être confirmés séparément.",
		FAQs: []publicFAQItem{
			{"FreightVanta peut-il aider au sourcing de produits en Chine ?", "Oui. FreightVanta peut structurer le brief produit, les questions aux fournisseurs en Chine, les réponses comparables et le relais approuvé. Le choix du fournisseur, le contrôle qualité, les prix, la conformité et les critères d'acceptation nécessitent un périmètre séparément confirmé."},
			{"Peut-on commencer avec un simple lien produit ?", "Oui. Un lien, une image ou une courte description permet de démarrer. Les informations manquantes pour le sourcing en Chine deviennent des questions pratiques."},
			{"La qualité ou le fournisseur chinois sont-ils garantis ?", "Non. Le contrôle qualité, les audits, les prix, la conformité et les critères d'acceptation doivent faire partie d'un périmètre explicitement validé."},
			{"Le sourcing en Chine peut-il continuer vers le fulfillment ?", "Oui. Une fois le produit, le packaging, la quantité, l'origine et la destination validés, le relais peut être préparé pour le stockage, le fret et le fulfillment."},
		},
		ContactKicker: "OUVRIR LA DEMANDE",
		ContactTitle:  "Partez du produit, du sourcing en Chine et du résultat attendu.",
		ContactBody:   "Partagez le produit, la quantité, le fournisseur chinois connu, la destination, le calendrier et le point de blocage actuel. FreightVanta répondra d'abord avec les questions opérationnelles qui définissent le périmètre.",
		ContactButton: "Demander un plan de sourcing",
	},
	"es": {
		SEOTitle:        "Sourcing de productos en China | FreightVanta",
		SEODescription:  "Organiza el sourcing de productos en China con un brief para proveedor, respuestas comparables, puntos de muestra y un relevo preparado para el mercado español.",
		SEOKeywords:     []string{"sourcing de productos en China", "comprar productos en China para empresas", "proveedores de China", "abastecimiento desde China", "importar productos de China"},
		SEOKeywordsText: "sourcing de productos en China, comprar productos en China para empresas, proveedores de China, abastecimiento desde China, importar productos de China",
		HeroKicker:      "SOURCING DE PRODUCTOS EN CHINA",
		HeroTitle:       "Sourcing de productos en China, ordenado para tu próxima decisión de compra.",
		HeroBody:        "Un enlace, una imagen de referencia, una especificación o una cantidad objetivo son suficientes para empezar. FreightVanta convierte el abastecimiento desde China en un brief para proveedor: qué debe ser el producto, qué confirmar con proveedores de China, qué muestras o comparaciones revisar y cómo preparar el relevo hacia tu mercado español.",
		HeroPrimary:     "Solicitar un plan de sourcing",
		HeroSecondary:   "Ver el proceso",
		HeroStages:      []publicProductSourcingStage{{"01 / REFERENCIA CHINA", "Punto de partida concreto"}, {"02 / BRIEF", "Pregunta clara al proveedor"}, {"03 / REVISIÓN", "Opciones comparables"}, {"04 / SALIDA", "Relevo preparado"}},
		FitKicker:       "CUÁNDO ENCAJA",
		FitTitle:        "El sourcing de productos en China empieza con una necesidad que se puede comprobar.",
		FitBody:         "Úsalo cuando la oportunidad es clara, pero la información de producto, proveedor de China, embalaje o mercado de destino aún está dispersa y no permite comparar opciones con confianza.",
		Situations: []publicProductSourcingSituation{
			{"REFERENCIA CHINA", "Tienes una referencia de producto o proveedor de China, pero no un brief listo para proveedor.", "Un enlace, una foto, una página de fabricante, un anuncio de marketplace o una especificación aproximada se convierte en preguntas sobre material, tamaño, acabado, cantidad, embalaje y destino."},
			{"OPCIONES", "Necesitas comparar respuestas de proveedores de China antes de decidir.", "Las respuestas se ordenan por los mismos puntos para que las diferencias, las pruebas de muestra y los datos pendientes sigan visibles."},
			{"RELEVO", "La siguiente etapa depende de detalles confirmados desde China.", "Muestras, packaging, inspección, transporte, almacenaje y fulfillment necesitan una definición estable del producto."},
		},
		ProcessKicker: "EL PROCESO",
		ProcessTitle:  "Un proceso de abastecimiento desde China que no pierde contexto.",
		ProcessBody:   "Cada fase conserva lo que se sabe, identifica lo que falta y deja un punto de partida claro para la persona responsable del siguiente relevo. La aprobación queda en tu equipo.",
		ProcessSteps: []publicProductSourcingStep{
			{"01", "Comparte la referencia de China", "Reúne enlaces de producto, imágenes, especificaciones, proveedor o fabricante de China si se conoce, cantidad, destino y resultado esperado."},
			{"02", "Construye el brief para proveedor", "Organiza atributos, variantes, embalaje, mercado español, fechas y criterios de decisión para una solicitud útil a un proveedor de China."},
			{"03", "Compara respuestas", "Relaciona la información del proveedor de China con cada pregunta que debe resolver, en lugar de dejarla repartida entre mensajes."},
			{"04", "Revisa muestras o evidencias", "Fotos, vídeos, muestras y declaraciones sirven a la aprobación de tu equipo; los criterios de aceptación requieren un alcance confirmado."},
			{"05", "Prepara el relevo", "Documenta los datos aprobados, cantidades, embalaje e información de origen para la compra, almacenaje, transporte o fulfillment que se confirme."},
		},
		ChinaKicker:        "ABASTECIMIENTO DESDE CHINA",
		ChinaTitle:         "Un solo brief para producto, proveedor de China y decisión de compra.",
		ChinaBody:          "Comprar productos en China para empresas es más claro cuando la referencia, las preguntas al proveedor, el mercado objetivo y el registro de aprobación permanecen unidos. La coordinación no promete proveedor, precio, calidad, conformidad ni plazo; cada punto requiere comprobación o un alcance expresamente confirmado.",
		ChinaPoints:        []string{"Referencia de China: enlace de producto, página de fabricante, anuncio de marketplace o contacto de proveedor conocido", "Contexto de producto y compra: material, variantes, cantidad objetivo, embalaje, mercado de destino y condiciones no negociables", "Comunicación comparable: preguntas, respuestas, evidencias de muestra y decisiones abiertas en un mismo marco", "Relevo desde China: detalles aprobados listos para la compra, el transporte, el almacenaje o el fulfillment que confirme tu equipo"},
		RequirementsKicker: "ANTES DE EMPEZAR",
		RequirementsTitle:  "Una referencia útil de China y un objetivo bastan para abrir el trabajo.",
		RequirementsBody:   "No necesitas tener todas las respuestas. Esta información ayuda a convertir la primera conversación sobre importar productos de China en un brief operativo que se puede revisar y aprobar.",
		Requirements:       []string{"Enlace, imagen, dibujo o especificación", "Proveedor, fabricante o enlace de marketplace en China, si ya existe", "Cantidad objetivo y patrón de reposición", "Mercado de destino y canal de venta", "Material, acabado, color, dimensiones, variantes y expectativa de embalaje", "Fecha objetivo y restricciones no negociables"},
		FAQKicker:          "ANTES DE HABLAR CON UN PROVEEDOR DE CHINA",
		FAQTitle:           "Preguntas que conviene resolver pronto.",
		FAQBody:            "El abastecimiento desde China coordina información, comparaciones y aprobaciones. Calidad, precio, fábrica, cumplimiento o inspección requieren un alcance confirmado.",
		FAQs: []publicFAQItem{
			{"¿Puede FreightVanta ayudar con el sourcing de productos en China?", "Sí. FreightVanta puede estructurar el brief de producto, las preguntas para proveedores de China, las respuestas comparables y el relevo aprobado. La selección de proveedor, el control de calidad, los precios, el cumplimiento y los criterios de aceptación deben confirmarse por separado."},
			{"¿Podemos empezar solo con un enlace de producto?", "Sí. Un enlace, una imagen o una descripción corta permite iniciar la conversación. La información que falta para el sourcing en China se registra como preguntas abiertas."},
			{"¿Se garantiza el proveedor de China o la calidad del producto?", "No. Los controles de calidad, las auditorías, los precios, el cumplimiento y los criterios de aceptación deben confirmarse en un alcance de servicio aprobado."},
			{"¿Puede el sourcing desde China conectarse con fulfillment?", "Sí. Tras aprobar producto, embalaje, cantidad, origen y destino, el relevo puede prepararse para inventario, transporte y fulfillment."},
		},
		ContactKicker: "ABRIR LA CONVERSACIÓN",
		ContactTitle:  "Empieza por el producto, el sourcing en China y el resultado que necesitas.",
		ContactBody:   "Comparte producto, cantidad, proveedor de China conocido, destino, fecha y el punto donde tu proceso necesita apoyo. Primero responderemos con las preguntas prácticas para definir el alcance.",
		ContactButton: "Solicitar un plan de sourcing",
	},
	"it": {
		SEOTitle:        "Sourcing prodotti dalla Cina per aziende | FreightVanta",
		SEODescription:  "Organizza il sourcing di prodotti dalla Cina con un brief per il fornitore, risposte confrontabili, punti campione e un passaggio preparato per il mercato italiano.",
		SEOKeywords:     []string{"sourcing prodotti dalla Cina", "acquistare prodotti dalla Cina", "fornitori cinesi", "approvvigionamento dalla Cina", "importare dalla Cina"},
		SEOKeywordsText: "sourcing prodotti dalla Cina, acquistare prodotti dalla Cina, fornitori cinesi, approvvigionamento dalla Cina, importare dalla Cina",
		HeroKicker:      "SOURCING PRODOTTI DALLA CINA",
		HeroTitle:       "Sourcing prodotti dalla Cina, ordinato per la prossima decisione d'acquisto.",
		HeroBody:        "Un link, un'immagine di riferimento, una specifica o una quantità obiettivo sono sufficienti per iniziare. FreightVanta organizza l'approvvigionamento dalla Cina in un brief per il fornitore: cosa deve essere il prodotto, cosa confermare con fornitori cinesi, quali campioni o confronti valutare e come preparare il passaggio verso il mercato italiano.",
		HeroPrimary:     "Richiedi un piano di sourcing",
		HeroSecondary:   "Vedi il percorso",
		HeroStages:      []publicProductSourcingStage{{"I / RIFERIMENTO CINA", "Un punto di partenza concreto"}, {"II / BRIEF", "Una richiesta leggibile"}, {"III / CONFRONTO", "Scelte messe a fuoco"}, {"IV / PASSAGGIO", "Dettagli pronti a muoversi"}},
		FitKicker:       "QUANDO PARTIRE",
		FitTitle:        "L'approvvigionamento dalla Cina parte da un requisito verificabile.",
		FitBody:         "È utile quando l'opportunità è chiara, ma le informazioni su prodotto, fornitore cinese, packaging o mercato di destinazione sono ancora sparse, incomplete oppure difficili da confrontare.",
		Situations: []publicProductSourcingSituation{
			{"RIFERIMENTO CINA", "Hai un prodotto o un fornitore cinese di riferimento, ma non ancora un brief pronto.", "Link, foto, pagina del produttore, annuncio marketplace o specifica preliminare diventano domande concrete su materiale, dimensioni, finitura, quantità, packaging e mercato italiano."},
			{"IL CONFRONTO", "Vuoi confrontare le risposte di fornitori cinesi prima di scegliere.", "Le risposte vengono raccolte secondo gli stessi punti, così differenze, prove campione e informazioni mancanti restano visibili a chi approva."},
			{"IL PASSAGGIO", "La fase successiva dipende da dettagli prodotto stabili dalla Cina.", "Campioni, packaging, controllo, trasporto, magazzino e fulfillment non dovrebbero essere pianificati finché il prodotto non è definito e approvato."},
		},
		ProcessKicker: "IL PERCORSO",
		ProcessTitle:  "Un percorso di sourcing dalla Cina che non perde il filo della decisione.",
		ProcessBody:   "Ogni fase prepara la seguente senza nascondere le domande aperte. La decisione finale resta al team che acquista.",
		ProcessSteps: []publicProductSourcingStep{
			{"I", "Condividi il riferimento Cina", "Raccogli link prodotto, immagini, specifiche, fornitore o produttore cinese noto, quantità, destinazione e risultato desiderato."},
			{"II", "Forma il brief per il fornitore", "Organizza attributi, varianti, packaging, mercato italiano, tempi e criteri di scelta in una richiesta utile a un fornitore cinese."},
			{"III", "Confronta le risposte", "Collega ogni risposta del fornitore cinese alla domanda che deve effettivamente risolvere, senza lasciare informazioni sparse."},
			{"IV", "Prepara il passaggio", "Documenta dettagli approvati, quantità, packaging e informazioni d'origine per l'acquisto, il magazzino, il trasporto o il fulfillment confermato."},
		},
		ChinaKicker:        "APPROVVIGIONAMENTO DALLA CINA",
		ChinaTitle:         "Un solo brief per prodotto, fornitore cinese e decisione.",
		ChinaBody:          "Acquistare prodotti dalla Cina è più leggibile quando riferimento, domande al fornitore, mercato di destinazione e stato di approvazione restano collegati. Il coordinamento non promette fornitore, prezzo, qualità, conformità o tempi: ogni voce richiede verifica o un perimetro espressamente confermato.",
		ChinaPoints:        []string{"Riferimento Cina: link prodotto, pagina del produttore, annuncio marketplace o contatto fornitore già noto", "Contesto prodotto e acquisto: materiale, varianti, quantità obiettivo, packaging, mercato di destinazione e vincoli", "Comunicazione confrontabile: domande, risposte, prove campione e decisioni aperte nello stesso quadro", "Passaggio dalla Cina: dettagli approvati pronti per acquisto, trasporto, magazzino o fulfillment che il team conferma"},
		RequirementsKicker: "PER INIZIARE",
		RequirementsTitle:  "Una referenza Cina utilizzabile e un obiettivo sono sufficienti per cominciare.",
		RequirementsBody:   "Non occorre conoscere tutto al primo scambio. Queste informazioni aiutano a trasformare una prima richiesta di sourcing dalla Cina in un brief operativo che si può rivedere e approvare.",
		Requirements:       []string{"Link prodotto, immagine, disegno o specifica", "Fornitore, produttore o link marketplace in Cina, se già noto", "Quantità obiettivo e schema di riordino previsto", "Mercato di destinazione e canale di vendita", "Materiale, finitura, colore, dimensioni, varianti e requisiti packaging", "Data obiettivo e vincoli non negoziabili"},
		FAQKicker:          "PRIMA DI PARLARE CON UN FORNITORE IN CINA",
		FAQTitle:           "Domande da rendere chiare fin dall'inizio.",
		FAQBody:            "L'approvvigionamento dalla Cina coordina informazioni, confronti e approvazioni. Garanzie su qualità, prezzo, stabilimento, conformità o ispezione richiedono un perimetro confermato.",
		FAQs: []publicFAQItem{
			{"FreightVanta può aiutare con il sourcing di prodotti dalla Cina?", "Sì. FreightVanta può strutturare il brief prodotto, le domande ai fornitori cinesi, le risposte confrontabili e il passaggio approvato. Scelta del fornitore, controllo qualità, prezzi, conformità e criteri di accettazione devono essere confermati separatamente."},
			{"Possiamo partire da un solo link prodotto?", "Sì. Un link, un'immagine o una breve descrizione permettono di iniziare. Le informazioni mancanti per il sourcing dalla Cina diventano domande pratiche."},
			{"Il fornitore cinese o la qualità del prodotto sono garantiti?", "No. Controlli qualità, audit, prezzi, conformità e criteri di accettazione devono essere esplicitamente confermati in un accordo di servizio approvato."},
			{"Il sourcing dalla Cina può proseguire verso il fulfillment?", "Sì. Dopo l'approvazione di prodotto, packaging, quantità, origine e destinazione, il passaggio può essere preparato per magazzino, trasporto e fulfillment."},
		},
		ContactKicker: "APRI LA RICHIESTA",
		ContactTitle:  "Inizia dal prodotto, dal sourcing dalla Cina e dal risultato che vuoi ottenere.",
		ContactBody:   "Condividi prodotto, quantità, fornitore cinese noto, destinazione, tempistiche e il punto in cui serve supporto. Il primo ritorno sarà un insieme di domande pratiche per definire il perimetro.",
		ContactButton: "Richiedi un piano di sourcing",
	},
	"nl": {
		SEOTitle:        "Producten inkopen in China voor bedrijven | FreightVanta",
		SEODescription:  "Producten inkopen in China met een leveranciersbrief, vergelijkbare antwoorden, monsterpunten en een voorbereide overdracht voor de Nederlandse markt.",
		SEOKeywords:     []string{"producten inkopen in China", "China sourcing", "leveranciers in China vinden", "inkopen uit China", "producten importeren uit China"},
		SEOKeywordsText: "producten inkopen in China, China sourcing, leveranciers in China vinden, inkopen uit China, producten importeren uit China",
		HeroKicker:      "PRODUCTEN INKOPEN IN CHINA",
		HeroTitle:       "Producten inkopen in China, helder georganiseerd voor uw volgende beslissing.",
		HeroBody:        "Een link, referentiebeeld, specificatie of doelhoeveelheid is genoeg om te starten. FreightVanta brengt China sourcing samen in een leveranciersklaar brief: wat het product moet zijn, wat leveranciers in China moeten bevestigen, welke monsters of vergelijkingen nodig zijn en hoe de overdracht voor de Nederlandse markt wordt voorbereid.",
		HeroPrimary:     "Sourcingplan aanvragen",
		HeroSecondary:   "Bekijk het proces",
		HeroStages:      []publicProductSourcingStage{{"01 / CHINA-REFERENTIE", "Productreferentie"}, {"02 / UITWERKEN", "Werkbaar brief"}, {"03 / CONTROLEREN", "Vergelijkbare keuzes"}, {"04 / DOORGEVEN", "Goedgekeurde overdracht"}},
		FitKicker:       "WANNEER HET PAST",
		FitTitle:        "Producten inkopen uit China begint met een helder, toetsbaar productbrief.",
		FitBody:         "Gebruik China sourcing wanneer er een kans of productreferentie is, maar product-, leveranciers-, verpakkings- of bestemmingsmarktinformatie nog geen consistente basis vormt voor een betrouwbare vervolgstap.",
		Situations: []publicProductSourcingSituation{
			{"CHINA-REFERENTIE", "U heeft een product- of leveranciersreferentie uit China, maar geen leveranciersklaar brief.", "Een link, foto, fabrikantpagina, marketplace-vermelding of globale specificatie wordt vertaald naar vragen over materiaal, maat, afwerking, hoeveelheid, verpakking en bestemming."},
			{"OPTIES", "U wilt reacties van leveranciers in China vergelijken voordat u beslist.", "Leveranciersantwoorden worden langs dezelfde vragen gelegd, zodat verschillen, monsterbewijs en ontbrekende informatie zichtbaar blijven."},
			{"OVERDRACHT", "De volgende stap hangt af van stabiele productdetails uit China.", "Monsters, verpakking, inspectie, transport, opslag en fulfillment kunnen pas goed worden voorbereid wanneer het product eenduidig is."},
		},
		ProcessKicker: "HET PROCES",
		ProcessTitle:  "Een praktisch China sourcing-proces met zichtbare status per overdracht.",
		ProcessBody:   "De volgorde houdt de input, open vragen en verantwoordelijkheden samen, zodat een besluit niet opnieuw hoeft te worden opgebouwd bij de volgende persoon. De goedkeuring blijft bij uw team.",
		ProcessSteps: []publicProductSourcingStep{
			{"01", "Deel de China-referentie", "Verzamel productlinks, beelden, specificaties, een bekende leverancier of fabrikant in China, hoeveelheid, bestemming en het gewenste resultaat."},
			{"02", "Maak het leveranciersbrief", "Orden productattributen, varianten, verpakking, Nederlandse bestemmingsmarkt, tijdlijn en besliscriteria in één werkbare aanvraag voor een leverancier in China."},
			{"03", "Vergelijk de antwoorden", "Koppel elk leveranciersantwoord uit China aan de vraag die het daadwerkelijk beantwoordt, in plaats van informatie over losse berichten te verspreiden."},
			{"04", "Controleer bewijs of monster", "Foto's, video's, fysieke monsters en leveranciersinformatie ondersteunen de goedkeuring van uw team; acceptatiecriteria vragen een bevestigd bereik."},
			{"05", "Bereid de volgende overdracht voor", "Documenteer goedgekeurde details, hoeveelheden, verpakking en oorsprongsinformatie voor de bevestigde inkoop-, opslag-, transport- of fulfillmentstap."},
		},
		ChinaKicker:        "CHINA SOURCING",
		ChinaTitle:         "Een gedeeld brief voor product, leverancier in China en besluit.",
		ChinaBody:          "Producten importeren uit China wordt beter bestuurbaar wanneer de productreferentie, leveranciersvragen, doelmarkt en goedkeuringsstatus verbonden blijven. Deze coördinatie belooft geen leverancier, prijs, kwaliteit, compliance of levertijd; elk punt vraagt om verificatie of een expliciet bevestigd bereik.",
		ChinaPoints:        []string{"China-referentie: productlink, fabrikantpagina, marketplace-vermelding of een bekend leverancierscontact", "Product- en inkoopcontext: materiaal, varianten, doelhoeveelheid, verpakking, bestemmingsmarkt en harde voorwaarden", "Vergelijkbare communicatie: vragen, antwoorden, monsterbewijs en open besluiten in één werkoverzicht", "Overdracht uit China: goedgekeurde details voor de inkoop-, transport-, opslag- of fulfillmentstap die uw team bevestigt"},
		RequirementsKicker: "WAT WE NODIG HEBBEN",
		RequirementsTitle:  "Een bruikbare China-referentie en een doel zijn genoeg om te beginnen.",
		RequirementsBody:   "Niet elk antwoord hoeft vooraf bekend te zijn. Deze informatie helpt om de eerste productconversatie over inkopen uit China om te zetten naar een brief die door de volgende eigenaar kan worden gebruikt.",
		Requirements:       []string{"Productlink, afbeelding, tekening of specificatie", "Bekende leverancier, fabrikant of marketplace-link in China, indien aanwezig", "Doelhoeveelheid en verwacht herbestelpatroon", "Bestemmingsmarkt en verkoopkanaal", "Materiaal, afwerking, kleur, afmeting, varianten en gewenste verpakking", "Doeldatum en niet-onderhandelbare voorwaarden"},
		FAQKicker:          "VOOR HET EERSTE GESPREK MET EEN LEVERANCIER IN CHINA",
		FAQTitle:           "Vragen die beter vroeg zichtbaar zijn.",
		FAQBody:            "China sourcing coördineert informatie, vergelijkingen en goedkeuringen. Kwaliteit, prijs, fabriek, compliance of inspectie vragen om een apart bevestigd bereik.",
		FAQs: []publicFAQItem{
			{"Kan FreightVanta helpen met producten inkopen in China?", "Ja. FreightVanta kan het productbrief, vragen voor leveranciers in China, vergelijkbare antwoorden en de goedgekeurde overdracht structureren. Leverancierskeuze, kwaliteitscontrole, prijs, compliance en acceptatiecriteria moeten afzonderlijk worden bevestigd."},
			{"Kunnen we beginnen met alleen een productlink?", "Ja. Een link, beeld of korte omschrijving is voldoende voor het eerste gesprek. Ontbrekende informatie voor China sourcing wordt als open vraag vastgelegd."},
			{"Worden een leverancier in China of productkwaliteit gegarandeerd?", "Nee. Kwaliteitscontrole, audits, prijs, compliance en acceptatiecriteria moeten expliciet worden overeengekomen in een goedgekeurde serviceomvang."},
			{"Kan inkopen uit China aansluiten op fulfillment?", "Ja. Zodra product, verpakking, hoeveelheid, oorsprong en bestemming zijn goedgekeurd, kan de overdracht worden voorbereid voor voorraad, transport en fulfillment."},
		},
		ContactKicker: "START DE AANVRAAG",
		ContactTitle:  "Begin met het product, China sourcing en het resultaat dat u nodig heeft.",
		ContactBody:   "Deel product, hoeveelheid, bekende leverancier in China, bestemming, planning en het punt waar uw proces ondersteuning nodig heeft. We reageren eerst met praktische vragen om de scope helder te krijgen.",
		ContactButton: "Sourcingplan aanvragen",
	},
}

func productSourcingCopyFor(languageCode string) publicProductSourcingCopy {
	if copy, ok := productSourcingCopies[languageCode]; ok {
		return copy
	}
	return productSourcingCopies["en"]
}

func (s *server) configureProductSourcingPage(r *http.Request, data *publicSitePageData, site catalog.Site, preview bool, network []catalog.PublicLanguageSite) {
	copy := productSourcingCopyFor(data.LanguageCode)
	data.IsHome = false
	data.IsProductSourcing = true
	data.NotFound = false
	data.HasContent = false
	data.Content = publicContentData{}
	data.ProductSourcing = copy
	data.PageTitle = copy.SEOTitle
	data.MetaDescription = copy.SEODescription
	data.OGTitle = copy.SEOTitle
	data.OGDescription = copy.SEODescription
	data.SocialImageURL = publicSchemaAbsoluteURL(publicSchemaURL(*data), "/assets/images/freightvanta-service-product-sourcing-hero-v1.png")
	data.RobotsIndex = true
	s.populatePublicNetworkForFixedPath(r, data, site, preview, network, productSourcingSlug)
	if preview {
		data.CanonicalURL = ""
	}
	data.StructuredData = template.JS(publicJSONLD(*data, site))
}

func (s *server) populatePublicNetworkForFixedPath(r *http.Request, data *publicSitePageData, current catalog.Site, preview bool, network []catalog.PublicLanguageSite, slug string) {
	data.Languages = data.Languages[:0]
	data.Hreflangs = data.Hreflangs[:0]
	var defaultURL string
	for _, language := range network {
		url := s.publicLanguageSiteURL(r, current, preview, language, slug)
		if url == "" {
			continue
		}
		data.Languages = append(data.Languages, publicLanguageData{Code: language.LanguageCode, Locale: language.Locale, Name: language.LanguageName, NativeName: language.NativeName, URL: url})
		data.Hreflangs = append(data.Hreflangs, publicHreflang{Locale: language.Locale, URL: url})
		if language.LanguageCode == "en" {
			defaultURL = url
		}
	}
	if defaultURL != "" {
		data.Hreflangs = append(data.Hreflangs, publicHreflang{Locale: "x-default", URL: defaultURL})
	}
}
