package httpserver

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	webassets "czcms/frontend"
)

type europeanPostalPlace struct {
	ZIP, City, Region string
	Lat, Lng          float64
}

var europeanPostalData sync.Map
var europeanPostalMutex sync.Mutex
var europeanGeocodeSlots = make(chan struct{}, 1)
var europeanGeocodeLast time.Time // accessed only while holding europeanGeocodeSlots
var errWarehouseGeocodeBusy = errors.New("location provider busy")
var europeanGeocodeCache = struct {
	sync.Mutex
	items map[string]struct {
		Matches []warehouseLocation
		At      time.Time
	}
}{items: make(map[string]struct {
	Matches []warehouseLocation
	At      time.Time
})}
var europeanPostcode = regexp.MustCompile(`^\d{5}$`)
var dutchPostcode = regexp.MustCompile(`^\d{4}(?:\s?[a-zA-Z]{2})?$`)

func loadEuropeanPostalData(language string) ([]europeanPostalPlace, error) {
	if value, ok := europeanPostalData.Load(language); ok {
		return value.([]europeanPostalPlace), nil
	}
	europeanPostalMutex.Lock()
	defer europeanPostalMutex.Unlock()
	if value, ok := europeanPostalData.Load(language); ok {
		return value.([]europeanPostalPlace), nil
	}
	body, err := webassets.Files.ReadFile("assets/data/warehouse-locations." + language + ".json")
	if err != nil {
		return nil, err
	}
	var data struct{ Places []europeanPostalPlace }
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}
	europeanPostalData.Store(language, data.Places)
	return data.Places, nil
}

func localEuropeanWarehouseLocations(country *warehouseCountry, query string) ([]warehouseLocation, bool, error) {
	places, err := loadEuropeanPostalData(country.Language)
	if err != nil {
		return nil, true, err
	}
	query = normalizeWarehouseText(query)
	isPostal := europeanPostcode.MatchString(query)
	if country.Country == "NL" {
		isPostal = dutchPostcode.MatchString(query)
	}
	postal := query
	if country.Country == "NL" && isPostal {
		postal = query[:4]
	}
	type group struct {
		Label, State string
		Lat, Lng     float64
		Count        int
	}
	groups := map[string]*group{}
	for _, p := range places {
		city, region := normalizeWarehouseText(p.City), normalizeWarehouseText(p.Region)
		matched := (isPostal && p.ZIP == postal) || (!isPostal && (query == city || query == city+", "+region || query == city+" "+region))
		if !matched {
			continue
		}
		key := p.City + ", " + p.Region
		if isPostal {
			key = postal
		}
		if groups[key] == nil {
			label := p.City + ", " + p.Region + ", " + country.Name
			if isPostal {
				label = strings.ToUpper(query) + ", " + country.Name
			}
			groups[key] = &group{Label: label}
		}
		g := groups[key]
		g.Lat += p.Lat
		g.Lng += p.Lng
		g.Count++
	}
	result := []warehouseLocation{}
	for _, g := range groups {
		precision := "city-centroid"
		if isPostal {
			precision = "zip-centroid"
		}
		result = append(result, warehouseLocation{Country: country.Country, Label: g.Label, Lat: g.Lat / float64(g.Count), Lng: g.Lng / float64(g.Count), Precision: precision, Source: "GeoNames", SourceURL: "https://www.geonames.org/"})
	}
	sort.Slice(result, func(i, j int) bool { return result[i].Label < result[j].Label })
	if len(result) > 8 {
		result = result[:8]
	}
	return result, isPostal || len(result) > 0, nil
}

func validEuropeanPoint(country string, lat, lng float64) bool {
	if math.IsNaN(lat) || math.IsNaN(lng) || math.IsInf(lat, 0) || math.IsInf(lng, 0) {
		return false
	}
	bounds := map[string][4]float64{"US": {18.9, 72, -180, 180}, "DE": {47, 55.2, 5.8, 15.1}, "FR": {41.3, 51.2, -5.2, 9.7}, "ES": {27.5, 43.9, -18.3, 4.5}, "IT": {35.4, 47.2, 6.5, 18.6}, "NL": {50.7, 53.7, 3.2, 7.3}}
	b, ok := bounds[country]
	return ok && lat >= b[0] && lat <= b[1] && lng >= b[2] && lng <= b[3]
}

// The upstream is deployment configuration, never a user-supplied request URL.
// Explicit searches only, bounded cached results, at most one request/1.1s.
func nominatimWarehouseLocations(ctx context.Context, country *warehouseCountry, query string, client *http.Client) ([]warehouseLocation, error) {
	endpoint := os.Getenv("CZCMS_WAREHOUSE_GEOCODER_URL")
	if endpoint == "" {
		endpoint = os.Getenv("CZCMS_EU_GEOCODER_URL")
	}
	if endpoint == "off" {
		return nil, fmt.Errorf("street geocoding disabled")
	}
	if endpoint == "" {
		endpoint = "https://nominatim.openstreetmap.org/search"
	}
	countryCode := strings.ToLower(country.Country)
	values := url.Values{"q": {query}, "format": {"jsonv2"}, "countrycodes": {countryCode}, "addressdetails": {"1"}, "limit": {"5"}, "accept-language": {country.Language}}
	req, err := http.NewRequestWithContext(ctx, "GET", endpoint+"?"+values.Encode(), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "FreightVanta Warehouse Locator/1.0 (https://freightvanta.com; info@freightvanta.com)")
	response, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode != 200 {
		return nil, fmt.Errorf("location provider returned %d", response.StatusCode)
	}
	var rows []struct {
		Lat, Lon, Type string
		Address        struct {
			CountryCode string `json:"country_code"`
		} `json:"address"`
		Display string `json:"display_name"`
	}
	if err = json.NewDecoder(io.LimitReader(response.Body, 1<<20)).Decode(&rows); err != nil {
		return nil, err
	}
	result := []warehouseLocation{}
	for _, row := range rows {
		lat, e1 := strconv.ParseFloat(row.Lat, 64)
		lng, e2 := strconv.ParseFloat(row.Lon, 64)
		if e1 != nil || e2 != nil || row.Address.CountryCode != countryCode || !validEuropeanPoint(country.Country, lat, lng) || row.Display == "" {
			continue
		}
		precision := "osm-reference"
		if row.Type == "city" || row.Type == "town" || row.Type == "village" || row.Type == "administrative" {
			precision = "city-centroid"
		}
		if row.Type == "postcode" || row.Type == "postal_code" {
			precision = "zip-centroid"
		}
		result = append(result, warehouseLocation{Country: country.Country, Label: row.Display, Lat: lat, Lng: lng, Precision: precision, Source: "OpenStreetMap / Nominatim", SourceURL: "https://www.openstreetmap.org/copyright"})
	}
	return result, nil
}

// US fallback and European street searches share one upstream rate limit/cache.
func cachedNominatimWarehouseLocations(ctx context.Context, country *warehouseCountry, query string, client *http.Client) ([]warehouseLocation, error) {
	key := country.Country + ":" + country.Language + ":" + normalizeWarehouseText(query)
	europeanGeocodeCache.Lock()
	cached, ok := europeanGeocodeCache.items[key]
	europeanGeocodeCache.Unlock()
	if ok && time.Since(cached.At) < 24*time.Hour {
		return cached.Matches, nil
	}
	select {
	case europeanGeocodeSlots <- struct{}{}:
		defer func() { <-europeanGeocodeSlots }()
	default:
		return nil, errWarehouseGeocodeBusy
	}
	if delay := time.Until(europeanGeocodeLast.Add(1100 * time.Millisecond)); delay > 0 {
		timer := time.NewTimer(delay)
		defer timer.Stop()
		select {
		case <-timer.C:
		case <-ctx.Done():
			return nil, ctx.Err()
		}
	}
	europeanGeocodeLast = time.Now()
	matches, err := nominatimWarehouseLocations(ctx, country, query, client)
	if err != nil {
		return nil, err
	}
	europeanGeocodeCache.Lock()
	if len(europeanGeocodeCache.items) >= 1024 {
		clear(europeanGeocodeCache.items)
	}
	europeanGeocodeCache.items[key] = struct {
		Matches []warehouseLocation
		At      time.Time
	}{matches, time.Now()}
	europeanGeocodeCache.Unlock()
	return matches, nil
}

func (s *server) europeanWarehouseGeocode(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	w.Header().Set("X-Robots-Tag", "noindex, nofollow")
	country := warehouseCountryFor(r.URL.Query().Get("country"))
	if country == nil {
		writeJSONError(w, 400, "Unsupported country")
		return
	}
	query := strings.Join(strings.Fields(r.URL.Query().Get("q")), " ")
	if len([]rune(query)) < 2 || len([]rune(query)) > 200 {
		writeJSONError(w, 400, country.Copy["invalidQuery"])
		return
	}
	if !s.warehouseGeocodeLimiter.Allow(s.clientIP(r)) {
		w.Header().Set("Retry-After", "10")
		writeJSONError(w, 429, country.Copy["busy"])
		return
	}
	matches, handled, err := localEuropeanWarehouseLocations(country, query)
	if err != nil {
		writeJSONError(w, 503, country.Copy["locationError"])
		return
	}
	if !handled {
		matches, err = cachedNominatimWarehouseLocations(r.Context(), country, query, censusGeocodeClient)
		if errors.Is(err, errWarehouseGeocodeBusy) {
			w.Header().Set("Retry-After", "2")
			writeJSONError(w, 429, country.Copy["busy"])
			return
		}
		if err != nil {
			writeJSONError(w, 503, country.Copy["locationError"])
			return
		}
	}
	writeJSON(w, 200, map[string]any{"candidates": matches})
}
