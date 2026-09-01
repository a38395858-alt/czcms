package config

import (
	"fmt"
	"net"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Environment           string
	HTTPAddr              string
	DatabasePath          string
	RedisAddr             string
	RedisUsername         string
	RedisPassword         string
	RedisDB               int
	RedisTLS              bool
	RedisTLSServerName    string
	RedisCAFile           string
	CacheTTL              time.Duration
	RequestTimeout        time.Duration
	SessionIdleTTL        time.Duration
	SessionAbsoluteTTL    time.Duration
	CookieSecure          bool
	PublicHTTPS           bool
	LocalPreviewListeners bool
	TLSCertFile           string
	TLSKeyFile            string
	TrustedProxies        []string
	MasterKey             string
	SetupToken            string
	SecretsDir            string
	UploadDir             string
	ThemeDir              string
	BackupDir             string
	BackupKey             string
	MaxUploadBytes        int64
	MaxThemeBytes         int64
	AntivirusCommand      string
	AIBaseURL             string
	AIAPIKey              string
	AIModel               string
	AIRequestTimeout      time.Duration
}

func Load() (Config, error) {
	redisDB, err := intEnv("CZCMS_REDIS_DB", 0)
	if err != nil || redisDB < 0 {
		return Config{}, fmt.Errorf("CZCMS_REDIS_DB 必须是非负整数")
	}
	maxUploadMB, err := intEnv("CZCMS_MAX_UPLOAD_MB", 12)
	if err != nil || maxUploadMB < 1 || maxUploadMB > 100 {
		return Config{}, fmt.Errorf("CZCMS_MAX_UPLOAD_MB 必须是 1 到 100")
	}
	maxThemeMB, err := intEnv("CZCMS_MAX_THEME_MB", 50)
	if err != nil || maxThemeMB < 1 || maxThemeMB > 200 {
		return Config{}, fmt.Errorf("CZCMS_MAX_THEME_MB 必须是 1 到 200")
	}

	cfg := Config{
		Environment:        strings.ToLower(env("CZCMS_ENV", "development")),
		HTTPAddr:           env("CZCMS_HTTP_ADDR", "127.0.0.1:8080"),
		DatabasePath:       env("CZCMS_DB_PATH", filepath.Join("var", "data", "czcms.db")),
		RedisAddr:          os.Getenv("CZCMS_REDIS_ADDR"),
		RedisUsername:      os.Getenv("CZCMS_REDIS_USERNAME"),
		RedisPassword:      os.Getenv("CZCMS_REDIS_PASSWORD"),
		RedisDB:            redisDB,
		RedisTLSServerName: os.Getenv("CZCMS_REDIS_TLS_SERVER_NAME"),
		RedisCAFile:        os.Getenv("CZCMS_REDIS_CA_FILE"),
		TLSCertFile:        os.Getenv("CZCMS_TLS_CERT_FILE"),
		TLSKeyFile:         os.Getenv("CZCMS_TLS_KEY_FILE"),
		MasterKey:          os.Getenv("CZCMS_MASTER_KEY"),
		SetupToken:         os.Getenv("CZCMS_SETUP_TOKEN"),
		BackupKey:          os.Getenv("CZCMS_BACKUP_KEY"),
		SecretsDir:         env("CZCMS_SECRETS_DIR", filepath.Join("var", "secrets")),
		UploadDir:          env("CZCMS_UPLOAD_DIR", filepath.Join("var", "uploads")),
		ThemeDir:           env("CZCMS_THEME_DIR", filepath.Join("var", "themes")),
		BackupDir:          env("CZCMS_BACKUP_DIR", filepath.Join("var", "backups")),
		MaxUploadBytes:     int64(maxUploadMB) << 20,
		MaxThemeBytes:      int64(maxThemeMB) << 20,
		AntivirusCommand:   os.Getenv("CZCMS_ANTIVIRUS_COMMAND"),
		AIBaseURL:          strings.TrimSpace(os.Getenv("CZCMS_AI_BASE_URL")),
		AIAPIKey:           strings.TrimSpace(os.Getenv("CZCMS_AI_API_KEY")),
		AIModel:            strings.TrimSpace(os.Getenv("CZCMS_AI_MODEL")),
	}
	if cfg.DatabasePath == ":memory:" {
		cfg.DatabasePath = "file:czcms?mode=memory&cache=shared"
	}
	if cfg.CacheTTL, err = durationEnv("CZCMS_CACHE_TTL", 5*time.Minute); err != nil || cfg.CacheTTL <= 0 {
		return Config{}, fmt.Errorf("CZCMS_CACHE_TTL 必须是有效的正数时间")
	}
	if cfg.RequestTimeout, err = durationEnv("CZCMS_REQUEST_TIMEOUT", 10*time.Second); err != nil || cfg.RequestTimeout <= 0 {
		return Config{}, fmt.Errorf("CZCMS_REQUEST_TIMEOUT 必须是有效的正数时间")
	}
	if cfg.AIRequestTimeout, err = durationEnv("CZCMS_AI_REQUEST_TIMEOUT", 120*time.Second); err != nil || cfg.AIRequestTimeout < time.Second || cfg.AIRequestTimeout > 2*time.Minute {
		return Config{}, fmt.Errorf("CZCMS_AI_REQUEST_TIMEOUT 必须在 1 秒到 2 分钟之间")
	}
	if cfg.SessionIdleTTL, err = durationEnv("CZCMS_SESSION_IDLE_TTL", 30*time.Minute); err != nil || cfg.SessionIdleTTL < 5*time.Minute {
		return Config{}, fmt.Errorf("CZCMS_SESSION_IDLE_TTL 不能短于 5 分钟")
	}
	if cfg.SessionAbsoluteTTL, err = durationEnv("CZCMS_SESSION_ABSOLUTE_TTL", 12*time.Hour); err != nil || cfg.SessionAbsoluteTTL < cfg.SessionIdleTTL {
		return Config{}, fmt.Errorf("CZCMS_SESSION_ABSOLUTE_TTL 不能短于空闲有效期")
	}
	if cfg.CookieSecure, err = boolEnv("CZCMS_COOKIE_SECURE", cfg.Environment == "production"); err != nil {
		return Config{}, err
	}
	if cfg.PublicHTTPS, err = boolEnv("CZCMS_PUBLIC_HTTPS", cfg.TLSCertFile != ""); err != nil {
		return Config{}, err
	}
	if cfg.LocalPreviewListeners, err = boolEnv("CZCMS_LOCAL_PREVIEW_LISTENERS", cfg.Environment == "development"); err != nil {
		return Config{}, err
	}
	if cfg.RedisTLS, err = boolEnv("CZCMS_REDIS_TLS", false); err != nil {
		return Config{}, err
	}
	if raw := strings.TrimSpace(os.Getenv("CZCMS_TRUSTED_PROXIES")); raw != "" {
		for _, item := range strings.Split(raw, ",") {
			if item = strings.TrimSpace(item); item != "" {
				cfg.TrustedProxies = append(cfg.TrustedProxies, item)
			}
		}
	}
	return cfg.Normalize()
}

// Normalize fills safe defaults for tests and programmatic construction, then
// validates combinations that could otherwise make a production deployment unsafe.
func (cfg Config) Normalize() (Config, error) {
	if cfg.Environment == "" {
		cfg.Environment = "development"
	}
	if cfg.HTTPAddr == "" {
		cfg.HTTPAddr = "127.0.0.1:8080"
	}
	if cfg.DatabasePath == "" {
		cfg.DatabasePath = filepath.Join("var", "data", "czcms.db")
	}
	if cfg.CacheTTL == 0 {
		cfg.CacheTTL = 5 * time.Minute
	}
	if cfg.RequestTimeout == 0 {
		cfg.RequestTimeout = 10 * time.Second
	}
	if cfg.AIRequestTimeout == 0 {
		cfg.AIRequestTimeout = 120 * time.Second
	}
	if cfg.SessionIdleTTL == 0 {
		cfg.SessionIdleTTL = 30 * time.Minute
	}
	if cfg.SessionAbsoluteTTL == 0 {
		cfg.SessionAbsoluteTTL = 12 * time.Hour
	}
	if cfg.SecretsDir == "" {
		cfg.SecretsDir = filepath.Join("var", "secrets")
	}
	if cfg.UploadDir == "" {
		cfg.UploadDir = filepath.Join("var", "uploads")
	}
	if cfg.ThemeDir == "" {
		cfg.ThemeDir = filepath.Join("var", "themes")
	}
	if cfg.BackupDir == "" {
		cfg.BackupDir = filepath.Join("var", "backups")
	}
	if cfg.MaxUploadBytes == 0 {
		cfg.MaxUploadBytes = 12 << 20
	}
	if cfg.MaxThemeBytes == 0 {
		cfg.MaxThemeBytes = 50 << 20
	}
	if (cfg.TLSCertFile == "") != (cfg.TLSKeyFile == "") {
		return Config{}, fmt.Errorf("CZCMS_TLS_CERT_FILE 与 CZCMS_TLS_KEY_FILE 必须同时配置")
	}
	if cfg.AIModel == "" && (cfg.AIBaseURL != "" || cfg.AIAPIKey != "") {
		return Config{}, fmt.Errorf("配置 AI 地址或密钥时必须同时配置 CZCMS_AI_MODEL；完全留空则使用文章默认值")
	}
	for _, trusted := range cfg.TrustedProxies {
		if net.ParseIP(trusted) == nil {
			if _, _, err := net.ParseCIDR(trusted); err != nil {
				return Config{}, fmt.Errorf("无效的受信代理地址 %q", trusted)
			}
		}
	}
	if cfg.Environment == "production" {
		if !cfg.CookieSecure || (!cfg.PublicHTTPS && cfg.TLSCertFile == "") {
			return Config{}, fmt.Errorf("生产环境必须启用 HTTPS 和 Secure Cookie")
		}
		if cfg.MasterKey == "" {
			return Config{}, fmt.Errorf("生产环境必须配置 CZCMS_MASTER_KEY")
		}
		if cfg.BackupKey == "" {
			return Config{}, fmt.Errorf("生产环境必须配置独立的 CZCMS_BACKUP_KEY")
		}
		if len(cfg.SetupToken) < 32 {
			return Config{}, fmt.Errorf("生产环境 CZCMS_SETUP_TOKEN 至少需要 32 个字符")
		}
		if cfg.AntivirusCommand == "" {
			return Config{}, fmt.Errorf("生产环境必须配置 CZCMS_ANTIVIRUS_COMMAND")
		}
		if cfg.RedisAddr != "" && (cfg.RedisUsername == "" || cfg.RedisPassword == "") {
			return Config{}, fmt.Errorf("生产环境 Redis 必须配置 ACL 用户名和密码")
		}
		if cfg.RedisAddr != "" && !cfg.RedisTLS && !isLoopbackAddress(cfg.RedisAddr) {
			return Config{}, fmt.Errorf("非本机 Redis 在生产环境必须启用 TLS")
		}
		if cfg.TLSCertFile == "" {
			if !isLoopbackAddress(cfg.HTTPAddr) {
				return Config{}, fmt.Errorf("由反向代理终止 TLS 时，Go 服务必须监听回环地址")
			}
			if len(cfg.TrustedProxies) == 0 {
				return Config{}, fmt.Errorf("由反向代理终止 TLS 时必须配置 CZCMS_TRUSTED_PROXIES")
			}
		}
	}
	return cfg, nil
}

func isLoopbackAddress(address string) bool {
	host, _, err := net.SplitHostPort(address)
	if err != nil {
		return false
	}
	ip := net.ParseIP(host)
	return ip != nil && ip.IsLoopback()
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func intEnv(key string, fallback int) (int, error) {
	value := os.Getenv(key)
	if value == "" {
		return fallback, nil
	}
	return strconv.Atoi(value)
}

func durationEnv(key string, fallback time.Duration) (time.Duration, error) {
	value := os.Getenv(key)
	if value == "" {
		return fallback, nil
	}
	return time.ParseDuration(value)
}

func boolEnv(key string, fallback bool) (bool, error) {
	value := os.Getenv(key)
	if value == "" {
		return fallback, nil
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return false, fmt.Errorf("%s 必须是 true 或 false", key)
	}
	return parsed, nil
}
