package httpserver

import (
	"encoding/json"
	"html/template"
	"net/http"
	"strings"

	"czcms/internal/catalog"
)

type publicSiteLinks struct{ Services, Industries, About, Contact, Privacy, Cookies, Terms, Legal, Process string }
type supportSection struct{ Title, Body, URL, Image string }
type supportCopy struct {
	About, Contact, Services, Industries, Privacy, Cookies, Terms, Legal               string
	Name, Email, Company, Origin, Destination, Brief, Consent, Send, Prepare, Required string
	PrivacyBody, CookiesBody, TermsBody, LegalBody, MissingDetails                     string
}
type publicSupportData struct {
	Kind, Title, Body string
	Copy              supportCopy
	Sections          []supportSection
	ContactURL        string
	Notice            string
}

var supportCopies = map[string]supportCopy{
	"en": {About: "About FreightVanta", Contact: "Contact FreightVanta", Services: "Services", Industries: "Industries", Privacy: "Privacy information", Cookies: "Cookies and browser storage", Terms: "Terms of use", Legal: "Website operator information", Name: "Name", Email: "Work email", Company: "Company", Origin: "Origin", Destination: "Destination", Brief: "What do you need to move?", Consent: "I agree to the use of these details to review my enquiry and contact me.", Send: "Send enquiry", Prepare: "Helpful to include", Required: "Fields marked * are required.", PrivacyBody: "The enquiry form sends your contact details and shipment brief to the website's enquiry inbox for review and follow-up. Share only information needed for your request. For questions about your information, use the contact form.", CookiesBody: "The website uses browser data for site operation, form protection and any preferences you choose. Site visits and interaction events may be recorded. Do not include payment details or sensitive personal information in an enquiry.", TermsBody: "Website content is general planning information. Service scope, pricing, responsibilities and timing require written confirmation. Guides do not replace qualified legal, tax or customs advice.", LegalBody: "FreightVanta is the brand shown on this website. Use the enquiry form to request operator or service information.", MissingDetails: "The operator's legal name, registered address and direct contact details have not yet been provided. This summary is incomplete and does not replace the operator's full legal or privacy notice."},
	"de": {About: "Über FreightVanta", Contact: "Kontakt zu FreightVanta", Services: "Leistungen", Industries: "Branchen", Privacy: "Datenschutzhinweise", Cookies: "Cookies und Browserspeicher", Terms: "Nutzungsbedingungen", Legal: "Angaben zum Websitebetreiber", Name: "Name", Email: "Geschäftliche E-Mail", Company: "Unternehmen", Origin: "Ausgangspunkt", Destination: "Ziel", Brief: "Was möchten Sie versenden?", Consent: "Ich stimme der Nutzung dieser Angaben zur Bearbeitung meiner Anfrage und zur Kontaktaufnahme zu.", Send: "Anfrage senden", Prepare: "Hilfreiche Angaben", Required: "Mit * gekennzeichnete Felder sind erforderlich.", PrivacyBody: "Das Anfrageformular übermittelt Ihre Kontaktdaten und Versandangaben an den Anfrageeingang dieser Website zur Bearbeitung und Rückmeldung. Teilen Sie nur die für Ihre Anfrage erforderlichen Informationen. Fragen zu Ihren Daten können Sie über das Kontaktformular stellen.", CookiesBody: "Die Website verwendet Browserdaten für den Betrieb, den Formularschutz und gewählte Einstellungen. Seitenbesuche und Interaktionen können erfasst werden. Übermitteln Sie keine Zahlungsdaten oder sensiblen persönlichen Informationen im Anfrageformular.", TermsBody: "Die Website bietet allgemeine Planungshinweise. Leistungsumfang, Preise, Verantwortlichkeiten und Termine müssen schriftlich bestätigt werden. Leitfäden ersetzen keine qualifizierte Rechts-, Steuer- oder Zollberatung.", LegalBody: "FreightVanta ist die auf dieser Website verwendete Marke. Angaben zum Betreiber oder zu Leistungen können über das Anfrageformular erfragt werden.", MissingDetails: "Firmenname, eingetragene Anschrift und direkte Kontaktdaten des Betreibers wurden noch nicht bereitgestellt. Diese unvollständige Zusammenfassung ersetzt weder ein vollständiges Impressum noch eine Datenschutzerklärung."},
	"fr": {About: "À propos de FreightVanta", Contact: "Contacter FreightVanta", Services: "Services", Industries: "Secteurs", Privacy: "Informations sur la confidentialité", Cookies: "Cookies et stockage du navigateur", Terms: "Conditions d’utilisation", Legal: "Informations sur l’éditeur", Name: "Nom", Email: "E-mail professionnel", Company: "Entreprise", Origin: "Origine", Destination: "Destination", Brief: "Que souhaitez-vous expédier ?", Consent: "J’accepte l’utilisation de ces informations pour examiner ma demande et me recontacter.", Send: "Envoyer la demande", Prepare: "Informations utiles", Required: "Les champs marqués d’un * sont obligatoires.", PrivacyBody: "Le formulaire transmet vos coordonnées et votre projet d’expédition à la boîte de réception des demandes du site pour examen et suivi. Ne partagez que les informations utiles à votre demande. Utilisez le formulaire de contact pour toute question concernant vos données.", CookiesBody: "Le site utilise des données du navigateur pour son fonctionnement, la protection des formulaires et les préférences choisies. Les visites et interactions peuvent être enregistrées. N’incluez pas de données de paiement ou de données personnelles sensibles dans une demande.", TermsBody: "Le contenu du site fournit des informations générales de planification. Le périmètre, les prix, les responsabilités et les délais doivent être confirmés par écrit. Les guides ne remplacent pas un conseil juridique, fiscal ou douanier qualifié.", LegalBody: "FreightVanta est la marque affichée sur ce site. Utilisez le formulaire de demande pour obtenir des informations sur l’éditeur ou les services.", MissingDetails: "La raison sociale, l’adresse du siège et les coordonnées directes de l’éditeur n’ont pas encore été fournies. Ce résumé incomplet ne remplace pas les mentions légales ou la politique de confidentialité complètes."},
	"es": {About: "Sobre FreightVanta", Contact: "Contactar con FreightVanta", Services: "Servicios", Industries: "Sectores", Privacy: "Información de privacidad", Cookies: "Cookies y almacenamiento del navegador", Terms: "Condiciones de uso", Legal: "Información del titular del sitio", Name: "Nombre", Email: "Correo profesional", Company: "Empresa", Origin: "Origen", Destination: "Destino", Brief: "¿Qué necesitas transportar?", Consent: "Acepto el uso de estos datos para revisar mi solicitud y contactar conmigo.", Send: "Enviar consulta", Prepare: "Datos útiles", Required: "Los campos marcados con * son obligatorios.", PrivacyBody: "El formulario envía tus datos de contacto y la información del envío a la bandeja de consultas del sitio para su revisión y seguimiento. Comparte solo los datos necesarios. Utiliza el formulario de contacto para preguntar por tus datos.", CookiesBody: "El sitio utiliza datos del navegador para funcionar, proteger los formularios y conservar las preferencias elegidas. Las visitas e interacciones pueden registrarse. No incluyas datos de pago ni datos personales sensibles en una consulta.", TermsBody: "El contenido ofrece información general de planificación. El alcance, los precios, las responsabilidades y los plazos requieren confirmación por escrito. Las guías no sustituyen el asesoramiento jurídico, fiscal o aduanero cualificado.", LegalBody: "FreightVanta es la marca que aparece en este sitio. Utiliza el formulario para solicitar información del titular o de los servicios.", MissingDetails: "Todavía no se han facilitado la razón social, el domicilio registrado ni los datos de contacto directos del titular. Este resumen incompleto no sustituye un aviso legal o una política de privacidad completos."},
	"it": {About: "Chi è FreightVanta", Contact: "Contatta FreightVanta", Services: "Servizi", Industries: "Settori", Privacy: "Informazioni sulla privacy", Cookies: "Cookie e memoria del browser", Terms: "Condizioni d’uso", Legal: "Informazioni sul gestore del sito", Name: "Nome", Email: "E-mail di lavoro", Company: "Azienda", Origin: "Origine", Destination: "Destinazione", Brief: "Che cosa devi spedire?", Consent: "Acconsento all’uso di questi dati per esaminare la richiesta e ricontattarmi.", Send: "Invia richiesta", Prepare: "Informazioni utili", Required: "I campi contrassegnati con * sono obbligatori.", PrivacyBody: "Il modulo invia i dati di contatto e le informazioni sulla spedizione alla casella delle richieste del sito per la valutazione e il seguito. Condividi solo i dati necessari. Per domande sui tuoi dati, utilizza il modulo di contatto.", CookiesBody: "Il sito utilizza dati del browser per il funzionamento, la protezione dei moduli e le preferenze scelte. Visite e interazioni possono essere registrate. Non includere dati di pagamento o dati personali sensibili nelle richieste.", TermsBody: "Il contenuto offre indicazioni generali di pianificazione. Ambito, prezzi, responsabilità e tempi richiedono conferma scritta. Le guide non sostituiscono una consulenza legale, fiscale o doganale qualificata.", LegalBody: "FreightVanta è il marchio mostrato su questo sito. Utilizza il modulo per richiedere informazioni sul gestore o sui servizi.", MissingDetails: "Ragione sociale, sede legale e contatti diretti del gestore non sono ancora stati forniti. Questo riepilogo incompleto non sostituisce le informazioni legali o l’informativa privacy complete."},
	"nl": {About: "Over FreightVanta", Contact: "Contact met FreightVanta", Services: "Diensten", Industries: "Sectoren", Privacy: "Privacyinformatie", Cookies: "Cookies en browseropslag", Terms: "Gebruiksvoorwaarden", Legal: "Informatie over de websitebeheerder", Name: "Naam", Email: "Zakelijk e-mailadres", Company: "Bedrijf", Origin: "Vertrekpunt", Destination: "Bestemming", Brief: "Wat wilt u vervoeren?", Consent: "Ik stem in met het gebruik van deze gegevens om mijn aanvraag te beoordelen en contact met mij op te nemen.", Send: "Aanvraag versturen", Prepare: "Handige gegevens", Required: "Velden met * zijn verplicht.", PrivacyBody: "Het formulier verstuurt uw contactgegevens en zendingsinformatie naar de aanvrageninbox van deze website voor beoordeling en opvolging. Deel alleen informatie die nodig is voor uw aanvraag. Gebruik het contactformulier voor vragen over uw gegevens.", CookiesBody: "De website gebruikt browsergegevens voor de werking, formulierbeveiliging en gekozen voorkeuren. Bezoeken en interacties kunnen worden vastgelegd. Vermeld geen betaalgegevens of gevoelige persoonsgegevens in een aanvraag.", TermsBody: "De inhoud biedt algemene planningsinformatie. Omvang, prijzen, verantwoordelijkheden en tijden vereisen schriftelijke bevestiging. Gidsen vervangen geen gekwalificeerd juridisch, fiscaal of douaneadvies.", LegalBody: "FreightVanta is het merk op deze website. Gebruik het formulier om informatie over de beheerder of diensten aan te vragen.", MissingDetails: "De juridische naam, het geregistreerde adres en directe contactgegevens van de beheerder zijn nog niet verstrekt. Deze onvolledige samenvatting vervangt geen volledige juridische of privacyverklaring."},
}

func siteLinks(data *publicSitePageData) publicSiteLinks {
	base := strings.TrimSuffix(data.HomePath, "/")
	paths := map[string][5]string{"en": {"about", "contact", "privacy", "terms", "legal"}, "de": {"ueber-uns", "kontakt", "datenschutz", "agb", "impressum"}, "fr": {"a-propos", "contact", "confidentialite", "cgv", "mentions-legales"}, "es": {"quienes-somos", "contacto", "privacidad", "condiciones", "aviso-legal"}, "it": {"chi-siamo", "contatti", "privacy", "condizioni", "note-legali"}, "nl": {"over-ons", "contact", "privacy", "voorwaarden", "bedrijfsgegevens"}}
	p, ok := paths[data.LanguageCode]
	if !ok {
		p = paths["en"]
	}
	process := map[string]string{"en": "process", "de": "ablauf", "fr": "methode", "es": "proceso", "it": "metodo", "nl": "proces"}[data.LanguageCode]
	return publicSiteLinks{Services: base + "/services", Industries: base + "/industries", About: base + "/" + p[0], Contact: base + "/" + p[1], Privacy: base + "/" + p[2], Cookies: base + "/cookies", Terms: base + "/" + p[3], Legal: base + "/" + p[4], Process: data.HomePath + "#" + process}
}

func supportKind(slug string) string {
	switch strings.ToLower(strings.Trim(slug, "/")) {
	case "contact", "contact-us", "kontakt", "contacto", "contatti":
		return "contact"
	case "about", "ueber-uns", "a-propos", "quienes-somos", "chi-siamo", "over-ons":
		return "about"
	case "services":
		return "services"
	case "industries":
		return "industries"
	case "privacy", "datenschutz", "confidentialite", "privacidad":
		return "privacy"
	case "cookies", "cookie", "politica-de-cookies":
		return "cookies"
	case "terms", "agb", "cgv", "condiciones", "condizioni", "voorwaarden":
		return "terms"
	case "legal", "impressum", "mentions-legales", "aviso-legal", "note-legali", "bedrijfsgegevens", "juridisch":
		return "legal"
	}
	return ""
}

// CMS-authored published pages win; these fallbacks supply missing navigation
// destinations without creating records or inventing an operator identity.
func (s *server) configureSupportPage(r *http.Request, data *publicSitePageData, site catalog.Site, preview bool, network []catalog.PublicLanguageSite, slug string) bool {
	kind := supportKind(slug)
	if kind == "" {
		return false
	}
	copy, ok := supportCopies[data.LanguageCode]
	if !ok {
		copy = supportCopies["en"]
	}
	title := map[string]string{"about": copy.About, "contact": copy.Contact, "services": copy.Services, "industries": copy.Industries, "privacy": copy.Privacy, "cookies": copy.Cookies, "terms": copy.Terms, "legal": copy.Legal}[kind]
	p := &publicSupportData{Kind: kind, Title: title, Copy: copy, Body: data.Copy.HeroBody, ContactURL: publicEnquiryURL(data)}
	switch kind {
	case "contact":
		p.Body = data.Copy.ContactBody
		context, _ := json.Marshal(map[string]any{"locale": data.LanguageCode, "siteId": site.ID, "basePath": data.BasePath, "formToken": publicFormToken(s, 0, site.ID)})
		data.EnquiryContext = template.JS(context)
	case "about":
		for _, item := range data.Copy.Advantages {
			p.Sections = append(p.Sections, supportSection{Title: item.Title, Body: item.Body})
		}
	case "services", "industries":
		s.loadImportedTopics()
		routes := []string{"product-sourcing", "services/bulk-procurement", "services/packaging-branding", "services/inventory-storage", "services/private-white-label", "services/worldwide-fulfillment"}
		if kind == "industries" {
			routes = []string{"industries/cross-border-ecommerce", "industries/consumer-goods", "industries/industrial-components", "industries/time-critical-cargo"}
		}
		base := strings.TrimSuffix(data.HomePath, "/")
		for _, route := range routes {
			if item, exists := s.importedTopics.pages[data.LanguageCode+"/"+route]; exists {
				p.Sections = append(p.Sections, supportSection{Title: firstNonEmpty(item.ServiceName, item.Heading), Body: item.Body, URL: base + "/" + route, Image: item.Image})
			}
		}
	case "privacy":
		p.Body = copy.PrivacyBody
		p.Notice = copy.MissingDetails
	case "cookies":
		p.Body = copy.CookiesBody
	case "terms":
		p.Body = copy.TermsBody
	case "legal":
		p.Body = copy.LegalBody
		p.Notice = copy.MissingDetails
	}
	data.Support = p
	data.IsHome = false
	data.PageTitle = title + " | FreightVanta"
	data.MetaDescription = p.Body
	data.OGTitle = data.PageTitle
	data.OGDescription = p.Body
	if kind == "privacy" || kind == "legal" || kind == "terms" || kind == "cookies" {
		data.RobotsIndex = false
	}
	s.populatePublicNetworkForFixedPath(r, data, site, preview, network, slug)
	data.StructuredData = template.JS(publicJSONLD(*data, site))
	return true
}
