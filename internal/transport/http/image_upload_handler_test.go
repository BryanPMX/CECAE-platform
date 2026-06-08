package httptransport

import (
	"bytes"
	"context"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/BryanPMX/CECAE-platform/internal/application"
	"github.com/stretchr/testify/require"
)

func TestImageUploadHandlerUploadsMultipartImage(t *testing.T) {
	service := &fakeImageUploadService{
		uploaded: application.UploadedImage{
			URL:         "/uploads/events/event.png",
			ContentType: "image/png",
			SizeBytes:   128,
		},
	}
	handler := NewImageUploadHandler(service, 1024, "https://api.cecae.org")
	body, contentType := multipartImageBody(t, []byte("image-bytes"))
	request := httptest.NewRequest(http.MethodPost, "/api/admin/events/images", body)
	request.Header.Set("Content-Type", contentType)
	recorder := httptest.NewRecorder()

	handler.UploadEventImage(recorder, request)

	require.Equal(t, http.StatusCreated, recorder.Code)
	require.JSONEq(t, `{
		"url":"https://api.cecae.org/uploads/events/event.png",
		"contentType":"image/png",
		"sizeBytes":128
	}`, recorder.Body.String())
	require.Equal(t, "event.png", service.request.Filename)
}

func TestImageUploadHandlerRequiresImageField(t *testing.T) {
	handler := NewImageUploadHandler(&fakeImageUploadService{}, 1024, "")
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	require.NoError(t, writer.Close())
	request := httptest.NewRequest(http.MethodPost, "/api/admin/events/images", &body)
	request.Header.Set("Content-Type", writer.FormDataContentType())
	recorder := httptest.NewRecorder()

	handler.UploadEventImage(recorder, request)

	require.Equal(t, http.StatusBadRequest, recorder.Code)
	require.JSONEq(t, `{"error":{"code":"validation_error","message":"request validation failed","fields":[{"field":"image","message":"is required"}]}}`, recorder.Body.String())
}

type fakeImageUploadService struct {
	request  application.UploadImageRequest
	uploaded application.UploadedImage
}

func (s *fakeImageUploadService) UploadEventImage(_ context.Context, request application.UploadImageRequest) (application.UploadedImage, error) {
	s.request = request
	return s.uploaded, nil
}

func multipartImageBody(t *testing.T, image []byte) (*bytes.Buffer, string) {
	t.Helper()

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	part, err := writer.CreateFormFile("image", "event.png")
	require.NoError(t, err)
	_, err = part.Write(image)
	require.NoError(t, err)
	require.NoError(t, writer.Close())

	return &body, writer.FormDataContentType()
}
