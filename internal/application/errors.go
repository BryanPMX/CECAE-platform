// Package application contains service-layer contracts and shared workflow errors.
package application

import (
	"errors"
	"fmt"
)

// ErrorCode is a stable, client-safe error identifier.
type ErrorCode string

const (
	ErrorCodeValidation   ErrorCode = "validation_error"
	ErrorCodeUnauthorized ErrorCode = "unauthorized"
	ErrorCodeForbidden    ErrorCode = "forbidden"
	ErrorCodeRateLimited  ErrorCode = "rate_limited"
	ErrorCodeNotFound     ErrorCode = "not_found"
	ErrorCodeConflict     ErrorCode = "conflict"
	ErrorCodeInternal     ErrorCode = "internal_error"
)

// FieldViolation describes a single invalid request field.
type FieldViolation struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// Error is the canonical service error. Handlers can map it to HTTP responses
// without leaking implementation details.
type Error struct {
	Code       ErrorCode
	Message    string
	Violations []FieldViolation
	Err        error
}

func (e *Error) Error() string {
	if e == nil {
		return ""
	}
	if e.Err == nil {
		return e.Message
	}
	return fmt.Sprintf("%s: %v", e.Message, e.Err)
}

func (e *Error) Unwrap() error {
	if e == nil {
		return nil
	}
	return e.Err
}

// AsError extracts an application Error from a wrapped error chain.
func AsError(err error) (*Error, bool) {
	var appError *Error
	if errors.As(err, &appError) {
		return appError, true
	}
	return nil, false
}

// ValidationError reports request validation failures.
func ValidationError(violations []FieldViolation) *Error {
	return &Error{
		Code:       ErrorCodeValidation,
		Message:    "request validation failed",
		Violations: violations,
	}
}

// Unauthorized reports a missing or invalid authentication credential.
func Unauthorized(message string) *Error {
	return newError(ErrorCodeUnauthorized, message)
}

// Forbidden reports an authenticated caller that cannot perform an action.
func Forbidden(message string) *Error {
	return newError(ErrorCodeForbidden, message)
}

// RateLimited reports a client that exceeded request limits.
func RateLimited(message string) *Error {
	return newError(ErrorCodeRateLimited, message)
}

// NotFound reports a missing resource.
func NotFound(message string) *Error {
	return newError(ErrorCodeNotFound, message)
}

// Conflict reports a write that conflicts with existing state.
func Conflict(message string) *Error {
	return newError(ErrorCodeConflict, message)
}

// Internal wraps unexpected implementation errors behind a client-safe message.
func Internal(err error) *Error {
	return &Error{
		Code:    ErrorCodeInternal,
		Message: "internal server error",
		Err:     err,
	}
}

func newError(code ErrorCode, message string) *Error {
	return &Error{
		Code:    code,
		Message: message,
	}
}
