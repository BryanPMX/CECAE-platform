package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/BryanPMX/CECAE-platform/internal/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestLoginCreatesHashedRefreshSession(t *testing.T) {
	repository := newFakeAdminRepository()
	admin := domain.AdminUser{ID: uuid.New(), Email: "admin@cecae.org", PasswordHash: "stored-hash"}
	repository.adminsByEmail[admin.Email] = admin
	repository.adminsByID[admin.ID] = admin

	service := newTestAuthService(repository)

	tokens, err := service.Login(context.Background(), "admin@cecae.org", "correct-password")

	require.NoError(t, err)
	require.Equal(t, "access-token", tokens.AccessToken)
	require.Equal(t, "refresh-token-1", tokens.RefreshToken)
	require.Len(t, repository.sessionsByHash, 1)
	session := repository.sessionsByHash["hash:generated-1"]
	require.Equal(t, admin.ID, session.AdminUserID)
	require.NotContains(t, session.RefreshTokenHash, "refresh-token-1")
	require.Equal(t, fixedAuthTime.Add(time.Hour), session.ExpiresAt)
}

func TestLoginRejectsInvalidCredentials(t *testing.T) {
	repository := newFakeAdminRepository()
	admin := domain.AdminUser{ID: uuid.New(), Email: "admin@cecae.org", PasswordHash: "stored-hash"}
	repository.adminsByEmail[admin.Email] = admin
	repository.adminsByID[admin.ID] = admin

	service := newTestAuthService(repository)

	_, err := service.Login(context.Background(), "admin@cecae.org", "wrong-password")

	appError, ok := AsError(err)
	require.True(t, ok)
	require.Equal(t, ErrorCodeUnauthorized, appError.Code)
	require.Empty(t, repository.sessionsByHash)
}

func TestLoginPropagatesRepositoryErrors(t *testing.T) {
	repository := newFakeAdminRepository()
	repository.findAdminByEmailErr = Internal(errors.New("database unavailable"))
	service := newTestAuthService(repository)

	_, err := service.Login(context.Background(), "admin@cecae.org", "correct-password")

	appError, ok := AsError(err)
	require.True(t, ok)
	require.Equal(t, ErrorCodeInternal, appError.Code)
}

func TestRefreshRotatesSession(t *testing.T) {
	repository := newFakeAdminRepository()
	admin := domain.AdminUser{ID: uuid.New(), Email: "admin@cecae.org", PasswordHash: "stored-hash"}
	repository.adminsByID[admin.ID] = admin
	oldSession := domain.AdminSession{
		ID:               uuid.New(),
		AdminUserID:      admin.ID,
		RefreshTokenHash: "hash:existing",
		ExpiresAt:        fixedAuthTime.Add(time.Hour),
	}
	repository.sessionsByHash[oldSession.RefreshTokenHash] = oldSession

	service := newTestAuthService(repository)

	tokens, err := service.Refresh(context.Background(), "existing-refresh-token")

	require.NoError(t, err)
	require.Equal(t, "refresh-token-1", tokens.RefreshToken)
	require.Contains(t, repository.revokedSessionIDs, oldSession.ID)
	require.Contains(t, repository.sessionsByHash, "hash:generated-1")
}

func TestRefreshRejectsRevokedSession(t *testing.T) {
	repository := newFakeAdminRepository()
	adminID := uuid.New()
	revokedAt := fixedAuthTime.Add(-time.Minute)
	repository.sessionsByHash["hash:existing"] = domain.AdminSession{
		ID:               uuid.New(),
		AdminUserID:      adminID,
		RefreshTokenHash: "hash:existing",
		ExpiresAt:        fixedAuthTime.Add(time.Hour),
		RevokedAt:        &revokedAt,
	}

	service := newTestAuthService(repository)

	_, err := service.Refresh(context.Background(), "existing-refresh-token")

	appError, ok := AsError(err)
	require.True(t, ok)
	require.Equal(t, ErrorCodeUnauthorized, appError.Code)
}

func TestAuthenticateAccessTokenRejectsDisabledAdmin(t *testing.T) {
	repository := newFakeAdminRepository()
	disabledAt := fixedAuthTime
	admin := domain.AdminUser{ID: uuid.New(), Email: "admin@cecae.org", DisabledAt: &disabledAt}
	repository.adminsByID[admin.ID] = admin

	tokenIssuer := &fakeAccessTokenIssuer{adminUserID: admin.ID, refreshTTL: time.Hour}
	service := NewAuthService(repository, fakePasswordVerifier{}, tokenIssuer, &fakeRefreshTokenGenerator{})

	_, err := service.AuthenticateAccessToken(context.Background(), "access-token")

	appError, ok := AsError(err)
	require.True(t, ok)
	require.Equal(t, ErrorCodeUnauthorized, appError.Code)
}

var fixedAuthTime = time.Date(2026, 6, 5, 12, 0, 0, 0, time.UTC)

func newTestAuthService(repository *fakeAdminRepository) *AuthService {
	service := NewAuthService(
		repository,
		fakePasswordVerifier{},
		&fakeAccessTokenIssuer{refreshTTL: time.Hour},
		&fakeRefreshTokenGenerator{},
	)
	service.now = func() time.Time { return fixedAuthTime }
	return service
}

type fakeAdminRepository struct {
	adminsByEmail       map[string]domain.AdminUser
	adminsByID          map[uuid.UUID]domain.AdminUser
	sessionsByHash      map[string]domain.AdminSession
	revokedSessionIDs   []uuid.UUID
	findAdminByEmailErr error
}

func newFakeAdminRepository() *fakeAdminRepository {
	return &fakeAdminRepository{
		adminsByEmail:  map[string]domain.AdminUser{},
		adminsByID:     map[uuid.UUID]domain.AdminUser{},
		sessionsByHash: map[string]domain.AdminSession{},
	}
}

func (r *fakeAdminRepository) FindAdminByEmail(_ context.Context, email string) (domain.AdminUser, error) {
	if r.findAdminByEmailErr != nil {
		return domain.AdminUser{}, r.findAdminByEmailErr
	}
	admin, ok := r.adminsByEmail[email]
	if !ok {
		return domain.AdminUser{}, NotFound("admin user not found")
	}
	return admin, nil
}

func (r *fakeAdminRepository) FindAdminByID(_ context.Context, id uuid.UUID) (domain.AdminUser, error) {
	admin, ok := r.adminsByID[id]
	if !ok {
		return domain.AdminUser{}, NotFound("admin user not found")
	}
	return admin, nil
}

func (r *fakeAdminRepository) CreateSession(_ context.Context, session domain.AdminSession) (domain.AdminSession, error) {
	r.sessionsByHash[session.RefreshTokenHash] = session
	return session, nil
}

func (r *fakeAdminRepository) FindSessionByRefreshTokenHash(_ context.Context, hash string) (domain.AdminSession, error) {
	session, ok := r.sessionsByHash[hash]
	if !ok {
		return domain.AdminSession{}, NotFound("admin session not found")
	}
	return session, nil
}

func (r *fakeAdminRepository) RevokeSession(_ context.Context, id uuid.UUID) error {
	r.revokedSessionIDs = append(r.revokedSessionIDs, id)
	return nil
}

type fakePasswordVerifier struct{}

func (fakePasswordVerifier) VerifyPassword(_ string, password string) bool {
	return password == "correct-password"
}

type fakeAccessTokenIssuer struct {
	adminUserID uuid.UUID
	refreshTTL  time.Duration
	err         error
}

func (i *fakeAccessTokenIssuer) IssueAccessToken(adminUserID uuid.UUID, now time.Time) (IssuedToken, error) {
	if i.err != nil {
		return IssuedToken{}, i.err
	}
	return IssuedToken{Value: "access-token", ExpiresAt: now.Add(15 * time.Minute)}, nil
}

func (i *fakeAccessTokenIssuer) VerifyAccessToken(string) (AccessClaims, error) {
	if i.err != nil {
		return AccessClaims{}, i.err
	}
	if i.adminUserID == uuid.Nil {
		return AccessClaims{}, errors.New("missing admin id")
	}
	return AccessClaims{AdminUserID: i.adminUserID, ExpiresAt: fixedAuthTime.Add(15 * time.Minute)}, nil
}

func (i *fakeAccessTokenIssuer) RefreshTokenTTL() time.Duration {
	return i.refreshTTL
}

type fakeRefreshTokenGenerator struct {
	count int
}

func (g *fakeRefreshTokenGenerator) GenerateRefreshToken() (string, error) {
	g.count++
	return "refresh-token-" + string(rune('0'+g.count)), nil
}

func (*fakeRefreshTokenGenerator) HashRefreshToken(value string) string {
	switch value {
	case "refresh-token-1":
		return "hash:generated-1"
	case "existing-refresh-token":
		return "hash:existing"
	default:
		return "hash:unknown"
	}
}
