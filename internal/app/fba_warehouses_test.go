package app

import (
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

func TestUSFBAWarehouseToolSSRScopeAndIndexing(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = a.Close() })
	get := func(path string) *httptest.ResponseRecorder {
		w := httptest.NewRecorder()
		a.Handler().ServeHTTP(w, httptest.NewRequest(http.MethodGet, path, nil))
		return w
	}
	path := "/preview/global/tools/fba-warehouse-lookup"
	for _, query := range []string{"", "?q=ont8", "?q=CA", "?q=08518", "?q=unknown-code", "?q=" + url.QueryEscape(`<script>alert(1)</script>`)} {
		w := get(path + query)
		body := w.Body.String()
		if w.Code != 200 || strings.Count(body, "<h1 ") != 1 || !strings.Contains(body, `action="`+path+`"`) || !strings.Contains(body, "data-fba-directory") {
			t.Fatalf("FBA tool did not render correctly for %q: %d", query, w.Code)
		}
		results := strings.SplitN(strings.SplitN(body, "data-fba-results>", 2)[1], `<div class="fba-empty"`, 2)[0]
		if query == "" && (!strings.Contains(results, "data-fba-card") || !strings.Contains(results, "24300 Nandina Ave")) {
			t.Fatal("initial state map should show California reference addresses")
		}
		if query == "?q=ont8" && (!strings.Contains(results, "24300 Nandina Ave") || !strings.Contains(results, "Moreno Valley") || !strings.Contains(results, "US West")) {
			t.Fatal("warehouse code search must work without JavaScript")
		}
		if query == "?q=08518" && (!strings.Contains(results, "ABE8") || !strings.Contains(results, "08518")) {
			t.Fatal("server search must retain leading zero ZIP")
		}
		if strings.Contains(body, `<script>alert(1)</script>`) || !strings.Contains(w.Header().Get("X-Robots-Tag"), "noindex") {
			t.Fatal("unsafe query HTML or indexable local preview")
		}
	}
	w := get("/preview/global")
	if !strings.Contains(w.Body.String(), `href="`+path+`"`) {
		t.Fatal("US homepage footer must link to the tool")
	}
	w = get("/preview/global/sitemap.xml")
	if w.Code != 200 || !strings.Contains(w.Body.String(), "/tools/fba-warehouse-lookup</loc>") || strings.Contains(w.Body.String(), "?q=") {
		t.Fatal("sitemap must include only the clean FBA tool URL")
	}
	for _, country := range []string{"germany", "france", "spain", "italy", "netherlands"} {
		if w := get("/preview/" + country + "/tools/fba-warehouse-lookup"); w.Code != 200 || !strings.Contains(w.Body.String(), "data-country-warehouse-map") || strings.Contains(w.Body.String(), `data-code="ONT8"`) {
			t.Errorf("country directory missing or US records leaked onto %s: %d", country, w.Code)
		}
		if w := get("/preview/" + country + "/sitemap.xml"); !strings.Contains(w.Body.String(), "fba-warehouse-lookup") {
			t.Errorf("country tool missing from %s sitemap", country)
		}
	}
	if _, err := a.db.Exec(`INSERT INTO site_domains(site_id,hostname,kind,redirect_to_primary,created_at,updated_at) SELECT id,'fba.example.com','alias',0,datetime('now'),datetime('now') FROM sites WHERE code='global'`); err != nil {
		t.Fatal(err)
	}
	for _, query := range []string{"", "?q=CA"} {
		w := get("http://fba.example.com/tools/fba-warehouse-lookup" + query)
		body := w.Body.String()
		if w.Code != 200 || !strings.Contains(body, `rel="canonical" href="http://fba.example.com/tools/fba-warehouse-lookup"`) || strings.Contains(body, `href="/preview/global/tools/fba-warehouse-lookup`) {
			t.Fatal("bound domain lost clean canonical or production tool links")
		}
		if strings.Contains(w.Header().Get("X-Robots-Tag"), "noindex") != (query != "") {
			t.Fatal("search parameters must be noindex; clean public tool must be indexable")
		}
	}
	w = httptest.NewRecorder()
	localPreviewHandler(a.Handler(), "global").ServeHTTP(w, httptest.NewRequest("GET", "http://localhost:8081/tools/fba-warehouse-lookup?q=ont8", nil))
	if w.Code != 200 || !strings.Contains(w.Body.String(), `action="/tools/fba-warehouse-lookup"`) {
		t.Fatal("dedicated local site port lost root-relative tool links")
	}
	w = httptest.NewRecorder()
	localPreviewHandler(a.Handler(), "global").ServeHTTP(w, httptest.NewRequest("GET", "http://localhost:8081/api/public/us-warehouse-location?q=08518", nil))
	if w.Code != 200 || !strings.Contains(w.Body.String(), `"precision":"zip-centroid"`) || !strings.Contains(w.Body.String(), "08518") {
		t.Fatal("dedicated site port must forward only the public warehouse location endpoint")
	}
	w = get("http://fba.example.com/tools/fba-warehouse-lookup?mode=nearby&q=91761&radius=25&type=fba")
	if w.Code != 200 || !strings.Contains(w.Header().Get("X-Robots-Tag"), "noindex") || !strings.Contains(w.Body.String(), `rel="canonical" href="http://fba.example.com/tools/fba-warehouse-lookup"`) {
		t.Fatal("nearby location/filter URLs must have clean canonical and noindex")
	}
}
