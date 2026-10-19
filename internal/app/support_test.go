package app

import (
	"compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
	"time"

	"czcms/internal/catalog"
	"czcms/internal/contentsafety"
	"czcms/internal/security"
)

func TestSupportDestinationsAndCMSOverride(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	defer a.Close()
	markets := []struct {
		site, locale, contact, about, privacy, legal string
		port                                         int
	}{
		{"global", "en", "contact", "about", "privacy", "legal", 8081},
		{"germany", "de-DE", "kontakt", "ueber-uns", "datenschutz", "impressum", 8082},
		{"france", "fr-FR", "contact", "a-propos", "confidentialite", "mentions-legales", 8083},
		{"spain", "es-ES", "contacto", "quienes-somos", "privacidad", "aviso-legal", 8084},
		{"italy", "it-IT", "contatti", "chi-siamo", "privacy", "note-legali", 8085},
		{"netherlands", "nl-NL", "contact", "over-ons", "privacy", "bedrijfsgegevens", 8086},
	}
	get := func(site string, port int, path string) *httptest.ResponseRecorder {
		t.Helper()
		w := httptest.NewRecorder()
		r := httptest.NewRequest(http.MethodGet, fmt.Sprintf("http://localhost:%d/%s", port, path), nil)
		localPreviewHandler(a.Handler(), site).ServeHTTP(w, r)
		return w
	}
	t.Run("public asset compression", func(t *testing.T) {
		r := httptest.NewRequest(http.MethodGet, "/assets/js/public-navigation.js", nil)
		r.Header.Set("Accept-Encoding", "gzip")
		w := httptest.NewRecorder()
		a.Handler().ServeHTTP(w, r)
		if w.Code != 200 || w.Header().Get("Content-Encoding") != "gzip" || !strings.Contains(strings.Join(w.Header().Values("Vary"), ","), "Accept-Encoding") {
			t.Fatalf("compression status=%d headers=%v", w.Code, w.Header())
		}
		reader, err := gzip.NewReader(w.Body)
		if err != nil {
			t.Fatal(err)
		}
		defer reader.Close()
		body, err := io.ReadAll(reader)
		if err != nil || !strings.Contains(string(body), "Shared document navigation") {
			t.Fatal("invalid compressed asset")
		}
	})
	for _, m := range markets {
		t.Run(m.site, func(t *testing.T) {
			sitemap := get(m.site, m.port, "sitemap.xml").Body.String()
			for _, route := range []string{"/product-sourcing", "/services/worldwide-fulfillment", "/industries/time-critical-cargo", "/services", "/" + m.about} {
				if !strings.Contains(sitemap, route+"</loc>") {
					t.Fatalf("sitemap missing %s", route)
				}
			}
			if strings.Contains(sitemap, "/"+m.privacy+"</loc>") || strings.Contains(sitemap, "/"+m.legal+"</loc>") {
				t.Fatal("provisional legal page in sitemap")
			}
			for _, path := range []string{m.contact, m.about, m.privacy, m.legal, "cookies", "terms", "services", "industries", "contact-us"} {
				w := get(m.site, m.port, path)
				body := w.Body.String()
				if w.Code != 200 || strings.Count(body, "<h1>") != 1 {
					t.Fatalf("/%s status=%d h1=%d", path, w.Code, strings.Count(body, "<h1>"))
				}
				if strings.Contains(body, "example.com") {
					t.Fatalf("/%s contains example contact", path)
				}
				if path == m.contact && (!strings.Contains(body, "data-home-enquiry data-placement=\"contact\"") || !strings.Contains(body, "formToken") || !strings.Contains(body, `name="consent" required`)) {
					t.Fatal("contact page not connected to protected inbox")
				}
				if (path == m.privacy || path == m.legal) && !strings.Contains(body, `content="noindex,follow"`) {
					t.Fatal("incomplete policy is indexable")
				}
				if (path == "services" || path == "industries") && !strings.Contains(body, `href="/`+map[string]string{"services": "product-sourcing", "industries": "industries/cross-border-ecommerce"}[path]+`"`) {
					t.Fatalf("%s missing actual topic", path)
				}
			}
			guide := get(m.site, m.port, "guides").Body.String()
			if strings.Contains(guide, `href="/#contact"`) || strings.Contains(guide, `href="/#services"`) {
				t.Fatal("guide retains broken generic homepage anchors")
			}
		})
	}
	// A published editor-owned policy replaces the fallback without changing code.
	now := time.Now().UTC().Format(time.RFC3339)
	result, err := a.db.Exec(`INSERT INTO users(username,display_name,password_hash,password_changed_at,created_at,updated_at) VALUES('support-qa','QA','test',?,?,?)`, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	actor, _ := result.LastInsertId()
	s := catalog.New(a.db, contentsafety.NewSanitizer())
	site, err := s.SiteByCode(context.Background(), "global")
	if err != nil {
		t.Fatal(err)
	}
	_, err = s.CreateContent(context.Background(), actor, catalog.CreateContentInput{ContentType: "page", SiteID: site.ID, Locale: "en", Status: "published", Title: "Approved operator policy", Slug: "privacy", BodyHTML: "<h2>Verified policy</h2><p>Editor owned content.</p>", AIState: "manual"})
	if err != nil {
		t.Fatal(err)
	}
	body := get("global", 8081, "privacy").Body.String()
	if !strings.Contains(body, "Editor owned content.") || strings.Contains(body, "This summary is incomplete") {
		t.Fatal("fallback overrode CMS content")
	}
}

func TestContactPagesSubmitToInbox(t *testing.T) {
	cfg, err := testConfig(t).Normalize()
	if err != nil {
		t.Fatal(err)
	}
	a, err := New(cfg, slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	defer a.Close()
	keys, err := security.LoadKeyring(cfg.MasterKey, cfg.SecretsDir, cfg.Environment)
	if err != nil {
		t.Fatal(err)
	}
	contextPattern := regexp.MustCompile(`<script id="freightvanta-enquiry-context" type="application/json">(.*?)</script>`)
	for _, market := range []struct{ site, locale, path string }{
		{"global", "en", "contact"}, {"germany", "de", "kontakt"}, {"france", "fr", "contact"},
		{"spain", "es", "contacto"}, {"italy", "it", "contatti"}, {"netherlands", "nl", "contact"},
	} {
		t.Run(market.locale, func(t *testing.T) {
			base := "http://unbound.test/preview/" + market.site
			page := httptest.NewRecorder()
			a.Handler().ServeHTTP(page, httptest.NewRequest(http.MethodGet, base+"/"+market.path, nil))
			match := contextPattern.FindStringSubmatch(page.Body.String())
			if page.Code != 200 || len(match) != 2 {
				t.Fatalf("contact context unavailable: %d", page.Code)
			}
			var formContext map[string]any
			if err := json.Unmarshal([]byte(match[1]), &formContext); err != nil {
				t.Fatal(err)
			}
			email := "contact-" + market.locale + "@example.test"
			payload, _ := json.Marshal(map[string]any{"site_id": formContext["siteId"], "locale": market.locale, "form_token": formContext["formToken"], "full_name": "Contact QA", "work_email": email, "starting_point": "not-sure", "cargo_details": "A contact-page enquiry", "consent": true, "placement": "contact"})
			r := httptest.NewRequest(http.MethodPost, base+"/home-enquiry", strings.NewReader(string(payload)))
			r.Header.Set("Content-Type", "application/json")
			r.Header.Set("Origin", "http://unbound.test")
			w := httptest.NewRecorder()
			a.Handler().ServeHTTP(w, r)
			if w.Code != http.StatusCreated {
				t.Fatalf("contact submission: %d %s", w.Code, w.Body.String())
			}
			var response struct {
				Reference string `json:"reference"`
			}
			if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
				t.Fatal(err)
			}
			var storedSite int64
			var source, status string
			var encrypted []byte
			err = a.db.QueryRow(`SELECT site_id,source_path,status,values_encrypted FROM form_submissions WHERE id=?`, strings.TrimPrefix(response.Reference, "FV-")).Scan(&storedSite, &source, &status, &encrypted)
			if err != nil {
				t.Fatal(err)
			}
			plain, err := keys.Decrypt("form-submission", encrypted)
			if err != nil {
				t.Fatal(err)
			}
			var values map[string]string
			if err := json.Unmarshal(plain, &values); err != nil {
				t.Fatal(err)
			}
			if source != "/"+market.path || status != "new" || storedSite != int64(formContext["siteId"].(float64)) || values["work_email"] != email || values["placement"] != "contact" || values["cargo_details"] != "A contact-page enquiry" {
				t.Fatalf("incorrect inbox record: site=%d source=%q status=%q values=%v", storedSite, source, status, values)
			}
			if strings.Contains(string(encrypted), email) {
				t.Fatal("contact data stored in plaintext")
			}
		})
	}
}
