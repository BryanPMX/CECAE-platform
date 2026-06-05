package main

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/BryanPMX/CECAE-platform/internal/config"
	"github.com/BryanPMX/CECAE-platform/internal/database"
	"github.com/BryanPMX/CECAE-platform/internal/logger"
	"github.com/go-chi/chi/v5"
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

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	pool, err := database.Connect(ctx, cfg.Database)
	if err != nil {
		log.Error("database connection failed", slog.Any("error", err))
		return 1
	}
	defer pool.Close()

	server := &http.Server{
		Addr:         cfg.Address(),
		Handler:      buildRouter(pool),
		ReadTimeout:  cfg.HTTP.ReadTimeout,
		WriteTimeout: cfg.HTTP.WriteTimeout,
		IdleTimeout:  cfg.HTTP.IdleTimeout,
	}

	serverErrors := make(chan error, 1)
	go func() {
		log.Info("api listening", slog.String("address", cfg.Address()))
		serverErrors <- server.ListenAndServe()
	}()

	select {
	case err := <-serverErrors:
		if errors.Is(err, http.ErrServerClosed) {
			return 0
		}
		log.Error("api server failed", slog.Any("error", err))
		return 1
	case <-ctx.Done():
		log.Info("shutdown requested")
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.HTTP.ShutdownTimeout)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Error("graceful shutdown failed", slog.Any("error", err))
		return 1
	}

	log.Info("api stopped")
	return 0
}

type healthPinger interface {
	Ping(context.Context) error
}

func buildRouter(pool healthPinger) http.Handler {
	router := chi.NewRouter()

	router.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), time.Second)
		defer cancel()

		if err := pool.Ping(ctx); err != nil {
			writeHealth(w, http.StatusServiceUnavailable, "unavailable")
			return
		}

		writeHealth(w, http.StatusOK, "ok")
	})

	return router
}

func writeHealth(w http.ResponseWriter, statusCode int, status string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": status})
}

func fallbackLogger() *slog.Logger {
	return slog.New(slog.NewJSONHandler(os.Stderr, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
}
