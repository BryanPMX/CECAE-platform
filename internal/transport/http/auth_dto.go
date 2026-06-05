package httptransport

import (
	"time"

	"github.com/BryanPMX/CECAE-platform/internal/application"
)

// LoginRequest is used by POST /api/admin/auth/login.
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email,max=320"`
	Password string `json:"password" validate:"required,min=12,max=128"`
}

// RefreshTokenRequest is used by POST /api/admin/auth/refresh.
type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken" validate:"required,min=32"`
}

// LogoutRequest is used by POST /api/admin/auth/logout.
type LogoutRequest struct {
	RefreshToken string `json:"refreshToken" validate:"required,min=32"`
}

// AuthTokensResponse returns access and refresh credentials to the admin portal.
type AuthTokensResponse struct {
	AccessToken           string    `json:"accessToken"`
	AccessTokenExpiresAt  time.Time `json:"accessTokenExpiresAt"`
	RefreshToken          string    `json:"refreshToken"`
	RefreshTokenExpiresAt time.Time `json:"refreshTokenExpiresAt"`
}

// NewAuthTokensResponse maps service tokens to the admin API contract.
func NewAuthTokensResponse(tokens application.AuthTokens) AuthTokensResponse {
	return AuthTokensResponse{
		AccessToken:           tokens.AccessToken,
		AccessTokenExpiresAt:  tokens.AccessTokenExpiresAt,
		RefreshToken:          tokens.RefreshToken,
		RefreshTokenExpiresAt: tokens.RefreshTokenExpiresAt,
	}
}
