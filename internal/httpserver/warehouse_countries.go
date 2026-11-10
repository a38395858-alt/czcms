package httpserver

import (
	"encoding/json"
	"html/template"
	"net/http"
	"strings"
	"sync"

	webassets "czcms/frontend"
	"unicode"
)

// Each market owns its addresses, geographic units, language and map. No US
// rows or illustrative shipping-price warehouses are used in these directories.
type warehouseCountry struct {
	Country, Language, Name, DefaultState, MapURL string
	Copy                                          map[string]string
	States                                        []fbaState
	Warehouses                                    []fbaWarehouse
	FeaturedCodes                                 []string
	Sources                                       []struct{ Name, URL string }
}

var warehouseCountries struct {
	sync.Once
	items map[string]*warehouseCountry
}

func warehouseCountryFor(language string) *warehouseCountry {
	warehouseCountries.Do(func() {
		warehouseCountries.items = map[string]*warehouseCountry{}
		for _, language := range []string{"de", "fr", "es", "it", "nl"} {
			body, err := webassets.Files.ReadFile("assets/data/warehouse-country." + language + ".json")
			var country warehouseCountry
			if err == nil && json.Unmarshal(body, &country) == nil && country.Language == language && country.Country == strings.ToUpper(language) && len(country.Warehouses) > 0 {
				warehouseCountries.items[language] = &country
			}
		}
	})
	return warehouseCountries.items[strings.ToLower(language)]
}

var warehouseLatinFold = strings.NewReplacer("à", "a", "á", "a", "â", "a", "ä", "a", "ã", "a", "å", "a", "ç", "c", "è", "e", "é", "e", "ê", "e", "ë", "e", "ì", "i", "í", "i", "î", "i", "ï", "i", "ñ", "n", "ò", "o", "ó", "o", "ô", "o", "ö", "o", "õ", "o", "ù", "u", "ú", "u", "û", "u", "ü", "u", "ý", "y", "ÿ", "y", "ß", "ss")

func normalizeWarehouseText(value string) string {
	var output strings.Builder
	for _, character := range warehouseLatinFold.Replace(strings.ToLower(value)) {
		if !unicode.Is(unicode.Mn, character) {
			output.WriteRune(character)
		}
	}
	return strings.Join(strings.Fields(strings.ReplaceAll(output.String(), "ß", "ss")), " ")
}

func searchCountryWarehouses(country *warehouseCountry, query string) []fbaWarehouse {
	query = normalizeWarehouseText(query)
	result := []fbaWarehouse{}
	if query == "" || len([]rune(query)) > 120 {
		return result
	}
	state := ""
	for _, candidate := range country.States {
		if query == normalizeWarehouseText(candidate.Name) || query == strings.ToLower(candidate.Code) {
			state = candidate.Code
			break
		}
	}
	for _, row := range country.Warehouses {
		if state != "" {
			if row.State == state {
				result = append(result, row)
			}
			continue
		}
		haystack := normalizeWarehouseText(strings.Join([]string{row.Code, row.Name, row.State, row.StateName, row.City, row.ZIP, row.Address}, " "))
		matched := true
		for _, token := range strings.Fields(query) {
			if !strings.Contains(haystack, token) {
				matched = false
				break
			}
		}
		if country.Country == "NL" && strings.ReplaceAll(query, " ", "") == strings.ToLower(strings.ReplaceAll(row.ZIP, " ", "")) {
			matched = true
		}
		if matched {
			result = append(result, row)
		}
	}
	return result
}

func configureCountryWarehousePage(r *http.Request, data *publicSitePageData, country *warehouseCountry) error {
	query := strings.Join(strings.Fields(r.URL.Query().Get("q")), " ")
	page := &fbaWarehousePage{Country: country, Query: query, Locations: len(country.Warehouses), CheckedAt: "2026-11-04"}
	page.DefaultState = !r.URL.Query().Has("q") && r.URL.Query().Get("mode") != "nearby"
	if page.DefaultState {
		page.Query = country.DefaultState
	}
	if len([]rune(query)) > 200 {
		page.Error = country.Copy["invalidQuery"]
		page.Query = string([]rune(query)[:200])
	} else if r.URL.Query().Get("mode") != "nearby" {
		page.Results = searchCountryWarehouses(country, page.Query)
		if len([]rune(query)) > 120 {
			page.Error = country.Copy["invalidQuery"]
		}
	}
	// Preserve the type filter for the no-JavaScript search too.
	if kind := r.URL.Query().Get("type"); kind == "fba" || kind == "3pl" {
		filtered := []fbaWarehouse{}
		for _, row := range page.Results {
			if row.Type == kind {
				filtered = append(filtered, row)
			}
		}
		page.Results = filtered
	}
	states := map[string]bool{}
	for _, row := range country.Warehouses {
		states[row.State] = true
	}
	page.StateCount = len(states)
	for _, code := range country.FeaturedCodes {
		for _, row := range country.Warehouses {
			if row.Code == code {
				page.Featured = append(page.Featured, row)
				break
			}
		}
	}
	encoded, err := json.Marshal(country)
	if err != nil {
		return err
	}
	page.DirectoryJSON = template.JS(encoded)
	data.IsFBAWarehouseLookup, data.FBAWarehouse = true, page
	data.RobotsIndex = r.URL.RawQuery == ""
	data.PageTitle = country.Copy["seoTitle"]
	data.MetaDescription, data.MetaKeywords = country.Copy["seoDescription"], country.Copy["seoKeywords"]
	data.OGTitle, data.OGDescription = data.PageTitle, data.MetaDescription
	return nil
}
