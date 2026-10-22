package app

import (
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"czcms/internal/mailer"
)

func TestSMTPAPIPermissionsSecretsAndSettings(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = a.Close() })
	if err = a.mail.Close(context.Background()); err != nil {
		t.Fatal(err)
	}
	server := httptest.NewServer(a.Handler())
	t.Cleanup(server.Close)
	jar, _ := cookiejar.New(nil)
	client := &http.Client{Jar: jar, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
	endpoint := server.URL + "/api/v1/system/smtp"
	response := mustGet(t, client, endpoint)
	if response.StatusCode != 401 {
		t.Fatal("SMTP settings exposed without login")
	}
	response.Body.Close()
	setupToken := extractToken(t, readBody(t, mustGet(t, client, server.URL+"/setup")))
	response = postForm(t, client, server.URL+"/setup", setupToken, url.Values{"username": {"owner"}, "display_name": {"QA Owner"}, "email": {"owner@example.test"}, "password": {"correct horse battery staple"}, "password_confirm": {"correct horse battery staple"}})
	if response.StatusCode != 303 {
		t.Fatal(readBody(t, response))
	}
	response.Body.Close()
	loginToken := extractToken(t, readBody(t, mustGet(t, client, server.URL+"/login")))
	response = postForm(t, client, server.URL+"/login", loginToken, url.Values{"username": {"owner"}, "password": {"correct horse battery staple"}})
	if response.StatusCode != 303 {
		t.Fatal(readBody(t, response))
	}
	response.Body.Close()
	var me struct {
		CSRF string `json:"csrf_token"`
	}
	response = mustGet(t, client, server.URL+"/api/v1/auth/me")
	_ = json.NewDecoder(response.Body).Decode(&me)
	response.Body.Close()
	var cfg mailer.Settings
	response = mustGet(t, client, endpoint)
	if response.StatusCode != 200 {
		t.Fatal(readBody(t, response))
	}
	_ = json.NewDecoder(response.Body).Decode(&cfg)
	response.Body.Close()
	if cfg.Recipient != "38395858@qq.com" || cfg.Enabled {
		t.Fatal("wrong initial recipient or status")
	}
	in := mailer.Input{Enabled: true, Host: cfg.Host, Port: cfg.Port, Security: cfg.Security, Username: cfg.Username, Password: "smtp-qa-authorization", FromEmail: cfg.FromEmail, FromName: cfg.FromName, Recipient: cfg.Recipient, Version: cfg.Version}
	response = doJSON(t, client, "PUT", endpoint, "", in)
	if response.StatusCode != 403 {
		t.Fatal("SMTP write accepted without CSRF")
	}
	response.Body.Close()
	response = doJSON(t, client, "PUT", endpoint, me.CSRF, in)
	body := readBody(t, response)
	if response.StatusCode != 200 || strings.Contains(body, in.Password) || !strings.Contains(body, `"password_configured":true`) {
		t.Fatalf("SMTP save failed or exposed credentials: %d %s", response.StatusCode, body)
	}
	if err = json.Unmarshal([]byte(body), &cfg); err != nil {
		t.Fatal(err)
	}
	response = doJSON(t, client, "PUT", endpoint, me.CSRF, in)
	if response.StatusCode != 409 {
		t.Fatal("stale SMTP update accepted")
	}
	response.Body.Close()
	in.Version = cfg.Version
	in.Password = ""
	response = doJSON(t, client, "PUT", endpoint, me.CSRF, in)
	if response.StatusCode != 200 {
		t.Fatal(readBody(t, response))
	}
	response.Body.Close()
	var encrypted []byte
	if err = a.db.QueryRow(`SELECT password_encrypted FROM smtp_settings WHERE id=1`).Scan(&encrypted); err != nil || strings.Contains(string(encrypted), "smtp-qa-authorization") {
		t.Fatal("unencrypted authorization code")
	}
	response = mustGet(t, client, endpoint+"/deliveries")
	if response.StatusCode != 200 || !strings.Contains(readBody(t, response), `"total":0`) {
		t.Fatal("initial delivery list failed")
	}
	response = doJSON(t, client, "POST", endpoint+"/test", "", nil)
	if response.StatusCode != 403 {
		t.Fatal("SMTP test accepted without CSRF")
	}
	response.Body.Close()
	if _, err = a.db.Exec(`DELETE FROM role_permissions WHERE permission_code='system.manage'`); err != nil {
		t.Fatal(err)
	}
	for _, route := range []string{endpoint, endpoint + "/deliveries"} {
		response = mustGet(t, client, route)
		if response.StatusCode != 403 {
			t.Fatal("SMTP metadata exposed without system.manage")
		}
		response.Body.Close()
	}
	for _, request := range []struct {
		method, path string
		body         any
	}{{"PUT", endpoint, in}, {"POST", endpoint + "/test", nil}, {"POST", endpoint + "/deliveries/1/retry", nil}} {
		response = doJSON(t, client, request.method, request.path, me.CSRF, request.body)
		if response.StatusCode != 403 {
			t.Fatalf("%s bypassed permission check", request.path)
		}
		response.Body.Close()
	}
}
