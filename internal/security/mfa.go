package security

import (
	"crypto/rand"
	"encoding/base32"
	"fmt"
	"strings"
	"time"

	"github.com/pquerna/otp"
	"github.com/pquerna/otp/hotp"
	"github.com/pquerna/otp/totp"
)

func NewTOTP(issuer, account string) (*otp.Key, error) {
	return totp.Generate(totp.GenerateOpts{
		Issuer:      issuer,
		AccountName: account,
		Period:      30,
		SecretSize:  20,
		Secret:      nil,
		Digits:      otp.DigitsSix,
		Algorithm:   otp.AlgorithmSHA1,
	})
}

// ValidateTOTP allows one step of clock drift and returns the matched counter.
// Callers persist the counter to prevent the same code being replayed.
func ValidateTOTP(secret, code string, now time.Time, lastCounter uint64) (uint64, bool) {
	code = strings.ReplaceAll(strings.TrimSpace(code), " ", "")
	current := uint64(now.Unix() / 30)
	for _, delta := range []int64{-1, 0, 1} {
		candidate := int64(current) + delta
		if candidate < 0 || uint64(candidate) <= lastCounter {
			continue
		}
		valid, err := hotp.ValidateCustom(code, uint64(candidate), secret, hotp.ValidateOpts{
			Digits:    otp.DigitsSix,
			Algorithm: otp.AlgorithmSHA1,
		})
		if err == nil && valid {
			return uint64(candidate), true
		}
	}
	return 0, false
}

func GenerateRecoveryCodes(count int) ([]string, error) {
	if count < 1 || count > 20 {
		return nil, fmt.Errorf("invalid recovery code count")
	}
	result := make([]string, 0, count)
	for range count {
		raw := make([]byte, 10)
		if _, err := rand.Read(raw); err != nil {
			return nil, err
		}
		encoded := base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(raw)
		result = append(result, encoded[:4]+"-"+encoded[4:8]+"-"+encoded[8:12]+"-"+encoded[12:])
	}
	return result, nil
}

func NormalizeRecoveryCode(code string) string {
	return strings.ToUpper(strings.NewReplacer("-", "", " ", "").Replace(strings.TrimSpace(code)))
}
