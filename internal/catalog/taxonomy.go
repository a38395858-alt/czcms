package catalog

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"unicode/utf8"
)

type TaxonomyTerm struct {
	ID         int64  `json:"id"`
	SiteID     int64  `json:"site_id"`
	SiteName   string `json:"site_name"`
	Locale     string `json:"locale"`
	Kind       string `json:"kind"`
	Name       string `json:"name"`
	Slug       string `json:"slug"`
	ParentID   *int64 `json:"parent_id,omitempty"`
	ParentName string `json:"parent_name"`
	Status     string `json:"status"`
	UsageCount int64  `json:"usage_count"`
	Version    int64  `json:"version"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

type TaxonomyInput struct {
	SiteID   int64  `json:"site_id"`
	Locale   string `json:"locale"`
	Kind     string `json:"kind"`
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	ParentID *int64 `json:"parent_id"`
	Status   string `json:"status"`
	Version  int64  `json:"version"`
}

func (s *Service) ListTaxonomy(ctx context.Context, userID, siteID int64, locale, kind string) ([]TaxonomyTerm, error) {
	where := []string{`EXISTS(SELECT 1 FROM user_access_scopes uas WHERE uas.user_id = ? AND (uas.site_id = 0 OR uas.site_id = t.site_id) AND (uas.locale = '*' OR uas.locale = t.locale))`}
	args := []any{userID}
	if siteID > 0 {
		where = append(where, "t.site_id = ?")
		args = append(args, siteID)
	}
	locale = strings.TrimSpace(locale)
	if locale != "" {
		where = append(where, "t.locale = ?")
		args = append(args, locale)
	}
	if kind == "category" || kind == "tag" {
		where = append(where, "t.kind = ?")
		args = append(args, kind)
	}
	rows, err := s.db.QueryContext(ctx, `SELECT t.id, t.site_id, s.name, t.locale, t.kind, t.name, t.slug, t.parent_id,
		COALESCE(p.name, ''), t.status, COUNT(ct.term_id), t.version, t.created_at, t.updated_at
		FROM taxonomy_terms t JOIN sites s ON s.id = t.site_id
		LEFT JOIN taxonomy_terms p ON p.id = t.parent_id
		LEFT JOIN content_taxonomy_terms ct ON ct.term_id = t.id
		WHERE `+strings.Join(where, " AND ")+`
		GROUP BY t.id ORDER BY t.kind, t.name COLLATE NOCASE, t.id`, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []TaxonomyTerm
	for rows.Next() {
		var item TaxonomyTerm
		var parent sql.NullInt64
		if err = rows.Scan(&item.ID, &item.SiteID, &item.SiteName, &item.Locale, &item.Kind, &item.Name, &item.Slug, &parent, &item.ParentName, &item.Status, &item.UsageCount, &item.Version, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		if parent.Valid {
			item.ParentID = &parent.Int64
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *Service) GetTaxonomyTerm(ctx context.Context, id int64) (TaxonomyTerm, error) {
	var item TaxonomyTerm
	var parent sql.NullInt64
	err := s.db.QueryRowContext(ctx, `SELECT t.id, t.site_id, s.name, t.locale, t.kind, t.name, t.slug, t.parent_id,
		COALESCE(p.name, ''), t.status, COUNT(ct.term_id), t.version, t.created_at, t.updated_at
		FROM taxonomy_terms t JOIN sites s ON s.id = t.site_id LEFT JOIN taxonomy_terms p ON p.id = t.parent_id
		LEFT JOIN content_taxonomy_terms ct ON ct.term_id = t.id WHERE t.id = ? GROUP BY t.id`, id).Scan(
		&item.ID, &item.SiteID, &item.SiteName, &item.Locale, &item.Kind, &item.Name, &item.Slug, &parent, &item.ParentName, &item.Status, &item.UsageCount, &item.Version, &item.CreatedAt, &item.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return TaxonomyTerm{}, ErrNotFound
	}
	if parent.Valid {
		item.ParentID = &parent.Int64
	}
	return item, err
}

func (s *Service) CreateTaxonomyTerm(ctx context.Context, input TaxonomyInput) (TaxonomyTerm, error) {
	normalizeTaxonomyInput(&input)
	if err := validateTaxonomyInput(input, false); err != nil {
		return TaxonomyTerm{}, err
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return TaxonomyTerm{}, err
	}
	defer tx.Rollback()
	if err = requireEnabledSiteLocale(ctx, tx, input.SiteID, input.Locale); err != nil {
		return TaxonomyTerm{}, err
	}
	if err = validateTaxonomyParent(ctx, tx, 0, input); err != nil {
		return TaxonomyTerm{}, err
	}
	now := nowUTC()
	result, err := tx.ExecContext(ctx, `INSERT INTO taxonomy_terms(site_id, locale, kind, name, slug, parent_id, status, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`, input.SiteID, input.Locale, input.Kind, input.Name, input.Slug, input.ParentID, input.Status, now, now)
	if err != nil {
		return TaxonomyTerm{}, classifyConstraint(err)
	}
	id, _ := result.LastInsertId()
	if err = tx.Commit(); err != nil {
		return TaxonomyTerm{}, err
	}
	return s.GetTaxonomyTerm(ctx, id)
}

func (s *Service) UpdateTaxonomyTerm(ctx context.Context, id int64, input TaxonomyInput) (TaxonomyTerm, error) {
	normalizeTaxonomyInput(&input)
	if id < 1 || input.Version < 1 {
		return TaxonomyTerm{}, invalid("栏目或标签版本无效")
	}
	current, err := s.GetTaxonomyTerm(ctx, id)
	if err != nil {
		return TaxonomyTerm{}, err
	}
	input.SiteID, input.Locale, input.Kind = current.SiteID, current.Locale, current.Kind
	if err = validateTaxonomyInput(input, true); err != nil {
		return TaxonomyTerm{}, err
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return TaxonomyTerm{}, err
	}
	defer tx.Rollback()
	if err = validateTaxonomyParent(ctx, tx, id, input); err != nil {
		return TaxonomyTerm{}, err
	}
	result, err := tx.ExecContext(ctx, `UPDATE taxonomy_terms SET name = ?, slug = ?, parent_id = ?, status = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?`, input.Name, input.Slug, input.ParentID, input.Status, nowUTC(), id, input.Version)
	if err != nil {
		return TaxonomyTerm{}, classifyConstraint(err)
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		return TaxonomyTerm{}, ErrConflict
	}
	if !strings.EqualFold(current.Name, input.Name) {
		if err = propagateTaxonomyName(ctx, tx, id, current.Kind, current.Name, input.Name); err != nil {
			return TaxonomyTerm{}, err
		}
	}
	if err = tx.Commit(); err != nil {
		return TaxonomyTerm{}, err
	}
	return s.GetTaxonomyTerm(ctx, id)
}

func (s *Service) DisableTaxonomyTerm(ctx context.Context, id, version int64) (TaxonomyTerm, error) {
	current, err := s.GetTaxonomyTerm(ctx, id)
	if err != nil {
		return TaxonomyTerm{}, err
	}
	input := TaxonomyInput{SiteID: current.SiteID, Locale: current.Locale, Kind: current.Kind, Name: current.Name, Slug: current.Slug, ParentID: current.ParentID, Status: "disabled", Version: version}
	return s.UpdateTaxonomyTerm(ctx, id, input)
}

func syncContentTaxonomyTx(ctx context.Context, tx *sql.Tx, contentLocaleID, siteID int64, locale, category string, tags []string) error {
	if _, err := tx.ExecContext(ctx, `DELETE FROM content_taxonomy_terms WHERE content_locale_id = ?`, contentLocaleID); err != nil {
		return err
	}
	items := []struct{ kind, name string }{}
	if name := strings.TrimSpace(category); name != "" {
		items = append(items, struct{ kind, name string }{"category", name})
	}
	for _, tag := range tags {
		if name := strings.TrimSpace(tag); name != "" {
			items = append(items, struct{ kind, name string }{"tag", name})
		}
	}
	for position, item := range items {
		slug := generatedTaxonomySlug(siteID, locale, item.kind, item.name)
		now := nowUTC()
		if _, err := tx.ExecContext(ctx, `INSERT OR IGNORE INTO taxonomy_terms(site_id, locale, kind, name, slug, status, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', 1, ?, ?)`, siteID, locale, item.kind, item.name, slug, now, now); err != nil {
			return err
		}
		if _, err := tx.ExecContext(ctx, `INSERT OR IGNORE INTO content_taxonomy_terms(content_locale_id, term_id, position) SELECT ?, id, ? FROM taxonomy_terms WHERE site_id = ? AND locale = ? AND kind = ? AND name = ?`, contentLocaleID, position, siteID, locale, item.kind, item.name); err != nil {
			return err
		}
	}
	return nil
}

func propagateTaxonomyName(ctx context.Context, tx *sql.Tx, termID int64, kind, oldName, newName string) error {
	rows, err := tx.QueryContext(ctx, `SELECT cl.id, cl.tags_json FROM content_locales cl JOIN content_taxonomy_terms ct ON ct.content_locale_id = cl.id WHERE ct.term_id = ?`, termID)
	if err != nil {
		return err
	}
	type target struct {
		id   int64
		tags string
	}
	var targets []target
	for rows.Next() {
		var item target
		if err = rows.Scan(&item.id, &item.tags); err != nil {
			rows.Close()
			return err
		}
		targets = append(targets, item)
	}
	rows.Close()
	for _, item := range targets {
		if kind == "category" {
			if _, err = tx.ExecContext(ctx, `UPDATE content_locales SET category = ? WHERE id = ?`, newName, item.id); err != nil {
				return err
			}
			continue
		}
		var tags []string
		_ = json.Unmarshal([]byte(item.tags), &tags)
		for index := range tags {
			if strings.EqualFold(strings.TrimSpace(tags[index]), oldName) {
				tags[index] = newName
			}
		}
		encoded, _ := json.Marshal(tags)
		if _, err = tx.ExecContext(ctx, `UPDATE content_locales SET tags_json = ? WHERE id = ?`, string(encoded), item.id); err != nil {
			return err
		}
	}
	return nil
}

func normalizeTaxonomyInput(input *TaxonomyInput) {
	input.Locale = strings.TrimSpace(input.Locale)
	input.Kind = strings.ToLower(strings.TrimSpace(input.Kind))
	input.Name = strings.TrimSpace(input.Name)
	input.Slug = strings.ToLower(strings.Trim(strings.TrimSpace(input.Slug), "/"))
	input.Status = strings.ToLower(strings.TrimSpace(input.Status))
	if input.Status == "" {
		input.Status = "active"
	}
	if input.Slug == "" {
		input.Slug = generatedTaxonomySlug(input.SiteID, input.Locale, input.Kind, input.Name)
	}
}

func validateTaxonomyInput(input TaxonomyInput, updating bool) error {
	if input.SiteID < 1 || !localePattern.MatchString(input.Locale) || (input.Kind != "category" && input.Kind != "tag") {
		return invalid("站点、Locale 或类型无效")
	}
	if input.Name == "" || utf8.RuneCountInString(input.Name) > 100 || len(input.Slug) > 120 || !slugPattern.MatchString(input.Slug) {
		return invalid("名称或 Slug 格式无效")
	}
	if input.Status != "active" && input.Status != "disabled" {
		return invalid("栏目或标签状态无效")
	}
	if updating && input.Version < 1 {
		return invalid("栏目或标签版本无效")
	}
	return nil
}

func validateTaxonomyParent(ctx context.Context, tx *sql.Tx, id int64, input TaxonomyInput) error {
	if input.ParentID == nil {
		return nil
	}
	if input.Kind != "category" || *input.ParentID < 1 || *input.ParentID == id {
		return invalid("只有栏目可以选择有效的上级栏目")
	}
	var valid int
	if err := tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM taxonomy_terms WHERE id = ? AND site_id = ? AND locale = ? AND kind = 'category' AND status = 'active')`, *input.ParentID, input.SiteID, input.Locale).Scan(&valid); err != nil || valid != 1 {
		return invalid("上级栏目不存在或范围不一致")
	}
	if id > 0 {
		var createsCycle int
		if err := tx.QueryRowContext(ctx, `WITH RECURSIVE ancestors(id, parent_id) AS (
			SELECT id, parent_id FROM taxonomy_terms WHERE id = ?
			UNION
			SELECT t.id, t.parent_id FROM taxonomy_terms t JOIN ancestors a ON t.id = a.parent_id
		) SELECT EXISTS(SELECT 1 FROM ancestors WHERE id = ?)`, *input.ParentID, id).Scan(&createsCycle); err != nil {
			return err
		}
		if createsCycle == 1 {
			return invalid("上级栏目不能选择当前栏目的下级，避免形成循环")
		}
	}
	return nil
}

func generatedTaxonomySlug(siteID int64, locale, kind, name string) string {
	digest := sha256.Sum256([]byte(fmt.Sprintf("%d|%s|%s|%s", siteID, locale, kind, strings.ToLower(strings.TrimSpace(name)))))
	return kind + "-" + fmt.Sprintf("%x", digest[:8])
}
