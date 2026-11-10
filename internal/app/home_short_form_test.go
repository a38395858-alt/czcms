package app

import (
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"

	"czcms/internal/mailer"
)

func TestLocalizedShortHomeAndContactFormsKeepSourceAndQueueNotifications(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = a.Close() })
	// Real persistence and notification queuing, with external delivery stopped.
	if err = a.mail.Close(context.Background()); err != nil {
		t.Fatal(err)
	}
	settings, err := a.mail.Settings(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	_, err = a.mail.Save(context.Background(), mailer.Input{Enabled: true, Host: settings.Host, Port: settings.Port, Security: settings.Security, Username: settings.Username, Password: "test-only", FromEmail: settings.FromEmail, FromName: settings.FromName, Recipient: settings.Recipient, Version: settings.Version})
	if err != nil {
		t.Fatal(err)
	}
	pattern := regexp.MustCompile(`<script id="freightvanta-enquiry-context" type="application/json">(.*?)</script>`)
	markets := []struct{ site, locale, contact string }{
		{"global", "en", "contact"}, {"germany", "de", "kontakt"}, {"france", "fr", "contact"},
		{"spain", "es", "contacto"}, {"italy", "it", "contatti"}, {"netherlands", "nl", "contact"},
	}
	for _, market := range markets {
		for _, placement := range []string{"home-enquiry", "contact"} {
			t.Run(market.locale+"/"+placement, func(t *testing.T) {
				base := "http://unbound.test/preview/" + market.site
				route, source := "", "/"
				if placement == "contact" {
					route, source = "/"+market.contact, "/"+market.contact
				}
				page := httptest.NewRecorder()
				a.Handler().ServeHTTP(page, httptest.NewRequest("GET", base+route, nil))
				body := page.Body.String()
				if page.Code != 200 || !strings.Contains(body, `class="cz-enq"`) {
					t.Fatalf("short form missing: %d", page.Code)
				}
				match := pattern.FindStringSubmatch(body)
				if len(match) != 2 {
					t.Fatal("enquiry context missing")
				}
				var ctx map[string]any
				if err = json.Unmarshal([]byte(match[1]), &ctx); err != nil {
					t.Fatal(err)
				}
				// The same minimal request works with company and shipment details blank.
				payload := map[string]any{"site_id": ctx["siteId"], "locale": market.locale, "form_token": ctx["formToken"], "full_name": "Short form buyer", "work_email": market.locale + "." + placement + "@example.test", "starting_point": "air-freight", "consent": true, "placement": placement}
				encoded, _ := json.Marshal(payload)
				request := httptest.NewRequest("POST", base+"/home-enquiry", strings.NewReader(string(encoded)))
				request.Header.Set("Origin", "http://unbound.test")
				request.Header.Set("Content-Type", "application/json")
				result := httptest.NewRecorder()
				a.Handler().ServeHTTP(result, request)
				if result.Code != 201 {
					t.Fatalf("short form submission: %d %s", result.Code, result.Body.String())
				}
				var response struct{ Reference string }
				if err = json.Unmarshal(result.Body.Bytes(), &response); err != nil {
					t.Fatal(err)
				}
				var storedSource string
				var siteID int64
				if err = a.db.QueryRow(`SELECT source_path,site_id FROM form_submissions WHERE id=?`, strings.TrimPrefix(response.Reference, "FV-")).Scan(&storedSource, &siteID); err != nil {
					t.Fatal(err)
				}
				if storedSource != source || siteID != int64(ctx["siteId"].(float64)) {
					t.Fatalf("incorrect attribution: %q %d", storedSource, siteID)
				}
			})
		}
	}
	var queued int
	if err = a.db.QueryRow(`SELECT count(*) FROM mail_deliveries`).Scan(&queued); err != nil || queued != 12 {
		t.Fatalf("expected twelve queued notifications, got %d: %v", queued, err)
	}
}
