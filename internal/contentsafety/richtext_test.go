package contentsafety

import (
	"strings"
	"testing"
)

func TestSanitizeRemovesActiveContent(t *testing.T) {
	cleaned, err := NewSanitizer().Sanitize(`<p onclick="steal()">Hello <strong>world</strong><script>alert(1)</script><a href="javascript:bad()">bad</a></p>`)
	if err != nil {
		t.Fatal(err)
	}
	for _, forbidden := range []string{"onclick", "script", "javascript:"} {
		if strings.Contains(strings.ToLower(cleaned), forbidden) {
			t.Fatalf("unsafe output: %s", cleaned)
		}
	}
	if !strings.Contains(cleaned, "<strong>world</strong>") {
		t.Fatalf("safe formatting removed: %s", cleaned)
	}
}
