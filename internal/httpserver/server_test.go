package httpserver

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"czcms/internal/config"
)

func TestSessionCookieHasRequiredAttributes(t *testing.T) {
	server := &server{Dependencies: Dependencies{Config: config.Config{CookieSecure: true}}}
	recorder := httptest.NewRecorder()
	server.setSessionCookie(recorder, "token.csrf", time.Now().Add(time.Hour))
	cookies := recorder.Result().Cookies()
	if len(cookies) != 1 {
		t.Fatalf("cookies=%d", len(cookies))
	}
	cookie := cookies[0]
	if cookie.Name != "__Host-czcms_session" || !cookie.Secure || !cookie.HttpOnly || cookie.SameSite != http.SameSiteStrictMode || cookie.Path != "/" || cookie.Domain != "" {
		t.Fatalf("unsafe cookie: %+v", cookie)
	}
}

func TestClientIPIgnoresUntrustedForwardedHeader(t *testing.T) {
	server := &server{trustedProxies: parseTrustedProxies([]string{"127.0.0.1"})}
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	request.RemoteAddr = "198.51.100.4:1234"
	request.Header.Set("X-Forwarded-For", "203.0.113.10")
	if got := server.clientIP(request); got != "198.51.100.4" {
		t.Fatalf("untrusted forwarded IP used: %s", got)
	}
	request.RemoteAddr = "127.0.0.1:1234"
	if got := server.clientIP(request); !strings.HasPrefix(got, "203.0.113.10") {
		t.Fatalf("trusted forwarded IP ignored: %s", got)
	}
}

func TestSecurityHeadersPermitOnlySameOriginInternalPreviewsToBeFramed(t *testing.T) {
	server := &server{}
	handler := server.securityHeaders(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusNoContent) }))
	for _, check := range []struct {
		path, frame, ancestors string
	}{
		{path: "/admin", frame: "DENY", ancestors: "frame-ancestors 'none'"},
		{path: "/admin/template-preview/1/global/en", frame: "SAMEORIGIN", ancestors: "frame-ancestors 'self'"},
		{path: "/admin/content-preview/5/1/en", frame: "SAMEORIGIN", ancestors: "frame-ancestors 'self'"},
	} {
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, check.path, nil))
		if got := recorder.Header().Get("X-Frame-Options"); got != check.frame {
			t.Fatalf("path=%s X-Frame-Options=%q want %q", check.path, got, check.frame)
		}
		if got := recorder.Header().Get("Content-Security-Policy"); !strings.Contains(got, check.ancestors) {
			t.Fatalf("path=%s CSP=%q missing %q", check.path, got, check.ancestors)
		}
	}
}

func TestRequestTimeoutAllowsAILocalizationHeadroomOnly(t *testing.T) {
	server := &server{}
	remaining := make(chan time.Duration, 1)
	handler := server.requestTimeout(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		deadline, ok := r.Context().Deadline()
		if !ok {
			t.Error("request context does not have a timeout deadline")
			return
		}
		remaining <- time.Until(deadline)
	}))

	localization := httptest.NewRequest(http.MethodPost, "/api/v1/contents/6/localize", nil)
	handler.ServeHTTP(httptest.NewRecorder(), localization)
	if got := <-remaining; got < 120*time.Second || got > 130*time.Second {
		t.Fatalf("localization timeout remaining=%s, want approximately 130 seconds", got)
	}

	ordinary := httptest.NewRequest(http.MethodGet, "/api/v1/contents", nil)
	handler.ServeHTTP(httptest.NewRecorder(), ordinary)
	if got := <-remaining; got < 25*time.Second || got > 30*time.Second {
		t.Fatalf("ordinary timeout remaining=%s, want approximately 30 seconds", got)
	}
}

func TestEstimateReadingMinutesIgnoresMarkupAndCountsLocalizedText(t *testing.T) {
	if got := estimateReadingMinutes(`<h2>Route planning</h2><p>Fast customs support for European deliveries.</p>`); got != 1 {
		t.Fatalf("short latin article minutes=%d", got)
	}
	longChinese := "<p>" + strings.Repeat("国际物流内容", 90) + "</p>"
	if got := estimateReadingMinutes(longChinese); got < 2 {
		t.Fatalf("localized article minutes=%d", got)
	}
}

func TestSafeStructuredDataKeepsCustomFieldsAndFillsGoogleArticleDefaults(t *testing.T) {
	got := safeStructuredData([]byte(`{"@context":"https://schema.org","@type":"Article","author":{"@type":"Person","name":"Editor"}}`), `{"@context":"https://schema.org","@type":"Article","headline":"Shipping guide","dateModified":"2026-08-27"}`)
	for _, expected := range []string{`"author"`, `"headline":"Shipping guide"`, `"dateModified":"2026-08-27"`} {
		if !strings.Contains(got, expected) {
			t.Fatalf("structured data missing %s: %s", expected, got)
		}
	}
}
