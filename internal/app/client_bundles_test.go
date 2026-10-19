package app

import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"

	webassets "czcms/frontend"
)

func TestLocalizedClientBundles(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	defer a.Close()
	type clientBundle struct {
		Entry    string              `json:"entry"`
		Preloads map[string][]string `json:"preloads"`
	}
	load := func(root string) clientBundle {
		t.Helper()
		body, err := webassets.Files.ReadFile("assets/" + root + "/client.json")
		if err != nil {
			t.Fatal(err)
		}
		var bundle clientBundle
		if err := json.Unmarshal(body, &bundle); err != nil {
			t.Fatal(err)
		}
		return bundle
	}
	topics, homes, dutch := load("freightvanta-topic-v18"), load("freightvanta-template"), load("nl-template")
	get := func(site string, port int, path string) string {
		t.Helper()
		w := httptest.NewRecorder()
		localPreviewHandler(a.Handler(), site).ServeHTTP(w, httptest.NewRequest("GET", fmt.Sprintf("http://localhost:%d%s", port, path), nil))
		if w.Code != 200 {
			t.Fatalf("%s status=%d", path, w.Code)
		}
		return w.Body.String()
	}
	preloadPattern := regexp.MustCompile(`<link rel="modulepreload" href="([^"]+)">`)
	check := func(body, locale string, bundle clientBundle, budget int) {
		t.Helper()
		if strings.Contains(bundle.Entry, "?") || !strings.HasSuffix(bundle.Entry, ".js") || !strings.Contains(body, `src="`+bundle.Entry+`"`) {
			t.Fatalf("entry is not the content-addressed module: %s", bundle.Entry)
		}
		expected := bundle.Preloads[locale]
		if len(expected) == 0 {
			t.Fatalf("missing preloads for %s", locale)
		}
		actual := preloadPattern.FindAllStringSubmatch(body, -1)
		if len(actual) != len(expected) {
			t.Fatalf("preload count=%d expected=%d", len(actual), len(expected))
		}
		files := map[string]bool{bundle.Entry: true}
		for i, match := range actual {
			if match[1] != expected[i] {
				t.Fatalf("wrong locale preload %s", match[1])
			}
			files[match[1]] = true
		}
		size := 0
		for path := range files {
			if !strings.HasPrefix(path, "/assets/") || strings.Contains(path, "/App-") {
				t.Fatalf("unexpected production dependency %s", path)
			}
			content, err := webassets.Files.ReadFile(strings.TrimPrefix(path, "/"))
			if err != nil {
				t.Fatal(err)
			}
			var compressed bytes.Buffer
			writer := gzip.NewWriter(&compressed)
			if _, err := writer.Write(content); err != nil {
				t.Fatal(err)
			}
			if err := writer.Close(); err != nil {
				t.Fatal(err)
			}
			size += compressed.Len()
		}
		if size > budget {
			t.Fatalf("%s initial gzip JS=%d exceeds budget=%d", locale, size, budget)
		}
	}
	for i, m := range []struct{ site, locale string }{{"global", "en"}, {"germany", "de"}, {"france", "fr"}, {"spain", "es"}, {"italy", "it"}, {"netherlands", "nl"}} {
		t.Run(m.locale, func(t *testing.T) {
			port := 8081 + i
			for _, path := range []string{"/product-sourcing", "/services/packaging-branding", "/industries/time-critical-cargo"} {
				body := get(m.site, port, path)
				check(body, m.locale, topics, 160000)
				if !strings.Contains(body, `id="main"`) || !strings.Contains(body, "<h1") {
					t.Fatal("prerendered topic content missing")
				}
			}
			if m.locale == "fr" || m.locale == "es" || m.locale == "it" {
				check(get(m.site, port, "/"), m.locale, homes, 130000)
			}
			if m.locale == "nl" {
				check(get(m.site, port, "/"), m.locale, dutch, 115000)
			}
		})
	}
}
