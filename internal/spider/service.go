package spider

import (
	"context"
	"database/sql"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"sync/atomic"
	"time"
)

// Service records crawler activity as privacy-safe daily aggregates. Raw IP,
// User-Agent and query strings are intentionally never persisted.
type Service struct {
	db      *sql.DB
	events  chan Crawl
	flushes chan chan error
	stops   chan chan error
	seen    atomic.Uint64
}

type Crawl struct {
	SiteID int64
	Day    string
	Path   string
	Locale string
	Title  string
	Kind   string
	Bot    string
	Status int
	At     time.Time
}

type Filter struct {
	Bot    string
	Engine string // Google, Bing, GPT / OpenAI, Gemini, 其他 AI, 其他搜索引擎
	Status string // all, 2xx, 3xx, 4xx, 5xx
}

type Overview struct {
	From     string    `json:"from"`
	To       string    `json:"to"`
	SiteID   int64     `json:"site_id"`
	Summary  Summary   `json:"summary"`
	Previous Summary   `json:"previous"`
	Trend    []Day     `json:"trend"`
	Bots     []Bot     `json:"bots"`
	TopPages []TopPage `json:"top_pages"`
	Recent   []Page    `json:"recent"`
	Alerts   []Alert   `json:"alerts"`
}

type Summary struct {
	Requests    int64   `json:"requests"`
	CrawledURLs int64   `json:"crawled_urls"`
	Success     int64   `json:"success"`
	SuccessRate float64 `json:"success_rate"`
	Errors      int64   `json:"errors"`
}

type Day struct {
	Date        string `json:"date"`
	Requests    int64  `json:"requests"`
	CrawledURLs int64  `json:"crawled_urls"`
	Success     int64  `json:"success"`
	Errors      int64  `json:"errors"`
}

type Bot struct {
	Name        string  `json:"name"`
	Engine      string  `json:"engine"`
	Requests    int64   `json:"requests"`
	Share       float64 `json:"share"`
	Verified    bool    `json:"verified"`
	Description string  `json:"description"`
}

// TopPage is a bounded, period-level aggregate. It intentionally contains
// only public URL metadata, never the request IP, raw User-Agent, referer or
// query string. Engine is a presentation grouping derived from the recognised
// User-Agent family; it is not proof that a crawler identity was verified.
type TopPage struct {
	Engine        string  `json:"engine"`
	Bot           string  `json:"bot"`
	Path          string  `json:"path"`
	Requests      int64   `json:"requests"`
	Share         float64 `json:"share"`
	ContentType   string  `json:"content_type"`
	Title         string  `json:"title"`
	LastCrawledAt string  `json:"last_crawled_at"`
}

type Page struct {
	Path          string `json:"path"`
	Bot           string `json:"bot"`
	Status        string `json:"status"`
	StatusCode    int    `json:"status_code"`
	ContentType   string `json:"content_type"`
	Title         string `json:"title"`
	LastCrawledAt string `json:"last_crawled_at"`
}

type Alert struct {
	Kind     string `json:"kind"`
	Title    string `json:"title"`
	Detail   string `json:"detail"`
	Severity string `json:"severity"`
}

func New(db *sql.DB) *Service {
	s := &Service{db: db, events: make(chan Crawl, 32768), flushes: make(chan chan error), stops: make(chan chan error)}
	go s.consume()
	return s
}

func (s *Service) Close(ctx context.Context) error {
	if s == nil {
		return nil
	}
	ack := make(chan error, 1)
	select {
	case s.stops <- ack:
	case <-ctx.Done():
		return ctx.Err()
	}
	select {
	case err := <-ack:
		return err
	case <-ctx.Done():
		return ctx.Err()
	}
}

func (s *Service) Flush(ctx context.Context) error {
	if s == nil {
		return nil
	}
	ack := make(chan error, 1)
	select {
	case s.flushes <- ack:
	case <-ctx.Done():
		return ctx.Err()
	}
	select {
	case err := <-ack:
		return err
	case <-ctx.Done():
		return ctx.Err()
	}
}

// Prepare identifies a known crawler without retaining its raw User-Agent.
// It is called only after the public renderer has resolved a site and path.
func (s *Service) Prepare(r *http.Request, siteID int64, locale, title, kind string) *Crawl {
	if s == nil || r == nil || siteID < 1 || r.Method != http.MethodGet {
		return nil
	}
	bot := identifyBot(r.UserAgent())
	if bot == "" || r.Header.Get("DNT") == "1" || r.Header.Get("Sec-GPC") == "1" {
		return nil
	}
	path := r.URL.Path
	if path == "" {
		path = "/"
	}
	if len(path) > 512 {
		path = path[:512]
	}
	now := time.Now().UTC()
	return &Crawl{SiteID: siteID, Day: now.Format("2006-01-02"), Path: path, Locale: trim(locale, 32), Title: trim(title, 240), Kind: trim(kind, 40), Bot: bot, Status: http.StatusOK, At: now}
}

func (s *Service) Track(item *Crawl, status int) {
	if s == nil || item == nil {
		return
	}
	if status >= 100 && status <= 999 {
		item.Status = status
	}
	select {
	case s.events <- *item:
	default:
		// A saturated analytics queue must never slow or fail a public page.
	}
}

func (s *Service) consume() {
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()
	batch := make([]Crawl, 0, 64)
	flush := func() error {
		var first error
		for _, item := range batch {
			if err := s.record(context.Background(), item); err != nil && first == nil {
				first = err
			}
		}
		batch = batch[:0]
		return first
	}
	for {
		select {
		case item := <-s.events:
			batch = append(batch, item)
			if len(batch) >= 64 {
				_ = flush()
			}
		case <-ticker.C:
			_ = flush()
		case ack := <-s.flushes:
			draining := true
			for draining {
				select {
				case item := <-s.events:
					batch = append(batch, item)
				default:
					draining = false
				}
			}
			ack <- flush()
		case ack := <-s.stops:
			ack <- flush()
			return
		}
	}
}

func (s *Service) record(ctx context.Context, item Crawl) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err = tx.ExecContext(ctx, `INSERT INTO spider_daily(site_id, day, requests, crawled_urls, success, errors) VALUES (?, ?, 1, 0, ?, ?)
		ON CONFLICT(site_id, day) DO UPDATE SET requests = requests + 1, success = success + excluded.success, errors = errors + excluded.errors`, item.SiteID, item.Day, boolInt(item.Status >= 200 && item.Status < 300), boolInt(item.Status >= 400)); err != nil {
		return err
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO spider_bots_daily(site_id, day, bot_name, requests) VALUES (?, ?, ?, 1)
		ON CONFLICT(site_id, day, bot_name) DO UPDATE SET requests = requests + 1`, item.SiteID, item.Day, item.Bot); err != nil {
		return err
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO spider_bot_status_daily(site_id, day, bot_name, status_code, requests) VALUES (?, ?, ?, ?, 1)
		ON CONFLICT(site_id, day, bot_name, status_code) DO UPDATE SET requests = requests + 1`, item.SiteID, item.Day, item.Bot, item.Status); err != nil {
		return err
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO spider_status_daily(site_id, day, status_code, requests) VALUES (?, ?, ?, 1)
		ON CONFLICT(site_id, day, status_code) DO UPDATE SET requests = requests + 1`, item.SiteID, item.Day, item.Status); err != nil {
		return err
	}
	var exists int
	if err = tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM spider_pages WHERE site_id = ? AND day = ? AND path = ?)`, item.SiteID, item.Day, item.Path).Scan(&exists); err != nil {
		return err
	}
	if exists == 0 {
		if _, err = tx.ExecContext(ctx, `UPDATE spider_daily SET crawled_urls = crawled_urls + 1 WHERE site_id = ? AND day = ?`, item.SiteID, item.Day); err != nil {
			return err
		}
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO spider_pages(site_id, day, path, bot_name, locale, title, content_type, status_code, crawls, last_crawled_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
		ON CONFLICT(site_id, day, path, bot_name) DO UPDATE SET locale = excluded.locale, title = CASE WHEN excluded.title <> '' THEN excluded.title ELSE spider_pages.title END, content_type = excluded.content_type, status_code = excluded.status_code, crawls = crawls + 1, last_crawled_at = excluded.last_crawled_at`, item.SiteID, item.Day, item.Path, item.Bot, item.Locale, item.Title, item.Kind, item.Status, item.At.Format(time.RFC3339Nano)); err != nil {
		return err
	}
	if err = tx.Commit(); err != nil {
		return err
	}
	s.seen.Add(1)
	return nil
}

func (s *Service) Overview(ctx context.Context, siteIDs []int64, from, to string, filter Filter) (Overview, error) {
	out := Overview{From: from, To: to, Trend: []Day{}, Bots: []Bot{}, TopPages: []TopPage{}, Recent: []Page{}, Alerts: []Alert{}}
	if len(siteIDs) == 0 {
		return out, nil
	}
	marks := strings.TrimRight(strings.Repeat("?,", len(siteIDs)), ",")
	baseArgs := make([]any, 0, len(siteIDs)+2)
	for _, id := range siteIDs {
		baseArgs = append(baseArgs, id)
	}
	baseArgs = append(baseArgs, from, to)
	where, args := filterSQL(filter, baseArgs)
	query := `SELECT day, COALESCE(SUM(requests),0), COALESCE(SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN requests ELSE 0 END),0), COALESCE(SUM(CASE WHEN status_code >= 400 THEN requests ELSE 0 END),0)
		FROM spider_bot_status_daily WHERE site_id IN (` + marks + `) AND day BETWEEN ? AND ?` + where + ` GROUP BY day ORDER BY day`
	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return out, err
	}
	defer rows.Close()
	trendMap := map[string]*Day{}
	for rows.Next() {
		var day string
		var d Day
		if err = rows.Scan(&day, &d.Requests, &d.Success, &d.Errors); err != nil {
			return out, err
		}
		d.Date = day
		trendMap[day] = &d
		out.Summary.Requests += d.Requests
		out.Summary.Success += d.Success
		out.Summary.Errors += d.Errors
	}
	if err = rows.Err(); err != nil {
		return out, err
	}
	for day := from; ; {
		if trendMap[day] == nil {
			trendMap[day] = &Day{Date: day}
		}
		out.Trend = append(out.Trend, *trendMap[day])
		if day == to {
			break
		}
		parsed, parseErr := time.Parse("2006-01-02", day)
		if parseErr != nil {
			break
		}
		day = parsed.AddDate(0, 0, 1).Format("2006-01-02")
	}
	if out.Summary.Requests > 0 {
		out.Summary.SuccessRate = float64(out.Summary.Success) * 100 / float64(out.Summary.Requests)
	}
	pageClause, pageFilterArgs := pageFilterSQL(filter)
	pageQuery := `SELECT COUNT(DISTINCT path) FROM spider_pages WHERE site_id IN (` + marks + `) AND day BETWEEN ? AND ?` + pageClause
	pageArgs := append(append([]any{}, baseArgs...), pageFilterArgs...)
	if err = s.db.QueryRowContext(ctx, pageQuery, pageArgs...).Scan(&out.Summary.CrawledURLs); err != nil {
		return out, err
	}
	previousTo, previousFrom := previousRange(from, to)
	previous, prevErr := s.summary(ctx, siteIDs, previousFrom, previousTo, filter)
	if prevErr != nil {
		return out, prevErr
	}
	out.Previous = previous

	botQuery := `SELECT bot_name, SUM(requests) FROM spider_bot_status_daily WHERE site_id IN (` + marks + `) AND day BETWEEN ? AND ?` + where + ` GROUP BY bot_name ORDER BY SUM(requests) DESC`
	botRows, err := s.db.QueryContext(ctx, botQuery, args...)
	if err != nil {
		return out, err
	}
	defer botRows.Close()
	for botRows.Next() {
		var item Bot
		if err = botRows.Scan(&item.Name, &item.Requests); err != nil {
			return out, err
		}
		item.Engine = botEngine(item.Name)
		if out.Summary.Requests > 0 {
			item.Share = float64(item.Requests) * 100 / float64(out.Summary.Requests)
		}
		item.Verified, item.Description = botInfo(item.Name)
		out.Bots = append(out.Bots, item)
	}
	if err = botRows.Err(); err != nil {
		return out, err
	}
	engineRequests := make(map[string]int64, len(out.Bots))
	for _, item := range out.Bots {
		engineRequests[item.Engine] += item.Requests
	}

	// Return a bounded ranking of paths for each recognised crawler family.
	// This performs the aggregation in SQLite, so a large number of individual
	// crawler requests does not become a large in-memory report.
	topPagesQuery := `SELECT bot_name, path, SUM(crawls), MAX(content_type), MAX(title), MAX(last_crawled_at)
		FROM spider_pages WHERE site_id IN (` + marks + `) AND day BETWEEN ? AND ?` + pageClause + `
		GROUP BY bot_name, path ORDER BY SUM(crawls) DESC, MAX(last_crawled_at) DESC LIMIT 100`
	topPageRows, err := s.db.QueryContext(ctx, topPagesQuery, pageArgs...)
	if err != nil {
		return out, err
	}
	defer topPageRows.Close()
	topPageMap := make(map[string]TopPage)
	for topPageRows.Next() {
		var item TopPage
		if err = topPageRows.Scan(&item.Bot, &item.Path, &item.Requests, &item.ContentType, &item.Title, &item.LastCrawledAt); err != nil {
			return out, err
		}
		item.Engine = botEngine(item.Bot)
		key := item.Engine + "\x00" + item.Path
		if existing, ok := topPageMap[key]; ok {
			existing.Requests += item.Requests
			if item.LastCrawledAt > existing.LastCrawledAt {
				existing.LastCrawledAt = item.LastCrawledAt
			}
			if existing.Title == "" {
				existing.Title = item.Title
			}
			if existing.ContentType == "" {
				existing.ContentType = item.ContentType
			}
			existing.Bot = existing.Bot + "、" + item.Bot
			topPageMap[key] = existing
		} else {
			topPageMap[key] = item
		}
	}
	if err = topPageRows.Err(); err != nil {
		return out, err
	}
	for _, item := range topPageMap {
		if total := engineRequests[item.Engine]; total > 0 {
			item.Share = float64(item.Requests) * 100 / float64(total)
		}
		out.TopPages = append(out.TopPages, item)
	}
	sort.SliceStable(out.TopPages, func(i, j int) bool {
		if out.TopPages[i].Requests == out.TopPages[j].Requests {
			return out.TopPages[i].LastCrawledAt > out.TopPages[j].LastCrawledAt
		}
		return out.TopPages[i].Requests > out.TopPages[j].Requests
	})

	recentQuery := `SELECT path, bot_name, status_code, MAX(content_type), MAX(title), MAX(last_crawled_at) FROM spider_pages WHERE site_id IN (` + marks + `) AND day BETWEEN ? AND ?` + pageClause + ` GROUP BY path, bot_name, status_code ORDER BY MAX(last_crawled_at) DESC LIMIT 20`
	recentRows, err := s.db.QueryContext(ctx, recentQuery, pageArgs...)
	if err != nil {
		return out, err
	}
	defer recentRows.Close()
	for recentRows.Next() {
		var item Page
		if err = recentRows.Scan(&item.Path, &item.Bot, &item.StatusCode, &item.ContentType, &item.Title, &item.LastCrawledAt); err != nil {
			return out, err
		}
		item.Status = statusLabel(item.StatusCode)
		out.Recent = append(out.Recent, item)
	}
	if err = recentRows.Err(); err != nil {
		return out, err
	}
	out.Alerts = buildAlerts(out.Trend)
	return out, nil
}

func (s *Service) summary(ctx context.Context, siteIDs []int64, from, to string, filter Filter) (Summary, error) {
	if from == "" || to == "" {
		return Summary{}, nil
	}
	marks := strings.TrimRight(strings.Repeat("?,", len(siteIDs)), ",")
	args := make([]any, 0, len(siteIDs)+2)
	for _, id := range siteIDs {
		args = append(args, id)
	}
	args = append(args, from, to)
	where, args := filterSQL(filter, args)
	var out Summary
	err := s.db.QueryRowContext(ctx, `SELECT COALESCE(SUM(requests),0), COALESCE(SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN requests ELSE 0 END),0), COALESCE(SUM(CASE WHEN status_code >= 400 THEN requests ELSE 0 END),0) FROM spider_bot_status_daily WHERE site_id IN (`+marks+`) AND day BETWEEN ? AND ?`+where, args...).Scan(&out.Requests, &out.Success, &out.Errors)
	if err != nil {
		return out, err
	}
	if out.Requests > 0 {
		out.SuccessRate = float64(out.Success) * 100 / float64(out.Requests)
	}
	return out, nil
}

func filterSQL(filter Filter, args []any) (string, []any) {
	where := ""
	if filter.Bot != "" {
		where += " AND bot_name = ?"
		args = append(args, filter.Bot)
	}
	if names := engineBots(filter.Engine); len(names) > 0 {
		where += " AND bot_name IN (" + strings.TrimRight(strings.Repeat("?,", len(names)), ",") + ")"
		for _, name := range names {
			args = append(args, name)
		}
	}
	if filter.Status != "" && filter.Status != "all" {
		where += " AND status_code BETWEEN ? AND ?"
		args = append(args, statusMin(filter.Status), statusMax(filter.Status))
	}
	return where, args
}

func pageFilterSQL(filter Filter) (string, []any) {
	where := ""
	args := []any{}
	if filter.Bot != "" {
		where += " AND bot_name = ?"
		args = append(args, filter.Bot)
	}
	if names := engineBots(filter.Engine); len(names) > 0 {
		where += " AND bot_name IN (" + strings.TrimRight(strings.Repeat("?,", len(names)), ",") + ")"
		for _, name := range names {
			args = append(args, name)
		}
	}
	if filter.Status != "" && filter.Status != "all" {
		where += " AND status_code BETWEEN ? AND ?"
	}
	if filter.Status != "" && filter.Status != "all" {
		args = append(args, statusMin(filter.Status), statusMax(filter.Status))
	}
	return where, args
}

func engineBots(engine string) []string {
	switch engine {
	case "Google":
		return []string{"Googlebot"}
	case "Bing":
		return []string{"Bingbot"}
	case "GPT / OpenAI":
		return []string{"GPTBot", "OAI-SearchBot", "ChatGPT-User"}
	case "Gemini":
		return []string{"Google-Extended", "GeminiBot"}
	case "其他 AI":
		return []string{"ClaudeBot", "PerplexityBot"}
	case "其他搜索引擎":
		return []string{"YandexBot", "Baiduspider", "DuckDuckBot", "Applebot", "FacebookExternalHit", "其他已识别蜘蛛"}
	default:
		return nil
	}
}

func statusMin(value string) int {
	switch value {
	case "2xx":
		return 200
	case "3xx":
		return 300
	case "4xx":
		return 400
	case "5xx":
		return 500
	default:
		return 100
	}
}
func statusMax(value string) int {
	switch value {
	case "2xx":
		return 299
	case "3xx":
		return 399
	case "4xx":
		return 499
	case "5xx":
		return 599
	default:
		return 999
	}
}

func previousRange(from, to string) (string, string) {
	start, startErr := time.Parse("2006-01-02", from)
	end, endErr := time.Parse("2006-01-02", to)
	if startErr != nil || endErr != nil || end.Before(start) {
		return "", ""
	}
	days := int(end.Sub(start).Hours()/24) + 1
	prevTo := start.AddDate(0, 0, -1)
	return prevTo.AddDate(0, 0, -(days - 1)).Format("2006-01-02"), prevTo.Format("2006-01-02")
}

func buildAlerts(trend []Day) []Alert {
	alerts := make([]Alert, 0, 3)
	var errors, requests int64
	for _, day := range trend {
		errors += day.Errors
		requests += day.Requests
	}
	if errors > 0 {
		severity := "medium"
		if requests > 0 && float64(errors)*100/float64(requests) >= 10 {
			severity = "high"
		}
		alerts = append(alerts, Alert{Kind: "errors", Title: "异常响应需要处理", Detail: "发现 " + formatInt(errors) + " 次 4xx / 5xx 响应，请检查对应 URL。", Severity: severity})
	}
	if len(trend) >= 2 {
		last, previous := trend[len(trend)-1], trend[len(trend)-2]
		if previous.Requests >= 10 && last.Requests*100 < previous.Requests*70 {
			alerts = append(alerts, Alert{Kind: "drop", Title: "抓取量明显下降", Detail: "最近一天抓取请求较前一天下降超过 30%。", Severity: "medium"})
		}
	}
	if len(alerts) == 0 {
		alerts = append(alerts, Alert{Kind: "ok", Title: "蜘蛛抓取运行正常", Detail: "当前统计周期未发现异常响应或抓取量骤降。", Severity: "low"})
	}
	return alerts
}

func identifyBot(ua string) string {
	u := strings.ToLower(ua)
	for _, item := range []struct{ key, name string }{
		{"oai-searchbot", "OAI-SearchBot"},
		{"chatgpt-user", "ChatGPT-User"},
		{"gptbot", "GPTBot"},
		{"google-extended", "Google-Extended"},
		{"gemini", "GeminiBot"},
		{"claudebot", "ClaudeBot"},
		{"anthropic-ai", "ClaudeBot"},
		{"perplexitybot", "PerplexityBot"},
		{"googlebot", "Googlebot"},
		{"bingbot", "Bingbot"},
		{"yandexbot", "YandexBot"},
		{"baiduspider", "Baiduspider"},
		{"duckduckbot", "DuckDuckBot"},
		{"applebot", "Applebot"},
		{"facebookexternalhit", "FacebookExternalHit"},
	} {
		if strings.Contains(u, item.key) {
			return item.name
		}
	}
	if strings.Contains(u, "bot") || strings.Contains(u, "spider") || strings.Contains(u, "crawler") {
		return "其他已识别蜘蛛"
	}
	return ""
}

// botEngine is intentionally a reporting category rather than an identity
// claim. The value is derived from a self-declared User-Agent and is useful
// for grouping pages by crawler family in the SEO report.
func botEngine(name string) string {
	switch name {
	case "Googlebot":
		return "Google"
	case "Bingbot":
		return "Bing"
	case "GPTBot", "OAI-SearchBot", "ChatGPT-User":
		return "GPT / OpenAI"
	case "Google-Extended", "GeminiBot":
		return "Gemini"
	case "ClaudeBot", "PerplexityBot":
		return "其他 AI"
	default:
		return "其他搜索引擎"
	}
}

func botInfo(name string) (bool, string) {
	switch name {
	case "Googlebot":
		return false, "UA 识别 · Google 搜索，未验证来源"
	case "Bingbot":
		return false, "UA 识别 · Microsoft Bing，未验证来源"
	case "GPTBot", "OAI-SearchBot", "ChatGPT-User":
		return false, "UA 识别 · OpenAI，未验证来源"
	case "Google-Extended", "GeminiBot":
		return false, "UA 识别 · Google AI，未验证来源"
	default:
		return false, "UA 识别 · 未验证来源"
	}
}

func statusLabel(code int) string {
	switch {
	case code >= 200 && code < 300:
		return "200 正常"
	case code >= 300 && code < 400:
		return "301 / 302 跳转"
	case code == 404:
		return "404 未找到"
	case code >= 400 && code < 500:
		return "4xx 异常"
	case code >= 500:
		return "5xx 服务异常"
	default:
		return "响应 " + formatInt(int64(code))
	}
}

func trim(value string, max int) string {
	value = strings.TrimSpace(value)
	if len(value) > max {
		return value[:max]
	}
	return value
}
func formatInt(value int64) string {
	return strconv.FormatInt(value, 10)
}
func boolInt(value bool) int {
	if value {
		return 1
	}
	return 0
}
