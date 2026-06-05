package main

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/BryanPMX/CECAE-platform/internal/application"
	"github.com/BryanPMX/CECAE-platform/internal/domain"
	httptransport "github.com/BryanPMX/CECAE-platform/internal/transport/http"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestHealthzReturnsOKWhenDatabasePings(t *testing.T) {
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/healthz", nil)

	buildRouter(routerDependencies{Pinger: fakePinger{}}).ServeHTTP(recorder, request)

	require.Equal(t, http.StatusOK, recorder.Code)
	require.JSONEq(t, `{"status":"ok"}`, recorder.Body.String())
}

func TestHealthzReturnsUnavailableWhenDatabasePingFails(t *testing.T) {
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/healthz", nil)

	buildRouter(routerDependencies{Pinger: fakePinger{err: errors.New("database down")}}).ServeHTTP(recorder, request)

	require.Equal(t, http.StatusServiceUnavailable, recorder.Code)
	require.JSONEq(t, `{"status":"unavailable"}`, recorder.Body.String())
}

func TestAdminEventRoutesRequireBearerToken(t *testing.T) {
	validator, err := httptransport.NewValidator()
	require.NoError(t, err)
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/api/admin/events", nil)

	buildRouter(routerDependencies{
		Pinger:    fakePinger{},
		Validator: validator,
		Auth:      fakeRouterAuthService{},
		Events:    fakeRouterEventService{},
	}).ServeHTTP(recorder, request)

	require.Equal(t, http.StatusUnauthorized, recorder.Code)
	require.JSONEq(t, `{"error":{"code":"unauthorized","message":"authorization bearer token required"}}`, recorder.Body.String())
}

type fakePinger struct {
	err error
}

func (p fakePinger) Ping(context.Context) error {
	return p.err
}

type fakeRouterAuthService struct{}

func (fakeRouterAuthService) Login(context.Context, string, string) (application.AuthTokens, error) {
	return application.AuthTokens{}, nil
}

func (fakeRouterAuthService) Refresh(context.Context, string) (application.AuthTokens, error) {
	return application.AuthTokens{}, nil
}

func (fakeRouterAuthService) Logout(context.Context, string) error {
	return nil
}

func (fakeRouterAuthService) AuthenticateAccessToken(context.Context, string) (domain.AdminUser, error) {
	return domain.AdminUser{ID: uuid.New(), Email: "admin@cecae.org"}, nil
}

type fakeRouterEventService struct{}

func (fakeRouterEventService) ListPublicEvents(context.Context) ([]domain.Event, error) {
	return nil, nil
}

func (fakeRouterEventService) ListFeaturedEvents(context.Context) ([]domain.Event, error) {
	return nil, nil
}

func (fakeRouterEventService) GetPublicEvent(context.Context, uuid.UUID) (domain.Event, error) {
	return domain.Event{}, nil
}

func (fakeRouterEventService) ListAdminEvents(context.Context) ([]domain.Event, error) {
	return nil, nil
}

func (fakeRouterEventService) GetAdminEvent(context.Context, uuid.UUID) (domain.Event, error) {
	return domain.Event{}, nil
}

func (fakeRouterEventService) CreateEvent(context.Context, domain.Event) (domain.Event, error) {
	return domain.Event{ID: uuid.New(), CreatedAt: time.Now(), UpdatedAt: time.Now()}, nil
}

func (fakeRouterEventService) UpdateEvent(_ context.Context, event domain.Event) (domain.Event, error) {
	return event, nil
}

func (fakeRouterEventService) DeleteEvent(context.Context, uuid.UUID) error {
	return nil
}
