package backup

import (
	"archive/tar"
	"bufio"
	"compress/gzip"
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"czcms/internal/security"

	_ "modernc.org/sqlite"
)

const (
	legacyMagic = "CZCMSBK1"
	fullMagic   = "CZCMSBK2"
	chunkSize   = 1 << 20

	// A backup is streamed, so this is an extraction safety boundary rather
	// than an allocation limit. It prevents a crafted imported archive from
	// filling a server disk without putting an impractically small cap on CMS
	// installations with a substantial image library.
	maxBundleBytes   int64 = 64 << 30
	maxManifestBytes       = 1 << 20
)

type Service struct {
	db        *sql.DB
	dir       string
	uploadDir string
	themeDir  string
	key       []byte
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
	Format      string `json:"format"`
	Scope       string `json:"scope"`
}

type bundleFile struct {
	Path   string `json:"path"`
	Size   int64  `json:"size"`
	SHA256 string `json:"sha256"`
}

type bundleManifest struct {
	Format    string       `json:"format"`
	CreatedAt string       `json:"created_at"`
	Files     []bundleFile `json:"files"`
}

type archiveSource struct {
	SourcePath  string
	ArchivePath string
}

// ErrNotFound is returned when a requested backup record no longer exists.
var ErrNotFound = errors.New("备份不存在")

// ErrInvalidIDs is returned when a bulk delete request contains an invalid
// or duplicate identifier.
var ErrInvalidIDs = errors.New("备份 ID 无效")

// MaxImportBytes is the server-side upper bound used by the HTTP upload
// handler before an imported encrypted archive is written to disk.
func (s *Service) MaxImportBytes() int64 { return maxBundleBytes }

// New configures encrypted backup storage. A full backup always contains an
// SQLite snapshot and also captures the protected upload and template archive
// directories. Secrets, logs and caches intentionally remain outside the
// archive.
func New(db *sql.DB, directory, uploadDir, themeDir, encodedKey, environment string, keys *security.Keyring) (*Service, error) {
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
	return &Service{db: db, dir: directory, uploadDir: uploadDir, themeDir: themeDir, key: key}, nil
}

// Create produces a single encrypted CZCMSBK2 archive containing data/czcms.db,
// uploads/ and themes/. The temporary plaintext files are removed in all paths.
func (s *Service) Create(ctx context.Context, userID int64) (Record, error) {
	if s.db == nil {
		return Record{}, errors.New("备份服务没有连接数据库")
	}
	id, err := randomName()
	if err != nil {
		return Record{}, err
	}
	plainDB := filepath.Join(s.dir, ".backup-"+id+".db")
	plainArchive := filepath.Join(s.dir, ".backup-"+id+".tar.gz")
	encryptedName := "czcms-" + time.Now().UTC().Format("20060102T150405Z") + "-" + id + ".czb"
	encryptedPath := filepath.Join(s.dir, encryptedName)
	defer os.Remove(plainDB)
	defer os.Remove(plainArchive)

	if _, err = s.db.ExecContext(ctx, `VACUUM INTO ?`, plainDB); err != nil {
		return Record{}, fmt.Errorf("create consistent SQLite snapshot: %w", err)
	}
	if err = createFullArchive(plainArchive, plainDB, s.uploadDir, s.themeDir); err != nil {
		return Record{}, err
	}
	if err = encryptFileWithMagic(plainArchive, encryptedPath, s.key, fullMagic); err != nil {
		_ = os.Remove(encryptedPath)
		return Record{}, err
	}
	if err = s.verifyFile(ctx, encryptedPath); err != nil {
		_ = os.Remove(encryptedPath)
		return Record{}, fmt.Errorf("verify encrypted backup: %w", err)
	}
	return s.recordStoredFile(ctx, encryptedName, userID)
}

// Import validates an externally supplied .czb using the active backup key
// before adding it to the server's protected backup library. It never restores
// or overwrites a live installation.
func (s *Service) Import(ctx context.Context, source io.Reader, declaredSize, userID int64) (Record, error) {
	if s.db == nil {
		return Record{}, errors.New("备份服务没有连接数据库")
	}
	if source == nil || userID < 1 {
		return Record{}, errors.New("导入备份参数无效")
	}
	if declaredSize > maxBundleBytes {
		return Record{}, fmt.Errorf("导入备份不能超过 %d GB", maxBundleBytes>>30)
	}
	id, err := randomName()
	if err != nil {
		return Record{}, err
	}
	temporary, err := os.CreateTemp(s.dir, ".import-*.czb")
	if err != nil {
		return Record{}, err
	}
	temporaryPath := temporary.Name()
	succeeded := false
	defer func() {
		_ = temporary.Close()
		if !succeeded {
			_ = os.Remove(temporaryPath)
		}
	}()
	written, err := io.Copy(temporary, io.LimitReader(source, maxBundleBytes+1))
	if err != nil {
		return Record{}, err
	}
	if written == 0 || written > maxBundleBytes {
		return Record{}, fmt.Errorf("导入备份为空或超过 %d GB 限制", maxBundleBytes>>30)
	}
	if err = temporary.Sync(); err != nil {
		return Record{}, err
	}
	if err = temporary.Close(); err != nil {
		return Record{}, err
	}
	if err = s.verifyFile(ctx, temporaryPath); err != nil {
		return Record{}, fmt.Errorf("导入备份校验失败：%w", err)
	}
	encryptedName := "czcms-import-" + time.Now().UTC().Format("20060102T150405Z") + "-" + id + ".czb"
	if err = os.Rename(temporaryPath, filepath.Join(s.dir, encryptedName)); err != nil {
		return Record{}, err
	}
	succeeded = true
	return s.recordStoredFile(ctx, encryptedName, userID)
}

func (s *Service) recordStoredFile(ctx context.Context, storageName string, userID int64) (Record, error) {
	checksum, size, err := fileChecksum(filepath.Join(s.dir, storageName))
	if err != nil {
		return Record{}, err
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := s.db.ExecContext(ctx, `INSERT INTO backup_records(storage_name, byte_size, sha256, created_by, verified_at, created_at) VALUES (?, ?, ?, ?, ?, ?)`, storageName, size, checksum, userID, now, now)
	if err != nil {
		_ = os.Remove(filepath.Join(s.dir, storageName))
		return Record{}, err
	}
	recordID, err := result.LastInsertId()
	if err != nil {
		return Record{}, err
	}
	format, scope, _ := backupFormat(filepath.Join(s.dir, storageName))
	return Record{ID: recordID, StorageName: storageName, ByteSize: size, SHA256: checksum, CreatedBy: userID, VerifiedAt: now, CreatedAt: now, Format: format, Scope: scope}, nil
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
		record.Format, record.Scope, _ = backupFormat(filepath.Join(s.dir, record.StorageName))
		if record.Format == "" {
			record.Format, record.Scope = "无法读取", "未知"
		}
		records = append(records, record)
	}
	return records, rows.Err()
}

// Open returns an encrypted backup file only after resolving its database
// record. Callers must close the returned handle.
func (s *Service) Open(ctx context.Context, recordID int64) (Record, *os.File, error) {
	if recordID < 1 {
		return Record{}, nil, errors.New("备份 ID 无效")
	}
	var record Record
	err := s.db.QueryRowContext(ctx, `SELECT b.id, b.storage_name, b.byte_size, b.sha256, b.created_by,
		COALESCE(u.display_name, u.username, ''), b.verified_at, b.created_at
		FROM backup_records b LEFT JOIN users u ON u.id = b.created_by WHERE b.id = ?`, recordID).
		Scan(&record.ID, &record.StorageName, &record.ByteSize, &record.SHA256, &record.CreatedBy, &record.CreatorName, &record.VerifiedAt, &record.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return Record{}, nil, ErrNotFound
	}
	if err != nil {
		return Record{}, nil, err
	}
	if filepath.Base(record.StorageName) != record.StorageName {
		return Record{}, nil, errors.New("备份记录无效")
	}
	file, err := os.Open(filepath.Join(s.dir, record.StorageName))
	if err != nil {
		return Record{}, nil, err
	}
	record.Format, record.Scope, _ = backupFormat(filepath.Join(s.dir, record.StorageName))
	return record, file, nil
}

// Delete removes a backup record and its protected .czb file. The database
// transaction is authoritative, matching media deletion semantics: once the
// record is committed, a failed unlink only leaves an unaddressable orphan
// that can be cleaned up by storage maintenance.
func (s *Service) Delete(ctx context.Context, recordID int64) error {
	_, err := s.DeleteMany(ctx, []int64{recordID})
	return err
}

// DeleteMany permanently removes up to 100 backup records. It validates all
// records and commits the database change atomically before unlinking files.
// Missing files are treated as already-cleaned and do not make a destructive
// request appear to fail after its database transaction has committed.
func (s *Service) DeleteMany(ctx context.Context, recordIDs []int64) (int, error) {
	if len(recordIDs) < 1 || len(recordIDs) > 100 {
		return 0, ErrInvalidIDs
	}
	seen := make(map[int64]struct{}, len(recordIDs))
	for _, id := range recordIDs {
		if id < 1 {
			return 0, ErrInvalidIDs
		}
		if _, exists := seen[id]; exists {
			return 0, ErrInvalidIDs
		}
		seen[id] = struct{}{}
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()
	storageNames := make([]string, 0, len(recordIDs))
	for _, id := range recordIDs {
		var storageName string
		if err = tx.QueryRowContext(ctx, `SELECT storage_name FROM backup_records WHERE id = ?`, id).Scan(&storageName); errors.Is(err, sql.ErrNoRows) {
			return 0, ErrNotFound
		} else if err != nil {
			return 0, err
		}
		if filepath.Base(storageName) != storageName || storageName == "" || storageName == "." {
			return 0, errors.New("备份记录无效")
		}
		storageNames = append(storageNames, storageName)
	}
	for _, id := range recordIDs {
		if _, err = tx.ExecContext(ctx, `DELETE FROM backup_records WHERE id = ?`, id); err != nil {
			return 0, err
		}
	}
	if err = tx.Commit(); err != nil {
		return 0, err
	}
	for _, storageName := range storageNames {
		if removeErr := os.Remove(filepath.Join(s.dir, storageName)); removeErr != nil && !errors.Is(removeErr, os.ErrNotExist) {
			// The DB is already authoritative; keep the delete successful and
			// leave the orphan for a later storage maintenance pass.
			continue
		}
	}
	return len(recordIDs), nil
}

// RestoreTo performs an offline restore. CZCMSBK2 files restore to a new
// directory containing data/czcms.db, uploads/ and themes/. Legacy CZCMSBK1
// snapshots retain their old behaviour and restore to a new SQLite file.
func (s *Service) RestoreTo(ctx context.Context, storageName, destinationPath string) error {
	if filepath.Base(storageName) != storageName || storageName == "." || storageName == "" {
		return errors.New("备份文件名无效")
	}
	if destinationPath == "" {
		return errors.New("恢复目标不能为空")
	}
	sourcePath := filepath.Join(s.dir, storageName)
	format, _, err := backupFormat(sourcePath)
	if err != nil {
		return err
	}
	if format == "SQLite 数据库快照" {
		return s.restoreLegacyDatabase(ctx, sourcePath, destinationPath)
	}
	if format != "完整网站备份" {
		return errors.New("不支持的备份格式")
	}
	if _, err = os.Stat(destinationPath); err == nil {
		return errors.New("恢复目标已存在，拒绝覆盖")
	} else if !errors.Is(err, os.ErrNotExist) {
		return err
	}
	if err = os.MkdirAll(destinationPath, 0o700); err != nil {
		return err
	}
	succeeded := false
	defer func() {
		if !succeeded {
			_ = os.RemoveAll(destinationPath)
		}
	}()
	plainArchive := filepath.Join(s.dir, ".restore-"+time.Now().UTC().Format("20060102150405")+".tar.gz")
	defer os.Remove(plainArchive)
	if err = decryptFileWithMagic(sourcePath, plainArchive, s.key, fullMagic); err != nil {
		return err
	}
	if err = extractFullArchive(ctx, plainArchive, destinationPath); err != nil {
		return err
	}
	if err = verifySQLite(filepath.Join(destinationPath, "data", "czcms.db")); err != nil {
		return fmt.Errorf("恢复文件完整性检查失败: %w", err)
	}
	succeeded = true
	return nil
}

func (s *Service) restoreLegacyDatabase(ctx context.Context, sourcePath, destinationPath string) error {
	if _, err := os.Stat(destinationPath); err == nil {
		return errors.New("恢复目标已存在，拒绝覆盖")
	} else if !errors.Is(err, os.ErrNotExist) {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(destinationPath), 0o700); err != nil {
		return err
	}
	if err := decryptFile(sourcePath, destinationPath, s.key); err != nil {
		return err
	}
	if err := verifySQLite(destinationPath); err != nil {
		_ = os.Remove(destinationPath)
		return fmt.Errorf("恢复文件完整性检查失败: %w", err)
	}
	return ctx.Err()
}

func (s *Service) verifyFile(ctx context.Context, encryptedPath string) error {
	format, _, err := backupFormat(encryptedPath)
	if err != nil {
		return err
	}
	id, err := randomName()
	if err != nil {
		return err
	}
	if format == "SQLite 数据库快照" {
		plainDB := filepath.Join(s.dir, ".verify-"+id+".db")
		defer os.Remove(plainDB)
		if err = decryptFile(encryptedPath, plainDB, s.key); err != nil {
			return err
		}
		return verifySQLite(plainDB)
	}
	if format != "完整网站备份" {
		return errors.New("不支持的备份格式")
	}
	plainArchive := filepath.Join(s.dir, ".verify-"+id+".tar.gz")
	verifyRoot := filepath.Join(s.dir, ".verify-"+id)
	defer os.Remove(plainArchive)
	defer os.RemoveAll(verifyRoot)
	if err = decryptFileWithMagic(encryptedPath, plainArchive, s.key, fullMagic); err != nil {
		return err
	}
	if err = os.MkdirAll(verifyRoot, 0o700); err != nil {
		return err
	}
	if err = extractFullArchive(ctx, plainArchive, verifyRoot); err != nil {
		return err
	}
	return verifySQLite(filepath.Join(verifyRoot, "data", "czcms.db"))
}

func createFullArchive(destination, databasePath, uploadDir, themeDir string) error {
	sources, err := archiveSources(databasePath, uploadDir, themeDir)
	if err != nil {
		return err
	}
	file, err := os.OpenFile(destination, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o600)
	if err != nil {
		return err
	}
	succeeded := false
	defer func() {
		_ = file.Close()
		if !succeeded {
			_ = os.Remove(destination)
		}
	}()
	gzipWriter := gzip.NewWriter(file)
	tarWriter := tar.NewWriter(gzipWriter)
	manifest := bundleManifest{Format: "czcms-full-backup-v1", CreatedAt: time.Now().UTC().Format(time.RFC3339Nano), Files: make([]bundleFile, 0, len(sources))}
	for _, source := range sources {
		item, writeErr := writeArchiveFile(tarWriter, source)
		if writeErr != nil {
			return writeErr
		}
		manifest.Files = append(manifest.Files, item)
	}
	sort.Slice(manifest.Files, func(i, j int) bool { return manifest.Files[i].Path < manifest.Files[j].Path })
	manifestBytes, err := json.Marshal(manifest)
	if err != nil {
		return err
	}
	if err = tarWriter.WriteHeader(&tar.Header{Name: "manifest.json", Mode: 0o600, Size: int64(len(manifestBytes)), ModTime: time.Now().UTC()}); err != nil {
		return err
	}
	if _, err = tarWriter.Write(manifestBytes); err != nil {
		return err
	}
	if err = tarWriter.Close(); err != nil {
		return err
	}
	if err = gzipWriter.Close(); err != nil {
		return err
	}
	if err = file.Sync(); err != nil {
		return err
	}
	if err = file.Close(); err != nil {
		return err
	}
	succeeded = true
	return nil
}

func archiveSources(databasePath, uploadDir, themeDir string) ([]archiveSource, error) {
	sources := []archiveSource{{SourcePath: databasePath, ArchivePath: "data/czcms.db"}}
	for _, entry := range []struct{ directory, prefix string }{{uploadDir, "uploads"}, {themeDir, "themes"}} {
		items, err := archiveDirectory(entry.directory, entry.prefix)
		if err != nil {
			return nil, err
		}
		sources = append(sources, items...)
	}
	sort.Slice(sources, func(i, j int) bool { return sources[i].ArchivePath < sources[j].ArchivePath })
	return sources, nil
}

func archiveDirectory(directory, prefix string) ([]archiveSource, error) {
	if strings.TrimSpace(directory) == "" {
		return nil, nil
	}
	if _, err := os.Stat(directory); errors.Is(err, os.ErrNotExist) {
		return nil, nil
	} else if err != nil {
		return nil, err
	}
	items := make([]archiveSource, 0)
	err := filepath.WalkDir(directory, func(filename string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if filename == directory {
			return nil
		}
		if entry.Type()&os.ModeSymlink != 0 {
			return fmt.Errorf("备份目录不允许符号链接: %s", filename)
		}
		if entry.IsDir() {
			if strings.HasPrefix(entry.Name(), ".") {
				return filepath.SkipDir
			}
			return nil
		}
		if strings.HasPrefix(entry.Name(), ".") {
			return nil
		}
		info, err := entry.Info()
		if err != nil {
			return err
		}
		if !info.Mode().IsRegular() {
			return fmt.Errorf("备份目录包含非普通文件: %s", filename)
		}
		relative, err := filepath.Rel(directory, filename)
		if err != nil || relative == "." || strings.HasPrefix(relative, "..") {
			return errors.New("备份目录路径无效")
		}
		items = append(items, archiveSource{SourcePath: filename, ArchivePath: prefix + "/" + filepath.ToSlash(relative)})
		return nil
	})
	return items, err
}

func writeArchiveFile(writer *tar.Writer, source archiveSource) (bundleFile, error) {
	info, err := os.Stat(source.SourcePath)
	if err != nil {
		return bundleFile{}, err
	}
	if !info.Mode().IsRegular() || info.Size() < 0 || info.Size() > maxBundleBytes {
		return bundleFile{}, fmt.Errorf("备份文件无效或过大: %s", source.SourcePath)
	}
	if err = writer.WriteHeader(&tar.Header{Name: source.ArchivePath, Mode: 0o600, Size: info.Size(), ModTime: info.ModTime().UTC(), Typeflag: tar.TypeReg}); err != nil {
		return bundleFile{}, err
	}
	input, err := os.Open(source.SourcePath)
	if err != nil {
		return bundleFile{}, err
	}
	defer input.Close()
	hasher := sha256.New()
	written, err := io.CopyN(io.MultiWriter(writer, hasher), input, info.Size())
	if err != nil {
		return bundleFile{}, err
	}
	if written != info.Size() {
		return bundleFile{}, errors.New("备份源文件在读取期间发生变化")
	}
	return bundleFile{Path: source.ArchivePath, Size: written, SHA256: hex.EncodeToString(hasher.Sum(nil))}, nil
}

func extractFullArchive(ctx context.Context, archivePath, destination string) error {
	input, err := os.Open(archivePath)
	if err != nil {
		return err
	}
	defer input.Close()
	gzipReader, err := gzip.NewReader(input)
	if err != nil {
		return errors.New("完整备份压缩包无效")
	}
	defer gzipReader.Close()
	tarReader := tar.NewReader(gzipReader)
	actual := make(map[string]bundleFile)
	var manifest bundleManifest
	manifestFound := false
	var extracted int64
	for {
		if err = ctx.Err(); err != nil {
			return err
		}
		header, readErr := tarReader.Next()
		if errors.Is(readErr, io.EOF) {
			break
		}
		if readErr != nil {
			return readErr
		}
		name, valid := validBundlePath(header.Name)
		if !valid || header.Size < 0 || header.Size > maxBundleBytes || (header.Typeflag != tar.TypeReg && header.Typeflag != tar.TypeRegA) {
			return errors.New("完整备份包含不安全的文件路径或类型")
		}
		if _, exists := actual[name]; exists || (name == "manifest.json" && manifestFound) {
			return errors.New("完整备份包含重复文件")
		}
		if name == "manifest.json" {
			if header.Size > maxManifestBytes {
				return errors.New("完整备份清单过大")
			}
			contents, err := io.ReadAll(io.LimitReader(tarReader, maxManifestBytes+1))
			if err != nil || int64(len(contents)) != header.Size || json.Unmarshal(contents, &manifest) != nil {
				return errors.New("完整备份清单无效")
			}
			manifestFound = true
			continue
		}
		extracted += header.Size
		if extracted > maxBundleBytes {
			return fmt.Errorf("完整备份解压后不能超过 %d GB", maxBundleBytes>>30)
		}
		target := filepath.Join(destination, filepath.FromSlash(name))
		relative, relErr := filepath.Rel(destination, target)
		if relErr != nil || relative == "." || strings.HasPrefix(relative, "..") {
			return errors.New("完整备份目标路径无效")
		}
		if err = os.MkdirAll(filepath.Dir(target), 0o700); err != nil {
			return err
		}
		output, err := os.OpenFile(target, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o600)
		if err != nil {
			return err
		}
		hasher := sha256.New()
		written, copyErr := io.Copy(io.MultiWriter(output, hasher), tarReader)
		closeErr := output.Close()
		if copyErr != nil || closeErr != nil || written != header.Size {
			_ = os.Remove(target)
			if copyErr != nil {
				return copyErr
			}
			if closeErr != nil {
				return closeErr
			}
			return errors.New("完整备份文件长度无效")
		}
		actual[name] = bundleFile{Path: name, Size: written, SHA256: hex.EncodeToString(hasher.Sum(nil))}
	}
	if !manifestFound || manifest.Format != "czcms-full-backup-v1" || len(manifest.Files) != len(actual) {
		return errors.New("完整备份清单与文件不匹配")
	}
	for _, expected := range manifest.Files {
		item, exists := actual[expected.Path]
		if !exists || item.Size != expected.Size || !strings.EqualFold(item.SHA256, expected.SHA256) {
			return errors.New("完整备份文件校验失败")
		}
	}
	if _, err = os.Stat(filepath.Join(destination, "data", "czcms.db")); err != nil {
		return errors.New("完整备份缺少数据库快照")
	}
	return nil
}

func validBundlePath(value string) (string, bool) {
	value = strings.ReplaceAll(value, "\\", "/")
	cleaned := path.Clean(value)
	if value == "" || value != cleaned || strings.HasPrefix(cleaned, "../") || strings.HasPrefix(cleaned, "/") || strings.Contains(cleaned, ":") {
		return "", false
	}
	if cleaned == "manifest.json" || cleaned == "data/czcms.db" || strings.HasPrefix(cleaned, "uploads/") || strings.HasPrefix(cleaned, "themes/") {
		return cleaned, true
	}
	return "", false
}

func verifySQLite(filename string) error {
	verificationDB, err := sql.Open("sqlite", "file:"+filepath.ToSlash(filename)+"?mode=ro")
	if err != nil {
		return err
	}
	defer verificationDB.Close()
	var integrity string
	if err = verificationDB.QueryRow(`PRAGMA integrity_check`).Scan(&integrity); err != nil {
		return err
	}
	if integrity != "ok" {
		return errors.New("SQLite integrity_check failed")
	}
	return nil
}

func backupFormat(filename string) (format, scope string, err error) {
	file, err := os.Open(filename)
	if err != nil {
		return "", "", err
	}
	defer file.Close()
	header := make([]byte, len(legacyMagic))
	if _, err = io.ReadFull(file, header); err != nil {
		return "", "", errors.New("备份文件头无效")
	}
	switch string(header) {
	case legacyMagic:
		return "SQLite 数据库快照", "数据库", nil
	case fullMagic:
		return "完整网站备份", "数据库 + 媒体 + 模板", nil
	default:
		return "", "", errors.New("不支持的备份格式")
	}
}

func encryptFile(sourcePath, destinationPath string, key []byte) error {
	return encryptFileWithMagic(sourcePath, destinationPath, key, legacyMagic)
}

func encryptFileWithMagic(sourcePath, destinationPath string, key []byte, magic string) error {
	if magic != legacyMagic && magic != fullMagic {
		return errors.New("invalid backup format")
	}
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
	return decryptFileWithMagic(sourcePath, destinationPath, key, legacyMagic)
}

func decryptFileWithMagic(sourcePath, destinationPath string, key []byte, expectedMagic string) error {
	source, err := os.Open(sourcePath)
	if err != nil {
		return err
	}
	defer source.Close()
	header := make([]byte, len(expectedMagic))
	if _, err = io.ReadFull(source, header); err != nil || string(header) != expectedMagic {
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
		plain, openErr := aead.Open(nil, nonce, sealed, aad)
		if openErr != nil {
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
