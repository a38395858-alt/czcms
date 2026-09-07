package catalog

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/url"
	"regexp"
	"sort"
	"strings"
	"time"
	"unicode/utf8"

	"czcms/internal/contentsafety"
	"czcms/internal/filestore"
)

var (
	ErrNotFound = errors.New("记录不存在")
	ErrConflict = errors.New("记录已被其他用户修改，请刷新后重试")
	ErrInvalid  = errors.New("输入数据无效")

	codePattern                 = regexp.MustCompile(`^[a-z][a-z0-9-]{1,31}$`)
	localePattern               = regexp.MustCompile(`^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$`)
	marketCodePattern           = regexp.MustCompile(`^[A-Z][A-Z0-9-]{1,15}$`)
	domainPattern               = regexp.MustCompile(`^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$`)
	slugPattern                 = regexp.MustCompile(`^[a-z0-9](?:[a-z0-9-]{0,79}[a-z0-9])?(?:/[a-z0-9](?:[a-z0-9-]{0,79}[a-z0-9])?)*$`)
	taxonomySlugPattern         = regexp.MustCompile(`^[a-z0-9](?:[a-z0-9_-]{0,118}[a-z0-9])?(?:/[a-z0-9](?:[a-z0-9_-]{0,118}[a-z0-9])?)*$`)
	structuredDataScriptPattern = regexp.MustCompile(`(?is)^<script\b[^>]*\btype\s*=\s*["']application/ld\+json["'][^>]*>(.*?)</script>\s*$`)
)

type Service struct {
	db         *sql.DB
	sanitizer  *contentsafety.Sanitizer
	lookupHost func(context.Context, string) ([]string, error)
}

type validationError struct{ message string }

func (e validationError) Error() string { return e.message }
func (e validationError) Unwrap() error { return ErrInvalid }
func invalid(message string) error      { return validationError{message: message} }

func New(db *sql.DB, sanitizer *contentsafety.Sanitizer) *Service {
	return &Service{db: db, sanitizer: sanitizer, lookupHost: net.DefaultResolver.LookupHost}
}

type Site struct {
	ID                  int64  `json:"id"`
	Name                string `json:"name"`
	Code                string `json:"code"`
	PrimaryDomain       string `json:"primary_domain"`
	LocalPort           int    `json:"local_port"`
	MarketCode          string `json:"market_code"`
	Status              string `json:"status"`
	SEOTitle            string `json:"seo_title"`
	SEODescription      string `json:"seo_description"`
	FaviconMediaID      *int64 `json:"favicon_media_id,omitempty"`
	FaviconURL          string `json:"favicon_url,omitempty"`
	Version             int64  `json:"version"`
	LanguageCount       int64  `json:"language_count"`
	DomainCount         int64  `json:"domain_count"`
	ResolvedDomainCount int64  `json:"resolved_domain_count"`
	LocalPreviewPath    string `json:"local_preview_path"`
	CreatedAt           string `json:"created_at"`
	UpdatedAt           string `json:"updated_at"`
}

type SiteInput struct {
	Name                  string `json:"name"`
	Code                  string `json:"code"`
	PrimaryDomain         string `json:"primary_domain"`
	LocalPort             int    `json:"local_port"`
	MarketCode            string `json:"market_code"`
	Status                string `json:"status"`
	SEOTitle              string `json:"seo_title"`
	SEODescription        string `json:"seo_description"`
	FaviconMediaID        *int64 `json:"favicon_media_id"`
	DefaultLanguageCode   string `json:"default_language_code"`
	DefaultLocale         string `json:"default_locale"`
	DefaultThemePackageID int64  `json:"default_theme_package_id"`
	Version               int64  `json:"version"`
}

type SiteDomain struct {
	ID                int64    `json:"id"`
	SiteID            int64    `json:"site_id"`
	Hostname          string   `json:"hostname"`
	Kind              string   `json:"kind"`
	RedirectToPrimary bool     `json:"redirect_to_primary"`
	DNSStatus         string   `json:"dns_status"`
	ResolvedAddresses []string `json:"resolved_addresses"`
	LastCheckedAt     *string  `json:"last_checked_at,omitempty"`
	Version           int64    `json:"version"`
	CreatedAt         string   `json:"created_at"`
	UpdatedAt         string   `json:"updated_at"`
}

type SiteDomainInput struct {
	Hostname          string `json:"hostname"`
	Kind              string `json:"kind"`
	RedirectToPrimary bool   `json:"redirect_to_primary"`
	Version           int64  `json:"version"`
}

type Language struct {
	ID            int64  `json:"id"`
	Code          string `json:"code"`
	NameZH        string `json:"name_zh"`
	NativeName    string `json:"native_name"`
	DefaultLocale string `json:"default_locale"`
	Direction     string `json:"direction"`
	Enabled       bool   `json:"enabled"`
	Version       int64  `json:"version"`
	SiteCount     int64  `json:"site_count"`
	CreatedAt     string `json:"created_at"`
	UpdatedAt     string `json:"updated_at"`
}

type LanguageInput struct {
	Code          string `json:"code"`
	NameZH        string `json:"name_zh"`
	NativeName    string `json:"native_name"`
	DefaultLocale string `json:"default_locale"`
	Direction     string `json:"direction"`
	Enabled       bool   `json:"enabled"`
	SiteID        int64  `json:"site_id"`
	Version       int64  `json:"version"`
}

type SiteLanguage struct {
	SiteID         int64  `json:"site_id"`
	LanguageID     int64  `json:"language_id"`
	LanguageCode   string `json:"language_code"`
	LanguageName   string `json:"language_name"`
	NativeName     string `json:"native_name"`
	Locale         string `json:"locale"`
	Direction      string `json:"direction"`
	Enabled        bool   `json:"enabled"`
	ThemePackageID *int64 `json:"theme_package_id,omitempty"`
	Version        int64  `json:"version"`
	UpdatedAt      string `json:"updated_at"`
}

func (s *Service) ListSiteLanguages(ctx context.Context, userID, siteID int64) ([]SiteLanguage, error) {
	if siteID < 1 {
		return nil, invalid("站点 ID 无效")
	}
	rows, err := s.db.QueryContext(ctx, `
		SELECT sl.site_id, sl.language_id, l.code, l.name_zh, l.native_name, sl.locale, l.direction, sl.enabled,
		       sl.theme_package_id, sl.version, sl.updated_at
		FROM site_languages sl JOIN languages l ON l.id = sl.language_id
		WHERE sl.site_id = ? AND EXISTS(
			SELECT 1 FROM user_access_scopes uas WHERE uas.user_id = ? AND (uas.site_id = 0 OR uas.site_id = sl.site_id)
		) ORDER BY sl.enabled DESC, l.id`, siteID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]SiteLanguage, 0)
	for rows.Next() {
		var item SiteLanguage
		var enabled int
		var theme sql.NullInt64
		if err = rows.Scan(&item.SiteID, &item.LanguageID, &item.LanguageCode, &item.LanguageName, &item.NativeName, &item.Locale, &item.Direction, &enabled, &theme, &item.Version, &item.UpdatedAt); err != nil {
			return nil, err
		}
		item.Enabled = enabled == 1
		if theme.Valid {
			item.ThemePackageID = &theme.Int64
		}
		result = append(result, item)
	}
	return result, rows.Err()
}

// PublicSiteLanguages returns only enabled language bindings for a live site.
// It deliberately does not require an authenticated user because it is used by
// the server-rendered public storefront. The site status is checked by the
// caller and the query still refuses disabled bindings.
func (s *Service) PublicSiteLanguages(ctx context.Context, siteID int64) ([]SiteLanguage, error) {
	if siteID < 1 {
		return nil, invalid("站点 ID 无效")
	}
	rows, err := s.db.QueryContext(ctx, `
		SELECT sl.site_id, sl.language_id, l.code, l.name_zh, l.native_name, sl.locale, l.direction, sl.enabled,
		       sl.theme_package_id, sl.version, sl.updated_at
		FROM site_languages sl JOIN languages l ON l.id = sl.language_id
		WHERE sl.site_id = ? AND sl.enabled = 1 AND l.enabled = 1
		ORDER BY sl.language_id`, siteID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]SiteLanguage, 0)
	for rows.Next() {
		var item SiteLanguage
		var enabled int
		var theme sql.NullInt64
		if err = rows.Scan(&item.SiteID, &item.LanguageID, &item.LanguageCode, &item.LanguageName, &item.NativeName, &item.Locale, &item.Direction, &enabled, &theme, &item.Version, &item.UpdatedAt); err != nil {
			return nil, err
		}
		item.Enabled = enabled == 1
		if theme.Valid {
			item.ThemePackageID = &theme.Int64
		}
		result = append(result, item)
	}
	return result, rows.Err()
}

// PublicLanguageSite is one enabled language entry in the public site
// network. Separate sites may still have more than one language in future, so
// LanguageCount is included to decide whether a locale prefix is necessary.
type PublicLanguageSite struct {
	SiteID        int64
	SiteName      string
	SiteCode      string
	PrimaryDomain string
	LocalPort     int
	LanguageCount int64
	LanguageCode  string
	LanguageName  string
	NativeName    string
	Locale        string
	Direction     string
}

func (s *Service) PublicLanguageSites(ctx context.Context) ([]PublicLanguageSite, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT s.id, s.name, s.code, s.primary_domain, s.local_port,
		       (SELECT COUNT(*) FROM site_languages enabled_sl JOIN languages enabled_l ON enabled_l.id = enabled_sl.language_id
		        WHERE enabled_sl.site_id = s.id AND enabled_sl.enabled = 1 AND enabled_l.enabled = 1),
		       l.code, l.name_zh, l.native_name, sl.locale, l.direction
		FROM sites s JOIN site_languages sl ON sl.site_id = s.id JOIN languages l ON l.id = sl.language_id
		WHERE s.status <> 'disabled' AND sl.enabled = 1 AND l.enabled = 1
		ORDER BY s.local_port, sl.language_id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]PublicLanguageSite, 0)
	for rows.Next() {
		var item PublicLanguageSite
		if err = rows.Scan(&item.SiteID, &item.SiteName, &item.SiteCode, &item.PrimaryDomain, &item.LocalPort, &item.LanguageCount,
			&item.LanguageCode, &item.LanguageName, &item.NativeName, &item.Locale, &item.Direction); err != nil {
			return nil, err
		}
		result = append(result, item)
	}
	return result, rows.Err()
}

type SiteLanguageInput struct {
	Locale         string `json:"locale"`
	Enabled        bool   `json:"enabled"`
	ThemePackageID *int64 `json:"theme_package_id"`
	Version        int64  `json:"version"`
}

type SEOInput struct {
	H1                string          `json:"h1"`
	Title             string          `json:"title"`
	MetaDescription   string          `json:"meta_description"`
	PrimaryKeyword    string          `json:"primary_keyword"`
	SecondaryKeywords []string        `json:"secondary_keywords"`
	CanonicalURL      string          `json:"canonical_url"`
	RobotsIndex       bool            `json:"robots_index"`
	OGTitle           string          `json:"og_title"`
	OGDescription     string          `json:"og_description"`
	StructuredData    json.RawMessage `json:"structured_data"`
}

type CreateContentInput struct {
	ContentType     string    `json:"content_type"`
	SiteID          int64     `json:"site_id"`
	Locale          string    `json:"locale"`
	Status          string    `json:"status"`
	Title           string    `json:"title"`
	Slug            string    `json:"slug"`
	Category        string    `json:"category"`
	Tags            []string  `json:"tags"`
	TemplateKey     string    `json:"template_key"`
	ScheduledAt     string    `json:"scheduled_at"`
	CoverMediaID    *int64    `json:"cover_media_id"`
	GalleryMediaIDs []int64   `json:"gallery_media_ids"`
	Summary         string    `json:"summary"`
	BodyHTML        string    `json:"body_html"`
	AIState         string    `json:"ai_state"`
	SEO             *SEOInput `json:"seo,omitempty"`
	PageLayout      string    `json:"page_layout,omitempty"`
	IndexPolicy     string    `json:"index_policy,omitempty"`
	RevisionAction  string    `json:"-"`
}

type UpdateContentLocaleInput struct {
	ContentType     string    `json:"content_type"`
	Status          string    `json:"status"`
	Title           string    `json:"title"`
	Slug            string    `json:"slug"`
	Category        string    `json:"category"`
	Tags            []string  `json:"tags"`
	TemplateKey     string    `json:"template_key"`
	ScheduledAt     string    `json:"scheduled_at"`
	CoverMediaID    *int64    `json:"cover_media_id"`
	GalleryMediaIDs []int64   `json:"gallery_media_ids"`
	Summary         string    `json:"summary"`
	BodyHTML        string    `json:"body_html"`
	AIState         string    `json:"ai_state"`
	SEO             *SEOInput `json:"seo,omitempty"`
	PageLayout      string    `json:"page_layout,omitempty"`
	IndexPolicy     string    `json:"index_policy,omitempty"`
	Version         int64     `json:"version"`
	RevisionAction  string    `json:"-"`
}

type BulkContentTarget struct {
	ContentID int64  `json:"content_id"`
	SiteID    int64  `json:"site_id"`
	Locale    string `json:"locale"`
	Version   int64  `json:"version"`
}

type BulkContentUpdateInput struct {
	Targets  []BulkContentTarget `json:"targets"`
	Status   *string             `json:"status,omitempty"`
	Category *string             `json:"category,omitempty"`
}

type BulkContentUpdateResult struct {
	Updated int `json:"updated"`
}

// BulkContentDeleteTarget represents a whole content group. Deleting a group
// deliberately removes every site and locale version together.
type BulkContentDeleteTarget struct {
	ContentID int64 `json:"content_id"`
	Version   int64 `json:"version"`
}

type BulkContentDeleteInput struct {
	Targets []BulkContentDeleteTarget `json:"targets"`
}

type BulkContentDeleteResult struct {
	Deleted int `json:"deleted"`
}

type ContentLocale struct {
	ID                int64           `json:"id"`
	ContentID         int64           `json:"content_id"`
	ContentType       string          `json:"content_type"`
	SiteID            int64           `json:"site_id"`
	SiteName          string          `json:"site_name"`
	Locale            string          `json:"locale"`
	LanguageName      string          `json:"language_name"`
	Status            string          `json:"status"`
	Title             string          `json:"title"`
	Slug              string          `json:"slug"`
	Category          string          `json:"category"`
	Tags              []string        `json:"tags"`
	TemplateKey       string          `json:"template_key"`
	ScheduledAt       *string         `json:"scheduled_at,omitempty"`
	CoverMediaID      *int64          `json:"cover_media_id,omitempty"`
	CoverOriginalName string          `json:"cover_original_name,omitempty"`
	CoverWidth        int             `json:"cover_width,omitempty"`
	CoverHeight       int             `json:"cover_height,omitempty"`
	CoverURL          string          `json:"cover_url,omitempty"`
	Gallery           []GalleryMedia  `json:"gallery,omitempty"`
	GalleryMediaIDs   []int64         `json:"gallery_media_ids"`
	Summary           string          `json:"summary"`
	BodyHTML          string          `json:"body_html,omitempty"`
	H1                string          `json:"h1"`
	SEOTitle          string          `json:"seo_title"`
	MetaDescription   string          `json:"meta_description"`
	PrimaryKeyword    string          `json:"primary_keyword"`
	SecondaryKeywords []string        `json:"secondary_keywords"`
	CanonicalURL      string          `json:"canonical_url"`
	RobotsIndex       bool            `json:"robots_index"`
	OGTitle           string          `json:"og_title"`
	OGDescription     string          `json:"og_description"`
	StructuredData    json.RawMessage `json:"structured_data"`
	AIState           string          `json:"ai_state"`
	PageLayout        string          `json:"page_layout"`
	IndexPolicy       string          `json:"index_policy"`
	OwnerID           *int64          `json:"owner_id,omitempty"`
	OwnerName         string          `json:"owner_name"`
	Version           int64           `json:"version"`
	ContentVersion    int64           `json:"content_version"`
	PublishedAt       *string         `json:"published_at,omitempty"`
	CreatedAt         string          `json:"created_at"`
	UpdatedAt         string          `json:"updated_at"`
}

// GalleryMedia is the safe, read-only representation used by the product
// editor and public product detail pages. Original files are never exposed.
type GalleryMedia struct {
	ID           int64  `json:"id"`
	OriginalName string `json:"original_name"`
	Width        int    `json:"width"`
	Height       int    `json:"height"`
	AltText      string `json:"alt_text"`
	URL          string `json:"url"`
}

type ContentQuery struct {
	SiteID      int64
	Locale      string
	Status      string
	ContentType string
	Search      string
	Limit       int
	Offset      int
}

type ContentStatusCounts map[string]int64

type PublishedContentAlternate struct {
	SiteID        int64  `json:"site_id"`
	SiteName      string `json:"site_name"`
	SiteCode      string `json:"site_code"`
	PrimaryDomain string `json:"primary_domain"`
	LocalPort     int    `json:"local_port"`
	LanguageCount int64  `json:"language_count"`
	LanguageCode  string `json:"language_code"`
	LanguageName  string `json:"language_name"`
	NativeName    string `json:"native_name"`
	Locale        string `json:"locale"`
	Slug          string `json:"slug"`
}

type ContentRevision struct {
	ID          int64           `json:"id"`
	ContentID   int64           `json:"content_id"`
	LocaleID    *int64          `json:"content_locale_id,omitempty"`
	SiteID      int64           `json:"site_id"`
	Locale      string          `json:"locale"`
	Version     int64           `json:"version"`
	Snapshot    json.RawMessage `json:"snapshot"`
	Action      string          `json:"action"`
	ActorUserID *int64          `json:"actor_user_id,omitempty"`
	ActorName   string          `json:"actor_name"`
	CreatedAt   string          `json:"created_at"`
}

func (s *Service) ListSites(ctx context.Context, userID int64) ([]Site, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT s.id, s.name, s.code, s.primary_domain, s.local_port, s.market_code, s.status, s.seo_title, s.seo_description, s.favicon_media_id, COALESCE(fm.sha256, ''), s.version,
		       COUNT(CASE WHEN sl.enabled = 1 THEN 1 END),
		       (SELECT COUNT(*) FROM site_domains sd WHERE sd.site_id = s.id),
		       (SELECT COUNT(*) FROM site_domains sd WHERE sd.site_id = s.id AND sd.dns_status = 'resolved'),
		       s.created_at, s.updated_at
		FROM sites s LEFT JOIN site_languages sl ON sl.site_id = s.id LEFT JOIN media_files fm ON fm.id = s.favicon_media_id
		WHERE EXISTS(SELECT 1 FROM user_access_scopes uas WHERE uas.user_id = ? AND (uas.site_id = 0 OR uas.site_id = s.id))
		GROUP BY s.id ORDER BY s.id`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]Site, 0)
	for rows.Next() {
		var item Site
		var faviconSHA string
		if err = rows.Scan(&item.ID, &item.Name, &item.Code, &item.PrimaryDomain, &item.LocalPort, &item.MarketCode, &item.Status, &item.SEOTitle, &item.SEODescription, &item.FaviconMediaID, &faviconSHA, &item.Version, &item.LanguageCount, &item.DomainCount, &item.ResolvedDomainCount, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		item.FaviconURL = publicMediaURL(item.FaviconMediaID, faviconSHA)
		item.LocalPreviewPath = "/preview/" + url.PathEscape(item.Code)
		result = append(result, item)
	}
	return result, rows.Err()
}

func (s *Service) CreateSite(ctx context.Context, input SiteInput) (Site, error) {
	normalizeSiteInput(&input)
	if err := validateSiteInput(input, false); err != nil {
		return Site{}, err
	}
	now := nowUTC()
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return Site{}, err
	}
	defer tx.Rollback()
	if input.LocalPort == 0 {
		input.LocalPort, err = nextLocalPortTx(ctx, tx)
		if err != nil {
			return Site{}, err
		}
	}
	var defaultThemePackageID *int64
	if input.DefaultLanguageCode != "" {
		defaultThemePackageID, err = resolveCreateSiteThemeTx(ctx, tx, input.DefaultThemePackageID)
		if err != nil {
			return Site{}, err
		}
	}
	if err = validateSiteFaviconTx(ctx, tx, input.FaviconMediaID); err != nil {
		return Site{}, err
	}
	result, err := tx.ExecContext(ctx, `INSERT INTO sites(name, code, primary_domain, local_port, market_code, status, seo_title, seo_description, favicon_media_id, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`, input.Name, input.Code, input.PrimaryDomain, input.LocalPort, input.MarketCode, input.Status, input.SEOTitle, input.SEODescription, input.FaviconMediaID, now, now)
	if err != nil {
		return Site{}, classifyConstraint(err)
	}
	id, err := result.LastInsertId()
	if err != nil {
		return Site{}, err
	}
	if input.PrimaryDomain != "" {
		if _, err = tx.ExecContext(ctx, `INSERT INTO site_domains(site_id, hostname, kind, redirect_to_primary, dns_status, version, created_at, updated_at) VALUES (?, ?, 'primary', 0, 'pending', 1, ?, ?)`, id, input.PrimaryDomain, now, now); err != nil {
			return Site{}, classifyConstraint(err)
		}
	}
	if input.DefaultLanguageCode != "" {
		locale := input.DefaultLocale
		var languageID int64
		var defaultLocale string
		if err = tx.QueryRowContext(ctx, `SELECT id, default_locale FROM languages WHERE code = ?`, input.DefaultLanguageCode).Scan(&languageID, &defaultLocale); errors.Is(err, sql.ErrNoRows) {
			return Site{}, invalid("默认语言不存在")
		} else if err != nil {
			return Site{}, err
		}
		if locale == "" {
			locale = defaultLocale
		}
		if !localePattern.MatchString(locale) {
			return Site{}, invalid("默认 Locale 格式无效")
		}
		var themeValue any
		if defaultThemePackageID != nil {
			themeValue = *defaultThemePackageID
		}
		if _, err = tx.ExecContext(ctx, `INSERT INTO site_languages(site_id, language_id, locale, enabled, theme_package_id, version, created_at, updated_at)
			VALUES (?, ?, ?, 1, ?, 1, ?, ?)`, id, languageID, locale, themeValue, now, now); err != nil {
			return Site{}, classifyConstraint(err)
		}
	}
	if err = tx.Commit(); err != nil {
		return Site{}, err
	}
	return s.siteByID(ctx, id)
}

func (s *Service) UpdateSite(ctx context.Context, id int64, input SiteInput) (Site, error) {
	normalizeSiteInput(&input)
	if id < 1 || input.Version < 1 {
		return Site{}, invalid("站点 ID 或版本无效")
	}
	if err := validateSiteInput(input, true); err != nil {
		return Site{}, err
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return Site{}, err
	}
	defer tx.Rollback()
	var previousPrimary string
	var previousLocalPort int
	if err = tx.QueryRowContext(ctx, `SELECT primary_domain, local_port FROM sites WHERE id = ?`, id).Scan(&previousPrimary, &previousLocalPort); errors.Is(err, sql.ErrNoRows) {
		return Site{}, ErrNotFound
	} else if err != nil {
		return Site{}, err
	}
	if input.LocalPort == 0 {
		input.LocalPort = previousLocalPort
	}
	if err = validateSiteFaviconTx(ctx, tx, input.FaviconMediaID); err != nil {
		return Site{}, err
	}
	now := nowUTC()
	result, err := tx.ExecContext(ctx, `UPDATE sites SET name = ?, code = ?, primary_domain = ?, local_port = ?, market_code = ?, status = ?, seo_title = ?, seo_description = ?, favicon_media_id = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?`, input.Name, input.Code, input.PrimaryDomain, input.LocalPort, input.MarketCode, input.Status, input.SEOTitle, input.SEODescription, input.FaviconMediaID, now, id, input.Version)
	if err != nil {
		return Site{}, classifyConstraint(err)
	}
	if err = requireAffected(ctx, tx, result, "sites", id); err != nil {
		return Site{}, err
	}
	if previousPrimary != input.PrimaryDomain {
		if err = syncPrimaryDomainTx(ctx, tx, id, input.PrimaryDomain, now); err != nil {
			return Site{}, err
		}
	}
	if err = tx.Commit(); err != nil {
		return Site{}, err
	}
	return s.siteByID(ctx, id)
}

func (s *Service) DisableSite(ctx context.Context, id, version int64) (Site, error) {
	if id < 1 || version < 1 {
		return Site{}, invalid("站点 ID 或版本无效")
	}
	result, err := s.db.ExecContext(ctx, `UPDATE sites SET status = 'disabled', version = version + 1, updated_at = ? WHERE id = ? AND version = ?`, nowUTC(), id, version)
	if err != nil {
		return Site{}, err
	}
	if err = requireAffected(ctx, s.db, result, "sites", id); err != nil {
		return Site{}, err
	}
	return s.siteByID(ctx, id)
}

func (s *Service) siteByID(ctx context.Context, id int64) (Site, error) {
	var item Site
	var faviconSHA string
	err := s.db.QueryRowContext(ctx, `
		SELECT s.id, s.name, s.code, s.primary_domain, s.local_port, s.market_code, s.status, s.seo_title, s.seo_description, s.favicon_media_id, COALESCE(fm.sha256, ''), s.version,
		       COUNT(CASE WHEN sl.enabled = 1 THEN 1 END),
		       (SELECT COUNT(*) FROM site_domains sd WHERE sd.site_id = s.id),
		       (SELECT COUNT(*) FROM site_domains sd WHERE sd.site_id = s.id AND sd.dns_status = 'resolved'),
		       s.created_at, s.updated_at
		FROM sites s LEFT JOIN site_languages sl ON sl.site_id = s.id LEFT JOIN media_files fm ON fm.id = s.favicon_media_id WHERE s.id = ? GROUP BY s.id`, id).
		Scan(&item.ID, &item.Name, &item.Code, &item.PrimaryDomain, &item.LocalPort, &item.MarketCode, &item.Status, &item.SEOTitle, &item.SEODescription, &item.FaviconMediaID, &faviconSHA, &item.Version, &item.LanguageCount, &item.DomainCount, &item.ResolvedDomainCount, &item.CreatedAt, &item.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return Site{}, ErrNotFound
	}
	item.LocalPreviewPath = "/preview/" + url.PathEscape(item.Code)
	item.FaviconURL = publicMediaURL(item.FaviconMediaID, faviconSHA)
	return item, err
}

// SiteByID resolves a site for authenticated preview and operational flows.
// Public host routing continues to use SiteByHostname or SiteByCode.
func (s *Service) SiteByID(ctx context.Context, id int64) (Site, error) {
	if id < 1 {
		return Site{}, ErrNotFound
	}
	return s.siteByID(ctx, id)
}

func (s *Service) ListSiteDomains(ctx context.Context, userID, siteID int64) ([]SiteDomain, error) {
	if siteID < 1 {
		return nil, invalid("站点 ID 无效")
	}
	rows, err := s.db.QueryContext(ctx, `
		SELECT sd.id, sd.site_id, sd.hostname, sd.kind, sd.redirect_to_primary, sd.dns_status,
		       sd.resolved_addresses_json, sd.last_checked_at, sd.version, sd.created_at, sd.updated_at
		FROM site_domains sd
		WHERE sd.site_id = ? AND EXISTS(
			SELECT 1 FROM user_access_scopes uas WHERE uas.user_id = ? AND (uas.site_id = 0 OR uas.site_id = sd.site_id)
		) ORDER BY CASE sd.kind WHEN 'primary' THEN 0 ELSE 1 END, sd.id`, siteID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]SiteDomain, 0)
	for rows.Next() {
		item, scanErr := scanSiteDomain(rows)
		if scanErr != nil {
			return nil, scanErr
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *Service) CreateSiteDomain(ctx context.Context, siteID int64, input SiteDomainInput) (SiteDomain, error) {
	normalizeSiteDomainInput(&input)
	if siteID < 1 {
		return SiteDomain{}, invalid("站点 ID 无效")
	}
	if err := validateSiteDomainInput(input, false); err != nil {
		return SiteDomain{}, err
	}
	now := nowUTC()
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return SiteDomain{}, err
	}
	defer tx.Rollback()
	if input.Kind == "primary" {
		if err = demotePrimaryDomainTx(ctx, tx, siteID, now); err != nil {
			return SiteDomain{}, err
		}
	}
	result, err := tx.ExecContext(ctx, `INSERT INTO site_domains(site_id, hostname, kind, redirect_to_primary, dns_status, resolved_addresses_json, version, created_at, updated_at) VALUES (?, ?, ?, ?, 'pending', '[]', 1, ?, ?)`, siteID, input.Hostname, input.Kind, boolInt(input.RedirectToPrimary), now, now)
	if err != nil {
		return SiteDomain{}, classifyConstraint(err)
	}
	id, err := result.LastInsertId()
	if err != nil {
		return SiteDomain{}, err
	}
	if input.Kind == "primary" {
		if _, err = tx.ExecContext(ctx, `UPDATE sites SET primary_domain = ?, version = version + 1, updated_at = ? WHERE id = ?`, input.Hostname, now, siteID); err != nil {
			return SiteDomain{}, err
		}
	}
	if err = tx.Commit(); err != nil {
		return SiteDomain{}, err
	}
	return s.siteDomainByID(ctx, siteID, id)
}

func (s *Service) UpdateSiteDomain(ctx context.Context, siteID, domainID int64, input SiteDomainInput) (SiteDomain, error) {
	normalizeSiteDomainInput(&input)
	if siteID < 1 || domainID < 1 {
		return SiteDomain{}, invalid("站点或域名 ID 无效")
	}
	if err := validateSiteDomainInput(input, true); err != nil {
		return SiteDomain{}, err
	}
	now := nowUTC()
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return SiteDomain{}, err
	}
	defer tx.Rollback()
	if input.Kind == "primary" {
		if err = demotePrimaryDomainExceptTx(ctx, tx, siteID, domainID, now); err != nil {
			return SiteDomain{}, err
		}
	}
	result, err := tx.ExecContext(ctx, `UPDATE site_domains SET hostname = ?, kind = ?, redirect_to_primary = ?, dns_status = 'pending', resolved_addresses_json = '[]', last_checked_at = NULL, version = version + 1, updated_at = ? WHERE id = ? AND site_id = ? AND version = ?`, input.Hostname, input.Kind, boolInt(input.RedirectToPrimary), now, domainID, siteID, input.Version)
	if err != nil {
		return SiteDomain{}, classifyConstraint(err)
	}
	if err = requireDomainAffected(ctx, tx, result, siteID, domainID); err != nil {
		return SiteDomain{}, err
	}
	if input.Kind == "primary" {
		if _, err = tx.ExecContext(ctx, `UPDATE sites SET primary_domain = ?, version = version + 1, updated_at = ? WHERE id = ?`, input.Hostname, now, siteID); err != nil {
			return SiteDomain{}, err
		}
	} else {
		if _, err = tx.ExecContext(ctx, `UPDATE sites SET primary_domain = '', version = version + 1, updated_at = ? WHERE id = ? AND primary_domain NOT IN (SELECT hostname FROM site_domains WHERE site_id = ? AND kind = 'primary')`, now, siteID, siteID); err != nil {
			return SiteDomain{}, err
		}
	}
	if err = tx.Commit(); err != nil {
		return SiteDomain{}, err
	}
	return s.siteDomainByID(ctx, siteID, domainID)
}

func (s *Service) DeleteSiteDomain(ctx context.Context, siteID, domainID, version int64) error {
	if siteID < 1 || domainID < 1 || version < 1 {
		return invalid("站点、域名或版本无效")
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	var kind string
	if err = tx.QueryRowContext(ctx, `SELECT kind FROM site_domains WHERE id = ? AND site_id = ?`, domainID, siteID).Scan(&kind); errors.Is(err, sql.ErrNoRows) {
		return ErrNotFound
	} else if err != nil {
		return err
	}
	result, err := tx.ExecContext(ctx, `DELETE FROM site_domains WHERE id = ? AND site_id = ? AND version = ?`, domainID, siteID, version)
	if err != nil {
		return err
	}
	if err = requireDomainAffected(ctx, tx, result, siteID, domainID); err != nil {
		return err
	}
	if kind == "primary" {
		if _, err = tx.ExecContext(ctx, `UPDATE sites SET primary_domain = '', version = version + 1, updated_at = ? WHERE id = ?`, nowUTC(), siteID); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (s *Service) CheckSiteDomain(ctx context.Context, siteID, domainID int64) (SiteDomain, error) {
	item, err := s.siteDomainByID(ctx, siteID, domainID)
	if err != nil {
		return SiteDomain{}, err
	}
	lookupCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	addresses, lookupErr := s.lookupHost(lookupCtx, item.Hostname)
	addresses = normalizedAddresses(addresses)
	status := "resolved"
	if lookupErr != nil || len(addresses) == 0 {
		status = "failed"
		addresses = []string{}
	}
	encoded, _ := json.Marshal(addresses)
	now := nowUTC()
	_, err = s.db.ExecContext(ctx, `UPDATE site_domains SET dns_status = ?, resolved_addresses_json = ?, last_checked_at = ?, version = version + 1, updated_at = ? WHERE id = ? AND site_id = ?`, status, string(encoded), now, now, domainID, siteID)
	if err != nil {
		return SiteDomain{}, err
	}
	return s.siteDomainByID(ctx, siteID, domainID)
}

func (s *Service) SiteByCode(ctx context.Context, code string) (Site, error) {
	code = strings.ToLower(strings.TrimSpace(code))
	if !codePattern.MatchString(code) {
		return Site{}, ErrNotFound
	}
	var id int64
	if err := s.db.QueryRowContext(ctx, `SELECT id FROM sites WHERE code = ? AND status <> 'disabled'`, code).Scan(&id); errors.Is(err, sql.ErrNoRows) {
		return Site{}, ErrNotFound
	} else if err != nil {
		return Site{}, err
	}
	return s.siteByID(ctx, id)
}

func (s *Service) SiteByHostname(ctx context.Context, hostname string) (Site, *SiteDomain, error) {
	hostname = normalizeHostname(hostname)
	var siteID, domainID int64
	err := s.db.QueryRowContext(ctx, `SELECT sd.site_id, sd.id FROM site_domains sd JOIN sites s ON s.id = sd.site_id WHERE sd.hostname = ? AND s.status <> 'disabled'`, hostname).Scan(&siteID, &domainID)
	if errors.Is(err, sql.ErrNoRows) {
		return Site{}, nil, ErrNotFound
	}
	if err != nil {
		return Site{}, nil, err
	}
	site, err := s.siteByID(ctx, siteID)
	if err != nil {
		return Site{}, nil, err
	}
	domain, err := s.siteDomainByID(ctx, siteID, domainID)
	return site, &domain, err
}

type siteDomainScanner interface{ Scan(...any) error }

func scanSiteDomain(scanner siteDomainScanner) (SiteDomain, error) {
	var item SiteDomain
	var redirect int
	var encoded string
	var checked sql.NullString
	err := scanner.Scan(&item.ID, &item.SiteID, &item.Hostname, &item.Kind, &redirect, &item.DNSStatus, &encoded, &checked, &item.Version, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return SiteDomain{}, err
	}
	item.RedirectToPrimary = redirect == 1
	item.ResolvedAddresses = []string{}
	_ = json.Unmarshal([]byte(encoded), &item.ResolvedAddresses)
	if checked.Valid {
		item.LastCheckedAt = &checked.String
	}
	return item, nil
}

func (s *Service) siteDomainByID(ctx context.Context, siteID, domainID int64) (SiteDomain, error) {
	row := s.db.QueryRowContext(ctx, `SELECT id, site_id, hostname, kind, redirect_to_primary, dns_status, resolved_addresses_json, last_checked_at, version, created_at, updated_at FROM site_domains WHERE id = ? AND site_id = ?`, domainID, siteID)
	item, err := scanSiteDomain(row)
	if errors.Is(err, sql.ErrNoRows) {
		return SiteDomain{}, ErrNotFound
	}
	return item, err
}

func normalizeSiteDomainInput(input *SiteDomainInput) {
	input.Hostname = strings.TrimSuffix(strings.ToLower(strings.TrimSpace(input.Hostname)), ".")
	input.Kind = strings.ToLower(strings.TrimSpace(input.Kind))
	if input.Kind == "" {
		input.Kind = "alias"
	}
	if input.Kind == "primary" {
		input.RedirectToPrimary = false
	}
}

func normalizeHostname(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	if host, _, err := net.SplitHostPort(value); err == nil {
		value = host
	}
	return strings.TrimSuffix(value, ".")
}

func validateSiteDomainInput(input SiteDomainInput, update bool) error {
	if input.Hostname == "" || len(input.Hostname) > 253 || !domainPattern.MatchString(input.Hostname) || !strings.Contains(input.Hostname, ".") || net.ParseIP(input.Hostname) != nil || input.Hostname == "localhost" || strings.HasSuffix(input.Hostname, ".localhost") {
		return invalid("正式域名格式无效，请输入包含后缀的域名，不要包含协议、端口或路径")
	}
	if input.Kind != "primary" && input.Kind != "alias" {
		return invalid("域名类型只能是主域名或别名")
	}
	if update && input.Version < 1 {
		return invalid("域名版本无效")
	}
	return nil
}

func normalizedAddresses(values []string) []string {
	seen := make(map[string]bool)
	result := make([]string, 0, len(values))
	for _, value := range values {
		ip := net.ParseIP(strings.TrimSpace(value))
		if ip == nil || seen[ip.String()] {
			continue
		}
		seen[ip.String()] = true
		result = append(result, ip.String())
	}
	sort.Strings(result)
	return result
}

func syncPrimaryDomainTx(ctx context.Context, tx *sql.Tx, siteID int64, hostname, now string) error {
	if err := demotePrimaryDomainTx(ctx, tx, siteID, now); err != nil {
		return err
	}
	if hostname == "" {
		return nil
	}
	result, err := tx.ExecContext(ctx, `UPDATE site_domains SET kind = 'primary', redirect_to_primary = 0, version = version + 1, updated_at = ? WHERE site_id = ? AND hostname = ?`, now, siteID, hostname)
	if err != nil {
		return classifyConstraint(err)
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		_, err = tx.ExecContext(ctx, `INSERT INTO site_domains(site_id, hostname, kind, redirect_to_primary, dns_status, resolved_addresses_json, version, created_at, updated_at) VALUES (?, ?, 'primary', 0, 'pending', '[]', 1, ?, ?)`, siteID, hostname, now, now)
		return classifyConstraint(err)
	}
	return nil
}

func demotePrimaryDomainTx(ctx context.Context, tx *sql.Tx, siteID int64, now string) error {
	_, err := tx.ExecContext(ctx, `UPDATE site_domains SET kind = 'alias', redirect_to_primary = 1, version = version + 1, updated_at = ? WHERE site_id = ? AND kind = 'primary'`, now, siteID)
	return err
}

func demotePrimaryDomainExceptTx(ctx context.Context, tx *sql.Tx, siteID, domainID int64, now string) error {
	_, err := tx.ExecContext(ctx, `UPDATE site_domains SET kind = 'alias', redirect_to_primary = 1, version = version + 1, updated_at = ? WHERE site_id = ? AND kind = 'primary' AND id <> ?`, now, siteID, domainID)
	return err
}

func requireDomainAffected(ctx context.Context, tx *sql.Tx, result sql.Result, siteID, domainID int64) error {
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected > 0 {
		return nil
	}
	var exists int
	if err = tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM site_domains WHERE id = ? AND site_id = ?)`, domainID, siteID).Scan(&exists); err != nil {
		return err
	}
	if exists == 1 {
		return ErrConflict
	}
	return ErrNotFound
}

func (s *Service) ListLanguages(ctx context.Context, userID int64) ([]Language, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT l.id, l.code, l.name_zh, l.native_name, l.default_locale, l.direction, l.enabled, l.version,
		       COUNT(CASE WHEN sl.enabled = 1 THEN 1 END), l.created_at, l.updated_at
		FROM languages l LEFT JOIN site_languages sl ON sl.language_id = l.id
		WHERE EXISTS(
			SELECT 1 FROM user_access_scopes uas
			WHERE uas.user_id = ? AND (uas.locale = '*' OR uas.locale = l.default_locale OR uas.locale = l.code)
		)
		GROUP BY l.id ORDER BY l.enabled DESC, l.id`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]Language, 0)
	for rows.Next() {
		var item Language
		var enabled int
		if err = rows.Scan(&item.ID, &item.Code, &item.NameZH, &item.NativeName, &item.DefaultLocale, &item.Direction, &enabled, &item.Version, &item.SiteCount, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		item.Enabled = enabled == 1
		result = append(result, item)
	}
	return result, rows.Err()
}

func (s *Service) CreateLanguage(ctx context.Context, input LanguageInput) (Language, error) {
	normalizeLanguageInput(&input)
	if err := validateLanguageInput(input, false); err != nil {
		return Language{}, err
	}
	now := nowUTC()
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return Language{}, err
	}
	defer tx.Rollback()
	result, err := tx.ExecContext(ctx, `INSERT INTO languages(code, name_zh, native_name, default_locale, direction, enabled, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`, input.Code, input.NameZH, input.NativeName, input.DefaultLocale, input.Direction, boolInt(input.Enabled), now, now)
	if err != nil {
		return Language{}, classifyConstraint(err)
	}
	id, err := result.LastInsertId()
	if err != nil {
		return Language{}, err
	}
	if input.SiteID > 0 {
		var exists int
		if err = tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM sites WHERE id = ?)`, input.SiteID).Scan(&exists); err != nil || exists != 1 {
			return Language{}, invalid("绑定站点不存在")
		}
		if _, err = tx.ExecContext(ctx, `INSERT INTO site_languages(site_id, language_id, locale, enabled, theme_package_id, version, created_at, updated_at)
			VALUES (?, ?, ?, ?, (SELECT id FROM theme_packages WHERE render_key = 'global-route' AND status = 'validated' LIMIT 1), 1, ?, ?)`, input.SiteID, id, input.DefaultLocale, boolInt(input.Enabled), now, now); err != nil {
			return Language{}, classifyConstraint(err)
		}
	}
	if err = tx.Commit(); err != nil {
		return Language{}, err
	}
	return s.languageByID(ctx, id)
}

func (s *Service) UpdateLanguage(ctx context.Context, id int64, input LanguageInput) (Language, error) {
	normalizeLanguageInput(&input)
	if id < 1 || input.Version < 1 {
		return Language{}, invalid("语言 ID 或版本无效")
	}
	if err := validateLanguageInput(input, true); err != nil {
		return Language{}, err
	}
	result, err := s.db.ExecContext(ctx, `UPDATE languages SET code = ?, name_zh = ?, native_name = ?, default_locale = ?, direction = ?, enabled = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?`, input.Code, input.NameZH, input.NativeName, input.DefaultLocale, input.Direction, boolInt(input.Enabled), nowUTC(), id, input.Version)
	if err != nil {
		return Language{}, classifyConstraint(err)
	}
	if err = requireAffected(ctx, s.db, result, "languages", id); err != nil {
		return Language{}, err
	}
	return s.languageByID(ctx, id)
}

func (s *Service) DisableLanguage(ctx context.Context, id, version int64) (Language, error) {
	if id < 1 || version < 1 {
		return Language{}, invalid("语言 ID 或版本无效")
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return Language{}, err
	}
	defer tx.Rollback()
	result, err := tx.ExecContext(ctx, `UPDATE languages SET enabled = 0, version = version + 1, updated_at = ? WHERE id = ? AND version = ?`, nowUTC(), id, version)
	if err != nil {
		return Language{}, err
	}
	if err = requireAffected(ctx, tx, result, "languages", id); err != nil {
		return Language{}, err
	}
	if _, err = tx.ExecContext(ctx, `UPDATE site_languages SET enabled = 0, version = version + 1, updated_at = ? WHERE language_id = ?`, nowUTC(), id); err != nil {
		return Language{}, err
	}
	if err = tx.Commit(); err != nil {
		return Language{}, err
	}
	return s.languageByID(ctx, id)
}

func (s *Service) languageByID(ctx context.Context, id int64) (Language, error) {
	var item Language
	var enabled int
	err := s.db.QueryRowContext(ctx, `
		SELECT l.id, l.code, l.name_zh, l.native_name, l.default_locale, l.direction, l.enabled, l.version,
		       COUNT(CASE WHEN sl.enabled = 1 THEN 1 END), l.created_at, l.updated_at
		FROM languages l LEFT JOIN site_languages sl ON sl.language_id = l.id WHERE l.id = ? GROUP BY l.id`, id).
		Scan(&item.ID, &item.Code, &item.NameZH, &item.NativeName, &item.DefaultLocale, &item.Direction, &enabled, &item.Version, &item.SiteCount, &item.CreatedAt, &item.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return Language{}, ErrNotFound
	}
	item.Enabled = enabled == 1
	return item, err
}

func (s *Service) BindSiteLanguage(ctx context.Context, siteID, languageID int64, input SiteLanguageInput) (SiteLanguage, error) {
	input.Locale = strings.TrimSpace(input.Locale)
	if siteID < 1 || languageID < 1 || !localePattern.MatchString(input.Locale) {
		return SiteLanguage{}, invalid("站点、语言或 Locale 无效")
	}
	if input.ThemePackageID != nil && *input.ThemePackageID < 1 {
		return SiteLanguage{}, invalid("模板 ID 无效")
	}
	if input.ThemePackageID != nil {
		var valid int
		if err := s.db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM theme_packages
			WHERE id = ? AND status = 'validated' AND render_key IN ('global-route', 'atlas-commerce'))`, *input.ThemePackageID).Scan(&valid); err != nil {
			return SiteLanguage{}, err
		}
		if valid != 1 {
			return SiteLanguage{}, invalid("只能绑定已通过安全检查且已编译可渲染的模板")
		}
	}
	now := nowUTC()
	if input.Version == 0 {
		_, err := s.db.ExecContext(ctx, `INSERT INTO site_languages(site_id, language_id, locale, enabled, theme_package_id, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)`, siteID, languageID, input.Locale, boolInt(input.Enabled), input.ThemePackageID, now, now)
		if err != nil {
			return SiteLanguage{}, classifyConstraint(err)
		}
	} else {
		result, err := s.db.ExecContext(ctx, `UPDATE site_languages SET locale = ?, enabled = ?, theme_package_id = ?, version = version + 1, updated_at = ? WHERE site_id = ? AND language_id = ? AND version = ?`, input.Locale, boolInt(input.Enabled), input.ThemePackageID, now, siteID, languageID, input.Version)
		if err != nil {
			return SiteLanguage{}, classifyConstraint(err)
		}
		affected, _ := result.RowsAffected()
		if affected == 0 {
			var exists int
			_ = s.db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM site_languages WHERE site_id = ? AND language_id = ?)`, siteID, languageID).Scan(&exists)
			if exists == 1 {
				return SiteLanguage{}, ErrConflict
			}
			return SiteLanguage{}, ErrNotFound
		}
	}
	return s.siteLanguage(ctx, siteID, languageID)
}

func (s *Service) siteLanguage(ctx context.Context, siteID, languageID int64) (SiteLanguage, error) {
	var item SiteLanguage
	var enabled int
	var theme sql.NullInt64
	err := s.db.QueryRowContext(ctx, `
		SELECT sl.site_id, sl.language_id, l.code, l.name_zh, l.native_name, sl.locale, l.direction, sl.enabled, sl.theme_package_id, sl.version, sl.updated_at
		FROM site_languages sl JOIN languages l ON l.id = sl.language_id WHERE sl.site_id = ? AND sl.language_id = ?`, siteID, languageID).
		Scan(&item.SiteID, &item.LanguageID, &item.LanguageCode, &item.LanguageName, &item.NativeName, &item.Locale, &item.Direction, &enabled, &theme, &item.Version, &item.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return SiteLanguage{}, ErrNotFound
	}
	item.Enabled = enabled == 1
	if theme.Valid {
		item.ThemePackageID = &theme.Int64
	}
	return item, err
}

func (s *Service) ListContents(ctx context.Context, userID int64, query ContentQuery) ([]ContentLocale, int64, error) {
	if query.Limit < 1 || query.Limit > 200 {
		query.Limit = 50
	}
	if query.Offset < 0 || query.Offset > 1_000_000 {
		query.Offset = 0
	}
	query.Locale = strings.TrimSpace(query.Locale)
	query.Status = strings.TrimSpace(query.Status)
	query.ContentType = strings.ToLower(strings.TrimSpace(query.ContentType))
	query.Search = strings.TrimSpace(query.Search)
	where := []string{"c.deleted_at IS NULL", `EXISTS(SELECT 1 FROM user_access_scopes uas WHERE uas.user_id = ? AND (uas.site_id = 0 OR uas.site_id = cl.site_id) AND (uas.locale = '*' OR uas.locale = cl.locale))`}
	args := []any{userID}
	if query.SiteID > 0 {
		where = append(where, "cl.site_id = ?")
		args = append(args, query.SiteID)
	}
	if query.Locale != "" {
		where = append(where, "cl.locale = ?")
		args = append(args, query.Locale)
	}
	if query.Status != "" {
		if !validContentStatus(query.Status) {
			return nil, 0, invalid("内容状态无效")
		}
		where = append(where, "cl.status = ?")
		args = append(args, query.Status)
	}
	if query.ContentType != "" {
		if query.ContentType == "non_page" {
			where = append(where, "c.content_type <> 'page'")
		} else if query.ContentType != "article" && query.ContentType != "page" && query.ContentType != "landing" && query.ContentType != "category" && query.ContentType != "product" {
			return nil, 0, invalid("内容类型无效")
		} else {
			where = append(where, "c.content_type = ?")
			args = append(args, query.ContentType)
		}
	}
	if query.Search != "" {
		where = append(where, `(cl.title LIKE ? ESCAPE '\' OR cl.slug LIKE ? ESCAPE '\' OR cl.primary_keyword LIKE ? ESCAPE '\')`)
		term := "%" + escapeLike(query.Search) + "%"
		args = append(args, term, term, term)
	}
	clause := strings.Join(where, " AND ")
	var total int64
	if err := s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM contents c JOIN content_locales cl ON cl.content_id = c.id WHERE `+clause, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	listArgs := append(append([]any{}, args...), query.Limit, query.Offset)
	rows, err := s.db.QueryContext(ctx, `
		SELECT cl.id, c.id, c.content_type, cl.site_id, s.name, cl.locale,
		       COALESCE((SELECT name_zh FROM languages WHERE default_locale = cl.locale ORDER BY id LIMIT 1),
		                (SELECT name_zh FROM languages WHERE code = cl.locale LIMIT 1), cl.locale),
		       cl.status, cl.title, cl.slug, cl.category, cl.tags_json, cl.template_key, cl.page_layout, cl.index_policy, cl.scheduled_at, cl.cover_media_id, cl.gallery_media_ids_json,
		       COALESCE(m.original_name, ''), COALESCE(m.width, 0), COALESCE(m.height, 0), cl.summary, cl.h1, cl.seo_title, cl.meta_description,
		       cl.primary_keyword, cl.secondary_keywords_json, cl.canonical_url, cl.robots_index,
		       cl.og_title, cl.og_description, cl.structured_data_json, cl.ai_state, c.owner_id,
		       COALESCE(u.display_name, ''), cl.version, c.version, cl.published_at, cl.created_at, cl.updated_at
		FROM contents c JOIN content_locales cl ON cl.content_id = c.id
		JOIN sites s ON s.id = cl.site_id LEFT JOIN media_files m ON m.id = cl.cover_media_id
		LEFT JOIN users u ON u.id = c.owner_id
		WHERE `+clause+`
		ORDER BY cl.updated_at DESC, cl.id DESC LIMIT ? OFFSET ?`, listArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	items := make([]ContentLocale, 0)
	for rows.Next() {
		item, err := scanContentLocale(rows, false)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, item)
	}
	return items, total, rows.Err()
}

func (s *Service) ContentCounts(ctx context.Context, userID, siteID int64, locale string) (ContentStatusCounts, error) {
	return s.ContentCountsForType(ctx, userID, siteID, locale, "")
}

// ContentCountsForType returns workflow counters for one content type when it
// is supplied. Keeping the scope in the catalog layer ensures the list and its
// counters observe the same RBAC boundary.
func (s *Service) ContentCountsForType(ctx context.Context, userID, siteID int64, locale, contentType string) (ContentStatusCounts, error) {
	where := []string{`c.deleted_at IS NULL`, `EXISTS(
			SELECT 1 FROM user_access_scopes uas WHERE uas.user_id = ?
			AND (uas.site_id = 0 OR uas.site_id = cl.site_id) AND (uas.locale = '*' OR uas.locale = cl.locale)
		)`}
	args := []any{userID}
	if siteID > 0 {
		where = append(where, "cl.site_id = ?")
		args = append(args, siteID)
	}
	locale = strings.TrimSpace(locale)
	if locale != "" {
		if !localePattern.MatchString(locale) {
			return nil, invalid("Locale 格式无效")
		}
		where = append(where, "cl.locale = ?")
		args = append(args, locale)
	}
	contentType = strings.ToLower(strings.TrimSpace(contentType))
	if contentType != "" {
		if contentType == "non_page" {
			where = append(where, "c.content_type <> 'page'")
		} else if contentType != "article" && contentType != "page" && contentType != "landing" && contentType != "category" && contentType != "product" {
			return nil, invalid("内容类型无效")
		} else {
			where = append(where, "c.content_type = ?")
			args = append(args, contentType)
		}
	}
	countArgs := append([]any{nowUTC()}, args...)
	rows, err := s.db.QueryContext(ctx, `
		SELECT display_status, COUNT(*) FROM (
			SELECT CASE WHEN cl.status = 'published' AND cl.scheduled_at IS NOT NULL AND cl.scheduled_at <> '' AND datetime(cl.scheduled_at) > datetime(?) THEN 'scheduled' ELSE cl.status END AS display_status
			FROM contents c JOIN content_locales cl ON cl.content_id = c.id
			WHERE `+strings.Join(where, " AND ")+`
		) GROUP BY display_status`, countArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := ContentStatusCounts{"draft": 0, "review": 0, "published": 0, "scheduled": 0, "needs_update": 0, "archived": 0}
	for rows.Next() {
		var status string
		var count int64
		if err = rows.Scan(&status, &count); err != nil {
			return nil, err
		}
		result[status] = count
	}
	return result, rows.Err()
}

func (s *Service) GetContentLocale(ctx context.Context, contentID, siteID int64, locale string) (ContentLocale, error) {
	locale = strings.TrimSpace(locale)
	if contentID < 1 || siteID < 1 || !localePattern.MatchString(locale) {
		return ContentLocale{}, invalid("内容、站点或 Locale 无效")
	}
	row := s.db.QueryRowContext(ctx, `
		SELECT cl.id, c.id, c.content_type, cl.site_id, s.name, cl.locale,
		       COALESCE((SELECT name_zh FROM languages WHERE default_locale = cl.locale ORDER BY id LIMIT 1),
		                (SELECT name_zh FROM languages WHERE code = cl.locale LIMIT 1), cl.locale),
		       cl.status, cl.title, cl.slug, cl.category, cl.tags_json, cl.template_key, cl.page_layout, cl.index_policy, cl.scheduled_at, cl.cover_media_id, cl.gallery_media_ids_json,
		       COALESCE(m.original_name, ''), COALESCE(m.width, 0), COALESCE(m.height, 0), cl.summary, cl.body_html, cl.h1, cl.seo_title, cl.meta_description,
		       cl.primary_keyword, cl.secondary_keywords_json, cl.canonical_url, cl.robots_index,
		       cl.og_title, cl.og_description, cl.structured_data_json, cl.ai_state, c.owner_id,
		       COALESCE(u.display_name, ''), cl.version, c.version, cl.published_at, cl.created_at, cl.updated_at
		FROM contents c JOIN content_locales cl ON cl.content_id = c.id JOIN sites s ON s.id = cl.site_id LEFT JOIN media_files m ON m.id = cl.cover_media_id
		LEFT JOIN users u ON u.id = c.owner_id
		WHERE c.id = ? AND cl.site_id = ? AND cl.locale = ? AND c.deleted_at IS NULL
		`, contentID, siteID, locale)
	item, err := scanContentLocale(row, true)
	if errors.Is(err, sql.ErrNoRows) {
		return ContentLocale{}, ErrNotFound
	}
	if err != nil {
		return ContentLocale{}, err
	}
	return s.attachGalleryMedia(ctx, item)
}

func (s *Service) attachGalleryMedia(ctx context.Context, item ContentLocale) (ContentLocale, error) {
	if item.CoverMediaID != nil {
		var checksum string
		if err := s.db.QueryRowContext(ctx, `SELECT sha256 FROM media_files WHERE id = ?`, *item.CoverMediaID).Scan(&checksum); err == nil {
			item.CoverURL = filestore.PublicMediaURL(*item.CoverMediaID, checksum)
		} else if !errors.Is(err, sql.ErrNoRows) {
			return item, err
		}
	}
	item.Gallery = make([]GalleryMedia, 0, len(item.GalleryMediaIDs))
	for _, id := range item.GalleryMediaIDs {
		var media GalleryMedia
		var checksum string
		err := s.db.QueryRowContext(ctx, `SELECT id, original_name, width, height, alt_text, sha256 FROM media_files WHERE id = ?`, id).
			Scan(&media.ID, &media.OriginalName, &media.Width, &media.Height, &media.AltText, &checksum)
		if errors.Is(err, sql.ErrNoRows) {
			continue
		}
		if err != nil {
			return item, err
		}
		media.URL = filestore.PublicMediaURL(media.ID, checksum)
		item.Gallery = append(item.Gallery, media)
	}
	return item, nil
}

// GetPublishedContentByPath is the public read boundary. It is intentionally
// separate from GetContentLocale, which is an authenticated admin query, so a
// draft, review, archived or soft-deleted locale can never be rendered on the
// public site by accident.
func (s *Service) GetPublishedContentByPath(ctx context.Context, siteID int64, locale, slug string) (ContentLocale, error) {
	locale = strings.TrimSpace(locale)
	slug = strings.ToLower(strings.Trim(strings.TrimSpace(slug), "/"))
	if siteID < 1 || !localePattern.MatchString(locale) || slug == "" || !slugPattern.MatchString(slug) {
		return ContentLocale{}, ErrNotFound
	}
	row := s.db.QueryRowContext(ctx, `
		SELECT cl.id, c.id, c.content_type, cl.site_id, s.name, cl.locale,
		       COALESCE((SELECT name_zh FROM languages WHERE default_locale = cl.locale ORDER BY id LIMIT 1),
		                (SELECT name_zh FROM languages WHERE code = cl.locale LIMIT 1), cl.locale),
		       cl.status, cl.title, cl.slug, cl.category, cl.tags_json, cl.template_key, cl.page_layout, cl.index_policy, cl.scheduled_at, cl.cover_media_id, cl.gallery_media_ids_json,
		       COALESCE(m.original_name, ''), COALESCE(m.width, 0), COALESCE(m.height, 0), cl.summary, cl.body_html, cl.h1, cl.seo_title, cl.meta_description,
		       cl.primary_keyword, cl.secondary_keywords_json, cl.canonical_url, cl.robots_index,
		       cl.og_title, cl.og_description, cl.structured_data_json, cl.ai_state, c.owner_id,
		       COALESCE(u.display_name, ''), cl.version, c.version, cl.published_at, cl.created_at, cl.updated_at
		FROM contents c JOIN content_locales cl ON cl.content_id = c.id JOIN sites s ON s.id = cl.site_id
		LEFT JOIN media_files m ON m.id = cl.cover_media_id LEFT JOIN users u ON u.id = c.owner_id
		WHERE c.deleted_at IS NULL AND s.status <> 'disabled' AND cl.site_id = ? AND cl.locale = ?
		  AND cl.slug = ? AND cl.status = 'published'
		  AND (cl.scheduled_at IS NULL OR cl.scheduled_at = '' OR datetime(cl.scheduled_at) <= datetime(?)) AND EXISTS(
			SELECT 1 FROM site_languages sl JOIN languages l ON l.id = sl.language_id
			WHERE sl.site_id = cl.site_id AND sl.locale = cl.locale AND sl.enabled = 1 AND l.enabled = 1
		)`, siteID, locale, slug, nowUTC())
	item, err := scanContentLocale(row, true)
	if errors.Is(err, sql.ErrNoRows) {
		return ContentLocale{}, ErrNotFound
	}
	if err != nil {
		return ContentLocale{}, err
	}
	return s.attachGalleryMedia(ctx, item)
}

// ListPublishedContent returns a small, deterministic set for a site's home
// page. Body HTML is omitted for a fast index query; detail pages use the
// method above. Only published locales are visible.
func (s *Service) ListPublishedContent(ctx context.Context, siteID int64, locale string, limit int) ([]ContentLocale, error) {
	if siteID < 1 || !localePattern.MatchString(strings.TrimSpace(locale)) {
		return nil, ErrNotFound
	}
	if limit < 1 || limit > 24 {
		limit = 6
	}
	rows, err := s.db.QueryContext(ctx, `
		SELECT cl.id, c.id, c.content_type, cl.site_id, s.name, cl.locale,
		       COALESCE((SELECT name_zh FROM languages WHERE default_locale = cl.locale ORDER BY id LIMIT 1),
		                (SELECT name_zh FROM languages WHERE code = cl.locale LIMIT 1), cl.locale),
		       cl.status, cl.title, cl.slug, cl.category, cl.tags_json, cl.template_key, cl.page_layout, cl.index_policy, cl.scheduled_at, cl.cover_media_id, cl.gallery_media_ids_json,
		       COALESCE(m.original_name, ''), COALESCE(m.width, 0), COALESCE(m.height, 0), cl.summary, cl.h1, cl.seo_title, cl.meta_description,
		       cl.primary_keyword, cl.secondary_keywords_json, cl.canonical_url, cl.robots_index,
		       cl.og_title, cl.og_description, cl.structured_data_json, cl.ai_state, c.owner_id,
		       COALESCE(u.display_name, ''), cl.version, c.version, cl.published_at, cl.created_at, cl.updated_at
		FROM contents c JOIN content_locales cl ON cl.content_id = c.id JOIN sites s ON s.id = cl.site_id
		LEFT JOIN media_files m ON m.id = cl.cover_media_id LEFT JOIN users u ON u.id = c.owner_id
		WHERE c.deleted_at IS NULL AND s.status <> 'disabled' AND cl.site_id = ? AND cl.locale = ?
		  AND cl.status = 'published' AND (cl.scheduled_at IS NULL OR cl.scheduled_at = '' OR datetime(cl.scheduled_at) <= datetime(?)) AND EXISTS(
			SELECT 1 FROM site_languages sl JOIN languages l ON l.id = sl.language_id
			WHERE sl.site_id = cl.site_id AND sl.locale = cl.locale AND sl.enabled = 1 AND l.enabled = 1
		) ORDER BY COALESCE(cl.published_at, cl.updated_at) DESC, cl.id DESC LIMIT ?`, siteID, strings.TrimSpace(locale), nowUTC(), limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]ContentLocale, 0)
	for rows.Next() {
		item, scanErr := scanContentLocale(rows, false)
		if scanErr != nil {
			return nil, scanErr
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

// PublishedContentAlternates returns live siblings from the same content
// group across the complete site network. This allows independent domains (or
// local ports) to emit correct cross-domain hreflang links without exposing a
// draft or a disabled language.
func (s *Service) PublishedContentAlternates(ctx context.Context, contentID int64) ([]PublishedContentAlternate, error) {
	if contentID < 1 {
		return nil, ErrNotFound
	}
	rows, err := s.db.QueryContext(ctx, `
		SELECT cl.site_id, s.name, s.code, s.primary_domain, s.local_port,
		       (SELECT COUNT(*) FROM site_languages enabled_sl JOIN languages enabled_l ON enabled_l.id = enabled_sl.language_id
		        WHERE enabled_sl.site_id = s.id AND enabled_sl.enabled = 1 AND enabled_l.enabled = 1),
		       l.code, l.name_zh, l.native_name, cl.locale, cl.slug
		FROM content_locales cl JOIN contents c ON c.id = cl.content_id JOIN sites s ON s.id = cl.site_id
		JOIN site_languages sl ON sl.site_id = cl.site_id AND sl.locale = cl.locale
		JOIN languages l ON l.id = sl.language_id
		WHERE cl.content_id = ? AND cl.status = 'published' AND c.deleted_at IS NULL
		  AND (cl.scheduled_at IS NULL OR cl.scheduled_at = '' OR datetime(cl.scheduled_at) <= datetime(?))
		  AND s.status <> 'disabled' AND EXISTS(
			SELECT 1 FROM site_languages active_sl JOIN languages active_l ON active_l.id = active_sl.language_id
			WHERE active_sl.site_id = cl.site_id AND active_sl.locale = cl.locale AND active_sl.enabled = 1 AND active_l.enabled = 1
		  ) ORDER BY s.local_port, cl.locale`, contentID, nowUTC())
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]PublishedContentAlternate, 0)
	for rows.Next() {
		var item PublishedContentAlternate
		if err = rows.Scan(&item.SiteID, &item.SiteName, &item.SiteCode, &item.PrimaryDomain, &item.LocalPort, &item.LanguageCount,
			&item.LanguageCode, &item.LanguageName, &item.NativeName, &item.Locale, &item.Slug); err != nil {
			return nil, err
		}
		result = append(result, item)
	}
	return result, rows.Err()
}

func (s *Service) CreateContent(ctx context.Context, actorUserID int64, input CreateContentInput) (ContentLocale, error) {
	normalizeCreateContent(&input)
	applyPageDefaults(&input.ContentType, &input.PageLayout, &input.IndexPolicy, input.Slug, input.Title)
	if input.ContentType == "product" {
		input.CoverMediaID, input.GalleryMediaIDs = normalizeProductGallery(input.CoverMediaID, input.GalleryMediaIDs)
	}
	if err := validatePageOptions(input.ContentType, input.PageLayout, input.IndexPolicy); err != nil {
		return ContentLocale{}, err
	}
	if err := validateContentExtras(input.Category, input.Tags, input.TemplateKey, input.ScheduledAt, input.CoverMediaID, input.GalleryMediaIDs); err != nil {
		return ContentLocale{}, err
	}
	if err := validateContent(input.ContentType, input.SiteID, input.Locale, input.Status, input.Title, input.Slug, input.Summary, input.BodyHTML, input.AIState, input.SEO); err != nil {
		return ContentLocale{}, err
	}
	cleaned, err := s.sanitizer.Sanitize(input.BodyHTML)
	if err != nil {
		return ContentLocale{}, invalid(err.Error())
	}
	input.BodyHTML = cleaned
	seo, err := normalizeContentSEO(input.ContentType, input.SEO, input.Title)
	if err != nil {
		return ContentLocale{}, err
	}
	if input.ContentType == "page" {
		seo.RobotsIndex = input.IndexPolicy == "index"
	}
	secondary, _ := json.Marshal(seo.SecondaryKeywords)
	tags, _ := json.Marshal(input.Tags)
	structured := normalizedStructuredData(seo.StructuredData)
	now := nowUTC()
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return ContentLocale{}, err
	}
	defer tx.Rollback()
	if err = requireMediaFileTx(ctx, tx, input.CoverMediaID); err != nil {
		return ContentLocale{}, err
	}
	if err = requireGalleryMediaFilesTx(ctx, tx, input.GalleryMediaIDs); err != nil {
		return ContentLocale{}, err
	}
	if err = requireEnabledSiteLocale(ctx, tx, input.SiteID, input.Locale); err != nil {
		return ContentLocale{}, err
	}
	contentResult, err := tx.ExecContext(ctx, `INSERT INTO contents(content_type, status, owner_id, version, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?)`, input.ContentType, input.Status, actorUserID, now, now)
	if err != nil {
		return ContentLocale{}, err
	}
	contentID, _ := contentResult.LastInsertId()
	publishedAt := any(nil)
	if input.Status == "published" {
		publishedAt = scheduledPublishTime(input.ScheduledAt, now)
	}
	localeResult, err := tx.ExecContext(ctx, `
		INSERT INTO content_locales(content_id, site_id, locale, status, title, slug, category, tags_json, template_key, scheduled_at, cover_media_id, gallery_media_ids_json, summary, body_html, h1,
		seo_title, meta_description, primary_keyword, secondary_keywords_json, canonical_url, robots_index,
		og_title, og_description, structured_data_json, ai_state, published_at, page_layout, index_policy, version, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
		contentID, input.SiteID, input.Locale, input.Status, input.Title, input.Slug, input.Category, string(tags), input.TemplateKey, nullableText(input.ScheduledAt), input.CoverMediaID, galleryMediaJSON(input.GalleryMediaIDs), input.Summary, input.BodyHTML,
		seo.H1, seo.Title, seo.MetaDescription, seo.PrimaryKeyword, string(secondary), seo.CanonicalURL, boolInt(seo.RobotsIndex),
		seo.OGTitle, seo.OGDescription, string(structured), input.AIState, publishedAt, input.PageLayout, input.IndexPolicy, now, now)
	if err != nil {
		return ContentLocale{}, classifyConstraint(err)
	}
	localeID, _ := localeResult.LastInsertId()
	if err = syncContentTaxonomyTx(ctx, tx, localeID, input.SiteID, input.Locale, input.Category, input.Tags); err != nil {
		return ContentLocale{}, err
	}
	if input.ContentType == "page" && input.PageLayout == "contact" {
		if err = ensureDefaultContactFormTx(ctx, tx, localeID, input.SiteID, input.Locale, input.Title, input.Slug, actorUserID, now); err != nil {
			return ContentLocale{}, err
		}
	}
	if err = insertRevision(ctx, tx, localeID, contentID, input.SiteID, input.Locale, 1, "created", actorUserID); err != nil {
		return ContentLocale{}, err
	}
	if err = tx.Commit(); err != nil {
		return ContentLocale{}, err
	}
	return s.GetContentLocale(ctx, contentID, input.SiteID, input.Locale)
}

func (s *Service) CreateContentLocale(ctx context.Context, actorUserID, contentID int64, input CreateContentInput) (ContentLocale, error) {
	normalizeCreateContent(&input)
	applyPageDefaults(&input.ContentType, &input.PageLayout, &input.IndexPolicy, input.Slug, input.Title)
	if input.ContentType == "product" {
		input.CoverMediaID, input.GalleryMediaIDs = normalizeProductGallery(input.CoverMediaID, input.GalleryMediaIDs)
	}
	if err := validatePageOptions(input.ContentType, input.PageLayout, input.IndexPolicy); err != nil {
		return ContentLocale{}, err
	}
	if err := validateContentExtras(input.Category, input.Tags, input.TemplateKey, input.ScheduledAt, input.CoverMediaID, input.GalleryMediaIDs); err != nil {
		return ContentLocale{}, err
	}
	if contentID < 1 {
		return ContentLocale{}, invalid("内容 ID 无效")
	}
	if err := validateContent(input.ContentType, input.SiteID, input.Locale, input.Status, input.Title, input.Slug, input.Summary, input.BodyHTML, input.AIState, input.SEO); err != nil {
		return ContentLocale{}, err
	}
	cleaned, err := s.sanitizer.Sanitize(input.BodyHTML)
	if err != nil {
		return ContentLocale{}, invalid(err.Error())
	}
	input.BodyHTML = cleaned
	seo, err := normalizeContentSEO(input.ContentType, input.SEO, input.Title)
	if err != nil {
		return ContentLocale{}, err
	}
	if input.ContentType == "page" {
		seo.RobotsIndex = input.IndexPolicy == "index"
	}
	secondary, _ := json.Marshal(seo.SecondaryKeywords)
	tags, _ := json.Marshal(input.Tags)
	structured := normalizedStructuredData(seo.StructuredData)
	now := nowUTC()
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return ContentLocale{}, err
	}
	defer tx.Rollback()
	if err = requireMediaFileTx(ctx, tx, input.CoverMediaID); err != nil {
		return ContentLocale{}, err
	}
	if err = requireGalleryMediaFilesTx(ctx, tx, input.GalleryMediaIDs); err != nil {
		return ContentLocale{}, err
	}
	var currentType string
	if err = tx.QueryRowContext(ctx, `SELECT content_type FROM contents WHERE id = ? AND deleted_at IS NULL`, contentID).Scan(&currentType); errors.Is(err, sql.ErrNoRows) {
		return ContentLocale{}, ErrNotFound
	} else if err != nil {
		return ContentLocale{}, err
	}
	if input.ContentType != currentType {
		return ContentLocale{}, invalid("同一内容组的内容类型必须一致")
	}
	if err = requireEnabledSiteLocale(ctx, tx, input.SiteID, input.Locale); err != nil {
		return ContentLocale{}, err
	}
	publishedAt := any(nil)
	if input.Status == "published" {
		publishedAt = scheduledPublishTime(input.ScheduledAt, now)
	}
	localeResult, err := tx.ExecContext(ctx, `
		INSERT INTO content_locales(content_id, site_id, locale, status, title, slug, category, tags_json, template_key, scheduled_at, cover_media_id, gallery_media_ids_json, summary, body_html, h1,
		seo_title, meta_description, primary_keyword, secondary_keywords_json, canonical_url, robots_index,
		og_title, og_description, structured_data_json, ai_state, published_at, page_layout, index_policy, version, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
		contentID, input.SiteID, input.Locale, input.Status, input.Title, input.Slug, input.Category, string(tags), input.TemplateKey, nullableText(input.ScheduledAt), input.CoverMediaID, galleryMediaJSON(input.GalleryMediaIDs), input.Summary, input.BodyHTML,
		seo.H1, seo.Title, seo.MetaDescription, seo.PrimaryKeyword, string(secondary), seo.CanonicalURL, boolInt(seo.RobotsIndex),
		seo.OGTitle, seo.OGDescription, string(structured), input.AIState, publishedAt, input.PageLayout, input.IndexPolicy, now, now)
	if err != nil {
		return ContentLocale{}, classifyConstraint(err)
	}
	localeID, _ := localeResult.LastInsertId()
	if err = syncContentTaxonomyTx(ctx, tx, localeID, input.SiteID, input.Locale, input.Category, input.Tags); err != nil {
		return ContentLocale{}, err
	}
	if input.ContentType == "page" && input.PageLayout == "contact" {
		if err = ensureDefaultContactFormTx(ctx, tx, localeID, input.SiteID, input.Locale, input.Title, input.Slug, actorUserID, now); err != nil {
			return ContentLocale{}, err
		}
	}
	if _, err = tx.ExecContext(ctx, `UPDATE contents SET version = version + 1, updated_at = ? WHERE id = ?`, now, contentID); err != nil {
		return ContentLocale{}, err
	}
	action := strings.TrimSpace(input.RevisionAction)
	if action == "" {
		action = "locale_created"
	}
	if err = insertRevision(ctx, tx, localeID, contentID, input.SiteID, input.Locale, 1, action, actorUserID); err != nil {
		return ContentLocale{}, err
	}
	if err = tx.Commit(); err != nil {
		return ContentLocale{}, err
	}
	return s.GetContentLocale(ctx, contentID, input.SiteID, input.Locale)
}

func (s *Service) UpdateContentLocale(ctx context.Context, actorUserID, contentID, siteID int64, locale string, input UpdateContentLocaleInput) (ContentLocale, error) {
	locale = strings.TrimSpace(locale)
	normalizeUpdateContent(&input)
	if input.ContentType == "product" {
		input.CoverMediaID, input.GalleryMediaIDs = normalizeProductGallery(input.CoverMediaID, input.GalleryMediaIDs)
	}
	if err := validateContentExtras(input.Category, input.Tags, input.TemplateKey, input.ScheduledAt, input.CoverMediaID, input.GalleryMediaIDs); err != nil {
		return ContentLocale{}, err
	}
	if input.Version < 1 {
		return ContentLocale{}, invalid("内容版本无效")
	}
	if err := validateContent(input.ContentType, siteID, locale, input.Status, input.Title, input.Slug, input.Summary, input.BodyHTML, input.AIState, input.SEO); err != nil {
		return ContentLocale{}, err
	}
	cleaned, err := s.sanitizer.Sanitize(input.BodyHTML)
	if err != nil {
		return ContentLocale{}, invalid(err.Error())
	}
	input.BodyHTML = cleaned
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return ContentLocale{}, err
	}
	defer tx.Rollback()
	if err = requireMediaFileTx(ctx, tx, input.CoverMediaID); err != nil {
		return ContentLocale{}, err
	}
	if err = requireGalleryMediaFilesTx(ctx, tx, input.GalleryMediaIDs); err != nil {
		return ContentLocale{}, err
	}
	var current ContentLocale
	current, err = getContentLocaleTx(ctx, tx, contentID, siteID, locale)
	if err != nil {
		return ContentLocale{}, err
	}
	seo := SEOInput{
		H1: current.H1, Title: current.SEOTitle, MetaDescription: current.MetaDescription, PrimaryKeyword: current.PrimaryKeyword,
		SecondaryKeywords: current.SecondaryKeywords, CanonicalURL: current.CanonicalURL, RobotsIndex: current.RobotsIndex,
		OGTitle: current.OGTitle, OGDescription: current.OGDescription, StructuredData: current.StructuredData,
	}
	if input.SEO != nil {
		seo, err = normalizeContentSEO(input.ContentType, input.SEO, input.Title)
		if err != nil {
			return ContentLocale{}, err
		}
	}
	if input.ContentType == "page" {
		// A partial API update should retain the existing page configuration.
		// The browser sends these values explicitly; this mainly protects other
		// authenticated clients from silently turning a contact page into a
		// standard page.
		if input.PageLayout == "" {
			input.PageLayout = current.PageLayout
		}
		if input.IndexPolicy == "" {
			input.IndexPolicy = current.IndexPolicy
		}
	}
	applyPageDefaults(&input.ContentType, &input.PageLayout, &input.IndexPolicy, input.Slug, input.Title)
	if input.ContentType != "page" {
		input.PageLayout = "standard"
		input.IndexPolicy = "index"
	}
	if input.ContentType == "page" {
		seo.RobotsIndex = input.IndexPolicy == "index"
	}
	if err := validatePageOptions(input.ContentType, input.PageLayout, input.IndexPolicy); err != nil {
		return ContentLocale{}, err
	}
	secondary, _ := json.Marshal(seo.SecondaryKeywords)
	tags, _ := json.Marshal(input.Tags)
	structured := normalizedStructuredData(seo.StructuredData)
	publishedAt := current.PublishedAt
	if input.Status == "published" && current.PublishedAt == nil {
		value := scheduledPublishTime(input.ScheduledAt, nowUTC())
		publishedAt = &value
	}
	if input.Status != "published" {
		publishedAt = nil
	}
	result, err := tx.ExecContext(ctx, `
		UPDATE content_locales SET status = ?, title = ?, slug = ?, category = ?, tags_json = ?, template_key = ?, scheduled_at = ?, cover_media_id = ?, gallery_media_ids_json = ?, summary = ?, body_html = ?, h1 = ?, seo_title = ?,
		meta_description = ?, primary_keyword = ?, secondary_keywords_json = ?, canonical_url = ?, robots_index = ?,
		og_title = ?, og_description = ?, structured_data_json = ?, ai_state = ?, published_at = ?, page_layout = ?, index_policy = ?,
		version = version + 1, updated_at = ?
		WHERE content_id = ? AND site_id = ? AND locale = ? AND version = ?`,
		input.Status, input.Title, input.Slug, input.Category, string(tags), input.TemplateKey, nullableText(input.ScheduledAt), input.CoverMediaID, galleryMediaJSON(input.GalleryMediaIDs), input.Summary, input.BodyHTML, seo.H1, seo.Title, seo.MetaDescription,
		seo.PrimaryKeyword, string(secondary), seo.CanonicalURL, boolInt(seo.RobotsIndex), seo.OGTitle, seo.OGDescription,
		string(structured), input.AIState, publishedAt, input.PageLayout, input.IndexPolicy, nowUTC(), contentID, siteID, locale, input.Version)
	if err != nil {
		return ContentLocale{}, classifyConstraint(err)
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		return ContentLocale{}, ErrConflict
	}
	if _, err = tx.ExecContext(ctx, `UPDATE contents SET content_type = ?, status = ?, version = version + 1, updated_at = ? WHERE id = ? AND deleted_at IS NULL`, input.ContentType, input.Status, nowUTC(), contentID); err != nil {
		return ContentLocale{}, err
	}
	if err = syncContentTaxonomyTx(ctx, tx, current.ID, siteID, locale, input.Category, input.Tags); err != nil {
		return ContentLocale{}, err
	}
	if input.ContentType == "page" && input.PageLayout == "contact" {
		if err = ensureDefaultContactFormTx(ctx, tx, current.ID, siteID, locale, input.Title, input.Slug, actorUserID, nowUTC()); err != nil {
			return ContentLocale{}, err
		}
	}
	action := strings.TrimSpace(input.RevisionAction)
	if action == "" {
		action = "updated"
	}
	if input.Status == "published" && current.Status != "published" && input.RevisionAction == "" {
		action = "published"
	}
	if err = insertRevision(ctx, tx, current.ID, contentID, siteID, locale, input.Version+1, action, actorUserID); err != nil {
		return ContentLocale{}, err
	}
	if err = tx.Commit(); err != nil {
		return ContentLocale{}, err
	}
	return s.GetContentLocale(ctx, contentID, siteID, locale)
}

func (s *Service) BulkUpdateContentLocales(ctx context.Context, actorUserID int64, input BulkContentUpdateInput) (BulkContentUpdateResult, error) {
	if len(input.Targets) < 1 || len(input.Targets) > 100 {
		return BulkContentUpdateResult{}, invalid("批量操作必须选择 1 到 100 个内容版本")
	}
	if input.Status == nil && input.Category == nil {
		return BulkContentUpdateResult{}, invalid("批量操作未指定要修改的字段")
	}
	if input.Status != nil {
		status := strings.ToLower(strings.TrimSpace(*input.Status))
		if !validContentStatus(status) {
			return BulkContentUpdateResult{}, invalid("内容状态无效")
		}
		input.Status = &status
	}
	if input.Category != nil {
		category := strings.TrimSpace(*input.Category)
		if utf8.RuneCountInString(category) > 100 {
			return BulkContentUpdateResult{}, invalid("栏目名称不能超过 100 个字符")
		}
		input.Category = &category
	}
	now := nowUTC()
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return BulkContentUpdateResult{}, err
	}
	defer tx.Rollback()
	seen := make(map[string]struct{}, len(input.Targets))
	for _, target := range input.Targets {
		target.Locale = strings.TrimSpace(target.Locale)
		if target.ContentID < 1 || target.SiteID < 1 || target.Version < 1 || !localePattern.MatchString(target.Locale) {
			return BulkContentUpdateResult{}, invalid("批量操作包含无效的内容、站点、Locale 或版本")
		}
		key := fmt.Sprintf("%d:%d:%s", target.ContentID, target.SiteID, target.Locale)
		if _, duplicate := seen[key]; duplicate {
			return BulkContentUpdateResult{}, invalid("批量操作包含重复的内容版本")
		}
		seen[key] = struct{}{}
		current, getErr := getContentLocaleTx(ctx, tx, target.ContentID, target.SiteID, target.Locale)
		if getErr != nil {
			return BulkContentUpdateResult{}, getErr
		}
		if current.Version != target.Version {
			return BulkContentUpdateResult{}, ErrConflict
		}
		status := current.Status
		if input.Status != nil {
			status = *input.Status
		}
		category := current.Category
		if input.Category != nil {
			category = *input.Category
		}
		if status == "published" && strings.TrimSpace(current.BodyHTML) == "" {
			return BulkContentUpdateResult{}, invalid("批量发布包含未填写正文的内容，请先完善后再发布")
		}
		publishedAt := current.PublishedAt
		if status == "published" && current.PublishedAt == nil {
			publishedAt = &now
		} else if status != "published" {
			publishedAt = nil
		}
		result, updateErr := tx.ExecContext(ctx, `UPDATE content_locales
			SET status = ?, category = ?, published_at = ?, version = version + 1, updated_at = ?
			WHERE content_id = ? AND site_id = ? AND locale = ? AND version = ?`,
			status, category, publishedAt, now, target.ContentID, target.SiteID, target.Locale, target.Version)
		if updateErr != nil {
			return BulkContentUpdateResult{}, classifyConstraint(updateErr)
		}
		affected, _ := result.RowsAffected()
		if affected != 1 {
			return BulkContentUpdateResult{}, ErrConflict
		}
		if _, updateErr = tx.ExecContext(ctx, `UPDATE contents SET status = ?, version = version + 1, updated_at = ? WHERE id = ? AND deleted_at IS NULL`, status, now, target.ContentID); updateErr != nil {
			return BulkContentUpdateResult{}, updateErr
		}
		if input.Category != nil {
			if updateErr = syncContentTaxonomyTx(ctx, tx, current.ID, target.SiteID, target.Locale, category, current.Tags); updateErr != nil {
				return BulkContentUpdateResult{}, updateErr
			}
		}
		action := "bulk_updated"
		if input.Status != nil && input.Category == nil {
			action = "bulk_status_updated"
		} else if input.Category != nil && input.Status == nil {
			action = "bulk_category_updated"
		}
		if updateErr = insertRevision(ctx, tx, current.ID, target.ContentID, target.SiteID, target.Locale, target.Version+1, action, actorUserID); updateErr != nil {
			return BulkContentUpdateResult{}, updateErr
		}
	}
	if err = tx.Commit(); err != nil {
		return BulkContentUpdateResult{}, err
	}
	return BulkContentUpdateResult{Updated: len(input.Targets)}, nil
}

func (s *Service) SoftDeleteContent(ctx context.Context, contentID, version, actorUserID int64) error {
	if contentID < 1 || version < 1 {
		return invalid("内容 ID 或版本无效")
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	rows, err := tx.QueryContext(ctx, `SELECT id, site_id, locale, version FROM content_locales WHERE content_id = ?`, contentID)
	if err != nil {
		return err
	}
	type revisionTarget struct {
		id, siteID, version int64
		locale              string
	}
	var targets []revisionTarget
	for rows.Next() {
		var target revisionTarget
		if err = rows.Scan(&target.id, &target.siteID, &target.locale, &target.version); err != nil {
			rows.Close()
			return err
		}
		targets = append(targets, target)
	}
	if err = rows.Close(); err != nil {
		return err
	}
	for _, target := range targets {
		if err = insertRevision(ctx, tx, target.id, contentID, target.siteID, target.locale, target.version, "deleted", actorUserID); err != nil {
			return err
		}
	}
	result, err := tx.ExecContext(ctx, `UPDATE contents SET deleted_at = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ? AND deleted_at IS NULL`, nowUTC(), nowUTC(), contentID, version)
	if err != nil {
		return err
	}
	if err = requireAffected(ctx, tx, result, "contents", contentID); err != nil {
		return err
	}
	return tx.Commit()
}

// BulkSoftDeleteContents provides an all-or-nothing recycle-bin action for
// content management. The caller must authorize every locale in each group
// before invoking this method; optimistic versions prevent stale lists from
// deleting content that has changed in the meantime.
func (s *Service) BulkSoftDeleteContents(ctx context.Context, actorUserID int64, input BulkContentDeleteInput) (BulkContentDeleteResult, error) {
	if len(input.Targets) < 1 || len(input.Targets) > 100 {
		return BulkContentDeleteResult{}, invalid("批量删除必须选择 1 到 100 个内容组")
	}
	targets := make([]BulkContentDeleteTarget, 0, len(input.Targets))
	seen := make(map[int64]int64, len(input.Targets))
	for _, target := range input.Targets {
		if target.ContentID < 1 || target.Version < 1 {
			return BulkContentDeleteResult{}, invalid("内容 ID 或版本无效")
		}
		if existing, ok := seen[target.ContentID]; ok {
			if existing != target.Version {
				return BulkContentDeleteResult{}, invalid("同一内容组不能使用不同版本重复删除")
			}
			continue
		}
		seen[target.ContentID] = target.Version
		targets = append(targets, target)
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return BulkContentDeleteResult{}, err
	}
	defer tx.Rollback()
	for _, target := range targets {
		rows, queryErr := tx.QueryContext(ctx, `SELECT id, site_id, locale, version FROM content_locales WHERE content_id = ?`, target.ContentID)
		if queryErr != nil {
			return BulkContentDeleteResult{}, queryErr
		}
		type revisionTarget struct {
			id, siteID, version int64
			locale              string
		}
		locales := make([]revisionTarget, 0)
		for rows.Next() {
			var locale revisionTarget
			if queryErr = rows.Scan(&locale.id, &locale.siteID, &locale.locale, &locale.version); queryErr != nil {
				rows.Close()
				return BulkContentDeleteResult{}, queryErr
			}
			locales = append(locales, locale)
		}
		if queryErr = rows.Close(); queryErr != nil {
			return BulkContentDeleteResult{}, queryErr
		}
		for _, locale := range locales {
			if queryErr = insertRevision(ctx, tx, locale.id, target.ContentID, locale.siteID, locale.locale, locale.version, "deleted", actorUserID); queryErr != nil {
				return BulkContentDeleteResult{}, queryErr
			}
		}
		now := nowUTC()
		result, execErr := tx.ExecContext(ctx, `UPDATE contents SET deleted_at = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ? AND deleted_at IS NULL`, now, now, target.ContentID, target.Version)
		if execErr != nil {
			return BulkContentDeleteResult{}, execErr
		}
		if execErr = requireAffected(ctx, tx, result, "contents", target.ContentID); execErr != nil {
			return BulkContentDeleteResult{}, execErr
		}
	}
	if err = tx.Commit(); err != nil {
		return BulkContentDeleteResult{}, err
	}
	return BulkContentDeleteResult{Deleted: len(targets)}, nil
}

func (s *Service) ContentVersion(ctx context.Context, contentID int64) (int64, error) {
	var version int64
	err := s.db.QueryRowContext(ctx, `SELECT version FROM contents WHERE id = ? AND deleted_at IS NULL`, contentID).Scan(&version)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, ErrNotFound
	}
	return version, err
}

func (s *Service) ContentScopes(ctx context.Context, contentID int64) ([]struct {
	SiteID int64
	Locale string
}, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT site_id, locale FROM content_locales WHERE content_id = ?`, contentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []struct {
		SiteID int64
		Locale string
	}
	for rows.Next() {
		var item struct {
			SiteID int64
			Locale string
		}
		if err = rows.Scan(&item.SiteID, &item.Locale); err != nil {
			return nil, err
		}
		result = append(result, item)
	}
	if len(result) == 0 {
		return nil, ErrNotFound
	}
	return result, rows.Err()
}

// ContentLocaleScope resolves the authorization boundary for a single page
// locale. It is intentionally separate from ContentScopes because a page-form
// binding must be permitted for that exact site and language, not merely for
// another locale in the same content group.
func (s *Service) ContentLocaleScope(ctx context.Context, contentLocaleID int64) (int64, string, error) {
	if contentLocaleID < 1 {
		return 0, "", ErrNotFound
	}
	var siteID int64
	var locale string
	err := s.db.QueryRowContext(ctx, `SELECT site_id, locale FROM content_locales WHERE id = ?`, contentLocaleID).Scan(&siteID, &locale)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, "", ErrNotFound
	}
	return siteID, locale, err
}

func (s *Service) ListRevisions(ctx context.Context, userID, contentID int64, limit int) ([]ContentRevision, error) {
	if limit < 1 || limit > 100 {
		limit = 30
	}
	rows, err := s.db.QueryContext(ctx, `
		SELECT cr.id, cr.content_id, cr.content_locale_id, cr.site_id, cr.locale, cr.version,
		       cr.snapshot_json, cr.action, cr.actor_user_id, COALESCE(u.display_name, ''), cr.created_at
		FROM content_revisions cr LEFT JOIN users u ON u.id = cr.actor_user_id
		WHERE cr.content_id = ? AND EXISTS(
			SELECT 1 FROM user_access_scopes uas WHERE uas.user_id = ?
			AND (uas.site_id = 0 OR uas.site_id = cr.site_id) AND (uas.locale = '*' OR uas.locale = cr.locale)
		) ORDER BY cr.id DESC LIMIT ?`, contentID, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]ContentRevision, 0)
	for rows.Next() {
		var item ContentRevision
		var localeID, actorID sql.NullInt64
		var snapshot string
		if err = rows.Scan(&item.ID, &item.ContentID, &localeID, &item.SiteID, &item.Locale, &item.Version, &snapshot, &item.Action, &actorID, &item.ActorName, &item.CreatedAt); err != nil {
			return nil, err
		}
		if localeID.Valid {
			item.LocaleID = &localeID.Int64
		}
		if actorID.Valid {
			item.ActorUserID = &actorID.Int64
		}
		item.Snapshot = json.RawMessage(snapshot)
		result = append(result, item)
	}
	return result, rows.Err()
}

func (s *Service) GetContentRevision(ctx context.Context, revisionID int64) (ContentRevision, error) {
	if revisionID < 1 {
		return ContentRevision{}, invalid("修订版本 ID 无效")
	}
	var item ContentRevision
	var localeID, actorID sql.NullInt64
	var snapshot string
	err := s.db.QueryRowContext(ctx, `SELECT cr.id, cr.content_id, cr.content_locale_id, cr.site_id, cr.locale, cr.version,
		cr.snapshot_json, cr.action, cr.actor_user_id, COALESCE(u.display_name, ''), cr.created_at
		FROM content_revisions cr LEFT JOIN users u ON u.id = cr.actor_user_id WHERE cr.id = ?`, revisionID).Scan(
		&item.ID, &item.ContentID, &localeID, &item.SiteID, &item.Locale, &item.Version, &snapshot, &item.Action, &actorID, &item.ActorName, &item.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return ContentRevision{}, ErrNotFound
	}
	if err != nil {
		return ContentRevision{}, err
	}
	if localeID.Valid {
		item.LocaleID = &localeID.Int64
	}
	if actorID.Valid {
		item.ActorUserID = &actorID.Int64
	}
	item.Snapshot = json.RawMessage(snapshot)
	return item, nil
}

type contentRevisionSnapshot struct {
	Status            string          `json:"status"`
	Title             string          `json:"title"`
	Slug              string          `json:"slug"`
	Category          string          `json:"category"`
	Tags              []string        `json:"tags"`
	TemplateKey       string          `json:"template_key"`
	PageLayout        string          `json:"page_layout"`
	IndexPolicy       string          `json:"index_policy"`
	CoverMediaID      *int64          `json:"cover_media_id"`
	GalleryMediaIDs   []int64         `json:"gallery_media_ids"`
	Summary           string          `json:"summary"`
	BodyHTML          string          `json:"body_html"`
	H1                string          `json:"h1"`
	SEOTitle          string          `json:"seo_title"`
	MetaDescription   string          `json:"meta_description"`
	PrimaryKeyword    string          `json:"primary_keyword"`
	SecondaryKeywords []string        `json:"secondary_keywords"`
	CanonicalURL      string          `json:"canonical_url"`
	RobotsIndex       bool            `json:"robots_index"`
	OGTitle           string          `json:"og_title"`
	OGDescription     string          `json:"og_description"`
	StructuredData    json.RawMessage `json:"structured_data"`
	AIState           string          `json:"ai_state"`
}

func (s *Service) RestoreContentRevision(ctx context.Context, actorUserID, contentID, revisionID, currentVersion int64) (ContentLocale, error) {
	if contentID < 1 || revisionID < 1 || currentVersion < 1 {
		return ContentLocale{}, invalid("内容、修订版本或当前版本无效")
	}
	revision, err := s.GetContentRevision(ctx, revisionID)
	if err != nil {
		return ContentLocale{}, err
	}
	if revision.ContentID != contentID {
		return ContentLocale{}, ErrNotFound
	}
	current, err := s.GetContentLocale(ctx, contentID, revision.SiteID, revision.Locale)
	if err != nil {
		return ContentLocale{}, err
	}
	var snapshot contentRevisionSnapshot
	if err = json.Unmarshal(revision.Snapshot, &snapshot); err != nil {
		return ContentLocale{}, fmt.Errorf("解析修订快照: %w", err)
	}
	if snapshot.CoverMediaID != nil {
		var exists int
		if err = s.db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM media_files WHERE id = ?)`, *snapshot.CoverMediaID).Scan(&exists); err != nil {
			return ContentLocale{}, err
		}
		if exists != 1 {
			snapshot.CoverMediaID = nil
		}
	}
	return s.UpdateContentLocale(ctx, actorUserID, contentID, revision.SiteID, revision.Locale, UpdateContentLocaleInput{
		ContentType: current.ContentType, Status: "draft", Title: snapshot.Title, Slug: snapshot.Slug,
		Category: snapshot.Category, Tags: snapshot.Tags, TemplateKey: snapshot.TemplateKey, PageLayout: snapshot.PageLayout, IndexPolicy: snapshot.IndexPolicy, CoverMediaID: snapshot.CoverMediaID, GalleryMediaIDs: snapshot.GalleryMediaIDs,
		Summary: snapshot.Summary, BodyHTML: snapshot.BodyHTML, AIState: snapshot.AIState, Version: currentVersion, RevisionAction: "restored",
		SEO: &SEOInput{H1: snapshot.H1, Title: snapshot.SEOTitle, MetaDescription: snapshot.MetaDescription, PrimaryKeyword: snapshot.PrimaryKeyword,
			SecondaryKeywords: snapshot.SecondaryKeywords, CanonicalURL: snapshot.CanonicalURL, RobotsIndex: snapshot.RobotsIndex,
			OGTitle: snapshot.OGTitle, OGDescription: snapshot.OGDescription, StructuredData: snapshot.StructuredData},
	})
}

type scanner interface {
	Scan(...any) error
}

func scanContentLocale(row scanner, includeBody bool) (ContentLocale, error) {
	var item ContentLocale
	var publishedAt sql.NullString
	var ownerInt sql.NullInt64
	var robots int
	var secondary, structured string
	var tags, scheduled sql.NullString
	var coverID sql.NullInt64
	var galleryJSON string
	var coverName string
	var coverWidth, coverHeight int
	dest := []any{&item.ID, &item.ContentID, &item.ContentType, &item.SiteID, &item.SiteName, &item.Locale, &item.LanguageName, &item.Status, &item.Title, &item.Slug, &item.Category, &tags, &item.TemplateKey, &item.PageLayout, &item.IndexPolicy, &scheduled, &coverID, &galleryJSON, &coverName, &coverWidth, &coverHeight, &item.Summary}
	if includeBody {
		dest = append(dest, &item.BodyHTML)
	}
	dest = append(dest, &item.H1, &item.SEOTitle, &item.MetaDescription, &item.PrimaryKeyword, &secondary, &item.CanonicalURL, &robots, &item.OGTitle, &item.OGDescription, &structured, &item.AIState, &ownerInt, &item.OwnerName, &item.Version, &item.ContentVersion, &publishedAt, &item.CreatedAt, &item.UpdatedAt)
	if err := row.Scan(dest...); err != nil {
		return ContentLocale{}, err
	}
	if ownerInt.Valid {
		item.OwnerID = &ownerInt.Int64
	}
	if publishedAt.Valid {
		item.PublishedAt = &publishedAt.String
	}
	item.RobotsIndex = robots == 1
	if scheduled.Valid {
		item.ScheduledAt = &scheduled.String
	}
	if coverID.Valid {
		item.CoverMediaID = &coverID.Int64
		item.CoverOriginalName = coverName
		item.CoverWidth = coverWidth
		item.CoverHeight = coverHeight
	}
	item.GalleryMediaIDs = normalizeGalleryMediaIDs(galleryJSON)
	item.Gallery = []GalleryMedia{}
	if err := json.Unmarshal([]byte(tags.String), &item.Tags); err != nil {
		item.Tags = []string{}
	}
	if err := json.Unmarshal([]byte(secondary), &item.SecondaryKeywords); err != nil {
		item.SecondaryKeywords = []string{}
	}
	item.StructuredData = json.RawMessage(structured)
	return item, nil
}

func getContentLocaleTx(ctx context.Context, tx *sql.Tx, contentID, siteID int64, locale string) (ContentLocale, error) {
	row := tx.QueryRowContext(ctx, `
		SELECT cl.id, c.id, c.content_type, cl.site_id, s.name, cl.locale, cl.locale,
		       cl.status, cl.title, cl.slug, cl.category, cl.tags_json, cl.template_key, cl.page_layout, cl.index_policy, cl.scheduled_at, cl.cover_media_id, cl.gallery_media_ids_json,
		       COALESCE(m.original_name, ''), COALESCE(m.width, 0), COALESCE(m.height, 0), cl.summary, cl.body_html, cl.h1, cl.seo_title, cl.meta_description,
		       cl.primary_keyword, cl.secondary_keywords_json, cl.canonical_url, cl.robots_index,
		       cl.og_title, cl.og_description, cl.structured_data_json, cl.ai_state, c.owner_id,
		       COALESCE(u.display_name, ''), cl.version, c.version, cl.published_at, cl.created_at, cl.updated_at
		FROM contents c JOIN content_locales cl ON cl.content_id = c.id JOIN sites s ON s.id = cl.site_id LEFT JOIN media_files m ON m.id = cl.cover_media_id
		LEFT JOIN users u ON u.id = c.owner_id
		WHERE c.id = ? AND cl.site_id = ? AND cl.locale = ? AND c.deleted_at IS NULL`, contentID, siteID, locale)
	item, err := scanContentLocale(row, true)
	if errors.Is(err, sql.ErrNoRows) {
		return ContentLocale{}, ErrNotFound
	}
	return item, err
}

func insertRevision(ctx context.Context, tx *sql.Tx, localeID, contentID, siteID int64, locale string, version int64, action string, actorUserID int64) error {
	var snapshot string
	err := tx.QueryRowContext(ctx, `SELECT json_object(
		'content_id', content_id, 'site_id', site_id, 'locale', locale, 'status', status, 'title', title,
		'slug', slug, 'category', category, 'tags', json(tags_json), 'template_key', template_key,
		'page_layout', page_layout, 'index_policy', index_policy,
		'scheduled_at', scheduled_at, 'cover_media_id', cover_media_id, 'gallery_media_ids', json(gallery_media_ids_json), 'summary', summary, 'body_html', body_html, 'h1', h1, 'seo_title', seo_title,
		'meta_description', meta_description, 'primary_keyword', primary_keyword,
		'secondary_keywords', json(secondary_keywords_json), 'canonical_url', canonical_url,
		'robots_index', json(CASE WHEN robots_index = 1 THEN 'true' ELSE 'false' END),
		'og_title', og_title, 'og_description', og_description, 'structured_data', json(structured_data_json),
		'ai_state', ai_state, 'published_at', published_at, 'version', version, 'updated_at', updated_at
	) FROM content_locales WHERE id = ?`, localeID).Scan(&snapshot)
	if err != nil {
		return err
	}
	_, err = tx.ExecContext(ctx, `INSERT INTO content_revisions(content_id, content_locale_id, site_id, locale, version, snapshot_json, action, actor_user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, contentID, localeID, siteID, locale, version, snapshot, action, actorUserID, nowUTC())
	return err
}

func requireEnabledSiteLocale(ctx context.Context, tx *sql.Tx, siteID int64, locale string) error {
	var exists int
	if err := tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM site_languages WHERE site_id = ? AND locale = ? AND enabled = 1)`, siteID, locale).Scan(&exists); err != nil {
		return err
	}
	if exists != 1 {
		return invalid("该站点尚未启用此 Locale")
	}
	return nil
}

func normalizeSiteInput(input *SiteInput) {
	input.Name = strings.TrimSpace(input.Name)
	input.Code = strings.ToLower(strings.TrimSpace(input.Code))
	input.PrimaryDomain = strings.ToLower(strings.TrimSpace(input.PrimaryDomain))
	input.MarketCode = strings.ToUpper(strings.TrimSpace(input.MarketCode))
	input.Status = strings.ToLower(strings.TrimSpace(input.Status))
	input.SEOTitle = strings.TrimSpace(input.SEOTitle)
	input.SEODescription = strings.TrimSpace(input.SEODescription)
	input.DefaultLanguageCode = strings.ToLower(strings.TrimSpace(input.DefaultLanguageCode))
	input.DefaultLocale = strings.TrimSpace(input.DefaultLocale)
}

func validateSiteInput(input SiteInput, update bool) error {
	if !textLength(input.Name, 2, 100) {
		return invalid("站点名称需为 2 到 100 个字符")
	}
	if !codePattern.MatchString(input.Code) {
		return invalid("站点代码只能使用小写字母、数字和连字符")
	}
	if input.PrimaryDomain != "" {
		domain := SiteDomainInput{Hostname: input.PrimaryDomain, Kind: "primary"}
		normalizeSiteDomainInput(&domain)
		if err := validateSiteDomainInput(domain, false); err != nil {
			return invalid("主域名格式无效；请填写带后缀的正式域名，不要填写协议、端口、路径、IP 或 localhost")
		}
	}
	if input.LocalPort != 0 && (input.LocalPort < 1024 || input.LocalPort > 65535 || input.LocalPort == 8080) {
		return invalid("本地预览端口需为 1024 到 65535，且不能使用后台端口 8080")
	}
	if !marketCodePattern.MatchString(input.MarketCode) {
		return invalid("市场代码格式无效")
	}
	if input.Status != "active" && input.Status != "maintenance" && input.Status != "disabled" {
		return invalid("站点状态无效")
	}
	if utf8.RuneCountInString(input.SEOTitle) > 200 {
		return invalid("站点 SEO 标题不能超过 200 个字符")
	}
	if utf8.RuneCountInString(input.SEODescription) > 500 {
		return invalid("站点 Meta Description 不能超过 500 个字符")
	}
	if input.FaviconMediaID != nil && *input.FaviconMediaID < 1 {
		return invalid("网站 Icon 媒体 ID 无效")
	}
	if input.DefaultThemePackageID < 0 {
		return invalid("默认模板 ID 无效")
	}
	if !update && input.DefaultLanguageCode != "" && !codePattern.MatchString(input.DefaultLanguageCode) {
		return invalid("默认语言代码无效")
	}
	return nil
}

func validateSiteFaviconTx(ctx context.Context, tx *sql.Tx, mediaID *int64) error {
	if mediaID == nil {
		return nil
	}
	var mediaType string
	var width, height int
	err := tx.QueryRowContext(ctx, `SELECT media_type, width, height FROM media_files WHERE id = ?`, *mediaID).Scan(&mediaType, &width, &height)
	if errors.Is(err, sql.ErrNoRows) {
		return invalid("网站 Icon 媒体不存在或已被删除")
	}
	if err != nil {
		return err
	}
	// JPEG/PNG remain accepted only for sites created before the AVIF storage
	// policy; every new upload is normalized to AVIF by filestore and the media
	// migration can upgrade existing icons without breaking site edits.
	if (mediaType != "image/avif" && mediaType != "image/png" && mediaType != "image/jpeg") || width < 16 || height < 16 || width > 2048 || height > 2048 || width != height {
		return invalid("网站 Icon 必须是 16–2048 像素的方形图片；新上传图片会自动转换为 AVIF")
	}
	return nil
}

func publicMediaURL(mediaID *int64, checksum string) string {
	if mediaID == nil || *mediaID < 1 || len(checksum) < 16 {
		return ""
	}
	return filestore.PublicMediaURL(*mediaID, checksum)
}

// resolveCreateSiteThemeTx accepts only executable built-in templates. Uploaded
// archives remain unbound until their isolated compile/deploy pipeline marks
// them as one of the supported render keys.
func resolveCreateSiteThemeTx(ctx context.Context, tx *sql.Tx, requestedID int64) (*int64, error) {
	var themeID int64
	var err error
	if requestedID == 0 {
		err = tx.QueryRowContext(ctx, `SELECT id FROM theme_packages
			WHERE render_key = 'global-route' AND status = 'validated' LIMIT 1`).Scan(&themeID)
		if errors.Is(err, sql.ErrNoRows) {
			return nil, invalid("系统没有可用的安全默认模板，请先安装并验证模板")
		}
	} else {
		err = tx.QueryRowContext(ctx, `SELECT id FROM theme_packages
			WHERE id = ? AND status = 'validated' AND render_key IN ('global-route', 'atlas-commerce')`, requestedID).Scan(&themeID)
		if errors.Is(err, sql.ErrNoRows) {
			return nil, invalid("只能选择已通过安全检查且已编译可渲染的模板")
		}
	}
	if err != nil {
		return nil, err
	}
	return &themeID, nil
}

func nextLocalPortTx(ctx context.Context, tx *sql.Tx) (int, error) {
	var highest int
	if err := tx.QueryRowContext(ctx, `SELECT COALESCE(MAX(local_port), 8080) FROM sites WHERE local_port BETWEEN 8081 AND 65534`).Scan(&highest); err != nil {
		return 0, err
	}
	if highest < 8080 {
		highest = 8080
	}
	if highest >= 65535 {
		return 0, invalid("没有可自动分配的本地预览端口")
	}
	return highest + 1, nil
}

func normalizeLanguageInput(input *LanguageInput) {
	input.Code = strings.ToLower(strings.TrimSpace(input.Code))
	input.NameZH = strings.TrimSpace(input.NameZH)
	input.NativeName = strings.TrimSpace(input.NativeName)
	input.DefaultLocale = strings.TrimSpace(input.DefaultLocale)
	input.Direction = strings.ToLower(strings.TrimSpace(input.Direction))
}

func validateLanguageInput(input LanguageInput, update bool) error {
	if !codePattern.MatchString(input.Code) {
		return invalid("语言代码只能使用小写字母、数字和连字符")
	}
	if !textLength(input.NameZH, 2, 60) || !textLength(input.NativeName, 1, 100) {
		return invalid("语言中文名或本地名称长度无效")
	}
	if !localePattern.MatchString(input.DefaultLocale) {
		return invalid("Locale 格式无效")
	}
	if input.Direction != "ltr" && input.Direction != "rtl" {
		return invalid("文字方向只能是 ltr 或 rtl")
	}
	if update && input.Version < 1 {
		return invalid("语言版本无效")
	}
	return nil
}

func normalizeCreateContent(input *CreateContentInput) {
	input.ContentType = strings.ToLower(strings.TrimSpace(input.ContentType))
	input.Locale = strings.TrimSpace(input.Locale)
	input.Status = strings.ToLower(strings.TrimSpace(input.Status))
	input.Title = strings.TrimSpace(input.Title)
	input.Slug = strings.ToLower(strings.Trim(strings.TrimSpace(input.Slug), "/"))
	input.Category = strings.TrimSpace(input.Category)
	input.TemplateKey = strings.TrimSpace(input.TemplateKey)
	input.ScheduledAt = strings.TrimSpace(input.ScheduledAt)
	input.Tags = normalizeTags(input.Tags)
	input.GalleryMediaIDs = normalizeGalleryMediaIDsFromSlice(input.GalleryMediaIDs)
	input.Summary = strings.TrimSpace(input.Summary)
	input.AIState = strings.ToLower(strings.TrimSpace(input.AIState))
	input.PageLayout = strings.ToLower(strings.TrimSpace(input.PageLayout))
	input.IndexPolicy = strings.ToLower(strings.TrimSpace(input.IndexPolicy))
	if input.ContentType == "" {
		input.ContentType = "article"
	}
	if input.Status == "" {
		input.Status = "draft"
	}
	if input.AIState == "" {
		input.AIState = "manual"
	}
}

func normalizeUpdateContent(input *UpdateContentLocaleInput) {
	input.ContentType = strings.ToLower(strings.TrimSpace(input.ContentType))
	input.Status = strings.ToLower(strings.TrimSpace(input.Status))
	input.Title = strings.TrimSpace(input.Title)
	input.Slug = strings.ToLower(strings.Trim(strings.TrimSpace(input.Slug), "/"))
	input.Category = strings.TrimSpace(input.Category)
	input.TemplateKey = strings.TrimSpace(input.TemplateKey)
	input.ScheduledAt = strings.TrimSpace(input.ScheduledAt)
	input.Tags = normalizeTags(input.Tags)
	input.GalleryMediaIDs = normalizeGalleryMediaIDsFromSlice(input.GalleryMediaIDs)
	input.Summary = strings.TrimSpace(input.Summary)
	input.AIState = strings.ToLower(strings.TrimSpace(input.AIState))
	input.PageLayout = strings.ToLower(strings.TrimSpace(input.PageLayout))
	input.IndexPolicy = strings.ToLower(strings.TrimSpace(input.IndexPolicy))
}

func applyPageDefaults(contentType, layout, policy *string, slug, title string) {
	if *contentType != "page" {
		*layout, *policy = "standard", "index"
		return
	}
	if *layout == "" {
		*layout = "standard"
		value := strings.ToLower(slug + " " + title)
		if strings.Contains(value, "contact") || strings.Contains(value, "联系") {
			*layout = "contact"
		}
		if strings.Contains(value, "campaign") || strings.Contains(value, "专题") || strings.Contains(value, "landing") {
			*layout = "landing"
		}
	}
	// New pages stay out of search by default. An editor may explicitly opt an
	// about, service or campaign page into indexing after its SEO information is
	// reviewed. Contact and legal pages should normally remain noindex.
	if *policy == "" {
		*policy = "noindex"
	}
}

func validateContent(contentType string, siteID int64, locale, status, title, slug, summary, bodyHTML, aiState string, seo *SEOInput) error {
	if siteID < 1 || !localePattern.MatchString(locale) {
		return invalid("站点或 Locale 无效")
	}
	if contentType != "article" && contentType != "page" && contentType != "landing" && contentType != "category" && contentType != "product" {
		return invalid("内容类型无效")
	}
	if !validContentStatus(status) {
		return invalid("内容状态无效")
	}
	if !textLength(title, 2, 200) {
		return invalid("标题需为 2 到 200 个字符")
	}
	if len(slug) > 180 || !slugPattern.MatchString(slug) {
		return invalid("Slug 只能使用小写字母、数字、连字符和路径分隔符")
	}
	if utf8.RuneCountInString(summary) > 500 {
		return invalid("摘要不能超过 500 个字符")
	}
	if len(bodyHTML) > contentsafety.MaxRichTextBytes {
		return invalid("富文本不能超过 2 MiB")
	}
	if status == "published" && strings.TrimSpace(bodyHTML) == "" {
		return invalid("发布内容必须填写正文")
	}
	if aiState != "manual" && aiState != "localized" && aiState != "pending" && aiState != "reviewed" && aiState != "locked" {
		return invalid("AI 本土化状态无效")
	}
	if seo != nil {
		_, err := normalizeSEO(seo, title)
		return err
	}
	return nil
}

func validatePageOptions(contentType, layout, policy string) error {
	if contentType != "page" {
		return nil
	}
	if layout != "standard" && layout != "contact" && layout != "landing" && layout != "custom" {
		return invalid("单页面布局无效")
	}
	if policy != "index" && policy != "noindex" {
		return invalid("搜索引擎收录策略无效")
	}
	return nil
}

func normalizeTags(input []string) []string {
	seen := make(map[string]bool, len(input))
	result := make([]string, 0, min(len(input), 30))
	for _, value := range input {
		value = strings.TrimSpace(value)
		if value == "" || utf8.RuneCountInString(value) > 60 {
			continue
		}
		key := strings.ToLower(value)
		if seen[key] {
			continue
		}
		seen[key] = true
		result = append(result, value)
		if len(result) >= 30 {
			break
		}
	}
	return result
}

func nullableText(value string) any {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return value
}

func scheduledPublishTime(scheduledAt, fallback string) string {
	value := strings.TrimSpace(scheduledAt)
	if value == "" {
		return fallback
	}
	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil || !parsed.After(time.Now().UTC()) {
		return fallback
	}
	return parsed.UTC().Format(time.RFC3339Nano)
}

func validateContentExtras(category string, tags []string, templateKey, scheduledAt string, coverMediaID *int64, galleryMediaIDs []int64) error {
	if utf8.RuneCountInString(category) > 100 {
		return invalid("栏目名称不能超过 100 个字符")
	}
	if len(tags) > 30 {
		return invalid("标签不能超过 30 个")
	}
	if utf8.RuneCountInString(templateKey) > 100 {
		return invalid("内容模板标识不能超过 100 个字符")
	}
	if scheduledAt != "" {
		if _, err := time.Parse(time.RFC3339, scheduledAt); err != nil {
			return invalid("定时发布时间必须使用 RFC3339 时间格式")
		}
	}
	if coverMediaID != nil && *coverMediaID < 1 {
		return invalid("封面媒体 ID 无效")
	}
	if len(galleryMediaIDs) > 12 {
		return invalid("产品图库最多 12 张图片")
	}
	for _, id := range galleryMediaIDs {
		if id < 1 {
			return invalid("图库媒体 ID 无效")
		}
	}
	return nil
}

func normalizeGalleryMediaIDsFromSlice(input []int64) []int64 {
	seen := make(map[int64]bool, len(input))
	result := make([]int64, 0, min(len(input), 12))
	for _, id := range input {
		if id < 1 || seen[id] {
			continue
		}
		seen[id] = true
		result = append(result, id)
		if len(result) >= 12 {
			break
		}
	}
	return result
}

// normalizeProductGallery keeps the product cover and gallery in sync. The
// editor supports choosing a cover through the media dialog as well as adding
// images through the gallery dropzone; either path must produce the same
// persisted representation so a reopened product never loses its first image.
func normalizeProductGallery(coverID *int64, galleryIDs []int64) (*int64, []int64) {
	ids := normalizeGalleryMediaIDsFromSlice(galleryIDs)
	if coverID != nil && *coverID > 0 {
		ordered := make([]int64, 0, min(len(ids)+1, 12))
		ordered = append(ordered, *coverID)
		ordered = append(ordered, ids...)
		ids = normalizeGalleryMediaIDsFromSlice(ordered)
		return coverID, ids
	}
	if len(ids) > 0 {
		first := ids[0]
		return &first, ids
	}
	return nil, ids
}

func galleryMediaJSON(ids []int64) string {
	clean := normalizeGalleryMediaIDsFromSlice(ids)
	b, _ := json.Marshal(clean)
	return string(b)
}

func normalizeGalleryMediaIDs(raw string) []int64 {
	var ids []int64
	if err := json.Unmarshal([]byte(raw), &ids); err != nil {
		return []int64{}
	}
	return normalizeGalleryMediaIDsFromSlice(ids)
}

func requireGalleryMediaFilesTx(ctx context.Context, tx *sql.Tx, ids []int64) error {
	for _, id := range normalizeGalleryMediaIDsFromSlice(ids) {
		var mediaType string
		if err := tx.QueryRowContext(ctx, `SELECT media_type FROM media_files WHERE id = ?`, id).Scan(&mediaType); errors.Is(err, sql.ErrNoRows) {
			return invalid("图库媒体不存在或已被删除")
		} else if err != nil {
			return err
		}
		if !strings.HasPrefix(strings.ToLower(mediaType), "image/") {
			return invalid("图库只能引用图片媒体")
		}
	}
	return nil
}

func requireMediaFileTx(ctx context.Context, tx *sql.Tx, mediaID *int64) error {
	if mediaID == nil {
		return nil
	}
	var exists int
	if err := tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM media_files WHERE id = ?)`, *mediaID).Scan(&exists); err != nil {
		return err
	}
	if exists != 1 {
		return invalid("封面媒体不存在或已被删除")
	}
	return nil
}

func normalizeSEO(input *SEOInput, fallbackTitle string) (SEOInput, error) {
	seo := SEOInput{RobotsIndex: true}
	if input != nil {
		seo = *input
	}
	seo.H1 = strings.TrimSpace(seo.H1)
	seo.Title = strings.TrimSpace(seo.Title)
	seo.MetaDescription = strings.TrimSpace(seo.MetaDescription)
	seo.PrimaryKeyword = strings.TrimSpace(seo.PrimaryKeyword)
	seo.CanonicalURL = strings.TrimSpace(seo.CanonicalURL)
	seo.OGTitle = strings.TrimSpace(seo.OGTitle)
	seo.OGDescription = strings.TrimSpace(seo.OGDescription)
	if seo.H1 == "" {
		seo.H1 = fallbackTitle
	}
	if seo.Title == "" {
		seo.Title = fallbackTitle
	}
	if utf8.RuneCountInString(seo.H1) > 200 || utf8.RuneCountInString(seo.Title) > 200 || utf8.RuneCountInString(seo.MetaDescription) > 500 || utf8.RuneCountInString(seo.OGTitle) > 200 || utf8.RuneCountInString(seo.OGDescription) > 500 || utf8.RuneCountInString(seo.PrimaryKeyword) > 100 {
		return SEOInput{}, invalid("SEO 字段长度超出限制")
	}
	if len(seo.SecondaryKeywords) > 20 {
		return SEOInput{}, invalid("次要关键词不能超过 20 个")
	}
	seen := make(map[string]bool)
	keywords := make([]string, 0, len(seo.SecondaryKeywords))
	for _, keyword := range seo.SecondaryKeywords {
		keyword = strings.TrimSpace(keyword)
		key := strings.ToLower(keyword)
		if keyword == "" || utf8.RuneCountInString(keyword) > 100 || seen[key] {
			return SEOInput{}, invalid("次要关键词为空、重复或过长")
		}
		seen[key] = true
		keywords = append(keywords, keyword)
	}
	seo.SecondaryKeywords = keywords
	if seo.CanonicalURL != "" {
		parsed, err := url.ParseRequestURI(seo.CanonicalURL)
		if err != nil || (parsed.Scheme != "https" && parsed.Scheme != "http") || parsed.Host == "" || parsed.User != nil || len(seo.CanonicalURL) > 2048 {
			return SEOInput{}, invalid("Canonical URL 必须是有效的 HTTP 或 HTTPS 绝对地址")
		}
	}
	seo.StructuredData = normalizedStructuredData(seo.StructuredData)
	if len(seo.StructuredData) > 64<<10 {
		return SEOInput{}, invalid("结构化数据不能超过 64 KiB")
	}
	var object map[string]any
	if err := json.Unmarshal(seo.StructuredData, &object); err != nil || object == nil {
		return SEOInput{}, invalid("结构化数据必须是 JSON 对象")
	}
	if err := validateStructuredDataObject(object); err != nil {
		return SEOInput{}, err
	}
	return seo, nil
}

func normalizeContentSEO(contentType string, input *SEOInput, fallbackTitle string) (SEOInput, error) {
	return normalizeSEO(input, fallbackTitle)
}

func normalizedStructuredData(input json.RawMessage) json.RawMessage {
	source := strings.TrimSpace(string(input))
	if match := structuredDataScriptPattern.FindStringSubmatch(source); len(match) == 2 {
		source = strings.TrimSpace(match[1])
	}
	if source == "" || source == "null" {
		return json.RawMessage(`{}`)
	}
	return json.RawMessage(source)
}

// validateStructuredDataObject keeps the editor contract aligned with the
// public JSON-LD renderer. Empty objects mean “use the generated schema”. A
// non-empty document must contain typed Schema.org nodes; otherwise a typo in
// the textarea would silently produce data that Google cannot interpret.
func validateStructuredDataObject(object map[string]any) error {
	if len(object) == 0 {
		return nil
	}
	if context, ok := object["@context"]; ok {
		if !validStructuredDataContext(context) {
			return invalid("结构化数据 @context 必须使用 https://schema.org")
		}
	}
	nodes := []map[string]any{object}
	if graph, ok := object["@graph"].([]any); ok {
		nodes = make([]map[string]any, 0, len(graph))
		for _, raw := range graph {
			node, ok := raw.(map[string]any)
			if !ok || node == nil {
				return invalid("结构化数据 @graph 必须只包含 JSON 对象")
			}
			nodes = append(nodes, node)
		}
		if len(nodes) == 0 {
			return invalid("结构化数据 @graph 不能为空")
		}
	}
	for _, node := range nodes {
		if structuredDataTypeValue(node["@type"]) == "" {
			return invalid("结构化数据每个节点都必须包含 @type")
		}
	}
	if err := validateStructuredDataURLs(object, false); err != nil {
		return err
	}
	return nil
}

// validStructuredDataContext accepts the two JSON-LD context shapes commonly
// copied from Google documentation: one Schema.org URL or an array containing
// that URL. Rejecting other JSON values early prevents a malformed context
// from being persisted and later presented as if it were valid structured data.
func validStructuredDataContext(value any) bool {
	schemaContext := func(raw string) bool {
		raw = strings.TrimRight(strings.TrimSpace(strings.ToLower(raw)), "/")
		return raw == "https://schema.org"
	}
	switch typed := value.(type) {
	case string:
		return schemaContext(typed)
	case []any:
		if len(typed) == 0 {
			return false
		}
		hasSchemaContext := false
		for _, item := range typed {
			switch item := item.(type) {
			case string:
				raw := strings.TrimSpace(item)
				parsed, err := url.Parse(raw)
				if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
					return false
				}
				if schemaContext(raw) {
					hasSchemaContext = true
				}
			case map[string]any:
				if vocab, ok := item["@vocab"].(string); ok {
					parsed, err := url.Parse(strings.TrimSpace(vocab))
					if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
						return false
					}
					if schemaContext(vocab) {
						hasSchemaContext = true
					}
				} else if len(item) == 0 {
					return false
				}
			default:
				return false
			}
		}
		return hasSchemaContext
	case map[string]any:
		vocab, ok := typed["@vocab"].(string)
		return ok && schemaContext(vocab)
	default:
		return false
	}
}

// validateStructuredDataURLs rejects URL schemes that are never meaningful to
// a crawler and can become an injection vector when a custom JSON-LD snippet
// is copied between editors. Image-like properties additionally require a
// public absolute HTTP(S) URL so Google can fetch the asset reliably.
func validateStructuredDataURLs(value any, inheritedAbsolute bool) error {
	switch typed := value.(type) {
	case map[string]any:
		for key, child := range typed {
			keyLower := strings.ToLower(strings.TrimSpace(key))
			urlField := keyLower == "url" || keyLower == "@id" || keyLower == "sameas" || keyLower == "image" || keyLower == "logo" || keyLower == "contenturl" || keyLower == "embedurl" || keyLower == "thumbnailurl"
			if err := validateStructuredDataURLValue(child, inheritedAbsolute || keyLower == "image" || keyLower == "logo" || keyLower == "contenturl" || keyLower == "embedurl" || keyLower == "thumbnailurl", urlField); err != nil {
				return err
			}
		}
	case []any:
		for _, child := range typed {
			if err := validateStructuredDataURLs(child, inheritedAbsolute); err != nil {
				return err
			}
		}
	}
	return nil
}

func validateStructuredDataURLValue(value any, requireAbsolute, isURLField bool) error {
	switch typed := value.(type) {
	case string:
		raw := strings.TrimSpace(typed)
		if raw == "" {
			return nil
		}
		lower := strings.ToLower(raw)
		for _, blocked := range []string{"javascript:", "data:", "vbscript:"} {
			if strings.HasPrefix(lower, blocked) {
				return invalid("结构化数据 URL 不允许使用 " + blocked + " 地址")
			}
		}
		if !isURLField && !requireAbsolute {
			return nil
		}
		parsed, err := url.Parse(raw)
		if err != nil || strings.ContainsAny(raw, "\r\n") {
			return invalid("结构化数据包含无效 URL")
		}
		if requireAbsolute && (parsed.Scheme != "http" && parsed.Scheme != "https" || parsed.Host == "") {
			return invalid("结构化数据图片 URL 必须是 HTTP 或 HTTPS 绝对地址")
		}
	case map[string]any:
		return validateStructuredDataURLs(typed, requireAbsolute)
	case []any:
		for _, child := range typed {
			// Preserve the URL-field context while descending into arrays so
			// image-like fields continue to require absolute HTTP(S) URLs.
			if err := validateStructuredDataURLValue(child, requireAbsolute, isURLField); err != nil {
				return err
			}
		}
	}
	return nil
}

func structuredDataTypeValue(value any) string {
	switch typed := value.(type) {
	case string:
		return strings.TrimSpace(typed)
	case []any:
		for _, item := range typed {
			if result := structuredDataTypeValue(item); result != "" {
				return result
			}
		}
	}
	return ""
}

func validContentStatus(status string) bool {
	return status == "draft" || status == "review" || status == "published" || status == "needs_update" || status == "archived"
}

func textLength(value string, minimum, maximum int) bool {
	length := utf8.RuneCountInString(strings.TrimSpace(value))
	return length >= minimum && length <= maximum
}

func nowUTC() string { return time.Now().UTC().Format(time.RFC3339Nano) }

func boolInt(value bool) int {
	if value {
		return 1
	}
	return 0
}

func escapeLike(value string) string {
	value = strings.ReplaceAll(value, `\`, `\\`)
	value = strings.ReplaceAll(value, `%`, `\%`)
	return strings.ReplaceAll(value, `_`, `\_`)
}

func classifyConstraint(err error) error {
	if err == nil {
		return nil
	}
	lower := strings.ToLower(err.Error())
	if strings.Contains(lower, "unique constraint") || strings.Contains(lower, "constraint failed") {
		return fmt.Errorf("%w: 唯一字段已被占用或关联数据无效", ErrConflict)
	}
	return err
}

type queryer interface {
	QueryRowContext(context.Context, string, ...any) *sql.Row
}

func requireAffected(ctx context.Context, db queryer, result sql.Result, table string, id int64) error {
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected > 0 {
		return nil
	}
	var exists int
	if err = db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM `+table+` WHERE id = ?)`, id).Scan(&exists); err != nil {
		return err
	}
	if exists == 1 {
		return ErrConflict
	}
	return ErrNotFound
}
