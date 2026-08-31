package app

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"net/url"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"testing"
	"time"

	"czcms/internal/config"
)

var csrfInput = regexp.MustCompile(`name="csrf_token" value="([^"]+)"`)

func testConfig(t *testing.T) config.Config {
	t.Helper()
	root := t.TempDir()
	return config.Config{
		HTTPAddr: "127.0.0.1:0", DatabasePath: filepath.Join(root, "czcms.db"), CacheTTL: time.Minute, RequestTimeout: 3 * time.Second,
		SessionIdleTTL: 30 * time.Minute, SessionAbsoluteTTL: 12 * time.Hour, SecretsDir: filepath.Join(root, "secrets"),
		UploadDir: filepath.Join(root, "uploads"), ThemeDir: filepath.Join(root, "themes"), BackupDir: filepath.Join(root, "backups"),
		MaxUploadBytes: 2 << 20, MaxThemeBytes: 5 << 20,
	}
}

func TestSecureSetupLoginAndProtectedEndpoints(t *testing.T) {
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
	setupBody := readBody(t, setup)
	setupToken := extractToken(t, setupBody)
	if setup.Header.Get("X-Robots-Tag") != "noindex, nofollow" {
		t.Fatal("setup page missing noindex")
	}

	response := postForm(t, client, server.URL+"/setup", setupToken, url.Values{
		"username": {"owner"}, "display_name": {"系统所有者"}, "email": {"owner@example.test"},
		"password": {"correct horse battery staple"}, "password_confirm": {"correct horse battery staple"},
	})
	if response.StatusCode != http.StatusSeeOther || response.Header.Get("Location") != "/login" {
		t.Fatalf("setup status=%d location=%q", response.StatusCode, response.Header.Get("Location"))
	}
	response.Body.Close()

	login := mustGet(t, client, server.URL+"/login")
	loginToken := extractToken(t, readBody(t, login))
	response = postForm(t, client, server.URL+"/login", loginToken, url.Values{
		"username": {"owner"}, "password": {"correct horse battery staple"}, "next": {"/admin"},
	})
	if response.StatusCode != http.StatusSeeOther || response.Header.Get("Location") != "/admin" {
		t.Fatalf("login status=%d location=%q", response.StatusCode, response.Header.Get("Location"))
	}
	response.Body.Close()

	admin := mustGet(t, client, server.URL+"/admin")
	adminBody := readBody(t, admin)
	if admin.StatusCode != http.StatusOK || !strings.Contains(adminBody, "掌握站点、内容与发布状态") || !strings.Contains(adminBody, "系统所有者") {
		t.Fatal("authenticated admin did not render")
	}

	me := mustGet(t, client, server.URL+"/api/v1/auth/me")
	var mePayload struct {
		CSRFToken   string   `json:"csrf_token"`
		Permissions []string `json:"permissions"`
	}
	if err = json.NewDecoder(me.Body).Decode(&mePayload); err != nil {
		t.Fatal(err)
	}
	me.Body.Close()
	if mePayload.CSRFToken == "" || len(mePayload.Permissions) < 10 {
		t.Fatal("current user security context incomplete")
	}

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
	if len(sitesPayload.Sites) != 6 {
		t.Fatalf("seeded sites=%d", len(sitesPayload.Sites))
	}
	var globalSiteID, italySiteID int64
	for _, seededSite := range sitesPayload.Sites {
		switch seededSite.Code {
		case "global":
			globalSiteID = seededSite.ID
		case "italy":
			italySiteID = seededSite.ID
		}
	}
	if globalSiteID == 0 || italySiteID == 0 {
		t.Fatalf("independent language sites missing: %+v", sitesPayload.Sites)
	}
	seoSitemapResponse := mustGet(t, client, server.URL+"/api/v1/seo/sitemaps")
	var seoCenterPayload struct {
		Sites []struct {
			Code       string `json:"code"`
			SitemapURL string `json:"sitemap_url"`
			RobotsURL  string `json:"robots_url"`
		} `json:"sites"`
		Summary struct {
			SiteCount int64 `json:"site_count"`
		} `json:"summary"`
	}
	if seoSitemapResponse.StatusCode != http.StatusOK {
		t.Fatalf("seo sitemap API status=%d body=%s", seoSitemapResponse.StatusCode, readBody(t, seoSitemapResponse))
	}
	if err = json.NewDecoder(seoSitemapResponse.Body).Decode(&seoCenterPayload); err != nil {
		t.Fatal(err)
	}
	seoSitemapResponse.Body.Close()
	if seoCenterPayload.Summary.SiteCount != 6 || len(seoCenterPayload.Sites) != 6 || seoCenterPayload.Sites[0].SitemapURL == "" || seoCenterPayload.Sites[0].RobotsURL == "" {
		t.Fatalf("unexpected SEO sitemap API payload: %+v", seoCenterPayload)
	}

	templatesResponse := mustGet(t, client, server.URL+"/api/v1/templates")
	var templatesPayload struct {
		Templates []struct {
			ID           int64  `json:"id"`
			RenderKey    string `json:"render_key"`
			Renderable   bool   `json:"renderable"`
			BindingCount int64  `json:"binding_count"`
		} `json:"templates"`
	}
	if err = json.NewDecoder(templatesResponse.Body).Decode(&templatesPayload); err != nil {
		t.Fatal(err)
	}
	templatesResponse.Body.Close()
	if len(templatesPayload.Templates) != 2 {
		t.Fatalf("builtin templates=%d, want 2", len(templatesPayload.Templates))
	}
	var atlasThemeID int64
	for _, theme := range templatesPayload.Templates {
		if !theme.Renderable {
			t.Fatalf("builtin template is not renderable: %+v", theme)
		}
		if theme.RenderKey == "global-route" && theme.BindingCount != 6 {
			t.Fatalf("default theme bindings=%d, want 6", theme.BindingCount)
		}
		if theme.RenderKey == "atlas-commerce" {
			atlasThemeID = theme.ID
		}
	}
	if atlasThemeID == 0 {
		t.Fatal("Atlas Commerce template missing")
	}
	createdSiteResponse := doJSON(t, client, http.MethodPost, server.URL+"/api/v1/sites", mePayload.CSRFToken, map[string]any{
		"name": "模板选择测试站", "code": "template-choice", "local_port": 8097, "market_code": "GLOBAL", "status": "active",
		"default_language_code": "en", "default_theme_package_id": atlasThemeID,
	})
	if createdSiteResponse.StatusCode != http.StatusCreated {
		t.Fatalf("create site with initial template status=%d body=%s", createdSiteResponse.StatusCode, readBody(t, createdSiteResponse))
	}
	var createdSite struct {
		ID int64 `json:"id"`
	}
	if err = json.NewDecoder(createdSiteResponse.Body).Decode(&createdSite); err != nil {
		t.Fatal(err)
	}
	createdSiteResponse.Body.Close()
	createdBindingsResponse := mustGet(t, client, server.URL+"/api/v1/sites/"+strconv.FormatInt(createdSite.ID, 10)+"/languages")
	var createdBindings struct {
		SiteLanguages []struct {
			ThemePackageID *int64 `json:"theme_package_id"`
		} `json:"site_languages"`
	}
	if err = json.NewDecoder(createdBindingsResponse.Body).Decode(&createdBindings); err != nil {
		t.Fatal(err)
	}
	createdBindingsResponse.Body.Close()
	if len(createdBindings.SiteLanguages) != 1 || createdBindings.SiteLanguages[0].ThemePackageID == nil || *createdBindings.SiteLanguages[0].ThemePackageID != atlasThemeID {
		t.Fatalf("initial template binding=%+v, want Atlas %d", createdBindings.SiteLanguages, atlasThemeID)
	}

	bindingsResponse := mustGet(t, client, server.URL+"/api/v1/sites/"+strconv.FormatInt(italySiteID, 10)+"/languages")
	var bindingsPayload struct {
		SiteLanguages []struct {
			LanguageID int64  `json:"language_id"`
			Locale     string `json:"locale"`
			Enabled    bool   `json:"enabled"`
			Version    int64  `json:"version"`
		} `json:"site_languages"`
	}
	if err = json.NewDecoder(bindingsResponse.Body).Decode(&bindingsPayload); err != nil {
		t.Fatal(err)
	}
	bindingsResponse.Body.Close()
	var italianBinding struct {
		LanguageID int64
		Locale     string
		Enabled    bool
		Version    int64
	}
	for _, binding := range bindingsPayload.SiteLanguages {
		if binding.Locale == "it-IT" {
			italianBinding.LanguageID = binding.LanguageID
			italianBinding.Locale = binding.Locale
			italianBinding.Enabled = binding.Enabled
			italianBinding.Version = binding.Version
		}
	}
	if italianBinding.LanguageID == 0 {
		t.Fatal("Italian site binding missing")
	}
	bindURL := server.URL + "/api/v1/sites/" + strconv.FormatInt(italySiteID, 10) + "/languages/" + strconv.FormatInt(italianBinding.LanguageID, 10)
	bound := doJSON(t, client, http.MethodPut, bindURL, mePayload.CSRFToken, map[string]any{
		"locale": italianBinding.Locale, "enabled": italianBinding.Enabled, "theme_package_id": atlasThemeID, "version": italianBinding.Version,
	})
	if bound.StatusCode != http.StatusOK {
		t.Fatalf("bind Atlas template status=%d body=%s", bound.StatusCode, readBody(t, bound))
	}
	bound.Body.Close()
	atlasPreview := mustGet(t, client, server.URL+"/preview/italy")
	atlasBody := readBody(t, atlasPreview)
	if atlasPreview.StatusCode != http.StatusOK || !strings.Contains(atlasBody, "theme-atlas-commerce") || !strings.Contains(atlasBody, "public-atlas.css") {
		t.Fatalf("Atlas template did not control public renderer: status=%d body=%q", atlasPreview.StatusCode, atlasBody)
	}
	isolatedPreview := mustGet(t, client, server.URL+"/admin/template-preview/"+strconv.FormatInt(atlasThemeID, 10)+"/global/en")
	isolatedBody := readBody(t, isolatedPreview)
	if isolatedPreview.StatusCode != http.StatusOK || !strings.Contains(isolatedBody, "theme-atlas-commerce") || isolatedPreview.Header.Get("X-Robots-Tag") != "noindex, nofollow" {
		t.Fatalf("isolated template preview status=%d robots=%q", isolatedPreview.StatusCode, isolatedPreview.Header.Get("X-Robots-Tag"))
	}
	seoResponse := doJSON(t, client, http.MethodPost, server.URL+"/api/v1/content/seo-suggestions", mePayload.CSRFToken, map[string]any{
		"site_id": globalSiteID, "locale": "en", "title": "European logistics guide",
		"summary": "A practical guide to shipping and customs.", "body_html": "<p>Safe article content.</p>", "tags": []string{"European logistics"},
	})
	if seoResponse.StatusCode != http.StatusOK {
		t.Fatalf("SEO fallback status=%d body=%s", seoResponse.StatusCode, readBody(t, seoResponse))
	}
	var seoPayload struct {
		AIAvailable bool   `json:"ai_available"`
		Source      string `json:"source"`
		Suggestions struct {
			Title string `json:"title"`
		} `json:"suggestions"`
	}
	if err = json.NewDecoder(seoResponse.Body).Decode(&seoPayload); err != nil {
		t.Fatal(err)
	}
	seoResponse.Body.Close()
	if seoPayload.AIAvailable || seoPayload.Source != "fallback" || seoPayload.Suggestions.Title != "European logistics guide" {
		t.Fatalf("unexpected SEO fallback=%+v", seoPayload)
	}

	createdContent := doJSON(t, client, http.MethodPost, server.URL+"/api/v1/contents", mePayload.CSRFToken, map[string]any{
		"content_type": "article", "site_id": globalSiteID, "locale": "en", "status": "draft",
		"title": "Secure API content", "slug": "secure-api-content", "summary": "Created through the protected HTTP API.",
		"body_html": "<p>safe</p><script>alert(1)</script>", "ai_state": "manual",
		"seo": map[string]any{"h1": "Secure API content", "title": "Secure API SEO title", "primary_keyword": "secure cms", "secondary_keywords": []string{"go cms"}, "robots_index": true, "structured_data": map[string]any{"@type": "Article"}},
	})
	if createdContent.StatusCode != http.StatusCreated {
		t.Fatalf("create content status=%d body=%s", createdContent.StatusCode, readBody(t, createdContent))
	}
	var content struct {
		ID             int64  `json:"id"`
		ContentID      int64  `json:"content_id"`
		SiteID         int64  `json:"site_id"`
		Locale         string `json:"locale"`
		Version        int64  `json:"version"`
		ContentVersion int64  `json:"content_version"`
		BodyHTML       string `json:"body_html"`
	}
	if err = json.NewDecoder(createdContent.Body).Decode(&content); err != nil {
		t.Fatal(err)
	}
	createdContent.Body.Close()
	if strings.Contains(content.BodyHTML, "script") || content.Version != 1 {
		t.Fatalf("unsafe content response: %+v", content)
	}
	draftPreviewURL := server.URL + "/admin/content-preview/" + strconv.FormatInt(content.ContentID, 10) + "/" + strconv.FormatInt(content.SiteID, 10) + "/" + content.Locale
	draftPreview := mustGet(t, client, draftPreviewURL)
	draftPreviewBody := readBody(t, draftPreview)
	if draftPreview.StatusCode != http.StatusOK || draftPreview.Header.Get("X-Robots-Tag") != "noindex, nofollow" {
		t.Fatalf("secured draft preview status=%d robots=%q", draftPreview.StatusCode, draftPreview.Header.Get("X-Robots-Tag"))
	}
	for _, expected := range []string{"Secure API content", `class="article-masthead"`, `article-layout`, "Reading time"} {
		if !strings.Contains(draftPreviewBody, expected) {
			t.Fatalf("secured draft preview missing %q", expected)
		}
	}
	if strings.Contains(draftPreviewBody, `rel="canonical"`) || strings.Contains(draftPreviewBody, `hreflang=`) {
		t.Fatal("secured draft preview exposed canonical or hreflang metadata")
	}

	updatePayload := map[string]any{
		"content_type": "article", "status": "published", "title": "Secure API content 2026", "slug": "secure-api-content",
		"summary": "Published through the protected HTTP API.", "body_html": "<p>published</p>", "ai_state": "reviewed", "version": content.Version,
		"seo": map[string]any{"h1": "Secure API content", "title": "Secure API SEO title 2026", "primary_keyword": "secure cms", "secondary_keywords": []string{}, "robots_index": true, "structured_data": map[string]any{"@type": "Article"}},
	}
	contentURL := server.URL + "/api/v1/contents/" + strconv.FormatInt(content.ContentID, 10) + "/locales/en?site_id=" + strconv.FormatInt(content.SiteID, 10)
	updatedContent := doJSON(t, client, http.MethodPut, contentURL, mePayload.CSRFToken, updatePayload)
	if updatedContent.StatusCode != http.StatusOK {
		t.Fatalf("update content status=%d body=%s", updatedContent.StatusCode, readBody(t, updatedContent))
	}
	var updated struct {
		Version        int64 `json:"version"`
		ContentVersion int64 `json:"content_version"`
	}
	if err = json.NewDecoder(updatedContent.Body).Decode(&updated); err != nil {
		t.Fatal(err)
	}
	updatedContent.Body.Close()
	if updated.Version != 2 || updated.ContentVersion != 2 {
		t.Fatalf("updated versions=%+v", updated)
	}
	localizationOptions := mustGet(t, client, server.URL+"/api/v1/contents/"+strconv.FormatInt(content.ContentID, 10)+"/localization-options?source_site_id="+strconv.FormatInt(content.SiteID, 10)+"&source_locale=en")
	var localizationOptionsPayload struct {
		AIAvailable bool `json:"ai_available"`
		Eligible    bool `json:"eligible"`
		Targets     []struct {
			SiteID        int64  `json:"site_id"`
			Locale        string `json:"locale"`
			TemplateBound bool   `json:"template_bound"`
		} `json:"targets"`
	}
	if err = json.NewDecoder(localizationOptions.Body).Decode(&localizationOptionsPayload); err != nil {
		t.Fatal(err)
	}
	localizationOptions.Body.Close()
	if localizationOptionsPayload.AIAvailable || localizationOptionsPayload.Eligible || len(localizationOptionsPayload.Targets) != 5 {
		t.Fatalf("localization options=%+v", localizationOptionsPayload)
	}
	for _, target := range localizationOptionsPayload.Targets {
		if !target.TemplateBound || strings.HasPrefix(strings.ToLower(target.Locale), "en") {
			t.Fatalf("invalid localization target=%+v", target)
		}
	}
	if _, err = application.db.Exec(`UPDATE sites SET status = 'maintenance' WHERE id = ?`, italySiteID); err != nil {
		t.Fatal(err)
	}
	maintenanceOptions := mustGet(t, client, server.URL+"/api/v1/contents/"+strconv.FormatInt(content.ContentID, 10)+"/localization-options?source_site_id="+strconv.FormatInt(content.SiteID, 10)+"&source_locale=en")
	var maintenancePayload struct {
		Targets []struct {
			SiteID     int64  `json:"site_id"`
			SiteOnline bool   `json:"site_online"`
			Reason     string `json:"reason"`
		} `json:"targets"`
	}
	if err = json.NewDecoder(maintenanceOptions.Body).Decode(&maintenancePayload); err != nil {
		t.Fatal(err)
	}
	maintenanceOptions.Body.Close()
	for _, target := range maintenancePayload.Targets {
		if target.SiteID == italySiteID && (target.SiteOnline || !strings.Contains(target.Reason, "维护")) {
			t.Fatalf("maintenance site was offered as online localization target=%+v", target)
		}
	}
	if _, err = application.db.Exec(`UPDATE sites SET status = 'active' WHERE id = ?`, italySiteID); err != nil {
		t.Fatal(err)
	}
	localizeWithoutAI := doJSON(t, client, http.MethodPost, server.URL+"/api/v1/contents/"+strconv.FormatInt(content.ContentID, 10)+"/localize", mePayload.CSRFToken, map[string]any{
		"source_site_id": content.SiteID, "source_locale": "en", "scope": "full", "overwrite": false,
		"targets": []map[string]any{{"site_id": italySiteID, "locale": "it-IT"}},
	})
	localizeWithoutAI.Body.Close()
	if localizeWithoutAI.StatusCode != http.StatusServiceUnavailable {
		t.Fatalf("localize without AI status=%d", localizeWithoutAI.StatusCode)
	}
	stale := doJSON(t, client, http.MethodPut, contentURL, mePayload.CSRFToken, updatePayload)
	stale.Body.Close()
	if stale.StatusCode != http.StatusConflict {
		t.Fatalf("stale update status=%d", stale.StatusCode)
	}
	revisions := mustGet(t, client, server.URL+"/api/v1/contents/"+strconv.FormatInt(content.ContentID, 10)+"/revisions")
	var revisionPayload struct {
		Revisions []json.RawMessage `json:"revisions"`
	}
	if err = json.NewDecoder(revisions.Body).Decode(&revisionPayload); err != nil {
		t.Fatal(err)
	}
	revisions.Body.Close()
	if len(revisionPayload.Revisions) != 2 {
		t.Fatalf("revision count=%d", len(revisionPayload.Revisions))
	}

	request, _ := http.NewRequest(http.MethodPost, server.URL+"/api/v1/content/sanitize", strings.NewReader(`{"html":"<p>ok</p>"}`))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Origin", server.URL)
	forbidden, err := client.Do(request)
	if err != nil {
		t.Fatal(err)
	}
	forbidden.Body.Close()
	if forbidden.StatusCode != http.StatusForbidden {
		t.Fatalf("missing CSRF status=%d", forbidden.StatusCode)
	}

	request, _ = http.NewRequest(http.MethodPost, server.URL+"/api/v1/content/sanitize", strings.NewReader(`{"html":"<p onclick='x()'>安全<script>alert(1)</script></p>"}`))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Origin", server.URL)
	request.Header.Set("X-CSRF-Token", mePayload.CSRFToken)
	sanitized, err := client.Do(request)
	if err != nil {
		t.Fatal(err)
	}
	sanitizedBody := readBody(t, sanitized)
	if sanitized.StatusCode != http.StatusOK || strings.Contains(sanitizedBody, "script") || strings.Contains(sanitizedBody, "onclick") {
		t.Fatalf("rich text not sanitized: %s", sanitizedBody)
	}

	status := mustGet(t, client, server.URL+"/api/v1/system/status")
	status.Body.Close()
	if status.StatusCode != http.StatusOK {
		t.Fatalf("protected system status=%d", status.StatusCode)
	}

	auditResponse := mustGet(t, client, server.URL+"/api/v1/audit")
	var auditPayload struct {
		Records []json.RawMessage `json:"records"`
	}
	if err = json.NewDecoder(auditResponse.Body).Decode(&auditPayload); err != nil {
		t.Fatal(err)
	}
	auditResponse.Body.Close()
	if len(auditPayload.Records) < 3 {
		t.Fatalf("audit records=%d", len(auditPayload.Records))
	}
}

func TestPublicHealthAndStaticAsset(t *testing.T) {
	application, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = application.Close() })
	server := httptest.NewServer(application.Handler())
	t.Cleanup(server.Close)
	health, err := http.Get(server.URL + "/healthz")
	if err != nil {
		t.Fatal(err)
	}
	health.Body.Close()
	if health.StatusCode != http.StatusOK {
		t.Fatalf("health status=%d", health.StatusCode)
	}
	asset, err := http.Get(server.URL + "/assets/css/admin.css")
	if err != nil {
		t.Fatal(err)
	}
	asset.Body.Close()
	if asset.StatusCode != http.StatusOK || !strings.Contains(asset.Header.Get("Content-Type"), "text/css") {
		t.Fatalf("asset status=%d type=%q", asset.StatusCode, asset.Header.Get("Content-Type"))
	}
}

func TestLocalPreviewAndBoundDomainRenderNativeHTML(t *testing.T) {
	application, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = application.Close() })

	previewRequest := httptest.NewRequest(http.MethodGet, "/preview/global", nil)
	previewResponse := httptest.NewRecorder()
	application.Handler().ServeHTTP(previewResponse, previewRequest)
	if previewResponse.Code != http.StatusOK || previewResponse.Header().Get("X-Robots-Tag") != "noindex, nofollow" || !strings.Contains(previewResponse.Body.String(), "本地预览") {
		t.Fatalf("preview status=%d robots=%q body=%q", previewResponse.Code, previewResponse.Header().Get("X-Robots-Tag"), previewResponse.Body.String())
	}

	publicRequest := httptest.NewRequest(http.MethodGet, "http://www.example.com/", nil)
	publicRequest.Host = "www.example.com"
	publicResponse := httptest.NewRecorder()
	application.Handler().ServeHTTP(publicResponse, publicRequest)
	if publicResponse.Code != http.StatusOK || !strings.Contains(publicResponse.Header().Get("Cache-Control"), "public") || !strings.Contains(publicResponse.Body.String(), "Global Route English已可以访问") {
		t.Fatalf("public status=%d cache=%q body=%q", publicResponse.Code, publicResponse.Header().Get("Cache-Control"), publicResponse.Body.String())
	}
	if !strings.Contains(publicResponse.Body.String(), `<link rel="canonical" href="http://www.example.com/">`) {
		t.Fatalf("canonical missing: %q", publicResponse.Body.String())
	}

	portHandler := localPreviewHandler(application.Handler(), "global")
	portRequest := httptest.NewRequest(http.MethodGet, "http://localhost:8081/", nil)
	portResponse := httptest.NewRecorder()
	portHandler.ServeHTTP(portResponse, portRequest)
	if portResponse.Code != http.StatusOK || !strings.Contains(portResponse.Body.String(), "本地预览") {
		t.Fatalf("dedicated port status=%d body=%q", portResponse.Code, portResponse.Body.String())
	}
	adminRequest := httptest.NewRequest(http.MethodGet, "http://localhost:8081/admin", nil)
	adminResponse := httptest.NewRecorder()
	portHandler.ServeHTTP(adminResponse, adminRequest)
	if adminResponse.Code != http.StatusNotFound {
		t.Fatalf("admin leaked through preview port: %d", adminResponse.Code)
	}
}

func TestSitemapRobotsAndSinglePageNoindex(t *testing.T) {
	application, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = application.Close() })
	now := time.Now().UTC().Format(time.RFC3339)
	insertContent := func(contentType, title, slug string) {
		result, insertErr := application.db.Exec(`INSERT INTO contents(content_type, status, version, created_at, updated_at) VALUES (?, 'published', 1, ?, ?)`, contentType, now, now)
		if insertErr != nil {
			t.Fatal(insertErr)
		}
		contentID, _ := result.LastInsertId()
		_, insertErr = application.db.Exec(`INSERT INTO content_locales(
			content_id, site_id, locale, status, title, slug, summary, body_html, h1, seo_title,
			meta_description, primary_keyword, secondary_keywords_json, canonical_url, robots_index,
			og_title, og_description, structured_data_json, ai_state, published_at, version, created_at, updated_at
		) SELECT ?, id, 'en', 'published', ?, ?, 'Sitemap validation content.', '<p>Public body</p>', ?, ?,
			'Sitemap validation description.', 'sitemap validation', '[]', '', 1, ?, 'Sitemap validation description.',
			'{}', 'manual', ?, 1, ?, ? FROM sites WHERE code = 'global'`, contentID, title, slug, title, title, title, now, now, now)
		if insertErr != nil {
			t.Fatal(insertErr)
		}
	}
	insertContent("article", "Sitemap eligible article", "guides/sitemap-eligible")
	insertContent("page", "Single page excluded from sitemap", "company/about")

	localHandler := localPreviewHandler(application.Handler(), "global")
	localSitemapRequest := httptest.NewRequest(http.MethodGet, "http://localhost:8081/sitemap.xml", nil)
	localSitemapResponse := httptest.NewRecorder()
	localHandler.ServeHTTP(localSitemapResponse, localSitemapRequest)
	localSitemap := localSitemapResponse.Body.String()
	if localSitemapResponse.Code != http.StatusOK || !strings.Contains(localSitemapResponse.Header().Get("Content-Type"), "application/xml") || localSitemapResponse.Header().Get("X-Robots-Tag") != "noindex, nofollow" {
		t.Fatalf("local sitemap status=%d type=%q robots=%q", localSitemapResponse.Code, localSitemapResponse.Header().Get("Content-Type"), localSitemapResponse.Header().Get("X-Robots-Tag"))
	}
	for _, expected := range []string{"http://localhost:8081/", "guides/sitemap-eligible"} {
		if !strings.Contains(localSitemap, expected) {
			t.Fatalf("local sitemap missing %q: %s", expected, localSitemap)
		}
	}
	if strings.Contains(localSitemap, "company/about") {
		t.Fatalf("single page leaked into sitemap: %s", localSitemap)
	}

	previewRequest := httptest.NewRequest(http.MethodGet, "http://preview.test:8080/preview/global/sitemap.xml", nil)
	previewRequest.Host = "preview.test:8080"
	previewResponse := httptest.NewRecorder()
	application.Handler().ServeHTTP(previewResponse, previewRequest)
	if previewResponse.Code != http.StatusOK || !strings.Contains(previewResponse.Body.String(), "http://preview.test:8080/preview/global/guides/sitemap-eligible") {
		t.Fatalf("preview sitemap status=%d body=%q", previewResponse.Code, previewResponse.Body.String())
	}

	publicSitemapRequest := httptest.NewRequest(http.MethodGet, "http://www.example.com/sitemap.xml", nil)
	publicSitemapRequest.Host = "www.example.com"
	publicSitemapResponse := httptest.NewRecorder()
	application.Handler().ServeHTTP(publicSitemapResponse, publicSitemapRequest)
	publicSitemap := publicSitemapResponse.Body.String()
	if publicSitemapResponse.Code != http.StatusOK || !strings.Contains(publicSitemap, "http://www.example.com/guides/sitemap-eligible") || strings.Contains(publicSitemap, "company/about") {
		t.Fatalf("public sitemap status=%d body=%q", publicSitemapResponse.Code, publicSitemap)
	}

	publicRobotsRequest := httptest.NewRequest(http.MethodGet, "http://www.example.com/robots.txt", nil)
	publicRobotsRequest.Host = "www.example.com"
	publicRobotsResponse := httptest.NewRecorder()
	application.Handler().ServeHTTP(publicRobotsResponse, publicRobotsRequest)
	publicRobots := publicRobotsResponse.Body.String()
	if publicRobotsResponse.Code != http.StatusOK || !strings.Contains(publicRobots, "Allow: /\n") || !strings.Contains(publicRobots, "Sitemap: http://www.example.com/sitemap.xml") || strings.Contains(publicRobots, "company/about") {
		t.Fatalf("public robots status=%d body=%q", publicRobotsResponse.Code, publicRobots)
	}

	pageRequest := httptest.NewRequest(http.MethodGet, "http://www.example.com/company/about", nil)
	pageRequest.Host = "www.example.com"
	pageResponse := httptest.NewRecorder()
	application.Handler().ServeHTTP(pageResponse, pageRequest)
	if pageResponse.Code != http.StatusOK || pageResponse.Header().Get("X-Robots-Tag") != "noindex, follow" || !strings.Contains(pageResponse.Body.String(), `content="noindex,follow"`) {
		t.Fatalf("single page index policy invalid: status=%d header=%q body=%q", pageResponse.Code, pageResponse.Header().Get("X-Robots-Tag"), pageResponse.Body.String())
	}
}

func TestPublicRendererFailsClosedWithoutRenderableTheme(t *testing.T) {
	application, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = application.Close() })
	if _, err = application.db.Exec(`UPDATE site_languages SET theme_package_id = NULL WHERE locale = 'en'`); err != nil {
		t.Fatal(err)
	}
	request := httptest.NewRequest(http.MethodGet, "/preview/global", nil)
	response := httptest.NewRecorder()
	application.Handler().ServeHTTP(response, request)
	if response.Code != http.StatusServiceUnavailable || strings.Contains(response.Body.String(), "Global Route Network") {
		t.Fatalf("unbound theme did not fail closed: status=%d body=%q", response.Code, response.Body.String())
	}
}

func TestPublishedMultilingualContentRoutesAndDraftIsolation(t *testing.T) {
	application, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = application.Close() })

	now := time.Now().UTC().Format(time.RFC3339)
	result, err := application.db.Exec(`INSERT INTO contents(content_type, status, version, created_at, updated_at) VALUES ('article', 'published', 1, ?, ?)`, now, now)
	if err != nil {
		t.Fatal(err)
	}
	contentID, _ := result.LastInsertId()
	_, err = application.db.Exec(`INSERT INTO content_locales(
		content_id, site_id, locale, status, title, slug, category, tags_json, summary, body_html, h1, seo_title,
		meta_description, primary_keyword, secondary_keywords_json, canonical_url, robots_index, og_title,
		og_description, structured_data_json, ai_state, published_at, version, created_at, updated_at
	) SELECT ?, s.id, 'en', 'published', 'International express shipping guide', 'guides/international-express-shipping-2026',
		'Shipping guide', '["express shipping"]', 'A practical guide for international express delivery.',
		'<h2>Choose a dependable route</h2><p>Published content from the CMS.</p>', 'International express shipping guide',
		'International Express Shipping Guide 2026', 'Plan fast international delivery with clear customs steps.',
		'international express shipping', '["cross-border delivery"]', '', 1, 'International express shipping guide',
		'Practical international delivery guidance.', '{"@context":"https://schema.org","@type":"Article"}', 'reviewed', ?, 1, ?, ?
		FROM sites s WHERE s.code = 'global'`, contentID, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	_, err = application.db.Exec(`INSERT INTO content_locales(
		content_id, site_id, locale, status, title, slug, summary, body_html, h1, seo_title, secondary_keywords_json,
		structured_data_json, ai_state, version, created_at, updated_at
	) SELECT ?, s.id, 'de-DE', 'draft', 'Nicht veröffentlichter Entwurf', 'ratgeber/nicht-veroeffentlicht',
		'Entwurf', '<p>Dieser Text darf nie öffentlich erscheinen.</p>', 'Nicht veröffentlichter Entwurf',
		'Nicht veröffentlichter Entwurf', '[]', '{}', 'manual', 1, ?, ? FROM sites s WHERE s.code = 'germany'`, contentID, now, now)
	if err != nil {
		t.Fatal(err)
	}

	deepRequest := httptest.NewRequest(http.MethodGet, "/preview/global/guides/international-express-shipping-2026", nil)
	deepResponse := httptest.NewRecorder()
	application.Handler().ServeHTTP(deepResponse, deepRequest)
	body := deepResponse.Body.String()
	if deepResponse.Code != http.StatusOK || deepResponse.Header().Get("X-Robots-Tag") != "noindex, nofollow" {
		t.Fatalf("published preview status=%d robots=%q", deepResponse.Code, deepResponse.Header().Get("X-Robots-Tag"))
	}
	for _, expected := range []string{`<html lang="en"`, "International Express Shipping Guide 2026", "Published content from the CMS.", `class="article-page"`} {
		if !strings.Contains(body, expected) {
			t.Fatalf("published preview missing %q", expected)
		}
	}
	if strings.Contains(body, `rel="canonical"`) {
		t.Fatal("preview page must not emit an indexable canonical URL")
	}
	if strings.Contains(body, `hreflang="de-DE"`) {
		t.Fatal("draft locale must not be advertised through hreflang")
	}

	localHandler := localPreviewHandler(application.Handler(), "global")
	localRequest := httptest.NewRequest(http.MethodGet, "http://localhost:8081/guides/international-express-shipping-2026", nil)
	localResponse := httptest.NewRecorder()
	localHandler.ServeHTTP(localResponse, localRequest)
	if localResponse.Code != http.StatusOK || !strings.Contains(localResponse.Body.String(), `href="/#guides"`) || !strings.Contains(localResponse.Body.String(), `href="http://localhost:8081/guides/international-express-shipping-2026"`) || !strings.Contains(localResponse.Body.String(), `href="http://localhost:8082/"`) || strings.Contains(localResponse.Body.String(), `href="/en/`) || strings.Contains(localResponse.Body.String(), "/preview/global/en#guides") {
		t.Fatalf("dedicated deep preview did not keep clean local paths: %d body=%q", localResponse.Code, localResponse.Body.String())
	}
	legacyRequest := httptest.NewRequest(http.MethodGet, "http://localhost:8081/en/guides/international-express-shipping-2026", nil)
	legacyResponse := httptest.NewRecorder()
	localHandler.ServeHTTP(legacyResponse, legacyRequest)
	if legacyResponse.Code != http.StatusPermanentRedirect || legacyResponse.Header().Get("Location") != "/guides/international-express-shipping-2026" {
		t.Fatalf("legacy locale path status=%d location=%q", legacyResponse.Code, legacyResponse.Header().Get("Location"))
	}

	germanHome := httptest.NewRequest(http.MethodGet, "/preview/germany", nil)
	germanResponse := httptest.NewRecorder()
	application.Handler().ServeHTTP(germanResponse, germanHome)
	if germanResponse.Code != http.StatusOK || !strings.Contains(germanResponse.Body.String(), "Grenzüberschreitend liefern") || !strings.Contains(germanResponse.Body.String(), `lang="de-DE"`) {
		t.Fatalf("German template missing: status=%d", germanResponse.Code)
	}

	draftRequest := httptest.NewRequest(http.MethodGet, "/preview/germany/ratgeber/nicht-veroeffentlicht", nil)
	draftResponse := httptest.NewRecorder()
	application.Handler().ServeHTTP(draftResponse, draftRequest)
	if draftResponse.Code != http.StatusNotFound || strings.Contains(draftResponse.Body.String(), "Dieser Text") || !strings.Contains(draftResponse.Body.String(), "Diese Route wurde nicht gefunden") || !strings.Contains(draftResponse.Body.String(), `content="noindex,nofollow"`) {
		t.Fatalf("draft leaked publicly: status=%d body=%q", draftResponse.Code, draftResponse.Body.String())
	}

	publicRequest := httptest.NewRequest(http.MethodGet, "http://www.example.com/guides/international-express-shipping-2026", nil)
	publicRequest.Host = "www.example.com"
	publicResponse := httptest.NewRecorder()
	application.Handler().ServeHTTP(publicResponse, publicRequest)
	if publicResponse.Code != http.StatusOK || !strings.Contains(publicResponse.Body.String(), `<link rel="canonical" href="http://www.example.com/guides/international-express-shipping-2026">`) || !strings.Contains(publicResponse.Body.String(), `<meta name="robots" content="index,follow`) {
		t.Fatalf("public SEO output invalid: status=%d", publicResponse.Code)
	}
}

func BenchmarkHealth(b *testing.B) {
	root := b.TempDir()
	application, err := New(config.Config{DatabasePath: filepath.Join(root, "benchmark.db"), CacheTTL: time.Minute, RequestTimeout: 3 * time.Second, SecretsDir: filepath.Join(root, "secrets"), UploadDir: filepath.Join(root, "uploads"), ThemeDir: filepath.Join(root, "themes"), BackupDir: filepath.Join(root, "backups")}, slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		b.Fatal(err)
	}
	b.Cleanup(func() { _ = application.Close() })
	request := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	b.ReportAllocs()
	b.ResetTimer()
	for b.Loop() {
		response := httptest.NewRecorder()
		application.Handler().ServeHTTP(response, request)
		if response.Code != http.StatusOK {
			b.Fatalf("status=%d", response.Code)
		}
	}
}

func extractToken(t *testing.T, body string) string {
	t.Helper()
	match := csrfInput.FindStringSubmatch(body)
	if len(match) != 2 {
		t.Fatal("CSRF token not found")
	}
	return match[1]
}
func readBody(t *testing.T, response *http.Response) string {
	t.Helper()
	contents, err := io.ReadAll(response.Body)
	response.Body.Close()
	if err != nil {
		t.Fatal(err)
	}
	return string(contents)
}
func mustGet(t *testing.T, client *http.Client, target string) *http.Response {
	t.Helper()
	response, err := client.Get(target)
	if err != nil {
		t.Fatal(err)
	}
	return response
}
func postForm(t *testing.T, client *http.Client, target, token string, values url.Values) *http.Response {
	t.Helper()
	values.Set("csrf_token", token)
	request, _ := http.NewRequest(http.MethodPost, target, strings.NewReader(values.Encode()))
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	parsed, _ := url.Parse(target)
	request.Header.Set("Origin", parsed.Scheme+"://"+parsed.Host)
	response, err := client.Do(request)
	if err != nil {
		t.Fatal(err)
	}
	return response
}

func doJSON(t *testing.T, client *http.Client, method, target, token string, payload any) *http.Response {
	t.Helper()
	encoded, err := json.Marshal(payload)
	if err != nil {
		t.Fatal(err)
	}
	request, _ := http.NewRequest(method, target, strings.NewReader(string(encoded)))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Origin", strings.Split(target, "/api/")[0])
	if token != "" {
		request.Header.Set("X-CSRF-Token", token)
	}
	response, err := client.Do(request)
	if err != nil {
		t.Fatal(err)
	}
	return response
}
