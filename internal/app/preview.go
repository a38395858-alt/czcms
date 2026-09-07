package app

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"

	"czcms/internal/config"
)

type localPreviewSite struct {
	code string
	port int
}

type runningPreview struct {
	code   string
	server *http.Server
}

type localPreviewManager struct {
	mu      sync.Mutex
	cfg     config.Config
	db      *sql.DB
	base    http.Handler
	logger  *slog.Logger
	running map[int]runningPreview
}

func newLocalPreviewManager(cfg config.Config, db *sql.DB, logger *slog.Logger) *localPreviewManager {
	return &localPreviewManager{cfg: cfg, db: db, logger: logger, running: make(map[int]runningPreview)}
}

func (m *localPreviewManager) SetHandler(base http.Handler) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.base = base
}

func (m *localPreviewManager) Sync() error {
	if !m.cfg.LocalPreviewListeners || m.cfg.Environment == "production" {
		return nil
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.base == nil {
		return nil
	}
	rows, err := m.db.Query(`SELECT code, local_port FROM sites WHERE local_port > 0 AND status <> 'disabled' ORDER BY local_port`)
	if err != nil {
		return fmt.Errorf("读取本地预览端口: %w", err)
	}
	defer rows.Close()
	desired := make(map[int]string)
	for rows.Next() {
		var site localPreviewSite
		if err = rows.Scan(&site.code, &site.port); err != nil {
			return err
		}
		desired[site.port] = site.code
	}
	if err = rows.Err(); err != nil {
		return err
	}
	_, adminPort, _ := net.SplitHostPort(m.cfg.HTTPAddr)
	for port, running := range m.running {
		if code, exists := desired[port]; !exists || code != running.code {
			_ = running.server.Close()
			delete(m.running, port)
		}
	}
	for port, code := range desired {
		if strconv.Itoa(port) == adminPort {
			return fmt.Errorf("站点 %s 的本地预览端口 %d 与后台监听端口冲突", code, port)
		}
		if _, exists := m.running[port]; exists {
			continue
		}
		listener, listenErr := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", port))
		if listenErr != nil {
			return fmt.Errorf("启动站点 %s 的本地预览端口 %d: %w", code, port, listenErr)
		}
		server := &http.Server{
			Handler:           localPreviewHandler(m.base, code),
			ReadHeaderTimeout: 5 * time.Second,
			ReadTimeout:       15 * time.Second,
			WriteTimeout:      30 * time.Second,
			IdleTimeout:       60 * time.Second,
			MaxHeaderBytes:    1 << 20,
		}
		m.running[port] = runningPreview{code: code, server: server}
		go func(code string, port int, server *http.Server, listener net.Listener) {
			m.logger.Info("站点本地预览已启动", "site_code", code, "url", fmt.Sprintf("http://localhost:%d", port))
			if serveErr := server.Serve(listener); serveErr != nil && serveErr != http.ErrServerClosed {
				m.logger.Error("站点本地预览异常退出", "site_code", code, "port", port, "error", serveErr)
			}
		}(code, port, server, listener)
	}
	return nil
}

func (m *localPreviewManager) Close(ctx context.Context) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	var result error
	for port, running := range m.running {
		if err := running.server.Shutdown(ctx); err != nil && result == nil {
			result = err
		}
		delete(m.running, port)
	}
	return result
}

func localPreviewHandler(base http.Handler, siteCode string) http.Handler {
	previewPath := "/preview/" + url.PathEscape(siteCode)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/":
			servePreviewPath(base, w, r, previewPath)
		case strings.HasPrefix(r.URL.Path, "/assets/") || strings.HasPrefix(r.URL.Path, "/theme-assets/") || strings.HasPrefix(r.URL.Path, "/media/") || r.URL.Path == "/healthz":
			// Public media is stored and validated by the main handler. Forward
			// immutable /media/{id}/{token} requests so pages rendered on a
			// dedicated site port can display uploaded product and body images.
			base.ServeHTTP(w, r)
		default:
			// A dedicated preview port behaves like a real site: /en and
			// /en/guides/slug are forwarded to the same native HTML renderer.
			// Application paths never cross this boundary.
			if !isSafePreviewPath(r.URL.Path) {
				http.NotFound(w, r)
				return
			}
			servePreviewPath(base, w, r, previewPath+r.URL.Path)
		}
	})
}

func isSafePreviewPath(path string) bool {
	if path == "" || !strings.HasPrefix(path, "/") || strings.Contains(path, "\\") || strings.Contains(path, "..") {
		return false
	}
	first := strings.ToLower(strings.Trim(path, "/"))
	if first == "" {
		return true
	}
	switch strings.Split(first, "/")[0] {
	case "admin", "api", "assets", "healthz", "login", "logout", "setup", "account", "media", "preview":
		return false
	default:
		return true
	}
}

func servePreviewPath(base http.Handler, w http.ResponseWriter, r *http.Request, path string) {
	request := r.Clone(r.Context())
	clonedURL := *r.URL
	clonedURL.Path = path
	clonedURL.RawPath = ""
	request.URL = &clonedURL
	request.Header = r.Header.Clone()
	request.Header.Set("X-CZCMS-Local-Preview", "1")
	base.ServeHTTP(w, request)
}
