package app

import (
	"html"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestShippingPlannerResultsRouteAndPreviewLinks(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	defer a.Close()
	for _, path := range []string{"/preview/global", "/preview/global/tools/shipping-calculator", "/preview/global/tools/shipping-results?origin=shanghai&destination=los-angeles&mode=sea&weight=500&volume=2"} {
		w := httptest.NewRecorder()
		a.Handler().ServeHTTP(w, httptest.NewRequest(http.MethodGet, path, nil))
		body := w.Body.String()
		if w.Code != 200 || !strings.Contains(body, `href="/preview/global/tools/shipping-calculator"`) {
			t.Fatalf("missing preview links: status=%d path=%s", w.Code, path)
		}
		if path == "/preview/global" {
			if strings.Count(body, `data-shipping-planner `) != 1 || !strings.Contains(body, `<h2 id="shipping-planner-title"`) || !strings.Contains(body, `action="/preview/global/tools/shipping-results"`) {
				t.Fatal("homepage needs one working query form with an H2 and a site-scoped results route")
			}
			if strings.Contains(body, `id="sp-tool-link-title"`) || strings.Contains(body, `class="sp-lanes"`) || strings.Count(body, `<h1 `) != 1 {
				t.Fatal("homepage must keep its hero heading and compact calculator without the old link block or dedicated-page guide")
			}
			if strings.Index(body, `id="shipping-planner"`) > strings.Index(body, `class="fv-ref-coverage"`) {
				t.Fatal("homepage calculator should follow the hero, before the capability section")
			}
		} else if !strings.Contains(body, `action="/preview/global/tools/shipping-results"`) || !strings.Contains(body, `<h1 id="shipping-planner-title"`) || !strings.Contains(body, `data-sp-home="/preview/global"`) {
			t.Fatal("dedicated tool pages need their own heading and correctly scoped form")
		}
		if path != "/preview/global" && !strings.Contains(body, `aria-label="Breadcrumb"`) {
			t.Fatal("secondary tool pages need visible breadcrumbs")
		}
		if strings.Contains(path, "shipping-results") && (!strings.Contains(body, `data-sp-page="results"`) || !strings.Contains(body, `<h1 id="shipping-planner-title"`) || !strings.Contains(w.Header().Get("X-Robots-Tag"), "noindex")) {
			t.Fatal("result page needs independent heading and noindex")
		}
		title := "China to USA Shipping Cost & Transit Time Calculator | FreightVanta"
		if path == "/preview/global" {
			title = "China to USA Freight & US Delivery | FreightVanta"
		}
		if strings.Contains(path, "shipping-results") {
			title = "Shipping Cost & Transit Time Results | FreightVanta"
		}
		if !strings.Contains(body, "<title>"+html.EscapeString(title)+"</title>") ||
			!strings.Contains(body, `property="og:title" content="`+html.EscapeString(title)+`"`) ||
			strings.Count(body, `name="keywords"`) != 1 ||
			!strings.Contains(body, "shipping cost calculator") {
			t.Fatalf("missing or inconsistent shipping SEO metadata on %s", path)
		}
		main := strings.SplitN(body, "</head>", 2)[1]
		if path != "/preview/global" && (!strings.Contains(main, "shipping cost calculator and transit time lookup") || !strings.Contains(main, "How to check shipping costs and transit times")) {
			t.Fatal("shipping cost and transit time content must be visible without JavaScript")
		}
	}
	w := httptest.NewRecorder()
	localPreviewHandler(a.Handler(), "global").ServeHTTP(w, httptest.NewRequest(http.MethodGet, "http://localhost:8081/tools/shipping-calculator", nil))
	if w.Code != 200 || !strings.Contains(w.Body.String(), `data-sp-calculator="/tools/shipping-calculator"`) || !strings.Contains(w.Body.String(), `data-sp-page="calculator"`) {
		t.Fatal("dedicated calculator must work on independent site ports")
	}
	w = httptest.NewRecorder()
	localPreviewHandler(a.Handler(), "global").ServeHTTP(w, httptest.NewRequest(http.MethodGet, "http://localhost:8081/tools/shipping-results", nil))
	if w.Code != 200 || !strings.Contains(w.Body.String(), `action="/tools/shipping-results"`) || strings.Contains(w.Body.String(), `action="//tools/shipping-results"`) {
		t.Fatal("dedicated local ports must use a root-relative result route")
	}
	w = httptest.NewRecorder()
	a.Handler().ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/preview/global/sitemap.xml", nil))
	if w.Code != 200 || !strings.Contains(w.Body.String(), "/tools/shipping-calculator</loc>") || strings.Contains(w.Body.String(), "/tools/shipping-results</loc>") {
		t.Fatal("sitemap must include the clean calculator route without query results")
	}
	for _, slug := range []string{"shipping-calculator", "shipping-results"} {
		query := "?mode=sea&oceanType=fcl&containerCount=2&lang=en"
		w = httptest.NewRecorder()
		a.Handler().ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/preview/global/"+slug+query, nil))
		if w.Code != http.StatusPermanentRedirect || w.Header().Get("Location") != "/preview/global/tools/"+slug+query {
			t.Fatalf("legacy tool link must redirect while retaining its query: %d %s", w.Code, w.Header().Get("Location"))
		}
		w = httptest.NewRecorder()
		localPreviewHandler(a.Handler(), "global").ServeHTTP(w, httptest.NewRequest(http.MethodGet, "http://localhost:8081/"+slug+query, nil))
		if w.Code != http.StatusPermanentRedirect || w.Header().Get("Location") != "/tools/"+slug+query {
			t.Fatalf("site-port legacy redirect has the wrong scope: %d %s", w.Code, w.Header().Get("Location"))
		}
	}
}

func TestCountryShippingHomeCalculatorResultsAndSitemap(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	defer a.Close()
	for _, market := range []struct{ site, language, title, city string }{
		{"germany", "de", "China nach Deutschland", "Hamburg"},
		{"france", "fr", "Chine–France", "Le Havre"},
		{"spain", "es", "China a España", "Valencia"},
		{"italy", "it", "Cina–Italia", "Genova"},
		{"netherlands", "nl", "China naar Nederland", "Rotterdam"},
	} {
		t.Run(market.site, func(t *testing.T) {
			base := "/preview/" + market.site
			for _, route := range []string{"", "/tools/shipping-calculator", "/tools/shipping-results"} {
				w := httptest.NewRecorder()
				a.Handler().ServeHTTP(w, httptest.NewRequest(http.MethodGet, base+route, nil))
				body := w.Body.String()
				if w.Code != http.StatusOK {
					t.Fatalf("%s: status %d", route, w.Code)
				}
				for _, expected := range []string{`lang="` + market.language + `"`, `action="` + base + `/tools/shipping-results"`, `href="` + base + `/tools/shipping-calculator"`, market.city, `name="keywords"`} {
					if !strings.Contains(body, expected) {
						t.Errorf("%s missing %q", route, expected)
					}
				}
				if route == "" {
					if !strings.Contains(body, `<h2 id="shipping-planner-title"`) {
						t.Error("homepage needs a crawlable working query form with an H2")
					}
					if strings.Contains(body, "__FV_SHIPPING_") {
						t.Error("unresolved homepage planner placeholder")
					}
				} else if !strings.Contains(body, `<h1 id="shipping-planner-title"`) {
					t.Error("dedicated pages need an H1")
				}
				if route == "/tools/shipping-calculator" {
					if !strings.Contains(body, market.title) || !strings.Contains(body, `class="sp-market-regions"`) || !strings.Contains(body, `class="sp-faq"`) || !strings.Contains(body, `FAQPage`) {
						t.Error("missing localized metadata, regional guide or FAQ schema")
					}
				}
				if route == "/tools/shipping-results" && !strings.Contains(w.Header().Get("X-Robots-Tag"), "noindex") {
					t.Error("results must be noindex")
				}
				main := strings.SplitN(body, `<section class="shipping-planner"`, 2)
				if len(main) != 2 {
					t.Fatal("planner markup missing")
				}
				form := strings.SplitN(main[1], "</form>", 2)[0]
				for _, foreign := range []string{"Matson", "Los Angeles", "US ZIP", "USD", `value="matson"`} {
					if strings.Contains(form, foreign) {
						t.Errorf("%s leaked foreign market value %q", route, foreign)
					}
				}
			}
			w := httptest.NewRecorder()
			a.Handler().ServeHTTP(w, httptest.NewRequest(http.MethodGet, base+"/sitemap.xml", nil))
			if w.Code != http.StatusOK || !strings.Contains(w.Body.String(), "/tools/shipping-calculator</loc>") || strings.Contains(w.Body.String(), "/tools/shipping-results") {
				t.Error("sitemap must include only the clean calculator route")
			}
			w = httptest.NewRecorder()
			a.Handler().ServeHTTP(w, httptest.NewRequest(http.MethodGet, base+"/shipping-calculator?lang="+market.language, nil))
			if w.Code != http.StatusPermanentRedirect || w.Header().Get("Location") != base+"/tools/shipping-calculator?lang="+market.language {
				t.Error("legacy aliases must preserve site and language")
			}
		})
	}
}
