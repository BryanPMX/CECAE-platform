package security

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"time"

	"github.com/BryanPMX/CECAE-platform/internal/config"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const (
	accessTokenType     = "access"
	refreshTokenBytes   = 32
	refreshTokenHashLen = sha256.Size
)

// SignedToken is a token with its expiration timestamp.
type SignedToken struct {
	Value     string
	ExpiresAt time.Time
}

// AccessClaims are the trusted claims carried by a valid access token.
type AccessClaims struct {
	AdminUserID uuid.UUID
	ExpiresAt   time.Time
}

type accessClaims struct {
	TokenType string `json:"typ"`
	jwt.RegisteredClaims
}

// TokenManager issues and verifies admin access tokens and opaque refresh tokens.
type TokenManager struct {
	accessSecret []byte
	accessTTL    time.Duration
	refreshTTL   time.Duration
}

// RefreshTokenManager generates opaque refresh tokens and keyed storage hashes.
type RefreshTokenManager struct {
	secret []byte
}

// NewTokenManager creates a token manager from validated auth configuration.
func NewTokenManager(auth config.AuthConfig) TokenManager {
	return TokenManager{
		accessSecret: []byte(auth.AccessTokenSecret),
		accessTTL:    auth.AccessTokenTTL,
		refreshTTL:   auth.RefreshTokenTTL,
	}
}

// NewRefreshTokenManager creates the refresh-token manager.
func NewRefreshTokenManager(auth config.AuthConfig) RefreshTokenManager {
	return RefreshTokenManager{secret: []byte(auth.RefreshTokenSecret)}
}

// RefreshTokenTTL returns the configured refresh-token lifetime.
func (m TokenManager) RefreshTokenTTL() time.Duration {
	return m.refreshTTL
}

// IssueAccessToken signs a JWT access token for the admin user.
func (m TokenManager) IssueAccessToken(adminUserID uuid.UUID, now time.Time) (SignedToken, error) {
	expiresAt := now.Add(m.accessTTL)
	claims := accessClaims{
		TokenType: accessTokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   adminUserID.String(),
			ID:        uuid.NewString(),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
		},
	}

	value, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(m.accessSecret)
	if err != nil {
		return SignedToken{}, fmt.Errorf("sign access token: %w", err)
	}

	return SignedToken{Value: value, ExpiresAt: expiresAt}, nil
}

// VerifyAccessToken validates and extracts trusted claims from an access token.
func (m TokenManager) VerifyAccessToken(value string) (AccessClaims, error) {
	claims := accessClaims{}
	token, err := jwt.ParseWithClaims(value, &claims, func(token *jwt.Token) (any, error) {
		if token.Method != jwt.SigningMethodHS256 {
			return nil, fmt.Errorf("unexpected signing method %s", token.Method.Alg())
		}
		return m.accessSecret, nil
	})
	if err != nil {
		return AccessClaims{}, fmt.Errorf("verify access token: %w", err)
	}
	if !token.Valid || claims.TokenType != accessTokenType {
		return AccessClaims{}, errors.New("invalid access token")
	}

	adminUserID, err := uuid.Parse(claims.Subject)
	if err != nil {
		return AccessClaims{}, fmt.Errorf("parse access token subject: %w", err)
	}
	if adminUserID == uuid.Nil {
		return AccessClaims{}, errors.New("access token subject is required")
	}
	if claims.ExpiresAt == nil {
		return AccessClaims{}, errors.New("access token expiration is required")
	}

	return AccessClaims{
		AdminUserID: adminUserID,
		ExpiresAt:   claims.ExpiresAt.Time,
	}, nil
}

// GenerateRefreshToken creates a random opaque token suitable for browser storage.
func GenerateRefreshToken() (string, error) {
	buffer := make([]byte, refreshTokenBytes)
	if _, err := rand.Read(buffer); err != nil {
		return "", fmt.Errorf("generate refresh token: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(buffer), nil
}

// HashRefreshToken returns a stable one-way hash for storing refresh tokens.
func HashRefreshToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return base64.RawURLEncoding.EncodeToString(sum[:refreshTokenHashLen])
}

// GenerateRefreshToken creates a random opaque token suitable for browser storage.
func (m RefreshTokenManager) GenerateRefreshToken() (string, error) {
	return GenerateRefreshToken()
}

// HashRefreshToken returns a keyed one-way hash for storing refresh tokens.
func (m RefreshTokenManager) HashRefreshToken(token string) string {
	mac := hmac.New(sha256.New, m.secret)
	_, _ = mac.Write([]byte(token))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}
