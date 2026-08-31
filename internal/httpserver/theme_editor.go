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

func (s *server) listThemeFiles(w http.ResponseWriter, r *http.Request) {
	themeID, ok := pathID(w, r, "themeID", "模板")
	if !ok {
		return
	}
	items, err := s.Files.ListThemeFiles(r.Context(), themeID)
	if err != nil {
		if errors.Is(err, filestore.ErrThemeFileNotFound) {
			writeJSONError(w, http.StatusNotFound, err.Error())
			return
		}
		writeJSONError(w, http.StatusInternalServerError, "读取模板文件失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"files": items})
}

func (s *server) validateThemeFile(w http.ResponseWriter, r *http.Request) {
	themeID, ok := pathID(w, r, "themeID", "模板")
	if !ok {
		return
	}
	key := strings.TrimSpace(chi.URLParam(r, "fileKey"))
	var request struct {
		Content string `json:"content"`
	}
	if err := decodeJSON(w, r, &request, (2<<20)+4096); err != nil {
		return
	}
	result, err := s.Files.ValidateThemeFile(r.Context(), themeID, key, request.Content)
	if err != nil {
		if errors.Is(err, filestore.ErrThemeFileNotFound) {
			writeJSONError(w, http.StatusNotFound, err.Error())
			return
		}
		writeJSONError(w, http.StatusInternalServerError, "校验模板文件失败")
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (s *server) updateThemeFile(w http.ResponseWriter, r *http.Request) {
	themeID, ok := pathID(w, r, "themeID", "模板")
	if !ok {
		return
	}
	key := strings.TrimSpace(chi.URLParam(r, "fileKey"))
	var request struct {
		Content    string `json:"content"`
		Version    int64  `json:"version"`
		ChangeNote string `json:"change_note"`
	}
	if err := decodeJSON(w, r, &request, (2<<20)+8192); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	item, err := s.Files.UpdateThemeFile(r.Context(), themeID, key, request.Content, request.Version, session.User.ID, request.ChangeNote)
	if err != nil {
		status := http.StatusUnprocessableEntity
		switch {
		case errors.Is(err, filestore.ErrThemeFileNotFound):
			status = http.StatusNotFound
		case errors.Is(err, filestore.ErrThemeFileConflict):
			status = http.StatusConflict
		}
		s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "template.file_update_rejected", TargetType: "theme_file", TargetID: strconv.FormatInt(themeID, 10) + ":" + key, Success: false, Metadata: map[string]any{"reason": err.Error(), "version": request.Version}})
		writeJSONError(w, status, err.Error())
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "template.file_updated", TargetType: "theme_file", TargetID: strconv.FormatInt(themeID, 10) + ":" + key, Success: true, Metadata: map[string]any{"version": item.Version, "bytes": item.ByteSize, "lines": item.LineCount, "change_note": strings.TrimSpace(request.ChangeNote)}})
	writeJSON(w, http.StatusOK, item)
}
