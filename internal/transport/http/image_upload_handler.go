package httptransport

import (
	"context"
	"errors"
	"net/http"
	"net/url"
	"strings"

	"github.com/BryanPMX/CECAE-platform/internal/application"
)

const uploadMultipartOverheadBytes int64 = 1 << 20

// ImageUploadService describes admin image upload workflows used by HTTP handlers.
type ImageUploadService interface {
	UploadEventImage(context.Context, application.UploadImageRequest) (application.UploadedImage, error)
}

// ImageUploadHandler handles admin image uploads.
type ImageUploadHandler struct {
	images        ImageUploadService
	maxImageBytes int64
	publicBaseURL string
}

// ImageUploadResponse returns the stored image URL for use as event.imageUrl.
type ImageUploadResponse struct {
	URL         string `json:"url"`
	ContentType string `json:"contentType"`
	SizeBytes   int64  `json:"sizeBytes"`
}

// NewImageUploadHandler creates an image upload handler.
func NewImageUploadHandler(images ImageUploadService, maxImageBytes int64, publicBaseURL string) *ImageUploadHandler {
	return &ImageUploadHandler{
		images:        images,
		maxImageBytes: maxImageBytes,
		publicBaseURL: strings.TrimRight(publicBaseURL, "/"),
	}
}

// UploadEventImage accepts one multipart image file in the "image" field.
func (h *ImageUploadHandler) UploadEventImage(w http.ResponseWriter, r *http.Request) {
	if h.images == nil {
		WriteError(w, application.Internal(errors.New("image upload service is not configured")))
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, h.maxImageBytes+uploadMultipartOverheadBytes)
	if err := r.ParseMultipartForm(uploadMultipartOverheadBytes); err != nil {
		WriteError(w, application.ValidationError([]application.FieldViolation{
			{Field: "image", Message: "must be a multipart image file"},
		}))
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		WriteError(w, application.ValidationError([]application.FieldViolation{
			{Field: "image", Message: "is required"},
		}))
		return
	}
	defer file.Close()

	uploaded, err := h.images.UploadEventImage(r.Context(), application.UploadImageRequest{
		Filename:    header.Filename,
		ContentType: header.Header.Get("Content-Type"),
		Body:        file,
	})
	if err != nil {
		WriteError(w, err)
		return
	}

	WriteJSON(w, http.StatusCreated, ImageUploadResponse{
		URL:         h.absoluteUploadURL(r, uploaded.URL),
		ContentType: uploaded.ContentType,
		SizeBytes:   uploaded.SizeBytes,
	})
}

func (h *ImageUploadHandler) absoluteUploadURL(r *http.Request, path string) string {
	if parsed, err := url.Parse(path); err == nil && parsed.IsAbs() {
		return path
	}
	if h.publicBaseURL != "" {
		return h.publicBaseURL + "/" + strings.TrimLeft(path, "/")
	}

	proto := forwardedHeader(r.Header.Get("X-Forwarded-Proto"))
	if proto == "" {
		if r.TLS != nil {
			proto = "https"
		} else {
			proto = "http"
		}
	}

	host := forwardedHeader(r.Header.Get("X-Forwarded-Host"))
	if host == "" {
		host = r.Host
	}

	return proto + "://" + host + "/" + strings.TrimLeft(path, "/")
}

func forwardedHeader(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	first, _, _ := strings.Cut(value, ",")
	return strings.TrimSpace(first)
}
