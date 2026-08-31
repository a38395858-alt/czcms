package catalog

import (
	"context"
	"errors"
	"path/filepath"
	"testing"
	"time"

	"czcms/internal/contentsafety"
	"czcms/internal/database"
)

func TestURLRedirectCRUDAndPublishingPreflight(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "operations.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	now := time.Now().UTC().Format(time.RFC3339)
	result, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at)
		VALUES ('operations-owner', '发布管理员', 'test-only', ?, ?, ?)`, now, now, now)
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

	service := New(db, contentsafety.NewSanitizer())
	created, err := service.CreateURLRedirect(ctx, userID, URLRedirectInput{
		SiteID: siteID, Locale: "en", SourcePath: "old-service.html", TargetPath: "/new-service.html", StatusCode: 301, Enabled: true,
	})
	if err != nil {
		t.Fatal(err)
	}
	if created.SourcePath != "/old-service.html" || created.Version != 1 {
		t.Fatalf("unexpected redirect: %+v", created)
	}
	updated, err := service.UpdateURLRedirect(ctx, userID, created.ID, URLRedirectInput{
		SiteID: siteID, Locale: "en", SourcePath: created.SourcePath, TargetPath: "", StatusCode: 410, Enabled: true, Version: created.Version,
	})
	if err != nil {
		t.Fatal(err)
	}
	if updated.StatusCode != 410 || updated.TargetPath != "" || updated.Version != 2 {
		t.Fatalf("unexpected updated redirect: %+v", updated)
	}
	_, err = service.UpdateURLRedirect(ctx, userID, created.ID, URLRedirectInput{
		SiteID: siteID, Locale: "en", SourcePath: created.SourcePath, StatusCode: 410, Enabled: true, Version: created.Version,
	})
	if !errors.Is(err, ErrConflict) {
		t.Fatalf("stale redirect update error=%v, want conflict", err)
	}
	if err = service.DeleteURLRedirect(ctx, userID, updated.ID, updated.Version); err != nil {
		t.Fatal(err)
	}
	redirects, err := service.ListURLRedirects(ctx, userID, siteID)
	if err != nil || len(redirects) != 0 {
		t.Fatalf("redirects=%v err=%v", redirects, err)
	}

	var themeID int64
	if err = db.QueryRowContext(ctx, `SELECT id FROM theme_packages WHERE render_key = 'global-route'`).Scan(&themeID); err != nil {
		t.Fatal(err)
	}
	if _, err = db.ExecContext(ctx, `UPDATE site_languages SET theme_package_id = ? WHERE site_id = ? AND locale = 'en'`, themeID, siteID); err != nil {
		t.Fatal(err)
	}
	release, err := service.CreatePublishingRelease(ctx, userID, PublishingReleaseInput{
		Name: "测试增量发布", SiteID: siteID, Locale: "en", ReleaseType: "content", Scope: "changed",
	})
	if err != nil {
		t.Fatal(err)
	}
	if release.Status != "completed" || release.Name != "测试增量发布" || len(release.Checks) == 0 {
		t.Fatalf("unexpected release: %+v", release)
	}
	_, err = service.CreatePublishingRelease(ctx, userID, PublishingReleaseInput{
		Name: "非法范围", SiteID: siteID, Locale: "en", ReleaseType: "content", Scope: "everything",
	})
	if !errors.Is(err, ErrInvalid) {
		t.Fatalf("invalid release scope error=%v, want invalid", err)
	}
}
