package application

import (
	"errors"
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestAsErrorFindsWrappedApplicationError(t *testing.T) {
	appError := NotFound("event not found")
	err := fmt.Errorf("load event: %w", appError)

	found, ok := AsError(err)

	require.True(t, ok)
	require.Same(t, appError, found)
}

func TestInternalWrapsUnderlyingError(t *testing.T) {
	cause := errors.New("connection reset")
	err := Internal(cause)

	require.Equal(t, ErrorCodeInternal, err.Code)
	require.Equal(t, "internal server error", err.Message)
	require.ErrorIs(t, err, cause)
	require.Contains(t, err.Error(), "connection reset")
}
