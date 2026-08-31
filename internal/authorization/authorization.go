package authorization

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"czcms/internal/security"
)

var ErrForbidden = errors.New("forbidden")

type Service struct {
	db *sql.DB
}

type Scope struct {
	SiteID int64  `json:"site_id"`
	Locale string `json:"locale"`
}

type AccessUpdate struct {
	Roles            []string `json:"roles"`
	Scopes           []Scope  `json:"scopes"`
	OperatorPassword string   `json:"operator_password"`
	OperatorMFA      string   `json:"operator_mfa"`
}

type CreateUserRequest struct {
	Username         string   `json:"username"`
	DisplayName      string   `json:"display_name"`
	Email            string   `json:"email"`
	Password         string   `json:"password"`
	Roles            []string `json:"roles"`
	Scopes           []Scope  `json:"scopes"`
	OperatorPassword string   `json:"operator_password"`
	OperatorMFA      string   `json:"operator_mfa"`
}

type UserSummary struct {
	ID          int64    `json:"id"`
	Username    string   `json:"username"`
	DisplayName string   `json:"display_name"`
	Email       string   `json:"email"`
	Status      string   `json:"status"`
	MFAEnabled  bool     `json:"mfa_enabled"`
	LastLoginAt string   `json:"last_login_at,omitempty"`
	Roles       []string `json:"roles"`
	Scopes      []Scope  `json:"scopes"`
}

type RoleSummary struct {
	Code        string   `json:"code"`
	Name        string   `json:"name"`
	Permissions []string `json:"permissions"`
}

var usernamePattern = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9._-]{2,63}$`)

func New(db *sql.DB) *Service { return &Service{db: db} }

func (s *Service) Can(ctx context.Context, userID int64, permission string) (bool, error) {
	var allowed int
	err := s.db.QueryRowContext(ctx, `SELECT EXISTS(
		SELECT 1 FROM user_roles ur
		JOIN role_permissions rp ON rp.role_id = ur.role_id
		WHERE ur.user_id = ? AND rp.permission_code = ?
	)`, userID, permission).Scan(&allowed)
	return allowed == 1, err
}

func (s *Service) Require(ctx context.Context, userID int64, permission string) error {
	allowed, err := s.Can(ctx, userID, permission)
	if err != nil {
		return err
	}
	if !allowed {
		return ErrForbidden
	}
	return nil
}

// CanAccess combines action permission with site/locale data scope. A zero site
// or "*" locale in user_access_scopes is a wildcard.
func (s *Service) CanAccess(ctx context.Context, userID int64, permission string, siteID int64, locale string) (bool, error) {
	allowed, err := s.Can(ctx, userID, permission)
	if err != nil || !allowed {
		return false, err
	}
	var scoped int
	err = s.db.QueryRowContext(ctx, `SELECT EXISTS(
		SELECT 1 FROM user_access_scopes
		WHERE user_id = ? AND (site_id = 0 OR site_id = ?) AND (locale = '*' OR locale = ?)
	)`, userID, siteID, locale).Scan(&scoped)
	return scoped == 1, err
}

func (s *Service) Permissions(ctx context.Context, userID int64) ([]string, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT DISTINCT rp.permission_code FROM user_roles ur JOIN role_permissions rp ON rp.role_id = ur.role_id WHERE ur.user_id = ? ORDER BY rp.permission_code`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []string
	for rows.Next() {
		var code string
		if err = rows.Scan(&code); err != nil {
			return nil, err
		}
		result = append(result, code)
	}
	return result, rows.Err()
}

func (s *Service) Scopes(ctx context.Context, userID int64) ([]Scope, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT site_id, locale FROM user_access_scopes WHERE user_id = ? ORDER BY site_id, locale`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []Scope
	for rows.Next() {
		var scope Scope
		if err = rows.Scan(&scope.SiteID, &scope.Locale); err != nil {
			return nil, err
		}
		result = append(result, scope)
	}
	return result, rows.Err()
}

func (s *Service) IsOwner(ctx context.Context, userID int64) (bool, error) {
	var owner int
	err := s.db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = ? AND r.code = 'owner')`, userID).Scan(&owner)
	return owner == 1, err
}

func (s *Service) UpdateAccess(ctx context.Context, targetUserID int64, update AccessUpdate, allowOwner bool) error {
	if len(update.Roles) == 0 || len(update.Roles) > 20 || len(update.Scopes) == 0 || len(update.Scopes) > 500 {
		return errors.New("角色或数据范围数量无效")
	}
	requestedOwner := false
	seenRoles := map[string]bool{}
	for _, role := range update.Roles {
		if role == "" || seenRoles[role] {
			return errors.New("角色代码无效或重复")
		}
		seenRoles[role] = true
		requestedOwner = requestedOwner || role == "owner"
	}
	if requestedOwner && !allowOwner {
		return ErrForbidden
	}
	seenScopes := map[Scope]bool{}
	for _, scope := range update.Scopes {
		if scope.SiteID < 0 || scope.Locale == "" || len(scope.Locale) > 35 || seenScopes[scope] {
			return errors.New("站点或语言范围无效或重复")
		}
		seenScopes[scope] = true
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	var existingOwner int
	if err = tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = ? AND r.code = 'owner')`, targetUserID).Scan(&existingOwner); err != nil {
		return err
	}
	if existingOwner == 1 && !requestedOwner {
		var ownerCount int
		if err = tx.QueryRowContext(ctx, `SELECT COUNT(DISTINCT ur.user_id) FROM user_roles ur JOIN roles r ON r.id = ur.role_id JOIN users u ON u.id = ur.user_id WHERE r.code = 'owner' AND u.status = 'active'`).Scan(&ownerCount); err != nil {
			return err
		}
		if ownerCount <= 1 {
			return errors.New("不能移除最后一个有效系统所有者")
		}
	}
	var validRoles int
	placeholders := ""
	args := make([]any, 0, len(update.Roles))
	for index, role := range update.Roles {
		if index > 0 {
			placeholders += ","
		}
		placeholders += "?"
		args = append(args, role)
	}
	if err = tx.QueryRowContext(ctx, `SELECT COUNT(*) FROM roles WHERE code IN (`+placeholders+`)`, args...).Scan(&validRoles); err != nil || validRoles != len(update.Roles) {
		return errors.New("包含不存在的角色")
	}
	if _, err = tx.ExecContext(ctx, `DELETE FROM user_roles WHERE user_id = ?`, targetUserID); err != nil {
		return err
	}
	for _, role := range update.Roles {
		if _, err = tx.ExecContext(ctx, `INSERT INTO user_roles(user_id, role_id) SELECT ?, id FROM roles WHERE code = ?`, targetUserID, role); err != nil {
			return err
		}
	}
	if _, err = tx.ExecContext(ctx, `DELETE FROM user_access_scopes WHERE user_id = ?`, targetUserID); err != nil {
		return err
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	for _, scope := range update.Scopes {
		if scope.SiteID > 0 {
			var siteExists int
			if err = tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM sites WHERE id = ?)`, scope.SiteID).Scan(&siteExists); err != nil || siteExists != 1 {
				return errors.New("数据范围包含不存在的站点")
			}
		}
		if scope.Locale != "*" {
			var localeExists int
			if err = tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM languages WHERE default_locale = ? OR code = ?)`, scope.Locale, scope.Locale).Scan(&localeExists); err != nil || localeExists != 1 {
				return errors.New("数据范围包含不存在的语言")
			}
		}
		if _, err = tx.ExecContext(ctx, `INSERT INTO user_access_scopes(user_id, site_id, locale, created_at) VALUES (?, ?, ?, ?)`, targetUserID, scope.SiteID, scope.Locale, now); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (s *Service) CreateUser(ctx context.Context, request CreateUserRequest, allowOwner bool) (UserSummary, error) {
	request.Username = strings.TrimSpace(request.Username)
	request.DisplayName = strings.TrimSpace(request.DisplayName)
	request.Email = strings.TrimSpace(request.Email)
	if !usernamePattern.MatchString(request.Username) || request.DisplayName == "" || len(request.DisplayName) > 100 || len(request.Email) > 254 {
		return UserSummary{}, errors.New("用户资料格式无效")
	}
	if err := security.ValidatePassword(request.Password); err != nil {
		return UserSummary{}, err
	}
	passwordHash, err := security.HashPassword(request.Password)
	if err != nil {
		return UserSummary{}, err
	}
	// Validate access on a rollback-only temporary user is unnecessary; perform
	// all checks and writes in one transaction below to avoid orphan users.
	if len(request.Roles) == 0 || len(request.Roles) > 20 || len(request.Scopes) == 0 || len(request.Scopes) > 500 {
		return UserSummary{}, errors.New("角色或数据范围数量无效")
	}
	seenRoles := map[string]bool{}
	for _, role := range request.Roles {
		if role == "" || seenRoles[role] || (role == "owner" && !allowOwner) {
			return UserSummary{}, ErrForbidden
		}
		seenRoles[role] = true
	}
	seenScopes := map[Scope]bool{}
	for _, scope := range request.Scopes {
		if scope.SiteID < 0 || scope.Locale == "" || len(scope.Locale) > 35 || seenScopes[scope] {
			return UserSummary{}, errors.New("站点或语言范围无效或重复")
		}
		seenScopes[scope] = true
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return UserSummary{}, err
	}
	defer tx.Rollback()
	placeholders := strings.TrimSuffix(strings.Repeat("?,", len(request.Roles)), ",")
	args := make([]any, len(request.Roles))
	for index, role := range request.Roles {
		args[index] = role
	}
	var validRoles int
	if err = tx.QueryRowContext(ctx, `SELECT COUNT(*) FROM roles WHERE code IN (`+placeholders+`)`, args...).Scan(&validRoles); err != nil || validRoles != len(request.Roles) {
		return UserSummary{}, errors.New("包含不存在的角色")
	}
	for _, scope := range request.Scopes {
		if err = validateScope(ctx, tx, scope); err != nil {
			return UserSummary{}, err
		}
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := tx.ExecContext(ctx, `INSERT INTO users(username, display_name, email, password_hash, password_changed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`, request.Username, request.DisplayName, request.Email, passwordHash, now, now, now)
	if err != nil {
		return UserSummary{}, fmt.Errorf("创建用户失败；用户名可能已存在")
	}
	userID, err := result.LastInsertId()
	if err != nil {
		return UserSummary{}, err
	}
	for _, role := range request.Roles {
		if _, err = tx.ExecContext(ctx, `INSERT INTO user_roles(user_id, role_id) SELECT ?, id FROM roles WHERE code = ?`, userID, role); err != nil {
			return UserSummary{}, err
		}
	}
	for _, scope := range request.Scopes {
		if _, err = tx.ExecContext(ctx, `INSERT INTO user_access_scopes(user_id, site_id, locale, created_at) VALUES (?, ?, ?, ?)`, userID, scope.SiteID, scope.Locale, now); err != nil {
			return UserSummary{}, err
		}
	}
	if err = tx.Commit(); err != nil {
		return UserSummary{}, err
	}
	return UserSummary{ID: userID, Username: request.Username, DisplayName: request.DisplayName, Email: request.Email, Status: "active", Roles: request.Roles, Scopes: request.Scopes}, nil
}

func validateScope(ctx context.Context, tx *sql.Tx, scope Scope) error {
	if scope.SiteID > 0 {
		var exists int
		if err := tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM sites WHERE id = ?)`, scope.SiteID).Scan(&exists); err != nil || exists != 1 {
			return errors.New("数据范围包含不存在的站点")
		}
	}
	if scope.Locale != "*" {
		var exists int
		if err := tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM languages WHERE default_locale = ? OR code = ?)`, scope.Locale, scope.Locale).Scan(&exists); err != nil || exists != 1 {
			return errors.New("数据范围包含不存在的语言")
		}
	}
	return nil
}

func (s *Service) ListUsers(ctx context.Context) ([]UserSummary, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT id, username, display_name, email, status, mfa_enabled, last_login_at FROM users ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var users []UserSummary
	for rows.Next() {
		var user UserSummary
		var mfa int
		var lastLogin sql.NullString
		if err = rows.Scan(&user.ID, &user.Username, &user.DisplayName, &user.Email, &user.Status, &mfa, &lastLogin); err != nil {
			return nil, err
		}
		user.MFAEnabled = mfa == 1
		if lastLogin.Valid {
			user.LastLoginAt = lastLogin.String
		}
		roleRows, roleErr := s.db.QueryContext(ctx, `SELECT r.code FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = ? ORDER BY r.code`, user.ID)
		if roleErr != nil {
			return nil, roleErr
		}
		for roleRows.Next() {
			var role string
			if err = roleRows.Scan(&role); err != nil {
				roleRows.Close()
				return nil, err
			}
			user.Roles = append(user.Roles, role)
		}
		roleRows.Close()
		user.Scopes, err = s.Scopes(ctx, user.ID)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, rows.Err()
}

func (s *Service) ListRoles(ctx context.Context) ([]RoleSummary, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT code, name_zh FROM roles ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var roles []RoleSummary
	for rows.Next() {
		var role RoleSummary
		if err = rows.Scan(&role.Code, &role.Name); err != nil {
			return nil, err
		}
		permissionRows, permissionErr := s.db.QueryContext(ctx, `SELECT rp.permission_code FROM role_permissions rp JOIN roles r ON r.id = rp.role_id WHERE r.code = ? ORDER BY rp.permission_code`, role.Code)
		if permissionErr != nil {
			return nil, permissionErr
		}
		for permissionRows.Next() {
			var code string
			if err = permissionRows.Scan(&code); err != nil {
				permissionRows.Close()
				return nil, err
			}
			role.Permissions = append(role.Permissions, code)
		}
		permissionRows.Close()
		roles = append(roles, role)
	}
	return roles, rows.Err()
}
