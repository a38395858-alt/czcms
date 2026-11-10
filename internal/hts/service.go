package hts

import (
	"bytes"
	"compress/gzip"
	"context"
	"crypto/sha256"
	"database/sql"
	"embed"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"sync/atomic"
	"time"
	_ "time/tzdata"
)

const SourceURL = "https://hts.usitc.gov/"
const PageSize = 25
const MaxQuery = 120

//go:embed data/current.json.gz data/current.meta.json
var seed embed.FS

var ErrQuery = errors.New("Use a 2–10 digit HTS code or up to eight English product keywords (120 characters maximum).")
var ErrBusy = errors.New("HTS synchronization is already running")

type Metadata struct {
	Release       string `json:"release"`
	Label         string `json:"label"`
	EffectiveDate string `json:"effectiveDate"`
	RetrievedAt   string `json:"retrievedAt"`
	SHA256        string `json:"sha256"`
	Entries       int    `json:"entries"`
}

type Status struct {
	Metadata
	LastSuccessAt string `json:"lastSuccessAt"`
	Period        string `json:"completedPeriod"`
	LastAttempt   string `json:"lastAttemptAt"`
	LastError     string `json:"lastError"`
	LeaseUntil    string `json:"leaseUntil"`
	AlertError    string `json:"alertError"`
	AlertStatus   string `json:"alertStatus"`
	Running       bool   `json:"running"`
	Enabled       bool   `json:"autoSync"`
	Timezone      string `json:"timezone"`
	NextSync      string `json:"nextSync"`
}

type Result struct {
	Query    string   `json:"query"`
	Items    []Entry  `json:"items"`
	Total    int      `json:"total"`
	Page     int      `json:"page"`
	PageSize int      `json:"pageSize"`
	Metadata Metadata `json:"metadata"`
}

type Options struct {
	AutoSync   bool
	Timezone   string
	Client     *http.Client
	BaseURL    string // constructor configuration; never accepted from a public request
	MinEntries int
	Alert      func(context.Context, string, string, string) error
}

type Service struct {
	db       *sql.DB
	logger   *slog.Logger
	options  Options
	zone     *time.Location
	initMu   sync.Mutex
	ready    atomic.Bool
	pending  atomic.Bool
	requests chan struct{}
	cancel   context.CancelFunc
	done     chan struct{}
}

func New(db *sql.DB, logger *slog.Logger, options Options) (*Service, error) {
	if options.Timezone == "" {
		options.Timezone = "Asia/Shanghai"
	}
	zone, err := time.LoadLocation(options.Timezone)
	if err != nil {
		return nil, err
	}
	if options.Client == nil {
		options.Client = &http.Client{Timeout: 90 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
	}
	if options.BaseURL == "" {
		options.BaseURL = "https://hts.usitc.gov/reststop"
	}
	if options.MinEntries == 0 {
		options.MinEntries = 10000
	}
	return &Service{db: db, logger: logger, options: options, zone: zone, requests: make(chan struct{}, 1)}, nil
}

func timestamp(t time.Time) string { return t.UTC().Format(time.RFC3339) }

func (s *Service) ensureSeed(ctx context.Context) error {
	if s.ready.Load() {
		return nil
	}
	s.initMu.Lock()
	defer s.initMu.Unlock()
	if s.ready.Load() {
		return nil
	}
	var count, detailVersion int
	if err := s.db.QueryRowContext(ctx, `SELECT row_count,detail_version FROM hts_state WHERE id=1`).Scan(&count, &detailVersion); err != nil {
		return err
	}
	if count > 0 {
		if detailVersion == 0 {
			if err := s.backfillDetailRates(ctx); err != nil {
				return err
			}
		}
		s.ready.Store(true)
		return nil
	}
	metaBody, err := seed.ReadFile("data/current.meta.json")
	if err != nil {
		return err
	}
	var meta Metadata
	if err = json.Unmarshal(metaBody, &meta); err != nil {
		return err
	}
	packed, err := seed.ReadFile("data/current.json.gz")
	if err != nil {
		return err
	}
	r, err := gzip.NewReader(bytes.NewReader(packed))
	if err != nil {
		return err
	}
	defer r.Close()
	body, err := io.ReadAll(io.LimitReader(r, 40<<20))
	if err != nil {
		return err
	}
	if err = s.replace(ctx, body, meta, periodAt(parseStamp(meta.RetrievedAt), s.zone)); err != nil {
		return err
	}
	s.ready.Store(true)
	return nil
}

func parseStamp(value string) time.Time { t, _ := time.Parse(time.RFC3339, value); return t }

func (s *Service) replace(ctx context.Context, body []byte, meta Metadata, period string) error {
	sum := sha256.Sum256(body)
	if meta.SHA256 != hex.EncodeToString(sum[:]) {
		return errors.New("HTS download checksum mismatch")
	}
	entries, err := normalize(body)
	if err != nil {
		return err
	}
	if len(entries) < s.options.MinEntries {
		return errors.New("HTS export is incomplete; previous data retained")
	}
	chapters := map[string]bool{}
	for _, e := range entries {
		chapters[e.Code[:2]] = true
	}
	if s.options.MinEntries >= 10000 && len(chapters) < 90 {
		return errors.New("HTS export is missing chapters")
	}
	if meta.Entries != 0 && meta.Entries != len(entries) {
		return errors.New("HTS snapshot record count mismatch")
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	var oldCount int
	var oldDate string
	if err = tx.QueryRowContext(ctx, `SELECT row_count,effective_date FROM hts_state WHERE id=1`).Scan(&oldCount, &oldDate); err != nil {
		return err
	}
	if len(entries)*100 < oldCount*80 || (oldDate != "" && meta.EffectiveDate < oldDate) {
		return errors.New("HTS export regressed; previous data retained")
	}
	for _, statement := range []string{`DELETE FROM hts_search`, `DELETE FROM hts_entries`} {
		if _, err = tx.ExecContext(ctx, statement); err != nil {
			return err
		}
	}
	insert, err := tx.PrepareContext(ctx, `INSERT INTO hts_entries(id,code,formatted_code,description,hierarchy,units,general_rate,rate_source,footnotes,special_rate,special_source,other_rate,other_source) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`)
	if err != nil {
		return err
	}
	defer insert.Close()
	index, err := tx.PrepareContext(ctx, `INSERT INTO hts_search(rowid,text) VALUES(?,?)`)
	if err != nil {
		return err
	}
	defer index.Close()
	for i, e := range entries {
		hierarchy, _ := json.Marshal(e.Hierarchy)
		notes, _ := json.Marshal(e.Footnotes)
		if _, err = insert.ExecContext(ctx, i+1, e.Code, e.Formatted, e.Description, string(hierarchy), e.Units, e.GeneralRate, e.RateSource, string(notes), e.SpecialRate, e.SpecialSource, e.OtherRate, e.OtherSource); err != nil {
			return err
		}
		text := e.Description
		for _, part := range e.Hierarchy {
			text += " " + part.Description
		}
		if _, err = index.ExecContext(ctx, i+1, text); err != nil {
			return err
		}
	}
	_, err = tx.ExecContext(ctx, `UPDATE hts_state SET release_name=?,release_label=?,effective_date=?,source_sha256=?,row_count=?,last_checked_at=?,last_success_at=?,completed_period=?,last_error='',alert_error='',detail_version=1 WHERE id=1`, meta.Release, meta.Label, meta.EffectiveDate, meta.SHA256, len(entries), meta.RetrievedAt, timestamp(time.Now()), period)
	if err != nil {
		return err
	}
	return tx.Commit()
}

func (s *Service) Status(ctx context.Context) (Status, error) {
	if err := s.ensureSeed(ctx); err != nil {
		return Status{}, err
	}
	var state Status
	err := s.db.QueryRowContext(ctx, `SELECT release_name,release_label,effective_date,source_sha256,row_count,last_checked_at,last_success_at,completed_period,last_attempt_at,last_error,lease_until,alert_error FROM hts_state WHERE id=1`).Scan(&state.Release, &state.Label, &state.EffectiveDate, &state.SHA256, &state.Entries, &state.RetrievedAt, &state.LastSuccessAt, &state.Period, &state.LastAttempt, &state.LastError, &state.LeaseUntil, &state.AlertError)
	state.Enabled, state.Timezone = s.options.AutoSync, s.options.Timezone
	state.Running = s.pending.Load() || parseStamp(state.LeaseUntil).After(time.Now())
	state.NextSync = nextDue(time.Now(), s.zone).Format(time.RFC3339)
	_ = s.db.QueryRowContext(ctx, `SELECT status FROM system_mail_deliveries WHERE event_key LIKE 'hts-sync:%' ORDER BY id DESC LIMIT 1`).Scan(&state.AlertStatus)
	return state, err
}

var codeQuery = regexp.MustCompile(`^[0-9.\s]+$`)
var words = regexp.MustCompile(`[A-Za-z0-9]+`)

func searchClause(query string) (string, []any, bool, error) {
	if len([]rune(query)) > MaxQuery {
		return "", nil, false, ErrQuery
	}
	if codeQuery.MatchString(query) {
		code := strings.Join(strings.Fields(strings.ReplaceAll(query, ".", "")), "")
		if len(code) < 2 || len(code) > 10 {
			return "", nil, false, ErrQuery
		}
		if len(code) == 10 {
			return "e.code=?", []any{code}, false, nil
		}
		return "e.code>=? AND e.code<?", []any{code, code + ":"}, false, nil
	}
	terms := words.FindAllString(strings.ToLower(query), -1)
	if len(terms) == 0 || len(terms) > 8 {
		return "", nil, false, ErrQuery
	}
	for i, word := range terms {
		terms[i] = `"` + word + `"`
		if len(word) >= 3 {
			terms[i] += "*"
		}
	}
	return "hts_search MATCH ?", []any{strings.Join(terms, " AND ")}, true, nil
}

func (s *Service) Search(ctx context.Context, query string, page int) (Result, error) {
	query = strings.Join(strings.Fields(query), " ")
	result := Result{Query: query, Items: []Entry{}, Page: page, PageSize: PageSize}
	if page < 1 || page > 1000 {
		return result, ErrQuery
	}
	if err := s.ensureSeed(ctx); err != nil {
		return result, err
	}
	if query != "" {
		clause, args, fulltext, err := searchClause(query)
		if err != nil {
			return result, err
		}
		from, order := "hts_entries e", "e.code"
		if fulltext {
			from += " JOIN hts_search ON hts_search.rowid=e.id"
			order = "hts_search.rank,e.code"
		}
		// One read transaction keeps a paginated result and its version together
		// even when a background refresh commits concurrently (SQLite WAL).
		tx, err := s.db.BeginTx(ctx, &sql.TxOptions{ReadOnly: true})
		if err != nil {
			return result, err
		}
		defer tx.Rollback()
		if err = tx.QueryRowContext(ctx, "SELECT COUNT(*) FROM "+from+" WHERE "+clause, args...).Scan(&result.Total); err != nil {
			return result, err
		}
		queryArgs := append(append([]any{}, args...), PageSize, (page-1)*PageSize)
		rows, err := tx.QueryContext(ctx, "SELECT e.code,e.formatted_code,e.description,e.hierarchy,e.units,e.general_rate,e.rate_source,e.footnotes,e.special_rate,e.special_source,e.other_rate,e.other_source FROM "+from+" WHERE "+clause+" ORDER BY "+order+" LIMIT ? OFFSET ?", queryArgs...)
		if err != nil {
			return result, err
		}
		for rows.Next() {
			var e Entry
			var hierarchy, notes string
			if err = rows.Scan(&e.Code, &e.Formatted, &e.Description, &hierarchy, &e.Units, &e.GeneralRate, &e.RateSource, &notes, &e.SpecialRate, &e.SpecialSource, &e.OtherRate, &e.OtherSource); err != nil {
				rows.Close()
				return result, err
			}
			if json.Unmarshal([]byte(hierarchy), &e.Hierarchy) != nil || json.Unmarshal([]byte(notes), &e.Footnotes) != nil {
				rows.Close()
				return result, errors.New("invalid stored HTS record")
			}
			result.Items = append(result.Items, e)
		}
		err = rows.Err()
		rows.Close()
		if err != nil {
			return result, err
		}
		if err = scanMeta(ctx, tx, &result.Metadata); err != nil {
			return result, err
		}
		return result, tx.Commit()
	}
	return result, scanMeta(ctx, s.db, &result.Metadata)
}

type queryRower interface {
	QueryRowContext(context.Context, string, ...any) *sql.Row
}

func scanMeta(ctx context.Context, db queryRower, m *Metadata) error {
	return db.QueryRowContext(ctx, `SELECT release_name,release_label,effective_date,last_checked_at,source_sha256,row_count FROM hts_state WHERE id=1`).Scan(&m.Release, &m.Label, &m.EffectiveDate, &m.RetrievedAt, &m.SHA256, &m.Entries)
}

func (e Entry) SourceURL() string { return SourceURL + "search?query=" + e.Formatted }
func (s Status) Summary() string {
	return fmt.Sprintf("%s · %d ten-digit entries", s.Label, s.Entries)
}
