package database

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/BryanPMX/CECAE-platform/internal/config"
	"github.com/stretchr/testify/require"
)

func TestRunMigrationsReportsInvalidSource(t *testing.T) {
	err := RunMigrations(config.DatabaseConfig{
		URL:            "postgres://cecae:secret@localhost:5432/cecae?sslmode=disable",
		MigrationsPath: "file://does-not-exist",
	})

	require.Error(t, err)
	require.Contains(t, err.Error(), "create migration runner")
}

func TestInitialMigrationDefinesRequiredTables(t *testing.T) {
	sql := readMigration(t, "000001_initial_schema.up.sql")

	require.Contains(t, sql, "CREATE TABLE admin_users")
	require.Contains(t, sql, "CREATE TABLE admin_sessions")
	require.Contains(t, sql, "CREATE TABLE events")
	require.Contains(t, sql, "events_type_supported")
	require.Contains(t, sql, "events_modality_supported")
	require.Contains(t, sql, "events_status_supported")
	require.Contains(t, sql, "events_public_listing_idx")
}

func TestInitialMigrationDownReversesRequiredTables(t *testing.T) {
	sql := readMigration(t, "000001_initial_schema.down.sql")

	require.Contains(t, sql, "DROP TABLE IF EXISTS events")
	require.Contains(t, sql, "DROP TABLE IF EXISTS admin_sessions")
	require.Contains(t, sql, "DROP TABLE IF EXISTS admin_users")
	require.Contains(t, sql, "DROP FUNCTION IF EXISTS set_updated_at()")
}

func readMigration(t *testing.T, fileName string) string {
	t.Helper()

	path := filepath.Join("..", "..", "migrations", fileName)
	contents, err := os.ReadFile(path)
	require.NoError(t, err)
	return strings.TrimSpace(string(contents))
}
