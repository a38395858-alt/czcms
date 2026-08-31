package catalog

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"czcms/internal/contentsafety"
	"czcms/internal/database"
)

func TestCatalogCRUDScopesSEORevisionsAndOptimisticLock(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "catalog.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	now := time.Now().UTC().Format(time.RFC3339)
	result, err := db.ExecContext(ctx, `
		INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at)
		VALUES ('catalog-owner', '目录管理员', 'test-only', ?, ?, ?)`, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := result.LastInsertId()
	if _, err = db.ExecContext(ctx, `INSERT INTO user_access_scopes(user_id, site_id, locale, created_at) VALUES (?, 0, '*', ?)`, userID, now); err != nil {
		t.Fatal(err)
	}

	service := New(db, contentsafety.NewSanitizer())
	sites, err := service.ListSites(ctx, userID)
	if err != nil || len(sites) != 6 {
		t.Fatalf("sites=%v err=%v", sites, err)
	}
	var germanySiteID int64
	for _, site := range sites {
		if site.Code == "germany" {
			germanySiteID = site.ID
			break
		}
	}
	if germanySiteID == 0 {
		t.Fatal("Germany site missing")
	}
	languages, err := service.ListLanguages(ctx, userID)
	if err != nil || len(languages) < 20 {
		t.Fatalf("languages=%d err=%v", len(languages), err)
	}

	created, err := service.CreateContent(ctx, userID, CreateContentInput{
		ContentType: "article", SiteID: sites[0].ID, Locale: "en", Status: "draft",
		Title: "Secure global logistics", Slug: "secure-global-logistics", Summary: "A local market draft.",
		BodyHTML: `<p>Safe content</p><script>alert(1)</script>`, AIState: "manual",
		SEO: &SEOInput{H1: "Global logistics", Title: "Global logistics services", PrimaryKeyword: "global logistics", SecondaryKeywords: []string{"international shipping"}, RobotsIndex: true, StructuredData: []byte(`{"@type":"Article"}`)},
	})
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(created.BodyHTML, "script") || created.Version != 1 || created.ContentVersion != 1 {
		t.Fatalf("unsafe or incorrect created record: %+v", created)
	}
	if created.SEOTitle != "Global logistics services" || len(created.SecondaryKeywords) != 1 {
		t.Fatalf("SEO fields not persisted: %+v", created)
	}
	page, err := service.CreateContent(ctx, userID, CreateContentInput{
		ContentType: "page", SiteID: sites[0].ID, Locale: "en", Status: "draft",
		Title: "About us", Slug: "about-us", Summary: "Company information.", BodyHTML: "<p>About the company.</p>", AIState: "manual",
		SEO: &SEOInput{Title: "About us", MetaDescription: "Company information.", RobotsIndex: true, StructuredData: []byte(`{"@type":"WebPage"}`)},
	})
	if err != nil {
		t.Fatal(err)
	}
	if page.ContentType != "page" || page.RobotsIndex {
		t.Fatalf("single page should persist noindex policy: %+v", page)
	}
	pageRows, pageTotal, err := service.ListContents(ctx, userID, ContentQuery{SiteID: sites[0].ID, ContentType: "page"})
	if err != nil || pageTotal != 1 || len(pageRows) != 1 || pageRows[0].ContentType != "page" {
		t.Fatalf("single page query=%+v total=%d err=%v", pageRows, pageTotal, err)
	}
	nonPageRows, nonPageTotal, err := service.ListContents(ctx, userID, ContentQuery{SiteID: sites[0].ID, ContentType: "non_page"})
	if err != nil || nonPageTotal != 1 || len(nonPageRows) != 1 || nonPageRows[0].ContentType == "page" {
		t.Fatalf("non-page query=%+v total=%d err=%v", nonPageRows, nonPageTotal, err)
	}

	updated, err := service.UpdateContentLocale(ctx, userID, created.ContentID, created.SiteID, created.Locale, UpdateContentLocaleInput{
		ContentType: "article", Status: "published", Title: "Secure global logistics 2026", Slug: created.Slug,
		Summary: created.Summary, BodyHTML: created.BodyHTML, AIState: "reviewed", Version: created.Version,
		SEO: &SEOInput{H1: "Secure global logistics", Title: "Secure global logistics services 2026", PrimaryKeyword: "secure logistics", RobotsIndex: true, StructuredData: []byte(`{"@type":"Article"}`)},
	})
	if err != nil {
		t.Fatal(err)
	}
	if updated.Version != 2 || updated.ContentVersion != 2 || updated.PublishedAt == nil {
		t.Fatalf("unexpected updated versions/status: %+v", updated)
	}
	counts, err := service.ContentCounts(ctx, userID, 0, "")
	if err != nil || counts["published"] != 1 {
		t.Fatalf("content counts=%v err=%v", counts, err)
	}

	_, err = service.UpdateContentLocale(ctx, userID, created.ContentID, created.SiteID, created.Locale, UpdateContentLocaleInput{
		ContentType: "article", Status: "draft", Title: "Stale write", Slug: created.Slug,
		BodyHTML: "<p>stale</p>", AIState: "manual", Version: 1,
	})
	if !errors.Is(err, ErrConflict) {
		t.Fatalf("stale update error=%v, want conflict", err)
	}

	revisions, err := service.ListRevisions(ctx, userID, created.ContentID, 10)
	if err != nil || len(revisions) != 2 || revisions[0].Version != 2 {
		t.Fatalf("revisions=%v err=%v", revisions, err)
	}
	localized, err := service.CreateContentLocale(ctx, userID, created.ContentID, CreateContentInput{
		ContentType: "article", SiteID: germanySiteID, Locale: "de-DE", Status: "review",
		Title: "Sichere globale Logistik", Slug: "sichere-globale-logistik", Summary: "Eigenständig lokalisierter Inhalt.",
		BodyHTML: "<p>Keine mechanische Übersetzung.</p>", AIState: "localized",
		SEO: &SEOInput{H1: "Sichere globale Logistik", Title: "Sichere Logistik für Deutschland", PrimaryKeyword: "sichere Logistik", RobotsIndex: true, StructuredData: []byte(`{"@type":"Article"}`)},
	})
	if err != nil || localized.Locale != "de-DE" || localized.ContentID != created.ContentID || localized.ContentVersion != 3 {
		t.Fatalf("localized=%+v err=%v", localized, err)
	}
	archived := "archived"
	category := "物流指南"
	bulkResult, err := service.BulkUpdateContentLocales(ctx, userID, BulkContentUpdateInput{
		Targets: []BulkContentTarget{
			{ContentID: updated.ContentID, SiteID: updated.SiteID, Locale: updated.Locale, Version: updated.Version},
			{ContentID: localized.ContentID, SiteID: localized.SiteID, Locale: localized.Locale, Version: localized.Version},
		},
		Status: &archived, Category: &category,
	})
	if err != nil || bulkResult.Updated != 2 {
		t.Fatalf("bulk update=%+v err=%v", bulkResult, err)
	}
	bulkEnglish, err := service.GetContentLocale(ctx, updated.ContentID, updated.SiteID, updated.Locale)
	if err != nil || bulkEnglish.Status != "archived" || bulkEnglish.Category != category || bulkEnglish.Version != updated.Version+1 {
		t.Fatalf("bulk English=%+v err=%v", bulkEnglish, err)
	}
	bulkGerman, err := service.GetContentLocale(ctx, localized.ContentID, localized.SiteID, localized.Locale)
	if err != nil || bulkGerman.Status != "archived" || bulkGerman.Category != category || bulkGerman.Version != localized.Version+1 {
		t.Fatalf("bulk German=%+v err=%v", bulkGerman, err)
	}
	draft := "draft"
	_, err = service.BulkUpdateContentLocales(ctx, userID, BulkContentUpdateInput{
		Targets: []BulkContentTarget{
			{ContentID: bulkEnglish.ContentID, SiteID: bulkEnglish.SiteID, Locale: bulkEnglish.Locale, Version: bulkEnglish.Version},
			{ContentID: bulkGerman.ContentID, SiteID: bulkGerman.SiteID, Locale: bulkGerman.Locale, Version: localized.Version},
		},
		Status: &draft,
	})
	if !errors.Is(err, ErrConflict) {
		t.Fatalf("atomic bulk conflict=%v, want conflict", err)
	}
	bulkEnglish, err = service.GetContentLocale(ctx, bulkEnglish.ContentID, bulkEnglish.SiteID, bulkEnglish.Locale)
	if err != nil || bulkEnglish.Status != "archived" || bulkEnglish.Version != updated.Version+1 {
		t.Fatalf("bulk conflict should roll back first target: %+v err=%v", bulkEnglish, err)
	}

	_, err = service.CreateContent(ctx, userID, CreateContentInput{
		ContentType: "article", SiteID: sites[0].ID, Locale: "en", Status: "draft", Title: "Bad SEO", Slug: "bad-seo", AIState: "manual",
		SEO: &SEOInput{CanonicalURL: "javascript:alert(1)", RobotsIndex: true},
	})
	if !errors.Is(err, ErrInvalid) {
		t.Fatalf("unsafe canonical error=%v, want validation", err)
	}

	other, err := db.ExecContext(ctx, `
		INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at)
		VALUES ('no-scope', '无权限用户', 'test-only', ?, ?, ?)`, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	otherID, _ := other.LastInsertId()
	items, total, err := service.ListContents(ctx, otherID, ContentQuery{})
	if err != nil || total != 0 || len(items) != 0 {
		t.Fatalf("scope leak: total=%d items=%v err=%v", total, items, err)
	}
}

func TestSiteSEOSettingsAndFaviconLifecycle(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "site-seo.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	now := time.Now().UTC().Format(time.RFC3339)
	result, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at) VALUES ('site-seo-owner', '站点 SEO 测试', 'test-only', ?, ?, ?)`, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := result.LastInsertId()
	if _, err = db.ExecContext(ctx, `INSERT INTO user_access_scopes(user_id, site_id, locale, created_at) VALUES (?, 0, '*', ?)`, userID, now); err != nil {
		t.Fatal(err)
	}
	mediaResult, err := db.ExecContext(ctx, `INSERT INTO media_files(storage_name, original_name, media_type, byte_size, sha256, width, height, uploaded_by, created_at, updated_at) VALUES ('site-icon.png', 'site-icon.png', 'image/png', 2048, '0123456789abcdef0123456789abcdef', 512, 512, ?, ?, ?)`, userID, now, now)
	if err != nil {
		t.Fatal(err)
	}
	mediaID, _ := mediaResult.LastInsertId()
	service := New(db, contentsafety.NewSanitizer())
	site, err := service.SiteByCode(ctx, "global")
	if err != nil {
		t.Fatal(err)
	}
	updated, err := service.UpdateSite(ctx, site.ID, SiteInput{
		Name: site.Name, Code: site.Code, PrimaryDomain: site.PrimaryDomain, LocalPort: site.LocalPort,
		MarketCode: site.MarketCode, Status: site.Status, SEOTitle: "Global Route · International Express Shipping",
		SEODescription: "International express shipping and logistics guidance for global business teams.",
		FaviconMediaID: &mediaID, Version: site.Version,
	})
	if err != nil {
		t.Fatal(err)
	}
	if updated.SEOTitle == "" || updated.SEODescription == "" || updated.FaviconMediaID == nil || *updated.FaviconMediaID != mediaID || updated.FaviconURL != "/media/"+fmt.Sprint(mediaID)+"/0123456789abcdef" {
		t.Fatalf("site SEO settings not returned: %+v", updated)
	}
	if _, err = service.UpdateSite(ctx, site.ID, SiteInput{Name: site.Name, Code: site.Code, LocalPort: site.LocalPort, MarketCode: site.MarketCode, Status: site.Status, SEODescription: strings.Repeat("x", 501), Version: updated.Version}); !errors.Is(err, ErrInvalid) {
		t.Fatalf("oversized site description error=%v, want invalid", err)
	}
	if _, err = service.UpdateSite(ctx, site.ID, SiteInput{Name: site.Name, Code: site.Code, LocalPort: site.LocalPort, MarketCode: site.MarketCode, Status: site.Status, FaviconMediaID: ptrInt64(mediaID + 9999), Version: updated.Version}); !errors.Is(err, ErrInvalid) {
		t.Fatalf("missing favicon error=%v, want invalid", err)
	}
}

func ptrInt64(value int64) *int64 { return &value }

func TestScheduledPublishedContentIsHiddenUntilDue(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "scheduled.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	now := time.Now().UTC().Format(time.RFC3339)
	result, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at) VALUES ('scheduler', '定时发布测试', 'test-only', ?, ?, ?)`, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := result.LastInsertId()
	if _, err = db.ExecContext(ctx, `INSERT INTO user_access_scopes(user_id, site_id, locale, created_at) VALUES (?, 0, '*', ?)`, userID, now); err != nil {
		t.Fatal(err)
	}
	var siteID int64
	if err = db.QueryRowContext(ctx, `SELECT id FROM sites WHERE code = 'global'`).Scan(&siteID); err != nil {
		t.Fatal(err)
	}
	service := New(db, contentsafety.NewSanitizer())
	future := time.Now().UTC().Add(2 * time.Hour).Format(time.RFC3339)
	scheduled, err := service.CreateContent(ctx, userID, CreateContentInput{
		ContentType: "article", SiteID: siteID, Locale: "en", Status: "published", Title: "Scheduled logistics guide",
		Slug: "scheduled-logistics-guide", BodyHTML: "<p>Not visible before the configured time.</p>", ScheduledAt: future, AIState: "manual",
	})
	if err != nil || scheduled.PublishedAt == nil {
		t.Fatalf("scheduled create=%+v err=%v", scheduled, err)
	}
	if _, err = service.GetPublishedContentByPath(ctx, siteID, "en", scheduled.Slug); !errors.Is(err, ErrNotFound) {
		t.Fatalf("future scheduled content error=%v, want not found", err)
	}
	listed, err := service.ListPublishedContent(ctx, siteID, "en", 20)
	if err != nil || len(listed) != 0 {
		t.Fatalf("future scheduled content leaked into public list: %+v err=%v", listed, err)
	}
	counts, err := service.ContentCounts(ctx, userID, siteID, "en")
	if err != nil || counts["scheduled"] != 1 || counts["published"] != 0 {
		t.Fatalf("scheduled counts=%v err=%v", counts, err)
	}
	past := time.Now().UTC().Add(-time.Hour).Format(time.RFC3339)
	due, err := service.CreateContent(ctx, userID, CreateContentInput{
		ContentType: "article", SiteID: siteID, Locale: "en", Status: "published", Title: "Due logistics guide",
		Slug: "due-logistics-guide", BodyHTML: "<p>The configured time has passed.</p>", ScheduledAt: past, AIState: "manual",
	})
	if err != nil {
		t.Fatal(err)
	}
	visible, err := service.GetPublishedContentByPath(ctx, siteID, "en", due.Slug)
	if err != nil || visible.ContentID != due.ContentID {
		t.Fatalf("due content=%+v err=%v", visible, err)
	}
}

func TestContentCoverCreateReadUpdateRemoveAndValidation(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "content-cover.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	now := time.Now().UTC().Format(time.RFC3339)
	userResult, err := db.ExecContext(ctx, `
		INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at)
		VALUES ('cover-owner', '封面测试员', 'test-only', ?, ?, ?)`, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := userResult.LastInsertId()
	if _, err = db.ExecContext(ctx, `INSERT INTO user_access_scopes(user_id, site_id, locale, created_at) VALUES (?, 0, '*', ?)`, userID, now); err != nil {
		t.Fatal(err)
	}
	mediaResult, err := db.ExecContext(ctx, `
		INSERT INTO media_files(storage_name, original_name, media_type, byte_size, sha256, width, height, uploaded_by, created_at)
		VALUES ('cover-test.jpg', '欧洲物流封面.jpg', 'image/jpeg', 2048, 'cover-test-sha256', 1200, 630, ?, ?)`, userID, now)
	if err != nil {
		t.Fatal(err)
	}
	mediaID, _ := mediaResult.LastInsertId()
	secondMediaResult, err := db.ExecContext(ctx, `
		INSERT INTO media_files(storage_name, original_name, media_type, byte_size, sha256, width, height, uploaded_by, created_at)
		VALUES ('cover-test-2.png', '欧洲物流封面新版.png', 'image/png', 3072, 'cover-test-sha256-2', 1600, 900, ?, ?)`, userID, now)
	if err != nil {
		t.Fatal(err)
	}
	secondMediaID, _ := secondMediaResult.LastInsertId()
	var siteID int64
	if err = db.QueryRowContext(ctx, `SELECT id FROM sites WHERE code = 'global'`).Scan(&siteID); err != nil {
		t.Fatal(err)
	}

	service := New(db, contentsafety.NewSanitizer())
	created, err := service.CreateContent(ctx, userID, CreateContentInput{
		ContentType: "article", SiteID: siteID, Locale: "en", Status: "draft",
		Title: "Europe logistics cover", Slug: "europe-logistics-cover", BodyHTML: "<p>Cover lifecycle</p>",
		CoverMediaID: &mediaID, AIState: "manual",
	})
	if err != nil {
		t.Fatal(err)
	}
	if created.CoverMediaID == nil || *created.CoverMediaID != mediaID || created.CoverOriginalName != "欧洲物流封面.jpg" || created.CoverWidth != 1200 || created.CoverHeight != 630 {
		t.Fatalf("cover not returned after create: %+v", created)
	}
	listed, total, err := service.ListContents(ctx, userID, ContentQuery{SiteID: siteID, Locale: "en"})
	if err != nil || total != 1 || len(listed) != 1 || listed[0].CoverMediaID == nil || *listed[0].CoverMediaID != mediaID {
		t.Fatalf("cover not returned in list: total=%d items=%+v err=%v", total, listed, err)
	}
	revisions, err := service.ListRevisions(ctx, userID, created.ContentID, 10)
	if err != nil || len(revisions) != 1 {
		t.Fatalf("revisions=%+v err=%v", revisions, err)
	}
	var snapshot map[string]any
	if err = json.Unmarshal(revisions[0].Snapshot, &snapshot); err != nil {
		t.Fatalf("cover missing from revision snapshot: snapshot=%s err=%v", revisions[0].Snapshot, err)
	}
	snapshotCoverID, ok := snapshot["cover_media_id"].(float64)
	if !ok || int64(snapshotCoverID) != mediaID {
		t.Fatalf("cover missing from revision snapshot: snapshot=%s", revisions[0].Snapshot)
	}

	updated, err := service.UpdateContentLocale(ctx, userID, created.ContentID, siteID, "en", UpdateContentLocaleInput{
		ContentType: "article", Status: "draft", Title: created.Title, Slug: created.Slug,
		BodyHTML: created.BodyHTML, CoverMediaID: &secondMediaID, AIState: "manual", Version: created.Version,
	})
	if err != nil {
		t.Fatal(err)
	}
	if updated.CoverMediaID == nil || *updated.CoverMediaID != secondMediaID || updated.CoverOriginalName != "欧洲物流封面新版.png" || updated.CoverWidth != 1600 || updated.CoverHeight != 900 {
		t.Fatalf("cover not updated: %+v", updated)
	}

	removed, err := service.UpdateContentLocale(ctx, userID, created.ContentID, siteID, "en", UpdateContentLocaleInput{
		ContentType: "article", Status: "draft", Title: created.Title, Slug: created.Slug,
		BodyHTML: created.BodyHTML, AIState: "manual", Version: updated.Version,
	})
	if err != nil {
		t.Fatal(err)
	}
	if removed.CoverMediaID != nil || removed.CoverOriginalName != "" || removed.CoverWidth != 0 || removed.CoverHeight != 0 {
		t.Fatalf("cover not removed: %+v", removed)
	}

	invalidMediaID := mediaID + 9999
	_, err = service.CreateContent(ctx, userID, CreateContentInput{
		ContentType: "article", SiteID: siteID, Locale: "en", Status: "draft", Title: "Missing cover", Slug: "missing-cover",
		CoverMediaID: &invalidMediaID, AIState: "manual",
	})
	if !errors.Is(err, ErrInvalid) || !strings.Contains(err.Error(), "封面媒体不存在") {
		t.Fatalf("missing media error=%v, want clear validation", err)
	}
	_, err = service.CreateContentLocale(ctx, userID, created.ContentID, CreateContentInput{
		ContentType: "article", SiteID: siteID, Locale: "de-DE", Status: "draft", Title: "Fehlendes Titelbild", Slug: "fehlendes-titelbild",
		CoverMediaID: &invalidMediaID, AIState: "manual",
	})
	if !errors.Is(err, ErrInvalid) || !strings.Contains(err.Error(), "封面媒体不存在") {
		t.Fatalf("locale missing media error=%v, want clear validation", err)
	}
	_, err = service.UpdateContentLocale(ctx, userID, removed.ContentID, siteID, "en", UpdateContentLocaleInput{
		ContentType: "article", Status: "draft", Title: removed.Title, Slug: removed.Slug, BodyHTML: removed.BodyHTML,
		CoverMediaID: &invalidMediaID, AIState: "manual", Version: removed.Version,
	})
	if !errors.Is(err, ErrInvalid) || !strings.Contains(err.Error(), "封面媒体不存在") {
		t.Fatalf("update missing media error=%v, want clear validation", err)
	}
	zero := int64(0)
	_, err = service.CreateContent(ctx, userID, CreateContentInput{
		ContentType: "article", SiteID: siteID, Locale: "en", Status: "draft", Title: "Zero cover", Slug: "zero-cover",
		CoverMediaID: &zero, AIState: "manual",
	})
	if !errors.Is(err, ErrInvalid) || !strings.Contains(err.Error(), "封面媒体 ID 无效") {
		t.Fatalf("zero media error=%v, want ID validation", err)
	}
}

func TestSiteDomainsLocalPreviewDNSAndHostnameRouting(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "domains.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	now := time.Now().UTC().Format(time.RFC3339)
	result, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at) VALUES ('domain-owner', '域名管理员', 'test-only', ?, ?, ?)`, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := result.LastInsertId()
	if _, err = db.ExecContext(ctx, `INSERT INTO user_access_scopes(user_id, site_id, locale, created_at) VALUES (?, 0, '*', ?)`, userID, now); err != nil {
		t.Fatal(err)
	}

	service := New(db, contentsafety.NewSanitizer())
	service.lookupHost = func(context.Context, string) ([]string, error) {
		return []string{"203.0.113.10", "2001:db8::10", "203.0.113.10"}, nil
	}
	created, err := service.CreateSite(ctx, SiteInput{Name: "奥地利测试站", Code: "austria", MarketCode: "AT", Status: "active", DefaultLanguageCode: "de"})
	if err != nil {
		t.Fatal(err)
	}
	if created.PrimaryDomain != "" || created.LocalPreviewPath != "/preview/austria" || created.LocalPort != 8087 || created.DomainCount != 0 {
		t.Fatalf("unexpected local-only site: %+v", created)
	}
	var globalRouteThemeID, createdThemeID int64
	if err = db.QueryRowContext(ctx, `SELECT id FROM theme_packages WHERE render_key = 'global-route' AND status = 'validated'`).Scan(&globalRouteThemeID); err != nil {
		t.Fatal(err)
	}
	if err = db.QueryRowContext(ctx, `SELECT theme_package_id FROM site_languages WHERE site_id = ?`, created.ID).Scan(&createdThemeID); err != nil {
		t.Fatal(err)
	}
	if createdThemeID != globalRouteThemeID {
		t.Fatalf("default template binding=%d, want global route %d", createdThemeID, globalRouteThemeID)
	}
	var atlasThemeID int64
	if err = db.QueryRowContext(ctx, `SELECT id FROM theme_packages WHERE render_key = 'atlas-commerce' AND status = 'validated'`).Scan(&atlasThemeID); err != nil {
		t.Fatal(err)
	}
	selected, err := service.CreateSite(ctx, SiteInput{Name: "奥地利 Atlas 站", Code: "austria-atlas", MarketCode: "AT", Status: "active", DefaultLanguageCode: "de", DefaultThemePackageID: atlasThemeID})
	if err != nil {
		t.Fatalf("create site with selected template: %v", err)
	}
	var selectedThemeID int64
	if err = db.QueryRowContext(ctx, `SELECT theme_package_id FROM site_languages WHERE site_id = ?`, selected.ID).Scan(&selectedThemeID); err != nil {
		t.Fatal(err)
	}
	if selectedThemeID != atlasThemeID {
		t.Fatalf("selected template binding=%d, want %d", selectedThemeID, atlasThemeID)
	}
	if _, err = service.CreateSite(ctx, SiteInput{Name: "不存在模板站", Code: "missing-theme", MarketCode: "US", Status: "active", DefaultLanguageCode: "en", DefaultThemePackageID: 999999}); !errors.Is(err, ErrInvalid) {
		t.Fatalf("missing template error=%v, want invalid", err)
	}
	var disabledThemeID int64
	result, err = db.ExecContext(ctx, `INSERT INTO theme_packages(name, version, storage_name, sha256, uploaded_by, status, kind, render_key, created_at) VALUES ('停用模板', '0.0.1', 'disabled-theme', 'test', ?, 'disabled', 'archive', '', ?)`, userID, now)
	if err != nil {
		t.Fatal(err)
	}
	disabledThemeID, _ = result.LastInsertId()
	if _, err = service.CreateSite(ctx, SiteInput{Name: "停用模板站", Code: "disabled-theme-site", MarketCode: "US", Status: "active", DefaultLanguageCode: "en", DefaultThemePackageID: disabledThemeID}); !errors.Is(err, ErrInvalid) {
		t.Fatalf("disabled template error=%v, want invalid", err)
	}
	_, err = service.CreateSite(ctx, SiteInput{Name: "端口冲突站", Code: "port-conflict", LocalPort: created.LocalPort, MarketCode: "US", Status: "active", DefaultLanguageCode: "en"})
	if !errors.Is(err, ErrConflict) {
		t.Fatalf("duplicate local port error=%v, want conflict", err)
	}
	primary, err := service.CreateSiteDomain(ctx, created.ID, SiteDomainInput{Hostname: "de.example.test", Kind: "primary"})
	if err != nil {
		t.Fatal(err)
	}
	checked, err := service.CheckSiteDomain(ctx, created.ID, primary.ID)
	if err != nil {
		t.Fatal(err)
	}
	if checked.DNSStatus != "resolved" || len(checked.ResolvedAddresses) != 2 {
		t.Fatalf("unexpected DNS result: %+v", checked)
	}
	alias, err := service.CreateSiteDomain(ctx, created.ID, SiteDomainInput{Hostname: "shop.example.test", Kind: "alias", RedirectToPrimary: true})
	if err != nil {
		t.Fatal(err)
	}
	site, matched, err := service.SiteByHostname(ctx, "SHOP.EXAMPLE.TEST:443")
	if err != nil || site.ID != created.ID || matched.ID != alias.ID || !matched.RedirectToPrimary {
		t.Fatalf("hostname route site=%+v domain=%+v err=%v", site, matched, err)
	}
	domains, err := service.ListSiteDomains(ctx, userID, created.ID)
	if err != nil || len(domains) != 2 || domains[0].Kind != "primary" {
		t.Fatalf("domains=%+v err=%v", domains, err)
	}
	updated, err := service.UpdateSiteDomain(ctx, created.ID, alias.ID, SiteDomainInput{Hostname: alias.Hostname, Kind: "primary", Version: alias.Version})
	if err != nil || updated.Kind != "primary" {
		t.Fatalf("promote alias=%+v err=%v", updated, err)
	}
	refreshed, err := service.SiteByCode(ctx, "austria")
	if err != nil || refreshed.PrimaryDomain != alias.Hostname || refreshed.DomainCount != 2 {
		t.Fatalf("refreshed site=%+v err=%v", refreshed, err)
	}
	if _, err = service.CreateSiteDomain(ctx, created.ID, SiteDomainInput{Hostname: "localhost", Kind: "alias"}); !errors.Is(err, ErrInvalid) {
		t.Fatalf("localhost domain error=%v, want invalid", err)
	}
}
