package app

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"

	"czcms/internal/config"
)

func TestRemotePreviewIsolationAndLegacyRedirects(t *testing.T) {
	cfg := config.Config{PreviewOrigins: map[string]string{"germany": "https://example.test:8442", "france": "https://example.test:8443"}}
	base := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Forwarded-Path", r.URL.Path)
		w.Header().Set("Preview-Marker", r.Header.Get("X-CZCMS-Local-Preview"))
	})
	handler := remotePreviewHandler(base, cfg)
	for _, tc := range []struct {
		method, path, forwarded, location string
		status                            int
	}{
		{"GET", "https://example.test:8442/product-sourcing", "/preview/germany/product-sourcing", "", 200},
		{"GET", "https://example.test:8443/", "/preview/france", "", 200},
		{"POST", "https://example.test:8442/forms/contact/submit", "/preview/germany/forms/contact/submit", "", 200},
		{"GET", "https://example.test/product-sourcing", "/product-sourcing", "", 200},
		{"GET", "https://example.test:8442/admin", "", "", 404},
		{"GET", "https://example.test:8442/api/v1/sites", "", "", 404},
		{"GET", "https://example.test/preview/germany/product-sourcing?source=test", "", "https://example.test:8442/product-sourcing?source=test", 307},
		{"POST", "https://example.test/preview/germany/forms/contact/submit", "", "https://example.test:8442/forms/contact/submit", 307},
		{"GET", "https://example.test/preview/unknown/", "", "", 404},
	} {
		t.Run(tc.method+tc.path, func(t *testing.T) {
			response := httptest.NewRecorder()
			handler.ServeHTTP(response, httptest.NewRequest(tc.method, tc.path, nil))
			if response.Code != tc.status || response.Header().Get("Forwarded-Path") != tc.forwarded || response.Header().Get("Location") != tc.location {
				t.Fatalf("status=%d path=%q location=%q", response.Code, response.Header().Get("Forwarded-Path"), response.Header().Get("Location"))
			}
		})
	}
}

func TestRemotePreviewRendersLanguageAtRoot(t *testing.T) {
	cfg := testConfig(t)
	cfg.PublicHTTPS = true
	cfg.PreviewOrigins = map[string]string{"germany": "https://www.example.com:8442", "france": "https://www.example.com:8443"}
	application, err := New(cfg, slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = application.Close() })
	for _, path := range []string{"/", "/product-sourcing", "/sitemap.xml"} {
		response := httptest.NewRecorder()
		application.Handler().ServeHTTP(response, httptest.NewRequest("GET", "https://www.example.com:8442"+path, nil))
		body := response.Body.String()
		if response.Code != 200 || response.Header().Get("X-Robots-Tag") != "noindex, nofollow" || strings.Contains(body, "/preview/") || strings.Contains(body, "localhost:") {
			t.Fatalf("unclean remote preview %s: status=%d body=%s", path, response.Code, body)
		}
		if path == "/product-sourcing" && (!strings.Contains(body, `lang="de-DE"`) || !strings.Contains(body, "https://www.example.com:8443/product-sourcing") || strings.Contains(body, `rel="canonical"`)) {
			t.Fatal("remote preview language/network/indexing mismatch")
		}
		if path == "/sitemap.xml" && !strings.Contains(body, "https://www.example.com:8442/product-sourcing") {
			t.Fatal("sitemap uses the wrong origin")
		}
	}
	// The IP/hostname can also be bound to the English site. The explicit
	// preview port must still own submissions and their signed form tokens.
	home := httptest.NewRecorder()
	application.Handler().ServeHTTP(home, httptest.NewRequest("GET", "https://www.example.com:8442/", nil))
	match := regexp.MustCompile(`<script id="freightvanta-enquiry-context" type="application/json">(.*?)</script>`).FindStringSubmatch(home.Body.String())
	if len(match) != 2 {
		t.Fatal("missing preview form context")
	}
	var formContext map[string]any
	if err := json.Unmarshal([]byte(match[1]), &formContext); err != nil {
		t.Fatal(err)
	}
	payload, _ := json.Marshal(map[string]any{"site_id": formContext["siteId"], "form_token": formContext["formToken"], "locale": "de", "full_name": "Port Preview Buyer", "work_email": "preview@example.test", "company": "Example", "origin": "China", "destination": "Germany", "starting_point": "product-sourcing", "consent": true})
	request := httptest.NewRequest("POST", "https://www.example.com:8442/home-enquiry", strings.NewReader(string(payload)))
	request.Header.Set("Origin", "https://www.example.com:8442")
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	application.Handler().ServeHTTP(response, request)
	if response.Code != 201 {
		t.Fatalf("preview form submitted to wrong site: %d %s", response.Code, response.Body.String())
	}
	var submissions int
	if err := application.db.QueryRow(`SELECT COUNT(*) FROM form_submissions f JOIN sites s ON s.id=f.site_id WHERE s.code='germany'`).Scan(&submissions); err != nil || submissions != 1 {
		t.Fatalf("German submission count=%d err=%v", submissions, err)
	}
	publicPage := httptest.NewRecorder()
	application.Handler().ServeHTTP(publicPage, httptest.NewRequest("GET", "https://www.example.com/product-sourcing", nil))
	if !strings.Contains(publicPage.Body.String(), `href="https://www.example.com:8442/product-sourcing"`) || strings.Contains(publicPage.Body.String(), `hreflang="de-DE"`) {
		t.Fatal("public navigation must offer previews without advertising them as indexable alternates")
	}
}
