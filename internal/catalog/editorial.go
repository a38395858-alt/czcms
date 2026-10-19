package catalog

import (
	"context"
	"strings"
)

// Editorial archives are independent of the small homepage list. Keep every
// visibility condition identical for the count, category filter and page query.
const editorialVisibility = ` FROM contents c
 JOIN content_locales cl ON cl.content_id=c.id JOIN sites s ON s.id=cl.site_id
 WHERE c.deleted_at IS NULL AND s.status<>'disabled' AND cl.site_id=? AND cl.locale=?
 AND c.content_type IN ('article','product') AND cl.status='published'
 AND (cl.scheduled_at IS NULL OR cl.scheduled_at='' OR datetime(cl.scheduled_at)<=datetime(?))
 AND EXISTS(SELECT 1 FROM site_languages sl JOIN languages l ON l.id=sl.language_id
 WHERE sl.site_id=cl.site_id AND sl.locale=cl.locale AND sl.enabled=1 AND l.enabled=1)`

func (s *Service) ListPublishedEditorial(ctx context.Context, siteID int64, locale, category string, offset, limit int) ([]ContentLocale, int, error) {
	locale = strings.TrimSpace(locale)
	if siteID < 1 || !localePattern.MatchString(locale) {
		return nil, 0, ErrNotFound
	}
	if offset < 0 {
		offset = 0
	}
	if limit < 1 || limit > 48 {
		limit = 12
	}
	args := []any{siteID, locale, nowUTC()}
	where := editorialVisibility
	if category != "" {
		where += " AND cl.category=?"
		args = append(args, category)
	}
	var total int
	if err := s.db.QueryRowContext(ctx, "SELECT COUNT(*)"+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	// Scalar media projections preserve the scan contract without multiplying
	// rows. Body text is read here so reading estimates match the detail page.
	rows, err := s.db.QueryContext(ctx, `SELECT cl.id,c.id,c.content_type,cl.site_id,s.name,cl.locale,cl.locale,
 cl.status,cl.title,cl.slug,cl.category,cl.tags_json,cl.template_key,cl.page_layout,cl.index_policy,cl.scheduled_at,cl.cover_media_id,cl.gallery_media_ids_json,
 COALESCE((SELECT original_name FROM media_files WHERE id=cl.cover_media_id),''),
 COALESCE((SELECT width FROM media_files WHERE id=cl.cover_media_id),0),
 COALESCE((SELECT height FROM media_files WHERE id=cl.cover_media_id),0),
 cl.summary,cl.body_html,cl.h1,cl.seo_title,cl.meta_description,cl.primary_keyword,cl.secondary_keywords_json,cl.canonical_url,cl.robots_index,
 cl.og_title,cl.og_description,cl.structured_data_json,cl.ai_state,c.owner_id,
 COALESCE((SELECT display_name FROM users WHERE id=c.owner_id),''),cl.version,c.version,cl.published_at,cl.created_at,cl.updated_at`+
		where+` ORDER BY COALESCE(cl.published_at,cl.updated_at) DESC,cl.id DESC LIMIT ? OFFSET ?`, append(args, limit, offset)...)
	if err != nil {
		return nil, 0, err
	}
	items := []ContentLocale{}
	for rows.Next() {
		item, scanErr := scanContentLocale(rows, true)
		if scanErr != nil {
			rows.Close()
			return nil, 0, scanErr
		}
		items = append(items, item)
	}
	err = rows.Err()
	rows.Close()
	if err != nil {
		return nil, 0, err
	}
	for i := range items {
		// Public media URLs are derived by the same boundary as detail pages.
		items[i], err = s.attachGalleryMedia(ctx, items[i])
		if err != nil {
			return nil, 0, err
		}
	}
	return items, total, nil
}

func (s *Service) PublishedEditorialCategories(ctx context.Context, siteID int64, locale string) ([]string, error) {
	rows, err := s.db.QueryContext(ctx, "SELECT DISTINCT cl.category"+editorialVisibility+" AND cl.category<>'' ORDER BY cl.category", siteID, locale, nowUTC())
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	categories := []string{}
	for rows.Next() {
		var category string
		if err := rows.Scan(&category); err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}
	return categories, rows.Err()
}
