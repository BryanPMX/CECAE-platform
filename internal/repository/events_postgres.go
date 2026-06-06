// Package repository contains PostgreSQL adapters for application ports.
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

const eventSelectColumns = `
    id,
    title_es,
    title_en,
    description_es,
    description_en,
    type,
    modality,
    event_date,
    to_char(event_time, 'HH24:MI') AS event_time,
    duration,
    location,
    capacity,
    registration_url,
    image_url,
    tags,
    is_featured,
    status,
    created_at,
    updated_at,
    deleted_at`

// PostgresEventRepository persists events through PostgreSQL.
type PostgresEventRepository struct {
	pool *pgxpool.Pool
}

var _ application.EventRepository = (*PostgresEventRepository)(nil)

// NewPostgresEventRepository creates the PostgreSQL event repository adapter.
func NewPostgresEventRepository(pool *pgxpool.Pool) *PostgresEventRepository {
	return &PostgresEventRepository{pool: pool}
}

func (r *PostgresEventRepository) ListPublished(ctx context.Context) ([]domain.Event, error) {
	query := fmt.Sprintf(`
        SELECT %s
        FROM events
        WHERE status = 'published'
          AND deleted_at IS NULL
        ORDER BY event_date ASC, event_time ASC, created_at DESC`, eventSelectColumns)

	return r.queryEvents(ctx, query)
}

func (r *PostgresEventRepository) ListFeatured(ctx context.Context) ([]domain.Event, error) {
	query := fmt.Sprintf(`
        SELECT %s
        FROM events
        WHERE status = 'published'
          AND is_featured = true
          AND deleted_at IS NULL
        ORDER BY event_date ASC, event_time ASC, created_at DESC`, eventSelectColumns)

	return r.queryEvents(ctx, query)
}

func (r *PostgresEventRepository) GetPublishedByID(ctx context.Context, id uuid.UUID) (domain.Event, error) {
	query := fmt.Sprintf(`
        SELECT %s
        FROM events
        WHERE id = $1
          AND status = 'published'
          AND deleted_at IS NULL`, eventSelectColumns)

	return r.queryEvent(ctx, query, id)
}

func (r *PostgresEventRepository) ListAdmin(ctx context.Context) ([]domain.Event, error) {
	query := fmt.Sprintf(`
        SELECT %s
        FROM events
        ORDER BY created_at DESC`, eventSelectColumns)

	return r.queryEvents(ctx, query)
}

func (r *PostgresEventRepository) GetAdminByID(ctx context.Context, id uuid.UUID) (domain.Event, error) {
	query := fmt.Sprintf(`
        SELECT %s
        FROM events
        WHERE id = $1`, eventSelectColumns)

	return r.queryEvent(ctx, query, id)
}

func (r *PostgresEventRepository) Create(ctx context.Context, event domain.Event) (domain.Event, error) {
	query := fmt.Sprintf(`
        INSERT INTO events (
            id,
            title_es,
            title_en,
            description_es,
            description_en,
            type,
            modality,
            event_date,
            event_time,
            duration,
            location,
            capacity,
            registration_url,
            image_url,
            tags,
            is_featured,
            status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::time, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING %s`, eventSelectColumns)

	return r.queryEvent(ctx, query, eventArgs(event)...)
}

func (r *PostgresEventRepository) Update(ctx context.Context, event domain.Event) (domain.Event, error) {
	query := fmt.Sprintf(`
        UPDATE events
        SET title_es = $2,
            title_en = $3,
            description_es = $4,
            description_en = $5,
            type = $6,
            modality = $7,
            event_date = $8,
            event_time = $9::time,
            duration = $10,
            location = $11,
            capacity = $12,
            registration_url = $13,
            image_url = $14,
            tags = $15,
            is_featured = $16,
            status = $17
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING %s`, eventSelectColumns)

	return r.queryEvent(ctx, query, eventArgs(event)...)
}

func (r *PostgresEventRepository) SoftDelete(ctx context.Context, id uuid.UUID) error {
	result, err := r.pool.Exec(ctx, `
        UPDATE events
        SET deleted_at = now()
        WHERE id = $1
          AND deleted_at IS NULL`, id)
	if err != nil {
		return application.Internal(fmt.Errorf("soft delete event: %w", err))
	}
	if result.RowsAffected() == 0 {
		return application.NotFound("event not found")
	}
	return nil
}

func (r *PostgresEventRepository) queryEvents(ctx context.Context, query string, args ...any) ([]domain.Event, error) {
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, application.Internal(fmt.Errorf("query events: %w", err))
	}
	defer rows.Close()

	events := []domain.Event{}
	for rows.Next() {
		event, err := scanEvent(rows)
		if err != nil {
			return nil, application.Internal(fmt.Errorf("scan event: %w", err))
		}
		events = append(events, event)
	}
	if err := rows.Err(); err != nil {
		return nil, application.Internal(fmt.Errorf("iterate events: %w", err))
	}

	return events, nil
}

func (r *PostgresEventRepository) queryEvent(ctx context.Context, query string, args ...any) (domain.Event, error) {
	event, err := scanEvent(r.pool.QueryRow(ctx, query, args...))
	if err == nil {
		return event, nil
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Event{}, application.NotFound("event not found")
	}
	return domain.Event{}, application.Internal(fmt.Errorf("query event: %w", err))
}

type eventRow interface {
	Scan(...any) error
}

func scanEvent(row eventRow) (domain.Event, error) {
	var event domain.Event

	err := row.Scan(
		&event.ID,
		&event.Title.ES,
		&event.Title.EN,
		&event.Description.ES,
		&event.Description.EN,
		&event.Type,
		&event.Modality,
		&event.Date,
		&event.Time,
		&event.Duration,
		&event.Location,
		&event.Capacity,
		&event.RegistrationURL,
		&event.ImageURL,
		&event.Tags,
		&event.IsFeatured,
		&event.Status,
		&event.CreatedAt,
		&event.UpdatedAt,
		&event.DeletedAt,
	)

	return event, err
}

func eventArgs(event domain.Event) []any {
	tags := event.Tags
	if tags == nil {
		tags = []string{}
	}

	return []any{
		event.ID,
		event.Title.ES,
		event.Title.EN,
		event.Description.ES,
		event.Description.EN,
		string(event.Type),
		string(event.Modality),
		event.Date,
		event.Time,
		event.Duration,
		event.Location,
		event.Capacity,
		event.RegistrationURL,
		event.ImageURL,
		tags,
		event.IsFeatured,
		string(event.Status),
	}
}
