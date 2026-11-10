package httpserver

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	webassets "czcms/frontend"
)

func TestCountryWarehouseDirectoriesAndGeography(t *testing.T) {
	for _, item := range []struct {
		Language, Query, Code string
		Regions               int
	}{{"de", "dus2", "DUS2", 16}, {"fr", "ile-de-france", "ORY4", 13}, {"es", "08820", "BCN1", 19}, {"it", "02032", "FCO1", 20}, {"nl", "4704rg", "3PL-AA-ROO", 12}} {
		country := warehouseCountryFor(item.Language)
		if country == nil || len(country.States) != item.Regions {
			t.Fatalf("missing directory/regions: %s", item.Language)
		}
		matches := searchCountryWarehouses(country, item.Query)
		if len(matches) == 0 || matches[0].Code != item.Code {
			t.Fatalf("country search %s/%s: %+v", item.Language, item.Query, matches)
		}
		if len(searchCountryWarehouses(country, "ONT8")) != 0 || len(searchCountryWarehouses(country, "")) != 0 {
			t.Fatal("country data isolation or empty search failed")
		}
		var geo struct {
			Features []struct{ Properties struct{ ShapeName string } }
		}
		body, err := webassets.Files.ReadFile(strings.TrimPrefix(country.MapURL, "/"))
		if err != nil || json.Unmarshal(body, &geo) != nil || len(geo.Features) != item.Regions {
			t.Fatalf("wrong country map: %s", item.Language)
		}
		names := map[string]bool{}
		for _, s := range country.States {
			names[s.Name] = true
		}
		for _, f := range geo.Features {
			if !names[f.Properties.ShapeName] {
				t.Fatalf("unmapped region %s", f.Properties.ShapeName)
			}
		}
		for _, row := range country.Warehouses {
			if row.Country != country.Country || row.Address == "" || row.SourceURL == "" || !validEuropeanPoint(row.Country, row.Lat, row.Lng) || row.Type != "fba" && row.Type != "3pl" {
				t.Fatalf("invalid country record: %+v", row)
			}
			if row.Country == "NL" && row.Type == "fba" {
				t.Fatal("unverified Dutch FBA facility")
			}
		}
	}
}

func TestEuropeanWarehouseLocalLocations(t *testing.T) {
	for _, item := range []struct{ Language, Query, Precision string }{{"de", "04158", "zip-centroid"}, {"fr", "Paris", "city-centroid"}, {"es", "08820", "zip-centroid"}, {"it", "02032", "zip-centroid"}, {"nl", "4704 rg", "zip-centroid"}, {"nl", "4704RG", "zip-centroid"}} {
		c := warehouseCountryFor(item.Language)
		rows, handled, err := localEuropeanWarehouseLocations(c, item.Query)
		if err != nil || !handled || len(rows) == 0 || rows[0].Country != c.Country || rows[0].Precision != item.Precision || !validEuropeanPoint(c.Country, rows[0].Lat, rows[0].Lng) {
			t.Fatalf("local search %s %s: %+v %v", item.Language, item.Query, rows, err)
		}
	}
	rows, handled, err := localEuropeanWarehouseLocations(warehouseCountryFor("de"), "Invalidstrasse 1, 10115 Berlin")
	if err != nil || handled || len(rows) != 0 {
		t.Fatal("street searches must not silently fall back to postal centers")
	}
	de, _, _ := localEuropeanWarehouseLocations(warehouseCountryFor("de"), "10115")
	es, _, _ := localEuropeanWarehouseLocations(warehouseCountryFor("es"), "10115")
	if len(de) > 0 && len(es) > 0 && de[0].Lat == es[0].Lat {
		t.Fatal("same postcode crossed countries")
	}
}

func TestEuropeanWarehouseGeocoderCountryRestriction(t *testing.T) {
	c := warehouseCountryFor("fr")
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("countrycodes") != "fr" || r.URL.Query().Get("accept-language") != "fr" || !strings.Contains(r.Header.Get("User-Agent"), "FreightVanta") {
			t.Error("missing country restriction/attribution")
		}
		_, _ = w.Write([]byte(`[{"lat":"48.85","lon":"2.35","display_name":"Paris","address":{"country_code":"fr"}},{"lat":"52.5","lon":"13.4","display_name":"Berlin","address":{"country_code":"de"}},{"lat":"NaN","lon":"2.35","display_name":"Invalid","address":{"country_code":"fr"}}]`))
	}))
	defer upstream.Close()
	t.Setenv("CZCMS_EU_GEOCODER_URL", upstream.URL)
	rows, err := nominatimWarehouseLocations(context.Background(), c, "Paris", upstream.Client())
	if err != nil || len(rows) != 1 || rows[0].Country != "FR" {
		t.Fatalf("unsafe upstream candidates: %+v %v", rows, err)
	}
}
