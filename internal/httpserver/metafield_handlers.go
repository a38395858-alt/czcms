package httpserver

import (
	"net/http"
	"strconv"

	"czcms/internal/audit"
	"czcms/internal/catalog"
	"github.com/go-chi/chi/v5"
)

func (s *server) listMetafieldDefinitions(w http.ResponseWriter, r *http.Request) {
	items, err := s.Catalog.ListMetafieldDefinitions(r.Context(), r.URL.Query().Get("owner_type"), r.URL.Query().Get("status"))
	if err != nil { writeCatalogError(w, err, "读取元字段失败"); return }
	writeJSON(w, http.StatusOK, map[string]any{"definitions": items})
}

func (s *server) createMetafieldDefinition(w http.ResponseWriter, r *http.Request) {
	var input catalog.MetafieldDefinitionInput
	if err := decodeJSON(w, r, &input, 64<<10); err != nil { return }
	session := sessionFromContext(r.Context())
	item, err := s.Catalog.CreateMetafieldDefinition(r.Context(), session.User.ID, input)
	if err != nil { writeCatalogError(w, err, "创建元字段失败"); return }
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "metafield.created", TargetType: "metafield_definition", TargetID: strconv.FormatInt(item.ID, 10), Success: true, Metadata: map[string]any{"namespace": item.Namespace, "key": item.Key, "owner_type": item.OwnerType}})
	writeJSON(w, http.StatusCreated, item)
}

func (s *server) updateMetafieldDefinition(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "definitionID", "元字段")
	if !ok { return }
	var input catalog.MetafieldDefinitionInput
	if err := decodeJSON(w, r, &input, 64<<10); err != nil { return }
	session := sessionFromContext(r.Context())
	item, err := s.Catalog.UpdateMetafieldDefinition(r.Context(), id, input)
	if err != nil { writeCatalogError(w, err, "更新元字段失败"); return }
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "metafield.updated", TargetType: "metafield_definition", TargetID: strconv.FormatInt(item.ID, 10), Success: true, Metadata: map[string]any{"version": item.Version}})
	writeJSON(w, http.StatusOK, item)
}

func (s *server) listMetafieldValues(w http.ResponseWriter, r *http.Request) {
	ownerID, err := strconv.ParseInt(chi.URLParam(r, "ownerID"), 10, 64)
	if err != nil || ownerID < 1 { writeJSONError(w, http.StatusBadRequest, "对象 ID 无效"); return }
	siteID := queryInt64(r, "site_id"); locale := r.URL.Query().Get("locale"); ownerType := r.URL.Query().Get("owner_type")
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.read", siteID, locale) { return }
	items, err := s.Catalog.ListMetafieldValues(r.Context(), ownerType, ownerID, siteID, locale)
	if err != nil { writeCatalogError(w, err, "读取元字段值失败"); return }
	writeJSON(w, http.StatusOK, map[string]any{"values": items})
}

func (s *server) upsertMetafieldValue(w http.ResponseWriter, r *http.Request) {
	var input catalog.MetafieldValue
	if err := decodeJSON(w, r, &input, 256<<10); err != nil { return }
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.write", input.SiteID, input.Locale) { return }
	item, err := s.Catalog.UpsertMetafieldValue(r.Context(), input)
	if err != nil { writeCatalogError(w, err, "保存元字段值失败"); return }
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "metafield.value_updated", TargetType: "metafield_value", TargetID: strconv.FormatInt(item.ID, 10), Success: true, Metadata: map[string]any{"definition_id": item.DefinitionID, "owner_id": item.OwnerID, "site_id": item.SiteID, "locale": item.Locale}})
	writeJSON(w, http.StatusOK, item)
}
