package storage

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/BryanPMX/CECAE-platform/internal/application"
)

const eventImagesPath = "events"

// LocalImageStorage writes uploaded images to the local filesystem.
type LocalImageStorage struct {
	rootDir string
}

// NewLocalImageStorage creates a local filesystem image storage adapter.
func NewLocalImageStorage(rootDir string) *LocalImageStorage {
	return &LocalImageStorage{rootDir: rootDir}
}

// SaveEventImage stores an event image and returns its public path.
func (s *LocalImageStorage) SaveEventImage(ctx context.Context, image application.ImageObject) (string, error) {
	if err := ctx.Err(); err != nil {
		return "", err
	}
	if image.Name == "" || filepath.Base(image.Name) != image.Name {
		return "", fmt.Errorf("image name must be a file name")
	}

	targetDir := filepath.Join(s.rootDir, eventImagesPath)
	if err := os.MkdirAll(targetDir, 0o755); err != nil {
		return "", fmt.Errorf("create upload directory: %w", err)
	}

	targetPath := filepath.Join(targetDir, image.Name)
	tempFile, err := os.CreateTemp(targetDir, ".upload-*")
	if err != nil {
		return "", fmt.Errorf("create temp upload: %w", err)
	}
	tempPath := tempFile.Name()
	removeTemp := true
	defer func() {
		if removeTemp {
			_ = os.Remove(tempPath)
		}
	}()

	if _, err := tempFile.Write(image.Data); err != nil {
		_ = tempFile.Close()
		return "", fmt.Errorf("write temp upload: %w", err)
	}
	if err := tempFile.Close(); err != nil {
		return "", fmt.Errorf("close temp upload: %w", err)
	}
	if err := os.Chmod(tempPath, 0o644); err != nil {
		return "", fmt.Errorf("chmod temp upload: %w", err)
	}
	if err := os.Rename(tempPath, targetPath); err != nil {
		return "", fmt.Errorf("move upload into place: %w", err)
	}

	removeTemp = false
	return "/uploads/events/" + image.Name, nil
}
