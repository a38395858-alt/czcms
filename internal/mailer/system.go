package mailer

import (
	"context"
	"database/sql"
	"errors"
	"strconv"
	"strings"
	"time"
)

// Operational alerts share the configured recipient, encrypted SMTP credentials
// and durable retries, without creating fake form submissions.
func (s *Service) QueueSystemAlert(ctx context.Context, key, subject, body string) error {
	cfg, err := s.Settings(ctx)
	if err != nil {
		return err
	}
	if !validAddress(cfg.Recipient) {
		return errors.New("请先配置后台邮件通知收件邮箱")
	}
	if len(key) > 160 || key == "" || len(subject) > 300 || strings.ContainsAny(subject, "\r\n") || len(body) > 12000 {
		return errors.New("无效的系统通知")
	}
	now := stamp(time.Now())
	_, err = s.db.ExecContext(ctx, `INSERT INTO system_mail_deliveries(event_key,recipient,subject,body,next_attempt_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(event_key) DO NOTHING`, key, cfg.Recipient, subject, body, now, now, now)
	return err
}

func (s *Service) processNextSystem(ctx context.Context, cfg Settings) (bool, error) {
	now, lease := time.Now(), token()
	var id int64
	var recipient, subject, body string
	var attempts int
	err := s.db.QueryRowContext(ctx, `UPDATE system_mail_deliveries SET status='sending',lease_token=?,lease_until=?,attempts=attempts+1,updated_at=? WHERE id=(SELECT id FROM system_mail_deliveries WHERE (status='pending' AND next_attempt_at<=?) OR (status='sending' AND lease_until<=?) ORDER BY id LIMIT 1) AND EXISTS(SELECT 1 FROM smtp_settings WHERE id=1 AND enabled=1) RETURNING id,recipient,subject,body,attempts`, lease, stamp(now.Add(2*time.Minute)), stamp(now), stamp(now), stamp(now)).Scan(&id, &recipient, &subject, &body, &attempts)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	password, err := s.password(cfg)
	if err == nil {
		sendCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
		err = s.send(sendCtx, cfg, password, recipient, message{subject: subject, body: body, messageID: messageID("system-"+strconv.FormatInt(id, 10), cfg)})
		cancel()
	}
	status, detail, sentAt := "sent", "", stamp(time.Now())
	next := time.Now()
	if err != nil {
		status, detail, sentAt = "pending", err.Error(), ""
		if attempts >= maxAttempts {
			status = "failed"
		}
		delays := []time.Duration{time.Minute, 5 * time.Minute, 15 * time.Minute, 30 * time.Minute}
		next = next.Add(delays[min(max(attempts-1, 0), len(delays)-1)])
	}
	finish, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_, finishErr := s.db.ExecContext(finish, `UPDATE system_mail_deliveries SET status=?,last_error=?,sent_at=?,next_attempt_at=?,lease_token='',lease_until='',updated_at=? WHERE id=? AND lease_token=?`, status, detail, sentAt, stamp(next), stamp(time.Now()), id, lease)
	return true, finishErr
}
