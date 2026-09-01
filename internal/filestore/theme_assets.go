package filestore

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"
	"unicode/utf8"
)

type ThemeAsset struct {
	ThemeID     int64  `json:"theme_id"`
	Key         string `json:"key"`
	Type        string `json:"type"`
	Label       string `json:"label"`
	Filename    string `json:"filename"`
	Content     string `json:"content"`
	Version     int64  `json:"version"`
	ByteSize    int    `json:"byte_size"`
	LineCount   int    `json:"line_count"`
	UpdatedBy   string `json:"updated_by"`
	UpdatedAt   string `json:"updated_at"`
	ChangeCount int64  `json:"change_count"`
}

var validAssetKeys = map[string]bool{"theme_css": true, "page_css": true, "contact_css": true, "theme_js": true, "contact_js": true}

func validateAssetSource(assetType, source string) error {
	assetType = strings.ToLower(strings.TrimSpace(assetType))
	if assetType != "css" && assetType != "js" {
		return ErrThemeFileNotFound
	}
	if !utf8.ValidString(source) || strings.TrimSpace(source) == "" || len([]byte(source)) > 2<<20 {
		return errors.New("模板资源必须是非空 UTF-8 文本且不能超过 2 MiB")
	}
	if assetType == "css" || strings.HasSuffix(assetType, "_css") {
		return ValidateThemeSource("assets/style.css", source)
	}
	bad := []string{"eval(", "new Function", "document.cookie", "localStorage", "sessionStorage", "<script", "src=", "http://", "https://", "javascript:"}
	lower := strings.ToLower(source)
	for _, token := range bad {
		if strings.Contains(lower, strings.ToLower(token)) {
			return errors.New("模板 JavaScript 包含不允许的动态脚本、外部资源或敏感存储访问")
		}
	}
	return nil
}

func (s *Store) ListThemeAssets(ctx context.Context, themeID int64) ([]ThemeAsset, error) {
	if themeID < 1 {
		return nil, ErrThemeFileNotFound
	}
	rows, err := s.db.QueryContext(ctx, `SELECT a.theme_package_id, a.asset_key, a.asset_type, a.label, a.filename, a.content, a.version, COALESCE(u.display_name, u.username, ''), a.updated_at, (SELECT COUNT(*) FROM theme_asset_revisions r WHERE r.theme_package_id = a.theme_package_id AND r.asset_key = a.asset_key) FROM theme_assets a LEFT JOIN users u ON u.id = a.updated_by WHERE a.theme_package_id = ? ORDER BY a.asset_type, a.asset_key`, themeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]ThemeAsset, 0)
	for rows.Next() {
		var item ThemeAsset
		if err = rows.Scan(&item.ThemeID, &item.Key, &item.Type, &item.Label, &item.Filename, &item.Content, &item.Version, &item.UpdatedBy, &item.UpdatedAt, &item.ChangeCount); err != nil {
			return nil, err
		}
		item.ByteSize, item.LineCount = themeSourceMetrics(item.Content)
		result = append(result, item)
	}
	if len(result) == 0 {
		return nil, ErrThemeFileNotFound
	}
	return result, rows.Err()
}

func (s *Store) GetThemeAsset(ctx context.Context, themeID int64, key string) (ThemeAsset, error) {
	if themeID < 1 || !validAssetKeys[key] {
		return ThemeAsset{}, ErrThemeFileNotFound
	}
	var item ThemeAsset
	var err error
	err = s.db.QueryRowContext(ctx, `SELECT a.theme_package_id, a.asset_key, a.asset_type, a.label, a.filename, a.content, a.version, COALESCE(u.display_name, u.username, ''), a.updated_at, (SELECT COUNT(*) FROM theme_asset_revisions r WHERE r.theme_package_id = a.theme_package_id AND r.asset_key = a.asset_key) FROM theme_assets a LEFT JOIN users u ON u.id = a.updated_by WHERE a.theme_package_id = ? AND a.asset_key = ?`, themeID, key).Scan(&item.ThemeID, &item.Key, &item.Type, &item.Label, &item.Filename, &item.Content, &item.Version, &item.UpdatedBy, &item.UpdatedAt, &item.ChangeCount)
	if errors.Is(err, sql.ErrNoRows) {
		return ThemeAsset{}, ErrThemeFileNotFound
	}
	if err != nil {
		return ThemeAsset{}, err
	}
	item.ByteSize, item.LineCount = themeSourceMetrics(item.Content)
	return item, nil
}

func (s *Store) ValidateThemeAsset(ctx context.Context, themeID int64, key, source string) (ThemeFileValidation, error) {
	item, err := s.GetThemeAsset(ctx, themeID, key)
	if err != nil {
		return ThemeFileValidation{}, err
	}
	result := ThemeFileValidation{CheckedAt: time.Now().UTC().Format(time.RFC3339Nano)}
	result.ByteSize, result.LineCount = themeSourceMetrics(source)
	if err = validateAssetSource(item.Type, source); err != nil {
		result.Message = err.Error()
		return result, nil
	}
	result.Valid = true
	result.Message = "模板资源安全规则已通过"
	return result, nil
}

func (s *Store) UpdateThemeAsset(ctx context.Context, themeID int64, key, source string, version, actorUserID int64, note string) (ThemeAsset, error) {
	if themeID < 1 || version < 1 || actorUserID < 1 {
		return ThemeAsset{}, ErrThemeFileNotFound
	}
	current, err := s.GetThemeAsset(ctx, themeID, key)
	if err != nil {
		return ThemeAsset{}, err
	}
	if err = validateAssetSource(current.Type, source); err != nil {
		return ThemeAsset{}, err
	}
	if utf8.RuneCountInString(note) > 200 {
		return ThemeAsset{}, errors.New("修改说明不能超过 200 个字符")
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return ThemeAsset{}, err
	}
	defer tx.Rollback()
	var currentVersion int64
	if err = tx.QueryRowContext(ctx, `SELECT version FROM theme_assets WHERE theme_package_id = ? AND asset_key = ?`, themeID, key).Scan(&currentVersion); err != nil {
		return ThemeAsset{}, err
	}
	if currentVersion != version {
		return ThemeAsset{}, ErrThemeFileConflict
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := tx.ExecContext(ctx, `UPDATE theme_assets SET content = ?, version = version + 1, updated_by = ?, updated_at = ? WHERE theme_package_id = ? AND asset_key = ? AND version = ?`, source, actorUserID, now, themeID, key, version)
	if err != nil {
		return ThemeAsset{}, err
	}
	affected, _ := result.RowsAffected()
	if affected != 1 {
		return ThemeAsset{}, ErrThemeFileConflict
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO theme_asset_revisions(theme_package_id, asset_key, version, content, change_note, actor_user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`, themeID, key, version+1, source, strings.TrimSpace(note), actorUserID, now); err != nil {
		return ThemeAsset{}, err
	}
	if err = tx.Commit(); err != nil {
		return ThemeAsset{}, err
	}
	// Return the committed values directly. This avoids an unnecessary second
	// query and remains reliable while SQLite releases the transaction cursor.
	current.Content = source
	current.Version = version + 1
	current.UpdatedAt = now
	current.ChangeCount++
	current.ByteSize, current.LineCount = themeSourceMetrics(source)
	return current, nil
}
