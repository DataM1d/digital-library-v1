package service

import (
	"bytes"
	"context"
	"image"
	"image/color"
	"image/png"
	"os"
	"path/filepath"
	"testing"
)

func TestImageservice_Save(t *testing.T) {
	tempDir := t.TempDir()
	svc := NewImageService(tempDir)

	validPNG := []byte("\x89PNG\r\n\x1a\n")

	t.Run("Success", func(t *testing.T) {
		r := bytes.NewReader(validPNG)
		url, path, err := svc.Save(r, "test.png")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if url == "" || path == "" {
			t.Error("expected valid url and path")
		}
		if _, err := os.Stat(path); os.IsNotExist(err) {
			t.Error("file was not saved to disk")
		}
	})

	t.Run("InvalidFormat", func(t *testing.T) {
		r := bytes.NewReader([]byte("not-an-image"))
		_, _, err := svc.Save(r, "test.txt")
		if err == nil {
			t.Error ("expected error for invalid format, got nil")
		}
	})
}

func TestImageService_GenerateBlurHash(t *testing.T) {
	tempDir := t.TempDir()
	svc := NewImageService(tempDir)

	img := image.NewRGBA(image.Rect(0, 0, 1, 1))
	img.Set(0, 0, color.RGBA{255, 0, 0, 255})

	path := filepath.Join(tempDir, "test.png")
	f, _ := os.Create(path)
	png.Encode(f, img)
	f.Close()

	hash, err := svc.GenerateBlurHash(path)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if hash == "" {
		t.Error("expected generated hash")
	}
}

func TestImageService_CleanupOrphanedFiles(t *testing.T) {
	tempDir := t.TempDir()
	svc := NewImageService(tempDir)

	os.WriteFile(filepath.Join(tempDir, "keep.png"), []byte("data"), 0644)
	os.WriteFile(filepath.Join(tempDir, "delete.png"), []byte("data"), 0644)
	activeURLs := []string{"/uploads/keep.png"}

	count, err := svc.CleanupOrphanedFiles(context.Background(), activeURLs)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if count != 1 {
		t.Errorf("expected 1 file removed, got %d", count)
	}

	if _, err := os.Stat(filepath.Join(tempDir, "keep.png")); os.IsNotExist(err) {
		t.Error("active file was deleted")
	}
	if _, err := os.Stat(filepath.Join(tempDir, "delete.png")); !os.IsNotExist(err) {
		t.Error("orphaned file was not deleted")
	}
} 