package catalog

import (
	"context"
)

// SitemapEntry is a single public, canonical route eligible for a site's
// sitemap.xml. It deliberately omits non-indexable, scheduled and draft
// records so callers never need to repeat SEO eligibility rules.
type SitemapEntry struct {
	Locale    string `json:"locale"`
	Slug      string `json:"slug"`
	UpdatedAt string `json:"updated_at"`
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
// Single pages follow their explicit index_policy. Contact and legal utility
// pages default to noindex, while about, service and campaign pages can be
// included when an editor enables them.
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
	for rows.Next() {
		var item SitemapEntry
		if err = rows.Scan(&item.Locale, &item.Slug, &item.UpdatedAt); err != nil {
			return nil, err
		}
		entries = append(entries, item)
	}
	return entries, rows.Err()
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
		ORDER BY s.local_port, s.id`, nowUTC(), nowUTC(), nowUTC(), userID)
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
