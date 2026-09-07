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

func TestAuditListPagePaginatesAndFiltersCalendarDates(t *testing.T) {
	ctx := context.Background()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "audit-page.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	rows := []struct {
		action, target, created string
		success                 int
	}{
		{"security.login_failed", "session", "2026-09-03T10:00:00Z", 0},
		{"content.updated", "content", "2026-09-02T10:00:00Z", 1},
		{"content.updated", "content", "2026-09-01T10:00:00Z", 1},
	}
	for _, row := range rows {
		if _, err = db.ExecContext(ctx, `INSERT INTO audit_logs(action, target_type, target_id, request_id, ip_address, user_agent, success, metadata_json, created_at) VALUES (?, ?, '', '', '', '', ?, '{}', ?)`, row.action, row.target, row.success, row.created); err != nil {
			t.Fatal(err)
		}
	}
	page, err := New(db).ListPage(ctx, ListOptions{Limit: 2, Offset: 0, FromDate: "2026-09-01", ToDate: "2026-09-02"})
	if err != nil {
		t.Fatal(err)
	}
	if page.Total != 2 || len(page.Records) != 2 || page.SuccessTotal != 2 || page.FailureTotal != 0 {
		t.Fatalf("unexpected date-filtered page: %+v", page)
	}
	if page.Records[0].CreatedAt != "2026-09-02T10:00:00Z" || page.Records[1].CreatedAt != "2026-09-01T10:00:00Z" {
		t.Fatalf("records are not ordered newest first: %+v", page.Records)
	}
	page, err = New(db).ListPage(ctx, ListOptions{Limit: 1, Offset: 1, Category: "security"})
	if err != nil {
		t.Fatal(err)
	}
	if page.Total != 1 || len(page.Records) != 0 || page.Offset != 1 {
		t.Fatalf("unexpected security page: %+v", page)
	}
}

func TestAuditDateMidnightBoundaries(t *testing.T) {
	ctx := context.Background()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "boundaries.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	for _, stamp := range []string{"2026-08-31T23:59:59.999999999Z", "2026-09-01T00:00:00Z", "2026-09-01T00:00:00.123Z", "2026-09-01T23:59:59.999999999Z", "2026-09-02T00:00:00Z", "2026-09-02T00:00:00.123Z"} {
		_, err = db.ExecContext(ctx, `INSERT INTO audit_logs(action, target_type, target_id, request_id, ip_address, user_agent, success, metadata_json, created_at) VALUES ('test', '', '', '', '', '', 1, '{}', ?)`, stamp)
		if err != nil {
			t.Fatal(err)
		}
	}
	page, err := New(db).ListPage(ctx, ListOptions{Limit: 2, FromDate: "2026-09-01", ToDate: "2026-09-01"})
	if err != nil || page.Total != 3 || len(page.Records) != 2 || !page.HasNext || page.HasPrevious {
		t.Fatalf("page=%+v err=%v", page, err)
	}
	next, err := New(db).ListPage(ctx, ListOptions{Limit: 2, Offset: 2, FromDate: "2026-09-01", ToDate: "2026-09-01"})
	if err != nil || len(next.Records) != 1 || next.HasNext || !next.HasPrevious {
		t.Fatalf("next=%+v err=%v", next, err)
	}
	for _, opts := range []ListOptions{{FromDate: "invalid"}, {FromDate: "2026-09-02", ToDate: "2026-09-01"}} {
		if _, err := New(db).ListPage(ctx, opts); err == nil {
			t.Fatal("expected invalid date error")
		}
	}
}
