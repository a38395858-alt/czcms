package httpserver

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode/utf8"

	"czcms/internal/audit"
	"czcms/internal/catalog"
)

// LocalizationAssistant is provider-neutral so the CMS can use any trusted
// OpenAI-compatible model without coupling content storage to one vendor.
type LocalizationAssistant interface {
	Localize(context.Context, LocalizationInput) (LocalizationSuggestion, error)
}

type LocalizationInput struct {
	SourceSiteName   string
	SourceMarketCode string
	SourceLocale     string
	TargetSiteName   string
	TargetMarketCode string
	TargetLocale     string
	TargetLanguage   string
	ContentType      string
	Title            string
	Summary          string
	BodyHTML         string
	Category         string
	Tags             []string
	SEO              catalog.SEOInput
	LockedTerms      []string
	ForbiddenTerms   []string
}

type LocalizationSuggestion struct {
	Title             string          `json:"title"`
	Summary           string          `json:"summary"`
	BodyHTML          string          `json:"body_html"`
	Slug              string          `json:"slug"`
	Category          string          `json:"category"`
	Tags              []string        `json:"tags"`
	H1                string          `json:"h1"`
	SEOTitle          string          `json:"seo_title"`
	MetaDescription   string          `json:"meta_description"`
	PrimaryKeyword    string          `json:"primary_keyword"`
	SecondaryKeywords []string        `json:"secondary_keywords"`
	OGTitle           string          `json:"og_title"`
	OGDescription     string          `json:"og_description"`
	StructuredData    json.RawMessage `json:"structured_data"`
}

type localizationTargetRequest struct {
	SiteID int64  `json:"site_id"`
	Locale string `json:"locale"`
}

type localizeContentRequest struct {
	SourceSiteID   int64                       `json:"source_site_id"`
	SourceLocale   string                      `json:"source_locale"`
	Targets        []localizationTargetRequest `json:"targets"`
	Scope          string                      `json:"scope"`
	LockedTerms    []string                    `json:"locked_terms"`
	ForbiddenTerms []string                    `json:"forbidden_terms"`
	Overwrite      bool                        `json:"overwrite"`
}

type localizationTargetOption struct {
	SiteID          int64  `json:"site_id"`
	SiteName        string `json:"site_name"`
	SiteStatus      string `json:"site_status"`
	SiteOnline      bool   `json:"site_online"`
	LocalPort       int    `json:"local_port"`
	MarketCode      string `json:"market_code"`
	Locale          string `json:"locale"`
	LanguageName    string `json:"language_name"`
	NativeName      string `json:"native_name"`
	TemplateBound   bool   `json:"template_bound"`
	TemplateOnline  bool   `json:"template_online"`
	Accessible      bool   `json:"accessible"`
	Existing        bool   `json:"existing"`
	ExistingStatus  string `json:"existing_status,omitempty"`
	ExistingAIState string `json:"existing_ai_state,omitempty"`
	Reason          string `json:"reason,omitempty"`
}

type localizationResult struct {
	SiteID          int64  `json:"site_id"`
	SiteName        string `json:"site_name"`
	Locale          string `json:"locale"`
	LanguageName    string `json:"language_name"`
	Status          string `json:"status"`
	Message         string `json:"message"`
	ContentLocaleID int64  `json:"content_locale_id,omitempty"`
}

type localizationJob struct {
	ID             int64                `json:"id"`
	ContentID      int64                `json:"content_id"`
	SourceSiteID   int64                `json:"source_site_id"`
	SourceSiteName string               `json:"source_site_name"`
	SourceLocale   string               `json:"source_locale"`
	SourceTitle    string               `json:"source_title"`
	RequestedBy    string               `json:"requested_by"`
	Status         string               `json:"status"`
	Scope          string               `json:"scope"`
	TargetCount    int                  `json:"target_count"`
	CreatedCount   int                  `json:"created_count"`
	SkippedCount   int                  `json:"skipped_count"`
	FailedCount    int                  `json:"failed_count"`
	Results        []localizationResult `json:"results"`
	CreatedAt      string               `json:"created_at"`
	UpdatedAt      string               `json:"updated_at"`
}

type localizationTargetConfig struct {
	localizationTargetOption
}

var localizedSlugPattern = regexp.MustCompile(`^[a-z0-9](?:[a-z0-9-]{0,79}[a-z0-9])?(?:/[a-z0-9](?:[a-z0-9-]{0,79}[a-z0-9])?)*$`)
var localizedHTMLURLPattern = regexp.MustCompile(`(?i)\b(?:href|src)\s*=\s*["']([^"']+)["']`)

func (s *server) contentLocalizationOptions(w http.ResponseWriter, r *http.Request) {
	contentID, ok := pathID(w, r, "contentID", "内容")
	if !ok {
		return
	}
	sourceSiteID := queryInt64(r, "source_site_id")
	sourceLocale := strings.TrimSpace(r.URL.Query().Get("source_locale"))
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.read", sourceSiteID, sourceLocale) ||
		!s.canAccess(w, r, session.User.ID, "seo.manage", sourceSiteID, sourceLocale) {
		return
	}
	source, err := s.Catalog.GetContentLocale(r.Context(), contentID, sourceSiteID, sourceLocale)
	if err != nil {
		writeCatalogError(w, err, "读取英文源内容失败")
		return
	}
	options, err := s.localizationTargetOptions(r.Context(), session.User.ID, contentID)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取目标语言配置失败")
		return
	}
	assistant := s.localizationAssistantFor(r.Context())
	eligible := isEnglishLocale(source.Locale) && source.Status == "published"
	reason := ""
	if !isEnglishLocale(source.Locale) {
		reason = "默认源内容必须是英语版本"
	} else if source.Status != "published" {
		reason = "请先发布英语源内容，再生成其他语言的待审核版本"
	} else if assistant == nil {
		reason = "尚未配置 AI 服务；系统不会使用机械翻译或伪造本土化内容"
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"ai_available": assistant != nil,
		"eligible":     eligible && assistant != nil,
		"reason":       reason,
		"source":       map[string]any{"content_id": source.ContentID, "site_id": source.SiteID, "site_name": source.SiteName, "locale": source.Locale, "title": source.Title, "status": source.Status},
		"targets":      options,
	})
}

func (s *server) localizationTargetOptions(ctx context.Context, userID, contentID int64) ([]localizationTargetOption, error) {
	rows, err := s.DB.QueryContext(ctx, `
		SELECT s.id, s.name, s.status, s.local_port, s.market_code, sl.locale, l.name_zh, l.native_name,
		       sl.theme_package_id
		FROM sites s JOIN site_languages sl ON sl.site_id = s.id JOIN languages l ON l.id = sl.language_id
		WHERE s.status <> 'disabled' AND sl.enabled = 1 AND l.enabled = 1 AND lower(sl.locale) NOT LIKE 'en%'
		ORDER BY s.local_port, s.id, sl.locale`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	options := make([]localizationTargetOption, 0)
	for rows.Next() {
		var item localizationTargetOption
		var themeID sql.NullInt64
		if err = rows.Scan(&item.SiteID, &item.SiteName, &item.SiteStatus, &item.LocalPort, &item.MarketCode, &item.Locale, &item.LanguageName, &item.NativeName, &themeID); err != nil {
			return nil, err
		}
		item.SiteOnline = item.SiteStatus == "active"
		item.TemplateBound = themeID.Valid
		if themeID.Valid {
			if _, themeErr := s.Catalog.PublicThemeByID(ctx, themeID.Int64); themeErr == nil {
				item.TemplateOnline = true
			} else if !errors.Is(themeErr, catalog.ErrNotFound) {
				return nil, themeErr
			}
		}
		writeAllowed, accessErr := s.Authorization.CanAccess(ctx, userID, "content.write", item.SiteID, item.Locale)
		if accessErr != nil {
			return nil, accessErr
		}
		seoAllowed, accessErr := s.Authorization.CanAccess(ctx, userID, "seo.manage", item.SiteID, item.Locale)
		if accessErr != nil {
			return nil, accessErr
		}
		item.Accessible = writeAllowed && seoAllowed
		if !item.SiteOnline {
			item.Reason = "目标站点处于维护状态，尚未上线"
		} else if !item.TemplateBound {
			item.Reason = "目标语言尚未绑定模板"
		} else if !item.TemplateOnline {
			item.Reason = "当前绑定模板尚未通过安全检查或不能渲染"
		} else if !item.Accessible {
			item.Reason = "当前账号没有此站点 / Locale 的内容与 SEO 权限"
		}
		existing, getErr := s.Catalog.GetContentLocale(ctx, contentID, item.SiteID, item.Locale)
		if getErr == nil {
			item.Existing = true
			item.ExistingStatus = existing.Status
			item.ExistingAIState = existing.AIState
			item.Reason = "已存在语言版本；不会覆盖人工或已生成内容"
		} else if !errors.Is(getErr, catalog.ErrNotFound) {
			return nil, getErr
		}
		options = append(options, item)
	}
	return options, rows.Err()
}

func (s *server) localizeContent(w http.ResponseWriter, r *http.Request) {
	contentID, ok := pathID(w, r, "contentID", "内容")
	if !ok {
		return
	}
	var request localizeContentRequest
	if err := decodeJSON(w, r, &request, 64<<10); err != nil {
		return
	}
	request.SourceLocale = strings.TrimSpace(request.SourceLocale)
	request.Scope = strings.ToLower(strings.TrimSpace(request.Scope))
	if request.Scope == "" {
		request.Scope = "full"
	}
	if request.Scope != "full" {
		writeJSONError(w, http.StatusUnprocessableEntity, "当前版本仅允许完整页面本土化，避免创建正文不完整的语言版本")
		return
	}
	if request.Overwrite {
		writeJSONError(w, http.StatusUnprocessableEntity, "AI 不允许自动覆盖已有语言版本；请进入目标版本人工编辑")
		return
	}
	if len(request.Targets) < 1 || len(request.Targets) > 20 {
		writeJSONError(w, http.StatusUnprocessableEntity, "请选择 1 到 20 个目标语言")
		return
	}
	assistant := s.localizationAssistantFor(r.Context())
	if assistant == nil {
		writeJSONError(w, http.StatusServiceUnavailable, "尚未配置 AI 服务，无法执行语境本土化")
		return
	}
	locked, err := normalizeLocalizationTerms(request.LockedTerms)
	if err != nil {
		writeJSONError(w, http.StatusUnprocessableEntity, "锁定术语无效："+err.Error())
		return
	}
	forbidden, err := normalizeLocalizationTerms(request.ForbiddenTerms)
	if err != nil {
		writeJSONError(w, http.StatusUnprocessableEntity, "禁用词无效："+err.Error())
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.write", request.SourceSiteID, request.SourceLocale) ||
		!s.canAccess(w, r, session.User.ID, "seo.manage", request.SourceSiteID, request.SourceLocale) {
		return
	}
	source, err := s.Catalog.GetContentLocale(r.Context(), contentID, request.SourceSiteID, request.SourceLocale)
	if err != nil {
		writeCatalogError(w, err, "读取英语源内容失败")
		return
	}
	if !isEnglishLocale(source.Locale) {
		writeJSONError(w, http.StatusUnprocessableEntity, "默认源内容必须是英语版本")
		return
	}
	if source.Status != "published" {
		writeJSONError(w, http.StatusUnprocessableEntity, "请先发布英语源内容，再生成其他语言版本")
		return
	}
	var sourceMarket string
	_ = s.DB.QueryRowContext(r.Context(), `SELECT market_code FROM sites WHERE id = ?`, source.SiteID).Scan(&sourceMarket)

	seen := make(map[string]bool, len(request.Targets))
	configs := make([]localizationTargetConfig, 0, len(request.Targets))
	results := make([]localizationResult, 0, len(request.Targets))
	for _, target := range request.Targets {
		target.Locale = strings.TrimSpace(target.Locale)
		key := fmt.Sprintf("%d:%s", target.SiteID, strings.ToLower(target.Locale))
		if target.SiteID < 1 || target.Locale == "" || seen[key] || isEnglishLocale(target.Locale) || target.SiteID == source.SiteID {
			writeJSONError(w, http.StatusUnprocessableEntity, "目标站点或 Locale 重复、无效或仍为英语")
			return
		}
		seen[key] = true
		if !s.canAccess(w, r, session.User.ID, "content.write", target.SiteID, target.Locale) ||
			!s.canAccess(w, r, session.User.ID, "seo.manage", target.SiteID, target.Locale) {
			return
		}
		config, configErr := s.localizationTargetConfig(r.Context(), target.SiteID, target.Locale)
		if configErr != nil {
			writeCatalogError(w, configErr, "目标语言配置不可用")
			return
		}
		existing, getErr := s.Catalog.GetContentLocale(r.Context(), contentID, target.SiteID, target.Locale)
		if getErr == nil {
			results = append(results, localizationResult{SiteID: target.SiteID, SiteName: config.SiteName, Locale: target.Locale, LanguageName: config.LanguageName, Status: "skipped", Message: "已存在语言版本，未覆盖", ContentLocaleID: existing.ID})
			continue
		}
		if !errors.Is(getErr, catalog.ErrNotFound) {
			writeJSONError(w, http.StatusInternalServerError, "检查目标语言版本失败")
			return
		}
		configs = append(configs, config)
	}

	jobID, err := s.createLocalizationJob(r.Context(), session.User.ID, source, request.Scope, len(request.Targets))
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "创建本土化任务失败")
		return
	}

	type generatedTarget struct {
		config     localizationTargetConfig
		suggestion LocalizationSuggestion
		err        error
	}
	generated := make([]generatedTarget, len(configs))
	var wait sync.WaitGroup
	for index, config := range configs {
		wait.Add(1)
		go func(index int, config localizationTargetConfig) {
			defer wait.Done()
			generated[index].config = config
			generated[index].suggestion, generated[index].err = assistant.Localize(r.Context(), LocalizationInput{
				SourceSiteName: source.SiteName, SourceMarketCode: sourceMarket, SourceLocale: source.Locale,
				TargetSiteName: config.SiteName, TargetMarketCode: config.MarketCode, TargetLocale: config.Locale,
				TargetLanguage: config.NativeName, ContentType: source.ContentType, Title: source.Title, Summary: source.Summary,
				BodyHTML: source.BodyHTML, Category: source.Category, Tags: source.Tags,
				SEO:         catalog.SEOInput{H1: source.H1, Title: source.SEOTitle, MetaDescription: source.MetaDescription, PrimaryKeyword: source.PrimaryKeyword, SecondaryKeywords: source.SecondaryKeywords, CanonicalURL: source.CanonicalURL, RobotsIndex: source.RobotsIndex, OGTitle: source.OGTitle, OGDescription: source.OGDescription, StructuredData: source.StructuredData},
				LockedTerms: locked, ForbiddenTerms: forbidden,
			})
		}(index, config)
	}
	wait.Wait()

	for _, item := range generated {
		result := localizationResult{SiteID: item.config.SiteID, SiteName: item.config.SiteName, Locale: item.config.Locale, LanguageName: item.config.LanguageName}
		if item.err != nil {
			result.Status, result.Message = "failed", "AI 服务未能生成有效内容，可稍后重试"
			results = append(results, result)
			s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "content.ai_localization_failed", TargetType: "content", TargetID: strconv.FormatInt(contentID, 10), Success: false, Metadata: map[string]any{"job_id": jobID, "site_id": item.config.SiteID, "locale": item.config.Locale, "reason": item.err.Error()}})
			continue
		}
		normalized, normalizeErr := normalizeLocalizationSuggestion(item.suggestion, item.config.Locale, contentID)
		if normalizeErr == nil {
			normalizeErr = validateLocalizedContent(source, normalized, locked, forbidden)
		}
		if normalizeErr == nil {
			normalized.BodyHTML, normalizeErr = s.Sanitizer.Sanitize(normalized.BodyHTML)
		}
		if normalizeErr != nil {
			result.Status, result.Message = "failed", "AI 返回内容未通过安全或完整性检查"
			results = append(results, result)
			s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "content.ai_localization_rejected", TargetType: "content", TargetID: strconv.FormatInt(contentID, 10), Success: false, Metadata: map[string]any{"job_id": jobID, "site_id": item.config.SiteID, "locale": item.config.Locale, "reason": normalizeErr.Error()}})
			continue
		}
		input := catalog.CreateContentInput{
			// AI output is a working draft, never a submitted-for-review item or
			// an automatic publication. Editors choose when it is ready to enter
			// the normal review workflow after checking the local language and SEO.
			ContentType: source.ContentType, SiteID: item.config.SiteID, Locale: item.config.Locale, Status: "draft",
			Title: normalized.Title, Slug: normalized.Slug, Category: normalized.Category, Tags: normalized.Tags,
			TemplateKey: source.TemplateKey, PageLayout: source.PageLayout, IndexPolicy: source.IndexPolicy, CoverMediaID: source.CoverMediaID, Summary: normalized.Summary, BodyHTML: normalized.BodyHTML,
			AIState: "pending", RevisionAction: "ai_localized",
			SEO: &catalog.SEOInput{H1: normalized.H1, Title: normalized.SEOTitle, MetaDescription: normalized.MetaDescription, PrimaryKeyword: normalized.PrimaryKeyword, SecondaryKeywords: normalized.SecondaryKeywords, RobotsIndex: true, OGTitle: normalized.OGTitle, OGDescription: normalized.OGDescription, StructuredData: normalized.StructuredData},
		}
		created, createErr := s.Catalog.CreateContentLocale(r.Context(), session.User.ID, contentID, input)
		if errors.Is(createErr, catalog.ErrConflict) {
			input.Slug = appendSlugSuffix(input.Slug, contentID)
			created, createErr = s.Catalog.CreateContentLocale(r.Context(), session.User.ID, contentID, input)
		}
		if createErr != nil {
			result.Status, result.Message = "failed", "保存目标语言草稿失败"
			results = append(results, result)
			s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "content.ai_localization_save_failed", TargetType: "content", TargetID: strconv.FormatInt(contentID, 10), Success: false, Metadata: map[string]any{"job_id": jobID, "site_id": item.config.SiteID, "locale": item.config.Locale, "reason": createErr.Error()}})
			continue
		}
		result.Status, result.Message, result.ContentLocaleID = "created", "AI 已生成草稿，等待人工审核", created.ID
		results = append(results, result)
		s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "content.ai_localized", TargetType: "content_locale", TargetID: strconv.FormatInt(created.ID, 10), Success: true, Metadata: map[string]any{"job_id": jobID, "content_id": contentID, "source_site_id": source.SiteID, "source_locale": source.Locale, "site_id": created.SiteID, "locale": created.Locale, "status": created.Status, "ai_state": created.AIState}})
	}

	job, err := s.finishLocalizationJob(r.Context(), jobID, results)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "保存本土化任务结果失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "content.ai_localization_completed", TargetType: "localization_job", TargetID: strconv.FormatInt(jobID, 10), Success: job.FailedCount == 0, Metadata: map[string]any{"content_id": contentID, "targets": job.TargetCount, "created": job.CreatedCount, "skipped": job.SkippedCount, "failed": job.FailedCount}})
	writeJSON(w, http.StatusOK, job)
}

func (s *server) localizationTargetConfig(ctx context.Context, siteID int64, locale string) (localizationTargetConfig, error) {
	var item localizationTargetConfig
	var themeID sql.NullInt64
	err := s.DB.QueryRowContext(ctx, `
			SELECT s.id, s.name, s.status, s.local_port, s.market_code, sl.locale, l.name_zh, l.native_name,
			       sl.theme_package_id
		FROM sites s JOIN site_languages sl ON sl.site_id = s.id JOIN languages l ON l.id = sl.language_id
		WHERE s.id = ? AND sl.locale = ? AND s.status <> 'disabled' AND sl.enabled = 1 AND l.enabled = 1`, siteID, locale).Scan(
		&item.SiteID, &item.SiteName, &item.SiteStatus, &item.LocalPort, &item.MarketCode, &item.Locale, &item.LanguageName, &item.NativeName, &themeID)
	if errors.Is(err, sql.ErrNoRows) {
		return item, fmt.Errorf("%w: 目标语言未启用", catalog.ErrInvalid)
	}
	if err != nil {
		return item, err
	}
	item.SiteOnline = item.SiteStatus == "active"
	if !item.SiteOnline {
		return item, fmt.Errorf("%w: 目标站点尚未上线", catalog.ErrInvalid)
	}
	if !themeID.Valid {
		return item, fmt.Errorf("%w: 目标语言尚未绑定模板", catalog.ErrInvalid)
	}
	item.TemplateBound = true
	if _, err = s.Catalog.PublicThemeByID(ctx, themeID.Int64); err != nil {
		if errors.Is(err, catalog.ErrNotFound) {
			return item, fmt.Errorf("%w: 目标语言绑定的模板尚未通过安全检查或不能渲染", catalog.ErrInvalid)
		}
		return item, err
	}
	item.TemplateOnline = true
	item.Accessible = true
	return item, nil
}

func (s *server) createLocalizationJob(ctx context.Context, userID int64, source catalog.ContentLocale, scope string, targetCount int) (int64, error) {
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := s.DB.ExecContext(ctx, `INSERT INTO localization_jobs(content_id, source_site_id, source_locale, source_title, requested_by, status, scope, target_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'running', ?, ?, ?, ?)`, source.ContentID, source.SiteID, source.Locale, source.Title, userID, scope, targetCount, now, now)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (s *server) finishLocalizationJob(ctx context.Context, jobID int64, results []localizationResult) (localizationJob, error) {
	job := localizationJob{ID: jobID, Results: results}
	for _, result := range results {
		switch result.Status {
		case "created":
			job.CreatedCount++
		case "skipped":
			job.SkippedCount++
		case "failed":
			job.FailedCount++
		}
	}
	job.TargetCount = len(results)
	job.Status = "completed"
	if job.FailedCount > 0 && job.CreatedCount+job.SkippedCount > 0 {
		job.Status = "partial"
	} else if job.FailedCount > 0 {
		job.Status = "failed"
	}
	encoded, err := json.Marshal(results)
	if err != nil {
		return localizationJob{}, err
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	_, err = s.DB.ExecContext(ctx, `UPDATE localization_jobs SET status = ?, target_count = ?, created_count = ?, skipped_count = ?, failed_count = ?, result_json = ?, updated_at = ? WHERE id = ?`, job.Status, job.TargetCount, job.CreatedCount, job.SkippedCount, job.FailedCount, string(encoded), now, jobID)
	if err != nil {
		return localizationJob{}, err
	}
	err = s.DB.QueryRowContext(ctx, `SELECT j.content_id, j.source_site_id, s.name, j.source_locale, j.source_title, COALESCE(u.display_name, ''), j.scope, j.created_at, j.updated_at FROM localization_jobs j JOIN sites s ON s.id = j.source_site_id LEFT JOIN users u ON u.id = j.requested_by WHERE j.id = ?`, jobID).Scan(&job.ContentID, &job.SourceSiteID, &job.SourceSiteName, &job.SourceLocale, &job.SourceTitle, &job.RequestedBy, &job.Scope, &job.CreatedAt, &job.UpdatedAt)
	return job, err
}

func (s *server) listLocalizationJobs(w http.ResponseWriter, r *http.Request) {
	siteID := queryInt64(r, "site_id")
	session := sessionFromContext(r.Context())
	query := `SELECT j.id, j.content_id, j.source_site_id, s.name, j.source_locale, j.source_title, COALESCE(u.display_name, ''), j.status, j.scope, j.target_count, j.created_count, j.skipped_count, j.failed_count, j.result_json, j.created_at, j.updated_at FROM localization_jobs j JOIN sites s ON s.id = j.source_site_id LEFT JOIN users u ON u.id = j.requested_by`
	args := []any{}
	if siteID > 0 {
		query += ` WHERE j.source_site_id = ?`
		args = append(args, siteID)
	}
	query += ` ORDER BY j.id DESC LIMIT 100`
	rows, err := s.DB.QueryContext(r.Context(), query, args...)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取本土化任务失败")
		return
	}
	defer rows.Close()
	jobs := make([]localizationJob, 0)
	for rows.Next() {
		var job localizationJob
		var raw string
		if err = rows.Scan(&job.ID, &job.ContentID, &job.SourceSiteID, &job.SourceSiteName, &job.SourceLocale, &job.SourceTitle, &job.RequestedBy, &job.Status, &job.Scope, &job.TargetCount, &job.CreatedCount, &job.SkippedCount, &job.FailedCount, &raw, &job.CreatedAt, &job.UpdatedAt); err != nil {
			writeJSONError(w, http.StatusInternalServerError, "读取本土化任务失败")
			return
		}
		allowed, accessErr := s.Authorization.CanAccess(r.Context(), session.User.ID, "seo.manage", job.SourceSiteID, job.SourceLocale)
		if accessErr != nil {
			writeJSONError(w, http.StatusInternalServerError, "读取数据权限失败")
			return
		}
		if !allowed {
			continue
		}
		_ = json.Unmarshal([]byte(raw), &job.Results)
		jobs = append(jobs, job)
	}
	if err = rows.Err(); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取本土化任务失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ai_available": s.localizationAssistantFor(r.Context()) != nil, "jobs": jobs})
}

func normalizeLocalizationSuggestion(input LocalizationSuggestion, locale string, contentID int64) (LocalizationSuggestion, error) {
	input.Title = truncateRunes(input.Title, 200)
	input.Summary = truncateRunes(input.Summary, 500)
	input.Category = truncateRunes(input.Category, 100)
	input.H1 = truncateRunes(input.H1, 200)
	input.SEOTitle = truncateRunes(input.SEOTitle, 200)
	input.MetaDescription = truncateRunes(input.MetaDescription, 500)
	input.PrimaryKeyword = truncateRunes(input.PrimaryKeyword, 100)
	input.OGTitle = truncateRunes(input.OGTitle, 200)
	input.OGDescription = truncateRunes(input.OGDescription, 500)
	input.BodyHTML = strings.TrimSpace(input.BodyHTML)
	if utf8.RuneCountInString(input.Title) < 2 || input.BodyHTML == "" {
		return LocalizationSuggestion{}, errors.New("标题或正文为空")
	}
	if input.H1 == "" {
		input.H1 = input.Title
	}
	if input.SEOTitle == "" {
		input.SEOTitle = input.Title
	}
	if input.MetaDescription == "" {
		input.MetaDescription = input.Summary
	}
	if input.OGTitle == "" {
		input.OGTitle = input.SEOTitle
	}
	if input.OGDescription == "" {
		input.OGDescription = input.MetaDescription
	}
	input.Slug = safeLocalizedSlug(input.Slug, locale, contentID)
	input.Tags = normalizeLocalizationKeywords(input.Tags, 30, 60)
	input.SecondaryKeywords = normalizeLocalizationKeywords(input.SecondaryKeywords, 20, 100)
	var object map[string]any
	if len(input.StructuredData) == 0 || len(input.StructuredData) > 64<<10 || json.Unmarshal(input.StructuredData, &object) != nil || object == nil {
		fallback, _ := json.Marshal(map[string]any{"@context": "https://schema.org", "@type": "Article", "headline": input.Title, "description": input.MetaDescription, "inLanguage": locale})
		input.StructuredData = fallback
	}
	return input, nil
}

func normalizeLocalizationKeywords(values []string, limit, runeLimit int) []string {
	seen := make(map[string]bool, len(values))
	result := make([]string, 0, min(len(values), limit))
	for _, value := range values {
		value = truncateRunes(value, runeLimit)
		key := strings.ToLower(value)
		if value == "" || seen[key] {
			continue
		}
		seen[key] = true
		result = append(result, value)
		if len(result) == limit {
			break
		}
	}
	return result
}

func normalizeLocalizationTerms(values []string) ([]string, error) {
	if len(values) > 100 {
		return nil, errors.New("最多 100 个")
	}
	result := normalizeLocalizationKeywords(values, 100, 120)
	return result, nil
}

func validateLocalizedContent(source catalog.ContentLocale, output LocalizationSuggestion, lockedTerms, forbiddenTerms []string) error {
	sourceURLs := make(map[string]bool)
	for _, match := range localizedHTMLURLPattern.FindAllStringSubmatch(source.BodyHTML, -1) {
		if len(match) > 1 {
			sourceURLs[match[1]] = true
		}
	}
	for _, match := range localizedHTMLURLPattern.FindAllStringSubmatch(output.BodyHTML, -1) {
		if len(match) > 1 && !sourceURLs[match[1]] {
			return errors.New("AI 正文添加或修改了未经允许的链接 / 图片地址")
		}
	}
	sourceText := strings.ToLower(strings.Join([]string{source.Title, source.Summary, source.BodyHTML, source.Category, strings.Join(source.Tags, " ")}, " "))
	outputText := strings.ToLower(strings.Join([]string{output.Title, output.Summary, output.BodyHTML, output.Category, strings.Join(output.Tags, " "), output.H1, output.SEOTitle, output.MetaDescription, output.PrimaryKeyword, strings.Join(output.SecondaryKeywords, " ")}, " "))
	for _, term := range lockedTerms {
		if strings.Contains(sourceText, strings.ToLower(term)) && !strings.Contains(outputText, strings.ToLower(term)) {
			return fmt.Errorf("锁定术语 %q 未被保留", term)
		}
	}
	for _, term := range forbiddenTerms {
		if strings.Contains(outputText, strings.ToLower(term)) {
			return fmt.Errorf("AI 内容包含禁用词 %q", term)
		}
	}
	return nil
}

func safeLocalizedSlug(raw, locale string, contentID int64) string {
	raw = strings.ToLower(strings.Trim(strings.TrimSpace(raw), "/"))
	var output strings.Builder
	lastDash := false
	for _, r := range raw {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			output.WriteRune(r)
			lastDash = false
		case r == '/':
			value := strings.Trim(output.String(), "-/")
			output.Reset()
			output.WriteString(value)
			if output.Len() > 0 && output.String()[output.Len()-1] != '/' {
				output.WriteByte('/')
			}
			lastDash = false
		default:
			if !lastDash && output.Len() > 0 && output.String()[output.Len()-1] != '/' {
				output.WriteByte('-')
				lastDash = true
			}
		}
	}
	value := strings.Trim(output.String(), "-/")
	segments := strings.Split(value, "/")
	for index := range segments {
		segments[index] = strings.Trim(segments[index], "-")
		if len(segments[index]) > 80 {
			segments[index] = strings.Trim(segments[index][:80], "-")
		}
	}
	value = strings.Join(segments, "/")
	if len(value) > 180 {
		value = strings.Trim(value[:180], "-/")
	}
	if value == "" || !localizedSlugPattern.MatchString(value) {
		localePart := strings.ToLower(strings.ReplaceAll(locale, "_", "-"))
		localePart = regexp.MustCompile(`[^a-z0-9-]+`).ReplaceAllString(localePart, "-")
		value = fmt.Sprintf("localized-%s-%d", strings.Trim(localePart, "-"), contentID)
	}
	return value
}

func appendSlugSuffix(slug string, contentID int64) string {
	suffix := "-" + strconv.FormatInt(contentID, 10)
	if len(slug)+len(suffix) <= 180 {
		return strings.Trim(slug, "-") + suffix
	}
	return strings.Trim(slug[:180-len(suffix)], "-") + suffix
}

func isEnglishLocale(locale string) bool {
	locale = strings.ToLower(strings.TrimSpace(locale))
	return locale == "en" || strings.HasPrefix(locale, "en-")
}
