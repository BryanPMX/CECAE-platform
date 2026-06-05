package httptransport

import (
	"context"
	"net/http"

	"github.com/BryanPMX/CECAE-platform/internal/application"
	"github.com/BryanPMX/CECAE-platform/internal/domain"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// EventService describes event workflows used by HTTP handlers.
type EventService interface {
	ListPublicEvents(context.Context) ([]domain.Event, error)
	ListFeaturedEvents(context.Context) ([]domain.Event, error)
	GetPublicEvent(context.Context, uuid.UUID) (domain.Event, error)
	ListAdminEvents(context.Context) ([]domain.Event, error)
	GetAdminEvent(context.Context, uuid.UUID) (domain.Event, error)
	CreateEvent(context.Context, domain.Event) (domain.Event, error)
	UpdateEvent(context.Context, domain.Event) (domain.Event, error)
	DeleteEvent(context.Context, uuid.UUID) error
}

// EventHandler handles public and admin event endpoints.
type EventHandler struct {
	events    EventService
	validator *Validator
}

// NewEventHandler creates an event handler.
func NewEventHandler(events EventService, validator *Validator) *EventHandler {
	return &EventHandler{events: events, validator: validator}
}

func (h *EventHandler) ListPublic(w http.ResponseWriter, r *http.Request) {
	events, err := h.events.ListPublicEvents(r.Context())
	if err != nil {
		WriteError(w, err)
		return
	}

	WriteJSON(w, http.StatusOK, NewEventResponses(events))
}

func (h *EventHandler) ListFeatured(w http.ResponseWriter, r *http.Request) {
	events, err := h.events.ListFeaturedEvents(r.Context())
	if err != nil {
		WriteError(w, err)
		return
	}

	WriteJSON(w, http.StatusOK, NewEventResponses(events))
}

func (h *EventHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	id, err := eventIDFromRequest(r)
	if err != nil {
		WriteError(w, err)
		return
	}

	event, err := h.events.GetPublicEvent(r.Context(), id)
	if err != nil {
		WriteError(w, err)
		return
	}

	WriteJSON(w, http.StatusOK, NewEventResponse(event))
}

func (h *EventHandler) ListAdmin(w http.ResponseWriter, r *http.Request) {
	events, err := h.events.ListAdminEvents(r.Context())
	if err != nil {
		WriteError(w, err)
		return
	}

	WriteJSON(w, http.StatusOK, NewAdminEventResponses(events))
}

func (h *EventHandler) GetAdmin(w http.ResponseWriter, r *http.Request) {
	id, err := eventIDFromRequest(r)
	if err != nil {
		WriteError(w, err)
		return
	}

	event, err := h.events.GetAdminEvent(r.Context(), id)
	if err != nil {
		WriteError(w, err)
		return
	}

	WriteJSON(w, http.StatusOK, NewAdminEventResponse(event))
}

func (h *EventHandler) CreateAdmin(w http.ResponseWriter, r *http.Request) {
	var request CreateEventRequest
	if err := DecodeJSON(w, r, &request); err != nil {
		WriteError(w, err)
		return
	}
	if err := h.validator.ValidateStruct(request); err != nil {
		WriteError(w, err)
		return
	}

	event, err := request.ToDomainEvent(uuid.Nil)
	if err != nil {
		WriteError(w, err)
		return
	}

	created, err := h.events.CreateEvent(r.Context(), event)
	if err != nil {
		WriteError(w, err)
		return
	}

	WriteJSON(w, http.StatusCreated, NewAdminEventResponse(created))
}

func (h *EventHandler) UpdateAdmin(w http.ResponseWriter, r *http.Request) {
	id, err := eventIDFromRequest(r)
	if err != nil {
		WriteError(w, err)
		return
	}

	var request UpdateEventRequest
	if err := DecodeJSON(w, r, &request); err != nil {
		WriteError(w, err)
		return
	}
	if err := h.validator.ValidateStruct(request); err != nil {
		WriteError(w, err)
		return
	}

	event, err := request.ToDomainEvent(id)
	if err != nil {
		WriteError(w, err)
		return
	}

	updated, err := h.events.UpdateEvent(r.Context(), event)
	if err != nil {
		WriteError(w, err)
		return
	}

	WriteJSON(w, http.StatusOK, NewAdminEventResponse(updated))
}

func (h *EventHandler) PatchAdmin(w http.ResponseWriter, r *http.Request) {
	id, err := eventIDFromRequest(r)
	if err != nil {
		WriteError(w, err)
		return
	}

	var request PatchEventRequest
	if err := DecodeJSON(w, r, &request); err != nil {
		WriteError(w, err)
		return
	}
	if err := h.validator.ValidateStruct(request); err != nil {
		WriteError(w, err)
		return
	}

	event, err := h.events.GetAdminEvent(r.Context(), id)
	if err != nil {
		WriteError(w, err)
		return
	}

	patched, err := request.ApplyTo(event)
	if err != nil {
		WriteError(w, err)
		return
	}

	updated, err := h.events.UpdateEvent(r.Context(), patched)
	if err != nil {
		WriteError(w, err)
		return
	}

	WriteJSON(w, http.StatusOK, NewAdminEventResponse(updated))
}

func (h *EventHandler) DeleteAdmin(w http.ResponseWriter, r *http.Request) {
	id, err := eventIDFromRequest(r)
	if err != nil {
		WriteError(w, err)
		return
	}

	if err := h.events.DeleteEvent(r.Context(), id); err != nil {
		WriteError(w, err)
		return
	}

	WriteJSON(w, http.StatusNoContent, nil)
}

func eventIDFromRequest(r *http.Request) (uuid.UUID, error) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil || id == uuid.Nil {
		return uuid.Nil, application.NotFound("event not found")
	}
	return id, nil
}
