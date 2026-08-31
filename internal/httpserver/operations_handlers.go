package httpserver

import (
	"net/http"
	"strconv"

	"czcms/internal/audit"
	"czcms/internal/catalog"
)

func (s *server) listURLRedirects(w http.ResponseWriter, r *http.Request) {
	session := sessionFromContext(r.Context())
	items, err := s.Catalog.ListURLRedirects(r.Context(), session.User.ID, queryInt64(r, "site_id"))
	if err != nil {
		writeCatalogError(w, err, "读取 URL 规则失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"redirects": items})
}

func (s *server) createURLRedirect(w http.ResponseWriter, r *http.Request) {
	var input catalog.URLRedirectInput
	if err := decodeJSON(w, r, &input, 32<<10); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "publishing.manage", input.SiteID, input.Locale) {
		return
	}
	item, err := s.Catalog.CreateURLRedirect(r.Context(), session.User.ID, input)
	if err != nil {
		writeCatalogError(w, err, "创建 URL 规则失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "url_redirect.created", TargetType: "url_redirect", TargetID: strconv.FormatInt(item.ID, 10), Success: true, Metadata: map[string]any{"site_id": item.SiteID, "locale": item.Locale, "status_code": item.StatusCode}})
	writeJSON(w, http.StatusCreated, item)
}

func (s *server) updateURLRedirect(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "redirectID", "URL 规则")
	if !ok {
		return
	}
	var input catalog.URLRedirectInput
	if err := decodeJSON(w, r, &input, 32<<10); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "publishing.manage", input.SiteID, input.Locale) {
		return
	}
	item, err := s.Catalog.UpdateURLRedirect(r.Context(), session.User.ID, id, input)
	if err != nil {
		writeCatalogError(w, err, "更新 URL 规则失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "url_redirect.updated", TargetType: "url_redirect", TargetID: strconv.FormatInt(item.ID, 10), Success: true, Metadata: map[string]any{"site_id": item.SiteID, "locale": item.Locale, "status_code": item.StatusCode}})
	writeJSON(w, http.StatusOK, item)
}

func (s *server) deleteURLRedirect(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "redirectID", "URL 规则")
	if !ok {
		return
	}
	var input struct {
		Version int64 `json:"version"`
	}
	if err := decodeJSON(w, r, &input, 4<<10); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	if err := s.Catalog.DeleteURLRedirect(r.Context(), session.User.ID, id, input.Version); err != nil {
		writeCatalogError(w, err, "删除 URL 规则失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "url_redirect.deleted", TargetType: "url_redirect", TargetID: strconv.FormatInt(id, 10), Success: true})
	w.WriteHeader(http.StatusNoContent)
}

func (s *server) listThemePackages(w http.ResponseWriter, r *http.Request) {
	items, err := s.Catalog.ListThemePackages(r.Context())
	if err != nil {
		writeCatalogError(w, err, "读取模板失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"templates": items})
}

func (s *server) listPublishingReleases(w http.ResponseWriter, r *http.Request) {
	session := sessionFromContext(r.Context())
	items, err := s.Catalog.ListPublishingReleases(r.Context(), session.User.ID, queryInt64(r, "site_id"))
	if err != nil {
		writeCatalogError(w, err, "读取发布记录失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"releases": items})
}

func (s *server) createPublishingRelease(w http.ResponseWriter, r *http.Request) {
	var input catalog.PublishingReleaseInput
	if err := decodeJSON(w, r, &input, 32<<10); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "publishing.manage", input.SiteID, input.Locale) {
		return
	}
	item, err := s.Catalog.CreatePublishingRelease(r.Context(), session.User.ID, input)
	if err != nil {
		writeCatalogError(w, err, "创建发布失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "publishing.completed", TargetType: "release", TargetID: strconv.FormatInt(item.ID, 10), Success: true, Metadata: map[string]any{"site_id": item.SiteID, "locale": item.Locale, "release_type": item.ReleaseType, "page_count": item.PageCount}})
	writeJSON(w, http.StatusCreated, item)
}
