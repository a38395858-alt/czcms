package httpserver

import "strings"

// publicCopyFor supplies complete native-language navigation and landing-page
// copy for the six initial markets. A custom language added in the admin falls
// back to English until its template/copy package is installed.
func publicCopyFor(locale string) publicCopy {
	code := strings.ToLower(strings.Split(strings.TrimSpace(locale), "-")[0])
	copy, ok := publicCopies[code]
	if !ok {
		copy = publicCopies["en"]
	}
	return copy
}

var publicCopies = map[string]publicCopy{
	"en": {
		LanguageName: "English", NavServices: "Services", NavGuides: "Shipping guides", NavAbout: "Why us", NavContact: "Contact", SwitchLabel: "Language",
		HeroKicker: "International delivery, made predictable", HeroTitle: "Move goods across borders with fewer surprises.", HeroBody: "Practical express, freight and customs support for businesses shipping to Europe and worldwide.", HeroPrimary: "Explore our services", HeroSecondary: "Read shipping guides",
		TrustLabel: "Built for international trade", TrustValue: "Clear routes · Local expertise · Trackable delivery",
		ServicesKicker: "From pickup to final mile", ServicesTitle: "One logistics partner for every important route.", ServicesBody: "Choose the right balance of speed, cost and customs support for every shipment.",
		Service1Title: "Express delivery", Service1Body: "Time-sensitive parcels with dependable transit options and end-to-end tracking.", Service2Title: "Air & ocean freight", Service2Body: "Flexible capacity for commercial cargo, from urgent air freight to cost-efficient ocean routes.", Service3Title: "Customs support", Service3Body: "Documentation guidance that helps your goods cross borders with less friction.",
		GuidesKicker: "Local market intelligence", GuidesTitle: "Useful answers before you ship.", GuidesBody: "Our latest published guides are managed directly in CZCMS and update here as soon as they go live.", ReadMore: "Read guide", NoGuides: "No guides are published in English yet.",
		ContactKicker: "Plan your next shipment", ContactTitle: "Tell us where your goods need to go.", ContactBody: "Share the origin, destination, cargo type and timing. We will help you identify a practical route.", ContactButton: "Request a route review", FooterNote: "International logistics information and practical shipping guidance.", PreviewNote: "Local preview · Search engines cannot index this page",
		MaintenanceTitle: "We will be back shortly.", MaintenanceBody: "This site is undergoing scheduled maintenance. Please try again soon.", NotFoundTitle: "This route could not be found.", NotFoundBody: "The page may have moved, or it has not been published in this language yet.", NotFoundButton: "Return to the homepage", ArticleBack: "Back to shipping guides", ArticleUpdated: "Updated", ArticlePublished: "Published", ArticleReading: "Reading time", ArticleMinute: "min", ArticleTags: "Topics", ArticleRelated: "More shipping guides",
	},
	"de": {
		LanguageName: "Deutsch", NavServices: "Leistungen", NavGuides: "Versandwissen", NavAbout: "Warum wir", NavContact: "Kontakt", SwitchLabel: "Sprache",
		HeroKicker: "Internationaler Versand mit klarer Planung", HeroTitle: "Grenzüberschreitend liefern – planbar und transparent.", HeroBody: "Express-, Fracht- und Zolllösungen für Unternehmen mit Versandzielen in Europa und weltweit.", HeroPrimary: "Leistungen entdecken", HeroSecondary: "Versandwissen lesen",
		TrustLabel: "Für den internationalen Handel", TrustValue: "Klare Laufzeiten · Lokale Erfahrung · Lückenlose Verfolgung",
		ServicesKicker: "Von der Abholung bis zur Zustellung", ServicesTitle: "Ein Logistikpartner für Ihre wichtigen Routen.", ServicesBody: "Die passende Kombination aus Geschwindigkeit, Kosten und Zollunterstützung für jede Sendung.",
		Service1Title: "Expressversand", Service1Body: "Zeitkritische Pakete mit verlässlichen Laufzeiten und durchgängiger Sendungsverfolgung.", Service2Title: "Luft- und Seefracht", Service2Body: "Flexible Kapazitäten für Handelswaren – schnell per Luft oder wirtschaftlich per See.", Service3Title: "Zollunterstützung", Service3Body: "Praxisnahe Hilfe bei Dokumenten und Abläufen für reibungslosere Grenzprozesse.",
		GuidesKicker: "Wissen für lokale Märkte", GuidesTitle: "Wichtige Antworten vor dem Versand.", GuidesBody: "Neue veröffentlichte Beiträge aus CZCMS erscheinen hier automatisch.", ReadMore: "Beitrag lesen", NoGuides: "Zurzeit sind noch keine deutschen Beiträge veröffentlicht.",
		ContactKicker: "Nächste Sendung planen", ContactTitle: "Wohin sollen Ihre Waren geliefert werden?", ContactBody: "Nennen Sie Start, Ziel, Warenart und Zeitrahmen – wir prüfen eine geeignete Route.", ContactButton: "Route prüfen lassen", FooterNote: "Informationen und Praxistipps für internationale Logistik.", PreviewNote: "Lokale Vorschau · Diese Seite wird nicht indexiert",
		MaintenanceTitle: "Wir sind bald wieder für Sie da.", MaintenanceBody: "Diese Website wird derzeit gewartet. Bitte versuchen Sie es später erneut.", NotFoundTitle: "Diese Route wurde nicht gefunden.", NotFoundBody: "Die Seite wurde möglicherweise verschoben oder ist in dieser Sprache noch nicht veröffentlicht.", NotFoundButton: "Zur Startseite", ArticleBack: "Zurück zum Versandwissen", ArticleUpdated: "Aktualisiert", ArticlePublished: "Veröffentlicht", ArticleReading: "Lesezeit", ArticleMinute: "Min.", ArticleTags: "Themen", ArticleRelated: "Weitere Versandratgeber",
	},
	"fr": {
		LanguageName: "Français", NavServices: "Services", NavGuides: "Guides d'expédition", NavAbout: "Nos atouts", NavContact: "Contact", SwitchLabel: "Langue",
		HeroKicker: "Une logistique internationale plus prévisible", HeroTitle: "Expédiez au-delà des frontières avec plus de sérénité.", HeroBody: "Solutions express, fret et douane pour les entreprises qui livrent en Europe et dans le monde.", HeroPrimary: "Découvrir nos services", HeroSecondary: "Consulter les guides",
		TrustLabel: "Pensé pour le commerce international", TrustValue: "Itinéraires clairs · Expertise locale · Suivi complet",
		ServicesKicker: "De l'enlèvement au dernier kilomètre", ServicesTitle: "Un partenaire logistique pour chaque itinéraire stratégique.", ServicesBody: "Le bon équilibre entre rapidité, coût et accompagnement douanier pour chaque envoi.",
		Service1Title: "Livraison express", Service1Body: "Des colis urgents, des délais fiables et un suivi de bout en bout.", Service2Title: "Fret aérien et maritime", Service2Body: "Des capacités flexibles pour le fret commercial, urgent par avion ou optimisé par mer.", Service3Title: "Assistance douanière", Service3Body: "Des conseils documentaires pour faciliter le passage de vos marchandises aux frontières.",
		GuidesKicker: "Expertise des marchés locaux", GuidesTitle: "Les bonnes réponses avant d'expédier.", GuidesBody: "Les contenus publiés dans CZCMS apparaissent ici dès leur mise en ligne.", ReadMore: "Lire le guide", NoGuides: "Aucun guide en français n'est publié pour le moment.",
		ContactKicker: "Préparer votre prochain envoi", ContactTitle: "Indiquez-nous la destination de vos marchandises.", ContactBody: "Partagez l'origine, la destination, la marchandise et le délai souhaité. Nous étudierons un itinéraire adapté.", ContactButton: "Demander une étude", FooterNote: "Informations et conseils pratiques pour la logistique internationale.", PreviewNote: "Aperçu local · Cette page ne peut pas être indexée",
		MaintenanceTitle: "Nous revenons très bientôt.", MaintenanceBody: "Ce site est en maintenance programmée. Merci de réessayer plus tard.", NotFoundTitle: "Cette page est introuvable.", NotFoundBody: "La page a peut-être été déplacée ou n'est pas encore publiée dans cette langue.", NotFoundButton: "Retour à l'accueil", ArticleBack: "Retour aux guides", ArticleUpdated: "Mis à jour", ArticlePublished: "Publié", ArticleReading: "Temps de lecture", ArticleMinute: "min", ArticleTags: "Sujets", ArticleRelated: "Autres guides d'expédition",
	},
	"es": {
		LanguageName: "Español", NavServices: "Servicios", NavGuides: "Guías de envío", NavAbout: "Por qué elegirnos", NavContact: "Contacto", SwitchLabel: "Idioma",
		HeroKicker: "Logística internacional sin incertidumbre", HeroTitle: "Mueve mercancías entre países con mayor control.", HeroBody: "Soluciones de mensajería exprés, carga y aduanas para empresas que envían a Europa y al resto del mundo.", HeroPrimary: "Ver servicios", HeroSecondary: "Leer guías de envío",
		TrustLabel: "Diseñado para el comercio internacional", TrustValue: "Rutas claras · Experiencia local · Envíos trazables",
		ServicesKicker: "Desde la recogida hasta la última milla", ServicesTitle: "Un único socio logístico para tus rutas clave.", ServicesBody: "Equilibra velocidad, coste y apoyo aduanero en cada envío.",
		Service1Title: "Entrega exprés", Service1Body: "Paquetes urgentes con opciones de tránsito fiables y seguimiento completo.", Service2Title: "Carga aérea y marítima", Service2Body: "Capacidad flexible para mercancía comercial, urgente por aire o eficiente por mar.", Service3Title: "Gestión aduanera", Service3Body: "Orientación documental para facilitar el paso de tus mercancías por frontera.",
		GuidesKicker: "Conocimiento del mercado local", GuidesTitle: "Respuestas útiles antes de enviar.", GuidesBody: "Los contenidos publicados en CZCMS se actualizan aquí de forma inmediata.", ReadMore: "Leer la guía", NoGuides: "Todavía no hay guías publicadas en español.",
		ContactKicker: "Planifica tu próximo envío", ContactTitle: "Cuéntanos adónde deben llegar tus mercancías.", ContactBody: "Indica origen, destino, tipo de carga y plazo. Te ayudaremos a valorar una ruta viable.", ContactButton: "Solicitar revisión de ruta", FooterNote: "Información y orientación práctica sobre logística internacional.", PreviewNote: "Vista previa local · Esta página no será indexada",
		MaintenanceTitle: "Volveremos en breve.", MaintenanceBody: "El sitio está en mantenimiento programado. Inténtalo de nuevo más tarde.", NotFoundTitle: "No hemos encontrado esta ruta.", NotFoundBody: "Es posible que la página se haya movido o que aún no esté publicada en este idioma.", NotFoundButton: "Volver al inicio", ArticleBack: "Volver a las guías", ArticleUpdated: "Actualizado", ArticlePublished: "Publicado", ArticleReading: "Tiempo de lectura", ArticleMinute: "min", ArticleTags: "Temas", ArticleRelated: "Más guías de envío",
	},
	"it": {
		LanguageName: "Italiano", NavServices: "Servizi", NavGuides: "Guide alle spedizioni", NavAbout: "Perché noi", NavContact: "Contatti", SwitchLabel: "Lingua",
		HeroKicker: "Spedizioni internazionali più prevedibili", HeroTitle: "Porta le merci oltre confine con meno imprevisti.", HeroBody: "Soluzioni espresse, merci e dogana per aziende che spediscono in Europa e nel mondo.", HeroPrimary: "Scopri i servizi", HeroSecondary: "Leggi le guide",
		TrustLabel: "Pensato per il commercio internazionale", TrustValue: "Rotte chiare · Esperienza locale · Consegne tracciabili",
		ServicesKicker: "Dal ritiro all'ultimo miglio", ServicesTitle: "Un solo partner logistico per ogni rotta importante.", ServicesBody: "Il giusto equilibrio tra velocità, costi e assistenza doganale per ogni spedizione.",
		Service1Title: "Consegna espressa", Service1Body: "Pacchi urgenti con tempi affidabili e tracciamento completo.", Service2Title: "Trasporto aereo e marittimo", Service2Body: "Capacità flessibile per merci commerciali, urgente via aerea o conveniente via mare.", Service3Title: "Assistenza doganale", Service3Body: "Supporto documentale per rendere più semplice il passaggio delle merci alla frontiera.",
		GuidesKicker: "Conoscenza dei mercati locali", GuidesTitle: "Risposte utili prima della spedizione.", GuidesBody: "I contenuti pubblicati in CZCMS appaiono qui appena vengono messi online.", ReadMore: "Leggi la guida", NoGuides: "Non ci sono ancora guide pubblicate in italiano.",
		ContactKicker: "Pianifica la prossima spedizione", ContactTitle: "Dicci dove devono arrivare le tue merci.", ContactBody: "Condividi origine, destinazione, tipo di merce e tempi: valuteremo una rotta pratica.", ContactButton: "Richiedi una valutazione", FooterNote: "Informazioni e consigli pratici sulla logistica internazionale.", PreviewNote: "Anteprima locale · Questa pagina non verrà indicizzata",
		MaintenanceTitle: "Torniamo presto.", MaintenanceBody: "Il sito è in manutenzione programmata. Riprova più tardi.", NotFoundTitle: "Questa pagina non è stata trovata.", NotFoundBody: "La pagina potrebbe essere stata spostata o non è ancora pubblicata in questa lingua.", NotFoundButton: "Torna alla home", ArticleBack: "Torna alle guide", ArticleUpdated: "Aggiornato", ArticlePublished: "Pubblicato", ArticleReading: "Tempo di lettura", ArticleMinute: "min", ArticleTags: "Argomenti", ArticleRelated: "Altre guide alle spedizioni",
	},
	"nl": {
		LanguageName: "Nederlands", NavServices: "Diensten", NavGuides: "Verzendgidsen", NavAbout: "Waarom wij", NavContact: "Contact", SwitchLabel: "Taal",
		HeroKicker: "Internationaal bezorgen met meer zekerheid", HeroTitle: "Breng goederen over grenzen zonder onnodige verrassingen.", HeroBody: "Express-, vracht- en douaneoplossingen voor bedrijven die naar Europa en wereldwijd verzenden.", HeroPrimary: "Bekijk onze diensten", HeroSecondary: "Lees verzendgidsen",
		TrustLabel: "Gebouwd voor internationale handel", TrustValue: "Duidelijke routes · Lokale kennis · Volgbare levering",
		ServicesKicker: "Van afhaling tot laatste kilometer", ServicesTitle: "Eén logistieke partner voor elke belangrijke route.", ServicesBody: "De juiste balans tussen snelheid, kosten en douaneondersteuning voor iedere zending.",
		Service1Title: "Expressbezorging", Service1Body: "Tijdkritische pakketten met betrouwbare transittijden en volledige tracking.", Service2Title: "Lucht- en zeevracht", Service2Body: "Flexibele capaciteit voor handelsgoederen, snel door de lucht of voordelig over zee.", Service3Title: "Douaneondersteuning", Service3Body: "Praktische documentatiehulp voor een soepeler grensproces.",
		GuidesKicker: "Kennis van lokale markten", GuidesTitle: "Handige antwoorden voordat u verzendt.", GuidesBody: "Nieuw gepubliceerde CZCMS-inhoud verschijnt hier direct na publicatie.", ReadMore: "Lees de gids", NoGuides: "Er zijn nog geen Nederlandstalige gidsen gepubliceerd.",
		ContactKicker: "Plan uw volgende zending", ContactTitle: "Vertel ons waar uw goederen naartoe moeten.", ContactBody: "Deel vertrekpunt, bestemming, goederensoort en planning. Wij helpen een praktische route te bepalen.", ContactButton: "Route laten beoordelen", FooterNote: "Informatie en praktische richtlijnen voor internationale logistiek.", PreviewNote: "Lokale preview · Deze pagina wordt niet geïndexeerd",
		MaintenanceTitle: "We zijn snel weer terug.", MaintenanceBody: "Deze website krijgt gepland onderhoud. Probeer het later opnieuw.", NotFoundTitle: "Deze route is niet gevonden.", NotFoundBody: "De pagina is mogelijk verplaatst of nog niet gepubliceerd in deze taal.", NotFoundButton: "Terug naar de homepage", ArticleBack: "Terug naar verzendgidsen", ArticleUpdated: "Bijgewerkt", ArticlePublished: "Gepubliceerd", ArticleReading: "Leestijd", ArticleMinute: "min", ArticleTags: "Onderwerpen", ArticleRelated: "Meer verzendgidsen",
	},
}
