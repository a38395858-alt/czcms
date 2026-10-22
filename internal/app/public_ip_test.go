package app

import (
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestPublicIPRequiresExplicitSiteBinding(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = a.Close() })
	for _, host := range []string{"170.106.116.93", "127.0.0.1", "0.0.0.0", "::1", "::"} {
		if _, err := a.db.Exec(`INSERT INTO site_domains(site_id,hostname,kind,redirect_to_primary,created_at,updated_at) SELECT id,?,'alias',0,datetime('now'),datetime('now') FROM sites WHERE code='global'`, host); err != nil {
			t.Fatal(err)
		}
	}
	for _, path := range []string{"/", "/product-sourcing"} {
		response := httptest.NewRecorder()
		a.Handler().ServeHTTP(response, httptest.NewRequest(http.MethodGet, "http://170.106.116.93"+path, nil))
		if path == "/product-sourcing" {
			assertImportedTopic(t, response, false)
		} else if response.Code != http.StatusOK || !strings.Contains(response.Body.String(), `rel="canonical"`) {
			t.Fatalf("bound IP homepage status=%d", response.Code)
		}
		if !strings.Contains(response.Body.String(), "http://170.106.116.93"+path) {
			t.Fatalf("canonical does not retain the IP for %s", path)
		}
	}
	for _, host := range []string{"170.106.116.94", "127.0.0.1", "0.0.0.0", "[::1]", "[::]"} {
		response := httptest.NewRecorder()
		a.Handler().ServeHTTP(response, httptest.NewRequest(http.MethodGet, "http://"+host+"/product-sourcing", nil))
		if response.Code != http.StatusNotFound {
			t.Errorf("unbound or local host %s served public content: %d", host, response.Code)
		}
	}
}
