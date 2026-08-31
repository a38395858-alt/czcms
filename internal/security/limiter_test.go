package security

import (
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func TestLimiterConcurrentBurstBound(t *testing.T) {
	limiter := NewLimiter(10, time.Minute, 5, 100)
	var allowed int64
	var group sync.WaitGroup
	for range 100 {
		group.Add(1)
		go func() {
			defer group.Done()
			if limiter.Allow("same-key") {
				atomic.AddInt64(&allowed, 1)
			}
		}()
	}
	group.Wait()
	if allowed != 5 {
		t.Fatalf("allowed=%d want=5", allowed)
	}
}
