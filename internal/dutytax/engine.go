package dutytax

import (
	"math/big"
	"regexp"
	"strings"
	"time"
)

var codePattern = regexp.MustCompile(`^[0-9]{6,10}$`)
var originPattern = regexp.MustCompile(`^[A-Z]{2}$`)
var codeSeparators = strings.NewReplacer(".", "", " ", "", "-", "")
var countryCurrency = map[string]string{"US": "USD", "DE": "EUR", "FR": "EUR", "ES": "EUR", "IT": "EUR", "NL": "EUR", "GB": "GBP"}

// Calculate is pure and performs no I/O, clock reads or tariff lookups. Sample
// uses explicitly synthetic FR/US fixtures. Manual rates are user assumptions.
// Estimate never trusts request rates; use CalculateEstimate from a trusted
// server-side adapter to supply a resolved base-duty rate.
func Calculate(req Request) (Result, error) { return calculate(req, "") }

// CalculateEstimate is the server-only integration boundary for a resolved base
// rate. It accepts canonical percentage points ("6.3"), a pure percent expression
// ("6.3%"), or an unqualified "Free". It never removes additional-duty gaps or
// creates complete totals. HTTP callers must not expose verifiedBaseRate as a
// client-controlled field. Partial codes never use the rate.
func CalculateEstimate(req Request, verifiedBaseRate string) (Result, error) {
	req.Mode = ModeEstimate
	value := strings.TrimSpace(verifiedBaseRate)
	if value == "%" {
		return Result{}, &ValidationError{Fields: map[string]string{"verified_base_rate": "The server-provided rate is not an unqualified ad-valorem rate."}}
	}
	if strings.EqualFold(value, "Free") {
		value = "0"
	} else {
		value = strings.TrimSuffix(value, "%")
	}
	if value != "" {
		if _, err := parsePercent(value); err != nil {
			return Result{}, &ValidationError{Fields: map[string]string{"verified_base_rate": "The server-provided rate is not an unqualified ad-valorem rate."}}
		}
	}
	return calculate(req, value)
}

func normalize(req Request) Request {
	req.Destination = strings.ToUpper(strings.TrimSpace(req.Destination))
	req.Origin = strings.ToUpper(strings.TrimSpace(req.Origin))
	req.Code = codeSeparators.Replace(strings.TrimSpace(req.Code))
	req.ImportDate = strings.TrimSpace(req.ImportDate)
	req.Term = strings.ToUpper(strings.TrimSpace(req.Term))
	req.Transport = strings.ToLower(strings.TrimSpace(req.Transport))
	req.Currency = strings.ToUpper(strings.TrimSpace(req.Currency))
	req.Mode = strings.ToLower(strings.TrimSpace(req.Mode))
	return req
}

type parsedInput struct {
	goods                                   int64
	freight, insurance, delivery, clearance *int64
	duty, vat                               *big.Rat
}

func validate(req Request) (parsedInput, error) {
	p := parsedInput{}
	fields := map[string]string{}
	expected, ok := countryCurrency[req.Destination]
	if !ok {
		fields["destination_country"] = "Choose US, DE, FR, ES, IT, NL or GB."
	}
	if !originPattern.MatchString(req.Origin) {
		fields["origin_country"] = "Enter a two-letter country-of-origin code."
	}
	if !codePattern.MatchString(req.Code) {
		fields["commodity_code"] = "Enter a 6–10 digit destination commodity code; a full 10-digit code is required for a duty calculation."
	}
	if _, err := time.Parse("2006-01-02", req.ImportDate); err != nil {
		fields["import_date"] = "Enter a valid calendar date in YYYY-MM-DD format."
	}
	if req.Term != "DDP" && req.Term != "DAP" {
		fields["delivery_term"] = "Choose DDP or DAP."
	}
	switch req.Transport {
	case "sea", "air", "road", "rail", "express":
	default:
		fields["transport_mode"] = "Choose sea, air, road, rail or express."
	}
	if ok && req.Currency != expected {
		fields["input_currency"] = "Use the destination currency (" + expected + "); this offline engine does not perform currency conversion."
	}
	if req.Mode != ModeSample && req.Mode != ModeManual && req.Mode != ModeEstimate {
		fields["mode"] = "Choose sample, estimate or manual."
	}
	if req.Mode == ModeSample && req.Destination != "FR" && req.Destination != "US" {
		fields["mode"] = "Synthetic fixtures exist only for France and the United States; use manual or estimate mode elsewhere."
	}
	var err error
	p.goods, err = parseMoney(req.Goods)
	if err != nil {
		fields["goods_value"] = err.Error()
	} else if p.goods == 0 {
		fields["goods_value"] = "Goods value must be greater than zero."
	}
	for _, item := range []struct {
		key, value string
		out        **int64
	}{
		{"international_freight", req.Freight, &p.freight}, {"insurance", req.Insurance, &p.insurance},
		{"domestic_delivery", req.Delivery, &p.delivery}, {"clearance_service", req.Clearance, &p.clearance},
	} {
		if item.value == "" {
			continue
		}
		n, e := parseMoney(item.value)
		if e != nil {
			fields[item.key] = e.Error()
			continue
		}
		value := n
		*item.out = &value
	}
	// Estimate explicitly disregards client-supplied rates, including malformed
	// values. Only its separately passed server rate can become a base component.
	if req.Mode != ModeEstimate {
		for _, item := range []struct {
			key, value string
			out        **big.Rat
		}{
			{"duty_rate_percent", req.DutyRate, &p.duty}, {"vat_rate_percent", req.VATRate, &p.vat},
		} {
			if item.value == "" {
				continue
			}
			n, e := parsePercent(item.value)
			if e != nil {
				fields[item.key] = e.Error()
			} else {
				*item.out = n
			}
		}
	}
	if req.Mode == ModeSample {
		if p.duty != nil && p.duty.Cmp(big.NewRat(5, 100)) != 0 {
			fields["duty_rate_percent"] = "The synthetic sample uses a fixed illustrative 5% duty; switch to manual mode for custom rates."
		}
		if req.Destination == "FR" && p.vat != nil && p.vat.Cmp(big.NewRat(20, 100)) != 0 {
			fields["vat_rate_percent"] = "The synthetic France sample uses a fixed illustrative 20% VAT; switch to manual mode for custom rates."
		}
		if req.Destination == "US" && req.VATRate != "" {
			fields["vat_rate_percent"] = "Import VAT is not applicable in this United States scenario."
		}
	}
	if len(fields) > 0 {
		return p, &ValidationError{Fields: fields}
	}
	return p, nil
}

func calculate(raw Request, verifiedRate string) (Result, error) {
	req := normalize(raw)
	p, err := validate(req)
	if err != nil {
		return Result{}, err
	}
	result := Result{
		Status: StatusPartial, Synthetic: req.Mode == ModeSample, Currency: req.Currency,
		EngineVersion: EngineVersion, RoundingPolicy: RoundingPolicy, Request: req,
		Components: []Component{}, ScenarioComponents: []Component{}, Warnings: []Warning{}, KnownSubtotal: "0.00", KnownTaxSubtotal: "0.00",
	}
	if req.Mode == ModeManual {
		result.Status = StatusManualReview
	}
	warn := func(code, message string, fields ...string) {
		result.Warnings = append(result.Warnings, Warning{Code: code, Message: message, Fields: fields})
	}
	warn("not_a_customs_assessment", "This is a planning scenario, not a customs assessment, verified classification or binding quote.")
	warn("goods_only_cost_basis", "Goods must exclude separately entered freight, insurance, delivery and clearance; all inputs use the displayed currency.")
	if result.Synthetic {
		warn("synthetic_sample", "Illustrative sample only: rates and coverage are synthetic fixtures, not applicable legal rates.")
	} else {
		warn("additional_measures_unverified", "Additional duties, trade measures, preferential eligibility and government fees have not been resolved.")
		warn("scope_not_verified", "Special territories, low-value schemes, excise, CBAM and other special procedures require separate review.")
	}
	if req.Mode == ModeManual {
		warn("manual_rates", "Any supplied rate is a user assumption and has not been verified against an official schedule.")
	}
	if req.Mode == ModeEstimate && (req.DutyRate != "" || req.VATRate != "") {
		warn("client_rates_ignored", "Client-provided rates are ignored in estimate mode.")
		result.Request.DutyRate = ""
		result.Request.VATRate = ""
	}
	if len(req.Code) != 10 {
		warn("full_code_required", "Confirm a complete destination 10-digit commodity code before calculating duty.", "commodity_code")
	}
	var cv *int64
	if req.Destination == "US" {
		value := p.goods
		cv = &value
		warn("us_valuation_assumption", "The US scenario uses goods value as the assumed customs value; international freight and insurance are not automatically added. Confirm valuation adjustments separately.")
	} else if p.freight != nil && p.insurance != nil {
		n, e := addMoney(p.goods, *p.freight, *p.insurance)
		if e != nil {
			return Result{}, e
		}
		cv = &n
	} else {
		warn("customs_value_incomplete", "International freight and insurance are required to construct this scenario's customs value; blank values are not zero.", "international_freight", "insurance")
	}
	if cv != nil {
		result.CustomsValue = moneyPointer(*cv)
	}
	var dutyRate *big.Rat
	var rateLabel string
	source := "unknown"
	switch req.Mode {
	case ModeSample:
		dutyRate = big.NewRat(5, 100)
		rateLabel = "5"
		source = "synthetic_fixture"
	case ModeManual:
		dutyRate = p.duty
		rateLabel = req.DutyRate
		source = "user_assumption"
	case ModeEstimate:
		if verifiedRate != "" {
			dutyRate, _ = parsePercent(verifiedRate)
			rateLabel = verifiedRate
			source = "server_provided_base_rate"
		}
	}
	base := Component{Key: "base_duty", Kind: "duty", Status: ComponentUnknown, Source: source, ReasonCode: "base_rate_missing"}
	var duty *int64
	if cv != nil && dutyRate != nil && len(req.Code) == 10 {
		n, e := rateAmount(*cv, dutyRate)
		if e != nil {
			return Result{}, e
		}
		duty = &n
		base.Status = ComponentKnown
		base.Amount = moneyPointer(n)
		base.Base = moneyPointer(*cv)
		base.RatePercent = stringPointer(rateLabel)
		base.ReasonCode = ""
	} else if len(req.Code) != 10 {
		base.ReasonCode = "full_code_required"
	} else if cv == nil {
		base.ReasonCode = "customs_value_incomplete"
	}
	result.Components = append(result.Components, base)
	completeFixture := req.Mode == ModeSample && req.Destination == "FR"
	additional := Component{Key: "additional_duties", Kind: "duty", Status: ComponentUnknown, Source: "not_resolved", ReasonCode: "additional_measures_unverified"}
	fees := Component{Key: "government_fees", Kind: "government_fee", Status: ComponentUnknown, Source: "not_resolved", ReasonCode: "government_fees_unverified"}
	if completeFixture {
		additional.Status = ComponentNotApplicable
		additional.Source = "synthetic_fixture"
		additional.ReasonCode = "fixture_excludes_other_duties"
		fees.Status = ComponentNotApplicable
		fees.Source = "synthetic_fixture"
		fees.ReasonCode = "fixture_excludes_government_fees"
	}
	result.Components = append(result.Components, additional)
	vat := Component{Key: "import_vat", Kind: "vat", Status: ComponentUnknown, Source: "not_resolved", ReasonCode: "vat_dependencies_unverified"}
	var actualVAT *int64
	if req.Destination == "US" {
		vat.Status = ComponentNotApplicable
		vat.ReasonCode = "us_import_vat_not_applicable"
		vat.Source = "jurisdiction_scope"
	} else {
		vatRate := p.vat
		vatLabel := req.VATRate
		if completeFixture {
			vatRate = big.NewRat(20, 100)
			vatLabel = "20"
		}
		if cv != nil && duty != nil && p.delivery != nil && p.clearance != nil && vatRate != nil {
			b, e := addMoney(*cv, *duty, *p.delivery, *p.clearance)
			if e != nil {
				return Result{}, e
			}
			amount, e := rateAmount(b, vatRate)
			if e != nil {
				return Result{}, e
			}
			scenario := Component{Key: "import_vat", Kind: "vat", Status: ComponentKnown, Amount: moneyPointer(amount), Base: moneyPointer(b), RatePercent: stringPointer(vatLabel), Source: "user_assumption", ReasonCode: "scenario_excludes_unverified_measures"}
			if completeFixture {
				scenario.Source = "synthetic_fixture"
				scenario.ReasonCode = ""
				vat = scenario
				actualVAT = &amount
				result.VATBase = moneyPointer(b)
			} else {
				result.ScenarioVATBase = moneyPointer(b)
				result.ScenarioComponents = append(result.ScenarioComponents, scenario)
				warn("vat_scenario_only", "The VAT scenario excludes unverified additional duties and fees; it is not included in known tax subtotals.")
			}
		} else {
			warn("vat_inputs_incomplete", "VAT requires a scenario duty rate, freight, insurance, delivery and clearance amounts; unknown dependencies are not treated as zero.")
		}
	}
	result.Components = append(result.Components, vat, fees)
	clearance := Component{Key: "clearance_service", Kind: "commercial_fee", Status: ComponentUnknown, Source: "user_input", ReasonCode: "clearance_service_missing"}
	if p.clearance != nil {
		clearance.Status = ComponentKnown
		clearance.Amount = moneyPointer(*p.clearance)
		clearance.ReasonCode = ""
	}
	result.Components = append(result.Components, clearance)
	var knownTax, knownCosts int64
	if duty != nil {
		knownTax = *duty
	}
	if actualVAT != nil {
		knownTax, err = addMoney(knownTax, *actualVAT)
		if err != nil {
			return Result{}, err
		}
	}
	knownCosts = knownTax
	if p.clearance != nil {
		knownCosts, err = addMoney(knownCosts, *p.clearance)
		if err != nil {
			return Result{}, err
		}
	}
	result.KnownTaxSubtotal = formatMoney(knownTax)
	result.KnownSubtotal = formatMoney(knownCosts)
	if completeFixture && cv != nil && duty != nil && actualVAT != nil && p.delivery != nil && p.clearance != nil {
		landed, e := addMoney(p.goods, *p.freight, *p.insurance, *p.delivery, knownCosts)
		if e != nil {
			return Result{}, e
		}
		result.Status = StatusEstimated
		result.SampleTotals = &Totals{Taxes: formatMoney(knownTax), ImportCharges: formatMoney(knownCosts), LandedCost: formatMoney(landed)}
	}
	if result.SampleTotals == nil {
		warn("not_total_import_cost", "The known subtotal is not the total import cost. Unknown charges remain excluded.")
	}
	if req.Term == "DAP" {
		warn("dap_responsibility", "Under DAP, import formalities and import charges are normally the buyer's responsibility; confirm the contract.")
	} else {
		warn("ddp_responsibility", "DDP normally assigns import formalities and charges to the seller; the term does not verify importer eligibility or change tax arithmetic.")
	}
	return result, nil
}
