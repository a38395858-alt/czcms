package httpserver

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"czcms/internal/catalog"
	"czcms/internal/config"
)

func TestSessionCookieHasRequiredAttributes(t *testing.T) {
	server := &server{Dependencies: Dependencies{Config: config.Config{CookieSecure: true}}}
	recorder := httptest.NewRecorder()
	server.setSessionCookie(recorder, "token.csrf", time.Now().Add(time.Hour))
	cookies := recorder.Result().Cookies()
	if len(cookies) != 1 {
		t.Fatalf("cookies=%d", len(cookies))
	}
	cookie := cookies[0]
	if cookie.Name != "__Host-czcms_session" || !cookie.Secure || !cookie.HttpOnly || cookie.SameSite != http.SameSiteStrictMode || cookie.Path != "/" || cookie.Domain != "" {
		t.Fatalf("unsafe cookie: %+v", cookie)
	}
}

func TestClientIPIgnoresUntrustedForwardedHeader(t *testing.T) {
	server := &server{trustedProxies: parseTrustedProxies([]string{"127.0.0.1"})}
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	request.RemoteAddr = "198.51.100.4:1234"
	request.Header.Set("X-Forwarded-For", "203.0.113.10")
	if got := server.clientIP(request); got != "198.51.100.4" {
		t.Fatalf("untrusted forwarded IP used: %s", got)
	}
	request.RemoteAddr = "127.0.0.1:1234"
	if got := server.clientIP(request); !strings.HasPrefix(got, "203.0.113.10") {
		t.Fatalf("trusted forwarded IP ignored: %s", got)
	}
}

func TestSecurityHeadersPermitOnlySameOriginInternalPreviewsToBeFramed(t *testing.T) {
	server := &server{}
	handler := server.securityHeaders(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusNoContent) }))
	for _, check := range []struct {
		path, frame, ancestors string
	}{
		{path: "/admin", frame: "DENY", ancestors: "frame-ancestors 'none'"},
		{path: "/admin/template-preview/1/global/en", frame: "SAMEORIGIN", ancestors: "frame-ancestors 'self'"},
		{path: "/admin/content-preview/5/1/en", frame: "SAMEORIGIN", ancestors: "frame-ancestors 'self'"},
	} {
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, check.path, nil))
		if got := recorder.Header().Get("X-Frame-Options"); got != check.frame {
			t.Fatalf("path=%s X-Frame-Options=%q want %q", check.path, got, check.frame)
		}
		if got := recorder.Header().Get("Content-Security-Policy"); !strings.Contains(got, check.ancestors) {
			t.Fatalf("path=%s CSP=%q missing %q", check.path, got, check.ancestors)
		}
	}
}

func TestRequestTimeoutAllowsAILocalizationHeadroomOnly(t *testing.T) {
	server := &server{}
	remaining := make(chan time.Duration, 1)
	handler := server.requestTimeout(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		deadline, ok := r.Context().Deadline()
		if !ok {
			t.Error("request context does not have a timeout deadline")
			return
		}
		remaining <- time.Until(deadline)
	}))

	localization := httptest.NewRequest(http.MethodPost, "/api/v1/contents/6/localize", nil)
	handler.ServeHTTP(httptest.NewRecorder(), localization)
	if got := <-remaining; got < 120*time.Second || got > 130*time.Second {
		t.Fatalf("localization timeout remaining=%s, want approximately 130 seconds", got)
	}

	ordinary := httptest.NewRequest(http.MethodGet, "/api/v1/contents", nil)
	handler.ServeHTTP(httptest.NewRecorder(), ordinary)
	if got := <-remaining; got < 25*time.Second || got > 30*time.Second {
		t.Fatalf("ordinary timeout remaining=%s, want approximately 30 seconds", got)
	}
}

func TestEstimateReadingMinutesIgnoresMarkupAndCountsLocalizedText(t *testing.T) {
	if got := estimateReadingMinutes(`<h2>Route planning</h2><p>Fast customs support for European deliveries.</p>`); got != 1 {
		t.Fatalf("short latin article minutes=%d", got)
	}
	longChinese := "<p>" + strings.Repeat("国际物流内容", 90) + "</p>"
	if got := estimateReadingMinutes(longChinese); got < 2 {
		t.Fatalf("localized article minutes=%d", got)
	}
}

func TestSafeStructuredDataKeepsCustomFieldsAndFillsGoogleArticleDefaults(t *testing.T) {
	got := safeStructuredData([]byte(`{"@context":"https://schema.org","@type":"Article","author":{"@type":"Person","name":"Editor"}}`), `{"@context":"https://schema.org","@type":"Article","headline":"Shipping guide","dateModified":"2026-08-27"}`)
	for _, expected := range []string{`"author"`, `"headline":"Shipping guide"`, `"dateModified":"2026-08-27"`} {
		if !strings.Contains(got, expected) {
			t.Fatalf("structured data missing %s: %s", expected, got)
		}
	}
}

func TestSafeStructuredDataAcceptsScriptWrapper(t *testing.T) {
	got := safeStructuredData([]byte(`<script type="application/ld+json">{"@type":"Organization","name":"Global Route English"}</script>`), `{"@context":"https://schema.org","@type":"WebSite","url":"https://example.com/"}`)
	for _, expected := range []string{`"@type":"Organization"`, `"name":"Global Route English"`, `"url":"https://example.com/"`} {
		if !strings.Contains(got, expected) {
			t.Fatalf("script-wrapped JSON-LD missing %s: %s", expected, got)
		}
	}
}

func TestSafeStructuredDataMergesOrganizationWithoutReplacingPageEntity(t *testing.T) {
	fallback := `{"@context":"https://schema.org","@type":"Article","@id":"https://example.com/guides/route#content","headline":"Route guide","publisher":{"@type":"Organization","@id":"https://example.com/#organization","name":"Global Route"}}`
	got := safeStructuredData([]byte(`<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Global Route English","sameAs":["https://www.linkedin.com/company/global-route"]}</script>`), fallback)
	var document map[string]any
	if err := json.Unmarshal([]byte(got), &document); err != nil {
		t.Fatalf("merged JSON-LD is invalid: %v", err)
	}
	if document["@type"] != "Article" || document["headline"] != "Route guide" {
		t.Fatalf("custom organization replaced page entity: %+v", document)
	}
	publisher, ok := document["publisher"].(map[string]any)
	if !ok || publisher["name"] != "Global Route English" {
		t.Fatalf("organization fields were not merged: %+v", document["publisher"])
	}
	if _, ok := publisher["sameAs"].([]any); !ok {
		t.Fatalf("organization sameAs missing: %+v", publisher)
	}
}

func TestSafeStructuredDataAppendsAdditionalTypedNodes(t *testing.T) {
	fallback := `{"@context":"https://schema.org","@type":"WebPage","name":"About"}`
	got := safeStructuredData([]byte(`{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[]}`), fallback)
	var document map[string]any
	if err := json.Unmarshal([]byte(got), &document); err != nil {
		t.Fatalf("merged JSON-LD is invalid: %v", err)
	}
	if document["@type"] != "WebPage" {
		t.Fatalf("additional node replaced page entity: %+v", document)
	}
	graph, ok := document["@graph"].([]any)
	if !ok || len(graph) != 1 {
		t.Fatalf("additional node was not attached via @graph: %+v", document["@graph"])
	}
}

func TestPublicJSONLDUsesPageSpecificGoogleSchemas(t *testing.T) {
	data := publicSitePageData{
		SiteName: "Global Route English", Locale: "en", HomePath: "/en/",
		CanonicalURL: "https://example.com/en/guides/express", HasContent: true,
		Content: publicContentData{ContentType: "article", H1: "International Express Shipping", Title: "International Express Shipping", Category: "Guides", Tags: []string{"express shipping"}, OwnerName: "Content Editor", URL: "/en/guides/express", UpdatedAt: "2026-09-04", PublishedAt: "2026-09-03"},
	}
	var article map[string]any
	if err := json.Unmarshal([]byte(publicJSONLD(data, catalog.Site{Name: data.SiteName})), &article); err != nil {
		t.Fatalf("article JSON-LD is invalid: %v", err)
	}
	if article["@type"] != "Article" || article["headline"] != "International Express Shipping" {
		t.Fatalf("unexpected article schema: %+v", article)
	}
	author, ok := article["author"].(map[string]any)
	if !ok || author["@type"] != "Person" || author["name"] != "Content Editor" {
		t.Fatalf("article author missing: %+v", article["author"])
	}
	if _, ok := article["breadcrumb"].(map[string]any); !ok {
		t.Fatalf("article breadcrumb missing: %+v", article)
	}
	if _, ok := article["mainEntityOfPage"].(map[string]any); !ok {
		t.Fatalf("article mainEntityOfPage missing: %+v", article)
	}

	data.Content.ContentType = "product"
	data.Content.Title = "Cold Chain Container"
	data.Content.H1 = "Cold Chain Container"
	data.Content.Gallery = []catalog.GalleryMedia{{URL: "/media/1/abc"}}
	var product map[string]any
	if err := json.Unmarshal([]byte(publicJSONLD(data, catalog.Site{Name: data.SiteName})), &product); err != nil {
		t.Fatalf("product JSON-LD is invalid: %v", err)
	}
	if product["@type"] != "Product" || product["name"] != "Cold Chain Container" {
		t.Fatalf("unexpected product schema: %+v", product)
	}
	if _, ok := product["image"].([]any); !ok {
		t.Fatalf("product image missing: %+v", product)
	}
	if product["description"] == nil || product["isPartOf"] == nil {
		t.Fatalf("product relationship/description missing: %+v", product)
	}
	if _, ok := product["brand"]; ok {
		t.Fatalf("product editor name must not be emitted as a brand: %+v", product)
	}
	if _, ok := product["keywords"]; ok {
		t.Fatalf("product should not emit article-only keywords: %+v", product)
	}

	home := publicSitePageData{SiteName: "Global Route English", Locale: "en", HomePath: "/", PageTitle: "Global Route", MetaDescription: "International logistics."}
	var homepage map[string]any
	if err := json.Unmarshal([]byte(publicJSONLD(home, catalog.Site{Name: home.SiteName, SEODescription: home.MetaDescription})), &homepage); err != nil {
		t.Fatalf("homepage JSON-LD is invalid: %v", err)
	}
	if homepage["@type"] != "WebSite" || homepage["mainEntity"] == nil {
		t.Fatalf("homepage site/page entities missing: %+v", homepage)
	}
	localPreview := home
	localPreview.PublicOrigin = "http://localhost:8081"
	var preview map[string]any
	if err := json.Unmarshal([]byte(publicJSONLD(localPreview, catalog.Site{Name: localPreview.SiteName})), &preview); err != nil {
		t.Fatalf("local preview JSON-LD is invalid: %v", err)
	}
	if preview["url"] != "http://localhost:8081/" || preview["@id"] != "http://localhost:8081/#website" {
		t.Fatalf("local preview JSON-LD should use absolute entity URLs: %+v", preview)
	}
}

func TestPublicJSONLDUsesCurrentPathForTaxonomyAndNotFound(t *testing.T) {
	base := publicSitePageData{
		SiteName: "Global Route English", Locale: "en", HomePath: "/", PublicOrigin: "http://localhost:8081",
		CurrentPath: "/categories/shipping-guides", IsTaxonomy: true, TaxonomyName: "Shipping guides",
		MetaDescription: "Shipping guides archive.", Published: []publicContentData{{Title: "Guide", URL: "/guides/guide"}},
	}
	var taxonomy map[string]any
	if err := json.Unmarshal([]byte(publicJSONLD(base, catalog.Site{Name: base.SiteName})), &taxonomy); err != nil {
		t.Fatalf("taxonomy JSON-LD is invalid: %v", err)
	}
	if taxonomy["url"] != "http://localhost:8081/categories/shipping-guides" || taxonomy["@id"] != "http://localhost:8081/categories/shipping-guides#webpage" {
		t.Fatalf("taxonomy schema points to the wrong URL: %+v", taxonomy)
	}
	breadcrumb, ok := taxonomy["breadcrumb"].(map[string]any)
	if !ok || breadcrumb["@id"] != "http://localhost:8081/categories/shipping-guides#breadcrumb" {
		t.Fatalf("taxonomy breadcrumb points to the wrong URL: %+v", taxonomy["breadcrumb"])
	}

	notFound := base
	notFound.IsTaxonomy = false
	notFound.NotFound = true
	notFound.CurrentPath = "/missing-page"
	notFound.PageTitle = "Page not found"
	var missing map[string]any
	if err := json.Unmarshal([]byte(publicJSONLD(notFound, catalog.Site{Name: base.SiteName})), &missing); err != nil {
		t.Fatalf("404 JSON-LD is invalid: %v", err)
	}
	if missing["url"] != "http://localhost:8081/missing-page" || missing["@id"] != "http://localhost:8081/missing-page#webpage" {
		t.Fatalf("404 schema points to the wrong URL: %+v", missing)
	}
}
