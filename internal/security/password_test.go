package security

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestPasswordHasherHashesAndVerifiesPassword(t *testing.T) {
	hasher := NewPasswordHasher()

	hash, err := hasher.HashPassword("secure-password-123")

	require.NoError(t, err)
	require.NotContains(t, hash, "secure-password-123")
	require.True(t, hasher.VerifyPassword(hash, "secure-password-123"))
	require.False(t, hasher.VerifyPassword(hash, "wrong-password"))
}
