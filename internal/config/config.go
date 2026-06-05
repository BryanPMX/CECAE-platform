// Package config loads and validates process configuration for the API.
package config

import (
	"errors"
	"fmt"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

const (
	EnvironmentDevelopment = "development"
	EnvironmentTest        = "test"
	EnvironmentProduction  = "production"

	defaultAccessTokenSecret  = "dev-access-token-secret-change-me-32"
	defaultRefreshTokenSecret = "dev-refresh-token-secret-change-me-32"
)

// Config is the complete typed runtime configuration for the backend API.
type Config struct {
	App      AppConfig      `envPrefix:"APP_"`
	HTTP     HTTPConfig     `envPrefix:"HTTP_"`
	Database DatabaseConfig `envPrefix:"DATABASE_"`
	Auth     AuthConfig     `envPrefix:"AUTH_"`
	CORS     CORSConfig     `envPrefix:"CORS_"`
}

// AppConfig contains process-level settings.
type AppConfig struct {
	Environment string `env:"ENV" envDefault:"development"`
	Name        string `env:"NAME" envDefault:"cecae-api"`
	LogLevel    string `env:"LOG_LEVEL" envDefault:"info"`
}

// HTTPConfig contains the API listener and server timeout settings.
type HTTPConfig struct {
	Host            string        `env:"HOST" envDefault:"0.0.0.0"`
	Port            int           `env:"PORT" envDefault:"8080"`
	ReadTimeout     time.Duration `env:"READ_TIMEOUT" envDefault:"5s"`
	WriteTimeout    time.Duration `env:"WRITE_TIMEOUT" envDefault:"10s"`
	IdleTimeout     time.Duration `env:"IDLE_TIMEOUT" envDefault:"60s"`
	ShutdownTimeout time.Duration `env:"SHUTDOWN_TIMEOUT" envDefault:"10s"`
}

// DatabaseConfig contains PostgreSQL and migration settings.
type DatabaseConfig struct {
	URL             string        `env:"URL" envDefault:"postgres://cecae:cecae@localhost:5432/cecae?sslmode=disable"`
	MinConns        int32         `env:"MIN_CONNS" envDefault:"1"`
	MaxConns        int32         `env:"MAX_CONNS" envDefault:"10"`
	MaxConnLifetime time.Duration `env:"MAX_CONN_LIFETIME" envDefault:"1h"`
	MigrationsPath  string        `env:"MIGRATIONS_PATH" envDefault:"file://migrations"`
}

// AuthConfig contains token signing and lifetime settings.
type AuthConfig struct {
	AccessTokenSecret  string        `env:"ACCESS_TOKEN_SECRET" envDefault:"dev-access-token-secret-change-me-32"`
	RefreshTokenSecret string        `env:"REFRESH_TOKEN_SECRET" envDefault:"dev-refresh-token-secret-change-me-32"`
	AccessTokenTTL     time.Duration `env:"ACCESS_TOKEN_TTL" envDefault:"15m"`
	RefreshTokenTTL    time.Duration `env:"REFRESH_TOKEN_TTL" envDefault:"720h"`
}

// CORSConfig contains the frontend origins accepted by the API.
type CORSConfig struct {
	AllowedOrigins   []string `env:"ALLOWED_ORIGINS" envDefault:"http://localhost:5173"`
	AllowCredentials bool     `env:"ALLOW_CREDENTIALS" envDefault:"true"`
}

// LoadOptions customizes configuration loading. It is mainly useful for tests.
type LoadOptions struct {
	EnvFile     string
	Environment map[string]string
}

// ValidationError reports all invalid configuration fields at once.
type ValidationError struct {
	Problems []string
}

func (e ValidationError) Error() string {
	return "invalid configuration: " + strings.Join(e.Problems, "; ")
}

// IsProduction reports whether the API is configured for production behavior.
func (c Config) IsProduction() bool {
	return c.App.Environment == EnvironmentProduction
}

// Address returns the HTTP listener address.
func (c Config) Address() string {
	return fmt.Sprintf("%s:%d", c.HTTP.Host, c.HTTP.Port)
}

// Load reads .env when present, parses process environment variables, and
// validates the resulting configuration.
func Load() (Config, error) {
	return LoadWithOptions(LoadOptions{EnvFile: ".env"})
}

// LoadWithOptions parses configuration with optional test overrides.
func LoadWithOptions(options LoadOptions) (Config, error) {
	if options.EnvFile != "" {
		if err := godotenv.Load(options.EnvFile); err != nil && !errors.Is(err, os.ErrNotExist) {
			return Config{}, fmt.Errorf("load env file %q: %w", options.EnvFile, err)
		}
	}

	parserOptions := env.Options{}
	if options.Environment != nil {
		parserOptions.Environment = options.Environment
	}

	var cfg Config
	if err := env.ParseWithOptions(&cfg, parserOptions); err != nil {
		return Config{}, fmt.Errorf("parse configuration: %w", err)
	}
	if err := cfg.Validate(); err != nil {
		return Config{}, err
	}

	return cfg, nil
}

// Validate checks cross-field and production-safety rules.
func (c Config) Validate() error {
	var problems []string

	validateApp(c.App, &problems)
	validateHTTP(c.HTTP, &problems)
	validateDatabase(c.Database, &problems)
	validateAuth(c.Auth, c.IsProduction(), &problems)
	validateCORS(c.CORS, c.IsProduction(), &problems)

	if len(problems) > 0 {
		return ValidationError{Problems: problems}
	}
	return nil
}

func validateApp(app AppConfig, problems *[]string) {
	switch app.Environment {
	case EnvironmentDevelopment, EnvironmentTest, EnvironmentProduction:
	default:
		*problems = append(*problems, "APP_ENV must be one of development, test, production")
	}

	if strings.TrimSpace(app.Name) == "" {
		*problems = append(*problems, "APP_NAME must not be empty")
	}

	switch app.LogLevel {
	case "debug", "info", "warn", "error":
	default:
		*problems = append(*problems, "APP_LOG_LEVEL must be one of debug, info, warn, error")
	}
}

func validateHTTP(http HTTPConfig, problems *[]string) {
	if strings.TrimSpace(http.Host) == "" {
		*problems = append(*problems, "HTTP_HOST must not be empty")
	}
	if http.Port < 1 || http.Port > 65535 {
		*problems = append(*problems, "HTTP_PORT must be between 1 and 65535")
	}
	if http.ReadTimeout <= 0 {
		*problems = append(*problems, "HTTP_READ_TIMEOUT must be positive")
	}
	if http.WriteTimeout <= 0 {
		*problems = append(*problems, "HTTP_WRITE_TIMEOUT must be positive")
	}
	if http.IdleTimeout <= 0 {
		*problems = append(*problems, "HTTP_IDLE_TIMEOUT must be positive")
	}
	if http.ShutdownTimeout <= 0 {
		*problems = append(*problems, "HTTP_SHUTDOWN_TIMEOUT must be positive")
	}
}

func validateDatabase(database DatabaseConfig, problems *[]string) {
	parsed, err := url.Parse(database.URL)
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		*problems = append(*problems, "DATABASE_URL must be a valid PostgreSQL URL")
	} else if parsed.Scheme != "postgres" && parsed.Scheme != "postgresql" {
		*problems = append(*problems, "DATABASE_URL must use postgres or postgresql scheme")
	}

	if database.MinConns < 0 {
		*problems = append(*problems, "DATABASE_MIN_CONNS must be zero or greater")
	}
	if database.MaxConns < 1 {
		*problems = append(*problems, "DATABASE_MAX_CONNS must be at least 1")
	}
	if database.MinConns > database.MaxConns {
		*problems = append(*problems, "DATABASE_MIN_CONNS must be less than or equal to DATABASE_MAX_CONNS")
	}
	if database.MaxConnLifetime <= 0 {
		*problems = append(*problems, "DATABASE_MAX_CONN_LIFETIME must be positive")
	}
	if strings.TrimSpace(database.MigrationsPath) == "" {
		*problems = append(*problems, "DATABASE_MIGRATIONS_PATH must not be empty")
	}
}

func validateAuth(auth AuthConfig, production bool, problems *[]string) {
	if len(auth.AccessTokenSecret) < 32 {
		*problems = append(*problems, "AUTH_ACCESS_TOKEN_SECRET must be at least 32 characters")
	}
	if len(auth.RefreshTokenSecret) < 32 {
		*problems = append(*problems, "AUTH_REFRESH_TOKEN_SECRET must be at least 32 characters")
	}
	if auth.AccessTokenSecret == auth.RefreshTokenSecret {
		*problems = append(*problems, "AUTH_ACCESS_TOKEN_SECRET and AUTH_REFRESH_TOKEN_SECRET must differ")
	}
	if auth.AccessTokenTTL <= 0 {
		*problems = append(*problems, "AUTH_ACCESS_TOKEN_TTL must be positive")
	}
	if auth.RefreshTokenTTL <= 0 {
		*problems = append(*problems, "AUTH_REFRESH_TOKEN_TTL must be positive")
	}
	if auth.RefreshTokenTTL <= auth.AccessTokenTTL {
		*problems = append(*problems, "AUTH_REFRESH_TOKEN_TTL must be greater than AUTH_ACCESS_TOKEN_TTL")
	}

	if production {
		if isDevelopmentSecret(auth.AccessTokenSecret, defaultAccessTokenSecret) {
			*problems = append(*problems, "AUTH_ACCESS_TOKEN_SECRET must be changed in production")
		}
		if isDevelopmentSecret(auth.RefreshTokenSecret, defaultRefreshTokenSecret) {
			*problems = append(*problems, "AUTH_REFRESH_TOKEN_SECRET must be changed in production")
		}
	}
}

func validateCORS(cors CORSConfig, production bool, problems *[]string) {
	if len(cors.AllowedOrigins) == 0 {
		*problems = append(*problems, "CORS_ALLOWED_ORIGINS must include at least one origin")
	}

	for _, origin := range cors.AllowedOrigins {
		origin = strings.TrimSpace(origin)
		switch {
		case origin == "":
			*problems = append(*problems, "CORS_ALLOWED_ORIGINS must not include empty origins")
		case origin == "*":
			if production {
				*problems = append(*problems, "CORS_ALLOWED_ORIGINS must not use * in production")
			}
		default:
			parsed, err := url.Parse(origin)
			if err != nil || parsed.Scheme == "" || parsed.Host == "" {
				*problems = append(*problems, "CORS_ALLOWED_ORIGINS entries must be absolute URLs or *")
			} else if parsed.Scheme != "http" && parsed.Scheme != "https" {
				*problems = append(*problems, "CORS_ALLOWED_ORIGINS entries must use http or https")
			}
		}
	}
}

func isDevelopmentSecret(secret string, defaultSecret string) bool {
	normalized := strings.ToLower(secret)
	return secret == defaultSecret || strings.Contains(normalized, "change-me")
}
