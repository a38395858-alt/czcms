package httpserver

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"czcms/internal/catalog"
)

func TestValidateRemoteMediaURLRejectsPrivateAndUnsafeTargets(t *testing.T) {
	for _, raw := range []string{
		"http://127.0.0.1/image.png",
		"http://localhost/image.png",
		"http://10.0.0.4/image.png",
		"http://[::1]/image.png",
		"file:///etc/passwd",
		"http://user:pass@example.com/image.png",
	} {
		if _, err := validateRemoteMediaURL(context.Background(), raw); err == nil {
			t.Errorf("unsafe remote URL accepted: %s", raw)
		}
	}
}

func TestOpenAICompatibleSEOAssistantUsesLocalizedArticleContext(t *testing.T) {
	var received struct {
		Model    string `json:"model"`
		Messages []struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"messages"`
	}
	provider := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/chat/completions" {
			t.Errorf("path=%q", r.URL.Path)
		}
		if r.Header.Get("Authorization") != "Bearer test-secret" {
			t.Errorf("authorization header missing")
		}
		if err := json.NewDecoder(r.Body).Decode(&received); err != nil {
			t.Errorf("decode request: %v", err)
		}
		content := `{"h1":"Internationaler Versand nach Deutschland","title":"Internationaler Versand nach Deutschland","meta_description":"Sichere Versandoptionen für den deutschen Markt.","primary_keyword":"internationaler Versand Deutschland","secondary_keywords":["Versand nach Deutschland"],"og_title":"Internationaler Versand","og_description":"Versandoptionen im Überblick.","structured_data":{"@context":"https://schema.org","@type":"Article"}}`
		response, _ := json.Marshal(map[string]any{"choices": []any{map[string]any{"message": map[string]string{"content": content}}}})
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(response)
	}))
	t.Cleanup(provider.Close)

	assistant, err := NewOpenAICompatibleSEOAssistant(OpenAICompatibleSEOConfig{
		BaseURL: provider.URL + "/v1", APIKey: "test-secret", Model: "test-model", Timeout: time.Second,
	})
	if err != nil {
		t.Fatal(err)
	}
	suggestion, err := assistant.Suggest(context.Background(), SEOSuggestionInput{
		SiteName: "德国站", MarketCode: "DE", Locale: "de-DE", Title: "欧洲物流", BodyHTML: "<p>正文 &amp; 服务</p>",
	})
	if err != nil {
		t.Fatal(err)
	}
	if suggestion.PrimaryKeyword != "internationaler Versand Deutschland" || suggestion.Title == "" {
		t.Fatalf("suggestion=%+v", suggestion)
	}
	if received.Model != "test-model" || len(received.Messages) != 2 {
		t.Fatalf("request=%+v", received)
	}
	if !strings.Contains(received.Messages[1].Content, `"market_code":"DE"`) || !strings.Contains(received.Messages[1].Content, `\u0026`) {
		t.Fatalf("localized context missing: %s", received.Messages[1].Content)
	}
}

func TestOpenAICompatibleLocalizationAssistantUsesTargetMarketContext(t *testing.T) {
	var received struct {
		Messages []struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"messages"`
	}
	provider := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := json.NewDecoder(r.Body).Decode(&received); err != nil {
			t.Errorf("decode request: %v", err)
		}
		content := `{"title":"Versand nach Deutschland","summary":"Lokaler Überblick.","body_html":"<p>Lokaler Inhalt.</p>","slug":"versand-deutschland","category":"Ratgeber","tags":["Versand Deutschland"],"h1":"Versand nach Deutschland","seo_title":"Versand nach Deutschland | Global Route","meta_description":"Lokaler Überblick für Unternehmen.","primary_keyword":"Versand nach Deutschland","secondary_keywords":["internationaler Versand"],"og_title":"Versand nach Deutschland","og_description":"Lokaler Überblick.","structured_data":{"@type":"Article"}}`
		response, _ := json.Marshal(map[string]any{"choices": []any{map[string]any{"message": map[string]string{"content": content}}}})
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(response)
	}))
	t.Cleanup(provider.Close)
	assistant, err := NewOpenAICompatibleLocalizationAssistant(OpenAICompatibleSEOConfig{BaseURL: provider.URL + "/v1", Model: "localization-model", Timeout: time.Second})
	if err != nil {
		t.Fatal(err)
	}
	suggestion, err := assistant.Localize(context.Background(), LocalizationInput{
		SourceSiteName: "Global Route English", SourceMarketCode: "GLOBAL", SourceLocale: "en", TargetSiteName: "Global Route Deutschland", TargetMarketCode: "DE", TargetLocale: "de-DE", TargetLanguage: "Deutsch",
		Title: "International shipping guide", Summary: "A guide.", BodyHTML: `<p>Keep <a href="/contact">contact links</a>.</p>`, Tags: []string{"shipping"}, LockedTerms: []string{"Global Route"},
	})
	if err != nil || suggestion.Slug != "versand-deutschland" || suggestion.Title == "" {
		t.Fatalf("suggestion=%+v err=%v", suggestion, err)
	}
	if len(received.Messages) != 2 || !strings.Contains(received.Messages[1].Content, `"locale":"de-DE"`) || !strings.Contains(received.Messages[0].Content, "不是逐句翻译") {
		t.Fatalf("target context missing: %+v", received)
	}
}

func TestNormalizeLocalizationSuggestionRejectsNewURLsAndPreservesSafeSlug(t *testing.T) {
	source := catalog.ContentLocale{Title: "Source", Summary: "Summary", BodyHTML: `<p><a href="/contact">Contact</a></p>`, Category: "Guides", Tags: []string{"shipping"}}
	output := LocalizationSuggestion{Title: "Deutscher Versand", BodyHTML: `<p><a href="https://evil.example">Spam</a></p>`, Slug: "Market Guide!!!", MetaDescription: "Beschreibung"}
	normalized, err := normalizeLocalizationSuggestion(output, "de-DE", 22)
	if err != nil || normalized.Slug != "market-guide" {
		t.Fatalf("normalized=%+v err=%v", normalized, err)
	}
	if err = validateLocalizedContent(source, normalized, nil, nil); err == nil {
		t.Fatal("new URL was accepted")
	}
}

func TestOpenAICompatibleSEOAssistantRejectsUnsafeRemoteConfiguration(t *testing.T) {
	if _, err := NewOpenAICompatibleSEOAssistant(OpenAICompatibleSEOConfig{BaseURL: "http://example.com/v1", APIKey: "secret", Model: "model"}); err == nil {
		t.Fatal("remote cleartext AI endpoint was accepted")
	}
	if _, err := NewOpenAICompatibleSEOAssistant(OpenAICompatibleSEOConfig{BaseURL: "https://example.com/v1", Model: "model"}); err == nil {
		t.Fatal("remote AI endpoint without key was accepted")
	}
}

func TestRemoteMediaRedirectRejectsPrivateDestination(t *testing.T) {
	client := newRemoteMediaClient()
	next, _ := http.NewRequest(http.MethodGet, "http://127.0.0.1/private.png", nil)
	first, _ := http.NewRequest(http.MethodGet, "https://8.8.8.8/public.png", nil)
	if err := client.CheckRedirect(next, []*http.Request{first}); err == nil {
		t.Fatal("redirect to a private address was accepted")
	}
}

func TestDefaultSEOSuggestionUsesArticleContentWithoutFabricatingMetrics(t *testing.T) {
	suggestion := defaultSEOSuggestion(SEOSuggestionInput{
		Title:    "欧洲国际物流服务指南",
		Summary:  "为跨境团队整理清晰的欧洲运输选择。",
		BodyHTML: `<p>正文 <strong>内容</strong></p><script>bad()</script>`,
		Locale:   "de-DE",
		Tags:     []string{"欧洲物流", "跨境运输", "欧洲物流"},
	})
	if suggestion.H1 != "欧洲国际物流服务指南" || suggestion.Title != suggestion.H1 {
		t.Fatalf("title fallback=%+v", suggestion)
	}
	if suggestion.MetaDescription != "为跨境团队整理清晰的欧洲运输选择。" {
		t.Fatalf("summary fallback=%q", suggestion.MetaDescription)
	}
	if suggestion.PrimaryKeyword != "欧洲物流" || len(suggestion.SecondaryKeywords) != 2 {
		t.Fatalf("keyword fallback=%+v", suggestion)
	}
	if strings.Contains(string(suggestion.StructuredData), "bad()") {
		t.Fatal("structured data contains source markup")
	}
}
