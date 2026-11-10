package httpserver

import (
	"encoding/json"
	"strings"
	"testing"

	"czcms/internal/catalog"
)

func TestFallbackPagesUseTheirOwnSchemaURL(t *testing.T) {
	for _, tc := range []struct{ kind, schema string }{{"about", "AboutPage"}, {"contact", "ContactPage"}, {"services", "CollectionPage"}, {"culture", "WebPage"}} {
		t.Run(tc.kind, func(t *testing.T) {
			data := publicSitePageData{PublicOrigin: "http://localhost:8082", HomePath: "/", CurrentPath: "/" + tc.kind, Locale: "de-DE", LanguageCode: "de", PageTitle: "Localized page", Support: &publicSupportData{Kind: tc.kind}}
			data.Links = siteLinks(&data)
			var schema map[string]any
			if err := json.Unmarshal([]byte(publicJSONLD(data, catalog.Site{Code: "germany", Name: "FreightVanta"})), &schema); err != nil {
				t.Fatal(err)
			}
			if schema["@type"] != tc.schema || schema["url"] != data.PublicOrigin+data.CurrentPath {
				t.Fatalf("incorrect page schema: %v", schema)
			}
			items := schema["breadcrumb"].(map[string]any)["itemListElement"].([]any)
			if len(items) < 2 || items[len(items)-1].(map[string]any)["item"] != schema["url"] {
				t.Fatalf("incomplete breadcrumbs: %v", items)
			}
		})
	}
	guide := publicSitePageData{PublicOrigin: "http://localhost:8081", HomePath: "/", CurrentPath: "/guides", IsGuideIndex: true, HasContent: true, PageTitle: "Guides", Published: []publicContentData{{Title: "A guide", URL: "/guides/example"}}}
	var schema map[string]any
	if err := json.Unmarshal([]byte(publicJSONLD(guide, catalog.Site{Code: "global"})), &schema); err != nil {
		t.Fatal(err)
	}
	if schema["url"] != "http://localhost:8081/guides" || strings.Contains(publicJSONLD(guide, catalog.Site{Code: "global"}), `"item":"/guides/`) {
		t.Fatalf("guide URL is not absolute: %v", schema)
	}
	if len(schema["breadcrumb"].(map[string]any)["itemListElement"].([]any)) != 2 {
		t.Fatal("populated guide index loses its breadcrumb")
	}
}

func TestShippingToolBreadcrumbsUseTheirNewRoutes(t *testing.T) {
	for _, result := range []bool{false, true} {
		data := publicSitePageData{HomePath: "/preview/global", ShippingCalculatorURL: "/preview/global/tools/shipping-calculator", PageTitle: "China to USA Shipping Cost & Transit Time Lookup", IsShippingCalculator: !result, IsShippingPlanner: result}
		pageURL := "http://localhost:8180/preview/global/tools/shipping-calculator"
		want := 2
		if result {
			pageURL = "http://localhost:8180/preview/global/tools/shipping-results"
			want = 3
		}
		crumb := publicSchemaBreadcrumb(catalog.Site{Name: "FreightVanta"}, data, pageURL)
		items := crumb["itemListElement"].([]any)
		if len(items) != want || items[0].(map[string]any)["item"] != "http://localhost:8180/preview/global" || items[len(items)-1].(map[string]any)["item"] != pageURL {
			t.Fatalf("incorrect shipping tool breadcrumb: %v", items)
		}
		if result && items[1].(map[string]any)["item"] != "http://localhost:8180/preview/global/tools/shipping-calculator" {
			t.Fatal("results breadcrumb must link back to the calculator")
		}
	}
}

func TestFreightVantaAuthorDefaultsToPublisher(t *testing.T) {
	data := publicSitePageData{CanonicalURL: "https://example.com/guides/example", HasContent: true, Content: publicContentData{ContentType: "article", Title: "Example", H1: "Example", OwnerName: "backend-admin"}}
	generated := publicJSONLD(data, catalog.Site{Code: "global", Name: "FreightVanta"})
	var schema map[string]any
	if err := json.Unmarshal([]byte(generated), &schema); err != nil {
		t.Fatal(err)
	}
	author := schema["author"].(map[string]any)
	if author["@type"] != "Organization" || author["name"] != "FreightVanta" || strings.Contains(generated, "backend-admin") {
		t.Fatalf("backend owner treated as an author: %s", generated)
	}
	// An editor's explicit byline remains available; a backend username alone is not a byline.
	custom := safeStructuredData([]byte(`{"@type":"Article","author":{"@type":"Person","name":"Named expert","url":"https://example.com/team/expert"}}`), generated)
	if !strings.Contains(custom, `"author":{"@type":"Person"`) || !strings.Contains(custom, `"name":"Named expert"`) || !strings.Contains(custom, `"url":"https://example.com/team/expert"`) {
		t.Fatalf("explicit byline lost: %s", custom)
	}
}
