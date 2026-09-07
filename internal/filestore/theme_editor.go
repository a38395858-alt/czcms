package filestore

import (
	"archive/zip"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"path"
	"strings"
	"time"
	"unicode/utf8"
)

var (
	ErrThemeFileNotFound = errors.New("模板文件不存在")
	ErrThemeFileConflict = errors.New("模板文件已被其他操作修改，请刷新后重试")
)

var editableThemeKeys = map[string]bool{
	"header": true, "footer": true, "home": true, "category": true,
	"product_category": true, "content": true, "product_detail": true,
	"page": true, "search": true, "not_found": true,
}

type ThemeFile struct {
	ThemeID     int64  `json:"theme_id"`
	Key         string `json:"key"`
	Label       string `json:"label"`
	Filename    string `json:"filename"`
	Group       string `json:"group"`
	Origin      string `json:"origin"`
	Content     string `json:"content"`
	Version     int64  `json:"version"`
	ByteSize    int    `json:"byte_size"`
	LineCount   int    `json:"line_count"`
	UpdatedBy   string `json:"updated_by"`
	UpdatedAt   string `json:"updated_at"`
	ChangeCount int64  `json:"change_count"`
}

type ThemeFileValidation struct {
	Valid     bool   `json:"valid"`
	Message   string `json:"message"`
	ByteSize  int    `json:"byte_size"`
	LineCount int    `json:"line_count"`
	CheckedAt string `json:"checked_at"`
}

func themeSourceMetrics(source string) (int, int) {
	lines := 1
	if source != "" {
		lines += strings.Count(source, "\n")
	}
	return len([]byte(source)), lines
}

func validEditableThemeKey(key string) bool {
	return editableThemeKeys[strings.TrimSpace(key)]
}

func (s *Store) ListThemeFiles(ctx context.Context, themeID int64) ([]ThemeFile, error) {
	if themeID < 1 {
		return nil, ErrThemeFileNotFound
	}
	var exists int
	if err := s.db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM theme_packages WHERE id = ?)`, themeID).Scan(&exists); err != nil {
		return nil, err
	}
	if exists == 0 {
		return nil, ErrThemeFileNotFound
	}
	rows, err := s.db.QueryContext(ctx, `SELECT tf.theme_package_id, tf.file_key, tf.label, tf.filename, tf.page_group, tf.origin,
		tf.content, tf.version, COALESCE(u.display_name, u.username, ''), tf.updated_at,
		(SELECT COUNT(*) FROM theme_file_revisions r WHERE r.theme_package_id = tf.theme_package_id AND r.file_key = tf.file_key)
		FROM theme_files tf LEFT JOIN users u ON u.id = tf.updated_by
		WHERE tf.theme_package_id = ?
		ORDER BY CASE tf.page_group WHEN 'layout' THEN 1 WHEN 'page' THEN 2 WHEN 'product' THEN 3 ELSE 4 END,
		CASE tf.file_key WHEN 'header' THEN 1 WHEN 'footer' THEN 2 WHEN 'home' THEN 3 WHEN 'category' THEN 4
		WHEN 'product_category' THEN 5 WHEN 'content' THEN 6 WHEN 'product_detail' THEN 7 WHEN 'page' THEN 8
		WHEN 'search' THEN 9 ELSE 10 END`, themeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]ThemeFile, 0, 8)
	for rows.Next() {
		var item ThemeFile
		if err = rows.Scan(&item.ThemeID, &item.Key, &item.Label, &item.Filename, &item.Group, &item.Origin, &item.Content, &item.Version, &item.UpdatedBy, &item.UpdatedAt, &item.ChangeCount); err != nil {
			return nil, err
		}
		item.ByteSize, item.LineCount = themeSourceMetrics(item.Content)
		items = append(items, item)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return nil, ErrThemeFileNotFound
	}
	return items, nil
}

func (s *Store) GetThemeFile(ctx context.Context, themeID int64, key string) (ThemeFile, error) {
	if themeID < 1 || !validEditableThemeKey(key) {
		return ThemeFile{}, ErrThemeFileNotFound
	}
	var item ThemeFile
	err := s.db.QueryRowContext(ctx, `SELECT tf.theme_package_id, tf.file_key, tf.label, tf.filename, tf.page_group, tf.origin,
		tf.content, tf.version, COALESCE(u.display_name, u.username, ''), tf.updated_at,
		(SELECT COUNT(*) FROM theme_file_revisions r WHERE r.theme_package_id = tf.theme_package_id AND r.file_key = tf.file_key)
		FROM theme_files tf LEFT JOIN users u ON u.id = tf.updated_by
		WHERE tf.theme_package_id = ? AND tf.file_key = ?`, themeID, key).
		Scan(&item.ThemeID, &item.Key, &item.Label, &item.Filename, &item.Group, &item.Origin, &item.Content, &item.Version, &item.UpdatedBy, &item.UpdatedAt, &item.ChangeCount)
	if errors.Is(err, sql.ErrNoRows) {
		return ThemeFile{}, ErrThemeFileNotFound
	}
	if err != nil {
		return ThemeFile{}, err
	}
	item.ByteSize, item.LineCount = themeSourceMetrics(item.Content)
	return item, nil
}

func (s *Store) ValidateThemeFile(ctx context.Context, themeID int64, key, source string) (ThemeFileValidation, error) {
	item, err := s.GetThemeFile(ctx, themeID, key)
	if err != nil {
		return ThemeFileValidation{}, err
	}
	result := ThemeFileValidation{CheckedAt: time.Now().UTC().Format(time.RFC3339Nano)}
	result.ByteSize, result.LineCount = themeSourceMetrics(source)
	if err = ValidateThemeSource(item.Filename, source); err != nil {
		result.Message = err.Error()
		return result, nil
	}
	result.Valid = true
	result.Message = "Go HTML 模板语法和安全规则均已通过"
	return result, nil
}

func (s *Store) UpdateThemeFile(ctx context.Context, themeID int64, key, source string, version, actorUserID int64, changeNote string) (ThemeFile, error) {
	if themeID < 1 || !validEditableThemeKey(key) || version < 1 || actorUserID < 1 {
		return ThemeFile{}, ErrThemeFileNotFound
	}
	changeNote = strings.TrimSpace(changeNote)
	if utf8.RuneCountInString(changeNote) > 200 {
		return ThemeFile{}, errors.New("修改说明不能超过 200 个字符")
	}
	current, err := s.GetThemeFile(ctx, themeID, key)
	if err != nil {
		return ThemeFile{}, err
	}
	if err = ValidateThemeSource(current.Filename, source); err != nil {
		return ThemeFile{}, err
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return ThemeFile{}, err
	}
	defer tx.Rollback()
	var currentVersion int64
	if err = tx.QueryRowContext(ctx, `SELECT version FROM theme_files WHERE theme_package_id = ? AND file_key = ?`, themeID, key).Scan(&currentVersion); errors.Is(err, sql.ErrNoRows) {
		return ThemeFile{}, ErrThemeFileNotFound
	} else if err != nil {
		return ThemeFile{}, err
	}
	if currentVersion != version {
		return ThemeFile{}, ErrThemeFileConflict
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := tx.ExecContext(ctx, `UPDATE theme_files SET content = ?, version = version + 1, updated_by = ?, updated_at = ?
		WHERE theme_package_id = ? AND file_key = ? AND version = ?`, source, actorUserID, now, themeID, key, version)
	if err != nil {
		return ThemeFile{}, err
	}
	if affected, _ := result.RowsAffected(); affected != 1 {
		return ThemeFile{}, ErrThemeFileConflict
	}
	newVersion := version + 1
	if _, err = tx.ExecContext(ctx, `INSERT INTO theme_file_revisions(theme_package_id, file_key, version, content, change_note, actor_user_id, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)`, themeID, key, newVersion, source, changeNote, actorUserID, now); err != nil {
		return ThemeFile{}, err
	}
	if err = tx.Commit(); err != nil {
		return ThemeFile{}, err
	}
	return s.GetThemeFile(ctx, themeID, key)
}

func normalizeManifestTemplateKey(key string) string {
	switch strings.ToLower(strings.ReplaceAll(strings.TrimSpace(key), "-", "_")) {
	case "header", "head":
		return "header"
	case "footer":
		return "footer"
	case "home", "index", "homepage":
		return "home"
	case "category", "archive", "list", "listing":
		return "category"
	case "product_category", "productcategory", "product_archive", "product_list":
		return "product_category"
	case "content", "article", "post", "detail":
		return "content"
	case "product_detail", "productdetail":
		return "product_detail"
	case "page", "single", "single_page":
		return "page"
	case "search":
		return "search"
	case "404", "not_found", "notfound":
		return "not_found"
	default:
		return ""
	}
}

// initializeThemeFiles copies the system starter set and then overlays any
// known logical page types declared by the validated archive manifest. The ZIP
// entry path is never exposed as a writable filesystem path.
func (s *Store) initializeThemeFiles(ctx context.Context, themeID, actorUserID int64, archivePath string, manifest ThemeManifest) error {
	now := time.Now().UTC().Format(time.RFC3339Nano)
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err = tx.ExecContext(ctx, `INSERT OR IGNORE INTO theme_files(theme_package_id, file_key, label, filename, page_group, origin, content, version, updated_by, created_at, updated_at)
		SELECT ?, file_key, label, filename, page_group, 'starter', content, 1, ?, ?, ? FROM theme_files
		WHERE theme_package_id = (SELECT id FROM theme_packages WHERE render_key = 'global-route' ORDER BY id LIMIT 1)`, themeID, actorUserID, now, now); err != nil {
		return err
	}
	archive, err := zip.OpenReader(archivePath)
	if err != nil {
		return err
	}
	defer archive.Close()
	entries := make(map[string]*zip.File, len(archive.File))
	for _, entry := range archive.File {
		entries[path.Clean(strings.ReplaceAll(entry.Name, "\\", "/"))] = entry
	}
	mappings := make(map[string]string, len(manifest.Templates)+1)
	for declaredKey, filename := range manifest.Templates {
		if key := normalizeManifestTemplateKey(declaredKey); key != "" {
			mappings[key] = filename
		}
	}
	if _, ok := mappings["home"]; !ok {
		mappings["home"] = manifest.Entrypoint
	}
	for key, filename := range mappings {
		entry := entries[filename]
		if entry == nil || entry.UncompressedSize64 > 2<<20 {
			continue
		}
		reader, openErr := entry.Open()
		if openErr != nil {
			return openErr
		}
		raw, readErr := io.ReadAll(io.LimitReader(reader, 2<<20))
		reader.Close()
		if readErr != nil {
			return readErr
		}
		if err = ValidateThemeSource(filename, string(raw)); err != nil {
			return fmt.Errorf("初始化模板文件 %s: %w", filename, err)
		}
		if _, err = tx.ExecContext(ctx, `UPDATE theme_files SET content = ?, origin = 'archive', updated_by = ?, updated_at = ?
			WHERE theme_package_id = ? AND file_key = ?`, string(raw), actorUserID, now, themeID, key); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func decodeThemeManifestFromArchive(filename string) (ThemeManifest, error) {
	archive, err := zip.OpenReader(filename)
	if err != nil {
		return ThemeManifest{}, err
	}
	defer archive.Close()
	for _, entry := range archive.File {
		if path.Clean(strings.ReplaceAll(entry.Name, "\\", "/")) != "theme.json" {
			continue
		}
		reader, err := entry.Open()
		if err != nil {
			return ThemeManifest{}, err
		}
		defer reader.Close()
		var manifest ThemeManifest
		if err = json.NewDecoder(io.LimitReader(reader, 64<<10)).Decode(&manifest); err != nil {
			return ThemeManifest{}, err
		}
		return manifest, nil
	}
	return ThemeManifest{}, errors.New("theme.json 不存在")
}
