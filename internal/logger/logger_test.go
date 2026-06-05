package logger

import (
	"bytes"
	"encoding/json"
	"log/slog"
	"testing"

	"github.com/BryanPMX/CECAE-platform/internal/config"
	"github.com/stretchr/testify/require"
)

func TestNewWithWriterEmitsStructuredJSON(t *testing.T) {
	var output bytes.Buffer
	log := NewWithWriter(config.AppConfig{
		Environment: config.EnvironmentProduction,
		Name:        "cecae-api",
		LogLevel:    "info",
	}, &output)

	log.Info("api started", slog.String("address", "0.0.0.0:8080"))

	var entry map[string]any
	require.NoError(t, json.Unmarshal(output.Bytes(), &entry))
	require.Equal(t, "INFO", entry["level"])
	require.Equal(t, "api started", entry["msg"])
	require.Equal(t, "cecae-api", entry["service"])
	require.Equal(t, config.EnvironmentProduction, entry["environment"])
	require.Equal(t, "0.0.0.0:8080", entry["address"])
}

func TestNewWithWriterHonorsLogLevel(t *testing.T) {
	var output bytes.Buffer
	log := NewWithWriter(config.AppConfig{
		Environment: config.EnvironmentTest,
		Name:        "cecae-api",
		LogLevel:    "warn",
	}, &output)

	log.Info("hidden")
	log.Warn("visible")

	require.NotContains(t, output.String(), "hidden")
	require.Contains(t, output.String(), "visible")
}
