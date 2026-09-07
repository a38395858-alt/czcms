package httpserver

import (
	"bytes"
	"context"
	"image"
	"image/color"
	"image/png"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"net/url"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"czcms/internal/config"
	"czcms/internal/database"
	"czcms/internal/filestore"
	"czcms/internal/security"

	"github.com/go-chi/chi/v5"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (fn roundTripFunc) RoundTrip(request *http.Request) (*http.Response, error) { return fn(request) }

func testHTTPMediaStore(t *testing.T) (*filestore.Store, int64) {
	t.Helper()
	ctx := context.Background()
	root := t.TempDir()
	db, err := database.Open(ctx, filepath.Join(root, "media-http.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	hash, err := security.HashPassword("correct horse battery staple")
	if err != nil {
		t.Fatal(err)
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	result, err := db.ExecContext(ctx, `INSERT INTO users(username, display_name, password_hash, password_changed_at, created_at, updated_at) VALUES ('media-test', 'Media Test', ?, ?, ?, ?)`, hash, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := result.LastInsertId()
	store, err := filestore.New(db, filepath.Join(root, "uploads"), filepath.Join(root, "themes"), 2<<20, 5<<20, "")
	if err != nil {
		t.Fatal(err)
	}
	return store, userID
}

func pngWithTrailingPayload(t *testing.T) []byte {
	t.Helper()
	img := image.NewRGBA(image.Rect(0, 0, 6, 5))
	img.Set(0, 0, color.RGBA{R: 240, G: 80, B: 70, A: 255})
	var encoded bytes.Buffer
	if err := png.Encode(&encoded, img); err != nil {
		t.Fatal(err)
	}
	return append(encoded.Bytes(), []byte("<script>trailing payload</script>")...)
}

func TestRemoteMediaDownloadReencodesAndReturnsPublicURL(t *testing.T) {
	store, userID := testHTTPMediaStore(t)
	payload := pngWithTrailingPayload(t)
	s := &server{Dependencies: Dependencies{Files: store, Config: config.Config{MaxUploadBytes: 2 << 20}, Logger: slog.New(slog.NewTextHandler(io.Discard, nil))}}
	s.remoteMediaClient = &http.Client{Transport: roundTripFunc(func(request *http.Request) (*http.Response, error) {
		return &http.Response{StatusCode: http.StatusOK, Header: http.Header{"Content-Type": []string{"image/png"}}, Body: io.NopCloser(bytes.NewReader(payload)), ContentLength: int64(len(payload)), Request: request}, nil
	})}
	remote, _ := url.Parse("https://8.8.8.8/image.png")
	media, err := s.downloadRemoteMedia(context.Background(), remote, userID)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(media.URL, "/media/") || len(strings.Split(media.URL, "/")) != 4 {
		t.Fatalf("public media URL=%q", media.URL)
	}
	_, file, _, err := store.OpenMedia(context.Background(), media.ID)
	if err != nil {
		t.Fatal(err)
	}
	stored, err := io.ReadAll(file)
	file.Close()
	if err != nil {
		t.Fatal(err)
	}
	if bytes.Contains(stored, []byte("trailing payload")) {
		t.Fatal("remote image bypassed media re-encoding")
	}

	router := chi.NewRouter()
	router.Get("/media/{mediaID}/{token}", s.mediaServe)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, media.URL, nil))
	if recorder.Code != http.StatusOK || recorder.Header().Get("Content-Type") != "image/avif" || !strings.Contains(recorder.Header().Get("Cache-Control"), "immutable") || recorder.Header().Get("X-Content-Type-Options") != "nosniff" {
		t.Fatalf("unsafe media response: code=%d headers=%v", recorder.Code, recorder.Header())
	}
	stale := httptest.NewRecorder()
	router.ServeHTTP(stale, httptest.NewRequest(http.MethodGet, "/media/"+strings.Split(media.URL, "/")[2]+"/0000000000000000", nil))
	if stale.Code != http.StatusNotFound {
		t.Fatalf("stale media token served with status %d", stale.Code)
	}
}

func TestRemoteMediaDownloadRejectsNonImageAndOversize(t *testing.T) {
	store, userID := testHTTPMediaStore(t)
	remote, _ := url.Parse("https://8.8.8.8/not-image")
	for name, body := range map[string][]byte{
		"not-image": []byte("plain text"),
		"oversize":  bytes.Repeat([]byte{1}, 1025),
	} {
		t.Run(name, func(t *testing.T) {
			s := &server{Dependencies: Dependencies{Files: store, Config: config.Config{MaxUploadBytes: 1024}}}
			s.remoteMediaClient = &http.Client{Transport: roundTripFunc(func(request *http.Request) (*http.Response, error) {
				return &http.Response{StatusCode: http.StatusOK, Header: make(http.Header), Body: io.NopCloser(bytes.NewReader(body)), ContentLength: int64(len(body)), Request: request}, nil
			})}
			if _, err := s.downloadRemoteMedia(context.Background(), remote, userID); err == nil {
				t.Fatalf("%s remote response accepted", name)
			}
		})
	}
}
