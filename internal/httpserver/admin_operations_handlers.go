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

func (s *server) mediaList(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	result, err := s.Files.ListMedia(r.Context(), filestore.MediaListOptions{
		Query:      strings.TrimSpace(r.URL.Query().Get("q")),
		MissingAlt: r.URL.Query().Get("missing_alt") == "1",
		Limit:      limit,
		Offset:     offset,
	})
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取媒体库失败")
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (s *server) mediaUpdate(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "mediaID"), 10, 64)
	if err != nil || id < 1 {
		writeJSONError(w, http.StatusBadRequest, "媒体 ID 无效")
		return
	}
	var request struct {
		AltText string `json:"alt_text"`
		Version int64  `json:"version"`
	}
	if err = decodeJSON(w, r, &request, 8<<10); err != nil {
		return
	}
	item, err := s.Files.UpdateMediaAlt(r.Context(), id, request.Version, request.AltText)
	if err != nil {
		status := http.StatusUnprocessableEntity
		if errors.Is(err, filestore.ErrMediaNotFound) {
			status = http.StatusNotFound
		} else if errors.Is(err, filestore.ErrMediaConflict) {
			status = http.StatusConflict
		}
		writeJSONError(w, status, err.Error())
		return
	}
	session := sessionFromContext(r.Context())
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "media.alt_updated", TargetType: "media", TargetID: strconv.FormatInt(id, 10), Success: true, Metadata: map[string]any{"alt_length": len([]rune(item.AltText))}})
	writeJSON(w, http.StatusOK, item)
}

func (s *server) mediaDelete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "mediaID"), 10, 64)
	if err != nil || id < 1 {
		writeJSONError(w, http.StatusBadRequest, "媒体 ID 无效")
		return
	}
	var request struct {
		Version int64 `json:"version"`
	}
	if err = decodeJSON(w, r, &request, 8<<10); err != nil {
		return
	}
	if err = s.Files.DeleteMedia(r.Context(), id, request.Version); err != nil {
		status := http.StatusInternalServerError
		switch {
		case errors.Is(err, filestore.ErrMediaNotFound):
			status = http.StatusNotFound
		case errors.Is(err, filestore.ErrMediaConflict):
			status = http.StatusConflict
		case errors.Is(err, filestore.ErrMediaInUse):
			status = http.StatusConflict
		}
		writeJSONError(w, status, err.Error())
		return
	}
	session := sessionFromContext(r.Context())
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "media.deleted", TargetType: "media", TargetID: strconv.FormatInt(id, 10), Success: true})
	w.WriteHeader(http.StatusNoContent)
}

func (s *server) backupList(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	records, err := s.Backups.List(r.Context(), limit)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取备份记录失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"backups": records})
}
