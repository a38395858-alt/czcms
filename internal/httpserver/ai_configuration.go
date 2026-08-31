package httpserver

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"czcms/internal/audit"

	"github.com/go-chi/chi/v5"
)

const aiProviderKeyPurposePrefix = "ai-provider-key:"

var errAIConfigConflict = errors.New("AI 配置已被其他管理员修改，请刷新后重试")

type aiProvider struct {
	ID               int64  `json:"id"`
	Name             string `json:"name"`
	ProviderType     string `json:"provider_type"`
	BaseURL          string `json:"base_url"`
	DefaultModel     string `json:"default_model"`
	Enabled          bool   `json:"enabled"`
	TimeoutSeconds   int    `json:"timeout_seconds"`
	APIKeyConfigured bool   `json:"api_key_configured"`
	APIKeyLastFour   string `json:"api_key_last_four,omitempty"`
	LastTestStatus   string `json:"last_test_status"`
	LastTestMessage  string `json:"last_test_message,omitempty"`
	LastTestedAt     string `json:"last_tested_at,omitempty"`
	Version          int64  `json:"version"`
	CreatedAt        string `json:"created_at"`
	UpdatedAt        string `json:"updated_at"`
	apiKeyEncrypted  []byte
}

type aiProviderInput struct {
	Name           string `json:"name"`
	ProviderType   string `json:"provider_type"`
	BaseURL        string `json:"base_url"`
	APIKey         string `json:"api_key"`
	ClearAPIKey    bool   `json:"clear_api_key"`
	DefaultModel   string `json:"default_model"`
	Enabled        bool   `json:"enabled"`
	TimeoutSeconds int    `json:"timeout_seconds"`
	Version        int64  `json:"version"`
}

type aiFeatureRoute struct {
	FeatureKey            string `json:"feature_key"`
	Name                  string `json:"name"`
	Description           string `json:"description"`
	PrimaryProviderID     *int64 `json:"primary_provider_id"`
	FallbackProviderID    *int64 `json:"fallback_provider_id"`
	ModelOverride         string `json:"model_override"`
	FallbackModelOverride string `json:"fallback_model_override"`
	MaxRetries            int    `json:"max_retries"`
	Version               int64  `json:"version"`
	UpdatedAt             string `json:"updated_at"`
}

type aiFeatureRouteInput struct {
	PrimaryProviderID     *int64 `json:"primary_provider_id"`
	FallbackProviderID    *int64 `json:"fallback_provider_id"`
	ModelOverride         string `json:"model_override"`
	FallbackModelOverride string `json:"fallback_model_override"`
	MaxRetries            int    `json:"max_retries"`
	Version               int64  `json:"version"`
}

func aiFeatureDetails(key string) (string, string, bool) {
	switch key {
	case "seo":
		return "SEO 内容建议", "根据文章语境生成标题、描述、关键词、摘要与结构化数据候选", true
	case "localization":
		return "多语言语境本土化", "从已发布英语内容生成符合目标国家表达与搜索习惯的待审核版本", true
	default:
		return "", "", false
	}
}

func (s *server) aiConfiguration(w http.ResponseWriter, r *http.Request) {
	providers, err := s.listAIProviders(r.Context())
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取 AI 提供方失败")
		return
	}
	routes, err := s.listAIFeatureRoutes(r.Context())
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取 AI 用途分配失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"providers": providers,
		"routes":    routes,
		"environment_fallback": map[string]bool{
			"seo":          s.SEOAssistant != nil,
			"localization": s.LocalizationAssistant != nil,
		},
		"review_required": true,
	})
}

func (s *server) aiProviderCreate(w http.ResponseWriter, r *http.Request) {
	var input aiProviderInput
	if err := decodeJSON(w, r, &input, 32<<10); err != nil {
		return
	}
	if err := validateAIProviderInput(&input, ""); err != nil {
		writeJSONError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	session := sessionFromContext(r.Context())
	now := time.Now().UTC().Format(time.RFC3339Nano)
	tx, err := s.DB.BeginTx(r.Context(), nil)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "创建 AI 配置失败")
		return
	}
	defer tx.Rollback()
	result, err := tx.ExecContext(r.Context(), `INSERT INTO ai_providers(name, provider_type, base_url, default_model, enabled, timeout_seconds, created_by, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, input.Name, input.ProviderType, input.BaseURL, input.DefaultModel, boolInt(input.Enabled), input.TimeoutSeconds, session.User.ID, now, now)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "创建 AI 配置失败")
		return
	}
	id, err := result.LastInsertId()
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "创建 AI 配置失败")
		return
	}
	if input.APIKey != "" {
		encrypted, encryptErr := s.Keys.Encrypt(aiProviderKeyPurpose(id), []byte(input.APIKey))
		if encryptErr != nil {
			writeJSONError(w, http.StatusInternalServerError, "加密 AI 密钥失败")
			return
		}
		if _, err = tx.ExecContext(r.Context(), `UPDATE ai_providers SET api_key_encrypted = ?, api_key_last_four = ? WHERE id = ?`, encrypted, lastFour(input.APIKey), id); err != nil {
			writeJSONError(w, http.StatusInternalServerError, "保存 AI 密钥失败")
			return
		}
	}
	if err = tx.Commit(); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "创建 AI 配置失败")
		return
	}
	item, err := s.getAIProvider(r.Context(), id)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取新 AI 配置失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "system.ai_provider_created", TargetType: "ai_provider", TargetID: strconv.FormatInt(id, 10), Success: true, Metadata: map[string]any{"provider_type": item.ProviderType, "enabled": item.Enabled, "model": item.DefaultModel}})
	writeJSON(w, http.StatusCreated, item)
}

func (s *server) aiProviderUpdate(w http.ResponseWriter, r *http.Request) {
	id, ok := aiProviderPathID(w, r)
	if !ok {
		return
	}
	var input aiProviderInput
	if err := decodeJSON(w, r, &input, 32<<10); err != nil {
		return
	}
	current, err := s.getAIProvider(r.Context(), id)
	if errors.Is(err, sql.ErrNoRows) {
		writeJSONError(w, http.StatusNotFound, "AI 提供方不存在")
		return
	}
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取 AI 配置失败")
		return
	}
	if input.Version < 1 || input.Version != current.Version {
		writeJSONError(w, http.StatusConflict, errAIConfigConflict.Error())
		return
	}
	apiKey, err := s.decryptAIProviderKey(current)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "现有 AI 密钥无法解密，请检查主密钥")
		return
	}
	if input.ClearAPIKey {
		apiKey = ""
	}
	if strings.TrimSpace(input.APIKey) != "" {
		apiKey = strings.TrimSpace(input.APIKey)
	}
	if err = validateAIProviderInput(&input, apiKey); err != nil {
		writeJSONError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	var encrypted any
	last := ""
	if apiKey != "" {
		encryptedValue, encryptErr := s.Keys.Encrypt(aiProviderKeyPurpose(id), []byte(apiKey))
		if encryptErr != nil {
			writeJSONError(w, http.StatusInternalServerError, "加密 AI 密钥失败")
			return
		}
		encrypted = encryptedValue
		last = lastFour(apiKey)
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := s.DB.ExecContext(r.Context(), `UPDATE ai_providers SET name = ?, provider_type = ?, base_url = ?, api_key_encrypted = ?, api_key_last_four = ?, default_model = ?, enabled = ?, timeout_seconds = ?, last_test_status = 'untested', last_test_message = '', last_tested_at = NULL, version = version + 1, updated_at = ? WHERE id = ? AND version = ?`,
		input.Name, input.ProviderType, input.BaseURL, encrypted, last, input.DefaultModel, boolInt(input.Enabled), input.TimeoutSeconds, now, id, input.Version)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "保存 AI 配置失败")
		return
	}
	if changed, _ := result.RowsAffected(); changed != 1 {
		writeJSONError(w, http.StatusConflict, errAIConfigConflict.Error())
		return
	}
	item, err := s.getAIProvider(r.Context(), id)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取 AI 配置失败")
		return
	}
	session := sessionFromContext(r.Context())
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "system.ai_provider_updated", TargetType: "ai_provider", TargetID: strconv.FormatInt(id, 10), Success: true, Metadata: map[string]any{"enabled": item.Enabled, "model": item.DefaultModel, "key_changed": input.APIKey != "" || input.ClearAPIKey, "version": item.Version}})
	writeJSON(w, http.StatusOK, item)
}

func (s *server) aiProviderDelete(w http.ResponseWriter, r *http.Request) {
	id, ok := aiProviderPathID(w, r)
	if !ok {
		return
	}
	var input struct {
		Version int64 `json:"version"`
	}
	if err := decodeJSON(w, r, &input, 4<<10); err != nil {
		return
	}
	result, err := s.DB.ExecContext(r.Context(), `DELETE FROM ai_providers WHERE id = ? AND version = ?`, id, input.Version)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "删除 AI 配置失败")
		return
	}
	if changed, _ := result.RowsAffected(); changed != 1 {
		var exists int
		_ = s.DB.QueryRowContext(r.Context(), `SELECT EXISTS(SELECT 1 FROM ai_providers WHERE id = ?)`, id).Scan(&exists)
		if exists == 0 {
			writeJSONError(w, http.StatusNotFound, "AI 提供方不存在")
		} else {
			writeJSONError(w, http.StatusConflict, errAIConfigConflict.Error())
		}
		return
	}
	session := sessionFromContext(r.Context())
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "system.ai_provider_deleted", TargetType: "ai_provider", TargetID: strconv.FormatInt(id, 10), Success: true})
	w.WriteHeader(http.StatusNoContent)
}

func (s *server) aiProviderTest(w http.ResponseWriter, r *http.Request) {
	id, ok := aiProviderPathID(w, r)
	if !ok {
		return
	}
	item, err := s.getAIProvider(r.Context(), id)
	if errors.Is(err, sql.ErrNoRows) {
		writeJSONError(w, http.StatusNotFound, "AI 提供方不存在")
		return
	}
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取 AI 配置失败")
		return
	}
	assistant, err := s.seoAssistantFromProvider(item, "")
	status, message := "online", "连接正常，模型已返回有效响应"
	if err == nil {
		ctx, cancel := context.WithTimeout(r.Context(), time.Duration(item.TimeoutSeconds)*time.Second)
		_, err = assistant.Suggest(ctx, SEOSuggestionInput{Title: "CZCMS connection test", Summary: "Return a safe SEO configuration response.", Locale: "en"})
		cancel()
	}
	if err != nil {
		status, message = "offline", safeAIError(err)
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	_, _ = s.DB.ExecContext(r.Context(), `UPDATE ai_providers SET last_test_status = ?, last_test_message = ?, last_tested_at = ?, updated_at = ? WHERE id = ?`, status, message, now, now, id)
	session := sessionFromContext(r.Context())
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "system.ai_provider_tested", TargetType: "ai_provider", TargetID: strconv.FormatInt(id, 10), Success: err == nil, Metadata: map[string]any{"status": status, "reason": message}})
	item, _ = s.getAIProvider(r.Context(), id)
	if err != nil {
		writeJSON(w, http.StatusOK, map[string]any{"ok": false, "message": message, "provider": item})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "message": message, "provider": item})
}

func (s *server) aiFeatureRouteUpdate(w http.ResponseWriter, r *http.Request) {
	key := strings.TrimSpace(chi.URLParam(r, "featureKey"))
	if _, _, ok := aiFeatureDetails(key); !ok {
		writeJSONError(w, http.StatusNotFound, "AI 用途不存在")
		return
	}
	var input aiFeatureRouteInput
	if err := decodeJSON(w, r, &input, 16<<10); err != nil {
		return
	}
	input.ModelOverride = strings.TrimSpace(input.ModelOverride)
	input.FallbackModelOverride = strings.TrimSpace(input.FallbackModelOverride)
	if input.Version < 1 || input.MaxRetries < 0 || input.MaxRetries > 3 || utf8.RuneCountInString(input.ModelOverride) > 200 || utf8.RuneCountInString(input.FallbackModelOverride) > 200 {
		writeJSONError(w, http.StatusUnprocessableEntity, "用途分配参数无效")
		return
	}
	if input.PrimaryProviderID != nil && *input.PrimaryProviderID < 1 || input.FallbackProviderID != nil && *input.FallbackProviderID < 1 {
		writeJSONError(w, http.StatusUnprocessableEntity, "AI 提供方无效")
		return
	}
	if input.PrimaryProviderID != nil && input.FallbackProviderID != nil && *input.PrimaryProviderID == *input.FallbackProviderID {
		writeJSONError(w, http.StatusUnprocessableEntity, "主提供方和备用提供方不能相同")
		return
	}
	for _, id := range []*int64{input.PrimaryProviderID, input.FallbackProviderID} {
		if id == nil {
			continue
		}
		var usable int
		if err := s.DB.QueryRowContext(r.Context(), `SELECT EXISTS(SELECT 1 FROM ai_providers WHERE id = ? AND enabled = 1)`, *id).Scan(&usable); err != nil || usable != 1 {
			writeJSONError(w, http.StatusUnprocessableEntity, "用途只能分配给已启用的 AI 提供方")
			return
		}
	}
	session := sessionFromContext(r.Context())
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := s.DB.ExecContext(r.Context(), `UPDATE ai_feature_routes SET primary_provider_id = ?, fallback_provider_id = ?, model_override = ?, fallback_model_override = ?, max_retries = ?, version = version + 1, updated_by = ?, updated_at = ? WHERE feature_key = ? AND version = ?`,
		input.PrimaryProviderID, input.FallbackProviderID, input.ModelOverride, input.FallbackModelOverride, input.MaxRetries, session.User.ID, now, key, input.Version)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "保存 AI 用途分配失败")
		return
	}
	if changed, _ := result.RowsAffected(); changed != 1 {
		writeJSONError(w, http.StatusConflict, errAIConfigConflict.Error())
		return
	}
	route, err := s.getAIFeatureRoute(r.Context(), key)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取 AI 用途分配失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "system.ai_route_updated", TargetType: "ai_feature", TargetID: key, Success: true, Metadata: map[string]any{"primary_provider_id": input.PrimaryProviderID, "fallback_provider_id": input.FallbackProviderID, "max_retries": input.MaxRetries, "version": route.Version}})
	writeJSON(w, http.StatusOK, route)
}

func (s *server) listAIProviders(ctx context.Context) ([]aiProvider, error) {
	rows, err := s.DB.QueryContext(ctx, `SELECT id, name, provider_type, base_url, api_key_encrypted, api_key_last_four, default_model, enabled, timeout_seconds, last_test_status, last_test_message, last_tested_at, version, created_at, updated_at FROM ai_providers ORDER BY enabled DESC, id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]aiProvider, 0)
	for rows.Next() {
		item, scanErr := scanAIProvider(rows)
		if scanErr != nil {
			return nil, scanErr
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

type rowScanner interface {
	Scan(...any) error
}

func scanAIProvider(row rowScanner) (aiProvider, error) {
	var item aiProvider
	var enabled int
	var encrypted []byte
	var tested sql.NullString
	if err := row.Scan(&item.ID, &item.Name, &item.ProviderType, &item.BaseURL, &encrypted, &item.APIKeyLastFour, &item.DefaultModel, &enabled, &item.TimeoutSeconds, &item.LastTestStatus, &item.LastTestMessage, &tested, &item.Version, &item.CreatedAt, &item.UpdatedAt); err != nil {
		return aiProvider{}, err
	}
	item.Enabled = enabled == 1
	item.apiKeyEncrypted = encrypted
	item.APIKeyConfigured = len(encrypted) > 0
	if tested.Valid {
		item.LastTestedAt = tested.String
	}
	return item, nil
}

func (s *server) getAIProvider(ctx context.Context, id int64) (aiProvider, error) {
	return scanAIProvider(s.DB.QueryRowContext(ctx, `SELECT id, name, provider_type, base_url, api_key_encrypted, api_key_last_four, default_model, enabled, timeout_seconds, last_test_status, last_test_message, last_tested_at, version, created_at, updated_at FROM ai_providers WHERE id = ?`, id))
}

func (s *server) listAIFeatureRoutes(ctx context.Context) ([]aiFeatureRoute, error) {
	rows, err := s.DB.QueryContext(ctx, `SELECT feature_key, primary_provider_id, fallback_provider_id, model_override, fallback_model_override, max_retries, version, updated_at FROM ai_feature_routes ORDER BY CASE feature_key WHEN 'seo' THEN 1 ELSE 2 END`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]aiFeatureRoute, 0, 2)
	for rows.Next() {
		item, scanErr := scanAIFeatureRoute(rows)
		if scanErr != nil {
			return nil, scanErr
		}
		result = append(result, item)
	}
	return result, rows.Err()
}

func scanAIFeatureRoute(row rowScanner) (aiFeatureRoute, error) {
	var item aiFeatureRoute
	var primary, fallback sql.NullInt64
	if err := row.Scan(&item.FeatureKey, &primary, &fallback, &item.ModelOverride, &item.FallbackModelOverride, &item.MaxRetries, &item.Version, &item.UpdatedAt); err != nil {
		return aiFeatureRoute{}, err
	}
	if primary.Valid {
		item.PrimaryProviderID = &primary.Int64
	}
	if fallback.Valid {
		item.FallbackProviderID = &fallback.Int64
	}
	item.Name, item.Description, _ = aiFeatureDetails(item.FeatureKey)
	return item, nil
}

func (s *server) getAIFeatureRoute(ctx context.Context, key string) (aiFeatureRoute, error) {
	return scanAIFeatureRoute(s.DB.QueryRowContext(ctx, `SELECT feature_key, primary_provider_id, fallback_provider_id, model_override, fallback_model_override, max_retries, version, updated_at FROM ai_feature_routes WHERE feature_key = ?`, key))
}

func validateAIProviderInput(input *aiProviderInput, effectiveAPIKey string) error {
	input.Name = strings.TrimSpace(input.Name)
	input.ProviderType = strings.TrimSpace(input.ProviderType)
	input.BaseURL = strings.TrimRight(strings.TrimSpace(input.BaseURL), "/")
	input.APIKey = strings.TrimSpace(input.APIKey)
	input.DefaultModel = strings.TrimSpace(input.DefaultModel)
	if input.ProviderType == "" {
		input.ProviderType = "openai_compatible"
	}
	if utf8.RuneCountInString(input.Name) < 2 || utf8.RuneCountInString(input.Name) > 100 {
		return errors.New("配置名称必须为 2 到 100 个字符")
	}
	if input.ProviderType != "openai_compatible" {
		return errors.New("当前只支持 OpenAI Chat Completions 兼容接口")
	}
	if input.DefaultModel == "" || utf8.RuneCountInString(input.DefaultModel) > 200 {
		return errors.New("默认模型不能为空且不能超过 200 个字符")
	}
	if input.TimeoutSeconds == 0 {
		input.TimeoutSeconds = 20
	}
	if input.TimeoutSeconds < 1 || input.TimeoutSeconds > 120 {
		return errors.New("请求超时必须为 1 到 120 秒")
	}
	parsed, loopback, err := validateAIBaseURL(input.BaseURL)
	if err != nil {
		return err
	}
	if effectiveAPIKey == "" {
		effectiveAPIKey = input.APIKey
	}
	if input.Enabled && !loopback && strings.TrimSpace(effectiveAPIKey) == "" {
		return errors.New("启用远程 AI 提供方前必须配置 API Key")
	}
	_ = parsed
	return nil
}

func validateAIBaseURL(value string) (*url.URL, bool, error) {
	parsed, err := url.Parse(value)
	if err != nil || parsed.Host == "" || parsed.User != nil || parsed.RawQuery != "" || parsed.Fragment != "" || len(value) > 500 {
		return nil, false, errors.New("API 地址无效，不能包含账号、查询参数或片段")
	}
	loopback := strings.EqualFold(parsed.Hostname(), "localhost")
	if ip := net.ParseIP(parsed.Hostname()); ip != nil {
		loopback = ip.IsLoopback()
	}
	if parsed.Scheme != "https" && !(parsed.Scheme == "http" && loopback) {
		return nil, false, errors.New("远程 AI 服务必须使用 HTTPS；HTTP 仅允许 localhost 或回环地址")
	}
	return parsed, loopback, nil
}

func aiProviderPathID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(chi.URLParam(r, "providerID"), 10, 64)
	if err != nil || id < 1 {
		writeJSONError(w, http.StatusBadRequest, "AI 提供方 ID 无效")
		return 0, false
	}
	return id, true
}

func aiProviderKeyPurpose(id int64) string {
	return aiProviderKeyPurposePrefix + strconv.FormatInt(id, 10)
}

func (s *server) decryptAIProviderKey(item aiProvider) (string, error) {
	if len(item.apiKeyEncrypted) == 0 {
		return "", nil
	}
	plaintext, err := s.Keys.Decrypt(aiProviderKeyPurpose(item.ID), item.apiKeyEncrypted)
	if err != nil {
		return "", err
	}
	return string(plaintext), nil
}

func lastFour(value string) string {
	runes := []rune(strings.TrimSpace(value))
	if len(runes) <= 4 {
		return string(runes)
	}
	return string(runes[len(runes)-4:])
}

func boolInt(value bool) int {
	if value {
		return 1
	}
	return 0
}

func safeAIError(err error) string {
	if err == nil {
		return ""
	}
	message := strings.TrimSpace(err.Error())
	if message == "" {
		message = "AI 服务连接失败"
	}
	return truncateRunes(message, 300)
}

type retryingSEOAssistant struct {
	assistants []SEOAssistant
	retries    int
}

func (a retryingSEOAssistant) Suggest(ctx context.Context, input SEOSuggestionInput) (SEOSuggestion, error) {
	var lastErr error
	for _, assistant := range a.assistants {
		for attempt := 0; attempt <= a.retries; attempt++ {
			result, err := assistant.Suggest(ctx, input)
			if err == nil {
				return result, nil
			}
			lastErr = err
			if ctx.Err() != nil {
				return SEOSuggestion{}, ctx.Err()
			}
		}
	}
	if lastErr == nil {
		lastErr = errors.New("没有可用的 AI 提供方")
	}
	return SEOSuggestion{}, lastErr
}

type retryingLocalizationAssistant struct {
	assistants []LocalizationAssistant
	retries    int
}

func (a retryingLocalizationAssistant) Localize(ctx context.Context, input LocalizationInput) (LocalizationSuggestion, error) {
	var lastErr error
	for _, assistant := range a.assistants {
		for attempt := 0; attempt <= a.retries; attempt++ {
			result, err := assistant.Localize(ctx, input)
			if err == nil {
				return result, nil
			}
			lastErr = err
			if ctx.Err() != nil {
				return LocalizationSuggestion{}, ctx.Err()
			}
		}
	}
	if lastErr == nil {
		lastErr = errors.New("没有可用的 AI 提供方")
	}
	return LocalizationSuggestion{}, lastErr
}

func (s *server) seoAssistantFromProvider(item aiProvider, modelOverride string) (SEOAssistant, error) {
	apiKey, err := s.decryptAIProviderKey(item)
	if err != nil {
		return nil, err
	}
	model := strings.TrimSpace(modelOverride)
	if model == "" {
		model = item.DefaultModel
	}
	return NewOpenAICompatibleSEOAssistant(OpenAICompatibleSEOConfig{BaseURL: item.BaseURL, APIKey: apiKey, Model: model, Timeout: time.Duration(item.TimeoutSeconds) * time.Second})
}

func (s *server) localizationAssistantFromProvider(item aiProvider, modelOverride string) (LocalizationAssistant, error) {
	apiKey, err := s.decryptAIProviderKey(item)
	if err != nil {
		return nil, err
	}
	model := strings.TrimSpace(modelOverride)
	if model == "" {
		model = item.DefaultModel
	}
	return NewOpenAICompatibleLocalizationAssistant(OpenAICompatibleSEOConfig{BaseURL: item.BaseURL, APIKey: apiKey, Model: model, Timeout: time.Duration(item.TimeoutSeconds) * time.Second})
}

func (s *server) defaultSEOAssistants(ctx context.Context) []SEOAssistant {
	providers, err := s.listAIProviders(ctx)
	if err != nil {
		return nil
	}
	assistants := make([]SEOAssistant, 0, len(providers))
	for _, provider := range providers {
		if !provider.Enabled {
			continue
		}
		assistant, buildErr := s.seoAssistantFromProvider(provider, "")
		if buildErr == nil {
			assistants = append(assistants, assistant)
		}
	}
	return assistants
}

func (s *server) defaultLocalizationAssistants(ctx context.Context) []LocalizationAssistant {
	providers, err := s.listAIProviders(ctx)
	if err != nil {
		return nil
	}
	assistants := make([]LocalizationAssistant, 0, len(providers))
	for _, provider := range providers {
		if !provider.Enabled {
			continue
		}
		assistant, buildErr := s.localizationAssistantFromProvider(provider, "")
		if buildErr == nil {
			assistants = append(assistants, assistant)
		}
	}
	return assistants
}

func (s *server) seoAssistantFor(ctx context.Context) SEOAssistant {
	assistants := s.defaultSEOAssistants(ctx)
	if s.SEOAssistant != nil {
		assistants = append(assistants, s.SEOAssistant)
	}
	if len(assistants) == 0 {
		return nil
	}
	return retryingSEOAssistant{assistants: assistants, retries: 0}
}

func (s *server) localizationAssistantFor(ctx context.Context) LocalizationAssistant {
	assistants := s.defaultLocalizationAssistants(ctx)
	if s.LocalizationAssistant != nil {
		assistants = append(assistants, s.LocalizationAssistant)
	}
	if len(assistants) == 0 {
		return nil
	}
	return retryingLocalizationAssistant{assistants: assistants, retries: 0}
}

func (s *server) aiConfigurationSummary(ctx context.Context) (int, int, int, string) {
	providers, err := s.listAIProviders(ctx)
	if err != nil {
		return 0, 0, 0, "读取失败"
	}
	enabled := 0
	latest := "尚未测试"
	var latestTime time.Time
	for _, item := range providers {
		if item.Enabled {
			enabled++
		}
		if parsed, parseErr := time.Parse(time.RFC3339Nano, item.LastTestedAt); parseErr == nil && parsed.After(latestTime) {
			latestTime = parsed
			latest = map[string]string{"online": "连接正常", "offline": "连接失败"}[item.LastTestStatus]
			if latest == "" {
				latest = "尚未测试"
			}
		}
	}
	configured := 0
	routes, _ := s.listAIFeatureRoutes(ctx)
	for _, route := range routes {
		if route.PrimaryProviderID != nil {
			configured++
		}
	}
	return len(providers), enabled, configured, latest
}

func (s *server) aiConfigurationDebugString(ctx context.Context) string {
	total, enabled, configured, latest := s.aiConfigurationSummary(ctx)
	return fmt.Sprintf("providers=%d enabled=%d routes=%d latest=%s", total, enabled, configured, latest)
}
