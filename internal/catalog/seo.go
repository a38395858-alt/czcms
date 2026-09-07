package catalog

import (
	"context"
	"database/sql"
	"sort"
	"strings"
	"unicode/utf8"
)

// SitemapEntry is a single public, canonical route eligible for a site's
// sitemap.xml. It deliberately omits non-indexable, scheduled and draft
// records so callers never need to repeat SEO eligibility rules.
type SitemapEntry struct {
	Locale    string `json:"locale"`
	Slug      string `json:"slug"`
	UpdatedAt string `json:"updated_at"`
	Kind      string `json:"kind"`
}

// SitemapSiteStatus is the SEO-centre view of one site. Sitemap files are
// generated dynamically, so no sitemap record has to be created when a site
// is added: a new site appears here as soon as it has an accessible scope.
type SitemapSiteStatus struct {
	SiteID                  int64  `json:"site_id"`
	Name                    string `json:"name"`
	Code                    string `json:"code"`
	PrimaryDomain           string `json:"primary_domain"`
	LocalPort               int    `json:"local_port"`
	Status                  string `json:"status"`
	LanguageCount           int64  `json:"language_count"`
	IndexablePageCount      int64  `json:"indexable_page_count"`
	NoindexPageCount        int64  `json:"noindex_page_count"`
	SinglePageExcludedCount int64  `json:"single_page_excluded_count"`
	UpdatedAt               string `json:"updated_at"`
}

// RobotsPagePath identifies a published single page whose page-level policy
// is noindex. The robots generator uses these paths as an additional safety
// net for newly created About/Contact/utility pages.
type RobotsPagePath struct {
	Locale string `json:"locale"`
	Slug   string `json:"slug"`
}

// SiteRobotsSettings holds the editable, site-specific portion of robots.txt.
// The public file always keeps system security rules; CustomRules are appended
// beneath a clearly marked section for crawler-specific business rules.
type SiteRobotsSettings struct {
	SiteID      int64  `json:"site_id"`
	CustomRules string `json:"custom_rules"`
	Version     int64  `json:"version"`
	UpdatedAt   string `json:"updated_at"`
}

// GetSiteRobotsSettings reads a site's custom robots rules. A site created
// before a rules record exists returns an editable version 0 document.
func (s *Service) GetSiteRobotsSettings(ctx context.Context, siteID int64) (SiteRobotsSettings, error) {
	if siteID < 1 {
		return SiteRobotsSettings{}, invalid("站点 ID 无效")
	}
	var item SiteRobotsSettings
	err := s.db.QueryRowContext(ctx, `
		SELECT s.id, COALESCE(sr.custom_rules, ''), COALESCE(sr.version, 0), COALESCE(sr.updated_at, '')
		FROM sites s LEFT JOIN site_robots sr ON sr.site_id = s.id
		WHERE s.id = ?`, siteID).Scan(&item.SiteID, &item.CustomRules, &item.Version, &item.UpdatedAt)
	if err == sql.ErrNoRows {
		return SiteRobotsSettings{}, ErrNotFound
	}
	return item, err
}

// UpdateSiteRobotsSettings stores a bounded plain-text rules block with
// optimistic locking. It intentionally accepts standard robots directives
// without executing them; they are served only as text/plain in robots.txt.
func (s *Service) UpdateSiteRobotsSettings(ctx context.Context, siteID, actorUserID, version int64, customRules string) (SiteRobotsSettings, error) {
	if siteID < 1 || actorUserID < 1 || version < 0 {
		return SiteRobotsSettings{}, invalid("站点、操作人或 robots 版本无效")
	}
	customRules, err := normalizeSiteRobotsRules(customRules)
	if err != nil {
		return SiteRobotsSettings{}, err
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return SiteRobotsSettings{}, err
	}
	defer tx.Rollback()
	var exists int
	if err = tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM sites WHERE id = ?)`, siteID).Scan(&exists); err != nil {
		return SiteRobotsSettings{}, err
	}
	if exists != 1 {
		return SiteRobotsSettings{}, ErrNotFound
	}
	now := nowUTC()
	if version == 0 {
		result, execErr := tx.ExecContext(ctx, `INSERT OR IGNORE INTO site_robots(site_id, custom_rules, version, updated_by, created_at, updated_at) VALUES (?, ?, 1, ?, ?, ?)`, siteID, customRules, actorUserID, now, now)
		if execErr != nil {
			return SiteRobotsSettings{}, execErr
		}
		affected, _ := result.RowsAffected()
		if affected == 0 {
			return SiteRobotsSettings{}, ErrConflict
		}
	} else {
		result, execErr := tx.ExecContext(ctx, `UPDATE site_robots SET custom_rules = ?, version = version + 1, updated_by = ?, updated_at = ? WHERE site_id = ? AND version = ?`, customRules, actorUserID, now, siteID, version)
		if execErr != nil {
			return SiteRobotsSettings{}, execErr
		}
		affected, _ := result.RowsAffected()
		if affected == 0 {
			return SiteRobotsSettings{}, ErrConflict
		}
	}
	if err = tx.Commit(); err != nil {
		return SiteRobotsSettings{}, err
	}
	return s.GetSiteRobotsSettings(ctx, siteID)
}

func normalizeSiteRobotsRules(input string) (string, error) {
	input = strings.ReplaceAll(input, "\r\n", "\n")
	input = strings.ReplaceAll(input, "\r", "\n")
	input = strings.TrimSpace(input)
	if utf8.RuneCountInString(input) > 24_000 {
		return "", invalid("robots 自定义规则不能超过 24000 个字符")
	}
	lines := strings.Split(input, "\n")
	if len(lines) > 300 {
		return "", invalid("robots 自定义规则最多 300 行")
	}
	for _, line := range lines {
		if utf8.RuneCountInString(line) > 500 || strings.ContainsRune(line, '\x00') {
			return "", invalid("robots 自定义规则包含无效字符或过长行")
		}
		for _, r := range line {
			if r < 0x20 && r != '\t' {
				return "", invalid("robots 自定义规则包含控制字符")
			}
		}
	}
	return input, nil
}

// PublicNoindexPagePaths returns published single-page URLs that should not
// be crawled. Drafts are intentionally omitted because they are not public
// routes at all; indexable pages are left crawlable so their meta robots and
// sitemap entry can work as intended.
func (s *Service) PublicNoindexPagePaths(ctx context.Context, siteID int64) ([]RobotsPagePath, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT cl.locale, cl.slug
		FROM content_locales cl
		JOIN contents c ON c.id = cl.content_id
		JOIN site_languages sl ON sl.site_id = cl.site_id AND sl.locale = cl.locale
		JOIN languages l ON l.id = sl.language_id
		JOIN theme_packages t ON t.id = sl.theme_package_id
		WHERE cl.site_id = ? AND c.deleted_at IS NULL AND c.content_type = 'page'
		  AND cl.status = 'published' AND cl.index_policy = 'noindex'
		  AND (cl.scheduled_at IS NULL OR cl.scheduled_at = '' OR datetime(cl.scheduled_at) <= datetime(?))
		  AND sl.enabled = 1 AND l.enabled = 1
		  AND t.status = 'validated' AND t.render_key IN ('global-route', 'atlas-commerce')
		ORDER BY cl.locale, cl.slug`, siteID, nowUTC())
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	paths := make([]RobotsPagePath, 0)
	for rows.Next() {
		var item RobotsPagePath
		if err = rows.Scan(&item.Locale, &item.Slug); err != nil {
			return nil, err
		}
		paths = append(paths, item)
	}
	return paths, rows.Err()
}

// PublicSitemapLocales returns only enabled language bindings whose selected
// theme can actually render. A sitemap must not advertise a home URL that the
// public renderer would answer with a template error.
func (s *Service) PublicSitemapLocales(ctx context.Context, siteID int64) ([]string, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT sl.locale
		FROM site_languages sl
		JOIN languages l ON l.id = sl.language_id
		JOIN theme_packages t ON t.id = sl.theme_package_id
		WHERE sl.site_id = ? AND sl.enabled = 1 AND l.enabled = 1
		  AND t.status = 'validated' AND t.render_key IN ('global-route', 'atlas-commerce')
		ORDER BY sl.language_id`, siteID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	locales := make([]string, 0)
	for rows.Next() {
		var locale string
		if err = rows.Scan(&locale); err != nil {
			return nil, err
		}
		locales = append(locales, locale)
	}
	return locales, rows.Err()
}

// PublicSitemapEntries is the public crawl boundary used by sitemap.xml.
// It returns published content plus active category and tag archive routes
// that have at least one public, indexable item.  That ensures every URL we
// advertise is a route that the front end can actually render.
//
// Single pages follow their explicit index_policy. New pages are noindex by
// default, so they do not leak into the sitemap until an editor consciously
// opts an appropriate page into indexing.
func (s *Service) PublicSitemapEntries(ctx context.Context, siteID int64) ([]SitemapEntry, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT cl.locale, cl.slug, COALESCE(NULLIF(cl.updated_at, ''), cl.published_at, cl.created_at)
		FROM content_locales cl
		JOIN contents c ON c.id = cl.content_id
		JOIN site_languages sl ON sl.site_id = cl.site_id AND sl.locale = cl.locale
		JOIN languages l ON l.id = sl.language_id
		JOIN theme_packages t ON t.id = sl.theme_package_id
		WHERE cl.site_id = ? AND c.deleted_at IS NULL
		  AND cl.status = 'published' AND cl.robots_index = 1 AND (c.content_type <> 'page' OR cl.index_policy = 'index')
		  AND (cl.scheduled_at IS NULL OR cl.scheduled_at = '' OR datetime(cl.scheduled_at) <= datetime(?))
		  AND sl.enabled = 1 AND l.enabled = 1
		  AND t.status = 'validated' AND t.render_key IN ('global-route', 'atlas-commerce')
		ORDER BY cl.locale, COALESCE(cl.updated_at, cl.published_at) DESC, cl.id DESC`, siteID, nowUTC())
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	entries := make([]SitemapEntry, 0)
	occupiedRoutes := make(map[string]struct{})
	for rows.Next() {
		var item SitemapEntry
		if err = rows.Scan(&item.Locale, &item.Slug, &item.UpdatedAt); err != nil {
			return nil, err
		}
		item.Kind = "content"
		occupiedRoutes[item.Locale+"\x00"+item.Slug] = struct{}{}
		entries = append(entries, item)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	// A term only becomes a public archive when it has indexable public
	// content. Disabled, empty and draft-only terms remain out of the sitemap.
	termRows, err := s.db.QueryContext(ctx, `
		SELECT t.locale,
		       CASE t.kind WHEN 'category' THEN 'categories/' ELSE 'tags/' END || t.slug,
		       COALESCE(MAX(NULLIF(cl.updated_at, '')), MAX(cl.published_at), MAX(cl.created_at)),
		       t.kind
		FROM taxonomy_terms t
		JOIN content_taxonomy_terms ct ON ct.term_id = t.id
		JOIN content_locales cl ON cl.id = ct.content_locale_id
		JOIN contents c ON c.id = cl.content_id
		JOIN site_languages sl ON sl.site_id = cl.site_id AND sl.locale = cl.locale
		JOIN languages l ON l.id = sl.language_id
		JOIN theme_packages th ON th.id = sl.theme_package_id
		WHERE t.site_id = ? AND t.status = 'active' AND c.deleted_at IS NULL
		  AND cl.status = 'published' AND cl.robots_index = 1 AND (c.content_type <> 'page' OR cl.index_policy = 'index')
		  AND (cl.scheduled_at IS NULL OR cl.scheduled_at = '' OR datetime(cl.scheduled_at) <= datetime(?))
		  AND sl.enabled = 1 AND l.enabled = 1
		  AND th.status = 'validated' AND th.render_key IN ('global-route', 'atlas-commerce')
		GROUP BY t.id, t.locale, t.kind, t.slug
		ORDER BY t.locale, t.kind, t.slug`, siteID, nowUTC())
	if err != nil {
		return nil, err
	}
	defer termRows.Close()
	for termRows.Next() {
		var item SitemapEntry
		if err = termRows.Scan(&item.Locale, &item.Slug, &item.UpdatedAt, &item.Kind); err != nil {
			return nil, err
		}
		// Existing content routes take precedence in the public resolver. Do
		// not advertise a taxonomy archive whose canonical path is occupied.
		if _, exists := occupiedRoutes[item.Locale+"\x00"+item.Slug]; exists {
			continue
		}
		entries = append(entries, item)
	}
	if err = termRows.Err(); err != nil {
		return nil, err
	}
	sort.Slice(entries, func(i, j int) bool {
		if entries[i].Locale != entries[j].Locale {
			return entries[i].Locale < entries[j].Locale
		}
		return entries[i].Slug < entries[j].Slug
	})
	return entries, nil
}

// ListSitemapSites applies the same site scope model as the existing site
// centre. The counts use the exact sitemap eligibility rules and remain query
// based, which keeps large installations from maintaining a second copy of
// content URLs solely for SEO reporting.
func (s *Service) ListSitemapSites(ctx context.Context, userID int64) ([]SitemapSiteStatus, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT s.id, s.name, s.code, s.primary_domain, s.local_port, s.status,
		       (
		         SELECT COUNT(*) FROM site_languages sl
		         JOIN languages l ON l.id = sl.language_id
		         JOIN theme_packages t ON t.id = sl.theme_package_id
		         WHERE sl.site_id = s.id AND sl.enabled = 1 AND l.enabled = 1
		           AND t.status = 'validated' AND t.render_key IN ('global-route', 'atlas-commerce')
		       ),
		       (
		         SELECT COUNT(*) FROM content_locales cl
		         JOIN contents c ON c.id = cl.content_id
		         JOIN site_languages sl ON sl.site_id = cl.site_id AND sl.locale = cl.locale
		         JOIN languages l ON l.id = sl.language_id
		         JOIN theme_packages t ON t.id = sl.theme_package_id
		         WHERE cl.site_id = s.id AND c.deleted_at IS NULL
		           AND cl.status = 'published' AND cl.robots_index = 1 AND (c.content_type <> 'page' OR cl.index_policy = 'index')
		           AND (cl.scheduled_at IS NULL OR cl.scheduled_at = '' OR datetime(cl.scheduled_at) <= datetime(?))
		           AND sl.enabled = 1 AND l.enabled = 1
		           AND t.status = 'validated' AND t.render_key IN ('global-route', 'atlas-commerce')
		       ) + (
		         SELECT COUNT(*) FROM taxonomy_terms term
		         WHERE term.site_id = s.id AND term.status = 'active' AND EXISTS(
		           SELECT 1 FROM content_taxonomy_terms ct
		           JOIN content_locales cl ON cl.id = ct.content_locale_id
		           JOIN contents c ON c.id = cl.content_id
		           JOIN site_languages sl ON sl.site_id = cl.site_id AND sl.locale = cl.locale
		           JOIN languages l ON l.id = sl.language_id
		           JOIN theme_packages t ON t.id = sl.theme_package_id
		           WHERE ct.term_id = term.id AND c.deleted_at IS NULL
		             AND cl.status = 'published' AND cl.robots_index = 1 AND (c.content_type <> 'page' OR cl.index_policy = 'index')
		             AND (cl.scheduled_at IS NULL OR cl.scheduled_at = '' OR datetime(cl.scheduled_at) <= datetime(?))
		             AND sl.enabled = 1 AND l.enabled = 1
		             AND t.status = 'validated' AND t.render_key IN ('global-route', 'atlas-commerce')
		         )
		       ),
		       (
		         SELECT COUNT(*) FROM content_locales cl
		         JOIN contents c ON c.id = cl.content_id
		         JOIN site_languages sl ON sl.site_id = cl.site_id AND sl.locale = cl.locale
		         JOIN languages l ON l.id = sl.language_id
		         JOIN theme_packages t ON t.id = sl.theme_package_id
		         WHERE cl.site_id = s.id AND c.deleted_at IS NULL
		           AND cl.status = 'published'
		           AND (cl.scheduled_at IS NULL OR cl.scheduled_at = '' OR datetime(cl.scheduled_at) <= datetime(?))
		           AND (cl.index_policy = 'noindex' OR cl.robots_index = 0)
		           AND sl.enabled = 1 AND l.enabled = 1
		           AND t.status = 'validated' AND t.render_key IN ('global-route', 'atlas-commerce')
		       ),
		       (
		         SELECT COUNT(*) FROM content_locales cl
		         JOIN contents c ON c.id = cl.content_id
		         JOIN site_languages sl ON sl.site_id = cl.site_id AND sl.locale = cl.locale
		         JOIN languages l ON l.id = sl.language_id
		         JOIN theme_packages t ON t.id = sl.theme_package_id
		         WHERE cl.site_id = s.id AND c.deleted_at IS NULL AND c.content_type = 'page' AND cl.index_policy = 'noindex'
		           AND cl.status = 'published'
		           AND (cl.scheduled_at IS NULL OR cl.scheduled_at = '' OR datetime(cl.scheduled_at) <= datetime(?))
		           AND sl.enabled = 1 AND l.enabled = 1
		           AND t.status = 'validated' AND t.render_key IN ('global-route', 'atlas-commerce')
		       ),
		       s.updated_at
		FROM sites s
		WHERE s.status <> 'disabled' AND EXISTS(
			SELECT 1 FROM user_access_scopes uas
			WHERE uas.user_id = ? AND (uas.site_id = 0 OR uas.site_id = s.id)
		)
		ORDER BY s.local_port, s.id`, nowUTC(), nowUTC(), nowUTC(), nowUTC(), userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]SitemapSiteStatus, 0)
	for rows.Next() {
		var item SitemapSiteStatus
		if err = rows.Scan(
			&item.SiteID, &item.Name, &item.Code, &item.PrimaryDomain, &item.LocalPort, &item.Status,
			&item.LanguageCount, &item.IndexablePageCount, &item.NoindexPageCount, &item.SinglePageExcludedCount, &item.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}
