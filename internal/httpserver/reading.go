package httpserver

import (
	"bytes"
	"fmt"
	"html/template"
	"net/http"
	"strings"

	"czcms/internal/catalog"
	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
)

type readingHeading struct{ ID, Title, Level string }
type readingCopy struct {
	Contents, Previous, Next, Navigation, Continue, Gallery string
	HelpTitle, HelpBody, CTATitle, CTABody, Prepare         string
	Checklist                                               []string
}
type publicReadingData struct {
	Copy           readingCopy
	Headings       []readingHeading
	Previous, Next *publicContentData
	ContactURL     string
}

var readingCopies = map[string]readingCopy{
	"en": {Contents: "On this page", Previous: "Previous article", Next: "Next article", Navigation: "Article navigation", Continue: "Continue reading", Gallery: "View attached images", HelpTitle: "Planning a shipment?", HelpBody: "Bring your route, timing and handling questions to the next conversation.", CTATitle: "Turn what you’ve read into a practical plan.", CTABody: "Share the cargo, route and constraints you’re working with. Use the enquiry form to start a focused conversation about the next step.", Prepare: "Useful details to include", Checklist: []string{"Cargo and origin / destination", "Ready date and required delivery date", "Packaging, handling and receiving requirements"}},
	"de": {Contents: "Auf dieser Seite", Previous: "Vorheriger Beitrag", Next: "Nächster Beitrag", Navigation: "Beitragsnavigation", Continue: "Weiterlesen", Gallery: "Angehängte Bilder ansehen", HelpTitle: "Planen Sie eine Sendung?", HelpBody: "Bringen Sie Route, Termine und Fragen zur Handhabung in das nächste Gespräch ein.", CTATitle: "Aus dem Leitfaden wird Ihr nächster Schritt.", CTABody: "Teilen Sie Waren, Route und Anforderungen über das Anfrageformular mit, um die nächsten Schritte zu besprechen.", Prepare: "Hilfreiche Angaben für Ihre Anfrage", Checklist: []string{"Waren sowie Start- und Zielort", "Bereitstellungsdatum und gewünschter Liefertermin", "Verpackung, Handhabung und Empfangsvorgaben"}},
	"fr": {Contents: "Dans ce guide", Previous: "Article précédent", Next: "Article suivant", Navigation: "Navigation entre les articles", Continue: "Poursuivre la lecture", Gallery: "Voir les images jointes", HelpTitle: "Une expédition à préparer ?", HelpBody: "Préparez votre itinéraire, vos dates et vos questions de manutention pour notre échange.", CTATitle: "Passez du guide à un plan concret.", CTABody: "Partagez la marchandise, l’itinéraire et les contraintes de votre projet dans le formulaire pour discuter de la prochaine étape.", Prepare: "Les informations utiles à transmettre", Checklist: []string{"Marchandise, origine et destination", "Date de disponibilité et date de livraison souhaitée", "Emballage, manutention et conditions de réception"}},
	"es": {Contents: "En esta guía", Previous: "Artículo anterior", Next: "Artículo siguiente", Navigation: "Navegación entre artículos", Continue: "Sigue leyendo", Gallery: "Ver imágenes adjuntas", HelpTitle: "¿Estás preparando un envío?", HelpBody: "Reúne la ruta, los plazos y las preguntas de manipulación para la próxima conversación.", CTATitle: "Convierte esta guía en un plan concreto.", CTABody: "Comparte la mercancía, la ruta y las restricciones de tu proyecto en el formulario para hablar del siguiente paso.", Prepare: "Datos útiles para tu solicitud", Checklist: []string{"Mercancía, origen y destino", "Fecha de disponibilidad y entrega necesaria", "Embalaje, manipulación y requisitos de recepción"}},
	"it": {Contents: "In questa guida", Previous: "Articolo precedente", Next: "Articolo successivo", Navigation: "Navigazione tra gli articoli", Continue: "Continua a leggere", Gallery: "Vedi le immagini allegate", HelpTitle: "Stai preparando una spedizione?", HelpBody: "Porta percorso, tempi e domande sulla movimentazione al prossimo confronto.", CTATitle: "Dalla guida a un piano concreto.", CTABody: "Condividi merce, percorso e vincoli del progetto nel modulo per discutere il prossimo passo.", Prepare: "Informazioni utili da includere", Checklist: []string{"Merce, origine e destinazione", "Data di disponibilità e consegna richiesta", "Imballaggio, movimentazione e requisiti di ricezione"}},
	"nl": {Contents: "In deze gids", Previous: "Vorig artikel", Next: "Volgend artikel", Navigation: "Artikelnavigatie", Continue: "Lees verder", Gallery: "Bijgevoegde afbeeldingen bekijken", HelpTitle: "Een zending voorbereiden?", HelpBody: "Neem uw route, planning en vragen over behandeling mee naar het volgende gesprek.", CTATitle: "Van deze gids naar een praktisch plan.", CTABody: "Deel de goederen, route en voorwaarden via het aanvraagformulier om de volgende stap te bespreken.", Prepare: "Handige gegevens voor uw aanvraag", Checklist: []string{"Goederen, vertrekpunt en bestemming", "Gereeddatum en gewenste leverdatum", "Verpakking, behandeling en ontvangstvoorwaarden"}},
}

func (s *server) prepareReadingPage(r *http.Request, data *publicSitePageData, site catalog.Site, content catalog.ContentLocale) {
	if content.ContentType != "article" && content.ContentType != "product" {
		return
	}
	copy, ok := readingCopies[data.LanguageCode]
	if !ok {
		copy = readingCopies["en"]
	}
	body, headings := readingOutline(string(data.Content.Body))
	data.Content.Body = template.HTML(body)
	data.Reading = &publicReadingData{Copy: copy, Headings: headings, ContactURL: publicEnquiryURL(data)}
	previous, next, err := s.Catalog.PublishedContentNeighbors(r.Context(), content)
	if err != nil {
		s.Logger.Warn("读取内容上下篇失败", "error", err, "content_id", content.ID)
		return
	}
	for _, entry := range []struct {
		source *catalog.ContentLocale
		target **publicContentData
	}{{previous, &data.Reading.Previous}, {next, &data.Reading.Next}} {
		if entry.source == nil {
			continue
		}
		item := publicContent(*entry.source, publicURL(data.BasePath, localeIf(site.LanguageCount > 1, content.Locale), entry.source.Slug))
		*entry.target = &item
	}
}

// Add real heading anchors server-side so the table of contents also works
// without JavaScript. Existing authored IDs and all body content are retained.
func readingOutline(body string) (string, []readingHeading) {
	root := &html.Node{Type: html.ElementNode, Data: "div", DataAtom: atom.Div}
	nodes, err := html.ParseFragment(strings.NewReader(body), root)
	if err != nil {
		return body, nil
	}
	used := map[string]bool{}
	var walk func(*html.Node, func(*html.Node))
	walk = func(n *html.Node, visit func(*html.Node)) {
		visit(n)
		for child := n.FirstChild; child != nil; child = child.NextSibling {
			walk(child, visit)
		}
	}
	for _, n := range nodes {
		root.AppendChild(n)
		walk(n, func(n *html.Node) {
			for _, a := range n.Attr {
				if a.Key == "id" {
					used[a.Val] = true
				}
			}
		})
	}
	var headings []readingHeading
	walk(root, func(n *html.Node) {
		if n.Type != html.ElementNode || (n.Data != "h2" && n.Data != "h3") {
			return
		}
		var label strings.Builder
		walk(n, func(c *html.Node) {
			if c.Type == html.TextNode {
				label.WriteString(c.Data)
			}
		})
		title := strings.Join(strings.Fields(label.String()), " ")
		if title == "" {
			return
		}
		id := ""
		for _, a := range n.Attr {
			if a.Key == "id" {
				id = a.Val
			}
		}
		if id == "" {
			for index := len(headings) + 1; ; index++ {
				id = fmt.Sprintf("fv-reading-section-%d", index)
				if !used[id] {
					break
				}
			}
			used[id] = true
			n.Attr = append(n.Attr, html.Attribute{Key: "id", Val: id})
		}
		headings = append(headings, readingHeading{ID: id, Title: title, Level: n.Data})
	})
	var output bytes.Buffer
	for n := root.FirstChild; n != nil; n = n.NextSibling {
		if html.Render(&output, n) != nil {
			return body, nil
		}
	}
	return output.String(), headings
}
