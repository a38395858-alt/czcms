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
