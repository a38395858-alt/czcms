package hts

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"czcms/internal/database"
)

const fixture = `[
 {"htsno":"8517","indent":"0","description":"Telephone sets and smartphones","general":"","units":[]},
 {"htsno":"8517.13.00.00","indent":"1","description":"Smartphones","general":"Free","units":["No."]},
 {"htsno":"8517.14.00","indent":"1","description":"Other cellular telephones","general":"2.5%","units":[],"footnotes":[{"marker":"1","value":"See chapter 99."}]},
 {"htsno":"8517.14.00.20","indent":"2","description":"Other","general":"","units":["No."]},
 {"htsno":"6109","indent":"0","description":"Cotton T-shirts","general":"","units":[]},
 {"htsno":"6109.10.00.12","indent":"1","description":"Men's","general":"16.5%","units":["doz.","kg"]}
]`

func testService(t *testing.T, options Options) *Service {
	t.Helper()
	db, err := database.Open(context.Background(), filepath.Join(t.TempDir(), "hts.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	s, err := New(db, slog.New(slog.NewTextHandler(io.Discard, nil)), options)
	if err != nil {
		t.Fatal(err)
	}
	return s
}

func loadFixture(t *testing.T, s *Service, body string) {
	t.Helper()
	sum := sha256.Sum256([]byte(body))
	if err := s.replace(context.Background(), []byte(body), Metadata{Release: "2026HTSRev1", Label: "2026 HTS Revision 1", EffectiveDate: "2026-01-01", RetrievedAt: "2026-01-01T03:00:00Z", SHA256: hex.EncodeToString(sum[:])}, "2026-01"); err != nil {
		t.Fatal(err)
	}
	s.ready.Store(true)
}

func TestNormalizationPreservesLegalHierarchyAndInheritedRates(t *testing.T) {
	entries, err := normalize([]byte(fixture))
	if err != nil || len(entries) != 3 {
		t.Fatalf("%v %+v", err, entries)
	}
	if entries[1].GeneralRate != "2.5%" || entries[1].RateSource != "8517.14.00" || len(entries[1].Footnotes) != 1 || len(entries[1].Hierarchy) != 2 {
		t.Fatalf("lost inherited legal meaning: %+v", entries[1])
	}
	if entries[2].GeneralRate != "16.5%" || entries[2].Units != "doz.; kg" || len(entries[2].Hierarchy) != 1 {
		t.Fatalf("cross-heading contamination: %+v", entries[2])
	}
	missing := strings.ReplaceAll(fixture, `"general":"2.5%"`, `"general":""`)
	entries, err = normalize([]byte(missing))
	if err != nil || entries[1].GeneralRate != "" || entries[1].RateSource != "" {
		t.Fatal("missing rates must never be inferred as Free")
	}
}

func TestActualOfficialSnapshotExactPrefixTextAndSafeQueries(t *testing.T) {
	s := testService(t, Options{})
	ctx := context.Background()
	for _, q := range []string{"8517130000", "8517.13.00.00", " 8517.13.00.00 "} {
		r, err := s.Search(ctx, q, 1)
		if err != nil || r.Total != 1 || r.Items[0].Code != "8517130000" || r.Items[0].GeneralRate != "Free" || r.Items[0].Units != "No." || r.Metadata.Release != "2026HTSRev22" {
			t.Fatalf("exact official record: %s %+v %v", q, r, err)
		}
	}
	r, err := s.Search(ctx, "8517140020", 1)
	if err != nil || r.Items[0].GeneralRate != "Free" || r.Items[0].RateSource != "8517.14.00" {
		t.Fatalf("official inherited rate: %+v %v", r, err)
	}
	for _, q := range []string{"8517", "0101", "SMARTPHONES", "cotton t-shirts", "lithium ion"} {
		r, err = s.Search(ctx, q, 1)
		if err != nil || r.Total == 0 || len(r.Items) > PageSize {
			t.Fatalf("search %s: %d %v", q, r.Total, err)
		}
		for _, e := range r.Items {
			if len(e.Code) != 10 {
				t.Fatal("non-ten-digit result")
			}
		}
	}
	r, err = s.Search(ctx, "84", 2)
	if err != nil || len(r.Items) != PageSize || r.Total <= PageSize {
		t.Fatal("prefix pagination failed")
	}
	for _, q := range []string{"12345678901", "1", "中文", strings.Repeat("a", 121), "a b c d e f g h i"} {
		if _, err = s.Search(ctx, q, 1); !errors.Is(err, ErrQuery) {
			t.Fatalf("invalid query accepted: %s %v", q, err)
		}
	}
	for _, q := range []string{`' OR 1=1 --`, `smartphones" OR "other`, `<script>alert(1)</script>`, `noSuchProductZZZ`} {
		if _, err = s.Search(ctx, q, 1); err != nil {
			t.Fatalf("unsafe text was treated as SQL/FTS syntax: %s %v", q, err)
		}
	}
	empty, err := s.Search(ctx, "", 1)
	if err != nil || len(empty.Items) != 0 || empty.Metadata.Entries != 19949 {
		t.Fatal("empty initial state or full snapshot count")
	}
}

func TestFailedRefreshAndTransactionFailureKeepOldDataAndIndex(t *testing.T) {
	mode := "unavailable"
	releaseCalls := 0
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if mode == "unavailable" {
			w.WriteHeader(503)
			return
		}
		if r.URL.Path == "/releaseList" {
			releaseCalls++
			name := "2026HTSRev2"
			if mode == "changed" && releaseCalls%2 == 0 {
				name = "2026HTSRev3"
			}
			json.NewEncoder(w).Encode([]map[string]string{{"name": name, "description": "2026 HTS Revision 2", "status": "current", "releaseStartDate": "02/01/2026"}})
			return
		}
		if r.URL.Path != "/exportList" || r.URL.Query().Get("format") != "JSON" {
			t.Error("incorrect official source endpoint")
		}
		io.WriteString(w, fixture)
	}))
	defer upstream.Close()
	keys := []string{}
	s := testService(t, Options{BaseURL: upstream.URL, Client: upstream.Client(), MinEntries: 1, Alert: func(_ context.Context, key, subject, body string) error { keys = append(keys, key); return nil }})
	loadFixture(t, s, fixture)
	ctx := context.Background()
	for _, kind := range []string{"unavailable", "changed"} {
		mode = kind
		if err := s.Sync(ctx); err == nil {
			t.Fatalf("%s refresh succeeded", kind)
		}
		r, err := s.Search(ctx, "cellular", 1)
		if err != nil || r.Total != 1 || r.Items[0].GeneralRate != "2.5%" || r.Metadata.Release != "2026HTSRev1" {
			t.Fatal("failed refresh lost old rows/index/version")
		}
	}
	if len(keys) != 2 || keys[0] != keys[1] {
		t.Fatal("same monthly incident needs a stable notification dedupe key")
	}
	mode = "valid"
	_, err := s.db.Exec(`CREATE TRIGGER abort_hts_refresh BEFORE INSERT ON hts_entries BEGIN SELECT RAISE(ABORT,'injected write failure'); END`)
	if err != nil {
		t.Fatal(err)
	}
	if err = s.Sync(ctx); err == nil {
		t.Fatal("injected DB failure not detected")
	}
	r, err := s.Search(ctx, "smartphones", 1)
	if err != nil || r.Total != 2 || r.Metadata.Release != "2026HTSRev1" {
		t.Fatal("atomic transaction rollback did not preserve searchable old dataset")
	}
	s.db.Exec(`DROP TRIGGER abort_hts_refresh`)
	if err = s.Sync(ctx); err != nil {
		t.Fatal(err)
	}
	state, err := s.Status(ctx)
	if err != nil || state.Release != "2026HTSRev2" || state.LastError != "" || state.LeaseUntil != "" {
		t.Fatalf("successful refresh status %+v %v", state, err)
	}
}

func TestMonthlyScheduleUsesConfiguredTimezoneAndCatchesMissedRuns(t *testing.T) {
	zone, err := time.LoadLocation("Asia/Shanghai")
	if err != nil {
		t.Fatal(err)
	}
	for _, tc := range []struct{ At, Period, Next string }{
		{"2026-11-01T01:59:00+08:00", "2026-10", "2026-11-01T02:00:00+08:00"},
		{"2026-11-01T02:00:00+08:00", "2026-11", "2026-12-01T02:00:00+08:00"},
		{"2026-11-05T10:00:00+08:00", "2026-11", "2026-12-01T02:00:00+08:00"},
		{"2027-01-01T01:00:00+08:00", "2026-12", "2027-01-01T02:00:00+08:00"},
	} {
		now, _ := time.Parse(time.RFC3339, tc.At)
		if periodAt(now, zone) != tc.Period || nextDue(now, zone).Format(time.RFC3339) != tc.Next {
			t.Fatalf("incorrect monthly boundary: %+v", tc)
		}
	}
}

type deadlineTransport func(*http.Request) (*http.Response, error)

func (f deadlineTransport) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

func TestRefreshDeadlineQueuesAlertButShutdownDoesNot(t *testing.T) {
	for _, shutdown := range []bool{false, true} {
		t.Run(map[bool]string{false: "deadline", true: "shutdown"}[shutdown], func(t *testing.T) {
			alerts := 0
			var cancel context.CancelFunc
			client := &http.Client{Transport: deadlineTransport(func(r *http.Request) (*http.Response, error) {
				if shutdown {
					cancel()
				}
				<-r.Context().Done()
				return nil, r.Context().Err()
			})}
			s := testService(t, Options{Client: client, MinEntries: 1, Alert: func(ctx context.Context, _, _, _ string) error {
				alerts++
				return ctx.Err()
			}})
			loadFixture(t, s, fixture)
			ctx, cancel := context.WithTimeout(context.Background(), 150*time.Millisecond)
			defer cancel()
			if err := s.Sync(ctx); err == nil {
				t.Fatal("expired refresh succeeded")
			}
			state, err := s.Status(context.Background())
			if err != nil || state.LeaseUntil != "" {
				t.Fatalf("lease not released: %+v %v", state, err)
			}
			if shutdown {
				if alerts != 0 || state.LastError != "" {
					t.Fatal("shutdown generated an upstream failure")
				}
			} else if alerts != 1 || !strings.Contains(state.LastError, "deadline exceeded") || state.AlertError != "" {
				t.Fatalf("deadline failure was lost: alerts=%d %+v", alerts, state)
			}
			result, err := s.Search(context.Background(), "smartphones", 1)
			if err != nil || result.Total != 2 {
				t.Fatal("expired refresh lost the old dataset")
			}
		})
	}
}
