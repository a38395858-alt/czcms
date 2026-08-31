package app

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"net"
	"net/http"
	"path/filepath"
	"strconv"
	"testing"
	"time"

	"czcms/internal/config"
	"czcms/internal/database"
)

func TestLocalPreviewManagerSyncsDistinctPorts(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "preview-ports.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	firstPort, secondPort := availableLocalPorts(t)
	if _, err = db.ExecContext(ctx, `UPDATE sites SET status = 'disabled' WHERE code <> 'global'`); err != nil {
		t.Fatal(err)
	}
	if _, err = db.ExecContext(ctx, `UPDATE sites SET local_port = ? WHERE code = 'global'`, firstPort); err != nil {
		t.Fatal(err)
	}
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	manager := newLocalPreviewManager(config.Config{Environment: "development", HTTPAddr: "127.0.0.1:8080", LocalPreviewListeners: true}, db, logger)
	manager.SetHandler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { _, _ = io.WriteString(w, r.URL.Path) }))
	if err = manager.Sync(); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = manager.Close(context.Background()) })
	assertPreviewPort(t, firstPort, "/preview/global")

	if _, err = db.ExecContext(ctx, `UPDATE sites SET local_port = ? WHERE code = 'global'`, secondPort); err != nil {
		t.Fatal(err)
	}
	if err = manager.Sync(); err != nil {
		t.Fatal(err)
	}
	assertPreviewPort(t, secondPort, "/preview/global")
}

func availableLocalPorts(t *testing.T) (int, int) {
	t.Helper()
	first, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer first.Close()
	second, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer second.Close()
	_, firstRaw, _ := net.SplitHostPort(first.Addr().String())
	_, secondRaw, _ := net.SplitHostPort(second.Addr().String())
	firstPort, err := strconv.Atoi(firstRaw)
	if err != nil {
		t.Fatal(err)
	}
	secondPort, err := strconv.Atoi(secondRaw)
	if err != nil {
		t.Fatal(err)
	}
	return firstPort, secondPort
}

func assertPreviewPort(t *testing.T, port int, expected string) {
	t.Helper()
	response, err := http.Get(fmt.Sprintf("http://127.0.0.1:%d/", port))
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	contents, err := io.ReadAll(response.Body)
	if err != nil {
		t.Fatal(err)
	}
	if response.StatusCode != http.StatusOK || string(contents) != expected {
		t.Fatalf("port=%d status=%d body=%q", port, response.StatusCode, contents)
	}
}
