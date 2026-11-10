// Package taric keeps EU classification data separate from the US HTS schedule.
package taric

import (
	"bytes"
	"compress/gzip"
	"context"
	"crypto/sha256"
	"database/sql"
	_ "embed"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"
	"unicode"

	"golang.org/x/net/html"
)

const Source = "https://ec.europa.eu/taxation_customs/dds2/taric/"
const PageSize = 25

//go:embed data/current.json.gz
var seed []byte

var seedOnce sync.Once
var seedSnapshot Snapshot
var seedError error

var ErrQuery = errors.New("invalid tariff query")
var Languages = []string{"de", "fr", "es", "it", "nl"}
var digits = regexp.MustCompile(`^[0-9]{2,10}$`)

type Part struct {
	Code        string `json:"code"`
	Description string `json:"description"`
}
type Entry struct {
	Code        string   `json:"code"`
	Description string   `json:"description"`
	Hierarchy   []Part   `json:"hierarchy"`
	Unit        string   `json:"unit"`
	Notes       []string `json:"notes"`
	search      string
}

func (e Entry) Formatted() string {
	return e.Code[:4] + " " + e.Code[4:6] + " " + e.Code[6:8] + " " + e.Code[8:]
}
func (e Entry) Name() string {
	if !genericDescription(e.Description) {
		return e.Description
	}
	for i := len(e.Hierarchy) - 1; i >= 0; i-- {
		if !genericDescription(e.Hierarchy[i].Description) {
			return strings.TrimRight(e.Hierarchy[i].Description, " :") + " · " + e.Description
		}
	}
	return e.Description
}
func genericDescription(s string) bool {
	v := strings.Trim(strings.ToLower(s), " :.")
	return v == "andere" || v == "anderer" || v == "andere waren" || v == "autres" || v == "autre" || v == "los demás" || v == "las demás" || v == "altri" || v == "altre" || v == "altro" || v == "andere goederen" || v == "overige"
}

type Snapshot struct {
	Date        string                       `json:"date"`
	RetrievedAt string                       `json:"retrievedAt"`
	Source      string                       `json:"source"`
	Languages   map[string][]Entry           `json:"languages"`
	Notes       map[string]map[string]string `json:"notes"`
}
type Result struct {
	Items       []Entry `json:"items"`
	Query       string  `json:"query"`
	Total       int     `json:"total"`
	Page        int     `json:"page"`
	Date        string  `json:"date"`
	RetrievedAt string  `json:"retrievedAt"`
	ForeignCode bool    `json:"foreignCode"`
}
type Options struct {
	Path     string
	Client   *http.Client
	BaseURL  string
	AutoSync bool
	Alert    func(context.Context, string, string, string) error
}
type Service struct {
	db       *sql.DB
	log      *slog.Logger
	opts     Options
	mu       sync.RWMutex
	snapshot Snapshot
	syncMu   sync.Mutex
	ratesMu  sync.Mutex
	cancel   context.CancelFunc
	done     chan struct{}
}

func New(db *sql.DB, logger *slog.Logger, opts Options) (*Service, error) {
	if logger == nil {
		logger = slog.Default()
	}
	if opts.Client == nil {
		opts.Client = &http.Client{Timeout: 35 * time.Second}
	}
	if opts.BaseURL == "" {
		opts.BaseURL = Source
	}
	s := &Service{db: db, log: logger, opts: opts, done: make(chan struct{})}
	seedOnce.Do(func() { seedSnapshot, seedError = decode(seed) })
	if seedError != nil {
		return nil, seedError
	}
	s.snapshot = seedSnapshot
	if opts.Path != "" {
		if saved, err := os.ReadFile(opts.Path); err == nil {
			if snap, err := decode(saved); err == nil && snap.Date >= seedSnapshot.Date {
				s.snapshot = snap
			}
		}
	}
	if db != nil {
		_, err := db.Exec(`CREATE TABLE IF NOT EXISTS taric_measure_cache (cache_key TEXT PRIMARY KEY, payload TEXT NOT NULL, checked_at TEXT NOT NULL)`)
		if err != nil {
			return nil, err
		}
	}
	return s, nil
}
func decode(data []byte) (Snapshot, error) {
	var snap Snapshot
	zr, err := gzip.NewReader(bytes.NewReader(data))
	if err != nil {
		return snap, err
	}
	defer zr.Close()
	if err = json.NewDecoder(io.LimitReader(zr, 350<<20)).Decode(&snap); err != nil {
		return snap, err
	}
	if _, err = time.Parse("2006-01-02", snap.Date); err != nil {
		return snap, err
	}
	for _, lang := range Languages {
		rows := snap.Languages[lang]
		if len(rows) < 15000 {
			return snap, fmt.Errorf("incomplete %s classification: %d", lang, len(rows))
		}
		seen := map[string]bool{}
		for i := range rows {
			e := &rows[i]
			if len(e.Code) != 10 || !digits.MatchString(e.Code) || e.Description == "" || seen[e.Code] {
				return snap, errors.New("invalid classification record")
			}
			seen[e.Code] = true
			text := e.Code + " " + e.Description
			for _, p := range e.Hierarchy {
				text += " " + p.Description
			}
			e.search = fold(text)
		}
		sort.Slice(rows, func(i, j int) bool { return rows[i].Code < rows[j].Code })
		snap.Languages[lang] = rows
	}
	for _, lang := range Languages[1:] {
		for i, e := range snap.Languages[Languages[0]] {
			if len(snap.Languages[lang]) != len(snap.Languages[Languages[0]]) || snap.Languages[lang][i].Code != e.Code {
				return snap, errors.New("language code sets differ")
			}
		}
	}
	return snap, nil
}
func Supported(lang string) bool {
	for _, v := range Languages {
		if v == lang {
			return true
		}
	}
	return false
}
func fold(s string) string {
	s = strings.ToLower(s)
	return strings.Map(func(r rune) rune {
		switch {
		case strings.ContainsRune("àáâãäå", r):
			return 'a'
		case strings.ContainsRune("èéêë", r):
			return 'e'
		case strings.ContainsRune("ìíîï", r):
			return 'i'
		case strings.ContainsRune("òóôõö", r):
			return 'o'
		case strings.ContainsRune("ùúûü", r):
			return 'u'
		case r == 'ç':
			return 'c'
		case r == 'ñ':
			return 'n'
		case unicode.IsLetter(r) || unicode.IsDigit(r):
			return r
		default:
			return ' '
		}
	}, s)
}
func NormalizeCode(q string) string {
	return strings.NewReplacer(" ", "", ".", "", "\u00a0", "").Replace(q)
}
func (s *Service) Search(lang, q string, page int) (Result, error) {
	q = strings.Join(strings.Fields(q), " ")
	r := Result{Query: q, Page: page, Items: []Entry{}}
	if !Supported(lang) || len([]rune(q)) > 120 || page < 1 || page > 10000 {
		return r, ErrQuery
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	r.Date = s.snapshot.Date
	r.RetrievedAt = s.snapshot.RetrievedAt
	if q == "" {
		return r, nil
	}
	code := NormalizeCode(q)
	numeric := digits.MatchString(code)
	terms := strings.Fields(fold(q))
	if len(terms) == 0 {
		return r, ErrQuery
	}
	for _, e := range s.snapshot.Languages[lang] {
		match := true
		if numeric {
			match = strings.HasPrefix(e.Code, code)
		} else {
			for _, t := range terms {
				if !strings.Contains(e.search, t) {
					match = false
					break
				}
			}
		}
		if match {
			if r.Total >= (page-1)*PageSize && len(r.Items) < PageSize {
				r.Items = append(r.Items, e)
			}
			r.Total++
		}
	}
	if numeric && len(code) == 10 && r.Total == 0 {
		r.ForeignCode = true
	}
	return r, nil
}
func (s *Service) Detail(lang, code string) (Entry, Snapshot, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	rows := s.snapshot.Languages[lang]
	i := sort.Search(len(rows), func(i int) bool { return rows[i].Code >= code })
	meta := Snapshot{Date: s.snapshot.Date, RetrievedAt: s.snapshot.RetrievedAt}
	if i >= len(rows) || rows[i].Code != code {
		return Entry{}, meta, false
	}
	return rows[i], meta, true
}
func (s *Service) LegalNotes(lang string, e Entry) []string {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := []string{}
	for _, key := range e.Notes {
		if text := s.snapshot.Notes[lang][key]; text != "" {
			out = append(out, key+" · "+text)
		}
	}
	return out
}

// PlainText discards all source markup; official text never becomes executable HTML.
func PlainText(raw string) string {
	doc, err := html.Parse(strings.NewReader(raw))
	if err != nil {
		return ""
	}
	var out strings.Builder
	var walk func(*html.Node)
	walk = func(n *html.Node) {
		if n.Type == html.ElementNode && (n.Data == "script" || n.Data == "style") {
			return
		}
		if n.Type == html.TextNode {
			out.WriteString(n.Data)
			out.WriteByte(' ')
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
	}
	walk(doc)
	return strings.Join(strings.Fields(out.String()), " ")
}
func (s *Service) get(ctx context.Context, path string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, s.opts.BaseURL+path, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "FreightVanta-TariffLookup/1.0")
	r, err := s.opts.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer r.Body.Close()
	if r.StatusCode != 200 {
		return nil, fmt.Errorf("official source HTTP %d", r.StatusCode)
	}
	return io.ReadAll(io.LimitReader(r.Body, 12<<20))
}

func (s *Service) Start() {
	ctx, cancel := context.WithCancel(context.Background())
	s.cancel = cancel
	go func() {
		defer close(s.done)
		if !s.opts.AutoSync {
			<-ctx.Done()
			return
		}
		for {
			now := time.Now().UTC()
			next := time.Date(now.Year(), now.Month(), now.Day()+1, 3, 15, 0, 0, time.UTC)
			timer := time.NewTimer(time.Until(next))
			select {
			case <-ctx.Done():
				timer.Stop()
				return
			case <-timer.C:
				_ = s.Sync(ctx)
			}
		}
	}()
}
func (s *Service) Close(ctx context.Context) error {
	if s.cancel == nil {
		return nil
	}
	s.cancel()
	select {
	case <-s.done:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

// Sync builds and validates all five languages before a single atomic replacement.
func (s *Service) Sync(ctx context.Context) (syncErr error) {
	if !s.syncMu.TryLock() {
		return errors.New("sync already running")
	}
	defer s.syncMu.Unlock()
	defer func() {
		if syncErr != nil && ctx.Err() == nil {
			s.log.Error("EU classification sync failed; retained previous snapshot", "error", syncErr)
			if s.opts.Alert != nil {
				_ = s.opts.Alert(ctx, "taric-sync", "欧盟税则更新失败", "欧盟商品分类同步失败，现有数据继续服务。请检查官方数据源及服务器日志。")
			}
		}
	}()
	date := time.Now().UTC().Format("2006-01-02")
	stamp := strings.ReplaceAll(date, "-", "")
	snap := Snapshot{Date: date, RetrievedAt: time.Now().UTC().Format(time.RFC3339), Source: Source, Languages: map[string][]Entry{}, Notes: map[string]map[string]string{}}
	for _, lang := range Languages {
		raw, err := s.get(ctx, "nomenclaturetree/nomenclaturetree_"+lang+"_"+stamp+".js")
		if err != nil {
			return err
		}
		sections, err := parseArray(raw, "sectiontree")
		if err != nil {
			return err
		}
		var chapters []string
		for _, row := range sections {
			a, _ := row.([]any)
			if len(a) < 4 {
				continue
			}
			cs, _ := a[3].([]any)
			for _, c := range cs {
				v, _ := c.([]any)
				if len(v) > 3 {
					code, _ := v[3].(string)
					if len(code) == 10 {
						chapters = append(chapters, code[:2])
					}
				}
			}
		}
		if len(chapters) < 95 {
			return errors.New("incomplete official chapter index")
		}
		notes := map[string]string{}
		var entries []Entry
		for _, chapter := range chapters {
			raw, err = s.get(ctx, "nomenclaturetree/nomenclaturetree_"+lang+"_"+stamp+"_"+chapter+"_"+lang+".js")
			if err != nil {
				return err
			}
			tree, err := parseArray(raw, "chaptertree")
			if err != nil {
				return err
			}
			flatten(tree, nil, nil, "", notes, &entries)
		}
		snap.Languages[lang] = entries
		snap.Notes[lang] = notes
	}
	raw, err := json.Marshal(snap)
	if err != nil {
		return err
	}
	var b bytes.Buffer
	zw := gzip.NewWriter(&b)
	_, _ = zw.Write(raw)
	_ = zw.Close()
	verified, err := decode(b.Bytes())
	if err != nil {
		return err
	}
	if s.opts.Path != "" {
		if err = os.MkdirAll(filepath.Dir(s.opts.Path), 0700); err != nil {
			return err
		}
		temp := s.opts.Path + ".next"
		if err = os.WriteFile(temp, b.Bytes(), 0600); err != nil {
			return err
		}
		if err = os.Rename(temp, s.opts.Path); err != nil {
			return err
		}
	}
	s.mu.Lock()
	s.snapshot = verified
	s.mu.Unlock()
	return nil
}
func parseArray(raw []byte, name string) ([]any, error) {
	text := string(raw)
	i := strings.Index(text, name+" = ")
	if i < 0 {
		return nil, errors.New("official data marker absent")
	}
	i += strings.Index(text[i:], "[")
	start := i
	depth := 0
	quoted, escaped := false, false
	var out strings.Builder
	for ; i < len(text); i++ {
		c := text[i]
		if quoted {
			if escaped {
				escaped = false
			} else if c == '\\' {
				escaped = true
			} else if c == '"' {
				quoted = false
			}
		} else {
			if c == '"' {
				quoted = true
			}
			if c == '[' {
				depth++
			}
			if c == ']' {
				depth--
			}
		}
		if c < 32 && quoted {
			fmt.Fprintf(&out, "\\u%04x", c)
		} else {
			out.WriteByte(c)
		}
		if depth == 0 && i > start {
			var result []any
			err := json.Unmarshal([]byte(out.String()), &result)
			return result, err
		}
	}
	return nil, errors.New("truncated official array")
}
func flatten(rows []any, path []Part, inherited []string, unit string, notes map[string]string, out *[]Entry) {
	for _, row := range rows {
		a, ok := row.([]any)
		if !ok || len(a) < 11 {
			continue
		}
		str := func(i int) string { v, _ := a[i].(string); return v }
		code, desc := str(2), PlainText(str(5))
		if len(code) != 10 {
			continue
		}
		keys := append([]string{}, inherited...)
		if ns, ok := a[6].([]any); ok {
			for _, item := range ns {
				n, _ := item.([]any)
				if len(n) > 3 {
					key := fmt.Sprint(n[1]) + fmt.Sprint(n[2])
					notes[key] = PlainText(fmt.Sprint(n[3]))
					found := false
					for _, v := range keys {
						if key == v {
							found = true
						}
					}
					if !found {
						keys = append(keys, key)
					}
				}
			}
		}
		u := unit
		if str(10) != "" {
			u = str(10)
		}
		children, _ := a[7].([]any)
		if len(children) > 0 {
			parentCode := ""
			if str(3) == "80" {
				parentCode = headingCode(code)
			}
			flatten(children, append(append([]Part{}, path...), Part{Code: parentCode, Description: desc}), keys, u, notes, out)
		} else if str(3) == "80" {
			*out = append(*out, Entry{Code: code, Description: desc, Hierarchy: append([]Part{}, path...), Unit: u, Notes: keys})
		}
	}
}
func Hash(data []byte) string { h := sha256.Sum256(data); return hex.EncodeToString(h[:]) }

func headingCode(code string) string {
	n := 2
	for i := 2; i < len(code); i++ {
		if code[i] != '0' {
			n = i + 1
		}
	}
	if n%2 != 0 {
		n++
	}
	return code[:n]
}
