package httptransport

import (
	"errors"
	"net/http"

	"github.com/BryanPMX/CECAE-platform/internal/application"
)

// ErrorResponse is the consistent HTTP error payload.
type ErrorResponse struct {
	Error APIError `json:"error"`
}

// APIError contains client-safe error details.
type APIError struct {
	Code    string                       `json:"code"`
	Message string                       `json:"message"`
	Fields  []application.FieldViolation `json:"fields,omitempty"`
}

// NewErrorResponse converts an error into the public error response shape.
func NewErrorResponse(err error) ErrorResponse {
	appError, ok := application.AsError(err)
	if !ok {
		appError = application.Internal(err)
	}

	return ErrorResponse{
		Error: APIError{
			Code:    string(appError.Code),
			Message: appError.Message,
			Fields:  appError.Violations,
		},
	}
}

// StatusCodeForError maps application errors to HTTP status codes.
func StatusCodeForError(err error) int {
	appError, ok := application.AsError(err)
	if !ok {
		return http.StatusInternalServerError
	}

	switch appError.Code {
	case application.ErrorCodeValidation:
		return http.StatusBadRequest
	case application.ErrorCodeUnauthorized:
		return http.StatusUnauthorized
	case application.ErrorCodeForbidden:
		return http.StatusForbidden
	case application.ErrorCodeRateLimited:
		return http.StatusTooManyRequests
	case application.ErrorCodeNotFound:
		return http.StatusNotFound
	case application.ErrorCodeConflict:
		return http.StatusConflict
	default:
		return http.StatusInternalServerError
	}
}

// IsClientSafeError reports whether an error already has a client-safe message.
func IsClientSafeError(err error) bool {
	var appError *application.Error
	return errors.As(err, &appError)
}
