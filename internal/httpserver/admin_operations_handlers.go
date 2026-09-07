package httpserver

import (
	"errors"
	"io"
	"net/http"
	"strconv"
	"strings"

	"czcms/internal/audit"
	"czcms/internal/backup"
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

func (s *server) backupDownload(w http.ResponseWriter, r *http.Request) {
	recordID, err := strconv.ParseInt(chi.URLParam(r, "backupID"), 10, 64)
	if err != nil || recordID < 1 {
		writeJSONError(w, http.StatusBadRequest, "备份 ID 无效")
		return
	}
	record, file, err := s.Backups.Open(r.Context(), recordID)
	if err != nil {
		writeJSONError(w, http.StatusNotFound, "备份文件不存在或不可读取")
		return
	}
	defer file.Close()
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", "attachment; filename="+strconv.Quote(record.StorageName))
	w.Header().Set("Content-Length", strconv.FormatInt(record.ByteSize, 10))
	w.Header().Set("Cache-Control", "no-store")
	session := sessionFromContext(r.Context())
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "backup.exported", TargetType: "backup", TargetID: strconv.FormatInt(record.ID, 10), Success: true, Metadata: map[string]any{"sha256": record.SHA256, "scope": record.Scope}})
	_, _ = io.Copy(w, file)
}

func (s *server) backupImport(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, s.Backups.MaxImportBytes()+1)
	file, header, err := r.FormFile("file")
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "请选择要导入的 .czb 加密备份文件")
		return
	}
	defer file.Close()
	if !strings.HasSuffix(strings.ToLower(header.Filename), ".czb") {
		writeJSONError(w, http.StatusBadRequest, "只能导入 .czb 加密备份文件")
		return
	}
	session := sessionFromContext(r.Context())
	record, err := s.Backups.Import(r.Context(), file, header.Size, session.User.ID)
	if err != nil {
		s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "backup.import_failed", TargetType: "backup", Success: false, Metadata: map[string]any{"reason": err.Error()}})
		writeJSONError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "backup.imported", TargetType: "backup", TargetID: strconv.FormatInt(record.ID, 10), Success: true, Metadata: map[string]any{"sha256": record.SHA256, "scope": record.Scope}})
	writeJSON(w, http.StatusCreated, record)
}

func (s *server) backupDelete(w http.ResponseWriter, r *http.Request) {
	recordID, err := strconv.ParseInt(chi.URLParam(r, "backupID"), 10, 64)
	if err != nil || recordID < 1 {
		writeJSONError(w, http.StatusBadRequest, "备份 ID 无效")
		return
	}
	if err = s.Backups.Delete(r.Context(), recordID); err != nil {
		writeBackupDeleteError(w, err)
		return
	}
	session := sessionFromContext(r.Context())
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "backup.deleted", TargetType: "backup", TargetID: strconv.FormatInt(recordID, 10), Success: true, Metadata: map[string]any{"count": 1}})
	writeJSON(w, http.StatusOK, map[string]any{"deleted": 1})
}

func (s *server) backupBulkDelete(w http.ResponseWriter, r *http.Request) {
	var input struct {
		BackupIDs []int64 `json:"backup_ids"`
	}
	if err := decodeJSON(w, r, &input, 16<<10); err != nil {
		return
	}
	if len(input.BackupIDs) < 1 || len(input.BackupIDs) > 100 {
		writeJSONError(w, http.StatusBadRequest, "批量删除必须选择 1 到 100 个备份")
		return
	}
	deleted, err := s.Backups.DeleteMany(r.Context(), input.BackupIDs)
	if err != nil {
		writeBackupDeleteError(w, err)
		return
	}
	session := sessionFromContext(r.Context())
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "backup.bulk_deleted", TargetType: "backup", TargetID: "bulk", Success: true, Metadata: map[string]any{"count": deleted, "backup_ids": input.BackupIDs}})
	writeJSON(w, http.StatusOK, map[string]any{"deleted": deleted})
}

func writeBackupDeleteError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, backup.ErrNotFound):
		writeJSONError(w, http.StatusNotFound, "备份不存在或已被删除")
	case errors.Is(err, backup.ErrInvalidIDs):
		writeJSONError(w, http.StatusBadRequest, "备份 ID 无效或重复")
	default:
		writeJSONError(w, http.StatusInternalServerError, "删除备份失败，请检查存储目录权限")
	}
}
