package catalog

import (
	"context"
	"path/filepath"
	"testing"

	"czcms/internal/contentsafety"
	"czcms/internal/database"
)

func TestPublishedContentNeighborsRespectVisibilityAndOrder(t *testing.T) {
	ctx := context.Background()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "neighbors.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	service := New(db, contentsafety.NewSanitizer())
	site, err := service.SiteByCode(ctx, "global")
	if err != nil {
		t.Fatal(err)
	}
	result, err := db.Exec(`INSERT INTO users(username,display_name,password_hash,password_changed_at,created_at,updated_at) VALUES('neighbor-qa','QA','test',?,?,?)`, nowUTC(), nowUTC(), nowUTC())
	if err != nil {
		t.Fatal(err)
	}
	actor, _ := result.LastInsertId()
	create := func(slug, kind, status, date string) ContentLocale {
		t.Helper()
		item, e := service.CreateContent(ctx, actor, CreateContentInput{ContentType: kind, SiteID: site.ID, Locale: "en", Status: status, Title: slug, Slug: slug, Summary: "QA", BodyHTML: "<h2>QA</h2><p>Body</p>", AIState: "manual"})
		if e != nil {
			t.Fatal(e)
		}
		if _, e = db.Exec(`UPDATE content_locales SET published_at=? WHERE id=?`, date, item.ID); e != nil {
			t.Fatal(e)
		}
		return item
	}
	older := create("qa-older", "article", "published", "2020-01-01T00:00:00Z")
	current := create("qa-current", "article", "published", "2020-01-02T00:00:00Z")
	newer := create("qa-newer", "article", "published", "2020-01-02T00:00:00Z")
	create("qa-draft", "article", "draft", "2020-01-02T00:00:00Z")
	create("qa-product", "product", "published", "2020-01-02T00:00:00Z")
	create("qa-utility", "page", "published", "2020-01-02T00:00:00Z")
	future := create("qa-future", "article", "published", "2020-01-02T00:00:00Z")
	if _, err = db.Exec(`UPDATE content_locales SET scheduled_at='2999-01-01T00:00:00Z' WHERE id=?`, future.ID); err != nil {
		t.Fatal(err)
	}
	deleted := create("qa-deleted", "article", "published", "2020-01-02T00:00:00Z")
	if _, err = db.Exec(`UPDATE contents SET deleted_at=? WHERE id=?`, nowUTC(), deleted.ContentID); err != nil {
		t.Fatal(err)
	}
	previous, next, err := service.PublishedContentNeighbors(ctx, current)
	if err != nil || previous == nil || next == nil || previous.ID != older.ID || next.ID != newer.ID {
		t.Fatalf("neighbors: %v %v %v", previous, next, err)
	}
	previous, _, err = service.PublishedContentNeighbors(ctx, older)
	if err != nil || previous != nil {
		t.Fatalf("oldest must not wrap: %+v %v", previous, err)
	}
	if _, err = db.Exec(`UPDATE site_languages SET enabled=0 WHERE site_id=? AND locale='en'`, site.ID); err != nil {
		t.Fatal(err)
	}
	previous, next, err = service.PublishedContentNeighbors(ctx, current)
	if err != nil || previous != nil || next != nil {
		t.Fatal("disabled language leaked")
	}
}
