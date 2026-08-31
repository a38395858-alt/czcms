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

func TestAIConfigurationAPIProtectsSecretsAndSupportsRouting(t *testing.T) {
	application, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = application.Close() })
	server := httptest.NewServer(application.Handler())
	t.Cleanup(server.Close)
	jar, _ := cookiejar.New(nil)
	client := &http.Client{Jar: jar, CheckRedirect: func(_ *http.Request, _ []*http.Request) error { return http.ErrUseLastResponse }}
	setup := mustGet(t, client, server.URL+"/setup")
	setupToken := extractToken(t, readBody(t, setup))
	response := postForm(t, client, server.URL+"/setup", setupToken, url.Values{"username": {"owner"}, "display_name": {"系统所有者"}, "password": {"correct horse battery staple"}, "password_confirm": {"correct horse battery staple"}})
	response.Body.Close()
	login := mustGet(t, client, server.URL+"/login")
	loginToken := extractToken(t, readBody(t, login))
	response = postForm(t, client, server.URL+"/login", loginToken, url.Values{"username": {"owner"}, "password": {"correct horse battery staple"}, "next": {"/admin"}})
	response.Body.Close()
	meResponse := mustGet(t, client, server.URL+"/api/v1/auth/me")
	var me struct {
		CSRFToken string `json:"csrf_token"`
	}
	if err = json.NewDecoder(meResponse.Body).Decode(&me); err != nil {
		t.Fatal(err)
	}
	meResponse.Body.Close()

	getResponse := mustGet(t, client, server.URL+"/api/v1/system/ai")
	var initial struct {
		Providers []any `json:"providers"`
		Routes    []any `json:"routes"`
	}
	if err = json.NewDecoder(getResponse.Body).Decode(&initial); err != nil {
		t.Fatal(err)
	}
	getResponse.Body.Close()
	if len(initial.Providers) != 0 || len(initial.Routes) != 2 {
		t.Fatalf("unexpected initial AI configuration: %+v", initial)
	}
	csrfResponse := doJSON(t, client, http.MethodPost, server.URL+"/api/v1/system/ai/providers", "", map[string]any{"name": "blocked"})
	if csrfResponse.StatusCode != http.StatusForbidden {
		t.Fatalf("AI provider write without CSRF status=%d", csrfResponse.StatusCode)
	}
	csrfResponse.Body.Close()

	createdResponse := doJSON(t, client, http.MethodPost, server.URL+"/api/v1/system/ai/providers", me.CSRFToken, map[string]any{
		"name": "本机测试模型", "provider_type": "openai_compatible", "base_url": "http://127.0.0.1:11434/v1", "api_key": "super-secret-key", "default_model": "test-model", "enabled": true, "timeout_seconds": 20,
	})
	var provider struct {
		ID               int64  `json:"id"`
		Version          int64  `json:"version"`
		APIKeyConfigured bool   `json:"api_key_configured"`
		APIKeyLastFour   string `json:"api_key_last_four"`
	}
	body := readBody(t, createdResponse)
	if createdResponse.StatusCode != http.StatusCreated || strings.Contains(body, "super-secret-key") || strings.Contains(body, "api_key_encrypted") {
		t.Fatalf("provider response leaked secret or failed: status=%d body=%s", createdResponse.StatusCode, body)
	}
	if err = json.Unmarshal([]byte(body), &provider); err != nil {
		t.Fatal(err)
	}
	if !provider.APIKeyConfigured || provider.APIKeyLastFour != "-key" {
		t.Fatalf("provider secret metadata missing: %+v", provider)
	}

	routeResponse := doJSON(t, client, http.MethodPut, server.URL+"/api/v1/system/ai/routes/seo", me.CSRFToken, map[string]any{"primary_provider_id": provider.ID, "max_retries": 1, "version": 1})
	if routeResponse.StatusCode != http.StatusOK {
		t.Fatalf("route update status=%d body=%s", routeResponse.StatusCode, readBody(t, routeResponse))
	}
	routeResponse.Body.Close()
	conflictResponse := doJSON(t, client, http.MethodPut, server.URL+"/api/v1/system/ai/routes/seo", me.CSRFToken, map[string]any{"primary_provider_id": provider.ID, "max_retries": 1, "version": 1})
	if conflictResponse.StatusCode != http.StatusConflict {
		t.Fatalf("stale route version status=%d body=%s", conflictResponse.StatusCode, readBody(t, conflictResponse))
	}
	conflictResponse.Body.Close()
}
