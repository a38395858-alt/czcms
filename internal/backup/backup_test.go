package backup

import (
	"bytes"
	"context"
	"errors"
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

func TestCreateFullBackupIncludesDatabaseUploadsAndThemes(t *testing.T) {
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
	uploads := filepath.Join(root, "uploads")
	themes := filepath.Join(root, "themes")
	if err = os.MkdirAll(uploads, 0o700); err != nil {
		t.Fatal(err)
	}
	if err = os.MkdirAll(themes, 0o700); err != nil {
		t.Fatal(err)
	}
	if err = os.WriteFile(filepath.Join(uploads, "hero.jpg"), []byte("image-bytes"), 0o600); err != nil {
		t.Fatal(err)
	}
	if err = os.WriteFile(filepath.Join(themes, "freight-theme.zip"), []byte("theme-bytes"), 0o600); err != nil {
		t.Fatal(err)
	}
	service, err := New(db, filepath.Join(root, "backups"), uploads, themes, "", "development", keys)
	if err != nil {
		t.Fatal(err)
	}
	record, err := service.Create(ctx, userID)
	if err != nil {
		t.Fatal(err)
	}
	if record.ByteSize <= 0 || record.SHA256 == "" || record.VerifiedAt == "" || record.Scope != "数据库 + 媒体 + 模板" {
		t.Fatalf("incomplete record: %+v", record)
	}
	restoredRoot := filepath.Join(root, "offline-restore")
	if err = service.RestoreTo(ctx, record.StorageName, restoredRoot); err != nil {
		t.Fatal(err)
	}
	if restored, readErr := os.ReadFile(filepath.Join(restoredRoot, "uploads", "hero.jpg")); readErr != nil || string(restored) != "image-bytes" {
		t.Fatalf("uploaded media was not restored: %q / %v", restored, readErr)
	}
	if restored, readErr := os.ReadFile(filepath.Join(restoredRoot, "themes", "freight-theme.zip")); readErr != nil || string(restored) != "theme-bytes" {
		t.Fatalf("theme archive was not restored: %q / %v", restored, readErr)
	}
	if err = service.RestoreTo(ctx, record.StorageName, restoredRoot); err == nil {
		t.Fatal("restore overwrote an existing file")
	}
	exported, exportFile, err := service.Open(ctx, record.ID)
	if err != nil {
		t.Fatal(err)
	}
	imported, err := service.Import(ctx, exportFile, exported.ByteSize, userID)
	_ = exportFile.Close()
	if err != nil {
		t.Fatal(err)
	}
	if imported.Scope != "数据库 + 媒体 + 模板" || imported.Format != "完整网站备份" {
		t.Fatalf("import did not preserve the verified full-backup format: %+v", imported)
	}
	deleted, err := service.DeleteMany(ctx, []int64{record.ID, imported.ID})
	if err != nil || deleted != 2 {
		t.Fatalf("delete many failed: deleted=%d err=%v", deleted, err)
	}
	if _, err = service.List(ctx, 20); err != nil {
		t.Fatal(err)
	}
	if _, _, err = service.Open(ctx, record.ID); !errors.Is(err, ErrNotFound) {
		t.Fatalf("deleted backup remained openable: %v", err)
	}
	if _, err = service.DeleteMany(ctx, []int64{record.ID, record.ID}); !errors.Is(err, ErrInvalidIDs) {
		t.Fatalf("duplicate delete IDs were accepted: %v", err)
	}
}
