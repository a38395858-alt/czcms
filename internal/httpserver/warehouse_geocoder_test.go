package httpserver

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"czcms/internal/security"
	"time"
)

func TestUSWarehouseLocalLocations(t *testing.T) {
	for _, q := range []string{"91761", "08518", "08518-1234", "Ontario, CA", "ontario california", "Ontario, CA 91761", "New York, NY", "Portland OR", "Washington DC", "Honolulu HI", "Anchorage AK"} {
		matches, handled, err := localWarehouseLocations(q)
		if err != nil || !handled || len(matches) == 0 {
			t.Fatalf("%q: handled=%v, candidates=%v, err=%v", q, handled, matches, err)
		}
		for _, m := range matches {
			if m.Precision == "address-range" || m.Lat == 0 || m.Lng == 0 {
				t.Fatalf("area query represented as street point: %+v", m)
			}
		}
	}
	for _, q := range []string{"00000", "Paris France", "London UK", "Ontario CA 08518", "<script>alert(1)</script>"} {
		matches, handled, err := localWarehouseLocations(q)
		if err != nil || !handled || len(matches) != 0 {
			t.Fatalf("invalid location %q: %+v %v", q, matches, err)
		}
	}
	street, handled, err := localWarehouseLocations("24300 Nandina Ave, Moreno Valley, CA 92551")
	if err != nil || handled || len(street) != 0 {
		t.Fatal("street address must go to the actual street geocoder")
	}
	matches, _, _ := localWarehouseLocations("Springfield")
	if len(matches) < 2 {
		t.Fatal("ambiguous cities must return alternatives")
	}
}

type warehouseRoundTrip func(*http.Request) (*http.Response, error)

func (f warehouseRoundTrip) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

func TestUSWarehouseCensusValidationAndFailure(t *testing.T) {
	for _, test := range []struct {
		body         string
		status, want int
		wantError    bool
	}{
		{`{"result":{"addressMatches":[{"matchedAddress":"24300 NANDINA AVE, MORENO VALLEY, CA, 92551","coordinates":{"x":-117.237,"y":33.866},"addressComponents":{"state":"CA"}}]}}`, 200, 1, false},
		{`{"result":{"addressMatches":[{"matchedAddress":"outside USA","coordinates":{"x":2.35,"y":48.85},"addressComponents":{"state":"FR"}}]}}`, 200, 0, false},
		{`{"result":{"addressMatches":[{"matchedAddress":"invalid point","coordinates":{"x":-117,"y":-50},"addressComponents":{"state":"CA"}}]}}`, 200, 0, false},
		{`{"result":{"addressMatches":[]}}`, 200, 0, false},
		{`not-json`, 200, 0, true},
		{`unavailable`, 503, 0, true},
	} {
		client := &http.Client{Transport: warehouseRoundTrip(func(r *http.Request) (*http.Response, error) {
			if r.URL.Scheme != "https" || r.URL.Host != "geocoding.geo.census.gov" || r.URL.Query().Get("address") != "24300 Nandina Ave & test" {
				t.Fatal("unsafe or incorrectly encoded Census request")
			}
			return &http.Response{StatusCode: test.status, Body: io.NopCloser(strings.NewReader(test.body)), Header: make(http.Header)}, nil
		})}
		matches, err := censusWarehouseLocations(context.Background(), "24300 Nandina Ave & test", client)
		if (err != nil) != test.wantError || len(matches) != test.want {
			t.Fatalf("candidates=%v err=%v", matches, err)
		}
		if len(matches) > 0 && matches[0].Precision != "address-range" {
			t.Fatal("Census street point must disclose range precision")
		}
	}
}

func TestUSWarehouseLocationEndpointValidationAndRateLimit(t *testing.T) {
	s := &server{warehouseGeocodeLimiter: security.NewLimiter(30, time.Minute, 8, 100)}
	for _, q := range []string{"", strings.Repeat("a", 201), "91761", "00000", "Ontario CA"} {
		w := httptest.NewRecorder()
		s.warehouseGeocode(w, httptest.NewRequest("GET", "/api/public/us-warehouse-location?q="+url.QueryEscape(q), nil))
		want := 200
		if len(q) < 2 || len(q) > 200 {
			want = 400
		}
		if w.Code != want || !strings.Contains(w.Header().Get("Cache-Control"), "no-store") || !strings.Contains(w.Header().Get("X-Robots-Tag"), "noindex") {
			t.Fatalf("%q: %d %s", q, w.Code, w.Body.String())
		}
	}
	limited := &server{warehouseGeocodeLimiter: security.NewLimiter(1, time.Hour, 1, 100)}
	for i := 0; i < 2; i++ {
		w := httptest.NewRecorder()
		limited.warehouseGeocode(w, httptest.NewRequest("GET", "/api/public/us-warehouse-location?q=91761", nil))
		want := 200
		if i == 1 {
			want = 429
		}
		if w.Code != want {
			t.Fatal(fmt.Sprintf("rate limit %d: %d", i, w.Code))
		}
	}
}

func TestUSWarehouseStreetFallbackIsCountryRestrictedAndCached(t *testing.T) {
	t.Setenv("CZCMS_WAREHOUSE_GEOCODER_URL", "https://nominatim.openstreetmap.org/search")
	for _, censusBody := range []string{`<html>Request Rejected</html>`, `{"result":{"addressMatches":[]}}`} {
		calls := 0
		query := "24300 Nandina Ave, Moreno Valley CA " + fmt.Sprint(len(censusBody))
		client := &http.Client{Transport: warehouseRoundTrip(func(r *http.Request) (*http.Response, error) {
			body := censusBody
			if r.URL.Host == "nominatim.openstreetmap.org" {
				calls++
				if r.URL.Query().Get("countrycodes") != "us" || r.URL.Query().Get("accept-language") != "en" {
					t.Fatal("US country filter must be independent of the English language code")
				}
				body = `[{"lat":"33.86","lon":"-117.23","display_name":"Moreno Valley, California, United States","address":{"country_code":"us"}},{"lat":"48.85","lon":"2.35","display_name":"Paris","address":{"country_code":"fr"}},{"lat":"NaN","lon":"-117","display_name":"Invalid","address":{"country_code":"us"}}]`
			} else if r.URL.Host != "geocoding.geo.census.gov" {
				t.Fatalf("unexpected provider %s", r.URL.Host)
			}
			return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader(body)), Header: make(http.Header)}, nil
		})}
		for i := 0; i < 2; i++ {
			matches, err := usStreetWarehouseLocations(context.Background(), query, client)
			if err != nil || len(matches) != 1 || matches[0].Country != "US" || matches[0].Precision != "osm-reference" {
				t.Fatalf("fallback failed: %+v %v", matches, err)
			}
		}
		if calls != 1 {
			t.Fatalf("fallback should reuse cached provider data, got %d upstream calls", calls)
		}
	}
}
