package main

import (
	"context"
	"crypto/tls"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"czcms/internal/app"
	"czcms/internal/backup"
	"czcms/internal/config"
	"czcms/internal/security"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	cfg, err := config.Load()
	if err != nil {
		logger.Error("配置加载失败", "error", err)
		os.Exit(1)
	}
	if len(os.Args) > 1 && os.Args[1] == "backup-restore" {
		if len(os.Args) != 4 {
			logger.Error("用法: czcms backup-restore <备份文件名> <新数据库路径>")
			os.Exit(2)
		}
		keys, keyErr := security.LoadKeyring(cfg.MasterKey, cfg.SecretsDir, cfg.Environment)
		if keyErr != nil {
			logger.Error("加载密钥失败", "error", keyErr)
			os.Exit(1)
		}
		backupService, backupErr := backup.New(nil, cfg.BackupDir, cfg.BackupKey, cfg.Environment, keys)
		if backupErr != nil {
			logger.Error("初始化备份恢复失败", "error", backupErr)
			os.Exit(1)
		}
		if backupErr = backupService.RestoreTo(context.Background(), os.Args[2], os.Args[3]); backupErr != nil {
			logger.Error("备份恢复校验失败", "error", backupErr)
			os.Exit(1)
		}
		logger.Info("备份已解密并通过完整性校验", "destination", os.Args[3])
		return
	}

	application, err := app.New(cfg, logger)
	if err != nil {
		logger.Error("应用初始化失败", "error", err)
		os.Exit(1)
	}
	defer application.Close()

	server := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           application.Handler(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    1 << 20,
		TLSConfig: &tls.Config{
			MinVersion:       tls.VersionTLS12,
			CurvePreferences: []tls.CurveID{tls.X25519, tls.CurveP256},
		},
	}

	serverErr := make(chan error, 1)
	go func() {
		logger.Info("CZCMS 已启动", "address", cfg.HTTPAddr, "database", cfg.DatabasePath, "redis_enabled", cfg.RedisAddr != "")
		if cfg.TLSCertFile != "" {
			serverErr <- server.ListenAndServeTLS(cfg.TLSCertFile, cfg.TLSKeyFile)
			return
		}
		serverErr <- server.ListenAndServe()
	}()

	stop, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	select {
	case err = <-serverErr:
		if !errors.Is(err, http.ErrServerClosed) {
			logger.Error("HTTP 服务异常退出", "error", err)
		}
	case <-stop.Done():
		logger.Info("正在安全停止服务")
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer shutdownCancel()
		if err = server.Shutdown(shutdownCtx); err != nil {
			logger.Error("服务停止超时", "error", err)
		}
	}
}
