package audit

import (
	"context"
	"path/filepath"
	"testing"

	"czcms/internal/database"
)

func TestAuditIsAppendOnlyAndRedactsSecrets(t *testing.T) {
	ctx := context.Background()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "audit.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	service := New(db)
	const sessionID = "raw-session-credential-must-never-leave-the-database"
	if err = service.Append(ctx, Event{Action: "security.test", TargetType: "session", TargetID: sessionID, Success: true, Metadata: map[string]any{"password": "secret", "safe": "value"}}); err != nil {
		t.Fatal(err)
	}
	records, err := service.List(ctx, 10, 0)
	if err != nil || len(records) != 1 {
		t.Fatalf("records=%d err=%v", len(records), err)
	}
	if records[0].Metadata["password"] != "[REDACTED]" || records[0].Metadata["safe"] != "value" {
		t.Fatalf("metadata=%v", records[0].Metadata)
	}
	if records[0].TargetID == sessionID || len(records[0].TargetID) < 7 || records[0].TargetID[:7] != "sha256:" {
		t.Fatalf("session audit target was not fingerprinted: %q", records[0].TargetID)
	}
	var storedTarget string
	if err = db.QueryRowContext(ctx, `SELECT target_id FROM audit_logs WHERE id = ?`, records[0].ID).Scan(&storedTarget); err != nil {
		t.Fatal(err)
	}
	if storedTarget == sessionID {
		t.Fatal("raw session credential was stored in audit log")
	}
	if _, err = db.ExecContext(ctx, `UPDATE audit_logs SET action = 'tampered' WHERE id = ?`, records[0].ID); err == nil {
		t.Fatal("audit update was allowed")
	}
	if _, err = db.ExecContext(ctx, `DELETE FROM audit_logs WHERE id = ?`, records[0].ID); err == nil {
		t.Fatal("audit delete was allowed")
	}
}
