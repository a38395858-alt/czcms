package httpserver

import (
	_ "embed"
	"encoding/json"
	"errors"
	"html/template"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"czcms/internal/taric"
)

const taricLookupSlug = "tools/taric-code-lookup"

//go:embed taric_copy.json
var taricCopyJSON []byte
var taricCopies = func() map[string]map[string]string {
	var v map[string]map[string]string
	if err := json.Unmarshal(taricCopyJSON, &v); err != nil {
		panic(err)
	}
	return v
}()
var nationalSources = map[string]string{
	"de": "https://auskunft.ezt-online.de/ezto/Welcome.do",
	"fr": "https://www.douane.gouv.fr/service-en-ligne",
	"es": "https://sede.agenciatributaria.gob.es/Sede/aduanas.html",
	"it": "https://www.adm.gov.it/portale/",
	"nl": "https://www.douane.nl/",
}

type taricItem struct {
	taric.Entry
	DetailURL string
}
type taricPage struct {
	Copy                                           map[string]string
	Result                                         taric.Result
	Items                                          []taricItem
	Entry                                          *taric.Entry
	Notes                                          []string
	Error                                          string
	Missing                                        bool
	Prefix                                         string
	PreviousURL, NextURL, OfficialURL, NationalURL string
	Origin, MeasureDate, Today                     string
	Measures                                       *taric.MeasureResult
	MeasureError                                   bool
	Context                                        template.JS
}

func (s *server) configureTARIC(r *http.Request, data *publicSitePageData, code string) (int, error) {
	if s.TARIC == nil {
		return http.StatusServiceUnavailable, errors.New("EU tariff service unavailable")
	}
	lang := data.LanguageCode
	c := taricCopies[lang]
	p := &taricPage{Copy: c, NationalURL: nationalSources[lang], Origin: "CN", Today: time.Now().UTC().Format("2006-01-02")}
	data.IsHTSLookup = true
	data.TARIC = p
	query := r.URL.Query().Get("q")
	page := htsPageNumber(r)
	limited := query != "" && !s.htsSearchLimiter.Allow(s.clientIP(r))
	if limited {
		query = ""
		page = 1
	}
	result, err := s.TARIC.Search(lang, query, page)
	if errors.Is(err, taric.ErrQuery) {
		result, _ = s.TARIC.Search(lang, "", 1)
		p.Error = c["error"]
		result.Query = query
		if len([]rune(query)) > 120 {
			result.Query = string([]rune(query)[:120])
		}
	} else if err != nil {
		return 503, err
	}
	p.Result = result
	p.MeasureDate = result.Date
	data.PageTitle = c["title"] + " | FreightVanta"
	data.MetaDescription = c["intro"]
	data.MetaKeywords = c["title"] + ", CN, TARIC, " + c["country"]
	data.RobotsIndex = r.URL.RawQuery == ""
	status := 200
	if limited {
		p.Error = c["tooMany"]
		status = http.StatusTooManyRequests
		data.RobotsIndex = false
	}
	if code != "" {
		entry, meta, found := s.TARIC.Detail(lang, code)
		if !found || len(code) != 10 {
			data.NotFound = true
			p.Missing = true
			status = 404
			data.RobotsIndex = false
			data.PageTitle = c["missing"] + " | FreightVanta"
			data.CanonicalURL = ""
			if len(code) >= 6 && taric.NormalizeCode(code) == code {
				if _, e := strconv.ParseUint(code, 10, 64); e == nil {
					p.Prefix = code[:6]
				}
			}
		} else {
			p.Entry = &entry
			p.Notes = s.TARIC.LegalNotes(lang, entry)
			p.Result.Date = meta.Date
			p.Result.RetrievedAt = meta.RetrievedAt
			p.MeasureDate = meta.Date
			data.PageTitle = entry.Formatted() + " · " + truncateTARIC(entry.Name(), 75) + " | " + c["country"] + " | FreightVanta"
			data.MetaDescription = c["code"] + " " + entry.Formatted() + ": " + truncateTARIC(entry.Name(), 110) + ". " + c["measures"] + " · " + c["classification"] + "."
			if origin := r.URL.Query().Get("origin"); origin != "" {
				p.Origin = strings.ToUpper(strings.TrimSpace(origin))
			}
			if date := r.URL.Query().Get("date"); date != "" {
				p.MeasureDate = date
			}
			if r.URL.Query().Get("measures") == "1" && s.taricMeasureLimiter.Allow(s.clientIP(r)) {
				m, e := s.TARIC.Measures(r.Context(), lang, code, p.Origin, p.MeasureDate)
				if e != nil {
					p.MeasureError = true
				} else {
					p.Measures = &m
				}
			} else if r.URL.Query().Get("measures") == "1" {
				p.MeasureError = true
			}
		}
	}
	for _, e := range result.Items {
		p.Items = append(p.Items, taricItem{Entry: e, DetailURL: data.TARICURL + "/" + e.Code})
	}
	makePage := func(n int) string {
		return data.TARICURL + "?" + url.Values{"q": {result.Query}, "page": {strconv.Itoa(n)}}.Encode()
	}
	if result.Page > 1 {
		p.PreviousURL = makePage(result.Page - 1)
	}
	if result.Page*taric.PageSize < result.Total {
		p.NextURL = makePage(result.Page + 1)
	}
	normalized := taric.NormalizeCode(result.Query)
	if result.ForeignCode && len(normalized) == 10 {
		p.Prefix = normalized[:6]
	}
	codeForSource := ""
	if p.Entry != nil {
		codeForSource = p.Entry.Code
	}
	p.OfficialURL = taric.OfficialURL(lang, codeForSource, p.Origin, p.MeasureDate)
	context, _ := json.Marshal(map[string]any{"language": lang, "copy": c, "baseURL": data.TARICURL, "code": codeForSource, "originCodes": taric.OriginCodes()})
	p.Context = template.JS(context)
	data.OGTitle, data.OGDescription = data.PageTitle, data.MetaDescription
	return status, nil
}
func truncateTARIC(s string, max int) string {
	r := []rune(s)
	if len(r) > max {
		return string(r[:max-1]) + "…"
	}
	return s
}

func (s *server) taricSearch(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	w.Header().Set("X-Robots-Tag", "noindex, nofollow")
	lang := r.URL.Query().Get("lang")
	c := taricCopies[lang]
	if c == nil {
		writeJSONError(w, 400, "Unsupported language")
		return
	}
	if !s.htsSearchLimiter.Allow(s.clientIP(r)) {
		w.Header().Set("Retry-After", "10")
		writeJSONError(w, 429, c["tooMany"])
		return
	}
	if s.TARIC == nil {
		writeJSONError(w, 503, c["measureError"])
		return
	}
	result, err := s.TARIC.Search(lang, r.URL.Query().Get("q"), htsPageNumber(r))
	if err != nil {
		writeJSONError(w, 400, c["error"])
		return
	}
	writeJSON(w, 200, result)
}
func (s *server) taricMeasures(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	w.Header().Set("X-Robots-Tag", "noindex, nofollow")
	q := r.URL.Query()
	lang := q.Get("lang")
	c := taricCopies[lang]
	if c == nil {
		writeJSONError(w, 400, "Unsupported language")
		return
	}
	if !s.taricMeasureLimiter.Allow(s.clientIP(r)) {
		w.Header().Set("Retry-After", "30")
		writeJSONError(w, 429, c["tooMany"])
		return
	}
	if s.TARIC == nil {
		writeJSONError(w, 503, c["measureError"])
		return
	}
	result, err := s.TARIC.Measures(r.Context(), lang, q.Get("code"), strings.ToUpper(strings.TrimSpace(q.Get("origin"))), q.Get("date"))
	if errors.Is(err, taric.ErrQuery) {
		writeJSONError(w, 400, c["inputError"])
		return
	}
	if err != nil {
		writeJSONError(w, 503, c["measureError"])
		return
	}
	writeJSON(w, 200, result)
}
