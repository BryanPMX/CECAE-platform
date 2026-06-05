package database

import (
	"errors"
	"fmt"

	"github.com/BryanPMX/CECAE-platform/internal/config"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// RunMigrations applies all pending PostgreSQL migrations from the configured source.
func RunMigrations(database config.DatabaseConfig) error {
	migrator, err := migrate.New(database.MigrationsPath, database.URL)
	if err != nil {
		return fmt.Errorf("create migration runner: %w", err)
	}
	defer migrator.Close()

	if err := migrator.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("apply database migrations: %w", err)
	}

	return nil
}
