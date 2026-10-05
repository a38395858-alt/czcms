package httpserver

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/subtle"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"html"
	"html/template"
	"io"
	"io/fs"
	"log/slog"
	"net"
	"net/http"
	"net/url"
	"path/filepath"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"time"
	"unicode"

	"czcms/internal/analytics"
	"czcms/internal/audit"
	"czcms/internal/auth"
	"czcms/internal/authorization"
	"czcms/internal/backup"
	"czcms/internal/cache"
	"czcms/internal/catalog"
	"czcms/internal/config"
	"czcms/internal/contentsafety"
	"czcms/internal/filestore"
	"czcms/internal/security"
	"czcms/internal/spider"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Dependencies struct {
	DB                    *sql.DB
	Cache                 cache.Store
	Logger                *slog.Logger
	Template              *template.Template
	Assets                fs.FS
	Started               time.Time
	Config                config.Config
	Auth                  *auth.Service
	Authorization         *authorization.Service
	Audit                 *audit.Service
	Keys                  *security.Keyring
	Sanitizer             *contentsafety.Sanitizer
	Catalog               *catalog.Service
	Files                 *filestore.Store
	Backups               *backup.Service
	Analytics             *analytics.Service
	Spider                *spider.Service
	SEOAssistant          SEOAssistant
	LocalizationAssistant LocalizationAssistant
	SyncLocalPreviews     func() error
}

type server struct {
	Dependencies
	loginIPLimiter     *security.Limiter
	loginUserLimiter   *security.Limiter
	mediaImportLimiter *security.Limiter
	remoteMediaClient  *http.Client
	trustedProxies     []*net.IPNet
}

type sessionContextKey struct{}

type authPageData struct {
	Title             string
	Heading           string
	Description       string
	Mode              string
	Error             string
	CSRFToken         string
	Next              string
	Username          string
	DisplayName       string
	Email             string
	MFASecret         string
	RecoveryCodes     []string
	RequireSetupToken bool
}

type adminPageData struct {
	CSRFToken   string
	Username    string
	DisplayName string
}

// publicCopy is deliberately kept in the server package so adding a language
// later only requires a dictionary entry (custom templates can still replace
// the HTML shell). It is not used by the Chinese admin UI.
type publicCopy struct {
	LanguageName     string
	NavServices      string
	NavIndustries    string
	NavProcess       string
	NavGuides        string
	NavAbout         string
	NavContact       string
	SwitchLabel      string
	HeroKicker       string
	HeroTitle        string
	HeroBody         string
	HeroPrimary      string
	HeroSecondary    string
	HeroMicrocopy    string
	TrustLabel       string
	TrustValue       string
	TrustItems       []string
	ServicesKicker   string
	ServicesTitle    string
	ServicesBody     string
	Service1Title    string
	Service1Body     string
	Service2Title    string
	Service2Body     string
	Service3Title    string
	Service3Body     string
	GuidesKicker     string
	GuidesTitle      string
	GuidesBody       string
	GuidesLinks      []string
	ReadMore         string
	NoGuides         string
	ContactKicker    string
	ContactTitle     string
	ContactBody      string
	ContactButton    string
	FooterNote       string
	PreviewNote      string
	MaintenanceTitle string
	MaintenanceBody  string
	NotFoundTitle    string
	NotFoundBody     string
	NotFoundButton   string
	ArticleBack      string
	ArticleUpdated   string
	ArticlePublished string
	ArticleReading   string
	ArticleMinute    string
	ArticleTags      string
	ArticleRelated   string
	Services         []publicServiceItem
	AdvantagesTitle  string
	Advantages       []publicAdvantageItem
	ProcessTitle     string
	ProcessBody      string
	ProcessSteps     []publicProcessStep
	IndustriesTitle  string
	IndustriesBody   string
	Industries       []publicIndustryItem
	FAQTitle         string
	FAQs             []publicFAQItem
	// Fixed-page labels keep the service and industry templates fully
	// localised instead of leaking English shell text into translated routes.
	PageHome         string
	PageServices     string
	PageIndustries   string
	PageSolutions    string
	PageWorkflow     string
	PageScope        string
	PageGuides       string
	PageContact      string
	PageDecision     string
	PageFits         string
	PageNeeds        string
	PageBenefits     string
	PageIncluded     string
	PageConfirm      string
	PageFAQTitle     string
	PageFAQLead      string
	PageRelatedBack  string
	PageBackTop      string
	PageRelatedTitle string
	FixedFooter      string
}

type publicServiceItem struct {
	Label     string
	Title     string
	Body      string
	LinkLabel string
}

type publicAdvantageItem struct {
	Title string
	Body  string
}

type publicProcessStep struct {
	Title  string
	Body   string
	Marker string
}

type publicIndustryItem struct {
	Title string
	Body  string
}

type publicFAQItem struct {
	Question string
	Answer   string
}

func isFreightVantaReferenceLanguage(languageCode string) bool {
	switch strings.ToLower(strings.TrimSpace(languageCode)) {
	case "de", "fr", "es", "it":
		return true
	default:
		return false
	}
}

type publicLanguageData struct {
	Code       string
	Locale     string
	Name       string
	NativeName string
	URL        string
}

type publicHreflang struct {
	Locale string
	URL    string
}

type publicContentData struct {
	ID              int64
	ContentID       int64
	ContentType     string
	Title           string
	H1              string
	Summary         string
	Slug            string
	Category        string
	Locale          string
	LanguageName    string
	SEOTitle        string
	MetaDescription string
	OGTitle         string
	OGDescription   string
	OwnerName       string
	CoverURL        string
	CoverWidth      int
	CoverHeight     int
	URL             string
	UpdatedAt       string
	PublishedAt     string
	Status          string
	ReadingMinutes  int
	PageLayout      string
	Tags            []string
	// Gallery contains the product media attached to this content. It uses
	// the catalog's safe public representation (no filesystem paths or
	// private metadata) so product detail templates can render uploaded
	// images without exposing storage internals. For non-product content it
	// remains an empty slice.
	Gallery []catalog.GalleryMedia
	Body    template.HTML
}

// publicGuideIndexCopy is the localized editorial shell used by the full
// insights/guide index. It intentionally lives beside the existing home copy
// so each market can keep its own voice while sharing the same content data.
type publicGuideIndexCopy struct {
	Kicker, Title, Body                                          string
	FeaturedLabel, FeaturedTitle, FeaturedBody                   string
	LatestLabel, ReadLatest, BrowseTopics                        string
	ExplainLabel, MoreTitle, MoreBody                            string
	NewsletterKicker, NewsletterTitle, NewsletterBody, Subscribe string
	Topics                                                       []string
	FallbackTitles                                               []string
	FallbackBodies                                               []string
}

type publicFormField struct {
	Key, Type, Label, Placeholder, HelpText string
	Options                                 []string
	Required                                bool
}

type publicFormData struct {
	ID             int64
	Key            string
	Action         string
	SubmitLabel    string
	SuccessMessage string
	CSRFToken      string
	Fields         []publicFormField
}

type publicSitePageData struct {
	SiteName           string
	MarketCode         string
	SiteCode           string
	CanonicalURL       string
	RedirectURL        string
	Preview            bool
	Maintenance        bool
	NotFound           bool
	IsHome             bool
	IsProductSourcing  bool
	IsServiceTopic     bool
	IsIndustrySolution bool
	IsGuideIndex       bool
	IsTaxonomy         bool
	TaxonomyKind       string
	TaxonomyName       string
	HasContent         bool
	BasePath           string
	HomePath           string
	GuideIndexPath     string
	// CurrentPath is the public route currently being rendered (including the
	// locale and preview prefixes when applicable). It is separate from
	// CanonicalURL because previews suppress canonical links while JSON-LD
	// should still identify the actual page URL.
	CurrentPath string
	// PublicOrigin is the request origin used when a route is rendered without
	// an explicit canonical URL (notably local site ports). It keeps JSON-LD
	// resource and entity URLs absolute while canonical tags remain suppressed
	// for noindex previews.
	PublicOrigin     string
	Locale           string
	LanguageCode     string
	LanguageName     string
	Direction        string
	PageTitle        string
	MetaDescription  string
	OGTitle          string
	OGDescription    string
	SocialImageURL   string
	RobotsIndex      bool
	Copy             publicCopy
	ProductSourcing  publicProductSourcingCopy
	Languages        []publicLanguageData
	Hreflangs        []publicHreflang
	Published        []publicContentData
	Related          []publicContentData
	Content          publicContentData
	ServiceTopic     publicServiceTopicCopy
	IndustrySolution publicIndustrySolutionCopy
	GuideIndex       publicGuideIndexCopy
	StructuredData   template.JS
	ThemeID          int64
	ThemeName        string
	ThemeVersion     string
	ThemeKey         string
	ThemeColor       string
	FaviconURL       string
	Form             *publicFormData
}

func New(deps Dependencies) http.Handler {
	s := &server{
		Dependencies:       deps,
		loginIPLimiter:     security.NewLimiter(20, 10*time.Minute, 10, 10_000),
		loginUserLimiter:   security.NewLimiter(10, 15*time.Minute, 5, 50_000),
		mediaImportLimiter: security.NewLimiter(120, time.Hour, 30, 10_000),
		remoteMediaClient:  newRemoteMediaClient(),
		trustedProxies:     parseTrustedProxies(deps.Config.TrustedProxies),
	}
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.Recoverer)
	r.Use(s.requestTimeout)
	r.Use(s.securityHeaders)
	r.Use(s.accessLog)

	r.Get("/", s.root)
	// Machine-readable files need dedicated handlers before the generic preview
	// renderer, otherwise sitemap.xml would be treated as a content slug.
	r.Get("/preview/{siteCode}/sitemap.xml", s.siteSitemapPreview)
	r.Get("/preview/{siteCode}/robots.txt", s.siteRobotsPreview)
	r.Get("/preview/{siteCode}/llms.txt", s.siteLLMSPreview)
	r.Get("/preview/{siteCode}/rss.xml", s.siteRSSPreview)
	r.Get("/preview/{siteCode}/atom.xml", s.siteAtomPreview)
	r.Get("/preview/{siteCode}", s.sitePreview)
	r.Get("/preview/{siteCode}/*", s.sitePreview)
	r.Post("/preview/{siteCode}/forms/{formKey}/submit", s.submitPublicForm)
	r.Get("/setup", s.setupPage)
	r.Post("/setup", s.setupSubmit)
	r.Get("/login", s.loginPage)
	r.Post("/login", s.loginSubmit)
	r.Handle("/assets/*", s.staticAssets())
	r.Get("/healthz", s.health)

	r.Group(func(protected chi.Router) {
		protected.Use(s.requireSession)
		protected.Get("/admin", s.admin)
		protected.With(s.requirePermission("templates.manage")).Get("/admin/template-preview/{themeID}/{siteCode}/{locale}", s.templatePreview)
		protected.With(s.requirePermission("content.read")).Get("/admin/content-preview/{contentID}/{siteID}/{locale}", s.contentPreview)
		protected.Get("/admin/*", s.admin)
		protected.Post("/logout", s.logout)
		protected.Get("/account/mfa", s.mfaPage)
		protected.Post("/account/mfa/start", s.mfaStart)
		protected.Post("/account/mfa", s.mfaSubmit)

		protected.Route("/api/v1", func(api chi.Router) {
			api.Get("/auth/me", s.me)
			api.With(s.requirePermission("dashboard.view")).Get("/sites", s.listSites)
			api.With(s.requirePermission("dashboard.view")).Get("/sites/{siteID}/languages", s.listSiteLanguages)
			api.With(s.requirePermission("dashboard.view")).Get("/sites/{siteID}/domains", s.listSiteDomains)
			api.With(s.requirePermission("sites.manage"), s.requireCSRF).Post("/sites", s.createSite)
			api.With(s.requirePermission("sites.manage"), s.requireCSRF).Put("/sites/{siteID}", s.updateSite)
			api.With(s.requirePermission("sites.manage"), s.requireCSRF).Delete("/sites/{siteID}", s.disableSite)
			api.With(s.requirePermission("sites.manage"), s.requireCSRF).Post("/sites/{siteID}/domains", s.createSiteDomain)
			api.With(s.requirePermission("sites.manage"), s.requireCSRF).Put("/sites/{siteID}/domains/{domainID}", s.updateSiteDomain)
			api.With(s.requirePermission("sites.manage"), s.requireCSRF).Delete("/sites/{siteID}/domains/{domainID}", s.deleteSiteDomain)
			api.With(s.requirePermission("sites.manage"), s.requireCSRF).Post("/sites/{siteID}/domains/{domainID}/check", s.checkSiteDomain)
			api.With(s.requirePermission("dashboard.view")).Get("/languages", s.listLanguages)
			api.With(s.requirePermission("languages.manage"), s.requireCSRF).Post("/languages", s.createLanguage)
			api.With(s.requirePermission("languages.manage"), s.requireCSRF).Put("/languages/{languageID}", s.updateLanguage)
			api.With(s.requirePermission("languages.manage"), s.requireCSRF).Delete("/languages/{languageID}", s.disableLanguage)
			api.With(s.requirePermission("sites.manage"), s.requirePermission("languages.manage"), s.requirePermission("templates.manage"), s.requireCSRF).Put("/sites/{siteID}/languages/{languageID}", s.bindSiteLanguage)
			api.With(s.requirePermission("content.read")).Get("/contents", s.listContents)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Post("/contents", s.createContent)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Post("/contents/{contentID}/locales", s.createContentLocale)
			api.With(s.requirePermission("content.read"), s.requirePermission("seo.manage")).Get("/contents/{contentID}/localization-options", s.contentLocalizationOptions)
			api.With(s.requirePermission("content.write"), s.requirePermission("seo.manage"), s.requireCSRF).Post("/contents/{contentID}/localize", s.localizeContent)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Post("/contents/bulk-update", s.bulkUpdateContentLocales)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Post("/contents/bulk-delete", s.bulkDeleteContents)
			api.With(s.requirePermission("content.read")).Get("/contents/{contentID}/locales/{locale}", s.getContentLocale)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Put("/contents/{contentID}/locales/{locale}", s.updateContentLocale)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Delete("/contents/{contentID}", s.deleteContent)
			api.With(s.requirePermission("content.read")).Get("/contents/{contentID}/revisions", s.listContentRevisions)
			api.With(s.requirePermission("content.read")).Get("/metafields", s.listMetafieldDefinitions)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Post("/metafields", s.createMetafieldDefinition)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Put("/metafields/{definitionID}", s.updateMetafieldDefinition)
			api.With(s.requirePermission("content.read")).Get("/metafields/values/{ownerID}", s.listMetafieldValues)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Post("/metafields/values", s.upsertMetafieldValue)
			api.With(s.requirePermission("content.read")).Get("/forms", s.listForms)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Post("/forms", s.createForm)
			api.With(s.requirePermission("content.read")).Get("/forms/submissions", s.listFormSubmissions)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Put("/forms/submissions/{submissionID}", s.updateFormSubmissionStatus)
			api.With(s.requirePermission("content.read")).Get("/forms/{formID}", s.getForm)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Put("/forms/{formID}", s.updateForm)
			api.With(s.requirePermission("content.read")).Get("/content-locales/{contentLocaleID}/form", s.getPageForm)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Put("/content-locales/{contentLocaleID}/form", s.bindPageForm)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Post("/contents/{contentID}/revisions/{revisionID}/restore", s.restoreContentRevision)
			api.With(s.requirePermission("content.read")).Get("/taxonomy/terms", s.listTaxonomyTerms)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Post("/taxonomy/terms", s.createTaxonomyTerm)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Put("/taxonomy/terms/{termID}", s.updateTaxonomyTerm)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Delete("/taxonomy/terms/{termID}", s.disableTaxonomyTerm)
			api.With(s.requirePermission("publishing.manage")).Get("/urls/redirects", s.listURLRedirects)
			api.With(s.requirePermission("publishing.manage"), s.requireCSRF).Post("/urls/redirects", s.createURLRedirect)
			api.With(s.requirePermission("publishing.manage"), s.requireCSRF).Put("/urls/redirects/{redirectID}", s.updateURLRedirect)
			api.With(s.requirePermission("publishing.manage"), s.requireCSRF).Delete("/urls/redirects/{redirectID}", s.deleteURLRedirect)
			api.With(s.requirePermission("templates.manage")).Get("/templates", s.listThemePackages)
			api.With(s.requirePermission("templates.manage")).Get("/templates/{themeID}/files", s.listThemeFiles)
			api.With(s.requirePermission("templates.manage")).Get("/templates/{themeID}/assets", s.listThemeAssets)
			api.With(s.requirePermission("templates.manage"), s.requireCSRF).Post("/templates/{themeID}/files/{fileKey}/validate", s.validateThemeFile)
			api.With(s.requirePermission("templates.manage"), s.requireCSRF).Put("/templates/{themeID}/files/{fileKey}", s.updateThemeFile)
			api.With(s.requirePermission("templates.manage"), s.requireCSRF).Post("/templates/{themeID}/assets/{assetKey}/validate", s.validateThemeAsset)
			api.With(s.requirePermission("templates.manage"), s.requireCSRF).Put("/templates/{themeID}/assets/{assetKey}", s.updateThemeAsset)
			api.With(s.requirePermission("publishing.manage")).Get("/publishing/releases", s.listPublishingReleases)
			api.With(s.requirePermission("publishing.manage"), s.requireCSRF).Post("/publishing/releases", s.createPublishingRelease)
			api.With(s.requireCSRF).Post("/auth/mfa/disable", s.mfaDisable)
			api.With(s.requirePermission("system.view")).Get("/system/status", s.status)
			api.With(s.requirePermission("system.view")).Get("/system/ai", s.aiConfiguration)
			api.With(s.requirePermission("system.manage"), s.requireCSRF).Post("/system/ai/providers", s.aiProviderCreate)
			api.With(s.requirePermission("system.manage"), s.requireCSRF).Put("/system/ai/providers/{providerID}", s.aiProviderUpdate)
			api.With(s.requirePermission("system.manage"), s.requireCSRF).Delete("/system/ai/providers/{providerID}", s.aiProviderDelete)
			api.With(s.requirePermission("system.manage"), s.requireCSRF).Post("/system/ai/providers/{providerID}/test", s.aiProviderTest)
			api.With(s.requirePermission("system.manage"), s.requireCSRF).Put("/system/ai/routes/{featureKey}", s.aiFeatureRouteUpdate)
			api.With(s.requirePermission("audit.read")).Get("/audit", s.auditList)
			api.With(s.requirePermission("analytics.view")).Get("/analytics/overview", s.analyticsOverview)
			api.With(s.requirePermission("seo.manage")).Get("/seo/spider", s.spiderOverview)
			api.With(s.requirePermission("content.write"), s.requireCSRF).Post("/content/sanitize", s.sanitizeRichText)
			api.With(s.requirePermission("content.write"), s.requirePermission("seo.manage"), s.requireCSRF).Post("/content/seo-suggestions", s.suggestContentSEO)
			api.With(s.requirePermission("seo.manage")).Get("/seo/sitemaps", s.seoSitemaps)
			api.With(s.requirePermission("seo.manage")).Get("/seo/ai-content", s.seoAIContent)
			api.With(s.requirePermission("seo.manage")).Get("/seo/robots/{siteID}", s.getSiteRobotsSettings)
			api.With(s.requirePermission("seo.manage"), s.requireCSRF).Put("/seo/robots/{siteID}", s.updateSiteRobotsSettings)
			api.With(s.requirePermission("seo.manage")).Get("/localization/jobs", s.listLocalizationJobs)
			api.With(s.requirePermission("media.read")).Get("/media", s.mediaList)
			api.With(s.requirePermission("media.upload"), s.requireCSRF).Post("/media/upload", s.mediaUpload)
			api.With(s.requirePermission("media.upload"), s.requireCSRF).Post("/media/migrate-avif", s.mediaMigrateAVIF)
			api.With(s.requirePermission("media.upload"), s.requireCSRF).Post("/media/import", s.mediaImport)
			api.With(s.requirePermission("media.upload"), s.requireCSRF).Put("/media/{mediaID}", s.mediaUpdate)
			api.With(s.requirePermission("media.upload"), s.requireCSRF).Delete("/media/{mediaID}", s.mediaDelete)
			api.With(s.requirePermission("templates.manage"), s.requireCSRF).Post("/templates/create", s.createStarterTheme)
			api.With(s.requirePermission("templates.manage"), s.requireCSRF).Post("/templates/upload", s.themeUpload)
			api.With(s.requirePermission("backup.manage")).Get("/system/backups", s.backupList)
			api.With(s.requirePermission("backup.manage"), s.requireCSRF).Post("/system/backups", s.backupCreate)
			api.With(s.requirePermission("backup.manage"), s.requireCSRF).Post("/system/backups/import", s.backupImport)
			api.With(s.requirePermission("backup.manage"), s.requireCSRF).Post("/system/backups/bulk-delete", s.backupBulkDelete)
			api.With(s.requirePermission("backup.manage")).Get("/system/backups/{backupID}/download", s.backupDownload)
			api.With(s.requirePermission("backup.manage"), s.requireCSRF).Delete("/system/backups/{backupID}", s.backupDelete)
			api.With(s.requirePermission("users.manage")).Get("/security/users", s.listUsers)
			api.With(s.requirePermission("users.manage"), s.requireCSRF).Post("/security/users", s.createUser)
			api.With(s.requirePermission("users.manage")).Get("/security/roles", s.listRoles)
			api.With(s.requirePermission("users.manage"), s.requireCSRF).Put("/security/users/{userID}/access", s.updateAccess)
			api.With(s.requirePermission("users.manage"), s.requireCSRF).Post("/security/users/{userID}/unlock", s.unlockUser)
		})
	})
	// Media is immutable after validation and is intentionally served outside
	// the authenticated admin group so published pages can reference it.
	r.Get("/media/{mediaID}/{token}", s.mediaServe)
	r.Head("/media/{mediaID}/{token}", s.mediaServe)
	r.Get("/theme-assets/{themeID}/{assetKey}", s.serveThemeAsset)
	r.Post("/forms/{formKey}/submit", s.submitPublicForm)
	// Host-routed public pages (for example https://example.com/en/guides/..)
	// are handled last. Reserved application paths are rejected by
	// publicCatchAll even if a future router change makes this wildcard win.
	r.Get("/*", s.publicCatchAll)
	return r
}

// requestTimeout keeps ordinary HTTP requests bounded tightly while allowing a
// full AI localization run to use the provider's configured 120-second limit.
// The extra headroom covers response validation, sanitizing and transactional
// persistence after the upstream model has completed.
func (s *server) requestTimeout(next http.Handler) http.Handler {
	standard := middleware.Timeout(30 * time.Second)(next)
	localization := middleware.Timeout(130 * time.Second)(next)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if isLocalizationRequest(r) {
			localization.ServeHTTP(w, r)
			return
		}
		standard.ServeHTTP(w, r)
	})
}

func isLocalizationRequest(r *http.Request) bool {
	if r.Method != http.MethodPost {
		return false
	}
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	return len(parts) == 5 && parts[0] == "api" && parts[1] == "v1" && parts[2] == "contents" && parts[3] != "" && parts[4] == "localize"
}

func (s *server) root(w http.ResponseWriter, r *http.Request) {
	if s.tryPublicSite(w, r) {
		return
	}
	required, err := s.Auth.SetupRequired(r.Context())
	if err != nil {
		http.Error(w, "service unavailable", http.StatusServiceUnavailable)
		return
	}
	if required {
		http.Redirect(w, r, "/setup", http.StatusSeeOther)
		return
	}
	if _, err = s.sessionFromRequest(r); err == nil {
		http.Redirect(w, r, "/admin", http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, "/login", http.StatusSeeOther)
}

func (s *server) sitePreview(w http.ResponseWriter, r *http.Request) {
	site, err := s.Catalog.SiteByCode(r.Context(), chi.URLParam(r, "siteCode"))
	if errors.Is(err, catalog.ErrNotFound) {
		http.NotFound(w, r)
		return
	}
	if err != nil {
		http.Error(w, "service unavailable", http.StatusServiceUnavailable)
		return
	}
	prefix := "/preview/" + site.Code
	routePath := strings.TrimPrefix(r.URL.Path, prefix)
	routePath = strings.Trim(routePath, "/")
	s.renderPublicSite(w, r, site, true, "", routePath)
}

func (s *server) templatePreview(w http.ResponseWriter, r *http.Request) {
	themeID, err := strconv.ParseInt(chi.URLParam(r, "themeID"), 10, 64)
	if err != nil || themeID < 1 {
		http.NotFound(w, r)
		return
	}
	themePackage, err := s.Catalog.PublicThemeByID(r.Context(), themeID)
	if errors.Is(err, catalog.ErrNotFound) {
		http.NotFound(w, r)
		return
	}
	if err != nil {
		http.Error(w, "service unavailable", http.StatusServiceUnavailable)
		return
	}
	site, err := s.Catalog.SiteByCode(r.Context(), chi.URLParam(r, "siteCode"))
	if errors.Is(err, catalog.ErrNotFound) {
		http.NotFound(w, r)
		return
	}
	if err != nil {
		http.Error(w, "service unavailable", http.StatusServiceUnavailable)
		return
	}
	locale := strings.Trim(chi.URLParam(r, "locale"), "/")
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "templates.manage", site.ID, locale) {
		return
	}
	s.renderPublicSiteWithTheme(w, r, site, true, "", "", &themePackage)
}

// contentPreview renders any non-deleted content locale through its bound
// frontend theme without making drafts, review items or archived content
// publicly addressable. The route is session-, permission- and scope-protected.
func (s *server) contentPreview(w http.ResponseWriter, r *http.Request) {
	contentID, err := strconv.ParseInt(chi.URLParam(r, "contentID"), 10, 64)
	if err != nil || contentID < 1 {
		http.NotFound(w, r)
		return
	}
	siteID, err := strconv.ParseInt(chi.URLParam(r, "siteID"), 10, 64)
	if err != nil || siteID < 1 {
		http.NotFound(w, r)
		return
	}
	locale := strings.Trim(strings.TrimSpace(chi.URLParam(r, "locale")), "/")
	session := sessionFromContext(r.Context())
	if !s.canAccess(w, r, session.User.ID, "content.read", siteID, locale) {
		return
	}
	item, err := s.Catalog.GetContentLocale(r.Context(), contentID, siteID, locale)
	if errors.Is(err, catalog.ErrNotFound) {
		http.NotFound(w, r)
		return
	}
	if err != nil {
		http.Error(w, "service unavailable", http.StatusServiceUnavailable)
		return
	}
	site, err := s.Catalog.SiteByID(r.Context(), siteID)
	if errors.Is(err, catalog.ErrNotFound) {
		http.NotFound(w, r)
		return
	}
	if err != nil {
		http.Error(w, "service unavailable", http.StatusServiceUnavailable)
		return
	}
	data, status := s.publicPageData(r, site, true, "", "", nil)
	if status != http.StatusOK {
		http.Error(w, "frontend template unavailable", status)
		return
	}
	data.Maintenance = false
	s.applyPublicContentPage(r, &data, site, item)
	data.CanonicalURL = ""
	data.Hreflangs = nil
	data.RobotsIndex = false

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Robots-Tag", "noindex, nofollow")
	templateName := "public.html"
	if data.ThemeKey == "atlas-commerce" {
		templateName = "public-atlas.html"
	}
	if data.IsHome && data.ThemeKey != "atlas-commerce" && isFreightVantaReferenceLanguage(data.LanguageCode) {
		templateName = "public-reference.html"
	}
	if data.ThemeKey != "atlas-commerce" && strings.EqualFold(data.LanguageCode, "nl") && (data.IsHome || data.IsServiceTopic || data.IsIndustrySolution) {
		templateName = "public-nl.html"
	}
	if err = s.Template.ExecuteTemplate(w, templateName, data); err != nil {
		s.Logger.Error("渲染内容前台预览失败", "error", err, "content_id", contentID, "site_id", siteID, "locale", locale)
	}
}

func (s *server) tryPublicSite(w http.ResponseWriter, r *http.Request) bool {
	host := requestHostname(r.Host)
	if host == "" || host == "localhost" || strings.HasSuffix(host, ".localhost") || net.ParseIP(host) != nil {
		return false
	}
	site, domain, err := s.Catalog.SiteByHostname(r.Context(), host)
	if errors.Is(err, catalog.ErrNotFound) {
		return false
	}
	if err != nil {
		http.Error(w, "service unavailable", http.StatusServiceUnavailable)
		return true
	}
	if domain.Kind == "alias" && domain.RedirectToPrimary && site.PrimaryDomain != "" && !strings.EqualFold(host, site.PrimaryDomain) {
		target := "https://" + site.PrimaryDomain + r.URL.EscapedPath()
		if r.URL.RawQuery != "" {
			target += "?" + r.URL.RawQuery
		}
		http.Redirect(w, r, target, http.StatusPermanentRedirect)
		return true
	}
	// Every host-routed site receives its own machine-readable SEO files. These
	// checks run before public HTML routing so neither file can collide with an
	// editor-created slug.
	switch r.URL.Path {
	case "/sitemap.xml":
		s.renderSiteSitemap(w, r, site, false)
		return true
	case "/robots.txt":
		s.renderSiteRobots(w, r, site, false)
		return true
	case "/llms.txt":
		s.renderSiteLLMS(w, r, site, false)
		return true
	case "/rss.xml":
		s.renderSiteRSS(w, r, site, false)
		return true
	case "/atom.xml":
		s.renderSiteAtom(w, r, site, false)
		return true
	}
	scheme := "https"
	if !s.Config.PublicHTTPS {
		scheme = "http"
	}
	s.renderPublicSite(w, r, site, false, scheme+"://"+host+r.URL.EscapedPath(), strings.Trim(r.URL.Path, "/"))
	return true
}

func (s *server) publicCatchAll(w http.ResponseWriter, r *http.Request) {
	path := strings.Trim(r.URL.Path, "/")
	if path == "" || isReservedPublicPath(path) {
		http.NotFound(w, r)
		return
	}
	if !s.tryPublicSite(w, r) {
		http.NotFound(w, r)
	}
}

func isReservedPublicPath(path string) bool {
	first := strings.ToLower(strings.Split(path, "/")[0])
	switch first {
	case "admin", "api", "assets", "healthz", "login", "logout", "setup", "account", "media", "preview":
		return true
	default:
		return false
	}
}

func (s *server) renderPublicSite(w http.ResponseWriter, r *http.Request, site catalog.Site, preview bool, canonical, routePath string) {
	s.renderPublicSiteWithTheme(w, r, site, preview, canonical, routePath, nil)
}

func (s *server) renderPublicSiteWithTheme(w http.ResponseWriter, r *http.Request, site catalog.Site, preview bool, canonical, routePath string, themeOverride *catalog.ThemePackage) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if preview {
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("X-Robots-Tag", "noindex, nofollow")
	} else {
		w.Header().Set("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
	}
	maintenance := site.Status == "maintenance"
	if maintenance {
		w.Header().Set("Retry-After", "300")
	}
	data, status := s.publicPageData(r, site, preview, canonical, routePath, themeOverride)
	if data.RedirectURL != "" {
		target := data.RedirectURL
		if r.URL.RawQuery != "" {
			target += "?" + r.URL.RawQuery
		}
		s.trackSpiderRequest(r, site, preview, routePath, data, "页面跳转", http.StatusPermanentRedirect)
		http.Redirect(w, r, target, http.StatusPermanentRedirect)
		return
	}
	if maintenance {
		status = http.StatusServiceUnavailable
	}
	if !preview && !data.RobotsIndex {
		// Keep the HTTP-level signal in sync with the meta tag. This also covers
		// non-HTML consumers and makes the single-page noindex policy explicit.
		w.Header().Set("X-Robots-Tag", "noindex, follow")
	}
	if status != http.StatusOK && !maintenance && !data.NotFound {
		s.trackSpiderRequest(r, site, preview, routePath, data, "服务错误", status)
		if status == http.StatusNotFound {
			http.NotFound(w, r)
			return
		}
		http.Error(w, "service unavailable", status)
		return
	}
	if status != http.StatusOK {
		w.WriteHeader(status)
	}
	var analyticsVisit *analytics.Visit
	// A dedicated local site port (for example localhost:8081) is a useful
	// development stand-in for the site's real domain, so it intentionally
	// contributes to that site's report. The generic /preview/{site} routes and
	// authenticated template/content previews remain excluded.
	trackAnalytics := !preview || r.Header.Get("X-CZCMS-Local-Preview") == "1"
	if trackAnalytics && status == http.StatusOK && !data.NotFound {
		analyticsRequest := r
		if preview {
			// The local-port adapter forwards internally through /preview/{site}.
			// Store the public-looking path instead of that internal prefix.
			cloned := r.Clone(r.Context())
			clonedURL := *r.URL
			clonedURL.Path = "/" + strings.Trim(routePath, "/")
			clonedURL.RawPath = ""
			clonedURL.RawQuery = ""
			cloned.URL = &clonedURL
			analyticsRequest = cloned
		}
		analyticsVisit = s.Analytics.PrepareVisit(w, analyticsRequest, site.ID, data.Locale, data.PageTitle)
	}
	templateName := "public.html"
	if data.ThemeKey == "atlas-commerce" {
		templateName = "public-atlas.html"
	}
	if data.IsHome && data.ThemeKey != "atlas-commerce" && isFreightVantaReferenceLanguage(data.LanguageCode) {
		templateName = "public-reference.html"
	}
	if data.ThemeKey != "atlas-commerce" && strings.EqualFold(data.LanguageCode, "nl") && (data.IsHome || data.IsServiceTopic || data.IsIndustrySolution) {
		templateName = "public-nl.html"
	}
	if err := s.Template.ExecuteTemplate(w, templateName, data); err != nil {
		s.Logger.Error("渲染公开站点失败", "error", err, "request_id", middleware.GetReqID(r.Context()))
		return
	}
	s.Analytics.Track(analyticsVisit)
	s.trackSpiderRequest(r, site, preview, routePath, data, publicPageKind(data), status)
}

// trackSpiderRequest records only recognised crawler requests. A local site
// listener forwards to /preview/{site}/ internally, therefore the external
// routePath is restored before it is stored. Generic preview pages remain
// excluded so an administrator opening a preview never pollutes crawler data.
func (s *server) trackSpiderRequest(r *http.Request, site catalog.Site, preview bool, routePath string, data publicSitePageData, kind string, status int) {
	if s.Spider == nil || r == nil || (preview && r.Header.Get("X-CZCMS-Local-Preview") != "1") {
		return
	}
	// For a failed renderer publicPageData may be intentionally empty, so the
	// status must remain the authoritative content type in the crawler log.
	if status == http.StatusNotFound {
		kind = "404 页面"
	} else if status >= http.StatusInternalServerError {
		kind = "服务错误"
	}
	spiderRequest := r
	if preview {
		cloned := r.Clone(r.Context())
		clonedURL := *r.URL
		cleanPath := "/" + strings.Trim(routePath, "/")
		if cleanPath == "/" {
			cleanPath = "/"
		}
		clonedURL.Path = cleanPath
		clonedURL.RawPath = ""
		clonedURL.RawQuery = ""
		cloned.URL = &clonedURL
		spiderRequest = cloned
	}
	visit := s.Spider.Prepare(spiderRequest, site.ID, data.Locale, data.PageTitle, kind)
	s.Spider.Track(visit, status)
}

func publicPageKind(data publicSitePageData) string {
	if data.NotFound {
		return "404 页面"
	}
	if data.IsProductSourcing {
		return "产品采购专题页"
	}
	if data.IsServiceTopic {
		return "国际物流服务专题页"
	}
	if data.IsIndustrySolution {
		return "跨境电商行业方案页"
	}
	if data.IsGuideIndex {
		return "文章栏目页"
	}
	if data.IsHome {
		return "首页"
	}
	if data.IsTaxonomy {
		if data.TaxonomyKind == "tag" {
			return "标签归档"
		}
		return "栏目归档"
	}
	if data.Content.ContentType == "page" {
		return "单页面"
	}
	if data.Content.ContentType == "product" {
		return "产品"
	}
	return "文章"
}

func (s *server) publicPageData(r *http.Request, site catalog.Site, preview bool, canonical, routePath string, themeOverride *catalog.ThemePackage) (publicSitePageData, int) {
	languages, err := s.Catalog.PublicSiteLanguages(r.Context(), site.ID)
	if err != nil {
		return publicSitePageData{}, http.StatusServiceUnavailable
	}
	if len(languages) == 0 {
		return publicSitePageData{}, http.StatusNotFound
	}
	basePath := ""
	if preview && r.Header.Get("X-CZCMS-Local-Preview") != "1" {
		basePath = "/preview/" + site.Code
	}
	locale, slug, ok := resolvePublicLocale(routePath, languages)
	if !ok {
		return publicSitePageData{}, http.StatusNotFound
	}
	if len(languages) == 1 {
		if cleanSlug, prefixed := trimPublicLocalePrefix(routePath, languages); prefixed {
			return publicSitePageData{RedirectURL: publicURL(basePath, "", cleanSlug)}, http.StatusPermanentRedirect
		}
	}
	lang := languages[0]
	for _, candidate := range languages {
		if strings.EqualFold(candidate.Locale, locale) {
			lang = candidate
			locale = candidate.Locale
			break
		}
	}
	var themePackage catalog.ThemePackage
	if themeOverride != nil {
		themePackage = *themeOverride
	} else {
		if lang.ThemePackageID == nil {
			return publicSitePageData{}, http.StatusServiceUnavailable
		}
		themePackage, err = s.Catalog.PublicThemeByID(r.Context(), *lang.ThemePackageID)
		if errors.Is(err, catalog.ErrNotFound) {
			return publicSitePageData{}, http.StatusServiceUnavailable
		}
		if err != nil {
			return publicSitePageData{}, http.StatusServiceUnavailable
		}
	}
	network, err := s.Catalog.PublicLanguageSites(r.Context())
	if err != nil {
		return publicSitePageData{}, http.StatusServiceUnavailable
	}
	copy := publicCopyFor(locale)
	defaultDescription := firstNonEmpty(site.SEODescription, copy.HeroBody)
	includeLocale := len(languages) > 1
	publicOrigin := publicSchemaOrigin(canonical)
	if publicOrigin == "" && r != nil && (preview || r.Header.Get("X-CZCMS-Local-Preview") == "1") {
		// Dedicated local ports are deliberately noindex, but their HTML should
		// still be useful in browser tooling and schema validators. The adapter
		// only sets this marker on requests it forwards from a configured port.
		host := strings.TrimSpace(r.Host)
		if host != "" && !strings.ContainsAny(host, "\r\n@/") {
			scheme := "https"
			if !s.Config.PublicHTTPS {
				scheme = "http"
			}
			publicOrigin = scheme + "://" + host
		}
	}
	data := publicSitePageData{
		SiteName: site.Name, MarketCode: site.MarketCode, SiteCode: site.Code, CanonicalURL: canonical,
		Preview: preview, Maintenance: site.Status == "maintenance", IsHome: slug == "", BasePath: basePath,
		CurrentPath:    publicURL(basePath, localeIf(includeLocale, locale), slug),
		HomePath:       publicURL(basePath, localeIf(includeLocale, locale), ""),
		GuideIndexPath: publicURL(basePath, localeIf(includeLocale, locale), "guides"),
		PublicOrigin:   publicOrigin,
		Locale:         locale, LanguageCode: lang.LanguageCode, LanguageName: lang.NativeName, Direction: lang.Direction, Copy: copy,
		PageTitle: firstNonEmpty(site.SEOTitle, copy.HeroTitle), MetaDescription: defaultDescription, OGTitle: firstNonEmpty(site.SEOTitle, copy.HeroTitle), OGDescription: defaultDescription, RobotsIndex: true,
		ThemeID: themePackage.ID, ThemeName: themePackage.Name, ThemeVersion: themePackage.Version, ThemeKey: themePackage.RenderKey, ThemeColor: publicThemeColor(themePackage.RenderKey),
		FaviconURL: site.FaviconURL,
	}
	if slug != "" {
		if slug == productSourcingSlug || strings.EqualFold(strings.Trim(slug, "/"), "ProductService/Sourcing") {
			s.configureProductSourcingPage(r, &data, site, preview, network)
			return data, http.StatusOK
		}
		if strings.EqualFold(strings.Trim(slug, "/"), "guides") || strings.EqualFold(strings.Trim(slug, "/"), "articles") || strings.EqualFold(strings.Trim(slug, "/"), "insights") {
			items, listErr := s.Catalog.ListPublishedContent(r.Context(), site.ID, locale, 48)
			if listErr != nil && !errors.Is(listErr, catalog.ErrNotFound) {
				return publicSitePageData{}, http.StatusServiceUnavailable
			}
			data.IsHome = false
			data.IsGuideIndex = true
			data.GuideIndex = guideIndexCopyFor(locale)
			data.PageTitle = data.GuideIndex.Title + " | " + site.Name
			data.MetaDescription = data.GuideIndex.Body
			data.OGTitle = data.PageTitle
			data.OGDescription = data.MetaDescription
			data.HasContent = len(items) > 0
			data.Published = data.Published[:0]
			for _, item := range items {
				data.Published = append(data.Published, publicContent(item, publicURL(basePath, localeIf(includeLocale, locale), item.Slug)))
			}
			s.populatePublicNetworkForFixedPath(r, &data, site, preview, network, "guides")
			if preview {
				data.CanonicalURL = ""
			}
			data.StructuredData = template.JS(publicJSONLD(data, site))
			return data, http.StatusOK
		}
		if industrySolution, ok := industrySolutionCopyForSlug(slug); ok {
			s.configureIndustrySolutionPage(&data, site, preview, industrySolution)
			s.populatePublicNetworkForFixedPath(r, &data, site, preview, network, industrySolution.Slug)
			return data, http.StatusOK
		}
		if copy, ok := serviceTopicCopyForSlug(slug); ok {
			s.configureServiceTopicPage(r, &data, site, preview, network, copy)
			return data, http.StatusOK
		}
		content, contentErr := s.Catalog.GetPublishedContentByPath(r.Context(), site.ID, locale, slug)
		if errors.Is(contentErr, catalog.ErrNotFound) {
			if taxonomyKind, taxonomySlug, taxonomyOK := parsePublicTaxonomyPath(slug); taxonomyOK {
				archive, archiveErr := s.Catalog.GetPublicTaxonomyArchive(r.Context(), site.ID, locale, taxonomyKind, taxonomySlug, 48)
				if archiveErr == nil {
					data.IsTaxonomy = true
					data.TaxonomyKind = archive.Kind
					data.TaxonomyName = archive.Name
					data.HasContent = len(archive.Contents) > 0
					data.PageTitle = archive.Name + " | " + site.Name
					data.MetaDescription = archive.Name + " · " + copy.GuidesBody
					data.OGTitle = data.PageTitle
					data.OGDescription = data.MetaDescription
					data.RobotsIndex = true
					for _, item := range archive.Contents {
						data.Published = append(data.Published, publicContent(item, publicURL(basePath, localeIf(includeLocale, locale), item.Slug)))
					}
					// Taxonomy archives are language-local listing pages. Do not emit
					// unrelated home-page hreflang links when an equivalent archive is
					// not available in another locale.
					data.Hreflangs = []publicHreflang{{Locale: locale, URL: publicURL(basePath, localeIf(includeLocale, locale), slug)}}
					if preview {
						data.CanonicalURL = ""
					}
					data.StructuredData = template.JS(publicJSONLD(data, site))
					return data, http.StatusOK
				}
				if !errors.Is(archiveErr, catalog.ErrNotFound) {
					return publicSitePageData{}, http.StatusServiceUnavailable
				}
			}
			data.IsHome = false
			data.NotFound = true
			data.RobotsIndex = false
			data.PageTitle = copy.NotFoundTitle
			data.MetaDescription = copy.NotFoundBody
			data.OGTitle = copy.NotFoundTitle
			data.OGDescription = copy.NotFoundBody
			data.CanonicalURL = ""
			data.Hreflangs = nil
			data.StructuredData = template.JS(publicJSONLD(data, site))
			return data, http.StatusNotFound
		}
		if contentErr != nil {
			return publicSitePageData{}, http.StatusServiceUnavailable
		}
		if !preview && content.CanonicalURL != "" {
			data.CanonicalURL = content.CanonicalURL
		}
		s.applyPublicContentPage(r, &data, site, content)
		if content.ContentType == "page" && content.PageLayout == "contact" {
			if form, formErr := s.Catalog.GetPageForm(r.Context(), content.ID); formErr == nil && form.Status == "active" {
				publicForm := &publicFormData{ID: form.ID, Key: form.Key, Action: strings.TrimSuffix(data.BasePath, "/") + "/forms/" + url.PathEscape(form.Key) + "/submit", SubmitLabel: form.SubmitLabel, SuccessMessage: form.SuccessMessage, CSRFToken: publicFormToken(s, form.ID, site.ID)}
				for _, field := range form.Fields {
					publicForm.Fields = append(publicForm.Fields, publicFormField{Key: field.Key, Type: field.Type, Label: field.Label, Placeholder: field.Placeholder, HelpText: field.HelpText, Options: field.Options, Required: field.Required})
				}
				data.Form = publicForm
			}
		}
		alternates, alternateErr := s.Catalog.PublishedContentAlternates(r.Context(), content.ContentID)
		if alternateErr != nil {
			return publicSitePageData{}, http.StatusServiceUnavailable
		}
		s.populatePublicNetwork(r, &data, site, preview, network, alternates)
	} else {
		items, listErr := s.Catalog.ListPublishedContent(r.Context(), site.ID, locale, 6)
		if listErr != nil && !errors.Is(listErr, catalog.ErrNotFound) {
			return publicSitePageData{}, http.StatusServiceUnavailable
		}
		for _, item := range items {
			data.Published = append(data.Published, publicContent(item, publicURL(basePath, localeIf(includeLocale, locale), item.Slug)))
		}
		data.HasContent = len(data.Published) > 0
		s.populatePublicNetwork(r, &data, site, preview, network, nil)
	}
	if preview {
		data.CanonicalURL = ""
	}
	if data.StructuredData == "" {
		data.StructuredData = template.JS(publicJSONLD(data, site))
	}
	return data, http.StatusOK
}

func (s *server) populatePublicNetwork(r *http.Request, data *publicSitePageData, current catalog.Site, preview bool, network []catalog.PublicLanguageSite, alternates []catalog.PublishedContentAlternate) {
	alternateURLs := make(map[string]string, len(alternates))
	for _, alternate := range alternates {
		key := fmt.Sprintf("%d:%s", alternate.SiteID, strings.ToLower(alternate.Locale))
		alternateURLs[key] = alternate.Slug
	}

	data.Languages = data.Languages[:0]
	data.Hreflangs = data.Hreflangs[:0]
	var defaultURL string
	for _, language := range network {
		key := fmt.Sprintf("%d:%s", language.SiteID, strings.ToLower(language.Locale))
		slug := ""
		if alternateSlug, exists := alternateURLs[key]; exists {
			slug = alternateSlug
		}
		languageURL := s.publicLanguageSiteURL(r, current, preview, language, slug)
		if languageURL == "" {
			continue
		}
		data.Languages = append(data.Languages, publicLanguageData{
			Code: language.LanguageCode, Locale: language.Locale, Name: language.LanguageName, NativeName: language.NativeName, URL: languageURL,
		})
		if alternates == nil {
			data.Hreflangs = append(data.Hreflangs, publicHreflang{Locale: language.Locale, URL: languageURL})
		} else if _, exists := alternateURLs[key]; exists {
			data.Hreflangs = append(data.Hreflangs, publicHreflang{Locale: language.Locale, URL: languageURL})
		}
		if strings.EqualFold(language.LanguageCode, "en") {
			if alternates == nil {
				defaultURL = languageURL
			} else if _, exists := alternateURLs[key]; exists {
				defaultURL = languageURL
			}
		}
	}
	if defaultURL != "" {
		data.Hreflangs = append(data.Hreflangs, publicHreflang{Locale: "x-default", URL: defaultURL})
	}
}

func (s *server) publicLanguageSiteURL(r *http.Request, current catalog.Site, preview bool, language catalog.PublicLanguageSite, slug string) string {
	path := publicURL("", localeIf(language.LanguageCount > 1, language.Locale), slug)
	if r.Header.Get("X-CZCMS-Local-Preview") == "1" {
		if language.LocalPort < 1 {
			return ""
		}
		return fmt.Sprintf("http://localhost:%d%s", language.LocalPort, path)
	}
	if preview {
		return publicURL("/preview/"+language.SiteCode, localeIf(language.LanguageCount > 1, language.Locale), slug)
	}
	host := language.PrimaryDomain
	if language.SiteID == current.ID {
		host = requestHostname(r.Host)
	}
	if host == "" {
		return ""
	}
	scheme := "https"
	if !s.Config.PublicHTTPS {
		scheme = "http"
	}
	return scheme + "://" + host + path
}

func (s *server) applyPublicContentPage(r *http.Request, data *publicSitePageData, site catalog.Site, content catalog.ContentLocale) {
	data.IsHome = false
	data.NotFound = false
	data.HasContent = true
	data.Content = publicContent(content, publicURL(data.BasePath, localeIf(site.LanguageCount > 1, content.Locale), content.Slug))
	data.PageTitle = firstNonEmpty(content.SEOTitle, content.Title, site.SEOTitle, data.Copy.HeroTitle)
	data.MetaDescription = firstNonEmpty(content.MetaDescription, content.Summary, data.Copy.HeroBody)
	data.OGTitle = firstNonEmpty(content.OGTitle, data.PageTitle)
	data.OGDescription = firstNonEmpty(content.OGDescription, data.MetaDescription)
	data.SocialImageURL = publicSchemaAbsoluteURL(publicSchemaURL(*data), content.CoverURL)
	// Respect the page-level SEO policy. Contact / legal utility pages default
	// to noindex, while about, service and campaign pages can be crawlable.
	data.RobotsIndex = content.RobotsIndex && (content.ContentType != "page" || content.IndexPolicy == "index")
	data.StructuredData = template.JS(safeStructuredData(content.StructuredData, publicJSONLD(*data, site)))

	items, err := s.Catalog.ListPublishedContent(r.Context(), site.ID, content.Locale, 8)
	if err != nil && !errors.Is(err, catalog.ErrNotFound) {
		s.Logger.Warn("读取文章相关推荐失败", "error", err, "site_id", site.ID, "locale", content.Locale)
		return
	}
	data.Related = data.Related[:0]
	for _, item := range items {
		if item.ContentID == content.ContentID {
			continue
		}
		data.Related = append(data.Related, publicContent(item, publicURL(data.BasePath, localeIf(site.LanguageCount > 1, item.Locale), item.Slug)))
		if len(data.Related) == 3 {
			break
		}
	}
}

func publicThemeColor(renderKey string) string {
	if renderKey == "atlas-commerce" {
		return "#0f766e"
	}
	return "#0757c7"
}

func publicContent(item catalog.ContentLocale, contentURL string) publicContentData {
	return publicContentData{ID: item.ID, ContentID: item.ContentID, ContentType: item.ContentType, Title: item.Title, H1: firstNonEmpty(item.H1, item.Title), Summary: item.Summary, Slug: item.Slug, Category: item.Category, Locale: item.Locale, LanguageName: item.LanguageName, SEOTitle: item.SEOTitle, MetaDescription: item.MetaDescription, OGTitle: item.OGTitle, OGDescription: item.OGDescription, OwnerName: item.OwnerName, CoverURL: item.CoverURL, CoverWidth: item.CoverWidth, CoverHeight: item.CoverHeight, URL: contentURL, UpdatedAt: publicDate(item.UpdatedAt), PublishedAt: publicDate(derefString(item.PublishedAt)), Status: item.Status, ReadingMinutes: estimateReadingMinutes(item.BodyHTML), PageLayout: item.PageLayout, Tags: append([]string(nil), item.Tags...), Gallery: append([]catalog.GalleryMedia(nil), item.Gallery...), Body: template.HTML(item.BodyHTML)}
}

func estimateReadingMinutes(bodyHTML string) int {
	plain := html.UnescapeString(stripPublicHTML(bodyHTML))
	units := 0
	inWord := false
	for _, r := range plain {
		if unicode.In(r, unicode.Han, unicode.Hiragana, unicode.Katakana, unicode.Hangul) {
			units++
			inWord = false
			continue
		}
		if unicode.IsLetter(r) || unicode.IsNumber(r) {
			if !inWord {
				units++
			}
			inWord = true
			continue
		}
		inWord = false
	}
	if units < 1 {
		return 1
	}
	minutes := (units + 219) / 220
	if minutes < 1 {
		return 1
	}
	return minutes
}

func stripPublicHTML(input string) string {
	var output strings.Builder
	output.Grow(len(input))
	inTag := false
	for _, r := range input {
		switch r {
		case '<':
			inTag = true
			output.WriteByte(' ')
		case '>':
			inTag = false
			output.WriteByte(' ')
		default:
			if !inTag {
				output.WriteRune(r)
			}
		}
	}
	return output.String()
}

func derefString(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func publicDate(value string) string {
	parsed, err := time.Parse(time.RFC3339Nano, value)
	if err != nil {
		parsed, err = time.Parse(time.RFC3339, value)
	}
	if err != nil {
		return value
	}
	return parsed.Format("2006-01-02")
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}

func resolvePublicLocale(route string, languages []catalog.SiteLanguage) (string, string, bool) {
	route = strings.Trim(strings.TrimSpace(route), "/")
	if route == "" {
		return languages[0].Locale, "", true
	}
	if len(languages) == 1 {
		return languages[0].Locale, route, true
	}
	parts := strings.Split(route, "/")
	for _, language := range languages {
		if strings.EqualFold(parts[0], language.Locale) || strings.EqualFold(parts[0], language.LanguageCode) {
			slug := strings.Join(parts[1:], "/")
			return language.Locale, strings.Trim(slug, "/"), true
		}
	}
	// Locale-less URLs are accepted for the default language, which keeps
	// existing single-language slugs working while /{locale}/... remains the
	// canonical multilingual form.
	return languages[0].Locale, route, true
}

func parsePublicTaxonomyPath(slug string) (kind, termSlug string, ok bool) {
	parts := strings.SplitN(strings.Trim(strings.TrimSpace(slug), "/"), "/", 2)
	if len(parts) != 2 || strings.TrimSpace(parts[1]) == "" {
		return "", "", false
	}
	switch strings.ToLower(parts[0]) {
	case "categories", "category":
		kind = "category"
	case "tags", "tag":
		kind = "tag"
	default:
		return "", "", false
	}
	termSlug = strings.Trim(strings.ToLower(parts[1]), "/")
	if termSlug == "" || strings.Contains(termSlug, "//") {
		return "", "", false
	}
	return kind, termSlug, true
}

func trimPublicLocalePrefix(route string, languages []catalog.SiteLanguage) (string, bool) {
	if len(languages) != 1 {
		return "", false
	}
	route = strings.Trim(strings.TrimSpace(route), "/")
	if route == "" {
		return "", false
	}
	parts := strings.Split(route, "/")
	if !strings.EqualFold(parts[0], languages[0].Locale) && !strings.EqualFold(parts[0], languages[0].LanguageCode) {
		return "", false
	}
	return strings.Join(parts[1:], "/"), true
}

func localeIf(include bool, locale string) string {
	if include {
		return locale
	}
	return ""
}

func publicURL(basePath, locale, slug string) string {
	parts := make([]string, 0, 3)
	if base := strings.Trim(basePath, "/"); base != "" {
		parts = append(parts, base)
	}
	if locale = strings.Trim(locale, "/"); locale != "" {
		parts = append(parts, locale)
	}
	if slug = strings.Trim(slug, "/"); slug != "" {
		parts = append(parts, slug)
	}
	if len(parts) == 0 {
		return "/"
	}
	return "/" + strings.Join(parts, "/")
}

func absolutePublicURL(currentCanonical, path string) string {
	if currentCanonical == "" {
		return path
	}
	parsed, err := url.Parse(currentCanonical)
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return path
	}
	return parsed.Scheme + "://" + parsed.Host + path
}

var structuredDataScriptPatternHTTP = regexp.MustCompile(`(?is)^<script\b[^>]*\btype\s*=\s*["']application/ld\+json["'][^>]*>(.*?)</script>\s*$`)

func publicSchemaURL(data publicSitePageData) string {
	var candidate string
	if data.IsTaxonomy || data.NotFound {
		candidate = firstNonEmpty(data.CanonicalURL, data.CurrentPath, data.HomePath)
	} else if data.IsProductSourcing || data.IsServiceTopic || data.IsIndustrySolution {
		candidate = firstNonEmpty(data.CanonicalURL, data.CurrentPath, data.HomePath)
	} else if data.HasContent && !data.IsHome {
		candidate = firstNonEmpty(data.CanonicalURL, data.Content.URL)
	} else {
		candidate = firstNonEmpty(data.CanonicalURL, data.HomePath)
	}
	return publicSchemaAbsoluteURL(data.PublicOrigin, candidate)
}

func publicSchemaEntityID(pageURL, fragment string) string {
	pageURL = strings.TrimSpace(pageURL)
	fragment = strings.Trim(strings.TrimSpace(fragment), "#")
	if pageURL == "" || fragment == "" {
		return ""
	}
	return pageURL + "#" + fragment
}

func publicSchemaOrigin(pageURL string) string {
	parsed, err := url.Parse(strings.TrimSpace(pageURL))
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return ""
	}
	return parsed.Scheme + "://" + parsed.Host
}

func publicSchemaAbsoluteURL(baseURL, value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	parsed, err := url.Parse(value)
	if err == nil && parsed.Scheme != "" && parsed.Host != "" {
		return value
	}
	origin := publicSchemaOrigin(baseURL)
	if origin != "" && strings.HasPrefix(value, "/") {
		return origin + value
	}
	return value
}

func publicSchemaOrganization(site catalog.Site, pageURL string) map[string]any {
	organization := map[string]any{"@type": "Organization", "@id": publicSchemaOrigin(pageURL) + "/#organization", "name": site.Name}
	if organization["@id"] == "/#organization" {
		organization["@id"] = "#organization"
	}
	if origin := publicSchemaOrigin(pageURL); origin != "" {
		organization["url"] = origin + "/"
	}
	if description := strings.TrimSpace(site.SEODescription); description != "" {
		organization["description"] = description
	}
	if logo := publicSchemaAbsoluteURL(pageURL, site.FaviconURL); logo != "" {
		// The site Icon is the only verified, public image currently available
		// on the Site model. Keep it as an ImageObject so a larger uploaded mark
		// can be used by Google without inventing a second logo URL.
		organization["logo"] = map[string]any{"@type": "ImageObject", "url": logo}
		organization["image"] = logo
	}
	return organization
}

func publicSchemaWebsite(site catalog.Site, pageURL string, organization map[string]any) map[string]any {
	origin := publicSchemaOrigin(pageURL)
	websiteURL := firstNonEmpty(origin+"/", pageURL)
	website := map[string]any{
		"@type": "WebSite", "@id": strings.TrimRight(websiteURL, "/") + "/#website", "url": websiteURL,
		"name": site.Name, "inLanguage": "", "publisher": organization,
	}
	if description := strings.TrimSpace(site.SEODescription); description != "" {
		website["description"] = description
	}
	return website
}

func publicSchemaBreadcrumb(site catalog.Site, data publicSitePageData, pageURL string) map[string]any {
	homeURL := firstNonEmpty(publicSchemaOrigin(pageURL)+"/", data.HomePath)
	name := data.TaxonomyName
	if data.IsProductSourcing {
		name = data.ProductSourcing.HeroTitle
	} else if data.IsServiceTopic {
		name = data.ServiceTopic.HeroTitle
	} else if data.IsIndustrySolution {
		name = data.IndustrySolution.HeroTitle
	} else if data.HasContent && !data.IsHome {
		name = firstNonEmpty(data.Content.H1, data.Content.Title)
	}
	items := []any{map[string]any{"@type": "ListItem", "position": 1, "name": site.Name, "item": homeURL}}
	if strings.TrimSpace(name) != "" && pageURL != "" && pageURL != homeURL {
		items = append(items, map[string]any{"@type": "ListItem", "position": 2, "name": name, "item": pageURL})
	}
	breadcrumb := map[string]any{"@type": "BreadcrumbList", "itemListElement": items}
	if pageURL != "" {
		breadcrumb["@id"] = pageURL + "#breadcrumb"
	}
	return breadcrumb
}

func publicSchemaImages(data publicSitePageData, pageURL string) []string {
	images := make([]string, 0, len(data.Content.Gallery)+1)
	seen := make(map[string]bool)
	if coverURL := publicSchemaAbsoluteURL(pageURL, data.Content.CoverURL); coverURL != "" {
		seen[coverURL] = true
		images = append(images, coverURL)
	}
	for _, media := range data.Content.Gallery {
		imageURL := publicSchemaAbsoluteURL(pageURL, media.URL)
		if imageURL == "" || seen[imageURL] {
			continue
		}
		seen[imageURL] = true
		images = append(images, imageURL)
	}
	return images
}

// publicSchemaImageObjects keeps the image URLs in JSON-LD absolute and adds
// dimensions when the media center knows them. Dimensions help crawlers
// understand the image without making any claim about its visual content.
func publicSchemaImageObjects(data publicSitePageData, pageURL string) []any {
	images := make([]any, 0, len(data.Content.Gallery)+1)
	seen := make(map[string]bool)
	appendImage := func(rawURL string, width, height int, caption string) {
		imageURL := publicSchemaAbsoluteURL(pageURL, rawURL)
		if imageURL == "" || seen[imageURL] {
			return
		}
		seen[imageURL] = true
		image := map[string]any{"@type": "ImageObject", "url": imageURL}
		if width > 0 {
			image["width"] = width
		}
		if height > 0 {
			image["height"] = height
		}
		if caption = strings.TrimSpace(caption); caption != "" {
			image["caption"] = caption
		}
		images = append(images, image)
	}
	appendImage(data.Content.CoverURL, data.Content.CoverWidth, data.Content.CoverHeight, "")
	for _, media := range data.Content.Gallery {
		appendImage(media.URL, media.Width, media.Height, media.AltText)
	}
	return images
}

func publicSchemaWebPage(site catalog.Site, data publicSitePageData, pageURL string, website, organization map[string]any) map[string]any {
	page := map[string]any{
		"@type": "WebPage", "name": firstNonEmpty(data.PageTitle, data.SiteName),
		"description": data.MetaDescription, "inLanguage": data.Locale,
		"isPartOf": website, "about": organization, "publisher": organization,
	}
	if id := publicSchemaEntityID(pageURL, "webpage"); id != "" {
		page["@id"] = id
		page["url"] = pageURL
	}
	if data.Content.UpdatedAt != "" && data.HasContent && !data.IsHome {
		page["dateModified"] = data.Content.UpdatedAt
	}
	if breadcrumb := publicSchemaBreadcrumb(site, data, pageURL); pageURL != "" && !data.IsHome {
		page["breadcrumb"] = breadcrumb
	}
	if images := publicSchemaImageObjects(data, pageURL); len(images) > 0 {
		page["primaryImageOfPage"] = images[0]
	}
	return page
}

func publicSchemaKeywords(content publicContentData) []string {
	keywords := make([]string, 0, len(content.Tags)+1)
	seen := make(map[string]bool)
	for _, value := range append([]string{content.Category}, content.Tags...) {
		value = strings.TrimSpace(value)
		key := strings.ToLower(value)
		if value == "" || seen[key] {
			continue
		}
		seen[key] = true
		keywords = append(keywords, value)
	}
	return keywords
}

func publicProductSourcingServiceSchema(data publicSitePageData, pageURL string, organization map[string]any) map[string]any {
	copy := data.ProductSourcing
	service := map[string]any{
		"@type":       "Service",
		"name":        copy.HeroTitle,
		"description": copy.SEODescription,
		"serviceType": copy.HeroKicker,
		"inLanguage":  data.Locale,
		"provider":    organization,
	}
	if id := publicSchemaEntityID(pageURL, "service"); id != "" {
		service["@id"] = id
	}
	if pageURL != "" {
		service["url"] = pageURL
		service["mainEntityOfPage"] = map[string]any{"@id": firstNonEmpty(publicSchemaEntityID(pageURL, "webpage"), pageURL)}
	}
	if len(copy.SEOKeywords) > 0 {
		service["keywords"] = copy.SEOKeywords
	}
	return service
}

func publicProductSourcingFAQSchema(data publicSitePageData, pageURL string) map[string]any {
	questions := make([]any, 0, len(data.ProductSourcing.FAQs))
	for _, item := range data.ProductSourcing.FAQs {
		if strings.TrimSpace(item.Question) == "" || strings.TrimSpace(item.Answer) == "" {
			continue
		}
		questions = append(questions, map[string]any{
			"@type": "Question",
			"name":  item.Question,
			"acceptedAnswer": map[string]any{
				"@type": "Answer",
				"text":  item.Answer,
			},
		})
	}
	if len(questions) == 0 {
		return nil
	}
	faq := map[string]any{"@type": "FAQPage", "mainEntity": questions, "inLanguage": data.Locale}
	if id := publicSchemaEntityID(pageURL, "faq"); id != "" {
		faq["@id"] = id
	}
	if pageURL != "" {
		faq["url"] = pageURL + "#faq"
	}
	return faq
}

func publicServiceTopicServiceSchema(data publicSitePageData, pageURL string, organization map[string]any) map[string]any {
	copy := data.ServiceTopic
	service := map[string]any{
		"@type":       "Service",
		"name":        copy.HeroTitle,
		"description": copy.SEODescription,
		"serviceType": copy.HeroKicker,
		"inLanguage":  data.Locale,
		"provider":    organization,
	}
	if id := publicSchemaEntityID(pageURL, "service"); id != "" {
		service["@id"] = id
	}
	if pageURL != "" {
		service["url"] = pageURL
		service["mainEntityOfPage"] = map[string]any{"@id": firstNonEmpty(publicSchemaEntityID(pageURL, "webpage"), pageURL)}
	}
	if len(copy.SEOKeywords) > 0 {
		service["keywords"] = copy.SEOKeywords
	}
	return service
}

func publicServiceTopicFAQSchema(data publicSitePageData, pageURL string) map[string]any {
	questions := make([]any, 0, len(data.ServiceTopic.FAQs))
	for _, item := range data.ServiceTopic.FAQs {
		if strings.TrimSpace(item.Question) == "" || strings.TrimSpace(item.Answer) == "" {
			continue
		}
		questions = append(questions, map[string]any{
			"@type": "Question",
			"name":  item.Question,
			"acceptedAnswer": map[string]any{
				"@type": "Answer",
				"text":  item.Answer,
			},
		})
	}
	if len(questions) == 0 {
		return nil
	}
	faq := map[string]any{"@type": "FAQPage", "mainEntity": questions, "inLanguage": data.Locale}
	if id := publicSchemaEntityID(pageURL, "faq"); id != "" {
		faq["@id"] = id
	}
	if pageURL != "" {
		faq["url"] = pageURL + "#faq"
	}
	return faq
}

func publicIndustrySolutionFAQSchema(data publicSitePageData, pageURL string) map[string]any {
	questions := make([]any, 0, len(data.IndustrySolution.FAQs))
	for _, item := range data.IndustrySolution.FAQs {
		if strings.TrimSpace(item.Question) == "" || strings.TrimSpace(item.Answer) == "" {
			continue
		}
		questions = append(questions, map[string]any{
			"@type": "Question",
			"name":  item.Question,
			"acceptedAnswer": map[string]any{
				"@type": "Answer",
				"text":  item.Answer,
			},
		})
	}
	if len(questions) == 0 {
		return nil
	}
	faq := map[string]any{"@type": "FAQPage", "mainEntity": questions, "inLanguage": data.Locale}
	if id := publicSchemaEntityID(pageURL, "faq"); id != "" {
		faq["@id"] = id
	}
	if pageURL != "" {
		faq["url"] = pageURL + "#faq"
	}
	return faq
}

func publicJSONLD(data publicSitePageData, site catalog.Site) string {
	pageURL := publicSchemaURL(data)
	organization := publicSchemaOrganization(site, pageURL)
	website := publicSchemaWebsite(site, pageURL, organization)
	website["inLanguage"] = data.Locale
	obj := map[string]any{
		"@context": "https://schema.org", "@type": "WebSite", "@id": website["@id"],
		"url": website["url"], "name": site.Name, "description": data.MetaDescription, "inLanguage": data.Locale,
		"publisher": organization, "about": organization,
	}
	// A homepage can describe both the site and the page that contains it.
	// Keeping the WebPage as mainEntity gives crawlers a stable page node while
	// leaving WebSite as the root entity used by existing integrations.
	obj["mainEntity"] = publicSchemaWebPage(site, data, pageURL, website, organization)
	if data.NotFound {
		obj = map[string]any{
			"@context": "https://schema.org", "@type": "WebPage", "name": data.PageTitle,
			"description": data.MetaDescription, "inLanguage": data.Locale, "isPartOf": website, "about": organization, "publisher": organization,
		}
		if id := publicSchemaEntityID(pageURL, "webpage"); id != "" {
			obj["@id"] = id
			obj["url"] = pageURL
		}
	} else if data.IsGuideIndex {
		obj = map[string]any{
			"@context": "https://schema.org", "@type": "CollectionPage", "url": pageURL,
			"name": data.PageTitle, "description": data.MetaDescription, "inLanguage": data.Locale,
			"isPartOf": website, "about": organization, "publisher": organization, "breadcrumb": publicSchemaBreadcrumb(site, data, pageURL),
		}
		if id := publicSchemaEntityID(pageURL, "webpage"); id != "" {
			obj["@id"] = id
		}
		list := make([]any, 0, len(data.Published))
		for index, item := range data.Published {
			entry := map[string]any{"@type": "ListItem", "position": index + 1, "name": firstNonEmpty(item.Title, item.H1)}
			if item.URL != "" {
				itemURL := publicSchemaAbsoluteURL(pageURL, item.URL)
				entry["item"], entry["url"] = itemURL, itemURL
			}
			list = append(list, entry)
		}
		if len(list) > 0 {
			obj["mainEntity"] = map[string]any{"@type": "ItemList", "numberOfItems": len(list), "itemListElement": list}
		}
	} else if data.IsTaxonomy {
		obj = map[string]any{
			"@context": "https://schema.org", "@type": "CollectionPage", "url": pageURL,
			"name": data.TaxonomyName, "description": data.MetaDescription, "inLanguage": data.Locale,
			"isPartOf": website, "about": organization, "publisher": organization, "breadcrumb": publicSchemaBreadcrumb(site, data, pageURL),
		}
		if id := publicSchemaEntityID(pageURL, "webpage"); id != "" {
			obj["@id"] = id
		}
		list := make([]any, 0, len(data.Published))
		for index, item := range data.Published {
			entry := map[string]any{"@type": "ListItem", "position": index + 1, "name": firstNonEmpty(item.Title, item.H1)}
			if item.URL != "" {
				// ListItem.item is the Schema.org relationship crawlers use to
				// resolve archive entries. Keep url as a compatibility hint for
				// consumers that read the older payload shape, but make both values
				// the same canonical absolute URL.
				itemURL := publicSchemaAbsoluteURL(pageURL, item.URL)
				entry["item"] = itemURL
				entry["url"] = itemURL
			}
			list = append(list, entry)
		}
		if len(list) > 0 {
			obj["mainEntity"] = map[string]any{"@type": "ItemList", "numberOfItems": len(list), "itemListElement": list}
		}
	} else if data.IsProductSourcing {
		obj = map[string]any{
			"@context": "https://schema.org", "@type": "WebPage", "url": pageURL,
			"name": data.PageTitle, "description": data.MetaDescription, "inLanguage": data.Locale,
			"isPartOf": website, "about": organization, "publisher": organization, "breadcrumb": publicSchemaBreadcrumb(site, data, pageURL),
		}
		if len(data.ProductSourcing.SEOKeywords) > 0 {
			obj["keywords"] = data.ProductSourcing.SEOKeywords
		}
		obj["mainEntity"] = publicProductSourcingServiceSchema(data, pageURL, organization)
		if faq := publicProductSourcingFAQSchema(data, pageURL); faq != nil {
			obj["hasPart"] = faq
		}
		if id := publicSchemaEntityID(pageURL, "webpage"); id != "" {
			obj["@id"] = id
		}
		if images := publicSchemaImageObjects(data, pageURL); len(images) > 0 {
			obj["primaryImageOfPage"] = images[0]
		} else if heroImage := publicSchemaAbsoluteURL(pageURL, "/assets/images/freightvanta-service-product-sourcing-hero-v1.png"); heroImage != "" {
			obj["primaryImageOfPage"] = map[string]any{"@type": "ImageObject", "url": heroImage}
		}
	} else if data.IsServiceTopic {
		obj = map[string]any{
			"@context": "https://schema.org", "@type": "WebPage", "url": pageURL,
			"name": data.PageTitle, "description": data.MetaDescription, "inLanguage": data.Locale,
			"isPartOf": website, "about": organization, "publisher": organization, "breadcrumb": publicSchemaBreadcrumb(site, data, pageURL),
		}
		if len(data.ServiceTopic.SEOKeywords) > 0 {
			obj["keywords"] = data.ServiceTopic.SEOKeywords
		}
		obj["mainEntity"] = publicServiceTopicServiceSchema(data, pageURL, organization)
		if faq := publicServiceTopicFAQSchema(data, pageURL); faq != nil {
			obj["hasPart"] = faq
		}
		if id := publicSchemaEntityID(pageURL, "webpage"); id != "" {
			obj["@id"] = id
		}
		if heroImage := publicSchemaAbsoluteURL(pageURL, "/assets/images/"+data.ServiceTopic.HeroImage); heroImage != "" {
			obj["primaryImageOfPage"] = map[string]any{"@type": "ImageObject", "url": heroImage}
		}
	} else if data.IsIndustrySolution {
		obj = map[string]any{
			"@context": "https://schema.org", "@type": "WebPage", "url": pageURL,
			"name": data.PageTitle, "description": data.MetaDescription, "inLanguage": data.Locale,
			"isPartOf": website, "about": organization, "publisher": organization, "breadcrumb": publicSchemaBreadcrumb(site, data, pageURL),
		}
		if len(data.IndustrySolution.SEOKeywords) > 0 {
			obj["keywords"] = data.IndustrySolution.SEOKeywords
		}
		if faq := publicIndustrySolutionFAQSchema(data, pageURL); faq != nil {
			obj["hasPart"] = faq
		}
		if id := publicSchemaEntityID(pageURL, "webpage"); id != "" {
			obj["@id"] = id
		}
		if heroImage := publicSchemaAbsoluteURL(pageURL, "/assets/images/"+data.IndustrySolution.HeroImage); heroImage != "" {
			obj["primaryImageOfPage"] = map[string]any{"@type": "ImageObject", "url": heroImage}
		}
	} else if data.HasContent && !data.IsHome {
		content := data.Content
		description := firstNonEmpty(data.MetaDescription, content.Summary)
		obj = map[string]any{
			"@context": "https://schema.org", "@type": "Article", "url": pageURL,
			"name": firstNonEmpty(content.Title, content.H1), "headline": content.H1, "description": description, "inLanguage": data.Locale,
			"isPartOf": website, "mainEntityOfPage": map[string]any{"@type": "WebPage", "@id": firstNonEmpty(publicSchemaEntityID(pageURL, "webpage"), pageURL)},
			"publisher": organization, "author": organization, "breadcrumb": publicSchemaBreadcrumb(site, data, pageURL),
		}
		if id := publicSchemaEntityID(pageURL, "content"); id != "" {
			obj["@id"] = id
		}
		if content.ContentType == "product" {
			obj["@type"] = "Product"
			obj["name"] = firstNonEmpty(content.Title, content.H1)
			delete(obj, "headline")
			// Product pages are informational in this CMS. Do not emit offers,
			// ratings, inventory, SKU or price unless those facts exist in the
			// product model; fabricated values can make a page ineligible for
			// Google's Product features. The page relationship remains useful for
			// crawlers and is valid for a Product entity.
			delete(obj, "author")
			delete(obj, "publisher")
			delete(obj, "articleSection")
			delete(obj, "breadcrumb")
			if description != "" {
				obj["description"] = description
			}
			for _, key := range []string{"datePublished"} {
				delete(obj, key)
			}
			// OwnerName identifies the CMS editor, not necessarily the product
			// brand. Do not map it to Product.brand: Google expects that field to
			// describe a real brand and an editor name would be misleading. A
			// future product-specific brand field can be emitted when the model
			// contains an explicit, verified value.
			if content.Category != "" {
				obj["category"] = content.Category
			}
		} else if content.ContentType == "page" || content.ContentType == "landing" {
			obj["@type"] = "WebPage"
			obj["name"] = firstNonEmpty(content.Title, content.H1)
			delete(obj, "headline")
			delete(obj, "author")
			delete(obj, "articleSection")
			delete(obj, "keywords")
			delete(obj, "datePublished")
			obj["publisher"] = organization
			if content.PageLayout == "contact" {
				obj["@type"] = "ContactPage"
			}
		} else {
			obj["articleSection"] = content.Category
			if content.OwnerName != "" {
				obj["author"] = map[string]any{"@type": "Person", "name": content.OwnerName}
			}
		}
		if content.ContentType == "article" && content.UpdatedAt != "" {
			obj["dateModified"] = content.UpdatedAt
		}
		if content.ContentType == "article" && content.PublishedAt != "" {
			obj["datePublished"] = content.PublishedAt
		}
		if content.ContentType != "product" && content.ContentType != "page" && content.ContentType != "landing" {
			if keywords := publicSchemaKeywords(content); len(keywords) > 0 {
				obj["keywords"] = keywords
			}
		}
		if images := publicSchemaImageObjects(data, pageURL); len(images) > 0 {
			obj["image"] = images
		}
	}
	encoded, _ := json.Marshal(obj)
	return string(encoded)
}

// safeStructuredData re-serializes JSON-LD before it enters a script element.
// json.Marshal escapes '<', '>' and '&', preventing a stored string from
// closing the script tag. The generated page entity is always retained. A
// custom Organization/WebSite/BreadcrumbList is merged into the generated
// entity, while other typed nodes are attached through @graph. This prevents
// a pasted Organization snippet from accidentally replacing an Article or
// Product node and keeps the rendered URL, type and language canonical.
func safeStructuredData(input json.RawMessage, fallback string) string {
	var defaults map[string]any
	if err := json.Unmarshal([]byte(fallback), &defaults); err != nil || defaults == nil {
		defaults = map[string]any{}
	}
	// Accept the format commonly copied from documentation and validators:
	// <script type="application/ld+json">{...}</script>. The catalog layer
	// normalizes new values before persistence; this second normalization keeps
	// older records safe when they are rendered for the first time.
	input = catalogStructuredDataJSON(input)
	var custom map[string]any
	if len(input) > 0 && string(input) != "{}" && string(input) != "null" && json.Unmarshal(input, &custom) == nil && custom != nil {
		mergeStructuredData(defaults, custom)
	}
	encoded, err := json.Marshal(defaults)
	if err != nil {
		return `{}`
	}
	return string(encoded)
}

func structuredDataType(value any) string {
	switch typed := value.(type) {
	case string:
		return strings.TrimSpace(typed)
	case []any:
		for _, item := range typed {
			if result := structuredDataType(item); result != "" {
				return result
			}
		}
	}
	return ""
}

func structuredDataNodes(document map[string]any) []map[string]any {
	if graph, ok := document["@graph"].([]any); ok {
		nodes := make([]map[string]any, 0, len(graph))
		for _, value := range graph {
			if node, ok := value.(map[string]any); ok && node != nil {
				nodes = append(nodes, node)
			}
		}
		return nodes
	}
	return []map[string]any{document}
}

func mergeStructuredFields(target, source map[string]any) {
	for key, value := range source {
		// @context is a document-level keyword. @graph is handled by the
		// caller, otherwise a user could nest an entire document in a node.
		if key == "@context" || key == "@graph" {
			continue
		}
		// The page URL and schema type are generated from the route and content
		// model. Keep them canonical even when a copied snippet contains a
		// different URL or type.
		if (key == "@id" || key == "@type" || key == "url") && target[key] != nil {
			continue
		}
		if current, ok := target[key].(map[string]any); ok {
			if incoming, ok := value.(map[string]any); ok {
				mergeStructuredFields(current, incoming)
				continue
			}
		}
		target[key] = value
	}
}

func appendStructuredGraphNode(document map[string]any, node map[string]any) {
	if node == nil {
		return
	}
	delete(node, "@context")
	graph, _ := document["@graph"].([]any)
	document["@graph"] = append(graph, node)
}

func mergeStructuredData(defaults, custom map[string]any) {
	defaultType := structuredDataType(defaults["@type"])
	for _, node := range structuredDataNodes(custom) {
		nodeType := strings.ToLower(structuredDataType(node["@type"]))
		switch nodeType {
		case "":
			// A graph wrapper with an untyped node is not useful as a page
			// override, but preserving ordinary custom fields keeps backwards
			// compatibility with older records that omitted @type.
			if len(node) > 0 {
				mergeStructuredFields(defaults, node)
			}
		case strings.ToLower(defaultType):
			mergeStructuredFields(defaults, node)
		case "organization":
			if publisher, ok := defaults["publisher"].(map[string]any); ok {
				mergeStructuredFields(publisher, node)
			} else {
				appendStructuredGraphNode(defaults, node)
			}
		case "website":
			if website, ok := defaults["isPartOf"].(map[string]any); ok {
				mergeStructuredFields(website, node)
			} else if defaultType == "WebSite" {
				mergeStructuredFields(defaults, node)
			} else {
				appendStructuredGraphNode(defaults, node)
			}
		case "breadcrumblist":
			if breadcrumb, ok := defaults["breadcrumb"].(map[string]any); ok {
				mergeStructuredFields(breadcrumb, node)
			} else {
				appendStructuredGraphNode(defaults, node)
			}
		default:
			appendStructuredGraphNode(defaults, node)
		}
	}
}

func catalogStructuredDataJSON(input json.RawMessage) json.RawMessage {
	source := strings.TrimSpace(string(input))
	if match := structuredDataScriptPatternHTTP.FindStringSubmatch(source); len(match) == 2 {
		source = strings.TrimSpace(match[1])
	}
	if source == "" || source == "null" {
		return json.RawMessage(`{}`)
	}
	return json.RawMessage(source)
}

func requestHostname(value string) string {
	value = strings.TrimSpace(strings.ToLower(value))
	if host, _, err := net.SplitHostPort(value); err == nil {
		value = host
	}
	return strings.TrimSuffix(value, ".")
}

func (s *server) setupPage(w http.ResponseWriter, r *http.Request) {
	required, err := s.Auth.SetupRequired(r.Context())
	if err != nil {
		http.Error(w, "service unavailable", http.StatusServiceUnavailable)
		return
	}
	if !required {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	token := s.issueLoginCSRF(w)
	s.renderAuth(w, authPageData{Title: "首次安全设置", Heading: "创建系统所有者", Description: "这是唯一的首次安装入口。创建后将永久关闭。", Mode: "setup", CSRFToken: token, RequireSetupToken: s.Config.SetupToken != ""})
}

func (s *server) setupSubmit(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 16<<10)
	if !s.validFormOrigin(r) || !s.validateLoginCSRF(r) {
		http.Error(w, "请求验证失败，请刷新页面后重试", http.StatusForbidden)
		return
	}
	if !s.loginIPLimiter.Allow("setup:" + s.clientIP(r)) {
		w.Header().Set("Retry-After", "60")
		http.Error(w, "请求过于频繁，请稍后重试", http.StatusTooManyRequests)
		return
	}
	if !s.validSetupAuthority(r) {
		s.audit(r, audit.Event{Action: "security.setup_authority_rejected", TargetType: "setup", Success: false})
		s.renderSetupError(w, "安装令牌不正确，或当前请求不是本机请求", r.FormValue("username"), r.FormValue("display_name"), r.FormValue("email"))
		return
	}
	username := r.FormValue("username")
	displayName := r.FormValue("display_name")
	email := r.FormValue("email")
	password := r.FormValue("password")
	if password != r.FormValue("password_confirm") {
		s.renderSetupError(w, "两次输入的密码不一致", username, displayName, email)
		return
	}
	user, err := s.Auth.CreateInitialOwner(r.Context(), username, displayName, email, password)
	if err != nil {
		s.renderSetupError(w, err.Error(), username, displayName, email)
		return
	}
	s.audit(r, audit.Event{ActorUserID: &user.ID, Action: "security.initial_owner_created", TargetType: "user", TargetID: strconv.FormatInt(user.ID, 10), Success: true})
	http.Redirect(w, r, "/login", http.StatusSeeOther)
}

func (s *server) renderSetupError(w http.ResponseWriter, message, username, displayName, email string) {
	token := s.issueLoginCSRF(w)
	s.prepareAuthHeaders(w)
	w.WriteHeader(http.StatusUnprocessableEntity)
	s.renderAuth(w, authPageData{Title: "首次安全设置", Heading: "创建系统所有者", Description: "请修正下方信息后重新提交。", Mode: "setup", Error: message, CSRFToken: token, Username: username, DisplayName: displayName, Email: email, RequireSetupToken: s.Config.SetupToken != ""})
}

func (s *server) loginPage(w http.ResponseWriter, r *http.Request) {
	required, err := s.Auth.SetupRequired(r.Context())
	if err == nil && required {
		http.Redirect(w, r, "/setup", http.StatusSeeOther)
		return
	}
	token := s.issueLoginCSRF(w)
	s.renderAuth(w, authPageData{Title: "登录", Heading: "登录管理后台", Description: "请输入管理员凭据。连续失败会触发账户保护。", Mode: "login", CSRFToken: token, Next: safeNext(r.URL.Query().Get("next"))})
}

func (s *server) loginSubmit(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 16<<10)
	if !s.validFormOrigin(r) || !s.validateLoginCSRF(r) {
		http.Error(w, "请求验证失败，请刷新页面后重试", http.StatusForbidden)
		return
	}
	username := strings.TrimSpace(r.FormValue("username"))
	ip := s.clientIP(r)
	if !s.loginIPLimiter.Allow("login-ip:"+ip) || !s.loginUserLimiter.Allow("login-user:"+strings.ToLower(username)) {
		s.audit(r, audit.Event{Action: "security.login_rate_limited", TargetType: "user", TargetID: username, Success: false})
		w.Header().Set("Retry-After", "60")
		s.renderLoginError(w, "尝试次数过多，请稍后再试", username, r.FormValue("next"), http.StatusTooManyRequests)
		return
	}
	result, err := s.Auth.Login(r.Context(), username, r.FormValue("password"), r.FormValue("mfa_code"), ip, r.UserAgent())
	if err != nil {
		s.audit(r, audit.Event{Action: "security.login_failed", TargetType: "user", TargetID: username, Success: false, Metadata: map[string]any{"reason": loginFailureReason(err)}})
		message := auth.ErrInvalidCredentials.Error()
		if errors.Is(err, auth.ErrAccountLocked) {
			message = auth.ErrAccountLocked.Error()
		}
		s.renderLoginError(w, message, username, r.FormValue("next"), http.StatusUnauthorized)
		return
	}
	s.setSessionCookie(w, result.CookieValue, result.Session.AbsoluteUntil)
	s.audit(r, audit.Event{ActorUserID: &result.Session.User.ID, Action: "security.login_succeeded", TargetType: "session", TargetID: result.Session.ID, Success: true})
	http.Redirect(w, r, safeNext(r.FormValue("next")), http.StatusSeeOther)
}

func (s *server) renderLoginError(w http.ResponseWriter, message, username, next string, status int) {
	token := s.issueLoginCSRF(w)
	s.prepareAuthHeaders(w)
	w.WriteHeader(status)
	s.renderAuth(w, authPageData{Title: "登录", Heading: "登录管理后台", Description: "请输入管理员凭据。连续失败会触发账户保护。", Mode: "login", Error: message, CSRFToken: token, Username: username, Next: safeNext(next)})
}

func (s *server) admin(w http.ResponseWriter, r *http.Request) {
	session := sessionFromContext(r.Context())
	if allowed, err := s.Authorization.Can(r.Context(), session.User.ID, "dashboard.view"); err != nil || !allowed {
		http.Error(w, "没有访问控制台的权限", http.StatusForbidden)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Robots-Tag", "noindex, nofollow")
	if err := s.Template.ExecuteTemplate(w, "index.html", adminPageData{CSRFToken: session.CSRFToken, Username: session.User.Username, DisplayName: session.User.DisplayName}); err != nil {
		s.Logger.Error("渲染后台失败", "error", err, "request_id", middleware.GetReqID(r.Context()))
	}
}

func (s *server) logout(w http.ResponseWriter, r *http.Request) {
	session := sessionFromContext(r.Context())
	if !s.validFormOrigin(r) || !s.Auth.VerifyCSRF(session, r.FormValue("csrf_token")) {
		http.Error(w, "请求验证失败", http.StatusForbidden)
		return
	}
	_ = s.Auth.RevokeSession(r.Context(), session.ID)
	s.clearSessionCookie(w)
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "security.logout", TargetType: "session", TargetID: session.ID, Success: true})
	http.Redirect(w, r, "/login", http.StatusSeeOther)
}

func (s *server) mfaPage(w http.ResponseWriter, r *http.Request) {
	session := sessionFromContext(r.Context())
	if session.User.MFAEnabled {
		http.Error(w, "MFA 已启用；重置操作需由后续安全设置流程完成", http.StatusConflict)
		return
	}
	s.renderAuth(w, authPageData{Title: "多因素认证", Heading: "启用验证器 MFA", Description: "绑定后，每次登录需要密码和动态验证码。", Mode: "mfa_start", CSRFToken: session.CSRFToken})
}

func (s *server) mfaStart(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 8<<10)
	session := sessionFromContext(r.Context())
	if !s.validFormOrigin(r) || !s.Auth.VerifyCSRF(session, r.FormValue("csrf_token")) {
		http.Error(w, "请求验证失败", http.StatusForbidden)
		return
	}
	enrollment, err := s.Auth.BeginMFA(r.Context(), session)
	if err != nil {
		http.Error(w, "无法创建 MFA 配置", http.StatusInternalServerError)
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "security.mfa_enrollment_started", TargetType: "user", TargetID: strconv.FormatInt(session.User.ID, 10), Success: true})
	s.renderAuth(w, authPageData{Title: "多因素认证", Heading: "扫描或输入安全密钥", Description: "密钥仅在本次配置中显示。", Mode: "mfa", CSRFToken: session.CSRFToken, MFASecret: enrollment.Secret})
}

func (s *server) mfaSubmit(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 8<<10)
	session := sessionFromContext(r.Context())
	if !s.validFormOrigin(r) || !s.Auth.VerifyCSRF(session, r.FormValue("csrf_token")) {
		http.Error(w, "请求验证失败", http.StatusForbidden)
		return
	}
	codes, err := s.Auth.CompleteMFA(r.Context(), session, r.FormValue("code"))
	if err != nil {
		s.prepareAuthHeaders(w)
		w.WriteHeader(http.StatusUnprocessableEntity)
		s.renderAuth(w, authPageData{Title: "多因素认证", Heading: "验证码未通过", Description: "配置已失效或验证码不正确，请返回并重新开始。", Mode: "mfa", Error: "验证码不正确或已过期", CSRFToken: session.CSRFToken})
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "security.mfa_enabled", TargetType: "user", TargetID: strconv.FormatInt(session.User.ID, 10), Success: true})
	s.renderAuth(w, authPageData{Title: "保存恢复码", Heading: "MFA 已启用", Description: "最后一步：离线保存一次性恢复码。", Mode: "recovery", RecoveryCodes: codes})
}

func (s *server) me(w http.ResponseWriter, r *http.Request) {
	session := sessionFromContext(r.Context())
	permissions, err := s.Authorization.Permissions(r.Context(), session.User.ID)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取权限失败")
		return
	}
	scopes, err := s.Authorization.Scopes(r.Context(), session.User.ID)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取数据范围失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"id": session.User.ID, "username": session.User.Username, "display_name": session.User.DisplayName, "mfa_enabled": session.User.MFAEnabled, "permissions": permissions, "scopes": scopes, "csrf_token": session.CSRFToken})
}

func (s *server) mfaDisable(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Password string `json:"password"`
		Code     string `json:"code"`
	}
	if err := decodeJSON(w, r, &request, 8<<10); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	if err := s.Auth.DisableMFA(r.Context(), session, request.Password, request.Code); err != nil {
		s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "security.mfa_disable_failed", TargetType: "user", TargetID: strconv.FormatInt(session.User.ID, 10), Success: false})
		writeJSONError(w, http.StatusUnauthorized, "密码或动态验证码不正确")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "security.mfa_disabled", TargetType: "user", TargetID: strconv.FormatInt(session.User.ID, 10), Success: true})
	writeJSON(w, http.StatusOK, map[string]bool{"disabled": true})
}

func (s *server) health(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), time.Second)
	defer cancel()
	if err := s.DB.PingContext(ctx); err != nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("ok"))
}

func (s *server) status(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), time.Second)
	defer cancel()
	databaseStatus := "正常"
	if err := s.DB.PingContext(ctx); err != nil {
		databaseStatus = "异常"
	}
	overall := "正常"
	if databaseStatus != "正常" {
		overall = "异常"
	}
	counts := map[string]int64{"sites": 0, "contents": 0, "media": 0, "users": 0, "audit": 0, "backups": 0}
	tables := map[string]string{"sites": "sites", "contents": "contents", "media": "media_files", "users": "users", "audit": "audit_logs", "backups": "backup_records"}
	if databaseStatus == "正常" {
		for key, table := range tables {
			var count int64
			if err := s.DB.QueryRowContext(ctx, `SELECT COUNT(*) FROM `+table).Scan(&count); err == nil {
				counts[key] = count
			}
		}
	}
	var pageCount, pageSize int64
	_ = s.DB.QueryRowContext(ctx, `PRAGMA page_count`).Scan(&pageCount)
	_ = s.DB.QueryRowContext(ctx, `PRAGMA page_size`).Scan(&pageSize)
	var memory runtime.MemStats
	runtime.ReadMemStats(&memory)
	cacheStrategy := "L1 内存缓存"
	if s.Config.RedisAddr != "" {
		cacheStrategy = "L1 内存 + L2 Redis"
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"status": overall, "database": databaseStatus, "runtime": runtime.Version(),
		"uptime_seconds": int(time.Since(s.Started).Seconds()), "cache_strategy": cacheStrategy, "redis_enabled": s.Config.RedisAddr != "",
		"storage_strategy": "sqlite+server-rendered-html", "database_bytes": pageCount * pageSize,
		"memory_alloc_bytes": memory.Alloc, "goroutines": runtime.NumGoroutine(), "counts": counts,
	})
}

func (s *server) auditList(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	limit, _ := strconv.Atoi(query.Get("limit"))
	offset, _ := strconv.Atoi(query.Get("offset"))
	if offset < 0 {
		offset = 0
	}
	page, err := s.Audit.ListPage(r.Context(), audit.ListOptions{
		Limit: limit, Offset: offset, FromDate: query.Get("from"), ToDate: query.Get("to"),
		Status: query.Get("status"), Category: query.Get("category"), Query: query.Get("q"),
	})
	if err != nil {
		if strings.Contains(err.Error(), "invalid audit") || strings.Contains(err.Error(), "audit end date") {
			writeJSONError(w, http.StatusUnprocessableEntity, err.Error())
			return
		}
		writeJSONError(w, http.StatusInternalServerError, "读取审计日志失败")
		return
	}
	writeJSON(w, http.StatusOK, page)
}

func (s *server) sanitizeRichText(w http.ResponseWriter, r *http.Request) {
	var request struct {
		HTML string `json:"html"`
	}
	if err := decodeJSON(w, r, &request, contentsafety.MaxRichTextBytes+1024); err != nil {
		return
	}
	cleaned, err := s.Sanitizer.Sanitize(request.HTML)
	if err != nil {
		writeJSONError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"html": cleaned})
}

func (s *server) mediaUpload(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, s.Config.MaxUploadBytes+1<<20)
	if err := r.ParseMultipartForm(1 << 20); err != nil {
		writeJSONError(w, http.StatusBadRequest, "上传请求无效或文件过大")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "缺少文件")
		return
	}
	defer file.Close()
	session := sessionFromContext(r.Context())
	media, err := s.Files.SaveMedia(r.Context(), file, header.Filename, header.Size, session.User.ID)
	if err != nil {
		s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "media.upload_rejected", TargetType: "media", TargetID: header.Filename, Success: false, Metadata: map[string]any{"reason": err.Error()}})
		writeJSONError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	if altText := strings.TrimSpace(r.FormValue("alt_text")); altText != "" {
		uploadedID := media.ID
		if updated, updateErr := s.Files.UpdateMediaAlt(r.Context(), media.ID, media.Version, altText); updateErr == nil {
			media = updated
		} else {
			s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "media.alt_update_failed", TargetType: "media", TargetID: strconv.FormatInt(uploadedID, 10), Success: false, Metadata: map[string]any{"reason": updateErr.Error()}})
		}
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "media.uploaded", TargetType: "media", TargetID: strconv.FormatInt(media.ID, 10), Success: true, Metadata: map[string]any{"sha256": media.SHA256, "size": media.ByteSize}})
	writeJSON(w, http.StatusCreated, media)
}

// mediaMigrateAVIF upgrades the legacy library in small verified batches.
// New uploads already pass through the same AVIF encoder, so this endpoint is
// only needed once for images created before the storage policy changed.
func (s *server) mediaMigrateAVIF(w http.ResponseWriter, r *http.Request) {
	session := sessionFromContext(r.Context())
	result, err := s.Files.MigrateExistingMediaToAVIF(r.Context(), 12)
	if err != nil {
		s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "media.avif_migration_failed", TargetType: "media_library", TargetID: "legacy", Success: false, Metadata: map[string]any{"reason": err.Error(), "scanned": result.Scanned, "converted": result.Converted}})
		writeJSONError(w, http.StatusInternalServerError, "历史图片转为 AVIF 时发生错误，请稍后重试")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "media.avif_migrated", TargetType: "media_library", TargetID: "legacy", Success: result.Failed == 0, Metadata: map[string]any{"scanned": result.Scanned, "converted": result.Converted, "failed": result.Failed, "remaining": result.Remaining}})
	writeJSON(w, http.StatusOK, result)
}

// mediaServe serves only a database-resolved, normalized media file. The
// checksum token is checked when present so stale or hand-crafted URLs do not
// expose another record; the ID remains the canonical lookup key.
func (s *server) mediaServe(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "mediaID"), 10, 64)
	if err != nil || id < 1 {
		http.NotFound(w, r)
		return
	}
	media, file, info, err := s.Files.OpenMedia(r.Context(), id)
	if errors.Is(err, filestore.ErrMediaNotFound) {
		http.NotFound(w, r)
		return
	}
	if err != nil {
		http.Error(w, "media unavailable", http.StatusServiceUnavailable)
		return
	}
	defer file.Close()
	token := strings.TrimSpace(chi.URLParam(r, "token"))
	if token == "" || len(token) != 16 || !strings.EqualFold(token, media.SHA256[:minInt(16, len(media.SHA256))]) {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", media.MediaType)
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Content-Disposition", "inline")
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	w.Header().Set("ETag", `"`+media.SHA256+`"`)
	http.ServeContent(w, r, filepath.Base(media.OriginalName), info.ModTime(), file)
}

type remoteMediaRequest struct {
	URL string `json:"url"`
}

func (s *server) mediaImport(w http.ResponseWriter, r *http.Request) {
	session := sessionFromContext(r.Context())
	if !s.mediaImportLimiter.Allow(strconv.FormatInt(session.User.ID, 10)) {
		writeJSONError(w, http.StatusTooManyRequests, "远程图片导入过于频繁，请稍后再试")
		return
	}
	var request remoteMediaRequest
	if err := decodeJSON(w, r, &request, 8<<10); err != nil {
		return
	}
	remoteURL, err := validateRemoteMediaURL(r.Context(), request.URL)
	if err != nil {
		s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "media.import_rejected", TargetType: "remote_media", TargetID: remoteAuditTarget(request.URL), Success: false, Metadata: map[string]any{"reason": err.Error()}})
		writeJSONError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	media, err := s.downloadRemoteMedia(r.Context(), remoteURL, session.User.ID)
	if err != nil {
		s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "media.import_rejected", TargetType: "remote_media", TargetID: remoteAuditTarget(request.URL), Success: false, Metadata: map[string]any{"reason": err.Error()}})
		writeJSONError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "media.imported", TargetType: "media", TargetID: strconv.FormatInt(media.ID, 10), Success: true, Metadata: map[string]any{"source_host": remoteURL.Hostname(), "sha256": media.SHA256, "size": media.ByteSize}})
	writeJSON(w, http.StatusCreated, media)
}

func (s *server) downloadRemoteMedia(ctx context.Context, remoteURL *url.URL, userID int64) (filestore.Media, error) {
	requestCtx, cancel := context.WithTimeout(ctx, 20*time.Second)
	defer cancel()
	request, err := http.NewRequestWithContext(requestCtx, http.MethodGet, remoteURL.String(), nil)
	if err != nil {
		return filestore.Media{}, errors.New("远程图片地址无效")
	}
	request.Header.Set("Accept", "image/avif,image/webp,image/jpeg,image/png,image/gif;q=0.9")
	request.Header.Set("User-Agent", "CZCMS-MediaImporter/1.0")
	client := s.remoteMediaClient
	if client == nil {
		client = newRemoteMediaClient()
	}
	response, err := client.Do(request)
	if err != nil {
		return filestore.Media{}, fmt.Errorf("无法读取远程图片：%w", err)
	}
	defer response.Body.Close()
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return filestore.Media{}, fmt.Errorf("远程图片返回 HTTP %d", response.StatusCode)
	}
	maxBytes := s.Config.MaxUploadBytes
	if maxBytes < 1 {
		maxBytes = 12 << 20
	}
	if response.ContentLength > maxBytes {
		return filestore.Media{}, errors.New("远程图片超过上传大小限制")
	}
	data, err := io.ReadAll(io.LimitReader(response.Body, maxBytes+1))
	if err != nil {
		return filestore.Media{}, errors.New("读取远程图片失败")
	}
	if int64(len(data)) == 0 || int64(len(data)) > maxBytes {
		return filestore.Media{}, errors.New("远程图片为空或超过上传大小限制")
	}
	detected := filestore.DetectImageContentType(data[:minInt(len(data), 512)])
	if filestore.ImageExtension(detected) == "" {
		return filestore.Media{}, errors.New("远程资源不是受支持的 JPEG、PNG、GIF、WebP 或 AVIF 图片")
	}
	return s.Files.SaveMedia(ctx, bytes.NewReader(data), "remote-image"+filestore.ImageExtension(detected), int64(len(data)), userID)
}

func newRemoteMediaClient() *http.Client {
	transport := http.DefaultTransport.(*http.Transport).Clone()
	// Do not use environment proxies here: a proxy could resolve or reach a
	// destination differently and bypass the direct-address SSRF checks.
	transport.Proxy = nil
	transport.DialContext = safeRemoteDialContext
	client := &http.Client{Transport: transport, Timeout: 20 * time.Second}
	client.CheckRedirect = func(next *http.Request, via []*http.Request) error {
		if len(via) >= 3 {
			return errors.New("远程图片重定向次数超过限制")
		}
		if _, err := validateRemoteMediaURL(next.Context(), next.URL.String()); err != nil {
			return err
		}
		if len(via) > 0 && via[0].URL.Scheme == "https" && next.URL.Scheme != "https" {
			return errors.New("禁止将 HTTPS 图片重定向到不安全的 HTTP 地址")
		}
		return nil
	}
	return client
}

func validateRemoteMediaURL(ctx context.Context, raw string) (*url.URL, error) {
	if len(strings.TrimSpace(raw)) > 2048 {
		return nil, errors.New("远程图片地址过长")
	}
	parsed, err := url.ParseRequestURI(strings.TrimSpace(raw))
	if err != nil || parsed == nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" || parsed.User != nil || parsed.Fragment != "" {
		return nil, errors.New("远程图片地址必须是 HTTP 或 HTTPS，且不能包含用户名密码")
	}
	host := strings.TrimSuffix(strings.ToLower(parsed.Hostname()), ".")
	if host == "" || strings.Contains(host, "%") || host == "localhost" || strings.HasSuffix(host, ".localhost") || strings.HasSuffix(host, ".local") || strings.HasSuffix(host, ".internal") {
		return nil, errors.New("远程图片地址指向了不允许的本地或内部主机")
	}
	if _, err := validateRemoteHost(ctx, host); err != nil {
		return nil, err
	}
	return parsed, nil
}

func safeRemoteDialContext(ctx context.Context, network, address string) (net.Conn, error) {
	if network != "tcp" && network != "tcp4" && network != "tcp6" {
		return nil, errors.New("不支持的远程网络类型")
	}
	host, port, err := net.SplitHostPort(address)
	if err != nil {
		return nil, errors.New("远程地址端口无效")
	}
	ips, err := validateRemoteHost(ctx, host)
	if err != nil {
		return nil, err
	}
	dialer := &net.Dialer{Timeout: 10 * time.Second, KeepAlive: 30 * time.Second}
	var lastErr error
	for _, ip := range ips {
		if blockedRemoteIP(ip) {
			return nil, errors.New("远程图片连接被解析到不允许的内网地址")
		}
		conn, dialErr := dialer.DialContext(ctx, network, net.JoinHostPort(ip.String(), port))
		if dialErr == nil {
			return conn, nil
		}
		lastErr = dialErr
	}
	if lastErr == nil {
		lastErr = errors.New("远程图片连接失败")
	}
	return nil, lastErr
}

func validateRemoteHost(ctx context.Context, host string) ([]net.IP, error) {
	host = strings.TrimSuffix(strings.ToLower(strings.TrimSpace(host)), ".")
	if host == "" || strings.Contains(host, "%") || host == "localhost" || strings.HasSuffix(host, ".localhost") || strings.HasSuffix(host, ".local") || strings.HasSuffix(host, ".internal") {
		return nil, errors.New("远程图片地址指向了不允许的本地或内部主机")
	}
	if ip := net.ParseIP(host); ip != nil {
		if blockedRemoteIP(ip) {
			return nil, errors.New("远程图片地址指向了不允许的内网地址")
		}
		return []net.IP{ip}, nil
	}
	lookupCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	ips, err := net.DefaultResolver.LookupIP(lookupCtx, "ip", host)
	if err != nil || len(ips) == 0 {
		return nil, errors.New("远程图片主机无法解析")
	}
	for _, ip := range ips {
		if blockedRemoteIP(ip) {
			return nil, errors.New("远程图片主机解析到了不允许的内网地址")
		}
	}
	return ips, nil
}

func blockedRemoteIP(ip net.IP) bool {
	if ip == nil || ip.IsUnspecified() || ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() || ip.IsMulticast() {
		return true
	}
	for _, network := range blockedRemoteNetworks {
		if network.Contains(ip) {
			return true
		}
	}
	if v4 := ip.To4(); v4 != nil {
		if v4[0] == 0 || v4[0] >= 224 || (v4[0] == 100 && v4[1] >= 64 && v4[1] <= 127) || (v4[0] == 192 && v4[1] == 0 && v4[2] == 0) || (v4[0] == 198 && v4[1] >= 18 && v4[1] <= 19) || (v4[0] == 198 && v4[1] == 51 && v4[2] == 100) || (v4[0] == 203 && v4[1] == 0 && v4[2] == 113) {
			return true
		}
	}
	return false
}

var blockedRemoteNetworks = func() []*net.IPNet {
	ranges := []string{
		"0.0.0.0/8", "100.64.0.0/10", "192.0.0.0/24", "192.0.2.0/24", "192.88.99.0/24",
		"198.18.0.0/15", "198.51.100.0/24", "203.0.113.0/24", "224.0.0.0/4", "240.0.0.0/4",
		"::/128", "::1/128", "100::/64", "2001:db8::/32", "2001:10::/28", "fc00::/7", "fe80::/10", "ff00::/8",
	}
	result := make([]*net.IPNet, 0, len(ranges))
	for _, raw := range ranges {
		_, network, err := net.ParseCIDR(raw)
		if err == nil {
			result = append(result, network)
		}
	}
	return result
}()

func remoteAuditTarget(raw string) string {
	parsed, err := url.ParseRequestURI(strings.TrimSpace(raw))
	if err != nil || parsed == nil {
		return "invalid-url"
	}
	return parsed.Hostname()
}

func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func (s *server) themeUpload(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, s.Config.MaxThemeBytes+1<<20)
	if err := r.ParseMultipartForm(1 << 20); err != nil {
		writeJSONError(w, http.StatusBadRequest, "模板上传请求无效或文件过大")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil || !strings.HasSuffix(strings.ToLower(header.Filename), ".zip") {
		writeJSONError(w, http.StatusBadRequest, "模板必须是 ZIP 包")
		return
	}
	defer file.Close()
	session := sessionFromContext(r.Context())
	theme, err := s.Files.SaveTheme(r.Context(), file, header.Size, session.User.ID)
	if err != nil {
		s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "template.upload_rejected", TargetType: "theme", TargetID: header.Filename, Success: false, Metadata: map[string]any{"reason": err.Error()}})
		writeJSONError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "template.uploaded", TargetType: "theme", TargetID: strconv.FormatInt(theme.ID, 10), Success: true, Metadata: map[string]any{"sha256": theme.SHA256}})
	writeJSON(w, http.StatusCreated, theme)
}

func (s *server) createStarterTheme(w http.ResponseWriter, r *http.Request) {
	var request filestore.CreateStarterThemeInput
	if err := decodeJSON(w, r, &request, 64<<10); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	theme, err := s.Files.CreateStarterTheme(r.Context(), request, session.User.ID)
	if err != nil {
		status := http.StatusUnprocessableEntity
		if errors.Is(err, filestore.ErrThemeConflict) {
			status = http.StatusConflict
		}
		s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "template.create_rejected", TargetType: "theme", TargetID: request.Name, Success: false, Metadata: map[string]any{"base_render_key": request.BaseRenderKey, "reason": err.Error()}})
		writeJSONError(w, status, err.Error())
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "template.created", TargetType: "theme", TargetID: strconv.FormatInt(theme.ID, 10), Success: true, Metadata: map[string]any{"base_render_key": request.BaseRenderKey, "sha256": theme.SHA256}})
	writeJSON(w, http.StatusCreated, theme)
}

func (s *server) backupCreate(w http.ResponseWriter, r *http.Request) {
	session := sessionFromContext(r.Context())
	record, err := s.Backups.Create(r.Context(), session.User.ID)
	if err != nil {
		s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "backup.create_failed", TargetType: "backup", Success: false, Metadata: map[string]any{"reason": err.Error()}})
		writeJSONError(w, http.StatusInternalServerError, "加密备份创建或校验失败")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "backup.created", TargetType: "backup", TargetID: strconv.FormatInt(record.ID, 10), Success: true, Metadata: map[string]any{"sha256": record.SHA256, "size": record.ByteSize}})
	writeJSON(w, http.StatusCreated, record)
}

func (s *server) updateAccess(w http.ResponseWriter, r *http.Request) {
	targetID, err := strconv.ParseInt(chi.URLParam(r, "userID"), 10, 64)
	if err != nil || targetID < 1 {
		writeJSONError(w, http.StatusBadRequest, "用户 ID 无效")
		return
	}
	var update authorization.AccessUpdate
	if err = decodeJSON(w, r, &update, 64<<10); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	if err = s.Auth.VerifyStepUp(r.Context(), session, update.OperatorPassword, update.OperatorMFA); err != nil {
		s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "security.step_up_failed", TargetType: "user_access", TargetID: strconv.FormatInt(targetID, 10), Success: false})
		writeJSONError(w, http.StatusUnauthorized, "需要重新验证操作人密码和 MFA")
		return
	}
	isOwner, err := s.Authorization.IsOwner(r.Context(), session.User.ID)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取操作人权限失败")
		return
	}
	if err = s.Authorization.UpdateAccess(r.Context(), targetID, update, isOwner); err != nil {
		status := http.StatusUnprocessableEntity
		if errors.Is(err, authorization.ErrForbidden) {
			status = http.StatusForbidden
		}
		writeJSONError(w, status, err.Error())
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "security.user_access_updated", TargetType: "user", TargetID: strconv.FormatInt(targetID, 10), Success: true, Metadata: map[string]any{"roles": update.Roles, "scopes": update.Scopes}})
	writeJSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (s *server) unlockUser(w http.ResponseWriter, r *http.Request) {
	targetID, err := strconv.ParseInt(chi.URLParam(r, "userID"), 10, 64)
	if err != nil || targetID < 1 {
		writeJSONError(w, http.StatusBadRequest, "用户 ID 无效")
		return
	}
	var request struct {
		OperatorPassword string `json:"operator_password"`
		OperatorMFA      string `json:"operator_mfa"`
	}
	if err = decodeJSON(w, r, &request, 8<<10); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	if err = s.Auth.VerifyStepUp(r.Context(), session, request.OperatorPassword, request.OperatorMFA); err != nil {
		writeJSONError(w, http.StatusUnauthorized, "需要重新验证操作人密码和 MFA")
		return
	}
	if err = s.Auth.UnlockUser(r.Context(), targetID); err != nil {
		writeJSONError(w, http.StatusNotFound, "用户不存在")
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "security.account_unlocked", TargetType: "user", TargetID: strconv.FormatInt(targetID, 10), Success: true})
	writeJSON(w, http.StatusOK, map[string]bool{"unlocked": true})
}

func (s *server) listUsers(w http.ResponseWriter, r *http.Request) {
	users, err := s.Authorization.ListUsers(r.Context())
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取用户失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"users": users})
}

func (s *server) listRoles(w http.ResponseWriter, r *http.Request) {
	roles, err := s.Authorization.ListRoles(r.Context())
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取角色失败")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"roles": roles})
}

func (s *server) createUser(w http.ResponseWriter, r *http.Request) {
	var request authorization.CreateUserRequest
	if err := decodeJSON(w, r, &request, 64<<10); err != nil {
		return
	}
	session := sessionFromContext(r.Context())
	if err := s.Auth.VerifyStepUp(r.Context(), session, request.OperatorPassword, request.OperatorMFA); err != nil {
		s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "security.step_up_failed", TargetType: "user_create", Success: false})
		writeJSONError(w, http.StatusUnauthorized, "需要重新验证操作人密码和 MFA")
		return
	}
	isOwner, err := s.Authorization.IsOwner(r.Context(), session.User.ID)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取操作人权限失败")
		return
	}
	user, err := s.Authorization.CreateUser(r.Context(), request, isOwner)
	if err != nil {
		status := http.StatusUnprocessableEntity
		if errors.Is(err, authorization.ErrForbidden) {
			status = http.StatusForbidden
		}
		writeJSONError(w, status, err.Error())
		return
	}
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "security.user_created", TargetType: "user", TargetID: strconv.FormatInt(user.ID, 10), Success: true, Metadata: map[string]any{"roles": user.Roles, "scopes": user.Scopes}})
	writeJSON(w, http.StatusCreated, user)
}

func (s *server) requireSession(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		session, err := s.sessionFromRequest(r)
		if err != nil {
			s.clearSessionCookie(w)
			if strings.HasPrefix(r.URL.Path, "/api/") {
				writeJSONError(w, http.StatusUnauthorized, "请先登录")
				return
			}
			nextPath := safeNext(r.URL.RequestURI())
			http.Redirect(w, r, "/login?next="+url.QueryEscape(nextPath), http.StatusSeeOther)
			return
		}
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), sessionContextKey{}, session)))
	})
}

func (s *server) requirePermission(permission string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			session := sessionFromContext(r.Context())
			if err := s.Authorization.Require(r.Context(), session.User.ID, permission); err != nil {
				s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "security.permission_denied", TargetType: "permission", TargetID: permission, Success: false})
				writeJSONError(w, http.StatusForbidden, "没有执行此操作的权限")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func (s *server) requireCSRF(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		session := sessionFromContext(r.Context())
		if !s.validFormOrigin(r) || !s.Auth.VerifyCSRF(session, r.Header.Get("X-CSRF-Token")) {
			s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "security.csrf_rejected", TargetType: "request", TargetID: r.URL.Path, Success: false})
			writeJSONError(w, http.StatusForbidden, "CSRF 校验失败")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (s *server) sessionFromRequest(r *http.Request) (auth.Session, error) {
	cookie, err := r.Cookie(s.sessionCookieName())
	if err != nil {
		return auth.Session{}, auth.ErrNoSession
	}
	return s.Auth.Authenticate(r.Context(), cookie.Value)
}

func sessionFromContext(ctx context.Context) auth.Session {
	session, _ := ctx.Value(sessionContextKey{}).(auth.Session)
	return session
}

func (s *server) issueLoginCSRF(w http.ResponseWriter) string {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		panic(err)
	}
	token := base64.RawURLEncoding.EncodeToString(raw)
	http.SetCookie(w, &http.Cookie{Name: s.loginCSRFCookieName(), Value: token, Path: "/", MaxAge: 600, HttpOnly: true, Secure: s.Config.CookieSecure, SameSite: http.SameSiteStrictMode})
	return token
}

func (s *server) validateLoginCSRF(r *http.Request) bool {
	cookie, err := r.Cookie(s.loginCSRFCookieName())
	supplied := r.FormValue("csrf_token")
	return err == nil && len(cookie.Value) >= 40 && subtle.ConstantTimeCompare([]byte(cookie.Value), []byte(supplied)) == 1
}

func (s *server) setSessionCookie(w http.ResponseWriter, value string, expires time.Time) {
	http.SetCookie(w, &http.Cookie{Name: s.sessionCookieName(), Value: value, Path: "/", Expires: expires, MaxAge: int(time.Until(expires).Seconds()), HttpOnly: true, Secure: s.Config.CookieSecure, SameSite: http.SameSiteStrictMode})
}

func (s *server) clearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{Name: s.sessionCookieName(), Value: "", Path: "/", MaxAge: -1, Expires: time.Unix(1, 0), HttpOnly: true, Secure: s.Config.CookieSecure, SameSite: http.SameSiteStrictMode})
}

func (s *server) sessionCookieName() string {
	if s.Config.CookieSecure {
		return "__Host-czcms_session"
	}
	return "czcms_session_dev"
}

func (s *server) loginCSRFCookieName() string {
	if s.Config.CookieSecure {
		return "__Host-czcms_login_csrf"
	}
	return "czcms_login_csrf_dev"
}

func (s *server) renderAuth(w http.ResponseWriter, data authPageData) {
	s.prepareAuthHeaders(w)
	if err := s.Template.ExecuteTemplate(w, "auth.html", data); err != nil {
		s.Logger.Error("渲染认证页面失败", "error", err)
	}
}

func (s *server) prepareAuthHeaders(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Robots-Tag", "noindex, nofollow")
}

func (s *server) validFormOrigin(r *http.Request) bool {
	if site := r.Header.Get("Sec-Fetch-Site"); site == "cross-site" {
		return false
	}
	origin := r.Header.Get("Origin")
	if origin == "" {
		return true
	}
	parsed, err := url.Parse(origin)
	if err != nil {
		return false
	}
	expectedScheme := "http"
	if r.TLS != nil || s.Config.PublicHTTPS {
		expectedScheme = "https"
	}
	return strings.EqualFold(parsed.Scheme, expectedScheme) && strings.EqualFold(parsed.Host, r.Host)
}

func (s *server) validSetupAuthority(r *http.Request) bool {
	if s.Config.SetupToken == "" {
		ip := net.ParseIP(s.clientIP(r))
		return ip != nil && ip.IsLoopback()
	}
	supplied := r.FormValue("setup_token")
	return len(supplied) == len(s.Config.SetupToken) && subtle.ConstantTimeCompare([]byte(supplied), []byte(s.Config.SetupToken)) == 1
}

func (s *server) clientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		host = r.RemoteAddr
	}
	remote := net.ParseIP(host)
	if remote != nil && s.isTrustedProxy(remote) {
		parts := strings.Split(r.Header.Get("X-Forwarded-For"), ",")
		if len(parts) > 0 {
			candidate := net.ParseIP(strings.TrimSpace(parts[0]))
			if candidate != nil {
				return candidate.String()
			}
		}
	}
	if remote == nil {
		return "invalid"
	}
	return remote.String()
}

func (s *server) isTrustedProxy(ip net.IP) bool {
	for _, network := range s.trustedProxies {
		if network.Contains(ip) {
			return true
		}
	}
	return false
}

func parseTrustedProxies(values []string) []*net.IPNet {
	var result []*net.IPNet
	for _, value := range values {
		if ip := net.ParseIP(value); ip != nil {
			bits := 128
			if ip.To4() != nil {
				bits = 32
			}
			result = append(result, &net.IPNet{IP: ip, Mask: net.CIDRMask(bits, bits)})
			continue
		}
		_, network, err := net.ParseCIDR(value)
		if err == nil {
			result = append(result, network)
		}
	}
	return result
}

func (s *server) securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		// The authenticated admin editor embeds only these two same-origin
		// preview routes. Keep DENY everywhere else; allowing SAMEORIGIN here
		// does not permit external framing or unauthenticated content embedding.
		previewFrame := strings.HasPrefix(r.URL.Path, "/admin/template-preview/") || strings.HasPrefix(r.URL.Path, "/admin/content-preview/")
		if previewFrame {
			w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		} else {
			w.Header().Set("X-Frame-Options", "DENY")
		}
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()")
		w.Header().Set("Cross-Origin-Opener-Policy", "same-origin")
		w.Header().Set("Cross-Origin-Resource-Policy", "same-origin")
		frameAncestors := "'none'"
		if previewFrame {
			frameAncestors = "'self'"
		}
		w.Header().Set("Content-Security-Policy", "default-src 'self'; style-src 'self' https://fonts.googleapis.com; style-src-attr 'unsafe-inline'; font-src 'self' data: https://fonts.gstatic.com; script-src 'self'; img-src 'self' data: https://images.pexels.com; connect-src 'self'; frame-ancestors "+frameAncestors+"; base-uri 'none'; form-action 'self'; object-src 'none'")
		if r.TLS != nil || s.Config.PublicHTTPS {
			w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}
		next.ServeHTTP(w, r)
	})
}

func (s *server) staticAssets() http.Handler {
	files := http.StripPrefix("/assets/", http.FileServer(http.FS(s.Assets)))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/assets/" || strings.HasSuffix(r.URL.Path, "/") {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Cache-Control", "public, max-age=3600")
		// Go's platform MIME registry can report the obsolete image/svg type on
		// Windows. Browsers enforce the registered SVG type when nosniff is set.
		if strings.HasSuffix(strings.ToLower(r.URL.Path), ".svg") {
			w.Header().Set("Content-Type", "image/svg+xml")
		}
		files.ServeHTTP(w, r)
	})
}

func (s *server) accessLog(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		started := time.Now()
		next.ServeHTTP(ww, r)
		s.Logger.Info("http_request", "method", r.Method, "path", r.URL.Path, "status", ww.Status(), "bytes", strconv.Itoa(ww.BytesWritten()), "duration_ms", time.Since(started).Milliseconds(), "request_id", middleware.GetReqID(r.Context()), "client_ip", s.clientIP(r))
	})
}

func (s *server) audit(r *http.Request, event audit.Event) {
	event.RequestID = middleware.GetReqID(r.Context())
	event.IPAddress = s.clientIP(r)
	event.UserAgent = r.UserAgent()
	if err := s.Audit.Append(r.Context(), event); err != nil {
		s.Logger.Error("写入审计日志失败", "error", err, "action", event.Action)
	}
}

func safeNext(value string) string {
	if !strings.HasPrefix(value, "/admin") || strings.HasPrefix(value, "//") || strings.Contains(value, "\\") || strings.ContainsAny(value, "\r\n") {
		return "/admin"
	}
	return value
}

func loginFailureReason(err error) string {
	if errors.Is(err, auth.ErrAccountLocked) {
		return "account_locked"
	}
	if errors.Is(err, auth.ErrInvalidCredentials) {
		return "invalid_credentials"
	}
	return "internal_error"
}

func decodeJSON(w http.ResponseWriter, r *http.Request, destination any, maximum int64) error {
	r.Body = http.MaxBytesReader(w, r.Body, maximum)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		writeJSONError(w, http.StatusBadRequest, "JSON 请求无效")
		return err
	}
	var extra any
	if err := decoder.Decode(&extra); !errors.Is(err, io.EOF) {
		writeJSONError(w, http.StatusBadRequest, "JSON 请求只能包含一个对象")
		return errors.New("extra JSON data")
	}
	return nil
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeJSONError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
