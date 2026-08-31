package cache

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisConfig struct {
	Addr          string
	Username      string
	Password      string
	Database      int
	TLS           bool
	TLSServerName string
	CAFile        string
}

type Redis struct {
	client *redis.Client
}

func NewRedis(ctx context.Context, cfg RedisConfig) (*Redis, error) {
	options := &redis.Options{
		Addr: cfg.Addr, Username: cfg.Username, Password: cfg.Password, DB: cfg.Database,
		DialTimeout: 2 * time.Second, ReadTimeout: time.Second, WriteTimeout: time.Second,
		PoolSize: 16, MinIdleConns: 1,
	}
	if cfg.TLS {
		tlsConfig := &tls.Config{MinVersion: tls.VersionTLS12, ServerName: cfg.TLSServerName}
		if cfg.CAFile != "" {
			contents, err := os.ReadFile(cfg.CAFile)
			if err != nil {
				return nil, fmt.Errorf("read Redis CA: %w", err)
			}
			roots, err := x509.SystemCertPool()
			if err != nil || roots == nil {
				roots = x509.NewCertPool()
			}
			if !roots.AppendCertsFromPEM(contents) {
				return nil, errors.New("Redis CA file contains no valid certificate")
			}
			tlsConfig.RootCAs = roots
		}
		options.TLSConfig = tlsConfig
	}
	client := redis.NewClient(options)
	if err := client.Ping(ctx).Err(); err != nil {
		client.Close()
		return nil, err
	}
	return &Redis{client: client}, nil
}

func (r *Redis) Get(ctx context.Context, key string) ([]byte, error) {
	value, err := r.client.Get(ctx, key).Bytes()
	if errors.Is(err, redis.Nil) {
		return nil, ErrMiss
	}
	return value, err
}

func (r *Redis) Set(ctx context.Context, key string, value []byte, ttl time.Duration) error {
	return r.client.Set(ctx, key, value, ttl).Err()
}

func (r *Redis) Delete(ctx context.Context, keys ...string) error {
	return r.client.Del(ctx, keys...).Err()
}

func (r *Redis) Close() error { return r.client.Close() }
