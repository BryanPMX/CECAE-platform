// Package httptransport contains HTTP request and response DTOs.
package httptransport

import (
	"time"

	"github.com/BryanPMX/CECAE-platform/internal/domain"
)

const eventDateLayout = "2006-01-02"

// LocalizedTextRequest validates bilingual request fields.
type LocalizedTextRequest struct {
	ES string `json:"es" validate:"required,min=1,max=2000"`
	EN string `json:"en" validate:"required,min=1,max=2000"`
}

// LocalizedTextResponse preserves the frontend localized text contract.
type LocalizedTextResponse struct {
	ES string `json:"es"`
	EN string `json:"en"`
}

// EventResponse is the public frontend-compatible event representation.
type EventResponse struct {
	ID              string                `json:"id"`
	Title           LocalizedTextResponse `json:"title"`
	Description     LocalizedTextResponse `json:"description"`
	Type            string                `json:"type"`
	Modality        string                `json:"modality"`
	Date            string                `json:"date"`
	Time            string                `json:"time"`
	Duration        *string               `json:"duration,omitempty"`
	Location        *string               `json:"location,omitempty"`
	Capacity        *int                  `json:"capacity,omitempty"`
	RegistrationURL *string               `json:"registrationUrl,omitempty"`
	ImageURL        *string               `json:"imageUrl,omitempty"`
	Tags            []string              `json:"tags,omitempty"`
	IsFeatured      bool                  `json:"isFeatured,omitempty"`
}

// AdminEventResponse includes lifecycle metadata for authenticated admin views.
type AdminEventResponse struct {
	EventResponse
	Status    string     `json:"status"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	DeletedAt *time.Time `json:"deletedAt,omitempty"`
}

// CreateEventRequest is used by POST /api/admin/events.
type CreateEventRequest struct {
	Title           LocalizedTextRequest `json:"title" validate:"required"`
	Description     LocalizedTextRequest `json:"description" validate:"required"`
	Type            string               `json:"type" validate:"required,oneof=training webinar talk"`
	Modality        string               `json:"modality" validate:"required,oneof=presencial virtual hibrida"`
	Date            string               `json:"date" validate:"required,datetime=2006-01-02"`
	Time            string               `json:"time" validate:"required,time_hhmm"`
	Duration        *string              `json:"duration" validate:"omitempty,max=120"`
	Location        *string              `json:"location" validate:"omitempty,max=240"`
	Capacity        *int                 `json:"capacity" validate:"omitempty,min=1,max=100000"`
	RegistrationURL *string              `json:"registrationUrl" validate:"omitempty,url,max=500"`
	ImageURL        *string              `json:"imageUrl" validate:"omitempty,url,max=500"`
	Tags            []string             `json:"tags" validate:"omitempty,max=20,dive,min=1,max=50"`
	IsFeatured      bool                 `json:"isFeatured"`
	Status          string               `json:"status" validate:"required,oneof=draft published archived"`
}

// UpdateEventRequest is used by PUT /api/admin/events/:id.
type UpdateEventRequest = CreateEventRequest

// PatchLocalizedTextRequest supports partial localized text updates.
type PatchLocalizedTextRequest struct {
	ES *string `json:"es" validate:"omitempty,min=1,max=2000"`
	EN *string `json:"en" validate:"omitempty,min=1,max=2000"`
}

// PatchEventRequest is used by PATCH /api/admin/events/:id.
type PatchEventRequest struct {
	Title           *PatchLocalizedTextRequest `json:"title" validate:"omitempty"`
	Description     *PatchLocalizedTextRequest `json:"description" validate:"omitempty"`
	Type            *string                    `json:"type" validate:"omitempty,oneof=training webinar talk"`
	Modality        *string                    `json:"modality" validate:"omitempty,oneof=presencial virtual hibrida"`
	Date            *string                    `json:"date" validate:"omitempty,datetime=2006-01-02"`
	Time            *string                    `json:"time" validate:"omitempty,time_hhmm"`
	Duration        *string                    `json:"duration" validate:"omitempty,max=120"`
	Location        *string                    `json:"location" validate:"omitempty,max=240"`
	Capacity        *int                       `json:"capacity" validate:"omitempty,min=1,max=100000"`
	RegistrationURL *string                    `json:"registrationUrl" validate:"omitempty,url,max=500"`
	ImageURL        *string                    `json:"imageUrl" validate:"omitempty,url,max=500"`
	Tags            []string                   `json:"tags" validate:"omitempty,max=20,dive,min=1,max=50"`
	IsFeatured      *bool                      `json:"isFeatured"`
	Status          *string                    `json:"status" validate:"omitempty,oneof=draft published archived"`
}

// NewEventResponse maps a domain event to the public API contract.
func NewEventResponse(event domain.Event) EventResponse {
	return EventResponse{
		ID: event.ID.String(),
		Title: LocalizedTextResponse{
			ES: event.Title.ES,
			EN: event.Title.EN,
		},
		Description: LocalizedTextResponse{
			ES: event.Description.ES,
			EN: event.Description.EN,
		},
		Type:            string(event.Type),
		Modality:        string(event.Modality),
		Date:            event.Date.Format(eventDateLayout),
		Time:            event.Time,
		Duration:        event.Duration,
		Location:        event.Location,
		Capacity:        event.Capacity,
		RegistrationURL: event.RegistrationURL,
		ImageURL:        event.ImageURL,
		Tags:            event.Tags,
		IsFeatured:      event.IsFeatured,
	}
}

// NewAdminEventResponse maps a domain event to the admin API contract.
func NewAdminEventResponse(event domain.Event) AdminEventResponse {
	return AdminEventResponse{
		EventResponse: NewEventResponse(event),
		Status:        string(event.Status),
		CreatedAt:     event.CreatedAt,
		UpdatedAt:     event.UpdatedAt,
		DeletedAt:     event.DeletedAt,
	}
}
