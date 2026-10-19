package database

import (
	"context"
	"database/sql"
)

func migrateFormInboxV37(ctx context.Context, tx *sql.Tx) error {
	columns, err := tableColumns(ctx, tx, "form_submissions")
	if err != nil {
		return err
	}
	if !columns["notes_encrypted"] {
		if _, err = tx.ExecContext(ctx, `ALTER TABLE form_submissions ADD COLUMN notes_encrypted BLOB`); err != nil {
			return err
		}
	}
	if !columns["version"] {
		if _, err = tx.ExecContext(ctx, `ALTER TABLE form_submissions ADD COLUMN version INTEGER NOT NULL DEFAULT 1`); err != nil {
			return err
		}
	}
	return nil
}
