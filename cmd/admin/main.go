package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/mail"
	"os"
	"strings"

	"github.com/BryanPMX/CECAE-platform/internal/config"
	"github.com/BryanPMX/CECAE-platform/internal/database"
	"github.com/BryanPMX/CECAE-platform/internal/logger"
	"github.com/BryanPMX/CECAE-platform/internal/security"
)

const minAdminPasswordLength = 12

func main() {
	os.Exit(run())
}

func run() int {
	cfg, err := config.Load()
	if err != nil {
		fallbackLogger().Error("configuration failed", slog.Any("error", err))
		return 1
	}

	log := logger.New(cfg.App)
	slog.SetDefault(log)

	email, password, err := adminCredentialsFromEnv()
	if err != nil {
		log.Error("admin bootstrap configuration failed", slog.Any("error", err))
		return 1
	}

	ctx := context.Background()
	pool, err := database.Connect(ctx, cfg.Database)
	if err != nil {
		log.Error("database connection failed", slog.Any("error", err))
		return 1
	}
	defer pool.Close()

	hash, err := security.NewPasswordHasher().HashPassword(password)
	if err != nil {
		log.Error("password hashing failed", slog.Any("error", err))
		return 1
	}

	var adminID string
	if err := pool.QueryRow(ctx, `
        INSERT INTO admin_users (email, password_hash)
        VALUES ($1, $2)
        ON CONFLICT (email) DO UPDATE
        SET password_hash = EXCLUDED.password_hash,
            disabled_at = NULL
        RETURNING id`, email, hash).Scan(&adminID); err != nil {
		log.Error("admin bootstrap failed", slog.Any("error", err))
		return 1
	}

	log.Info("admin user bootstrapped", slog.String("admin_user_id", adminID), slog.String("email", email))
	return 0
}

func adminCredentialsFromEnv() (string, string, error) {
	email := strings.TrimSpace(os.Getenv("ADMIN_EMAIL"))
	password := os.Getenv("ADMIN_PASSWORD")

	if email == "" {
		return "", "", errors.New("ADMIN_EMAIL is required")
	}
	if _, err := mail.ParseAddress(email); err != nil {
		return "", "", fmt.Errorf("ADMIN_EMAIL must be valid: %w", err)
	}
	if len(password) < minAdminPasswordLength {
		return "", "", fmt.Errorf("ADMIN_PASSWORD must be at least %d characters", minAdminPasswordLength)
	}

	return email, password, nil
}

func fallbackLogger() *slog.Logger {
	return slog.New(slog.NewJSONHandler(os.Stderr, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
}
