package httpserver

import (
	"crypto/subtle"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"czcms/internal/audit"
	"czcms/internal/catalog"

	"github.com/go-chi/chi/v5"
)

func (s *server) listForms(w http.ResponseWriter, r *http.Request) {
	siteID := queryInt64(r, "site_id")
	locale := strings.TrimSpace(r.URL.Query().Get("locale"))
	if siteID < 1 || locale == "" {
		writeJSONError(w, http.StatusBadRequest, "查询表单必须指定站点和 Locale")
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.read", siteID, locale) {
		return
	}
	items, err := s.Catalog.ListForms(r.Context(), siteID, locale)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取表单失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"forms": items})
}

func (s *server) getPageForm(w http.ResponseWriter, r *http.Request) {
	contentLocaleID, ok := pathID(w, r, "contentLocaleID", "页面")
	if !ok {
		return
	}
	siteID, locale, err := s.Catalog.ContentLocaleScope(r.Context(), contentLocaleID)
	if err != nil {
		writeCatalogError(w, err, "读取页面范围失败")
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.read", siteID, locale) {
		return
	}
	item, err := s.Catalog.GetPageForm(r.Context(), contentLocaleID)
	if errors.Is(err, catalog.ErrNotFound) {
		writeJSON(w, http.StatusOK, map[string]any{"form": nil})
		return
	}
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取页面表单失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"form": item})
}

func (s *server) createForm(w http.ResponseWriter, r *http.Request) {
	var input catalog.FormInput
	if err := decodeJSON(w, r, &input, 64<<10); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.write", input.SiteID, input.Locale) {
		return
	}
	item, err := s.Catalog.CreateForm(r.Context(), input, session.User.ID)
	if err != nil {
		writeCatalogError(w, err, "创建表单失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "form.created", TargetType: "form", TargetID: strconv.FormatInt(item.ID, 10), Success: true})
	writeJSON(w, http.StatusCreated, item)
}

func (s *server) getForm(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "formID", "表单")
	if !ok {
		return
	}
	item, err := s.Catalog.GetForm(r.Context(), id)
	if err != nil {
		writeCatalogError(w, err, "读取表单失败")
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.read", item.SiteID, item.Locale) {
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (s *server) updateForm(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "formID", "表单")
	if !ok {
		return
	}
	current, err := s.Catalog.GetForm(r.Context(), id)
	if err != nil {
		writeCatalogError(w, err, "读取表单失败")
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.write", current.SiteID, current.Locale) {
		return
	}
	var input catalog.FormInput
	if err = decodeJSON(w, r, &input, 64<<10); err != nil {
		return
	}
	// Form identity is server-owned; an update cannot move it across a
	// site/locale boundary or change the public submission key by accident.
	input.SiteID, input.Locale, input.Key = current.SiteID, current.Locale, current.Key
	item, err := s.Catalog.UpdateForm(r.Context(), id, input, session.User.ID)
	if err != nil {
		writeCatalogError(w, err, "更新表单失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "form.updated", TargetType: "form", TargetID: strconv.FormatInt(item.ID, 10), Success: true})
	writeJSON(w, http.StatusOK, item)
}

func (s *server) listFormSubmissions(w http.ResponseWriter, r *http.Request) {
	session := sessionFromContext(r.Context())
	siteID := queryInt64(r, "site_id")
	locale := strings.TrimSpace(r.URL.Query().Get("locale"))
	limit := queryInt(r, "limit")
	if limit < 1 || limit > 100 {
		limit = 50
	}
	rows, err := s.DB.QueryContext(r.Context(), `SELECT id, form_id, site_id, locale, source_path, values_encrypted, status, created_at, updated_at FROM form_submissions WHERE (? = 0 OR site_id = ?) AND (? = '' OR locale = ?) AND EXISTS(SELECT 1 FROM user_access_scopes uas WHERE uas.user_id = ? AND (uas.site_id = 0 OR uas.site_id = form_submissions.site_id) AND (uas.locale = '*' OR uas.locale = form_submissions.locale)) ORDER BY created_at DESC, id DESC LIMIT ?`, siteID, siteID, locale, locale, session.User.ID, limit)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取询盘失败")
		return
	}
	defer rows.Close()
	items := make([]catalog.FormSubmission, 0)
	for rows.Next() {
		var item catalog.FormSubmission
		var encrypted []byte
		if err = rows.Scan(&item.ID, &item.FormID, &item.SiteID, &item.Locale, &item.SourcePath, &encrypted, &item.Status, &item.CreatedAt, &item.UpdatedAt); err != nil {
			writeJSONError(w, http.StatusInternalServerError, "读取询盘失败")
			return
		}
		if plain, decErr := s.Keys.Decrypt("form-submission", encrypted); decErr == nil {
			_ = json.Unmarshal(plain, &item.Values)
		}
		items = append(items, item)
	}
	if err = rows.Err(); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取询盘失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"submissions": items})
}

func (s *server) updateFormSubmissionStatus(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "submissionID", "询盘")
	if !ok {
		return
	}
	var input struct {
		Status string `json:"status"`
	}
	if err := decodeJSON(w, r, &input, 4<<10); err != nil {
		return
	}
	input.Status = strings.ToLower(strings.TrimSpace(input.Status))
	allowed := map[string]bool{"new": true, "processing": true, "contacted": true, "invalid": true, "closed": true}
	if !allowed[input.Status] {
		writeJSONError(w, http.StatusBadRequest, "询盘状态无效")
		return
	}
	session := sessionFromContext(r.Context())
	var siteID int64
	var locale string
	if err := s.DB.QueryRowContext(r.Context(), `SELECT site_id, locale FROM form_submissions WHERE id = ?`, id).Scan(&siteID, &locale); errors.Is(err, sql.ErrNoRows) {
		writeJSONError(w, http.StatusNotFound, "询盘不存在")
		return
	} else if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取询盘失败")
		return
	}
	if !s.canAccess(w, r, session.User.ID, "content.read", siteID, locale) {
		return
	}
	result, err := s.DB.ExecContext(r.Context(), `UPDATE form_submissions SET status = ?, updated_at = ? WHERE id = ?`, input.Status, time.Now().UTC().Format(time.RFC3339Nano), id)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "更新询盘状态失败")
		return
	}
	affected, _ := result.RowsAffected()
	if affected != 1 {
		writeJSONError(w, http.StatusNotFound, "询盘不存在")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "form_submission.status_updated", TargetType: "form_submission", TargetID: strconv.FormatInt(id, 10), Success: true, Metadata: map[string]any{"status": input.Status}})
	writeJSON(w, http.StatusOK, map[string]any{"updated": true, "status": input.Status})
}

func (s *server) bindPageForm(w http.ResponseWriter, r *http.Request) {
	contentLocaleID, ok := pathID(w, r, "contentLocaleID", "页面")
	if !ok {
		return
	}
	var input struct {
		FormID int64 `json:"form_id"`
	}
	if err := decodeJSON(w, r, &input, 4<<10); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	siteID, locale, err := s.Catalog.ContentLocaleScope(r.Context(), contentLocaleID)
	if err != nil {
		writeCatalogError(w, err, "读取页面范围失败")
		return
	}
	if !s.canAccess(w, r, session.User.ID, "content.write", siteID, locale) {
		return
	}
	if err = s.Catalog.BindPageForm(r.Context(), contentLocaleID, input.FormID); err != nil {
		writeCatalogError(w, err, "绑定表单失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "form.bound_to_page", TargetType: "page_form", TargetID: strconv.FormatInt(contentLocaleID, 10), Success: true})
	writeJSON(w, http.StatusOK, map[string]bool{"bound": true})
}

func (s *server) submitPublicForm(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.NotFound(w, r)
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 128<<10)
	host := requestHostname(r.Host)
	site, _, err := s.Catalog.SiteByHostname(r.Context(), host)
	if err != nil && chi.URLParam(r, "siteCode") != "" {
		site, err = s.Catalog.SiteByCode(r.Context(), chi.URLParam(r, "siteCode"))
	}
	if err != nil {
		http.NotFound(w, r)
		return
	}
	formKey := strings.ToLower(strings.TrimSpace(chi.URLParam(r, "formKey")))
	form, pageID, err := s.Catalog.PublicFormByKey(r.Context(), site.ID, formKey)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	if !s.validFormOrigin(r) {
		http.Error(w, "请求来源无效", http.StatusForbidden)
		return
	}
	if !s.mediaImportLimiter.Allow("form:" + formKey + ":" + s.clientIP(r)) {
		http.Error(w, "提交过于频繁，请稍后再试", http.StatusTooManyRequests)
		return
	}
	if r.FormValue("website") != "" {
		http.Error(w, "提交失败", http.StatusBadRequest)
		return
	} // honeypot
	values := map[string]string{}
	for _, field := range form.Fields {
		values[field.Key] = strings.TrimSpace(r.FormValue(field.Key))
	}
	if err = catalog.ValidatePublicFormValues(form.Fields, values); err != nil {
		http.Error(w, err.Error(), http.StatusUnprocessableEntity)
		return
	}
	if err := verifyPublicFormToken(s, r.FormValue("form_token"), form.ID, site.ID); err != nil {
		http.Error(w, "表单已过期，请刷新页面后重试", http.StatusForbidden)
		return
	}
	plain, _ := json.Marshal(values)
	encrypted, err := s.Keys.Encrypt("form-submission", plain)
	if err != nil {
		http.Error(w, "提交暂时不可用", http.StatusServiceUnavailable)
		return
	}
	dedupe := catalog.HashSubmission(values)
	id, err := s.Catalog.SaveFormSubmission(r.Context(), form.ID, pageID, site.ID, form.Locale, r.Referer(), dedupe, s.Keys.HMAC("form-ip", s.clientIP(r)), s.Keys.HMAC("form-ua", r.UserAgent()), encrypted)
	if err != nil {
		if strings.Contains(err.Error(), "重复") {
			http.Error(w, err.Error(), http.StatusConflict)
		} else {
			http.Error(w, "提交失败", http.StatusUnprocessableEntity)
		}
		return
	}
	s.audit(r, audit.Event{Action: "form.submitted", TargetType: "form_submission", TargetID: strconv.FormatInt(id, 10), Success: true, Metadata: map[string]any{"form_id": form.ID, "site_id": site.ID, "locale": form.Locale}})
	if wantsJSON(r) {
		writeJSON(w, http.StatusCreated, map[string]any{"submitted": true, "message": form.SuccessMessage})
		return
	}
	http.Redirect(w, r, r.Referer(), http.StatusSeeOther)
}

func wantsJSON(r *http.Request) bool {
	return strings.Contains(r.Header.Get("Accept"), "application/json")
}

func publicFormToken(s *server, formID, siteID int64) string {
	ts := time.Now().Unix()
	value := fmt.Sprintf("%d:%d:%d", formID, siteID, ts)
	return value + "." + s.Keys.HMAC("public-form", value)
}

func verifyPublicFormToken(s *server, token string, formID, siteID int64) error {
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return errors.New("invalid token")
	}
	var id, sid, ts int64
	if _, err := fmt.Sscanf(parts[0], "%d:%d:%d", &id, &sid, &ts); err != nil || id != formID || sid != siteID || time.Since(time.Unix(ts, 0)) > 2*time.Hour || time.Since(time.Unix(ts, 0)) < -5*time.Minute {
		return errors.New("invalid token")
	}
	expected := s.Keys.HMAC("public-form", parts[0])
	if len(expected) != len(parts[1]) || subtle.ConstantTimeCompare([]byte(expected), []byte(parts[1])) != 1 {
		return errors.New("invalid token")
	}
	return nil
}
