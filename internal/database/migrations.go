package database

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"
)

type migration struct {
	version int
	apply   func(context.Context, *sql.Tx) error
}

var migrations = []migration{
	{version: 1, apply: migrateCatalogV1},
	{version: 2, apply: migrateSiteDomainsV2},
	{version: 3, apply: migrateLocalPreviewPortsV3},
	{version: 4, apply: migrateEditorialWorkflowV4},
	{version: 5, apply: migrateContentCoverV5},
	{version: 6, apply: migrateThemeRuntimeV6},
	{version: 7, apply: migrateIndependentLanguageSitesV7},
	{version: 8, apply: migrateMediaLibraryV8},
	{version: 9, apply: migrateIndependentCanonicalPathsV9},
	{version: 10, apply: migrateTaxonomyV10},
	{version: 11, apply: migrateLocalizationJobsV11},
	{version: 12, apply: migrateAIConfigurationV12},
	{version: 13, apply: migrateThemeEditorV13},
	{version: 14, apply: migrateSiteSEOV14},
	{version: 15, apply: migrateSitemapLookupV15},
	{version: 16, apply: migrateSiteSEODescriptionV16},
	{version: 17, apply: migrateAIDraftStatusV17},
	{version: 18, apply: migratePageFormsAndThemeAssetsV18},
	{version: 19, apply: migrateFormSubmitLabelV19},
	{version: 20, apply: migrateContactPageDefaultsV20},
}

func runMigrations(ctx context.Context, db *sql.DB) error {
	for _, item := range migrations {
		var applied int
		if err := db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = ?)`, item.version).Scan(&applied); err != nil {
			return fmt.Errorf("读取迁移版本 %d: %w", item.version, err)
		}
		if applied == 1 {
			continue
		}
		tx, err := db.BeginTx(ctx, nil)
		if err != nil {
			return fmt.Errorf("开始迁移 %d: %w", item.version, err)
		}
		if err = item.apply(ctx, tx); err == nil {
			_, err = tx.ExecContext(ctx, `INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)`, item.version, time.Now().UTC().Format(time.RFC3339))
		}
		if err != nil {
			_ = tx.Rollback()
			return fmt.Errorf("执行迁移 %d: %w", item.version, err)
		}
		if err = tx.Commit(); err != nil {
			return fmt.Errorf("提交迁移 %d: %w", item.version, err)
		}
	}
	return nil
}

func migrateCatalogV1(ctx context.Context, tx *sql.Tx) error {
	columns := map[string][]struct {
		name       string
		definition string
	}{
		"sites": {
			{"version", "INTEGER NOT NULL DEFAULT 1"},
		},
		"languages": {
			{"version", "INTEGER NOT NULL DEFAULT 1"},
		},
		"contents": {
			{"version", "INTEGER NOT NULL DEFAULT 1"},
			{"deleted_at", "TEXT"},
		},
		"content_locales": {
			{"status", "TEXT NOT NULL DEFAULT 'draft'"},
			{"h1", "TEXT NOT NULL DEFAULT ''"},
			{"secondary_keywords_json", "TEXT NOT NULL DEFAULT '[]'"},
			{"canonical_url", "TEXT NOT NULL DEFAULT ''"},
			{"robots_index", "INTEGER NOT NULL DEFAULT 1"},
			{"og_title", "TEXT NOT NULL DEFAULT ''"},
			{"og_description", "TEXT NOT NULL DEFAULT ''"},
			{"structured_data_json", "TEXT NOT NULL DEFAULT '{}'"},
			{"version", "INTEGER NOT NULL DEFAULT 1"},
			{"created_at", "TEXT NOT NULL DEFAULT ''"},
		},
	}
	for table, additions := range columns {
		existing, err := tableColumns(ctx, tx, table)
		if err != nil {
			return err
		}
		for _, column := range additions {
			if existing[column.name] {
				continue
			}
			if _, err = tx.ExecContext(ctx, `ALTER TABLE `+table+` ADD COLUMN `+column.name+` `+column.definition); err != nil {
				return fmt.Errorf("为 %s 添加字段 %s: %w", table, column.name, err)
			}
		}
	}

	statements := []string{
		`UPDATE content_locales SET created_at = updated_at WHERE created_at = ''`,
		`CREATE INDEX IF NOT EXISTS idx_languages_locale ON languages(default_locale)`,
		`CREATE INDEX IF NOT EXISTS idx_content_locales_updated ON content_locales(updated_at DESC, id DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_contents_active_updated ON contents(deleted_at, updated_at DESC)`,
		`CREATE TABLE IF NOT EXISTS content_revisions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			content_id INTEGER NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
			content_locale_id INTEGER REFERENCES content_locales(id) ON DELETE SET NULL,
			site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
			locale TEXT NOT NULL,
			version INTEGER NOT NULL,
			snapshot_json TEXT NOT NULL,
			action TEXT NOT NULL,
			actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
			created_at TEXT NOT NULL
		)`,
		`CREATE INDEX IF NOT EXISTS idx_content_revisions_lookup ON content_revisions(content_id, id DESC)`,
		`CREATE TABLE IF NOT EXISTS site_languages (
			site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
			language_id INTEGER NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
			locale TEXT NOT NULL,
			enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
			theme_package_id INTEGER REFERENCES theme_packages(id) ON DELETE SET NULL,
			version INTEGER NOT NULL DEFAULT 1,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL,
			PRIMARY KEY (site_id, language_id),
			UNIQUE(site_id, locale)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_site_languages_locale ON site_languages(site_id, locale, enabled)`,
	}
	for _, statement := range statements {
		if _, err := tx.ExecContext(ctx, statement); err != nil {
			return err
		}
	}
	return nil
}

func migrateSiteDomainsV2(ctx context.Context, tx *sql.Tx) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS site_domains (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
			hostname TEXT NOT NULL COLLATE NOCASE UNIQUE,
			kind TEXT NOT NULL DEFAULT 'alias' CHECK (kind IN ('primary', 'alias')),
			redirect_to_primary INTEGER NOT NULL DEFAULT 1 CHECK (redirect_to_primary IN (0, 1)),
			dns_status TEXT NOT NULL DEFAULT 'pending' CHECK (dns_status IN ('pending', 'resolved', 'failed')),
			resolved_addresses_json TEXT NOT NULL DEFAULT '[]',
			last_checked_at TEXT,
			version INTEGER NOT NULL DEFAULT 1,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE UNIQUE INDEX IF NOT EXISTS idx_site_domains_primary ON site_domains(site_id) WHERE kind = 'primary'`,
		`CREATE INDEX IF NOT EXISTS idx_site_domains_site ON site_domains(site_id, kind, id)`,
		`CREATE INDEX IF NOT EXISTS idx_site_domains_status ON site_domains(dns_status, updated_at)`,
		`INSERT OR IGNORE INTO site_domains(site_id, hostname, kind, redirect_to_primary, dns_status, version, created_at, updated_at)
		 SELECT id, lower(primary_domain), 'primary', 0, 'pending', 1, created_at, updated_at
		 FROM sites WHERE trim(primary_domain) <> ''`,
	}
	for _, statement := range statements {
		if _, err := tx.ExecContext(ctx, statement); err != nil {
			return err
		}
	}
	return nil
}

func migrateLocalPreviewPortsV3(ctx context.Context, tx *sql.Tx) error {
	columns, err := tableColumns(ctx, tx, "sites")
	if err != nil {
		return err
	}
	if !columns["local_port"] {
		if _, err = tx.ExecContext(ctx, `ALTER TABLE sites ADD COLUMN local_port INTEGER NOT NULL DEFAULT 0 CHECK (local_port BETWEEN 0 AND 65535)`); err != nil {
			return fmt.Errorf("为 sites 添加字段 local_port: %w", err)
		}
	}
	statements := []string{
		`UPDATE sites SET local_port = 8080 + id WHERE local_port = 0`,
		`CREATE UNIQUE INDEX IF NOT EXISTS idx_sites_local_port ON sites(local_port) WHERE local_port > 0`,
	}
	for _, statement := range statements {
		if _, err = tx.ExecContext(ctx, statement); err != nil {
			return err
		}
	}
	return nil
}

func migrateEditorialWorkflowV4(ctx context.Context, tx *sql.Tx) error {
	columns, err := tableColumns(ctx, tx, "content_locales")
	if err != nil {
		return err
	}
	additions := []struct {
		name       string
		definition string
	}{
		{"category", "TEXT NOT NULL DEFAULT ''"},
		{"tags_json", "TEXT NOT NULL DEFAULT '[]'"},
		{"template_key", "TEXT NOT NULL DEFAULT ''"},
		{"scheduled_at", "TEXT"},
	}
	for _, addition := range additions {
		if columns[addition.name] {
			continue
		}
		if _, err = tx.ExecContext(ctx, `ALTER TABLE content_locales ADD COLUMN `+addition.name+` `+addition.definition); err != nil {
			return fmt.Errorf("为 content_locales 添加字段 %s: %w", addition.name, err)
		}
	}

	statements := []string{
		`CREATE TABLE IF NOT EXISTS url_redirects (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
			locale TEXT NOT NULL,
			source_path TEXT NOT NULL,
			target_path TEXT NOT NULL DEFAULT '',
			status_code INTEGER NOT NULL CHECK (status_code IN (301, 302, 307, 308, 410)),
			enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
			hit_count INTEGER NOT NULL DEFAULT 0,
			version INTEGER NOT NULL DEFAULT 1,
			created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL,
			UNIQUE(site_id, locale, source_path)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_url_redirects_lookup ON url_redirects(site_id, locale, source_path, enabled)`,
		`CREATE TABLE IF NOT EXISTS publishing_releases (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
			locale TEXT NOT NULL,
			release_type TEXT NOT NULL CHECK (release_type IN ('content', 'template', 'full')),
			scope TEXT NOT NULL DEFAULT 'changed',
			status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed', 'rolled_back')),
			page_count INTEGER NOT NULL DEFAULT 0,
			checks_json TEXT NOT NULL DEFAULT '[]',
			created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
			created_at TEXT NOT NULL,
			started_at TEXT,
			finished_at TEXT
		)`,
		`CREATE INDEX IF NOT EXISTS idx_publishing_releases_created ON publishing_releases(created_at DESC, id DESC)`,
	}
	for _, statement := range statements {
		if _, err = tx.ExecContext(ctx, statement); err != nil {
			return err
		}
	}
	return nil
}

func migrateContentCoverV5(ctx context.Context, tx *sql.Tx) error {
	columns, err := tableColumns(ctx, tx, "content_locales")
	if err != nil {
		return err
	}
	if columns["cover_media_id"] {
		return nil
	}
	if _, err = tx.ExecContext(ctx, `ALTER TABLE content_locales ADD COLUMN cover_media_id INTEGER REFERENCES media_files(id) ON DELETE SET NULL`); err != nil {
		return fmt.Errorf("为 content_locales 添加字段 cover_media_id: %w", err)
	}
	return nil
}

func migrateThemeRuntimeV6(ctx context.Context, tx *sql.Tx) error {
	columns, err := tableColumns(ctx, tx, "theme_packages")
	if err != nil {
		return err
	}
	additions := []struct {
		name       string
		definition string
	}{
		{"kind", "TEXT NOT NULL DEFAULT 'archive' CHECK (kind IN ('builtin', 'archive'))"},
		{"render_key", "TEXT NOT NULL DEFAULT ''"},
	}
	for _, addition := range additions {
		if columns[addition.name] {
			continue
		}
		if _, err = tx.ExecContext(ctx, `ALTER TABLE theme_packages ADD COLUMN `+addition.name+` `+addition.definition); err != nil {
			return fmt.Errorf("为 theme_packages 添加字段 %s: %w", addition.name, err)
		}
	}
	if _, err = tx.ExecContext(ctx, `CREATE UNIQUE INDEX IF NOT EXISTS idx_theme_packages_render_key ON theme_packages(render_key) WHERE render_key <> ''`); err != nil {
		return fmt.Errorf("创建模板渲染键索引: %w", err)
	}
	themes := []struct {
		Name, Version, StorageName, RenderKey string
	}{
		{"Global Route Logistics", "1.0.0", "builtin-global-route", "global-route"},
		{"Atlas Commerce", "1.0.0", "builtin-atlas-commerce", "atlas-commerce"},
	}
	for _, theme := range themes {
		checksum := fmt.Sprintf("%x", sha256.Sum256([]byte(theme.RenderKey+"@"+theme.Version)))
		if _, err = tx.ExecContext(ctx, `INSERT OR IGNORE INTO theme_packages(name, version, storage_name, sha256, uploaded_by, status, kind, render_key, created_at)
			SELECT ?, ?, ?, ?, id, 'validated', 'builtin', ?, ? FROM users ORDER BY id LIMIT 1`, theme.Name, theme.Version, theme.StorageName, checksum, theme.RenderKey, time.Now().UTC().Format(time.RFC3339)); err != nil {
			return fmt.Errorf("迁移内置模板 %s: %w", theme.RenderKey, err)
		}
	}
	if _, err = tx.ExecContext(ctx, `UPDATE site_languages
		SET theme_package_id = (SELECT id FROM theme_packages WHERE render_key = 'global-route' AND status = 'validated' LIMIT 1),
		    updated_at = ?
		WHERE theme_package_id IS NULL
		  AND EXISTS(SELECT 1 FROM theme_packages WHERE render_key = 'global-route' AND status = 'validated')`, time.Now().UTC().Format(time.RFC3339)); err != nil {
		return fmt.Errorf("迁移默认模板绑定: %w", err)
	}
	return nil
}

// migrateThemeEditorV13 stores editable template sources independently from
// the uploaded ZIP. Requests never address a server path: callers can only use
// a file_key that already belongs to a registered theme package. Each accepted
// save is copied to an append-only revision row before it can be published by a
// later atomic theme release.
func migrateThemeEditorV13(ctx context.Context, tx *sql.Tx) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS theme_files (
			theme_package_id INTEGER NOT NULL REFERENCES theme_packages(id) ON DELETE CASCADE,
			file_key TEXT NOT NULL CHECK (file_key IN ('header', 'footer', 'home', 'category', 'content', 'page', 'search', 'not_found')),
			label TEXT NOT NULL,
			filename TEXT NOT NULL,
			page_group TEXT NOT NULL CHECK (page_group IN ('layout', 'page', 'system')),
			origin TEXT NOT NULL DEFAULT 'starter' CHECK (origin IN ('builtin', 'archive', 'starter')),
			content TEXT NOT NULL,
			version INTEGER NOT NULL DEFAULT 1,
			updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL,
			PRIMARY KEY (theme_package_id, file_key),
			UNIQUE (theme_package_id, filename)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_theme_files_package_group ON theme_files(theme_package_id, page_group, file_key)`,
		`CREATE TABLE IF NOT EXISTS theme_file_revisions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			theme_package_id INTEGER NOT NULL REFERENCES theme_packages(id) ON DELETE CASCADE,
			file_key TEXT NOT NULL,
			version INTEGER NOT NULL,
			content TEXT NOT NULL,
			change_note TEXT NOT NULL DEFAULT '',
			actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
			created_at TEXT NOT NULL,
			UNIQUE (theme_package_id, file_key, version)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_theme_file_revisions_lookup ON theme_file_revisions(theme_package_id, file_key, version DESC)`,
	}
	for _, statement := range statements {
		if _, err := tx.ExecContext(ctx, statement); err != nil {
			return fmt.Errorf("创建模板编辑器数据结构: %w", err)
		}
	}
	return seedThemeFilesV13(ctx, tx)
}

// migrateSiteSEOV14 stores site-wide defaults independently from content SEO.
// The favicon points at a verified media row instead of accepting an arbitrary
// URL, so public pages can safely emit it from every renderer.
func migrateSiteSEOV14(ctx context.Context, tx *sql.Tx) error {
	columns, err := tableColumns(ctx, tx, "sites")
	if err != nil {
		return err
	}
	additions := []struct {
		name       string
		definition string
	}{
		{"seo_title", "TEXT NOT NULL DEFAULT ''"},
		{"favicon_media_id", "INTEGER REFERENCES media_files(id) ON DELETE SET NULL"},
	}
	for _, addition := range additions {
		if columns[addition.name] {
			continue
		}
		if _, err = tx.ExecContext(ctx, `ALTER TABLE sites ADD COLUMN `+addition.name+` `+addition.definition); err != nil {
			return fmt.Errorf("为 sites 添加字段 %s: %w", addition.name, err)
		}
	}
	return nil
}

// migrateSitemapLookupV15 adds covering lookup indexes for the public sitemap
// and robots endpoints. The statements are intentionally idempotent so that
// a partially applied migration can be safely retried on the next startup.
func migrateSitemapLookupV15(ctx context.Context, tx *sql.Tx) error {
	statements := []string{
		`CREATE INDEX IF NOT EXISTS idx_content_locales_sitemap ON content_locales(site_id, locale, status, robots_index, scheduled_at)`,
		`CREATE INDEX IF NOT EXISTS idx_site_languages_sitemap ON site_languages(site_id, locale, enabled, theme_package_id)`,
		`CREATE INDEX IF NOT EXISTS idx_theme_packages_renderable ON theme_packages(status, render_key)`,
	}
	for _, statement := range statements {
		if _, err := tx.ExecContext(ctx, statement); err != nil {
			return err
		}
	}
	return nil
}

// migrateSiteSEODescriptionV16 adds the site-wide fallback description used
// for homepage search snippets and Open Graph previews. Content locales retain
// their own description fields and always take precedence on content routes.
func migrateSiteSEODescriptionV16(ctx context.Context, tx *sql.Tx) error {
	columns, err := tableColumns(ctx, tx, "sites")
	if err != nil {
		return err
	}
	if columns["seo_description"] {
		return nil
	}
	if _, err = tx.ExecContext(ctx, `ALTER TABLE sites ADD COLUMN seo_description TEXT NOT NULL DEFAULT ''`); err != nil {
		return fmt.Errorf("为 sites 添加字段 seo_description: %w", err)
	}
	return nil
}

// migrateAIDraftStatusV17 aligns AI-generated language versions with the
// editorial workflow. Older builds stored them as review items immediately;
// they are now explicit drafts so an editor can inspect and revise them before
// submitting them for review. Only records marked as AI-pending are changed.
func migrateAIDraftStatusV17(ctx context.Context, tx *sql.Tx) error {
	_, err := tx.ExecContext(ctx, `UPDATE content_locales SET status = 'draft', updated_at = ? WHERE status = 'review' AND ai_state = 'pending'`, time.Now().UTC().Format(time.RFC3339Nano))
	return err
}

// migratePageFormsAndThemeAssetsV18 separates page presentation, public
// enquiry forms and editable theme resources from rich-text content.  This
// keeps user supplied HTML passive while still letting a site operator build a
// real contact page and tune a template's CSS / reviewed JavaScript.
func migratePageFormsAndThemeAssetsV18(ctx context.Context, tx *sql.Tx) error {
	columns, err := tableColumns(ctx, tx, "content_locales")
	if err != nil {
		return err
	}
	for _, addition := range []struct{ name, definition string }{
		{"page_layout", "TEXT NOT NULL DEFAULT 'standard' CHECK (page_layout IN ('standard', 'contact', 'landing', 'custom'))"},
		{"index_policy", "TEXT NOT NULL DEFAULT 'noindex' CHECK (index_policy IN ('index', 'noindex'))"},
	} {
		if columns[addition.name] {
			continue
		}
		if _, err = tx.ExecContext(ctx, `ALTER TABLE content_locales ADD COLUMN `+addition.name+` `+addition.definition); err != nil {
			return fmt.Errorf("为 content_locales 添加字段 %s: %w", addition.name, err)
		}
	}
	statements := []string{
		`UPDATE content_locales SET page_layout = 'contact', index_policy = 'noindex'
		 WHERE content_id IN (SELECT id FROM contents WHERE content_type = 'page')
		   AND (lower(slug) IN ('contact', 'contact-us', 'contact-us/') OR lower(title) LIKE '%contact%')`,
		`UPDATE content_locales SET index_policy = 'index'
		 WHERE content_id IN (SELECT id FROM contents WHERE content_type <> 'page')`,
		`CREATE INDEX IF NOT EXISTS idx_content_locales_page_policy ON content_locales(site_id, locale, status, index_policy, page_layout)`,
		`CREATE TABLE IF NOT EXISTS forms (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
			locale TEXT NOT NULL,
			form_key TEXT NOT NULL,
			name TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
			success_message TEXT NOT NULL DEFAULT '',
			notify_enabled INTEGER NOT NULL DEFAULT 1 CHECK (notify_enabled IN (0, 1)),
			version INTEGER NOT NULL DEFAULT 1,
			created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL,
			UNIQUE(site_id, locale, form_key)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_forms_scope ON forms(site_id, locale, status)`,
		`CREATE TABLE IF NOT EXISTS form_fields (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
			field_key TEXT NOT NULL,
			field_type TEXT NOT NULL CHECK (field_type IN ('text', 'email', 'tel', 'country', 'select', 'textarea', 'checkbox')),
			label TEXT NOT NULL,
			placeholder TEXT NOT NULL DEFAULT '',
			help_text TEXT NOT NULL DEFAULT '',
			options_json TEXT NOT NULL DEFAULT '[]',
			required INTEGER NOT NULL DEFAULT 0 CHECK (required IN (0, 1)),
			sort_order INTEGER NOT NULL DEFAULT 0,
			validation_json TEXT NOT NULL DEFAULT '{}',
			UNIQUE(form_id, field_key)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_form_fields_order ON form_fields(form_id, sort_order, id)`,
		`CREATE TABLE IF NOT EXISTS page_forms (
			content_locale_id INTEGER PRIMARY KEY REFERENCES content_locales(id) ON DELETE CASCADE,
			form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE RESTRICT,
			version INTEGER NOT NULL DEFAULT 1,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS form_submissions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE RESTRICT,
			content_locale_id INTEGER REFERENCES content_locales(id) ON DELETE SET NULL,
			site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
			locale TEXT NOT NULL,
			source_path TEXT NOT NULL,
			values_encrypted BLOB NOT NULL,
			status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'processing', 'contacted', 'invalid', 'closed')),
			dedupe_hash TEXT NOT NULL DEFAULT '',
			ip_hash TEXT NOT NULL DEFAULT '',
			user_agent_hash TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE INDEX IF NOT EXISTS idx_form_submissions_scope ON form_submissions(site_id, locale, status, created_at DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_form_submissions_dedupe ON form_submissions(form_id, dedupe_hash, created_at DESC)`,
		`CREATE TABLE IF NOT EXISTS theme_assets (
			theme_package_id INTEGER NOT NULL REFERENCES theme_packages(id) ON DELETE CASCADE,
			asset_key TEXT NOT NULL,
			asset_type TEXT NOT NULL CHECK (asset_type IN ('css', 'js')),
			label TEXT NOT NULL,
			filename TEXT NOT NULL,
			content TEXT NOT NULL,
			version INTEGER NOT NULL DEFAULT 1,
			updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL,
			PRIMARY KEY(theme_package_id, asset_key),
			UNIQUE(theme_package_id, filename)
		)`,
		`CREATE TABLE IF NOT EXISTS theme_asset_revisions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			theme_package_id INTEGER NOT NULL REFERENCES theme_packages(id) ON DELETE CASCADE,
			asset_key TEXT NOT NULL,
			version INTEGER NOT NULL,
			content TEXT NOT NULL,
			change_note TEXT NOT NULL DEFAULT '',
			actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
			created_at TEXT NOT NULL,
			UNIQUE(theme_package_id, asset_key, version)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_theme_asset_revisions ON theme_asset_revisions(theme_package_id, asset_key, version DESC)`,
	}
	for _, statement := range statements {
		if _, err = tx.ExecContext(ctx, statement); err != nil {
			return err
		}
	}
	return seedThemeAssetsV18(ctx, tx)
}

// migrateFormSubmitLabelV19 adds the visible submit-button copy to each form.
// It is kept with the form definition so every site/Locale can localize the
// call to action without changing the shared public template.
func migrateFormSubmitLabelV19(ctx context.Context, tx *sql.Tx) error {
	columns, err := tableColumns(ctx, tx, "forms")
	if err != nil {
		return err
	}
	if columns["submit_label"] {
		return nil
	}
	_, err = tx.ExecContext(ctx, `ALTER TABLE forms ADD COLUMN submit_label TEXT NOT NULL DEFAULT '提交咨询'`)
	return err
}

// migrateContactPageDefaultsV20 backfills the standard form for contact pages
// created before contact templates became self-contained. New pages use the
// same provisioning helper in catalog.CreateContent; this migration keeps old
// installations consistent without requiring an editor to open and resave a
// page first.
func migrateContactPageDefaultsV20(ctx context.Context, tx *sql.Tx) error {
	type page struct {
		ID, SiteID    int64
		Locale, Title string
	}
	rows, err := tx.QueryContext(ctx, `SELECT cl.id, cl.site_id, cl.locale, cl.title FROM content_locales cl JOIN contents c ON c.id = cl.content_id LEFT JOIN page_forms pf ON pf.content_locale_id = cl.id WHERE c.content_type = 'page' AND cl.page_layout = 'contact' AND pf.content_locale_id IS NULL`)
	if err != nil {
		return err
	}
	pages := make([]page, 0)
	for rows.Next() {
		var item page
		if err = rows.Scan(&item.ID, &item.SiteID, &item.Locale, &item.Title); err != nil {
			rows.Close()
			return err
		}
		pages = append(pages, item)
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		return err
	}
	rows.Close()
	now := time.Now().UTC().Format(time.RFC3339Nano)
	for _, item := range pages {
		english := strings.HasPrefix(strings.ToLower(strings.TrimSpace(item.Locale)), "en")
		name, submit, success := "姓名 / 联系人", "提交咨询", "感谢您的咨询，我们会尽快回复。"
		if english {
			name, submit, success = "Name", "Send enquiry", "Thank you. We will get back to you shortly."
		}
		key := fmt.Sprintf("contact-enquiry-%d", item.ID)
		result, execErr := tx.ExecContext(ctx, `INSERT INTO forms(site_id, locale, form_key, name, submit_label, status, success_message, notify_enabled, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', ?, 1, 1, ?, ?)`, item.SiteID, item.Locale, key, strings.TrimSpace(item.Title)+" · 询盘表单", submit, success, now, now)
		if execErr != nil {
			return execErr
		}
		formID, execErr := result.LastInsertId()
		if execErr != nil {
			return execErr
		}
		fields := []struct {
			key, typ, label, placeholder string
			required                     int
		}{
			{"name", "text", name, "", 1},
			{"email", "email", map[bool]string{true: "Email", false: "邮箱"}[english], "name@example.com", 1},
			{"phone", "tel", map[bool]string{true: "Phone", false: "联系电话"}[english], "+49 30 123456", 0},
			{"message", "textarea", map[bool]string{true: "Message", false: "需求说明"}[english], "", 1},
			{"consent", "checkbox", map[bool]string{true: "I agree to the processing of this enquiry", false: "我同意使用以上信息处理本次咨询"}[english], "", 1},
		}
		for sort, field := range fields {
			if _, execErr = tx.ExecContext(ctx, `INSERT INTO form_fields(form_id, field_key, field_type, label, placeholder, help_text, options_json, required, sort_order, validation_json) VALUES (?, ?, ?, ?, ?, '', '[]', ?, ?, '{}')`, formID, field.key, field.typ, field.label, field.placeholder, field.required, sort); execErr != nil {
				return execErr
			}
		}
		if _, execErr = tx.ExecContext(ctx, `INSERT INTO page_forms(content_locale_id, form_id, version, created_at, updated_at) VALUES (?, ?, 1, ?, ?)`, item.ID, formID, now, now); execErr != nil {
			return execErr
		}
	}
	return nil
}

// migrateIndependentLanguageSitesV7 converts the original single-site,
// locale-prefixed installation into six independent sites. Content, revision
// history, publishing records, template bindings and scoped access all keep
// their existing IDs and are only reassigned to the matching language site.
//
// Fresh installations reach this migration before seed data exists, so the
// function intentionally becomes a no-op there; seed() creates the same six
// site topology afterwards.
func migrateIndependentLanguageSitesV7(ctx context.Context, tx *sql.Tx) error {
	var globalID int64
	if err := tx.QueryRowContext(ctx, `SELECT id FROM sites WHERE code = 'global'`).Scan(&globalID); errors.Is(err, sql.ErrNoRows) {
		return nil
	} else if err != nil {
		return fmt.Errorf("读取原多语言站点: %w", err)
	}

	var sourceBindings int
	if err := tx.QueryRowContext(ctx, `SELECT COUNT(*) FROM site_languages WHERE site_id = ? AND locale IN ('en', 'de-DE', 'fr-FR', 'es-ES', 'it-IT', 'nl-NL')`, globalID).Scan(&sourceBindings); err != nil {
		return fmt.Errorf("读取原站点语言绑定: %w", err)
	}
	if sourceBindings < 2 {
		return nil
	}

	type languageSite struct {
		Name, Code, Market, LanguageCode, Locale string
		Port                                     int
	}
	sites := []languageSite{
		{Name: "Global Route Deutschland", Code: "germany", Market: "DE", LanguageCode: "de", Locale: "de-DE", Port: 8082},
		{Name: "Global Route France", Code: "france", Market: "FR", LanguageCode: "fr", Locale: "fr-FR", Port: 8083},
		{Name: "Global Route España", Code: "spain", Market: "ES", LanguageCode: "es", Locale: "es-ES", Port: 8084},
		{Name: "Global Route Italia", Code: "italy", Market: "IT", LanguageCode: "it", Locale: "it-IT", Port: 8085},
		{Name: "Global Route Nederland", Code: "netherlands", Market: "NL", LanguageCode: "nl", Locale: "nl-NL", Port: 8086},
	}
	now := time.Now().UTC().Format(time.RFC3339)
	if _, err := tx.ExecContext(ctx, `UPDATE sites SET name = 'Global Route English', local_port = 8081, market_code = 'GLOBAL', version = version + 1, updated_at = ? WHERE id = ?`, now, globalID); err != nil {
		return fmt.Errorf("升级英语独立站点: %w", err)
	}

	for _, target := range sites {
		if _, err := tx.ExecContext(ctx, `INSERT OR IGNORE INTO sites(name, code, primary_domain, local_port, market_code, status, version, created_at, updated_at)
			VALUES (?, ?, '', ?, ?, 'active', 1, ?, ?)`, target.Name, target.Code, target.Port, target.Market, now, now); err != nil {
			return fmt.Errorf("创建独立语言站点 %s: %w", target.Code, err)
		}
		var targetID int64
		if err := tx.QueryRowContext(ctx, `SELECT id FROM sites WHERE code = ?`, target.Code).Scan(&targetID); err != nil {
			return fmt.Errorf("读取独立语言站点 %s: %w", target.Code, err)
		}

		if _, err := tx.ExecContext(ctx, `INSERT OR IGNORE INTO site_languages(site_id, language_id, locale, enabled, theme_package_id, version, created_at, updated_at)
			SELECT ?, l.id, ?, 1,
			       COALESCE((SELECT theme_package_id FROM site_languages WHERE site_id = ? AND locale = ?),
			                (SELECT id FROM theme_packages WHERE render_key = 'global-route' AND status = 'validated' LIMIT 1)),
			       1, ?, ?
			FROM languages l WHERE l.code = ?`, targetID, target.Locale, globalID, target.Locale, now, now, target.LanguageCode); err != nil {
			return fmt.Errorf("迁移站点 %s 的语言模板绑定: %w", target.Code, err)
		}

		updates := []struct {
			table string
			name  string
		}{
			{table: "content_locales", name: "内容本地化记录"},
			{table: "content_revisions", name: "内容修订记录"},
			{table: "url_redirects", name: "URL 重定向"},
			{table: "publishing_releases", name: "发布记录"},
		}
		for _, update := range updates {
			if _, err := tx.ExecContext(ctx, `UPDATE `+update.table+` SET site_id = ? WHERE site_id = ? AND locale = ?`, targetID, globalID, target.Locale); err != nil {
				return fmt.Errorf("迁移 %s 到 %s: %w", update.name, target.Code, err)
			}
		}

		// A site-wide scope on the old multilingual site represented access to
		// every language. Duplicate it to the new site before narrowing the old
		// site to English. Locale-specific scopes move to their destination.
		if _, err := tx.ExecContext(ctx, `INSERT OR IGNORE INTO user_access_scopes(user_id, site_id, locale, created_at)
			SELECT user_id, ?, '*', created_at FROM user_access_scopes WHERE site_id = ? AND locale = '*'`, targetID, globalID); err != nil {
			return fmt.Errorf("复制站点 %s 的用户访问范围: %w", target.Code, err)
		}
		if _, err := tx.ExecContext(ctx, `INSERT OR IGNORE INTO user_access_scopes(user_id, site_id, locale, created_at)
			SELECT user_id, ?, locale, created_at FROM user_access_scopes WHERE site_id = ? AND locale = ?`, targetID, globalID, target.Locale); err != nil {
			return fmt.Errorf("迁移站点 %s 的语言访问范围: %w", target.Code, err)
		}
		if _, err := tx.ExecContext(ctx, `DELETE FROM user_access_scopes WHERE site_id = ? AND locale = ?`, globalID, target.Locale); err != nil {
			return fmt.Errorf("清理原站点语言访问范围 %s: %w", target.Locale, err)
		}
	}

	if _, err := tx.ExecContext(ctx, `DELETE FROM site_languages WHERE site_id = ? AND locale <> 'en'`, globalID); err != nil {
		return fmt.Errorf("收敛英语站语言绑定: %w", err)
	}
	return nil
}

// migrateMediaLibraryV8 turns the upload-only media storage into a manageable
// CMS library. The immutable public URL still uses the content checksum; the
// mutable metadata is deliberately kept outside that cache identity.
func migrateMediaLibraryV8(ctx context.Context, tx *sql.Tx) error {
	columns, err := tableColumns(ctx, tx, "media_files")
	if err != nil {
		return err
	}
	additions := []struct {
		name       string
		definition string
	}{
		{"alt_text", "TEXT NOT NULL DEFAULT ''"},
		{"version", "INTEGER NOT NULL DEFAULT 1"},
		{"updated_at", "TEXT NOT NULL DEFAULT ''"},
	}
	for _, addition := range additions {
		if columns[addition.name] {
			continue
		}
		if _, err = tx.ExecContext(ctx, `ALTER TABLE media_files ADD COLUMN `+addition.name+` `+addition.definition); err != nil {
			return fmt.Errorf("为 media_files 添加字段 %s: %w", addition.name, err)
		}
	}
	statements := []string{
		`UPDATE media_files SET updated_at = created_at WHERE updated_at = ''`,
		`CREATE INDEX IF NOT EXISTS idx_media_created ON media_files(created_at DESC, id DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_media_alt ON media_files(alt_text)`,
	}
	for _, statement := range statements {
		if _, err = tx.ExecContext(ctx, statement); err != nil {
			return err
		}
	}
	return nil
}

// migrateIndependentCanonicalPathsV9 aligns legacy canonical URLs with the
// independent-domain topology introduced by V7. Only the six known migrated
// sites are touched, and only when the path begins with that row's exact
// locale segment. Content, publication state and all other SEO fields remain
// unchanged.
func migrateIndependentCanonicalPathsV9(ctx context.Context, tx *sql.Tx) error {
	rows, err := tx.QueryContext(ctx, `SELECT cl.id, cl.locale, cl.canonical_url
		FROM content_locales cl JOIN sites s ON s.id = cl.site_id
		WHERE trim(cl.canonical_url) <> '' AND s.code IN ('global', 'germany', 'france', 'spain', 'italy', 'netherlands')`)
	if err != nil {
		return fmt.Errorf("读取独立站 Canonical: %w", err)
	}
	type canonicalUpdate struct {
		id    int64
		value string
	}
	var updates []canonicalUpdate
	for rows.Next() {
		var id int64
		var locale, current string
		if err = rows.Scan(&id, &locale, &current); err != nil {
			rows.Close()
			return err
		}
		parsed, parseErr := url.Parse(strings.TrimSpace(current))
		if parseErr != nil || parsed.Host == "" || (parsed.Scheme != "http" && parsed.Scheme != "https") {
			continue
		}
		prefix := "/" + strings.Trim(strings.TrimSpace(locale), "/")
		if parsed.Path == prefix {
			parsed.Path = "/"
		} else if strings.HasPrefix(parsed.Path, prefix+"/") {
			parsed.Path = strings.TrimPrefix(parsed.Path, prefix)
		} else {
			continue
		}
		parsed.RawPath = ""
		updates = append(updates, canonicalUpdate{id: id, value: parsed.String()})
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		return err
	}
	rows.Close()
	for _, update := range updates {
		if _, err = tx.ExecContext(ctx, `UPDATE content_locales SET canonical_url = ? WHERE id = ?`, update.value, update.id); err != nil {
			return fmt.Errorf("更新独立站 Canonical %d: %w", update.id, err)
		}
	}
	return nil
}

func migrateTaxonomyV10(ctx context.Context, tx *sql.Tx) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS taxonomy_terms (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
			locale TEXT NOT NULL,
			kind TEXT NOT NULL CHECK (kind IN ('category', 'tag')),
			name TEXT NOT NULL COLLATE NOCASE,
			slug TEXT NOT NULL,
			parent_id INTEGER REFERENCES taxonomy_terms(id) ON DELETE SET NULL,
			status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
			version INTEGER NOT NULL DEFAULT 1,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL,
			UNIQUE(site_id, locale, kind, name),
			UNIQUE(site_id, locale, kind, slug)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_taxonomy_scope ON taxonomy_terms(site_id, locale, kind, status, name)`,
		`CREATE TABLE IF NOT EXISTS content_taxonomy_terms (
			content_locale_id INTEGER NOT NULL REFERENCES content_locales(id) ON DELETE CASCADE,
			term_id INTEGER NOT NULL REFERENCES taxonomy_terms(id) ON DELETE CASCADE,
			position INTEGER NOT NULL DEFAULT 0,
			PRIMARY KEY (content_locale_id, term_id)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_content_taxonomy_term ON content_taxonomy_terms(term_id, content_locale_id)`,
	}
	for _, statement := range statements {
		if _, err := tx.ExecContext(ctx, statement); err != nil {
			return err
		}
	}
	rows, err := tx.QueryContext(ctx, `SELECT id, site_id, locale, category, tags_json FROM content_locales`)
	if err != nil {
		return err
	}
	type existingTaxonomy struct {
		id, siteID       int64
		locale, category string
		tags             []string
	}
	var existing []existingTaxonomy
	for rows.Next() {
		var item existingTaxonomy
		var tagsJSON string
		if err = rows.Scan(&item.id, &item.siteID, &item.locale, &item.category, &tagsJSON); err != nil {
			rows.Close()
			return err
		}
		_ = json.Unmarshal([]byte(tagsJSON), &item.tags)
		existing = append(existing, item)
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		return err
	}
	rows.Close()
	for _, item := range existing {
		if err = migrateTaxonomyLinks(ctx, tx, item.id, item.siteID, item.locale, item.category, item.tags); err != nil {
			return err
		}
	}
	return nil
}

func migrateLocalizationJobsV11(ctx context.Context, tx *sql.Tx) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS localization_jobs (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			content_id INTEGER NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
			source_site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
			source_locale TEXT NOT NULL,
			source_title TEXT NOT NULL,
			requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
			status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'partial', 'failed')),
			scope TEXT NOT NULL DEFAULT 'full',
			target_count INTEGER NOT NULL DEFAULT 0,
			created_count INTEGER NOT NULL DEFAULT 0,
			skipped_count INTEGER NOT NULL DEFAULT 0,
			failed_count INTEGER NOT NULL DEFAULT 0,
			result_json TEXT NOT NULL DEFAULT '[]',
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE INDEX IF NOT EXISTS idx_localization_jobs_source ON localization_jobs(source_site_id, created_at DESC, id DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_localization_jobs_content ON localization_jobs(content_id, created_at DESC, id DESC)`,
	}
	for _, statement := range statements {
		if _, err := tx.ExecContext(ctx, statement); err != nil {
			return err
		}
	}
	return nil
}

// migrateAIConfigurationV12 adds encrypted, database-backed AI provider
// settings. Secrets are deliberately stored as opaque ciphertext; the API
// only exposes whether a key exists and its final four characters.
func migrateAIConfigurationV12(ctx context.Context, tx *sql.Tx) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS ai_providers (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			provider_type TEXT NOT NULL DEFAULT 'openai_compatible' CHECK (provider_type IN ('openai_compatible')),
			base_url TEXT NOT NULL,
			api_key_encrypted BLOB,
			api_key_last_four TEXT NOT NULL DEFAULT '',
			default_model TEXT NOT NULL,
			enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
			timeout_seconds INTEGER NOT NULL DEFAULT 120 CHECK (timeout_seconds BETWEEN 1 AND 120),
			last_test_status TEXT NOT NULL DEFAULT 'untested' CHECK (last_test_status IN ('untested', 'testing', 'online', 'offline')),
			last_test_message TEXT NOT NULL DEFAULT '',
			last_tested_at TEXT,
			version INTEGER NOT NULL DEFAULT 1,
			created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE INDEX IF NOT EXISTS idx_ai_providers_enabled ON ai_providers(enabled, updated_at DESC)`,
		`CREATE TABLE IF NOT EXISTS ai_feature_routes (
			feature_key TEXT PRIMARY KEY CHECK (feature_key IN ('seo', 'localization')),
			primary_provider_id INTEGER REFERENCES ai_providers(id) ON DELETE SET NULL,
			fallback_provider_id INTEGER REFERENCES ai_providers(id) ON DELETE SET NULL,
			model_override TEXT NOT NULL DEFAULT '',
			fallback_model_override TEXT NOT NULL DEFAULT '',
			max_retries INTEGER NOT NULL DEFAULT 1 CHECK (max_retries BETWEEN 0 AND 3),
			version INTEGER NOT NULL DEFAULT 1,
			updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
			updated_at TEXT NOT NULL
		)`,
	}
	for _, statement := range statements {
		if _, err := tx.ExecContext(ctx, statement); err != nil {
			return err
		}
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	for _, key := range []string{"seo", "localization"} {
		if _, err := tx.ExecContext(ctx, `INSERT OR IGNORE INTO ai_feature_routes(feature_key, updated_at) VALUES (?, ?)`, key, now); err != nil {
			return err
		}
	}
	return nil
}

func migrateTaxonomyLinks(ctx context.Context, tx *sql.Tx, contentLocaleID, siteID int64, locale, category string, tags []string) error {
	now := time.Now().UTC().Format(time.RFC3339Nano)
	position := 0
	items := []struct{ kind, name string }{}
	if name := strings.TrimSpace(category); name != "" {
		items = append(items, struct{ kind, name string }{"category", name})
	}
	for _, tag := range tags {
		if name := strings.TrimSpace(tag); name != "" {
			items = append(items, struct{ kind, name string }{"tag", name})
		}
	}
	for _, item := range items {
		digest := sha256.Sum256([]byte(fmt.Sprintf("%d|%s|%s|%s", siteID, locale, item.kind, strings.ToLower(item.name))))
		slug := item.kind + "-" + fmt.Sprintf("%x", digest[:8])
		if _, err := tx.ExecContext(ctx, `INSERT OR IGNORE INTO taxonomy_terms(site_id, locale, kind, name, slug, status, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', 1, ?, ?)`, siteID, locale, item.kind, item.name, slug, now, now); err != nil {
			return err
		}
		if _, err := tx.ExecContext(ctx, `INSERT OR IGNORE INTO content_taxonomy_terms(content_locale_id, term_id, position)
			SELECT ?, id, ? FROM taxonomy_terms WHERE site_id = ? AND locale = ? AND kind = ? AND name = ?`, contentLocaleID, position, siteID, locale, item.kind, item.name); err != nil {
			return err
		}
		position++
	}
	return nil
}

func tableColumns(ctx context.Context, tx *sql.Tx, table string) (map[string]bool, error) {
	rows, err := tx.QueryContext(ctx, `PRAGMA table_info(`+table+`)`)
	if err != nil {
		return nil, fmt.Errorf("读取 %s 表结构: %w", table, err)
	}
	defer rows.Close()
	result := make(map[string]bool)
	for rows.Next() {
		var cid, notNull, primaryKey int
		var name, columnType string
		var defaultValue any
		if err = rows.Scan(&cid, &name, &columnType, &notNull, &defaultValue, &primaryKey); err != nil {
			return nil, err
		}
		result[name] = true
	}
	return result, rows.Err()
}
