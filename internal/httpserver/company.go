package httpserver

import "czcms/internal/catalog"

// Owner-supplied company facts. The address is an operating address, not a
// verified registered office. Use a romanized company name for international
// presentation; this does not assert a separately registered English name.
const freightVantaLegalName = "Shenzhen Tang Xiaopang International Logistics Co., Ltd."
const freightVantaContactEmail = "info@freightvanta.com"
const freightVantaBusinessAddress = "Room 606, No. 21 Xinqiao 3rd Road, Xinqiao Community, Xinqiao Subdistrict, Bao'an District, Shenzhen, China"

func isFreightVantaSite(site catalog.Site) bool {
	switch site.Code {
	case "global", "germany", "france", "spain", "italy", "netherlands":
		return true
	}
	return false
}

func addFreightVantaIdentity(organization map[string]any) {
	organization["name"] = "FreightVanta"
	organization["legalName"] = freightVantaLegalName
	organization["email"] = freightVantaContactEmail
	organization["address"] = map[string]any{
		"@type": "PostalAddress", "streetAddress": "Room 606, No. 21 Xinqiao 3rd Road, Xinqiao Community, Xinqiao Subdistrict, Bao'an District",
		"addressLocality": "Shenzhen", "addressRegion": "Guangdong", "addressCountry": "CN",
	}
}

type publicCompanyData struct {
	EmailLabel                                                         string
	NameLabel, AddressLabel, BusinessAddress, ScopeTitle, CultureTitle string
	CultureImageNotice                                                 string
	CultureIntro, CultureLinkLabel, SolutionsTitle                     string
	Overview, PolicyNotice, LegalNotice                                string
	Services, Culture                                                  []supportSection
}

func companyCopyFor(locale string) publicCompanyData {
	copy, ok := companyCopies[locale]
	if !ok {
		locale = "en"
		copy = companyCopies[locale]
	}
	copy.Culture = append([]supportSection(nil), copy.Culture...)
	copy.EmailLabel = map[string]string{"en": "Email", "de": "E-Mail", "fr": "Adresse e-mail", "es": "Correo electrónico", "it": "E-mail", "nl": "E-mailadres"}[locale]
	keys := []string{"vision", "mission", "values", "motto", "philosophy", "spirit"}
	for i := range copy.Culture {
		copy.Culture[i].URL = keys[i]
		copy.Culture[i].Image = "/assets/company/culture-" + keys[i] + "-v1.webp"
		copy.Culture[i].ImageSmall = "/assets/company/culture-" + keys[i] + "-v1-320.webp"
	}
	copy.CultureImageNotice = map[string]string{
		"en": "AI-generated conceptual illustrations of our company values.",
		"de": "KI-generierte Konzeptillustrationen unserer Unternehmenswerte.",
		"fr": "Illustrations conceptuelles de nos valeurs, générées par IA.",
		"es": "Ilustraciones conceptuales de nuestros valores, generadas con IA.",
		"it": "Illustrazioni concettuali dei nostri valori, generate con IA.",
		"nl": "AI-gegenereerde conceptillustraties van onze bedrijfswaarden.",
	}[locale]
	copy.CultureIntro = map[string]string{
		"en": "Customers come first. Sincerity, dedication and continuous improvement guide the logistics business we are building.",
		"de": "Unsere Kunden stehen im Mittelpunkt. Aufrichtigkeit, Engagement und kontinuierliche Verbesserung prägen das Logistikunternehmen, das wir aufbauen.",
		"fr": "Le client est au centre de nos priorités. Sincérité, engagement et amélioration continue guident l’entreprise logistique que nous construisons.",
		"es": "El cliente está en el centro. La sinceridad, la dedicación y la mejora continua guían la empresa logística que estamos construyendo.",
		"it": "Il cliente è al centro. Sincerità, impegno e miglioramento continuo guidano l’impresa logistica che stiamo costruendo.",
		"nl": "De klant staat centraal. Oprechtheid, inzet en voortdurende verbetering geven richting aan het logistieke bedrijf dat we opbouwen.",
	}[locale]
	copy.CultureLinkLabel = map[string]string{"en": "Explore our company culture", "de": "Unsere Unternehmenskultur entdecken", "fr": "Découvrir notre culture d’entreprise", "es": "Conoce nuestra cultura empresarial", "it": "Scopri la nostra cultura aziendale", "nl": "Ontdek onze bedrijfscultuur"}[locale]
	copy.SolutionsTitle = map[string]string{"en": "Sourcing and fulfilment services", "de": "Beschaffung und Auftragsabwicklung", "fr": "Sourcing et préparation des commandes", "es": "Abastecimiento y preparación de pedidos", "it": "Approvvigionamento e gestione degli ordini", "nl": "Inkoop en orderafhandeling"}[locale]
	return copy
}

func companyCultureSlug(locale string) string {
	if slug := map[string]string{"en": "company-culture", "de": "unternehmenskultur", "fr": "culture-entreprise", "es": "cultura-empresarial", "it": "cultura-aziendale", "nl": "bedrijfscultuur"}[locale]; slug != "" {
		return slug
	}
	return "company-culture"
}

var companyCopies = map[string]publicCompanyData{
	"en": {
		NameLabel: "Website operator", AddressLabel: "Business address", BusinessAddress: freightVantaBusinessAddress, ScopeTitle: "Our logistics services", CultureTitle: "Our company culture",
		Overview:     "FreightVanta is operated by Shenzhen Tang Xiaopang International Logistics Co., Ltd., based in Shenzhen, China. We focus on integrated sea, road and air logistics. We compare transport options around your cargo, route, budget and timing to find a practical balance of cost, speed and operational requirements.",
		PolicyNotice: "This is a summary of enquiry handling, not a complete privacy policy. Retention periods, service providers and a direct privacy contact still need to be detailed. Use the contact form for questions or requests concerning your information.",
		LegalNotice:  "The address below is our business address. Company registration details and direct contact information are not yet published on this page. Use the contact form to request further operator information.",
		Services: []supportSection{
			{Title: "International freight and China–Hong Kong transport", Body: "Sea, road and air transport planning, international freight and China–Hong Kong transport. Options are assessed against the cargo and delivery requirements."},
			{Title: "Cargo collection, booking and warehousing", Body: "Cargo collection, freight booking, warehousing and transit arrangements, with the handoffs coordinated around the shipment plan."},
			{Title: "Container consolidation and breakbulk", Body: "Container consolidation and deconsolidation, bulk and breakbulk cargo transport, with handling requirements reviewed for the specific goods."},
			{Title: "Documentation and shipment support", Body: "Freight and miscellaneous charge settlement, customs declaration, inspection declaration and cargo insurance arrangements. Responsibilities, coverage and charges are confirmed for each shipment."},
			{Title: "Coordinated logistics management", Body: "Plan, organise, coordinate and monitor the movement of goods to improve handoffs, control logistics costs and support operational efficiency. Service scope, price and timing are confirmed in writing."},
		},
		Culture: []supportSection{{Title: "Vision", Body: "To become China's most competitive integrated logistics group."}, {Title: "Mission", Body: "Build an innovative logistics enterprise through innovation."}, {Title: "Core values", Body: "Put customers first, value dedicated people and keep working to improve."}, {Title: "Company motto", Body: "Renew our conduct each day; pursue lasting progress with a calm purpose."}, {Title: "Business philosophy", Body: "Make intelligent operations a direction for development."}, {Title: "Our spirit", Body: "Sincerity, diligence, continuous improvement, innovation and shared success."}},
	},
	"de": {
		NameLabel: "Websitebetreiber", AddressLabel: "Geschäftsanschrift", BusinessAddress: "Raum 606, Nr. 21, Xinqiao 3. Straße, Gemeinde Xinqiao, Unterbezirk Xinqiao, Bezirk Bao'an, Shenzhen, China", ScopeTitle: "Unsere Logistikleistungen", CultureTitle: "Unsere Unternehmenskultur",
		Overview:     "FreightVanta wird von Shenzhen Tang Xiaopang International Logistics Co., Ltd. mit Standort in Shenzhen, China, betrieben. Wir konzentrieren uns auf integrierte See-, Land- und Luftlogistik. Anhand von Fracht, Route, Budget und Terminen vergleichen wir Transportmöglichkeiten, um Kosten, Geschwindigkeit und betriebliche Anforderungen sinnvoll abzustimmen.",
		PolicyNotice: "Dies ist eine Zusammenfassung zur Anfragebearbeitung, keine vollständige Datenschutzerklärung. Aufbewahrungsfristen, Dienstleister und ein direkter Datenschutzkontakt sind noch zu ergänzen. Fragen und Anträge zu Ihren Daten können Sie über das Kontaktformular stellen.",
		LegalNotice:  "Die folgende Anschrift ist unsere Geschäftsanschrift. Registerangaben und direkte Kontaktdaten sind hier noch nicht veröffentlicht. Weitere Betreiberinformationen können Sie über das Kontaktformular anfordern.",
		Services:     []supportSection{{Title: "Internationale Fracht und China–Hongkong-Verkehr", Body: "Planung von See-, Land- und Lufttransporten sowie internationale Fracht und Transporte zwischen China und Hongkong nach Waren- und Lieferanforderungen."}, {Title: "Abholung, Buchung und Lagerung", Body: "Warenabholung, Frachtbuchung, Lagerung und Umschlag mit abgestimmten Übergaben im Versandablauf."}, {Title: "Containersammelladung und Stückgut", Body: "Zusammenstellung und Aufteilung von Containerladungen sowie Massen- und Stückguttransporte nach den Anforderungen der jeweiligen Güter."}, {Title: "Dokumente und Versandbegleitung", Body: "Abrechnung von Fracht- und Nebenkosten, Zoll- und Inspektionsanmeldungen sowie Organisation von Transportversicherungen. Verantwortung, Deckung und Gebühren werden je Sendung bestätigt."}, {Title: "Koordiniertes Logistikmanagement", Body: "Warenbewegungen planen, organisieren, koordinieren und überwachen, um Übergaben, Kosten und Effizienz zu verbessern. Umfang, Preis und Termine werden schriftlich bestätigt."}},
		Culture:      []supportSection{{Title: "Vision", Body: "Chinas wettbewerbsfähigste integrierte Logistikgruppe werden."}, {Title: "Mission", Body: "Durch Innovation ein innovatives Logistikunternehmen aufbauen."}, {Title: "Kernwerte", Body: "Kunden in den Mittelpunkt stellen, engagierte Menschen wertschätzen und beständig weiterarbeiten."}, {Title: "Leitspruch", Body: "Das eigene Handeln täglich erneuern und mit Ruhe langfristig vorankommen."}, {Title: "Geschäftsphilosophie", Body: "Intelligente Betriebsabläufe als Entwicklungsrichtung verfolgen."}, {Title: "Unser Geist", Body: "Aufrichtigkeit, Fleiß, kontinuierliche Verbesserung, Innovation und gemeinsamer Erfolg."}},
	},
	"fr": {
		NameLabel: "Éditeur du site", AddressLabel: "Adresse d’exploitation", BusinessAddress: "Bureau 606, n° 21, 3e rue Xinqiao, communauté de Xinqiao, sous-district de Xinqiao, district de Bao'an, Shenzhen, Chine", ScopeTitle: "Nos services logistiques", CultureTitle: "Notre culture d’entreprise",
		Overview:     "FreightVanta est exploité par Shenzhen Tang Xiaopang International Logistics Co., Ltd., à Shenzhen, en Chine. Nous nous concentrons sur une logistique intégrant le transport maritime, routier et aérien. Nous comparons les options selon la marchandise, l’itinéraire, le budget et les délais pour équilibrer coût, rapidité et contraintes opérationnelles.",
		PolicyNotice: "Ce résumé du traitement des demandes ne constitue pas une politique de confidentialité complète. Les durées de conservation, les prestataires et un contact direct dédié restent à préciser. Utilisez le formulaire pour toute question ou demande concernant vos données.",
		LegalNotice:  "L’adresse ci-dessous est notre adresse d’exploitation. Les informations d’immatriculation et les coordonnées directes ne sont pas encore publiées ici. Utilisez le formulaire pour demander des précisions sur l’éditeur.",
		Services:     []supportSection{{Title: "Fret international et transport Chine–Hong Kong", Body: "Planification maritime, routière et aérienne, fret international et transport entre la Chine et Hong Kong selon les besoins de la marchandise et de livraison."}, {Title: "Enlèvement, réservation et entreposage", Body: "Enlèvement de marchandises, réservation de fret, entreposage et transit avec coordination des étapes de transfert."}, {Title: "Groupage de conteneurs et vrac", Body: "Groupage et dégroupage de conteneurs, transport de vrac et de marchandises conventionnelles selon les besoins de manutention."}, {Title: "Documents et accompagnement", Body: "Règlement du fret et des frais annexes, déclarations en douane et d’inspection, organisation de l’assurance transport. Responsabilités, couverture et frais sont confirmés pour chaque envoi."}, {Title: "Gestion logistique coordonnée", Body: "Planifier, organiser, coordonner et suivre les flux pour améliorer les transferts, maîtriser les coûts et soutenir l’efficacité. Périmètre, prix et délais sont confirmés par écrit."}},
		Culture:      []supportSection{{Title: "Vision", Body: "Devenir le groupe de logistique intégrée le plus compétitif de Chine."}, {Title: "Mission", Body: "Construire une entreprise logistique innovante grâce à l’innovation."}, {Title: "Valeurs fondamentales", Body: "Placer le client au centre, valoriser les personnes engagées et persévérer dans l’effort."}, {Title: "Devise", Body: "Renouveler chaque jour sa conduite et avancer durablement avec sérénité."}, {Title: "Philosophie de gestion", Body: "Faire des opérations intelligentes un axe de développement."}, {Title: "Notre esprit", Body: "Sincérité, diligence, amélioration continue, innovation et réussite partagée."}},
	},
	"es": {
		NameLabel: "Titular del sitio", AddressLabel: "Dirección de actividad", BusinessAddress: "Oficina 606, n.º 21, calle Xinqiao 3, comunidad de Xinqiao, subdistrito de Xinqiao, distrito de Bao'an, Shenzhen, China", ScopeTitle: "Nuestros servicios logísticos", CultureTitle: "Nuestra cultura empresarial",
		Overview:     "FreightVanta está operado por Shenzhen Tang Xiaopang International Logistics Co., Ltd., en Shenzhen, China. Nos centramos en la logística integrada por mar, carretera y aire. Comparamos opciones según la mercancía, la ruta, el presupuesto y los plazos para equilibrar costes, rapidez y requisitos operativos.",
		PolicyNotice: "Este resumen sobre la gestión de consultas no es una política de privacidad completa. Faltan por detallar los plazos de conservación, los proveedores y un contacto directo de privacidad. Usa el formulario para consultas o solicitudes sobre tus datos.",
		LegalNotice:  "La dirección indicada es nuestra dirección de actividad. Los datos registrales y de contacto directo aún no están publicados aquí. Puedes solicitar más información del titular mediante el formulario.",
		Services:     []supportSection{{Title: "Carga internacional y transporte China–Hong Kong", Body: "Planificación marítima, terrestre y aérea, carga internacional y transporte entre China y Hong Kong según la mercancía y la entrega."}, {Title: "Recogida, reserva y almacenaje", Body: "Recogida de mercancías, reserva de carga, almacenaje y tránsito con coordinación de las entregas entre etapas."}, {Title: "Consolidación de contenedores y carga a granel", Body: "Consolidación y desconsolidación de contenedores, transporte de graneles y carga convencional según los requisitos de manipulación."}, {Title: "Documentación y apoyo al envío", Body: "Liquidación de fletes y gastos accesorios, declaraciones aduaneras y de inspección, y gestión del seguro de carga. Responsabilidades, cobertura y gastos se confirman por envío."}, {Title: "Gestión logística coordinada", Body: "Planificar, organizar, coordinar y supervisar los flujos para mejorar los traspasos, controlar costes y apoyar la eficiencia. Alcance, precio y plazos se confirman por escrito."}},
		Culture:      []supportSection{{Title: "Visión", Body: "Convertirnos en el grupo de logística integrada más competitivo de China."}, {Title: "Misión", Body: "Construir una empresa logística innovadora mediante la innovación."}, {Title: "Valores", Body: "Centrarnos en el cliente, valorar a las personas comprometidas y perseverar en el esfuerzo."}, {Title: "Lema", Body: "Renovar cada día nuestra conducta y avanzar con serenidad hacia metas duraderas."}, {Title: "Filosofía empresarial", Body: "Orientar el desarrollo hacia operaciones inteligentes."}, {Title: "Nuestro espíritu", Body: "Sinceridad, diligencia, mejora continua, innovación y éxito compartido."}},
	},
	"it": {
		NameLabel: "Gestore del sito", AddressLabel: "Indirizzo operativo", BusinessAddress: "Ufficio 606, n. 21, terza strada Xinqiao, comunità di Xinqiao, sottodistretto di Xinqiao, distretto di Bao'an, Shenzhen, Cina", ScopeTitle: "I nostri servizi logistici", CultureTitle: "La nostra cultura aziendale",
		Overview:     "FreightVanta è gestito da Shenzhen Tang Xiaopang International Logistics Co., Ltd., a Shenzhen, in Cina. Ci concentriamo sulla logistica integrata via mare, terra e aria. Confrontiamo le opzioni in base a merce, itinerario, budget e tempi per bilanciare costi, rapidità e requisiti operativi.",
		PolicyNotice: "Questo riepilogo sulla gestione delle richieste non è un’informativa privacy completa. Periodi di conservazione, fornitori e un contatto privacy diretto devono ancora essere dettagliati. Usa il modulo per domande o richieste sui tuoi dati.",
		LegalNotice:  "L’indirizzo indicato è il nostro indirizzo operativo. Dati di registrazione e contatti diretti non sono ancora pubblicati qui. Usa il modulo per richiedere altre informazioni sul gestore.",
		Services:     []supportSection{{Title: "Trasporto internazionale e Cina–Hong Kong", Body: "Pianificazione marittima, terrestre e aerea, trasporto internazionale e tra Cina e Hong Kong secondo le esigenze della merce e della consegna."}, {Title: "Ritiro, prenotazione e magazzinaggio", Body: "Ritiro merci, prenotazione del trasporto, magazzinaggio e transito con coordinamento dei passaggi operativi."}, {Title: "Consolidamento container e merci alla rinfusa", Body: "Consolidamento e deconsolidamento dei container, trasporto di rinfuse e merci convenzionali secondo le esigenze di movimentazione."}, {Title: "Documenti e assistenza alla spedizione", Body: "Regolamento di noli e spese accessorie, dichiarazioni doganali e di ispezione, organizzazione dell’assicurazione merci. Responsabilità, copertura e costi sono confermati per ogni spedizione."}, {Title: "Gestione logistica coordinata", Body: "Pianificare, organizzare, coordinare e monitorare i flussi per migliorare i passaggi, controllare i costi e sostenere l’efficienza. Ambito, prezzi e tempi sono confermati per iscritto."}},
		Culture:      []supportSection{{Title: "Visione", Body: "Diventare il gruppo di logistica integrata più competitivo della Cina."}, {Title: "Missione", Body: "Costruire un’impresa logistica innovativa attraverso l’innovazione."}, {Title: "Valori", Body: "Mettere il cliente al centro, valorizzare le persone impegnate e perseverare nel miglioramento."}, {Title: "Motto", Body: "Rinnovare ogni giorno la propria condotta e perseguire progressi duraturi con serenità."}, {Title: "Filosofia aziendale", Body: "Fare delle operazioni intelligenti una direzione di sviluppo."}, {Title: "Il nostro spirito", Body: "Sincerità, diligenza, miglioramento continuo, innovazione e successo condiviso."}},
	},
	"nl": {
		NameLabel: "Websitebeheerder", AddressLabel: "Bedrijfsadres", BusinessAddress: "Kamer 606, nr. 21, Xinqiao 3e straat, gemeenschap Xinqiao, subdistrict Xinqiao, district Bao'an, Shenzhen, China", ScopeTitle: "Onze logistieke diensten", CultureTitle: "Onze bedrijfscultuur",
		Overview:     "FreightVanta wordt beheerd door Shenzhen Tang Xiaopang International Logistics Co., Ltd. in Shenzhen, China. Wij richten ons op geïntegreerde logistiek over zee, over de weg en door de lucht. We vergelijken opties op basis van lading, route, budget en planning om kosten, snelheid en operationele eisen af te stemmen.",
		PolicyNotice: "Dit overzicht van de aanvraagverwerking is geen volledige privacyverklaring. Bewaartermijnen, dienstverleners en een direct privacycontact moeten nog worden uitgewerkt. Gebruik het contactformulier voor vragen of verzoeken over uw gegevens.",
		LegalNotice:  "Het onderstaande adres is ons bedrijfsadres. Registratiegegevens en directe contactgegevens zijn hier nog niet gepubliceerd. Vraag aanvullende beheerdersinformatie via het contactformulier.",
		Services:     []supportSection{{Title: "Internationale vracht en China–Hongkong", Body: "Planning van zee-, weg- en luchttransport, internationale vracht en vervoer tussen China en Hongkong volgens de lading- en levereisen."}, {Title: "Ophalen, boeken en opslag", Body: "Goederen ophalen, vracht boeken, opslag en overslag met afgestemde overdrachten binnen het verzendplan."}, {Title: "Containerconsolidatie en bulkgoederen", Body: "Consolidatie en deconsolidatie van containers, bulk- en stukgoedvervoer volgens de behandelingseisen van de goederen."}, {Title: "Documenten en verzendondersteuning", Body: "Afrekening van vracht- en bijkomende kosten, douane- en inspectieaangiften en organisatie van goederenverzekering. Verantwoordelijkheden, dekking en kosten worden per zending bevestigd."}, {Title: "Gecoördineerd logistiek beheer", Body: "Goederenstromen plannen, organiseren, coördineren en bewaken om overdrachten te verbeteren, kosten te beheersen en efficiëntie te ondersteunen. Omvang, prijzen en tijden worden schriftelijk bevestigd."}},
		Culture:      []supportSection{{Title: "Visie", Body: "De meest concurrerende geïntegreerde logistieke groep van China worden."}, {Title: "Missie", Body: "Door innovatie een vernieuwend logistiek bedrijf opbouwen."}, {Title: "Kernwaarden", Body: "De klant centraal stellen, toegewijde mensen waarderen en blijven verbeteren."}, {Title: "Bedrijfsmotto", Body: "Elke dag ons handelen vernieuwen en met rust blijvende vooruitgang nastreven."}, {Title: "Bedrijfsfilosofie", Body: "Intelligente bedrijfsvoering als ontwikkelingsrichting kiezen."}, {Title: "Onze geest", Body: "Oprechtheid, inzet, continue verbetering, innovatie en gezamenlijk succes."}},
	},
}
