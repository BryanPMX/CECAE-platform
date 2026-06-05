// Package domain contains business entities and value objects.
package domain

import (
	"time"

	"github.com/google/uuid"
)

// LocalizedText stores bilingual Spanish and English content.
type LocalizedText struct {
	ES string
	EN string
}

// EventType identifies the kind of CECAE event.
type EventType string

const (
	EventTypeTraining EventType = "training"
	EventTypeWebinar  EventType = "webinar"
	EventTypeTalk     EventType = "talk"
)

// Valid reports whether the event type is supported by the public contract.
func (t EventType) Valid() bool {
	switch t {
	case EventTypeTraining, EventTypeWebinar, EventTypeTalk:
		return true
	default:
		return false
	}
}

// EventModality identifies how an event is delivered.
type EventModality string

const (
	EventModalityInPerson EventModality = "presencial"
	EventModalityVirtual  EventModality = "virtual"
	EventModalityHybrid   EventModality = "hibrida"
)

// Valid reports whether the modality is supported by the public contract.
func (m EventModality) Valid() bool {
	switch m {
	case EventModalityInPerson, EventModalityVirtual, EventModalityHybrid:
		return true
	default:
		return false
	}
}

// EventStatus controls publication and admin lifecycle visibility.
type EventStatus string

const (
	EventStatusDraft     EventStatus = "draft"
	EventStatusPublished EventStatus = "published"
	EventStatusArchived  EventStatus = "archived"
)

// Valid reports whether the status is supported by the admin contract.
func (s EventStatus) Valid() bool {
	switch s {
	case EventStatusDraft, EventStatusPublished, EventStatusArchived:
		return true
	default:
		return false
	}
}

// Event is the canonical business representation used by services and
// repositories. Transport and database packages own their own DTO mappings.
type Event struct {
	ID              uuid.UUID
	Title           LocalizedText
	Description     LocalizedText
	Type            EventType
	Modality        EventModality
	Date            time.Time
	Time            string
	Duration        *string
	Location        *string
	Capacity        *int
	RegistrationURL *string
	ImageURL        *string
	Tags            []string
	IsFeatured      bool
	Status          EventStatus
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       *time.Time
}

// IsDeleted reports whether the event has been soft deleted.
func (e Event) IsDeleted() bool {
	return e.DeletedAt != nil
}

// IsPubliclyVisible reports whether public endpoints may return the event.
func (e Event) IsPubliclyVisible() bool {
	return e.Status == EventStatusPublished && !e.IsDeleted()
}
