package dutytax

import (
	"encoding/json"
	"errors"
	"reflect"
	"strings"
	"testing"
)

func fixture(t *testing.T, destination string) Request {
	t.Helper()
	r, err := SampleRequest(destination)
	if err != nil {
		t.Fatal(err)
	}
	return r
}
func find(t *testing.T, r Result, key string) Component {
	t.Helper()
	for _, c := range r.Components {
		if c.Key == key {
			return c
		}
	}
	t.Fatalf("missing component %q", key)
	return Component{}
}
func amount(t *testing.T, actual *string, expected string) {
	t.Helper()
	if actual == nil || *actual != expected {
		t.Fatalf("amount=%v want %s", actual, expected)
	}
}
func TestFranceSyntheticFixture(t *testing.T) {
	r, err := Calculate(fixture(t, "FR"))
	if err != nil {
		t.Fatal(err)
	}
	if !r.Synthetic || r.Status != StatusEstimated || r.SampleTotals == nil {
		t.Fatalf("not synthetic complete fixture: %+v", r)
	}
	amount(t, r.CustomsValue, "1110.00")
	amount(t, r.VATBase, "1215.50")
	amount(t, find(t, r, "base_duty").Amount, "55.50")
	amount(t, find(t, r, "import_vat").Amount, "243.10")
	if r.SampleTotals.Taxes != "298.60" || r.SampleTotals.ImportCharges != "328.60" || r.SampleTotals.LandedCost != "1458.60" {
		t.Fatalf("incorrect sample totals: %+v", r.SampleTotals)
	}
	if r.KnownSubtotal != "328.60" || r.KnownTaxSubtotal != "298.60" {
		t.Fatal(r)
	}
	if len(r.ScenarioComponents) != 0 || r.ScenarioVATBase != nil {
		t.Fatal("synthetic complete result unexpectedly conditional")
	}
	if len(r.Warnings) == 0 || r.Warnings[2].Code != "synthetic_sample" {
		t.Fatal("sample must be labelled synthetic")
	}
}
func TestUnitedStatesPartialSample(t *testing.T) {
	r, err := Calculate(fixture(t, "US"))
	if err != nil {
		t.Fatal(err)
	}
	if !r.Synthetic || r.Status != StatusPartial || r.SampleTotals != nil {
		t.Fatal(r)
	}
	amount(t, r.CustomsValue, "1000.00")
	amount(t, find(t, r, "base_duty").Amount, "50.00")
	for _, key := range []string{"additional_duties", "government_fees", "clearance_service"} {
		c := find(t, r, key)
		if c.Amount != nil || c.Status != ComponentUnknown {
			t.Errorf("%s must be unknown/null: %+v", key, c)
		}
	}
	vat := find(t, r, "import_vat")
	if vat.Status != ComponentNotApplicable || vat.Amount != nil || vat.RatePercent != nil || r.VATBase != nil {
		t.Fatal(vat)
	}
	if r.KnownSubtotal != "50.00" {
		t.Fatal(r.KnownSubtotal)
	}
}
func TestManualSevenCountriesNeverLegalTotals(t *testing.T) {
	for _, country := range []string{"US", "DE", "FR", "ES", "IT", "NL", "GB"} {
		t.Run(country, func(t *testing.T) {
			req := fixture(t, "FR")
			req.Destination = country
			req.Currency = countryCurrency[country]
			req.Mode = ModeManual
			req.DutyRate = "5"
			req.VATRate = "20"
			r, err := Calculate(req)
			if err != nil {
				t.Fatal(err)
			}
			if r.Status != StatusManualReview || r.Synthetic || r.SampleTotals != nil || r.VATBase != nil {
				t.Fatal(r)
			}
			if country == "US" {
				amount(t, r.CustomsValue, "1000.00")
				if len(r.ScenarioComponents) != 0 {
					t.Fatal(r.ScenarioComponents)
				}
			} else {
				amount(t, r.CustomsValue, "1110.00")
				amount(t, r.ScenarioVATBase, "1215.50")
				if len(r.ScenarioComponents) != 1 {
					t.Fatal(r.ScenarioComponents)
				}
				amount(t, r.ScenarioComponents[0].Amount, "243.10")
				if find(t, r, "import_vat").Amount != nil {
					t.Fatal("scenario VAT leaked into known tax")
				}
			}
			if find(t, r, "base_duty").Source != "user_assumption" {
				t.Fatal("manual rate falsely authoritative")
			}
			if r.KnownTaxSubtotal == "298.60" {
				t.Fatal("VAT scenario included in known total")
			}
		})
	}
}
func TestEstimatePublicRatesCannotBecomeVerified(t *testing.T) {
	req := fixture(t, "FR")
	req.Mode = ModeEstimate
	req.DutyRate = "5"
	req.VATRate = "20"
	r, err := Calculate(req)
	if err != nil {
		t.Fatal(err)
	}
	if find(t, r, "base_duty").Amount != nil || r.KnownTaxSubtotal != "0.00" || r.SampleTotals != nil || r.Status != StatusPartial {
		t.Fatal(r)
	}
	if r.Request.DutyRate != "" || r.Request.VATRate != "" {
		t.Fatal("ignored rates echoed as active")
	}
}
func TestEstimateServerBaseRate(t *testing.T) {
	for _, rate := range []string{"6.3", "6.3%", "Free"} {
		t.Run(rate, func(t *testing.T) {
			req := fixture(t, "US")
			req.Mode = ModeManual
			req.DutyRate = "999"
			req.VATRate = "999"
			r, err := CalculateEstimate(req, rate)
			if err != nil {
				t.Fatal(err)
			}
			want := "63.00"
			if rate == "Free" {
				want = "0.00"
			}
			amount(t, find(t, r, "base_duty").Amount, want)
			if r.Status != StatusPartial || r.Synthetic || r.SampleTotals != nil {
				t.Fatal(r)
			}
			if find(t, r, "additional_duties").Amount != nil || find(t, r, "government_fees").Amount != nil {
				t.Fatal("unknown charges replaced by zero")
			}
			if find(t, r, "base_duty").Source != "server_provided_base_rate" {
				t.Fatal(r)
			}
		})
	}
}
func TestServerRejectsCompoundAndConditionalRates(t *testing.T) {
	for _, rate := range []string{"3.5¢/kg + 6%", "Free (A)", "5% + 2%", "See schedule", "-1", "1e2", "NaN", "10001", "0.123456789", "5%%", "%"} {
		if _, err := CalculateEstimate(fixture(t, "US"), rate); !errors.Is(err, ErrInvalid) {
			t.Errorf("accepted %q: %v", rate, err)
		}
	}
}
func TestPartialCodeNeverCalculatesDuty(t *testing.T) {
	for _, mode := range []string{ModeSample, ModeManual, ModeEstimate} {
		req := fixture(t, "FR")
		req.Mode = mode
		req.Code = "061091"
		req.DutyRate = "5"
		req.VATRate = "20"
		var r Result
		var err error
		if mode == ModeEstimate {
			r, err = CalculateEstimate(req, "5")
		} else {
			r, err = Calculate(req)
		}
		if err != nil {
			t.Fatal(err)
		}
		if r.Request.Code != "061091" || r.CustomsValue == nil || find(t, r, "base_duty").Amount != nil || r.SampleTotals != nil {
			t.Fatal(r)
		}
	}
}
func TestDDPDAPOnlyResponsibilityChanges(t *testing.T) {
	req := fixture(t, "FR")
	ddp, err := Calculate(req)
	if err != nil {
		t.Fatal(err)
	}
	req.Term = "DAP"
	dap, err := Calculate(req)
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(ddp.Components, dap.Components) || !reflect.DeepEqual(ddp.SampleTotals, dap.SampleTotals) {
		t.Fatal("term changed taxes")
	}
}
func TestUnknownCostsPropagateNotZero(t *testing.T) {
	for _, field := range []string{"freight", "insurance", "delivery", "clearance"} {
		t.Run(field, func(t *testing.T) {
			req := fixture(t, "FR")
			switch field {
			case "freight":
				req.Freight = ""
			case "insurance":
				req.Insurance = ""
			case "delivery":
				req.Delivery = ""
			case "clearance":
				req.Clearance = ""
			}
			r, err := Calculate(req)
			if err != nil {
				t.Fatal(err)
			}
			if r.Status != StatusPartial || r.SampleTotals != nil || r.VATBase != nil || find(t, r, "import_vat").Amount != nil {
				t.Fatal(r)
			}
			if field == "freight" || field == "insurance" {
				if r.CustomsValue != nil || find(t, r, "base_duty").Amount != nil {
					t.Fatal(r)
				}
			}
		})
	}
}
func TestExplicitZeroCostsRemainKnown(t *testing.T) {
	req := fixture(t, "FR")
	req.Freight = "0"
	req.Insurance = "0.00"
	req.Delivery = "0.0"
	req.Clearance = "0"
	r, err := Calculate(req)
	if err != nil {
		t.Fatal(err)
	}
	if r.SampleTotals == nil {
		t.Fatal(r)
	}
	amount(t, find(t, r, "clearance_service").Amount, "0.00")
	amount(t, r.VATBase, "1050.00")
	if r.SampleTotals.LandedCost != "1260.00" {
		t.Fatal(r.SampleTotals)
	}
}
func TestSampleRateOverridesCannotPretendFixture(t *testing.T) {
	for _, change := range []func(*Request){func(r *Request) { r.DutyRate = "6" }, func(r *Request) { r.VATRate = "21" }} {
		req := fixture(t, "FR")
		change(&req)
		if _, err := Calculate(req); !errors.Is(err, ErrInvalid) {
			t.Fatal("accepted changed sample rate")
		}
	}
	if _, err := SampleRequest("DE"); !errors.Is(err, ErrInvalid) {
		t.Fatal("invented German fixture")
	}
}
func TestValidationErrorsUseStableFields(t *testing.T) {
	cases := []struct {
		name, field string
		change      func(*Request)
	}{
		{"country", "destination_country", func(r *Request) { r.Destination = "CA" }},
		{"origin", "origin_country", func(r *Request) { r.Origin = "China" }},
		{"date", "import_date", func(r *Request) { r.ImportDate = "2026-02-30" }},
		{"date_format", "import_date", func(r *Request) { r.ImportDate = "2026-1-1" }},
		{"term", "delivery_term", func(r *Request) { r.Term = "DDU" }},
		{"transport", "transport_mode", func(r *Request) { r.Transport = "spaceship" }},
		{"currency", "input_currency", func(r *Request) { r.Currency = "USD" }},
		{"code", "commodity_code", func(r *Request) { r.Code = "abc6109100" }},
		{"mode", "mode", func(r *Request) { r.Mode = "" }},
		{"zero_goods", "goods_value", func(r *Request) { r.Goods = "0" }},
		{"negative", "goods_value", func(r *Request) { r.Goods = "-1" }},
		{"fraction_precision", "international_freight", func(r *Request) { r.Freight = "0.001" }},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			r := fixture(t, "FR")
			c.change(&r)
			_, err := Calculate(r)
			var validation *ValidationError
			if !errors.Is(err, ErrInvalid) || !errors.As(err, &validation) || validation.Fields[c.field] == "" {
				t.Fatalf("wrong error %v", err)
			}
			if strings.Contains(err.Error(), r.Goods) && r.Goods == "-1" {
				t.Fatal("private value echoed")
			}
		})
	}
}
func TestNormalizationAndDeterminism(t *testing.T) {
	req := fixture(t, "FR")
	req.Destination = " fr "
	req.Origin = " cn "
	req.Code = "6109.10.00.10"
	req.Term = "ddp"
	req.Transport = "SEA"
	req.Currency = "eur"
	first, err := Calculate(req)
	if err != nil {
		t.Fatal(err)
	}
	second, err := Calculate(req)
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(first, second) {
		t.Fatal("non-deterministic result")
	}
	if first.Request.Code != "6109100010" || first.Request.Destination != "FR" {
		t.Fatal(first.Request)
	}
}
func TestJSONUnknownIsNullNotMissingOrZero(t *testing.T) {
	r, err := Calculate(fixture(t, "US"))
	if err != nil {
		t.Fatal(err)
	}
	data, err := json.Marshal(r)
	if err != nil {
		t.Fatal(err)
	}
	var v map[string]any
	if err = json.Unmarshal(data, &v); err != nil {
		t.Fatal(err)
	}
	if v["sample_totals"] != nil || v["vat_base"] != nil {
		t.Fatal(string(data))
	}
	for _, c := range v["components"].([]any) {
		item := c.(map[string]any)
		if item["key"] == "additional_duties" {
			value, exists := item["amount"]
			if !exists || value != nil {
				t.Fatal(string(data))
			}
		}
	}
}
func TestUSFreightNotAddedToCustomsValue(t *testing.T) {
	req := fixture(t, "US")
	req.Freight = "99999"
	req.Insurance = "99999"
	r, err := Calculate(req)
	if err != nil {
		t.Fatal(err)
	}
	amount(t, r.CustomsValue, "1000.00")
	amount(t, find(t, r, "base_duty").Amount, "50.00")
}
