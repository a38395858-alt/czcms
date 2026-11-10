package app

import (
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http/httptest"
	"strings"
	"testing"

	"czcms/internal/mailer"
)

func TestLocalizedShortTopicFormsKeepSourceAndQueueNotifications(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = a.Close() })
	// Queue notifications in an isolated database; never send external mail.
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
	for _, market := range []struct{ site, locale string }{{"global", "en"}, {"germany", "de"}, {"france", "fr"}, {"spain", "es"}, {"italy", "it"}, {"netherlands", "nl"}} {
		t.Run(market.locale, func(t *testing.T) {
			base := "http://unbound.test/preview/" + market.site
			page := httptest.NewRecorder()
			a.Handler().ServeHTTP(page, httptest.NewRequest("GET", base+"/product-sourcing", nil))
			ctx := importedContext(t, page.Body.String())
			// Company, phone, origin, destination and cargo details are optional,
			// just as they are on the English homepage.
			payload := map[string]any{"site_id": ctx["siteId"], "locale": market.locale, "form_token": ctx["formToken"], "full_name": "Topic buyer", "work_email": market.locale + "@example.test", "starting_point": "not-sure", "consent": true, "placement": "topic", "route": "product-sourcing"}
			encoded, _ := json.Marshal(payload)
			request := httptest.NewRequest("POST", base+"/home-enquiry", strings.NewReader(string(encoded)))
			request.Header.Set("Origin", "http://unbound.test")
			request.Header.Set("Content-Type", "application/json")
			result := httptest.NewRecorder()
			a.Handler().ServeHTTP(result, request)
			if result.Code != 201 {
				t.Fatalf("short topic submission: %d %s", result.Code, result.Body.String())
			}
			var response struct {
				Reference string `json:"reference"`
			}
			if err = json.Unmarshal(result.Body.Bytes(), &response); err != nil {
				t.Fatal(err)
			}
			var source string
			var siteID int64
			if err = a.db.QueryRow(`SELECT source_path,site_id FROM form_submissions WHERE id=?`, strings.TrimPrefix(response.Reference, "FV-")).Scan(&source, &siteID); err != nil {
				t.Fatal(err)
			}
			if source != "/product-sourcing" || siteID != int64(ctx["siteId"].(float64)) {
				t.Fatalf("incorrect topic attribution: %q %d", source, siteID)
			}
		})
	}
	var queued int
	if err = a.db.QueryRow(`SELECT count(*) FROM mail_deliveries`).Scan(&queued); err != nil || queued != 6 {
		t.Fatalf("expected six queued notifications, got %d: %v", queued, err)
	}
}
