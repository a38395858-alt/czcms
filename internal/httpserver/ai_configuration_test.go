package httpserver

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"czcms/internal/database"
	"czcms/internal/security"
)

func TestDatabaseAIConfigurationEncryptsSecretsAndFallsBackAcrossEnabledProviders(t *testing.T) {
	ctx := context.Background()
	root := t.TempDir()
	db, err := database.Open(ctx, filepath.Join(root, "ai-config.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	keys, err := security.LoadKeyring("", filepath.Join(root, "secrets"), "development")
	if err != nil {
		t.Fatal(err)
	}

	var primaryCalls atomic.Int32
	primary := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		primaryCalls.Add(1)
		http.Error(w, "temporary outage", http.StatusServiceUnavailable)
	}))
	t.Cleanup(primary.Close)

	validResponse, _ := json.Marshal(map[string]any{
		"h1": "Fallback generated H1", "title": "Fallback generated title", "meta_description": "Safe description",
		"primary_keyword": "international delivery", "secondary_keywords": []string{"cross-border logistics"},
		"og_title": "Fallback generated title", "og_description": "Safe description",
		"structured_data": map[string]any{"@context": "https://schema.org", "@type": "Article"},
		"summary":         "Localized summary", "body_html": "<p>Localized body</p>", "slug": "localized-route", "category": "Guides", "tags": []string{"Logistics"},
	})
	fallback := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{"choices": []any{map[string]any{"message": map[string]any{"content": string(validResponse)}}}})
	}))
	t.Cleanup(fallback.Close)

	now := time.Now().UTC().Format(time.RFC3339Nano)
	insertProvider := func(name, baseURL, secret string) int64 {
		result, insertErr := db.ExecContext(ctx, `INSERT INTO ai_providers(name, provider_type, base_url, default_model, enabled, timeout_seconds, created_at, updated_at) VALUES (?, 'openai_compatible', ?, 'test-model', 1, 2, ?, ?)`, name, baseURL, now, now)
		if insertErr != nil {
			t.Fatal(insertErr)
		}
		id, _ := result.LastInsertId()
		encrypted, encryptErr := keys.Encrypt(aiProviderKeyPurpose(id), []byte(secret))
		if encryptErr != nil {
			t.Fatal(encryptErr)
		}
		if _, insertErr = db.ExecContext(ctx, `UPDATE ai_providers SET api_key_encrypted = ?, api_key_last_four = ? WHERE id = ?`, encrypted, lastFour(secret), id); insertErr != nil {
			t.Fatal(insertErr)
		}
		return id
	}
	insertProvider("Primary", primary.URL, "primary-secret-1234")
	fallbackID := insertProvider("Fallback", fallback.URL, "fallback-secret-5678")

	s := &server{Dependencies: Dependencies{DB: db, Keys: keys}}
	assistant := s.seoAssistantFor(ctx)
	if assistant == nil {
		t.Fatal("enabled AI provider registry did not produce an SEO assistant")
	}
	suggestion, err := assistant.Suggest(ctx, SEOSuggestionInput{Title: "Shipping guide", Locale: "en"})
	if err != nil {
		t.Fatal(err)
	}
	if suggestion.H1 != "Fallback generated H1" || primaryCalls.Load() != 1 {
		t.Fatalf("next enabled provider was not used: suggestion=%+v primary_calls=%d", suggestion, primaryCalls.Load())
	}
	localizer := s.localizationAssistantFor(ctx)
	if localizer == nil {
		t.Fatal("enabled AI provider registry did not produce a localization assistant")
	}
	localized, err := localizer.Localize(ctx, LocalizationInput{Title: "Shipping guide", SourceLocale: "en", TargetLocale: "de-DE"})
	if err != nil || localized.BodyHTML != "<p>Localized body</p>" {
		t.Fatalf("localization fallback failed: result=%+v err=%v", localized, err)
	}

	provider, err := s.getAIProvider(ctx, fallbackID)
	if err != nil {
		t.Fatal(err)
	}
	plaintext, err := s.decryptAIProviderKey(provider)
	if err != nil || plaintext != "fallback-secret-5678" {
		t.Fatalf("encrypted key did not round trip: value=%q err=%v", plaintext, err)
	}
	encoded, err := json.Marshal(provider)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(encoded), "fallback-secret-5678") || strings.Contains(string(encoded), "api_key_encrypted") {
		t.Fatalf("provider API representation leaked secret material: %s", encoded)
	}
	var stored []byte
	if err = db.QueryRowContext(ctx, `SELECT api_key_encrypted FROM ai_providers WHERE id = ?`, fallbackID).Scan(&stored); err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(stored), "fallback-secret-5678") {
		t.Fatal("database stored AI API key as plaintext")
	}
}

func TestAIProviderValidationRequiresHTTPSAndRemoteKey(t *testing.T) {
	input := aiProviderInput{Name: "Remote", BaseURL: "http://example.com/v1", DefaultModel: "model", Enabled: true, TimeoutSeconds: 20}
	if err := validateAIProviderInput(&input, ""); err == nil || !strings.Contains(err.Error(), "HTTPS") {
		t.Fatalf("insecure remote URL was accepted: %v", err)
	}
	input.BaseURL = "https://example.com/v1"
	if err := validateAIProviderInput(&input, ""); err == nil || !strings.Contains(err.Error(), "API Key") {
		t.Fatalf("remote provider without key was accepted: %v", err)
	}
	input.APIKey = "secret"
	if err := validateAIProviderInput(&input, ""); err != nil {
		t.Fatalf("valid remote provider was rejected: %v", err)
	}
	input.BaseURL, input.APIKey = "http://127.0.0.1:11434/v1", ""
	if err := validateAIProviderInput(&input, ""); err != nil {
		t.Fatalf("loopback model without key was rejected: %v", err)
	}
}
