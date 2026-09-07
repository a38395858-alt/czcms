package filestore

import (
	"archive/zip"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"time"
	"unicode/utf8"

	legacyavif "github.com/KarpelesLab/goavif"
	gavif "github.com/gen2brain/gav1d/avif"
	_ "golang.org/x/image/webp"
)

var safeOriginalName = regexp.MustCompile(`^[\pL\pN][\pL\pN._ ()-]{0,199}$`)

const browserAVIFEncoder = "gavif-v0.2.5"

type Store struct {
	db               *sql.DB
	uploadDir        string
	themeDir         string
	maxUploadBytes   int64
	maxThemeBytes    int64
	antivirusCommand string
	migrateMu        sync.Mutex
}

type Media struct {
	ID             int64  `json:"id"`
	OriginalName   string `json:"original_name"`
	MediaType      string `json:"media_type"`
	ByteSize       int64  `json:"byte_size"`
	SHA256         string `json:"sha256"`
	Width          int    `json:"width"`
	Height         int    `json:"height"`
	AltText        string `json:"alt_text"`
	UploadedBy     int64  `json:"uploaded_by"`
	UploaderName   string `json:"uploader_name"`
	ReferenceCount int64  `json:"reference_count"`
	Version        int64  `json:"version"`
	CreatedAt      string `json:"created_at"`
	UpdatedAt      string `json:"updated_at"`
	URL            string `json:"url"`
}

type MediaListOptions struct {
	Query      string
	MissingAlt bool
	Limit      int
	Offset     int
}

type MediaListResult struct {
	Items           []Media `json:"media"`
	Total           int64   `json:"total"`
	TotalBytes      int64   `json:"total_bytes"`
	MissingAltTotal int64   `json:"missing_alt_total"`
	ReferenceTotal  int64   `json:"reference_total"`
}

// ErrMediaNotFound is returned when a media record or its protected file is
// not available. Callers should map it to a 404 without exposing storage paths.
var ErrMediaNotFound = errors.New("媒体不存在")

var (
	ErrMediaConflict = errors.New("媒体已被其他操作修改，请刷新后重试")
	ErrMediaInUse    = errors.New("媒体仍被内容引用，不能删除")
)

type ThemeManifest struct {
	Name       string            `json:"name"`
	Version    string            `json:"version"`
	Engine     string            `json:"engine"`
	Templates  map[string]string `json:"templates"`
	Entrypoint string            `json:"entrypoint"`
}

type Theme struct {
	ID      int64  `json:"id"`
	Name    string `json:"name"`
	Version string `json:"version"`
	SHA256  string `json:"sha256"`
}

func New(db *sql.DB, uploadDir, themeDir string, maxUploadBytes, maxThemeBytes int64, antivirusCommand string) (*Store, error) {
	for _, directory := range []string{uploadDir, themeDir} {
		if err := os.MkdirAll(directory, 0o750); err != nil {
			return nil, fmt.Errorf("create protected storage: %w", err)
		}
	}
	if antivirusCommand != "" {
		resolved, err := exec.LookPath(antivirusCommand)
		if err != nil {
			return nil, fmt.Errorf("find antivirus command: %w", err)
		}
		antivirusCommand = resolved
	}
	return &Store{db: db, uploadDir: uploadDir, themeDir: themeDir, maxUploadBytes: maxUploadBytes, maxThemeBytes: maxThemeBytes, antivirusCommand: antivirusCommand}, nil
}

func (s *Store) SaveMedia(ctx context.Context, source io.Reader, originalName string, declaredSize int64, userID int64) (Media, error) {
	originalName = filepath.Base(strings.TrimSpace(originalName))
	if !safeOriginalName.MatchString(originalName) {
		return Media{}, errors.New("文件名包含不允许的字符或长度超过限制")
	}
	if declaredSize > s.maxUploadBytes {
		return Media{}, errors.New("文件超过上传大小限制")
	}
	temporary, err := os.CreateTemp(s.uploadDir, ".upload-*")
	if err != nil {
		return Media{}, err
	}
	temporaryName := temporary.Name()
	defer func() { _ = os.Remove(temporaryName) }()
	written, err := io.Copy(temporary, io.LimitReader(source, s.maxUploadBytes+1))
	closeErr := temporary.Close()
	if err != nil {
		return Media{}, err
	}
	if closeErr != nil {
		return Media{}, closeErr
	}
	if written == 0 || written > s.maxUploadBytes {
		return Media{}, errors.New("文件为空或超过上传大小限制")
	}

	file, err := os.Open(temporaryName)
	if err != nil {
		return Media{}, err
	}
	header := make([]byte, 512)
	read, _ := io.ReadFull(file, header)
	_, _ = file.Seek(0, io.SeekStart)
	detected := DetectImageContentType(header[:read])
	ok := mediaImageExtension(detected) != ""
	if !ok {
		file.Close()
		return Media{}, fmt.Errorf("不允许的文件类型 %q；仅支持 JPEG、PNG、GIF、WebP 或 AVIF 图片", detected)
	}
	if declaredImageType(filepath.Ext(originalName)) != "" && declaredImageType(filepath.Ext(originalName)) != detected {
		file.Close()
		return Media{}, errors.New("文件扩展名与真实内容类型不一致")
	}
	imageConfig, err := decodedImageConfig(file, detected)
	if err != nil || imageConfig.Width < 1 || imageConfig.Height < 1 || imageConfig.Width > 16000 || imageConfig.Height > 16000 || int64(imageConfig.Width)*int64(imageConfig.Height) > 40_000_000 {
		file.Close()
		return Media{}, errors.New("图片损坏或像素尺寸超过安全限制")
	}
	if _, err = file.Seek(0, io.SeekStart); err != nil {
		file.Close()
		return Media{}, err
	}
	decodedImage, err := decodeVerifiedImage(file, detected)
	file.Close()
	if err != nil {
		return Media{}, errors.New("图片无法完整解码")
	}
	decodedImage = normalizeAVIFImage(decodedImage)
	imageConfig = imageConfigFor(decodedImage)
	cleanName, written, checksum, err := s.encodeAVIFImage(ctx, decodedImage)
	if err != nil {
		return Media{}, err
	}
	_ = os.Remove(temporaryName)
	temporaryName = cleanName
	storageID, err := randomID()
	if err != nil {
		return Media{}, err
	}
	storageName := storageID + ".avif"
	finalPath := filepath.Join(s.uploadDir, storageName)
	if err = os.Rename(temporaryName, finalPath); err != nil {
		return Media{}, err
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := s.db.ExecContext(ctx, `INSERT INTO media_files(storage_name, original_name, media_type, avif_encoder, byte_size, sha256, width, height, uploaded_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, storageName, originalName, "image/avif", browserAVIFEncoder, written, checksum, imageConfig.Width, imageConfig.Height, userID, now, now)
	if err != nil {
		_ = os.Remove(finalPath)
		return Media{}, err
	}
	id, err := result.LastInsertId()
	return Media{ID: id, OriginalName: originalName, MediaType: "image/avif", ByteSize: written, SHA256: checksum, Width: imageConfig.Width, Height: imageConfig.Height, UploadedBy: userID, Version: 1, CreatedAt: now, UpdatedAt: now, URL: PublicMediaURL(id, checksum)}, err
}

func decodedImageConfig(file *os.File, mediaType string) (image.Config, error) {
	if mediaType == "image/avif" {
		return gavif.DecodeConfig(file)
	}
	config, _, err := image.DecodeConfig(file)
	return config, err
}

func decodeVerifiedImage(file *os.File, mediaType string) (image.Image, error) {
	if mediaType == "image/avif" {
		return gavif.Decode(file)
	}
	decoded, _, err := image.Decode(file)
	return decoded, err
}

// AVIF images are stored on a chroma-subsampled grid. Tiny tracking pixels and
// odd-sized source images are still valid uploads, so pad only the affected
// edge pixels instead of rejecting them or changing normal images.
func normalizeAVIFImage(source image.Image) image.Image {
	if source == nil {
		return source
	}
	bounds := source.Bounds()
	width, height := bounds.Dx(), bounds.Dy()
	targetWidth, targetHeight := width, height
	if targetWidth < 4 {
		targetWidth = 4
	}
	if targetHeight < 4 {
		targetHeight = 4
	}
	if targetWidth%2 != 0 {
		targetWidth++
	}
	if targetHeight%2 != 0 {
		targetHeight++
	}
	if targetWidth == width && targetHeight == height && bounds.Min == (image.Point{}) {
		return source
	}
	canvas := image.NewRGBA(image.Rect(0, 0, targetWidth, targetHeight))
	for y := 0; y < targetHeight; y++ {
		sourceY := bounds.Min.Y + minImageCoord(y, height)
		for x := 0; x < targetWidth; x++ {
			sourceX := bounds.Min.X + minImageCoord(x, width)
			canvas.Set(x, y, source.At(sourceX, sourceY))
		}
	}
	return canvas
}

func minImageCoord(value, size int) int {
	if size < 1 || value < 0 {
		return 0
	}
	if value >= size {
		return size - 1
	}
	return value
}

func imageConfigFor(source image.Image) image.Config {
	if source == nil {
		return image.Config{}
	}
	bounds := source.Bounds()
	return image.Config{ColorModel: source.ColorModel(), Width: bounds.Dx(), Height: bounds.Dy()}
}

// encodeAVIFImage is deliberately the only image writer in the media store.
// It makes the persisted bytes independent from the supplied filename and
// browser MIME type, strips metadata and keeps the antivirus scan on the
// final public asset instead of on an untrusted source representation.
func (s *Store) encodeAVIFImage(ctx context.Context, decoded image.Image) (string, int64, string, error) {
	cleanFile, err := os.CreateTemp(s.uploadDir, ".clean-*")
	if err != nil {
		return "", 0, "", err
	}
	cleanName := cleanFile.Name()
	cleanup := func(err error) (string, int64, string, error) {
		_ = cleanFile.Close()
		_ = os.Remove(cleanName)
		return "", 0, "", err
	}
	// gav1d's AVIF writer produces an AV1 bitstream that Chromium and libavif
	// both render. The former experimental writer could create an AVIF that
	// passed an internal decode check but appeared as a solid grey image in a
	// real browser. Quality 88 is visually safe for UI screenshots, text and
	// photographs while retaining AVIF's material size reduction.
	if err = gavif.Encode(cleanFile, decoded, gavif.EncodeOptions{
		Quality: 88,
		Speed:   6,
	}); err != nil {
		return cleanup(err)
	}
	if err = cleanFile.Close(); err != nil {
		_ = os.Remove(cleanName)
		return "", 0, "", err
	}
	info, err := os.Stat(cleanName)
	if err != nil || info.Size() < 1 || info.Size() > s.maxUploadBytes {
		_ = os.Remove(cleanName)
		if err != nil {
			return "", 0, "", err
		}
		return "", 0, "", errors.New("规范化后的 AVIF 图片超过大小限制")
	}
	if err = s.scan(ctx, cleanName); err != nil {
		_ = os.Remove(cleanName)
		return "", 0, "", err
	}
	checksum, _, err := checksumFile(cleanName)
	if err != nil {
		_ = os.Remove(cleanName)
		return "", 0, "", err
	}
	return cleanName, info.Size(), checksum, nil
}

// detectImageContentType performs signature checks instead of trusting the
// browser supplied MIME header. http.DetectContentType does not recognize
// AVIF and is deliberately supplemented with the ISO-BMFF AVIF brands.
func DetectImageContentType(header []byte) string {
	if len(header) >= 3 && header[0] == 0xff && header[1] == 0xd8 && header[2] == 0xff {
		return "image/jpeg"
	}
	if len(header) >= 8 && string(header[:8]) == "\x89PNG\r\n\x1a\n" {
		return "image/png"
	}
	if len(header) >= 6 && (string(header[:6]) == "GIF87a" || string(header[:6]) == "GIF89a") {
		return "image/gif"
	}
	if len(header) >= 12 && string(header[:4]) == "RIFF" && string(header[8:12]) == "WEBP" {
		return "image/webp"
	}
	if len(header) >= 12 && string(header[4:8]) == "ftyp" {
		for offset := 8; offset+4 <= len(header); offset += 4 {
			brand := string(header[offset : offset+4])
			if brand == "avif" || brand == "avis" {
				return "image/avif"
			}
		}
	}
	return http.DetectContentType(header)
}

// ImageExtension returns a safe generated filename suffix for a verified
// image MIME type. Callers must still pass the bytes through SaveMedia.
func ImageExtension(mediaType string) string {
	return mediaImageExtension(mediaType)
}

func mediaImageExtension(mediaType string) string {
	switch mediaType {
	case "image/jpeg":
		return ".jpg"
	case "image/png":
		return ".png"
	case "image/gif":
		return ".gif"
	case "image/webp":
		return ".webp"
	case "image/avif":
		return ".avif"
	default:
		return ""
	}
}

func declaredImageType(ext string) string {
	switch strings.ToLower(strings.TrimSpace(ext)) {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	case ".avif":
		return "image/avif"
	default:
		return ""
	}
}

// ListMedia returns stable, paginated library rows. ReferenceCount covers
// structured covers, rich-text image URLs and site icons so deletion protection
// does not depend on the admin client doing the right thing.
func (s *Store) ListMedia(ctx context.Context, options MediaListOptions) (MediaListResult, error) {
	if options.Limit < 1 || options.Limit > 200 {
		options.Limit = 50
	}
	if options.Offset < 0 || options.Offset > 1_000_000 {
		options.Offset = 0
	}
	where := []string{"1=1"}
	args := make([]any, 0, 4)
	query := strings.TrimSpace(options.Query)
	if query != "" {
		where = append(where, `(m.original_name LIKE ? ESCAPE '\' OR m.alt_text LIKE ? ESCAPE '\')`)
		pattern := "%" + escapeLike(query) + "%"
		args = append(args, pattern, pattern)
	}
	if options.MissingAlt {
		where = append(where, `trim(m.alt_text) = ''`)
	}
	clause := strings.Join(where, " AND ")
	var result MediaListResult
	if err := s.db.QueryRowContext(ctx, `SELECT COUNT(*), COALESCE(SUM(m.byte_size), 0),
		COALESCE(SUM(CASE WHEN trim(m.alt_text) = '' THEN 1 ELSE 0 END), 0),
		COALESCE(SUM((SELECT COUNT(*) FROM content_locales cl WHERE cl.cover_media_id = m.id)
			+ (SELECT COUNT(*) FROM content_locales cl WHERE cl.body_html LIKE '%/media/' || m.id || '/%')
			+ (SELECT COUNT(*) FROM sites s WHERE s.favicon_media_id = m.id)), 0)
		FROM media_files m WHERE `+clause, args...).Scan(&result.Total, &result.TotalBytes, &result.MissingAltTotal, &result.ReferenceTotal); err != nil {
		return MediaListResult{}, err
	}
	listArgs := append(append([]any(nil), args...), options.Limit, options.Offset)
	rows, err := s.db.QueryContext(ctx, `
		SELECT m.id, m.original_name, m.media_type, m.byte_size, m.sha256, m.width, m.height,
		       m.alt_text, m.uploaded_by, COALESCE(u.display_name, u.username, ''), m.version,
		       m.created_at, m.updated_at,
		       (SELECT COUNT(*) FROM content_locales cl WHERE cl.cover_media_id = m.id)
		       + (SELECT COUNT(*) FROM content_locales cl WHERE cl.body_html LIKE '%/media/' || m.id || '/%')
		       + (SELECT COUNT(*) FROM sites s WHERE s.favicon_media_id = m.id)
		FROM media_files m LEFT JOIN users u ON u.id = m.uploaded_by
		WHERE `+clause+`
		ORDER BY m.created_at DESC, m.id DESC LIMIT ? OFFSET ?`, listArgs...)
	if err != nil {
		return MediaListResult{}, err
	}
	defer rows.Close()
	result.Items = make([]Media, 0)
	for rows.Next() {
		var item Media
		if err = rows.Scan(&item.ID, &item.OriginalName, &item.MediaType, &item.ByteSize, &item.SHA256, &item.Width, &item.Height, &item.AltText, &item.UploadedBy, &item.UploaderName, &item.Version, &item.CreatedAt, &item.UpdatedAt, &item.ReferenceCount); err != nil {
			return MediaListResult{}, err
		}
		item.URL = PublicMediaURL(item.ID, item.SHA256)
		result.Items = append(result.Items, item)
	}
	return result, rows.Err()
}

func (s *Store) UpdateMediaAlt(ctx context.Context, id, version int64, altText string) (Media, error) {
	altText = strings.TrimSpace(altText)
	if id < 1 || version < 1 {
		return Media{}, ErrMediaNotFound
	}
	if utf8.RuneCountInString(altText) > 500 {
		return Media{}, errors.New("Alt 文本不能超过 500 个字符")
	}
	result, err := s.db.ExecContext(ctx, `UPDATE media_files SET alt_text = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?`, altText, time.Now().UTC().Format(time.RFC3339Nano), id, version)
	if err != nil {
		return Media{}, err
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		var exists int
		if err = s.db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM media_files WHERE id = ?)`, id).Scan(&exists); err != nil {
			return Media{}, err
		}
		if exists == 1 {
			return Media{}, ErrMediaConflict
		}
		return Media{}, ErrMediaNotFound
	}
	return s.mediaByID(ctx, id)
}

func (s *Store) DeleteMedia(ctx context.Context, id, version int64) error {
	if id < 1 || version < 1 {
		return ErrMediaNotFound
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	var storageName string
	var currentVersion int64
	if err = tx.QueryRowContext(ctx, `SELECT storage_name, version FROM media_files WHERE id = ?`, id).Scan(&storageName, &currentVersion); errors.Is(err, sql.ErrNoRows) {
		return ErrMediaNotFound
	} else if err != nil {
		return err
	}
	if currentVersion != version {
		return ErrMediaConflict
	}
	var references int64
	if err = tx.QueryRowContext(ctx, `SELECT
		(SELECT COUNT(*) FROM content_locales WHERE cover_media_id = ?)
		+ (SELECT COUNT(*) FROM content_locales WHERE body_html LIKE ?)
		+ (SELECT COUNT(*) FROM sites WHERE favicon_media_id = ?)`, id, "%/media/"+fmt.Sprint(id)+"/%", id).Scan(&references); err != nil {
		return err
	}
	if references > 0 {
		return ErrMediaInUse
	}
	if storageName == "." || storageName == "" || storageName != filepath.Clean(storageName) || filepath.Base(storageName) != storageName || strings.Contains(storageName, `..`) {
		return ErrMediaNotFound
	}
	if _, err = tx.ExecContext(ctx, `DELETE FROM media_files WHERE id = ? AND version = ?`, id, version); err != nil {
		return err
	}
	if err = tx.Commit(); err != nil {
		return err
	}
	// The database is authoritative. A failed unlink only leaves an
	// unaddressable orphan for storage maintenance; it must not make the client
	// retry a destructive request whose database transaction already committed.
	_ = os.Remove(filepath.Join(s.uploadDir, storageName))
	return nil
}

func (s *Store) mediaByID(ctx context.Context, id int64) (Media, error) {
	var item Media
	err := s.db.QueryRowContext(ctx, `
		SELECT m.id, m.original_name, m.media_type, m.byte_size, m.sha256, m.width, m.height,
		       m.alt_text, m.uploaded_by, COALESCE(u.display_name, u.username, ''), m.version,
		       m.created_at, m.updated_at,
		       (SELECT COUNT(*) FROM content_locales cl WHERE cl.cover_media_id = m.id)
		       + (SELECT COUNT(*) FROM content_locales cl WHERE cl.body_html LIKE '%/media/' || m.id || '/%')
		       + (SELECT COUNT(*) FROM sites s WHERE s.favicon_media_id = m.id)
		FROM media_files m LEFT JOIN users u ON u.id = m.uploaded_by WHERE m.id = ?`, id).
		Scan(&item.ID, &item.OriginalName, &item.MediaType, &item.ByteSize, &item.SHA256, &item.Width, &item.Height, &item.AltText, &item.UploadedBy, &item.UploaderName, &item.Version, &item.CreatedAt, &item.UpdatedAt, &item.ReferenceCount)
	if errors.Is(err, sql.ErrNoRows) {
		return Media{}, ErrMediaNotFound
	}
	if err != nil {
		return Media{}, err
	}
	item.URL = PublicMediaURL(item.ID, item.SHA256)
	return item, nil
}

func escapeLike(value string) string {
	value = strings.ReplaceAll(value, `\`, `\\`)
	value = strings.ReplaceAll(value, `%`, `\%`)
	return strings.ReplaceAll(value, `_`, `\_`)
}

// PublicMediaURL includes a checksum token so unpublished sequential IDs are
// not sufficient to enumerate media files. The token also makes the URL safe
// for immutable browser and CDN caching.
func PublicMediaURL(id int64, checksum string) string {
	token := checksum
	if len(token) > 16 {
		token = token[:16]
	}
	return fmt.Sprintf("/media/%d/%s", id, token)
}

// OpenMedia resolves a media ID through the database and opens the generated
// storage file. The caller owns the returned file and must close it. A raw
// filename is never accepted from the request, preventing path traversal.
func (s *Store) OpenMedia(ctx context.Context, id int64) (Media, *os.File, os.FileInfo, error) {
	if id < 1 {
		return Media{}, nil, nil, ErrMediaNotFound
	}
	var media Media
	var storageName string
	if err := s.db.QueryRowContext(ctx, `SELECT storage_name, original_name, media_type, byte_size, sha256, width, height FROM media_files WHERE id = ?`, id).
		Scan(&storageName, &media.OriginalName, &media.MediaType, &media.ByteSize, &media.SHA256, &media.Width, &media.Height); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Media{}, nil, nil, ErrMediaNotFound
		}
		return Media{}, nil, nil, err
	}
	media.ID = id
	media.URL = PublicMediaURL(id, media.SHA256)
	if storageName == "." || storageName == "" || storageName != filepath.Clean(storageName) || filepath.Base(storageName) != storageName || strings.Contains(storageName, `..`) {
		return Media{}, nil, nil, ErrMediaNotFound
	}
	file, err := os.Open(filepath.Join(s.uploadDir, storageName))
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return Media{}, nil, nil, ErrMediaNotFound
		}
		return Media{}, nil, nil, err
	}
	info, err := file.Stat()
	if err != nil {
		file.Close()
		return Media{}, nil, nil, err
	}
	return media, file, info, nil
}

// AVIFMigrationResult reports a bounded conversion pass over media uploaded
// before CZCMS started normalizing every image to AVIF.
type AVIFMigrationResult struct {
	Scanned   int `json:"scanned"`
	Converted int `json:"converted"`
	Failed    int `json:"failed"`
	Remaining int `json:"remaining"`
}

type legacyMedia struct {
	ID          int64
	StorageName string
	SHA256      string
}

// MigrateExistingMediaToAVIF converts a bounded batch so an old library can
// be upgraded without holding an admin request open for an unbounded amount
// of time. It also repairs the malformed AVIF files emitted by the former
// experimental encoder. The same media IDs are retained: cover and favicon
// references stay valid, while rich-text image URLs use a new checksum token.
func (s *Store) MigrateExistingMediaToAVIF(ctx context.Context, batchSize int) (AVIFMigrationResult, error) {
	if batchSize < 1 || batchSize > 50 {
		batchSize = 12
	}
	s.migrateMu.Lock()
	defer s.migrateMu.Unlock()

	rows, err := s.db.QueryContext(ctx, `SELECT id, storage_name, sha256 FROM media_files WHERE media_type <> 'image/avif' OR (media_type = 'image/avif' AND avif_encoder <> ?) ORDER BY id LIMIT ?`, browserAVIFEncoder, batchSize)
	if err != nil {
		return AVIFMigrationResult{}, err
	}
	items := make([]legacyMedia, 0, batchSize)
	for rows.Next() {
		var item legacyMedia
		if err = rows.Scan(&item.ID, &item.StorageName, &item.SHA256); err != nil {
			rows.Close()
			return AVIFMigrationResult{}, err
		}
		items = append(items, item)
	}
	if err = rows.Close(); err != nil {
		return AVIFMigrationResult{}, err
	}

	result := AVIFMigrationResult{Scanned: len(items)}
	for _, item := range items {
		if err = ctx.Err(); err != nil {
			return result, err
		}
		current, currentErr := s.usesBrowserAVIFEncoder(item)
		if currentErr != nil {
			result.Failed++
			continue
		}
		if current {
			if err = s.markBrowserAVIFEncoder(ctx, item); err != nil {
				result.Failed++
			}
			continue
		}
		if err = s.migrateOneMediaToAVIF(ctx, item); err != nil {
			result.Failed++
			continue
		}
		result.Converted++
	}
	if err = s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM media_files WHERE media_type <> 'image/avif' OR (media_type = 'image/avif' AND avif_encoder <> ?)`, browserAVIFEncoder).Scan(&result.Remaining); err != nil {
		return result, err
	}
	return result, nil
}

// usesBrowserAVIFEncoder checks the actual bytes rather than trusting the
// database marker. The current codec performs a complete decode, allowing us
// to identify old browser-incompatible AVIFs while leaving valid files alone.
func (s *Store) usesBrowserAVIFEncoder(item legacyMedia) (bool, error) {
	if item.ID < 1 || item.StorageName == "." || item.StorageName == "" || item.StorageName != filepath.Clean(item.StorageName) || filepath.Base(item.StorageName) != item.StorageName || strings.Contains(item.StorageName, `..`) {
		return false, ErrMediaNotFound
	}
	file, err := os.Open(filepath.Join(s.uploadDir, item.StorageName))
	if err != nil {
		return false, err
	}
	defer file.Close()
	_, err = gavif.Decode(file)
	return err == nil, nil
}

func (s *Store) markBrowserAVIFEncoder(ctx context.Context, item legacyMedia) error {
	updated, err := s.db.ExecContext(ctx, `UPDATE media_files SET avif_encoder = ?, updated_at = ? WHERE id = ? AND storage_name = ? AND sha256 = ?`, browserAVIFEncoder, time.Now().UTC().Format(time.RFC3339Nano), item.ID, item.StorageName, item.SHA256)
	if err != nil {
		return err
	}
	if affected, _ := updated.RowsAffected(); affected != 1 {
		return ErrMediaConflict
	}
	return nil
}

func (s *Store) migrateOneMediaToAVIF(ctx context.Context, item legacyMedia) error {
	if item.ID < 1 || item.StorageName == "." || item.StorageName == "" || item.StorageName != filepath.Clean(item.StorageName) || filepath.Base(item.StorageName) != item.StorageName || strings.Contains(item.StorageName, `..`) {
		return ErrMediaNotFound
	}
	oldPath := filepath.Join(s.uploadDir, item.StorageName)
	file, err := os.Open(oldPath)
	if err != nil {
		return err
	}
	defer file.Close()
	header := make([]byte, 512)
	read, _ := io.ReadFull(file, header)
	detected := DetectImageContentType(header[:read])
	if mediaImageExtension(detected) == "" {
		return errors.New("旧媒体不是可转换的受支持图片")
	}
	if _, err = file.Seek(0, io.SeekStart); err != nil {
		return err
	}
	decoded, err := decodeVerifiedImage(file, detected)
	if err != nil && detected == "image/avif" {
		if _, err = file.Seek(0, io.SeekStart); err != nil {
			return err
		}
		// This fallback is intentionally limited to records already stored by
		// CZCMS. New uploads never reach it: they must pass the current strict
		// decoder at ingress, avoiding a second decoder for untrusted input.
		decoded, err = legacyavif.Decode(file)
	}
	if err != nil {
		return errors.New("旧媒体无法完整解码")
	}
	decoded = normalizeAVIFImage(decoded)
	config := imageConfigFor(decoded)
	if config.Width < 1 || config.Height < 1 || config.Width > 16000 || config.Height > 16000 || int64(config.Width)*int64(config.Height) > 40_000_000 {
		return errors.New("旧媒体图片损坏或像素尺寸超过安全限制")
	}
	if err = file.Close(); err != nil {
		return err
	}
	newPath, byteSize, checksum, err := s.encodeAVIFImage(ctx, decoded)
	if err != nil {
		return err
	}
	storageID, err := randomID()
	if err != nil {
		_ = os.Remove(newPath)
		return err
	}
	storageName := storageID + ".avif"
	finalPath := filepath.Join(s.uploadDir, storageName)
	if err = os.Rename(newPath, finalPath); err != nil {
		_ = os.Remove(newPath)
		return err
	}

	now := time.Now().UTC().Format(time.RFC3339Nano)
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		_ = os.Remove(finalPath)
		return err
	}
	defer tx.Rollback()
	updated, err := tx.ExecContext(ctx, `UPDATE media_files SET storage_name = ?, media_type = 'image/avif', avif_encoder = ?, byte_size = ?, sha256 = ?, width = ?, height = ?, version = version + 1, updated_at = ? WHERE id = ? AND storage_name = ? AND sha256 = ?`, storageName, browserAVIFEncoder, byteSize, checksum, config.Width, config.Height, now, item.ID, item.StorageName, item.SHA256)
	if err != nil {
		_ = os.Remove(finalPath)
		return err
	}
	affected, _ := updated.RowsAffected()
	if affected != 1 {
		_ = os.Remove(finalPath)
		return ErrMediaConflict
	}
	oldURL := PublicMediaURL(item.ID, item.SHA256)
	newURL := PublicMediaURL(item.ID, checksum)
	if _, err = tx.ExecContext(ctx, `UPDATE content_locales SET body_html = REPLACE(body_html, ?, ?), updated_at = ? WHERE instr(body_html, ?) > 0`, oldURL, newURL, now, oldURL); err != nil {
		_ = os.Remove(finalPath)
		return err
	}
	// Revision snapshots can later be restored into a live body. Keep their
	// embedded media URLs in sync as well, otherwise restoring an old revision
	// would resurrect a stale checksum token and create a broken image.
	if _, err = tx.ExecContext(ctx, `UPDATE content_revisions SET snapshot_json = REPLACE(snapshot_json, ?, ?) WHERE instr(snapshot_json, ?) > 0`, oldURL, newURL, oldURL); err != nil {
		_ = os.Remove(finalPath)
		return err
	}
	if err = tx.Commit(); err != nil {
		_ = os.Remove(finalPath)
		return err
	}
	_ = os.Remove(oldPath)
	return nil
}

func (s *Store) SaveTheme(ctx context.Context, source io.Reader, declaredSize int64, userID int64) (Theme, error) {
	if declaredSize > s.maxThemeBytes {
		return Theme{}, errors.New("模板包超过大小限制")
	}
	temporary, err := os.CreateTemp(s.themeDir, ".theme-*.zip")
	if err != nil {
		return Theme{}, err
	}
	temporaryName := temporary.Name()
	defer os.Remove(temporaryName)
	hasher := sha256.New()
	written, err := io.Copy(io.MultiWriter(temporary, hasher), io.LimitReader(source, s.maxThemeBytes+1))
	closeErr := temporary.Close()
	if err != nil {
		return Theme{}, err
	}
	if closeErr != nil {
		return Theme{}, closeErr
	}
	if written == 0 || written > s.maxThemeBytes {
		return Theme{}, errors.New("模板包为空或超过大小限制")
	}
	manifest, err := validateThemeArchive(temporaryName)
	if err != nil {
		return Theme{}, err
	}
	if err = s.scan(ctx, temporaryName); err != nil {
		return Theme{}, err
	}
	storageID, err := randomID()
	if err != nil {
		return Theme{}, err
	}
	storageName := storageID + ".zip"
	finalPath := filepath.Join(s.themeDir, storageName)
	if err = os.Rename(temporaryName, finalPath); err != nil {
		return Theme{}, err
	}
	checksum := hex.EncodeToString(hasher.Sum(nil))
	result, err := s.db.ExecContext(ctx, `INSERT INTO theme_packages(name, version, storage_name, sha256, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, manifest.Name, manifest.Version, storageName, checksum, userID, time.Now().UTC().Format(time.RFC3339Nano))
	if err != nil {
		_ = os.Remove(finalPath)
		return Theme{}, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		_ = os.Remove(finalPath)
		return Theme{}, err
	}
	if err = s.initializeThemeFiles(ctx, id, userID, finalPath, manifest); err != nil {
		_, _ = s.db.ExecContext(ctx, `DELETE FROM theme_packages WHERE id = ?`, id)
		_ = os.Remove(finalPath)
		return Theme{}, err
	}
	return Theme{ID: id, Name: manifest.Name, Version: manifest.Version, SHA256: checksum}, nil
}

func validateThemeArchive(filename string) (ThemeManifest, error) {
	archive, err := zip.OpenReader(filename)
	if err != nil {
		return ThemeManifest{}, errors.New("模板包不是有效 ZIP 文件")
	}
	defer archive.Close()
	if len(archive.File) == 0 || len(archive.File) > 1000 {
		return ThemeManifest{}, errors.New("模板包文件数量无效或超过 1000")
	}
	// Theme packages are declarative. Executable JavaScript and active SVG are
	// deliberately excluded because public templates share the CMS origin.
	allowed := map[string]bool{".html": true, ".css": true, ".json": true, ".png": true, ".jpg": true, ".jpeg": true, ".gif": true, ".webp": true, ".avif": true, ".woff2": true, ".txt": true}
	var total uint64
	var manifest ThemeManifest
	manifestFound := false
	archiveFiles := make(map[string]bool, len(archive.File))
	for _, entry := range archive.File {
		name := strings.ReplaceAll(entry.Name, "\\", "/")
		cleaned := path.Clean(strings.TrimSuffix(name, "/"))
		if strings.TrimSuffix(name, "/") != cleaned || cleaned == "." || strings.HasPrefix(cleaned, "../") || strings.HasPrefix(cleaned, "/") || strings.Contains(cleaned, ":") {
			return ThemeManifest{}, fmt.Errorf("模板包含不安全路径 %q", entry.Name)
		}
		if entry.Mode()&os.ModeSymlink != 0 {
			return ThemeManifest{}, errors.New("模板包不得包含符号链接")
		}
		if entry.FileInfo().IsDir() {
			continue
		}
		archiveFiles[cleaned] = true
		if !allowed[strings.ToLower(path.Ext(cleaned))] {
			return ThemeManifest{}, fmt.Errorf("模板包含不允许的文件 %q", cleaned)
		}
		total += entry.UncompressedSize64
		if entry.UncompressedSize64 > 50<<20 || total > 200<<20 || (entry.CompressedSize64 > 0 && entry.UncompressedSize64/entry.CompressedSize64 > 100) {
			return ThemeManifest{}, errors.New("模板包解压大小或压缩比超过安全限制")
		}
		reader, err := entry.Open()
		if err != nil {
			return ThemeManifest{}, err
		}
		if cleaned == "theme.json" {
			decoder := json.NewDecoder(io.LimitReader(reader, 64<<10))
			decoder.DisallowUnknownFields()
			err = decoder.Decode(&manifest)
			manifestFound = err == nil
		} else if strings.EqualFold(path.Ext(cleaned), ".html") {
			if entry.UncompressedSize64 > 2<<20 {
				reader.Close()
				return ThemeManifest{}, fmt.Errorf("HTML 模板 %q 超过 2 MiB", cleaned)
			}
			contents, readErr := io.ReadAll(io.LimitReader(reader, 2<<20))
			if readErr == nil {
				err = validatePassiveHTML(contents)
				if err == nil {
					_, err = template.New(cleaned).Option("missingkey=error").Parse(string(contents))
				}
			} else {
				err = readErr
			}
		} else if strings.EqualFold(path.Ext(cleaned), ".css") {
			if entry.UncompressedSize64 > 2<<20 {
				reader.Close()
				return ThemeManifest{}, fmt.Errorf("CSS 文件 %q 超过 2 MiB", cleaned)
			}
			contents, readErr := io.ReadAll(io.LimitReader(reader, 2<<20))
			if readErr == nil {
				err = validatePassiveCSS(contents)
			} else {
				err = readErr
			}
		}
		reader.Close()
		if err != nil {
			return ThemeManifest{}, fmt.Errorf("验证模板文件 %q: %w", cleaned, err)
		}
	}
	if !manifestFound || !safeOriginalName.MatchString(manifest.Name) || !regexp.MustCompile(`^[0-9]+\.[0-9]+\.[0-9]+(?:-[A-Za-z0-9.-]+)?$`).MatchString(manifest.Version) || manifest.Engine != "go-html-template-v1" {
		return ThemeManifest{}, errors.New("theme.json 缺失或 name、version、engine 不符合规范")
	}
	if manifest.Entrypoint == "" || path.Clean(manifest.Entrypoint) != manifest.Entrypoint || !strings.HasSuffix(manifest.Entrypoint, ".html") {
		return ThemeManifest{}, errors.New("模板入口文件无效")
	}
	if !archiveFiles[manifest.Entrypoint] {
		return ThemeManifest{}, errors.New("模板入口文件不存在")
	}
	for templateType, filename := range manifest.Templates {
		if templateType == "" || path.Clean(filename) != filename || !strings.HasSuffix(filename, ".html") || !archiveFiles[filename] {
			return ThemeManifest{}, fmt.Errorf("模板映射 %q 指向不存在或不安全的文件", templateType)
		}
	}
	return manifest, nil
}

var (
	activeHTMLTag     = regexp.MustCompile(`(?is)<\s*(script|style|link|iframe|object|embed|base|meta)\b`)
	eventAttribute    = regexp.MustCompile(`(?is)\son[a-z0-9_-]+\s*=`)
	inlineStyle       = regexp.MustCompile(`(?is)\sstyle\s*=`)
	dangerousURI      = regexp.MustCompile(`(?is)(javascript\s*:|data\s*:\s*text/html)`)
	externalCSSURL    = regexp.MustCompile(`(?is)url\s*\(\s*['"]?\s*(https?:|//|data:)`)
	recursiveTemplate = regexp.MustCompile(`(?is){{\s*(template|block|define)\b`)
)

func validatePassiveHTML(contents []byte) error {
	if activeHTMLTag.Match(contents) || eventAttribute.Match(contents) || inlineStyle.Match(contents) || dangerousURI.Match(contents) || recursiveTemplate.Match(contents) {
		return errors.New("模板 HTML 包含脚本、事件属性或危险 URL")
	}
	return nil
}

func validatePassiveCSS(contents []byte) error {
	lower := strings.ToLower(string(contents))
	if strings.Contains(lower, "@import") || strings.Contains(lower, "expression(") || strings.Contains(lower, "behavior:") || strings.Contains(lower, "-moz-binding") || dangerousURI.Match(contents) || externalCSSURL.Match(contents) {
		return errors.New("模板 CSS 包含外部资源或可执行表达式")
	}
	return nil
}

// ValidateThemeSource applies the same passive-template rules used for ZIP
// installation to a single editable source. The filename is taken from the
// database-owned theme manifest, never directly from a request path.
func ValidateThemeSource(filename, source string) error {
	if !utf8.ValidString(source) {
		return errors.New("模板文件必须是有效 UTF-8 文本")
	}
	if strings.TrimSpace(source) == "" {
		return errors.New("模板文件不能为空")
	}
	if len(source) > 2<<20 {
		return errors.New("单个模板文件不能超过 2 MiB")
	}
	switch strings.ToLower(path.Ext(filename)) {
	case ".html":
		contents := []byte(source)
		if err := validatePassiveHTML(contents); err != nil {
			return err
		}
		if _, err := template.New(filename).Option("missingkey=error").Parse(source); err != nil {
			return fmt.Errorf("Go HTML 模板语法错误: %w", err)
		}
		return nil
	case ".css":
		return validatePassiveCSS([]byte(source))
	default:
		return errors.New("此文件类型不允许在线编辑")
	}
}

func (s *Store) scan(ctx context.Context, filename string) error {
	if s.antivirusCommand == "" {
		return nil
	}
	commandCtx, cancel := context.WithTimeout(ctx, 45*time.Second)
	defer cancel()
	command := exec.CommandContext(commandCtx, s.antivirusCommand, filename)
	command.Env = os.Environ()
	if output, err := command.CombinedOutput(); err != nil {
		_ = output
		return errors.New("防病毒扫描未通过")
	}
	return nil
}

func randomID() (string, error) {
	raw := make([]byte, 20)
	if _, err := rand.Read(raw); err != nil {
		return "", err
	}
	return hex.EncodeToString(raw), nil
}

func checksumFile(filename string) (string, int64, error) {
	file, err := os.Open(filename)
	if err != nil {
		return "", 0, err
	}
	defer file.Close()
	hasher := sha256.New()
	size, err := io.Copy(hasher, file)
	return hex.EncodeToString(hasher.Sum(nil)), size, err
}
