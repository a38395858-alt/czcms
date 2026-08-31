package backup

import (
	"bufio"
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/binary"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"czcms/internal/security"

	_ "modernc.org/sqlite"
)

const (
	magic     = "CZCMSBK1"
	chunkSize = 1 << 20
)

type Service struct {
	db  *sql.DB
	dir string
	key []byte
}

type Record struct {
	ID          int64  `json:"id"`
	StorageName string `json:"storage_name"`
	ByteSize    int64  `json:"byte_size"`
	SHA256      string `json:"sha256"`
	CreatedBy   int64  `json:"created_by"`
	CreatorName string `json:"creator_name"`
	VerifiedAt  string `json:"verified_at"`
	CreatedAt   string `json:"created_at"`
}

func New(db *sql.DB, directory, encodedKey, environment string, keys *security.Keyring) (*Service, error) {
	if err := os.MkdirAll(directory, 0o700); err != nil {
		return nil, fmt.Errorf("create backup directory: %w", err)
	}
	var key []byte
	if encodedKey != "" {
		decoded, err := base64.RawStdEncoding.Strict().DecodeString(encodedKey)
		if err != nil {
			decoded, err = base64.StdEncoding.Strict().DecodeString(encodedKey)
		}
		if err != nil || len(decoded) != 32 {
			return nil, errors.New("CZCMS_BACKUP_KEY 必须是 Base64 编码的 32 字节密钥")
		}
		key = decoded
	} else {
		if environment == "production" {
			return nil, errors.New("生产环境必须配置独立的 CZCMS_BACKUP_KEY")
		}
		key = keys.Derive("development-backup-key")
	}
	return &Service{db: db, dir: directory, key: key}, nil
}

func (s *Service) Create(ctx context.Context, userID int64) (Record, error) {
	id, err := randomName()
	if err != nil {
		return Record{}, err
	}
	plainPath := filepath.Join(s.dir, ".backup-"+id+".db")
	encryptedName := "czcms-" + time.Now().UTC().Format("20060102T150405Z") + "-" + id + ".czb"
	encryptedPath := filepath.Join(s.dir, encryptedName)
	defer os.Remove(plainPath)
	if _, err = s.db.ExecContext(ctx, `VACUUM INTO ?`, plainPath); err != nil {
		return Record{}, fmt.Errorf("create consistent SQLite snapshot: %w", err)
	}
	if err = encryptFile(plainPath, encryptedPath, s.key); err != nil {
		_ = os.Remove(encryptedPath)
		return Record{}, err
	}
	verifiedPath := filepath.Join(s.dir, ".verify-"+id+".db")
	defer os.Remove(verifiedPath)
	if err = decryptFile(encryptedPath, verifiedPath, s.key); err != nil {
		_ = os.Remove(encryptedPath)
		return Record{}, fmt.Errorf("verify encrypted backup: %w", err)
	}
	verificationDB, err := sql.Open("sqlite", "file:"+filepath.ToSlash(verifiedPath)+"?mode=ro")
	if err != nil {
		_ = os.Remove(encryptedPath)
		return Record{}, err
	}
	var integrity string
	err = verificationDB.QueryRowContext(ctx, `PRAGMA integrity_check`).Scan(&integrity)
	verificationDB.Close()
	if err != nil || integrity != "ok" {
		_ = os.Remove(encryptedPath)
		return Record{}, errors.New("备份完整性验证失败")
	}
	checksum, size, err := fileChecksum(encryptedPath)
	if err != nil {
		_ = os.Remove(encryptedPath)
		return Record{}, err
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := s.db.ExecContext(ctx, `INSERT INTO backup_records(storage_name, byte_size, sha256, created_by, verified_at, created_at) VALUES (?, ?, ?, ?, ?, ?)`, encryptedName, size, checksum, userID, now, now)
	if err != nil {
		_ = os.Remove(encryptedPath)
		return Record{}, err
	}
	recordID, err := result.LastInsertId()
	return Record{ID: recordID, StorageName: encryptedName, ByteSize: size, SHA256: checksum, CreatedBy: userID, VerifiedAt: now, CreatedAt: now}, err
}

func (s *Service) List(ctx context.Context, limit int) ([]Record, error) {
	if limit < 1 || limit > 200 {
		limit = 50
	}
	rows, err := s.db.QueryContext(ctx, `SELECT b.id, b.storage_name, b.byte_size, b.sha256, b.created_by,
		COALESCE(u.display_name, u.username, ''), b.verified_at, b.created_at
		FROM backup_records b LEFT JOIN users u ON u.id = b.created_by
		ORDER BY b.created_at DESC, b.id DESC LIMIT ?`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	records := make([]Record, 0)
	for rows.Next() {
		var record Record
		if err = rows.Scan(&record.ID, &record.StorageName, &record.ByteSize, &record.SHA256, &record.CreatedBy, &record.CreatorName, &record.VerifiedAt, &record.CreatedAt); err != nil {
			return nil, err
		}
		records = append(records, record)
	}
	return records, rows.Err()
}

// RestoreTo decrypts and integrity-checks a backup into a new offline SQLite
// file. It never overwrites an existing destination and never replaces the
// live database; the operator must stop the service before an actual restore.
func (s *Service) RestoreTo(ctx context.Context, storageName, destinationPath string) error {
	if filepath.Base(storageName) != storageName || storageName == "." || storageName == "" {
		return errors.New("备份文件名无效")
	}
	if destinationPath == "" {
		return errors.New("恢复目标不能为空")
	}
	if _, err := os.Stat(destinationPath); err == nil {
		return errors.New("恢复目标已存在，拒绝覆盖")
	} else if !errors.Is(err, os.ErrNotExist) {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(destinationPath), 0o700); err != nil {
		return err
	}
	if err := decryptFile(filepath.Join(s.dir, storageName), destinationPath, s.key); err != nil {
		return err
	}
	verificationDB, err := sql.Open("sqlite", "file:"+filepath.ToSlash(destinationPath)+"?mode=ro")
	if err != nil {
		_ = os.Remove(destinationPath)
		return err
	}
	var integrity string
	err = verificationDB.QueryRowContext(ctx, `PRAGMA integrity_check`).Scan(&integrity)
	verificationDB.Close()
	if err != nil || integrity != "ok" {
		_ = os.Remove(destinationPath)
		return errors.New("恢复文件完整性检查失败")
	}
	return nil
}

func encryptFile(sourcePath, destinationPath string, key []byte) error {
	source, err := os.Open(sourcePath)
	if err != nil {
		return err
	}
	defer source.Close()
	destination, err := os.OpenFile(destinationPath, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o600)
	if err != nil {
		return err
	}
	succeeded := false
	defer func() {
		_ = destination.Close()
		if !succeeded {
			_ = os.Remove(destinationPath)
		}
	}()
	block, err := aes.NewCipher(key)
	if err != nil {
		return err
	}
	aead, err := cipher.NewGCM(block)
	if err != nil {
		return err
	}
	baseNonce := make([]byte, aead.NonceSize()-4)
	if _, err = rand.Read(baseNonce); err != nil {
		return err
	}
	writer := bufio.NewWriter(destination)
	if _, err = writer.WriteString(magic); err != nil {
		return err
	}
	if _, err = writer.Write(baseNonce); err != nil {
		return err
	}
	buffer := make([]byte, chunkSize)
	var counter uint32
	for {
		read, readErr := source.Read(buffer)
		if read > 0 {
			nonce := append(append([]byte(nil), baseNonce...), make([]byte, 4)...)
			binary.BigEndian.PutUint32(nonce[len(baseNonce):], counter)
			aad := make([]byte, 4)
			binary.BigEndian.PutUint32(aad, counter)
			sealed := aead.Seal(nil, nonce, buffer[:read], aad)
			if err = binary.Write(writer, binary.BigEndian, uint32(len(sealed))); err != nil {
				return err
			}
			if _, err = writer.Write(sealed); err != nil {
				return err
			}
			counter++
		}
		if errors.Is(readErr, io.EOF) {
			break
		}
		if readErr != nil {
			return readErr
		}
	}
	if err = writer.Flush(); err != nil {
		return err
	}
	if err = destination.Sync(); err != nil {
		return err
	}
	if err = destination.Close(); err != nil {
		return err
	}
	succeeded = true
	return nil
}

func decryptFile(sourcePath, destinationPath string, key []byte) error {
	source, err := os.Open(sourcePath)
	if err != nil {
		return err
	}
	defer source.Close()
	header := make([]byte, len(magic))
	if _, err = io.ReadFull(source, header); err != nil || string(header) != magic {
		return errors.New("invalid backup header")
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return err
	}
	aead, err := cipher.NewGCM(block)
	if err != nil {
		return err
	}
	baseNonce := make([]byte, aead.NonceSize()-4)
	if _, err = io.ReadFull(source, baseNonce); err != nil {
		return err
	}
	destination, err := os.OpenFile(destinationPath, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o600)
	if err != nil {
		return err
	}
	succeeded := false
	defer func() {
		_ = destination.Close()
		if !succeeded {
			_ = os.Remove(destinationPath)
		}
	}()
	reader := bufio.NewReader(source)
	var counter uint32
	for {
		var length uint32
		if err = binary.Read(reader, binary.BigEndian, &length); errors.Is(err, io.EOF) {
			break
		}
		if err != nil || length > chunkSize+uint32(aead.Overhead()) {
			return errors.New("invalid encrypted backup chunk")
		}
		sealed := make([]byte, length)
		if _, err = io.ReadFull(reader, sealed); err != nil {
			return err
		}
		nonce := append(append([]byte(nil), baseNonce...), make([]byte, 4)...)
		binary.BigEndian.PutUint32(nonce[len(baseNonce):], counter)
		aad := make([]byte, 4)
		binary.BigEndian.PutUint32(aad, counter)
		plain, err := aead.Open(nil, nonce, sealed, aad)
		if err != nil {
			return errors.New("backup authentication failed")
		}
		if _, err = destination.Write(plain); err != nil {
			return err
		}
		counter++
	}
	if err = destination.Sync(); err != nil {
		return err
	}
	succeeded = true
	return destination.Close()
}

func randomName() (string, error) {
	raw := make([]byte, 8)
	if _, err := rand.Read(raw); err != nil {
		return "", err
	}
	return hex.EncodeToString(raw), nil
}

func fileChecksum(filename string) (string, int64, error) {
	file, err := os.Open(filename)
	if err != nil {
		return "", 0, err
	}
	defer file.Close()
	hasher := sha256.New()
	size, err := io.Copy(hasher, file)
	return hex.EncodeToString(hasher.Sum(nil)), size, err
}
