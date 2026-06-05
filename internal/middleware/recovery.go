package middleware

import (
	"log/slog"
	"net/http"

	"github.com/BryanPMX/CECAE-platform/internal/application"
	httptransport "github.com/BryanPMX/CECAE-platform/internal/transport/http"
)

// Recoverer converts panics into safe JSON errors.
func Recoverer(log *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if value := recover(); value != nil {
					log.Error("panic recovered", slog.Any("panic", value))
					httptransport.WriteError(w, application.Internal(nil))
				}
			}()

			next.ServeHTTP(w, r)
		})
	}
}
