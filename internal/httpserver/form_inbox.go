package httpserver

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"czcms/internal/audit"
	"czcms/internal/catalog"
)

var submissionStatuses = map[string]bool{"new": true, "processing": true, "contacted": true, "invalid": true, "closed": true}

func (s *server) listFormSubmissions(w http.ResponseWriter, r *http.Request) {
	userID := sessionFromContext(r.Context()).User.ID
	limit, offset := queryInt(r, "limit"), queryInt(r, "offset")
	if limit < 1 || limit > 100 {
		limit = 25
	}
	if offset < 0 {
		offset = 0
	}
	status := strings.TrimSpace(r.URL.Query().Get("status"))
	if status != "" && !submissionStatuses[status] {
		writeJSONError(w, 400, "跟进状态无效")
		return
	}
	where := ` WHERE EXISTS(SELECT 1 FROM user_access_scopes uas WHERE uas.user_id=? AND (uas.site_id=0 OR uas.site_id=fs.site_id) AND (uas.locale='*' OR uas.locale=fs.locale))`
	args := []any{userID}
	for _, filter := range []struct {
		column string
		value  int64
	}{{"fs.site_id", queryInt64(r, "site_id")}, {"fs.form_id", queryInt64(r, "form_id")}} {
		if filter.value > 0 {
			where += " AND " + filter.column + "=?"
			args = append(args, filter.value)
		}
	}
	if locale := strings.TrimSpace(r.URL.Query().Get("locale")); locale != "" {
		where += " AND fs.locale=?"
		args = append(args, locale)
	}
	keyword := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	if utf8.RuneCountInString(keyword) > 200 {
		writeJSONError(w, http.StatusBadRequest, "搜索内容最多 200 字")
		return
	}
	summaryQuery := `SELECT fs.status,COUNT(*) FROM form_submissions fs` + where + ` GROUP BY fs.status`
	summaryRows, err := s.DB.QueryContext(r.Context(), summaryQuery, args...)
	if err != nil {
		writeJSONError(w, 500, "读取表单收件箱失败")
		return
	}
	summary := map[string]int{"new": 0, "processing": 0, "contacted": 0, "closed": 0, "invalid": 0}
	for summaryRows.Next() {
		var key string
		var count int
		if err = summaryRows.Scan(&key, &count); err != nil {
			summaryRows.Close()
			writeJSONError(w, 500, "读取表单状态失败")
			return
		}
		summary[key] = count
	}
	err = summaryRows.Err()
	summaryRows.Close()
	if err != nil {
		writeJSONError(w, 500, "读取表单状态失败")
		return
	}
	query := `SELECT fs.id,fs.form_id,fs.site_id,fs.locale,fs.source_path,fs.status,fs.values_encrypted,fs.created_at,fs.updated_at,f.name,s.name,fs.notes_encrypted,fs.version
 FROM form_submissions fs JOIN forms f ON f.id=fs.form_id JOIN sites s ON s.id=fs.site_id` + where
	queryArgs := append([]any(nil), args...)
	if status != "" && keyword == "" {
		query += " AND fs.status=?"
		queryArgs = append(queryArgs, status)
	}
	// Searching encrypted customer fields requires decryption, but only after
	// SQL has applied the user's site and locale access scope.
	items := []catalog.FormSubmission{}
	total := 0
	if keyword == "" {
		countQuery := `SELECT COUNT(*) FROM form_submissions fs` + where
		if status != "" {
			countQuery += " AND fs.status=?"
		}
		if err = s.DB.QueryRowContext(r.Context(), countQuery, queryArgs...).Scan(&total); err != nil {
			writeJSONError(w, 500, "读取表单数量失败")
			return
		}
		query += " ORDER BY fs.id DESC LIMIT ? OFFSET ?"
		queryArgs = append(queryArgs, limit, offset)
	} else {
		query += " ORDER BY fs.id DESC"
		for key := range summary {
			summary[key] = 0
		}
	}
	rows, err := s.DB.QueryContext(r.Context(), query, queryArgs...)
	if err != nil {
		writeJSONError(w, 500, "读取表单收件箱失败")
		return
	}
	defer rows.Close()
	for rows.Next() {
		var item catalog.FormSubmission
		var encrypted, notes []byte
		if err = rows.Scan(&item.ID, &item.FormID, &item.SiteID, &item.Locale, &item.SourcePath, &item.Status, &encrypted, &item.CreatedAt, &item.UpdatedAt, &item.FormName, &item.SiteName, &notes, &item.Version); err != nil {
			writeJSONError(w, 500, "读取表单记录失败")
			return
		}
		plain, e := s.Keys.Decrypt("form-submission", encrypted)
		if e != nil || json.Unmarshal(plain, &item.Values) != nil {
			writeJSONError(w, 500, "表单内容无法解密，请联系管理员")
			return
		}
		if len(notes) > 0 {
			plain, e = s.Keys.Decrypt("form-submission-note", notes)
			if e != nil {
				writeJSONError(w, 500, "跟进备注无法解密")
				return
			}
			item.Notes = string(plain)
		}
		if keyword != "" {
			parts := []string{item.FormName, item.SiteName, item.SourcePath, item.Locale, "FV-" + strconv.FormatInt(item.ID, 10), item.Notes}
			for _, value := range item.Values {
				parts = append(parts, value)
			}
			if !strings.Contains(strings.ToLower(strings.Join(parts, "\n")), keyword) {
				continue
			}
			summary[item.Status]++
			if status != "" && item.Status != status {
				continue
			}
			if total >= offset && len(items) < limit {
				items = append(items, item)
			}
			total++
			continue
		}
		items = append(items, item)
	}
	if rows.Err() != nil {
		writeJSONError(w, 500, "读取表单收件箱失败")
		return
	}
	writeJSON(w, 200, map[string]any{"submissions": items, "total": total, "limit": limit, "offset": offset, "summary": summary})
}

func (s *server) updateFormSubmissionStatus(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "submissionID", "表单记录")
	if !ok {
		return
	}
	var input struct {
		Status  string  `json:"status"`
		Notes   *string `json:"notes"`
		Version *int64  `json:"version"`
	}
	if decodeJSON(w, r, &input, 32<<10) != nil {
		return
	}
	if !submissionStatuses[input.Status] || (input.Notes != nil && utf8.RuneCountInString(*input.Notes) > 5000) {
		writeJSONError(w, 422, "请选择有效状态，备注最多 5000 字")
		return
	}
	var siteID, version int64
	var locale string
	var encrypted []byte
	err := s.DB.QueryRowContext(r.Context(), `SELECT site_id,locale,version,notes_encrypted FROM form_submissions WHERE id=?`, id).Scan(&siteID, &locale, &version, &encrypted)
	if errors.Is(err, sql.ErrNoRows) {
		writeJSONError(w, 404, "表单记录不存在")
		return
	}
	if err != nil {
		writeJSONError(w, 500, "读取表单记录失败")
		return
	}
	userID := sessionFromContext(r.Context()).User.ID
	if !s.canAccess(w, r, userID, "content.write", siteID, locale) {
		return
	}
	if input.Version != nil && *input.Version != version {
		writeJSONError(w, 409, "记录已被更新，请刷新后重新编辑")
		return
	}
	if input.Notes != nil {
		encrypted, err = s.Keys.Encrypt("form-submission-note", []byte(strings.TrimSpace(*input.Notes)))
		if err != nil {
			writeJSONError(w, 500, "保存备注失败")
			return
		}
	}
	updateSQL := `UPDATE form_submissions SET status=?,updated_at=?,version=version+1 WHERE id=? AND version=?`
	updateArgs := []any{input.Status, time.Now().UTC().Format(time.RFC3339), id, version}
	if input.Notes != nil {
		updateSQL = `UPDATE form_submissions SET status=?,notes_encrypted=?,updated_at=?,version=version+1 WHERE id=? AND version=?`
		updateArgs = []any{input.Status, encrypted, time.Now().UTC().Format(time.RFC3339), id, version}
	}
	result, err := s.DB.ExecContext(r.Context(), updateSQL, updateArgs...)
	if err != nil {
		writeJSONError(w, 500, "保存跟进记录失败")
		return
	}
	changed, _ := result.RowsAffected()
	if changed != 1 {
		writeJSONError(w, 409, "记录已被更新，请刷新后重新编辑")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &userID, Action: "form.submission.updated", TargetType: "form_submission", TargetID: strconv.FormatInt(id, 10), Success: true, Metadata: map[string]any{"status": input.Status}})
	writeJSON(w, 200, map[string]any{"updated": true, "status": input.Status, "version": version + 1})
}
