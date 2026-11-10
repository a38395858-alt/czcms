package dutytax

import (
	"errors"
	"math"
	"math/big"
	"regexp"
	"strconv"
	"strings"
)

const maxInputMinor int64 = 99999999999

var moneyPattern = regexp.MustCompile(`^(0|[1-9][0-9]{0,8})(\.[0-9]{1,2})?$`)
var ratePattern = regexp.MustCompile(`^(0|[1-9][0-9]{0,4})(\.[0-9]{1,8})?$`)

// parseMoney returns cents. No locale guessing, exponent notation or floats.
func parseMoney(value string) (int64, error) {
	if !moneyPattern.MatchString(value) {
		return 0, errors.New("Use a nonnegative decimal amount with up to two decimal places (maximum 999999999.99).")
	}
	parts := strings.SplitN(value, ".", 2)
	whole, _ := strconv.ParseInt(parts[0], 10, 64)
	var fractional int64
	if len(parts) == 2 {
		fractional, _ = strconv.ParseInt(parts[1]+strings.Repeat("0", 2-len(parts[1])), 10, 64)
	}
	minor := whole*100 + fractional
	if minor > maxInputMinor {
		return 0, errors.New("Amount exceeds the supported input limit.")
	}
	return minor, nil
}

// parsePercent accepts percentage points, not a fractional rate. Its 10000%
// ceiling is a computational guard, not a claim about legally applicable rates.
func parsePercent(value string) (*big.Rat, error) {
	if !ratePattern.MatchString(value) {
		return nil, errors.New("Use a percentage number with up to eight decimal places, without a percent sign.")
	}
	n, ok := new(big.Rat).SetString(value)
	if !ok || n.Cmp(big.NewRat(10000, 1)) > 0 {
		return nil, errors.New("Percentage exceeds the supported calculation limit (10000%).")
	}
	return n.Quo(n, big.NewRat(100, 1)), nil
}

func formatMoney(minor int64) string {
	return strconv.FormatInt(minor/100, 10) + "." + leftPadCents(minor%100)
}
func leftPadCents(n int64) string {
	if n < 10 {
		return "0" + strconv.FormatInt(n, 10)
	}
	return strconv.FormatInt(n, 10)
}
func moneyPointer(n int64) *string   { s := formatMoney(n); return &s }
func stringPointer(s string) *string { return &s }

// rateAmount computes a nonnegative rational amount and rounds HALF_UP once.
func rateAmount(minor int64, rate *big.Rat) (int64, error) {
	product := new(big.Int).Mul(big.NewInt(minor), rate.Num())
	quotient, remainder := new(big.Int), new(big.Int)
	quotient.QuoRem(product, rate.Denom(), remainder)
	if new(big.Int).Lsh(remainder, 1).Cmp(rate.Denom()) >= 0 {
		quotient.Add(quotient, big.NewInt(1))
	}
	if !quotient.IsInt64() {
		return 0, errors.New("Calculated amount exceeds supported precision.")
	}
	return quotient.Int64(), nil
}

func addMoney(values ...int64) (int64, error) {
	var sum int64
	for _, v := range values {
		if v < 0 || sum > math.MaxInt64-v {
			return 0, errors.New("Calculated amount exceeds supported precision.")
		}
		sum += v
	}
	return sum, nil
}
