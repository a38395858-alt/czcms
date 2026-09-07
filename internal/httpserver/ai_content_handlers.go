package httpserver

import (
	"context"
	"encoding/xml"
	"errors"
	"fmt"
	"html"
	"net/http"
	"regexp"
	"strings"
	"time"
	"unicode/utf8"

	"czcms/internal/catalog"

	"github.com/go-chi/chi/v5"
)

const publicFeedLimit = 20

type publicAIContentSource struct {
	Origin  string
	Locales []string
	Entries []catalog.PublicFeedEntry
}

type rssDocument struct {
	XMLName xml.Name   `xml:"rss"`
	Version string     `xml:"version,attr"`
	Channel rssChannel `xml:"channel"`
}

type rssChannel struct {
	Title         string    `xml:"title"`
	Link          string    `xml:"link"`
	Description   string    `xml:"description"`
	LastBuildDate string    `xml:"lastBuildDate,omitempty"`
	Items         []rssItem `xml:"item"`
}

type rssItem struct {
	Title       string `xml:"title"`
	Link        string `xml:"link"`
	GUID        string `xml:"guid"`
	Description string `xml:"description"`
	PubDate     string `xml:"pubDate,omitempty"`
	Category    string `xml:"category,omitempty"`
}

type atomDocument struct {
	XMLName xml.Name    `xml:"feed"`
	XMLNS   string      `xml:"xmlns,attr"`
	Title   string      `xml:"title"`
	ID      string      `xml:"id"`
	Updated string      `xml:"updated"`
	Links   []atomLink  `xml:"link"`
	Entries []atomEntry `xml:"entry"`
}

type atomLink struct {
	Rel  string `xml:"rel,attr,omitempty"`
	Type string `xml:"type,attr,omitempty"`
	Href string `xml:"href,attr"`
}

type atomEntry struct {
	Title     string      `xml:"title"`
	ID        string      `xml:"id"`
	Updated   string      `xml:"updated"`
	Published string      `xml:"published,omitempty"`
	Summary   atomSummary `xml:"summary"`
	Links     []atomLink  `xml:"link"`
	Category  *atomTerm   `xml:"category,omitempty"`
}

type atomSummary struct {
	Type  string `xml:"type,attr"`
	Value string `xml:",chardata"`
}

type atomTerm struct {
	Term string `xml:"term,attr"`
}

var publicAIHTMLTagPattern = regexp.MustCompile(`(?s)<[^>]*>`)

// siteLLMSPreview, siteRSSPreview and siteAtomPreview are separate from the
// generic preview renderer so their file names can never be mistaken for a
// content slug.
func (s *server) siteLLMSPreview(w http.ResponseWriter, r *http.Request) {
	s.renderAIContentPreview(w, r, s.renderSiteLLMS)
}

func (s *server) siteRSSPreview(w http.ResponseWriter, r *http.Request) {
	s.renderAIContentPreview(w, r, s.renderSiteRSS)
}

func (s *server) siteAtomPreview(w http.ResponseWriter, r *http.Request) {
	s.renderAIContentPreview(w, r, s.renderSiteAtom)
}

func (s *server) renderAIContentPreview(w http.ResponseWriter, r *http.Request, render func(http.ResponseWriter, *http.Request, catalog.Site, bool)) {
	site, err := s.Catalog.SiteByCode(r.Context(), chi.URLParam(r, "siteCode"))
	if errors.Is(err, catalog.ErrNotFound) {
		http.NotFound(w, r)
		return
	}
	if err != nil {
		http.Error(w, "service unavailable", http.StatusServiceUnavailable)
		return
	}
	render(w, r, site, true)
}

func (s *server) loadPublicAIContentSource(ctx context.Context, r *http.Request, site catalog.Site, preview bool) (publicAIContentSource, error) {
	locales, err := s.Catalog.PublicSitemapLocales(ctx, site.ID)
	if err != nil {
		return publicAIContentSource{}, err
	}
	if len(locales) == 0 {
		return publicAIContentSource{}, catalog.ErrNotFound
	}
	entries, err := s.Catalog.ListPublicFeedEntries(ctx, site.ID, publicFeedLimit)
	if err != nil {
		return publicAIContentSource{}, err
	}
	return publicAIContentSource{Origin: s.sitemapOrigin(r, site, preview), Locales: locales, Entries: entries}, nil
}

func (s *server) renderSiteLLMS(w http.ResponseWriter, r *http.Request, site catalog.Site, preview bool) {
	source, ok := s.publicAIContentSource(w, r, site, preview, "llms.txt", "AI 内容入口（llms.txt）")
	if !ok {
		return
	}
	description := publicAIText(firstNonEmpty(site.SEODescription, site.SEOTitle, site.Name), 420)
	var body strings.Builder
	body.WriteString("# ")
	body.WriteString(publicAIText(site.Name, 160))
	body.WriteString("\n\n")
	if description != "" {
		body.WriteString("> ")
		body.WriteString(description)
		body.WriteString("\n\n")
	}
	body.WriteString("## Machine-readable entry points\n\n")
	for _, item := range []struct{ label, path string }{
		{"Sitemap", "/sitemap.xml"},
		{"RSS feed", "/rss.xml"},
		{"Atom feed", "/atom.xml"},
	} {
		body.WriteString("- [")
		body.WriteString(item.label)
		body.WriteString("](")
		body.WriteString(source.Origin + item.path)
		body.WriteString(")\n")
	}
	body.WriteString("\n## Latest indexable articles and products\n\n")
	if len(source.Entries) == 0 {
		body.WriteString("No indexable articles or products have been published yet.\n")
	} else {
		for _, entry := range source.Entries {
			body.WriteString("- [")
			body.WriteString(publicAIText(entry.Title, 180))
			body.WriteString("](")
			body.WriteString(publicAIEntryURL(source, entry))
			body.WriteString(")")
			if summary := publicAIEntrySummary(entry); summary != "" {
				body.WriteString(": ")
				body.WriteString(summary)
			}
			body.WriteByte('\n')
		}
	}
	body.WriteString("\n## Scope\n\nOnly published, indexable content is listed. Canonical URLs, hreflang links and JSON-LD are emitted by the corresponding public HTML pages.\n")
	s.writePublicAIContent(w, r, site, preview, "llms.txt", "text/markdown; charset=utf-8", body.String())
}

func (s *server) renderSiteRSS(w http.ResponseWriter, r *http.Request, site catalog.Site, preview bool) {
	source, ok := s.publicAIContentSource(w, r, site, preview, "rss.xml", "RSS 内容订阅")
	if !ok {
		return
	}
	description := publicAIText(firstNonEmpty(site.SEODescription, site.SEOTitle, site.Name), 420)
	updated := publicAIFeedTimestamp(site.UpdatedAt)
	items := make([]rssItem, 0, len(source.Entries))
	for _, entry := range source.Entries {
		entryURL := publicAIEntryURL(source, entry)
		entryUpdated := publicAIFeedTimestamp(firstNonEmpty(entry.UpdatedAt, entry.PublishedAt))
		if entryUpdated > updated {
			updated = entryUpdated
		}
		items = append(items, rssItem{Title: publicAIText(entry.Title, 240), Link: entryURL, GUID: entryURL, Description: publicAIEntrySummary(entry), PubDate: publicAIFeedRFC822(firstNonEmpty(entry.PublishedAt, entry.UpdatedAt)), Category: publicAIContentTypeLabel(entry.ContentType)})
	}
	document, err := xml.MarshalIndent(rssDocument{Version: "2.0", Channel: rssChannel{Title: publicAIText(site.Name, 160), Link: source.Origin + "/", Description: description, LastBuildDate: publicAIFeedRFC822(updated), Items: items}}, "", "  ")
	if err != nil {
		s.writePublicAIContentError(w, r, site, preview, "rss.xml", "RSS 内容订阅", http.StatusInternalServerError, "feed generation failed")
		return
	}
	s.writePublicAIContent(w, r, site, preview, "rss.xml", "application/rss+xml; charset=utf-8", xml.Header+string(document))
}

func (s *server) renderSiteAtom(w http.ResponseWriter, r *http.Request, site catalog.Site, preview bool) {
	source, ok := s.publicAIContentSource(w, r, site, preview, "atom.xml", "Atom 内容订阅")
	if !ok {
		return
	}
	updated := publicAIFeedTimestamp(site.UpdatedAt)
	entries := make([]atomEntry, 0, len(source.Entries))
	for _, entry := range source.Entries {
		entryURL := publicAIEntryURL(source, entry)
		entryUpdated := publicAIFeedTimestamp(firstNonEmpty(entry.UpdatedAt, entry.PublishedAt))
		if entryUpdated > updated {
			updated = entryUpdated
		}
		category := &atomTerm{Term: publicAIContentTypeLabel(entry.ContentType)}
		entries = append(entries, atomEntry{Title: publicAIText(entry.Title, 240), ID: entryURL, Updated: entryUpdated, Published: publicAIFeedTimestamp(entry.PublishedAt), Summary: atomSummary{Type: "text", Value: publicAIEntrySummary(entry)}, Links: []atomLink{{Rel: "alternate", Type: "text/html", Href: entryURL}}, Category: category})
	}
	if updated == "" {
		updated = time.Now().UTC().Format(time.RFC3339)
	}
	document, err := xml.MarshalIndent(atomDocument{XMLNS: "http://www.w3.org/2005/Atom", Title: publicAIText(site.Name, 160), ID: source.Origin + "/", Updated: updated, Links: []atomLink{{Rel: "self", Type: "application/atom+xml", Href: source.Origin + "/atom.xml"}, {Rel: "alternate", Type: "text/html", Href: source.Origin + "/"}}, Entries: entries}, "", "  ")
	if err != nil {
		s.writePublicAIContentError(w, r, site, preview, "atom.xml", "Atom 内容订阅", http.StatusInternalServerError, "feed generation failed")
		return
	}
	s.writePublicAIContent(w, r, site, preview, "atom.xml", "application/atom+xml; charset=utf-8", xml.Header+string(document))
}

func (s *server) publicAIContentSource(w http.ResponseWriter, r *http.Request, site catalog.Site, preview bool, route, kind string) (publicAIContentSource, bool) {
	if site.Status == "disabled" {
		s.writePublicAIContentError(w, r, site, preview, route, kind, http.StatusNotFound, "not found")
		return publicAIContentSource{}, false
	}
	source, err := s.loadPublicAIContentSource(r.Context(), r, site, preview)
	if errors.Is(err, catalog.ErrNotFound) {
		s.writePublicAIContentError(w, r, site, preview, route, kind, http.StatusNotFound, "not found")
		return publicAIContentSource{}, false
	}
	if err != nil {
		s.writePublicAIContentError(w, r, site, preview, route, kind, http.StatusServiceUnavailable, "service unavailable")
		return publicAIContentSource{}, false
	}
	return source, true
}

func (s *server) writePublicAIContentError(w http.ResponseWriter, r *http.Request, site catalog.Site, preview bool, route, kind string, status int, message string) {
	s.trackSpiderRequest(r, site, preview, route, publicSitePageData{}, kind, status)
	if status == http.StatusNotFound {
		http.NotFound(w, r)
		return
	}
	http.Error(w, message, status)
}

func (s *server) writePublicAIContent(w http.ResponseWriter, r *http.Request, site catalog.Site, preview bool, route, contentType, body string) {
	w.Header().Set("Content-Type", contentType)
	if preview || r.Header.Get("X-CZCMS-Local-Preview") == "1" {
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("X-Robots-Tag", "noindex, nofollow")
	} else {
		w.Header().Set("Cache-Control", "public, max-age=300, stale-while-revalidate=900")
	}
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(body))
	s.trackSpiderRequest(r, site, preview, route, publicSitePageData{}, "AI 内容入口", http.StatusOK)
}

func publicAIEntryURL(source publicAIContentSource, entry catalog.PublicFeedEntry) string {
	return source.Origin + publicURL("", localeIf(len(source.Locales) > 1, entry.Locale), entry.Slug)
}

func publicAIEntrySummary(entry catalog.PublicFeedEntry) string {
	return publicAIText(firstNonEmpty(entry.Summary, entry.MetaDescription), 420)
}

func publicAIContentTypeLabel(value string) string {
	if value == "product" {
		return "Product"
	}
	return "Article"
}

func publicAIFeedTimestamp(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	parsed, err := time.Parse(time.RFC3339Nano, value)
	if err != nil {
		return value
	}
	return parsed.UTC().Format(time.RFC3339)
}

func publicAIFeedRFC822(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	parsed, err := time.Parse(time.RFC3339Nano, value)
	if err != nil {
		return ""
	}
	return parsed.UTC().Format(time.RFC1123Z)
}

func publicAIText(value string, maxRunes int) string {
	value = html.UnescapeString(publicAIHTMLTagPattern.ReplaceAllString(value, " "))
	value = strings.Join(strings.Fields(value), " ")
	if maxRunes < 1 || utf8.RuneCountInString(value) <= maxRunes {
		return value
	}
	runes := []rune(value)
	return strings.TrimSpace(string(runes[:maxRunes])) + "…"
}

type seoAIContentSiteResponse struct {
	catalog.SitemapSiteStatus
	LLMSURL       string                   `json:"llms_url"`
	RSSURL        string                   `json:"rss_url"`
	AtomURL       string                   `json:"atom_url"`
	PublicLLMSURL string                   `json:"public_llms_url"`
	PublicRSSURL  string                   `json:"public_rss_url"`
	PublicAtomURL string                   `json:"public_atom_url"`
	Content       catalog.AIContentSummary `json:"content"`
	PublicReady   bool                     `json:"public_ready"`
}

// seoAIContent reports the actual machine-readable outputs for every
// authorised site. It reports endpoint availability, not third-party model
// indexing, because no AI provider guarantees crawl or citation on request.
func (s *server) seoAIContent(w http.ResponseWriter, r *http.Request) {
	session := sessionFromContext(r.Context())
	sites, err := s.Catalog.ListSitemapSites(r.Context(), session.User.ID)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取 AI 内容入口状态失败")
		return
	}
	response := make([]seoAIContentSiteResponse, 0, len(sites))
	var publicReady, feedContent int64
	for _, site := range sites {
		summary, summaryErr := s.Catalog.PublicAIContentSummary(r.Context(), site.SiteID)
		if summaryErr != nil {
			writeJSONError(w, http.StatusInternalServerError, "读取 AI 内容覆盖范围失败")
			return
		}
		local := fmt.Sprintf("http://localhost:%d", site.LocalPort)
		publicOrigin := ""
		if site.PrimaryDomain != "" {
			scheme := "https"
			if !s.Config.PublicHTTPS {
				scheme = "http"
			}
			publicOrigin = scheme + "://" + site.PrimaryDomain
		}
		ready := site.Status == "active" && site.LanguageCount > 0 && publicOrigin != ""
		if ready {
			publicReady++
		}
		feedContent += summary.ArticleCount + summary.ProductCount
		response = append(response, seoAIContentSiteResponse{
			SitemapSiteStatus: site, LLMSURL: local + "/llms.txt", RSSURL: local + "/rss.xml", AtomURL: local + "/atom.xml",
			PublicLLMSURL: publicOrigin + "/llms.txt", PublicRSSURL: publicOrigin + "/rss.xml", PublicAtomURL: publicOrigin + "/atom.xml",
			Content: summary, PublicReady: ready,
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"sites":   response,
		"summary": map[string]int64{"site_count": int64(len(response)), "public_ready_count": publicReady, "feed_content_count": feedContent, "pending_domain_count": int64(len(response)) - publicReady},
	})
}
