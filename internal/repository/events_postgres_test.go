package repository

import (
	"testing"

	"github.com/BryanPMX/CECAE-platform/internal/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestEventArgsPreserveColumnOrder(t *testing.T) {
	duration := "2h"
	location := "Monterrey"
	capacity := 35
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
		Type:       domain.EventTypeTraining,
		Modality:   domain.EventModalityInPerson,
		Time:       "09:30",
		Duration:   &duration,
		Location:   &location,
		Capacity:   &capacity,
		Tags:       []string{"nom", "seguridad"},
		IsFeatured: true,
		Status:     domain.EventStatusDraft,
	}

	args := eventArgs(event)

	require.Len(t, args, 17)
	require.Equal(t, event.ID, args[0])
	require.Equal(t, "Curso NOM", args[1])
	require.Equal(t, "training", args[5])
	require.Equal(t, "presencial", args[6])
	require.Equal(t, "09:30", args[8])
	require.Equal(t, &duration, args[9])
	require.Equal(t, []string{"nom", "seguridad"}, args[14])
	require.Equal(t, true, args[15])
	require.Equal(t, "draft", args[16])
}

func TestEventArgsNormalizeNilTagsToEmptyArray(t *testing.T) {
	event := domain.Event{
		ID: uuid.New(),
		Title: domain.LocalizedText{
			ES: "Curso NOM",
			EN: "Curso NOM",
		},
		Description: domain.LocalizedText{
			ES: "Descripcion",
			EN: "Descripcion",
		},
		Type:     domain.EventTypeTraining,
		Modality: domain.EventModalityInPerson,
		Time:     "09:30",
		Status:   domain.EventStatusDraft,
	}

	args := eventArgs(event)

	require.Equal(t, []string{}, args[14])
}
