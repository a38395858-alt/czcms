package httpserver

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"

	webassets "czcms/frontend"
)

type warehouseLocation struct {
	Country   string  `json:"country,omitempty"`
	Label     string  `json:"label"`
	State     string  `json:"state,omitempty"`
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
	Precision string  `json:"precision"`
	Source    string  `json:"source"`
	SourceURL string  `json:"sourceURL"`
}

type warehousePlace struct {
	Name  string  `json:"name"`
	State string  `json:"state"`
	Lat   float64 `json:"lat"`
	Lng   float64 `json:"lng"`
}

var warehouseGeoIndex struct {
	sync.Once
	Places []warehousePlace
	ZIP    map[string]warehouseLocation
	Err    error
}

var censusGeocodeClient = newWarehouseGeocodeClient()

func newWarehouseGeocodeClient() *http.Client {
	transport := http.DefaultTransport.(*http.Transport).Clone()
	// The optional proxy is scoped to geocoding. TLS checks stay enabled.
	if value := os.Getenv("CZCMS_GEOCODER_PROXY_URL"); value != "" {
		if proxy, err := url.Parse(value); err == nil && proxy.Host != "" && (proxy.Scheme == "http" || proxy.Scheme == "https") {
			transport.Proxy = http.ProxyURL(proxy)
		}
	}
	return &http.Client{Transport: transport, Timeout: 10 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
}

var censusGeocodeSlots = make(chan struct{}, 4)
var warehouseZIPPattern = regexp.MustCompile(`^\d{5}(?:-\d{4})?$`)
var warehouseStreetPattern = regexp.MustCompile(`^\d+\s+\S`)
var warehousePunctuation = regexp.MustCompile(`[^a-z0-9]+`)

func loadWarehouseGeoIndex() error {
	warehouseGeoIndex.Do(func() {
		body, err := webassets.Files.ReadFile("assets/data/us-location-index.json")
		if err != nil {
			warehouseGeoIndex.Err = err
			return
		}
		var data struct {
			Places    []warehousePlace `json:"places"`
			Postcodes []struct {
				ZIP string  `json:"zip"`
				Lat float64 `json:"lat"`
				Lng float64 `json:"lng"`
			} `json:"postcodes"`
		}
		if err = json.Unmarshal(body, &data); err != nil {
			warehouseGeoIndex.Err = err
			return
		}
		warehouseGeoIndex.Places = data.Places
		warehouseGeoIndex.ZIP = make(map[string]warehouseLocation, len(data.Postcodes))
		for _, z := range data.Postcodes {
			warehouseGeoIndex.ZIP[z.ZIP] = warehouseLocation{Label: "ZIP " + z.ZIP + ", United States", Lat: z.Lat, Lng: z.Lng, Precision: "zip-centroid", Source: "US Census 2025 ZIP area", SourceURL: "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html"}
		}
	})
	return warehouseGeoIndex.Err
}

func normalizePlace(s string) string {
	return strings.TrimSpace(warehousePunctuation.ReplaceAllString(strings.ToLower(s), " "))
}

// Local city/ZIP lookups are explicit area centers. A street query is never
// silently downgraded to a ZIP centroid when its address cannot be matched.
func localWarehouseLocations(query string) ([]warehouseLocation, bool, error) {
	if err := loadWarehouseGeoIndex(); err != nil {
		return nil, true, err
	}
	if warehouseZIPPattern.MatchString(query) {
		if location, ok := warehouseGeoIndex.ZIP[query[:5]]; ok {
			return []warehouseLocation{location}, true, nil
		}
		return []warehouseLocation{}, true, nil
	}
	if warehouseStreetPattern.MatchString(query) {
		return nil, false, nil
	}
	// A city + state + ZIP query remains explicitly an area search. Do not
	// accept a mismatched ZIP from a different city/state as the same location.
	parts := strings.Fields(query)
	if len(parts) > 1 && warehouseZIPPattern.MatchString(parts[len(parts)-1]) {
		zip := parts[len(parts)-1][:5]
		cities, _, err := localWarehouseLocations(strings.Join(parts[:len(parts)-1], " "))
		if err != nil {
			return nil, true, err
		}
		if z, ok := warehouseGeoIndex.ZIP[zip]; ok {
			for _, city := range cities {
				if math.Abs(city.Lat-z.Lat) < 1 && math.Abs(city.Lng-z.Lng) < 1 {
					z.Label = strings.TrimSuffix(city.Label, ", United States") + " " + zip + ", United States"
					z.State = city.State
					return []warehouseLocation{z}, true, nil
				}
			}
		}
		return []warehouseLocation{}, true, nil
	}
	directory, err := loadFBAWarehouseDirectory()
	if err != nil {
		return nil, true, err
	}
	city, state := normalizePlace(query), ""
	for _, s := range directory.States {
		for _, suffix := range []string{normalizePlace(s.Name), strings.ToLower(s.Code)} {
			if strings.HasSuffix(city, " "+suffix) {
				city = strings.TrimSuffix(city, " "+suffix)
				state = s.Code
				break
			}
		}
		if state != "" {
			break
		}
	}
	if len(city) < 2 {
		return []warehouseLocation{}, true, nil
	}
	// Common search names for Census-defined places retain the official label
	// in the candidate so the user can confirm the returned area.
	if city == "honolulu" && (state == "" || state == "HI") {
		city = "urban honolulu"
	}
	if city == "new york city" || city == "nyc" {
		city = "new york"
	}
	matches := []warehouseLocation{}
	seen := map[string]bool{}
	for _, p := range warehouseGeoIndex.Places {
		if (state == "" || state == p.State) && normalizePlace(p.Name) == city {
			key := p.Name + ", " + p.State
			if seen[key] {
				continue
			}
			seen[key] = true
			matches = append(matches, warehouseLocation{Label: key + ", United States", State: p.State, Lat: p.Lat, Lng: p.Lng, Precision: "city-centroid", Source: "US Census 2025 place", SourceURL: "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html"})
		}
	}
	sort.Slice(matches, func(i, j int) bool { return matches[i].Label < matches[j].Label })
	if len(matches) > 12 {
		matches = matches[:12]
	}
	return matches, true, nil
}

func censusWarehouseLocations(ctx context.Context, query string, client *http.Client) ([]warehouseLocation, error) {
	values := url.Values{"address": {query}, "benchmark": {"Public_AR_Current"}, "format": {"json"}}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?"+values.Encode(), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "FreightVanta US Warehouse Locator (https://freightvanta.com)")
	response, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Census returned %d", response.StatusCode)
	}
	var data struct {
		Result struct {
			Matches []struct {
				Label       string `json:"matchedAddress"`
				Coordinates struct {
					X float64 `json:"x"`
					Y float64 `json:"y"`
				} `json:"coordinates"`
				Components struct {
					State string `json:"state"`
				} `json:"addressComponents"`
			} `json:"addressMatches"`
		} `json:"result"`
	}
	if err = json.NewDecoder(io.LimitReader(response.Body, 1<<20)).Decode(&data); err != nil {
		return nil, err
	}
	directory, err := loadFBAWarehouseDirectory()
	if err != nil {
		return nil, err
	}
	states := map[string]bool{}
	for _, s := range directory.States {
		states[s.Code] = true
	}
	matches := []warehouseLocation{}
	for _, m := range data.Result.Matches {
		if !states[m.Components.State] || m.Label == "" || math.IsNaN(m.Coordinates.X) || math.IsNaN(m.Coordinates.Y) || m.Coordinates.Y < 18.9 || m.Coordinates.Y > 72 || m.Coordinates.X < -180 || m.Coordinates.X > 180 {
			continue
		}
		matches = append(matches, warehouseLocation{Label: m.Label, State: m.Components.State, Lat: m.Coordinates.Y, Lng: m.Coordinates.X, Precision: "address-range", Source: "US Census address-range match", SourceURL: "https://geocoding.geo.census.gov/geocoder/"})
		if len(matches) >= 8 {
			break
		}
	}
	return matches, nil
}

func usStreetWarehouseLocations(ctx context.Context, query string, client *http.Client) ([]warehouseLocation, error) {
	// Bound the primary attempt so a slow Census response leaves time for fallback.
	primary, cancel := context.WithTimeout(ctx, 5*time.Second)
	matches, err := censusWarehouseLocations(primary, query, client)
	cancel()
	if err == nil && len(matches) > 0 {
		return matches, nil
	}
	if ctx.Err() != nil {
		return nil, ctx.Err()
	}
	return cachedNominatimWarehouseLocations(ctx, &warehouseCountry{Country: "US", Language: "en", Name: "United States"}, query, client)
}

func (s *server) warehouseGeocode(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	w.Header().Set("X-Robots-Tag", "noindex, nofollow")
	query := strings.Join(strings.Fields(r.URL.Query().Get("q")), " ")
	if len([]rune(query)) < 2 || len([]rune(query)) > 200 {
		writeJSONError(w, 400, "Enter a US address, city or five-digit ZIP code (2–200 characters).")
		return
	}
	if !s.warehouseGeocodeLimiter.Allow(s.clientIP(r)) {
		w.Header().Set("Retry-After", "10")
		writeJSONError(w, 429, "Too many location searches. Wait a moment and try again.")
		return
	}
	matches, handled, err := localWarehouseLocations(query)
	if err != nil {
		writeJSONError(w, 503, "Location data is temporarily unavailable. Try again shortly.")
		return
	}
	if !handled {
		select {
		case censusGeocodeSlots <- struct{}{}:
			defer func() { <-censusGeocodeSlots }()
		default:
			writeJSONError(w, 503, "Address lookup is busy. Try again shortly.")
			return
		}
		matches, err = usStreetWarehouseLocations(r.Context(), query, censusGeocodeClient)
		if err != nil {
			writeJSONError(w, 503, "Address lookup is temporarily unavailable. Try again, or search a city and state or a five-digit ZIP.")
			return
		}
	}
	writeJSON(w, 200, map[string]any{"candidates": matches, "note": "City and ZIP searches use approximate area centers. Street matches use Census address-range estimates or OpenStreetMap reference points; confirm the returned location."})
}
