package analytics

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"net/http"
	"net/url"
	"strings"
	"sync/atomic"
	"time"
	"unicode"
)

// Signer is deliberately tiny so analytics can derive pseudonymous identifiers
// from the application's keyring without ever persisting raw IPs or cookies.
type Signer interface {
	HMAC(purpose, value string) string
}

type Service struct {
	db        *sql.DB
	signer    Signer
	seen      atomic.Uint64
	dropped   atomic.Uint64
	secure    bool
	retention int
	events    chan Visit
	flushes   chan chan error
	stops     chan chan error
}

func New(db *sql.DB, signer Signer, secureCookie bool) *Service {
	s := &Service{
		db: db, signer: signer, secure: secureCookie, retention: 35,
		events: make(chan Visit, 65536), flushes: make(chan chan error), stops: make(chan chan error),
	}
	go s.consume()
	return s
}

type Visit struct {
	SiteID                                                             int64
	Day, Path, Locale, Title, VisitorHash, SessionID, Device, Referrer string
	RecordedAt                                                         time.Time
}

// PrepareVisit runs before the HTML response is written, because this is the
// only safe time to create first-party cookies. It stores no request data.
func (s *Service) PrepareVisit(w http.ResponseWriter, r *http.Request, siteID int64, locale, title string) *Visit {
	if s == nil || siteID < 1 || r == nil || r.Method != http.MethodGet || r.Header.Get("DNT") == "1" || r.Header.Get("Sec-GPC") == "1" || isBot(r.UserAgent()) {
		return nil
	}
	visitorRaw := cookieValue(r, "_czcms_v")
	if visitorRaw == "" {
		visitorRaw = randomToken(18)
		setCookie(w, "_czcms_v", visitorRaw, 365*24*time.Hour, s.secure)
	}
	sessionRaw := cookieValue(r, "_czcms_s")
	if sessionRaw == "" {
		sessionRaw = randomToken(18)
	}
	now := time.Now().UTC()
	day := now.Format("2006-01-02")
	path := r.URL.Path
	if path == "" {
		path = "/"
	}
	if len(path) > 512 {
		path = path[:512]
	}
	setCookie(w, "_czcms_s", sessionRaw, 30*time.Minute, s.secure)
	return &Visit{SiteID: siteID, Day: day, Path: path, Locale: cleanValue(locale, 32), Title: cleanValue(title, 240), VisitorHash: s.digest("visitor", siteID, visitorRaw), SessionID: s.digest("session", siteID, day+":"+sessionRaw), Device: deviceType(r.UserAgent()), Referrer: referrerHost(r.Referer()), RecordedAt: now}
}

// Track is deliberately non-blocking: an unavailable analytics database must
// never hold up a public page. Queue saturation is measurable but cannot leak
// sensitive request data because the queue already contains only aggregates.
func (s *Service) Track(visit *Visit) {
	if s == nil || visit == nil {
		return
	}
	select {
	case s.events <- *visit:
	default:
		s.dropped.Add(1)
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

func (s *Service) consume() {
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()
	batch := make([]Visit, 0, 64)
	flush := func() error {
		var first error
		for _, visit := range batch {
			if err := s.record(context.Background(), visit); err != nil && first == nil {
				first = err
			}
		}
		batch = batch[:0]
		return first
	}
	for {
		select {
		case visit := <-s.events:
			batch = append(batch, visit)
			if len(batch) >= 64 {
				_ = flush()
			}
		case <-ticker.C:
			_ = flush()
		case ack := <-s.flushes:
		drainFlush:
			for {
				select {
				case visit := <-s.events:
					batch = append(batch, visit)
				default:
					ack <- flush()
					break drainFlush
				}
			}
		case ack := <-s.stops:
			ack <- flush()
			return
		}
	}
}

// record persists a prepared event. It never receives an HTTP request, raw
// cookie, IP address, full UA, Referer URL, or URL query string.
func (s *Service) record(ctx context.Context, visit Visit) error {
	siteID, day, path, locale, title := visit.SiteID, visit.Day, visit.Path, visit.Locale, visit.Title
	visitor, sessionID, device, referrer, now := visit.VisitorHash, visit.SessionID, visit.Device, visit.Referrer, visit.RecordedAt

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err = tx.ExecContext(ctx, `INSERT INTO analytics_daily(site_id, day, pageviews, unique_visitors, sessions, bounce_sessions) VALUES (?, ?, 1, 0, 0, 0)
		ON CONFLICT(site_id, day) DO UPDATE SET pageviews = pageviews + 1`, siteID, day); err != nil {
		return err
	}
	var visitorExists int
	if err = tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM analytics_visitors WHERE site_id = ? AND day = ? AND visitor_hash = ?)`, siteID, day, visitor).Scan(&visitorExists); err != nil {
		return err
	}
	if visitorExists == 0 {
		if _, err = tx.ExecContext(ctx, `INSERT INTO analytics_visitors(site_id, day, visitor_hash, created_at) VALUES (?, ?, ?, ?)`, siteID, day, visitor, now.Format(time.RFC3339Nano)); err != nil {
			return err
		}
		if _, err = tx.ExecContext(ctx, `UPDATE analytics_daily SET unique_visitors = unique_visitors + 1 WHERE site_id = ? AND day = ?`, siteID, day); err != nil {
			return err
		}
	}
	var pageVisitorExists int
	if err = tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM analytics_page_visitors WHERE site_id = ? AND day = ? AND path = ? AND visitor_hash = ?)`, siteID, day, path, visitor).Scan(&pageVisitorExists); err != nil {
		return err
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO analytics_pages(site_id, day, path, locale, title, views, unique_visitors) VALUES (?, ?, ?, ?, ?, 1, ?)
		ON CONFLICT(site_id, day, path) DO UPDATE SET views = views + 1, unique_visitors = unique_visitors + excluded.unique_visitors, locale = excluded.locale, title = CASE WHEN excluded.title <> '' THEN excluded.title ELSE analytics_pages.title END`, siteID, day, path, locale, title, boolInt(pageVisitorExists == 0)); err != nil {
		return err
	}
	if pageVisitorExists == 0 {
		if _, err = tx.ExecContext(ctx, `INSERT INTO analytics_page_visitors(site_id, day, path, visitor_hash) VALUES (?, ?, ?, ?)`, siteID, day, path, visitor); err != nil {
			return err
		}
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO analytics_referrers(site_id, day, source, views) VALUES (?, ?, ?, 1)
		ON CONFLICT(site_id, day, source) DO UPDATE SET views = views + 1`, siteID, day, referrer); err != nil {
		return err
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO analytics_dimensions(site_id, day, dimension, value, views) VALUES (?, ?, 'locale', ?, 1)
		ON CONFLICT(site_id, day, dimension, value) DO UPDATE SET views = views + 1`, siteID, day, locale); err != nil {
		return err
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO analytics_dimensions(site_id, day, dimension, value, views) VALUES (?, ?, 'device', ?, 1)
		ON CONFLICT(site_id, day, dimension, value) DO UPDATE SET views = views + 1`, siteID, day, device); err != nil {
		return err
	}

	var pages int
	err = tx.QueryRowContext(ctx, `SELECT pages FROM analytics_sessions WHERE id = ?`, sessionID).Scan(&pages)
	if err == sql.ErrNoRows {
		if _, err = tx.ExecContext(ctx, `INSERT INTO analytics_sessions(id, site_id, day, visitor_hash, first_path, pages, started_at, last_seen_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)`, sessionID, siteID, day, visitor, path, now.Format(time.RFC3339Nano), now.Format(time.RFC3339Nano)); err != nil {
			return err
		}
		if _, err = tx.ExecContext(ctx, `UPDATE analytics_daily SET sessions = sessions + 1, bounce_sessions = bounce_sessions + 1 WHERE site_id = ? AND day = ?`, siteID, day); err != nil {
			return err
		}
	} else {
		if err != nil {
			return err
		}
		if pages == 1 {
			if _, err = tx.ExecContext(ctx, `UPDATE analytics_daily SET bounce_sessions = MAX(0, bounce_sessions - 1) WHERE site_id = ? AND day = ?`, siteID, day); err != nil {
				return err
			}
		}
		if _, err = tx.ExecContext(ctx, `UPDATE analytics_sessions SET pages = pages + 1, last_seen_at = ? WHERE id = ?`, now.Format(time.RFC3339Nano), sessionID); err != nil {
			return err
		}
	}
	if err = tx.Commit(); err != nil {
		return err
	}
	if s.seen.Add(1)%1000 == 0 {
		go s.cleanup()
	}
	return nil
}

type Overview struct {
	From      string        `json:"from"`
	To        string        `json:"to"`
	SiteID    int64         `json:"site_id"`
	Summary   Summary       `json:"summary"`
	Previous  Summary       `json:"previous"`
	Trend     []Day         `json:"trend"`
	TopPages  []Page        `json:"top_pages"`
	Referrers []Bucket      `json:"referrers"`
	Locales   []Bucket      `json:"locales"`
	Devices   []Bucket      `json:"devices"`
	Sites     []SiteSummary `json:"sites"`
}
type Summary struct {
	Pageviews       int64   `json:"pageviews"`
	UniqueVisitors  int64   `json:"unique_visitors"`
	Sessions        int64   `json:"sessions"`
	BounceRate      float64 `json:"bounce_rate"`
	PagesPerSession float64 `json:"pages_per_session"`
}
type Day struct {
	Date           string `json:"date"`
	Pageviews      int64  `json:"pageviews"`
	UniqueVisitors int64  `json:"unique_visitors"`
	Sessions       int64  `json:"sessions"`
}
type Page struct {
	Path           string `json:"path"`
	Locale         string `json:"locale"`
	Title          string `json:"title"`
	Views          int64  `json:"views"`
	UniqueVisitors int64  `json:"unique_visitors"`
}
type Bucket struct {
	Value string `json:"value"`
	Views int64  `json:"views"`
}
type SiteSummary struct {
	SiteID         int64  `json:"site_id"`
	SiteName       string `json:"site_name"`
	Pageviews      int64  `json:"pageviews"`
	UniqueVisitors int64  `json:"unique_visitors"`
	Sessions       int64  `json:"sessions"`
}

func (s *Service) Overview(ctx context.Context, siteIDs []int64, from, to string, names map[int64]string) (Overview, error) {
	out := Overview{From: from, To: to, SiteID: 0, Trend: []Day{}, TopPages: []Page{}, Referrers: []Bucket{}, Locales: []Bucket{}, Devices: []Bucket{}, Sites: []SiteSummary{}}
	if len(siteIDs) == 0 {
		return out, nil
	}
	marks := strings.TrimRight(strings.Repeat("?,", len(siteIDs)), ",")
	args := make([]any, 0, len(siteIDs)+2)
	for _, id := range siteIDs {
		args = append(args, id)
	}
	args = append(args, from, to)
	rows, err := s.db.QueryContext(ctx, `SELECT site_id, day, pageviews, unique_visitors, sessions, bounce_sessions FROM analytics_daily WHERE site_id IN (`+marks+`) AND day BETWEEN ? AND ? ORDER BY day`, args...)
	if err != nil {
		return out, err
	}
	defer rows.Close()
	trend := map[string]*Day{}
	bounce := int64(0)
	for rows.Next() {
		var siteID int64
		var day string
		var pv, uv, sessions, b int64
		if err = rows.Scan(&siteID, &day, &pv, &uv, &sessions, &b); err != nil {
			return out, err
		}
		d := trend[day]
		if d == nil {
			d = &Day{Date: day}
			trend[day] = d
		}
		d.Pageviews += pv
		d.UniqueVisitors += uv
		d.Sessions += sessions
		out.Summary.Pageviews += pv
		out.Summary.UniqueVisitors += uv
		out.Summary.Sessions += sessions
		bounce += b
	}
	if err = rows.Err(); err != nil {
		return out, err
	}
	for day := from; ; {
		if _, ok := trend[day]; !ok {
			trend[day] = &Day{Date: day}
		}
		if day == to {
			break
		}
		parsed, _ := time.Parse("2006-01-02", day)
		day = parsed.AddDate(0, 0, 1).Format("2006-01-02")
	}
	for day := from; ; {
		out.Trend = append(out.Trend, *trend[day])
		if day == to {
			break
		}
		parsed, _ := time.Parse("2006-01-02", day)
		day = parsed.AddDate(0, 0, 1).Format("2006-01-02")
	}
	if out.Summary.Sessions > 0 {
		out.Summary.BounceRate = float64(bounce) * 100 / float64(out.Summary.Sessions)
		out.Summary.PagesPerSession = float64(out.Summary.Pageviews) / float64(out.Summary.Sessions)
	}
	start, startErr := time.Parse("2006-01-02", from)
	end, endErr := time.Parse("2006-01-02", to)
	if startErr == nil && endErr == nil {
		previousTo := start.AddDate(0, 0, -1)
		previousFrom := previousTo.AddDate(0, 0, -int(end.Sub(start).Hours()/24))
		out.Previous, err = s.summaryFor(ctx, siteIDs, marks, previousFrom.Format("2006-01-02"), previousTo.Format("2006-01-02"))
		if err != nil {
			return out, err
		}
	}
	args2 := make([]any, 0, len(siteIDs)+2)
	for _, id := range siteIDs {
		args2 = append(args2, id)
	}
	args2 = append(args2, from, to)
	if err = s.queryPages(ctx, &out, args2, marks); err != nil {
		return out, err
	}
	if err = s.queryBuckets(ctx, &out, args2, marks, "source"); err != nil {
		return out, err
	}
	if err = s.queryBuckets(ctx, &out, args2, marks, "locale"); err != nil {
		return out, err
	}
	if err = s.queryBuckets(ctx, &out, args2, marks, "device"); err != nil {
		return out, err
	}
	for _, id := range siteIDs {
		var row SiteSummary
		row.SiteID = id
		row.SiteName = names[id]
		if err = s.db.QueryRowContext(ctx, `SELECT COALESCE(SUM(pageviews),0), COALESCE(SUM(unique_visitors),0), COALESCE(SUM(sessions),0) FROM analytics_daily WHERE site_id = ? AND day BETWEEN ? AND ?`, id, from, to).Scan(&row.Pageviews, &row.UniqueVisitors, &row.Sessions); err != nil {
			return out, err
		}
		out.Sites = append(out.Sites, row)
	}
	return out, nil
}

func (s *Service) summaryFor(ctx context.Context, siteIDs []int64, marks, from, to string) (Summary, error) {
	args := make([]any, 0, len(siteIDs)+2)
	for _, id := range siteIDs {
		args = append(args, id)
	}
	args = append(args, from, to)
	var summary Summary
	var bounce int64
	err := s.db.QueryRowContext(ctx, `SELECT COALESCE(SUM(pageviews),0), COALESCE(SUM(unique_visitors),0), COALESCE(SUM(sessions),0), COALESCE(SUM(bounce_sessions),0) FROM analytics_daily WHERE site_id IN (`+marks+`) AND day BETWEEN ? AND ?`, args...).Scan(&summary.Pageviews, &summary.UniqueVisitors, &summary.Sessions, &bounce)
	if err != nil {
		return summary, err
	}
	if summary.Sessions > 0 {
		summary.BounceRate = float64(bounce) * 100 / float64(summary.Sessions)
		summary.PagesPerSession = float64(summary.Pageviews) / float64(summary.Sessions)
	}
	return summary, nil
}

func (s *Service) queryPages(ctx context.Context, out *Overview, args []any, marks string) error {
	rows, err := s.db.QueryContext(ctx, `SELECT path, MAX(locale), MAX(title), SUM(views), SUM(unique_visitors) FROM analytics_pages WHERE site_id IN (`+marks+`) AND day BETWEEN ? AND ? GROUP BY path ORDER BY SUM(views) DESC LIMIT 20`, args...)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var p Page
		if err = rows.Scan(&p.Path, &p.Locale, &p.Title, &p.Views, &p.UniqueVisitors); err != nil {
			return err
		}
		out.TopPages = append(out.TopPages, p)
	}
	return rows.Err()
}
func (s *Service) queryBuckets(ctx context.Context, out *Overview, args []any, marks, dimension string) error {
	rows, err := s.db.QueryContext(ctx, `SELECT `+map[string]string{"source": "source", "locale": "value", "device": "value"}[dimension]+`, SUM(views) FROM `+func() string {
		if dimension == "source" {
			return "analytics_referrers"
		}
		return "analytics_dimensions"
	}()+` WHERE site_id IN (`+marks+`) AND day BETWEEN ? AND ? `+func() string {
		if dimension != "source" {
			return `AND dimension = ? `
		}
		return ""
	}()+`GROUP BY `+map[string]string{"source": "source", "locale": "value", "device": "value"}[dimension]+` ORDER BY SUM(views) DESC LIMIT 12`, func() []any {
		a := append([]any{}, args...)
		if dimension != "source" {
			a = append(a, dimension)
		}
		return a
	}()...)
	if err != nil {
		return err
	}
	defer rows.Close()
	target := &out.Referrers
	if dimension == "locale" {
		target = &out.Locales
	}
	if dimension == "device" {
		target = &out.Devices
	}
	for rows.Next() {
		var b Bucket
		if err = rows.Scan(&b.Value, &b.Views); err != nil {
			return err
		}
		*target = append(*target, b)
	}
	return rows.Err()
}

func (s *Service) digest(purpose string, siteID int64, value string) string {
	if s.signer != nil {
		return s.signer.HMAC("analytics-"+purpose, string(rune(siteID))+":"+value)
	}
	sum := sha256.Sum256([]byte(purpose + ":" + value))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}
func (s *Service) cleanup() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	cutoff := time.Now().UTC().AddDate(0, 0, -s.retention).Format("2006-01-02")
	_, _ = s.db.ExecContext(ctx, `DELETE FROM analytics_visitors WHERE day < ?`, cutoff)
	_, _ = s.db.ExecContext(ctx, `DELETE FROM analytics_page_visitors WHERE day < ?`, cutoff)
	_, _ = s.db.ExecContext(ctx, `DELETE FROM analytics_sessions WHERE day < ?`, cutoff)
}
func cookieValue(r *http.Request, name string) string {
	c, err := r.Cookie(name)
	if err != nil {
		return ""
	}
	return strings.TrimSpace(c.Value)
}
func setCookie(w http.ResponseWriter, name, value string, maxAge time.Duration, secure bool) {
	http.SetCookie(w, &http.Cookie{Name: name, Value: value, Path: "/", MaxAge: int(maxAge.Seconds()), HttpOnly: true, Secure: secure, SameSite: http.SameSiteLaxMode})
}
func randomToken(n int) string {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return time.Now().UTC().Format(time.RFC3339Nano)
	}
	return base64.RawURLEncoding.EncodeToString(b)
}
func boolInt(v bool) int {
	if v {
		return 1
	}
	return 0
}
func cleanValue(v string, max int) string {
	v = strings.TrimSpace(v)
	var b strings.Builder
	for _, r := range v {
		if unicode.IsControl(r) {
			continue
		}
		b.WriteRune(r)
		if b.Len() >= max {
			break
		}
	}
	return b.String()
}
func referrerHost(raw string) string {
	if strings.TrimSpace(raw) == "" {
		return "direct"
	}
	u, err := url.Parse(raw)
	if err != nil || u.Hostname() == "" {
		return "other"
	}
	host := strings.ToLower(u.Hostname())
	host = strings.TrimPrefix(host, "www.")
	if len(host) > 120 {
		return host[:120]
	}
	return host
}
func deviceType(ua string) string {
	u := strings.ToLower(ua)
	switch {
	case strings.Contains(u, "bot") || strings.Contains(u, "spider"):
		return "robot"
	case strings.Contains(u, "ipad") || strings.Contains(u, "tablet"):
		return "tablet"
	case strings.Contains(u, "mobile") || strings.Contains(u, "android"):
		return "mobile"
	default:
		return "desktop"
	}
}
func isBot(ua string) bool {
	u := strings.ToLower(ua)
	for _, v := range []string{"bot", "spider", "crawler", "slurp", "headless", "curl/", "wget/"} {
		if strings.Contains(u, v) {
			return true
		}
	}
	return false
}
