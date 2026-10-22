package mailer

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"sort"
	"strings"
	"time"

	"czcms/internal/security"
)

const maxAttempts = 5

type Service struct {
	db     *sql.DB
	keys   *security.Keyring
	logger *slog.Logger
	cancel context.CancelFunc
	done   chan struct{}
	send   func(context.Context, Settings, string, string, message) error
}

func New(db *sql.DB, keys *security.Keyring, logger *slog.Logger) *Service {
	return &Service{db: db, keys: keys, logger: logger, send: func(ctx context.Context, cfg Settings, password, recipient string, msg message) error {
		return sendSMTP(ctx, cfg, password, recipient, msg, nil)
	}}
}

func stamp(t time.Time) string { return t.UTC().Format(time.RFC3339Nano) }
func token() string {
	var raw [16]byte
	_, err := rand.Read(raw[:])
	if err != nil {
		panic(err)
	}
	return hex.EncodeToString(raw[:])
}

func (s *Service) Start() {
	ctx, cancel := context.WithCancel(context.Background())
	s.cancel = cancel
	s.done = make(chan struct{})
	go func() {
		defer close(s.done)
		ticker := time.NewTicker(2 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
			}
			for range 10 {
				worked, err := s.processNext(ctx)
				if ctx.Err() != nil {
					return
				}
				if err != nil {
					s.logger.Warn("邮件队列处理失败，稍后重试")
					break
				}
				if !worked {
					break
				}
			}
		}
	}()
}

func (s *Service) Close(ctx context.Context) error {
	if s.cancel == nil {
		return nil
	}
	s.cancel()
	select {
	case <-s.done:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func (s *Service) Test(ctx context.Context) error {
	cfg, err := s.Settings(ctx)
	if err != nil {
		return err
	}
	password, err := s.password(cfg)
	if err == nil {
		ctx, cancel := context.WithTimeout(ctx, 25*time.Second)
		defer cancel()
		err = s.send(ctx, cfg, password, cfg.Recipient, message{subject: "CZCMS SMTP 测试邮件", body: "这是一封 CZCMS 邮件转发测试邮件。\n\n收件邮箱：" + cfg.Recipient + "\n发送成功后，请在后台启用邮件转发并保存。新提交的表单将自动通知此邮箱。", messageID: messageID(token(), cfg)})
	}
	status, detail := "sent", "SMTP 已接受测试邮件，请检查收件箱及垃圾邮件"
	if err != nil {
		status, detail = "failed", err.Error()
	}
	// Persist the outcome even when the request deadline expired. Never overwrite
	// the status of a newer configuration changed during the network call.
	saveCtx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_, saveErr := s.db.ExecContext(saveCtx, `UPDATE smtp_settings SET last_test_status=?,last_test_message=?,last_tested_at=? WHERE id=1 AND version=?`, status, detail, stamp(time.Now()), cfg.Version)
	if err != nil {
		return err
	}
	return saveErr
}

func (s *Service) password(cfg Settings) (string, error) {
	if cfg.Username == "" {
		return "", nil
	}
	if !cfg.PasswordConfigured {
		return "", invalid("请先保存 SMTP 授权码或密码")
	}
	plain, err := s.keys.Decrypt("smtp-password", cfg.passwordEncrypted)
	if err != nil {
		return "", errors.New("SMTP 授权码无法解密，请重新保存")
	}
	return string(plain), nil
}

func (s *Service) processNext(ctx context.Context) (bool, error) {
	cfg, err := s.Settings(ctx)
	if err != nil || !cfg.Enabled {
		return false, err
	}
	now, lease := time.Now(), token()
	var id, submissionID int64
	var recipient string
	var attempts int
	err = s.db.QueryRowContext(ctx, `UPDATE mail_deliveries SET status='sending',lease_token=?,lease_until=?,attempts=attempts+1,updated_at=?
		WHERE id=(SELECT id FROM mail_deliveries WHERE (status='pending' AND next_attempt_at<=?) OR (status='sending' AND lease_until<=?) ORDER BY id LIMIT 1)
		AND EXISTS(SELECT 1 FROM smtp_settings WHERE id=1 AND enabled=1)
		RETURNING id,submission_id,recipient,attempts`, lease, stamp(now.Add(2*time.Minute)), stamp(now), stamp(now), stamp(now)).Scan(&id, &submissionID, &recipient, &attempts)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	msg, err := s.submissionMessage(ctx, submissionID, cfg)
	if err == nil {
		var password string
		password, err = s.password(cfg)
		if err == nil {
			sendCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
			err = s.send(sendCtx, cfg, password, recipient, msg)
			cancel()
		}
	}
	status, detail, sentAt := "sent", "", stamp(time.Now())
	next := time.Now()
	if err != nil {
		status, detail, sentAt = "pending", err.Error(), ""
		if attempts >= maxAttempts {
			status = "failed"
		}
		delays := []time.Duration{time.Minute, 5 * time.Minute, 15 * time.Minute, 30 * time.Minute}
		index := min(max(attempts-1, 0), len(delays)-1)
		next = next.Add(delays[index])
	}
	// Release the lease on shutdown as well. A crash after SMTP acceptance can
	// still cause a duplicate; the stable Message-ID helps mailbox deduplication.
	finishCtx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_, finishErr := s.db.ExecContext(finishCtx, `UPDATE mail_deliveries SET status=?,last_error=?,sent_at=?,next_attempt_at=?,lease_token='',lease_until='',updated_at=? WHERE id=? AND lease_token=?`, status, detail, sentAt, stamp(next), stamp(time.Now()), id, lease)
	return true, finishErr
}

func (s *Service) submissionMessage(ctx context.Context, id int64, cfg Settings) (message, error) {
	var encrypted []byte
	var formID int64
	var formName, siteName, locale, source, created string
	err := s.db.QueryRowContext(ctx, `SELECT fs.values_encrypted,fs.form_id,f.name,s.name,fs.locale,fs.source_path,fs.created_at FROM form_submissions fs JOIN forms f ON f.id=fs.form_id JOIN sites s ON s.id=fs.site_id WHERE fs.id=?`, id).Scan(&encrypted, &formID, &formName, &siteName, &locale, &source, &created)
	if err != nil {
		return message{}, errors.New("无法读取表单通知内容")
	}
	plain, err := s.keys.Decrypt("form-submission", encrypted)
	values := map[string]string{}
	if err != nil || json.Unmarshal(plain, &values) != nil {
		return message{}, errors.New("表单通知内容无法解密，请检查主密钥")
	}
	labels := map[string]string{}
	order := []string{}
	rows, err := s.db.QueryContext(ctx, `SELECT field_key,label FROM form_fields WHERE form_id=? ORDER BY sort_order,id`, formID)
	if err != nil {
		return message{}, errors.New("无法读取表单字段")
	}
	for rows.Next() {
		var key, label string
		if err = rows.Scan(&key, &label); err != nil {
			break
		}
		labels[key] = label
		order = append(order, key)
	}
	if err == nil {
		err = rows.Err()
	}
	rows.Close()
	if err != nil {
		return message{}, errors.New("无法读取表单字段")
	}
	extra := []string{}
	for key := range values {
		if _, ok := labels[key]; !ok {
			extra = append(extra, key)
		}
	}
	sort.Strings(extra)
	order = append(order, extra...)
	var body strings.Builder
	fmt.Fprintf(&body, "收到新的表单提交\n\n提交编号：FV-%d\n站点：%s\n语言：%s\n表单：%s\n来源页面：%s\n提交时间（UTC）：%s\n\n", id, siteName, locale, formName, source, created)
	for _, key := range order {
		if value := values[key]; value != "" {
			label := labels[key]
			if label == "" {
				label = key
			}
			fmt.Fprintf(&body, "%s：\n%s\n\n", label, value)
		}
	}
	body.WriteString("完整记录和跟进备注请在 CZCMS 后台的“表单收件箱”查看。\n参考文件字段仅包含文件信息，不附带文件内容。\n")
	replyTo := values["work_email"]
	if !validAddress(replyTo) {
		replyTo = values["email"]
	}
	return message{subject: fmt.Sprintf("新表单通知 · %s · FV-%d", headerText(siteName), id), body: body.String(), replyTo: replyTo, messageID: messageID(s.keys.HMAC("mail-message-id", fmt.Sprint(id)), cfg)}, nil
}

func headerText(value string) string {
	return strings.Map(func(r rune) rune {
		if r < ' ' || r == 127 {
			return -1
		}
		return r
	}, value)
}

type Delivery struct {
	ID            int64  `json:"id"`
	SubmissionID  int64  `json:"submission_id"`
	Recipient     string `json:"recipient"`
	Status        string `json:"status"`
	Attempts      int    `json:"attempts"`
	LastError     string `json:"last_error"`
	NextAttemptAt string `json:"next_attempt_at"`
	SentAt        string `json:"sent_at"`
	CreatedAt     string `json:"created_at"`
	SiteName      string `json:"site_name"`
	FormName      string `json:"form_name"`
}

func (s *Service) Deliveries(ctx context.Context, offset int) ([]Delivery, int, error) {
	var total int
	if err := s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM mail_deliveries`).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := s.db.QueryContext(ctx, `SELECT d.id,d.submission_id,d.recipient,d.status,d.attempts,d.last_error,d.next_attempt_at,d.sent_at,d.created_at,s.name,f.name FROM mail_deliveries d JOIN form_submissions fs ON fs.id=d.submission_id JOIN sites s ON s.id=fs.site_id JOIN forms f ON f.id=fs.form_id ORDER BY d.id DESC LIMIT 25 OFFSET ?`, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	items := []Delivery{}
	for rows.Next() {
		var item Delivery
		if err = rows.Scan(&item.ID, &item.SubmissionID, &item.Recipient, &item.Status, &item.Attempts, &item.LastError, &item.NextAttemptAt, &item.SentAt, &item.CreatedAt, &item.SiteName, &item.FormName); err != nil {
			return nil, 0, err
		}
		items = append(items, item)
	}
	return items, total, rows.Err()
}

func (s *Service) Retry(ctx context.Context, id int64) error {
	cfg, err := s.Settings(ctx)
	if err != nil {
		return err
	}
	if !cfg.Enabled {
		return invalid("请先启用邮件转发并保存，再重发邮件")
	}
	now := stamp(time.Now())
	result, err := s.db.ExecContext(ctx, `UPDATE mail_deliveries SET status='pending',attempts=0,last_error='',next_attempt_at=?,updated_at=? WHERE id=? AND status='failed'`, now, now, id)
	if err != nil {
		return err
	}
	if count, _ := result.RowsAffected(); count != 1 {
		var exists int
		if err = s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM mail_deliveries WHERE id=?`, id).Scan(&exists); err != nil {
			return err
		}
		if exists == 0 {
			return ErrNotFound
		}
		return ErrConflict
	}
	return nil
}
