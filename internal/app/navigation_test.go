package app

import (
	"html"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
)

func TestLanguageSwitchKeepsEveryImportedTopic(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = a.Close() })
	for _, site := range []string{"global", "germany", "spain", "france", "italy", "netherlands"} {
		for _, route := range []string{"product-sourcing", "services/packaging-branding", "industries/industrial-components"} {
			response := httptest.NewRecorder()
			a.Handler().ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/preview/"+site+"/"+route, nil))
			ctx := importedContext(t, response.Body.String())
			languages := ctx["languages"].(map[string]any)
			for _, code := range []string{"en", "de", "fr", "es", "it", "nl"} {
				href := html.EscapeString(languages[code].(string) + "/" + route)
				pattern := `href="` + regexp.QuoteMeta(href) + `"[^>]*href[Ll]ang="` + code + `"`
				if !regexp.MustCompile(pattern).MatchString(response.Body.String()) {
					t.Fatalf("%s/%s lost %s topic language link", site, route, code)
				}
			}
		}
	}
}

func TestLocalizedHomesRenderFullCompositionWithoutInlineExecution(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = a.Close() })
	for _, site := range []string{"global", "germany", "france", "spain", "italy", "netherlands"} {
		response := httptest.NewRecorder()
		a.Handler().ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/preview/"+site, nil))
		body := response.Body.String()
		if response.Code != http.StatusOK {
			t.Fatalf("%s status=%d", site, response.Code)
		}
		if site != "global" && site != "germany" {
			for _, required := range []string{`data-prerendered="true"`, `freightvanta-home-context`, `<header`, `<footer`, `<h1`} {
				if !strings.Contains(body, required) {
					t.Fatalf("%s missing full homepage %s", site, required)
				}
			}
			if strings.Contains(body, "__FV_HOME_") {
				t.Fatalf("%s has unresolved language host", site)
			}
		}
		for _, script := range regexp.MustCompile(`(?s)<script([^>]*)>(.*?)</script>`).FindAllStringSubmatch(body, -1) {
			if !strings.Contains(script[1], `src=`) && !strings.Contains(script[1], `type="application/`) && strings.TrimSpace(script[2]) != "" {
				t.Fatalf("%s contains executable inline script", site)
			}
		}
		if !strings.Contains(body, `rel="icon"`) {
			t.Fatalf("%s missing favicon", site)
		}
		if strings.Contains(body, "fonts.googleapis.com/css") {
			t.Fatalf("%s blocks first paint on external fonts", site)
		}
	}
}
