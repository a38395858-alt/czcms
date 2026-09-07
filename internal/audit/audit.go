package audit

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

type Service struct {
	db *sql.DB
}

type Event struct {
	ActorUserID *int64
	Action      string
	TargetType  string
	TargetID    string
	RequestID   string
	IPAddress   string
	UserAgent   string
	Success     bool
	Metadata    map[string]any
}

type Record struct {
	ID          int64          `json:"id"`
	ActorUserID *int64         `json:"actor_user_id,omitempty"`
	ActorName   string         `json:"actor_name"`
	Action      string         `json:"action"`
	TargetType  string         `json:"target_type"`
	TargetID    string         `json:"target_id"`
	RequestID   string         `json:"request_id"`
	IPAddress   string         `json:"ip_address"`
	Success     bool           `json:"success"`
	Metadata    map[string]any `json:"metadata"`
	CreatedAt   string         `json:"created_at"`
}

// ListOptions describes a bounded, server-side audit query. Dates are
// inclusive calendar dates in YYYY-MM-DD format; the end date is converted to
// the following day so records created at any time on that date are included.
type ListOptions struct {
	Limit    int
	Offset   int
	FromDate string
	ToDate   string
	Status   string // all, success or failure
	Category string // all or security
	Query    string
}

type Page struct {
	Records      []Record `json:"records"`
	Total        int64    `json:"total"`
	Limit        int      `json:"limit"`
	Offset       int      `json:"offset"`
	SuccessTotal int64    `json:"success_total"`
	FailureTotal int64    `json:"failure_total"`
	HasNext      bool     `json:"has_next"`
	HasPrevious  bool     `json:"has_previous"`
}

func New(db *sql.DB) *Service { return &Service{db: db} }

func (s *Service) Append(ctx context.Context, event Event) error {
	if event.Action == "" || len(event.Action) > 100 {
		return fmt.Errorf("invalid audit action")
	}
	metadata := redact(event.Metadata)
	encoded, err := json.Marshal(metadata)
	if err != nil {
		return fmt.Errorf("encode audit metadata: %w", err)
	}
	if len(encoded) > 16*1024 {
		return fmt.Errorf("audit metadata exceeds 16 KiB")
	}
	success := 0
	if event.Success {
		success = 1
	}
	targetType := truncate(event.TargetType, 100)
	targetID := safeTargetID(targetType, event.TargetID)
	_, err = s.db.ExecContext(ctx, `INSERT INTO audit_logs(actor_user_id, action, target_type, target_id, request_id, ip_address, user_agent, success, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		event.ActorUserID, event.Action, targetType, truncate(targetID, 200), truncate(event.RequestID, 100), truncate(event.IPAddress, 100), truncate(event.UserAgent, 500), success, string(encoded), time.Now().UTC().Format(time.RFC3339Nano))
	return err
}

func (s *Service) List(ctx context.Context, limit int, beforeID int64) ([]Record, error) {
	if limit < 1 || limit > 200 {
		limit = 50
	}
	if beforeID <= 0 {
		beforeID = 1<<63 - 1
	}
	rows, err := s.db.QueryContext(ctx, `SELECT a.id, a.actor_user_id, COALESCE(u.display_name, u.username, ''), a.action, a.target_type, a.target_id, a.request_id, a.ip_address, a.success, a.metadata_json, a.created_at
		FROM audit_logs a LEFT JOIN users u ON u.id = a.actor_user_id WHERE a.id < ? ORDER BY a.id DESC LIMIT ?`, beforeID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var records []Record
	for rows.Next() {
		var record Record
		var actor sql.NullInt64
		var success int
		var metadata string
		if err = rows.Scan(&record.ID, &actor, &record.ActorName, &record.Action, &record.TargetType, &record.TargetID, &record.RequestID, &record.IPAddress, &success, &metadata, &record.CreatedAt); err != nil {
			return nil, err
		}
		if actor.Valid {
			record.ActorUserID = &actor.Int64
		}
		// Older installations stored the opaque session credential as target_id.
		// Never return it to the admin UI; fingerprint it on read as well as on
		// write so immutable historical rows stay protected.
		record.TargetID = safeTargetID(record.TargetType, record.TargetID)
		record.Success = success == 1
		_ = json.Unmarshal([]byte(metadata), &record.Metadata)
		records = append(records, record)
	}
	return records, rows.Err()
}

// ListPage returns a deterministic page and aggregate counts for the current
// filter set. It deliberately keeps the legacy List method above for callers
// that still use keyset pagination.
func (s *Service) ListPage(ctx context.Context, options ListOptions) (Page, error) {
	options.Limit = normalizeLimit(options.Limit)
	if options.Offset < 0 {
		options.Offset = 0
	}
	from, to, err := normalizeDateBounds(options.FromDate, options.ToDate)
	if err != nil {
		return Page{}, err
	}
	status := strings.ToLower(strings.TrimSpace(options.Status))
	if status != "" && status != "all" && status != "success" && status != "failure" {
		return Page{}, fmt.Errorf("invalid audit status")
	}
	category := strings.ToLower(strings.TrimSpace(options.Category))
	if category != "" && category != "all" && category != "security" {
		return Page{}, fmt.Errorf("invalid audit category")
	}
	query := strings.TrimSpace(options.Query)
	if characters := []rune(query); len(characters) > 120 {
		query = string(characters[:120])
	}
	where, args := auditWhere(from, to, status, category, query)
	var page Page
	page.Limit, page.Offset = options.Limit, options.Offset
	countArgs := append([]any{}, args...)
	if err = s.db.QueryRowContext(ctx, `SELECT COUNT(*), COALESCE(SUM(CASE WHEN a.success = 1 THEN 1 ELSE 0 END), 0), COALESCE(SUM(CASE WHEN a.success = 0 THEN 1 ELSE 0 END), 0)
		FROM audit_logs a LEFT JOIN users u ON u.id = a.actor_user_id `+where, countArgs...).Scan(&page.Total, &page.SuccessTotal, &page.FailureTotal); err != nil {
		return Page{}, err
	}
	rows, err := s.db.QueryContext(ctx, `SELECT a.id, a.actor_user_id, COALESCE(u.display_name, u.username, ''), a.action, a.target_type, a.target_id, a.request_id, a.ip_address, a.success, a.metadata_json, a.created_at
		FROM audit_logs a LEFT JOIN users u ON u.id = a.actor_user_id `+where+` ORDER BY a.created_at DESC, a.id DESC LIMIT ? OFFSET ?`, append(args, page.Limit, page.Offset)...)
	if err != nil {
		return Page{}, err
	}
	defer rows.Close()
	page.Records, err = scanRecords(rows)
	if err != nil {
		return Page{}, err
	}
	page.HasPrevious = page.Offset > 0
	page.HasNext = int64(page.Offset+len(page.Records)) < page.Total
	return page, rows.Err()
}

func normalizeLimit(limit int) int {
	if limit < 1 || limit > 100 {
		return 20
	}
	return limit
}

func normalizeDateBounds(fromDate, toDate string) (string, string, error) {
	// Stored timestamps are UTC RFC3339Nano. A second-prefix boundary sorts
	// before both the exact second (Z) and its fractional values (.123Z).
	// This keeps midnight inclusive without rounding subsecond timestamps.
	fromDate = strings.TrimSpace(fromDate)
	toDate = strings.TrimSpace(toDate)
	var from, to string
	if fromDate != "" {
		parsed, err := time.Parse("2006-01-02", fromDate)
		if err != nil {
			return "", "", fmt.Errorf("invalid audit start date")
		}
		from = parsed.UTC().Format("2006-01-02T15:04:05")
	}
	if toDate != "" {
		parsed, err := time.Parse("2006-01-02", toDate)
		if err != nil {
			return "", "", fmt.Errorf("invalid audit end date")
		}
		if fromDate != "" {
			fromParsed, _ := time.Parse("2006-01-02", fromDate)
			if parsed.Before(fromParsed) {
				return "", "", fmt.Errorf("audit end date before start date")
			}
		}
		to = parsed.AddDate(0, 0, 1).UTC().Format("2006-01-02T15:04:05")
	}
	return from, to, nil
}

func auditWhere(from, to, status, category, query string) (string, []any) {
	clauses := []string{"1 = 1"}
	args := make([]any, 0, 10)
	if from != "" {
		clauses = append(clauses, "a.created_at >= ?")
		args = append(args, from)
	}
	if to != "" {
		clauses = append(clauses, "a.created_at < ?")
		args = append(args, to)
	}
	if status == "success" {
		clauses = append(clauses, "a.success = 1")
	} else if status == "failure" {
		clauses = append(clauses, "a.success = 0")
	}
	if category == "security" {
		clauses = append(clauses, "a.action LIKE 'security.%'")
	}
	if query != "" {
		pattern := "%" + query + "%"
		clauses = append(clauses, "(a.action LIKE ? OR a.target_type LIKE ? OR a.target_id LIKE ? OR a.request_id LIKE ? OR a.ip_address LIKE ? OR COALESCE(u.display_name, u.username, '') LIKE ?)")
		for i := 0; i < 6; i++ {
			args = append(args, pattern)
		}
	}
	return "WHERE " + strings.Join(clauses, " AND "), args
}

func scanRecords(rows *sql.Rows) ([]Record, error) {
	var records []Record
	for rows.Next() {
		var record Record
		var actor sql.NullInt64
		var success int
		var metadata string
		if err := rows.Scan(&record.ID, &actor, &record.ActorName, &record.Action, &record.TargetType, &record.TargetID, &record.RequestID, &record.IPAddress, &success, &metadata, &record.CreatedAt); err != nil {
			return nil, err
		}
		if actor.Valid {
			record.ActorUserID = &actor.Int64
		}
		record.TargetID = safeTargetID(record.TargetType, record.TargetID)
		record.Success = success == 1
		_ = json.Unmarshal([]byte(metadata), &record.Metadata)
		records = append(records, record)
	}
	return records, nil
}

func safeTargetID(targetType, targetID string) string {
	if !strings.EqualFold(strings.TrimSpace(targetType), "session") || targetID == "" || strings.HasPrefix(targetID, "sha256:") {
		return targetID
	}
	sum := sha256.Sum256([]byte(targetID))
	return "sha256:" + hex.EncodeToString(sum[:8])
}

func redact(input map[string]any) map[string]any {
	result := make(map[string]any, len(input))
	for key, value := range input {
		lower := strings.ToLower(key)
		if strings.Contains(lower, "password") || strings.Contains(lower, "secret") || strings.Contains(lower, "token") || strings.Contains(lower, "cookie") || strings.Contains(lower, "authorization") {
			result[key] = "[REDACTED]"
			continue
		}
		result[key] = value
	}
	return result
}

func truncate(value string, maximum int) string {
	if len(value) > maximum {
		return value[:maximum]
	}
	return value
}
