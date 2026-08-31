package cache

import (
	"context"
	"errors"
	"time"
)

type Layered struct {
	memory *Memory
	redis  Store
	ttl    time.Duration
}

func NewLayered(memory *Memory, redis Store, ttl time.Duration) *Layered {
	return &Layered{memory: memory, redis: redis, ttl: ttl}
}

func (l *Layered) Get(ctx context.Context, key string) ([]byte, error) {
	if value, err := l.memory.Get(ctx, key); err == nil {
		return value, nil
	}
	if l.redis == nil {
		return nil, ErrMiss
	}
	value, err := l.redis.Get(ctx, key)
	if err != nil {
		return nil, err
	}
	_ = l.memory.Set(ctx, key, value, l.ttl)
	return value, nil
}

func (l *Layered) Set(ctx context.Context, key string, value []byte, ttl time.Duration) error {
	if ttl <= 0 {
		ttl = l.ttl
	}
	if err := l.memory.Set(ctx, key, value, ttl); err != nil {
		return err
	}
	if l.redis != nil {
		return l.redis.Set(ctx, key, value, ttl)
	}
	return nil
}

func (l *Layered) Delete(ctx context.Context, keys ...string) error {
	memoryErr := l.memory.Delete(ctx, keys...)
	if l.redis == nil {
		return memoryErr
	}
	return errors.Join(memoryErr, l.redis.Delete(ctx, keys...))
}

func (l *Layered) Close() error {
	if l.redis == nil {
		return l.memory.Close()
	}
	return errors.Join(l.memory.Close(), l.redis.Close())
}
