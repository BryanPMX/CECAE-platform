package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/BryanPMX/CECAE-platform/internal/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestRequireAdminAttachesAdminToContext(t *testing.T) {
	admin := domain.AdminUser{ID: uuid.New(), Email: "admin@cecae.org"}
	middleware := RequireAdmin(fakeAuthenticator{admin: admin})
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/admin", nil)
	request.Header.Set("Authorization", "Bearer valid-token")

	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		contextAdmin, ok := AdminFromContext(r.Context())
		require.True(t, ok)
		require.Equal(t, admin.ID, contextAdmin.ID)
		w.WriteHeader(http.StatusNoContent)
	}))

	handler.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusNoContent, recorder.Code)
}

func TestRequireAdminRejectsMissingBearerToken(t *testing.T) {
	middleware := RequireAdmin(fakeAuthenticator{})
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/admin", nil)

	middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("handler should not be called")
	})).ServeHTTP(recorder, request)

	require.Equal(t, http.StatusUnauthorized, recorder.Code)
	require.JSONEq(t, `{"error":{"code":"unauthorized","message":"authorization bearer token required"}}`, recorder.Body.String())
}

func TestRequestIDSetsResponseHeaderAndContext(t *testing.T) {
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/test", nil)
	request.Header.Set("X-Request-ID", "request-123")

	RequestID()(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, "request-123", RequestIDFromContext(r.Context()))
		w.WriteHeader(http.StatusNoContent)
	})).ServeHTTP(recorder, request)

	require.Equal(t, "request-123", recorder.Header().Get("X-Request-ID"))
}

func TestSecurityHeadersSetProductionHeaders(t *testing.T) {
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/test", nil)

	SecurityHeaders(true)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})).ServeHTTP(recorder, request)

	require.Equal(t, "nosniff", recorder.Header().Get("X-Content-Type-Options"))
	require.Equal(t, "DENY", recorder.Header().Get("X-Frame-Options"))
	require.Contains(t, recorder.Header().Get("Strict-Transport-Security"), "max-age=31536000")
}

type fakeAuthenticator struct {
	admin domain.AdminUser
	err   error
}

func (a fakeAuthenticator) AuthenticateAccessToken(context.Context, string) (domain.AdminUser, error) {
	return a.admin, a.err
}
