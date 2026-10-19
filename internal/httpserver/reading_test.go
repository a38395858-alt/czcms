package httpserver

import (
	"strings"
	"testing"
)

func TestReadingOutlinePreservesAuthoredAnchorsAndMedia(t *testing.T) {
	body := `<div id="fv-reading-section-1"></div><h2>First <em>step</em> &amp; context</h2><p>Keep <a href="/route">this link</a>.</p><h3 id="authored">Details</h3><h2>Details</h2><img src="/media/32/image" alt="Uploaded reference">`
	out, headings := readingOutline(body)
	if len(headings) != 3 || headings[0].Title != "First step & context" || headings[0].ID != "fv-reading-section-2" || headings[1].ID != "authored" || headings[2].ID == headings[0].ID {
		t.Fatalf("incorrect outline: %+v", headings)
	}
	for _, expected := range []string{`href="/route"`, `id="authored"`, `src="/media/32/image"`, `alt="Uploaded reference"`} {
		if !strings.Contains(out, expected) {
			t.Fatalf("lost authored content: %s", expected)
		}
	}
	if _, headings = readingOutline(`<p>No headings here.</p>`); len(headings) != 0 {
		t.Fatal("invented headings")
	}
}
