package httpserver

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"czcms/internal/audit"
	"czcms/internal/filestore"
	"github.com/go-chi/chi/v5"
)

func (s *server) listThemeAssets(w http.ResponseWriter, r *http.Request) {
	themeID, ok := pathID(w, r, "themeID", "模板"); if !ok { return }; items, err := s.Files.ListThemeAssets(r.Context(), themeID); if err != nil { writeJSONError(w, http.StatusNotFound, "读取模板资源失败"); return }; writeJSON(w, http.StatusOK, map[string]any{"assets": items})
}

func (s *server) validateThemeAsset(w http.ResponseWriter, r *http.Request) {
	themeID, ok := pathID(w, r, "themeID", "模板"); if !ok { return }; var input struct { Content string `json:"content"` }; if err := decodeJSON(w, r, &input, (2<<20)+4096); err != nil { return }; item, err := s.Files.ValidateThemeAsset(r.Context(), themeID, strings.TrimSpace(chi.URLParam(r, "assetKey")), input.Content); if err != nil { writeJSONError(w, http.StatusNotFound, "模板资源不存在"); return }; writeJSON(w, http.StatusOK, item)
}

func (s *server) updateThemeAsset(w http.ResponseWriter, r *http.Request) {
	themeID, ok := pathID(w, r, "themeID", "模板"); if !ok { return }; var input struct { Content string `json:"content"`; Version int64 `json:"version"`; ChangeNote string `json:"change_note"` }; if err := decodeJSON(w, r, &input, (2<<20)+8192); err != nil { return }; session := sessionFromContext(r.Context()); item, err := s.Files.UpdateThemeAsset(r.Context(), themeID, strings.TrimSpace(chi.URLParam(r, "assetKey")), input.Content, input.Version, session.User.ID, input.ChangeNote); if err != nil { status := http.StatusUnprocessableEntity; if errors.Is(err, filestore.ErrThemeFileNotFound) { status = http.StatusNotFound }; if errors.Is(err, filestore.ErrThemeFileConflict) { status = http.StatusConflict }; writeJSONError(w, status, err.Error()); return }; s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "template.asset_updated", TargetType: "theme_asset", TargetID: strconv.FormatInt(themeID, 10)+":"+chi.URLParam(r, "assetKey"), Success: true}); writeJSON(w, http.StatusOK, item)
}

func (s *server) serveThemeAsset(w http.ResponseWriter, r *http.Request) {
	themeID, err := strconv.ParseInt(chi.URLParam(r, "themeID"), 10, 64); if err != nil { http.NotFound(w, r); return }; asset, err := s.Files.GetThemeAsset(r.Context(), themeID, chi.URLParam(r, "assetKey")); if err != nil { http.NotFound(w, r); return }; if asset.Type == "css" { w.Header().Set("Content-Type", "text/css; charset=utf-8") } else { w.Header().Set("Content-Type", "text/javascript; charset=utf-8") }; w.Header().Set("Cache-Control", "public, max-age=300"); w.Header().Set("X-Content-Type-Options", "nosniff"); _, _ = w.Write([]byte(asset.Content))
}
