package security

import (
	"sync"
	"time"
)

type limitEntry struct {
	tokens float64
	last   time.Time
}

// Limiter is an in-process token bucket. It intentionally complements, rather
// than replaces, edge rate limiting. Entries are bounded to avoid memory DoS.
type Limiter struct {
	mu      sync.Mutex
	entries map[string]limitEntry
	rate    float64
	burst   float64
	maxKeys int
	now     func() time.Time
	lastGC  time.Time
	maxIdle time.Duration
}

func NewLimiter(events int, window time.Duration, burst, maxKeys int) *Limiter {
	if events < 1 {
		events = 1
	}
	if window <= 0 {
		window = time.Minute
	}
	if burst < 1 {
		burst = events
	}
	if maxKeys < 100 {
		maxKeys = 100
	}
	now := time.Now()
	return &Limiter{entries: make(map[string]limitEntry), rate: float64(events) / window.Seconds(), burst: float64(burst), maxKeys: maxKeys, now: time.Now, lastGC: now, maxIdle: max(2*window, 10*time.Minute)}
}

func (l *Limiter) Allow(key string) bool {
	now := l.now()
	l.mu.Lock()
	defer l.mu.Unlock()
	if now.Sub(l.lastGC) > time.Minute || len(l.entries) >= l.maxKeys {
		l.gc(now)
	}
	entry, ok := l.entries[key]
	if !ok {
		if len(l.entries) >= l.maxKeys {
			return false
		}
		entry = limitEntry{tokens: l.burst, last: now}
	}
	entry.tokens = min(l.burst, entry.tokens+now.Sub(entry.last).Seconds()*l.rate)
	entry.last = now
	if entry.tokens < 1 {
		l.entries[key] = entry
		return false
	}
	entry.tokens--
	l.entries[key] = entry
	return true
}

func (l *Limiter) gc(now time.Time) {
	for key, entry := range l.entries {
		if now.Sub(entry.last) > l.maxIdle {
			delete(l.entries, key)
		}
	}
	l.lastGC = now
}
