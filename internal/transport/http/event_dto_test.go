package httptransport

import (
	"testing"
	"time"

	"github.com/BryanPMX/CECAE-platform/internal/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestNewEventResponsePreservesFrontendContract(t *testing.T) {
	id := uuid.New()
	location := "Monterrey"
	capacity := 40
	event := domain.Event{
		ID: id,
		Title: domain.LocalizedText{
			ES: "Curso NOM",
			EN: "NOM Training",
		},
		Description: domain.LocalizedText{
			ES: "Descripcion",
			EN: "Description",
		},
		Type:       domain.EventTypeTraining,
		Modality:   domain.EventModalityInPerson,
		Date:       time.Date(2026, 7, 8, 0, 0, 0, 0, time.UTC),
		Time:       "09:30",
		Location:   &location,
		Capacity:   &capacity,
		Tags:       []string{"nom"},
		IsFeatured: true,
	}

	response := NewEventResponse(event)

	require.Equal(t, id.String(), response.ID)
	require.Equal(t, "Curso NOM", response.Title.ES)
	require.Equal(t, "training", response.Type)
	require.Equal(t, "presencial", response.Modality)
	require.Equal(t, "2026-07-08", response.Date)
	require.Equal(t, "09:30", response.Time)
	require.Equal(t, &location, response.Location)
	require.Equal(t, &capacity, response.Capacity)
	require.True(t, response.IsFeatured)
}

func TestCreateEventRequestMapsToDomainEvent(t *testing.T) {
	id := uuid.New()
	location := "Monterrey"
	capacity := 40
	request := CreateEventRequest{
		Title: LocalizedTextRequest{
			ES: "Curso NOM",
			EN: "NOM Training",
		},
		Description: LocalizedTextRequest{
			ES: "Capacitacion profesional",
			EN: "Professional training",
		},
		Type:       "training",
		Modality:   "presencial",
		Date:       "2026-07-08",
		Time:       "09:30",
		Location:   &location,
		Capacity:   &capacity,
		Tags:       []string{"nom"},
		IsFeatured: true,
		Status:     "draft",
	}

	event, err := request.ToDomainEvent(id)

	require.NoError(t, err)
	require.Equal(t, id, event.ID)
	require.Equal(t, "Curso NOM", event.Title.ES)
	require.Equal(t, domain.EventTypeTraining, event.Type)
	require.Equal(t, time.Date(2026, 7, 8, 0, 0, 0, 0, time.UTC), event.Date)
	require.Equal(t, &location, event.Location)
	require.Equal(t, &capacity, event.Capacity)
	require.Equal(t, domain.EventStatusDraft, event.Status)
}

func TestPatchEventRequestAppliesProvidedFieldsOnly(t *testing.T) {
	isFeatured := true
	titleES := "Curso actualizado"
	status := "published"
	event := domain.Event{
		ID: uuid.New(),
		Title: domain.LocalizedText{
			ES: "Curso NOM",
			EN: "NOM Training",
		},
		Description: domain.LocalizedText{
			ES: "Descripcion",
			EN: "Description",
		},
		Status: domain.EventStatusDraft,
	}
	request := PatchEventRequest{
		Title: &PatchLocalizedTextRequest{
			ES: &titleES,
		},
		IsFeatured: &isFeatured,
		Status:     &status,
	}

	patched, err := request.ApplyTo(event)

	require.NoError(t, err)
	require.Equal(t, "Curso actualizado", patched.Title.ES)
	require.Equal(t, "NOM Training", patched.Title.EN)
	require.Equal(t, "Descripcion", patched.Description.ES)
	require.True(t, patched.IsFeatured)
	require.Equal(t, domain.EventStatusPublished, patched.Status)
}
