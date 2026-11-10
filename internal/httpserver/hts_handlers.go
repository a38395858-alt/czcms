package httpserver

import (
	"errors"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"

	"czcms/internal/audit"
	"czcms/internal/hts"
)

const htsLookupSlug = "tools/hts-code-lookup"

var errHTSCodeNotFound = errors.New("HTS code not found")
var htsExactCode = regexp.MustCompile(`^[0-9]{10}$`)

type htsDetailPage struct {
	hts.Entry
	Metadata    hts.Metadata
	Name        string
	CheckedAt   string
	EffectiveAt string
	Chapter     string
	BackURL     string
}

func (s *server) configureHTSDetail(r *http.Request, data *publicSitePageData, code string) error {
	if !htsExactCode.MatchString(code) {
		return errHTSCodeNotFound
	}
	if s.HTS == nil {
		return errors.New("HTS service unavailable")
	}
	result, err := s.HTS.Search(r.Context(), code, 1)
	if err != nil {
		return err
	}
	if len(result.Items) != 1 {
		return errHTSCodeNotFound
	}
	e := result.Items[0]
	p := &htsDetailPage{Entry: e, Metadata: result.Metadata, Name: e.DisplayName(), Chapter: code[:2], BackURL: data.HTSLookupURL + "?q=" + code[:4]}
	if checked, err := time.Parse(time.RFC3339, p.Metadata.RetrievedAt); err == nil {
		p.CheckedAt = checked.Format("2 Jan 2006")
	}
	if effective, err := time.Parse("2006-01-02", p.Metadata.EffectiveDate); err == nil {
		p.EffectiveAt = effective.Format("2 Jan 2006")
	}
	data.IsHTSLookup, data.HTSDetail = true, p
	data.RobotsIndex = r.URL.RawQuery == ""
	name := p.Name
	if len([]rune(name)) > 90 {
		name = string([]rune(name)[:87]) + "…"
	}
	data.PageTitle = e.Formatted + " · " + name + " | US HTS | FreightVanta"
	data.MetaDescription = "US HTS " + e.Formatted + ": " + name + ". Check general, preferential and non-NTR duty rates, reporting units, legal classification and source version."
	data.MetaKeywords = "US HTS " + code + ", customs code details, US import duty, tariff classification"
	data.OGTitle, data.OGDescription = data.PageTitle, data.MetaDescription
	return nil
}

type htsLookupPage struct {
	hts.Result
	Items        []htsLookupItem
	Error        string
	CheckedAt    string
	PreviousURL  string
	NextURL      string
	PreviousPage int
	NextPage     int
}

type htsLookupItem struct {
	hts.Entry
	DetailURL string
}

func htsPageNumber(r *http.Request) int {
	if !r.URL.Query().Has("page") {
		return 1
	}
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		return 0
	}
	return page
}

func (s *server) configureHTSLookup(r *http.Request, data *publicSitePageData) error {
	if s.HTS == nil {
		return errors.New("HTS service unavailable")
	}
	query := strings.Join(strings.Fields(r.URL.Query().Get("q")), " ")
	result, err := s.HTS.Search(r.Context(), query, htsPageNumber(r))
	page := &htsLookupPage{Result: result}
	if errors.Is(err, hts.ErrQuery) {
		page.Result, err = s.HTS.Search(r.Context(), "", 1)
		page.Query = query
		if len([]rune(query)) > hts.MaxQuery {
			page.Query = string([]rune(query)[:hts.MaxQuery])
		}
		page.Error = hts.ErrQuery.Error()
	}
	if err != nil {
		return err
	}
	for _, entry := range page.Result.Items {
		page.Items = append(page.Items, htsLookupItem{Entry: entry, DetailURL: entry.DetailURL(data.HTSLookupURL)})
	}
	if checked, err := time.Parse(time.RFC3339, page.Metadata.RetrievedAt); err == nil {
		page.CheckedAt = checked.Format("2 January 2006")
	}
	if page.Page > 1 {
		page.PreviousURL = data.HTSLookupURL + "?q=" + url.QueryEscape(query) + "&page=" + strconv.Itoa(page.Page-1)
		page.PreviousPage = page.Page - 1
	}
	if page.Page*hts.PageSize < page.Total {
		page.NextURL = data.HTSLookupURL + "?q=" + url.QueryEscape(query) + "&page=" + strconv.Itoa(page.Page+1)
		page.NextPage = page.Page + 1
	}
	data.IsHTSLookup, data.HTSLookup = true, page
	data.RobotsIndex = r.URL.RawQuery == ""
	data.PageTitle = "US Customs Code Lookup (HTS) & Import Duty Rates | FreightVanta"
	data.MetaDescription = "Find US import customs codes for clothing, footwear, furniture and other products. Search 10-digit HTS codes, official descriptions, units and General duty rates."
	data.MetaKeywords = "US customs code lookup, HTS code search, import customs classification, US import duty rate, ten digit customs code, USITC tariff schedule"
	data.OGTitle, data.OGDescription = data.PageTitle, data.MetaDescription
	return nil
}

func (s *server) htsSearch(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	w.Header().Set("X-Robots-Tag", "noindex, nofollow")
	if !s.htsSearchLimiter.Allow(s.clientIP(r)) {
		w.Header().Set("Retry-After", "10")
		writeJSONError(w, 429, "Too many searches. Wait a moment and try again.")
		return
	}
	if s.HTS == nil {
		writeJSONError(w, 503, "Tariff data is temporarily unavailable. Try again shortly.")
		return
	}
	result, err := s.HTS.Search(r.Context(), r.URL.Query().Get("q"), htsPageNumber(r))
	if errors.Is(err, hts.ErrQuery) {
		writeJSONError(w, 400, hts.ErrQuery.Error())
		return
	}
	if err != nil {
		s.Logger.Error("HTS search failed", "error", err)
		writeJSONError(w, 503, "Tariff data is temporarily unavailable. Try again shortly.")
		return
	}
	writeJSON(w, 200, result)
}

func (s *server) htsStatus(w http.ResponseWriter, r *http.Request) {
	if s.HTS == nil {
		writeJSONError(w, 503, "HTS 服务暂不可用")
		return
	}
	state, err := s.HTS.Status(r.Context())
	if err != nil {
		writeJSONError(w, 500, "读取 HTS 更新状态失败")
		return
	}
	notification := map[string]any{"enabled": false, "recipient": ""}
	if s.Mail != nil {
		if cfg, err := s.Mail.Settings(r.Context()); err == nil {
			notification["enabled"], notification["recipient"] = cfg.Enabled, cfg.Recipient
		}
	}
	writeJSON(w, 200, map[string]any{"status": state, "notification": notification})
}

func (s *server) htsSync(w http.ResponseWriter, r *http.Request) {
	if s.HTS == nil {
		writeJSONError(w, 503, "HTS 服务暂不可用")
		return
	}
	state, err := s.HTS.Status(r.Context())
	if err != nil {
		writeJSONError(w, 500, "读取 HTS 更新状态失败")
		return
	}
	if state.Running || !s.HTS.Trigger() {
		writeJSONError(w, 409, "HTS 数据正在更新，请稍后刷新状态")
		return
	}
	session := sessionFromContext(r.Context())
	s.audit(r, audit.Event{ActorUserID: &session.User.ID, Action: "system.hts_sync_requested", TargetType: "hts_state", TargetID: "1", Success: true})
	writeJSON(w, http.StatusAccepted, map[string]any{"queued": true, "message": "更新任务已加入队列。校验通过后整体切换，当前数据继续服务。"})
}
