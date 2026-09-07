package httpserver

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"czcms/internal/analytics"
	"czcms/internal/audit"
)

func (s *server) analyticsOverview(w http.ResponseWriter, r *http.Request) {
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
	names := make(map[int64]string, len(sites))
	for _, site := range sites {
		names[site.ID] = site.Name
		allowed, scopeErr := s.Authorization.CanAccess(r.Context(), session.User.ID, "analytics.view", site.ID, "*")
		if scopeErr != nil {
			writeJSONError(w, http.StatusInternalServerError, "读取统计权限范围失败")
			return
		}
		if allowed && (requestedSite == 0 || requestedSite == site.ID) {
			siteIDs = append(siteIDs, site.ID)
		}
	}
	if requestedSite > 0 {
		if len(siteIDs) != 1 {
			s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "security.scope_denied", TargetType: "analytics_scope", TargetID: strconv.FormatInt(requestedSite, 10), Success: false, Metadata: map[string]any{"permission": "analytics.view"}})
			writeJSONError(w, http.StatusForbidden, "没有查看此站点全部流量的权限")
			return
		}
	}
	from, to, err := analyticsDateRange(r)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, err.Error())
		return
	}
	if s.Analytics == nil {
		writeJSON(w, http.StatusOK, analytics.Overview{From: from, To: to, Trend: []analytics.Day{}, TopPages: []analytics.Page{}, Referrers: []analytics.Bucket{}, Locales: []analytics.Bucket{}, Devices: []analytics.Bucket{}, Sites: []analytics.SiteSummary{}})
		return
	}
	// Make freshly queued public visits visible before a user refreshes the
	// dashboard, without coupling the public request to a database write.
	flushCtx, cancel := context.WithTimeout(r.Context(), 250*time.Millisecond)
	_ = s.Analytics.Flush(flushCtx)
	cancel()
	result, err := s.Analytics.Overview(r.Context(), siteIDs, from, to, names)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "读取流量统计失败")
		return
	}
	result.SiteID = requestedSite
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "analytics.viewed", TargetType: "analytics", TargetID: strconv.FormatInt(requestedSite, 10), Success: true, Metadata: map[string]any{"from": from, "to": to, "site_count": len(siteIDs)}})
	writeJSON(w, http.StatusOK, result)
}

func analyticsDateRange(r *http.Request) (string, string, error) {
	fromRaw, toRaw := strings.TrimSpace(r.URL.Query().Get("from")), strings.TrimSpace(r.URL.Query().Get("to"))
	if fromRaw != "" || toRaw != "" {
		if fromRaw == "" || toRaw == "" {
			return "", "", fmt.Errorf("from 和 to 必须同时提供")
		}
		from, err := time.Parse("2006-01-02", fromRaw)
		if err != nil {
			return "", "", fmt.Errorf("开始日期格式无效")
		}
		to, err := time.Parse("2006-01-02", toRaw)
		if err != nil || to.Before(from) {
			return "", "", fmt.Errorf("结束日期格式无效或早于开始日期")
		}
		if to.Sub(from) > 366*24*time.Hour {
			return "", "", fmt.Errorf("日期范围不能超过 367 天")
		}
		return fromRaw, toRaw, nil
	}
	days := 30
	if raw := strings.TrimSpace(r.URL.Query().Get("days")); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil || parsed < 1 || parsed > 366 {
			return "", "", fmt.Errorf("days 必须是 1 到 366")
		}
		days = parsed
	}
	to := time.Now().UTC().Truncate(24 * time.Hour)
	from := to.AddDate(0, 0, -(days - 1))
	return from.Format("2006-01-02"), to.Format("2006-01-02"), nil
}
