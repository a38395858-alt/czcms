package security

import (
	"errors"
	"strings"
	"testing"
)

func TestArgon2idPasswordRoundTrip(t *testing.T) {
	hash, err := HashPassword("correct horse battery staple")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(hash, "$argon2id$v=19$m=65536,t=3,p=2$") {
		t.Fatalf("unexpected hash parameters: %s", hash)
	}
	valid, err := VerifyPassword(hash, "correct horse battery staple")
	if err != nil || !valid {
		t.Fatal("correct password did not validate")
	}
	valid, err = VerifyPassword(hash, "incorrect password")
	if err != nil || valid {
		t.Fatal("incorrect password validated")
	}
}

func TestPasswordHashRejectsHostileParameters(t *testing.T) {
	_, err := VerifyPassword("$argon2id$v=19$m=999999999,t=3,p=2$c2FsdHNhbHRzYWx0c2FsdA$YWJjZGVmZ2hpamtsbW5vcA", "password")
	if !errors.Is(err, ErrInvalidPasswordHash) {
		t.Fatalf("error=%v", err)
	}
}
