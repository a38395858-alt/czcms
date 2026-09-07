package filestore

import (
	"archive/zip"
	"bytes"
	"context"
	"errors"
	"image"
	"image/color"
	"image/png"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"czcms/internal/database"
	"czcms/internal/security"

	gavif "github.com/gen2brain/gav1d/avif"
)

func writeZip(t *testing.T, files map[string]string) string {
	t.Helper()
	filename := filepath.Join(t.TempDir(), "theme.zip")
	file, err := os.Create(filename)
	if err != nil {
		t.Fatal(err)
	}
	archive := zip.NewWriter(file)
	for name, contents := range files {
		writer, createErr := archive.Create(name)
		if createErr != nil {
			t.Fatal(createErr)
		}
		if _, createErr = writer.Write([]byte(contents)); createErr != nil {
			t.Fatal(createErr)
		}
	}
	if err = archive.Close(); err != nil {
		t.Fatal(err)
	}
	if err = file.Close(); err != nil {
		t.Fatal(err)
	}
	return filename
}

func TestMediaUploadReencodesAndRejectsMismatchedExtension(t *testing.T) {
	ctx := context.Background()
	root := t.TempDir()
	db, err := database.Open(ctx, filepath.Join(root, "media.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	hash, _ := security.HashPassword("correct horse battery staple")
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at) VALUES ('owner', 'Owner', ?, ?, ?, ?)`, hash, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := result.LastInsertId()
	store, err := New(db, filepath.Join(root, "uploads"), filepath.Join(root, "themes"), 2<<20, 5<<20, "")
	if err != nil {
		t.Fatal(err)
	}
	img := image.NewRGBA(image.Rect(0, 0, 4, 4))
	img.Set(0, 0, color.RGBA{R: 255, A: 255})
	var encoded bytes.Buffer
	if err = png.Encode(&encoded, img); err != nil {
		t.Fatal(err)
	}
	withPayload := append(encoded.Bytes(), []byte("<script>tail payload</script>")...)
	media, err := store.SaveMedia(ctx, bytes.NewReader(withPayload), "safe.png", int64(len(withPayload)), userID)
	if err != nil {
		t.Fatal(err)
	}
	if media.MediaType != "image/avif" || media.Width != 4 || media.Height != 4 {
		t.Fatalf("media=%+v", media)
	}
	var storageName string
	if err = db.QueryRowContext(ctx, `SELECT storage_name FROM media_files WHERE id = ?`, media.ID).Scan(&storageName); err != nil {
		t.Fatal(err)
	}
	stored, err := os.ReadFile(filepath.Join(root, "uploads", storageName))
	if err != nil {
		t.Fatal(err)
	}
	if bytes.Contains(stored, []byte("tail payload")) {
		t.Fatal("trailing payload survived re-encoding")
	}
	if _, err = gavif.Decode(bytes.NewReader(stored)); err != nil {
		t.Fatalf("stored media is not a decodable AVIF: %v", err)
	}
	if !strings.HasSuffix(storageName, ".avif") {
		t.Fatalf("storage name=%q, want .avif", storageName)
	}
	if _, err = store.SaveMedia(ctx, bytes.NewReader(encoded.Bytes()), "wrong.jpg", int64(encoded.Len()), userID); err == nil {
		t.Fatal("mismatched file extension accepted")
	}
}

func TestMediaUploadAVIFKeepsContrastingDetails(t *testing.T) {
	ctx := context.Background()
	root := t.TempDir()
	db, err := database.Open(ctx, filepath.Join(root, "media-quality.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	hash, _ := security.HashPassword("correct horse battery staple")
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at) VALUES ('quality-owner', 'Quality Owner', ?, ?, ?, ?)`, hash, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := result.LastInsertId()
	store, err := New(db, filepath.Join(root, "uploads"), filepath.Join(root, "themes"), 2<<20, 5<<20, "")
	if err != nil {
		t.Fatal(err)
	}

	// A UI-like image catches the failure mode that a simple "can decode"
	// test misses: a light canvas, near-black text lines, saturated controls
	// and thin borders. With the old AVIF preset the image decoded, but the
	// controls and text collapsed into a nearly uniform pale rectangle.
	source := image.NewRGBA(image.Rect(0, 0, 256, 160))
	for y := 0; y < 160; y++ {
		for x := 0; x < 256; x++ {
			source.SetRGBA(x, y, color.RGBA{R: 246, G: 248, B: 252, A: 255})
		}
	}
	for y := 28; y < 34; y++ {
		for x := 20; x < 180; x++ {
			source.SetRGBA(x, y, color.RGBA{R: 20, G: 32, B: 52, A: 255})
		}
	}
	for y := 58; y < 112; y++ {
		for x := 20; x < 236; x++ {
			if x == 20 || x == 235 || y == 58 || y == 111 {
				source.SetRGBA(x, y, color.RGBA{R: 41, G: 98, B: 255, A: 255})
			}
		}
	}
	for y := 74; y < 98; y++ {
		for x := 178; x < 224; x++ {
			source.SetRGBA(x, y, color.RGBA{R: 18, G: 132, B: 92, A: 255})
		}
	}
	var input bytes.Buffer
	if err = png.Encode(&input, source); err != nil {
		t.Fatal(err)
	}
	media, err := store.SaveMedia(ctx, bytes.NewReader(input.Bytes()), "interface-detail.png", int64(input.Len()), userID)
	if err != nil {
		t.Fatal(err)
	}
	var storageName string
	if err = db.QueryRowContext(ctx, `SELECT storage_name FROM media_files WHERE id = ?`, media.ID).Scan(&storageName); err != nil {
		t.Fatal(err)
	}
	stored, err := os.ReadFile(filepath.Join(root, "uploads", storageName))
	if err != nil {
		t.Fatal(err)
	}
	decoded, err := gavif.Decode(bytes.NewReader(stored))
	if err != nil {
		t.Fatal(err)
	}
	if contrastAt(decoded, 25, 30, 2, 2) < 120 {
		t.Fatal("AVIF upload lost the dark title contrast")
	}
	if contrastAt(decoded, 200, 84, 2, 2) < 80 {
		t.Fatal("AVIF upload lost the saturated action control")
	}
	border, _, _, _ := decoded.At(20, 80).RGBA()
	if int(border>>8) < 35 {
		t.Fatalf("AVIF upload lost the blue border: red=%d", border>>8)
	}
}

func contrastAt(img image.Image, darkX, darkY, lightX, lightY int) int {
	dr, dg, db, _ := img.At(darkX, darkY).RGBA()
	lr, lg, lb, _ := img.At(lightX, lightY).RGBA()
	dark := int((dr + dg + db) / 3 >> 8)
	light := int((lr + lg + lb) / 3 >> 8)
	if light < dark {
		return dark - light
	}
	return light - dark
}

func TestMigrateExistingMediaToAVIFKeepsReferencesWorking(t *testing.T) {
	ctx := context.Background()
	root := t.TempDir()
	db, err := database.Open(ctx, filepath.Join(root, "legacy-media.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	hash, _ := security.HashPassword("correct horse battery staple")
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at) VALUES ('legacy-owner', 'Legacy Owner', ?, ?, ?, ?)`, hash, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := result.LastInsertId()
	uploads := filepath.Join(root, "uploads")
	store, err := New(db, uploads, filepath.Join(root, "themes"), 2<<20, 5<<20, "")
	if err != nil {
		t.Fatal(err)
	}
	// A 1×1 tracking pixel is a valid PNG even though the AVIF encoder needs
	// a larger coded frame. Migration must pad it rather than leave one legacy
	// image behind forever.
	img := image.NewRGBA(image.Rect(0, 0, 1, 1))
	img.Set(0, 0, color.RGBA{R: 20, G: 120, B: 240, A: 255})
	var encoded bytes.Buffer
	if err = png.Encode(&encoded, img); err != nil {
		t.Fatal(err)
	}
	legacyName := "legacy-library-image.png"
	legacyPath := filepath.Join(uploads, legacyName)
	if err = os.WriteFile(legacyPath, encoded.Bytes(), 0o600); err != nil {
		t.Fatal(err)
	}
	legacySHA, _, err := checksumFile(legacyPath)
	if err != nil {
		t.Fatal(err)
	}
	mediaResult, err := db.ExecContext(ctx, `INSERT INTO media_files(storage_name, original_name, media_type, byte_size, sha256, width, height, uploaded_by, created_at, updated_at) VALUES (?, 'legacy.png', 'image/png', ?, ?, 1, 1, ?, ?, ?)`, legacyName, encoded.Len(), legacySHA, userID, now, now)
	if err != nil {
		t.Fatal(err)
	}
	mediaID, _ := mediaResult.LastInsertId()
	contentResult, err := db.ExecContext(ctx, `INSERT INTO contents(content_type, status, owner_id, version, created_at, updated_at) VALUES ('article', 'draft', ?, 1, ?, ?)`, userID, now, now)
	if err != nil {
		t.Fatal(err)
	}
	contentID, _ := contentResult.LastInsertId()
	var siteID int64
	if err = db.QueryRowContext(ctx, `SELECT id FROM sites ORDER BY id LIMIT 1`).Scan(&siteID); err != nil {
		t.Fatal(err)
	}
	oldURL := PublicMediaURL(mediaID, legacySHA)
	if _, err = db.ExecContext(ctx, `INSERT INTO content_locales(content_id, site_id, locale, status, title, slug, body_html, created_at, updated_at) VALUES (?, ?, 'en', 'draft', 'Legacy image', 'legacy-image', ?, ?, ?)`, contentID, siteID, `<p><img src="`+oldURL+`" alt="legacy"></p>`, now, now); err != nil {
		t.Fatal(err)
	}
	var localeID int64
	if err = db.QueryRowContext(ctx, `SELECT id FROM content_locales WHERE content_id = ? AND site_id = ? AND locale = 'en'`, contentID, siteID).Scan(&localeID); err != nil {
		t.Fatal(err)
	}
	if _, err = db.ExecContext(ctx, `INSERT INTO content_revisions(content_id, content_locale_id, site_id, locale, version, snapshot_json, action, actor_user_id, created_at) VALUES (?, ?, ?, 'en', 1, ?, 'legacy', ?, ?)`, contentID, localeID, siteID, `{"body_html":"<img src=\"`+oldURL+`\">"}`, userID, now); err != nil {
		t.Fatal(err)
	}

	migrated, err := store.MigrateExistingMediaToAVIF(ctx, 12)
	if err != nil || migrated.Converted != 1 || migrated.Failed != 0 || migrated.Remaining != 0 {
		t.Fatalf("migration=%+v err=%v", migrated, err)
	}
	media, file, _, err := store.OpenMedia(ctx, mediaID)
	if err != nil {
		t.Fatal(err)
	}
	stored, readErr := io.ReadAll(file)
	file.Close()
	if readErr != nil || media.MediaType != "image/avif" || media.Width != 4 || media.Height != 4 || !strings.HasSuffix(media.URL, media.SHA256[:16]) {
		t.Fatalf("media=%+v readErr=%v", media, readErr)
	}
	if _, err = gavif.Decode(bytes.NewReader(stored)); err != nil {
		t.Fatalf("migrated file is not AVIF: %v", err)
	}
	if _, err = os.Stat(legacyPath); !errors.Is(err, os.ErrNotExist) {
		t.Fatalf("legacy source still present: %v", err)
	}
	var bodyHTML string
	if err = db.QueryRowContext(ctx, `SELECT body_html FROM content_locales WHERE content_id = ? AND site_id = ? AND locale = 'en'`, contentID, siteID).Scan(&bodyHTML); err != nil {
		t.Fatal(err)
	}
	if strings.Contains(bodyHTML, oldURL) || !strings.Contains(bodyHTML, media.URL) {
		t.Fatalf("rich text URL was not updated: %q", bodyHTML)
	}
	var snapshot string
	if err = db.QueryRowContext(ctx, `SELECT snapshot_json FROM content_revisions WHERE content_id = ?`, contentID).Scan(&snapshot); err != nil {
		t.Fatal(err)
	}
	if strings.Contains(snapshot, oldURL) || !strings.Contains(snapshot, media.URL) {
		t.Fatalf("revision URL was not updated: %q", snapshot)
	}
}

func TestMediaLibraryMetadataPaginationAndReferenceProtection(t *testing.T) {
	ctx := context.Background()
	root := t.TempDir()
	db, err := database.Open(ctx, filepath.Join(root, "media-library.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	hash, _ := security.HashPassword("correct horse battery staple")
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at) VALUES ('media-owner', 'Media Owner', ?, ?, ?, ?)`, hash, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := result.LastInsertId()
	store, err := New(db, filepath.Join(root, "uploads"), filepath.Join(root, "themes"), 2<<20, 5<<20, "")
	if err != nil {
		t.Fatal(err)
	}
	img := image.NewRGBA(image.Rect(0, 0, 8, 6))
	var encoded bytes.Buffer
	if err = png.Encode(&encoded, img); err != nil {
		t.Fatal(err)
	}
	media, err := store.SaveMedia(ctx, bytes.NewReader(encoded.Bytes()), "route-map.png", int64(encoded.Len()), userID)
	if err != nil {
		t.Fatal(err)
	}
	updated, err := store.UpdateMediaAlt(ctx, media.ID, media.Version, "欧洲物流路线地图")
	if err != nil || updated.AltText != "欧洲物流路线地图" || updated.Version != 2 {
		t.Fatalf("updated=%+v err=%v", updated, err)
	}
	listed, err := store.ListMedia(ctx, MediaListOptions{Query: "路线", Limit: 10})
	if err != nil || listed.Total != 1 || len(listed.Items) != 1 || listed.Items[0].UploaderName != "Media Owner" {
		t.Fatalf("listed=%+v err=%v", listed, err)
	}
	if err = store.DeleteMedia(ctx, media.ID, 1); !errors.Is(err, ErrMediaConflict) {
		t.Fatalf("stale delete error=%v", err)
	}

	referenced, err := store.SaveMedia(ctx, bytes.NewReader(encoded.Bytes()), "cover.png", int64(encoded.Len()), userID)
	if err != nil {
		t.Fatal(err)
	}
	contentResult, err := db.ExecContext(ctx, `INSERT INTO contents(content_type, status, owner_id, version, created_at, updated_at) VALUES ('article', 'draft', ?, 1, ?, ?)`, userID, now, now)
	if err != nil {
		t.Fatal(err)
	}
	contentID, _ := contentResult.LastInsertId()
	var siteID int64
	if err = db.QueryRowContext(ctx, `SELECT id FROM sites ORDER BY id LIMIT 1`).Scan(&siteID); err != nil {
		t.Fatal(err)
	}
	if _, err = db.ExecContext(ctx, `INSERT INTO content_locales(content_id, site_id, locale, status, title, slug, cover_media_id, created_at, updated_at) VALUES (?, ?, 'en', 'draft', 'Media reference', 'media-reference', ?, ?, ?)`, contentID, siteID, referenced.ID, now, now); err != nil {
		t.Fatal(err)
	}
	aggregates, err := store.ListMedia(ctx, MediaListOptions{Limit: 1})
	if err != nil || aggregates.Total != 2 || aggregates.MissingAltTotal != 1 || aggregates.ReferenceTotal != 1 {
		t.Fatalf("media aggregates=%+v err=%v", aggregates, err)
	}
	if err = store.DeleteMedia(ctx, referenced.ID, referenced.Version); !errors.Is(err, ErrMediaInUse) {
		t.Fatalf("referenced delete error=%v", err)
	}
	if err = store.DeleteMedia(ctx, media.ID, updated.Version); err != nil {
		t.Fatal(err)
	}
	if _, _, _, err = store.OpenMedia(ctx, media.ID); !errors.Is(err, ErrMediaNotFound) {
		t.Fatalf("deleted media still opens: %v", err)
	}
}

func TestThemeArchiveSecurity(t *testing.T) {
	manifest := `{"name":"safe-theme","version":"1.0.0","engine":"go-html-template-v1","entrypoint":"index.html","templates":{"home":"index.html"}}`
	valid := writeZip(t, map[string]string{"theme.json": manifest, "index.html": `<!doctype html><title>{{.Title}}</title><h1>{{.Heading}}</h1>`, "style.css": `body{background:url('./bg.png')}`})
	if _, err := validateThemeArchive(valid); err != nil {
		t.Fatalf("valid theme rejected: %v", err)
	}
	active := writeZip(t, map[string]string{"theme.json": manifest, "index.html": `<img src=x onerror="alert(1)">`})
	if _, err := validateThemeArchive(active); err == nil || !strings.Contains(err.Error(), "脚本") {
		t.Fatalf("active theme error=%v", err)
	}
	traversal := writeZip(t, map[string]string{"theme.json": manifest, "../index.html": "bad"})
	if _, err := validateThemeArchive(traversal); err == nil {
		t.Fatal("path traversal accepted")
	}
}

func TestCreateStarterThemeCopiesTrustedRuntimeFilesAndAssets(t *testing.T) {
	ctx := context.Background()
	root := t.TempDir()
	db, err := database.Open(ctx, filepath.Join(root, "starter-theme.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at) VALUES ('starter-owner', 'Starter Owner', 'test-only', ?, ?, ?)`, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, err := result.LastInsertId()
	if err != nil {
		t.Fatal(err)
	}
	store, err := New(db, filepath.Join(root, "uploads"), filepath.Join(root, "themes"), 2<<20, 5<<20, "")
	if err != nil {
		t.Fatal(err)
	}

	var sourceID, sourceFiles, sourceAssets int64
	if err = db.QueryRowContext(ctx, `SELECT id FROM theme_packages WHERE render_key = 'global-route' AND kind = 'builtin' AND status = 'validated'`).Scan(&sourceID); err != nil {
		t.Fatal(err)
	}
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM theme_files WHERE theme_package_id = ?`, sourceID).Scan(&sourceFiles); err != nil {
		t.Fatal(err)
	}
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM theme_assets WHERE theme_package_id = ?`, sourceID).Scan(&sourceAssets); err != nil {
		t.Fatal(err)
	}

	created, err := store.CreateStarterTheme(ctx, CreateStarterThemeInput{Name: "Europe logistics brand", Version: "1.0.0", BaseRenderKey: "global-route"}, userID)
	if err != nil {
		t.Fatal(err)
	}
	if created.ID < 1 || created.SHA256 == "" {
		t.Fatalf("created=%+v", created)
	}

	var renderKey, status, storageName string
	var copiedFiles, copiedAssets int64
	if err = db.QueryRowContext(ctx, `SELECT render_key, status, storage_name FROM theme_packages WHERE id = ?`, created.ID).Scan(&renderKey, &status, &storageName); err != nil {
		t.Fatal(err)
	}
	if renderKey != "global-route" || status != "validated" {
		t.Fatalf("template runtime=%q status=%q", renderKey, status)
	}
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM theme_files WHERE theme_package_id = ?`, created.ID).Scan(&copiedFiles); err != nil {
		t.Fatal(err)
	}
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM theme_assets WHERE theme_package_id = ?`, created.ID).Scan(&copiedAssets); err != nil {
		t.Fatal(err)
	}
	if copiedFiles != sourceFiles || copiedFiles == 0 || copiedAssets != sourceAssets || copiedAssets == 0 {
		t.Fatalf("copied files=%d/%d assets=%d/%d", copiedFiles, sourceFiles, copiedAssets, sourceAssets)
	}
	archivePath := filepath.Join(root, "themes", storageName)
	if _, err = os.Stat(archivePath); err != nil {
		t.Fatalf("starter archive missing: %v", err)
	}
	if manifest, err := validateThemeArchive(archivePath); err != nil || manifest.Name != created.Name || manifest.Version != created.Version {
		t.Fatalf("starter archive manifest=%+v err=%v", manifest, err)
	}

	if _, err = store.CreateStarterTheme(ctx, CreateStarterThemeInput{Name: created.Name, Version: created.Version, BaseRenderKey: "global-route"}, userID); !errors.Is(err, ErrThemeConflict) {
		t.Fatalf("duplicate create error=%v, want ErrThemeConflict", err)
	}
	if _, err = store.CreateStarterTheme(ctx, CreateStarterThemeInput{Name: "Untrusted starter", Version: "1.0.0", BaseRenderKey: "uploaded-package"}, userID); err == nil {
		t.Fatal("untrusted renderer accepted")
	}
}

func TestThemeEditorValidatesVersionsAndRejectsUnlistedPaths(t *testing.T) {
	ctx := context.Background()
	root := t.TempDir()
	db, err := database.Open(ctx, filepath.Join(root, "theme-editor.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	hash, _ := security.HashPassword("correct horse battery staple")
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at) VALUES ('theme-editor', 'Theme Editor', ?, ?, ?, ?)`, hash, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := result.LastInsertId()
	store, err := New(db, filepath.Join(root, "uploads"), filepath.Join(root, "themes"), 2<<20, 5<<20, "")
	if err != nil {
		t.Fatal(err)
	}
	var themeID int64
	if err = db.QueryRowContext(ctx, `SELECT id FROM theme_packages WHERE render_key = 'global-route'`).Scan(&themeID); err != nil {
		t.Fatal(err)
	}
	files, err := store.ListThemeFiles(ctx, themeID)
	if err != nil || len(files) != 10 {
		t.Fatalf("files=%d err=%v, want 10", len(files), err)
	}
	header, err := store.GetThemeFile(ctx, themeID, "header")
	if err != nil {
		t.Fatal(err)
	}
	unsafeResult, err := store.ValidateThemeFile(ctx, themeID, "header", `<header><img src="x" onerror="alert(1)"></header>`)
	if err != nil || unsafeResult.Valid || !strings.Contains(unsafeResult.Message, "脚本") {
		t.Fatalf("unsafe validation=%+v err=%v", unsafeResult, err)
	}
	updatedSource := `<header class="site-header"><a href="{{.HomePath}}">{{.SiteName}}</a></header>`
	updated, err := store.UpdateThemeFile(ctx, themeID, "header", updatedSource, header.Version, userID, "精简头部")
	if err != nil || updated.Version != header.Version+1 || updated.Content != updatedSource || updated.ChangeCount != 1 {
		t.Fatalf("updated=%+v err=%v", updated, err)
	}
	if _, err = store.UpdateThemeFile(ctx, themeID, "header", updatedSource, header.Version, userID, "过期覆盖"); !errors.Is(err, ErrThemeFileConflict) {
		t.Fatalf("stale update error=%v", err)
	}
	if _, err = store.GetThemeFile(ctx, themeID, "../header"); !errors.Is(err, ErrThemeFileNotFound) {
		t.Fatalf("unlisted path error=%v", err)
	}
	if _, err = store.UpdateThemeFile(ctx, themeID, "header", `<script>alert(1)</script>`, updated.Version, userID, "危险内容"); err == nil || !strings.Contains(err.Error(), "脚本") {
		t.Fatalf("active template source error=%v", err)
	}
}

func TestThemeAssetsRejectUnsafeJavaScriptAndKeepRevisions(t *testing.T) {
	ctx := context.Background()
	root := t.TempDir()
	db, err := database.Open(ctx, filepath.Join(root, "theme-assets.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at) VALUES ('asset-editor', 'Asset Editor', 'test', ?, ?, ?)`, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := result.LastInsertId()
	store, err := New(db, filepath.Join(root, "uploads"), filepath.Join(root, "themes"), 2<<20, 5<<20, "")
	if err != nil {
		t.Fatal(err)
	}
	var themeID int64
	if err = db.QueryRowContext(ctx, `SELECT id FROM theme_packages WHERE render_key = 'global-route'`).Scan(&themeID); err != nil {
		t.Fatal(err)
	}
	assets, err := store.ListThemeAssets(ctx, themeID)
	if err != nil || len(assets) != 5 {
		t.Fatalf("assets=%d err=%v", len(assets), err)
	}
	asset, err := store.GetThemeAsset(ctx, themeID, "theme_js")
	if err != nil {
		t.Fatal(err)
	}
	unsafe, err := store.ValidateThemeAsset(ctx, themeID, "theme_js", `eval("alert(1)")`)
	if err != nil || unsafe.Valid {
		t.Fatalf("unsafe=%+v err=%v", unsafe, err)
	}
	updated, err := store.UpdateThemeAsset(ctx, themeID, "theme_js", `document.addEventListener('DOMContentLoaded', () => document.documentElement.classList.add('ready'))`, asset.Version, userID, "增加无障碍状态")
	if err != nil || updated.Version != asset.Version+1 || updated.ChangeCount != 1 {
		t.Fatalf("updated=%+v err=%v", updated, err)
	}
	if _, err = store.UpdateThemeAsset(ctx, themeID, "theme_js", updated.Content, asset.Version, userID, "过期写入"); !errors.Is(err, ErrThemeFileConflict) {
		t.Fatalf("conflict=%v", err)
	}
}
