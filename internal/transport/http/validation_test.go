package httptransport

import (
	"testing"

	"github.com/BryanPMX/CECAE-platform/internal/application"
	"github.com/stretchr/testify/require"
)

func TestValidatorAcceptsValidCreateEventRequest(t *testing.T) {
	validator := newTestValidator(t)
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
		IsFeatured: true,
		Status:     "draft",
	}

	require.NoError(t, validator.ValidateStruct(request))
}

func TestValidatorReturnsFieldViolations(t *testing.T) {
	validator := newTestValidator(t)
	request := CreateEventRequest{
		Type:     "course",
		Modality: "remote",
		Date:     "07/08/2026",
		Time:     "9am",
		Status:   "scheduled",
	}

	err := validator.ValidateStruct(request)

	appError, ok := application.AsError(err)
	require.True(t, ok)
	require.Equal(t, application.ErrorCodeValidation, appError.Code)
	require.Contains(t, appError.Violations, application.FieldViolation{
		Field:   "title",
		Message: "is required",
	})
	require.Contains(t, appError.Violations, application.FieldViolation{
		Field:   "type",
		Message: "must be one of: training webinar talk",
	})
	require.Contains(t, appError.Violations, application.FieldViolation{
		Field:   "time",
		Message: "must match 24-hour HH:MM format",
	})
}

func TestStatusCodeForErrorMapsApplicationErrors(t *testing.T) {
	require.Equal(t, 400, StatusCodeForError(application.ValidationError(nil)))
	require.Equal(t, 401, StatusCodeForError(application.Unauthorized("login required")))
	require.Equal(t, 403, StatusCodeForError(application.Forbidden("forbidden")))
	require.Equal(t, 404, StatusCodeForError(application.NotFound("event not found")))
	require.Equal(t, 409, StatusCodeForError(application.Conflict("email exists")))
}

func newTestValidator(t *testing.T) *Validator {
	t.Helper()

	validator, err := NewValidator()
	require.NoError(t, err)
	return validator
}
