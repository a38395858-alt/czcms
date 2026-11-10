package app

import (
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCountryWarehouseToolsSSRFooterAndCanonical(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	defer a.Close()
	for _, item := range []struct{ Site, Language, Query, Code, Address string }{{"germany", "de", "dus2", "DUS2", "Rheinberg"}, {"france", "fr", "ORY4", "ORY4", "91220"}, {"spain", "es", "08820", "BCN1", "08820"}, {"italy", "it", "02032", "FCO1", "02032"}, {"netherlands", "nl", "4704rg", "3PL-AA-ROO", "Borchwerf 5"}} {
		path := "/preview/" + item.Site + "/tools/fba-warehouse-lookup"
		get := func(url string) *httptest.ResponseRecorder {
			w := httptest.NewRecorder()
			a.Handler().ServeHTTP(w, httptest.NewRequest("GET", url, nil))
			return w
		}
		w := get(path + "?q=" + item.Query)
		body := w.Body.String()
		if w.Code != 200 || !strings.Contains(body, `class="warehouse-map warehouse-map-eu" lang="`+item.Language+`"`) || !strings.Contains(body, `data-code="`+item.Code+`"`) || !strings.Contains(body, item.Address) || !strings.Contains(body, `action="`+path+`"`) {
			t.Fatalf("country SSR lookup %s: %d", item.Site, w.Code)
		}
		if strings.Count(body, "<h1 ") != 1 || strings.Contains(body, `data-code="ONT8"`) {
			t.Fatalf("country page structure/isolation %s", item.Site)
		}
		if header := strings.SplitN(body, "</header>", 2)[0]; strings.Contains(header, `href="`+path+`"`) {
			t.Fatal("tool must not be added to top navigation")
		}
		if home := get("/preview/" + item.Site).Body.String(); !strings.Contains(home, `href="`+path+`"`) {
			t.Fatalf("missing country home footer entry: %s", item.Site)
		}
		host := item.Language + ".warehouse.example.com"
		_, err := a.db.Exec(`INSERT INTO site_domains(site_id,hostname,kind,redirect_to_primary,created_at,updated_at) SELECT id,?,'alias',0,datetime('now'),datetime('now') FROM sites WHERE code=?`, host, item.Site)
		if err != nil {
			t.Fatal(err)
		}
		for _, query := range []string{"", "?q=" + item.Query} {
			w = get("http://" + host + "/tools/fba-warehouse-lookup" + query)
			body = w.Body.String()
			if w.Code != 200 || !strings.Contains(body, `rel="canonical" href="http://`+host+`/tools/fba-warehouse-lookup"`) || strings.Contains(w.Header().Get("X-Robots-Tag"), "noindex") != (query != "") || !strings.Contains(body, `"inLanguage":"`+item.Language+`"`) {
				t.Fatalf("country public SEO failed %s %s", item.Site, query)
			}
		}
		postal := map[string]string{"de": "47495", "fr": "91220", "es": "28830", "it": "02032", "nl": "4704RG"}[item.Language]
		w = httptest.NewRecorder()
		localPreviewHandler(a.Handler(), item.Site).ServeHTTP(w, httptest.NewRequest(http.MethodGet, "http://localhost:8081/api/public/eu-warehouse-location?country="+item.Language+"&q="+postal, nil))
		if w.Code != 200 || !strings.Contains(w.Body.String(), `"country":"`+strings.ToUpper(item.Language)+`"`) {
			t.Fatalf("dedicated country preview lost location forwarding: %s", item.Site)
		}
	}
}
