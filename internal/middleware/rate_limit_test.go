package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestLoginRateLimiterRejectsRequestsOverLimit(t *testing.T) {
	limiter := NewLoginRateLimiter(1, time.Minute)
	now := time.Date(2026, 6, 5, 12, 0, 0, 0, time.UTC)
	limiter.now = func() time.Time { return now }

	handler := limiter.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	first := httptest.NewRecorder()
	handler.ServeHTTP(first, httptest.NewRequest(http.MethodPost, "/login", nil))
	second := httptest.NewRecorder()
	handler.ServeHTTP(second, httptest.NewRequest(http.MethodPost, "/login", nil))

	require.Equal(t, http.StatusNoContent, first.Code)
	require.Equal(t, http.StatusTooManyRequests, second.Code)
}
