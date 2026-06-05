// Package middleware contains HTTP middleware used by the API.
package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/BryanPMX/CECAE-platform/internal/application"
	"github.com/BryanPMX/CECAE-platform/internal/domain"
	httptransport "github.com/BryanPMX/CECAE-platform/internal/transport/http"
)

type adminContextKey struct{}

// Authenticator validates bearer access tokens.
type Authenticator interface {
	AuthenticateAccessToken(context.Context, string) (domain.AdminUser, error)
}

// RequireAdmin allows only authenticated admin requests through.
func RequireAdmin(auth Authenticator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token, ok := bearerToken(r.Header.Get("Authorization"))
			if !ok {
				httptransport.WriteError(w, application.Unauthorized("authorization bearer token required"))
				return
			}

			admin, err := auth.AuthenticateAccessToken(r.Context(), token)
			if err != nil {
				httptransport.WriteError(w, err)
				return
			}

			ctx := context.WithValue(r.Context(), adminContextKey{}, admin)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// AdminFromContext returns the authenticated admin attached by RequireAdmin.
func AdminFromContext(ctx context.Context) (domain.AdminUser, bool) {
	admin, ok := ctx.Value(adminContextKey{}).(domain.AdminUser)
	return admin, ok
}

func bearerToken(header string) (string, bool) {
	scheme, value, ok := strings.Cut(strings.TrimSpace(header), " ")
	if !ok || !strings.EqualFold(scheme, "Bearer") {
		return "", false
	}
	value = strings.TrimSpace(value)
	return value, value != ""
}
