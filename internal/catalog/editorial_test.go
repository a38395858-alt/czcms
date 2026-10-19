package catalog

import (
	"context"
	"fmt"
	"path/filepath"
	"testing"

	"czcms/internal/contentsafety"
	"czcms/internal/database"
)

func TestEditorialPaginationAndCategoryVisibility(t *testing.T) {
	ctx := context.Background()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "editorial.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	s := New(db, contentsafety.NewSanitizer())
	site, _ := s.SiteByCode(ctx, "global")
	result, err := db.Exec(`INSERT INTO users(username,display_name,password_hash,password_changed_at,created_at,updated_at) VALUES('editorial-qa','QA','test',?,?,?)`, nowUTC(), nowUTC(), nowUTC())
	if err != nil {
		t.Fatal(err)
	}
	actor, _ := result.LastInsertId()
	create := func(slug, kind, status, category string) ContentLocale {
		t.Helper()
		item, err := s.CreateContent(ctx, actor, CreateContentInput{ContentType: kind, SiteID: site.ID, Locale: "en", Status: status, Title: slug, Slug: slug, Category: category, BodyHTML: "<h2>Original heading</h2><p>Actual reading content.</p>", AIState: "manual"})
		if err != nil {
			t.Fatal(err)
		}
		return item
	}
	for i := 0; i < 14; i++ {
		create(fmt.Sprintf("editorial-%02d", i), "article", "published", "Public category")
	}
	create("editorial-product", "product", "published", "Products")
	create("editorial-private", "article", "draft", "Private category")
	create("editorial-contact", "page", "published", "Utility category")
	future := create("editorial-future", "article", "published", "Future category")
	if _, err = db.Exec(`UPDATE content_locales SET scheduled_at='2999-01-01T00:00:00Z' WHERE id=?`, future.ID); err != nil {
		t.Fatal(err)
	}
	deleted := create("editorial-deleted", "article", "published", "Deleted category")
	if _, err = db.Exec(`UPDATE contents SET deleted_at=? WHERE id=?`, nowUTC(), deleted.ContentID); err != nil {
		t.Fatal(err)
	}
	first, total, err := s.ListPublishedEditorial(ctx, site.ID, "en", "", 0, 12)
	if err != nil || total != 15 || len(first) != 12 || first[0].Slug != "editorial-product" || first[0].BodyHTML == "" {
		t.Fatalf("first page: total=%d items=%d error=%v", total, len(first), err)
	}
	second, total, err := s.ListPublishedEditorial(ctx, site.ID, "en", "", 12, 12)
	if err != nil || total != 15 || len(second) != 3 {
		t.Fatalf("second page: %d %d %v", total, len(second), err)
	}
	seen := map[int64]bool{}
	for _, item := range first {
		seen[item.ID] = true
	}
	for _, item := range second {
		if seen[item.ID] {
			t.Fatal("pagination repeated a content entry")
		}
	}
	filtered, total, err := s.ListPublishedEditorial(ctx, site.ID, "en", "Products", 0, 12)
	if err != nil || total != 1 || len(filtered) != 1 || filtered[0].Slug != "editorial-product" {
		t.Fatalf("category filter: %+v %d %v", filtered, total, err)
	}
	categories, err := s.PublishedEditorialCategories(ctx, site.ID, "en")
	if err != nil || len(categories) != 2 {
		t.Fatalf("private category leaked: %v %v", categories, err)
	}
	if _, err = db.Exec(`UPDATE site_languages SET enabled=0 WHERE site_id=?`, site.ID); err != nil {
		t.Fatal(err)
	}
	items, total, err := s.ListPublishedEditorial(ctx, site.ID, "en", "", 0, 12)
	if err != nil || total != 0 || len(items) != 0 {
		t.Fatal("disabled language leaked")
	}
}
