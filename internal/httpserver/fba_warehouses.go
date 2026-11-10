package httpserver

import (
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"

	webassets "czcms/frontend"
)

const fbaWarehouseLookupSlug = "tools/fba-warehouse-lookup"

type fbaWarehouse struct {
	Name                string  `json:"name,omitempty"`
	Type                string  `json:"type,omitempty"`
	Code                string  `json:"code"`
	State               string  `json:"state"`
	StateName           string  `json:"stateName"`
	Region              string  `json:"region"`
	City                string  `json:"city"`
	ZIP                 string  `json:"zip"`
	Address             string  `json:"address"`
	Country             string  `json:"country"`
	SourceURL           string  `json:"sourceURL"`
	Lat                 float64 `json:"lat,omitempty"`
	Lng                 float64 `json:"lng,omitempty"`
	CoordinatePrecision string  `json:"coordinatePrecision,omitempty"`
	CoordinateSourceURL string  `json:"coordinateSourceURL,omitempty"`
}

func (w fbaWarehouse) FullAddress() string {
	return w.Code + "\n" + w.Address + "\n" + w.City + ", " + w.State + " " + w.ZIP + "\nUnited States"
}

type fbaState struct {
	Code   string `json:"code"`
	Name   string `json:"name"`
	Region string `json:"region"`
}

type fbaWarehouseDirectory struct {
	Country         string         `json:"country"`
	Language        string         `json:"language"`
	SourceCheckedAt string         `json:"sourceCheckedAt"`
	Coverage        string         `json:"coverage"`
	RegionNote      string         `json:"regionNote"`
	States          []fbaState     `json:"states"`
	Warehouses      []fbaWarehouse `json:"warehouses"`
}

type fbaWarehousePage struct {
	Country                 *warehouseCountry
	Query, Error, CheckedAt string
	Locations, StateCount   int
	Results                 []fbaWarehouse
	EmptyCard               fbaWarehouse
	DirectoryJSON           template.JS
	Featured                []fbaWarehouse
	DefaultState            bool
}

var fbaDirectory struct {
	sync.Once
	data fbaWarehouseDirectory
	err  error
}

func loadFBAWarehouseDirectory() (*fbaWarehouseDirectory, error) {
	fbaDirectory.Do(func() {
		var body []byte
		body, fbaDirectory.err = webassets.Files.ReadFile("assets/data/fba-warehouses.us.json")
		if fbaDirectory.err == nil {
			fbaDirectory.err = json.Unmarshal(body, &fbaDirectory.data)
		}
		if fbaDirectory.err == nil && (fbaDirectory.data.Country != "US" || len(fbaDirectory.data.Warehouses) == 0) {
			fbaDirectory.err = fmt.Errorf("US FBA directory is empty or has the wrong country")
		}
	})
	return &fbaDirectory.data, fbaDirectory.err
}

func normalizeFBAQuery(query string) string {
	return strings.Join(strings.Fields(strings.ToLower(query)), " ")
}

// Exact state abbreviations are resolved first: IN must not match California.
// Other queries use AND across tokens and substring matching across fields.
func searchFBAWarehouses(directory *fbaWarehouseDirectory, query string) []fbaWarehouse {
	query = normalizeFBAQuery(query)
	results := []fbaWarehouse{}
	if query == "" || len([]rune(query)) > 120 {
		return results
	}
	state := ""
	for _, candidate := range directory.States {
		if query == strings.ToLower(candidate.Code) || query == strings.ToLower(candidate.Name) {
			state = candidate.Code
			break
		}
	}
	tokens := strings.Fields(query)
	for _, warehouse := range directory.Warehouses {
		if state != "" {
			if warehouse.State == state {
				results = append(results, warehouse)
			}
			continue
		}
		haystack := strings.ToLower(strings.Join([]string{warehouse.Code, warehouse.State, warehouse.StateName, warehouse.City, warehouse.ZIP, warehouse.Address, warehouse.Region}, " "))
		matches := true
		for _, token := range tokens {
			if !strings.Contains(haystack, token) {
				matches = false
				break
			}
		}
		if matches {
			results = append(results, warehouse)
		}
	}
	score := func(warehouse fbaWarehouse) int {
		code := strings.ToLower(warehouse.Code)
		if code == query {
			return 0
		}
		if strings.HasPrefix(code, query) {
			return 1
		}
		return 2
	}
	sort.SliceStable(results, func(i, j int) bool {
		if a, b := score(results[i]), score(results[j]); a != b {
			return a < b
		}
		return results[i].Code < results[j].Code
	})
	return results
}

func configureFBAWarehousePage(r *http.Request, data *publicSitePageData) error {
	if country := warehouseCountryFor(data.LanguageCode); country != nil {
		return configureCountryWarehousePage(r, data, country)
	}
	directory, err := loadFBAWarehouseDirectory()
	if err != nil {
		return err
	}
	query := strings.Join(strings.Fields(r.URL.Query().Get("q")), " ")
	page := &fbaWarehousePage{Query: query, Locations: len(directory.Warehouses)}
	page.DefaultState = !r.URL.Query().Has("q") && r.URL.Query().Get("mode") != "nearby"
	limit := 120
	if r.URL.Query().Get("mode") == "nearby" {
		limit = 200
	}
	if len([]rune(query)) > limit {
		page.Query = string([]rune(query)[:limit])
		page.Error = fmt.Sprintf("Use %d characters or fewer, then search again.", limit)
	} else {
		page.Results = searchFBAWarehouses(directory, query)
		if page.DefaultState {
			page.Results = searchFBAWarehouses(directory, "CA")
		}
	}
	for _, code := range []string{"ONT8", "LAX9", "FTW1", "MDW2", "ABE8", "TEB9"} {
		for _, warehouse := range directory.Warehouses {
			if warehouse.Code == code {
				page.Featured = append(page.Featured, warehouse)
				break
			}
		}
	}
	states := map[string]bool{}
	for _, warehouse := range directory.Warehouses {
		states[warehouse.State] = true
	}
	page.StateCount = len(states)
	if date, err := time.Parse("2006-01-02", directory.SourceCheckedAt); err == nil {
		page.CheckedAt = date.Format("2 January 2006")
	}
	encoded, err := json.Marshal(directory)
	if err != nil {
		return err
	}
	page.DirectoryJSON = template.JS(encoded)
	data.IsFBAWarehouseLookup, data.FBAWarehouse = true, page
	data.RobotsIndex = r.URL.RawQuery == ""
	data.PageTitle = "US Warehouse Map & Nearby FBA Address Search | FreightVanta"
	data.MetaDescription = "Find US FBA warehouse addresses by code or state. Search near a US address, city or ZIP, compare straight-line distances and filter warehouse types."
	data.MetaKeywords = "US warehouse map, nearby FBA warehouses, Amazon warehouse address lookup, US 3PL warehouse directory, warehouse ZIP code search"
	data.OGTitle, data.OGDescription = data.PageTitle, data.MetaDescription
	return nil
}
