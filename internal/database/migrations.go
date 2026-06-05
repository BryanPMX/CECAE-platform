package database

import (
	"errors"
	"fmt"
	"net/url"

	"github.com/BryanPMX/CECAE-platform/internal/config"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// RunMigrations applies all pending PostgreSQL migrations from the configured source.
func RunMigrations(database config.DatabaseConfig) error {
	migrationURL, err := migrationDatabaseURL(database.URL)
	if err != nil {
		return err
	}

	migrator, err := migrate.New(database.MigrationsPath, migrationURL)
	if err != nil {
		return fmt.Errorf("create migration runner: %w", err)
	}
	defer migrator.Close()

	if err := migrator.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("apply database migrations: %w", err)
	}

	return nil
}

func migrationDatabaseURL(value string) (string, error) {
	parsed, err := url.Parse(value)
	if err != nil {
		return "", fmt.Errorf("parse migration database URL: %w", err)
	}

	switch parsed.Scheme {
	case "postgres", "postgresql":
		parsed.Scheme = "pgx5"
	case "pgx5":
	default:
		return "", fmt.Errorf("migration database URL must use postgres, postgresql, or pgx5 scheme")
	}

	return parsed.String(), nil
}
