// Package database owns PostgreSQL pool creation and lifecycle helpers.
package database

import (
	"context"
	"fmt"

	"github.com/BryanPMX/CECAE-platform/internal/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

// NewPoolConfig converts typed runtime configuration into pgx pool settings.
func NewPoolConfig(database config.DatabaseConfig) (*pgxpool.Config, error) {
	poolConfig, err := pgxpool.ParseConfig(database.URL)
	if err != nil {
		return nil, fmt.Errorf("parse PostgreSQL pool configuration: %w", err)
	}

	poolConfig.MinConns = database.MinConns
	poolConfig.MaxConns = database.MaxConns
	poolConfig.MaxConnLifetime = database.MaxConnLifetime

	return poolConfig, nil
}

// Connect opens a PostgreSQL pool and verifies it can reach the database.
func Connect(ctx context.Context, database config.DatabaseConfig) (*pgxpool.Pool, error) {
	poolConfig, err := NewPoolConfig(database)
	if err != nil {
		return nil, err
	}

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("open PostgreSQL pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping PostgreSQL: %w", err)
	}

	return pool, nil
}
