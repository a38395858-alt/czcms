package httpserver

import (
	"context"
	"errors"
	"path/filepath"
	"testing"
	"time"

	"czcms/internal/authorization"
	"czcms/internal/catalog"
	"czcms/internal/contentsafety"
	"czcms/internal/database"
)

func testLocalizationTargetServer(t *testing.T) (*server, int64, int64, int64) {
	t.Helper()
	ctx := context.Background()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "localization-targets.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at)
		VALUES ('localization-test', 'Localization Test', 'unused-in-unit-test', ?, ?, ?)`, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := result.LastInsertId()
	if _, err = db.ExecContext(ctx, `INSERT INTO user_roles(user_id, role_id) SELECT ?, id FROM roles WHERE code = 'owner'`, userID); err != nil {
		t.Fatal(err)
	}
	if _, err = db.ExecContext(ctx, `INSERT INTO user_access_scopes(user_id, site_id, locale, created_at) VALUES (?, 0, '*', ?)`, userID, now); err != nil {
		t.Fatal(err)
	}
	var siteID, themeID int64
	if err = db.QueryRowContext(ctx, `SELECT s.id, sl.theme_package_id FROM sites s JOIN site_languages sl ON sl.site_id = s.id WHERE s.code = 'italy' AND sl.locale = 'it-IT'`).Scan(&siteID, &themeID); err != nil {
		t.Fatal(err)
	}
	s := &server{Dependencies: Dependencies{
		DB: db, Authorization: authorization.New(db),
		Catalog: catalog.New(db, contentsafety.NewSanitizer()),
	}}
	return s, userID, siteID, themeID
}

func targetOptionBySite(options []localizationTargetOption, siteID int64) (localizationTargetOption, bool) {
	for _, option := range options {
		if option.SiteID == siteID {
			return option, true
		}
	}
	return localizationTargetOption{}, false
}

func TestLocalizationTargetsRequireLiveSiteLanguageAndRenderableTemplate(t *testing.T) {
	s, userID, siteID, themeID := testLocalizationTargetServer(t)
	ctx := context.Background()

	config, err := s.localizationTargetConfig(ctx, siteID, "it-IT")
	if err != nil || !config.SiteOnline || !config.TemplateBound || !config.TemplateOnline {
		t.Fatalf("seeded live target=%+v err=%v", config, err)
	}

	if _, err = s.DB.ExecContext(ctx, `UPDATE sites SET status = 'maintenance' WHERE id = ?`, siteID); err != nil {
		t.Fatal(err)
	}
	if _, err = s.localizationTargetConfig(ctx, siteID, "it-IT"); !errors.Is(err, catalog.ErrInvalid) {
		t.Fatalf("maintenance target err=%v", err)
	}
	options, err := s.localizationTargetOptions(ctx, userID, 999999)
	if err != nil {
		t.Fatal(err)
	}
	maintenance, found := targetOptionBySite(options, siteID)
	if !found || maintenance.SiteOnline || maintenance.Reason == "" {
		t.Fatalf("maintenance option=%+v found=%v", maintenance, found)
	}

	if _, err = s.DB.ExecContext(ctx, `UPDATE sites SET status = 'active' WHERE id = ?`, siteID); err != nil {
		t.Fatal(err)
	}
	if _, err = s.DB.ExecContext(ctx, `UPDATE site_languages SET enabled = 0 WHERE site_id = ? AND locale = 'it-IT'`, siteID); err != nil {
		t.Fatal(err)
	}
	if _, err = s.localizationTargetConfig(ctx, siteID, "it-IT"); !errors.Is(err, catalog.ErrInvalid) {
		t.Fatalf("disabled locale err=%v", err)
	}
	options, err = s.localizationTargetOptions(ctx, userID, 999999)
	if err != nil {
		t.Fatal(err)
	}
	if _, found = targetOptionBySite(options, siteID); found {
		t.Fatal("disabled locale remained in localization target options")
	}

	if _, err = s.DB.ExecContext(ctx, `UPDATE site_languages SET enabled = 1, theme_package_id = NULL WHERE site_id = ? AND locale = 'it-IT'`, siteID); err != nil {
		t.Fatal(err)
	}
	if _, err = s.localizationTargetConfig(ctx, siteID, "it-IT"); !errors.Is(err, catalog.ErrInvalid) {
		t.Fatalf("unbound template err=%v", err)
	}
	options, err = s.localizationTargetOptions(ctx, userID, 999999)
	if err != nil {
		t.Fatal(err)
	}
	unbound, found := targetOptionBySite(options, siteID)
	if !found || unbound.TemplateBound || unbound.TemplateOnline {
		t.Fatalf("unbound option=%+v found=%v", unbound, found)
	}

	if _, err = s.DB.ExecContext(ctx, `UPDATE site_languages SET theme_package_id = ? WHERE site_id = ? AND locale = 'it-IT'`, themeID, siteID); err != nil {
		t.Fatal(err)
	}
	if _, err = s.DB.ExecContext(ctx, `UPDATE theme_packages SET status = 'disabled' WHERE id = ?`, themeID); err != nil {
		t.Fatal(err)
	}
	if _, err = s.localizationTargetConfig(ctx, siteID, "it-IT"); !errors.Is(err, catalog.ErrInvalid) {
		t.Fatalf("non-renderable template err=%v", err)
	}
	options, err = s.localizationTargetOptions(ctx, userID, 999999)
	if err != nil {
		t.Fatal(err)
	}
	nonRenderable, found := targetOptionBySite(options, siteID)
	if !found || !nonRenderable.TemplateBound || nonRenderable.TemplateOnline || nonRenderable.Reason == "" {
		t.Fatalf("non-renderable option=%+v found=%v", nonRenderable, found)
	}
}
