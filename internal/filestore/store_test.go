package filestore

import (
	"archive/zip"
	"bytes"
	"context"
	"errors"
	"image"
	"image/color"
	"image/png"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"czcms/internal/database"
	"czcms/internal/security"
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
	if media.MediaType != "image/png" || media.Width != 4 || media.Height != 4 {
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
	if _, err = store.SaveMedia(ctx, bytes.NewReader(encoded.Bytes()), "wrong.jpg", int64(encoded.Len()), userID); err == nil {
		t.Fatal("mismatched file extension accepted")
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
	if err != nil || len(files) != 8 {
		t.Fatalf("files=%d err=%v, want 8", len(files), err)
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
