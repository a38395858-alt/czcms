package app

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

func TestHTSPublicSearchSSRSEOAndUSOnlyFooter(t *testing.T) {
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
	path := "/preview/global/tools/hts-code-lookup"
	for _, q := range []string{"", "?q=8517130000", "?q=8517140020", "?q=84&page=2", "?q=noSuchProductZZZ", "?q=" + url.QueryEscape(`<script>alert(1)</script>`)} {
		w := get(path + q)
		body := w.Body.String()
		if w.Code != 200 || strings.Count(body, "<h1>") != 1 || !strings.Contains(body, `action="`+path+`"`) || !strings.Contains(body, "data-hts-lookup") || strings.Contains(body, `<script>alert(1)</script>`) {
			t.Fatalf("HTS SSR %s: %d", q, w.Code)
		}
		if q == "?q=8517130000" && (!strings.Contains(body, "Smartphones") || !strings.Contains(body, "8517.13.00.00") || !strings.Contains(body, "Free")) {
			t.Fatal("exact search requires JavaScript")
		}
		if q == "?q=8517140020" && !strings.Contains(body, "From 8517.14.00") {
			t.Fatal("inherited rate source hidden")
		}
		if q == "?q=84&page=2" && !strings.Contains(body, `data-hts-page="1"`) {
			t.Fatal("SSR pagination is not usable")
		}
		if !strings.Contains(w.Header().Get("X-Robots-Tag"), "noindex") {
			t.Fatal("indexable local preview")
		}
		if strings.Contains(strings.SplitN(body, "</header>", 2)[0], `href="`+path+`"`) {
			t.Fatal("tool added to top navigation")
		}
	}
	if !strings.Contains(get("/preview/global").Body.String(), `href="`+path+`"`) {
		t.Fatal("US footer entry missing")
	}
	for _, site := range []string{"germany", "france", "spain", "italy", "netherlands"} {
		if get("/preview/"+site+"/tools/hts-code-lookup").Code != 404 || strings.Contains(get("/preview/"+site+"/sitemap.xml").Body.String(), "hts-code-lookup") {
			t.Fatal("US-only tariff tool exposed as country tariff data")
		}
	}
	if _, err = a.db.Exec(`INSERT INTO site_domains(site_id,hostname,kind,redirect_to_primary,created_at,updated_at) SELECT id,'hts.example.test','alias',0,datetime('now'),datetime('now') FROM sites WHERE code='global'`); err != nil {
		t.Fatal(err)
	}
	for _, q := range []string{"", "?q=8517130000"} {
		w := get("http://hts.example.test/tools/hts-code-lookup" + q)
		if w.Code != 200 || !strings.Contains(w.Body.String(), `rel="canonical" href="http://hts.example.test/tools/hts-code-lookup"`) || strings.Contains(w.Header().Get("X-Robots-Tag"), "noindex") != (q != "") {
			t.Fatal("public clean canonical/index policy failed")
		}
	}
	w := get("/api/public/hts-search?q=8517130000")
	var result struct {
		Items []struct{ Code, GeneralRate string }
		Total int
	}
	if json.Unmarshal(w.Body.Bytes(), &result) != nil || w.Code != 200 || result.Total != 1 || result.Items[0].Code != "8517130000" || result.Items[0].GeneralRate != "Free" {
		t.Fatal("public exact result incorrect")
	}
	if strings.Contains(w.Body.String(), "recipient") || !strings.Contains(w.Header().Get("X-Robots-Tag"), "noindex") {
		t.Fatal("public search leaked operations or lacks noindex")
	}
	w = httptest.NewRecorder()
	localPreviewHandler(a.Handler(), "global").ServeHTTP(w, httptest.NewRequest("GET", "http://localhost:8081/api/public/hts-search?q=8517130000", nil))
	if w.Code != 200 {
		t.Fatal("dedicated preview did not forward HTS endpoint")
	}
	for i := 0; i < 36; i++ {
		w = get("/api/public/hts-search?q=8517130000")
		if w.Code == 429 {
			break
		}
	}
	if w.Code != 429 || w.Header().Get("Retry-After") == "" {
		t.Fatal("public search rate limit missing")
	}
}

func TestHTSSyncStatusRequiresLoginAndMutationRequiresCSRF(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	defer a.Close()
	server := httptest.NewServer(a.Handler())
	defer server.Close()
	jar, _ := cookiejar.New(nil)
	client := &http.Client{Jar: jar, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
	response := mustGet(t, client, server.URL+"/api/v1/system/hts")
	if response.StatusCode != 401 {
		t.Fatal("anonymous HTS operations access")
	}
	response.Body.Close()
	setup := mustGet(t, client, server.URL+"/setup")
	token := extractToken(t, readBody(t, setup))
	response = postForm(t, client, server.URL+"/setup", token, url.Values{"username": {"owner"}, "display_name": {"Owner"}, "email": {"owner@example.test"}, "password": {"correct horse battery staple"}, "password_confirm": {"correct horse battery staple"}})
	if response.StatusCode != 303 {
		t.Fatal("isolated owner setup failed")
	}
	response.Body.Close()
	login := mustGet(t, client, server.URL+"/login")
	token = extractToken(t, readBody(t, login))
	response = postForm(t, client, server.URL+"/login", token, url.Values{"username": {"owner"}, "password": {"correct horse battery staple"}, "next": {"/admin"}})
	if response.StatusCode != 303 {
		t.Fatal("isolated login failed")
	}
	response.Body.Close()
	response = mustGet(t, client, server.URL+"/api/v1/system/hts")
	body := readBody(t, response)
	if response.StatusCode != 200 || !strings.Contains(body, `"entries":19949`) || !strings.Contains(body, `"notification"`) {
		t.Fatal("authorized HTS state missing")
	}
	response = doJSON(t, client, "POST", server.URL+"/api/v1/system/hts/sync", "", map[string]any{})
	if response.StatusCode != 403 {
		t.Fatal("unprotected HTS synchronization")
	}
	response.Body.Close()
}
