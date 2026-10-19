package app

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"czcms/internal/catalog"
	"czcms/internal/contentsafety"
)

func TestSixMarketEditorialArchivesAndReadingPages(t *testing.T) {
	a, err := New(testConfig(t), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	defer a.Close()
	s := catalog.New(a.db, contentsafety.NewSanitizer())
	now := time.Now().UTC().Format(time.RFC3339)
	result, err := a.db.Exec(`INSERT INTO users(username,display_name,password_hash,password_changed_at,created_at,updated_at) VALUES('editorial-qa','QA','test',?,?,?)`, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	actor, _ := result.LastInsertId()
	for _, market := range []struct {
		site, locale, code, contents, latest, anchor, empty string
		port                                                int
	}{
		{"global", "en", "en", "On this page", "Latest guide", "enquiry", "New guides are on the way.", 8081},
		{"germany", "de-DE", "de", "Auf dieser Seite", "Aktueller Leitfaden", "anfrage", "Neue Leitfäden folgen.", 8082},
		{"france", "fr-FR", "fr", "Dans ce guide", "Dernier guide", "demande", "De nouveaux guides arrivent.", 8083},
		{"spain", "es-ES", "es", "En esta guía", "Última guía", "solicitud", "Próximamente, nuevas guías.", 8084},
		{"italy", "it-IT", "it", "In questa guida", "Ultima guida", "richiesta", "Nuove guide in arrivo.", 8085},
		{"netherlands", "nl-NL", "nl", "In deze gids", "Nieuwste gids", "aanvraag", "Nieuwe gidsen volgen binnenkort.", 8086},
	} {
		t.Run(market.code, func(t *testing.T) {
			get := func(path string) string {
				r := httptest.NewRequest(http.MethodGet, fmt.Sprintf("http://localhost:%d%s", market.port, path), nil)
				w := httptest.NewRecorder()
				localPreviewHandler(a.Handler(), market.site).ServeHTTP(w, r)
				if w.Code != http.StatusOK {
					t.Fatalf("%s status=%d", path, w.Code)
				}
				return w.Body.String()
			}
			empty := get("/guides")
			if !strings.Contains(empty, market.empty) || strings.Contains(empty, "8 MIN") {
				t.Fatal("empty archive invented a guide or reading time")
			}
			site, err := s.SiteByCode(context.Background(), market.site)
			if err != nil {
				t.Fatal(err)
			}
			for i := 0; i < 3; i++ {
				_, err = s.CreateContent(context.Background(), actor, catalog.CreateContentInput{ContentType: "article", SiteID: site.ID, Locale: market.locale, Status: "published", Title: fmt.Sprintf("QA %s %d", market.code, i), Slug: fmt.Sprintf("editorial-qa-%d", i), Category: "Editorial QA", Tags: []string{"Editorial tag"}, Summary: "Preserved editorial summary.", BodyHTML: "<h2>Original section</h2><p>Preserved body.</p>", AIState: "manual"})
				if err != nil {
					t.Fatal(err)
				}
			}
			index := get("/guides")
			for _, want := range []string{"editorial-index", market.latest, "editorial-common.css", `href="/#` + market.anchor + `"`, `topic=Editorial&#43;QA`} {
				if !strings.Contains(index, want) {
					t.Fatalf("archive missing %q", want)
				}
			}
			if strings.Count(index, `href="/editorial-qa-2"`) == 0 {
				t.Fatal("latest guide missing")
			}
			filtered := get("/guides?topic=missing")
			if !strings.Contains(filtered, market.empty) || strings.Contains(filtered, "QA "+market.code) {
				t.Fatal("filter did not filter")
			}
			body := get("/editorial-qa-1")
			for _, want := range []string{market.contents, `id="fv-reading-section-1"`, `rel="prev"`, `rel="next"`, `href="/#` + market.anchor + `"`} {
				if !strings.Contains(body, want) {
					t.Fatalf("content missing %q", want)
				}
			}
			var kind, slug string
			if err = a.db.QueryRow(`SELECT kind,slug FROM taxonomy_terms WHERE site_id=? AND locale=? AND name='Editorial QA'`, site.ID, market.locale).Scan(&kind, &slug); err != nil {
				t.Fatal(err)
			}
			archive := get("/categories/" + slug)
			if !strings.Contains(archive, `class="editorial-index"`) || !strings.Contains(archive, "Editorial QA") {
				t.Fatal("taxonomy did not inherit editorial layout")
			}
		})
	}
}
