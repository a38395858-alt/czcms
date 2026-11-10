package httpserver

import (
	"encoding/json"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"

	"czcms/internal/catalog"
)

func TestFBAReferenceDirectoryIntegrityAndSearch(t *testing.T) {
	directory, err := loadFBAWarehouseDirectory()
	if err != nil {
		t.Fatal(err)
	}
	seen := map[string]bool{}
	states := map[string]fbaState{}
	for _, state := range directory.States {
		states[state.Code] = state
	}
	for _, warehouse := range directory.Warehouses {
		if seen[warehouse.Code] || !regexp.MustCompile(`^[A-Z0-9]{4}$`).MatchString(warehouse.Code) {
			t.Fatalf("invalid or duplicate warehouse code: %q", warehouse.Code)
		}
		seen[warehouse.Code] = true
		state, ok := states[warehouse.State]
		if !ok || state.Name != warehouse.StateName || state.Region != warehouse.Region || warehouse.Country != "US" || warehouse.City == "" || warehouse.Address == "" {
			t.Errorf("inconsistent address or state: %+v", warehouse)
		}
		if !regexp.MustCompile(`^\d{5}(-\d{4})?$`).MatchString(warehouse.ZIP) || !strings.HasPrefix(warehouse.SourceURL, "https://www.fbanearme.com/locations/usa/") {
			t.Errorf("missing postal code or attribution: %+v", warehouse)
		}
	}
	for _, query := range []string{"ont8", " ONT8 ", "Ont8 ca", "Moreno Valley", "92551", "Nandina"} {
		matches := searchFBAWarehouses(directory, query)
		found := false
		for _, item := range matches {
			found = found || item.Code == "ONT8"
		}
		if !found {
			t.Errorf("ONT8 missing for query %q", query)
		}
	}
	for _, query := range []string{"ca", "California", "IN", "inDIana", "NJ", "New Jersey", "OR", "TX", "ME"} {
		for _, warehouse := range searchFBAWarehouses(directory, query) {
			if query == "ME" || !(strings.EqualFold(query, warehouse.State) || strings.EqualFold(query, warehouse.StateName)) {
				t.Errorf("state search %q leaked %s", query, warehouse.StateName)
			}
		}
	}
	for _, query := range []string{"", " \t ", "not-a-real-warehouse", "ONT8 new jersey", strings.Repeat("x", 121)} {
		if len(searchFBAWarehouses(directory, query)) != 0 {
			t.Errorf("unexpected matches for %q", query)
		}
	}
	ca := searchFBAWarehouses(directory, "CA")
	if len(ca) == 0 || len(ca) != len(searchFBAWarehouses(directory, "california")) {
		t.Fatal("state code and full state name must return the same list")
	}
	zip := searchFBAWarehouses(directory, "08518")
	if len(zip) == 0 || zip[0].Code != "ABE8" || !strings.Contains(zip[0].FullAddress(), "NJ 08518") {
		t.Fatal("leading zero ZIP must be retained in search and copied address")
	}
}

func TestFBAWarehousePageValidationAndSchema(t *testing.T) {
	for _, query := range []string{"", "?q=ont8", "?q=" + strings.Repeat("a", 121)} {
		data := publicSitePageData{PublicOrigin: "http://localhost:8180", CurrentPath: "/preview/global/tools/fba-warehouse-lookup", HomePath: "/preview/global", Locale: "en", LanguageCode: "en", Preview: true}
		if err := configureFBAWarehousePage(httptest.NewRequest("GET", "/"+query, nil), &data); err != nil {
			t.Fatal(err)
		}
		if data.RobotsIndex != (query == "") || (len(query) > 120) != (data.FBAWarehouse.Error != "") {
			t.Fatalf("unexpected index or validation state for %q", query)
		}
		var schema map[string]any
		if err := json.Unmarshal([]byte(publicJSONLD(data, catalog.Site{Code: "global", Name: "FreightVanta"})), &schema); err != nil {
			t.Fatal(err)
		}
		if schema["url"] != data.PublicOrigin+data.CurrentPath || schema["mainEntity"].(map[string]any)["@type"] != "WebApplication" {
			t.Fatalf("FBA tool must describe its own URL and function: %v", schema)
		}
		items := schema["breadcrumb"].(map[string]any)["itemListElement"].([]any)
		if items[0].(map[string]any)["item"] != data.PublicOrigin+data.HomePath || len(items) != 2 {
			t.Fatalf("incorrect local tool breadcrumb: %v", items)
		}
	}
}
