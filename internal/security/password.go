// Package security contains authentication primitives used by application services.
package security

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

const bcryptCost = 12

// PasswordHasher creates and verifies secure password hashes.
type PasswordHasher struct {
	cost int
}

// NewPasswordHasher returns the production password hasher.
func NewPasswordHasher() PasswordHasher {
	return PasswordHasher{cost: bcryptCost}
}

// HashPassword hashes a plaintext password with bcrypt.
func (h PasswordHasher) HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), h.cost)
	if err != nil {
		return "", fmt.Errorf("hash password: %w", err)
	}
	return string(hash), nil
}

// VerifyPassword reports whether password matches hash.
func (h PasswordHasher) VerifyPassword(hash string, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
