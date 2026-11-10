package app

import (
	"net/http"
	"net/url"
	"strings"

	"czcms/internal/config"
)

// Remote previews reuse the local-port adapter without opening Go listeners
// to the Internet. Nginx terminates HTTPS and preserves Host:port.
func remotePreviewHandler(base http.Handler, cfg config.Config) http.Handler {
	if len(cfg.PreviewOrigins) == 0 && cfg.Environment != "production" {
		return base
	}
	handlers := make(map[string]http.Handler, len(cfg.PreviewOrigins))
	for code := range cfg.PreviewOrigins {
		handlers[code] = localPreviewHandler(base, code)
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/preview" || strings.HasPrefix(r.URL.Path, "/preview/") {
			parts := strings.SplitN(strings.TrimPrefix(r.URL.Path, "/preview/"), "/", 2)
			origin := cfg.PreviewOrigins[parts[0]]
			if origin == "" {
				http.NotFound(w, r)
				return
			}
			target, _ := url.Parse(origin)
			target.Path = "/"
			if len(parts) == 2 {
				target.Path += parts[1]
			}
			target.RawQuery = r.URL.RawQuery
			w.Header().Set("X-Robots-Tag", "noindex, nofollow")
			w.Header().Set("Cache-Control", "no-store")
			// Temporary and method-preserving: real domains will replace these
			// ports, and legacy form posts must retain their payload.
			http.Redirect(w, r, target.String(), http.StatusTemporaryRedirect)
			return
		}
		if handler := handlers[cfg.PreviewSiteCode(r.Host)]; handler != nil {
			handler.ServeHTTP(w, r)
			return
		}
		base.ServeHTTP(w, r)
	})
}
