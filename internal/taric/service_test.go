package taric

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	_ "modernc.org/sqlite"
)

func testService(t *testing.T, opts Options) *Service {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "taric.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	s, err := New(db, slog.New(slog.NewTextHandler(io.Discard, nil)), opts)
	if err != nil {
		t.Fatal(err)
	}
	return s
}

func TestOfficialFiveLanguageClassification(t *testing.T) {
	s := testService(t, Options{})
	words := map[string]string{"de": "Baumwolle", "fr": "coton", "es": "algodón", "it": "cotone", "nl": "katoen"}
	for lang, word := range words {
		all, err := s.Search(lang, "39", 1)
		if err != nil || all.Total < 500 {
			t.Fatalf("%s chapter incomplete: %d, %v", lang, all.Total, err)
		}
		r, err := s.Search(lang, word, 1)
		if err != nil || r.Total < 30 {
			t.Fatalf("%s keyword %s: %d %v", lang, word, r.Total, err)
		}
		exact, err := s.Search(lang, "3909.50.90.90", 1)
		if err != nil || exact.Total != 1 || exact.Items[0].Code != "3909509090" {
			t.Fatalf("%s exact code", lang)
		}
		e, meta, ok := s.Detail(lang, "3909509090")
		if !ok || meta.Date == "" || len(e.Hierarchy) < 3 || len(s.LegalNotes(lang, e)) == 0 || len(e.Name()) < 12 {
			t.Fatalf("incomplete %s detail", lang)
		}
		foreign, _ := s.Search(lang, "3909505000", 1)
		if foreign.Total != 0 || !foreign.ForeignCode {
			t.Fatal("US code became EU code")
		}
		accented, _ := s.Search(lang, strings.NewReplacer("ó", "o").Replace(word), 1)
		if accented.Total != r.Total {
			t.Fatal("accent insensitive search")
		}
	}
	for _, q := range []string{"<script>alert(1)</script>", "39095090900"} {
		r, err := s.Search("de", q, 1)
		if err != nil {
			t.Fatal(err)
		}
		if r.Total != 0 {
			t.Fatalf("unexpected malformed match: %q", q)
		}
	}
	if r, err := s.Search("de", "' OR 1=1 --", 1); err != nil || r.Total >= len(s.snapshot.Languages["de"]) {
		t.Fatal("query changed search semantics")
	}
	if _, err := s.Search("de", strings.Repeat("x", 121), 1); !errors.Is(err, ErrQuery) {
		t.Fatal("query length")
	}
	if _, err := s.Search("en", "390950", 1); !errors.Is(err, ErrQuery) {
		t.Fatal("US locale allowed")
	}
	if _, err := s.Search("de", "390950", 0); !errors.Is(err, ErrQuery) {
		t.Fatal("invalid page")
	}
	if e, _, ok := s.Detail("de", "39095090900"); ok || e.Code != "" {
		t.Fatal("fabricated German 11-digit code")
	}
	blank, _ := s.Search("fr", "", 1)
	if blank.Total != 0 {
		t.Fatal("empty search should clear results")
	}
}

func TestMeasuresOriginDateCacheAndStaleFallback(t *testing.T) {
	calls := 0
	fail := false
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		if fail {
			http.Error(w, "temporary outage", 503)
			return
		}
		if r.URL.Query().Get("Area") == "" || r.URL.Query().Get("SimDate") == "" {
			t.Error("missing conditions")
		}
		if r.URL.Path == "/measures.jsp" {
			_, _ = io.WriteString(w, `<span onclick="expand('measures_details.jsp?Taric=3909509090&Area=`+r.URL.Query().Get("Area")+`&Lang=de&SimDate=`+r.URL.Query().Get("SimDate")+`')"></span>`)
			return
		}
		_, _ = io.WriteString(w, `<div class="measure_area">ERGA OMNES</div><div id="measure_1"><img src="/images/import.png"><table><tr><td class="td_measure_description">Drittlandszollsatz (01-01-1999 - ) : <span class="duty_rate">6.50 %</span></td></tr></table><a class="regulation_link">R2261/98</a></div><div id="measure_2"><img src="/images/import.png"><table><tr><td class="td_measure_description">Bedingte Aussetzung <span class="duty_rate">0 %</span></td></tr></table><span onclick="open('measures_conditions.jsp?MeasureSid=2')"></span></div><div id="measure_3"><img src="/images/export.png"><table><tr><td class="td_measure_description">Export only</td></tr></table></div>`)
	}))
	defer upstream.Close()
	s := testService(t, Options{BaseURL: upstream.URL + "/"})
	first, err := s.Measures(context.Background(), "de", "3909509090", "CN", "2026-11-06")
	if err != nil {
		t.Fatal(err)
	}
	if len(first.Items) != 2 || first.Items[0].Rate != "6.50 %" || !first.Items[1].Conditional {
		t.Fatalf("wrong measure semantics: %+v", first.Items)
	}
	_, err = s.Measures(context.Background(), "de", "3909509090", "CN", "2026-11-06")
	if err != nil || calls != 2 {
		t.Fatal("cache missed")
	}
	_, err = s.Measures(context.Background(), "de", "3909509090", "US", "2026-11-06")
	if err != nil || calls != 4 {
		t.Fatal("origin cache crossed")
	}
	_, err = s.Measures(context.Background(), "de", "3909509090", "CN", "2026-11-05")
	if err != nil || calls != 6 {
		t.Fatal("date cache crossed")
	}
	_, _ = s.db.Exec(`UPDATE taric_measure_cache SET checked_at='2000-01-01T00:00:00Z'`)
	fail = true
	stale, err := s.Measures(context.Background(), "de", "3909509090", "CN", "2026-11-06")
	if err != nil || !stale.Stale || stale.Items[0].Rate != "6.50 %" {
		t.Fatal("outage lost verified cached data")
	}
	for _, origin := range []string{"ZZ", "CN' OR 1=1", "127.0.0.1"} {
		if _, err = s.Measures(context.Background(), "de", "3909509090", origin, "2026-11-06"); !errors.Is(err, ErrQuery) {
			t.Fatal("invalid origin")
		}
	}
	if _, err = s.Measures(context.Background(), "de", "3909509090", "CN", time.Now().AddDate(1, 0, 0).Format("2006-01-02")); !errors.Is(err, ErrQuery) {
		t.Fatal("future date")
	}
}

func TestSourceFailurePreservesSnapshotAndNotifies(t *testing.T) {
	alerts := 0
	source := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = io.WriteString(w, `<html>Temporary maintenance</html>`)
	}))
	defer source.Close()
	filename := filepath.Join(t.TempDir(), "taric.json.gz")
	if err := os.WriteFile(filename, seed, 0600); err != nil {
		t.Fatal(err)
	}
	s := testService(t, Options{BaseURL: source.URL + "/", Path: filename, Alert: func(ctx context.Context, key, subject, body string) error {
		alerts++
		if key != "taric-sync" {
			t.Error("wrong alert key")
		}
		return nil
	}})
	before, _ := s.Search("fr", "390950", 1)
	if err := s.Sync(context.Background()); err == nil {
		t.Fatal("maintenance page accepted as data")
	}
	after, _ := s.Search("fr", "390950", 1)
	if after.Total != before.Total || after.Date != before.Date || alerts != 1 {
		t.Fatal("sync did not preserve data/notify")
	}
	saved, _ := os.ReadFile(filename)
	if Hash(saved) != Hash(seed) {
		t.Fatal("failed sync overwrote snapshot")
	}
}

func TestOfficialArrayParserEscapesTextAndRejectsExecutableSource(t *testing.T) {
	rows, err := parseArray([]byte("chaptertree = [[\"test\tvalue\",null]]; unrelated = [];"), "chaptertree")
	if err != nil || len(rows) != 1 {
		t.Fatal("valid official literal tab")
	}
	if _, err = parseArray([]byte(`chaptertree = [process.exit(0)];`), "chaptertree"); err == nil {
		t.Fatal("executable JS accepted")
	}
	if text := PlainText(`<b>Text</b><script>evil()</script><img src=x onerror=evil()> &amp; more`); text != "Text & more" {
		t.Fatal(text)
	}
	var meta struct {
		SHA string `json:"sha256"`
	}
	b, err := os.ReadFile("data/current.meta.json")
	if err != nil {
		t.Fatal(err)
	}
	_ = json.Unmarshal(b, &meta)
	if Hash(seed) != meta.SHA {
		t.Fatal("seed checksum")
	}
}

func BenchmarkTARICKeywordSearch(b *testing.B) {
	s, err := New(nil, nil, Options{})
	if err != nil {
		b.Fatal(err)
	}
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = s.Search("de", "Baumwolle", 1)
	}
}
