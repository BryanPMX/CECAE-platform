package application

import (
	"context"
	"testing"
	"time"

	"github.com/BryanPMX/CECAE-platform/internal/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestCreateEventValidatesAndPersistsEvent(t *testing.T) {
	repository := &fakeEventRepository{}
	service := NewEventService(repository)
	event := validEvent()

	created, err := service.CreateEvent(context.Background(), event)

	require.NoError(t, err)
	require.NotEqual(t, uuid.Nil, repository.created.ID)
	require.Equal(t, domain.EventStatusDraft, repository.created.Status)
	require.Equal(t, "09:30", repository.created.Time)
	require.Equal(t, repository.created.ID, created.ID)
}

func TestCreateEventReturnsValidationError(t *testing.T) {
	service := NewEventService(&fakeEventRepository{})

	_, err := service.CreateEvent(context.Background(), domain.Event{
		Type:     domain.EventType("course"),
		Modality: domain.EventModality("remote"),
		Status:   domain.EventStatus("scheduled"),
		Time:     "9am",
	})

	appError, ok := AsError(err)
	require.True(t, ok)
	require.Equal(t, ErrorCodeValidation, appError.Code)
	require.Contains(t, appError.Violations, FieldViolation{Field: "title.es", Message: "is required"})
	require.Contains(t, appError.Violations, FieldViolation{Field: "type", Message: "must be one of: training webinar talk"})
	require.Contains(t, appError.Violations, FieldViolation{Field: "time", Message: "must match 24-hour HH:MM format"})
}

func TestUpdateAndDeleteRequireID(t *testing.T) {
	service := NewEventService(&fakeEventRepository{})

	_, updateErr := service.UpdateEvent(context.Background(), validEvent())
	deleteErr := service.DeleteEvent(context.Background(), uuid.Nil)

	updateAppError, ok := AsError(updateErr)
	require.True(t, ok)
	require.Equal(t, ErrorCodeNotFound, updateAppError.Code)

	deleteAppError, ok := AsError(deleteErr)
	require.True(t, ok)
	require.Equal(t, ErrorCodeNotFound, deleteAppError.Code)
}

func validEvent() domain.Event {
	return domain.Event{
		Title: domain.LocalizedText{
			ES: "Curso NOM",
			EN: "NOM Training",
		},
		Description: domain.LocalizedText{
			ES: "Capacitacion profesional",
			EN: "Professional training",
		},
		Type:     domain.EventTypeTraining,
		Modality: domain.EventModalityInPerson,
		Date:     time.Date(2026, 7, 8, 13, 0, 0, 0, time.Local),
		Time:     "09:30",
		Status:   domain.EventStatusDraft,
	}
}

type fakeEventRepository struct {
	created domain.Event
	updated domain.Event
}

func (r *fakeEventRepository) ListPublished(context.Context) ([]domain.Event, error) {
	return nil, nil
}

func (r *fakeEventRepository) ListFeatured(context.Context) ([]domain.Event, error) {
	return nil, nil
}

func (r *fakeEventRepository) GetPublishedByID(context.Context, uuid.UUID) (domain.Event, error) {
	return domain.Event{}, nil
}

func (r *fakeEventRepository) ListAdmin(context.Context) ([]domain.Event, error) {
	return nil, nil
}

func (r *fakeEventRepository) GetAdminByID(context.Context, uuid.UUID) (domain.Event, error) {
	return domain.Event{}, nil
}

func (r *fakeEventRepository) Create(_ context.Context, event domain.Event) (domain.Event, error) {
	r.created = event
	return event, nil
}

func (r *fakeEventRepository) Update(_ context.Context, event domain.Event) (domain.Event, error) {
	r.updated = event
	return event, nil
}

func (r *fakeEventRepository) SoftDelete(context.Context, uuid.UUID) error {
	return nil
}
