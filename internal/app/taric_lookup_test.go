package app

import (
	"html"
	"io"
	"log/slog"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

func TestTARICFiveMarketsSSRSEOAndRecovery(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	defer a.Close()
	get := func(path string) *httptest.ResponseRecorder {
		w := httptest.NewRecorder()
		a.Handler().ServeHTTP(w, httptest.NewRequest("GET", path, nil))
		return w
	}
	markets := []struct{ site, lang, word, title string }{{"germany", "de", "Baumwolle", "Zolltarifnummer"}, {"france", "fr", "coton", "Recherche de code douanier"}, {"spain", "es", "algodón", "Consulta de códigos"}, {"italy", "it", "cotone", "Ricerca codice doganale"}, {"netherlands", "nl", "katoen", "Goederencode zoeken"}}
	for _, m := range markets {
		t.Run(m.site, func(t *testing.T) {
			base := "/preview/" + m.site + "/tools/taric-code-lookup"
			for _, path := range []string{base, base + "?q=" + url.QueryEscape(m.word), base + "/3909509090"} {
				w := get(path)
				body := html.UnescapeString(w.Body.String())
				if w.Code != 200 || !strings.Contains(body, m.title) || !strings.Contains(body, `data-taric`) || !strings.Contains(body, "</html>") {
					t.Fatalf("bad page %s: %d", path, w.Code)
				}
				if strings.Contains(body, "Section 301") || strings.Contains(body, "General Rate") || strings.Contains(body, `href="/preview/global/tools/taric-code-lookup`) {
					t.Fatal("US scheme leaked into EU page")
				}
				if !strings.Contains(w.Header().Get("X-Robots-Tag"), "noindex") {
					t.Fatal("preview indexable")
				}
			}
			body := get(base + "?q=390950").Body.String()
			if !strings.Contains(body, `href="`+base+`/3909509090"`) {
				t.Fatal("missing detail link")
			}
			for _, code := range []string{"3909505000", "39095090900", "0000000000", "3909509090/extra"} {
				w := get(base + "/" + code)
				if w.Code != 404 || !strings.Contains(w.Body.String(), `data-taric-search`) {
					t.Fatalf("invalid code recovery: %s %d", code, w.Code)
				}
			}
			if !strings.Contains(get("/preview/"+m.site).Body.String(), `href="`+base+`"`) {
				t.Fatal("footer entry missing")
			}
			api := get("/api/public/taric-search?lang=" + m.lang + "&q=" + url.QueryEscape(m.word))
			if api.Code != 200 || !strings.Contains(api.Body.String(), `"items":[{`) {
				t.Fatal("localized API")
			}
		})
	}
	if get("/preview/global/tools/taric-code-lookup").Code != 404 {
		t.Fatal("EU route exposed on US site")
	}
	if get("/api/public/taric-measures?lang=de&code=3909509090&origin=ZZ&date=2026-11-06").Code != 400 {
		t.Fatal("invalid origin")
	}
	if get("/api/public/taric-search?lang=de&q=x&page=-1").Code != 400 {
		t.Fatal("invalid page")
	}
	if _, err = a.db.Exec(`INSERT INTO site_domains(site_id,hostname,kind,redirect_to_primary,created_at,updated_at) SELECT id,'taric.example.test','alias',0,datetime('now'),datetime('now') FROM sites WHERE code='germany'`); err != nil {
		t.Fatal(err)
	}
	for _, q := range []string{"", "?q=test"} {
		w := get("http://taric.example.test/tools/taric-code-lookup/3909509090" + q)
		body := w.Body.String()
		if w.Code != 200 || !strings.Contains(body, `rel="canonical" href="http://taric.example.test/tools/taric-code-lookup/3909509090"`) {
			t.Fatal("canonical")
		}
		if strings.Contains(w.Header().Get("X-Robots-Tag"), "noindex") != (q != "") {
			t.Fatal("query index policy")
		}
	}
	if !strings.Contains(get("http://taric.example.test/sitemap.xml").Body.String(), "/tools/taric-code-lookup") {
		t.Fatal("sitemap tool route missing")
	}
}

func TestTARICPublicRateLimit(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	defer a.Close()
	limited := false
	for i := 0; i < 35; i++ {
		w := httptest.NewRecorder()
		a.Handler().ServeHTTP(w, httptest.NewRequest("GET", "/api/public/taric-search?lang=fr&q=coton", nil))
		if w.Code == 429 {
			limited = true
			if w.Header().Get("Retry-After") == "" {
				t.Fatal("missing retry header")
			}
			break
		}
	}
	if !limited {
		t.Fatal("search not rate limited")
	}
}
