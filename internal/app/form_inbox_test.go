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
	"regexp"
	"strconv"
	"strings"
	"testing"

	"czcms/internal/catalog"
	"czcms/internal/contentsafety"
)

func TestAllHomeFormsAndInboxWorkflow(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = a.Close() })
	homePattern := regexp.MustCompile(`<script id="freightvanta-enquiry-context" type="application/json">(.*?)</script>`)
	var globalID, otherID int64
	for _, site := range []struct{ code, locale string }{{"global", "en"}, {"germany", "de"}, {"france", "fr"}, {"spain", "es"}, {"italy", "it"}, {"netherlands", "nl"}} {
		page := httptest.NewRecorder()
		a.Handler().ServeHTTP(page, httptest.NewRequest("GET", "http://unbound.test/preview/"+site.code+"/", nil))
		match := homePattern.FindStringSubmatch(page.Body.String())
		if len(match) != 2 {
			t.Fatalf("%s missing homepage enquiry context: %d", site.code, page.Code)
		}
		var ctx map[string]any
		if err = json.Unmarshal([]byte(match[1]), &ctx); err != nil {
			t.Fatal(err)
		}
		guide := httptest.NewRecorder()
		a.Handler().ServeHTTP(guide, httptest.NewRequest("GET", "http://unbound.test/preview/"+site.code+"/guides", nil))
		guideContext := homePattern.FindStringSubmatch(guide.Body.String())
		if guide.Code != 200 || len(guideContext) != 2 || !strings.Contains(guide.Body.String(), "data-newsletter-form") {
			t.Fatalf("%s missing working subscription form context", site.code)
		}
		if site.locale == "en" {
			globalID = int64(ctx["siteId"].(float64))
		} else {
			otherID = int64(ctx["siteId"].(float64))
		}
		payload := map[string]any{"site_id": ctx["siteId"], "locale": site.locale, "form_token": ctx["formToken"], "full_name": "QA Buyer " + site.locale, "work_email": "qa-" + site.locale + "@example.test", "company": "QA Company", "origin": "China", "destination": "Europe", "starting_point": "packaging-branding", "consent": true, "placement": "home-enquiry"}
		post := func(endpoint string, values map[string]any) *httptest.ResponseRecorder {
			encoded, _ := json.Marshal(values)
			r := httptest.NewRequest("POST", "http://unbound.test/preview/"+site.code+"/"+endpoint, strings.NewReader(string(encoded)))
			r.Header.Set("Origin", "http://unbound.test")
			r.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			a.Handler().ServeHTTP(w, r)
			return w
		}
		payload["consent"] = false
		if w := post("home-enquiry", payload); w.Code != 422 {
			t.Fatalf("%s accepted no consent: %d", site.code, w.Code)
		}
		payload["consent"] = true
		payload["website"] = "spam"
		if w := post("home-enquiry", payload); w.Code != 400 {
			t.Fatal("honeypot accepted")
		}
		delete(payload, "website")
		if site.locale == "en" || site.locale == "de" {
			delete(payload, "company")
			delete(payload, "origin")
			delete(payload, "destination")
		}
		if w := post("home-enquiry", payload); w.Code != 201 {
			t.Fatalf("%s home status=%d: %s", site.code, w.Code, w.Body.String())
		}
		if w := post("home-enquiry", payload); w.Code != 409 {
			t.Fatal("duplicate accepted")
		}
		newsletter := map[string]any{"site_id": ctx["siteId"], "locale": site.locale, "form_token": ctx["formToken"], "work_email": "news-" + site.locale + "@example.test"}
		if w := post("newsletter", newsletter); w.Code != 201 {
			t.Fatalf("%s newsletter status=%d: %s", site.code, w.Code, w.Body.String())
		}
		newsletter["form_token"] = "bad"
		if w := post("newsletter", newsletter); w.Code != 403 {
			t.Fatal("newsletter bad token accepted")
		}
	}
	server := httptest.NewServer(a.Handler())
	t.Cleanup(server.Close)
	jar, _ := cookiejar.New(nil)
	client := &http.Client{Jar: jar, CheckRedirect: func(_ *http.Request, _ []*http.Request) error { return http.ErrUseLastResponse }}
	setupToken := extractToken(t, readBody(t, mustGet(t, client, server.URL+"/setup")))
	response := postForm(t, client, server.URL+"/setup", setupToken, url.Values{"username": {"owner"}, "display_name": {"QA Owner"}, "email": {"owner@example.test"}, "password": {"correct horse battery staple"}, "password_confirm": {"correct horse battery staple"}})
	if response.StatusCode != 303 {
		t.Fatal(readBody(t, response))
	}
	response.Body.Close()
	loginToken := extractToken(t, readBody(t, mustGet(t, client, server.URL+"/login")))
	response = postForm(t, client, server.URL+"/login", loginToken, url.Values{"username": {"owner"}, "password": {"correct horse battery staple"}, "next": {"/admin"}})
	if response.StatusCode != 303 {
		t.Fatal(readBody(t, response))
	}
	response.Body.Close()
	var me struct {
		CSRF string `json:"csrf_token"`
	}
	response = mustGet(t, client, server.URL+"/api/v1/auth/me")
	if err = json.NewDecoder(response.Body).Decode(&me); err != nil {
		t.Fatal(err)
	}
	response.Body.Close()
	type inbox struct {
		Submissions []catalog.FormSubmission `json:"submissions"`
		Total       int                      `json:"total"`
		Summary     map[string]int           `json:"summary"`
	}
	list := func(query string) inbox {
		t.Helper()
		r := mustGet(t, client, server.URL+"/api/v1/forms/submissions"+query)
		defer r.Body.Close()
		var result inbox
		if r.StatusCode != 200 {
			t.Fatalf("inbox %d: %s", r.StatusCode, readBody(t, r))
		}
		if err = json.NewDecoder(r.Body).Decode(&result); err != nil {
			t.Fatal(err)
		}
		return result
	}
	initial := list("?limit=5")
	if initial.Total != 12 || len(initial.Submissions) != 5 || initial.Summary["new"] != 12 {
		t.Fatalf("wrong pagination: %+v", initial)
	}
	second := list("?limit=5&offset=5")
	if len(second.Submissions) != 5 || second.Submissions[0].ID == initial.Submissions[0].ID {
		t.Fatal("pagination repeated")
	}
	bySite := list("?site_id=" + strconv.FormatInt(globalID, 10))
	if bySite.Total != 2 {
		t.Fatalf("site filter: %+v", bySite)
	}
	searched := list("?q=" + url.QueryEscape("QA Buyer en"))
	if searched.Total != 1 || searched.Submissions[0].SiteID != globalID {
		t.Fatal("encrypted field search failed")
	}
	row := searched.Submissions[0]
	endpoint := server.URL + "/api/v1/forms/submissions/" + strconv.FormatInt(row.ID, 10)
	response = doJSON(t, client, "PUT", endpoint, "", map[string]any{"status": "processing", "notes": "Private QA note", "version": row.Version})
	if response.StatusCode != 403 {
		t.Fatal("missing CSRF accepted")
	}
	response.Body.Close()
	response = doJSON(t, client, "PUT", endpoint, me.CSRF, map[string]any{"status": "processing", "notes": "Private QA note", "version": row.Version})
	if response.StatusCode != 200 {
		t.Fatal(readBody(t, response))
	}
	response.Body.Close()
	response = doJSON(t, client, "PUT", endpoint, me.CSRF, map[string]any{"status": "closed", "notes": "stale", "version": row.Version})
	if response.StatusCode != 409 {
		t.Fatal("stale update accepted")
	}
	response.Body.Close()
	saved := list("?status=processing")
	if saved.Total != 1 || saved.Submissions[0].Notes != "Private QA note" || saved.Submissions[0].Version != row.Version+1 {
		t.Fatalf("followup not saved: %+v", saved)
	}
	var encrypted, notes []byte
	if err = a.db.QueryRow(`SELECT values_encrypted,notes_encrypted FROM form_submissions WHERE id=?`, row.ID).Scan(&encrypted, &notes); err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(encrypted), "QA Buyer") || strings.Contains(string(notes), "Private QA note") {
		t.Fatal("customer data stored in plaintext")
	}
	// Scope checks must protect totals, search results and writes, even for a
	// role that has content.read and content.write permissions.
	if _, err = a.db.Exec(`DELETE FROM user_access_scopes WHERE user_id=(SELECT id FROM users WHERE username='owner')`); err != nil {
		t.Fatal(err)
	}
	if _, err = a.db.Exec(`INSERT INTO user_access_scopes(user_id,site_id,locale,created_at) SELECT id,?,'en',datetime('now') FROM users WHERE username='owner'`, globalID); err != nil {
		t.Fatal(err)
	}
	if scoped := list(""); scoped.Total != 2 {
		t.Fatalf("scope leak: %+v", scoped)
	}
	if scoped := list("?site_id=" + strconv.FormatInt(otherID, 10)); scoped.Total != 0 {
		t.Fatal("site filter bypasses scope")
	}
	if scoped := list("?q=news-nl"); scoped.Total != 0 {
		t.Fatal("search leaks another scope")
	}
	other := initial.Submissions[0]
	response = doJSON(t, client, "PUT", server.URL+"/api/v1/forms/submissions/"+strconv.FormatInt(other.ID, 10), me.CSRF, map[string]any{"status": "closed"})
	if response.StatusCode != 403 {
		t.Fatalf("cross-scope write accepted: %d %s", response.StatusCode, readBody(t, response))
	}
	response.Body.Close()
	unauth := mustGet(t, &http.Client{CheckRedirect: client.CheckRedirect}, server.URL+"/api/v1/forms/submissions")
	if unauth.StatusCode != 401 {
		t.Fatal("unauthenticated inbox access")
	}
	unauth.Body.Close()
	// Existing CMS contact forms must enter the same inbox as built-in forms.
	var ownerID int64
	if err = a.db.QueryRow(`SELECT id FROM users WHERE username='owner'`).Scan(&ownerID); err != nil {
		t.Fatal(err)
	}
	service := catalog.New(a.db, contentsafety.NewSanitizer())
	_, err = service.CreateContent(context.Background(), ownerID, catalog.CreateContentInput{ContentType: "page", SiteID: globalID, Locale: "en", Status: "published", Title: "QA contact", Slug: "qa-contact", Summary: "Contact QA", BodyHTML: "<p>Contact QA</p>", AIState: "manual", PageLayout: "contact", IndexPolicy: "noindex", SEO: &catalog.SEOInput{RobotsIndex: false}})
	if err != nil {
		t.Fatal(err)
	}
	page := httptest.NewRecorder()
	a.Handler().ServeHTTP(page, httptest.NewRequest("GET", "http://unbound.test/preview/global/qa-contact", nil))
	token := regexp.MustCompile(`name="form_token" value="([^"]+)"`).FindStringSubmatch(page.Body.String())
	action := regexp.MustCompile(`data-public-form[^>]*action="([^"]+)"`).FindStringSubmatch(page.Body.String())
	if page.Code != 200 || len(token) != 2 || len(action) != 2 {
		t.Fatalf("missing CMS contact form: %d", page.Code)
	}
	values := url.Values{"form_token": {token[1]}, "name": {"Contact QA"}, "email": {"contact-qa@example.test"}, "message": {"Existing contact form enquiry"}, "consent": {"true"}}
	req := httptest.NewRequest("POST", "http://unbound.test"+action[1], strings.NewReader(values.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Origin", "http://unbound.test")
	result := httptest.NewRecorder()
	a.Handler().ServeHTTP(result, req)
	if result.Code != 201 {
		t.Fatalf("contact submission: %d %s", result.Code, result.Body.String())
	}
	contact := list("?q=contact-qa@example.test")
	if contact.Total != 1 || contact.Submissions[0].Values["message"] != values.Get("message") {
		t.Fatal("CMS contact submission missing from inbox")
	}
}
