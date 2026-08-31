package cache

import (
	"context"
	"errors"
	"sync"
	"time"
)

var ErrMiss = errors.New("cache miss")

type Store interface {
	Get(context.Context, string) ([]byte, error)
	Set(context.Context, string, []byte, time.Duration) error
	Delete(context.Context, ...string) error
	Close() error
}

type entry struct {
	value     []byte
	expiresAt time.Time
	createdAt time.Time
}

type Memory struct {
	mu      sync.RWMutex
	entries map[string]entry
	now     func() time.Time
	maxSize int
}

func NewMemory() *Memory {
	return &Memory{entries: make(map[string]entry), now: time.Now, maxSize: 4096}
}

func (m *Memory) Get(_ context.Context, key string) ([]byte, error) {
	m.mu.RLock()
	item, ok := m.entries[key]
	m.mu.RUnlock()
	if !ok {
		return nil, ErrMiss
	}
	if !item.expiresAt.IsZero() && m.now().After(item.expiresAt) {
		m.mu.Lock()
		delete(m.entries, key)
		m.mu.Unlock()
		return nil, ErrMiss
	}
	return append([]byte(nil), item.value...), nil
}

func (m *Memory) Set(_ context.Context, key string, value []byte, ttl time.Duration) error {
	now := m.now()
	item := entry{value: append([]byte(nil), value...), createdAt: now}
	if ttl > 0 {
		item.expiresAt = now.Add(ttl)
	}
	m.mu.Lock()
	if _, exists := m.entries[key]; !exists && len(m.entries) >= m.maxSize {
		m.evictOne(now)
	}
	m.entries[key] = item
	m.mu.Unlock()
	return nil
}

func (m *Memory) evictOne(now time.Time) {
	var oldestKey string
	var oldestTime time.Time
	for key, item := range m.entries {
		if !item.expiresAt.IsZero() && now.After(item.expiresAt) {
			delete(m.entries, key)
			return
		}
		if oldestKey == "" || item.createdAt.Before(oldestTime) {
			oldestKey, oldestTime = key, item.createdAt
		}
	}
	if oldestKey != "" {
		delete(m.entries, oldestKey)
	}
}

func (m *Memory) Delete(_ context.Context, keys ...string) error {
	m.mu.Lock()
	for _, key := range keys {
		delete(m.entries, key)
	}
	m.mu.Unlock()
	return nil
}

func (m *Memory) Close() error {
	m.mu.Lock()
	clear(m.entries)
	m.mu.Unlock()
	return nil
}
