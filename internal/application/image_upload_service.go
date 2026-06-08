package application

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"net/http"
	"strings"

	"github.com/google/uuid"
)

const defaultMaxImagePixels = 40_000_000

// ImageObject is a validated image ready for persistence.
type ImageObject struct {
	Name        string
	ContentType string
	Data        []byte
}

// UploadedImage is the public result of a successful image upload.
type UploadedImage struct {
	URL         string
	ContentType string
	SizeBytes   int64
}

// UploadImageRequest carries untrusted browser upload input.
type UploadImageRequest struct {
	Filename    string
	ContentType string
	Body        io.Reader
}

// ImageStorage persists validated uploaded images.
type ImageStorage interface {
	SaveEventImage(context.Context, ImageObject) (string, error)
}

// ImageUploadService validates and stores admin-uploaded event images.
type ImageUploadService struct {
	storage       ImageStorage
	maxImageBytes int64
}

// NewImageUploadService creates an image upload service.
func NewImageUploadService(storage ImageStorage, maxImageBytes int64) *ImageUploadService {
	return &ImageUploadService{storage: storage, maxImageBytes: maxImageBytes}
}

// UploadEventImage validates a local event image upload and stores it.
func (s *ImageUploadService) UploadEventImage(ctx context.Context, request UploadImageRequest) (UploadedImage, error) {
	if s.storage == nil {
		return UploadedImage{}, Internal(errors.New("image storage is not configured"))
	}
	if request.Body == nil {
		return UploadedImage{}, imageValidationError("image", "is required")
	}
	if s.maxImageBytes <= 0 {
		return UploadedImage{}, Internal(errors.New("max image bytes must be positive"))
	}

	data, err := readUploadBytes(request.Body, s.maxImageBytes)
	if err != nil {
		return UploadedImage{}, err
	}

	contentType, extension, err := validateImageData(data)
	if err != nil {
		return UploadedImage{}, err
	}

	name := uuid.NewString() + extension
	url, err := s.storage.SaveEventImage(ctx, ImageObject{
		Name:        name,
		ContentType: contentType,
		Data:        data,
	})
	if err != nil {
		return UploadedImage{}, Internal(fmt.Errorf("save event image: %w", err))
	}

	return UploadedImage{
		URL:         url,
		ContentType: contentType,
		SizeBytes:   int64(len(data)),
	}, nil
}

func readUploadBytes(body io.Reader, maxBytes int64) ([]byte, error) {
	data, err := io.ReadAll(io.LimitReader(body, maxBytes+1))
	if err != nil {
		return nil, Internal(fmt.Errorf("read uploaded image: %w", err))
	}
	if int64(len(data)) > maxBytes {
		return nil, imageValidationError("image", fmt.Sprintf("must be at most %d bytes", maxBytes))
	}
	if len(data) == 0 {
		return nil, imageValidationError("image", "must not be empty")
	}
	return data, nil
}

func validateImageData(data []byte) (string, string, error) {
	contentType := detectedImageContentType(data)
	switch contentType {
	case "image/jpeg":
		if err := validateDecodableImage(data); err != nil {
			return "", "", err
		}
		return contentType, ".jpg", nil
	case "image/png":
		if err := validateDecodableImage(data); err != nil {
			return "", "", err
		}
		return contentType, ".png", nil
	case "image/webp":
		return contentType, ".webp", nil
	default:
		return "", "", imageValidationError("image", "must be a JPEG, PNG, or WebP image")
	}
}

func detectedImageContentType(data []byte) string {
	detected := http.DetectContentType(data)
	if detected == "application/octet-stream" && isWebP(data) {
		return "image/webp"
	}
	return strings.ToLower(detected)
}

func validateDecodableImage(data []byte) error {
	config, _, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil {
		return imageValidationError("image", "must be a valid image file")
	}
	if config.Width <= 0 || config.Height <= 0 {
		return imageValidationError("image", "must have valid dimensions")
	}
	if config.Width*config.Height > defaultMaxImagePixels {
		return imageValidationError("image", "has too many pixels")
	}
	return nil
}

func isWebP(data []byte) bool {
	return len(data) >= 12 &&
		string(data[0:4]) == "RIFF" &&
		string(data[8:12]) == "WEBP"
}

func imageValidationError(field string, message string) *Error {
	return ValidationError([]FieldViolation{{Field: field, Message: message}})
}
