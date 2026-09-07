package analytics

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"czcms/internal/database"
)

type testSigner struct{}

func (testSigner) HMAC(purpose, value string) string { return purpose + ":" + value }

func TestSiteSummaryUsesStableJSONFieldNames(t *testing.T) {
	encoded, err := json.Marshal(SiteSummary{SiteID: 9, SiteName: "Germany", Pageviews: 12, UniqueVisitors: 8, Sessions: 10})
	if err != nil {
		t.Fatal(err)
	}
	var value map[string]any
	if err = json.Unmarshal(encoded, &value); err != nil {
		t.Fatal(err)
	}
	for key, want := range map[string]float64{"pageviews": 12, "unique_visitors": 8, "sessions": 10} {
		if got, ok := value[key].(float64); !ok || got != want {
			t.Fatalf("JSON %s = %#v, want %v; payload=%s", key, value[key], want, encoded)
		}
	}
	if _, found := value["Pageviews"]; found {
		t.Fatalf("Go field leaked into API payload: %s", encoded)
	}
}

func TestTracksVisitsPerSiteAndRespectsPrivacySignals(t *testing.T) {
	ctx := context.Background()
	db, err := database.Open(ctx, ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	service := New(db, testSigner{}, false)
	defer func() {
		closeCtx, cancel := context.WithTimeout(context.Background(), time.Second)
		defer cancel()
		_ = service.Close(closeCtx)
		_ = db.Close()
	}()

	request := httptest.NewRequest(http.MethodGet, "http://example.test/guides/express", nil)
	request.Header.Set("User-Agent", "Mozilla/5.0 test browser")
	firstResponse := httptest.NewRecorder()
	service.Track(service.PrepareVisit(firstResponse, request, 1, "en", "Express guide"))

	second := httptest.NewRequest(http.MethodGet, "http://example.test/guides/express", nil)
	second.Header.Set("User-Agent", "Mozilla/5.0 test browser")
	for _, cookie := range firstResponse.Result().Cookies() {
		second.AddCookie(cookie)
	}
	service.Track(service.PrepareVisit(httptest.NewRecorder(), second, 1, "en", "Express guide"))

	otherSite := httptest.NewRequest(http.MethodGet, "http://example.test/", nil)
	otherSite.Header.Set("User-Agent", "Mozilla/5.0 test browser")
	service.Track(service.PrepareVisit(httptest.NewRecorder(), otherSite, 2, "de-DE", "Startseite"))

	dnt := httptest.NewRequest(http.MethodGet, "http://example.test/private", nil)
	dnt.Header.Set("DNT", "1")
	dnt.Header.Set("User-Agent", "Mozilla/5.0 test browser")
	if visit := service.PrepareVisit(httptest.NewRecorder(), dnt, 1, "en", "No track"); visit != nil {
		t.Fatal("DNT visit must not be prepared")
	}
	if err = service.Flush(ctx); err != nil {
		t.Fatal(err)
	}

	today := time.Now().UTC().Format("2006-01-02")
	one, err := service.Overview(ctx, []int64{1}, today, today, map[int64]string{1: "English"})
	if err != nil {
		t.Fatal(err)
	}
	if one.Summary.Pageviews != 2 || one.Summary.UniqueVisitors != 1 || one.Summary.Sessions != 1 {
		t.Fatalf("site 1 metrics = %+v, want PV 2 UV 1 sessions 1", one.Summary)
	}
	if one.Summary.BounceRate != 0 {
		t.Fatalf("site 1 bounce rate = %v, want 0 after second page", one.Summary.BounceRate)
	}
	if len(one.TopPages) != 1 || one.TopPages[0].Path != "/guides/express" || one.TopPages[0].Views != 2 {
		t.Fatalf("top pages = %+v", one.TopPages)
	}

	two, err := service.Overview(ctx, []int64{2}, today, today, map[int64]string{2: "German"})
	if err != nil {
		t.Fatal(err)
	}
	if two.Summary.Pageviews != 1 || two.Summary.UniqueVisitors != 1 || two.Summary.Sessions != 1 {
		t.Fatalf("site 2 metrics = %+v, want isolated one visit", two.Summary)
	}
}
