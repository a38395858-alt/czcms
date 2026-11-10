package database

import (
	"context"
	"database/sql"
)

func migrateHTSV39(ctx context.Context, tx *sql.Tx) error {
	for _, statement := range []string{
		`CREATE TABLE hts_entries (
			id INTEGER PRIMARY KEY, code TEXT NOT NULL UNIQUE, formatted_code TEXT NOT NULL,
			description TEXT NOT NULL, hierarchy TEXT NOT NULL, units TEXT NOT NULL,
			general_rate TEXT NOT NULL, rate_source TEXT NOT NULL, footnotes TEXT NOT NULL
		)`,
		`CREATE VIRTUAL TABLE hts_search USING fts5(text, tokenize='porter unicode61 remove_diacritics 2')`,
		`CREATE TABLE hts_state (
			id INTEGER PRIMARY KEY CHECK(id=1), release_name TEXT NOT NULL DEFAULT '',
			release_label TEXT NOT NULL DEFAULT '', effective_date TEXT NOT NULL DEFAULT '',
			source_sha256 TEXT NOT NULL DEFAULT '', row_count INTEGER NOT NULL DEFAULT 0,
			last_checked_at TEXT NOT NULL DEFAULT '', last_success_at TEXT NOT NULL DEFAULT '',
			completed_period TEXT NOT NULL DEFAULT '', last_attempt_at TEXT NOT NULL DEFAULT '',
			last_error TEXT NOT NULL DEFAULT '', lease_until TEXT NOT NULL DEFAULT '', alert_error TEXT NOT NULL DEFAULT ''
		)`,
		`INSERT INTO hts_state(id) VALUES(1)`,
		`CREATE TABLE system_mail_deliveries (
			id INTEGER PRIMARY KEY AUTOINCREMENT, event_key TEXT NOT NULL UNIQUE,
			recipient TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','sent','failed')),
			attempts INTEGER NOT NULL DEFAULT 0, next_attempt_at TEXT NOT NULL,
			lease_token TEXT NOT NULL DEFAULT '', lease_until TEXT NOT NULL DEFAULT '',
			last_error TEXT NOT NULL DEFAULT '', sent_at TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL, updated_at TEXT NOT NULL
		)`,
		`CREATE INDEX idx_system_mail_pending ON system_mail_deliveries(status,next_attempt_at,lease_until)`,
	} {
		if _, err := tx.ExecContext(ctx, statement); err != nil {
			return err
		}
	}
	return nil
}

func migrateHTSDetailsV40(ctx context.Context, tx *sql.Tx) error {
	for _, statement := range []string{
		`ALTER TABLE hts_entries ADD COLUMN special_rate TEXT NOT NULL DEFAULT ''`,
		`ALTER TABLE hts_entries ADD COLUMN special_source TEXT NOT NULL DEFAULT ''`,
		`ALTER TABLE hts_entries ADD COLUMN other_rate TEXT NOT NULL DEFAULT ''`,
		`ALTER TABLE hts_entries ADD COLUMN other_source TEXT NOT NULL DEFAULT ''`,
		`ALTER TABLE hts_state ADD COLUMN detail_version INTEGER NOT NULL DEFAULT 0`,
	} {
		if _, err := tx.ExecContext(ctx, statement); err != nil {
			return err
		}
	}
	return nil
}
