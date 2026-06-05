package domain

import (
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestEventVisibilityRequiresPublishedAndNotDeleted(t *testing.T) {
	event := Event{Status: EventStatusPublished}
	require.True(t, event.IsPubliclyVisible())

	deletedAt := time.Now()
	event.DeletedAt = &deletedAt
	require.False(t, event.IsPubliclyVisible())

	event.DeletedAt = nil
	event.Status = EventStatusDraft
	require.False(t, event.IsPubliclyVisible())
}

func TestDomainEnumsValidateSupportedValues(t *testing.T) {
	require.True(t, EventTypeTraining.Valid())
	require.True(t, EventModalityHybrid.Valid())
	require.True(t, EventStatusArchived.Valid())

	require.False(t, EventType("course").Valid())
	require.False(t, EventModality("remote").Valid())
	require.False(t, EventStatus("scheduled").Valid())
}
