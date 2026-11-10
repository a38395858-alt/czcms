package httpserver

import (
	"czcms/internal/catalog"
	"encoding/json"
	"strings"
	"testing"
	"unicode"
)

func TestConfirmedCompanyIdentityStaysWithinFreightVantaSites(t *testing.T) {
	for _, code := range []string{"global", "germany", "france", "spain", "italy", "netherlands", "unrelated"} {
		org := publicSchemaOrganization(catalog.Site{Code: code, Name: "Other site"}, "https://example.test/about")
		if code == "unrelated" {
			if org["legalName"] != nil {
				t.Fatal("operator facts leaked into unrelated site")
			}
			continue
		}
		if org["legalName"] != freightVantaLegalName || org["name"] != "FreightVanta" {
			t.Fatal("operator mismatch", org)
		}
		address := org["address"].(map[string]any)
		if address["addressCountry"] != "CN" || !strings.Contains(address["streetAddress"].(string), "Room 606, No. 21 Xinqiao 3rd Road") {
			t.Fatal("address mismatch")
		}
	}
	schema := importedTopicSchema(importedTopicPage{Heading: "Sourcing"}, importedTopicContext{SiteURL: "https://example.test", Route: "product-sourcing", Locale: "en"})
	var parsed map[string]any
	if json.Unmarshal([]byte(schema), &parsed) != nil || !strings.Contains(schema, freightVantaLegalName) {
		t.Fatal("topic identity missing")
	}
}

func TestCompanyPresentationUsesSiteLanguage(t *testing.T) {
	for _, locale := range []string{"en", "de", "fr", "es", "it", "nl"} {
		t.Run(locale, func(t *testing.T) {
			copy := companyCopyFor(locale)
			body, err := json.Marshal(copy)
			if err != nil {
				t.Fatal(err)
			}
			if strings.ContainsFunc(string(body), func(r rune) bool { return unicode.Is(unicode.Han, r) }) {
				t.Fatal("Chinese text remains in localized company copy")
			}
			if !strings.Contains(copy.BusinessAddress, "606") || !strings.Contains(copy.BusinessAddress, "Xinqiao") {
				t.Fatal("localized business address is incomplete")
			}
			if locale != "en" && copy.BusinessAddress == companyCopyFor("en").BusinessAddress {
				t.Fatal("business address was not localized")
			}
		})
	}
}

func TestSitemapTimestampFormats(t *testing.T) {
	for _, c := range []struct{ in, out string }{{"2026-10-20 06:05:05", "2026-10-20T06:05:05Z"}, {"2026-10-20T14:05:05+08:00", "2026-10-20T06:05:05Z"}, {"2026-10-20", "2026-10-20T00:00:00Z"}, {"invalid", ""}, {"", ""}} {
		if got := sitemapLastMod(c.in); got != c.out {
			t.Fatalf("%q -> %q want %q", c.in, got, c.out)
		}
	}
}
