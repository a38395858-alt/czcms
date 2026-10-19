package app

import (
	"encoding/json"
	"html"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
)

var importedContextPattern = regexp.MustCompile(`<script id="freightvanta-cms-context" type="application/json">(.*?)</script>`)

func assertImportedTopic(t *testing.T, response *httptest.ResponseRecorder, preview bool) {
	t.Helper()
	body := response.Body.String()
	if response.Code != http.StatusOK {
		t.Fatalf("topic status=%d", response.Code)
	}
	for _, marker := range []string{`data-topic-template="v18"`, `<h1`, `/assets/freightvanta-topic-v18/assets/topic.css`, `type="application/ld+json"`, `"@type":"FAQPage"`, `"@type":"BreadcrumbList"`} {
		if !strings.Contains(body, marker) {
			t.Fatalf("topic missing %s", marker)
		}
	}
	if strings.Contains(body, "__FV_") || strings.Contains(body, `href="#/`) {
		t.Fatal("topic contains unresolved CMS paths")
	}
	if preview {
		if response.Header().Get("X-Robots-Tag") != "noindex, nofollow" || strings.Contains(body, `rel="canonical"`) {
			t.Fatal("preview SEO policy is incorrect")
		}
	} else if !strings.Contains(body, `rel="canonical"`) || strings.Contains(body, `content="noindex, nofollow"`) {
		t.Fatal("public SEO policy is incorrect")
	}
	if response.Header().Get("Cache-Control") != "no-store" {
		t.Fatal("enquiry token document must not be cached")
	}
}

func importedContext(t *testing.T, body string) map[string]any {
	t.Helper()
	match := importedContextPattern.FindStringSubmatch(body)
	if len(match) != 2 {
		t.Fatal("missing context")
	}
	var ctx map[string]any
	if err := json.Unmarshal([]byte(match[1]), &ctx); err != nil {
		t.Fatal(err)
	}
	return ctx
}

func TestImportedTopicPagesRenderBeforeJavaScriptOnAllHosts(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = a.Close() })
	// Match the installed German site: topic selection must not be blocked by
	// its Atlas homepage theme or its regional locale.
	if _, err = a.db.Exec(`UPDATE site_languages SET theme_package_id=(SELECT id FROM theme_packages WHERE render_key='atlas-commerce' LIMIT 1),locale='de-DE' WHERE site_id=(SELECT id FROM sites WHERE code='germany')`); err != nil {
		t.Fatal(err)
	}
	if _, err = a.db.Exec(`UPDATE sites SET primary_domain='topics.example.test' WHERE code='germany'`); err != nil {
		t.Fatal(err)
	}
	if _, err = a.db.Exec(`INSERT INTO site_domains(site_id,hostname,kind,created_at,updated_at) SELECT id,'topics.example.test','primary',datetime('now'),datetime('now') FROM sites WHERE code='germany'`); err != nil {
		t.Fatal(err)
	}
	if _, err = a.db.Exec(`UPDATE sites SET primary_domain='es-topics.example.test' WHERE code='spain'`); err != nil {
		t.Fatal(err)
	}
	if _, err = a.db.Exec(`INSERT INTO site_domains(site_id,hostname,kind,created_at,updated_at) SELECT id,'es-topics.example.test','primary',datetime('now'),datetime('now') FROM sites WHERE code='spain'`); err != nil {
		t.Fatal(err)
	}
	if _, err = a.db.Exec(`UPDATE sites SET primary_domain='fr-topics.example.test' WHERE code='france'`); err != nil {
		t.Fatal(err)
	}
	if _, err = a.db.Exec(`INSERT INTO site_domains(site_id,hostname,kind,created_at,updated_at) SELECT id,'fr-topics.example.test','primary',datetime('now'),datetime('now') FROM sites WHERE code='france'`); err != nil {
		t.Fatal(err)
	}
	if _, err = a.db.Exec(`UPDATE sites SET primary_domain='it-topics.example.test' WHERE code='italy'`); err != nil {
		t.Fatal(err)
	}
	if _, err = a.db.Exec(`INSERT INTO site_domains(site_id,hostname,kind,created_at,updated_at) SELECT id,'it-topics.example.test','primary',datetime('now'),datetime('now') FROM sites WHERE code='italy'`); err != nil {
		t.Fatal(err)
	}
	if _, err = a.db.Exec(`UPDATE sites SET primary_domain='nl-topics.example.test' WHERE code='netherlands'`); err != nil {
		t.Fatal(err)
	}
	if _, err = a.db.Exec(`INSERT INTO site_domains(site_id,hostname,kind,created_at,updated_at) SELECT id,'nl-topics.example.test','primary',datetime('now'),datetime('now') FROM sites WHERE code='netherlands'`); err != nil {
		t.Fatal(err)
	}
	routes := []string{"product-sourcing", "services/bulk-procurement", "services/packaging-branding", "services/inventory-storage", "services/private-white-label", "services/worldwide-fulfillment", "industries/cross-border-ecommerce", "industries/consumer-goods", "industries/industrial-components", "industries/time-critical-cargo"}
	for _, site := range []struct{ code, locale, host string }{{"global", "en", "www.example.com"}, {"germany", "de", "topics.example.test"}, {"spain", "es", "es-topics.example.test"}, {"france", "fr", "fr-topics.example.test"}, {"italy", "it", "it-topics.example.test"}, {"netherlands", "nl", "nl-topics.example.test"}} {
		for _, route := range routes {
			t.Run(site.locale+"/"+route, func(t *testing.T) {
				local := httptest.NewRecorder()
				localPreviewHandler(a.Handler(), site.code).ServeHTTP(local, httptest.NewRequest(http.MethodGet, "http://localhost/"+route, nil))
				assertImportedTopic(t, local, true)
				generic := httptest.NewRecorder()
				a.Handler().ServeHTTP(generic, httptest.NewRequest(http.MethodGet, "http://unbound.test/preview/"+site.code+"/"+route, nil))
				assertImportedTopic(t, generic, true)
				if !strings.Contains(generic.Body.String(), `href="/preview/`+site.code+`/product-sourcing"`) {
					t.Fatal("generic preview lost its base path")
				}
				public := httptest.NewRecorder()
				a.Handler().ServeHTTP(public, httptest.NewRequest(http.MethodGet, "http://"+site.host+"/"+route, nil))
				assertImportedTopic(t, public, false)
				if !strings.Contains(public.Body.String(), `href="http://`+site.host+"/"+route+`"`) {
					t.Fatal("wrong canonical host")
				}
				localTitle := regexp.MustCompile(`<title>(.*?)</title>`).FindStringSubmatch(local.Body.String())
				publicTitle := regexp.MustCompile(`<title>(.*?)</title>`).FindStringSubmatch(public.Body.String())
				if len(localTitle) != 2 || len(publicTitle) != 2 || html.UnescapeString(localTitle[1]) != html.UnescapeString(publicTitle[1]) {
					t.Fatal("public and local templates differ")
				}
				ctx := importedContext(t, local.Body.String())
				if ctx["locale"] != site.locale || ctx["route"] != route {
					t.Fatal("wrong locale/route in hydration context")
				}
			})
		}
	}
}

func TestTopicEnquiryPersistsEncryptedValuesAndRejectsCrossSiteTokens(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = a.Close() })
	for _, site := range []struct{ code, locale string }{{"global", "en"}, {"germany", "de"}, {"spain", "es"}, {"france", "fr"}, {"italy", "it"}, {"netherlands", "nl"}} {
		page := httptest.NewRecorder()
		a.Handler().ServeHTTP(page, httptest.NewRequest(http.MethodGet, "http://unbound.test/preview/"+site.code+"/product-sourcing", nil))
		ctx := importedContext(t, page.Body.String())
		payload := map[string]any{"site_id": ctx["siteId"], "locale": site.locale, "route": "product-sourcing", "form_token": ctx["formToken"],
			"full_name": "Topic Buyer", "work_email": "buyer-" + site.locale + "@example.test", "company": "Buyer Company", "origin": "China", "destination": "Berlin",
			"starting_point": "product-sourcing", "consent": true, "page_context": map[string]any{"fields": map[string]string{"product": "Specification A"}}}
		post := func(target string, payload map[string]any) *httptest.ResponseRecorder {
			encoded, _ := json.Marshal(payload)
			r := httptest.NewRequest(http.MethodPost, "http://unbound.test/preview/"+target+"/topic-enquiry", strings.NewReader(string(encoded)))
			r.Header.Set("Origin", "http://unbound.test")
			r.Header.Set("Content-Type", "application/json")
			response := httptest.NewRecorder()
			a.Handler().ServeHTTP(response, r)
			return response
		}
		other := "germany"
		if site.code == other {
			other = "global"
		}
		if result := post(other, payload); result.Code != http.StatusForbidden {
			t.Fatalf("cross-site token status=%d", result.Code)
		}
		payload["consent"] = false
		if result := post(site.code, payload); result.Code != http.StatusUnprocessableEntity {
			t.Fatalf("invalid enquiry status=%d body=%s", result.Code, result.Body.String())
		}
		payload["consent"] = true
		result := post(site.code, payload)
		if result.Code != http.StatusCreated {
			t.Fatalf("submit status=%d body=%s", result.Code, result.Body.String())
		}
		if result = post(site.code, payload); result.Code != http.StatusUnprocessableEntity {
			t.Fatal("duplicate enquiry accepted")
		}
		var encrypted []byte
		var savedLocale string
		if err := a.db.QueryRow(`SELECT values_encrypted,locale FROM form_submissions WHERE site_id=? ORDER BY id DESC LIMIT 1`, ctx["siteId"]).Scan(&encrypted, &savedLocale); err != nil {
			t.Fatal(err)
		}
		if strings.Contains(string(encrypted), "Topic Buyer") || strings.Contains(string(encrypted), "example.test") {
			t.Fatal("unencrypted personal data stored")
		}
		if site.locale == "de" && savedLocale != "de-DE" {
			t.Fatal("German enquiry lost CMS locale")
		}
		if site.locale == "fr" && savedLocale != "fr-FR" {
			t.Fatal("French enquiry lost CMS locale")
		}
		if site.locale == "it" && savedLocale != "it-IT" {
			t.Fatal("Italian enquiry lost CMS locale")
		}
		if site.locale == "es" && savedLocale != "es-ES" {
			t.Fatal("Spanish enquiry lost CMS locale")
		}
	}
}

func TestSpanishHomepageTopicLinksKeepTheirBasePath(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = a.Close() })
	for _, local := range []bool{false, true} {
		response := httptest.NewRecorder()
		path, base := "/preview/spain", "/preview/spain"
		handler := a.Handler()
		if local {
			path, base = "/", ""
			handler = localPreviewHandler(handler, "spain")
		}
		handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "http://unbound.test"+path, nil))
		body := response.Body.String()
		if response.Code != http.StatusOK {
			t.Fatalf("homepage status=%d", response.Code)
		}
		for _, route := range []string{"product-sourcing", "services/packaging-branding", "industries/industrial-components"} {
			if !strings.Contains(body, `href="`+base+"/"+route+`"`) {
				t.Fatalf("homepage topic link lost base: %s", route)
			}
		}
		if strings.Contains(body, `href="//services/`) || strings.Contains(body, `href="//industries/`) {
			t.Fatal("homepage topic link became a protocol-relative host")
		}
	}
}
