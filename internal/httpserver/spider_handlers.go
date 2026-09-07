package httpserver

import (
	"context"
	"net/http"
	"strconv"
	"strings"
	"time"

	"czcms/internal/audit"
	"czcms/internal/spider"
)

func (s *server) spiderOverview(w http.ResponseWriter, r *http.Request) {
	session := sessionFromContext(r.Context())
	sites, err := s.Catalog.ListSites(r.Context(), session.User.ID)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取站点范围失败")
		return
	}
	requestedSite := int64(0)
	if raw := strings.TrimSpace(r.URL.Query().Get("site_id")); raw != "" {
		requestedSite, err = strconv.ParseInt(raw, 10, 64)
		if err != nil || requestedSite < 0 {
			writeJSONError(w, http.StatusBadRequest, "站点 ID 无效")
			return
		}
	}
	siteIDs := make([]int64, 0, len(sites))
	for _, site := range sites {
		allowed, scopeErr := s.Authorization.CanAccess(r.Context(), session.User.ID, "seo.manage", site.ID, "*")
		if scopeErr != nil {
			writeJSONError(w, http.StatusInternalServerError, "读取统计权限范围失败")
			return
		}
		if allowed && (requestedSite == 0 || requestedSite == site.ID) {
			siteIDs = append(siteIDs, site.ID)
		}
	}
	if requestedSite > 0 && len(siteIDs) != 1 {
		s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "security.scope_denied", TargetType: "spider_scope", TargetID: strconv.FormatInt(requestedSite, 10), Success: false, Metadata: map[string]any{"permission": "seo.manage"}})
		writeJSONError(w, http.StatusForbidden, "没有查看此站点蜘蛛统计的权限")
		return
	}
	from, to, err := analyticsDateRange(r)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, err.Error())
		return
	}
	if s.Spider == nil {
		writeJSON(w, http.StatusOK, spider.Overview{From: from, To: to, SiteID: requestedSite, Trend: []spider.Day{}, Bots: []spider.Bot{}, TopPages: []spider.TopPage{}, Recent: []spider.Page{}, Alerts: []spider.Alert{}})
		return
	}
	flushCtx, cancel := context.WithTimeout(r.Context(), 250*time.Millisecond)
	_ = s.Spider.Flush(flushCtx)
	cancel()
	filter := spider.Filter{Bot: strings.TrimSpace(r.URL.Query().Get("bot")), Engine: strings.TrimSpace(r.URL.Query().Get("engine")), Status: strings.TrimSpace(r.URL.Query().Get("status"))}
	if filter.Bot != "" && !knownSpiderBot(filter.Bot) {
		writeJSONError(w, http.StatusBadRequest, "蜘蛛筛选条件无效")
		return
	}
	if filter.Engine != "" && !knownSpiderEngine(filter.Engine) {
		writeJSONError(w, http.StatusBadRequest, "搜索引擎分类无效")
		return
	}
	if filter.Status == "" {
		filter.Status = "all"
	}
	if !knownSpiderStatus(filter.Status) {
		writeJSONError(w, http.StatusBadRequest, "响应状态筛选条件无效")
		return
	}
	result, err := s.Spider.Overview(r.Context(), siteIDs, from, to, filter)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取蜘蛛统计失败")
		return
	}
	result.SiteID = requestedSite
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "seo.spider_viewed", TargetType: "spider_analytics", TargetID: strconv.FormatInt(requestedSite, 10), Success: true, Metadata: map[string]any{"from": from, "to": to, "site_count": len(siteIDs), "bot": filter.Bot, "engine": filter.Engine, "status": filter.Status}})
	writeJSON(w, http.StatusOK, result)
}

func knownSpiderBot(value string) bool {
	for _, item := range []string{"Googlebot", "Google-Extended", "Bingbot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "GeminiBot", "ClaudeBot", "PerplexityBot", "YandexBot", "Baiduspider", "DuckDuckBot", "Applebot", "FacebookExternalHit", "其他已识别蜘蛛"} {
		if value == item {
			return true
		}
	}
	return false
}

func knownSpiderEngine(value string) bool {
	for _, item := range []string{"Google", "Bing", "GPT / OpenAI", "Gemini", "其他 AI", "其他搜索引擎"} {
		if value == item {
			return true
		}
	}
	return false
}

func knownSpiderStatus(value string) bool {
	for _, item := range []string{"all", "2xx", "3xx", "4xx", "5xx"} {
		if value == item {
			return true
		}
	}
	return false
}
