package app

import (
	"context"
	"database/sql"
	"fmt"
	"html/template"
	"io/fs"
	"log/slog"
	"net/http"
	"time"

	webassets "czcms/frontend"
	"czcms/internal/analytics"
	"czcms/internal/audit"
	"czcms/internal/auth"
	"czcms/internal/authorization"
	"czcms/internal/backup"
	"czcms/internal/cache"
	"czcms/internal/catalog"
	"czcms/internal/config"
	"czcms/internal/contentsafety"
	"czcms/internal/database"
	"czcms/internal/filestore"
	"czcms/internal/httpserver"
	"czcms/internal/security"
	"czcms/internal/spider"
)

type App struct {
	db        *sql.DB
	cache     cache.Store
	http      http.Handler
	previews  *localPreviewManager
	analytics *analytics.Service
	spider    *spider.Service
}

func New(rawConfig config.Config, logger *slog.Logger) (*App, error) {
	cfg, err := rawConfig.Normalize()
	if err != nil {
		return nil, err
	}
	ctx, cancel := context.WithTimeout(context.Background(), cfg.RequestTimeout)
	defer cancel()

	db, err := database.Open(ctx, cfg.DatabasePath)
	if err != nil {
		return nil, err
	}
	fail := func(err error) (*App, error) { _ = db.Close(); return nil, err }

	keys, err := security.LoadKeyring(cfg.MasterKey, cfg.SecretsDir, cfg.Environment)
	if err != nil {
		return fail(err)
	}
	authService, err := auth.New(db, keys, auth.Config{IdleTTL: cfg.SessionIdleTTL, AbsoluteTTL: cfg.SessionAbsoluteTTL})
	if err != nil {
		return fail(err)
	}
	fileStore, err := filestore.New(db, cfg.UploadDir, cfg.ThemeDir, cfg.MaxUploadBytes, cfg.MaxThemeBytes, cfg.AntivirusCommand)
	if err != nil {
		return fail(err)
	}
	sanitizer := contentsafety.NewSanitizer()
	backupService, err := backup.New(db, cfg.BackupDir, cfg.UploadDir, cfg.ThemeDir, cfg.BackupKey, cfg.Environment, keys)
	if err != nil {
		return fail(err)
	}

	memory := cache.NewMemory()
	var redisStore cache.Store
	if cfg.RedisAddr != "" {
		redisStore, err = cache.NewRedis(ctx, cache.RedisConfig{
			Addr: cfg.RedisAddr, Username: cfg.RedisUsername, Password: cfg.RedisPassword, Database: cfg.RedisDB,
			TLS: cfg.RedisTLS, TLSServerName: cfg.RedisTLSServerName, CAFile: cfg.RedisCAFile,
		})
		if err != nil {
			logger.Warn("Redis 不可用，已降级为内存缓存", "error", err)
			redisStore = nil
		}
	}
	layered := cache.NewLayered(memory, redisStore, cfg.CacheTTL)

	tmpl, err := template.ParseFS(webassets.Files, "index.html", "auth.html", "public.html", "public-atlas.html", "public-it.html", "public-reference.html", "public-nl.html")
	if err != nil {
		layered.Close()
		return fail(fmt.Errorf("解析后台模板: %w", err))
	}
	staticFS, err := fs.Sub(webassets.Files, "assets")
	if err != nil {
		layered.Close()
		return fail(fmt.Errorf("读取静态资源: %w", err))
	}
	var seoAssistant httpserver.SEOAssistant
	var localizationAssistant httpserver.LocalizationAssistant
	if cfg.AIModel != "" {
		seoAssistant, err = httpserver.NewOpenAICompatibleSEOAssistant(httpserver.OpenAICompatibleSEOConfig{
			BaseURL: cfg.AIBaseURL, APIKey: cfg.AIAPIKey, Model: cfg.AIModel, Timeout: cfg.AIRequestTimeout,
		})
		if err != nil {
			layered.Close()
			return fail(fmt.Errorf("初始化 AI SEO 提取服务: %w", err))
		}
		localizationAssistant, err = httpserver.NewOpenAICompatibleLocalizationAssistant(httpserver.OpenAICompatibleSEOConfig{
			BaseURL: cfg.AIBaseURL, APIKey: cfg.AIAPIKey, Model: cfg.AIModel, Timeout: cfg.AIRequestTimeout,
		})
		if err != nil {
			layered.Close()
			return fail(fmt.Errorf("初始化 AI 内容本土化服务: %w", err))
		}
	}

	previewManager := newLocalPreviewManager(cfg, db, logger)
	analyticsService := analytics.New(db, keys, cfg.CookieSecure)
	spiderService := spider.New(db)
	handler := httpserver.New(httpserver.Dependencies{
		DB: db, Cache: layered, Logger: logger, Template: tmpl, Assets: staticFS, Started: time.Now(), Config: cfg,
		Auth: authService, Authorization: authorization.New(db), Audit: audit.New(db), Keys: keys,
		Sanitizer: sanitizer, Catalog: catalog.New(db, sanitizer), Files: fileStore, Backups: backupService,
		SEOAssistant:          seoAssistant,
		LocalizationAssistant: localizationAssistant,
		Analytics:             analyticsService,
		Spider:                spiderService,
		SyncLocalPreviews:     previewManager.Sync,
	})
	previewManager.SetHandler(handler)
	if err = previewManager.Sync(); err != nil {
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 2*time.Second)
		_ = previewManager.Close(shutdownCtx)
		shutdownCancel()
		layered.Close()
		return fail(err)
	}
	return &App{db: db, cache: layered, http: handler, previews: previewManager, analytics: analyticsService, spider: spiderService}, nil
}

func (a *App) Handler() http.Handler { return a.http }
func (a *App) Close() error          { return a.close() }
