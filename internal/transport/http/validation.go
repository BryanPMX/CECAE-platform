package httptransport

import (
	"reflect"
	"strings"
	"time"

	"github.com/BryanPMX/CECAE-platform/internal/application"
	"github.com/go-playground/validator/v10"
)

// Validator centralizes request DTO validation for handlers.
type Validator struct {
	validate *validator.Validate
}

// NewValidator returns the configured request validator.
func NewValidator() (*Validator, error) {
	validate := validator.New(validator.WithRequiredStructEnabled())

	validate.RegisterTagNameFunc(jsonFieldName)
	if err := validate.RegisterValidation("time_hhmm", validateHHMMTime); err != nil {
		return nil, err
	}

	return &Validator{validate: validate}, nil
}

// ValidateStruct validates a request DTO and returns a client-safe application error.
func (v *Validator) ValidateStruct(value any) error {
	if err := v.validate.Struct(value); err != nil {
		var violations []application.FieldViolation
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			violations = make([]application.FieldViolation, 0, len(validationErrors))
			for _, fieldError := range validationErrors {
				violations = append(violations, application.FieldViolation{
					Field:   fieldPath(fieldError),
					Message: validationMessage(fieldError),
				})
			}
		}
		return application.ValidationError(violations)
	}
	return nil
}

func jsonFieldName(field reflect.StructField) string {
	name := strings.Split(field.Tag.Get("json"), ",")[0]
	if name == "-" {
		return ""
	}
	if name == "" {
		return field.Name
	}
	return name
}

func validateHHMMTime(level validator.FieldLevel) bool {
	_, err := time.Parse("15:04", level.Field().String())
	return err == nil
}

func fieldPath(fieldError validator.FieldError) string {
	namespace := fieldError.Namespace()
	if index := strings.Index(namespace, "."); index >= 0 {
		return namespace[index+1:]
	}
	return fieldError.Field()
}

func validationMessage(fieldError validator.FieldError) string {
	switch fieldError.Tag() {
	case "required":
		return "is required"
	case "email":
		return "must be a valid email address"
	case "url":
		return "must be a valid URL"
	case "oneof":
		return "must be one of: " + fieldError.Param()
	case "datetime":
		return "must match format " + fieldError.Param()
	case "time_hhmm":
		return "must match 24-hour HH:MM format"
	case "min":
		return "must be at least " + fieldError.Param()
	case "max":
		return "must be at most " + fieldError.Param()
	default:
		return "is invalid"
	}
}
