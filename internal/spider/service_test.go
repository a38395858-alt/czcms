package spider

import (
	"context"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
	"time"

	"czcms/internal/database"
)

func TestCrawlerOverviewIsPrivateAndFilterable(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "spider.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })

	service := New(db)
	t.Cleanup(func() { _ = service.Close(context.Background()) })

	google := httptest.NewRequest(http.MethodGet, "https://example.test/guides/express?private=do-not-store", nil)
	google.Header.Set("User-Agent", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")
	google.Header.Set("X-Forwarded-For", "203.0.113.45")
	visit := service.Prepare(google, 1, "en", "International express guide", "文章")
	if visit == nil {
		t.Fatal("Googlebot request was not recognised")
	}
	service.Track(visit, http.StatusOK)

	// The same path seen by a different bot is still a single crawled URL,
	// while the individual bot/status record remains available to the report.
	bing := httptest.NewRequest(http.MethodGet, "https://example.test/guides/express?private=do-not-store", nil)
	bing.Header.Set("User-Agent", "bingbot/2.0 (+http://www.bing.com/bingbot.htm)")
	service.Track(service.Prepare(bing, 1, "en", "International express guide", "文章"), http.StatusNotFound)

	otherSite := httptest.NewRequest(http.MethodGet, "https://example.test/contact", nil)
	otherSite.Header.Set("User-Agent", "Googlebot/2.1")
	service.Track(service.Prepare(otherSite, 2, "de-DE", "Kontakt", "单页面"), http.StatusServiceUnavailable)

	visitor := httptest.NewRequest(http.MethodGet, "https://example.test/guides/express", nil)
	visitor.Header.Set("User-Agent", "Mozilla/5.0")
	if service.Prepare(visitor, 1, "en", "", "文章") != nil {
		t.Fatal("ordinary visitor must not be recorded as a crawler")
	}
	if err := service.Flush(ctx); err != nil {
		t.Fatal(err)
	}

	today := time.Now().UTC().Format("2006-01-02")
	report, err := service.Overview(ctx, []int64{1}, today, today, Filter{Status: "all"})
	if err != nil {
		t.Fatal(err)
	}
	if report.Summary.Requests != 2 || report.Summary.CrawledURLs != 1 || report.Summary.Success != 1 || report.Summary.Errors != 1 {
		t.Fatalf("site 1 summary = %+v, want 2 requests, 1 URL, 1 success, 1 error", report.Summary)
	}
	if len(report.Bots) != 2 || len(report.Recent) != 2 {
		t.Fatalf("report records bots=%d recent=%d, want 2 each", len(report.Bots), len(report.Recent))
	}

	errorsOnly, err := service.Overview(ctx, []int64{1}, today, today, Filter{Status: "4xx"})
	if err != nil {
		t.Fatal(err)
	}
	if errorsOnly.Summary.Requests != 1 || errorsOnly.Summary.Success != 0 || errorsOnly.Summary.Errors != 1 || len(errorsOnly.Recent) != 1 {
		t.Fatalf("4xx report = %+v recent=%d, want only one 404", errorsOnly.Summary, len(errorsOnly.Recent))
	}

	var storedPath, storedTitle string
	if err := db.QueryRowContext(ctx, `SELECT path, title FROM spider_pages WHERE site_id = 1 LIMIT 1`).Scan(&storedPath, &storedTitle); err != nil {
		t.Fatal(err)
	}
	if storedPath != "/guides/express" || storedTitle != "International express guide" {
		t.Fatalf("stored crawler detail = path %q title %q", storedPath, storedTitle)
	}
	var forbiddenColumns int
	if err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM pragma_table_info('spider_pages') WHERE name IN ('ip', 'user_agent', 'referer', 'query')`).Scan(&forbiddenColumns); err != nil {
		t.Fatal(err)
	}
	if forbiddenColumns != 0 {
		t.Fatalf("spider_pages contains %d forbidden private-data columns", forbiddenColumns)
	}
}

func TestCrawlerTopPagesAreGroupedByEngine(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "top-pages.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	service := New(db)
	t.Cleanup(func() { _ = service.Close(context.Background()) })

	request := func(ua, path, title string, status int) {
		r := httptest.NewRequest(http.MethodGet, "https://example.test"+path, nil)
		r.Header.Set("User-Agent", ua)
		item := service.Prepare(r, 1, "en", title, "文章")
		if item == nil {
			t.Fatalf("UA %q was not recognised", ua)
		}
		service.Track(item, status)
	}
	for i := 0; i < 3; i++ {
		request("Googlebot/2.1", "/guides/popular", "Popular guide", http.StatusOK)
	}
	request("bingbot/2.0", "/guides/popular", "Popular guide", http.StatusOK)
	request("GPTBot/1.0", "/contact", "Contact", http.StatusOK)
	request("OAI-SearchBot/1.0", "/contact", "Contact", http.StatusOK)
	request("GeminiBot/1.0", "/about", "About", http.StatusOK)
	if err := service.Flush(ctx); err != nil {
		t.Fatal(err)
	}
	today := time.Now().UTC().Format("2006-01-02")
	report, err := service.Overview(ctx, []int64{1}, today, today, Filter{})
	if err != nil {
		t.Fatal(err)
	}
	if len(report.TopPages) != 4 {
		t.Fatalf("top pages=%d, want 4", len(report.TopPages))
	}
	if report.TopPages[0].Engine != "Google" || report.TopPages[0].Path != "/guides/popular" || report.TopPages[0].Requests != 3 {
		t.Fatalf("first top page=%+v", report.TopPages[0])
	}
	if report.TopPages[0].Share != 100 {
		t.Fatalf("Google share=%.1f, want 100", report.TopPages[0].Share)
	}
	if report.TopPages[1].Engine != "GPT / OpenAI" || report.TopPages[1].Requests != 2 || report.TopPages[1].Share != 100 {
		t.Fatalf("OpenAI top page=%+v", report.TopPages[1])
	}
	google, err := service.Overview(ctx, []int64{1}, today, today, Filter{Engine: "Google"})
	if err != nil {
		t.Fatal(err)
	}
	if google.Summary.Requests != 3 || len(google.TopPages) != 1 || google.TopPages[0].Bot != "Googlebot" {
		t.Fatalf("Google engine filter summary=%+v top=%+v", google.Summary, google.TopPages)
	}
	openai, err := service.Overview(ctx, []int64{1}, today, today, Filter{Engine: "GPT / OpenAI"})
	if err != nil {
		t.Fatal(err)
	}
	if openai.Summary.Requests != 2 || len(openai.TopPages) != 1 || openai.TopPages[0].Path != "/contact" {
		t.Fatalf("OpenAI engine filter summary=%+v top=%+v", openai.Summary, openai.TopPages)
	}
}
