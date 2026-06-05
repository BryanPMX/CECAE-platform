package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/BryanPMX/CECAE-platform/internal/application"
	"github.com/BryanPMX/CECAE-platform/internal/domain"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const adminUserSelectColumns = `
    id,
    email::text,
    password_hash,
    created_at,
    updated_at,
    disabled_at`

const adminSessionSelectColumns = `
    id,
    admin_user_id,
    refresh_token_hash,
    expires_at,
    created_at,
    revoked_at`

// PostgresAdminRepository persists admin users and refresh sessions.
type PostgresAdminRepository struct {
	pool *pgxpool.Pool
}

var _ application.AdminRepository = (*PostgresAdminRepository)(nil)

// NewPostgresAdminRepository creates the PostgreSQL admin repository adapter.
func NewPostgresAdminRepository(pool *pgxpool.Pool) *PostgresAdminRepository {
	return &PostgresAdminRepository{pool: pool}
}

func (r *PostgresAdminRepository) FindAdminByEmail(ctx context.Context, email string) (domain.AdminUser, error) {
	query := fmt.Sprintf(`
        SELECT %s
        FROM admin_users
        WHERE email = $1`, adminUserSelectColumns)

	return r.queryAdminUser(ctx, query, email)
}

func (r *PostgresAdminRepository) FindAdminByID(ctx context.Context, id uuid.UUID) (domain.AdminUser, error) {
	query := fmt.Sprintf(`
        SELECT %s
        FROM admin_users
        WHERE id = $1`, adminUserSelectColumns)

	return r.queryAdminUser(ctx, query, id)
}

func (r *PostgresAdminRepository) CreateSession(ctx context.Context, session domain.AdminSession) (domain.AdminSession, error) {
	query := fmt.Sprintf(`
        INSERT INTO admin_sessions (
            id,
            admin_user_id,
            refresh_token_hash,
            expires_at
        )
        VALUES ($1, $2, $3, $4)
        RETURNING %s`, adminSessionSelectColumns)

	return r.queryAdminSession(ctx, query, session.ID, session.AdminUserID, session.RefreshTokenHash, session.ExpiresAt)
}

func (r *PostgresAdminRepository) FindSessionByRefreshTokenHash(ctx context.Context, hash string) (domain.AdminSession, error) {
	query := fmt.Sprintf(`
        SELECT %s
        FROM admin_sessions
        WHERE refresh_token_hash = $1`, adminSessionSelectColumns)

	return r.queryAdminSession(ctx, query, hash)
}

func (r *PostgresAdminRepository) RevokeSession(ctx context.Context, id uuid.UUID) error {
	_, err := r.pool.Exec(ctx, `
        UPDATE admin_sessions
        SET revoked_at = COALESCE(revoked_at, now())
        WHERE id = $1`, id)
	if err != nil {
		return application.Internal(fmt.Errorf("revoke admin session: %w", err))
	}
	return nil
}

func (r *PostgresAdminRepository) queryAdminUser(ctx context.Context, query string, args ...any) (domain.AdminUser, error) {
	admin, err := scanAdminUser(r.pool.QueryRow(ctx, query, args...))
	if err == nil {
		return admin, nil
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.AdminUser{}, application.NotFound("admin user not found")
	}
	return domain.AdminUser{}, application.Internal(fmt.Errorf("query admin user: %w", err))
}

func (r *PostgresAdminRepository) queryAdminSession(ctx context.Context, query string, args ...any) (domain.AdminSession, error) {
	session, err := scanAdminSession(r.pool.QueryRow(ctx, query, args...))
	if err == nil {
		return session, nil
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.AdminSession{}, application.NotFound("admin session not found")
	}
	return domain.AdminSession{}, application.Internal(fmt.Errorf("query admin session: %w", err))
}

func scanAdminUser(row eventRow) (domain.AdminUser, error) {
	var admin domain.AdminUser
	err := row.Scan(
		&admin.ID,
		&admin.Email,
		&admin.PasswordHash,
		&admin.CreatedAt,
		&admin.UpdatedAt,
		&admin.DisabledAt,
	)
	return admin, err
}

func scanAdminSession(row eventRow) (domain.AdminSession, error) {
	var session domain.AdminSession
	err := row.Scan(
		&session.ID,
		&session.AdminUserID,
		&session.RefreshTokenHash,
		&session.ExpiresAt,
		&session.CreatedAt,
		&session.RevokedAt,
	)
	return session, err
}
