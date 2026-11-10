// Package dutytax provides deterministic, offline import-cost scenario arithmetic.
// It does not resolve tariffs, classify goods, validate origin or make legal tax assessments.
package dutytax

import (
	"errors"
	"strings"
)

const (
	ModeSample             = "sample"
	ModeManual             = "manual"
	ModeEstimate           = "estimate"
	StatusEstimated        = "estimated"
	StatusPartial          = "partial"
	StatusManualReview     = "manual_review"
	ComponentKnown         = "known"
	ComponentUnknown       = "unknown"
	ComponentNotApplicable = "not_applicable"
	EngineVersion          = "dutytax-scenario-v1"
	RoundingPolicy         = "half-up-component-minor-unit-v1"
)

// Request contains one goods-only shipment. Amounts are nonnegative decimal
// strings, in the destination currency, with at most two decimal places.
// Empty optional costs/rates mean unknown; "0" explicitly means zero.
// DutyRate and VATRate are percentage points: "5" means 5%, not 500%.
// Freight, insurance, delivery and clearance must be separate, non-overlapping
// costs not already included in Goods. No exchange conversion is performed.
type Request struct {
	Destination string `json:"destination_country"`
	Origin      string `json:"origin_country"`
	Code        string `json:"commodity_code"`
	ImportDate  string `json:"import_date"`
	Term        string `json:"delivery_term"`
	Transport   string `json:"transport_mode"`
	Currency    string `json:"input_currency"`
	Goods       string `json:"goods_value"`
	Freight     string `json:"international_freight"`
	Insurance   string `json:"insurance"`
	Delivery    string `json:"domestic_delivery"`
	Clearance   string `json:"clearance_service"`
	DutyRate    string `json:"duty_rate_percent"`
	VATRate     string `json:"vat_rate_percent"`
	Mode        string `json:"mode"`
}

// Component is an amount within its stated assumptions, not an official charge.
// Amount and Base are nil for unknown/not_applicable (never silently zero).
type Component struct {
	Key         string  `json:"key"`
	Kind        string  `json:"kind"`
	Status      string  `json:"status"`
	Amount      *string `json:"amount"`
	Base        *string `json:"base"`
	RatePercent *string `json:"rate_percent"`
	Source      string  `json:"source"`
	ReasonCode  string  `json:"reason_code,omitempty"`
}

type Warning struct {
	Code    string   `json:"code"`
	Message string   `json:"message"`
	Fields  []string `json:"fields,omitempty"`
}

// Totals are exclusively synthetic sample totals. Manual results never fill them.
// ImportCharges excludes local delivery; LandedCost includes it exactly once.
type Totals struct {
	Taxes         string `json:"taxes"`
	ImportCharges string `json:"import_charges"`
	LandedCost    string `json:"landed_cost"`
}

type Result struct {
	Status         string      `json:"status"`
	Synthetic      bool        `json:"synthetic"`
	Currency       string      `json:"currency"`
	EngineVersion  string      `json:"engine_version"`
	RoundingPolicy string      `json:"rounding_policy"`
	Request        Request     `json:"request"`
	Components     []Component `json:"components"`
	// ScenarioComponents must not be included in known/legal subtotals.
	ScenarioComponents []Component `json:"scenario_components"`
	CustomsValue       *string     `json:"customs_value"`
	VATBase            *string     `json:"vat_base"`
	ScenarioVATBase    *string     `json:"scenario_vat_base"`
	KnownSubtotal      string      `json:"known_subtotal"`
	KnownTaxSubtotal   string      `json:"known_tax_subtotal"`
	SampleTotals       *Totals     `json:"sample_totals"`
	Warnings           []Warning   `json:"warnings"`
}

var ErrInvalid = errors.New("invalid duty-tax request")

// ValidationError has stable JSON field keys and does not echo private inputs.
type ValidationError struct {
	Fields map[string]string `json:"field_errors"`
}

func (e *ValidationError) Error() string {
	return "Invalid duty-tax input; check the indicated fields."
}
func (e *ValidationError) Unwrap() error { return ErrInvalid }

// SampleRequest returns explicit design fixtures, never a real tariff seed.
// FR matches the approved desktop concept. US matches the partial mobile concept.
// Unsupported sample destinations return an error; manual supports all seven.
func SampleRequest(destination string) (Request, error) {
	r := Request{Destination: strings.ToUpper(strings.TrimSpace(destination)), Origin: "CN", ImportDate: "2026-11-10", Term: "DDP", Transport: "sea", Mode: ModeSample,
		Goods: "1000.00", Freight: "100.00", Insurance: "10.00", Delivery: "20.00", Clearance: "30.00"}
	switch r.Destination {
	case "FR":
		r.Currency = "EUR"
		r.Code = "6109100010"
	case "US":
		r.Currency = "USD"
		r.Code = "6109100012"
		r.Term = "DAP"
		r.Transport = "air"
		r.Freight = ""
		r.Insurance = ""
		r.Delivery = ""
		r.Clearance = ""
	default:
		return Request{}, &ValidationError{Fields: map[string]string{"destination_country": "Synthetic samples exist only for FR and US; use manual mode for other supported destinations."}}
	}
	return r, nil
}
