package app

import (
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
)

func TestPublicPagesShareOneServerRenderedHeader(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = a.Close() })
	headerPattern := regexp.MustCompile(`(?s)<header class="fv-head.*?</header>`)
	for _, site := range []struct{ code, contact, about string }{
		{"global", "contact", "about"}, {"germany", "kontakt", "ueber-uns"},
		{"france", "contact", "a-propos"}, {"spain", "contacto", "quienes-somos"},
		{"italy", "contatti", "chi-siamo"}, {"netherlands", "contact", "over-ons"},
	} {
		for _, route := range []string{"", "guides", "product-sourcing", "services/packaging-branding", "industries/consumer-goods", site.contact, site.about, "page-that-does-not-exist"} {
			t.Run(site.code+"/"+route, func(t *testing.T) {
				response := httptest.NewRecorder()
				a.Handler().ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/preview/"+site.code+"/"+route, nil))
				body := response.Body.String()
				if response.Code != http.StatusOK && !(route == "page-that-does-not-exist" && response.Code == http.StatusNotFound) {
					t.Fatalf("status=%d", response.Code)
				}
				if strings.Count(body, "data-shared-header") != 1 {
					t.Fatal("page must have exactly one shared header before JavaScript")
				}
				header := headerPattern.FindString(body)
				for _, expected := range []string{`class="fv-head-brand"`, `class="fv-head-nav"`, `class="fv-head-panel" data-columns="2"`, `class="fv-head-language"`, `fv-head-cta"`, `/preview/` + site.code + `/services/packaging-branding`} {
					if !strings.Contains(header, expected) {
						t.Fatalf("shared header missing %s", expected)
					}
				}
				if strings.Contains(body, `/assets/js/mega-menu.js`) {
					t.Fatal("legacy menu patcher must not run alongside the shared header")
				}
				if strings.Contains(body, `data-prerendered="true"`) || strings.Contains(body, `data-topic-template="v18"`) {
					root := strings.Index(body, `<div id="root"`)
					if root < strings.Index(body, header) || strings.Contains(body[root:], `<header`) {
						t.Fatal("React must not own a second header")
					}
					if !strings.Contains(body, `"sharedHeader":true`) {
						t.Fatal("hydration must know the shared header is supplied by the CMS")
					}
				}
			})
		}
	}
}
