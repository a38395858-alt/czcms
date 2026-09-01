package database

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"errors"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	_ "modernc.org/sqlite"
)

const schema = `
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    primary_domain TEXT NOT NULL DEFAULT '',
    local_port INTEGER NOT NULL DEFAULT 0 CHECK (local_port BETWEEN 0 AND 65535),
    market_code TEXT NOT NULL DEFAULT 'GLOBAL',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'disabled')),
    seo_title TEXT NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    favicon_media_id INTEGER REFERENCES media_files(id) ON DELETE SET NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_domains (
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
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_domains_primary ON site_domains(site_id) WHERE kind = 'primary';
CREATE INDEX IF NOT EXISTS idx_site_domains_site ON site_domains(site_id, kind, id);
CREATE INDEX IF NOT EXISTS idx_site_domains_status ON site_domains(dns_status, updated_at);

CREATE TABLE IF NOT EXISTS languages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name_zh TEXT NOT NULL,
    native_name TEXT NOT NULL,
    default_locale TEXT NOT NULL,
    direction TEXT NOT NULL DEFAULT 'ltr' CHECK (direction IN ('ltr', 'rtl')),
    enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0, 1)),
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_languages_locale ON languages(default_locale);

CREATE TABLE IF NOT EXISTS contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_type TEXT NOT NULL DEFAULT 'article',
    status TEXT NOT NULL DEFAULT 'draft',
    owner_id INTEGER,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS content_locales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id INTEGER NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    locale TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'needs_update', 'archived')),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    body_html TEXT NOT NULL DEFAULT '',
    h1 TEXT NOT NULL DEFAULT '',
    seo_title TEXT NOT NULL DEFAULT '',
    meta_description TEXT NOT NULL DEFAULT '',
    primary_keyword TEXT NOT NULL DEFAULT '',
    secondary_keywords_json TEXT NOT NULL DEFAULT '[]',
    canonical_url TEXT NOT NULL DEFAULT '',
    robots_index INTEGER NOT NULL DEFAULT 1 CHECK (robots_index IN (0, 1)),
    og_title TEXT NOT NULL DEFAULT '',
    og_description TEXT NOT NULL DEFAULT '',
    structured_data_json TEXT NOT NULL DEFAULT '{}',
    ai_state TEXT NOT NULL DEFAULT 'manual',
    cover_media_id INTEGER REFERENCES media_files(id) ON DELETE SET NULL,
    published_at TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(site_id, locale, slug)
);

CREATE INDEX IF NOT EXISTS idx_content_locales_content ON content_locales(content_id);
CREATE INDEX IF NOT EXISTS idx_content_locales_publish ON content_locales(site_id, locale, published_at);
CREATE INDEX IF NOT EXISTS idx_content_locales_updated ON content_locales(updated_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_contents_status_updated ON contents(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_contents_active_updated ON contents(deleted_at, updated_at DESC);

CREATE TABLE IF NOT EXISTS content_revisions (
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
);
CREATE INDEX IF NOT EXISTS idx_content_revisions_lookup ON content_revisions(content_id, id DESC);

CREATE TABLE IF NOT EXISTS localization_jobs (
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
);
CREATE INDEX IF NOT EXISTS idx_localization_jobs_source ON localization_jobs(source_site_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_localization_jobs_content ON localization_jobs(content_id, created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL COLLATE NOCASE UNIQUE,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    failed_login_count INTEGER NOT NULL DEFAULT 0,
    locked_until TEXT,
    mfa_secret BLOB,
    mfa_enabled INTEGER NOT NULL DEFAULT 0 CHECK (mfa_enabled IN (0, 1)),
    mfa_last_counter INTEGER NOT NULL DEFAULT 0,
    password_changed_at TEXT NOT NULL,
    last_login_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS setup_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1))
);
INSERT OR IGNORE INTO setup_state(id, completed) VALUES (1, 0);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    csrf_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    idle_expires_at TEXT NOT NULL,
    absolute_expires_at TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    user_agent_hash TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(idle_expires_at, absolute_expires_at);

CREATE TABLE IF NOT EXISTS mfa_enrollments (
    session_id TEXT PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
    secret_encrypted BLOB NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mfa_recovery_codes (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL,
    PRIMARY KEY (user_id, code_hash)
);

CREATE TABLE IF NOT EXISTS permissions (
    code TEXT PRIMARY KEY,
    name_zh TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name_zh TEXT NOT NULL,
    system_role INTEGER NOT NULL DEFAULT 0 CHECK (system_role IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_code TEXT NOT NULL REFERENCES permissions(code) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_code)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- site_id=0 and locale='*' mean all sites and all locales. Action permissions
-- still come from roles; scopes only narrow where those actions can be used.
CREATE TABLE IF NOT EXISTS user_access_scopes (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    site_id INTEGER NOT NULL DEFAULT 0,
    locale TEXT NOT NULL DEFAULT '*',
    created_at TEXT NOT NULL,
    PRIMARY KEY (user_id, site_id, locale)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL DEFAULT '',
    target_id TEXT NOT NULL DEFAULT '',
    request_id TEXT NOT NULL DEFAULT '',
    ip_address TEXT NOT NULL DEFAULT '',
    user_agent TEXT NOT NULL DEFAULT '',
    success INTEGER NOT NULL CHECK (success IN (0, 1)),
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action, created_at DESC);

CREATE TRIGGER IF NOT EXISTS audit_logs_no_update
BEFORE UPDATE ON audit_logs BEGIN
    SELECT RAISE(ABORT, 'audit logs are append-only');
END;
CREATE TRIGGER IF NOT EXISTS audit_logs_no_delete
BEFORE DELETE ON audit_logs BEGIN
    SELECT RAISE(ABORT, 'audit logs are append-only');
END;

CREATE TABLE IF NOT EXISTS media_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    storage_name TEXT NOT NULL UNIQUE,
    original_name TEXT NOT NULL,
    media_type TEXT NOT NULL,
    byte_size INTEGER NOT NULL,
    sha256 TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 0,
    height INTEGER NOT NULL DEFAULT 0,
    alt_text TEXT NOT NULL DEFAULT '',
    version INTEGER NOT NULL DEFAULT 1,
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_media_checksum ON media_files(sha256);
CREATE INDEX IF NOT EXISTS idx_media_created ON media_files(created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS theme_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    storage_name TEXT NOT NULL UNIQUE,
    sha256 TEXT NOT NULL,
    uploaded_by INTEGER REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'validated' CHECK (status IN ('validated', 'disabled')),
    kind TEXT NOT NULL DEFAULT 'archive' CHECK (kind IN ('builtin', 'archive')),
    render_key TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    UNIQUE(name, version)
);

CREATE TABLE IF NOT EXISTS site_languages (
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
);
CREATE INDEX IF NOT EXISTS idx_site_languages_locale ON site_languages(site_id, locale, enabled);

CREATE TABLE IF NOT EXISTS backup_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    storage_name TEXT NOT NULL UNIQUE,
    byte_size INTEGER NOT NULL,
    sha256 TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    verified_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);
`

func Open(ctx context.Context, path string) (*sql.DB, error) {
	if !strings.HasPrefix(path, "file:") && path != ":memory:" {
		if err := os.MkdirAll(filepath.Dir(path), 0o750); err != nil {
			return nil, fmt.Errorf("创建数据库目录: %w", err)
		}
	}

	dsn := path
	if !strings.HasPrefix(dsn, "file:") {
		dsn = "file:" + filepath.ToSlash(dsn)
	}
	values := url.Values{}
	values.Add("_pragma", "busy_timeout(5000)")
	values.Add("_pragma", "foreign_keys(1)")
	values.Add("_pragma", "journal_mode(WAL)")
	values.Add("_pragma", "synchronous(NORMAL)")
	values.Add("_pragma", "temp_store(MEMORY)")
	values.Add("_pragma", "cache_size(-20000)")
	values.Add("_pragma", "mmap_size(268435456)")
	separator := "?"
	if strings.Contains(dsn, "?") {
		separator = "&"
	}
	dsn += separator + values.Encode()

	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, fmt.Errorf("打开 SQLite: %w", err)
	}

	db.SetMaxOpenConns(8)
	db.SetMaxIdleConns(4)
	db.SetConnMaxLifetime(30 * time.Minute)
	db.SetConnMaxIdleTime(5 * time.Minute)

	pragmas := []string{
		"PRAGMA journal_mode=WAL;",
		"PRAGMA synchronous=NORMAL;",
		"PRAGMA foreign_keys=ON;",
		"PRAGMA busy_timeout=5000;",
		"PRAGMA temp_store=MEMORY;",
		"PRAGMA cache_size=-20000;",
		"PRAGMA mmap_size=268435456;",
	}
	for _, pragma := range pragmas {
		if _, err = db.ExecContext(ctx, pragma); err != nil {
			db.Close()
			return nil, fmt.Errorf("设置 SQLite 参数 %q: %w", pragma, err)
		}
	}

	if _, err = db.ExecContext(ctx, schema); err != nil {
		db.Close()
		return nil, fmt.Errorf("执行数据库迁移: %w", err)
	}

	if err = runMigrations(ctx, db); err != nil {
		db.Close()
		return nil, err
	}

	if err = seed(ctx, db); err != nil {
		db.Close()
		return nil, err
	}

	if err = db.PingContext(ctx); err != nil {
		db.Close()
		return nil, fmt.Errorf("检查 SQLite 连接: %w", err)
	}
	return db, nil
}

func seed(ctx context.Context, db *sql.DB) error {
	now := time.Now().UTC().Format(time.RFC3339)
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("开始种子事务: %w", err)
	}
	defer tx.Rollback()

	defaultSites := []struct {
		Name, Code, PrimaryDomain, Market, LanguageCode, Locale string
		Port                                                    int
	}{
		{Name: "Global Route English", Code: "global", PrimaryDomain: "www.example.com", Market: "GLOBAL", LanguageCode: "en", Locale: "en", Port: 8081},
		{Name: "Global Route Deutschland", Code: "germany", Market: "DE", LanguageCode: "de", Locale: "de-DE", Port: 8082},
		{Name: "Global Route France", Code: "france", Market: "FR", LanguageCode: "fr", Locale: "fr-FR", Port: 8083},
		{Name: "Global Route España", Code: "spain", Market: "ES", LanguageCode: "es", Locale: "es-ES", Port: 8084},
		{Name: "Global Route Italia", Code: "italy", Market: "IT", LanguageCode: "it", Locale: "it-IT", Port: 8085},
		{Name: "Global Route Nederland", Code: "netherlands", Market: "NL", LanguageCode: "nl", Locale: "nl-NL", Port: 8086},
	}
	for _, site := range defaultSites {
		if _, err = tx.ExecContext(ctx, `INSERT OR IGNORE INTO sites(name, code, primary_domain, local_port, market_code, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`, site.Name, site.Code, site.PrimaryDomain, site.Port, site.Market, now, now); err != nil {
			return fmt.Errorf("初始化默认站点 %s: %w", site.Code, err)
		}
	}
	if _, err = tx.ExecContext(ctx, `
		INSERT OR IGNORE INTO site_domains(site_id, hostname, kind, redirect_to_primary, dns_status, version, created_at, updated_at)
		SELECT id, lower(primary_domain), 'primary', 0, 'pending', 1, ?, ? FROM sites WHERE trim(primary_domain) <> ''`, now, now); err != nil {
		return fmt.Errorf("初始化默认站点域名: %w", err)
	}

	languages := []struct {
		Code, NameZH, NativeName, Locale, Direction string
		Enabled                                     bool
	}{
		{"en", "英语", "English", "en", "ltr", true},
		{"de", "德语", "Deutsch", "de-DE", "ltr", true},
		{"fr", "法语", "Français", "fr-FR", "ltr", true},
		{"es", "西班牙语", "Español", "es-ES", "ltr", true},
		{"it", "意大利语", "Italiano", "it-IT", "ltr", true},
		{"nl", "荷兰语", "Nederlands", "nl-NL", "ltr", true},
		{"zh-hant", "繁体中文", "繁體中文", "zh-Hant", "ltr", false},
		{"pt", "葡萄牙语", "Português", "pt-PT", "ltr", false},
		{"ja", "日语", "日本語", "ja-JP", "ltr", false},
		{"ko", "韩语", "한국어", "ko-KR", "ltr", false},
		{"ar", "阿拉伯语", "العربية", "ar-AE", "rtl", false},
		{"he", "希伯来语", "עברית", "he-IL", "rtl", false},
		{"sv", "瑞典语", "Svenska", "sv-SE", "ltr", false},
		{"da", "丹麦语", "Dansk", "da-DK", "ltr", false},
		{"nb", "挪威语", "Norsk bokmål", "nb-NO", "ltr", false},
		{"pl", "波兰语", "Polski", "pl-PL", "ltr", false},
		{"tr", "土耳其语", "Türkçe", "tr-TR", "ltr", false},
		{"hi", "印地语", "हिन्दी", "hi-IN", "ltr", false},
		{"id", "印度尼西亚语", "Bahasa Indonesia", "id-ID", "ltr", false},
		{"ms", "马来语", "Bahasa Melayu", "ms-MY", "ltr", false},
		{"th", "泰语", "ไทย", "th-TH", "ltr", false},
		{"vi", "越南语", "Tiếng Việt", "vi-VN", "ltr", false},
		{"ru", "俄语", "Русский", "ru-RU", "ltr", false},
		{"ro", "罗马尼亚语", "Română", "ro-RO", "ltr", false},
	}
	for _, language := range languages {
		if _, err = tx.ExecContext(ctx, `INSERT OR IGNORE INTO languages(code, name_zh, native_name, default_locale, direction, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, language.Code, language.NameZH, language.NativeName, language.Locale, language.Direction, language.Enabled, now, now); err != nil {
			return fmt.Errorf("初始化语言 %s: %w", language.Code, err)
		}
	}

	// Built-in templates are real catalog records, not hidden renderer
	// fallbacks. A fresh installation can register them before the owner exists
	// because uploaded_by is nullable for system-owned packages. Older
	// databases kept the original NOT NULL column, so they wait until an owner
	// is present and are populated on the next Open/seed pass.
	var uploader sql.NullInt64
	if queryErr := tx.QueryRowContext(ctx, `SELECT id FROM users ORDER BY id LIMIT 1`).Scan(&uploader.Int64); queryErr == nil {
		uploader.Valid = true
	} else if !errors.Is(queryErr, sql.ErrNoRows) {
		return fmt.Errorf("读取内置模板登记用户: %w", queryErr)
	}
	uploaderNullable, err := columnAllowsNull(ctx, tx, "theme_packages", "uploaded_by")
	if err != nil {
		return err
	}
	if uploader.Valid || uploaderNullable {
		themes := []struct {
			Name, Version, StorageName, RenderKey string
		}{
			{"Global Route Logistics", "1.0.0", "builtin-global-route", "global-route"},
			{"Atlas Commerce", "1.0.0", "builtin-atlas-commerce", "atlas-commerce"},
		}
		var uploadedBy any
		if uploader.Valid {
			uploadedBy = uploader.Int64
		}
		for _, theme := range themes {
			checksum := fmt.Sprintf("%x", sha256.Sum256([]byte(theme.RenderKey+"@"+theme.Version)))
			if _, err = tx.ExecContext(ctx, `INSERT OR IGNORE INTO theme_packages(name, version, storage_name, sha256, uploaded_by, status, kind, render_key, created_at)
				VALUES (?, ?, ?, ?, ?, 'validated', 'builtin', ?, ?)`, theme.Name, theme.Version, theme.StorageName, checksum, uploadedBy, theme.RenderKey, now); err != nil {
				return fmt.Errorf("登记内置模板 %s: %w", theme.RenderKey, err)
			}
			if _, err = tx.ExecContext(ctx, `UPDATE theme_packages SET name = ?, version = ?, sha256 = ?, status = 'validated', kind = 'builtin', render_key = ?
				WHERE storage_name = ?`, theme.Name, theme.Version, checksum, theme.RenderKey, theme.StorageName); err != nil {
				return fmt.Errorf("升级内置模板 %s: %w", theme.RenderKey, err)
			}
		}
	}
	if err = seedThemeFilesV13(ctx, tx); err != nil {
		return err
	}
	if err = seedThemeAssetsV18(ctx, tx); err != nil {
		return err
	}

	for _, site := range defaultSites {
		if _, err = tx.ExecContext(ctx, `
			INSERT OR IGNORE INTO site_languages(site_id, language_id, locale, enabled, theme_package_id, created_at, updated_at)
			SELECT s.id, l.id, ?, 1,
			       (SELECT id FROM theme_packages WHERE render_key = 'global-route' AND status = 'validated' LIMIT 1), ?, ?
			FROM sites s JOIN languages l ON l.code = ? WHERE s.code = ?`, site.Locale, now, now, site.LanguageCode, site.Code); err != nil {
			return fmt.Errorf("初始化站点 %s 的默认语言: %w", site.Code, err)
		}
	}
	permissions := [][3]string{
		{"dashboard.view", "查看控制台", "访问管理后台和自己的账户信息"},
		{"sites.manage", "管理站点", "创建和配置站点"},
		{"languages.manage", "管理语言", "启停语言和配置 Locale"},
		{"content.read", "查看内容", "查看授权范围内的内容"},
		{"content.write", "编辑内容", "创建和修改授权范围内的内容"},
		{"templates.manage", "管理模板", "上传、验证和绑定模板"},
		{"seo.manage", "管理 SEO", "修改站点与页面 SEO 配置"},
		{"media.read", "查看媒体", "查看授权范围内的媒体"},
		{"media.upload", "上传媒体", "上传经过安全校验的媒体文件"},
		{"publishing.manage", "管理发布", "执行和回滚发布"},
		{"jobs.manage", "管理任务", "查看和操作后台任务"},
		{"users.manage", "管理用户权限", "配置用户、角色和数据范围"},
		{"audit.read", "查看审计日志", "查询不可变审计记录"},
		{"system.view", "查看系统状态", "查看受保护的系统运行状态"},
		{"system.manage", "管理系统设置", "管理 AI 提供方和系统级配置"},
		{"backup.manage", "管理备份", "创建和验证加密备份"},
	}
	for _, permission := range permissions {
		if _, err = tx.ExecContext(ctx, `INSERT OR IGNORE INTO permissions(code, name_zh, description) VALUES (?, ?, ?)`, permission[0], permission[1], permission[2]); err != nil {
			return fmt.Errorf("初始化权限 %s: %w", permission[0], err)
		}
	}

	roles := [][2]string{{"owner", "系统所有者"}, {"administrator", "管理员"}, {"editor", "内容编辑"}, {"auditor", "安全审计员"}}
	for _, role := range roles {
		if _, err = tx.ExecContext(ctx, `INSERT OR IGNORE INTO roles(code, name_zh, system_role, created_at, updated_at) VALUES (?, ?, 1, ?, ?)`, role[0], role[1], now, now); err != nil {
			return fmt.Errorf("初始化角色 %s: %w", role[0], err)
		}
	}

	rolePermissions := map[string][]string{
		"owner":         {"*"},
		"administrator": {"dashboard.view", "sites.manage", "languages.manage", "content.read", "content.write", "templates.manage", "seo.manage", "media.read", "media.upload", "publishing.manage", "jobs.manage", "users.manage", "audit.read", "system.view", "system.manage", "backup.manage"},
		"editor":        {"dashboard.view", "content.read", "content.write", "media.read", "media.upload"},
		"auditor":       {"dashboard.view", "audit.read", "system.view"},
	}
	for roleCode, codes := range rolePermissions {
		if len(codes) == 1 && codes[0] == "*" {
			if _, err = tx.ExecContext(ctx, `INSERT OR IGNORE INTO role_permissions(role_id, permission_code) SELECT r.id, p.code FROM roles r CROSS JOIN permissions p WHERE r.code = ?`, roleCode); err != nil {
				return fmt.Errorf("初始化所有者权限: %w", err)
			}
			continue
		}
		for _, code := range codes {
			if _, err = tx.ExecContext(ctx, `INSERT OR IGNORE INTO role_permissions(role_id, permission_code) SELECT id, ? FROM roles WHERE code = ?`, code, roleCode); err != nil {
				return fmt.Errorf("初始化角色权限 %s/%s: %w", roleCode, code, err)
			}
		}
	}
	return tx.Commit()
}

func columnAllowsNull(ctx context.Context, tx *sql.Tx, table, column string) (bool, error) {
	rows, err := tx.QueryContext(ctx, `PRAGMA table_info(`+table+`)`)
	if err != nil {
		return false, fmt.Errorf("读取 %s 表结构: %w", table, err)
	}
	defer rows.Close()
	for rows.Next() {
		var cid, notNull, primaryKey int
		var name, columnType string
		var defaultValue any
		if err = rows.Scan(&cid, &name, &columnType, &notNull, &defaultValue, &primaryKey); err != nil {
			return false, err
		}
		if name == column {
			return notNull == 0, nil
		}
	}
	if err = rows.Err(); err != nil {
		return false, err
	}
	return false, fmt.Errorf("%s.%s 字段不存在", table, column)
}
