package catalog

import (
	"context"
	"database/sql"
	"fmt"
	"path/filepath"
	"testing"
	"time"

	"czcms/internal/contentsafety"
	"czcms/internal/database"
)

func publicationTestService(t *testing.T) (context.Context, *Service, *sql.DB, int64, int64) {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 40*time.Second)
	t.Cleanup(cancel)
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "publication.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	now := nowUTC()
	result, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at) VALUES ('publication-owner', 'Publication owner', 'test-only', ?, ?, ?)`, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := result.LastInsertId()
	if _, err = db.ExecContext(ctx, `INSERT INTO user_access_scopes(user_id, site_id, locale, created_at) VALUES (?, 0, '*', ?)`, userID, now); err != nil {
		t.Fatal(err)
	}
	var siteID int64
	if err = db.QueryRowContext(ctx, `SELECT id FROM sites WHERE code = 'global'`).Scan(&siteID); err != nil {
		t.Fatal(err)
	}
	return ctx, New(db, contentsafety.NewSanitizer()), db, userID, siteID
}

func TestFirstPublicationSurvivesEditsStatusChangesAndRestore(t *testing.T) {
	ctx, service, db, userID, siteID := publicationTestService(t)
	past := time.Now().UTC().AddDate(0, 0, -7).Format(time.RFC3339)
	item, err := service.CreateContent(ctx, userID, CreateContentInput{ContentType: "article", SiteID: siteID, Locale: "en", Status: "draft", Title: "Publication history", Slug: "publication-history", BodyHTML: "<p>Original body</p>", AIState: "manual", ScheduledAt: past})
	if err != nil || item.PublishedAt != nil {
		t.Fatalf("draft=%+v err=%v", item, err)
	}
	update := func(status, schedule string) {
		t.Helper()
		item, err = service.UpdateContentLocale(ctx, userID, item.ContentID, siteID, "en", UpdateContentLocaleInput{ContentType: "article", Status: status, Title: item.Title, Slug: item.Slug, BodyHTML: "<p>Edited body</p>", AIState: "manual", ScheduledAt: schedule, Version: item.Version})
		if err != nil {
			t.Fatal(err)
		}
	}
	before := time.Now().UTC().Add(-time.Second)
	update("published", past)
	first, err := time.Parse(time.RFC3339, derefContentTime(item.PublishedAt))
	if err != nil || first.Before(before) {
		t.Fatalf("first publish must use actual current time, got %+v", item)
	}
	// Represent an article first published a week ago, without sleeping in tests.
	if _, err = db.ExecContext(ctx, `UPDATE content_locales SET published_at = ?, updated_at = ? WHERE id = ?`, past, past, item.ID); err != nil {
		t.Fatal(err)
	}
	item, err = service.GetContentLocale(ctx, item.ContentID, siteID, "en")
	if err != nil {
		t.Fatal(err)
	}
	future := time.Now().UTC().Add(24 * time.Hour).Format(time.RFC3339)
	assertFirst := func() {
		t.Helper()
		if derefContentTime(item.PublishedAt) != past || item.UpdatedAt == past {
			t.Fatalf("first publication lost or modification time not updated: %+v", item)
		}
	}
	update("published", future)
	assertFirst()
	if _, err = service.GetPublishedContentByPath(ctx, siteID, "en", item.Slug); err != nil {
		t.Fatalf("editing a published article must not reschedule it: %v", err)
	}
	update("draft", "")
	assertFirst()
	update("published", "")
	assertFirst()
	for _, status := range []string{"archived", "review", "published"} {
		_, err = service.BulkUpdateContentLocales(ctx, userID, BulkContentUpdateInput{Status: &status, Targets: []BulkContentTarget{{ContentID: item.ContentID, SiteID: siteID, Locale: "en", Version: item.Version}}})
		if err != nil {
			t.Fatal(err)
		}
		item, err = service.GetContentLocale(ctx, item.ContentID, siteID, "en")
		if err != nil {
			t.Fatal(err)
		}
		assertFirst()
	}
	revisions, err := service.ListRevisions(ctx, userID, item.ContentID, 100)
	if err != nil || len(revisions) < 2 {
		t.Fatalf("revisions=%v err=%v", revisions, err)
	}
	item, err = service.RestoreContentRevision(ctx, userID, item.ContentID, revisions[len(revisions)-1].ID, item.Version)
	if err != nil {
		t.Fatal(err)
	}
	assertFirst()
	update("published", "")
	assertFirst()
}

func TestFuturePublicationCanBeRescheduledAndCancelled(t *testing.T) {
	ctx, service, _, userID, siteID := publicationTestService(t)
	future := time.Now().UTC().Add(24 * time.Hour).Format(time.RFC3339)
	later := time.Now().UTC().Add(48 * time.Hour).Format(time.RFC3339)
	item, err := service.CreateContent(ctx, userID, CreateContentInput{ContentType: "article", SiteID: siteID, Locale: "en", Status: "published", Title: "Scheduled", Slug: "scheduled", BodyHTML: "<p>Scheduled body</p>", AIState: "manual", ScheduledAt: future})
	if err != nil {
		t.Fatal(err)
	}
	item, err = service.UpdateContentLocale(ctx, userID, item.ContentID, siteID, "en", UpdateContentLocaleInput{ContentType: "article", Status: "published", Title: item.Title, Slug: item.Slug, BodyHTML: item.BodyHTML, AIState: "manual", ScheduledAt: later, Version: item.Version})
	if err != nil || derefContentTime(item.PublishedAt) != later {
		t.Fatalf("reschedule=%+v err=%v", item, err)
	}
	for _, status := range []string{"draft", "published"} {
		_, err = service.BulkUpdateContentLocales(ctx, userID, BulkContentUpdateInput{Status: &status, Targets: []BulkContentTarget{{ContentID: item.ContentID, SiteID: siteID, Locale: "en", Version: item.Version}}})
		if err != nil {
			t.Fatal(err)
		}
		item, err = service.GetContentLocale(ctx, item.ContentID, siteID, "en")
		if err != nil {
			t.Fatal(err)
		}
		if status == "draft" && item.PublishedAt != nil || status == "published" && derefContentTime(item.PublishedAt) != later {
			t.Fatalf("scheduled %s=%+v", status, item)
		}
	}
}

func TestContentPaginationFiltersWholeResultAndKeepsScope(t *testing.T) {
	ctx, service, db, userID, siteID := publicationTestService(t)
	future := time.Now().UTC().Add(24 * time.Hour).Format(time.RFC3339)
	for i := 0; i < 105; i++ {
		status, schedule := "published", ""
		if i == 0 {
			schedule = future
		} else if i == 1 {
			status = "draft"
		}
		_, err := service.CreateContent(ctx, userID, CreateContentInput{ContentType: "article", SiteID: siteID, Locale: "en", Status: status, Title: fmt.Sprintf("Article %03d", i), Slug: fmt.Sprintf("article-%03d", i), BodyHTML: "<p>Article body</p>", AIState: "manual", ScheduledAt: schedule})
		if err != nil {
			t.Fatal(err)
		}
	}
	for _, kind := range []string{"page", "product"} {
		_, err := service.CreateContent(ctx, userID, CreateContentInput{ContentType: kind, SiteID: siteID, Locale: "en", Status: "draft", Title: kind, Slug: kind, AIState: "manual"})
		if err != nil {
			t.Fatal(err)
		}
	}
	seen := map[int64]bool{}
	for offset := 0; offset < 105; offset += 20 {
		items, total, err := service.ListContents(ctx, userID, ContentQuery{ContentType: "editorial", Limit: 20, Offset: offset})
		want := 20
		if offset == 100 {
			want = 5
		}
		if err != nil || total != 105 || len(items) != want {
			t.Fatalf("offset=%d total=%d len=%d err=%v", offset, total, len(items), err)
		}
		for _, item := range items {
			if seen[item.ID] {
				t.Fatalf("duplicate across pages: %d", item.ID)
			}
			seen[item.ID] = true
		}
	}
	for _, tc := range []struct {
		status, search string
		want           int64
	}{{"published", "", 103}, {"scheduled", "", 1}, {"draft", "", 1}, {"", "Article 000", 1}, {"published", "Article 000", 0}} {
		items, total, err := service.ListContents(ctx, userID, ContentQuery{ContentType: "editorial", Status: tc.status, Search: tc.search, Limit: 20})
		if err != nil || total != tc.want || len(items) != min(20, int(tc.want)) {
			t.Fatalf("filter=%+v total=%d len=%d err=%v", tc, total, len(items), err)
		}
	}
	counts, err := service.ContentCountsForType(ctx, userID, 0, "", "editorial")
	if err != nil || counts["published"] != 103 || counts["scheduled"] != 1 || counts["draft"] != 1 {
		t.Fatalf("counts=%v err=%v", counts, err)
	}
	// A user restricted to another site cannot see these records on any page.
	if _, err = db.ExecContext(ctx, `UPDATE user_access_scopes SET site_id = (SELECT id FROM sites WHERE code = 'germany') WHERE user_id = ?`, userID); err != nil {
		t.Fatal(err)
	}
	items, total, err := service.ListContents(ctx, userID, ContentQuery{ContentType: "editorial", Limit: 20, Offset: 100})
	if err != nil || total != 0 || len(items) != 0 {
		t.Fatalf("restricted pagination leaked records: total=%d items=%v err=%v", total, items, err)
	}
}
