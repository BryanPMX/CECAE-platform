package main

import (
	"log/slog"
	"os"

	"github.com/BryanPMX/CECAE-platform/internal/config"
	"github.com/BryanPMX/CECAE-platform/internal/database"
	"github.com/BryanPMX/CECAE-platform/internal/logger"
)

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

	if err := database.RunMigrations(cfg.Database); err != nil {
		log.Error("database migrations failed", slog.Any("error", err))
		return 1
	}

	log.Info("database migrations completed")
	return 0
}

func fallbackLogger() *slog.Logger {
	return slog.New(slog.NewJSONHandler(os.Stderr, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
}
