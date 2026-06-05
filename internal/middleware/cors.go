package middleware

import (
	"net/http"

	"github.com/BryanPMX/CECAE-platform/internal/config"
	chicors "github.com/go-chi/cors"
)

// CORS returns the configured cross-origin policy.
func CORS(cfg config.CORSConfig) func(http.Handler) http.Handler {
	return chicors.Handler(chicors.Options{
		AllowedOrigins:   cfg.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: cfg.AllowCredentials,
		MaxAge:           300,
	})
}
