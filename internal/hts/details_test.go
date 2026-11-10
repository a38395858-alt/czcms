package hts

import (
	"context"
	"testing"
)

func TestDetailRatesInheritIndependentlyAndStayMissing(t *testing.T) {
	body := `[
 {"htsno":"3909","indent":"0","description":"Resins, in primary forms:","general":"8%","special":"Free (A)","other":"20%"},
 {"htsno":"3909.50","indent":"1","description":"Polyurethanes:","general":"6.3%","special":"Free (AU)","other":""},
 {"htsno":"3909.50.50.00","indent":"2","description":"Other","general":"","special":"","other":"15.4¢/kg + 51.5%","units":["kg"]},
 {"htsno":"3910.00.00.00","indent":"0","description":"Other","general":"","special":"","other":""}
 ]`
	entries, err := normalize([]byte(body))
	if err != nil || len(entries) != 2 {
		t.Fatalf("%v %+v", err, entries)
	}
	e := entries[0]
	if e.GeneralRate != "6.3%" || e.RateSource != "3909.50" || e.SpecialRate != "Free (AU)" || e.SpecialSource != "3909.50" || e.OtherRate != "15.4¢/kg + 51.5%" || e.OtherSource != e.Formatted {
		t.Fatalf("independent rate inheritance lost: %+v", e)
	}
	if e.Description != "Other" || e.DisplayName() != "Other polyurethanes, in primary forms" {
		t.Fatalf("legal leaf or contextual title changed: %+v", e)
	}
	e = entries[1]
	if e.GeneralRate != "" || e.SpecialRate != "" || e.OtherRate != "" || e.RateSource != "" || e.SpecialSource != "" || e.OtherSource != "" {
		t.Fatalf("missing rate became a claim: %+v", e)
	}
}

func TestOfficialDetailRatesAndSafeUpgrade(t *testing.T) {
	s := testService(t, Options{})
	ctx := context.Background()
	r, err := s.Search(ctx, "3909505000", 1)
	if err != nil || len(r.Items) != 1 {
		t.Fatalf("%v %+v", err, r)
	}
	e := r.Items[0]
	if e.GeneralRate != "6.3%" || e.OtherRate != "15.4¢/kg + 51.5%" || e.SpecialRate != "Free (A*,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)" {
		t.Fatalf("official detail rates: %+v", e)
	}
	for _, differentSnapshot := range []bool{false, true} {
		if _, err = s.db.Exec(`UPDATE hts_entries SET special_rate='',special_source='',other_rate='',other_source=''; UPDATE hts_state SET detail_version=0`); err != nil {
			t.Fatal(err)
		}
		if differentSnapshot {
			if _, err = s.db.Exec(`UPDATE hts_state SET source_sha256='different-newer-snapshot',release_label='Newer release'`); err != nil {
				t.Fatal(err)
			}
		}
		s.ready.Store(false)
		upgraded, err := s.Search(ctx, "3909505000", 1)
		if err != nil || upgraded.Items[0].GeneralRate != e.GeneralRate {
			t.Fatalf("upgrade lost base data: %+v %v", upgraded, err)
		}
		if !differentSnapshot && (upgraded.Items[0].SpecialRate != e.SpecialRate || upgraded.Items[0].OtherRate != e.OtherRate || upgraded.Metadata != r.Metadata) {
			t.Fatal("same-snapshot upgrade lost rates or changed metadata")
		}
		if differentSnapshot && (upgraded.Items[0].SpecialRate != "" || upgraded.Metadata.Label != "Newer release" || upgraded.Metadata.SHA256 != "different-newer-snapshot") {
			t.Fatal("bundled data replaced a different installed snapshot")
		}
	}
}
