package dutytax

import (
	"math"
	"math/big"
	"testing"
)

func TestMoneyParsing(t *testing.T) {
	for _, c := range []struct {
		input string
		minor int64
	}{{"0", 0}, {"0.1", 10}, {"0.10", 10}, {"1", 100}, {"12.34", 1234}, {"999999999.99", 99999999999}} {
		n, err := parseMoney(c.input)
		if err != nil || n != c.minor {
			t.Errorf("%s => %d %v", c.input, n, err)
		}
	}
	for _, input := range []string{"", "-1", "+1", "01", "00.10", ".1", "1.", "1.001", "1,000", "1e2", "NaN", "Infinity", " 1", "1 ", "1000000000.00", "１２.００"} {
		if _, err := parseMoney(input); err == nil {
			t.Errorf("accepted invalid amount %q", input)
		}
	}
}
func TestHalfUpRational(t *testing.T) {
	for _, c := range []struct {
		minor int64
		rate  string
		want  int64
	}{{1, "50", 1}, {1, "49", 0}, {1, "51", 1}, {10, "50", 5}, {111000, "5", 5550}, {121550, "20", 24310}, {10000, "250", 25000}, {1, "10000", 100}} {
		rate, err := parsePercent(c.rate)
		if err != nil {
			t.Fatal(err)
		}
		got, err := rateAmount(c.minor, rate)
		if err != nil || got != c.want {
			t.Errorf("%d * %s%% = %d, want%d (%v)", c.minor, c.rate, got, c.want, err)
		}
	}
	rate, _ := parsePercent("0.12345678")
	want := big.NewRat(12345678, 10000000000)
	if rate.Cmp(want) != 0 {
		t.Fatalf("rate precision lost: %v", rate)
	}
}
func TestRateSyntax(t *testing.T) {
	for _, input := range []string{"-1", "+1", "5%", "Free", "1e2", "NaN", "0.000000001", "10000.00000001", "10001", "01", "1/2", ""} {
		if _, err := parsePercent(input); err == nil {
			t.Errorf("accepted invalid percent %q", input)
		}
	}
	for _, input := range []string{"0", "5", "0.125", "100", "250", "10000"} {
		if _, err := parsePercent(input); err != nil {
			t.Errorf("rejected %s: %v", input, err)
		}
	}
}
func TestOverflowAndFormatting(t *testing.T) {
	if _, err := addMoney(math.MaxInt64, 1); err == nil {
		t.Fatal("sum overflow accepted")
	}
	if _, err := addMoney(-1); err == nil {
		t.Fatal("negative sum accepted")
	}
	if _, err := rateAmount(math.MaxInt64, big.NewRat(2, 1)); err == nil {
		t.Fatal("product overflow accepted")
	}
	for _, c := range []struct {
		minor int64
		want  string
	}{{0, "0.00"}, {1, "0.01"}, {10, "0.10"}, {100, "1.00"}, {123456789, "1234567.89"}} {
		if got := formatMoney(c.minor); got != c.want {
			t.Errorf("format %d => %s", c.minor, got)
		}
	}
}
func TestApplicationMaximumInputs(t *testing.T) {
	req := fixture(t, "FR")
	req.Mode = ModeManual
	req.Goods = "999999999.99"
	req.Freight = req.Goods
	req.Insurance = req.Goods
	req.Delivery = req.Goods
	req.Clearance = req.Goods
	req.DutyRate = "10000"
	req.VATRate = "10000"
	r, err := Calculate(req)
	if err != nil {
		t.Fatal(err)
	}
	if r.SampleTotals != nil || r.Status != StatusManualReview {
		t.Fatal(r)
	}
	amount(t, r.CustomsValue, "2999999999.97")
}

func FuzzMoneyRoundTrip(f *testing.F) {
	for _, input := range []string{"0", "0.01", "123.45", "999999999.99", "-1", "NaN", ""} {
		f.Add(input)
	}
	f.Fuzz(func(t *testing.T, input string) {
		n, err := parseMoney(input)
		if err != nil {
			return
		}
		s := formatMoney(n)
		back, err := parseMoney(s)
		if err != nil || n != back {
			t.Fatalf("round trip %q =>%s => %d %v", input, s, back, err)
		}
	})
}
