package httpserver

import (
	"context"
	"encoding/json"
	"html"
	"net/http"
	"regexp"
	"strings"
	"unicode/utf8"

	"czcms/internal/audit"
	"czcms/internal/contentsafety"
)

// SEOAssistant is deliberately provider-neutral. A future AI adapter can be
// injected without changing the editor or HTTP contract. When it is nil, the
// deterministic local assistant below keeps the form useful and never claims
// that an AI model was used.
type SEOAssistant interface {
	Suggest(context.Context, SEOSuggestionInput) (SEOSuggestion, error)
}

type SEOSuggestionInput struct {
	SiteID     int64    `json:"site_id"`
	SiteName   string   `json:"site_name,omitempty"`
	MarketCode string   `json:"market_code,omitempty"`
	Title      string   `json:"title"`
	Summary    string   `json:"summary"`
	BodyHTML   string   `json:"body_html"`
	Locale     string   `json:"locale"`
	Tags       []string `json:"tags"`
}

type SEOSuggestion struct {
	H1                string          `json:"h1"`
	Title             string          `json:"title"`
	MetaDescription   string          `json:"meta_description"`
	PrimaryKeyword    string          `json:"primary_keyword"`
	SecondaryKeywords []string        `json:"secondary_keywords"`
	OGTitle           string          `json:"og_title"`
	OGDescription     string          `json:"og_description"`
	StructuredData    json.RawMessage `json:"structured_data"`
}

type seoSuggestionsResponse struct {
	Available   bool          `json:"ai_available"`
	Source      string        `json:"source"`
	Message     string        `json:"message"`
	Suggestions SEOSuggestion `json:"suggestions"`
}

func (s *server) suggestContentSEO(w http.ResponseWriter, r *http.Request) {
	var input SEOSuggestionInput
	if err := decodeJSON(w, r, &input, contentsafety.MaxRichTextBytes+32<<10); err != nil {
		return
	}
	input.Title = strings.TrimSpace(input.Title)
	input.Summary = strings.TrimSpace(input.Summary)
	input.Locale = strings.TrimSpace(input.Locale)
	if input.Title == "" {
		writeJSONError(w, 422, "请先填写文章标题，再提取 SEO")
		return
	}
	if len(input.BodyHTML) > contentsafety.MaxRichTextBytes {
		writeJSONError(w, 422, "正文超过安全处理大小")
		return
	}
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.write", input.SiteID, input.Locale) {
		return
	}
	if !s.canAccess(w, r, session.User.ID, "seo.manage", input.SiteID, input.Locale) {
		return
	}
	// Market context is read on the server so the browser cannot impersonate a
	// different country when asking the AI for localized search language.
	_ = s.DB.QueryRowContext(r.Context(), `SELECT name, market_code FROM sites WHERE id = ?`, input.SiteID).Scan(&input.SiteName, &input.MarketCode)
	cleaned, err := s.Sanitizer.Sanitize(input.BodyHTML)
	if err != nil {
		writeJSONError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	input.BodyHTML = cleaned
	var (
		suggestion SEOSuggestion
		source     = "fallback"
		available  = false
	)
	assistant := s.seoAssistantFor(r.Context())
	if assistant != nil {
		candidate, err := assistant.Suggest(r.Context(), input)
		if err == nil {
			suggestion = normalizeSEOSuggestion(candidate, input)
			source = "ai"
			available = true
		} else {
			s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "seo.ai_suggestion_failed", TargetType: "content", Success: false, Metadata: map[string]any{"reason": err.Error(), "site_id": input.SiteID, "locale": input.Locale}})
		}
	}
	if !available {
		suggestion = defaultSEOSuggestion(input)
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "seo.suggestions_generated", TargetType: "content", Success: true, Metadata: map[string]any{"source": source, "site_id": input.SiteID, "locale": input.Locale}})
	writeJSON(w, http.StatusOK, seoSuggestionsResponse{Available: available, Source: source, Message: map[bool]string{true: "AI 已根据语境生成候选，请人工审核后保存", false: "未配置 AI，已根据文章标题、摘要、标签和正文生成默认值"}[available], Suggestions: suggestion})
}

var htmlTagPattern = regexp.MustCompile(`(?is)<[^>]*>`)

func defaultSEOSuggestion(input SEOSuggestionInput) SEOSuggestion {
	title := strings.TrimSpace(input.Title)
	plain := strings.TrimSpace(htmlTagPattern.ReplaceAllString(html.UnescapeString(input.BodyHTML), " "))
	description := strings.TrimSpace(input.Summary)
	if description == "" {
		description = plain
	}
	description = truncateRunes(strings.Join(strings.Fields(description), " "), 160)
	if description == "" {
		description = truncateRunes(title, 160)
	}
	keywords := make([]string, 0, 20)
	seen := map[string]bool{}
	add := func(value string) {
		value = strings.TrimSpace(value)
		key := strings.ToLower(value)
		if value == "" || seen[key] || utf8.RuneCountInString(value) > 100 {
			return
		}
		seen[key] = true
		keywords = append(keywords, value)
	}
	for _, tag := range input.Tags {
		add(tag)
		if len(keywords) >= 20 {
			break
		}
	}
	if len(keywords) == 0 {
		// Keep the fallback conservative: one readable phrase is preferable to
		// fabricated keyword metrics or a long list of unrelated terms.
		add(truncateRunes(title, 100))
	}
	primary := ""
	if len(keywords) > 0 {
		primary = keywords[0]
	}
	structured, _ := json.Marshal(map[string]any{
		"@context":    "https://schema.org",
		"@type":       "Article",
		"headline":    title,
		"description": description,
		"inLanguage":  input.Locale,
	})
	return SEOSuggestion{H1: title, Title: title, MetaDescription: description, PrimaryKeyword: primary, SecondaryKeywords: keywords, OGTitle: title, OGDescription: description, StructuredData: structured}
}

func normalizeSEOSuggestion(candidate SEOSuggestion, input SEOSuggestionInput) SEOSuggestion {
	fallback := defaultSEOSuggestion(input)
	choose := func(value, defaultValue string, limit int) string {
		value = strings.TrimSpace(value)
		if value == "" {
			value = defaultValue
		}
		return truncateRunes(value, limit)
	}
	result := SEOSuggestion{
		H1:              choose(candidate.H1, fallback.H1, 200),
		Title:           choose(candidate.Title, fallback.Title, 200),
		MetaDescription: choose(candidate.MetaDescription, fallback.MetaDescription, 500),
		PrimaryKeyword:  choose(candidate.PrimaryKeyword, fallback.PrimaryKeyword, 100),
		OGTitle:         choose(candidate.OGTitle, fallback.OGTitle, 200),
		OGDescription:   choose(candidate.OGDescription, fallback.OGDescription, 500),
	}
	seen := map[string]bool{}
	for _, keyword := range candidate.SecondaryKeywords {
		keyword = truncateRunes(keyword, 100)
		key := strings.ToLower(keyword)
		if keyword == "" || seen[key] {
			continue
		}
		seen[key] = true
		result.SecondaryKeywords = append(result.SecondaryKeywords, keyword)
		if len(result.SecondaryKeywords) == 20 {
			break
		}
	}
	if len(result.SecondaryKeywords) == 0 {
		result.SecondaryKeywords = fallback.SecondaryKeywords
	}
	var object map[string]any
	if len(candidate.StructuredData) > 0 && len(candidate.StructuredData) <= 64<<10 && json.Unmarshal(candidate.StructuredData, &object) == nil && object != nil {
		result.StructuredData = candidate.StructuredData
	} else {
		result.StructuredData = fallback.StructuredData
	}
	return result
}

func truncateRunes(value string, limit int) string {
	value = strings.TrimSpace(value)
	if limit < 1 || utf8.RuneCountInString(value) <= limit {
		return value
	}
	runes := []rune(value)
	return strings.TrimSpace(string(runes[:limit]))
}
