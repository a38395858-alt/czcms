package taric

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"net/url"
	"regexp"
	"strings"
	"time"

	"golang.org/x/net/html"
)

type Measure struct {
	Description string `json:"description"`
	Rate        string `json:"rate"`
	Area        string `json:"area"`
	Regulation  string `json:"regulation"`
	Conditional bool   `json:"conditional"`
}
type MeasureResult struct {
	Items     []Measure `json:"items"`
	Code      string    `json:"code"`
	Origin    string    `json:"origin"`
	Date      string    `json:"date"`
	CheckedAt string    `json:"checkedAt"`
	SourceURL string    `json:"sourceURL"`
	Stale     bool      `json:"stale"`
}

var originCode = regexp.MustCompile(`^[A-Z]{2}$`)

const countryCodes = " AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW "

var detailLink = regexp.MustCompile(`'([^']*measures_details\.jsp[^']*)'`)

// OriginCodes shares the accepted ISO country list with the query interface.
func OriginCodes() []string { return strings.Fields(countryCodes) }

func OfficialURL(lang, code, origin, date string) string {
	q := url.Values{"Lang": {lang}, "Taric": {code}, "Area": {origin}, "SimDate": {strings.ReplaceAll(date, "-", "")}}
	return Source + "measures.jsp?" + q.Encode()
}

func (s *Service) Measures(ctx context.Context, lang, code, origin, date string) (MeasureResult, error) {
	result := MeasureResult{Items: []Measure{}, Code: code, Origin: origin, Date: date, SourceURL: OfficialURL(lang, code, origin, date)}
	d, err := time.Parse("2006-01-02", date)
	if !Supported(lang) || len(code) != 10 || !digits.MatchString(code) || !originCode.MatchString(origin) || !strings.Contains(countryCodes, " "+origin+" ") || err != nil || d.Year() < 2007 || date > time.Now().UTC().Format("2006-01-02") {
		return result, ErrQuery
	}
	if _, _, ok := s.Detail(lang, code); !ok {
		return result, ErrQuery
	}
	key := strings.Join([]string{lang, code, origin, date}, "|")
	// Serialize external retrievals. Classification searches never take this lock.
	s.ratesMu.Lock()
	defer s.ratesMu.Unlock()
	if err := ctx.Err(); err != nil {
		return result, err
	}
	var old MeasureResult
	var payload, checked string
	if s.db != nil {
		if err = s.db.QueryRowContext(ctx, `SELECT payload, checked_at FROM taric_measure_cache WHERE cache_key=?`, key).Scan(&payload, &checked); err == nil {
			_ = json.Unmarshal([]byte(payload), &old)
			if t, e := time.Parse(time.RFC3339, checked); e == nil && time.Since(t) < 24*time.Hour {
				return old, nil
			}
		} else if !errors.Is(err, sql.ErrNoRows) {
			return result, err
		}
	}
	raw, err := s.get(ctx, strings.TrimPrefix(result.SourceURL, Source)+"&ExpandAll=true")
	if err == nil {
		var found [][]byte
		for _, candidate := range detailLink.FindAllSubmatch(raw, -1) {
			u, e := url.Parse(string(candidate[1]))
			if e == nil && u.Query().Get("Taric") == code && u.Query().Get("Area") == origin && u.Query().Get("SimDate") == strings.ReplaceAll(date, "-", "") {
				found = candidate
				break
			}
		}
		if len(found) < 2 {
			err = errors.New("official measure detail link missing")
		} else {
			relative := string(found[1])
			u, e := url.Parse(relative)
			if e != nil || u.IsAbs() || strings.Contains(u.Path, "..") || u.Path != "measures_details.jsp" {
				err = errors.New("invalid official detail link")
			} else {
				raw, err = s.get(ctx, relative)
				if err == nil {
					result.Items, err = parseMeasures(raw)
				}
			}
		}
	}
	if err != nil {
		if old.CheckedAt != "" {
			old.Stale = true
			return old, nil
		}
		return result, err
	}
	result.CheckedAt = time.Now().UTC().Format(time.RFC3339)
	if s.db != nil {
		payload, _ := json.Marshal(result)
		_, err = s.db.ExecContext(ctx, `INSERT INTO taric_measure_cache(cache_key,payload,checked_at) VALUES(?,?,?) ON CONFLICT(cache_key) DO UPDATE SET payload=excluded.payload,checked_at=excluded.checked_at`, key, string(payload), result.CheckedAt)
		if err != nil {
			return result, err
		}
	}
	return result, nil
}
func attr(n *html.Node, key string) string {
	for _, a := range n.Attr {
		if a.Key == key {
			return a.Val
		}
	}
	return ""
}
func class(n *html.Node, name string) bool {
	return strings.Contains(" "+attr(n, "class")+" ", " "+name+" ")
}
func nodeText(n *html.Node) string {
	var b strings.Builder
	var walk func(*html.Node)
	walk = func(n *html.Node) {
		if n.Type == html.TextNode {
			b.WriteString(n.Data)
			b.WriteByte(' ')
		}
		if n.Type == html.ElementNode && (n.Data == "script" || n.Data == "style") {
			return
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
	}
	walk(n)
	return strings.Join(strings.Fields(b.String()), " ")
}
func parseMeasures(raw []byte) ([]Measure, error) {
	doc, err := html.Parse(strings.NewReader(string(raw)))
	if err != nil {
		return nil, err
	}
	out := []Measure{}
	area := ""
	var walk func(*html.Node)
	walk = func(n *html.Node) {
		if class(n, "measure_area") {
			area = nodeText(n)
		}
		if n.Type == html.ElementNode && strings.HasPrefix(attr(n, "id"), "measure_") && n.Data == "div" {
			m := Measure{Area: area}
			isImport := false
			var read func(*html.Node)
			read = func(c *html.Node) {
				if c.Data == "img" && strings.Contains(attr(c, "src"), "/import.png") {
					isImport = true
				}
				if class(c, "td_measure_description") {
					m.Description = nodeText(c)
				}
				if class(c, "duty_rate") {
					m.Rate = nodeText(c)
				}
				if class(c, "regulation_link") {
					if m.Regulation != "" {
						m.Regulation += "; "
					}
					m.Regulation += nodeText(c)
				}
				if strings.Contains(attr(c, "onclick"), "measures_conditions.jsp") {
					m.Conditional = true
				}
				for k := c.FirstChild; k != nil; k = k.NextSibling {
					read(k)
				}
			}
			read(n)
			if isImport && m.Description != "" {
				out = append(out, m)
			}
			return
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
	}
	walk(doc)
	if len(out) == 0 {
		return nil, errors.New("official import measures absent; verify source")
	}
	return out, nil
}
