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
