package backup

import (
	"bytes"
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"

	"czcms/internal/database"
	"czcms/internal/security"
)

func TestEncryptedBackupRoundTripAndTamperDetection(t *testing.T) {
	root := t.TempDir()
	plain := filepath.Join(root, "plain.db")
	encrypted := filepath.Join(root, "backup.czb")
	decrypted := filepath.Join(root, "restored.db")
	original := bytes.Repeat([]byte("sqlite-test-data"), 100_000)
	if err := os.WriteFile(plain, original, 0o600); err != nil {
		t.Fatal(err)
	}
	key := bytes.Repeat([]byte{0x42}, 32)
	if err := encryptFile(plain, encrypted, key); err != nil {
		t.Fatal(err)
	}
	if err := decryptFile(encrypted, decrypted, key); err != nil {
		t.Fatal(err)
	}
	restored, _ := os.ReadFile(decrypted)
	if !bytes.Equal(original, restored) {
		t.Fatal("decrypted backup differs")
	}
	contents, _ := os.ReadFile(encrypted)
	contents[len(contents)-1] ^= 1
	if err := os.WriteFile(encrypted, contents, 0o600); err != nil {
		t.Fatal(err)
	}
	if err := decryptFile(encrypted, filepath.Join(root, "tampered.db"), key); err == nil {
		t.Fatal("tampered backup decrypted")
	}
}

func TestCreateSQLiteBackupRunsIntegrityCheck(t *testing.T) {
	ctx := context.Background()
	root := t.TempDir()
	db, err := database.Open(ctx, filepath.Join(root, "source.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	hash, _ := security.HashPassword("correct horse battery staple")
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at) VALUES ('owner', 'Owner', ?, ?, ?, ?)`, hash, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := result.LastInsertId()
	keys, _ := security.LoadKeyring("", filepath.Join(root, "secrets"), "development")
	service, err := New(db, filepath.Join(root, "backups"), "", "development", keys)
	if err != nil {
		t.Fatal(err)
	}
	record, err := service.Create(ctx, userID)
	if err != nil {
		t.Fatal(err)
	}
	if record.ByteSize <= 0 || record.SHA256 == "" || record.VerifiedAt == "" {
		t.Fatalf("incomplete record: %+v", record)
	}
	restoredPath := filepath.Join(root, "offline-restore.db")
	if err = service.RestoreTo(ctx, record.StorageName, restoredPath); err != nil {
		t.Fatal(err)
	}
	if err = service.RestoreTo(ctx, record.StorageName, restoredPath); err == nil {
		t.Fatal("restore overwrote an existing file")
	}
}
