package catalog

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

// PublishedContentNeighbors returns the immediately older and newer entries
// in the same site, locale and content type. It is independent of index limits.
func (s *Service) PublishedContentNeighbors(ctx context.Context, current ContentLocale) (previous, next *ContentLocale, err error) {
	if current.ContentType != "article" && current.ContentType != "product" {
		return nil, nil, nil
	}
	query := `SELECT cl.slug FROM content_locales cl JOIN contents c ON c.id=cl.content_id
 JOIN sites s ON s.id=cl.site_id
 WHERE c.deleted_at IS NULL AND s.status<>'disabled' AND cl.site_id=? AND cl.locale=? AND c.content_type=?
 AND cl.status='published' AND (cl.scheduled_at IS NULL OR cl.scheduled_at='' OR datetime(cl.scheduled_at)<=datetime(?))
 AND EXISTS(SELECT 1 FROM site_languages sl JOIN languages l ON l.id=sl.language_id
 WHERE sl.site_id=cl.site_id AND sl.locale=cl.locale AND sl.enabled=1 AND l.enabled=1)
 AND (COALESCE(cl.published_at,cl.updated_at),cl.id) %s
 (SELECT COALESCE(published_at,updated_at),id FROM content_locales WHERE id=?)
 ORDER BY COALESCE(cl.published_at,cl.updated_at) %s,cl.id %s LIMIT 1`
	for _, direction := range []struct {
		comparison, order string
		target            **ContentLocale
	}{{"<", "DESC", &previous}, {">", "ASC", &next}} {
		var slug string
		e := s.db.QueryRowContext(ctx, fmt.Sprintf(query, direction.comparison, direction.order, direction.order), current.SiteID, current.Locale, current.ContentType, nowUTC(), current.ID).Scan(&slug)
		if errors.Is(e, sql.ErrNoRows) {
			continue
		}
		if e != nil {
			return nil, nil, e
		}
		item, e := s.GetPublishedContentByPath(ctx, current.SiteID, current.Locale, slug)
		if errors.Is(e, ErrNotFound) {
			continue
		}
		if e != nil {
			return nil, nil, e
		}
		*direction.target = &item
	}
	return previous, next, nil
}
