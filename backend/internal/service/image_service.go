package service

import (
	"context"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"bytes"

	"github.com/bbrks/go-blurhash"
	"github.com/google/uuid"
)

type imageService struct {
	uploadDir string
}

func NewImageService(uploadDir string) *imageService {
	return &imageService{uploadDir: uploadDir}
}

func (s *imageService) Save(r io.Reader, filename string) (string, string, error) {
	
	// Detect content type
	buff := make([]byte, 512)
	n, err := r.Read(buff)
	if err != nil && err != io.EOF {
		return "", "", err
	}
	
	fullReader := io.MultiReader(bytes.NewReader(buff[:n]), r)
	contentType := http.DetectContentType(buff[:n])
	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/webp":  true,
	}

if !allowedTypes[contentType] {
        return "", "", fmt.Errorf("invalid image format: %s", contentType)
    }

	ext := filepath.Ext(filename)
    fileName := fmt.Sprintf("%d-%s%s", time.Now().Unix(), uuid.New().String(), ext)
    path := filepath.Join(s.uploadDir, fileName)

    if err := os.MkdirAll(s.uploadDir, 0755); err != nil {
        return "", "", err
    }

    dst, err := os.Create(path)
    if err != nil {
        return "", "", err
    }
    defer dst.Close()

	if _, err := io.Copy(dst, fullReader); err != nil {
        return "", "", err
    }

    return "/uploads/" + fileName, path, nil
}

func (s *imageService) GenerateBlurHash(imagePath string) (string, error) {
	file, err := os.Open(imagePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	img, _, err := image.Decode(file)
	if err != nil {
		return "", err
	}

	return blurhash.Encode(4, 3, img)
}

func (s *imageService) CleanupOrphanedFiles(ctx context.Context, allActiveURLs []string) (int, error) {
	activeMap := make(map[string]bool)
	for _, url := range allActiveURLs {
		if url != "" {
			activeMap[filepath.Base(url)] = true
		}
	}
	files, err := os.ReadDir(s.uploadDir)
	if err != nil {
		return 0, err
	}

	removedCount := 0
	for _, file := range files {
		if !file.IsDir() && !activeMap[file.Name()] {
			if err := os.Remove(filepath.Join(s.uploadDir, file.Name())); err == nil {
				removedCount++
			}
		}
	}
	return removedCount, nil
}
