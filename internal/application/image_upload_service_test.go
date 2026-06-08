package application

import (
	"bytes"
	"context"
	"image"
	"image/color"
	"image/png"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestUploadEventImageValidatesAndStoresImage(t *testing.T) {
	storage := &fakeImageStorage{}
	service := NewImageUploadService(storage, 1024)
	imageData := testPNGBytes(t)

	uploaded, err := service.UploadEventImage(context.Background(), UploadImageRequest{
		Filename:    "event.png",
		ContentType: "image/png",
		Body:        bytes.NewReader(imageData),
	})

	require.NoError(t, err)
	require.Equal(t, "/uploads/events/"+storage.saved.Name, uploaded.URL)
	require.Equal(t, "image/png", uploaded.ContentType)
	require.Equal(t, int64(len(imageData)), uploaded.SizeBytes)
	require.Contains(t, storage.saved.Name, ".png")
	require.Equal(t, "image/png", storage.saved.ContentType)
	require.Equal(t, imageData, storage.saved.Data)
}

func TestUploadEventImageRejectsUnsupportedContent(t *testing.T) {
	service := NewImageUploadService(&fakeImageStorage{}, 1024)

	_, err := service.UploadEventImage(context.Background(), UploadImageRequest{
		Filename: "event.svg",
		Body:     strings.NewReader(`<svg onload="alert(1)"></svg>`),
	})

	require.Error(t, err)
	require.Contains(t, err.Error(), "request validation failed")
}

func TestUploadEventImageRejectsOversizedImage(t *testing.T) {
	service := NewImageUploadService(&fakeImageStorage{}, 4)

	_, err := service.UploadEventImage(context.Background(), UploadImageRequest{
		Filename: "event.png",
		Body:     bytes.NewReader(testPNGBytes(t)),
	})

	require.Error(t, err)
	require.Contains(t, err.Error(), "request validation failed")
}

type fakeImageStorage struct {
	saved ImageObject
}

func (s *fakeImageStorage) SaveEventImage(_ context.Context, image ImageObject) (string, error) {
	s.saved = image
	return "/uploads/events/" + image.Name, nil
}

func testPNGBytes(t *testing.T) []byte {
	t.Helper()

	img := image.NewRGBA(image.Rect(0, 0, 2, 2))
	img.Set(0, 0, color.RGBA{R: 255, A: 255})

	var buffer bytes.Buffer
	require.NoError(t, png.Encode(&buffer, img))
	return buffer.Bytes()
}
