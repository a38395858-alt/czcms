package httpserver

import (
	"bytes"
	"encoding/json"
	"html"
	"html/template"
	"io/fs"
	"net/http"
	"path"
	"strings"
	"sync"

	"czcms/internal/catalog"
)

const importedTopicRoot = "freightvanta-topic-v18/"

type importedTopicPage struct {
	File, CSS, JS, Title, Description, Heading, Body, ServiceName, Image string
	Keywords                                                             []string
	Preloads                                                             []string
	FAQs                                                                 []struct{ Question, Answer string }
	markup                                                               string
}

type importedTopicBundle struct {
	once  sync.Once
	pages map[string]importedTopicPage
	err   error
}

func (s *server) loadImportedTopics() {
	s.importedTopics.once.Do(func() {
		if s.Assets == nil {
			return
		}
		source, err := fs.ReadFile(s.Assets, importedTopicRoot+"manifest.json")
		if err != nil {
			s.importedTopics.err = err
			return
		}
		pages := map[string]importedTopicPage{}
		if err = json.Unmarshal(source, &pages); err != nil {
			s.importedTopics.err = err
			return
		}
		for key, page := range pages {
			if path.Base(page.File) != page.File {
				continue
			}
			body, readErr := fs.ReadFile(s.Assets, importedTopicRoot+"pages/"+page.File)
			if readErr != nil {
				s.importedTopics.err = readErr
				return
			}
			page.markup = string(body)
			pages[key] = page
		}
		s.importedTopics.pages = pages
	})
}

type importedTopicContext struct {
	Locale    string            `json:"locale"`
	Route     string            `json:"route"`
	BasePath  string            `json:"basePath"`
	SiteID    int64             `json:"siteId"`
	SiteURL   string            `json:"siteUrl"`
	Canonical string            `json:"canonical"`
	Preview   bool              `json:"preview"`
	Languages map[string]string `json:"languages"`
	FormToken string            `json:"formToken"`
}

var importedTopicDocument = template.Must(template.New("imported-topic").Parse(`<!doctype html>
<html lang="{{.Language}}" dir="{{.Direction}}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{.Page.Title}}</title><meta name="description" content="{{.Page.Description}}">
<meta name="keywords" content="{{.Keywords}}"><meta name="robots" content="{{.Robots}}">
<meta name="theme-color" content="{{.Color}}">
{{if .Canonical}}<link rel="canonical" href="{{.Canonical}}">{{end}}
{{range .Hreflangs}}<link rel="alternate" hreflang="{{.Locale}}" href="{{.URL}}">{{end}}
<meta property="og:type" content="website"><meta property="og:site_name" content="{{.SiteName}}">
<meta property="og:title" content="{{.Page.Title}}"><meta property="og:description" content="{{.Page.Description}}">
{{if .Canonical}}<meta property="og:url" content="{{.Canonical}}">{{end}}
<meta property="og:image" content="{{.Page.Image}}"><meta name="twitter:card" content="summary_large_image">
{{if .Favicon}}<link rel="icon" href="{{.Favicon}}">{{end}}
<link rel="stylesheet" href="{{.Page.CSS}}">
{{range .Page.Preloads}}<link rel="modulepreload" href="{{.}}">{{end}}
{{range .Fonts}}<link rel="preload" as="font" type="font/woff2" href="{{.}}" crossorigin>{{end}}
<link rel="stylesheet" href="/assets/css/public-navigation.css?v=20261013.5">
<link rel="stylesheet" href="/assets/css/mega-menu.css?v=20261019.5">
<script src="/assets/js/mega-menu.js?v=20261019.5" defer></script>
<script src="/assets/js/public-navigation.js?v=20261016.1" defer></script>
<script id="freightvanta-cms-context" type="application/json">{{.Context}}</script>
<script type="application/ld+json">{{.Schema}}</script>
</head><body data-topic-template="v18" data-theme-id="{{.ThemeID}}"><div id="root">{{.Markup}}</div>
<script type="module" src="{{.Page.JS}}"></script></body></html>`))

func (s *server) serveImportedTopicTemplate(w http.ResponseWriter, r *http.Request, site catalog.Site, data publicSitePageData, routePath string) bool {
	// These sites use the topic templates, including the
	// German site whose existing homepage is bound to Atlas Commerce.
	if (site.Code != "global" && site.Code != "germany" && site.Code != "spain" && site.Code != "france" && site.Code != "italy" && site.Code != "netherlands") || data.Maintenance || data.NotFound || strings.HasPrefix(r.URL.Path, "/admin/") {
		return false
	}
	language := strings.ToLower(strings.Split(data.LanguageCode, "-")[0])
	if language != "en" && language != "de" && language != "es" && language != "fr" && language != "it" && language != "nl" {
		return false
	}
	route := strings.Trim(routePath, "/")
	route = strings.TrimPrefix(route, data.Locale+"/")
	requestRoute := route
	if data.IsProductSourcing {
		route = productSourcingSlug
	}
	if data.IsServiceTopic {
		route = "services/" + data.ServiceTopic.Slug
	}
	if data.IsIndustrySolution {
		route = data.IndustrySolution.Slug
	}
	s.loadImportedTopics()
	page, ok := s.importedTopics.pages[language+"/"+route]
	if !ok {
		return false
	}
	base := strings.TrimSuffix(data.CurrentPath, "/"+requestRoute)
	ctx := importedTopicContext{Locale: language, Route: route, BasePath: base, SiteID: site.ID,
		SiteURL: strings.TrimRight(data.PublicOrigin, "/"), Canonical: data.CanonicalURL, Preview: data.Preview,
		Languages: map[string]string{}, FormToken: publicFormToken(s, 0, site.ID)}
	for _, lang := range data.Languages {
		code := strings.ToLower(strings.Split(lang.Code, "-")[0])
		ctx.Languages[code] = strings.TrimRight(strings.TrimSuffix(lang.URL, "/"+route), "/")
	}
	ctx.Languages[language] = base
	markup := page.markup
	for _, code := range []string{"en", "de", "fr", "es", "it", "nl"} {
		url, exists := ctx.Languages[code]
		if !exists {
			url = base
			ctx.Languages[code] = base
		}
		markup = strings.ReplaceAll(markup, "__FV_SITE_"+code+"__", html.EscapeString(url))
	}
	markup = strings.ReplaceAll(markup, "__FV_ORIGIN__", html.EscapeString(ctx.SiteURL))
	contextJSON, _ := json.Marshal(ctx)
	robots, color := "index, follow", "#0a1b33"
	if language == "de" {
		color = "#16181c"
	}
	if language == "es" {
		color = "#0b3027"
	}
	if language == "fr" {
		color = "#1c1f27"
	}
	if language == "it" {
		color = "#1b1c1d"
	}
	if language == "nl" {
		color = "#0b2428"
	}
	if data.Preview {
		robots = "noindex, nofollow"
	} else if !data.RobotsIndex {
		robots = "noindex, follow"
	}
	if strings.HasPrefix(page.Image, "/") {
		page.Image = ctx.SiteURL + page.Image
	}
	favicon := data.FaviconURL
	if favicon == "" {
		favicon = "/assets/" + importedTopicRoot + "favicon-" + language + ".svg"
	}
	fontPatterns := []string{"ibm-plex-sans-latin-400-normal-*.woff2", "barlow-semi-condensed-latin-700-normal-*.woff2"}
	if language == "de" {
		fontPatterns[1] = "ibm-plex-serif-latin-700-normal-*.woff2"
	}
	if language == "es" {
		fontPatterns = []string{"archivo-latin-400-normal-*.woff2", "archivo-latin-800-normal-*.woff2"}
	}
	if language == "fr" {
		fontPatterns = []string{"source-sans-3-latin-400-normal-*.woff2", "source-serif-4-latin-600-normal-*.woff2"}
	}
	if language == "it" {
		fontPatterns = []string{"manrope-latin-400-normal-*.woff2", "bodoni-moda-latin-600-normal-*.woff2"}
	}
	if language == "nl" {
		fontPatterns = []string{"ibm-plex-sans-latin-400-normal-*.woff2", "archivo-black-latin-400-normal-*.woff2"}
	}
	var fonts []string
	for _, pattern := range fontPatterns {
		matches, _ := fs.Glob(s.Assets, importedTopicRoot+"assets/"+pattern)
		if len(matches) > 0 {
			fonts = append(fonts, "/assets/"+matches[0])
		}
	}
	view := struct {
		Page                                                                       importedTopicPage
		Language, Direction, Keywords, Robots, Color, Canonical, SiteName, Favicon string
		Hreflangs                                                                  []publicHreflang
		ThemeID                                                                    int64
		Context, Schema                                                            template.JS
		Markup                                                                     template.HTML
		Fonts                                                                      []string
	}{page, data.Locale, data.Direction, strings.Join(page.Keywords, ", "), robots, color, data.CanonicalURL,
		site.Name, favicon, data.Hreflangs, data.ThemeID, template.JS(contextJSON),
		template.JS(importedTopicSchema(page, ctx)), template.HTML(markup), fonts}
	var result bytes.Buffer
	if err := importedTopicDocument.Execute(&result, view); err != nil {
		s.Logger.Error("渲染导入专题页失败", "error", err, "route", route)
		return false
	}
	// The document contains a short-lived enquiry token. Keep it out of shared caches.
	w.Header().Set("Cache-Control", "no-store")
	_, _ = w.Write(result.Bytes())
	return true
}

func importedTopicSchema(page importedTopicPage, ctx importedTopicContext) string {
	pageURL := ctx.Canonical
	if pageURL == "" {
		pageURL = ctx.SiteURL + ctx.BasePath + "/" + ctx.Route
	}
	orgID := ctx.SiteURL + "/#organization"
	graph := []any{
		map[string]any{"@type": "Organization", "@id": orgID, "name": "FreightVanta", "url": ctx.SiteURL + "/"},
		map[string]any{"@type": "WebPage", "name": page.Heading, "description": page.Body, "url": pageURL, "inLanguage": ctx.Locale, "keywords": page.Keywords},
		map[string]any{"@type": "BreadcrumbList", "itemListElement": []any{
			map[string]any{"@type": "ListItem", "position": 1, "name": "FreightVanta", "item": ctx.SiteURL + "/"},
			map[string]any{"@type": "ListItem", "position": 2, "name": page.Heading, "item": pageURL},
		}},
	}
	if page.ServiceName != "" {
		graph = append(graph, map[string]any{"@type": "Service", "name": page.ServiceName, "description": page.Body, "url": pageURL, "provider": map[string]any{"@id": orgID}})
	}
	if len(page.FAQs) > 0 {
		questions := []any{}
		for _, faq := range page.FAQs {
			questions = append(questions, map[string]any{"@type": "Question", "name": faq.Question, "acceptedAnswer": map[string]any{"@type": "Answer", "text": faq.Answer}})
		}
		graph = append(graph, map[string]any{"@type": "FAQPage", "mainEntity": questions})
	}
	encoded, _ := json.Marshal(map[string]any{"@context": "https://schema.org", "@graph": graph})
	return string(encoded)
}
