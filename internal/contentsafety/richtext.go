package contentsafety

import (
	"bytes"
	"errors"
	"strings"

	"github.com/microcosm-cc/bluemonday"
)

const MaxRichTextBytes = 2 << 20

type Sanitizer struct {
	policy *bluemonday.Policy
}

func NewSanitizer() *Sanitizer {
	p := bluemonday.NewPolicy()
	p.AllowElements("p", "br", "strong", "em", "b", "i", "u", "s", "blockquote", "pre", "code", "ul", "ol", "li", "h2", "h3", "h4", "h5", "h6", "figure", "figcaption", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "hr", "a", "img")
	p.AllowAttrs("href", "title").OnElements("a")
	p.AllowAttrs("src", "alt", "title", "width", "height", "loading").OnElements("img")
	p.AllowAttrs("colspan", "rowspan", "scope").OnElements("th", "td")
	p.AllowAttrs("class").Matching(bluemonday.SpaceSeparatedTokens).OnElements("pre", "code")
	p.AllowURLSchemes("http", "https", "mailto")
	p.AllowRelativeURLs(true)
	p.RequireNoFollowOnLinks(true)
	p.RequireNoReferrerOnLinks(true)
	p.AddTargetBlankToFullyQualifiedLinks(true)
	return &Sanitizer{policy: p}
}

func (s *Sanitizer) Sanitize(input string) (string, error) {
	if len(input) > MaxRichTextBytes {
		return "", errors.New("富文本不能超过 2 MiB")
	}
	cleaned := s.policy.SanitizeBytes([]byte(input))
	cleaned = bytes.TrimSpace(cleaned)
	if len(cleaned) == 0 && strings.TrimSpace(input) != "" {
		return "", errors.New("内容仅包含不允许的 HTML")
	}
	return string(cleaned), nil
}
