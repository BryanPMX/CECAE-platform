package httptransport

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/BryanPMX/CECAE-platform/internal/domain"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestEventHandlerListsPublicEvents(t *testing.T) {
	event := testHTTPEvent(uuid.New())
	service := &fakeHTTPEventService{publicEvents: []domain.Event{event}}
	handler := NewEventHandler(service, newTestValidator(t))
	router := chi.NewRouter()
	router.Get("/api/events", handler.ListPublic)

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/api/events", nil)

	router.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusOK, recorder.Code)
	require.JSONEq(t, `[
		{
			"id":"`+event.ID.String()+`",
			"title":{"es":"Curso NOM","en":"NOM Training"},
			"description":{"es":"Capacitacion profesional","en":"Professional training"},
			"type":"training",
			"modality":"presencial",
			"date":"2026-07-08",
			"time":"09:30"
		}
	]`, recorder.Body.String())
}

func TestEventHandlerCreatesAdminEvent(t *testing.T) {
	service := &fakeHTTPEventService{}
	handler := NewEventHandler(service, newTestValidator(t))
	body := `{
		"title":{"es":"Curso NOM","en":"NOM Training"},
		"description":{"es":"Capacitacion profesional","en":"Professional training"},
		"type":"training",
		"modality":"presencial",
		"date":"2026-07-08",
		"time":"09:30",
		"status":"draft"
	}`
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPost, "/api/admin/events", strings.NewReader(body))

	handler.CreateAdmin(recorder, request)

	require.Equal(t, http.StatusCreated, recorder.Code)
	require.Equal(t, domain.EventTypeTraining, service.created.Type)
	require.Equal(t, domain.EventStatusDraft, service.created.Status)
	require.Equal(t, "2026-07-08", service.created.Date.Format(eventDateLayout))
}

func TestEventHandlerPatchesAdminEvent(t *testing.T) {
	id := uuid.New()
	existing := testHTTPEvent(id)
	service := &fakeHTTPEventService{adminEvent: existing}
	handler := NewEventHandler(service, newTestValidator(t))
	router := chi.NewRouter()
	router.Patch("/api/admin/events/{id}", handler.PatchAdmin)
	body := `{
		"title":{"es":"Curso actualizado"},
		"isFeatured":true,
		"status":"published"
	}`
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPatch, "/api/admin/events/"+id.String(), strings.NewReader(body))

	router.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusOK, recorder.Code)
	require.Equal(t, id, service.updated.ID)
	require.Equal(t, "Curso actualizado", service.updated.Title.ES)
	require.Equal(t, "NOM Training", service.updated.Title.EN)
	require.True(t, service.updated.IsFeatured)
	require.Equal(t, domain.EventStatusPublished, service.updated.Status)
}

func TestEventHandlerRejectsInvalidEventID(t *testing.T) {
	handler := NewEventHandler(&fakeHTTPEventService{}, newTestValidator(t))
	router := chi.NewRouter()
	router.Get("/api/events/{id}", handler.GetPublic)
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/api/events/not-a-uuid", nil)

	router.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusNotFound, recorder.Code)
	require.JSONEq(t, `{"error":{"code":"not_found","message":"event not found"}}`, recorder.Body.String())
}

func testHTTPEvent(id uuid.UUID) domain.Event {
	return domain.Event{
		ID: id,
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
		Date:     time.Date(2026, 7, 8, 0, 0, 0, 0, time.UTC),
		Time:     "09:30",
		Status:   domain.EventStatusDraft,
	}
}

type fakeHTTPEventService struct {
	publicEvents []domain.Event
	adminEvents  []domain.Event
	publicEvent  domain.Event
	adminEvent   domain.Event
	created      domain.Event
	updated      domain.Event
	deletedID    uuid.UUID
}

func (s *fakeHTTPEventService) ListPublicEvents(context.Context) ([]domain.Event, error) {
	return s.publicEvents, nil
}

func (s *fakeHTTPEventService) ListFeaturedEvents(context.Context) ([]domain.Event, error) {
	return s.publicEvents, nil
}

func (s *fakeHTTPEventService) GetPublicEvent(context.Context, uuid.UUID) (domain.Event, error) {
	return s.publicEvent, nil
}

func (s *fakeHTTPEventService) ListAdminEvents(context.Context) ([]domain.Event, error) {
	return s.adminEvents, nil
}

func (s *fakeHTTPEventService) GetAdminEvent(context.Context, uuid.UUID) (domain.Event, error) {
	return s.adminEvent, nil
}

func (s *fakeHTTPEventService) CreateEvent(_ context.Context, event domain.Event) (domain.Event, error) {
	if event.ID == uuid.Nil {
		event.ID = uuid.New()
	}
	event.CreatedAt = time.Date(2026, 6, 5, 12, 0, 0, 0, time.UTC)
	event.UpdatedAt = event.CreatedAt
	s.created = event
	return event, nil
}

func (s *fakeHTTPEventService) UpdateEvent(_ context.Context, event domain.Event) (domain.Event, error) {
	event.UpdatedAt = time.Date(2026, 6, 5, 12, 0, 0, 0, time.UTC)
	s.updated = event
	return event, nil
}

func (s *fakeHTTPEventService) DeleteEvent(_ context.Context, id uuid.UUID) error {
	s.deletedID = id
	return nil
}
