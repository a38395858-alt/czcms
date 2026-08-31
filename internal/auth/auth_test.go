package auth

import (
	"context"
	"errors"
	"path/filepath"
	"testing"
	"time"

	"czcms/internal/database"
	"czcms/internal/security"

	"github.com/pquerna/otp/totp"
)

func newTestService(t *testing.T) (*Service, context.Context) {
	t.Helper()
	ctx := context.Background()
	root := t.TempDir()
	db, err := database.Open(ctx, filepath.Join(root, "auth.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	keys, err := security.LoadKeyring("", filepath.Join(root, "secrets"), "development")
	if err != nil {
		t.Fatal(err)
	}
	service, err := New(db, keys, Config{IdleTTL: 30 * time.Minute, AbsoluteTTL: 12 * time.Hour})
	if err != nil {
		t.Fatal(err)
	}
	return service, ctx
}

func TestAccountLockAndOpaqueSession(t *testing.T) {
	service, ctx := newTestService(t)
	user, err := service.CreateInitialOwner(ctx, "owner", "Owner", "", "correct horse battery staple")
	if err != nil {
		t.Fatal(err)
	}
	for range 5 {
		_, err = service.Login(ctx, user.Username, "wrong password", "", "127.0.0.1", "test")
		if !errors.Is(err, ErrInvalidCredentials) {
			t.Fatalf("failure error=%v", err)
		}
	}
	_, err = service.Login(ctx, user.Username, "correct horse battery staple", "", "127.0.0.1", "test")
	if !errors.Is(err, ErrAccountLocked) {
		t.Fatalf("locked login error=%v", err)
	}
	if _, err = service.db.ExecContext(ctx, `UPDATE users SET locked_until = NULL, failed_login_count = 0 WHERE id = ?`, user.ID); err != nil {
		t.Fatal(err)
	}
	login, err := service.Login(ctx, user.Username, "correct horse battery staple", "", "127.0.0.1", "test")
	if err != nil {
		t.Fatal(err)
	}
	if login.CookieValue == "" || login.Session.CSRFToken == "" {
		t.Fatal("session secrets missing")
	}
	session, err := service.Authenticate(ctx, login.CookieValue)
	if err != nil || session.User.ID != user.ID {
		t.Fatalf("authenticate: user=%d err=%v", session.User.ID, err)
	}
	if !service.VerifyCSRF(session, session.CSRFToken) || service.VerifyCSRF(session, "wrong") {
		t.Fatal("CSRF comparison incorrect")
	}
}

func TestMFAEnrollmentReplayAndRecovery(t *testing.T) {
	service, ctx := newTestService(t)
	fixed := time.Unix(2_000_000_000, 0).UTC()
	service.now = func() time.Time { return fixed }
	user, err := service.CreateInitialOwner(ctx, "owner", "Owner", "", "correct horse battery staple")
	if err != nil {
		t.Fatal(err)
	}
	login, err := service.Login(ctx, user.Username, "correct horse battery staple", "", "127.0.0.1", "test")
	if err != nil {
		t.Fatal(err)
	}
	enrollment, err := service.BeginMFA(ctx, login.Session)
	if err != nil {
		t.Fatal(err)
	}
	code, err := totp.GenerateCode(enrollment.Secret, fixed)
	if err != nil {
		t.Fatal(err)
	}
	recoveryCodes, err := service.CompleteMFA(ctx, login.Session, code)
	if err != nil || len(recoveryCodes) != 10 {
		t.Fatalf("complete MFA codes=%d err=%v", len(recoveryCodes), err)
	}
	if _, err = service.Login(ctx, user.Username, "correct horse battery staple", code, "127.0.0.1", "test"); !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("replayed TOTP error=%v", err)
	}
	service.now = func() time.Time { return fixed.Add(30 * time.Second) }
	nextCode, _ := totp.GenerateCode(enrollment.Secret, fixed.Add(30*time.Second))
	activeLogin, err := service.Login(ctx, user.Username, "correct horse battery staple", nextCode, "127.0.0.1", "test")
	if err != nil {
		t.Fatalf("next TOTP: %v", err)
	}
	service.now = func() time.Time { return fixed.Add(60 * time.Second) }
	if _, err = service.Login(ctx, user.Username, "correct horse battery staple", recoveryCodes[0], "127.0.0.1", "test"); err != nil {
		t.Fatalf("recovery login: %v", err)
	}
	if _, err = service.Login(ctx, user.Username, "correct horse battery staple", recoveryCodes[0], "127.0.0.1", "test"); !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("reused recovery code error=%v", err)
	}
	currentCode, _ := totp.GenerateCode(enrollment.Secret, fixed.Add(60*time.Second))
	if err = service.DisableMFA(ctx, activeLogin.Session, "correct horse battery staple", currentCode); err != nil {
		t.Fatalf("disable MFA: %v", err)
	}
	updated, found, err := service.findUser(ctx, user.Username)
	if err != nil || !found || updated.MFAEnabled {
		t.Fatalf("MFA remained enabled: found=%v enabled=%v err=%v", found, updated.MFAEnabled, err)
	}
}
