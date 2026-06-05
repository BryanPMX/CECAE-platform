package httptransport

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/BryanPMX/CECAE-platform/internal/application"
)

const maxJSONBodyBytes = 1 << 20

// DecodeJSON reads a JSON request body into a DTO.
func DecodeJSON(w http.ResponseWriter, r *http.Request, destination any) error {
	r.Body = http.MaxBytesReader(w, r.Body, maxJSONBodyBytes)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(destination); err != nil {
		return application.ValidationError([]application.FieldViolation{
			{Field: "body", Message: "must be valid JSON"},
		})
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		return application.ValidationError([]application.FieldViolation{
			{Field: "body", Message: "must contain a single JSON object"},
		})
	}

	return nil
}

// WriteJSON writes a JSON response.
func WriteJSON(w http.ResponseWriter, statusCode int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	if value != nil {
		_ = json.NewEncoder(w).Encode(value)
	}
}

// WriteError writes a client-safe error response.
func WriteError(w http.ResponseWriter, err error) {
	if err == nil {
		err = errors.New("unknown error")
	}
	WriteJSON(w, StatusCodeForError(err), NewErrorResponse(err))
}
