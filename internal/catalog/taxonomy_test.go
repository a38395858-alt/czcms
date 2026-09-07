package catalog

import (
	"context"
	"errors"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"czcms/internal/contentsafety"
	"czcms/internal/database"
)

func TestTaxonomyLifecycleContentSyncScopesAndCycles(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "taxonomy.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	now := time.Now().UTC().Format(time.RFC3339)
	userResult, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at)
		VALUES ('taxonomy-owner', '栏目管理员', 'test-only', ?, ?, ?)`, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := userResult.LastInsertId()
	if _, err = db.ExecContext(ctx, `INSERT INTO user_access_scopes(user_id, site_id, locale, created_at) VALUES (?, 0, '*', ?)`, userID, now); err != nil {
		t.Fatal(err)
	}
	var siteID int64
	var locale string
	if err = db.QueryRowContext(ctx, `SELECT s.id, sl.locale FROM sites s JOIN site_languages sl ON sl.site_id = s.id AND sl.enabled = 1 ORDER BY s.local_port LIMIT 1`).Scan(&siteID, &locale); err != nil {
		t.Fatal(err)
	}
	service := New(db, contentsafety.NewSanitizer())
	created, err := service.CreateContent(ctx, userID, CreateContentInput{
		ContentType: "article", SiteID: siteID, Locale: locale, Status: "draft", Title: "Taxonomy content", Slug: "taxonomy-content",
		Category: "Guides", Tags: []string{"Express", "Europe"}, BodyHTML: "<p>Taxonomy body</p>", AIState: "manual",
	})
	if err != nil {
		t.Fatal(err)
	}
	terms, err := service.ListTaxonomy(ctx, userID, siteID, locale, "")
	if err != nil {
		t.Fatal(err)
	}
	if len(terms) != 3 {
		t.Fatalf("terms=%d, want 3: %+v", len(terms), terms)
	}
	byName := make(map[string]TaxonomyTerm, len(terms))
	for _, term := range terms {
		byName[term.Name] = term
		if term.UsageCount != 1 {
			t.Fatalf("term %q usage=%d, want 1", term.Name, term.UsageCount)
		}
	}
	guides := byName["Guides"]
	express := byName["Express"]
	if express.Slug != "express" {
		t.Fatalf("automatic tag slug=%q, want readable name URL", express.Slug)
	}
	guides, err = service.UpdateTaxonomyTerm(ctx, guides.ID, TaxonomyInput{Name: "Knowledge", Slug: "knowledge", Status: "active", Version: guides.Version})
	if err != nil {
		t.Fatal(err)
	}
	express, err = service.UpdateTaxonomyTerm(ctx, express.ID, TaxonomyInput{Name: "Fast Shipping", Slug: "fast-shipping", Status: "active", Version: express.Version})
	if err != nil {
		t.Fatal(err)
	}
	readBack, err := service.GetContentLocale(ctx, created.ContentID, siteID, locale)
	if err != nil {
		t.Fatal(err)
	}
	if readBack.Category != "Knowledge" || len(readBack.Tags) != 2 || readBack.Tags[0] != "Fast Shipping" {
		t.Fatalf("compatibility fields not renamed: category=%q tags=%v", readBack.Category, readBack.Tags)
	}

	updated, err := service.UpdateContentLocale(ctx, userID, created.ContentID, siteID, locale, UpdateContentLocaleInput{
		ContentType: "article", Status: "draft", Title: readBack.Title, Slug: readBack.Slug, Category: "Knowledge",
		Tags: []string{"Fast Shipping", "Customs"}, BodyHTML: readBack.BodyHTML, AIState: "manual", Version: readBack.Version,
	})
	if err != nil {
		t.Fatal(err)
	}
	if updated.Version != readBack.Version+1 {
		t.Fatalf("content version=%d, want %d", updated.Version, readBack.Version+1)
	}
	terms, err = service.ListTaxonomy(ctx, userID, siteID, locale, "")
	if err != nil {
		t.Fatal(err)
	}
	byName = make(map[string]TaxonomyTerm, len(terms))
	for _, term := range terms {
		byName[term.Name] = term
	}
	if byName["Europe"].UsageCount != 0 || byName["Customs"].UsageCount != 1 {
		t.Fatalf("content taxonomy links not resynced: Europe=%d Customs=%d", byName["Europe"].UsageCount, byName["Customs"].UsageCount)
	}
	express = byName["Fast Shipping"]
	disabled, err := service.DisableTaxonomyTerm(ctx, express.ID, express.Version)
	if err != nil {
		t.Fatal(err)
	}
	if disabled.Status != "disabled" || disabled.UsageCount != 1 {
		t.Fatalf("disabled term=%+v, want disabled with retained usage", disabled)
	}
	if _, err = service.UpdateTaxonomyTerm(ctx, disabled.ID, TaxonomyInput{Name: disabled.Name, Slug: disabled.Slug, Status: "active", Version: express.Version}); !errors.Is(err, ErrConflict) {
		t.Fatalf("stale taxonomy update error=%v, want conflict", err)
	}
	if _, err = service.CreateTaxonomyTerm(ctx, TaxonomyInput{SiteID: siteID, Locale: locale, Kind: "category", Name: "knowledge", Slug: "knowledge-copy", Status: "active"}); !errors.Is(err, ErrConflict) {
		t.Fatalf("case-insensitive duplicate error=%v, want conflict", err)
	}
	readableTag, err := service.CreateTaxonomyTerm(ctx, TaxonomyInput{SiteID: siteID, Locale: locale, Kind: "tag", Name: "Customs Clearance", Status: "active"})
	if err != nil {
		t.Fatal(err)
	}
	if readableTag.Slug != "customs_clearance" {
		t.Fatalf("readable tag slug=%q, want customs_clearance", readableTag.Slug)
	}
	fallbackTag, err := service.CreateTaxonomyTerm(ctx, TaxonomyInput{SiteID: siteID, Locale: locale, Kind: "tag", Name: "Customs-Clearance", Status: "active"})
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(fallbackTag.Slug, "tag-") {
		t.Fatalf("conflicting tag slug=%q, want stable tag-* fallback", fallbackTag.Slug)
	}

	root, err := service.CreateTaxonomyTerm(ctx, TaxonomyInput{SiteID: siteID, Locale: locale, Kind: "category", Name: "Root", Slug: "root", Status: "active"})
	if err != nil {
		t.Fatal(err)
	}
	child, err := service.CreateTaxonomyTerm(ctx, TaxonomyInput{SiteID: siteID, Locale: locale, Kind: "category", Name: "Child", Slug: "child", ParentID: &root.ID, Status: "active"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err = service.UpdateTaxonomyTerm(ctx, root.ID, TaxonomyInput{Name: root.Name, Slug: root.Slug, ParentID: &child.ID, Status: root.Status, Version: root.Version}); !errors.Is(err, ErrInvalid) {
		t.Fatalf("cycle update error=%v, want invalid", err)
	}
	revisions, err := service.ListRevisions(ctx, userID, created.ContentID, 30)
	if err != nil || len(revisions) < 2 {
		t.Fatalf("revisions=%v err=%v", revisions, err)
	}
	var firstRevision ContentRevision
	for _, revision := range revisions {
		if revision.Version == 1 && revision.SiteID == siteID && revision.Locale == locale {
			firstRevision = revision
			break
		}
	}
	if firstRevision.ID == 0 {
		t.Fatal("initial revision missing")
	}
	restored, err := service.RestoreContentRevision(ctx, userID, created.ContentID, firstRevision.ID, updated.Version)
	if err != nil {
		t.Fatal(err)
	}
	if restored.Status != "draft" || restored.Version != updated.Version+1 || restored.Category != "Guides" || len(restored.Tags) != 2 || restored.Tags[0] != "Express" {
		t.Fatalf("restored content=%+v", restored)
	}
	revisions, err = service.ListRevisions(ctx, userID, created.ContentID, 30)
	if err != nil || len(revisions) < 3 || revisions[0].Action != "restored" {
		t.Fatalf("restore revision missing: revisions=%v err=%v", revisions, err)
	}
	if _, err = service.RestoreContentRevision(ctx, userID, created.ContentID, firstRevision.ID, updated.Version); !errors.Is(err, ErrConflict) {
		t.Fatalf("stale restore error=%v, want conflict", err)
	}

	noScopeResult, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at)
		VALUES ('taxonomy-no-scope', '无范围用户', 'test-only', ?, ?, ?)`, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	noScopeID, _ := noScopeResult.LastInsertId()
	visible, err := service.ListTaxonomy(ctx, noScopeID, 0, "", "")
	if err != nil || len(visible) != 0 {
		t.Fatalf("taxonomy scope leak: terms=%v err=%v", visible, err)
	}
}
