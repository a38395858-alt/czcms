package app

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"net/url"
	"strconv"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

func TestAILocalizationCreatesReviewVersionsOnlyForLiveTemplateSites(t *testing.T) {
	var providerCalls atomic.Int64
	provider := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		providerCalls.Add(1)
		defer r.Body.Close()
		var request struct {
			Messages []struct {
				Content string `json:"content"`
			} `json:"messages"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil || len(request.Messages) < 2 {
			http.Error(w, "bad request", http.StatusBadRequest)
			return
		}
		locale := "de-DE"
		for _, candidate := range []string{"de-DE", "fr-FR", "es-ES", "it-IT", "nl-NL"} {
			if strings.Contains(request.Messages[1].Content, `"locale":"`+candidate+`"`) {
				locale = candidate
				break
			}
		}
		suggestion := map[string]any{
			"title": "Localized shipping guide " + locale, "summary": "A market-specific summary for " + locale,
			"body_html": "<h2>Market guide</h2><p>Localized logistics guidance for " + locale + ".</p>",
			"slug":      "shipping-guide-" + strings.ToLower(locale), "category": "Shipping guides", "tags": []string{"shipping", locale},
			"h1": "Shipping guide " + locale, "seo_title": "International shipping " + locale,
			"meta_description": "Market-specific international shipping guidance for " + locale + ".",
			"primary_keyword":  "international shipping " + strings.ToLower(locale), "secondary_keywords": []string{"shipping guide " + strings.ToLower(locale)},
			"og_title": "International shipping " + locale, "og_description": "Shipping guidance for " + locale + ".",
			"structured_data": map[string]any{"@context": "https://schema.org", "@type": "Article", "inLanguage": locale},
		}
		content, _ := json.Marshal(suggestion)
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{"choices": []any{map[string]any{"message": map[string]string{"content": string(content)}}}})
	}))
	t.Cleanup(provider.Close)

	cfg := testConfig(t)
	cfg.AIBaseURL = provider.URL + "/v1"
	cfg.AIModel = "localization-test-model"
	cfg.AIRequestTimeout = 2 * time.Second
	application, err := New(cfg, slog.New(slog.NewTextHandler(io.Discard, nil)))
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
	response := postForm(t, client, server.URL+"/setup", setupToken, url.Values{
		"username": {"localizer"}, "display_name": {"本土化测试"}, "email": {"localizer@example.test"},
		"password": {"correct horse battery staple"}, "password_confirm": {"correct horse battery staple"},
	})
	response.Body.Close()
	login := mustGet(t, client, server.URL+"/login")
	loginToken := extractToken(t, readBody(t, login))
	response = postForm(t, client, server.URL+"/login", loginToken, url.Values{
		"username": {"localizer"}, "password": {"correct horse battery staple"}, "next": {"/admin"},
	})
	response.Body.Close()

	me := mustGet(t, client, server.URL+"/api/v1/auth/me")
	var securityContext struct {
		CSRFToken string `json:"csrf_token"`
	}
	if err = json.NewDecoder(me.Body).Decode(&securityContext); err != nil {
		t.Fatal(err)
	}
	me.Body.Close()

	sitesResponse := mustGet(t, client, server.URL+"/api/v1/sites")
	var sitesPayload struct {
		Sites []struct {
			ID   int64  `json:"id"`
			Code string `json:"code"`
		} `json:"sites"`
	}
	if err = json.NewDecoder(sitesResponse.Body).Decode(&sitesPayload); err != nil {
		t.Fatal(err)
	}
	sitesResponse.Body.Close()
	var englishSiteID, germanSiteID, frenchSiteID int64
	for _, site := range sitesPayload.Sites {
		switch site.Code {
		case "global":
			englishSiteID = site.ID
		case "germany":
			germanSiteID = site.ID
		case "france":
			frenchSiteID = site.ID
		}
	}
	if englishSiteID == 0 || germanSiteID == 0 || frenchSiteID == 0 {
		t.Fatalf("required seeded sites missing: %+v", sitesPayload.Sites)
	}

	created := doJSON(t, client, http.MethodPost, server.URL+"/api/v1/contents", securityContext.CSRFToken, map[string]any{
		"content_type": "article", "site_id": englishSiteID, "locale": "en", "status": "published",
		"title": "International shipping source", "slug": "international-shipping-source", "summary": "Verified source facts.",
		"body_html": "<h2>Verified facts</h2><p>International logistics guidance.</p>", "ai_state": "manual",
		"seo": map[string]any{"h1": "International shipping source", "title": "International shipping source", "meta_description": "Verified source facts for international shipping.", "primary_keyword": "international shipping", "secondary_keywords": []string{"shipping guide"}, "robots_index": true},
	})
	if created.StatusCode != http.StatusCreated {
		t.Fatalf("create source status=%d body=%s", created.StatusCode, readBody(t, created))
	}
	var source struct {
		ContentID int64 `json:"content_id"`
	}
	if err = json.NewDecoder(created.Body).Decode(&source); err != nil {
		t.Fatal(err)
	}
	created.Body.Close()

	options := mustGet(t, client, server.URL+"/api/v1/contents/"+strconv.FormatInt(source.ContentID, 10)+"/localization-options?source_site_id="+strconv.FormatInt(englishSiteID, 10)+"&source_locale=en")
	var optionPayload struct {
		Eligible bool `json:"eligible"`
		Targets  []struct {
			SiteOnline     bool `json:"site_online"`
			TemplateOnline bool `json:"template_online"`
		} `json:"targets"`
	}
	if err = json.NewDecoder(options.Body).Decode(&optionPayload); err != nil {
		t.Fatal(err)
	}
	options.Body.Close()
	if !optionPayload.Eligible || len(optionPayload.Targets) != 5 {
		t.Fatalf("localization options=%+v", optionPayload)
	}
	for _, target := range optionPayload.Targets {
		if !target.SiteOnline || !target.TemplateOnline {
			t.Fatalf("seeded target is not live=%+v", target)
		}
	}

	localizeURL := server.URL + "/api/v1/contents/" + strconv.FormatInt(source.ContentID, 10) + "/localize"
	localize := doJSON(t, client, http.MethodPost, localizeURL, securityContext.CSRFToken, map[string]any{
		"source_site_id": englishSiteID, "source_locale": "en", "scope": "full", "overwrite": false,
		"targets": []map[string]any{{"site_id": germanSiteID, "locale": "de-DE"}, {"site_id": frenchSiteID, "locale": "fr-FR"}},
	})
	if localize.StatusCode != http.StatusOK {
		t.Fatalf("localize status=%d body=%s", localize.StatusCode, readBody(t, localize))
	}
	var job struct {
		Status       string `json:"status"`
		CreatedCount int    `json:"created_count"`
		SkippedCount int    `json:"skipped_count"`
		FailedCount  int    `json:"failed_count"`
	}
	if err = json.NewDecoder(localize.Body).Decode(&job); err != nil {
		t.Fatal(err)
	}
	localize.Body.Close()
	if job.Status != "completed" || job.CreatedCount != 2 || job.SkippedCount != 0 || job.FailedCount != 0 || providerCalls.Load() != 2 {
		t.Fatalf("unexpected localization job=%+v provider_calls=%d", job, providerCalls.Load())
	}

	for _, target := range []struct {
		siteID int64
		locale string
	}{{germanSiteID, "de-DE"}, {frenchSiteID, "fr-FR"}} {
		localized := mustGet(t, client, server.URL+"/api/v1/contents/"+strconv.FormatInt(source.ContentID, 10)+"/locales/"+target.locale+"?site_id="+strconv.FormatInt(target.siteID, 10))
		var item struct {
			Status  string `json:"status"`
			AIState string `json:"ai_state"`
			Title   string `json:"title"`
		}
		if err = json.NewDecoder(localized.Body).Decode(&item); err != nil {
			t.Fatal(err)
		}
		localized.Body.Close()
		if item.Status != "draft" || item.AIState != "pending" || !strings.Contains(item.Title, target.locale) {
			t.Fatalf("localized item=%+v", item)
		}
	}

	repeated := doJSON(t, client, http.MethodPost, localizeURL, securityContext.CSRFToken, map[string]any{
		"source_site_id": englishSiteID, "source_locale": "en", "scope": "full", "overwrite": false,
		"targets": []map[string]any{{"site_id": germanSiteID, "locale": "de-DE"}, {"site_id": frenchSiteID, "locale": "fr-FR"}},
	})
	if repeated.StatusCode != http.StatusOK {
		t.Fatalf("repeat localize status=%d body=%s", repeated.StatusCode, readBody(t, repeated))
	}
	job = struct {
		Status       string `json:"status"`
		CreatedCount int    `json:"created_count"`
		SkippedCount int    `json:"skipped_count"`
		FailedCount  int    `json:"failed_count"`
	}{}
	if err = json.NewDecoder(repeated.Body).Decode(&job); err != nil {
		t.Fatal(err)
	}
	repeated.Body.Close()
	if job.CreatedCount != 0 || job.SkippedCount != 2 || providerCalls.Load() != 2 {
		t.Fatalf("existing versions were not skipped job=%+v provider_calls=%d", job, providerCalls.Load())
	}
}
