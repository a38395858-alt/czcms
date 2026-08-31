package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"database/sql"
	"encoding/base64"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"czcms/internal/security"
)

var (
	ErrInvalidCredentials = errors.New("用户名、密码或验证码不正确")
	ErrAccountLocked      = errors.New("账户暂时锁定，请稍后重试")
	ErrSetupClosed        = errors.New("初始管理员已经创建")
	ErrNoSession          = errors.New("session not found")
	ErrCSRF               = errors.New("csrf validation failed")
)

var usernamePattern = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9._-]{2,63}$`)

type Config struct {
	IdleTTL     time.Duration
	AbsoluteTTL time.Duration
}

type Service struct {
	db        *sql.DB
	keys      *security.Keyring
	cfg       Config
	dummyHash string
	now       func() time.Time
}

type User struct {
	ID             int64
	Username       string
	DisplayName    string
	Email          string
	Status         string
	PasswordHash   string
	MFAEnabled     bool
	MFASecret      []byte
	MFALastCounter uint64
	FailedLogins   int
	LockedUntil    sql.NullString
}

type Session struct {
	ID            string
	User          User
	CSRFToken     string
	CreatedAt     time.Time
	IdleExpires   time.Time
	AbsoluteUntil time.Time
}

type LoginResult struct {
	Session     Session
	CookieValue string
}

type MFAEnrollment struct {
	Secret string `json:"secret"`
	URL    string `json:"url"`
}

func New(db *sql.DB, keys *security.Keyring, cfg Config) (*Service, error) {
	if cfg.IdleTTL <= 0 {
		cfg.IdleTTL = 30 * time.Minute
	}
	if cfg.AbsoluteTTL < cfg.IdleTTL {
		cfg.AbsoluteTTL = 12 * time.Hour
	}
	dummy, err := security.HashPassword("not-a-real-user-password")
	if err != nil {
		return nil, err
	}
	return &Service{db: db, keys: keys, cfg: cfg, dummyHash: dummy, now: time.Now}, nil
}

func (s *Service) SetupRequired(ctx context.Context) (bool, error) {
	var completed int
	if err := s.db.QueryRowContext(ctx, `SELECT completed FROM setup_state WHERE id = 1`).Scan(&completed); err != nil {
		return false, err
	}
	return completed == 0, nil
}

func (s *Service) CreateInitialOwner(ctx context.Context, username, displayName, email, password string) (User, error) {
	username = strings.TrimSpace(username)
	displayName = strings.TrimSpace(displayName)
	email = strings.TrimSpace(email)
	if !usernamePattern.MatchString(username) {
		return User{}, errors.New("用户名需为 3–64 位字母、数字、点、横线或下划线")
	}
	if displayName == "" || len(displayName) > 100 {
		return User{}, errors.New("显示名称不能为空且不能超过 100 字节")
	}
	if err := security.ValidatePassword(password); err != nil {
		return User{}, err
	}
	hash, err := security.HashPassword(password)
	if err != nil {
		return User{}, err
	}
	now := s.now().UTC().Format(time.RFC3339Nano)
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return User{}, err
	}
	defer tx.Rollback()
	result, err := tx.ExecContext(ctx, `UPDATE setup_state SET completed = 1 WHERE id = 1 AND completed = 0`)
	if err != nil {
		return User{}, err
	}
	changed, err := result.RowsAffected()
	if err != nil || changed != 1 {
		return User{}, ErrSetupClosed
	}
	result, err = tx.ExecContext(ctx, `INSERT INTO users(username, display_name, email, password_hash, password_changed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`, username, displayName, email, hash, now, now, now)
	if err != nil {
		return User{}, fmt.Errorf("create initial owner: %w", err)
	}
	userID, err := result.LastInsertId()
	if err != nil {
		return User{}, err
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO user_roles(user_id, role_id) SELECT ?, id FROM roles WHERE code = 'owner'`, userID); err != nil {
		return User{}, err
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO user_access_scopes(user_id, site_id, locale, created_at) VALUES (?, 0, '*', ?)`, userID, now); err != nil {
		return User{}, err
	}
	if err = tx.Commit(); err != nil {
		return User{}, err
	}
	return User{ID: userID, Username: username, DisplayName: displayName, Email: email, Status: "active", PasswordHash: hash}, nil
}

func (s *Service) Login(ctx context.Context, username, password, secondFactor, ip, userAgent string) (LoginResult, error) {
	username = strings.TrimSpace(username)
	user, found, err := s.findUser(ctx, username)
	if err != nil {
		return LoginResult{}, err
	}
	hash := s.dummyHash
	if found {
		hash = user.PasswordHash
	}
	passwordOK, verifyErr := security.VerifyPassword(hash, password)
	if verifyErr != nil {
		passwordOK = false
	}
	now := s.now().UTC()
	if !found || user.Status != "active" || !passwordOK {
		if found && user.Status == "active" {
			_ = s.recordFailure(ctx, user.ID, user.FailedLogins, now)
		}
		return LoginResult{}, ErrInvalidCredentials
	}
	if user.LockedUntil.Valid {
		lockedUntil, parseErr := time.Parse(time.RFC3339Nano, user.LockedUntil.String)
		if parseErr == nil && now.Before(lockedUntil) {
			return LoginResult{}, ErrAccountLocked
		}
	}

	if user.MFAEnabled {
		if !s.verifySecondFactor(ctx, &user, secondFactor, now) {
			_ = s.recordFailure(ctx, user.ID, user.FailedLogins, now)
			return LoginResult{}, ErrInvalidCredentials
		}
	}
	if security.PasswordHashNeedsUpgrade(user.PasswordHash) {
		if upgraded, hashErr := security.HashPassword(password); hashErr == nil {
			user.PasswordHash = upgraded
		}
	}
	if _, err = s.db.ExecContext(ctx, `UPDATE users SET password_hash = ?, failed_login_count = 0, locked_until = NULL, last_login_at = ?, updated_at = ? WHERE id = ?`, user.PasswordHash, now.Format(time.RFC3339Nano), now.Format(time.RFC3339Nano), user.ID); err != nil {
		return LoginResult{}, err
	}
	return s.newSession(ctx, user, ip, userAgent)
}

func (s *Service) findUser(ctx context.Context, username string) (User, bool, error) {
	var user User
	var mfaEnabled int
	err := s.db.QueryRowContext(ctx, `SELECT id, username, display_name, email, status, password_hash, failed_login_count, locked_until, mfa_enabled, mfa_secret, mfa_last_counter FROM users WHERE username = ?`, username).Scan(
		&user.ID, &user.Username, &user.DisplayName, &user.Email, &user.Status, &user.PasswordHash, &user.FailedLogins, &user.LockedUntil, &mfaEnabled, &user.MFASecret, &user.MFALastCounter)
	if errors.Is(err, sql.ErrNoRows) {
		return User{}, false, nil
	}
	user.MFAEnabled = mfaEnabled == 1
	return user, err == nil, err
}

func (s *Service) recordFailure(ctx context.Context, userID int64, previous int, now time.Time) error {
	count := previous + 1
	var lockedUntil any
	if count >= 5 {
		exponent := min(count-5, 6)
		duration := 15 * time.Minute * time.Duration(1<<exponent)
		lockedUntil = now.Add(duration).Format(time.RFC3339Nano)
	}
	_, err := s.db.ExecContext(ctx, `UPDATE users SET failed_login_count = ?, locked_until = ?, updated_at = ? WHERE id = ?`, count, lockedUntil, now.Format(time.RFC3339Nano), userID)
	return err
}

func (s *Service) verifySecondFactor(ctx context.Context, user *User, value string, now time.Time) bool {
	if len(user.MFASecret) == 0 {
		return false
	}
	secret, err := s.keys.Decrypt("mfa-secret", user.MFASecret)
	if err != nil {
		return false
	}
	if counter, valid := security.ValidateTOTP(string(secret), value, now, user.MFALastCounter); valid {
		result, updateErr := s.db.ExecContext(ctx, `UPDATE users SET mfa_last_counter = ? WHERE id = ? AND mfa_last_counter < ?`, counter, user.ID, counter)
		if updateErr != nil {
			return false
		}
		changed, _ := result.RowsAffected()
		return changed == 1
	}
	normalized := security.NormalizeRecoveryCode(value)
	if normalized == "" {
		return false
	}
	hash := s.keys.HMAC("mfa-recovery", normalized)
	result, err := s.db.ExecContext(ctx, `UPDATE mfa_recovery_codes SET used_at = ? WHERE user_id = ? AND code_hash = ? AND used_at IS NULL`, now.Format(time.RFC3339Nano), user.ID, hash)
	if err != nil {
		return false
	}
	changed, _ := result.RowsAffected()
	return changed == 1
}

func (s *Service) newSession(ctx context.Context, user User, ip, userAgent string) (LoginResult, error) {
	token, err := randomToken(32)
	if err != nil {
		return LoginResult{}, err
	}
	csrf, err := randomToken(32)
	if err != nil {
		return LoginResult{}, err
	}
	now := s.now().UTC()
	idle := now.Add(s.cfg.IdleTTL)
	absolute := now.Add(s.cfg.AbsoluteTTL)
	id := tokenHash(token)
	_, err = s.db.ExecContext(ctx, `INSERT INTO sessions(id, user_id, csrf_hash, created_at, last_seen_at, idle_expires_at, absolute_expires_at, ip_hash, user_agent_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		id, user.ID, tokenHash(csrf), now.Format(time.RFC3339Nano), now.Format(time.RFC3339Nano), idle.Format(time.RFC3339Nano), absolute.Format(time.RFC3339Nano), s.keys.HMAC("session-ip", ip), s.keys.HMAC("session-ua", userAgent))
	if err != nil {
		return LoginResult{}, err
	}
	return LoginResult{
		Session:     Session{ID: id, User: user, CSRFToken: csrf, CreatedAt: now, IdleExpires: idle, AbsoluteUntil: absolute},
		CookieValue: token + "." + csrf,
	}, nil
}

func (s *Service) Authenticate(ctx context.Context, cookieValue string) (Session, error) {
	parts := strings.Split(cookieValue, ".")
	if len(parts) != 2 || len(parts[0]) < 40 || len(parts[1]) < 40 {
		return Session{}, ErrNoSession
	}
	id := tokenHash(parts[0])
	var session Session
	var csrfHash string
	var createdAt, idleExpires, absoluteExpires string
	var mfaEnabled int
	err := s.db.QueryRowContext(ctx, `SELECT s.id, s.csrf_hash, s.created_at, s.idle_expires_at, s.absolute_expires_at, u.id, u.username, u.display_name, u.email, u.status, u.mfa_enabled FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?`, id).Scan(
		&session.ID, &csrfHash, &createdAt, &idleExpires, &absoluteExpires, &session.User.ID, &session.User.Username, &session.User.DisplayName, &session.User.Email, &session.User.Status, &mfaEnabled)
	if errors.Is(err, sql.ErrNoRows) {
		return Session{}, ErrNoSession
	}
	if err != nil {
		return Session{}, err
	}
	if subtle.ConstantTimeCompare([]byte(csrfHash), []byte(tokenHash(parts[1]))) != 1 || session.User.Status != "active" {
		_ = s.RevokeSession(ctx, id)
		return Session{}, ErrNoSession
	}
	session.User.MFAEnabled = mfaEnabled == 1
	session.CSRFToken = parts[1]
	session.CreatedAt, err = time.Parse(time.RFC3339Nano, createdAt)
	if err != nil {
		return Session{}, ErrNoSession
	}
	session.IdleExpires, err = time.Parse(time.RFC3339Nano, idleExpires)
	if err != nil {
		return Session{}, ErrNoSession
	}
	session.AbsoluteUntil, err = time.Parse(time.RFC3339Nano, absoluteExpires)
	if err != nil {
		return Session{}, ErrNoSession
	}
	now := s.now().UTC()
	if !now.Before(session.IdleExpires) || !now.Before(session.AbsoluteUntil) {
		_ = s.RevokeSession(ctx, id)
		return Session{}, ErrNoSession
	}
	// Limit write amplification: refresh idle expiry at most every five minutes.
	if session.IdleExpires.Sub(now) < s.cfg.IdleTTL-5*time.Minute {
		newIdle := now.Add(s.cfg.IdleTTL)
		if newIdle.After(session.AbsoluteUntil) {
			newIdle = session.AbsoluteUntil
		}
		_, _ = s.db.ExecContext(ctx, `UPDATE sessions SET last_seen_at = ?, idle_expires_at = ? WHERE id = ?`, now.Format(time.RFC3339Nano), newIdle.Format(time.RFC3339Nano), id)
		session.IdleExpires = newIdle
	}
	return session, nil
}

func (s *Service) VerifyCSRF(session Session, supplied string) bool {
	return supplied != "" && subtle.ConstantTimeCompare([]byte(session.CSRFToken), []byte(supplied)) == 1
}

func (s *Service) RevokeSession(ctx context.Context, id string) error {
	_, err := s.db.ExecContext(ctx, `DELETE FROM sessions WHERE id = ?`, id)
	return err
}

func (s *Service) RevokeUserSessions(ctx context.Context, userID int64, except string) error {
	_, err := s.db.ExecContext(ctx, `DELETE FROM sessions WHERE user_id = ? AND id <> ?`, userID, except)
	return err
}

func (s *Service) UnlockUser(ctx context.Context, userID int64) error {
	result, err := s.db.ExecContext(ctx, `UPDATE users SET failed_login_count = 0, locked_until = NULL, updated_at = ? WHERE id = ?`, s.now().UTC().Format(time.RFC3339Nano), userID)
	if err != nil {
		return err
	}
	changed, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if changed != 1 {
		return errors.New("用户不存在")
	}
	return nil
}

func (s *Service) VerifyStepUp(ctx context.Context, session Session, password, secondFactor string) error {
	user, found, err := s.findUser(ctx, session.User.Username)
	if err != nil || !found || user.ID != session.User.ID || user.Status != "active" {
		return ErrInvalidCredentials
	}
	passwordOK, err := security.VerifyPassword(user.PasswordHash, password)
	if err != nil || !passwordOK {
		return ErrInvalidCredentials
	}
	if user.MFAEnabled && !s.verifySecondFactor(ctx, &user, secondFactor, s.now().UTC()) {
		return ErrInvalidCredentials
	}
	return nil
}

func (s *Service) DisableMFA(ctx context.Context, session Session, password, code string) error {
	user, found, err := s.findUser(ctx, session.User.Username)
	if err != nil || !found || user.ID != session.User.ID || !user.MFAEnabled {
		return ErrInvalidCredentials
	}
	passwordOK, err := security.VerifyPassword(user.PasswordHash, password)
	if err != nil || !passwordOK {
		return ErrInvalidCredentials
	}
	secret, err := s.keys.Decrypt("mfa-secret", user.MFASecret)
	if err != nil {
		return ErrInvalidCredentials
	}
	counter, valid := security.ValidateTOTP(string(secret), code, s.now().UTC(), user.MFALastCounter)
	if !valid {
		return ErrInvalidCredentials
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	result, err := tx.ExecContext(ctx, `UPDATE users SET mfa_secret = NULL, mfa_enabled = 0, mfa_last_counter = 0, updated_at = ? WHERE id = ? AND mfa_last_counter < ?`, s.now().UTC().Format(time.RFC3339Nano), user.ID, counter)
	if err != nil {
		return err
	}
	changed, _ := result.RowsAffected()
	if changed != 1 {
		return ErrInvalidCredentials
	}
	if _, err = tx.ExecContext(ctx, `DELETE FROM mfa_recovery_codes WHERE user_id = ?`, user.ID); err != nil {
		return err
	}
	if _, err = tx.ExecContext(ctx, `DELETE FROM mfa_enrollments WHERE session_id IN (SELECT id FROM sessions WHERE user_id = ?)`, user.ID); err != nil {
		return err
	}
	if _, err = tx.ExecContext(ctx, `DELETE FROM sessions WHERE user_id = ? AND id <> ?`, user.ID, session.ID); err != nil {
		return err
	}
	return tx.Commit()
}

func (s *Service) BeginMFA(ctx context.Context, session Session) (MFAEnrollment, error) {
	key, err := security.NewTOTP("CZCMS", session.User.Username)
	if err != nil {
		return MFAEnrollment{}, err
	}
	encrypted, err := s.keys.Encrypt("mfa-enrollment", []byte(key.Secret()))
	if err != nil {
		return MFAEnrollment{}, err
	}
	now := s.now().UTC()
	_, err = s.db.ExecContext(ctx, `INSERT INTO mfa_enrollments(session_id, secret_encrypted, created_at, expires_at) VALUES (?, ?, ?, ?)
		ON CONFLICT(session_id) DO UPDATE SET secret_encrypted = excluded.secret_encrypted, created_at = excluded.created_at, expires_at = excluded.expires_at`,
		session.ID, encrypted, now.Format(time.RFC3339Nano), now.Add(10*time.Minute).Format(time.RFC3339Nano))
	if err != nil {
		return MFAEnrollment{}, err
	}
	return MFAEnrollment{Secret: key.Secret(), URL: key.URL()}, nil
}

func (s *Service) CompleteMFA(ctx context.Context, session Session, code string) ([]string, error) {
	var encrypted []byte
	var expiresAt string
	err := s.db.QueryRowContext(ctx, `SELECT secret_encrypted, expires_at FROM mfa_enrollments WHERE session_id = ?`, session.ID).Scan(&encrypted, &expiresAt)
	if err != nil {
		return nil, ErrInvalidCredentials
	}
	expires, err := time.Parse(time.RFC3339Nano, expiresAt)
	if err != nil || !s.now().UTC().Before(expires) {
		return nil, ErrInvalidCredentials
	}
	secret, err := s.keys.Decrypt("mfa-enrollment", encrypted)
	if err != nil {
		return nil, err
	}
	counter, valid := security.ValidateTOTP(string(secret), code, s.now().UTC(), 0)
	if !valid {
		return nil, ErrInvalidCredentials
	}
	storedSecret, err := s.keys.Encrypt("mfa-secret", secret)
	if err != nil {
		return nil, err
	}
	codes, err := security.GenerateRecoveryCodes(10)
	if err != nil {
		return nil, err
	}
	now := s.now().UTC().Format(time.RFC3339Nano)
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()
	if _, err = tx.ExecContext(ctx, `UPDATE users SET mfa_secret = ?, mfa_enabled = 1, mfa_last_counter = ?, updated_at = ? WHERE id = ?`, storedSecret, counter, now, session.User.ID); err != nil {
		return nil, err
	}
	if _, err = tx.ExecContext(ctx, `DELETE FROM mfa_recovery_codes WHERE user_id = ?`, session.User.ID); err != nil {
		return nil, err
	}
	for _, recoveryCode := range codes {
		hash := s.keys.HMAC("mfa-recovery", security.NormalizeRecoveryCode(recoveryCode))
		if _, err = tx.ExecContext(ctx, `INSERT INTO mfa_recovery_codes(user_id, code_hash, created_at) VALUES (?, ?, ?)`, session.User.ID, hash, now); err != nil {
			return nil, err
		}
	}
	if _, err = tx.ExecContext(ctx, `DELETE FROM mfa_enrollments WHERE session_id = ?`, session.ID); err != nil {
		return nil, err
	}
	if _, err = tx.ExecContext(ctx, `DELETE FROM sessions WHERE user_id = ? AND id <> ?`, session.User.ID, session.ID); err != nil {
		return nil, err
	}
	if err = tx.Commit(); err != nil {
		return nil, err
	}
	return codes, nil
}

func randomToken(bytes int) (string, error) {
	raw := make([]byte, bytes)
	if _, err := rand.Read(raw); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(raw), nil
}

func tokenHash(value string) string {
	hash := sha256.Sum256([]byte(value))
	return base64.RawURLEncoding.EncodeToString(hash[:])
}
