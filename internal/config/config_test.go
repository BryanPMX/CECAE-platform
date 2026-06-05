package config

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestLoadWithOptionsUsesDevelopmentDefaults(t *testing.T) {
	cfg, err := LoadWithOptions(LoadOptions{Environment: map[string]string{}})
	require.NoError(t, err)

	require.Equal(t, EnvironmentDevelopment, cfg.App.Environment)
	require.Equal(t, "cecae-api", cfg.App.Name)
	require.Equal(t, "info", cfg.App.LogLevel)
	require.Equal(t, "0.0.0.0:8080", cfg.Address())
	require.Equal(t, "postgres://cecae:cecae@localhost:5432/cecae?sslmode=disable", cfg.Database.URL)
	require.Equal(t, int32(1), cfg.Database.MinConns)
	require.Equal(t, int32(10), cfg.Database.MaxConns)
	require.Equal(t, 15*time.Minute, cfg.Auth.AccessTokenTTL)
	require.Equal(t, 720*time.Hour, cfg.Auth.RefreshTokenTTL)
	require.Equal(t, []string{"http://localhost:5173"}, cfg.CORS.AllowedOrigins)
	require.True(t, cfg.CORS.AllowCredentials)
	require.False(t, cfg.IsProduction())
}

func TestLoadWithOptionsAcceptsProductionConfiguration(t *testing.T) {
	cfg, err := LoadWithOptions(LoadOptions{Environment: map[string]string{
		"APP_ENV":                   EnvironmentProduction,
		"DATABASE_URL":              "postgres://cecae:secret@postgres:5432/cecae?sslmode=require",
		"AUTH_ACCESS_TOKEN_SECRET":  "production-access-token-secret-32-plus",
		"AUTH_REFRESH_TOKEN_SECRET": "production-refresh-token-secret-32-plus",
		"CORS_ALLOWED_ORIGINS":      "https://cecae.mx,https://admin.cecae.mx",
	}})
	require.NoError(t, err)

	require.True(t, cfg.IsProduction())
	require.Equal(t, []string{"https://cecae.mx", "https://admin.cecae.mx"}, cfg.CORS.AllowedOrigins)
}

func TestLoadWithOptionsRejectsProductionDefaults(t *testing.T) {
	_, err := LoadWithOptions(LoadOptions{Environment: map[string]string{
		"APP_ENV": EnvironmentProduction,
	}})
	requireConfigError(t, err, "AUTH_ACCESS_TOKEN_SECRET must be changed in production")
	requireConfigError(t, err, "AUTH_REFRESH_TOKEN_SECRET must be changed in production")
}

func TestLoadWithOptionsRejectsInvalidEnvironment(t *testing.T) {
	_, err := LoadWithOptions(LoadOptions{Environment: map[string]string{
		"APP_ENV": "preview",
	}})
	requireConfigError(t, err, "APP_ENV must be one of development, test, production")
}

func TestLoadWithOptionsRejectsInvalidHTTPSettings(t *testing.T) {
	_, err := LoadWithOptions(LoadOptions{Environment: map[string]string{
		"HTTP_HOST":             " ",
		"HTTP_PORT":             "70000",
		"HTTP_READ_TIMEOUT":     "0s",
		"HTTP_WRITE_TIMEOUT":    "-1s",
		"HTTP_IDLE_TIMEOUT":     "0s",
		"HTTP_SHUTDOWN_TIMEOUT": "0s",
	}})
	requireConfigError(t, err, "HTTP_HOST must not be empty")
	requireConfigError(t, err, "HTTP_PORT must be between 1 and 65535")
	requireConfigError(t, err, "HTTP_READ_TIMEOUT must be positive")
	requireConfigError(t, err, "HTTP_WRITE_TIMEOUT must be positive")
	requireConfigError(t, err, "HTTP_IDLE_TIMEOUT must be positive")
	requireConfigError(t, err, "HTTP_SHUTDOWN_TIMEOUT must be positive")
}

func TestLoadWithOptionsRejectsUnparseableDuration(t *testing.T) {
	_, err := LoadWithOptions(LoadOptions{Environment: map[string]string{
		"AUTH_ACCESS_TOKEN_TTL": "soon",
	}})
	require.Error(t, err)
	require.Contains(t, err.Error(), "parse configuration")
	require.Contains(t, err.Error(), "unable to parse duration")
}

func TestLoadWithOptionsRejectsInvalidDatabaseSettings(t *testing.T) {
	_, err := LoadWithOptions(LoadOptions{Environment: map[string]string{
		"DATABASE_URL":               "mysql://cecae:secret@localhost:3306/cecae",
		"DATABASE_MIN_CONNS":         "5",
		"DATABASE_MAX_CONNS":         "2",
		"DATABASE_MAX_CONN_LIFETIME": "0s",
		"DATABASE_MIGRATIONS_PATH":   " ",
	}})
	requireConfigError(t, err, "DATABASE_URL must use postgres or postgresql scheme")
	requireConfigError(t, err, "DATABASE_MIN_CONNS must be less than or equal to DATABASE_MAX_CONNS")
	requireConfigError(t, err, "DATABASE_MAX_CONN_LIFETIME must be positive")
	requireConfigError(t, err, "DATABASE_MIGRATIONS_PATH must not be empty")
}

func TestLoadWithOptionsRejectsInvalidAuthSettings(t *testing.T) {
	_, err := LoadWithOptions(LoadOptions{Environment: map[string]string{
		"AUTH_ACCESS_TOKEN_SECRET":  "short",
		"AUTH_REFRESH_TOKEN_SECRET": "short",
		"AUTH_ACCESS_TOKEN_TTL":     "1h",
		"AUTH_REFRESH_TOKEN_TTL":    "1h",
	}})
	requireConfigError(t, err, "AUTH_ACCESS_TOKEN_SECRET must be at least 32 characters")
	requireConfigError(t, err, "AUTH_REFRESH_TOKEN_SECRET must be at least 32 characters")
	requireConfigError(t, err, "AUTH_ACCESS_TOKEN_SECRET and AUTH_REFRESH_TOKEN_SECRET must differ")
	requireConfigError(t, err, "AUTH_REFRESH_TOKEN_TTL must be greater than AUTH_ACCESS_TOKEN_TTL")
}

func TestLoadWithOptionsRejectsInvalidCORSOrigins(t *testing.T) {
	_, err := LoadWithOptions(LoadOptions{Environment: map[string]string{
		"APP_ENV":                   EnvironmentProduction,
		"AUTH_ACCESS_TOKEN_SECRET":  "production-access-token-secret-32-plus",
		"AUTH_REFRESH_TOKEN_SECRET": "production-refresh-token-secret-32-plus",
		"CORS_ALLOWED_ORIGINS":      "*,ftp://cecae.mx,localhost:5173",
	}})
	requireConfigError(t, err, "CORS_ALLOWED_ORIGINS must not use * in production")
	requireConfigError(t, err, "CORS_ALLOWED_ORIGINS entries must use http or https")
	requireConfigError(t, err, "CORS_ALLOWED_ORIGINS entries must be absolute URLs or *")
}

func TestLoadWithOptionsReadsEnvFile(t *testing.T) {
	clearEnvironment(t)

	path := filepath.Join(t.TempDir(), ".env")
	require.NoError(t, os.WriteFile(path, []byte(`
APP_ENV=test
HTTP_PORT=9090
DATABASE_URL=postgres://cecae:secret@localhost:5432/cecae_test?sslmode=disable
AUTH_ACCESS_TOKEN_SECRET=test-access-token-secret-32-plus
AUTH_REFRESH_TOKEN_SECRET=test-refresh-token-secret-32-plus
CORS_ALLOWED_ORIGINS=http://localhost:3000
`), 0o600))

	cfg, err := LoadWithOptions(LoadOptions{EnvFile: path})
	require.NoError(t, err)

	require.Equal(t, EnvironmentTest, cfg.App.Environment)
	require.Equal(t, 9090, cfg.HTTP.Port)
	require.Equal(t, "postgres://cecae:secret@localhost:5432/cecae_test?sslmode=disable", cfg.Database.URL)
	require.Equal(t, []string{"http://localhost:3000"}, cfg.CORS.AllowedOrigins)
}

func requireConfigError(t *testing.T, err error, text string) {
	t.Helper()

	require.Error(t, err)
	require.Contains(t, err.Error(), text)
}

func clearEnvironment(t *testing.T) {
	t.Helper()

	previous := os.Environ()
	os.Clearenv()
	t.Cleanup(func() {
		os.Clearenv()
		for _, entry := range previous {
			key, value, ok := strings.Cut(entry, "=")
			if ok {
				require.NoError(t, os.Setenv(key, value))
			}
		}
	})
}
