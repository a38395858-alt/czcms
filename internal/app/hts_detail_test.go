package app

import (
	"html"
	"io"
	"log/slog"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHTSDetailSSRLinksRatesSEOAndRecovery(t *testing.T) {
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
	base := "/preview/global/tools/hts-code-lookup"
	w := get(base + "/3909505000")
	body := html.UnescapeString(w.Body.String())
	for _, required := range []string{"data-hts-detail", "Other polyurethanes, in primary forms", "6.3%", "Free (A*,AU", "15.4¢/kg + 51.5%", "2026 HTS Revision 22", `action="` + base + `"`, `3909.50`, "Legal leaf description", "Full legal classification", "Source & freshness", "</html>"} {
		if w.Code != 200 || !strings.Contains(body, required) {
			t.Fatalf("detail missing %q, status %d", required, w.Code)
		}
	}
	if !strings.Contains(w.Header().Get("X-Robots-Tag"), "noindex") {
		t.Fatal("preview detail indexable")
	}
	if !strings.Contains(get(base+"?q=3909505000").Body.String(), `href="`+base+`/3909505000"`) {
		t.Fatal("SSR result missing preview detail link")
	}
	if !strings.Contains(get(base+"/8517140020").Body.String(), "Inherited from 8517.14.00") {
		t.Fatal("inherited rate source missing")
	}
	for _, code := range []string{"0000000000", "1234", "3909505000/extra"} {
		w = get(base + "/" + code)
		if w.Code != 404 || !strings.Contains(w.Body.String(), "Search customs codes") || !strings.Contains(w.Body.String(), `href="`+base+`"`) {
			t.Fatalf("unusable missing code %s: %d", code, w.Code)
		}
	}
	if _, err = a.db.Exec(`INSERT INTO site_domains(site_id,hostname,kind,redirect_to_primary,created_at,updated_at) SELECT id,'htsdetail.example.test','alias',0,datetime('now'),datetime('now') FROM sites WHERE code='global'`); err != nil {
		t.Fatal(err)
	}
	for _, query := range []string{"", "?q=anything"} {
		w = get("http://htsdetail.example.test/tools/hts-code-lookup/3909505000" + query)
		if w.Code != 200 || !strings.Contains(w.Body.String(), `rel="canonical" href="http://htsdetail.example.test/tools/hts-code-lookup/3909505000"`) || strings.Contains(w.Header().Get("X-Robots-Tag"), "noindex") != (query != "") {
			t.Fatal("detail canonical or index policy")
		}
	}
	if get("/preview/germany/tools/hts-code-lookup/3909505000").Code != 404 {
		t.Fatal("US-only detail exposed in another market")
	}
}
