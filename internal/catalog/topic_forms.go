package catalog

import (
	"context"
	"database/sql"
	"errors"
)

// EnsureTopicEnquiryForm lazily provisions the built-in topic form when the
// first valid enquiry arrives. Rendering a public page never writes to the DB.
// A form disabled by an administrator is kept disabled.
func (s *Service) EnsureTopicEnquiryForm(ctx context.Context, siteID int64, locale string) (Form, error) {
	return s.ensureBuiltinEnquiryForm(ctx, siteID, locale, "topic-enquiry")
}

func (s *Service) EnsureHomeEnquiryForm(ctx context.Context, siteID int64, locale string, newsletter bool) (Form, error) {
	key := "home-enquiry"
	if newsletter {
		key = "newsletter"
	}
	return s.ensureBuiltinEnquiryForm(ctx, siteID, locale, key)
}

func (s *Service) ensureBuiltinEnquiryForm(ctx context.Context, siteID int64, locale, key string) (Form, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return Form{}, err
	}
	defer tx.Rollback()
	if err = requireEnabledSiteLocale(ctx, tx, siteID, locale); err != nil {
		return Form{}, err
	}
	now := nowUTC()
	_, err = tx.ExecContext(ctx, `INSERT INTO forms(site_id, locale, form_key, name, submit_label, status, success_message, notify_enabled, version, created_at, updated_at)
		VALUES (?, ?, ?, ?, 'Request a plan', 'active', 'Thank you. Your enquiry has been received.', 1, 1, ?, ?)
		ON CONFLICT(site_id, locale, form_key) DO NOTHING`, siteID, locale, key, map[string]string{"topic-enquiry": "专题页询盘", "home-enquiry": "首页询盘", "newsletter": "资源订阅"}[key], now, now)
	if err != nil {
		return Form{}, err
	}
	var id int64
	var status string
	err = tx.QueryRowContext(ctx, `SELECT id, status FROM forms WHERE site_id = ? AND locale = ? AND form_key = ?`, siteID, locale, key).Scan(&id, &status)
	if err != nil {
		return Form{}, err
	}
	if status != "active" {
		return Form{}, ErrNotFound
	}
	for i, field := range []struct {
		key, typ, label string
		required        bool
	}{
		{"full_name", "text", "姓名", true}, {"work_email", "email", "工作邮箱", true},
		{"company", "text", "公司", true}, {"phone", "tel", "电话", false},
		{"origin", "text", "起始地", true}, {"destination", "text", "目的地", true},
		{"starting_point", "text", "服务需求", true}, {"cargo_details", "textarea", "产品或货物信息", false},
		{"target_timing", "text", "计划时间", false}, {"additional_context", "textarea", "补充信息", false},
		{"consent", "checkbox", "隐私同意", true},
	} {
		if key == "newsletter" && field.key != "work_email" {
			continue
		}
		if key == "home-enquiry" && (field.key == "company" || field.key == "origin" || field.key == "destination") {
			field.required = false
		}
		_, err = tx.ExecContext(ctx, `INSERT INTO form_fields(form_id, field_key, field_type, label, required, sort_order)
			VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(form_id, field_key) DO NOTHING`, id, field.key, field.typ, field.label, boolInt(field.required), i)
		if err != nil {
			return Form{}, err
		}
	}
	if err = tx.Commit(); err != nil {
		return Form{}, err
	}
	form, err := s.GetForm(ctx, id)
	if errors.Is(err, sql.ErrNoRows) {
		return Form{}, ErrNotFound
	}
	return form, err
}
