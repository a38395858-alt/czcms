package mailer

import (
	"context"
	"errors"
	"net/mail"
	"regexp"
	"strings"
	"time"
	"unicode/utf8"
)

var (
	ErrConflict = errors.New("邮件配置或发送记录已变化，请刷新后重试")
	ErrInvalid  = errors.New("邮件配置无效")
	ErrNotFound = errors.New("邮件记录不存在")
	hostPattern = regexp.MustCompile(`^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$`)
)

type Settings struct {
	Enabled            bool   `json:"enabled"`
	Host               string `json:"host"`
	Port               int    `json:"port"`
	Security           string `json:"security"`
	Username           string `json:"username"`
	FromEmail          string `json:"from_email"`
	FromName           string `json:"from_name"`
	Recipient          string `json:"recipient"`
	PasswordConfigured bool   `json:"password_configured"`
	LastTestStatus     string `json:"last_test_status"`
	LastTestMessage    string `json:"last_test_message"`
	LastTestedAt       string `json:"last_tested_at"`
	Version            int64  `json:"version"`
	UpdatedAt          string `json:"updated_at"`
	passwordEncrypted  []byte
}

type Input struct {
	Enabled       bool   `json:"enabled"`
	Host          string `json:"host"`
	Port          int    `json:"port"`
	Security      string `json:"security"`
	Username      string `json:"username"`
	Password      string `json:"password"`
	ClearPassword bool   `json:"clear_password"`
	FromEmail     string `json:"from_email"`
	FromName      string `json:"from_name"`
	Recipient     string `json:"recipient"`
	Version       int64  `json:"version"`
}

type validationError struct{ message string }

func (e validationError) Error() string { return e.message }
func (e validationError) Unwrap() error { return ErrInvalid }
func invalid(message string) error      { return validationError{message} }

func validAddress(value string) bool {
	if value == "" || len(value) > 254 || strings.ContainsAny(value, "\r\n") {
		return false
	}
	for _, r := range value {
		if r > 127 {
			return false
		}
	}
	address, err := mail.ParseAddress(value)
	return err == nil && address.Address == value && strings.Contains(value, "@")
}

func (s *Service) Settings(ctx context.Context) (Settings, error) {
	var item Settings
	err := s.db.QueryRowContext(ctx, `SELECT enabled,host,port,security,username,password_encrypted,from_email,from_name,recipient,
		last_test_status,last_test_message,last_tested_at,version,updated_at FROM smtp_settings WHERE id=1`).Scan(
		&item.Enabled, &item.Host, &item.Port, &item.Security, &item.Username, &item.passwordEncrypted, &item.FromEmail, &item.FromName, &item.Recipient,
		&item.LastTestStatus, &item.LastTestMessage, &item.LastTestedAt, &item.Version, &item.UpdatedAt)
	item.PasswordConfigured = len(item.passwordEncrypted) > 0
	return item, err
}

func (s *Service) Save(ctx context.Context, input Input) (Settings, error) {
	input.Host = strings.TrimSpace(input.Host)
	input.Username = strings.TrimSpace(input.Username)
	input.FromEmail = strings.TrimSpace(input.FromEmail)
	input.FromName = strings.TrimSpace(input.FromName)
	input.Recipient = strings.TrimSpace(input.Recipient)
	if len(input.Host) > 253 || !hostPattern.MatchString(input.Host) || input.Port < 1 || input.Port > 65535 {
		return Settings{}, invalid("请填写 SMTP 服务器域名和 1–65535 之间的端口")
	}
	if input.Security != "tls" && input.Security != "starttls" {
		return Settings{}, invalid("请选择 SSL/TLS 或 STARTTLS 加密连接")
	}
	if !validAddress(input.FromEmail) || !validAddress(input.Recipient) {
		return Settings{}, invalid("请填写有效的发件邮箱和收件邮箱")
	}
	if strings.ContainsAny(input.FromName+input.Username+input.Password, "\r\n\x00") || utf8.RuneCountInString(input.FromName) > 100 || len(input.Username) > 320 || len(input.Password) > 1024 {
		return Settings{}, invalid("发件人名称、账号或授权码过长，或包含无效字符")
	}
	current, err := s.Settings(ctx)
	if err != nil {
		return Settings{}, err
	}
	if input.Version != current.Version {
		return Settings{}, ErrConflict
	}
	secret := current.passwordEncrypted
	if input.ClearPassword {
		secret = nil
	}
	if input.Password != "" {
		secret, err = s.keys.Encrypt("smtp-password", []byte(input.Password))
		if err != nil {
			return Settings{}, err
		}
	}
	if input.Enabled && input.Username != "" && len(secret) == 0 {
		return Settings{}, invalid("启用邮件转发前，请填写 SMTP 授权码或密码")
	}
	// Invalidate a successful connection test whenever transport or addresses change.
	changed := current.Host != input.Host || current.Port != input.Port || current.Security != input.Security || current.Username != input.Username || current.FromEmail != input.FromEmail || current.FromName != input.FromName || current.Recipient != input.Recipient || input.Password != "" || input.ClearPassword
	status, message, tested := current.LastTestStatus, current.LastTestMessage, current.LastTestedAt
	if changed {
		status, message, tested = "untested", "", ""
	}
	result, err := s.db.ExecContext(ctx, `UPDATE smtp_settings SET enabled=?,host=?,port=?,security=?,username=?,password_encrypted=?,
		from_email=?,from_name=?,recipient=?,last_test_status=?,last_test_message=?,last_tested_at=?,version=version+1,updated_at=? WHERE id=1 AND version=?`,
		input.Enabled, input.Host, input.Port, input.Security, input.Username, secret, input.FromEmail, input.FromName, input.Recipient, status, message, tested, stamp(time.Now()), input.Version)
	if err != nil {
		return Settings{}, err
	}
	if count, _ := result.RowsAffected(); count != 1 {
		return Settings{}, ErrConflict
	}
	return s.Settings(ctx)
}
