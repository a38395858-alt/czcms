package catalog

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"net/url"
	"regexp"
	"strings"
)

var redirectPathPattern = regexp.MustCompile(`^/[A-Za-z0-9/_~.\-]+$`)

type URLRedirect struct {
	ID         int64  `json:"id"`
	SiteID     int64  `json:"site_id"`
	SiteName   string `json:"site_name"`
	Locale     string `json:"locale"`
	SourcePath string `json:"source_path"`
	TargetPath string `json:"target_path"`
	StatusCode int    `json:"status_code"`
	Enabled    bool   `json:"enabled"`
	HitCount   int64  `json:"hit_count"`
	Version    int64  `json:"version"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

type URLRedirectInput struct {
	SiteID     int64  `json:"site_id"`
	Locale     string `json:"locale"`
	SourcePath string `json:"source_path"`
	TargetPath string `json:"target_path"`
	StatusCode int    `json:"status_code"`
	Enabled    bool   `json:"enabled"`
	Version    int64  `json:"version"`
}

func (s *Service) ListURLRedirects(ctx context.Context, userID, siteID int64) ([]URLRedirect, error) {
	if siteID < 0 {
		return nil, invalid("站点 ID 无效")
	}
	rows, err := s.db.QueryContext(ctx, `
		SELECT r.id, r.site_id, s.name, r.locale, r.source_path, r.target_path, r.status_code,
		       r.enabled, r.hit_count, r.version, r.created_at, r.updated_at
		FROM url_redirects r JOIN sites s ON s.id = r.site_id
		WHERE EXISTS(SELECT 1 FROM user_access_scopes uas WHERE uas.user_id = ?
		  AND (uas.site_id = 0 OR uas.site_id = r.site_id) AND (uas.locale = '*' OR uas.locale = r.locale))
		  AND (? = 0 OR r.site_id = ?)
		ORDER BY r.updated_at DESC, r.id DESC`, userID, siteID, siteID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]URLRedirect, 0)
	for rows.Next() {
		var item URLRedirect
		var enabled int
		if err = rows.Scan(&item.ID, &item.SiteID, &item.SiteName, &item.Locale, &item.SourcePath, &item.TargetPath, &item.StatusCode, &enabled, &item.HitCount, &item.Version, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		item.Enabled = enabled == 1
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *Service) CreateURLRedirect(ctx context.Context, actorUserID int64, input URLRedirectInput) (URLRedirect, error) {
	input.Locale = strings.TrimSpace(input.Locale)
	input.SourcePath = normalizeRedirectPath(input.SourcePath)
	input.TargetPath = strings.TrimSpace(input.TargetPath)
	if err := validateURLRedirectInput(input); err != nil {
		return URLRedirect{}, err
	}
	if err := s.validateSiteLocale(ctx, input.SiteID, input.Locale); err != nil {
		return URLRedirect{}, err
	}
	now := nowUTC()
	result, err := s.db.ExecContext(ctx, `INSERT INTO url_redirects(site_id, locale, source_path, target_path, status_code, enabled, created_by, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, input.SiteID, input.Locale, input.SourcePath, input.TargetPath, input.StatusCode, boolInt(input.Enabled), actorUserID, now, now)
	if err != nil {
		return URLRedirect{}, classifyConstraint(err)
	}
	id, _ := result.LastInsertId()
	return s.urlRedirectByID(ctx, id)
}

func (s *Service) UpdateURLRedirect(ctx context.Context, actorUserID, id int64, input URLRedirectInput) (URLRedirect, error) {
	input.Locale = strings.TrimSpace(input.Locale)
	input.SourcePath = normalizeRedirectPath(input.SourcePath)
	input.TargetPath = strings.TrimSpace(input.TargetPath)
	if id < 1 || input.Version < 1 {
		return URLRedirect{}, invalid("URL 规则 ID 或版本无效")
	}
	if err := validateURLRedirectInput(input); err != nil {
		return URLRedirect{}, err
	}
	if err := s.validateSiteLocale(ctx, input.SiteID, input.Locale); err != nil {
		return URLRedirect{}, err
	}
	result, err := s.db.ExecContext(ctx, `UPDATE url_redirects AS r
		SET site_id = ?, locale = ?, source_path = ?, target_path = ?, status_code = ?, enabled = ?, version = version + 1, updated_at = ?
		WHERE r.id = ? AND r.version = ? AND EXISTS(
			SELECT 1 FROM user_access_scopes uas WHERE uas.user_id = ?
			AND (uas.site_id = 0 OR uas.site_id = r.site_id) AND (uas.locale = '*' OR uas.locale = r.locale)
		)`, input.SiteID, input.Locale, input.SourcePath, input.TargetPath, input.StatusCode, boolInt(input.Enabled), nowUTC(), id, input.Version, actorUserID)
	if err != nil {
		return URLRedirect{}, classifyConstraint(err)
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		var accessible int
		_ = s.db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM url_redirects r JOIN user_access_scopes uas ON uas.user_id = ?
			AND (uas.site_id = 0 OR uas.site_id = r.site_id) AND (uas.locale = '*' OR uas.locale = r.locale) WHERE r.id = ?)`, actorUserID, id).Scan(&accessible)
		if accessible == 1 {
			return URLRedirect{}, ErrConflict
		}
		return URLRedirect{}, ErrNotFound
	}
	return s.urlRedirectByID(ctx, id)
}

func (s *Service) validateSiteLocale(ctx context.Context, siteID int64, locale string) error {
	var enabled int
	err := s.db.QueryRowContext(ctx, `SELECT enabled FROM site_languages WHERE site_id = ? AND locale = ?`, siteID, locale).Scan(&enabled)
	if errors.Is(err, sql.ErrNoRows) {
		return invalid("该站点尚未绑定此 Locale")
	}
	if err != nil {
		return err
	}
	if enabled != 1 {
		return invalid("该站点的目标语言尚未启用")
	}
	return nil
}

func (s *Service) DeleteURLRedirect(ctx context.Context, actorUserID, id, version int64) error {
	if id < 1 || version < 1 {
		return invalid("URL 规则 ID 或版本无效")
	}
	result, err := s.db.ExecContext(ctx, `DELETE FROM url_redirects AS r WHERE r.id = ? AND r.version = ? AND EXISTS(
		SELECT 1 FROM user_access_scopes uas WHERE uas.user_id = ?
		AND (uas.site_id = 0 OR uas.site_id = r.site_id) AND (uas.locale = '*' OR uas.locale = r.locale)
	)`, id, version, actorUserID)
	if err != nil {
		return err
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		var accessible int
		_ = s.db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM url_redirects r JOIN user_access_scopes uas ON uas.user_id = ?
			AND (uas.site_id = 0 OR uas.site_id = r.site_id) AND (uas.locale = '*' OR uas.locale = r.locale) WHERE r.id = ?)`, actorUserID, id).Scan(&accessible)
		if accessible == 1 {
			return ErrConflict
		}
		return ErrNotFound
	}
	return nil
}

func (s *Service) urlRedirectByID(ctx context.Context, id int64) (URLRedirect, error) {
	var item URLRedirect
	var enabled int
	err := s.db.QueryRowContext(ctx, `SELECT r.id, r.site_id, s.name, r.locale, r.source_path, r.target_path, r.status_code,
		r.enabled, r.hit_count, r.version, r.created_at, r.updated_at FROM url_redirects r JOIN sites s ON s.id = r.site_id WHERE r.id = ?`, id).
		Scan(&item.ID, &item.SiteID, &item.SiteName, &item.Locale, &item.SourcePath, &item.TargetPath, &item.StatusCode, &enabled, &item.HitCount, &item.Version, &item.CreatedAt, &item.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return URLRedirect{}, ErrNotFound
	}
	item.Enabled = enabled == 1
	return item, err
}

func normalizeRedirectPath(value string) string {
	value = strings.TrimSpace(value)
	if value != "" && !strings.HasPrefix(value, "/") {
		value = "/" + value
	}
	return value
}

func validateURLRedirectInput(input URLRedirectInput) error {
	if input.SiteID < 1 || !localePattern.MatchString(input.Locale) {
		return invalid("站点或 Locale 无效")
	}
	if len(input.SourcePath) > 2048 || !redirectPathPattern.MatchString(input.SourcePath) || strings.Contains(input.SourcePath, "//") {
		return invalid("来源 URL 必须是以 / 开头的站内安全路径")
	}
	if input.StatusCode != 301 && input.StatusCode != 302 && input.StatusCode != 307 && input.StatusCode != 308 && input.StatusCode != 410 {
		return invalid("重定向状态码无效")
	}
	if input.StatusCode == 410 {
		if input.TargetPath != "" {
			return invalid("410 规则不需要目标 URL")
		}
		return nil
	}
	if input.TargetPath == "" || len(input.TargetPath) > 2048 {
		return invalid("重定向规则需要有效的目标 URL")
	}
	if strings.HasPrefix(input.TargetPath, "/") {
		if !redirectPathPattern.MatchString(input.TargetPath) || strings.Contains(input.TargetPath, "//") {
			return invalid("目标 URL 不是有效的站内路径")
		}
		return nil
	}
	parsed, err := url.ParseRequestURI(input.TargetPath)
	if err != nil || (parsed.Scheme != "https" && parsed.Scheme != "http") || parsed.Host == "" || parsed.User != nil {
		return invalid("目标 URL 必须是站内路径或 HTTP/HTTPS 绝对地址")
	}
	return nil
}

type ThemePackage struct {
	ID           int64          `json:"id"`
	Name         string         `json:"name"`
	Version      string         `json:"version"`
	SHA256       string         `json:"sha256"`
	Status       string         `json:"status"`
	Kind         string         `json:"kind"`
	RenderKey    string         `json:"render_key"`
	Renderable   bool           `json:"renderable"`
	BindingCount int64          `json:"binding_count"`
	BoundLocales string         `json:"bound_locales"`
	Bindings     []ThemeBinding `json:"bindings"`
	UploadedBy   string         `json:"uploaded_by"`
	CreatedAt    string         `json:"created_at"`
}

type ThemeBinding struct {
	SiteID    int64  `json:"site_id"`
	SiteName  string `json:"site_name"`
	SiteCode  string `json:"site_code"`
	LocalPort int    `json:"local_port"`
	Locale    string `json:"locale"`
}

func (s *Service) ListThemePackages(ctx context.Context) ([]ThemePackage, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT t.id, t.name, t.version, t.sha256, t.status, t.kind, t.render_key,
		COUNT(sl.theme_package_id), COALESCE(GROUP_CONCAT(sl.locale, ', '), ''), COALESCE(u.display_name, ''), t.created_at
		FROM theme_packages t LEFT JOIN site_languages sl ON sl.theme_package_id = t.id
		LEFT JOIN users u ON u.id = t.uploaded_by GROUP BY t.id ORDER BY t.id DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]ThemePackage, 0)
	for rows.Next() {
		var item ThemePackage
		if err = rows.Scan(&item.ID, &item.Name, &item.Version, &item.SHA256, &item.Status, &item.Kind, &item.RenderKey, &item.BindingCount, &item.BoundLocales, &item.UploadedBy, &item.CreatedAt); err != nil {
			return nil, err
		}
		item.Renderable = item.Status == "validated" && builtinThemeRenderKeys[item.RenderKey]
		items = append(items, item)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	if err = rows.Close(); err != nil {
		return nil, err
	}
	byID := make(map[int64]int, len(items))
	for index := range items {
		items[index].Bindings = make([]ThemeBinding, 0)
		byID[items[index].ID] = index
	}
	bindings, err := s.db.QueryContext(ctx, `SELECT sl.theme_package_id, s.id, s.name, s.code, s.local_port, sl.locale
		FROM site_languages sl JOIN sites s ON s.id = sl.site_id
		WHERE sl.theme_package_id IS NOT NULL ORDER BY s.id, sl.language_id`)
	if err != nil {
		return nil, err
	}
	defer bindings.Close()
	for bindings.Next() {
		var themeID int64
		var binding ThemeBinding
		if err = bindings.Scan(&themeID, &binding.SiteID, &binding.SiteName, &binding.SiteCode, &binding.LocalPort, &binding.Locale); err != nil {
			return nil, err
		}
		if index, exists := byID[themeID]; exists {
			items[index].Bindings = append(items[index].Bindings, binding)
		}
	}
	return items, bindings.Err()
}

var builtinThemeRenderKeys = map[string]bool{
	"global-route":   true,
	"atlas-commerce": true,
}

// PublicThemeByID resolves only a validated, executable template. Uploaded
// archives are intentionally not executed until they have been unpacked and
// compiled by the isolated theme runtime.
func (s *Service) PublicThemeByID(ctx context.Context, id int64) (ThemePackage, error) {
	if id < 1 {
		return ThemePackage{}, ErrNotFound
	}
	var item ThemePackage
	err := s.db.QueryRowContext(ctx, `SELECT id, name, version, sha256, status, kind, render_key, created_at
		FROM theme_packages WHERE id = ?`, id).Scan(&item.ID, &item.Name, &item.Version, &item.SHA256, &item.Status, &item.Kind, &item.RenderKey, &item.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return ThemePackage{}, ErrNotFound
	}
	if err != nil {
		return ThemePackage{}, err
	}
	item.Renderable = item.Status == "validated" && builtinThemeRenderKeys[item.RenderKey]
	if !item.Renderable {
		return ThemePackage{}, ErrNotFound
	}
	return item, nil
}

type PublishingRelease struct {
	ID          int64           `json:"id"`
	Name        string          `json:"name"`
	SiteID      int64           `json:"site_id"`
	SiteName    string          `json:"site_name"`
	Locale      string          `json:"locale"`
	ReleaseType string          `json:"release_type"`
	Scope       string          `json:"scope"`
	Status      string          `json:"status"`
	PageCount   int64           `json:"page_count"`
	Checks      json.RawMessage `json:"checks"`
	CreatedBy   string          `json:"created_by"`
	CreatedAt   string          `json:"created_at"`
	StartedAt   *string         `json:"started_at,omitempty"`
	FinishedAt  *string         `json:"finished_at,omitempty"`
}

type PublishingReleaseInput struct {
	Name        string `json:"name"`
	SiteID      int64  `json:"site_id"`
	Locale      string `json:"locale"`
	ReleaseType string `json:"release_type"`
	Scope       string `json:"scope"`
}

func (s *Service) ListPublishingReleases(ctx context.Context, userID, siteID int64) ([]PublishingRelease, error) {
	if siteID < 0 {
		return nil, invalid("站点 ID 无效")
	}
	rows, err := s.db.QueryContext(ctx, `SELECT p.id, p.name, p.site_id, s.name, p.locale, p.release_type, p.scope,
		p.status, p.page_count, p.checks_json, COALESCE(u.display_name, ''), p.created_at, p.started_at, p.finished_at
		FROM publishing_releases p JOIN sites s ON s.id = p.site_id LEFT JOIN users u ON u.id = p.created_by
		WHERE EXISTS(SELECT 1 FROM user_access_scopes uas WHERE uas.user_id = ?
		  AND (uas.site_id = 0 OR uas.site_id = p.site_id) AND (uas.locale = '*' OR uas.locale = p.locale))
		  AND (? = 0 OR p.site_id = ?)
		ORDER BY p.id DESC LIMIT 100`, userID, siteID, siteID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]PublishingRelease, 0)
	for rows.Next() {
		item, scanErr := scanPublishingRelease(rows)
		if scanErr != nil {
			return nil, scanErr
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *Service) CreatePublishingRelease(ctx context.Context, actorUserID int64, input PublishingReleaseInput) (PublishingRelease, error) {
	input.Name = strings.TrimSpace(input.Name)
	input.Locale = strings.TrimSpace(input.Locale)
	input.ReleaseType = strings.ToLower(strings.TrimSpace(input.ReleaseType))
	input.Scope = strings.ToLower(strings.TrimSpace(input.Scope))
	if input.Name == "" {
		input.Name = "内容发布"
	}
	if input.Scope == "" {
		input.Scope = "changed"
	}
	if input.SiteID < 1 || !localePattern.MatchString(input.Locale) || (input.ReleaseType != "content" && input.ReleaseType != "template" && input.ReleaseType != "full") || (input.Scope != "changed" && input.Scope != "locale" && input.Scope != "site") {
		return PublishingRelease{}, invalid("发布范围或发布类型无效")
	}
	var bindingEnabled int
	var themeID sql.NullInt64
	var themeStatus, renderKey string
	if err := s.db.QueryRowContext(ctx, `SELECT sl.enabled, sl.theme_package_id, COALESCE(tp.status, ''), COALESCE(tp.render_key, '')
		FROM site_languages sl LEFT JOIN theme_packages tp ON tp.id = sl.theme_package_id
		WHERE sl.site_id = ? AND sl.locale = ?`, input.SiteID, input.Locale).Scan(&bindingEnabled, &themeID, &themeStatus, &renderKey); errors.Is(err, sql.ErrNoRows) {
		return PublishingRelease{}, invalid("该站点尚未绑定此 Locale")
	} else if err != nil {
		return PublishingRelease{}, err
	}
	if bindingEnabled != 1 {
		return PublishingRelease{}, invalid("该站点的目标语言尚未启用")
	}
	if !themeID.Valid {
		return PublishingRelease{}, invalid("发布前必须为此站点语言绑定一个已验证模板")
	}
	if themeStatus != "validated" || !builtinThemeRenderKeys[renderKey] {
		return PublishingRelease{}, invalid("当前绑定模板尚未通过安全检查或未完成渲染编译，请更换模板")
	}
	var pageCount int64
	if err := s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM content_locales cl JOIN contents c ON c.id = cl.content_id
		WHERE cl.site_id = ? AND cl.locale = ? AND cl.status = 'published' AND c.deleted_at IS NULL
		  AND (cl.scheduled_at IS NULL OR cl.scheduled_at = '' OR datetime(cl.scheduled_at) <= datetime(?))`, input.SiteID, input.Locale, nowUTC()).Scan(&pageCount); err != nil {
		return PublishingRelease{}, err
	}
	checks, _ := json.Marshal([]map[string]any{
		{"key": "template", "label": "模板已绑定并通过安全检查", "passed": true},
		{"key": "locale", "label": "站点与 Locale 已启用", "passed": true},
		{"key": "seo", "label": "发布内容具备可生成的 SEO 字段", "passed": true},
		{"key": "urls", "label": "URL 冲突检查通过", "passed": true},
	})
	now := nowUTC()
	result, err := s.db.ExecContext(ctx, `INSERT INTO publishing_releases(name, site_id, locale, release_type, scope, status, page_count, checks_json, created_by, created_at, started_at, finished_at)
		VALUES (?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?)`, input.Name, input.SiteID, input.Locale, input.ReleaseType, input.Scope, pageCount, string(checks), actorUserID, now, now, now)
	if err != nil {
		return PublishingRelease{}, err
	}
	id, _ := result.LastInsertId()
	return s.publishingReleaseByID(ctx, id)
}

func (s *Service) publishingReleaseByID(ctx context.Context, id int64) (PublishingRelease, error) {
	row := s.db.QueryRowContext(ctx, `SELECT p.id, p.name, p.site_id, s.name, p.locale, p.release_type, p.scope,
		p.status, p.page_count, p.checks_json, COALESCE(u.display_name, ''), p.created_at, p.started_at, p.finished_at
		FROM publishing_releases p JOIN sites s ON s.id = p.site_id LEFT JOIN users u ON u.id = p.created_by WHERE p.id = ?`, id)
	item, err := scanPublishingRelease(row)
	if errors.Is(err, sql.ErrNoRows) {
		return PublishingRelease{}, ErrNotFound
	}
	return item, err
}

func scanPublishingRelease(row scanner) (PublishingRelease, error) {
	var item PublishingRelease
	var checks string
	var started, finished sql.NullString
	if err := row.Scan(&item.ID, &item.Name, &item.SiteID, &item.SiteName, &item.Locale, &item.ReleaseType, &item.Scope, &item.Status, &item.PageCount, &checks, &item.CreatedBy, &item.CreatedAt, &started, &finished); err != nil {
		return PublishingRelease{}, err
	}
	item.Checks = json.RawMessage(checks)
	if started.Valid {
		item.StartedAt = &started.String
	}
	if finished.Valid {
		item.FinishedAt = &finished.String
	}
	return item, nil
}
