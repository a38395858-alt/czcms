package httpserver

import (
	"encoding/json"
	"testing"
)

func TestArticleDatesRemainAuthoritativeWithCustomStructuredData(t *testing.T) {
	for _, custom := range []string{
		`{"@type":"Article","datePublished":"2099-01-01","dateModified":"2099-01-02","description":"Custom description"}`,
		`{"@graph":[{"@type":"Article","datePublished":"2099-01-01","dateModified":"2099-01-02","description":"Custom description"}]}`,
	} {
		var schema map[string]any
		result := safeStructuredData(json.RawMessage(custom), `{"@type":"Article","datePublished":"2026-10-01","dateModified":"2026-10-28"}`)
		if err := json.Unmarshal([]byte(result), &schema); err != nil {
			t.Fatal(err)
		}
		if schema["datePublished"] != "2026-10-01" || schema["dateModified"] != "2026-10-28" || schema["description"] != "Custom description" {
			t.Fatalf("incorrect article dates or lost custom data: %s", result)
		}
	}
}
