package database

import (
	"testing"
	"time"

	"github.com/BryanPMX/CECAE-platform/internal/config"
	"github.com/stretchr/testify/require"
)

func TestNewPoolConfigAppliesRuntimeSettings(t *testing.T) {
	poolConfig, err := NewPoolConfig(config.DatabaseConfig{
		URL:             "postgres://cecae:secret@localhost:5432/cecae?sslmode=disable",
		MinConns:        2,
		MaxConns:        12,
		MaxConnLifetime: 45 * time.Minute,
	})

	require.NoError(t, err)
	require.Equal(t, int32(2), poolConfig.MinConns)
	require.Equal(t, int32(12), poolConfig.MaxConns)
	require.Equal(t, 45*time.Minute, poolConfig.MaxConnLifetime)
	require.Equal(t, "cecae", poolConfig.ConnConfig.Database)
}

func TestNewPoolConfigRejectsInvalidURL(t *testing.T) {
	_, err := NewPoolConfig(config.DatabaseConfig{
		URL:      "not a postgres url",
		MinConns: 1,
		MaxConns: 10,
	})

	require.Error(t, err)
	require.Contains(t, err.Error(), "parse PostgreSQL pool configuration")
}
