package mailer

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"czcms/internal/catalog"
	"czcms/internal/contentsafety"
	"czcms/internal/database"
	"czcms/internal/security"
)

func setup(t *testing.T) (*Service, *catalog.Service, int64) {
	t.Helper()
	root := t.TempDir()
	db, err := database.Open(context.Background(), filepath.Join(root, "mail.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	keys, err := security.LoadKeyring("", filepath.Join(root, "keys"), "development")
	if err != nil {
		t.Fatal(err)
	}
	s := New(db, keys, slog.New(slog.NewTextHandler(io.Discard, nil)))
	c := catalog.New(db, contentsafety.NewSanitizer())
	site, err := c.SiteByCode(context.Background(), "global")
	if err != nil {
		t.Fatal(err)
	}
	return s, c, site.ID
}

func inputFrom(cfg Settings) Input {
	return Input{Enabled: cfg.Enabled, Host: cfg.Host, Port: cfg.Port, Security: cfg.Security, Username: cfg.Username, FromEmail: cfg.FromEmail, FromName: cfg.FromName, Recipient: cfg.Recipient, Version: cfg.Version}
}

func enable(t *testing.T, s *Service) {
	t.Helper()
	cfg, err := s.Settings(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	in := inputFrom(cfg)
	in.Enabled = true
	in.Password = "smtp-authorization-secret"
	if _, err = s.Save(context.Background(), in); err != nil {
		t.Fatal(err)
	}
}

func submit(t *testing.T, s *Service, c *catalog.Service, siteID int64, dedupe string) int64 {
	t.Helper()
	ctx := context.Background()
	form, err := c.EnsureHomeEnquiryForm(ctx, siteID, "en", false)
	if err != nil {
		t.Fatal(err)
	}
	values, _ := json.Marshal(map[string]string{"full_name": "张先生", "work_email": "buyer@example.test", "additional_context": "需要采购与运输\n请联系我", "extra_custom": "额外字段"})
	encrypted, err := s.keys.Encrypt("form-submission", values)
	if err != nil {
		t.Fatal(err)
	}
	id, err := c.SaveFormSubmission(ctx, form.ID, 0, siteID, "en", "/contact", dedupe, "ip", "ua", encrypted)
	if err != nil {
		t.Fatal(err)
	}
	return id
}

func TestSettingsEncryptPasswordKeepItOnBlankAndRejectUnsafeInput(t *testing.T) {
	s, _, _ := setup(t)
	ctx := context.Background()
	cfg, err := s.Settings(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if cfg.Recipient != "38395858@qq.com" || cfg.Username != cfg.Recipient || cfg.Host != "smtp.qq.com" || cfg.Port != 465 || cfg.Enabled {
		t.Fatalf("incorrect QQ defaults: %+v", cfg)
	}
	in := inputFrom(cfg)
	in.Enabled = true
	if _, err = s.Save(ctx, in); !errors.Is(err, ErrInvalid) {
		t.Fatalf("enabled without password: %v", err)
	}
	in.Password = "smtp-authorization-secret"
	cfg, err = s.Save(ctx, in)
	if err != nil {
		t.Fatal(err)
	}
	encoded, _ := json.Marshal(cfg)
	if strings.Contains(string(encoded), in.Password) || strings.Contains(string(encoded), "password_encrypted") || !cfg.PasswordConfigured || strings.Contains(string(cfg.passwordEncrypted), in.Password) {
		t.Fatal("SMTP credentials exposed")
	}
	if _, err = s.Save(ctx, in); !errors.Is(err, ErrConflict) {
		t.Fatalf("stale save: %v", err)
	}
	kept, err := s.Save(ctx, inputFrom(cfg))
	if err != nil || !kept.PasswordConfigured {
		t.Fatalf("blank did not retain password: %v", err)
	}
	password, err := s.password(kept)
	if err != nil || password != in.Password {
		t.Fatal("credential roundtrip failed")
	}
	for _, change := range []func(*Input){
		func(in *Input) { in.Recipient = "safe@example.test\r\nBcc: stolen@example.test" },
		func(in *Input) { in.FromName = "sender\nInjected: header" },
		func(in *Input) { in.Security = "none" },
		func(in *Input) { in.Host = "https://smtp.qq.com/" },
		func(in *Input) { in.Port = 0 },
		func(in *Input) { in.ClearPassword = true },
	} {
		bad := inputFrom(kept)
		change(&bad)
		if _, err = s.Save(ctx, bad); !errors.Is(err, ErrInvalid) {
			t.Fatalf("unsafe settings accepted: %v", err)
		}
	}
	clear := inputFrom(kept)
	clear.Enabled = false
	clear.ClearPassword = true
	cfg, err = s.Save(ctx, clear)
	if err != nil || cfg.PasswordConfigured {
		t.Fatalf("clear password: %v", err)
	}
}

func TestQueueIsTransactionalHonorsNotificationSwitchesAndSurvivesRestart(t *testing.T) {
	s, c, siteID := setup(t)
	ctx := context.Background()
	submit(t, s, c, siteID, "before-enable")
	var count int
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM mail_deliveries`).Scan(&count)
	if count != 0 {
		t.Fatal("disabled SMTP queued historical mail")
	}
	enable(t, s)
	id := submit(t, s, c, siteID, "new-enquiry")
	form, _ := c.EnsureHomeEnquiryForm(ctx, siteID, "en", false)
	if _, err := c.SaveFormSubmission(ctx, form.ID, 0, siteID, "en", "/contact", "new-enquiry", "ip", "ua", []byte("encrypted")); err == nil {
		t.Fatal("accepted duplicate")
	}
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM mail_deliveries`).Scan(&count)
	if count != 1 {
		t.Fatalf("queue has %d rows", count)
	}
	if _, err := s.db.Exec(`UPDATE forms SET notify_enabled=0 WHERE id=?`, form.ID); err != nil {
		t.Fatal(err)
	}
	submit(t, s, c, siteID, "form-muted")
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM mail_deliveries`).Scan(&count)
	if count != 1 {
		t.Fatal("muted form generated mail")
	}
	// A new instance consumes the persisted queue; payload is only decrypted
	// for sending, and the visitor email is Reply-To rather than From.
	restarted := New(s.db, s.keys, s.logger)
	var sends int
	restarted.send = func(_ context.Context, cfg Settings, password, recipient string, msg message) error {
		sends++
		if recipient != "38395858@qq.com" || password != "smtp-authorization-secret" || cfg.FromEmail != cfg.Recipient || msg.replyTo != "buyer@example.test" || !strings.Contains(msg.body, "张先生") || !strings.Contains(msg.body, "额外字段") || !strings.Contains(msg.body, "/contact") {
			t.Fatal("mail missing form data or using unsafe envelope")
		}
		return nil
	}
	if worked, err := restarted.processNext(ctx); !worked || err != nil {
		t.Fatalf("process: %v %v", worked, err)
	}
	if worked, err := restarted.processNext(ctx); worked || err != nil {
		t.Fatalf("duplicate delivery: %v %v", worked, err)
	}
	items, total, err := restarted.Deliveries(ctx, 0)
	if err != nil || total != 1 || items[0].SubmissionID != id || items[0].Status != "sent" || sends != 1 {
		t.Fatalf("delivery state: %+v %v", items, err)
	}
	if err = restarted.Retry(ctx, items[0].ID); !errors.Is(err, ErrConflict) {
		t.Fatalf("sent mail allowed to retry: %v", err)
	}
	// Queue insertion errors roll back the form insert rather than losing mail.
	_, _ = s.db.Exec(`UPDATE forms SET notify_enabled=1 WHERE id=?`, form.ID)
	_, _ = s.db.Exec(`CREATE TRIGGER fail_mail_insert BEFORE INSERT ON mail_deliveries BEGIN SELECT RAISE(ABORT,'test queue failure'); END`)
	before := 0
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM form_submissions`).Scan(&before)
	if _, err = c.SaveFormSubmission(ctx, form.ID, 0, siteID, "en", "/contact", "rollback", "ip", "ua", []byte("encrypted")); err == nil {
		t.Fatal("queue error not propagated")
	}
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM form_submissions`).Scan(&count)
	if count != before {
		t.Fatal("form committed without its mail job")
	}
}

func TestRetryBackoffLeaseRecoveryAndSingleClaim(t *testing.T) {
	s, c, siteID := setup(t)
	ctx := context.Background()
	enable(t, s)
	submit(t, s, c, siteID, "retry")
	s.send = func(context.Context, Settings, string, string, message) error { return errors.New("SMTP 认证失败") }
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		if worked, err := s.processNext(ctx); !worked || err != nil {
			t.Fatalf("attempt %d: %v %v", attempt, worked, err)
		}
		var status, next, detail string
		var attempts int
		_ = s.db.QueryRow(`SELECT status,attempts,next_attempt_at,last_error FROM mail_deliveries`).Scan(&status, &attempts, &next, &detail)
		if attempts != attempt || detail != "SMTP 认证失败" {
			t.Fatal("failure not recorded")
		}
		if attempt < maxAttempts {
			if status != "pending" {
				t.Fatal("retry not queued")
			}
			when, _ := time.Parse(time.RFC3339Nano, next)
			if !when.After(time.Now().Add(50 * time.Second)) {
				t.Fatal("missing backoff")
			}
			if worked, _ := s.processNext(ctx); worked {
				t.Fatal("retried before backoff")
			}
			_, _ = s.db.Exec(`UPDATE mail_deliveries SET next_attempt_at=?`, stamp(time.Now().Add(-time.Minute)))
		} else if status != "failed" {
			t.Fatal("retry limit not enforced")
		}
	}
	if err := s.Retry(ctx, 1); err != nil {
		t.Fatal(err)
	}
	// An abandoned claim after a crash is reclaimed after its lease expires.
	_, _ = s.db.Exec(`UPDATE mail_deliveries SET status='sending',lease_token='dead-worker',lease_until=?`, stamp(time.Now().Add(-time.Minute)))
	var delivered atomic.Int32
	s.send = func(context.Context, Settings, string, string, message) error { delivered.Add(1); return nil }
	var wg sync.WaitGroup
	for range 2 {
		wg.Go(func() {
			if _, err := s.processNext(ctx); err != nil {
				t.Error(err)
			}
		})
	}
	wg.Wait()
	if delivered.Load() != 1 {
		t.Fatalf("concurrent claims sent %d mails", delivered.Load())
	}
}

func TestPausedQueueAndExplicitTestWithForwardingOff(t *testing.T) {
	s, c, siteID := setup(t)
	ctx := context.Background()
	enable(t, s)
	submit(t, s, c, siteID, "pause")
	cfg, _ := s.Settings(ctx)
	in := inputFrom(cfg)
	in.Enabled = false
	cfg, err := s.Save(ctx, in)
	if err != nil {
		t.Fatal(err)
	}
	calls := 0
	s.send = func(context.Context, Settings, string, string, message) error { calls++; return nil }
	if worked, err := s.processNext(ctx); worked || err != nil {
		t.Fatal("paused queue processed")
	}
	if err = s.Test(ctx); err != nil || calls != 1 {
		t.Fatalf("explicit test: calls=%d err=%v", calls, err)
	}
	cfg, _ = s.Settings(ctx)
	if cfg.LastTestStatus != "sent" || cfg.LastTestedAt == "" {
		t.Fatal("test status not saved")
	}
	in = inputFrom(cfg)
	in.Enabled = true
	_, err = s.Save(ctx, in)
	if err != nil {
		t.Fatal(err)
	}
	if worked, err := s.processNext(ctx); !worked || err != nil || calls != 2 {
		t.Fatal("paused queue not resumed")
	}
}

func TestConcurrentSubmissionsAndMailClaimsDoNotLoseJobs(t *testing.T) {
	s, c, siteID := setup(t)
	ctx := context.Background()
	enable(t, s)
	form, err := c.EnsureHomeEnquiryForm(ctx, siteID, "en", false)
	if err != nil {
		t.Fatal(err)
	}
	encoded, err := s.keys.Encrypt("form-submission", []byte(`{"work_email":"buyer@example.test"}`))
	if err != nil {
		t.Fatal(err)
	}
	s.send = func(context.Context, Settings, string, string, message) error { return nil }
	var wg sync.WaitGroup
	for i := range 24 {
		wg.Go(func() {
			_, err := c.SaveFormSubmission(ctx, form.ID, 0, siteID, "en", "/contact", fmt.Sprint(i), "ip", "ua", encoded)
			if err != nil {
				t.Error(err)
			}
			if _, err = s.processNext(ctx); err != nil {
				t.Error(err)
			}
		})
	}
	wg.Wait()
	var submissions, jobs int
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM form_submissions`).Scan(&submissions)
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM mail_deliveries`).Scan(&jobs)
	if submissions != 24 || jobs != 24 {
		t.Fatalf("lost form/mail: %d/%d", submissions, jobs)
	}
	// Concurrent duplicate POSTs also produce only one additional notification.
	var accepted atomic.Int32
	for range 6 {
		wg.Go(func() {
			_, err := c.SaveFormSubmission(ctx, form.ID, 0, siteID, "en", "/contact", "same-request", "ip", "ua", encoded)
			if err == nil {
				accepted.Add(1)
			} else if !strings.Contains(err.Error(), "重复") {
				t.Error(err)
			}
		})
	}
	wg.Wait()
	if accepted.Load() != 1 {
		t.Fatalf("duplicate POSTs accepted %d times", accepted.Load())
	}
}
