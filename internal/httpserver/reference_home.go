package httpserver

import (
	"encoding/json"
	"html"
	"html/template"
	"io/fs"
	"strings"
)

// Serve the existing React homepage composition before JavaScript downloads.
// URLs still come from the CMS network, including dedicated ports and previews.
func (s *server) prepareReferenceHome(data *publicSitePageData) {
	if !data.IsHome || data.Maintenance || data.NotFound || data.ThemeKey == "atlas-commerce" || s.Assets == nil {
		return
	}
	locale := strings.ToLower(strings.Split(data.LanguageCode, "-")[0])
	languageURLs := map[string]string{}
	for _, language := range data.Languages {
		languageURLs[strings.ToLower(strings.Split(language.Code, "-")[0])] = language.URL
	}
	languageURLs[locale] = data.HomePath
	initialContext, _ := json.Marshal(map[string]any{"sharedHeader": true, "locale": locale, "enquiry": json.RawMessage(data.EnquiryContext), "languages": languageURLs})
	data.HomeContext = template.JS(initialContext)
	root := "freightvanta-template/"
	if locale == "nl" {
		root = "nl-template/"
	}
	if source, readErr := fs.ReadFile(s.Assets, root+"client.json"); readErr == nil {
		var client struct {
			Entry    string              `json:"entry"`
			Preloads map[string][]string `json:"preloads"`
		}
		if json.Unmarshal(source, &client) == nil {
			data.HomeScript = client.Entry
			data.HomePreloads = client.Preloads[locale]
		}
	}
	fontNames := map[string][]string{
		"fr": {"source-sans-3-latin-400-normal-*.woff2", "source-serif-4-latin-600-normal-*.woff2"},
		"es": {"archivo-latin-400-normal-*.woff2", "archivo-latin-800-normal-*.woff2"},
		"it": {"manrope-latin-400-normal-*.woff2", "bodoni-moda-latin-600-normal-*.woff2"},
		"nl": {"ibm-plex-sans-latin-400-normal-*.woff2", "archivo-black-latin-400-normal-*.woff2"},
	}
	fonts, supported := fontNames[locale]
	if !supported {
		return
	}
	body, err := fs.ReadFile(s.Assets, root+"pages/"+locale+"-home.html")
	if err != nil {
		return
	}
	languages := map[string]string{}
	for _, language := range data.Languages {
		code := strings.ToLower(strings.Split(language.Code, "-")[0])
		languages[code] = language.URL
	}
	languages[locale] = data.HomePath
	markup := string(body)
	for _, code := range []string{"en", "de", "fr", "es", "it", "nl"} {
		url, ok := languages[code]
		if !ok {
			url = data.HomePath
			languages[code] = url
		}
		placeholder := "__FV_HOME_" + code + "__"
		// Prerendered topic links append a path before the real home URL is known.
		// Normalize that boundary so a root home does not become //services/….
		markup = strings.ReplaceAll(markup, placeholder+"/", html.EscapeString(strings.TrimRight(url, "/")+"/"))
		markup = strings.ReplaceAll(markup, placeholder, html.EscapeString(url))
	}
	context, _ := json.Marshal(struct {
		SharedHeader bool              `json:"sharedHeader"`
		Locale       string            `json:"locale"`
		Enquiry      json.RawMessage   `json:"enquiry"`
		Languages    map[string]string `json:"languages"`
	}{true, locale, json.RawMessage(data.EnquiryContext), languages})
	data.HomeMarkup = template.HTML(markup)
	data.HomeContext = template.JS(context)
	for _, pattern := range fonts {
		matches, _ := fs.Glob(s.Assets, root+"assets/"+pattern)
		if len(matches) > 0 {
			data.HomeFonts = append(data.HomeFonts, "/assets/"+matches[0])
		}
	}
}
