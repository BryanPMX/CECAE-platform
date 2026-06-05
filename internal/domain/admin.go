package domain

import (
	"time"

	"github.com/google/uuid"
)

// AdminUser is the initial single-admin account used for event management.
type AdminUser struct {
	ID           uuid.UUID
	Email        string
	PasswordHash string
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DisabledAt   *time.Time
}

// IsDisabled reports whether the admin account can authenticate.
func (u AdminUser) IsDisabled() bool {
	return u.DisabledAt != nil
}

// AdminSession stores refresh-token state without retaining raw token values.
type AdminSession struct {
	ID               uuid.UUID
	AdminUserID      uuid.UUID
	RefreshTokenHash string
	ExpiresAt        time.Time
	CreatedAt        time.Time
	RevokedAt        *time.Time
}

// ActiveAt reports whether a refresh session can still be used at a point in time.
func (s AdminSession) ActiveAt(now time.Time) bool {
	return s.RevokedAt == nil && now.Before(s.ExpiresAt)
}
