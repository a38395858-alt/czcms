package app

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"czcms/internal/catalog"
	"czcms/internal/contentsafety"
)

func TestGuidePaginationSEOAndOwnedAlias(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	defer a.Close()
	get := func(path string) *httptest.ResponseRecorder {
		w := httptest.NewRecorder()
		localPreviewHandler(a.Handler(), "global").ServeHTTP(w, httptest.NewRequest(http.MethodGet, "http://localhost:8081/"+path, nil))
		return w
	}
	w := get("guides?page=999")
	if w.Code != http.StatusNotFound {
		t.Fatalf("out of range archive is a soft 404: %d", w.Code)
	}
	if topic := get("product-sourcing"); topic.Code != 200 || !strings.Contains(topic.Body.String(), `property="og:url" content="http://localhost:8081/product-sourcing"`) {
		t.Fatal("topic preview has no own social URL")
	}
	now := time.Now().UTC().Format(time.RFC3339)
	result, err := a.db.Exec(`INSERT INTO users(username,display_name,password_hash,password_changed_at,created_at,updated_at) VALUES('seo-qa','QA','test',?,?,?)`, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	actor, _ := result.LastInsertId()
	s := catalog.New(a.db, contentsafety.NewSanitizer())
	site, err := s.SiteByCode(context.Background(), "global")
	if err != nil {
		t.Fatal(err)
	}
	for i := 0; i < 13; i++ {
		_, err = s.CreateContent(context.Background(), actor, catalog.CreateContentInput{ContentType: "article", SiteID: site.ID, Locale: "en", Status: "published", Title: fmt.Sprintf("SEO pagination article %d", i), Slug: fmt.Sprintf("guides/seo-pagination-%d", i), BodyHTML: "<h2>Shipment planning</h2><p>Route details.</p>", AIState: "manual"})
		if err != nil {
			t.Fatal(err)
		}
	}
	w = get("guides?page=2")
	body := w.Body.String()
	if w.Code != 200 || !strings.Contains(body, `"url":"http://localhost:8081/guides?page=2"`) || !strings.Contains(body, "Page 2</title>") || strings.Contains(body, `<link rel="alternate" hreflang=`) || !strings.Contains(body, `property="og:type" content="website"`) {
		t.Fatalf("page two SEO: status=%d body=%s", w.Code, body[:min(len(body), 7000)])
	}
	// A published custom page must win over a built-in localized alias.
	_, err = s.CreateContent(context.Background(), actor, catalog.CreateContentInput{ContentType: "page", SiteID: site.ID, Locale: "en", Status: "published", Title: "Owned contact route", Slug: "kontakt", BodyHTML: "<h2>Our contact information</h2><p>Editor-owned page.</p>", AIState: "manual"})
	if err != nil {
		t.Fatal(err)
	}
	w = get("kontakt")
	if w.Code != 200 || !strings.Contains(w.Body.String(), "Editor-owned page.") {
		t.Fatalf("owned alias replaced: %d", w.Code)
	}
	article := get("guides/seo-pagination-0").Body.String()
	if !strings.Contains(article, `Published by <a href="/about">FreightVanta</a>`) || !strings.Contains(article, `class="reading-planning-note"`) || strings.Contains(article, `"name":"seo-qa"`) {
		t.Fatal("article publisher or planning disclosure missing")
	}
}
