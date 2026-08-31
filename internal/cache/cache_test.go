package cache

import (
	"context"
	"errors"
	"testing"
	"time"
)

func TestMemoryCopiesValuesAndExpires(t *testing.T) {
	store := NewMemory()
	now := time.Unix(1_700_000_000, 0)
	store.now = func() time.Time { return now }

	value := []byte("CZCMS")
	if err := store.Set(context.Background(), "site:1", value, time.Minute); err != nil {
		t.Fatal(err)
	}
	value[0] = 'X'

	cached, err := store.Get(context.Background(), "site:1")
	if err != nil {
		t.Fatal(err)
	}
	if string(cached) != "CZCMS" {
		t.Fatalf("缓存值被外部修改: %q", cached)
	}

	now = now.Add(2 * time.Minute)
	if _, err = store.Get(context.Background(), "site:1"); !errors.Is(err, ErrMiss) {
		t.Fatalf("过期缓存应返回 ErrMiss，实际为 %v", err)
	}
}
