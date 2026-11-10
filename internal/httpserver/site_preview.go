package httpserver

import (
	"fmt"

	"czcms/internal/catalog"
)

type siteResponse struct {
	catalog.Site
	PreviewURL string `json:"preview_url"`
}

func (s *server) sitePreviewOrigin(code, domain string, port int) string {
	if origin := s.Config.PreviewOrigins[code]; origin != "" {
		return origin
	}
	if s.Config.Environment == "production" {
		if domain != "" {
			return "https://" + domain
		}
		return ""
	}
	return fmt.Sprintf("http://localhost:%d", port)
}

func (s *server) presentSite(site catalog.Site) siteResponse {
	return siteResponse{Site: site, PreviewURL: s.sitePreviewOrigin(site.Code, site.PrimaryDomain, site.LocalPort)}
}
