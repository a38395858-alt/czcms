package httpserver

import (
	"errors"
	"net/http"
	"strconv"

	"czcms/internal/audit"
	"czcms/internal/mailer"
)

func (s *server) smtpSettings(w http.ResponseWriter, r *http.Request) {
	item, err := s.Mail.Settings(r.Context())
	if err != nil {
		writeJSONError(w, 500, "读取邮件配置失败")
		return
	}
	writeJSON(w, 200, item)
}

func (s *server) smtpSave(w http.ResponseWriter, r *http.Request) {
	var input mailer.Input
	if decodeJSON(w, r, &input, 16<<10) != nil {
		return
	}
	item, err := s.Mail.Save(r.Context(), input)
	if err != nil {
		writeMailError(w, err, "保存邮件配置失败")
		return
	}
	session := sessionFromContext(r.Context())
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "system.smtp_updated", TargetType: "smtp_settings", TargetID: "1", Success: true, Metadata: map[string]any{"enabled": item.Enabled, "host": item.Host, "recipient": item.Recipient}})
	writeJSON(w, 200, item)
}

func (s *server) smtpTest(w http.ResponseWriter, r *http.Request) {
	session := sessionFromContext(r.Context())
	if !s.mediaImportLimiter.Allow("smtp-test:" + strconv.FormatInt(session.User.ID, 10)) {
		writeJSONError(w, 429, "测试过于频繁，请稍后再试")
		return
	}
	err := s.Mail.Test(r.Context())
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "system.smtp_tested", TargetType: "smtp_settings", TargetID: "1", Success: err == nil})
	if err != nil {
		writeJSONError(w, http.StatusBadGateway, err.Error())
		return
	}
	writeJSON(w, 200, map[string]string{"message": "SMTP 已接受测试邮件，请检查收件箱及垃圾邮件。"})
}

func (s *server) smtpDeliveries(w http.ResponseWriter, r *http.Request) {
	offset := queryInt(r, "offset")
	if offset < 0 {
		offset = 0
	}
	items, total, err := s.Mail.Deliveries(r.Context(), offset)
	if err != nil {
		writeJSONError(w, 500, "读取邮件发送记录失败")
		return
	}
	writeJSON(w, 200, map[string]any{"deliveries": items, "total": total, "offset": offset, "limit": 25})
}

func (s *server) smtpRetry(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "deliveryID", "邮件发送记录")
	if !ok {
		return
	}
	if err := s.Mail.Retry(r.Context(), id); err != nil {
		writeMailError(w, err, "重发邮件失败")
		return
	}
	session := sessionFromContext(r.Context())
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "system.smtp_retried", TargetType: "mail_delivery", TargetID: strconv.FormatInt(id, 10), Success: true})
	writeJSON(w, 200, map[string]bool{"queued": true})
}

func writeMailError(w http.ResponseWriter, err error, fallback string) {
	switch {
	case errors.Is(err, mailer.ErrInvalid):
		writeJSONError(w, 422, err.Error())
	case errors.Is(err, mailer.ErrConflict):
		writeJSONError(w, 409, err.Error())
	case errors.Is(err, mailer.ErrNotFound):
		writeJSONError(w, 404, err.Error())
	default:
		writeJSONError(w, 500, fallback)
	}
}
