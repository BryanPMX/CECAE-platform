// Package logger builds the structured logger used by the API process.
package logger

import (
	"io"
	"log/slog"
	"os"

	"github.com/BryanPMX/CECAE-platform/internal/config"
)

// New returns a JSON structured logger with stable service metadata.
func New(app config.AppConfig) *slog.Logger {
	return NewWithWriter(app, os.Stdout)
}

// NewWithWriter is exposed for tests and tools that need to capture output.
func NewWithWriter(app config.AppConfig, writer io.Writer) *slog.Logger {
	handler := slog.NewJSONHandler(writer, &slog.HandlerOptions{
		AddSource: app.Environment == config.EnvironmentDevelopment,
		Level:     parseLevel(app.LogLevel),
	})

	return slog.New(handler).With(
		slog.String("service", app.Name),
		slog.String("environment", app.Environment),
	)
}

func parseLevel(value string) slog.Level {
	switch value {
	case "debug":
		return slog.LevelDebug
	case "warn":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}
