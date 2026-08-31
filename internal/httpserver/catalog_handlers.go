package httpserver

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"czcms/internal/audit"
	"czcms/internal/authorization"
	"czcms/internal/catalog"

	"github.com/go-chi/chi/v5"
)

func (s *server) listSites(w http.ResponseWriter, r *http.Request) {
	session := sessionFromContext(r.Context())
	items, err := s.Catalog.ListSites(r.Context(), session.User.ID)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取站点失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"sites": items})
}

func (s *server) createSite(w http.ResponseWriter, r *http.Request) {
	var input catalog.SiteInput
	if err := decodeJSON(w, r, &input, 32<<10); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	if input.DefaultThemePackageID > 0 {
		allowed, err := s.Authorization.Can(r.Context(), session.User.ID, "templates.manage")
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "读取模板权限失败")
			return
		}
		if !allowed {
			s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "security.permission_denied", TargetType: "site", Success: false, Metadata: map[string]any{"permission": "templates.manage", "action": "site.create_with_template"}})
			writeJSONError(w, http.StatusForbidden, "没有选择初始模板的权限")
			return
		}
	}
	item, err := s.Catalog.CreateSite(r.Context(), input)
	if err != nil {
		writeCatalogError(w, err, "创建站点失败")
		return
	}
	s.syncLocalPreviews(r)
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "site.created", TargetType: "site", TargetID: strconv.FormatInt(item.ID, 10), Success: true, Metadata: map[string]any{"code": item.Code, "market_code": item.MarketCode, "requested_theme_package_id": input.DefaultThemePackageID}})
	writeJSON(w, http.StatusCreated, item)
}

func (s *server) listSiteLanguages(w http.ResponseWriter, r *http.Request) {
	siteID, ok := pathID(w, r, "siteID", "站点")
	if !ok {
		return
	}
	session := sessionFromContext(r.Context())
	items, err := s.Catalog.ListSiteLanguages(r.Context(), session.User.ID, siteID)
	if err != nil {
		writeCatalogError(w, err, "读取站点语言失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"site_languages": items})
}

func (s *server) listSiteDomains(w http.ResponseWriter, r *http.Request) {
	siteID, ok := pathID(w, r, "siteID", "站点")
	if !ok {
		return
	}
	session := sessionFromContext(r.Context())
	items, err := s.Catalog.ListSiteDomains(r.Context(), session.User.ID, siteID)
	if err != nil {
		writeCatalogError(w, err, "读取域名绑定失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"domains": items})
}

func (s *server) createSiteDomain(w http.ResponseWriter, r *http.Request) {
	siteID, ok := pathID(w, r, "siteID", "站点")
	if !ok {
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "sites.manage", siteID, "*") {
		return
	}
	var input catalog.SiteDomainInput
	if err := decodeJSON(w, r, &input, 16<<10); err != nil {
		return
	}
	item, err := s.Catalog.CreateSiteDomain(r.Context(), siteID, input)
	if err != nil {
		writeCatalogError(w, err, "绑定域名失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "site.domain_created", TargetType: "site_domain", TargetID: strconv.FormatInt(item.ID, 10), Success: true, Metadata: map[string]any{"site_id": siteID, "hostname": item.Hostname, "kind": item.Kind}})
	writeJSON(w, http.StatusCreated, item)
}

func (s *server) updateSiteDomain(w http.ResponseWriter, r *http.Request) {
	siteID, ok := pathID(w, r, "siteID", "站点")
	if !ok {
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "sites.manage", siteID, "*") {
		return
	}
	domainID, ok := pathID(w, r, "domainID", "域名")
	if !ok {
		return
	}
	var input catalog.SiteDomainInput
	if err := decodeJSON(w, r, &input, 16<<10); err != nil {
		return
	}
	item, err := s.Catalog.UpdateSiteDomain(r.Context(), siteID, domainID, input)
	if err != nil {
		writeCatalogError(w, err, "更新域名绑定失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "site.domain_updated", TargetType: "site_domain", TargetID: strconv.FormatInt(item.ID, 10), Success: true, Metadata: map[string]any{"site_id": siteID, "hostname": item.Hostname, "kind": item.Kind, "version": item.Version}})
	writeJSON(w, http.StatusOK, item)
}

func (s *server) deleteSiteDomain(w http.ResponseWriter, r *http.Request) {
	siteID, ok := pathID(w, r, "siteID", "站点")
	if !ok {
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "sites.manage", siteID, "*") {
		return
	}
	domainID, ok := pathID(w, r, "domainID", "域名")
	if !ok {
		return
	}
	var input struct {
		Version int64 `json:"version"`
	}
	if err := decodeJSON(w, r, &input, 4<<10); err != nil {
		return
	}
	if err := s.Catalog.DeleteSiteDomain(r.Context(), siteID, domainID, input.Version); err != nil {
		writeCatalogError(w, err, "删除域名绑定失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "site.domain_deleted", TargetType: "site_domain", TargetID: strconv.FormatInt(domainID, 10), Success: true, Metadata: map[string]any{"site_id": siteID}})
	writeJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

func (s *server) checkSiteDomain(w http.ResponseWriter, r *http.Request) {
	siteID, ok := pathID(w, r, "siteID", "站点")
	if !ok {
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "sites.manage", siteID, "*") {
		return
	}
	domainID, ok := pathID(w, r, "domainID", "域名")
	if !ok {
		return
	}
	item, err := s.Catalog.CheckSiteDomain(r.Context(), siteID, domainID)
	if err != nil {
		writeCatalogError(w, err, "检查 DNS 解析失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "site.domain_checked", TargetType: "site_domain", TargetID: strconv.FormatInt(domainID, 10), Success: item.DNSStatus == "resolved", Metadata: map[string]any{"site_id": siteID, "hostname": item.Hostname, "dns_status": item.DNSStatus, "address_count": len(item.ResolvedAddresses)}})
	writeJSON(w, http.StatusOK, item)
}

func (s *server) updateSite(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "siteID", "站点")
	if !ok {
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "sites.manage", id, "*") {
		return
	}
	var input catalog.SiteInput
	if err := decodeJSON(w, r, &input, 32<<10); err != nil {
		return
	}
	// Site configuration remains editable to site operators, but site-wide SEO
	// defaults are a separate permission boundary. The native form omits these
	// fields when seo.manage is absent, so retain the stored values instead of
	// treating omitted JSON fields as a request to erase them.
	seoAllowed, err := s.Authorization.CanAccess(r.Context(), session.User.ID, "seo.manage", id, "*")
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取 SEO 权限失败")
		return
	}
	if !seoAllowed {
		current, currentErr := s.Catalog.SiteByID(r.Context(), id)
		if currentErr != nil {
			writeCatalogError(w, currentErr, "读取站点 SEO 设置失败")
			return
		}
		input.SEOTitle = current.SEOTitle
		input.SEODescription = current.SEODescription
		input.FaviconMediaID = current.FaviconMediaID
	}
	item, err := s.Catalog.UpdateSite(r.Context(), id, input)
	if err != nil {
		writeCatalogError(w, err, "更新站点失败")
		return
	}
	s.syncLocalPreviews(r)
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "site.updated", TargetType: "site", TargetID: strconv.FormatInt(id, 10), Success: true, Metadata: map[string]any{"version": item.Version}})
	writeJSON(w, http.StatusOK, item)
}

func (s *server) disableSite(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "siteID", "站点")
	if !ok {
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "sites.manage", id, "*") {
		return
	}
	var input struct {
		Version int64 `json:"version"`
	}
	if err := decodeJSON(w, r, &input, 4<<10); err != nil {
		return
	}
	item, err := s.Catalog.DisableSite(r.Context(), id, input.Version)
	if err != nil {
		writeCatalogError(w, err, "停用站点失败")
		return
	}
	s.syncLocalPreviews(r)
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "site.disabled", TargetType: "site", TargetID: strconv.FormatInt(id, 10), Success: true})
	writeJSON(w, http.StatusOK, item)
}

func (s *server) syncLocalPreviews(r *http.Request) {
	if s.SyncLocalPreviews == nil {
		return
	}
	if err := s.SyncLocalPreviews(); err != nil {
		s.Logger.Error("同步站点本地预览端口失败", "error", err, "request_id", r.Header.Get("X-Request-ID"))
	}
}

func (s *server) listLanguages(w http.ResponseWriter, r *http.Request) {
	session := sessionFromContext(r.Context())
	items, err := s.Catalog.ListLanguages(r.Context(), session.User.ID)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取语言失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"languages": items})
}

func (s *server) createLanguage(w http.ResponseWriter, r *http.Request) {
	var input catalog.LanguageInput
	if err := decodeJSON(w, r, &input, 32<<10); err != nil {
		return
	}
	item, err := s.Catalog.CreateLanguage(r.Context(), input)
	if err != nil {
		writeCatalogError(w, err, "添加语言失败")
		return
	}
	session := sessionFromContext(r.Context())
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "language.created", TargetType: "language", TargetID: strconv.FormatInt(item.ID, 10), Success: true, Metadata: map[string]any{"code": item.Code, "locale": item.DefaultLocale}})
	writeJSON(w, http.StatusCreated, item)
}

func (s *server) updateLanguage(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "languageID", "语言")
	if !ok {
		return
	}
	var input catalog.LanguageInput
	if err := decodeJSON(w, r, &input, 32<<10); err != nil {
		return
	}
	item, err := s.Catalog.UpdateLanguage(r.Context(), id, input)
	if err != nil {
		writeCatalogError(w, err, "更新语言失败")
		return
	}
	session := sessionFromContext(r.Context())
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "language.updated", TargetType: "language", TargetID: strconv.FormatInt(id, 10), Success: true, Metadata: map[string]any{"version": item.Version}})
	writeJSON(w, http.StatusOK, item)
}

func (s *server) disableLanguage(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "languageID", "语言")
	if !ok {
		return
	}
	var input struct {
		Version int64 `json:"version"`
	}
	if err := decodeJSON(w, r, &input, 4<<10); err != nil {
		return
	}
	item, err := s.Catalog.DisableLanguage(r.Context(), id, input.Version)
	if err != nil {
		writeCatalogError(w, err, "停用语言失败")
		return
	}
	session := sessionFromContext(r.Context())
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "language.disabled", TargetType: "language", TargetID: strconv.FormatInt(id, 10), Success: true})
	writeJSON(w, http.StatusOK, item)
}

func (s *server) bindSiteLanguage(w http.ResponseWriter, r *http.Request) {
	siteID, ok := pathID(w, r, "siteID", "站点")
	if !ok {
		return
	}
	languageID, ok := pathID(w, r, "languageID", "语言")
	if !ok {
		return
	}
	var input catalog.SiteLanguageInput
	if err := decodeJSON(w, r, &input, 16<<10); err != nil {
		return
	}
	item, err := s.Catalog.BindSiteLanguage(r.Context(), siteID, languageID, input)
	if err != nil {
		writeCatalogError(w, err, "绑定站点语言失败")
		return
	}
	session := sessionFromContext(r.Context())
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "site.language_bound", TargetType: "site_language", TargetID: strconv.FormatInt(siteID, 10) + ":" + strconv.FormatInt(languageID, 10), Success: true, Metadata: map[string]any{"locale": item.Locale, "theme_package_id": item.ThemePackageID, "enabled": item.Enabled}})
	writeJSON(w, http.StatusOK, item)
}

func (s *server) listContents(w http.ResponseWriter, r *http.Request) {
	query := catalog.ContentQuery{
		SiteID:      queryInt64(r, "site_id"),
		Locale:      r.URL.Query().Get("locale"),
		Status:      r.URL.Query().Get("status"),
		ContentType: r.URL.Query().Get("content_type"),
		Search:      r.URL.Query().Get("q"),
		Limit:       queryInt(r, "limit"),
		Offset:      queryInt(r, "offset"),
	}
	session := sessionFromContext(r.Context())
	items, total, err := s.Catalog.ListContents(r.Context(), session.User.ID, query)
	if err != nil {
		writeCatalogError(w, err, "读取内容失败")
		return
	}
	for _, item := range items {
		allowed, accessErr := s.Authorization.CanAccess(r.Context(), session.User.ID, "content.read", item.SiteID, item.Locale)
		if accessErr != nil {
			writeJSONError(w, http.StatusInternalServerError, "读取数据权限失败")
			return
		}
		if !allowed {
			writeJSONError(w, http.StatusForbidden, "内容列表包含未授权的数据范围")
			return
		}
	}
	counts, err := s.Catalog.ContentCountsForType(r.Context(), session.User.ID, query.SiteID, query.Locale, query.ContentType)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取内容统计失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"contents": items, "total": total, "status_counts": counts, "limit": normalizedLimit(query.Limit), "offset": query.Offset})
}

func (s *server) createContent(w http.ResponseWriter, r *http.Request) {
	var input catalog.CreateContentInput
	if err := decodeJSON(w, r, &input, 3<<20); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.write", input.SiteID, input.Locale) {
		return
	}
	if input.SEO != nil && !s.canAccess(w, r, session.User.ID, "seo.manage", input.SiteID, input.Locale) {
		return
	}
	item, err := s.Catalog.CreateContent(r.Context(), session.User.ID, input)
	if err != nil {
		writeCatalogError(w, err, "创建内容失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "content.created", TargetType: "content", TargetID: strconv.FormatInt(item.ContentID, 10), Success: true, Metadata: map[string]any{"site_id": item.SiteID, "locale": item.Locale, "status": item.Status, "version": item.Version}})
	writeJSON(w, http.StatusCreated, item)
}

func (s *server) createContentLocale(w http.ResponseWriter, r *http.Request) {
	contentID, ok := pathID(w, r, "contentID", "内容")
	if !ok {
		return
	}
	var input catalog.CreateContentInput
	if err := decodeJSON(w, r, &input, 3<<20); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.write", input.SiteID, input.Locale) {
		return
	}
	if input.SEO != nil && !s.canAccess(w, r, session.User.ID, "seo.manage", input.SiteID, input.Locale) {
		return
	}
	item, err := s.Catalog.CreateContentLocale(r.Context(), session.User.ID, contentID, input)
	if err != nil {
		writeCatalogError(w, err, "添加语言版本失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "content.locale_created", TargetType: "content_locale", TargetID: strconv.FormatInt(item.ID, 10), Success: true, Metadata: map[string]any{"content_id": item.ContentID, "site_id": item.SiteID, "locale": item.Locale, "status": item.Status, "version": item.Version}})
	writeJSON(w, http.StatusCreated, item)
}

func (s *server) getContentLocale(w http.ResponseWriter, r *http.Request) {
	contentID, ok := pathID(w, r, "contentID", "内容")
	if !ok {
		return
	}
	siteID := queryInt64(r, "site_id")
	locale := chi.URLParam(r, "locale")
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.read", siteID, locale) {
		return
	}
	item, err := s.Catalog.GetContentLocale(r.Context(), contentID, siteID, locale)
	if err != nil {
		writeCatalogError(w, err, "读取内容失败")
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (s *server) updateContentLocale(w http.ResponseWriter, r *http.Request) {
	contentID, ok := pathID(w, r, "contentID", "内容")
	if !ok {
		return
	}
	siteID := queryInt64(r, "site_id")
	locale := chi.URLParam(r, "locale")
	var input catalog.UpdateContentLocaleInput
	if err := decodeJSON(w, r, &input, 3<<20); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.write", siteID, locale) {
		return
	}
	if input.SEO != nil && !s.canAccess(w, r, session.User.ID, "seo.manage", siteID, locale) {
		return
	}
	item, err := s.Catalog.UpdateContentLocale(r.Context(), session.User.ID, contentID, siteID, locale, input)
	if err != nil {
		writeCatalogError(w, err, "更新内容失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "content.updated", TargetType: "content_locale", TargetID: strconv.FormatInt(item.ID, 10), Success: true, Metadata: map[string]any{"content_id": item.ContentID, "site_id": item.SiteID, "locale": item.Locale, "status": item.Status, "version": item.Version, "seo_updated": input.SEO != nil}})
	writeJSON(w, http.StatusOK, item)
}

func (s *server) bulkUpdateContentLocales(w http.ResponseWriter, r *http.Request) {
	var input catalog.BulkContentUpdateInput
	if err := decodeJSON(w, r, &input, 256<<10); err != nil {
		return
	}
	if len(input.Targets) < 1 || len(input.Targets) > 100 {
		writeJSONError(w, http.StatusBadRequest, "批量操作必须选择 1 到 100 个内容版本")
		return
	}
	session := sessionFromContext(r.Context())
	for _, target := range input.Targets {
		if !s.canAccess(w, r, session.User.ID, "content.write", target.SiteID, target.Locale) {
			return
		}
	}
	result, err := s.Catalog.BulkUpdateContentLocales(r.Context(), session.User.ID, input)
	if err != nil {
		writeCatalogError(w, err, "批量更新内容失败")
		return
	}
	metadata := map[string]any{"updated": result.Updated, "status_changed": input.Status != nil, "category_changed": input.Category != nil}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "content.bulk_updated", TargetType: "content_locale", TargetID: "bulk", Success: true, Metadata: metadata})
	writeJSON(w, http.StatusOK, result)
}

func (s *server) deleteContent(w http.ResponseWriter, r *http.Request) {
	contentID, ok := pathID(w, r, "contentID", "内容")
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
	scopes, err := s.Catalog.ContentScopes(r.Context(), contentID)
	if err != nil {
		writeCatalogError(w, err, "读取内容范围失败")
		return
	}
	for _, scope := range scopes {
		if !s.canAccess(w, r, session.User.ID, "content.write", scope.SiteID, scope.Locale) {
			return
		}
	}
	if err = s.Catalog.SoftDeleteContent(r.Context(), contentID, input.Version, session.User.ID); err != nil {
		writeCatalogError(w, err, "删除内容失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "content.deleted", TargetType: "content", TargetID: strconv.FormatInt(contentID, 10), Success: true, Metadata: map[string]any{"soft_delete": true}})
	writeJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

func (s *server) listContentRevisions(w http.ResponseWriter, r *http.Request) {
	contentID, ok := pathID(w, r, "contentID", "内容")
	if !ok {
		return
	}
	session := sessionFromContext(r.Context())
	items, err := s.Catalog.ListRevisions(r.Context(), session.User.ID, contentID, queryInt(r, "limit"))
	if err != nil {
		writeCatalogError(w, err, "读取修订历史失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"revisions": items})
}

func (s *server) restoreContentRevision(w http.ResponseWriter, r *http.Request) {
	contentID, ok := pathID(w, r, "contentID", "内容")
	if !ok {
		return
	}
	revisionID, ok := pathID(w, r, "revisionID", "修订版本")
	if !ok {
		return
	}
	revision, err := s.Catalog.GetContentRevision(r.Context(), revisionID)
	if err != nil || revision.ContentID != contentID {
		if err == nil {
			err = catalog.ErrNotFound
		}
		writeCatalogError(w, err, "读取修订版本失败")
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.write", revision.SiteID, revision.Locale) {
		return
	}
	var input struct {
		Version int64 `json:"version"`
	}
	if err = decodeJSON(w, r, &input, 4<<10); err != nil {
		return
	}
	item, err := s.Catalog.RestoreContentRevision(r.Context(), session.User.ID, contentID, revisionID, input.Version)
	if err != nil {
		writeCatalogError(w, err, "恢复修订版本失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "content.revision_restored", TargetType: "content", TargetID: strconv.FormatInt(contentID, 10), Success: true, Metadata: map[string]any{"revision_id": revisionID, "source_version": revision.Version, "new_version": item.Version, "site_id": item.SiteID, "locale": item.Locale}})
	writeJSON(w, http.StatusOK, item)
}

func (s *server) listTaxonomyTerms(w http.ResponseWriter, r *http.Request) {
	session := sessionFromContext(r.Context())
	items, err := s.Catalog.ListTaxonomy(r.Context(), session.User.ID, queryInt64(r, "site_id"), r.URL.Query().Get("locale"), r.URL.Query().Get("kind"))
	if err != nil {
		writeCatalogError(w, err, "读取栏目与标签失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"terms": items})
}

func (s *server) createTaxonomyTerm(w http.ResponseWriter, r *http.Request) {
	var input catalog.TaxonomyInput
	if err := decodeJSON(w, r, &input, 32<<10); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.write", input.SiteID, input.Locale) {
		return
	}
	item, err := s.Catalog.CreateTaxonomyTerm(r.Context(), input)
	if err != nil {
		writeCatalogError(w, err, "创建栏目或标签失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "taxonomy.created", TargetType: "taxonomy_term", TargetID: strconv.FormatInt(item.ID, 10), Success: true, Metadata: map[string]any{"site_id": item.SiteID, "locale": item.Locale, "kind": item.Kind}})
	writeJSON(w, http.StatusCreated, item)
}

func (s *server) updateTaxonomyTerm(w http.ResponseWriter, r *http.Request) {
	termID, ok := pathID(w, r, "termID", "栏目或标签")
	if !ok {
		return
	}
	current, err := s.Catalog.GetTaxonomyTerm(r.Context(), termID)
	if err != nil {
		writeCatalogError(w, err, "读取栏目或标签失败")
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.write", current.SiteID, current.Locale) {
		return
	}
	var input catalog.TaxonomyInput
	if err = decodeJSON(w, r, &input, 32<<10); err != nil {
		return
	}
	item, err := s.Catalog.UpdateTaxonomyTerm(r.Context(), termID, input)
	if err != nil {
		writeCatalogError(w, err, "更新栏目或标签失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "taxonomy.updated", TargetType: "taxonomy_term", TargetID: strconv.FormatInt(item.ID, 10), Success: true, Metadata: map[string]any{"site_id": item.SiteID, "locale": item.Locale, "kind": item.Kind, "version": item.Version}})
	writeJSON(w, http.StatusOK, item)
}

func (s *server) disableTaxonomyTerm(w http.ResponseWriter, r *http.Request) {
	termID, ok := pathID(w, r, "termID", "栏目或标签")
	if !ok {
		return
	}
	current, err := s.Catalog.GetTaxonomyTerm(r.Context(), termID)
	if err != nil {
		writeCatalogError(w, err, "读取栏目或标签失败")
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.write", current.SiteID, current.Locale) {
		return
	}
	var input struct {
		Version int64 `json:"version"`
	}
	if err = decodeJSON(w, r, &input, 4<<10); err != nil {
		return
	}
	item, err := s.Catalog.DisableTaxonomyTerm(r.Context(), termID, input.Version)
	if err != nil {
		writeCatalogError(w, err, "停用栏目或标签失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "taxonomy.disabled", TargetType: "taxonomy_term", TargetID: strconv.FormatInt(item.ID, 10), Success: true, Metadata: map[string]any{"site_id": item.SiteID, "locale": item.Locale, "kind": item.Kind, "usage_count": item.UsageCount}})
	writeJSON(w, http.StatusOK, item)
}

func (s *server) canAccess(w http.ResponseWriter, r *http.Request, userID int64, permission string, siteID int64, locale string) bool {
	if siteID < 1 || strings.TrimSpace(locale) == "" {
		writeJSONError(w, http.StatusBadRequest, "站点或 Locale 无效")
		return false
	}
	allowed, err := s.Authorization.CanAccess(r.Context(), userID, permission, siteID, locale)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取数据权限失败")
		return false
	}
	if !allowed {
		s.audit(r, audit.Event{ActorUserID: &userID, Action: "security.scope_denied", TargetType: "content_scope", TargetID: strconv.FormatInt(siteID, 10) + ":" + locale, Success: false, Metadata: map[string]any{"permission": permission}})
		writeJSONError(w, http.StatusForbidden, "没有访问此站点或语言数据的权限")
		return false
	}
	return true
}

func pathID(w http.ResponseWriter, r *http.Request, key, label string) (int64, bool) {
	id, err := strconv.ParseInt(chi.URLParam(r, key), 10, 64)
	if err != nil || id < 1 {
		writeJSONError(w, http.StatusBadRequest, label+" ID 无效")
		return 0, false
	}
	return id, true
}

func queryInt64(r *http.Request, key string) int64 {
	value, _ := strconv.ParseInt(r.URL.Query().Get(key), 10, 64)
	return value
}

func queryInt(r *http.Request, key string) int {
	value, _ := strconv.Atoi(r.URL.Query().Get(key))
	return value
}

func normalizedLimit(value int) int {
	if value < 1 || value > 200 {
		return 50
	}
	return value
}

func writeCatalogError(w http.ResponseWriter, err error, fallback string) {
	switch {
	case errors.Is(err, catalog.ErrNotFound):
		writeJSONError(w, http.StatusNotFound, catalog.ErrNotFound.Error())
	case errors.Is(err, catalog.ErrConflict):
		writeJSONError(w, http.StatusConflict, err.Error())
	case errors.Is(err, catalog.ErrInvalid):
		writeJSONError(w, http.StatusUnprocessableEntity, err.Error())
	case errors.Is(err, authorization.ErrForbidden):
		writeJSONError(w, http.StatusForbidden, "没有执行此操作的权限")
	default:
		writeJSONError(w, http.StatusInternalServerError, fallback)
	}
}
