package application

import (
	"context"
	"strings"
	"time"

	"github.com/BryanPMX/CECAE-platform/internal/domain"
	"github.com/google/uuid"
)

// EventRepository is the persistence port required by EventService.
type EventRepository interface {
	ListPublished(context.Context) ([]domain.Event, error)
	ListFeatured(context.Context) ([]domain.Event, error)
	GetPublishedByID(context.Context, uuid.UUID) (domain.Event, error)
	ListAdmin(context.Context) ([]domain.Event, error)
	GetAdminByID(context.Context, uuid.UUID) (domain.Event, error)
	Create(context.Context, domain.Event) (domain.Event, error)
	Update(context.Context, domain.Event) (domain.Event, error)
	SoftDelete(context.Context, uuid.UUID) error
}

// EventService owns event business workflows independent of HTTP and PostgreSQL.
type EventService struct {
	events EventRepository
}

// NewEventService creates the event service with its required repository port.
func NewEventService(events EventRepository) *EventService {
	return &EventService{events: events}
}

func (s *EventService) ListPublicEvents(ctx context.Context) ([]domain.Event, error) {
	return s.events.ListPublished(ctx)
}

func (s *EventService) ListFeaturedEvents(ctx context.Context) ([]domain.Event, error) {
	return s.events.ListFeatured(ctx)
}

func (s *EventService) GetPublicEvent(ctx context.Context, id uuid.UUID) (domain.Event, error) {
	if id == uuid.Nil {
		return domain.Event{}, NotFound("event not found")
	}
	return s.events.GetPublishedByID(ctx, id)
}

func (s *EventService) ListAdminEvents(ctx context.Context) ([]domain.Event, error) {
	return s.events.ListAdmin(ctx)
}

func (s *EventService) GetAdminEvent(ctx context.Context, id uuid.UUID) (domain.Event, error) {
	if id == uuid.Nil {
		return domain.Event{}, NotFound("event not found")
	}
	return s.events.GetAdminByID(ctx, id)
}

func (s *EventService) CreateEvent(ctx context.Context, event domain.Event) (domain.Event, error) {
	if event.ID == uuid.Nil {
		event.ID = uuid.New()
	}
	event.Date = normalizeDate(event.Date)

	if err := validateEvent(event); err != nil {
		return domain.Event{}, err
	}

	return s.events.Create(ctx, event)
}

func (s *EventService) UpdateEvent(ctx context.Context, event domain.Event) (domain.Event, error) {
	if event.ID == uuid.Nil {
		return domain.Event{}, NotFound("event not found")
	}
	event.Date = normalizeDate(event.Date)

	if err := validateEvent(event); err != nil {
		return domain.Event{}, err
	}

	return s.events.Update(ctx, event)
}

func (s *EventService) DeleteEvent(ctx context.Context, id uuid.UUID) error {
	if id == uuid.Nil {
		return NotFound("event not found")
	}
	return s.events.SoftDelete(ctx, id)
}

func validateEvent(event domain.Event) error {
	var violations []FieldViolation

	addRequired(&violations, "title.es", event.Title.ES)
	addRequired(&violations, "title.en", event.Title.EN)
	addRequired(&violations, "description.es", event.Description.ES)
	addRequired(&violations, "description.en", event.Description.EN)

	if !event.Type.Valid() {
		violations = append(violations, FieldViolation{Field: "type", Message: "must be one of: training webinar talk"})
	}
	if !event.Modality.Valid() {
		violations = append(violations, FieldViolation{Field: "modality", Message: "must be one of: presencial virtual hibrida"})
	}
	if !event.Status.Valid() {
		violations = append(violations, FieldViolation{Field: "status", Message: "must be one of: draft published archived"})
	}
	if event.Date.IsZero() {
		violations = append(violations, FieldViolation{Field: "date", Message: "is required"})
	}
	if _, err := time.Parse("15:04", event.Time); err != nil {
		violations = append(violations, FieldViolation{Field: "time", Message: "must match 24-hour HH:MM format"})
	}
	if event.Capacity != nil && *event.Capacity <= 0 {
		violations = append(violations, FieldViolation{Field: "capacity", Message: "must be greater than zero"})
	}
	for index, tag := range event.Tags {
		if strings.TrimSpace(tag) == "" {
			violations = append(violations, FieldViolation{Field: "tags", Message: "must not include empty values"})
			break
		}
		event.Tags[index] = strings.TrimSpace(tag)
	}

	if len(violations) > 0 {
		return ValidationError(violations)
	}
	return nil
}

func addRequired(violations *[]FieldViolation, field string, value string) {
	if strings.TrimSpace(value) == "" {
		*violations = append(*violations, FieldViolation{Field: field, Message: "is required"})
	}
}

func normalizeDate(value time.Time) time.Time {
	if value.IsZero() {
		return value
	}
	year, month, day := value.Date()
	return time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
}
