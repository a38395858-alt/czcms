package database

import (
	"context"
	"database/sql"
	"time"
)

func migrateSMTPV38(ctx context.Context, tx *sql.Tx) error {
	for _, statement := range []string{
		`CREATE TABLE smtp_settings (
			id INTEGER PRIMARY KEY CHECK (id = 1),
			enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0,1)),
			host TEXT NOT NULL DEFAULT 'smtp.qq.com', port INTEGER NOT NULL DEFAULT 465,
			security TEXT NOT NULL DEFAULT 'tls' CHECK (security IN ('tls','starttls')),
			username TEXT NOT NULL DEFAULT '38395858@qq.com', password_encrypted BLOB,
			from_email TEXT NOT NULL DEFAULT '38395858@qq.com', from_name TEXT NOT NULL DEFAULT 'CZCMS 表单通知',
			recipient TEXT NOT NULL DEFAULT '38395858@qq.com',
			last_test_status TEXT NOT NULL DEFAULT 'untested', last_test_message TEXT NOT NULL DEFAULT '',
			last_tested_at TEXT NOT NULL DEFAULT '', version INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL
		)`,
		`CREATE TABLE mail_deliveries (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			submission_id INTEGER NOT NULL UNIQUE REFERENCES form_submissions(id) ON DELETE CASCADE,
			recipient TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','sent','failed')),
			attempts INTEGER NOT NULL DEFAULT 0, next_attempt_at TEXT NOT NULL,
			lease_token TEXT NOT NULL DEFAULT '', lease_until TEXT NOT NULL DEFAULT '',
			last_error TEXT NOT NULL DEFAULT '', sent_at TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL, updated_at TEXT NOT NULL
		)`,
		`CREATE INDEX idx_mail_deliveries_pending ON mail_deliveries(status, next_attempt_at, lease_until)`,
		// Built-in forms previously had notifications disabled because no mail
		// transport existed. Enable them once; later administrator choices persist.
		`UPDATE forms SET notify_enabled=1 WHERE form_key IN ('topic-enquiry','home-enquiry','newsletter')`,
	} {
		if _, err := tx.ExecContext(ctx, statement); err != nil {
			return err
		}
	}
	_, err := tx.ExecContext(ctx, `INSERT INTO smtp_settings(id,updated_at) VALUES(1,?)`, time.Now().UTC().Format(time.RFC3339Nano))
	return err
}
