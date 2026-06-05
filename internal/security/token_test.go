package security

import (
	"testing"
	"time"

	"github.com/BryanPMX/CECAE-platform/internal/config"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestTokenManagerIssuesAndVerifiesAccessToken(t *testing.T) {
	manager := NewTokenManager(config.AuthConfig{
		AccessTokenSecret: "test-access-token-secret-32-plus",
		AccessTokenTTL:    15 * time.Minute,
		RefreshTokenTTL:   24 * time.Hour,
	})
	adminID := uuid.New()
	now := time.Now().UTC()

	token, err := manager.IssueAccessToken(adminID, now)
	claims, verifyErr := manager.VerifyAccessToken(token.Value)

	require.NoError(t, err)
	require.NoError(t, verifyErr)
	require.Equal(t, adminID, claims.AdminUserID)
	require.Equal(t, now.Add(15*time.Minute), token.ExpiresAt)
}

func TestRefreshTokenHashDoesNotExposeRawToken(t *testing.T) {
	manager := NewRefreshTokenManager(config.AuthConfig{
		RefreshTokenSecret: "test-refresh-token-secret-32-plus",
	})
	token, err := manager.GenerateRefreshToken()
	require.NoError(t, err)

	hash := manager.HashRefreshToken(token)

	require.NotEmpty(t, token)
	require.NotEqual(t, token, hash)
	require.Equal(t, hash, manager.HashRefreshToken(token))
}
