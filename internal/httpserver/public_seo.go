package httpserver

import (
	"czcms/internal/catalog"
	"strings"
)

type supportMeta struct{ Title, Description string }

// Handwritten summaries distinguish the directory, company and contact intent.
// The detailed company description remains intact in the visible page.
var supportMetadata = map[string]map[string]supportMeta{
	"en": {
		"about":      {"About Our Logistics Company", "Meet FreightVanta, operated by Shenzhen Tang Xiaopang International Logistics Co., Ltd. Explore our logistics services and Shenzhen operating address."},
		"services":   {"China Sourcing & International Logistics Services", "Explore China sourcing, bulk procurement, packaging, inventory storage, private label and worldwide fulfillment services with FreightVanta."},
		"industries": {"Logistics Solutions by Industry", "Plan logistics for cross-border e-commerce, consumer goods, industrial components and time-critical cargo. Explore FreightVanta's industry solutions."},
		"contact":    {"Contact Our Logistics Team", "Contact FreightVanta to discuss your cargo, route, shipment timing and service needs. Find our company details and Shenzhen operating address."},
	},
	"de": {
		"about":      {"Über unser Logistikunternehmen", "Lernen Sie FreightVanta und den Betreiber Shenzhen Tang Xiaopang International Logistics Co., Ltd. kennen: Logistikleistungen und Geschäftsadresse in Shenzhen."},
		"services":   {"China-Beschaffung und internationale Logistik", "Entdecken Sie China-Beschaffung, Großbestellungen, Verpackung, Lagerung, Private Label und weltweites Fulfillment mit FreightVanta."},
		"industries": {"Logistiklösungen nach Branche", "Logistik für E-Commerce, Konsumgüter, Industriekomponenten und zeitkritische Fracht: Finden Sie den passenden Leistungsumfang mit FreightVanta."},
		"contact":    {"Kontakt zum Logistikteam", "Besprechen Sie Waren, Route, Termine und Logistikanforderungen mit FreightVanta. Hier finden Sie Unternehmensangaben und die Geschäftsadresse in Shenzhen."},
	},
	"fr": {
		"about":      {"Notre entreprise de logistique", "Découvrez FreightVanta, exploité par Shenzhen Tang Xiaopang International Logistics Co., Ltd., ses services logistiques et son adresse d'activité à Shenzhen."},
		"services":   {"Sourcing en Chine et services logistiques", "Explorez le sourcing en Chine, les achats en volume, l'emballage, le stockage, la marque blanche et la logistique e-commerce avec FreightVanta."},
		"industries": {"Solutions logistiques par secteur", "Préparez la logistique de l'e-commerce, des biens de consommation, des composants industriels et des marchandises urgentes avec FreightVanta."},
		"contact":    {"Contacter notre équipe logistique", "Échangez avec FreightVanta sur votre marchandise, votre itinéraire, vos délais et vos besoins. Retrouvez les coordonnées de l'entreprise à Shenzhen."},
	},
	"es": {
		"about":      {"Nuestra empresa de logística", "Conozca FreightVanta y su operador Shenzhen Tang Xiaopang International Logistics Co., Ltd.: servicios logísticos y dirección operativa en Shenzhen."},
		"services":   {"Sourcing en China y servicios logísticos", "Explore la búsqueda de proveedores en China, compras al por mayor, embalaje, almacenaje, marca blanca y logística e-commerce con FreightVanta."},
		"industries": {"Soluciones logísticas por sector", "Prepare la logística de e-commerce, bienes de consumo, componentes industriales y mercancía urgente con las soluciones sectoriales de FreightVanta."},
		"contact":    {"Contactar con nuestro equipo logístico", "Consulte a FreightVanta sobre mercancía, rutas, plazos y servicios. Encuentre los datos de la empresa y su dirección operativa en Shenzhen."},
	},
	"it": {
		"about":      {"La nostra impresa logistica", "Scopra FreightVanta, gestita da Shenzhen Tang Xiaopang International Logistics Co., Ltd.: servizi logistici e indirizzo operativo a Shenzhen."},
		"services":   {"Sourcing in Cina e servizi logistici", "Esplori sourcing in Cina, acquisti in volume, imballaggio, magazzino, private label e logistica e-commerce con FreightVanta."},
		"industries": {"Soluzioni logistiche per settore", "Pianifichi la logistica per e-commerce, beni di consumo, componenti industriali e merci urgenti con le soluzioni settoriali di FreightVanta."},
		"contact":    {"Contatti il nostro team logistico", "Parli con FreightVanta di merci, percorsi, tempi e servizi. Trovi i dati dell'impresa e l'indirizzo operativo a Shenzhen."},
	},
	"nl": {
		"about":      {"Over ons logistieke bedrijf", "Maak kennis met FreightVanta, beheerd door Shenzhen Tang Xiaopang International Logistics Co., Ltd.: logistieke diensten en het bedrijfsadres in Shenzhen."},
		"services":   {"Sourcing in China en logistieke diensten", "Ontdek productsourcing in China, bulkinkoop, verpakking, opslag, private label en wereldwijde fulfilment met FreightVanta."},
		"industries": {"Logistieke oplossingen per sector", "Bereid logistiek voor e-commerce, consumentengoederen, industriële onderdelen en tijdkritische vracht voor met de sectoroplossingen van FreightVanta."},
		"contact":    {"Neem contact op met ons logistieke team", "Bespreek goederen, routes, planning en diensten met FreightVanta. Bekijk onze bedrijfsgegevens en het operationele adres in Shenzhen."},
	},
}

func preparePublicSEO(data *publicSitePageData, site catalog.Site) {
	data.PublicPageURL = publicSchemaURL(*data)
	if !isFreightVantaSite(site) || data.NotFound {
		return
	}
	image := data.SocialImageURL
	if image == "" && data.HasContent && !data.IsHome && !data.IsGuideIndex && !data.IsTaxonomy {
		image = editorialImage(data.Content)
	}
	if image == "" && (data.IsGuideIndex || data.IsTaxonomy) && len(data.Published) > 0 {
		image = editorialImage(data.Published[0])
	}
	if image == "" && data.Support != nil {
		if data.Support.Kind == "culture" {
			image = "/assets/company/culture-vision-v1.webp"
		}
		if len(data.Support.Sections) > 0 && data.Support.Sections[0].Image != "" {
			image = data.Support.Sections[0].Image
		}
	}
	if image == "" {
		image = map[string]string{"en": "/assets/images/global-us-freight-hero-v1.jpg", "de": "/assets/images/germany-rail-freight-hero-v1.webp", "fr": "/assets/site-media/pexels-24246926.jpg", "es": "/assets/site-media/pexels-25381526.jpg", "it": "/assets/site-media/pexels-14989379.jpg", "nl": "/assets/site-media/pexels-15348180.jpg"}[strings.Split(data.LanguageCode, "-")[0]]
	}
	data.SocialImageURL = publicSchemaAbsoluteURL(data.PublicOrigin, image)
}

// Only fallback routes are consolidated; editor-owned published slugs win.
func publicBuiltinAlias(slug string, links publicSiteLinks) string {
	kind := supportKind(slug)
	target := map[string]string{"about": links.About, "culture": links.Culture, "contact": links.Contact, "privacy": links.Privacy, "cookies": links.Cookies, "terms": links.Terms, "legal": links.Legal}[kind]
	if slug == "articles" || slug == "insights" {
		return strings.TrimSuffix(links.Services, "/services") + "/guides"
	}
	if strings.EqualFold(strings.Trim(slug, "/"), "ProductService/Sourcing") {
		return strings.TrimSuffix(links.Services, "/services") + "/product-sourcing"
	}
	if copy, ok := serviceTopicCopyForSlug(slug); ok {
		canonical := "services/" + copy.Slug
		if slug != canonical {
			return strings.TrimSuffix(links.Services, "/services") + "/" + canonical
		}
	}
	if target != "" && !strings.HasSuffix(target, "/"+slug) {
		return target
	}
	return ""
}
