package httpserver

import (
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"czcms/internal/catalog"
)

type editorialCopy struct {
	Latest, All, Library, EmptyTitle, EmptyBody, Reset, Previous, Next, Page, Of, Results, Breadcrumb string
}

var editorialCopies = map[string]editorialCopy{
	"en": {"Latest guide", "All topics", "Explore the guides", "New guides are on the way.", "There are no published guides in this selection yet. You can explore all topics or tell us about your shipment.", "View all guides", "Previous page", "Next page", "Page", "of", "guides", "Breadcrumb"},
	"de": {"Aktueller Leitfaden", "Alle Themen", "Leitfäden entdecken", "Neue Leitfäden folgen.", "Für diese Auswahl gibt es noch keine veröffentlichten Leitfäden. Entdecken Sie alle Themen oder besprechen Sie Ihre Sendung mit uns.", "Alle Leitfäden ansehen", "Vorherige Seite", "Nächste Seite", "Seite", "von", "Leitfäden", "Seitennavigation"},
	"fr": {"Dernier guide", "Tous les sujets", "Explorer les guides", "De nouveaux guides arrivent.", "Aucun guide n’est encore publié dans cette sélection. Explorez tous les sujets ou parlez-nous de votre expédition.", "Voir tous les guides", "Page précédente", "Page suivante", "Page", "sur", "guides", "Fil d’Ariane"},
	"es": {"Última guía", "Todos los temas", "Explora las guías", "Próximamente, nuevas guías.", "Todavía no hay guías publicadas en esta selección. Explora todos los temas o cuéntanos qué necesitas enviar.", "Ver todas las guías", "Página anterior", "Página siguiente", "Página", "de", "guías", "Ruta de navegación"},
	"it": {"Ultima guida", "Tutti gli argomenti", "Esplora le guide", "Nuove guide in arrivo.", "Non ci sono ancora guide pubblicate in questa selezione. Esplora tutti gli argomenti o parlaci della tua spedizione.", "Vedi tutte le guide", "Pagina precedente", "Pagina successiva", "Pagina", "di", "guide", "Percorso di navigazione"},
	"nl": {"Nieuwste gids", "Alle onderwerpen", "Ontdek de gidsen", "Nieuwe gidsen volgen binnenkort.", "Er zijn nog geen gidsen gepubliceerd in deze selectie. Bekijk alle onderwerpen of vertel ons over uw zending.", "Bekijk alle gidsen", "Vorige pagina", "Volgende pagina", "Pagina", "van", "gidsen", "Kruimelpad"},
}

type editorialLink struct {
	Label, URL string
	Active     bool
}
type editorialEntry struct {
	Content                               publicContentData
	ImageURL, ReadMore, Minute, Published string
}
type publicEditorialData struct {
	Copy                                editorialCopy
	ReadingCopy                         readingCopy
	Title, Body, ContactURL, EmailLabel string
	Featured                            *editorialEntry
	Entries                             []editorialEntry
	Topics                              []editorialLink
	Total, Page, Pages                  int
	PreviousURL, NextURL                string
}

func editorialPageNumber(r *http.Request) int {
	n, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil || n < 1 || n > 100000 {
		return 1
	}
	return n
}

func editorialPageURL(path, topic string, page int) string {
	query := url.Values{}
	if topic != "" {
		query.Set("topic", topic)
	}
	if page > 1 {
		query.Set("page", strconv.Itoa(page))
	}
	if len(query) != 0 {
		path += "?" + query.Encode()
	}
	return path + "#guide-list"
}

func publicEnquiryURL(data *publicSitePageData) string {
	anchor := map[string]string{"en": "enquiry", "de": "anfrage", "fr": "demande", "es": "solicitud", "it": "richiesta", "nl": "aanvraag"}[data.LanguageCode]
	if anchor == "" {
		anchor = "contact"
	}
	return data.HomePath + "#" + anchor
}

// These three existing logistics plates belong to the supplied service briefs.
// Keep them on the index even if a CMS testing screenshot is attached as media;
// original covers and inline media remain untouched in CMS and detail pages.
func editorialImage(content publicContentData) string {
	switch content.Slug {
	case "temperature-controlled-cargo-planning":
		return "/assets/images/guide-temperature-controlled-cargo-v1.png"
	case "customs-documentation-support":
		return "/assets/images/guide-customs-documentation-v1.png"
	case "express-freight-coordination":
		return "/assets/images/guide-express-freight-v1.png"
	}
	return content.CoverURL
}

func (s *server) prepareEditorialPage(r *http.Request, data *publicSitePageData, categories []string, total, page int, topic string) {
	copy, ok := editorialCopies[data.LanguageCode]
	if !ok {
		copy = editorialCopies["en"]
	}
	readingCopy, ok := readingCopies[data.LanguageCode]
	if !ok {
		readingCopy = readingCopies["en"]
	}
	data.Editorial = &publicEditorialData{Copy: copy, ReadingCopy: readingCopy, Title: data.GuideIndex.Title, Body: data.GuideIndex.Body, ContactURL: publicEnquiryURL(data), Total: total, Page: page, Pages: (total + 11) / 12}
	e := data.Editorial
	e.EmailLabel = map[string]string{"en": "Email address", "de": "E-Mail-Adresse", "fr": "Adresse e-mail", "es": "Correo electrónico", "it": "Indirizzo email", "nl": "E-mailadres"}[data.LanguageCode]
	if e.Pages == 0 {
		e.Pages = 1
	}
	if data.IsTaxonomy {
		e.Title, e.Body = data.TaxonomyName, data.MetaDescription
		e.Pages = 1
	}
	e.Topics = append(e.Topics, editorialLink{Label: copy.All, URL: data.GuideIndexPath, Active: topic == "" && !data.IsTaxonomy})
	for _, category := range categories {
		e.Topics = append(e.Topics, editorialLink{Label: category, URL: editorialPageURL(data.GuideIndexPath, category, 1), Active: category == topic})
	}
	if data.IsTaxonomy {
		e.Topics = append(e.Topics, editorialLink{Label: data.TaxonomyName, URL: data.CurrentPath, Active: true})
	}
	for i, content := range data.Published {
		entry := editorialEntry{Content: content, ImageURL: editorialImage(content), ReadMore: data.Copy.ReadMore, Minute: data.Copy.ArticleMinute, Published: data.Copy.ArticlePublished}
		if i == 0 && page == 1 {
			e.Featured = &entry
		} else {
			e.Entries = append(e.Entries, entry)
		}
	}
	if !data.IsTaxonomy {
		if page > 1 {
			e.PreviousURL = editorialPageURL(data.GuideIndexPath, topic, page-1)
		}
		if page < e.Pages {
			e.NextURL = editorialPageURL(data.GuideIndexPath, topic, page+1)
		}
	}
}

func (s *server) configureEditorialIndex(r *http.Request, data *publicSitePageData, site catalog.Site, locale string, includeLocale bool) error {
	page := editorialPageNumber(r)
	topic := strings.TrimSpace(r.URL.Query().Get("topic"))
	items, total, err := s.Catalog.ListPublishedEditorial(r.Context(), site.ID, locale, topic, (page-1)*12, 12)
	if err != nil {
		return err
	}
	categories, err := s.Catalog.PublishedEditorialCategories(r.Context(), site.ID, locale)
	if err != nil {
		return err
	}
	data.HasContent = len(items) > 0
	for _, item := range items {
		data.Published = append(data.Published, publicContent(item, publicURL(data.BasePath, localeIf(includeLocale, locale), item.Slug)))
	}
	s.prepareEditorialPage(r, data, categories, total, page, topic)
	return nil
}
