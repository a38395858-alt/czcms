# Offline duty/tax scenario domain

This package is intentionally not an official tariff service. It performs deterministic scenario arithmetic without network, database, clock reads, HTTP or global side effects. It imports only the Go standard library.

## Entry points

```go
sample, err := dutytax.SampleRequest("FR") // or US
result, err := dutytax.Calculate(sample)

// Public estimate ignores all rates in Request.
result, err = dutytax.Calculate(dutytax.Request{Mode: dutytax.ModeEstimate /* ... */})

// Only a server-side adapter can supply a resolved base rate here.
// Never pass an unverified client field as verifiedBaseRate.
result, err = dutytax.CalculateEstimate(request, "6.3%")
```

`Request.DutyRate`/`VATRate` are percentage points (`"5"` = 5%), not decimal fractions. They are usable only as manual assumptions or fixture consistency checks. `CalculateEstimate` accepts a server-resolved pure percentage (with optional trailing `%`) or unqualified `Free`. Its response remains `partial`, never complete.

Supported destinations are US, DE, FR, ES, IT, NL and GB. Inputs must already be in destination currency (USD/EUR/GBP); this layer performs no exchange conversion. It validates origin-code shape only, not origin eligibility or actual ISO membership. Commodity inputs may be 6–10 digits, but no duty can be calculated until a full 10-digit code is supplied. Neither code existence nor date coverage is verified here: the adapter must do that before passing a trusted base rate.

## Money and unknowns

All monetary inputs are strings, at most two decimal places; empty optional costs/rates mean unknown. Explicit `"0"` means an input of zero. Numeric JSON values do not decode into the string fields. Internal amounts are int64 cents; rates and multiplication use `math/big.Rat` and `big.Int` with HALF_UP rounding per component. Input ceiling 999999999.99 and rate ceiling 10000 percentage points are computational guards, not legal thresholds.

The model accepts goods-only, non-overlapping separate freight, insurance, delivery and clearance costs. It does not support all-inclusive invoices, customs-valuation adjustments, service-VAT resolution, multi-item shipments or special territories/procedures. US customs value assumes goods value; EU/GB scenario customs value is goods + freight + insurance. These are explicitly disclosed assumptions, not legally validated customs values.

## Results

Fixed component keys: `base_duty`, `additional_duties`, `import_vat`, `government_fees`, `clearance_service`. Unknown and not-applicable amounts are explicit JSON null. No unknown additional tax or fee is substituted with zero.

- FR sample is explicitly synthetic, using 5% / 20% only inside that design fixture. With all sample costs, returns duty 55.50, VAT 243.10, import charges 328.60 and landed cost 1458.60. No other country inherits these rates.
- US sample is synthetic and partial: base duty 50.00, import VAT not applicable; unknown additional measures, government fees and clearance are null. There is no complete total.
- Manual supports all seven destinations, always `manual_review` with `sample_totals=null`. Any computed VAT is in `scenario_components` / `scenario_vat_base`, excluded from known subtotals because additional measures remain unverified. The primary import_vat component remains unknown (US: not_applicable).
- Estimate always `partial`, ignores client rates, and cannot produce sample totals. A verified server base rate can produce only the known base-duty component. Additional measures and fees stay unknown.

`known_subtotal` includes known base tax plus entered clearance, and only a complete synthetic fixture's VAT. It is explicitly not a complete legal total. `known_tax_subtotal` excludes clearance. DDP/DAP changes responsibility warnings only, not arithmetic.

Validation returns `*ValidationError` with stable `Fields` keys; `errors.Is(err, dutytax.ErrInvalid)` works. The error string does not echo transaction values. Structured fields/warnings should be localized by the HTTP/UI layer.

## Test

```sh
go test ./internal/dutytax -count=1
go vet ./internal/dutytax
```

Tests cover synthetic fixtures, seven manual destinations, trusted-rate isolation, unknown dependencies, no false complete totals, null JSON, zero vs missing, monetary syntax, decimal precision, HALF_UP, overflow, input maxima, partial codes, DDP/DAP invariance and deterministic results. No external service is called.
