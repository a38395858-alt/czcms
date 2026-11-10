package mailer

import (
	"context"
	"errors"
	"strings"
	"testing"
)

func TestSystemAlertsUseConfiguredRecipientDeduplicateAndRetryWithoutForms(t *testing.T) {
	s, _, _ := setup(t)
	ctx := context.Background()
	for range 2 {
		if err := s.QueueSystemAlert(ctx, "hts-sync:2026-11", "HTS update failed", "Old data remains available."); err != nil {
			t.Fatal(err)
		}
	}
	var count int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM system_mail_deliveries`).Scan(&count); err != nil || count != 1 {
		t.Fatal("monthly alert dedupe failed")
	}
	if worked, err := s.processNext(ctx); worked || err != nil {
		t.Fatal("SMTP disabled must leave alerts pending")
	}
	enable(t, s)
	ids := []string{}
	s.send = func(_ context.Context, cfg Settings, password, recipient string, msg message) error {
		if recipient != cfg.Recipient || !strings.Contains(msg.subject, "HTS") || password == "" {
			t.Fatal("alert did not reuse configured notification transport")
		}
		ids = append(ids, msg.messageID)
		if len(ids) == 1 {
			return errors.New("temporary SMTP failure")
		}
		return nil
	}
	if worked, err := s.processNext(ctx); !worked || err != nil {
		t.Fatal(err)
	}
	var status string
	s.db.QueryRow(`SELECT status FROM system_mail_deliveries`).Scan(&status)
	if status != "pending" {
		t.Fatal("failed delivery should retry")
	}
	s.db.Exec(`UPDATE system_mail_deliveries SET next_attempt_at=''`)
	if worked, err := s.processNext(ctx); !worked || err != nil {
		t.Fatal(err)
	}
	s.db.QueryRow(`SELECT status FROM system_mail_deliveries`).Scan(&status)
	if status != "sent" || len(ids) != 2 || ids[0] != ids[1] {
		t.Fatal("retry status or stable Message-ID failed")
	}
	s.db.QueryRow(`SELECT COUNT(*) FROM form_submissions`).Scan(&count)
	if count != 0 {
		t.Fatal("operational alerts must not create fake enquiries")
	}
}
