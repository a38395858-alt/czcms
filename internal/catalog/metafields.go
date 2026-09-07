package catalog

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"
)

var metafieldKeyPattern = regexp.MustCompile(`^[a-z][a-z0-9_-]{0,99}$`)

// MetafieldDefinition is a reusable custom field definition. Namespace + Key
// is the stable template/API identifier and therefore cannot be changed after
// creation.
type MetafieldDefinition struct {
	ID           int64           `json:"id"`
	Name         string          `json:"name"`
	Namespace    string          `json:"namespace"`
	Key          string          `json:"key"`
	FieldType    string          `json:"field_type"`
	Description  string          `json:"description"`
	OwnerType    string          `json:"owner_type"`
	Translatable bool            `json:"translatable"`
	Required     bool            `json:"required"`
	DefaultValue string          `json:"default_value"`
	Validation   json.RawMessage `json:"validation"`
	AIEnabled    bool            `json:"ai_enabled"`
	Status       string          `json:"status"`
	SortOrder    int             `json:"sort_order"`
	UsageCount   int64           `json:"usage_count"`
	Version      int64           `json:"version"`
	CreatedBy    *int64          `json:"created_by,omitempty"`
	CreatedAt    string          `json:"created_at"`
	UpdatedAt    string          `json:"updated_at"`
}

type MetafieldDefinitionInput struct {
	Name         string          `json:"name"`
	Namespace    string          `json:"namespace"`
	Key          string          `json:"key"`
	FieldType    string          `json:"field_type"`
	Description  string          `json:"description"`
	OwnerType    string          `json:"owner_type"`
	Translatable bool            `json:"translatable"`
	Required     bool            `json:"required"`
	DefaultValue string          `json:"default_value"`
	Validation   json.RawMessage `json:"validation"`
	AIEnabled    bool            `json:"ai_enabled"`
	Status       string          `json:"status"`
	SortOrder    int             `json:"sort_order"`
	Version      int64           `json:"version"`
}

type MetafieldValue struct {
	ID           int64  `json:"id"`
	DefinitionID int64  `json:"definition_id"`
	OwnerType    string `json:"owner_type"`
	OwnerID      int64  `json:"owner_id"`
	SiteID       int64  `json:"site_id"`
	Locale       string `json:"locale"`
	Value        string `json:"value"`
	Version      int64  `json:"version"`
	UpdatedAt    string `json:"updated_at"`
}

var metafieldTypes = map[string]bool{
	"text": true, "textarea": true, "richtext": true, "number": true, "date": true,
	"url": true, "select": true, "multiselect": true, "image": true, "file": true,
	"product_reference": true, "category_reference": true,
}

func normalizeMetafieldInput(input *MetafieldDefinitionInput) {
	input.Name = strings.TrimSpace(input.Name)
	input.Namespace = strings.ToLower(strings.TrimSpace(input.Namespace))
	input.Key = strings.ToLower(strings.TrimSpace(input.Key))
	input.FieldType = strings.ToLower(strings.TrimSpace(input.FieldType))
	input.Description = strings.TrimSpace(input.Description)
	input.OwnerType = strings.ToLower(strings.TrimSpace(input.OwnerType))
	input.DefaultValue = strings.TrimSpace(input.DefaultValue)
	input.Status = strings.ToLower(strings.TrimSpace(input.Status))
	if input.Namespace == "" {
		input.Namespace = "custom"
	}
	if input.Status == "" {
		input.Status = "active"
	}
	if len(input.Validation) == 0 {
		input.Validation = json.RawMessage(`{}`)
	}
}

func validateMetafieldInput(input MetafieldDefinitionInput, updating bool) error {
	if input.Name == "" || utf8.RuneCountInString(input.Name) > 120 || input.Namespace == "" || input.Key == "" {
		return invalid("元字段名称、Namespace 和 Key 不能为空")
	}
	if len(input.Namespace) > 64 || len(input.Key) > 100 || !metafieldKeyPattern.MatchString(input.Namespace) || !metafieldKeyPattern.MatchString(input.Key) {
		return invalid("Namespace 或 Key 只能使用小写字母、数字、短横线和下划线")
	}
	if !metafieldTypes[input.FieldType] || (input.OwnerType != "product" && input.OwnerType != "product_category" && input.OwnerType != "article" && input.OwnerType != "page") {
		return invalid("元字段类型或绑定对象无效")
	}
	if input.Status != "active" && input.Status != "disabled" {
		return invalid("元字段状态无效")
	}
	if input.SortOrder < 0 || input.SortOrder > 10000 {
		return invalid("排序值无效")
	}
	if !json.Valid(input.Validation) {
		return invalid("校验规则必须是有效 JSON")
	}
	if updating && input.Version < 1 {
		return invalid("元字段版本无效")
	}
	return nil
}

func (s *Service) ListMetafieldDefinitions(ctx context.Context, ownerType, status string) ([]MetafieldDefinition, error) {
	where, args := "1=1", []any{}
	if ownerType != "" {
		where += " AND d.owner_type = ?"
		args = append(args, ownerType)
	}
	if status == "active" || status == "disabled" {
		where += " AND d.status = ?"
		args = append(args, status)
	}
	rows, err := s.db.QueryContext(ctx, `SELECT d.id,d.name,d.namespace,d.field_key,d.field_type,d.description,d.owner_type,d.translatable,d.required,d.default_value,d.validation_json,d.ai_enabled,d.status,d.sort_order,d.version,d.created_by,d.created_at,d.updated_at,COUNT(v.id) FROM metafield_definitions d LEFT JOIN metafield_values v ON v.definition_id=d.id WHERE `+where+` GROUP BY d.id ORDER BY d.sort_order,d.id`, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]MetafieldDefinition, 0)
	for rows.Next() {
		var item MetafieldDefinition
		var translatable, required, ai int
		var validation string
		var createdBy sql.NullInt64
		if err := rows.Scan(&item.ID, &item.Name, &item.Namespace, &item.Key, &item.FieldType, &item.Description, &item.OwnerType, &translatable, &required, &item.DefaultValue, &validation, &ai, &item.Status, &item.SortOrder, &item.Version, &createdBy, &item.CreatedAt, &item.UpdatedAt, &item.UsageCount); err != nil {
			return nil, err
		}
		item.Translatable, item.Required, item.AIEnabled = translatable == 1, required == 1, ai == 1
		item.Validation = json.RawMessage(validation)
		if createdBy.Valid {
			item.CreatedBy = &createdBy.Int64
		}
		result = append(result, item)
	}
	return result, rows.Err()
}

func (s *Service) GetMetafieldDefinition(ctx context.Context, id int64) (MetafieldDefinition, error) {
	items, err := s.ListMetafieldDefinitions(ctx, "", "")
	if err != nil {
		return MetafieldDefinition{}, err
	}
	for _, item := range items {
		if item.ID == id {
			return item, nil
		}
	}
	return MetafieldDefinition{}, ErrNotFound
}

func (s *Service) CreateMetafieldDefinition(ctx context.Context, actorID int64, input MetafieldDefinitionInput) (MetafieldDefinition, error) {
	normalizeMetafieldInput(&input)
	if err := validateMetafieldInput(input, false); err != nil {
		return MetafieldDefinition{}, err
	}
	now := nowUTC()
	result, err := s.db.ExecContext(ctx, `INSERT INTO metafield_definitions(name,namespace,field_key,field_type,description,owner_type,translatable,required,default_value,validation_json,ai_enabled,status,sort_order,version,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?)`, input.Name, input.Namespace, input.Key, input.FieldType, input.Description, input.OwnerType, boolInt(input.Translatable), boolInt(input.Required), input.DefaultValue, string(input.Validation), boolInt(input.AIEnabled), input.Status, input.SortOrder, actorID, now, now)
	if err != nil {
		return MetafieldDefinition{}, classifyConstraint(err)
	}
	id, err := result.LastInsertId()
	if err != nil {
		return MetafieldDefinition{}, err
	}
	return s.GetMetafieldDefinition(ctx, id)
}

func (s *Service) UpdateMetafieldDefinition(ctx context.Context, id int64, input MetafieldDefinitionInput) (MetafieldDefinition, error) {
	if id < 1 {
		return MetafieldDefinition{}, invalid("元字段 ID 无效")
	}
	current, err := s.GetMetafieldDefinition(ctx, id)
	if err != nil {
		return MetafieldDefinition{}, err
	}
	input.Namespace, input.Key, input.OwnerType = current.Namespace, current.Key, current.OwnerType
	normalizeMetafieldInput(&input)
	if err = validateMetafieldInput(input, true); err != nil {
		return MetafieldDefinition{}, err
	}
	result, err := s.db.ExecContext(ctx, `UPDATE metafield_definitions SET name=?,field_type=?,description=?,translatable=?,required=?,default_value=?,validation_json=?,ai_enabled=?,status=?,sort_order=?,version=version+1,updated_at=? WHERE id=? AND version=?`, input.Name, input.FieldType, input.Description, boolInt(input.Translatable), boolInt(input.Required), input.DefaultValue, string(input.Validation), boolInt(input.AIEnabled), input.Status, input.SortOrder, nowUTC(), id, input.Version)
	if err != nil {
		return MetafieldDefinition{}, classifyConstraint(err)
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		return MetafieldDefinition{}, ErrConflict
	}
	return s.GetMetafieldDefinition(ctx, id)
}

func (s *Service) UpsertMetafieldValue(ctx context.Context, input MetafieldValue) (MetafieldValue, error) {
	input.OwnerType = strings.ToLower(strings.TrimSpace(input.OwnerType))
	input.Locale = strings.TrimSpace(input.Locale)
	input.Value = strings.TrimSpace(input.Value)
	if input.DefinitionID < 1 || input.OwnerID < 1 || input.SiteID < 1 || input.Locale == "" {
		return MetafieldValue{}, invalid("元字段值范围无效")
	}
	definition, err := s.GetMetafieldDefinition(ctx, input.DefinitionID)
	if err != nil {
		return MetafieldValue{}, err
	}
	if definition.Status != "active" {
		return MetafieldValue{}, invalid("该元字段已停用，不能写入新值")
	}
	if input.OwnerType != definition.OwnerType {
		return MetafieldValue{}, invalid("元字段绑定对象类型不匹配")
	}
	if !localePattern.MatchString(input.Locale) {
		return MetafieldValue{}, invalid("Locale 格式无效")
	}
	if err = s.validateMetafieldOwner(ctx, input.OwnerType, input.OwnerID, input.SiteID, input.Locale); err != nil {
		return MetafieldValue{}, err
	}
	if definition.Required && input.Value == "" {
		return MetafieldValue{}, invalid("必填元字段不能为空")
	}
	if utf8.RuneCountInString(input.Value) > 200000 {
		return MetafieldValue{}, invalid("元字段值不能超过 200000 个字符")
	}
	if definition.FieldType == "richtext" {
		if s.sanitizer == nil {
			return MetafieldValue{}, invalid("富文本安全组件未初始化")
		}
		cleaned, sanitizeErr := s.sanitizer.Sanitize(input.Value)
		if sanitizeErr != nil {
			return MetafieldValue{}, invalid(sanitizeErr.Error())
		}
		input.Value = cleaned
	}
	if err = validateMetafieldValue(definition, input.Value); err != nil {
		return MetafieldValue{}, err
	}
	if err = s.validateMetafieldReference(ctx, definition.FieldType, input.Value, input.SiteID, input.Locale); err != nil {
		return MetafieldValue{}, err
	}
	now := nowUTC()
	_, err = s.db.ExecContext(ctx, `INSERT INTO metafield_values(definition_id,owner_type,owner_id,site_id,locale,value,version,created_at,updated_at) VALUES(?,?,?,?,?,?,1,?,?) ON CONFLICT(definition_id,owner_type,owner_id,site_id,locale) DO UPDATE SET value=excluded.value,version=metafield_values.version+1,updated_at=excluded.updated_at`, input.DefinitionID, input.OwnerType, input.OwnerID, input.SiteID, input.Locale, input.Value, now, now)
	if err != nil {
		return MetafieldValue{}, classifyConstraint(err)
	}
	return s.GetMetafieldValue(ctx, input.DefinitionID, input.OwnerType, input.OwnerID, input.SiteID, input.Locale)
}

func (s *Service) validateMetafieldReference(ctx context.Context, fieldType, value string, siteID int64, locale string) error {
	if value == "" {
		return nil
	}
	if fieldType != "image" && fieldType != "file" && fieldType != "product_reference" && fieldType != "category_reference" {
		return nil
	}
	id, err := strconv.ParseInt(value, 10, 64)
	if err != nil || id < 1 {
		return invalid("媒体或引用元字段必须填写有效对象 ID")
	}
	if fieldType == "image" || fieldType == "file" {
		var count int
		if err = s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM media_files WHERE id=?`, id).Scan(&count); err != nil {
			return err
		}
		if count == 0 {
			return ErrNotFound
		}
		return nil
	}
	if fieldType == "product_reference" {
		var count int
		if err = s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM contents c JOIN content_locales cl ON cl.content_id=c.id WHERE c.id=? AND c.content_type='product' AND c.deleted_at IS NULL AND cl.site_id=? AND cl.locale=?`, id, siteID, locale).Scan(&count); err != nil {
			return err
		}
		if count == 0 {
			return ErrNotFound
		}
		return nil
	}
	var count int
	if err = s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM taxonomy_terms WHERE id=? AND site_id=? AND locale=? AND kind='category'`, id, siteID, locale).Scan(&count); err != nil {
		return err
	}
	if count == 0 {
		return ErrNotFound
	}
	return nil
}

// validateMetafieldOwner prevents values from being attached to an object that
// is outside the selected site/locale. Owner IDs are content-group IDs for
// products/articles/pages and taxonomy term IDs for product categories.
func (s *Service) validateMetafieldOwner(ctx context.Context, ownerType string, ownerID, siteID int64, locale string) error {
	if ownerType == "product_category" {
		var count int
		err := s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM taxonomy_terms WHERE id=? AND site_id=? AND locale=? AND kind='category'`, ownerID, siteID, locale).Scan(&count)
		if err != nil {
			return err
		}
		if count == 0 {
			return ErrNotFound
		}
		return nil
	}
	var count int
	contentType := ownerType
	if ownerType == "article" {
		err := s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM contents c JOIN content_locales cl ON cl.content_id=c.id WHERE c.id=? AND c.content_type IN ('article','landing') AND c.deleted_at IS NULL AND cl.site_id=? AND cl.locale=?`, ownerID, siteID, locale).Scan(&count)
		if err != nil {
			return err
		}
		if count == 0 {
			return ErrNotFound
		}
		return nil
	}
	err := s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM contents c JOIN content_locales cl ON cl.content_id=c.id WHERE c.id=? AND c.content_type=? AND c.deleted_at IS NULL AND cl.site_id=? AND cl.locale=?`, ownerID, contentType, siteID, locale).Scan(&count)
	if err != nil {
		return err
	}
	if count == 0 {
		return ErrNotFound
	}
	return nil
}

func validateMetafieldValue(definition MetafieldDefinition, value string) error {
	rules := map[string]any{}
	if len(definition.Validation) > 0 && json.Valid(definition.Validation) {
		_ = json.Unmarshal(definition.Validation, &rules)
	}
	if max, ok := numberRule(rules, "max_length"); ok && utf8.RuneCountInString(value) > max {
		return invalid(fmt.Sprintf("元字段值不能超过 %d 个字符", max))
	}
	if min, ok := numberRule(rules, "min_length"); ok && utf8.RuneCountInString(value) < min && value != "" {
		return invalid(fmt.Sprintf("元字段值至少需要 %d 个字符", min))
	}
	switch definition.FieldType {
	case "number":
		if value == "" {
			return nil
		}
		if _, err := strconv.ParseFloat(value, 64); err != nil {
			return invalid("数字元字段必须填写有效数字")
		}
	case "date":
		if value == "" {
			return nil
		}
		if _, err := time.Parse("2006-01-02", value); err != nil {
			return invalid("日期元字段必须使用 YYYY-MM-DD 格式")
		}
	case "url":
		if value == "" {
			return nil
		}
		u, err := url.ParseRequestURI(value)
		if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" {
			return invalid("URL 元字段只允许 http 或 https 地址")
		}
	case "select":
		if value == "" {
			return nil
		}
		if !valueInOptions(value, rules["options"]) {
			return invalid("单选元字段的值不在预设选项中")
		}
	case "multiselect":
		if value == "" {
			return nil
		}
		var values []string
		if json.Unmarshal([]byte(value), &values) != nil {
			return invalid("多选元字段必须保存为 JSON 数组")
		}
		for _, item := range values {
			if !valueInOptions(item, rules["options"]) {
				return invalid("多选元字段包含未定义选项")
			}
		}
	case "product_reference", "category_reference":
		if value == "" {
			return nil
		}
		if id, err := strconv.ParseInt(value, 10, 64); err != nil || id < 1 {
			return invalid("引用元字段必须填写有效对象 ID")
		}
	}
	return nil
}

func numberRule(rules map[string]any, key string) (int, bool) {
	value, ok := rules[key].(float64)
	return int(value), ok && value >= 0 && value <= 200000
}

func valueInOptions(value string, raw any) bool {
	options, ok := raw.([]any)
	if !ok {
		return false
	}
	for _, option := range options {
		if object, isObject := option.(map[string]any); isObject {
			if strings.TrimSpace(fmt.Sprint(object["value"])) == value || strings.TrimSpace(fmt.Sprint(object["label"])) == value {
				return true
			}
			continue
		}
		if strings.TrimSpace(fmt.Sprint(option)) == value {
			return true
		}
	}
	return false
}

func (s *Service) GetMetafieldValue(ctx context.Context, definitionID int64, ownerType string, ownerID, siteID int64, locale string) (MetafieldValue, error) {
	var item MetafieldValue
	err := s.db.QueryRowContext(ctx, `SELECT id,definition_id,owner_type,owner_id,site_id,locale,value,version,updated_at FROM metafield_values WHERE definition_id=? AND owner_type=? AND owner_id=? AND site_id=? AND locale=?`, definitionID, ownerType, ownerID, siteID, locale).Scan(&item.ID, &item.DefinitionID, &item.OwnerType, &item.OwnerID, &item.SiteID, &item.Locale, &item.Value, &item.Version, &item.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return MetafieldValue{}, ErrNotFound
	}
	return item, err
}

func (s *Service) ListMetafieldValues(ctx context.Context, ownerType string, ownerID, siteID int64, locale string) ([]MetafieldValue, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT id,definition_id,owner_type,owner_id,site_id,locale,value,version,updated_at FROM metafield_values WHERE owner_type=? AND owner_id=? AND site_id=? AND locale=? ORDER BY definition_id`, ownerType, ownerID, siteID, locale)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]MetafieldValue, 0)
	for rows.Next() {
		var item MetafieldValue
		if err := rows.Scan(&item.ID, &item.DefinitionID, &item.OwnerType, &item.OwnerID, &item.SiteID, &item.Locale, &item.Value, &item.Version, &item.UpdatedAt); err != nil {
			return nil, err
		}
		result = append(result, item)
	}
	return result, rows.Err()
}
