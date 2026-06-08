package storage

import (
	"context"
	"os"
	"path/filepath"
	"testing"

	"github.com/BryanPMX/CECAE-platform/internal/application"
	"github.com/stretchr/testify/require"
)

func TestLocalImageStorageSavesEventImage(t *testing.T) {
	rootDir := t.TempDir()
	storage := NewLocalImageStorage(rootDir)

	url, err := storage.SaveEventImage(context.Background(), application.ImageObject{
		Name:        "event.png",
		ContentType: "image/png",
		Data:        []byte("image"),
	})

	require.NoError(t, err)
	require.Equal(t, "/uploads/events/event.png", url)
	data, err := os.ReadFile(filepath.Join(rootDir, "events", "event.png"))
	require.NoError(t, err)
	require.Equal(t, []byte("image"), data)
}

func TestLocalImageStorageRejectsPathTraversalName(t *testing.T) {
	storage := NewLocalImageStorage(t.TempDir())

	_, err := storage.SaveEventImage(context.Background(), application.ImageObject{
		Name: "../event.png",
		Data: []byte("image"),
	})

	require.Error(t, err)
	require.Contains(t, err.Error(), "image name must be a file name")
}
