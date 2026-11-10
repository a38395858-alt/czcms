package hts

import (
	"encoding/json"
	"fmt"
	"html"
	"regexp"
	"strconv"
	"strings"
)

type rawEntry struct {
	Code        string   `json:"htsno"`
	Indent      string   `json:"indent"`
	Description string   `json:"description"`
	Units       []string `json:"units"`
	General     string   `json:"general"`
	Special     string   `json:"special"`
	Other       string   `json:"other"`
	Footnotes   []struct {
		Marker string `json:"marker"`
		Value  string `json:"value"`
	} `json:"footnotes"`
}

type Part struct {
	Code        string `json:"code"`
	Description string `json:"description"`
}

type Entry struct {
	Code          string   `json:"code"`
	Formatted     string   `json:"formattedCode"`
	Description   string   `json:"description"`
	Hierarchy     []Part   `json:"hierarchy"`
	Units         string   `json:"units"`
	GeneralRate   string   `json:"generalRate"`
	RateSource    string   `json:"rateSource"`
	SpecialRate   string   `json:"specialRate"`
	SpecialSource string   `json:"specialSource"`
	OtherRate     string   `json:"otherRate"`
	OtherSource   string   `json:"otherSource"`
	Footnotes     []string `json:"footnotes"`
}

var tags = regexp.MustCompile(`</?[A-Za-z][^>]*>`)
var numericCode = regexp.MustCompile(`^\d{4}(?:\.\d{2})?(?:\.\d{2})?(?:\.\d{2})?$`)

func plain(value string) string {
	return strings.Join(strings.Fields(html.UnescapeString(tags.ReplaceAllString(value, " "))), " ")
}

// The export is a legal hierarchy, not independent ten-digit records. Preserve
// the ancestors, and inherit a rate only from a coded ancestor of this code.
func normalize(body []byte) ([]Entry, error) {
	var rows []rawEntry
	if err := json.Unmarshal(body, &rows); err != nil {
		return nil, fmt.Errorf("invalid official HTS JSON: %w", err)
	}
	type level struct {
		rawEntry
		depth int
	}
	stack := []level{}
	entries := []Entry{}
	seen := map[string]bool{}
	for _, row := range rows {
		depth, err := strconv.Atoi(row.Indent)
		if err != nil || depth < 0 || depth > 30 {
			return nil, fmt.Errorf("invalid HTS hierarchy depth")
		}
		if row.Code != "" && !numericCode.MatchString(row.Code) {
			return nil, fmt.Errorf("invalid official HTS code %q", row.Code)
		}
		for len(stack) > 0 && stack[len(stack)-1].depth >= depth {
			stack = stack[:len(stack)-1]
		}
		row.Description, row.General = plain(row.Description), plain(row.General)
		row.Special, row.Other = plain(row.Special), plain(row.Other)
		code := strings.ReplaceAll(row.Code, ".", "")
		if len(code) == 10 {
			if seen[code] || row.Description == "" {
				return nil, fmt.Errorf("duplicate or empty ten-digit record %q", code)
			}
			seen[code] = true
			e := Entry{Code: code, Formatted: row.Code, Description: row.Description, GeneralRate: row.General, RateSource: row.Code, Hierarchy: []Part{}, Footnotes: []string{}}
			e.SpecialRate, e.SpecialSource, e.OtherRate, e.OtherSource = row.Special, row.Code, row.Other, row.Code
			units := row.Units
			for _, ancestor := range stack {
				if ancestor.Description != "" {
					e.Hierarchy = append(e.Hierarchy, Part{Code: ancestor.Code, Description: ancestor.Description})
				}
			}
			for i := len(stack) - 1; i >= 0; i-- {
				ancestor := stack[i]
				parent := strings.ReplaceAll(ancestor.Code, ".", "")
				if parent == "" || !strings.HasPrefix(code, parent) {
					continue
				}
				if e.GeneralRate == "" && ancestor.General != "" {
					e.GeneralRate, e.RateSource = ancestor.General, ancestor.Code
				}
				if len(units) == 0 && len(ancestor.Units) > 0 {
					units = ancestor.Units
				}
				if e.SpecialRate == "" && ancestor.Special != "" {
					e.SpecialRate, e.SpecialSource = ancestor.Special, ancestor.Code
				}
				if e.OtherRate == "" && ancestor.Other != "" {
					e.OtherRate, e.OtherSource = ancestor.Other, ancestor.Code
				}
			}
			for _, u := range units {
				if value := plain(u); value != "" {
					if e.Units != "" {
						e.Units += "; "
					}
					e.Units += value
				}
			}
			// Keep inherited footnotes: they can qualify a displayed base rate.
			for _, ancestor := range append(stack, level{rawEntry: row}) {
				for _, note := range ancestor.Footnotes {
					if value := plain(note.Value); value != "" {
						e.Footnotes = append(e.Footnotes, strings.TrimSpace(note.Marker+" "+value))
					}
				}
			}
			if e.GeneralRate == "" {
				e.RateSource = ""
			}
			if e.SpecialRate == "" {
				e.SpecialSource = ""
			}
			if e.OtherRate == "" {
				e.OtherSource = ""
			}
			entries = append(entries, e)
		}
		stack = append(stack, level{rawEntry: row, depth: depth})
	}
	return entries, nil
}
