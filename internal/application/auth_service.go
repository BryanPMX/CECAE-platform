package application

import (
	"context"
	"strings"
	"time"

	"github.com/BryanPMX/CECAE-platform/internal/domain"
	"github.com/google/uuid"
)

// AdminRepository is the persistence port required by AuthService.
type AdminRepository interface {
	FindAdminByEmail(context.Context, string) (domain.AdminUser, error)
	FindAdminByID(context.Context, uuid.UUID) (domain.AdminUser, error)
	CreateSession(context.Context, domain.AdminSession) (domain.AdminSession, error)
	FindSessionByRefreshTokenHash(context.Context, string) (domain.AdminSession, error)
	RevokeSession(context.Context, uuid.UUID) error
}

// PasswordVerifier verifies plaintext credentials against stored hashes.
type PasswordVerifier interface {
	VerifyPassword(hash string, password string) bool
}

// AccessTokenIssuer issues and validates short-lived admin access tokens.
type AccessTokenIssuer interface {
	IssueAccessToken(adminUserID uuid.UUID, now time.Time) (IssuedToken, error)
	VerifyAccessToken(value string) (AccessClaims, error)
	RefreshTokenTTL() time.Duration
}

// RefreshTokenGenerator creates opaque refresh tokens and hashes them for storage.
type RefreshTokenGenerator interface {
	GenerateRefreshToken() (string, error)
	HashRefreshToken(value string) string
}

// IssuedToken is an application-level signed token result.
type IssuedToken struct {
	Value     string
	ExpiresAt time.Time
}

// AccessClaims are the trusted values from a verified access token.
type AccessClaims struct {
	AdminUserID uuid.UUID
	ExpiresAt   time.Time
}

// AuthTokens contains credentials returned to the admin portal.
type AuthTokens struct {
	AccessToken           string
	AccessTokenExpiresAt  time.Time
	RefreshToken          string
	RefreshTokenExpiresAt time.Time
}

// AuthService owns admin authentication and refresh-session workflows.
type AuthService struct {
	admins   AdminRepository
	password PasswordVerifier
	tokens   AccessTokenIssuer
	refresh  RefreshTokenGenerator
	now      func() time.Time
}

// NewAuthService creates the admin authentication service.
func NewAuthService(
	admins AdminRepository,
	password PasswordVerifier,
	tokens AccessTokenIssuer,
	refresh RefreshTokenGenerator,
) *AuthService {
	return &AuthService{
		admins:   admins,
		password: password,
		tokens:   tokens,
		refresh:  refresh,
		now:      func() time.Time { return time.Now().UTC() },
	}
}

// Login verifies credentials and starts a refresh session.
func (s *AuthService) Login(ctx context.Context, email string, password string) (AuthTokens, error) {
	admin, err := s.admins.FindAdminByEmail(ctx, strings.TrimSpace(email))
	if err != nil {
		if !hasErrorCode(err, ErrorCodeNotFound) {
			return AuthTokens{}, err
		}
		return AuthTokens{}, Unauthorized("invalid email or password")
	}
	if admin.IsDisabled() || !s.password.VerifyPassword(admin.PasswordHash, password) {
		return AuthTokens{}, Unauthorized("invalid email or password")
	}

	return s.issueTokenPair(ctx, admin.ID)
}

// Refresh rotates a valid refresh session into a new token pair.
func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (AuthTokens, error) {
	session, err := s.admins.FindSessionByRefreshTokenHash(ctx, s.refresh.HashRefreshToken(refreshToken))
	if err != nil {
		if !hasErrorCode(err, ErrorCodeNotFound) {
			return AuthTokens{}, err
		}
		return AuthTokens{}, Unauthorized("invalid refresh token")
	}

	now := s.now()
	if !session.ActiveAt(now) {
		return AuthTokens{}, Unauthorized("invalid refresh token")
	}

	admin, err := s.admins.FindAdminByID(ctx, session.AdminUserID)
	if err != nil {
		if !hasErrorCode(err, ErrorCodeNotFound) {
			return AuthTokens{}, err
		}
		return AuthTokens{}, Unauthorized("invalid refresh token")
	}
	if admin.IsDisabled() {
		return AuthTokens{}, Unauthorized("invalid refresh token")
	}

	if err := s.admins.RevokeSession(ctx, session.ID); err != nil {
		return AuthTokens{}, err
	}

	return s.issueTokenPair(ctx, admin.ID)
}

// Logout revokes a refresh session. Missing tokens are treated as already logged out.
func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
	session, err := s.admins.FindSessionByRefreshTokenHash(ctx, s.refresh.HashRefreshToken(refreshToken))
	if err != nil {
		if hasErrorCode(err, ErrorCodeNotFound) {
			return nil
		}
		return err
	}
	return s.admins.RevokeSession(ctx, session.ID)
}

// AuthenticateAccessToken validates a bearer token and returns the active admin user.
func (s *AuthService) AuthenticateAccessToken(ctx context.Context, accessToken string) (domain.AdminUser, error) {
	claims, err := s.tokens.VerifyAccessToken(accessToken)
	if err != nil {
		return domain.AdminUser{}, Unauthorized("invalid access token")
	}

	admin, err := s.admins.FindAdminByID(ctx, claims.AdminUserID)
	if err != nil {
		if !hasErrorCode(err, ErrorCodeNotFound) {
			return domain.AdminUser{}, err
		}
		return domain.AdminUser{}, Unauthorized("invalid access token")
	}
	if admin.IsDisabled() {
		return domain.AdminUser{}, Unauthorized("invalid access token")
	}
	return admin, nil
}

func hasErrorCode(err error, code ErrorCode) bool {
	appError, ok := AsError(err)
	return ok && appError.Code == code
}

func (s *AuthService) issueTokenPair(ctx context.Context, adminUserID uuid.UUID) (AuthTokens, error) {
	now := s.now()

	accessToken, err := s.tokens.IssueAccessToken(adminUserID, now)
	if err != nil {
		return AuthTokens{}, Internal(err)
	}

	refreshToken, err := s.refresh.GenerateRefreshToken()
	if err != nil {
		return AuthTokens{}, Internal(err)
	}

	refreshExpiresAt := now.Add(s.tokens.RefreshTokenTTL())
	session := domain.AdminSession{
		ID:               uuid.New(),
		AdminUserID:      adminUserID,
		RefreshTokenHash: s.refresh.HashRefreshToken(refreshToken),
		ExpiresAt:        refreshExpiresAt,
	}
	if _, err := s.admins.CreateSession(ctx, session); err != nil {
		return AuthTokens{}, err
	}

	return AuthTokens{
		AccessToken:           accessToken.Value,
		AccessTokenExpiresAt:  accessToken.ExpiresAt,
		RefreshToken:          refreshToken,
		RefreshTokenExpiresAt: refreshExpiresAt,
	}, nil
}
