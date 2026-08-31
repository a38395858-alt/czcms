package database

import (
	"context"
	"database/sql"
	"path/filepath"
	"testing"
	"time"
)

func TestOpenEnablesWALForeignKeysAndSeedsLanguages(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	db, err := Open(ctx, filepath.Join(t.TempDir(), "czcms-test.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })

	var journalMode string
	if err = db.QueryRowContext(ctx, "PRAGMA journal_mode").Scan(&journalMode); err != nil {
		t.Fatal(err)
	}
	if journalMode != "wal" {
		t.Fatalf("journal_mode = %q, want wal", journalMode)
	}

	var foreignKeys int
	if err = db.QueryRowContext(ctx, "PRAGMA foreign_keys").Scan(&foreignKeys); err != nil {
		t.Fatal(err)
	}
	if foreignKeys != 1 {
		t.Fatalf("foreign_keys = %d, want 1", foreignKeys)
	}

	var languageCount int
	if err = db.QueryRowContext(ctx, "SELECT COUNT(*) FROM languages WHERE enabled = 1").Scan(&languageCount); err != nil {
		t.Fatal(err)
	}
	if languageCount != 6 {
		t.Fatalf("enabled languages = %d, want 6", languageCount)
	}
	var presetCount int
	if err = db.QueryRowContext(ctx, "SELECT COUNT(*) FROM languages").Scan(&presetCount); err != nil {
		t.Fatal(err)
	}
	if presetCount != 24 {
		t.Fatalf("preset languages = %d, want 24", presetCount)
	}
	var siteCount, singleLanguageSites int
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM sites WHERE local_port BETWEEN 8081 AND 8086`).Scan(&siteCount); err != nil || siteCount != 6 {
		t.Fatalf("independent sites=%d err=%v, want 6", siteCount, err)
	}
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM (SELECT s.id FROM sites s JOIN site_languages sl ON sl.site_id = s.id AND sl.enabled = 1 GROUP BY s.id HAVING COUNT(*) = 1)`).Scan(&singleLanguageSites); err != nil || singleLanguageSites != 6 {
		t.Fatalf("single-language sites=%d err=%v, want 6", singleLanguageSites, err)
	}
	var editableThemeFiles int
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM theme_files WHERE file_key IN ('header', 'footer', 'home', 'category', 'content', 'page')`).Scan(&editableThemeFiles); err != nil {
		t.Fatal(err)
	}
	if editableThemeFiles < 12 {
		t.Fatalf("editable theme files=%d, want at least 12 across built-in themes", editableThemeFiles)
	}
	var sitemapMigration int
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM schema_migrations WHERE version = 15`).Scan(&sitemapMigration); err != nil || sitemapMigration != 1 {
		t.Fatalf("sitemap migration record=%d err=%v", sitemapMigration, err)
	}
	for _, index := range []string{"idx_content_locales_sitemap", "idx_site_languages_sitemap", "idx_theme_packages_renderable"} {
		var indexCount int
		if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM sqlite_master WHERE type = 'index' AND name = ?`, index).Scan(&indexCount); err != nil || indexCount != 1 {
			t.Fatalf("sitemap index %s count=%d err=%v", index, indexCount, err)
		}
	}
}

func TestOpenMigratesLocaleDirectoriesToIndependentSites(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	path := filepath.Join(t.TempDir(), "multilingual-v6.db")
	db, err := Open(ctx, path)
	if err != nil {
		t.Fatal(err)
	}
	now := "2026-08-27T00:00:00Z"
	if _, err = db.ExecContext(ctx, `DELETE FROM sites WHERE code <> 'global'`); err != nil {
		t.Fatal(err)
	}
	if _, err = db.ExecContext(ctx, `INSERT OR IGNORE INTO site_languages(site_id, language_id, locale, enabled, theme_package_id, version, created_at, updated_at)
		SELECT s.id, l.id, l.default_locale, 1, (SELECT id FROM theme_packages WHERE render_key = 'global-route' LIMIT 1), 1, ?, ?
		FROM sites s CROSS JOIN languages l WHERE s.code = 'global' AND l.code IN ('de', 'fr', 'es', 'it', 'nl')`, now, now); err != nil {
		t.Fatal(err)
	}
	contentResult, err := db.ExecContext(ctx, `INSERT INTO contents(content_type, status, version, created_at, updated_at) VALUES ('article', 'published', 3, ?, ?)`, now, now)
	if err != nil {
		t.Fatal(err)
	}
	contentID, _ := contentResult.LastInsertId()
	for _, item := range []struct{ Locale, Title, Slug, Canonical string }{
		{Locale: "de-DE", Title: "Deutscher Leitfaden", Slug: "ratgeber/deutscher-leitfaden", Canonical: "https://de.example.com/de-DE/ratgeber/deutscher-leitfaden"},
		{Locale: "it-IT", Title: "Guida italiana", Slug: "guide/guida-italiana", Canonical: "https://it.example.com/it-IT/guide/guida-italiana"},
	} {
		result, insertErr := db.ExecContext(ctx, `INSERT INTO content_locales(content_id, site_id, locale, status, title, slug, body_html, canonical_url, version, created_at, updated_at)
			SELECT ?, id, ?, 'published', ?, ?, '<p>preserved</p>', ?, 4, ?, ? FROM sites WHERE code = 'global'`, contentID, item.Locale, item.Title, item.Slug, item.Canonical, now, now)
		if insertErr != nil {
			t.Fatal(insertErr)
		}
		localeID, _ := result.LastInsertId()
		if _, insertErr = db.ExecContext(ctx, `INSERT INTO content_revisions(content_id, content_locale_id, site_id, locale, version, snapshot_json, action, created_at)
			SELECT ?, ?, id, ?, 4, '{}', 'updated', ? FROM sites WHERE code = 'global'`, contentID, localeID, item.Locale, now); insertErr != nil {
			t.Fatal(insertErr)
		}
	}
	if _, err = db.ExecContext(ctx, `DELETE FROM schema_migrations WHERE version = 7`); err != nil {
		t.Fatal(err)
	}
	if _, err = db.ExecContext(ctx, `DELETE FROM schema_migrations WHERE version = 9`); err != nil {
		t.Fatal(err)
	}
	if err = db.Close(); err != nil {
		t.Fatal(err)
	}

	db, err = Open(ctx, path)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	var sites, bindings, migratedContent, migratedRevisions int
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM sites WHERE local_port BETWEEN 8081 AND 8086`).Scan(&sites); err != nil || sites != 6 {
		t.Fatalf("migrated sites=%d err=%v", sites, err)
	}
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM site_languages WHERE enabled = 1`).Scan(&bindings); err != nil || bindings != 6 {
		t.Fatalf("migrated bindings=%d err=%v", bindings, err)
	}
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM content_locales cl JOIN sites s ON s.id = cl.site_id
		WHERE cl.content_id = ? AND ((cl.locale = 'de-DE' AND s.code = 'germany') OR (cl.locale = 'it-IT' AND s.code = 'italy')) AND cl.version = 4`, contentID).Scan(&migratedContent); err != nil || migratedContent != 2 {
		t.Fatalf("migrated content=%d err=%v", migratedContent, err)
	}
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM content_revisions cr JOIN sites s ON s.id = cr.site_id
		WHERE cr.content_id = ? AND s.code IN ('germany', 'italy')`, contentID).Scan(&migratedRevisions); err != nil || migratedRevisions != 2 {
		t.Fatalf("migrated revisions=%d err=%v", migratedRevisions, err)
	}
	var prefixedCanonicals int
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM content_locales cl JOIN sites s ON s.id = cl.site_id
		WHERE cl.content_id = ? AND s.code IN ('germany', 'italy') AND cl.canonical_url LIKE '%/' || cl.locale || '/%'`, contentID).Scan(&prefixedCanonicals); err != nil || prefixedCanonicals != 0 {
		t.Fatalf("legacy locale-prefixed canonicals=%d err=%v", prefixedCanonicals, err)
	}
}

func TestOpenMigratesExistingCatalogWithoutDataLoss(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	path := filepath.Join(t.TempDir(), "legacy.db")
	legacy, err := sql.Open("sqlite", "file:"+filepath.ToSlash(path))
	if err != nil {
		t.Fatal(err)
	}
	legacySchema := `
		CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
		CREATE TABLE sites (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, code TEXT NOT NULL UNIQUE, primary_domain TEXT NOT NULL DEFAULT '', market_code TEXT NOT NULL DEFAULT 'GLOBAL', status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
		CREATE TABLE languages (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE, name_zh TEXT NOT NULL, native_name TEXT NOT NULL, default_locale TEXT NOT NULL, direction TEXT NOT NULL DEFAULT 'ltr', enabled INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
		CREATE TABLE contents (id INTEGER PRIMARY KEY AUTOINCREMENT, content_type TEXT NOT NULL DEFAULT 'article', status TEXT NOT NULL DEFAULT 'draft', owner_id INTEGER, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT);
		CREATE TABLE content_locales (id INTEGER PRIMARY KEY AUTOINCREMENT, content_id INTEGER NOT NULL REFERENCES contents(id), site_id INTEGER NOT NULL REFERENCES sites(id), locale TEXT NOT NULL, title TEXT NOT NULL, slug TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '', body_html TEXT NOT NULL DEFAULT '', seo_title TEXT NOT NULL DEFAULT '', meta_description TEXT NOT NULL DEFAULT '', primary_keyword TEXT NOT NULL DEFAULT '', ai_state TEXT NOT NULL DEFAULT 'manual', published_at TEXT, updated_at TEXT NOT NULL, UNIQUE(site_id, locale, slug));
		INSERT INTO sites(name, code, created_at, updated_at) VALUES ('旧站点', 'legacy', '2025-01-01T00:00:00Z', '2025-01-01T00:00:00Z');
		INSERT INTO languages(code, name_zh, native_name, default_locale, enabled, created_at, updated_at) VALUES ('en', '英语', 'English', 'en', 1, '2025-01-01T00:00:00Z', '2025-01-01T00:00:00Z');
		INSERT INTO contents(content_type, status, created_at, updated_at) VALUES ('article', 'draft', '2025-01-01T00:00:00Z', '2025-01-01T00:00:00Z');
		INSERT INTO content_locales(content_id, site_id, locale, title, slug, updated_at) VALUES (1, 1, 'en', '旧内容', 'legacy-content', '2025-01-01T00:00:00Z');`
	if _, err = legacy.ExecContext(ctx, legacySchema); err != nil {
		t.Fatal(err)
	}
	_ = legacy.Close()

	db, err := Open(ctx, path)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	var title, createdAt string
	var version int
	if err = db.QueryRowContext(ctx, `SELECT title, version, created_at FROM content_locales WHERE slug = 'legacy-content'`).Scan(&title, &version, &createdAt); err != nil {
		t.Fatal(err)
	}
	if title != "旧内容" || version != 1 || createdAt != "2025-01-01T00:00:00Z" {
		t.Fatalf("migrated content title=%q version=%d created=%q", title, version, createdAt)
	}
	var migrated int
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM schema_migrations WHERE version = 1`).Scan(&migrated); err != nil || migrated != 1 {
		t.Fatalf("migration record=%d err=%v", migrated, err)
	}
	var localPort int
	if err = db.QueryRowContext(ctx, `SELECT local_port FROM sites WHERE code = 'legacy'`).Scan(&localPort); err != nil || localPort != 8081 {
		t.Fatalf("local preview port=%d err=%v", localPort, err)
	}
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM schema_migrations WHERE version = 3`).Scan(&migrated); err != nil || migrated != 1 {
		t.Fatalf("local port migration record=%d err=%v", migrated, err)
	}
	var coverColumn int
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM pragma_table_info('content_locales') WHERE name = 'cover_media_id'`).Scan(&coverColumn); err != nil || coverColumn != 1 {
		t.Fatalf("cover_media_id column=%d err=%v", coverColumn, err)
	}
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM schema_migrations WHERE version = 5`).Scan(&migrated); err != nil || migrated != 1 {
		t.Fatalf("content cover migration record=%d err=%v", migrated, err)
	}
}

func TestOpenMigratesLegacyThemeTableBeforeCreatingRuntimeIndex(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	path := filepath.Join(t.TempDir(), "legacy-theme.db")
	legacy, err := sql.Open("sqlite", "file:"+filepath.ToSlash(path))
	if err != nil {
		t.Fatal(err)
	}
	if _, err = legacy.ExecContext(ctx, `CREATE TABLE theme_packages (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		version TEXT NOT NULL,
		storage_name TEXT NOT NULL UNIQUE,
		sha256 TEXT NOT NULL,
		uploaded_by INTEGER NOT NULL,
		status TEXT NOT NULL DEFAULT 'validated',
		created_at TEXT NOT NULL,
		UNIQUE(name, version)
	)`); err != nil {
		t.Fatal(err)
	}
	_ = legacy.Close()

	db, err := Open(ctx, path)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	for _, column := range []string{"kind", "render_key"} {
		var count int
		if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM pragma_table_info('theme_packages') WHERE name = ?`, column).Scan(&count); err != nil || count != 1 {
			t.Fatalf("theme column %s count=%d err=%v", column, count, err)
		}
	}
	var indexCount int
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM sqlite_master WHERE type = 'index' AND name = 'idx_theme_packages_render_key'`).Scan(&indexCount); err != nil || indexCount != 1 {
		t.Fatalf("theme runtime index count=%d err=%v", indexCount, err)
	}
}

func TestOpenMigratesLegacyMediaTableBeforeCreatingAltIndex(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	path := filepath.Join(t.TempDir(), "legacy-media.db")
	legacy, err := sql.Open("sqlite", "file:"+filepath.ToSlash(path))
	if err != nil {
		t.Fatal(err)
	}
	if _, err = legacy.ExecContext(ctx, `CREATE TABLE media_files (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		storage_name TEXT NOT NULL UNIQUE,
		original_name TEXT NOT NULL,
		media_type TEXT NOT NULL,
		byte_size INTEGER NOT NULL,
		sha256 TEXT NOT NULL,
		width INTEGER NOT NULL DEFAULT 0,
		height INTEGER NOT NULL DEFAULT 0,
		uploaded_by INTEGER NOT NULL,
		created_at TEXT NOT NULL
	)`); err != nil {
		t.Fatal(err)
	}
	_ = legacy.Close()

	db, err := Open(ctx, path)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	for _, column := range []string{"alt_text", "version", "updated_at"} {
		var count int
		if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM pragma_table_info('media_files') WHERE name = ?`, column).Scan(&count); err != nil || count != 1 {
			t.Fatalf("media column %s count=%d err=%v", column, count, err)
		}
	}
	var indexCount int
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM sqlite_master WHERE type = 'index' AND name = 'idx_media_alt'`).Scan(&indexCount); err != nil || indexCount != 1 {
		t.Fatalf("media alt index count=%d err=%v", indexCount, err)
	}
}

func TestOpenMigratesContentCategoriesAndTagsToTaxonomy(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	path := filepath.Join(t.TempDir(), "taxonomy-v9.db")
	db, err := Open(ctx, path)
	if err != nil {
		t.Fatal(err)
	}
	now := "2026-08-27T04:00:00Z"
	var siteID int64
	var locale string
	if err = db.QueryRowContext(ctx, `SELECT s.id, sl.locale FROM sites s JOIN site_languages sl ON sl.site_id = s.id AND sl.enabled = 1 ORDER BY s.local_port LIMIT 1`).Scan(&siteID, &locale); err != nil {
		t.Fatal(err)
	}
	contentResult, err := db.ExecContext(ctx, `INSERT INTO contents(content_type, status, version, created_at, updated_at) VALUES ('article', 'archived', 7, ?, ?)`, now, now)
	if err != nil {
		t.Fatal(err)
	}
	contentID, _ := contentResult.LastInsertId()
	localeResult, err := db.ExecContext(ctx, `INSERT INTO content_locales(content_id, site_id, locale, status, title, slug, category, tags_json, body_html, version, created_at, updated_at)
		VALUES (?, ?, ?, 'archived', '历史物流指南', 'legacy-logistics-guide', '物流指南', '["欧洲专线","清关","欧洲专线"]', '<p>保留正文</p>', 5, ?, ?)`, contentID, siteID, locale, now, now)
	if err != nil {
		t.Fatal(err)
	}
	contentLocaleID, _ := localeResult.LastInsertId()
	if _, err = db.ExecContext(ctx, `DROP TABLE content_taxonomy_terms; DROP TABLE taxonomy_terms; DELETE FROM schema_migrations WHERE version = 10`); err != nil {
		t.Fatal(err)
	}
	if err = db.Close(); err != nil {
		t.Fatal(err)
	}

	db, err = Open(ctx, path)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	var status, body string
	var version int64
	if err = db.QueryRowContext(ctx, `SELECT status, body_html, version FROM content_locales WHERE id = ?`, contentLocaleID).Scan(&status, &body, &version); err != nil {
		t.Fatal(err)
	}
	if status != "archived" || body != "<p>保留正文</p>" || version != 5 {
		t.Fatalf("content changed during taxonomy migration: status=%q body=%q version=%d", status, body, version)
	}
	var termCount, linkCount int
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM taxonomy_terms WHERE site_id = ? AND locale = ?`, siteID, locale).Scan(&termCount); err != nil {
		t.Fatal(err)
	}
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM content_taxonomy_terms WHERE content_locale_id = ?`, contentLocaleID).Scan(&linkCount); err != nil {
		t.Fatal(err)
	}
	if termCount != 3 || linkCount != 3 {
		t.Fatalf("taxonomy migration terms=%d links=%d, want 3/3", termCount, linkCount)
	}
}
