package httptransport

import (
	"context"
	"net/http"

	"github.com/BryanPMX/CECAE-platform/internal/application"
	"github.com/BryanPMX/CECAE-platform/internal/domain"
	"github.com/go-chi/chi/v5"
)

// AuthService describes the auth workflows used by HTTP handlers.
type AuthService interface {
	Login(context.Context, string, string) (application.AuthTokens, error)
	Refresh(context.Context, string) (application.AuthTokens, error)
	Logout(context.Context, string) error
	AuthenticateAccessToken(context.Context, string) (domain.AdminUser, error)
}

// AuthHandler handles admin authentication endpoints.
type AuthHandler struct {
	auth      AuthService
	validator *Validator
}

// NewAuthHandler creates an auth handler.
func NewAuthHandler(auth AuthService, validator *Validator) *AuthHandler {
	return &AuthHandler{auth: auth, validator: validator}
}

// RegisterRoutes mounts admin auth routes.
func (h *AuthHandler) RegisterRoutes(router chi.Router) {
	router.Post("/api/admin/auth/login", h.Login)
	router.Post("/api/admin/auth/refresh", h.Refresh)
	router.Post("/api/admin/auth/logout", h.Logout)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var request LoginRequest
	if err := DecodeJSON(w, r, &request); err != nil {
		WriteError(w, err)
		return
	}
	if err := h.validator.ValidateStruct(request); err != nil {
		WriteError(w, err)
		return
	}

	tokens, err := h.auth.Login(r.Context(), request.Email, request.Password)
	if err != nil {
		WriteError(w, err)
		return
	}

	WriteJSON(w, http.StatusOK, NewAuthTokensResponse(tokens))
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	var request RefreshTokenRequest
	if err := DecodeJSON(w, r, &request); err != nil {
		WriteError(w, err)
		return
	}
	if err := h.validator.ValidateStruct(request); err != nil {
		WriteError(w, err)
		return
	}

	tokens, err := h.auth.Refresh(r.Context(), request.RefreshToken)
	if err != nil {
		WriteError(w, err)
		return
	}

	WriteJSON(w, http.StatusOK, NewAuthTokensResponse(tokens))
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	var request LogoutRequest
	if err := DecodeJSON(w, r, &request); err != nil {
		WriteError(w, err)
		return
	}
	if err := h.validator.ValidateStruct(request); err != nil {
		WriteError(w, err)
		return
	}

	if err := h.auth.Logout(r.Context(), request.RefreshToken); err != nil {
		WriteError(w, err)
		return
	}

	WriteJSON(w, http.StatusNoContent, nil)
}
