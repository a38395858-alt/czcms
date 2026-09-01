package catalog

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/mail"
	"strings"
	"time"
	"unicode/utf8"
)

// ensureDefaultContactFormTx provisions the safe, ready-to-use form attached to
// every contact-page template. It runs in the content transaction so an API
// client cannot create a contact page without its public form.
func ensureDefaultContactFormTx(ctx context.Context, tx *sql.Tx, contentLocaleID, siteID int64, locale, title, slug string, actorUserID int64, now string) error {
	if contentLocaleID < 1 || siteID < 1 {
		return invalid("联系页面或站点无效")
	}
	var existing int
	if err := tx.QueryRowContext(ctx, `SELECT COUNT(*) FROM page_forms WHERE content_locale_id = ?`, contentLocaleID).Scan(&existing); err != nil {
		return err
	}
	if existing > 0 {
		return nil
	}

	labels := map[string]string{
		"name": "姓名 / 联系人", "email": "邮箱", "phone": "联系电话",
		"message": "需求说明", "consent": "我同意使用以上信息处理本次咨询",
	}
	submitLabel, successMessage := "提交咨询", "感谢您的咨询，我们会尽快回复。"
	code := strings.ToLower(strings.TrimSpace(locale))
	switch {
	case strings.HasPrefix(code, "en"):
		labels = map[string]string{"name": "Name", "email": "Email", "phone": "Phone", "message": "Message", "consent": "I agree to the processing of this enquiry"}
		submitLabel, successMessage = "Send enquiry", "Thank you. We will get back to you shortly."
	case strings.HasPrefix(code, "de"):
		labels = map[string]string{"name": "Name", "email": "E-Mail", "phone": "Telefon", "message": "Nachricht", "consent": "Ich stimme der Verarbeitung meiner Anfrage zu"}
		submitLabel, successMessage = "Anfrage senden", "Vielen Dank. Wir melden uns schnellstmöglich bei Ihnen."
	case strings.HasPrefix(code, "fr"):
		labels = map[string]string{"name": "Nom", "email": "E-mail", "phone": "Téléphone", "message": "Message", "consent": "J’accepte le traitement de ma demande"}
		submitLabel, successMessage = "Envoyer la demande", "Merci. Nous vous répondrons rapidement."
	case strings.HasPrefix(code, "es"):
		labels = map[string]string{"name": "Nombre", "email": "Correo electrónico", "phone": "Teléfono", "message": "Mensaje", "consent": "Acepto el tratamiento de esta consulta"}
		submitLabel, successMessage = "Enviar consulta", "Gracias. Nos pondremos en contacto pronto."
	case strings.HasPrefix(code, "it"):
		labels = map[string]string{"name": "Nome", "email": "Email", "phone": "Telefono", "message": "Messaggio", "consent": "Accetto il trattamento della richiesta"}
		submitLabel, successMessage = "Invia richiesta", "Grazie. Ti risponderemo al più presto."
	case strings.HasPrefix(code, "nl"):
		labels = map[string]string{"name": "Naam", "email": "E-mail", "phone": "Telefoon", "message": "Bericht", "consent": "Ik ga akkoord met de verwerking van deze aanvraag"}
		submitLabel, successMessage = "Aanvraag versturen", "Bedankt. We nemen zo snel mogelijk contact met u op."
	}
	name := strings.TrimSpace(title)
	if name == "" {
		name = "联系我们"
	}
	formKey := fmt.Sprintf("contact-enquiry-%d", contentLocaleID)
	result, err := tx.ExecContext(ctx, `INSERT INTO forms(site_id, locale, form_key, name, submit_label, status, success_message, notify_enabled, version, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', ?, 1, 1, ?, ?, ?)`, siteID, locale, formKey, name+" · 询盘表单", submitLabel, successMessage, actorUserID, now, now)
	if err != nil {
		return classifyConstraint(err)
	}
	formID, err := result.LastInsertId()
	if err != nil {
		return err
	}
	fields := []struct {
		key, typ, placeholder string
		required              bool
	}{
		{"name", "text", "", true},
		{"email", "email", "name@example.com", true},
		{"phone", "tel", "+49 30 123456", false},
		{"message", "textarea", "", true},
		{"consent", "checkbox", "", true},
	}
	for i, field := range fields {
		if _, err = tx.ExecContext(ctx, `INSERT INTO form_fields(form_id, field_key, field_type, label, placeholder, help_text, options_json, required, sort_order, validation_json) VALUES (?, ?, ?, ?, ?, '', '[]', ?, ?, '{}')`, formID, field.key, field.typ, labels[field.key], field.placeholder, boolInt(field.required), i); err != nil {
			return classifyConstraint(err)
		}
	}
	_, err = tx.ExecContext(ctx, `INSERT INTO page_forms(content_locale_id, form_id, version, created_at, updated_at) VALUES (?, ?, 1, ?, ?)`, contentLocaleID, formID, now, now)
	return err
}

type Form struct {
	ID             int64       `json:"id"`
	SiteID         int64       `json:"site_id"`
	Locale         string      `json:"locale"`
	Key            string      `json:"form_key"`
	Name           string      `json:"name"`
	SubmitLabel    string      `json:"submit_label"`
	Status         string      `json:"status"`
	SuccessMessage string      `json:"success_message"`
	NotifyEnabled  bool        `json:"notify_enabled"`
	Version        int64       `json:"version"`
	Fields         []FormField `json:"fields"`
	CreatedAt      string      `json:"created_at"`
	UpdatedAt      string      `json:"updated_at"`
}

type FormField struct {
	ID          int64    `json:"id"`
	Key         string   `json:"field_key"`
	Type        string   `json:"field_type"`
	Label       string   `json:"label"`
	Placeholder string   `json:"placeholder"`
	HelpText    string   `json:"help_text"`
	Options     []string `json:"options"`
	Required    bool     `json:"required"`
	SortOrder   int      `json:"sort_order"`
}

type FormFieldInput struct {
	Key         string   `json:"field_key"`
	Type        string   `json:"field_type"`
	Label       string   `json:"label"`
	Placeholder string   `json:"placeholder"`
	HelpText    string   `json:"help_text"`
	Options     []string `json:"options"`
	Required    bool     `json:"required"`
	SortOrder   int      `json:"sort_order"`
}

type FormInput struct {
	SiteID         int64            `json:"site_id"`
	Locale         string           `json:"locale"`
	Key            string           `json:"form_key"`
	Name           string           `json:"name"`
	SubmitLabel    string           `json:"submit_label"`
	Status         string           `json:"status"`
	SuccessMessage string           `json:"success_message"`
	NotifyEnabled  bool             `json:"notify_enabled"`
	Fields         []FormFieldInput `json:"fields"`
	Version        int64            `json:"version,omitempty"`
}

type FormSubmission struct {
	ID         int64             `json:"id"`
	FormID     int64             `json:"form_id"`
	SiteID     int64             `json:"site_id"`
	Locale     string            `json:"locale"`
	SourcePath string            `json:"source_path"`
	Status     string            `json:"status"`
	Values     map[string]string `json:"values,omitempty"`
	CreatedAt  string            `json:"created_at"`
	UpdatedAt  string            `json:"updated_at"`
}

var validFormFieldTypes = map[string]bool{"text": true, "email": true, "tel": true, "country": true, "select": true, "textarea": true, "checkbox": true}

func normalizeFormInput(input *FormInput) {
	input.Locale = strings.TrimSpace(input.Locale)
	input.Key = strings.ToLower(strings.Trim(strings.TrimSpace(input.Key), "/"))
	input.Name = strings.TrimSpace(input.Name)
	input.Status = strings.ToLower(strings.TrimSpace(input.Status))
	input.SuccessMessage = strings.TrimSpace(input.SuccessMessage)
	input.SubmitLabel = strings.TrimSpace(input.SubmitLabel)
	if input.SubmitLabel == "" {
		input.SubmitLabel = "提交咨询"
	}
	if input.Status == "" {
		input.Status = "active"
	}
}

func validateFormInput(input FormInput) error {
	if input.SiteID < 1 || !localePattern.MatchString(input.Locale) {
		return invalid("站点或 Locale 无效")
	}
	if !regexpSlug(input.Key) || utf8.RuneCountInString(input.Name) < 2 || utf8.RuneCountInString(input.Name) > 100 {
		return invalid("表单标识或名称无效")
	}
	if input.Status != "active" && input.Status != "disabled" {
		return invalid("表单状态无效")
	}
	if utf8.RuneCountInString(input.SuccessMessage) > 300 {
		return invalid("表单成功文案不能超过 300 个字符")
	}
	if utf8.RuneCountInString(input.SubmitLabel) < 1 || utf8.RuneCountInString(input.SubmitLabel) > 60 {
		return invalid("提交按钮文字需为 1 到 60 个字符")
	}
	if len(input.Fields) < 1 || len(input.Fields) > 30 {
		return invalid("表单字段数量需为 1 到 30 个")
	}
	seen := map[string]bool{}
	hasContactMethod := false
	for i, field := range input.Fields {
		field.Key = strings.ToLower(strings.TrimSpace(field.Key))
		field.Type = strings.ToLower(strings.TrimSpace(field.Type))
		field.Label = strings.TrimSpace(field.Label)
		if !regexpSlug(field.Key) || seen[field.Key] || !validFormFieldTypes[field.Type] || utf8.RuneCountInString(field.Label) < 1 || utf8.RuneCountInString(field.Label) > 100 {
			return invalid("表单字段定义无效")
		}
		seen[field.Key] = true
		if i > 29 {
			return invalid("表单字段数量超过限制")
		}
		if utf8.RuneCountInString(strings.TrimSpace(field.Placeholder)) > 180 || utf8.RuneCountInString(strings.TrimSpace(field.HelpText)) > 180 {
			return invalid("字段提示或帮助说明不能超过 180 个字符")
		}
		if field.Type == "email" || field.Type == "tel" {
			hasContactMethod = true
		}
		if field.Type == "select" {
			options := normalizeStringList(field.Options, 20)
			if len(options) == 0 || len(options) > 20 {
				return invalid("下拉框至少需要一个选项")
			}
			for _, option := range options {
				if utf8.RuneCountInString(option) > 100 {
					return invalid("下拉选项不能超过 100 个字符")
				}
			}
		}
	}
	if !hasContactMethod {
		return invalid("联系表单至少需要邮箱框或电话框")
	}
	return nil
}

func regexpSlug(value string) bool {
	if value == "" || len(value) > 80 {
		return false
	}
	for i, r := range value {
		if !((r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || (r == '-' && i > 0)) {
			return false
		}
	}
	return true
}

func (s *Service) CreateForm(ctx context.Context, input FormInput, actorUserID int64) (Form, error) {
	normalizeFormInput(&input)
	if err := validateFormInput(input); err != nil {
		return Form{}, err
	}
	now := nowUTC()
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return Form{}, err
	}
	defer tx.Rollback()
	if err = requireEnabledSiteLocale(ctx, tx, input.SiteID, input.Locale); err != nil {
		return Form{}, err
	}
	result, err := tx.ExecContext(ctx, `INSERT INTO forms(site_id, locale, form_key, name, submit_label, status, success_message, notify_enabled, version, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`, input.SiteID, input.Locale, input.Key, input.Name, input.SubmitLabel, input.Status, input.SuccessMessage, boolInt(input.NotifyEnabled), actorUserID, now, now)
	if err != nil {
		return Form{}, classifyConstraint(err)
	}
	formID, _ := result.LastInsertId()
	for i, field := range input.Fields {
		options, _ := json.Marshal(normalizeStringList(field.Options, 20))
		validation := "{}"
		if _, err = tx.ExecContext(ctx, `INSERT INTO form_fields(form_id, field_key, field_type, label, placeholder, help_text, options_json, required, sort_order, validation_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, formID, strings.ToLower(strings.TrimSpace(field.Key)), strings.ToLower(strings.TrimSpace(field.Type)), strings.TrimSpace(field.Label), strings.TrimSpace(field.Placeholder), strings.TrimSpace(field.HelpText), string(options), boolInt(field.Required), i, validation); err != nil {
			return Form{}, classifyConstraint(err)
		}
	}
	if err = tx.Commit(); err != nil {
		return Form{}, err
	}
	return s.GetForm(ctx, formID)
}

func (s *Service) UpdateForm(ctx context.Context, id int64, input FormInput, actorUserID int64) (Form, error) {
	normalizeFormInput(&input)
	if id < 1 || input.Version < 1 || actorUserID < 1 {
		return Form{}, invalid("表单 ID 或版本无效")
	}
	if err := validateFormInput(input); err != nil {
		return Form{}, err
	}
	now := nowUTC()
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return Form{}, err
	}
	defer tx.Rollback()
	if err = requireEnabledSiteLocale(ctx, tx, input.SiteID, input.Locale); err != nil {
		return Form{}, err
	}
	result, err := tx.ExecContext(ctx, `UPDATE forms SET name = ?, submit_label = ?, status = ?, success_message = ?, notify_enabled = ?, version = version + 1, updated_at = ? WHERE id = ? AND site_id = ? AND locale = ? AND version = ?`, input.Name, input.SubmitLabel, input.Status, input.SuccessMessage, boolInt(input.NotifyEnabled), now, id, input.SiteID, input.Locale, input.Version)
	if err != nil {
		return Form{}, classifyConstraint(err)
	}
	affected, _ := result.RowsAffected()
	if affected != 1 {
		return Form{}, ErrConflict
	}
	if _, err = tx.ExecContext(ctx, `DELETE FROM form_fields WHERE form_id = ?`, id); err != nil {
		return Form{}, err
	}
	for i, field := range input.Fields {
		options, _ := json.Marshal(normalizeStringList(field.Options, 20))
		if _, err = tx.ExecContext(ctx, `INSERT INTO form_fields(form_id, field_key, field_type, label, placeholder, help_text, options_json, required, sort_order, validation_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, id, strings.ToLower(strings.TrimSpace(field.Key)), strings.ToLower(strings.TrimSpace(field.Type)), strings.TrimSpace(field.Label), strings.TrimSpace(field.Placeholder), strings.TrimSpace(field.HelpText), string(options), boolInt(field.Required), i, "{}"); err != nil {
			return Form{}, classifyConstraint(err)
		}
	}
	if err = tx.Commit(); err != nil {
		return Form{}, err
	}
	return s.GetForm(ctx, id)
}

func normalizeStringList(values []string, max int) []string {
	out := make([]string, 0, len(values))
	seen := map[string]bool{}
	for _, value := range values {
		value = strings.TrimSpace(value)
		if value == "" || seen[value] {
			continue
		}
		seen[value] = true
		out = append(out, value)
		if len(out) >= max {
			break
		}
	}
	return out
}

func (s *Service) GetForm(ctx context.Context, id int64) (Form, error) {
	if id < 1 {
		return Form{}, ErrNotFound
	}
	var item Form
	var enabled int
	err := s.db.QueryRowContext(ctx, `SELECT id, site_id, locale, form_key, name, submit_label, status, success_message, notify_enabled, version, created_at, updated_at FROM forms WHERE id = ?`, id).Scan(&item.ID, &item.SiteID, &item.Locale, &item.Key, &item.Name, &item.SubmitLabel, &item.Status, &item.SuccessMessage, &enabled, &item.Version, &item.CreatedAt, &item.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return Form{}, ErrNotFound
	}
	if err != nil {
		return Form{}, err
	}
	item.NotifyEnabled = enabled == 1
	rows, err := s.db.QueryContext(ctx, `SELECT id, field_key, field_type, label, placeholder, help_text, options_json, required, sort_order FROM form_fields WHERE form_id = ? ORDER BY sort_order, id`, id)
	if err != nil {
		return Form{}, err
	}
	defer rows.Close()
	for rows.Next() {
		var field FormField
		var options string
		var required int
		if err = rows.Scan(&field.ID, &field.Key, &field.Type, &field.Label, &field.Placeholder, &field.HelpText, &options, &required, &field.SortOrder); err != nil {
			return Form{}, err
		}
		_ = json.Unmarshal([]byte(options), &field.Options)
		field.Required = required == 1
		item.Fields = append(item.Fields, field)
	}
	return item, rows.Err()
}

func (s *Service) ListForms(ctx context.Context, siteID int64, locale string) ([]Form, error) {
	query := `SELECT id FROM forms WHERE site_id = ?`
	args := []any{siteID}
	if strings.TrimSpace(locale) != "" {
		query += ` AND locale = ?`
		args = append(args, strings.TrimSpace(locale))
	}
	query += ` ORDER BY updated_at DESC, id DESC`
	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]Form, 0)
	for rows.Next() {
		var id int64
		if err = rows.Scan(&id); err != nil {
			return nil, err
		}
		item, getErr := s.GetForm(ctx, id)
		if getErr != nil {
			return nil, getErr
		}
		result = append(result, item)
	}
	return result, rows.Err()
}

func (s *Service) GetPageForm(ctx context.Context, contentLocaleID int64) (Form, error) {
	var id int64
	err := s.db.QueryRowContext(ctx, `SELECT form_id FROM page_forms WHERE content_locale_id = ?`, contentLocaleID).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		return Form{}, ErrNotFound
	}
	if err != nil {
		return Form{}, err
	}
	return s.GetForm(ctx, id)
}

func (s *Service) BindPageForm(ctx context.Context, contentLocaleID, formID int64) error {
	if contentLocaleID < 1 || formID < 1 {
		return invalid("页面或表单无效")
	}
	var matches int
	if err := s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM content_locales cl JOIN contents c ON c.id = cl.content_id JOIN forms f ON f.id = ? WHERE cl.id = ? AND c.content_type = 'page' AND f.site_id = cl.site_id AND f.locale = cl.locale`, formID, contentLocaleID).Scan(&matches); err != nil {
		return err
	}
	if matches != 1 {
		return invalid("表单必须与单页面使用相同站点和 Locale")
	}
	_, err := s.db.ExecContext(ctx, `INSERT INTO page_forms(content_locale_id, form_id, version, created_at, updated_at) VALUES (?, ?, 1, ?, ?) ON CONFLICT(content_locale_id) DO UPDATE SET form_id = excluded.form_id, version = page_forms.version + 1, updated_at = excluded.updated_at`, contentLocaleID, formID, nowUTC(), nowUTC())
	return err
}

// ValidatePublicFormValues enforces the server-side form contract. Browser
// validation is only a convenience; untrusted requests must meet the field
// type, option and required-field rules again before anything is encrypted.
func ValidatePublicFormValues(fields []FormField, values map[string]string) error {
	for _, field := range fields {
		value := strings.TrimSpace(values[field.Key])
		if field.Required && value == "" {
			return invalid("请填写“" + field.Label + "”")
		}
		if value == "" {
			continue
		}
		if utf8.RuneCountInString(value) > 4000 {
			return invalid("“" + field.Label + "”内容过长")
		}
		switch field.Type {
		case "email":
			parsed, err := mail.ParseAddress(value)
			if err != nil || parsed.Address != value {
				return invalid("“" + field.Label + "”不是有效邮箱")
			}
		case "tel":
			digits := 0
			for _, r := range value {
				if r >= '0' && r <= '9' {
					digits++
				} else if !strings.ContainsRune(" +-()", r) {
					return invalid("“" + field.Label + "”不是有效电话")
				}
			}
			if digits < 5 || digits > 20 {
				return invalid("“" + field.Label + "”不是有效电话")
			}
		case "select":
			allowed := false
			for _, option := range field.Options {
				if value == option {
					allowed = true
					break
				}
			}
			if !allowed {
				return invalid("“" + field.Label + "”选项无效")
			}
		case "checkbox":
			if value != "1" && !strings.EqualFold(value, "true") && !strings.EqualFold(value, "on") {
				return invalid("“" + field.Label + "”选项无效")
			}
		}
	}
	return nil
}

// PublicFormByKey only exposes a form that is bound to a published contact
// page in the current site. This prevents a guessed form key from becoming an
// unadvertised data-collection endpoint.
func (s *Service) PublicFormByKey(ctx context.Context, siteID int64, key string) (Form, int64, error) {
	var formID, pageID int64
	err := s.db.QueryRowContext(ctx, `SELECT f.id, cl.id FROM forms f JOIN page_forms pf ON pf.form_id = f.id JOIN content_locales cl ON cl.id = pf.content_locale_id JOIN contents c ON c.id = cl.content_id WHERE f.site_id = ? AND f.form_key = ? AND f.status = 'active' AND c.deleted_at IS NULL AND c.content_type = 'page' AND cl.page_layout = 'contact' AND cl.status = 'published' AND (cl.scheduled_at IS NULL OR cl.scheduled_at = '' OR datetime(cl.scheduled_at) <= datetime(?)) ORDER BY cl.id LIMIT 1`, siteID, key, nowUTC()).Scan(&formID, &pageID)
	if errors.Is(err, sql.ErrNoRows) {
		return Form{}, 0, ErrNotFound
	}
	if err != nil {
		return Form{}, 0, err
	}
	item, err := s.GetForm(ctx, formID)
	return item, pageID, err
}

func (s *Service) SaveFormSubmission(ctx context.Context, formID, contentLocaleID, siteID int64, locale, sourcePath, dedupeHash, ipHash, uaHash string, encrypted []byte) (int64, error) {
	if formID < 1 || siteID < 1 || len(encrypted) == 0 {
		return 0, invalid("表单提交无效")
	}
	var active int
	if err := s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM forms WHERE id = ? AND site_id = ? AND locale = ? AND status = 'active'`, formID, siteID, locale).Scan(&active); err != nil {
		return 0, err
	}
	if active != 1 {
		return 0, ErrNotFound
	}
	if dedupeHash != "" {
		var recent int
		if err := s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM form_submissions WHERE form_id = ? AND dedupe_hash = ? AND created_at > ?`, formID, dedupeHash, time.Now().UTC().Add(-10*time.Minute).Format(time.RFC3339Nano)).Scan(&recent); err != nil {
			return 0, err
		}
		if recent > 0 {
			return 0, invalid("请勿重复提交")
		}
	}
	now := nowUTC()
	result, err := s.db.ExecContext(ctx, `INSERT INTO form_submissions(form_id, content_locale_id, site_id, locale, source_path, values_encrypted, dedupe_hash, ip_hash, user_agent_hash, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`, formID, contentLocaleID, siteID, locale, sourcePath, encrypted, dedupeHash, ipHash, uaHash, now, now)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func HashSubmission(values map[string]string) string {
	encoded, _ := json.Marshal(values)
	sum := sha256.Sum256(encoded)
	return hex.EncodeToString(sum[:])
}
